import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Fake transport, never patient data or a live Gemini key.
const dir = await mkdtemp(join(tmpdir(), 'cortex-safety-'));
const out = join(dir, 'service.mjs');
await build({ entryPoints: ['src/services/geminiService.ts'], outfile: out,
  bundle: true, platform: 'node', format: 'esm', plugins: [{ name: 'fake-transport', setup(b) {
    b.onResolve({ filter: /^@google\/genai$|\/lib\/(db|crypto)$/ }, args => ({ path: args.path, namespace: 'fake' }));
    b.onLoad({ filter: /.*/, namespace: 'fake' }, args => ({ contents:
      args.path === '@google/genai' ? `export const Type = {};
        export class GoogleGenAI { constructor() { this.models = {
          generateContent: async p => { globalThis.__clinicalRequests.push(p); return globalThis.__clinicalResponse; },
          generateContentStream: async p => { globalThis.__clinicalRequests.push(p); return (async function*() { yield globalThis.__clinicalResponse; })(); }
        }; } }` : args.path.endsWith('/db') ? 'export const db = {};' : 'export const decryptData = x => x;'
    }));
  } }] });
const safetyOut = join(dir, 'safety.mjs');
await build({ entryPoints: ['src/lib/clinicalRecordSafety.ts'], outfile: safetyOut, bundle: true, platform: 'node', format: 'esm' });
const safety = await import(pathToFileURL(safetyOut).href);
const frameworkOut = join(dir, 'framework.mjs');
await build({ entryPoints: ['src/lib/registroTcc4.ts'], outfile: frameworkOut, bundle: true, platform: 'node', format: 'esm' });
const framework = await import(pathToFileURL(frameworkOut).href);
const tdahTypesOut = join(dir, 'tdahTypes.mjs');
await build({ entryPoints: ['src/components/TdahEcosystem/types.ts'], outfile: tdahTypesOut, bundle: true, platform: 'node', format: 'esm' });
const tdahTypes = await import(pathToFileURL(tdahTypesOut).href);
process.env.GEMINI_API_KEY = 'test-only';
const service = await import(pathToFileURL(out).href);
after(() => rm(dir, { recursive: true, force: true }));
const fake = (text, finishReason = 'STOP') => {
  globalThis.__clinicalRequests = [];
  globalThis.__clinicalResponse = { text, candidates: [{ finishReason }] };
};

test('invented model narrative stays separate from a long original source', async () => {
  const source = 'P: Falamos sobre meu curso.\n'.repeat(900) + 'P: FINAL ORIGINAL ÚNICO';
  fake('===RELATO_CLIENTE===\n<p>sobrecarga doméstica inventada</p>\n===MOTIVO_CONSULTA===\n<p>Curso.</p>');
  const result = await service.analyzeSessionTranscriptComprehensive(source, { name: 'Teste' });
  assert.equal(result.sourceTranscript, source);
  assert.match(result.relatoCliente, /FINAL ORIGINAL ÚNICO/);
  assert.doesNotMatch(result.relatoCliente, /sobrecarga doméstica/);
  assert.match(result.sinteseClinica, /sobrecarga doméstica/);
  assert.ok(globalThis.__clinicalRequests[0].contents.includes('FINAL ORIGINAL ÚNICO'));
});
test('short evidence and missing fields do not trigger invented expansion or default progress', async () => {
  fake('===MOTIVO_CONSULTA===\n<p>Curso.</p>\n===PROGRESSO===\nNão avaliado');
  const result = await service.analyzeSessionTranscriptComprehensive('P: Quero estudar.', { name: 'Teste' });
  assert.equal(result.motivoConsulta, '<p>Curso.</p>');
  assert.equal(result.progresso, '');
  assert.equal(result.observacoes, '<p>Não relatado na sessão.</p>');
  assert.equal(globalThis.__clinicalRequests.length, 1);
});
test('streaming never replaces source with the generated synthesis', async () => {
  fake('===RELATO_CLIENTE===\n<p>História gerada.</p>\n===MOTIVO_CONSULTA===\n<p>Curso.</p>');
  const updates = [];
  const result = await service.analyzeSessionTranscriptComprehensive('P: Curso.', { name: 'Teste' }, [], x => updates.push(x));
  assert.ok(updates.length);
  assert.ok(updates.every(x => !('relatoCliente' in x)));
  assert.equal(result.sourceTranscript, 'P: Curso.');
});
test('truncated analysis rejects instead of returning a completed record', async () => {
  fake('===MOTIVO_CONSULTA===\n<p>Incompleto', 'MAX_TOKENS');
  await assert.rejects(service.analyzeSessionTranscriptComprehensive('P: Curso.', { name: 'Teste' }), /incompleta/);
});
test('text diarization rejects added emotions and omitted words', async () => {
  const original = 'Psi: Como foi seu curso?\nP: Gostei muito do curso novo.';
  fake('Psi: Como foi seu curso?\nP: [choro] Gostei muito do curso novo.');
  assert.equal(await service.rectifyTranscriptDiarization(original), original);
  fake('Psi: Como foi seu curso?\nP: Gostei.');
  assert.equal(await service.rectifyTranscriptDiarization(original), original);
});
test('text diarization accepts only label changes with intact words', async () => {
  const original = 'P: Como foi seu curso?\nPsi: Gostei muito do curso novo.';
  const corrected = 'Psi: Como foi seu curso?\nP: Gostei muito do curso novo.';
  fake(corrected);
  assert.equal(await service.rectifyTranscriptDiarization(original), corrected);
});
test('original markup characters are escaped when rendering source', async () => {
  fake('===MOTIVO_CONSULTA===\n<p>Não relatado.</p>');
  const source = 'P: Escrevi <script>alert(1)</script> e A & B.';
  const result = await service.analyzeSessionTranscriptComprehensive(source, { name: 'Teste' });
  assert.equal(result.sourceTranscript, source);
  assert.ok(result.relatoCliente.includes('&lt;script&gt;'));
  assert.ok(!result.relatoCliente.includes('<script>'));
});
test('comprehensive analysis and streaming send the mandatory document-based framework as system instructions', async () => {
  for (const streaming of [false, true]) {
    fake('===CONFIDENCIALIDADE===\n<p>Limites do sigilo discutidos.</p>');
    const result = await service.analyzeSessionTranscriptComprehensive(
      'Psi: Discutimos os limites do sigilo.', { name: 'Teste', clinicalProfile: 'Histórico fictício separado.' },
      ['Outra abordagem'], streaming ? () => {} : undefined);
    const request = globalThis.__clinicalRequests[0];
    assert.equal(request.config.systemInstruction, framework.registroAllFieldsInstruction());
    assert.match(request.contents, /metadados; não substituem a orientação TCC4/);
    assert.ok(!request.config.systemInstruction.includes('Histórico fictício separado.'));
    assert.equal(result.confidencialidade, '<p>Limites do sigilo discutidos.</p>');
    assert.equal(result.sourceTranscript, 'Psi: Discutimos os limites do sigilo.');
  }
});
test('individual field requests preserve the common framework and field-specific evidence rules', async () => {
  for (const field of Object.keys(framework.REGISTRO_FIELD_GUIDANCE)) {
    fake('<p>Não relatado na sessão.</p>');
    await service.generateContentWithSystemInstruction('Fonte fictícia: P: Vim conversar.', framework.registroFieldInstruction(field));
    const instruction = globalThis.__clinicalRequests[0].config.systemInstruction;
    assert.ok(instruction.startsWith(framework.REGISTRO_TCC4_FRAMEWORK));
    assert.ok(instruction.includes(framework.REGISTRO_FIELD_GUIDANCE[field]));
    assert.ok(framework.registroAllFieldsInstruction().includes(framework.REGISTRO_FIELD_GUIDANCE[field]));
  }
  assert.throws(() => framework.registroFieldInstruction('campo_inexistente'), /não reconhecido/);
  assert.throws(() => framework.registroFieldInstruction('toString'), /não reconhecido/);
});
test('framework supports formulation without converting hypotheses, teaching examples or plans into facts', () => {
  const instruction = framework.registroAllFieldsInstruction();
  for (const concept of ['RID', 'crenças intermediárias', 'crenças centrais', 'PME', 'PDP',
    'Imunidade Social', 'Resolutividade', 'Punitividade', 'reparentalização', 'prevenção de recaída']) {
    assert.ok(instruction.includes(concept), concept);
  }
  assert.match(instruction, /Hipótese a confirmar/);
  assert.match(instruction, /com trecho de suporte e pergunta/);
  assert.match(instruction, /Catálogos e exemplos didáticos dos materiais não são dados deste paciente/);
  assert.match(instruction, /vivências imagéticas,\n+não comprovação histórica/);
  assert.match(framework.REGISTRO_FIELD_GUIDANCE.intervencoes, /Somente ações realizadas/);
  assert.match(framework.REGISTRO_FIELD_GUIDANCE.tarefas, /Somente tarefas pactuadas/);
  assert.match(framework.REGISTRO_FIELD_GUIDANCE.planejamento, /Sugestão para revisão/);
  assert.match(framework.REGISTRO_FIELD_GUIDANCE.confidencialidade, /Não relatado na sessão/);
  assert.match(framework.REGISTRO_FIELD_GUIDANCE.progresso, /caso contrário vazio/);
  assert.ok(!/Pedro|engenheiro|festival de talentos/i.test(instruction));
});
test('comprehensive missing confidentiality remains an evidence gap rather than implied consent', async () => {
  fake('===MOTIVO_CONSULTA===\n<p>Conversa.</p>');
  const result = await service.analyzeSessionTranscriptComprehensive('P: Vim conversar.', { name: 'Teste' });
  assert.equal(result.confidencialidade, '<p>Não relatado na sessão.</p>');
});
test('medical record entry types inspection preserves raw data without silent mutation to evolucao', () => {
  assert.equal(safety.isValidMedicalRecordEntryType('registro_atendimento'), true);
  assert.equal(safety.isValidMedicalRecordEntryType('thp'), true);
  assert.equal(safety.isValidMedicalRecordEntryType('tdah-ecosystem'), true);
  assert.equal(safety.isValidMedicalRecordEntryType('registro_atendimeto'), false);
  assert.equal(safety.isValidMedicalRecordEntryType('unknown_arbitrary'), false);
  assert.equal(safety.isValidMedicalRecordEntryType(null), false);

  const inspectedValid = safety.inspectMedicalRecordEntryType('registro_atendimento');
  assert.equal(inspectedValid.isRecognized, true);
  assert.equal(inspectedValid.effectiveTipo, 'registro_atendimento');

  const inspectedTypo = safety.inspectMedicalRecordEntryType('registro_atendimeto');
  assert.equal(inspectedTypo.isRecognized, false);
  assert.equal(inspectedTypo.effectiveTipo, 'incompativel');
  assert.equal(inspectedTypo.rawTipo, 'registro_atendimeto');

  assert.equal(safety.sanitizeMedicalRecordEntryType('registro_atendimento'), 'registro_atendimento');
  // Raw data is preserved, never silently morphed to evolucao
  assert.equal(safety.sanitizeMedicalRecordEntryType('registro_atendimeto'), 'registro_atendimeto');
});

test('laudo completeness validation strictly rejects incomplete reports, missing CRP and empty dates', () => {
  // ChatGPT's test case: object with only nome, conclusao and empty date
  const chatGptTestCase = {
    identificacao: { nome: 'Paciente Teste' },
    conclusaoFinal: 'Hipótese confirmada',
    completedAt: ''
  };
  const valChatGpt = tdahTypes.validateLaudoTdahIntegrativo(chatGptTestCase);
  assert.equal(valChatGpt.isValid, false);
  assert.equal(valChatGpt.isDraft, true);
  assert.ok(valChatGpt.missingFields.includes('identificacao.psicologo'));
  assert.ok(valChatGpt.missingFields.includes('identificacao.crp'));
  assert.ok(valChatGpt.missingFields.includes('completedAt'));
  assert.equal(tdahTypes.isCompleteLaudoTdah(chatGptTestCase), false);

  // Complete final report
  const completeReport = {
    identificacao: {
      nome: 'Pedro Henrique Albuquerque',
      idade: '32 anos',
      psicologo: 'Dra. Ana Silva',
      crp: '06/123456',
      finalidade: 'Avaliação Diagnóstica de TDAH'
    },
    conclusaoFinal: 'Critérios preenchidos para TDAH',
    completedAt: new Date().toISOString()
  };
  const valComplete = tdahTypes.validateLaudoTdahIntegrativo(completeReport);
  assert.equal(valComplete.isValid, true);
  assert.equal(valComplete.isDraft, false);
  assert.equal(valComplete.missingFields.length, 0);
  assert.equal(tdahTypes.isCompleteLaudoTdah(completeReport), true);
});

