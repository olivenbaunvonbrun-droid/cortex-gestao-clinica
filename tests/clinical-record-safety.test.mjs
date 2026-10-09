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
test('medical record entry types are strictly validated and typos are rejected', () => {
  assert.equal(safety.isValidMedicalRecordEntryType('registro_atendimento'), true);
  assert.equal(safety.isValidMedicalRecordEntryType('thp'), true);
  assert.equal(safety.isValidMedicalRecordEntryType('tdah-ecosystem'), true);
  assert.equal(safety.isValidMedicalRecordEntryType('registro_atendimeto'), false);
  assert.equal(safety.isValidMedicalRecordEntryType('unknown_arbitrary'), false);
  assert.equal(safety.isValidMedicalRecordEntryType(null), false);
  assert.equal(safety.sanitizeMedicalRecordEntryType('registro_atendimento'), 'registro_atendimento');
  assert.equal(safety.sanitizeMedicalRecordEntryType('registro_atendimeto'), 'evolucao');
});

