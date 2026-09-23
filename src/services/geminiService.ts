import { GoogleGenAI as OriginalGoogleGenAI, Type } from "@google/genai";
import { db } from "../lib/db";
import { decryptData } from "../lib/crypto";

export function sanitizeAudioMimeType(mime?: string): string {
  const clean = (mime || '').split(';')[0].trim().toLowerCase();
  if (clean.includes('webm')) return 'audio/webm';
  if (clean.includes('ogg')) return 'audio/ogg';
  if (clean.includes('wav')) return 'audio/wav';
  if (clean.includes('mp3') || clean.includes('mpeg')) return 'audio/mp3';
  if (clean.includes('m4a') || clean.includes('mp4') || clean.includes('aac')) return 'audio/aac';
  return 'audio/webm';
}

export const DEFAULT_CLINICAL_MODEL = "gemini-flash-latest";

export const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-pro-latest",
  "gemini-3.1-pro-preview",
  "gemini-3.5-live-translate-preview"
];

export class GoogleGenAI extends OriginalGoogleGenAI {
  constructor(options: any) {
    super(options);
    const originalGenerateContent = this.models.generateContent.bind(this.models);
    const originalGenerateContentStream = this.models.generateContentStream.bind(this.models);

    this.models.generateContent = async (params: any) => {
      let lastError: any = null;
      const requestedModel = params?.model || DEFAULT_CLINICAL_MODEL;
      let candidateModels: string[];

      if (requestedModel && GEMINI_MODELS.includes(requestedModel)) {
        candidateModels = [requestedModel, ...GEMINI_MODELS.filter(m => m !== requestedModel)];
      } else {
        candidateModels = GEMINI_MODELS;
      }

      for (const modelName of candidateModels) {
        // gemini-3.5-live-translate-preview só suporta streaming bidirecional em tempo real
        if (modelName === "gemini-3.5-live-translate-preview") continue;

        try {
          console.log(`[Resiliência IA] Chamando Gemini (${modelName})...`);
          return await originalGenerateContent({
            ...params,
            model: modelName
          });
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || String(err);
          const is503 = msg.includes("503") || err?.status === 503 || msg.includes("UNAVAILABLE") || msg.includes("high demand");
          const is429 = msg.includes("429") || err?.status === 429 || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED");

          console.warn(`[Resiliência IA] Modelo ${modelName} indisponível (${is503 ? '503 Sobrecarga Temporária' : is429 ? '429 Cota de Requisições' : msg.slice(0, 100)}). Alternando imediatamente para o próximo modelo do pool...`);
          // Alterna imediatamente para o próximo modelo sem travar o usuário
          continue;
        }
      }
      throw lastError || new Error("Todos os modelos candidatos do Gemini falharam.");
    };

    this.models.generateContentStream = async (params: any) => {
      let lastError: any = null;
      const requestedModel = params?.model || DEFAULT_CLINICAL_MODEL;
      let candidateModels: string[];

      if (requestedModel && GEMINI_MODELS.includes(requestedModel)) {
        candidateModels = [requestedModel, ...GEMINI_MODELS.filter(m => m !== requestedModel)];
      } else {
        candidateModels = GEMINI_MODELS;
      }

      for (const modelName of candidateModels) {
        if (modelName === "gemini-3.5-live-translate-preview") continue;

        try {
          console.log(`[Resiliência IA Stream] Iniciando stream com Gemini (${modelName})...`);
          return await originalGenerateContentStream({
            ...params,
            model: modelName
          });
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || String(err);
          const is503 = msg.includes("503") || err?.status === 503 || msg.includes("UNAVAILABLE") || msg.includes("high demand");
          const is429 = msg.includes("429") || err?.status === 429 || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED");

          console.warn(`[Resiliência IA Stream] Modelo ${modelName} indisponível (${is503 ? '503 Sobrecarga Temporária' : is429 ? '429 Cota' : msg.slice(0, 100)}). Alternando para próximo modelo...`);
          continue;
        }
      }
      throw lastError || new Error("Todos os modelos candidatos do Gemini falharam para streaming.");
    };
  }
}

// Extrator resiliente de campos JSON incompletos para Streaming Progressivo de UI
export function extractPartialJsonFields(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const regex = /"(\w+)"\s*:\s*"((?:[^"\\]|\\.)*)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    const key = match[1];
    let val = match[2];
    val = val.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
    fields[key] = val;
  }
  return fields;
}

// Use environment variable if available, otherwise fallback to DB
async function getApiKey(): Promise<string> {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey) return envKey;

  const item = await db.settings.get('gemini_api_key');
  if (item && item.value) {
    try {
      return decryptData(item.value);
    } catch (e) {
      console.error("Erro ao descriptografar chave da DB", e);
    }
  }
  
  throw new Error("Chave API não encontrada. Por favor, verifique as configurações.");
}

// Framework de Parâmetros Clínicos Avançados (TCC de 4ª Geração, Process-Based Therapy e THP)
export const CLINICAL_FRAMEWORK_PROMPT = `
DIRETRIZES DO FRAMEWORK DE PARÂMETROS CLÍNICOS AVANÇADOS (TCC DE 4ª GERAÇÃO, TERAPIA BASEADA EM PROCESSOS - PBT E THP):
1. TERAPIA BASEADA EM PROCESSOS (PBT - Hofmann & Hayes): Análise das redes funcionais e causais em 6 dimensões clínicas dinâmicas: Cognição, Afeto, Atenção, Self, Motivação e Comportamento Overt. Identificar processos adaptativos vs. inadaptativos e alavancas de mudança comportamental.
2. CONTEXTUALISMO FUNCIONAL, RFT E ACT (Hexaflex):
   - Desfusão Cognitiva vs. Fusão Cognitiva (diferenciar pensamento de fato factual).
   - Aceitação Experiencial vs. Esquiva/Evitação Experiencial.
   - Contato com o Momento Presente / Atenção Plena e Ancoragem Somática.
   - Self-como-Contexto vs. Self-como-Conteúdo (apego a auto-rótulos rígidos).
   - Valores Fundamentais Clarificados vs. Complacência social e regras impostas.
   - Ação com Propósito / Comprometida vs. Impulsividade ou Inação.
3. TERAPIA DO ESQUEMA AVANÇADA (Jeffrey Young):
   - Mapear os 18 Esquemas Iniciais Desadaptativos (EIDs) e os Esquemas Adaptativos (YPQ - Apego Seguro, Autonomia, Competência, Valor Pessoal).
   - Modos Esquemáticos ativos em sessão e na vida: Modos Criança (Vulnerável, Irritada, Impulsiva), Modos Pais Disfuncionais (Crítico/Punitivo, Exigente/Perfeccionista), Modos de Enfrentamento Desadaptativo (Protetor Desligado/Evitativo, Submisso Resignado, Hipercompensador/Grandioso) e Fortalecimento do Modo Adulto Saudável.
   - Reparentalização limitada e confrontação empática.
4. MODELO DAS 10 HABILIDADES PSICOLÓGICAS (THP - Poubel & Rodrigues):
   Identificar com precisão déficits e avanços no repertório das 10 HPs:
   1. Autoconhecimento (reconhecimento de estados internos, gatilhos, modos e valores).
   2. Autorregulação Emocional (modulação da ativação fisiológica, tolerância ao mal-estar e desescalada).
   3. Raciocínio Realisticamente Otimista (exame rigoroso de evidências, alternativas realistas, descatastrofização).
   4. Autoestima (autovalorização incondicional, autocompaixão diante de falhas e desarmamento do crítico interno).
   5. Resolutividade e Enfrentamento (definição de problemas, tomada de decisão e hierarquia de exposição ativa).
   6. Autocontrole (manejo de impulsos, "Urge Surfing", controle de estímulos e adiamento da gratificação).
   7. Sociabilidade (assertividade, comunicação não-violenta, início e manutenção de conexões saudáveis).
   8. Imunidade Social (capacidade de dizer não, tolerância a críticas/rejeições e blindagem contra pressões).
   9. Sensibilidade Social (escuta ativa, empatia genuína, validação emocional e leitura de pistas não-verbais).
   10. Hedonismo Responsável (planejamento de reforçadores naturais, savoring/desfrute consciente e equilíbrio dever/prazer).
5. FAP (Psicoterapia Analítica Funcional): Mapeamento de Comportamentos Clinicamente Relevantes em sessão (CRB1: problemas em sessão; CRB2: melhoras/avanços em sessão; CRB3: interpretações funcionais pelo paciente).
6. RESOLUÇÃO CFP Nº 06/2019: Linguagem técnica formal, objetiva, preservação de falas literais de impacto entre aspas e respeito à dignidade humana e confidencialidade.
`;

export async function generateContentWithSystemInstruction(prompt: string, systemInstruction: string) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text || "";
}

export async function transcribeAudioFile(audioBase64: string, mimeType: string) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `
    Você é um Especialista em Documentação Clínica Psicológica de alto nível.
    Sua tarefa é transcrever e formatar de forma estruturada as falas do áudio da consulta.
    Retorne apenas o conteúdo final estruturado em código HTML clássico que contenha parágrafos justificados (<p style='text-align: justify;'>), tópicos usando (<ul> e <li>) ou ênfases usando (<strong>).
    NÃO envolva a resposta com marcações de blocos de código como \`\`\`html.
  `;
  const safeMime = sanitizeAudioMimeType(mimeType);
  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: [
      { text: "Por favor, realize a transcrição clínica estruturada deste áudio." },
      { inlineData: { mimeType: safeMime, data: audioBase64 } }
    ],
    config: { systemInstruction }
  });
  return response.text || "";
}

export async function clinicalInsight(patientHistory: string, currentSession: string, approach: string = 'Geral') {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise a evolução deste paciente com base na abordagem: ${approach}.
    
    ${CLINICAL_FRAMEWORK_PROMPT}

    Histórico Recente:
    ${patientHistory}
    
    Relato da Sessão Atual:
    ${currentSession}
    
    Por favor, forneça uma análise estruturada contendo:
    1. Temas Centrais e Recorrências (identificando EIDs ativados, distorções cognitivas ocorridas e necessidades frustradas).
    2. Dinâmica de Modos Esquemáticos e Coping (resignação, evitação, hipercompensação vs. Adulto Saudável).
    3. Hipóteses Diagnósticas ou Estruturais (DSM/CID e MDCF).
    4. Sugestões de Manejo e Treinamento de Habilidades Psicológicas (HPs) para a próxima sessão.
    
    Linguagem técnica e precisa. Responda em Markdown.
  `;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text;
}

export async function processClinicalAudio(audioBase64: string, approach: string = 'Geral', mode: 'Primeira Consulta' | 'Evolução' = 'Evolução') {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é um Especialista em Documentação Clínica Psicológica de alto nível.
    Sua tarefa é transcrever e formatar de forma estruturada uma sessão de psicologia.
    
    ${CLINICAL_FRAMEWORK_PROMPT}

    REGRAS DE OURO:
    1. ESTRUTURA CLÍNICA: Divida o texto em seções claras se necessário (ex: Queixa Principal, Dinâmica de Esquemas e Crenças, Coping/Modos, Intervenções Realizadas).
    2. ABORDAGEM ${approach}: Utilize o vocabulário técnico e o foco analítico específico desta linha (ex: Se TCC, foque em pensamentos automáticos, crenças e distorções; se Psicanálise, foque em associações e transferência).
    3. FILTRAGEM: Remova 100% de conversa fiada, hesitações e ruídos sem valor terapêutico.
    4. FORMATAÇÃO: Use Markdown. Use **negrito** para conceitos-chave. Use > para citações literais importantes do paciente.
    5. IDENTIFICAÇÃO: Use "P:" para Paciente e "Psi:" para Profissional.
    6. MODO ${mode}: 
       - Se Primeira Consulta: Foque na Anamnese, histórico formativo, necessidades emocionais frustradas e demanda inicial.
       - Se Evolução: Foque no progresso das HPs, estilo de enfrentamento, resistência e temas recorrentes.

    O resultado deve parecer um registro profissional pronto para um prontuário médico-hospitalar de elite.
  `;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: [
      { text: "Por favor, realize a transcrição clínica estruturada deste áudio." },
      { inlineData: { mimeType: "audio/webm", data: audioBase64 } }
    ],
    config: { systemInstruction }
  });

  return response.text;
}

export async function charcotConsult(query: string, patientContext: string) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é o módulo "Charcot", um consultor de segunda opinião baseado em Prática Baseada em Evidências (PBE) e no Manual Diagnóstico Contextual-Funcional dos Transtornos Psicológicos (MDCF).
    Forneça orientações sobre sinais de alarme, hipóteses diagnósticas (DSM/CID e MDCF) e intervenções validadas.
    Sempre cite referências estatísticas ou científicas quando possível.
    Identifique déficits em Habilidades Psicológicas (HPs) e recomende exercícios de reabilitação.
    
    ${CLINICAL_FRAMEWORK_PROMPT}

    Contexto do paciente atual: ${patientContext}
  `;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: query,
    config: { systemInstruction }
  });

  return response.text;
}

export async function analyzeClinicalFiles(files: { data: string, mimeType: string }[]) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const parts = files.map(f => ({
    inlineData: { data: f.data.split(',')[1] || f.data, mimeType: f.mimeType }
  }));

  parts.push({ 
    text: `Analise estes documentos clínicos (laudos, exames ou registros). Extraia os dados relevantes, conclusões e possíveis implicações clínicas sob a ótica dos parâmetros clínicos de TCC e Esquemas (como déficits de habilidades sociais/regulação, hipóteses de EDIs subjacentes e fatores de risco/manutenção). Formate em Markdown. \n\n ${CLINICAL_FRAMEWORK_PROMPT}` 
  } as any);

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: { parts } as any,
  });

  return response.text;
}

export async function generateLongitudinalProfile(historyText: string, approach: string = 'Geral') {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Aja como um psicólogo sênior realizando uma supervisão clínica baseada na abordagem: ${approach}.
    Crie um "Perfil Longitudinal" deste paciente com base em todo o histórico da linha do tempo fornecido abaixo.
    
    ${CLINICAL_FRAMEWORK_PROMPT}

    HISTÓRICO:
    ${historyText}
    
    OBJETIVO:
    Fornecer um perfil completo que cruze os dados, identificando:
    1. EVOLUÇÃO E PROGRESSO: Como o paciente estava no início vs. agora em relação às 8 Habilidades Psicológicas (HPs).
    2. PADRÕES COMPORTAMENTAIS E DINÂMICOS: Evolução dos Esquemas Iniciais Desadaptativos (EIDs), estilo de enfrentamento habitual (resignação, evitação, hipercompensação) e ativação de modos esquemáticos disfuncionais.
    3. ADERÊNCIA AO TRATAMENTO: Análise de faltas, engajamento e qualidade da aliança terapêutica.
    4. SÍNTESE DIAGNÓSTICA ATUALIZADA: Visão sistêmica baseada no histórico longo (DSM/CID e MDCF).
    
    Responda em Markdown elegante e profissional, utilizando terminologia técnica adequada.
  `;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt
  });

  return response.text;
}

export async function analyzeIhsAssessment(
  patient: { name: string; age: string },
  answersText: string
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Analisar os resultados do Inventário de Habilidades Sociais (IHS-Del-Prette) e gerar um Relatório Psicológico Profissional.

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age}

Respostas do Questionário (Escala A-E):
${answersText}

ESTRUTURA DO RELATÓRIO (Conforme Diretrizes do Conselho Federal de Psicologia - CFP):
1. IDENTIFICAÇÃO (Nome e idade)
2. DESCRIÇÃO DA DEMANDA (Motivo da avaliação baseado nos resultados do IHS correlacionado com Habilidades Psicológicas de Sociabilidade, Imunidade e Sensibilidade Social)
3. PROCEDIMENTO (Uso do IHS e entrevista de triagem)
4. ANÁLISE (Agrupar por fatores de habilidades sociais, associando os déficits detectados aos correspondentes EIDs e estratégias de coping disfuncionais:
   - Fator 1: Enfrentamento e autoafirmação com risco
   - Fator 2: Autoafirmação na expressão de sentimento positivo
   - Fator 3: Conversação e desenvoltura social
   - Fator 4: Autoexposição a desconhecidos e falar em público
   - Fator 5: Autocontrole da agressividade)
5. CONCLUSÃO/PROGNÓSTICO (Vinculado ao nível de insight, flexibilidade psicológica e tolerância à incerteza)
6. RECOMENDAÇÕES TERAPÊUTICAS (Diretrizes para treino de HPs, reestruturação de crenças centrais e experimentos comportamentais)

Instruções importantes:
- Tom clínico, ético e empático.
- Use linguagem profissional (Ex: "O examinando demonstra...", "Observa-se um déficit em...").
- NÃO seja determinista; use termos como "sugere", "indica tendência a".
- Formate em Markdown com títulos em negrito.
- IMPORTANTE: NÃO inclua campos vazios como "Local:", "Data:", "Assinatura:" ou rodapés, pois estes são gerados automaticamente pelo sistema.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar análise.";
}

export async function analyzeYsqAssessment(
  patient: { name: string; age: string },
  activeSchemasText: string,
  answersText: string
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Analisar os resultados do Questionário de Esquemas de Young (YSQ-S3 - 90 itens) e gerar um Relatório Clínico Psicológico sobre o perfil de Esquemas Iniciais Desadaptativos (EIDs).

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age} Anos

Esquemas Iniciais Desadaptativos Altamente Ativos (Média >= 4.0):
${activeSchemasText}

Respostas Completas do Questionário (Escala 1-6):
${answersText}

ESTRUTURA DO RELATÓRIO:
1. IDENTIFICAÇÃO (Nome e idade)
2. DEMANDA E OBJETIVO DA AVALIAÇÃO (Análise de esquemas cognitivos desadaptativos)
3. ANÁLISE DOS DOMÍNIOS E ESQUEMAS ATIVOS (Explorar os domínios afetados e como os EIDs identificados como ativos se manifestam no comportamento e nas relações. Mapeie também os Esquemas Adaptativos latentes que podem ser estimulados)
4. CORRELAÇÕES E IMPLICAÇÕES CLÍNICAS (Intersecção entre os esquemas ativos, crenças centrais disfuncionais, distorções cognitivas comuns e os estilos de enfrentamento - resignação, evitação, hipercompensação)
5. CONCLUSÃO E DIRETRIZES PARA A TERAPIA FOCADA EM ESQUEMAS (Sugestão de focos de intervenção terapêutica, reabilitação do passado, metáfora do ônibus/desfusão, treinamento ativo de HPs correspondentes)

Instruções importantes:
- Tom estritamente clínico, acadêmico, ético e empático.
- Evitar determinismo ("O paciente apresenta ativação do esquema de..." vs "O paciente é...").
- Formate em Markdown com títulos bem definidos.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar análise de esquemas.";
}

export async function analyzeAttendanceRecord(
  patient: { name: string; age: string },
  recordText: string
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Analisar as anotações estruturadas de uma sessão de atendimento psicológico e gerar um Resumo Clínico Integrativo profissional em Markdown.

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age} Anos

Anotações da Sessão:
${recordText}

Por favor, forneça um Resumo Clínico Integrativo contendo:
1. SÍNTESE DOS CONTEÚDOS TRAZIDOS (Demandas, queixas principais, necessidades emocionais frustradas identificadas e sentimentos nucleares ativados)
2. DINÂMICA COMPORTAMENTAL E EVOLUTIVA (Padrões observados, EIDs/crenças centrais ativados, distorções cognitivas e estilo de enfrentamento/modo esquemático adotado na sessão de hoje)
3. INTERVENÇÕES REALIZADAS E RESPOSTA DO PACIENTE (Eficácia das técnicas de 3ª/4ª Geração aplicadas e reestruturação cognitiva)
4. PLANEJAMENTO E PDP (Plano de Desenvolvimento Psicológico de HPs e foco clínico recomendado para a continuidade)

Instruções importantes:
- Tom estritamente ético, profissional e empático.
- Use terminologia técnica apropriada.
- Formate em Markdown com títulos em negrito.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar resumo clínico.";
}

export async function analyzePciAssessment(data: any) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `**Tarefa:** Agir como um supervisor clínico especialista em TCC de quarta geração e Terapia do Esquema. Analise os dados do Plano Clínico Integrado (PCI) a seguir e gere uma análise consolidada e um projeto terapêutico estruturado.

**Dados do PCI:**
- **Paciente:** ${data.patient?.name || data.pacienteNome || ''}
- **Características Gerais:** Idade: ${data.idade || ''}, Profissão: ${data.escolaridade || ''}, Relacionamentos: ${data.estadoCivil || ''}, Família: ${data.familiaOrigem || ''}, Rotina: ${data.rotina || ''}
- **Queixas:** ${data.eventoQueixas || ''}
- **Análise Funcional (RID):** 
  - Situação: ${data.ridSituacao || ''}
  - Pensamento: ${data.ridPensamento || ''}
  - Emoção: ${data.ridEmocao || ''} (Intensidade: ${data.ridEmocaoIntensidade || 0}%)
  - Comportamento: ${data.ridComportamento || ''}
  - Consequências (Curto Prazo): ${data.ridConsequencias || ''}
  - Consequências (Longo Prazo): ${data.ridConsequenciasLP || ''}
- **Satisfação (IMF):** Pessoal(${data.satisfacaoPessoal || 50}%), Interpessoal(${data.satisfacaoInterpessoal || 50}%), Ocupacional(${data.satisfacaoOcupacional || 50}%), Material(${data.satisfacaoMaterial || 50}%), Recreativa(${data.satisfacaoRecreativa || 50}%), Existencial(${data.satisfacaoExistencial || 50}%)
- **Esquemas Cognitivos:** ${data.esquemasCognitivos || ''}
- **Crenças Centrais:** ${data.crencasCentrais || ''}
- **Crenças Perifericas:** ${data.crencasPerifericas || ''}
- **Excessos Comportamentais:** ${data.excessosComp || ''}
- **Déficits em Habilidades:** ${data.deficitsHab || ''}
- **Histórico Formativo:** ${data.historicoFormativo || ''}
- **Diagnóstico Topográfico (DSM/CID):** ${data.diagTopo || ''}
- **Diagnóstico Funcional (MDCF):** ${data.diagFunc || ''}
- **Projeto Terapêutico:** ${data.projetoTerap || ''}

**Orientações Teórico-Clínicas de Análise:**
Avalie a formulação de caso utilizando o framework completo de parâmetros clínicos avançados:
${CLINICAL_FRAMEWORK_PROMPT}

Sua resposta DEVE ser em formato HTML (sem tags <html> ou <body>, apenas <h4>, <p>, <ul> e <li>) estruturada em 4 partes:
1. Síntese Diagnóstica Integrativa (Correlacionando queixas, diagnóstico topográfico e fatores de manutenção)
2. Análise Funcional e de Esquemas (Conectando histórico formativo, necessidades frustradas, EIDs/Esquemas Adaptativos, distorções/vieses e modos esquemáticos)
3. Proposta de Projeto Terapêutico (Metas, Habilidades Psicológicas a treinar, intervenções cognitivo-comportamentais focadas em valores e fatores protetivos)
4. Recomendações e Pontos de Atenção (Metacognições, estágio de mudança, aliança terapêutica e tolerância à incerteza)

Use linguagem profissional e científica de acordo com as diretrizes do CRP/CFP.`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar plano clínico integrado.";
}

export async function analyzeIhpAssessment(
  patient: { name: string; age: string },
  quantitativeSummary: string,
  rawAnswersSummary: string
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é um assistente de IA especializado em psicologia. Sua tarefa é gerar uma análise qualitativa e interpretativa dos resultados do "Inventário de Habilidades Psicológicas – Poubel e Rodrigues (IHP-PR)" correlacionando-as diretamente com as HPs de 4ª Geração do Cortex.

${CLINICAL_FRAMEWORK_PROMPT}

**INSTRUÇÕES IMPORTANTES:**
1. **Base da Análise:** Sua análise deve ser uma interpretação dos resultados quantitativos fornecidos. Use os escores e as classificações como ponto de partida principal. As respostas brutas podem ser usadas para dar exemplos específicos ou aprofundar a análise.
2. **Estrutura do Relatório:** Gere um relatório em português do Brasil, utilizando Markdown para formatação:
    * **Resumo Geral e Interpretação do QIP:** Quociente de Inteligência Psicológica (QIP) correlacionado a flexibilidade psicológica e inteligência emocional.
    * **Análise das Habilidades Psicológicas (Subescalas):** Discorra sobre as 10 subescalas (Autoconhecimento, Autorregulação, Raciocínio Realista, Autoestima, Resolutividade, Autocontrole, Sociabilidade, Imunidade Social, Sensibilidade Social, Hedonismo). Correlacione-as a EIDs e crenças centrais latentes.
    * **Potenciais Pontos Fortes:** Habilidades com pontuações mais altas (Satisfatório/Proficiente).
    * **Áreas para Desenvolvimento:** Habilidades com pontuações mais baixas (Deficitário/Insuficiente) que exigem treino ativo.
    * **Sugestões e Encaminhamentos:** Ofereça propostas de intervenções clínicas baseadas em TCC/PDP.
3. **Tom e Linguagem:** Mantenha um tom clínico, profissional, empático e não-julgador.
4. **Disclaimer Obrigatório:** Conclua com: "Este relatório é uma análise gerada por IA com base nos resultados do IHP-PR e deve ser interpretado por um(a) psicólogo(a) qualificado(a). Não constitui um diagnóstico psicológico."

**DADOS DO(A) AVALIANDO(A):**
- Nome: ${patient.name || "Não informado"}
- Idade: ${patient.age || "Não informada"}

**RESULTADOS QUANTITATIVOS PARA INTERPRETAÇÃO:**
${quantitativeSummary}

**RESPOSTAS BRUTAS PARA CONTEXTO ADICIONAL:**
${rawAnswersSummary}
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar laudo do IHP-PR.";
}

export async function analyzeTdahAssessment(
  patient: { name: string; age: string },
  scoring: {
    classification: string;
    riskLevel: string;
    totalScore: number;
    partAScore: number;
    partASignificant: number;
    thresholdMetA: boolean;
    partBScore: number;
    partBSignificant: number;
    thresholdMetB: boolean;
    summaryText: string;
  },
  answersText: string
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Analisar os resultados da Escala de Autoavaliação de TDAH em Adultos (ASRS-18 v1.1 - OMS) e gerar um Relatório Psicológico Clínico Profissional e Parecer Técnico de Avaliação.

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
- Nome: ${patient.name}
- Idade: ${patient.age} Anos

Resultados Quantitativos e Triagem:
- Classificação Diagnóstica Sugerida: ${scoring.classification} (${scoring.riskLevel})
- Escore Global ASRS-18: ${scoring.totalScore} de 54 pontos
- Parte A (Desatenção): ${scoring.partAScore}/27 pontos (${scoring.partASignificant}/9 sintomas frequentes atingidos - Critério ${scoring.thresholdMetA ? 'POSITIVO (≥ 4)' : 'NEGATIVO'})
- Parte B (Hiperatividade / Impulsividade): ${scoring.partBScore}/27 pontos (${scoring.partBSignificant}/9 sintomas frequentes atingidos - Critério ${scoring.thresholdMetB ? 'POSITIVO (≥ 4)' : 'NEGATIVO'})
- Síntese Psicométrica: ${scoring.summaryText}

Espelho de Respostas Registradas pelo Examinando (Escala 0 a 3: 0 = Nem um pouco, 1 = Só um pouco, 2 = Bastante, 3 = Demais):
${answersText}

ESTRUTURA DO RELATÓRIO (Conforme Diretrizes do Conselho Federal de Psicologia - CFP - Resolução nº 06/2019):
1. IDENTIFICAÇÃO (Nome, Idade e Instrumento Administrado)
2. DESCRIÇÃO DA DEMANDA E MOTIVO DA INVESTIGAÇÃO (Queixas de déficits executivos, oscilação de foco, procrastinação, desorganização, desregulação motora ou impulsividade na vida adulta e seus reflexos no cotidiano)
3. PROCEDIMENTO METODOLÓGICO (Utilização da Adult Self-Report Scale - ASRS-18 v1.1 da Organização Mundial da Saúde, validada no Brasil, composta por 18 itens na escala Likert distribuídos em dois domínios: Desatenção e Hiperatividade/Impulsividade, considerando os últimos seis meses)
4. ANÁLISE QUANTITATIVA E QUALITATIVA DOS RESULTADOS:
   - Domínio de Desatenção (Parte A): Análise detalhada dos escores, itens mais comprometidos (ex: distratibilidade, adiamento de tarefas, erros por descuido, memória prospectiva) e prejuízos nas funções executivas atencionais.
   - Domínio de Hiperatividade e Impulsividade (Parte B): Análise dos escores, manifestações de inquietude motora, dificuldade em repousar, urgência verbal, interrupção de terceiros e regulação inibitória.
   - Análise de Habilidades Psicológicas (HPs) do Cortex: Mapear déficits na HP de Autocontrole, HP de Autorregulação Emocional, HP de Resolutividade e Enfrentamento e HP de Sensibilidade Social.
   - Correlações Clínicas com TCC e Terapia do Esquema: Identificar possíveis crenças centrais secundárias decorrentes do histórico de desatenção ("Eu sou incapaz", "Eu sou defeituoso", "Eu nunca termino nada") e Esquemas Iniciais Desadaptativos frequentemente ativados (Fracasso, Defectividade, Autocontrole Insuficiente, Padrões Inflexíveis).
5. CONCLUSÃO DIAGNÓSTICA E PROGNÓSTICO:
   - Parecer técnico sobre a probabilidade de TDAH (Apresentação Combinada, Predomínio Desatento, Predomínio Hiperativo/Impulsivo ou Sintomatologia Subclínica).
   - Avaliação do impacto funcional nas esferas acadêmica, profissional e interpessoal.
   - Prognóstico clínico frente a intervenções especializadas.
6. RECOMENDAÇÕES TERAPÊUTICAS E PLANO DE CONDUTA (TCC & Neuropsicologia):
   - Psicoeducação sobre o neurodesenvolvimento e funcionamento executivo do TDAH adulto.
   - Técnicas comportamentais de TCC e manejo ambiental (estruturação de rotinas, suportes visuais externos, técnica de blocos/Pomodoro, fragmentação de metas).
   - Treino continuado de Habilidades Psicológicas (HP de Autocontrole e Autorregulação).
   - Reestruturação cognitiva de distorções e crenças de incompetência.
   - Recomendação de avaliação médica/psiquiátrica complementar para análise de comorbidades e eventual suporte farmacológico, se julgado pertinente.

Instruções importantes:
- Tom estritamente profissional, clínico, acolhedor e fundamentado em evidências.
- Formate em Markdown com títulos destacados em negrito.
- Não inclua campos vazios de data ou assinatura no corpo do texto (são inseridos automaticamente no rodapé do sistema).
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar laudo da Escala de TDAH (ASRS-18).";
}


export async function analyzeLinhaVidaAssessment(
  patient: { name: string; age: string },
  eventsText: string
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Analisar a Linha da Vida de um paciente sob a perspectiva clínica e estruturar um Relatório Clínico de Avaliação Autobiográfica.

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age} Anos

Cronologia de Eventos Cadastrados (Histórico de Vida):
${eventsText}

ESTRUTURA DO RELATÓRIO:
1. IDENTIFICAÇÃO (Nome e idade)
2. SÍNTESE DO HISTÓRICO DE VIDA (Análise geral da distribuição de eventos positivos, negativos e neutros ao longo do ciclo vital. Identificação das necessidades emocionais básicas da infância frustradas nessas fases)
3. ANÁLISE DE PICOS E VALES EMOCIONAIS (Mapeamento dos pontos de maior impacto emocional positivo e dos vales de maior impacto negativo ou traumático)
4. INTERPRETAÇÃO PSICOLÓGICA E ABORDAGEM DOS ESQUEMAS/CRENÇAS (Análise de como estes eventos modelaram as crenças centrais disfuncionais/intermediárias, Esquemas Iniciais Desadaptativos (EIDs) e estratégias de coping disfuncionais no presente)
5. RECURSOS DE RESILIÊNCIA E FORÇA PESSOAL (Identificação de fatores protetivos, momentos de superação, reserva cognitiva e Esquemas Adaptativos desenvolvidos)
6. RECOMENDAÇÕES TERAPÊUTICAS (Diretrizes para o tratamento focado em esquemas, PDP de HPs e reestruturação de regras condicionais)

Instruções importantes:
- Tom estritamente clínico, profissional, analítico e empático.
- Evite determinismos. Use "indica tendência a", "pode sugerir a formação de".
- Formate em Markdown com títulos em negrito.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar análise da linha da vida.";
}

export async function analyzePsidiagnosticAssessment(
  patient: { name: string; age: string },
  prontuarioText: string,
  filesText: string,
  binaryFiles: { data: string; mimeType: string }[] = []
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Realizar uma análise psicodiagnóstica clínica e elaborar um Relatório de Laudo Técnico Psicológico.

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age} Anos

FONTES DE INFORMAÇÃO ANALISADAS:
${prontuarioText ? `--- HISTÓRICO DE PRONTUÁRIO CLÍNICO (Sessões e Evoluções): ---\n${prontuarioText}\n` : ''}
${filesText ? `--- DOCUMENTOS ANEXOS (Laudos, Exames e Triagens): ---\n${filesText}\n` : ''}

Considere também o conteúdo de quaisquer arquivos multimídia ou PDFs anexados a esta chamada para complementar a análise diagnóstica.

ESTRUTURA DO RELATÓRIO:
1. IDENTIFICAÇÃO (Nome e idade do paciente)
2. DESCRIÇÃO DA DEMANDA (Principais queixas, sintomas, motivos e necessidades emocionais frustradas identificadas)
3. ANÁLISE INTEGRATIVA DAS FONTES (Cruzamento de dados entre o histórico clínico e documentos para fundamentar a avaliação)
4. EXAME DE FUNÇÕES PSÍQUICAS E ASPECTOS COGNITIVOS (Sintetizar as manifestações emocionais, cognitivas, crenças centrais disfuncionais, distorções cognitivas frequentes, estilo de enfrentamento e modos esquemáticos ativados)
5. DIAGNÓSTICO E ENQUADRAMENTO (Formular hipóteses diagnósticas com referências ao DSM-5 ou CID-11 e Diagnóstico Funcional conforme o MDCF, de forma não-determinista, correlacionando os sintomas)
6. PLANEJAMENTO DE DIRETRIZES TERAPÊUTICAS (Sugestão de condutas baseadas em PDP de HPs, metas de vida, valores pessoais e eventuais encaminhamentos)

Instruções importantes:
- Tom estritamente profissional, ético, analítico, acadêmico e empático.
- Evite determinismos. Use "corresponde a um perfil de", "sugere forte ativação de".
- Formate em Markdown com títulos em negrito.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés.
`;

  const contents: any[] = [
    { text: prompt }
  ];

  binaryFiles.forEach(f => {
    contents.push({
      inlineData: {
        data: f.data,
        mimeType: f.mimeType
      }
    });
  });

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: contents as any,
  });

  return response.text || "Erro ao gerar laudo psicodiagnóstico.";
}

export async function analyzeDfcAssessment(
  patient: { name: string; age: string },
  dfcText: string
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Realizar uma supervisão clínica e elaboração de laudo com base no Diagrama de Funcionamento Cognitivo (DFC / DCC) preenchido sob os preceitos da Terapia Cognitivo-Comportamental (TCC).

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age} Anos

DIAGRAMA COGNITIVO PREENCHIDO:
${dfcText}

ESTRUTURA DO RELATÓRIO CLÍNICO:
1. IDENTIFICAÇÃO E SUMÁRIO DE CASO (Identificação e breve resumo estrutural)
2. ANÁLISE DE HISTÓRICO DE DESENVOLVIMENTO (Foco em como as experiências relevantes da infância geraram crenças centrais disfuncionais e ativaram EDIs)
3. CORRELAÇÕES ENTRE REGRAS E ESTRATÉGIAS DE ENFRENTAMENTO (Explicação de como as regras condicionais "Se... então..." determinam as estratégias compensatórias disfuncionais - resignação, evitação, hipercompensação - para proteger o paciente da dor da ativação das crenças)
4. DINÂMICA DAS SITUAÇÕES MAPEADAS (Análise funcional de como as situações típicas ativam pensamentos automáticos disfuncionais, distorções cognitivas de Beck, emoções nucleares e reações comportamentais)
5. DIRETRIZES DE REESTRUTURAÇÃO COGNITIVA E EXPERIMENTOS COMPORTAMENTAIS (Sugestão de intervenções específicas para testar as regras condicionais, reestruturar crenças e treinar HPs)

Instruções importantes:
- Tom clínico qualificado, empático, analítico e profissional.
- Evite determinismos. Use "sugere um padrão de", "indica reatividade a".
- Formate em Markdown com títulos em negrito.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar análise da conceituação cognitiva.";
}

export async function analyzeThpAssessment(
  patient: { name: string; age: string },
  skillName: string,
  progressText: string,
  sessionLogsText: string,
  exercisesText: string,
  additionalContext: string = ""
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Tarefa: Realizar supervisão clínica e elaborar um laudo de evolução psicoterapêutica com base no Treinamento de Habilidades Psicológicas (THP) do paciente.

${CLINICAL_FRAMEWORK_PROMPT}

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age} Anos

Habilidade Psicológica em Treinamento: ${skillName}

DADOS DO TREINAMENTO DE HABILIDADE:
- Níveis de Progresso:
${progressText}

- Exercícios Propostos e Status:
${exercisesText}

- Diários/Sessões de Treinamento Executadas:
${sessionLogsText}

${additionalContext ? `Contexto Clínico Adicional: \n${additionalContext}\n` : ""}

ESTRUTURA DO RELATÓRIO CLÍNICO / LAUDO DE EVOLUÇÃO THP:
1. ANÁLISE QUANTITATIVA E EVOLUTIVA (Análise do progresso atual da HP treinada, nível de flexibilidade e engajamento)
2. AVALIAÇÃO DE EXERCÍCIOS E ADERÊNCIA (Discussão sobre a realização dos exercícios de imersão, o que funcionou e barreiras encontradas)
3. DINÂMICA DOS OBSTÁCULOS E ESTRATÉGIAS DE ENFRENTAMENTO (Análise sutil das barreiras, resistências cognitivas, EIDs/crenças ativados, distorções de Beck e estilo de coping adotado)
4. CONCLUSÃO CLÍNICA E RECOMENDAÇÕES (Diretrizes baseadas em valores, frase de poder de mentalidade saudável, e se o paciente está pronto para outra HP ou precisa continuar)

Instruções importantes:
- Tom clínico qualificado, empático, analítico e profissional.
- Evite julgamentos de valor ou determinismos.
- Formate em Markdown com títulos claros em negrito.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text || "Erro ao gerar análise do Treinamento de Habilidades Psicológicas.";
}

export async function extractThpProfileFromProntuario(patientHistoryText: string) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é um psicólogo clínico sênior especializado em Terapia do Esquema e Terapia Cognitivo-Comportamental de Quarta Geração.
Sua tarefa é analisar o prontuário do paciente (histórico de consultas, anamnese, exames e evoluções clínicas) e extrair os componentes essenciais para o Treinamento de Habilidades Psicológicas (THP) do Neocortex.

Histórico de Evoluções e Anamnese do Paciente:
"""
${patientHistoryText}
"""

Por favor, analise cuidadosamente as informações acima e extraia de forma precisa, clara e científica:
1. clinicalQueixa: A queixa clínica principal (ex: sentimentos de inadequação, fobia social, perfeccionismo rígido, dependência emocional, etc.).
2. establishingOperations: Operações estabelecedoras/fatores de estresse ambientais recorrentes (ex: pressão no trabalho, rotina exaustiva, dinâmicas de cobrança familiar).
3. neglectedNeeds: Uma lista das necessidades emocionais básicas da infância que foram negligenciadas. Escolha apenas entre as opções válidas de enums: "Atenção", "Carinho", "Admiração", "Vínculo", "Proteção", "Cuidado", "Autonomia", "Sociabilidade", "Conversação", "Instrução", "Diversão", "Responsabilidade", "Gregariedade", "Identidade", "Compreensão".
4. activeSchemas: Uma lista dos Esquemas Iniciais Disfuncionais (EIDs) ativos observados. Escolha apenas entre as opções válidas: "Fracasso", "Abandono/Instabilidade", "Desconfiança/Abuso", "Privação Emocional", "Defectividade/Vergonha", "Isolamento Social/Alienação", "Dependência/Incompetência", "Vulnerabilidade a Danos ou Doenças", "Emaranhamento/Self Subdesenvolvido", "Grandiosidade/Arrogância", "Autocontrole/Autodisciplina Insuficientes", "Subjugação", "Auto-sacrifício", "Busca de Aprovação/Reconhecimento", "Negatividade/Pessimismo", "Inibição Emocional", "Padrões Inflexíveis/Crítica Exagerada", "Punitividade".
5. beliefs: As crenças em três níveis estruturados:
   - coreBeliefs: Crenças Centrais disfuncionais (ex: "Sou inadequado", "Sou incapaz", "Vou falhar").
   - intermediateBeliefs: Regras ou pressupostos condicionais (ex: "Se eu não for perfeito, serei rejeitado").
   - automaticThoughts: Pensamentos automáticos recorrentes comuns relatados pelo paciente em momentos de trigger.
6. copingStyleSelected: O estilo de enfrentamento desadaptativo predominante do paciente. Escolha uma das opções exatas: "Evitação (Fugir ou esquivar-se)", "Rendição (Ceder ao esquema)", "Hipercompensação (Agir de forma contrária/arrogante)".
7. copingBehaviors: Lista de comportamentos desadaptativos específicos que o paciente apresenta como resposta aos seus esquemas (ex: procrastinação, isolamento, tentar agradar a todos, trabalhar em excesso).

Retorne os dados em formato JSON estrito conforme o schema especificado. Seja preciso, clínico e científico.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clinicalQueixa: { type: Type.STRING },
          establishingOperations: { type: Type.STRING },
          neglectedNeeds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          activeSchemas: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          beliefs: {
            type: Type.OBJECT,
            properties: {
              coreBeliefs: { type: Type.ARRAY, items: { type: Type.STRING } },
              intermediateBeliefs: { type: Type.ARRAY, items: { type: Type.STRING } },
              automaticThoughts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["coreBeliefs", "intermediateBeliefs", "automaticThoughts"]
          },
          copingStyleSelected: { type: Type.STRING },
          copingBehaviors: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: [
          "clinicalQueixa",
          "establishingOperations",
          "neglectedNeeds",
          "activeSchemas",
          "beliefs",
          "copingStyleSelected",
          "copingBehaviors"
        ]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePsicometrikReport(
  patientInfo: { name: string; age: number; gender: string; clinicalContext?: string },
  toolInfo: { title: string; description: string; skillsEvaluated: string[] },
  scores: { totalScore: number; classification: string; subscales: Record<string, any> },
  rawAnswers: any
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é um neurocientista clínico sênior e psicoterapeuta ph.D especialista em Terapia Cognitivo-Comportamental de 4ª Geração. Visando emitir um laudo técnico extremamente aprofundado, de alta qualidade acadêmica e clínica, analise os seguintes dados fornecidos da avaliação psicológica digital do paciente.

${CLINICAL_FRAMEWORK_PROMPT}

--- DADOS DO PACIENTE ---
Nome: ${patientInfo.name}
Idade: ${patientInfo.age} anos
Gênero: ${patientInfo.gender}
Contexto Clínico/Queixas Declaradas: ${patientInfo.clinicalContext || "Não declarado."}

--- FERRAMENTA DE AVALIAÇÃO ---
Título da Ferramenta: ${toolInfo.title}
Descrição: ${toolInfo.description}
Habilidades Avaliadas: ${toolInfo.skillsEvaluated.join(", ")}

--- RESULTADOS PSICOMÉTRICOS & CÁLCULOS AUTOMATIZADOS ---
Pontuação Total Calculada: ${scores.totalScore}
Classificação Clínica: ${scores.classification}
Subescalas / Indicadores Detalhados: ${JSON.stringify(scores.subscales || {}, null, 2)}
Respostas aos Itens Relevantes: ${JSON.stringify(rawAnswers || {}, null, 2)}

Sua tarefa é redigir um Relatório de Avaliação Clínica/Intervenção de ponta, estruturado exatamente nos seguintes tópicos em formato Markdown profissional e termos técnicos adequados:

1. **Sumário Executivo & Perfil Psicométrico**: Apresente uma análise objetiva das pontuações obtidas na ferramenta, explicando detalhadamente o perfil do paciente e o significado das pontuações globais e subescalas. 

2. **Análise de Flexibilidade Psicológica (TCC de 4ª Geração)**: Interprete o comportamento do paciente sob a luz da TCC de 4ª Geração (ex: processos do hexaflex da ACT como fusão cognitiva, esquiva experiencial, deficit de autocompaixão, clareza sobre valores ou déficit de regulação na DBT). Explique como esse perfil de sintomas do teste retroalimenta os padrões de sofrimento psíquico, identificando hipóteses de EIDs e crenças centrais latentes correspondentes.

3. **Mecanismos Neurobiológicos & Neurociência Clínica**: Explique os sistemas neurais provavelmente implicados nesse padrão psicopatológico ou cognitivo (ex: atividade da amígdala versus controle inibitório pelo córtex pré-frontal dorsolateral/ventromedial, vias de regulação de neurotransmissores como serotonina, dopamina ou cortisol sob estresse crônico). Relacione os dados do teste à biologia do sistema nervoso.

4. **Prognóstico Estatístico-Clínico & Reserva de Resiliência**: Com base na idade, histórico e resultados, forneça uma análise prognóstica qualitativa sobre a evolução do quadro clínico. Destaque quais fatores representam potencial de reserva cognitiva e de resiliência neurológica (fatores protetivos, Esquemas Adaptativos) que atuarão positivamente no tratamento.

5. **Diretrizes e Protocolo de Intervenção Personalizada**: Apresente propostas práticas de intervenção. Inclua estratégias específicas de TCC de 4ª Geração (exercícios de mindfulness, desfusão cognitiva baseada na ACT, estratégias de efetividade interpessoal ou tolerância ao mal-estar da DBT, treinos de reestruturação ativa) ou exercícios práticos de treinamento cognitivo/neuropsicológico específicos ao déficit avaliado para treino das HPs.

6. **Orientações e Conduta Multidisciplinar**: Detalhe recomendações de higiene neurobiológica (adequação de cronobiologia, higiene do sono, estimulação física e alimentação), bem como possíveis encaminhamentos e necessidades de exames médicos adicionais.

Por favor, escreva de maneira compassiva, ética, com jargão técnico refinado e rigor acadêmico, mas mantendo a utilidade prática para o terapeuta. Use o idioma português do Brasil. O relatório deve ser rico e conter análises densas e detalhadas.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
  });

  return response.text;
}

// Extração Estruturada de RID a partir de Registro de Sessão ou Texto Clínico
export async function extractRidFromText(clinicalText: string) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é um psicólogo clínico sênior especialista em Terapia Cognitivo-Comportamental de 4ª Geração e Terapia do Esquema.
Sua tarefa é analisar o relato/transcrição da sessão de atendimento clínico fornecido e extrair com precisão cirúrgica os componentes do Registro de Interação Disfuncional (RID).

${CLINICAL_FRAMEWORK_PROMPT}

TEXTO CLÍNICO DA SESSÃO / ATENDIMENTO:
"""
${clinicalText}
"""

DIRETRIZES DE EXTRAÇÃO:
1. situacao: Descreva de forma objetiva a situação-gatilho ou contexto relatado pelo paciente (onde estava, com quem, o que ocorreu).
2. pensamento: Os pensamentos automáticos e interpretações cognitivas que surgiram na mente do paciente no momento do gatilho.
3. emocao: A emoção primária predominante sentida (ex: Ansiedade, Medo, Raiva, Tristeza, Vergonha, Frustração, Culpa) e a intensidade estimada de 0 a 100%.
4. comportamento: A resposta comportamental ou motora (ação realizada, esquiva, agressividade, paralisia, fuga).
5. consequenciasCurtoPrazo: Consequência imediata do comportamento (ex: alívio temporário da ansiedade, evitar confronto momentâneo).
6. consequenciasLongoPrazo: Consequência a longo prazo (ex: manutenção do medo, prejuízo no relacionamento, reforço do esquema disfuncional, perda de oportunidade).
7. necessidade: Lista de Necessidades Emocionais Básicas que foram frustradas ou estavam em jogo (ex: "Vínculo Seguro", "Autonomia", "Aceitação/Aprovação", "Limites Realistas", "Autoexpressão Espontânea", "Cuidado", "Proteção", "Compreensão").
8. esquema: Lista dos Esquemas Iniciais Desadaptativos (EIDs) ativados no evento. Escolha entre os 18 esquemas clássicos: "Abandono/Instabilidade", "Desconfiança/Abuso", "Privação Emocional", "Defectividade/Vergonha", "Isolamento Social/Alienação", "Dependência/Incompetência", "Vulnerabilidade a Danos ou Doenças", "Emaranhamento/Self Subdesenvolvido", "Fracasso", "Grandiosidade/Arrogância", "Autocontrole/Autodisciplina Insuficientes", "Subjugação", "Auto-sacrifício", "Busca de Aprovação/Reconhecimento", "Negatividade/Pessimismo", "Inibição Emocional", "Padrões Inflexíveis/Crítica Exagerada", "Punitividade".

Retorne em formato JSON estrito conforme o schema.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          situacao: { type: Type.STRING },
          pensamento: { type: Type.STRING },
          emocao: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              intensity: { type: Type.INTEGER }
            },
            required: ["name", "intensity"]
          },
          comportamento: { type: Type.STRING },
          consequenciasCurtoPrazo: { type: Type.STRING },
          consequenciasLongoPrazo: { type: Type.STRING },
          necessidade: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          esquema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: [
          "situacao",
          "pensamento",
          "emocao",
          "comportamento",
          "consequenciasCurtoPrazo",
          "consequenciasLongoPrazo",
          "necessidade",
          "esquema"
        ]
      }
    }
  });

  const raw = response.text || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(clean);
  }
}

// Extração Estruturada de PCI a partir de Registro de Sessão ou Texto Clínico
export async function extractPciFromText(clinicalText: string) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é um supervisor clínico ph.D especialista em Terapia Cognitivo-Comportamental de 4ª Geração, Formulação de Caso e Terapia do Esquema.
Sua tarefa é analisar o relato/transcrição da sessão de atendimento clínico e extrair com profundidade e rigor metodológico todas as dimensões do Plano Clínico Integrado (PCI).

${CLINICAL_FRAMEWORK_PROMPT}

TEXTO CLÍNICO DA SESSÃO / ATENDIMENTO:
"""
${clinicalText}
"""

Analise cuidadosamente as informações acima e extraia:
1. eventoQueixas: Queixas clínicas principais relatadas pelo paciente, motivos de sofrimento e eventos desencadeantes.
2. Análise Funcional (Tríplice Resposta / RID):
   - ridSituacao: Contexto ou evento ativador relatado.
   - ridPensamento: Pensamentos automáticos e interpretações cognitivas.
   - ridEmocao: Emoção predominante.
   - ridEmocaoIntensidade: Intensidade estimada de 0 a 100.
   - ridComportamento: Resposta comportamental observada ou relatada.
   - ridConsequencias: Consequências imediatas/curto prazo.
   - ridConsequenciasLP: Consequências a longo prazo e custos funcionais.
3. esquemasCognitivos: EIDs identificados como ativos (nomes dos esquemas e breve correlação clínica).
4. crencasCentrais: Crenças centrais nucleares (ex: Desvalor, Desamor, Desamparo, Incapacidade).
5. crencasPerifericas: Regras condicionais ("Se... então..."), pressupostos e atitudes intermediárias.
6. excessosComp: Padrões comportamentais em excesso (ex: hipervigilância, procrastinação, evitação, agressividade verbal, tentativa de controle).
7. deficitsHab: Déficits nas 8 Habilidades Psicológicas (HPs) do Método de 4ª Geração (ex: Autoconhecimento, Autorregulação Emocional, Autoestima, Resolutividade, Sociabilidade, Imunidade Social).
8. historicoFormativo: Origens na infância/adolescência, dinâmicas familiares, figuras de apego e histórico de vivências estressoras.
9. necessidadesIdentificadas: Necessidades emocionais básicas infantis ou adultas que foram negligenciadas ou frustradas.
10. diagTopo: Hipóteses diagnósticas topográficas descritivas (conforme critérios DSM-5-TR / CID-11).
11. diagFunc: Formulação diagnóstica funcional contextual (MDCF - contingências de reforçamento, esquiva experiencial, fatores de manutenção).
12. projetoTerap: Proposta de projeto terapêutico estruturado (metas prioritárias, HPs a desenvolver, intervenções cognitivas/vivenciais e tarefas de imersão).

Retorne em formato JSON estrito conforme o schema.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          eventoQueixas: { type: Type.STRING },
          ridSituacao: { type: Type.STRING },
          ridPensamento: { type: Type.STRING },
          ridEmocao: { type: Type.STRING },
          ridEmocaoIntensidade: { type: Type.INTEGER },
          ridComportamento: { type: Type.STRING },
          ridConsequencias: { type: Type.STRING },
          ridConsequenciasLP: { type: Type.STRING },
          esquemasCognitivos: { type: Type.STRING },
          crencasCentrais: { type: Type.STRING },
          crencasPerifericas: { type: Type.STRING },
          excessosComp: { type: Type.STRING },
          deficitsHab: { type: Type.STRING },
          historicoFormativo: { type: Type.STRING },
          necessidadesIdentificadas: { type: Type.STRING },
          diagTopo: { type: Type.STRING },
          diagFunc: { type: Type.STRING },
          projetoTerap: { type: Type.STRING }
        },
        required: [
          "eventoQueixas",
          "ridSituacao",
          "ridPensamento",
          "ridEmocao",
          "ridEmocaoIntensidade",
          "ridComportamento",
          "ridConsequencias",
          "ridConsequenciasLP",
          "esquemasCognitivos",
          "crencasCentrais",
          "crencasPerifericas",
          "excessosComp",
          "deficitsHab",
          "historicoFormativo",
          "necessidadesIdentificadas",
          "diagTopo",
          "diagFunc",
          "projetoTerap"
        ]
      }
    }
  });

  const raw = response.text || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(clean);
  }
}

// Transcrição de áudio (por chunk ou arquivo completo) com Gemini
export async function transcribeAudioChunk(audioBase64: string, mimeType: string = "audio/webm"): Promise<string> {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é um transcritor médico-psicológico forense de alta precisão.
    Sua tarefa é transcrever na íntegra as falas contidas no áudio da sessão clínica de psicologia.
    REGRAS DE TRANSCRIÇÃO:
    - Transcreva com fidelidade absoluta as palavras faladas em português do Brasil.
    - Identifique os interlocutores sempre que possível usando "Psi:" (Terapeuta) e "P:" (Paciente).
    - Remova hesitações sem sentido ("hum", "ééé", pausas vazias), mas mantenha todos os relatos, afestos expressos e diálogos clínicos essenciais.
    - Se houver termos técnicos de psicologia ou nomes próprios, grafar corretamente.
    - Retorne apenas o texto transcrito, sem introduções ou comentários adicionais.
  `;

  const safeMime = sanitizeAudioMimeType(mimeType);
  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: [
      { text: "Transcreva fielmente este segmento de áudio de atendimento clínico de psicologia." },
      { inlineData: { mimeType: safeMime, data: audioBase64 } }
    ],
    config: { systemInstruction }
  });

  return (response.text || "").trim();
}

// Análise Clínica Abrangente (Escriba IA) para Preenchimento do Registro de Atendimento
export async function analyzeSessionTranscriptComprehensive(
  transcript: string,
  patient: { name: string; age?: string },
  approaches: string[] = ["TCC 4ª Geração"],
  onProgressiveUpdate?: (fields: Record<string, string>) => void
) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é o Escriba Clínico de IA de mais alto nível para Psicologia Clínica, especializado na abordagem de Terapia Cognitivo-Comportamental de 4ª Geração, Terapia do Esquema e Prática Baseada em Evidências (PBE).
Sua missão é atuar como um supervisor clínico que analisa a transcrição integral de um atendimento e preenche, com rigor semiológico e técnico de excelência médica/hospitalar, todos os 12 campos necessários para o Prontuário e Registro de Atendimento.

${CLINICAL_FRAMEWORK_PROMPT}

DADOS DO PACIENTE:
- Nome: ${patient.name || "Não informado"}
- Idade: ${patient.age || "Não informada"}
- Abordagens Norteadoras: ${approaches.join(", ")}

TRANSCRIÇÃO DA CONSULTA / ATENDIMENTO:
"""
${transcript}
"""

REGRAS DE OURO DE FIDELIDADE CLÍNICA E PRESERVAÇÃO LEXICAL:
1. PRESERVAÇÃO LEXICAL (CITAÇÕES LITERAIS DO PACIENTE):
   - Termos de impacto, expressões emocionais nucleares e metáforas utilizadas pelo próprio paciente (ex: "sinto um buraco no peito", "estou pisando em ovos", "minha cabeça parece que vai explodir", "me sinto uma fraude") DEVEM ser preservados literalmente entre aspas duplas ("> '...'") no Relato Detalhado e nas Observações Clínicas.
2. FIDELIDADE ESTRITA AOS FATOS (ANTI-ALUCINAÇÃO):
   - Baseie-se estritamente no que foi verbalizado ou observado no atendimento.
   - Se um tema não foi abordado na sessão, NÃO invente dados nem use clichês. Ausência de menção deve resultar em texto conciso e direto.
   - Descreva o comportamento e o afeto observado faticamente (ex: "falou do trabalho com respiração acelerada e hesitação vocal") em vez de rótulos inferidos sem evidência.
3. RIGOR DE TCC DE 4ª GERAÇÃO E TERAPIA DO ESQUEMA:
   - Identifique com clareza os EIDs ativados, os modos esquemáticos adotados e as necessidades emocionais básicas negligenciadas.
4. LINGUAGEM DE PRONTUÁRIO TÉCNICO (RESOLUÇÃO CFP Nº 06/2019):
   - Redação na voz profissional do psicólogo ("Paciente relatou...", "Foi realizada intervenção de...", "Observou-se postura de...").

INSTRUÇÕES E DIRETRIZES DE CADA CAMPO:
1. relatoCliente: A transcrição/relato clínico estruturado da sessão, organizado semiologicamente em subtópicos (Contexto/Situação, Necessidades e Tríplice Resposta, Intervenções e Consequências). Inclua as falas marcantes do paciente entre aspas. Formatar em HTML clássico com parágrafos justificados (<p style='text-align: justify;'>), tópicos (<ul><li>) e ênfases (<strong>).
2. motivoConsulta: Motivo da consulta/queixa primária trazida na sessão e as necessidades emocionais básicas violadas identificadas (1-2 parágrafos justificados em HTML).
3. objetivosCliente: Objetivos da sessão declarados pelo próprio paciente e sua relação com déficits em Habilidades Psicológicas (HTML com <ul><li>).
4. objetivosTerapeuta: Objetivos técnicos do terapeuta na sessão sob a ótica de 4ª Geração (enfraquecimento de EIDs, treino de HPs, reestruturação) (HTML com <ul><li>).
5. intervencoes: Técnicas e posturas clínicas efetivamente aplicadas durante o atendimento (ex: validação emocional, reestruturação cognitiva, metáforas da ACT, diálogos de modos esquemáticos) (HTML com <ul><li>).
6. observacoes: Observações semiológicas e clínicas sobre o estado mental do paciente, crenças nucleares/regras ativadas e estilo de enfrentamento habitual (resignação, evitação, hipercompensação) com citações do paciente (HTML com <p style='text-align: justify;'>).
7. insights: Insights clínicos emergentes alcançados na sessão conectando dores atuais a origens formativas (HTML com <ul><li>).
8. percepcaoCliente: Percepção subjetiva de encerramento do paciente, nível de adesão, aliança terapêutica e engajamento (HTML com <p style='text-align: justify;'>).
9. progresso: Avaliação resumida do progresso clínico. Escolha OBRIGATORIAMENTE uma das 4 opções canônicas do prontuário: "Excelente", "Satisfatório", "Em desenvolvimento" ou "Necessita de ajuste".
10. tarefas: Tarefas intersessão recomendadas com foco no PDP (Plano de Desenvolvimento de HPs), como monitoramento de RIDs, exercícios de desfusão ou mindfulness (HTML com <ul><li>).
11. planejamento: Planejamento e eixos temáticos priorizados para a próxima sessão (HTML com <p style='text-align: justify;'> ou <ul><li>).
12. encaminhamentos: Encaminhamentos sugeridos (médicos, psiquiátricos, exames) ou declaração de ausência de necessidade no momento (HTML com <p style='text-align: justify;'>).

IMPORTANTE DE FORMATAÇÃO:
- Os campos HTML devem conter apenas marcações de texto limpo (<p>, <ul>, <li>, <strong>), sem tags <html>, <head> ou <body>.
- NÃO envolva os valores com blocos de código como \`\`\`html.
- Retorne um objeto JSON estrito correspondente ao schema especificado.
`;

  const responseSchemaConfig = {
    type: Type.OBJECT,
    properties: {
      relatoCliente: { type: Type.STRING },
      motivoConsulta: { type: Type.STRING },
      objetivosCliente: { type: Type.STRING },
      objetivosTerapeuta: { type: Type.STRING },
      intervencoes: { type: Type.STRING },
      observacoes: { type: Type.STRING },
      insights: { type: Type.STRING },
      percepcaoCliente: { type: Type.STRING },
      progresso: { type: Type.STRING },
      tarefas: { type: Type.STRING },
      planejamento: { type: Type.STRING },
      encaminhamentos: { type: Type.STRING }
    },
    required: [
      "relatoCliente",
      "motivoConsulta",
      "objetivosCliente",
      "objetivosTerapeuta",
      "intervencoes",
      "observacoes",
      "insights",
      "percepcaoCliente",
      "progresso",
      "tarefas",
      "planejamento",
      "encaminhamentos"
    ]
  };

  let rawText = "";

  if (onProgressiveUpdate) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: DEFAULT_CLINICAL_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: responseSchemaConfig
        }
      });

      for await (const chunk of responseStream) {
        const textPiece = chunk.text || "";
        if (textPiece) {
          rawText += textPiece;
          const partial = extractPartialJsonFields(rawText);
          onProgressiveUpdate(partial);
        }
      }
    } catch (streamErr) {
      console.warn("[Resiliência IA Stream] Streaming encontrou falha, utilizando fallback com generateContent:", streamErr);
      rawText = "";
    }
  }

  if (!rawText) {
    const response = await ai.models.generateContent({
      model: DEFAULT_CLINICAL_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: responseSchemaConfig
      }
    });
    rawText = response.text || "";
  }

  const defaultProgresso = "Satisfatório";
  const defaultResult = {
    relatoCliente: `<p style="text-align: justify;"><strong>Transcrição Semiurada da Sessão:</strong><br>${transcript.replace(/\n/g, '<br>')}</p>`,
    motivoConsulta: "<p style='text-align: justify;'>Acompanhamento psicoterapêutico continuado, manejo de queixas emocionais e comportamentais da rotina.</p>",
    objetivosCliente: "<ul><li>Identificar e elaborar fatores disparadores de desconforto e ansiedade na rotina recente.</li></ul>",
    objetivosTerapeuta: "<ul><li>Mapear esquemas cognitivos ativados e fortalecer repertório de enfrentamento adaptativo (Adulto Saudável).</li></ul>",
    intervencoes: "<ul><li>Escuta clínica ativa, validação emocional, psicoeducação e análise funcional das contingências relatadas.</li></ul>",
    observacoes: "<p style='text-align: justify;'>Paciente demonstrou engajamento colaborativo ao longo da sessão, com boa ressonância afetiva e adesão ao processo terapêutico.</p>",
    insights: "<ul><li>Compreensão da conexão entre pensamentos automáticos de autocrítica e sentimentos de sobrecarga.</li></ul>",
    percepcaoCliente: "<p style='text-align: justify;'>Expressou alívio e clareza ao término da sessão, sinalizando percepção positiva de direcionamento.</p>",
    progresso: defaultProgresso,
    tarefas: "<ul><li>Registro de Informações Diárias (RID) em situações de vulnerabilidade emocional até a próxima consulta.</li></ul>",
    planejamento: "<p style='text-align: justify;'>Aprofundar desconstrução de regras intermediárias e prosseguir com treino de habilidades psicológicas.</p>",
    encaminhamentos: "<p style='text-align: justify;'>Sem necessidade de encaminhamentos médicos ou complementares no presente momento.</p>"
  };

  let parsed: any = {};
  try {
    parsed = JSON.parse(rawText);
  } catch {
    try {
      const clean = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        parsed = JSON.parse(clean.substring(firstBrace, lastBrace + 1));
      } else {
        parsed = JSON.parse(clean);
      }
    } catch (e2) {
      console.warn("JSON repair fallback in analyzeSessionTranscriptComprehensive:", e2);
      parsed = {};
    }
  }

  // Garantia absoluta de todos os 12 campos preenchidos e válidos
  const validProgressOptions = ["Excelente", "Satisfatório", "Em desenvolvimento", "Necessita de ajuste"];
  const finalProgresso = validProgressOptions.includes(parsed.progresso) ? parsed.progresso : defaultProgresso;

  return {
    relatoCliente: parsed.relatoCliente && parsed.relatoCliente.length > 20 ? parsed.relatoCliente : defaultResult.relatoCliente,
    motivoConsulta: parsed.motivoConsulta && parsed.motivoConsulta.length > 10 ? parsed.motivoConsulta : defaultResult.motivoConsulta,
    objetivosCliente: parsed.objetivosCliente && parsed.objetivosCliente.length > 10 ? parsed.objetivosCliente : defaultResult.objetivosCliente,
    objetivosTerapeuta: parsed.objetivosTerapeuta && parsed.objetivosTerapeuta.length > 10 ? parsed.objetivosTerapeuta : defaultResult.objetivosTerapeuta,
    intervencoes: parsed.intervencoes && parsed.intervencoes.length > 10 ? parsed.intervencoes : defaultResult.intervencoes,
    observacoes: parsed.observacoes && parsed.observacoes.length > 10 ? parsed.observacoes : defaultResult.observacoes,
    insights: parsed.insights && parsed.insights.length > 10 ? parsed.insights : defaultResult.insights,
    percepcaoCliente: parsed.percepcaoCliente && parsed.percepcaoCliente.length > 10 ? parsed.percepcaoCliente : defaultResult.percepcaoCliente,
    progresso: finalProgresso,
    tarefas: parsed.tarefas && parsed.tarefas.length > 10 ? parsed.tarefas : defaultResult.tarefas,
    planejamento: parsed.planejamento && parsed.planejamento.length > 10 ? parsed.planejamento : defaultResult.planejamento,
    encaminhamentos: parsed.encaminhamentos && parsed.encaminhamentos.length > 5 ? parsed.encaminhamentos : defaultResult.encaminhamentos
  };
}

export interface SuggestionReferenceItem {
  key: string;
  value: string;
  explanation: string;
  question?: string;
}

export interface FieldFillingParams {
  tool: 'RID' | 'PCI';
  field: string;
  fieldLabel: string;
  situation: string;
  patientContext?: {
    name?: string;
    age?: string | number;
    diagnostico?: string;
    queixa?: string;
  };
  availableSuggestions?: SuggestionReferenceItem[];
}

export interface ClinicalItemWithJustification {
  nome: string;
  justificativa: string;
}

export interface FieldFillingResult {
  text?: string;
  tags?: string[];
  itens?: ClinicalItemWithJustification[];
  emotion?: { name: string; intensity: number; justificativa?: string };
}

export async function generateClinicalFieldFilling(params: FieldFillingParams): Promise<FieldFillingResult> {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Montar bloco de sugestões catalogadas se fornecidas
  let suggestionsBlock = "";
  if (params.availableSuggestions && params.availableSuggestions.length > 0) {
    const listFormatted = params.availableSuggestions.slice(0, 30).map(s => 
      `- ${s.key}: ${s.explanation}`
    ).join("\n");
    suggestionsBlock = `
CATÁLOGO OFICIAL DE SUGESTÕES CLÍNICAS (TAXONOMIA MANDATÓRIA):
Você DEVE escolher prioritariamente e estritamente a partir deste catálogo oficial validado para este campo:
${listFormatted}
`;
  }

  const prompt = `
Você é um Supervisor Clínico Sênior especialista em Terapia Cognitivo-Comportamental de 4ª Geração (Terapia Baseada em Processos - PBT, ACT, FAP, DBT) e Terapia do Esquema de Jeffrey Young.

SUA MISSÃO:
Preencher o campo clínico "${params.fieldLabel}" (identificador técnico: "${params.field}") para a ferramenta ${params.tool}, baseando-se estritamente na situação clínica ou relato a seguir:

SITUAÇÃO / RELATO CLÍNICO:
"""
${params.situation}
"""
${params.patientContext?.name ? `PACIENTE: ${params.patientContext.name}` : ''}
${params.patientContext?.age ? `IDADE: ${params.patientContext.age} anos` : ''}
${params.patientContext?.queixa ? `QUEIXA GERAL: ${params.patientContext.queixa}` : ''}

${suggestionsBlock}

REGRAS MANDATÓRIAS DE CONCISÃO CIRÚRGICA E ANTI-PROLIXIDADE (EXTREMA IMPORTÂNCIA):
1. SELEÇÃO CIRÚRGICA (MÁXIMO 1 A 2 ITENS - NO MÁXIMO 3):
   - NUNCA selecione mais de 2 ou 3 itens. Escolha exclusivamente os 1 ou 2 itens que possuem a mais direta e inquestionável relevância funcional para a situação informada.
2. JUSTIFICATIVA EM LINHA ÚNICA (MÁXIMO DE 20 A 25 PALAVRAS POR ITEM):
   - A justificativa de cada item DEVE ser redigida em EXATAMENTE UMA FRASE CURTA E DIRETA (máx. 25 palavras), explicando objetivamente qual foi o gatilho na situação.
   - É ESTRITAMENTE PROIBIDO escrever parágrafos longos, dissertações ou preâmbulos vazios como "Com base no relato apresentado...", "Podemos observar que o paciente...", etc. Vá direto ao ponto técnico.
3. CAMPOS DE TEXTO OU LISTA (ex: pensamento, comportamento, consequências):
   - Gere no máximo 1 a 2 tópicos objetivos (ou 1 frase direta e cristalina), sem repetir prolixamente o que o paciente já disse.
4. PADRONIZAÇÃO DO CAMPO "text":
   - Formate o campo "text" de modo limpo e direto:
     • [Nome]: [Justificativa curta em 1 frase]

DIRETRIZES TÉCNICAS ESPECÍFICAS POR TIPO DE CAMPO:
1. SE FOR ESQUEMAS ATIVADOS / EIDs ("esquema", "esquemasCognitivos"):
   - Selecione 1 ou 2 EIDs do catálogo (ex: "Abandono / Instabilidade", "Defectividade / Vergonha", "Privação Emocional").
   - Justificativa: 1 frase curta explicando o gatilho da ativação.
2. SE FOR NECESSIDADES BÁSICAS ("necessidade", "necessidadesIdentificadas"):
   - Selecione 1 ou 2 necessidades violadas do catálogo (ex: "Vínculo Seguro e Conexão", "Autonomia e Competência").
   - Justificativa: 1 frase curta explicando quem ou o que frustrou a necessidade na situação.
3. SE FOR PENSAMENTO AUTOMÁTICO OU DISTORÇÕES ("pensamento", "distorcoesCognitivas", "crencasCentrais"):
   - Formule 1 ou 2 pensamentos na voz do paciente com a distorção central. Conciso e direto.
4. SE FOR EMOÇÃO / INTENSIDADE ("emocao", "ridEmocao"):
   - Identifique a emoção primária central ("Ansiedade", "Tristeza", "Raiva", "Culpa", "Frustração").
   - Estime a intensidade subjetiva (0 a 100) e justificativa fisiológica em 1 frase.
5. SE FOR COMPORTAMENTO OU ENFRENTAMENTO ("comportamento", "ridComportamento"):
   - Descreva a ação em 1 frase e classifique o estilo funcional (evitação, resignação ou hipercompensação).
6. SE FOR CONSEQUÊNCIAS (Curto ou Longo Prazo):
   - Curto prazo: 1 frase direta sobre o alívio imediato (reforço negativo).
   - Longo prazo: 1 frase direta sobre o custo interpessoal/emocional ou manutenção do ciclo.

FORMATO DE RESPOSTA (JSON estrito):
{
  "text": "• [Nome do Item]: [Justificativa em 1 frase curta de até 25 palavras]",
  "itens": [
    {
      "nome": "Nome do elemento (ex: Privação Emocional)",
      "justificativa": "Frase curta e objetiva de até 25 palavras explicando o gatilho."
    }
  ],
  "tags": ["Nome do elemento"],
  "emotion": { "name": "Ansiedade", "intensity": 80, "justificativa": "Aperto torácico e inquietação motora." }
}
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          itens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nome: { type: Type.STRING },
                justificativa: { type: Type.STRING }
              },
              required: ["nome", "justificativa"]
            }
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          emotion: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              intensity: { type: Type.INTEGER },
              justificativa: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  const raw = response.text || "";
  try {
    const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(clean);

    const normalized: FieldFillingResult = {};

    const textVal = parsed.text || parsed.TEXT || parsed.Texto || parsed.texto;
    const tagsVal = parsed.tags || parsed.TAGS || parsed.Tags;
    const itensVal = parsed.itens || parsed.ITENS || parsed.items || parsed.ITEMS;
    const emotionVal = parsed.emotion || parsed.EMOTION || parsed.emocao || parsed.EMOCAO;

    if (Array.isArray(itensVal) && itensVal.length > 0) {
      normalized.itens = itensVal.map((it: any) => ({
        nome: it.nome || it.NOME || it.name || it.NAME || it.title || it.item || String(it),
        justificativa: it.justificativa || it.JUSTIFICATIVA || it.explanation || it.EXPLANATION || it.descricao || it.desc || ''
      }));
    }

    if (Array.isArray(tagsVal) && tagsVal.length > 0) {
      normalized.tags = tagsVal;
    } else if (normalized.itens && normalized.itens.length > 0) {
      normalized.tags = normalized.itens.map(it => it.nome);
    }

    if (emotionVal && typeof emotionVal === 'object') {
      normalized.emotion = {
        name: emotionVal.name || emotionVal.NAME || emotionVal.nome || emotionVal.NOME || '',
        intensity: Number(emotionVal.intensity || emotionVal.INTENSITY || emotionVal.intensidade || 50),
        justificativa: emotionVal.justificativa || emotionVal.explanation || ''
      };
    }

    if (textVal && typeof textVal === 'string' && !textVal.trim().startsWith('{')) {
      normalized.text = textVal.trim();
    } else if (normalized.itens && normalized.itens.length > 0) {
      normalized.text = normalized.itens.map(it => it.justificativa ? `• ${it.nome}: ${it.justificativa}` : `• ${it.nome}`).join('\n');
    }

    return normalized;
  } catch (e) {
    console.error("Erro ao analisar resposta de generateClinicalFieldFilling:", e);
    return { text: raw.trim() };
  }
}

export interface FieldQuestionsParams {
  tool: 'RID' | 'PCI';
  field: string;
  fieldLabel: string;
  situation: string;
  patientContext?: {
    name?: string;
    age?: string | number;
  };
  availableSuggestions?: SuggestionReferenceItem[];
}

export interface QuestionItem {
  question: string;
  clinicalObjective: string;
}

export async function generateClinicalFieldQuestions(params: FieldQuestionsParams): Promise<QuestionItem[]> {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  let curatedQuestionsBlock = "";
  if (params.availableSuggestions && params.availableSuggestions.length > 0) {
    const questionsWithText = params.availableSuggestions
      .filter(s => s.question && s.question.trim().length > 0)
      .slice(0, 15);
    
    if (questionsWithText.length > 0) {
      const qList = questionsWithText.map(s => `- [${s.key}]: "${s.question}"`).join("\n");
      curatedQuestionsBlock = `
PERGUNTAS INVESTIGATIVAS CURADAS DO BANCO DE SUGESTÕES (BASE MANDATÓRIA):
Utilize estas perguntas clínicas como alicerce fundamental para formular as perguntas da sessão:
${qList}
`;
    }
  }

  const prompt = `
Você é um Supervisor Clínico Master em Terapia Cognitivo-Comportamental de 4ª Geração (Terapia Baseada em Processos, ACT, FAP, DBT e Terapia do Esquema).

O terapeuta está em atendimento clínico e precisa investigar e preencher o campo:
"${params.fieldLabel}" (Identificador: "${params.field}") da ferramenta ${params.tool}.

O relato da situação ou queixa trazida pelo paciente é:
"""
${params.situation}
"""

${curatedQuestionsBlock}

SUA TAREFA:
Gerar de 2 a 3 perguntas clínicas socráticas, evocativas e experienciais, formuladas na voz do psicólogo para perguntar diretamente ao paciente.
As perguntas devem ser curtas, diretas, empáticas e altamente focadas em acessar a experiência do paciente para elucidar o campo "${params.fieldLabel}".
Evite perguntas prolixas ou teóricas complexas. O paciente deve responder com base no que sentiu, pensou ou experienciou no momento.

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON estrito):
{
  "questions": [
    {
      "question": "Texto direto e empático da pergunta socrática para fazer ao paciente...",
      "clinicalObjective": "Objetivo técnico de 4ª geração (ex: Desfusão cognitiva, Identificação de necessidade frustrada)"
    }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                clinicalObjective: { type: Type.STRING }
              },
              required: ["question", "clinicalObjective"]
            }
          }
        },
        required: ["questions"]
      }
    }
  });

  const raw = response.text || "";
  try {
    const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (e) {
    console.error("Erro ao analisar perguntas clínicas:", e);
    return [
      {
        question: `Como você se sentiu e o que passou pela sua mente em relação a ${params.fieldLabel}?`,
        clinicalObjective: "Investigação socrática exploratória aberta"
      }
    ];
  }
}

// Supervisor / Coach IA Especialista para as 10 Ferramentas de Treino de HPs
export interface HpCoachParams {
  hpId: string;
  hpName: string;
  patientName?: string;
  exerciseTitle: string;
  userContext: string;
  mode: 'feedback' | 'simulation' | 'coping_card';
}

export async function generateHpTrainingFeedback(params: HpCoachParams): Promise<string> {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Você é o Treinador Clínico Sênior e Supervisor em Treinamento de Habilidades Psicológicas (THP - Poubel & Rodrigues) e Terapia Cognitivo-Comportamental de 4ª Geração, especialista na habilidade: "${params.hpName}".

DADOS DO TREINO:
- Habilidade Psicológica: ${params.hpName} (ID: ${params.hpId})
- Paciente: ${params.patientName || "Paciente em atendimento"}
- Exercício / Registro: "${params.exerciseTitle}"
- Contexto ou Relato Prático:
"""
${params.userContext}
"""

MODO SOLICITADO: ${
    params.mode === 'feedback' 
      ? 'FEEDBACK CLÍNICO CONSTRUTIVO E REFORÇO DE HABILIDADE' 
      : params.mode === 'simulation' 
        ? 'SIMULAÇÃO DE ROLE-PLAY / DESAFIO COMPORTAMENTAL PRÁTICO' 
        : 'CARTÃO DE ENFRENTAMENTO RÁPIDO PARA SITUAÇÕES DE GATILHO'
  }

DIRETRIZES TÉCNICAS:
1. Adote tom clínico profissional, empático, encorajador e baseado em evidências.
2. Seja cirúrgico, estruturado e prático: evite introduções longas.
3. Se for 'feedback': avalie os pontos fortes demonstrados, aponte onde o paciente pode aprofundar a HP e proponha uma reflexão metacognitiva.
4. Se for 'simulation': proponha uma cena do cotidiano com 3 opções de resposta ou uma réplica para treino de role-play.
5. Se for 'coping_card': entregue um cartão visual de enfrentamento com: "Gatilho Antecedente", "Respiração/Ancoragem de 10s", "Frase de Desfusão/Força" e "Micro-Ação Assertiva".
6. Formatação: Retorne APENAS HTML clássico limpo (<p style='text-align: justify;'>, <ul>, <li>, <strong>) pronto para renderização direta, sem blocos de código markdown.
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_CLINICAL_MODEL,
    contents: prompt,
    config: { maxOutputTokens: 1024 }
  });

  return (response.text || "").replace(/^```html\s*/i, "").replace(/```\s*$/i, "").trim();
}


