import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../lib/db";
import { decryptData } from "../lib/crypto";

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

export async function clinicalInsight(patientHistory: string, currentSession: string, approach: string = 'Geral') {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise a evolução deste paciente com base na abordagem: ${approach}.
    
    Histórico Recente:
    ${patientHistory}
    
    Relato da Sessão Atual:
    ${currentSession}
    
    Por favor, forneça uma análise estruturada contendo:
    1. Temas Centrais e Recorrências.
    2. Dinâmica Transferencial/Contratransferencial (se aplicável à abordagem).
    3. Hipóteses Diagnósticas ou Estruturais.
    4. Sugestões de Manejo para a próxima sessão.
    
    Linguagem técnica e precisa. Responda em Markdown.
  `;

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

    REGRAS DE OURO:
    1. ESTRUTURA CLÍNICA: Divida o texto em seções claras se necessário (ex: Queixa Principal, Dinâmica Observada, Intervenções Realizadas).
    2. ABORDAGEM ${approach}: Utilize o vocabulário técnico e o foco analítico específico desta linha (ex: Se TCC, foque em pensamentos automáticos e crenças; se Psicanálise, foque em associações e transferência).
    3. FILTRAGEM: Remova 100% de conversa fiada, hesitações (hã, é...) e ruídos sem valor terapêutico.
    4. FORMATAÇÃO: Use Markdown. Use **negrito** para conceitos-chave. Use > para citações literais importantes do paciente.
    5. IDENTIFICAÇÃO: Use "P:" para Paciente e "Psi:" para Profissional.
    6. MODO ${mode}: 
       - Se Primeira Consulta: Foque na Anamnese, histórico e demanda inicial.
       - Se Evolução: Foque no progresso, resistência e temas recorrentes.

    O resultado deve parecer um registro profissional pronto para um prontuário médico-hospitalar de elite.
  `;

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
    Você é o módulo "Charcot", um consultor de segunda opinião baseado em Prática Baseada em Evidências (PBE).
    Forneça orientações sobre sinais de alarme, hipóteses diagnósticas e intervenções validadas.
    Sempre cite referências estatísticas ou científicas quando possível.
    Contexto do paciente atual: ${patientContext}
  `;

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

  parts.push({ text: "Analise estes documentos clínicos (laudos, exames ou registros). Extraia os dados relevantes, conclusões e possíveis implicações clínicas. Formate em Markdown." } as any);

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
    
    HISTÓRICO:
    ${historyText}
    
    OBJETIVO:
    Fornecer um perfil completo que cruze os dados, identificando:
    1. EVOLUÇÃO E PROGRESSO: Como o paciente estava no início vs. agora.
    2. PADRÕES COMPORTAMENTAIS E DINÂMICOS: Recorrências observadas ao longo do tempo sob a ótica da abordagem ${approach}.
    3. ADERÊNCIA AO TRATAMENTO: Análise de faltas ou engajamento.
    4. SÍNTESE DIAGNÓSTICA ATUALIZADA: Visão sistêmica baseada no histórico longo.
    
    Responda em Markdown elegante e profissional, utilizando terminologia técnica adequada.
  `;

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age}

Respostas do Questionário (Escala A-E):
${answersText}

ESTRUTURA DO RELATÓRIO (Conforme Diretrizes do Conselho Federal de Psicologia - CFP):
1. IDENTIFICAÇÃO (Nome e idade)
2. DESCRIÇÃO DA DEMANDA (Motivo da avaliação baseado nos resultados do IHS)
3. PROCEDIMENTO (Uso do IHS e entrevista de triagem)
4. ANÁLISE (Agrupar por fatores de habilidades sociais:
   - Fator 1: Enfrentamento e autoafirmação com risco
   - Fator 2: Autoafirmação na expressão de sentimento positivo
   - Fator 3: Conversação e desenvoltura social
   - Fator 4: Autoexposição a desconhecidos e falar em público
   - Fator 5: Autocontrole da agressividade)
5. CONCLUSÃO/PROGNÓSTICO
6. RECOMENDAÇÕES TERAPÊUTICAS

Instruções importantes:
- Tom clínico, ético e empático.
- Use linguagem profissional (Ex: "O examinando demonstra...", "Observa-se um déficit em...").
- NÃO seja determinista; use termos como "sugere", "indica tendência a".
- Formate em Markdown com títulos em negrito.
- IMPORTANTE: NÃO inclua campos vazios como "Local:", "Data:", "Assinatura:" ou rodapés, pois estes são gerados automaticamente pelo sistema no cabeçalho e rodapé do documento.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
3. ANÁLISE DOS DOMÍNIOS E ESQUEMAS ATIVOS (Explorar os domínios afetados e como os esquemas desadaptativos identificados como ativos se manifestam no comportamento e nas relações baseados na teoria de Jeffrey Young)
4. CORRELAÇÕES E IMPLICAÇÕES CLÍNICAS (Intersecção entre os esquemas ativos e potenciais mecanismos de enfrentamento/estilos de coping - resignação, evitação, hipercompensação)
5. CONCLUSÃO E DIRETRIZES PARA A TERAPIA FOCADA EM ESQUEMAS (Sugestão de focos de intervenção terapêutica, como reestruturação cognitiva, vivências emocionais e quebra de padrões comportamentais)

Instruções importantes:
- Tom estritamente clínico, acadêmico, ético e empático.
- Evitar determinismo ("O paciente é..." vs "O paciente apresenta forte ativação do esquema de...").
- Formate em Markdown com títulos bem definidos.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés, pois estes são injetados de forma automática no cabeçalho e rodapé do documento de exportação.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

Dados do Paciente:
Nome: ${patient.name}
Idade: ${patient.age} Anos

Anotações da Sessão:
${recordText}

Por favor, forneça um Resumo Clínico Integrativo contendo:
1. SÍNTESE DOS CONTEÚDOS TRAZIDOS (Principais demandas, queixas e sentimentos expressos)
2. DINÂMICA COMPORTAMENTAL E EVOLUTIVA (Padrões observados na sessão de hoje em comparação ao histórico)
3. INTERVENÇÕES REALIZADAS E RESPOSTA DO PACIENTE (Eficácia das técnicas aplicadas)
4. PLANEJAMENTO PARA AS PRÓXIMAS CONSULTAS (Foco clínico recomendado)

Instruções importantes:
- Tom estritamente ético, profissional e empático.
- Use terminologia técnica apropriada.
- Formate em Markdown com títulos em negrito.
- IMPORTANTE: NÃO inclua campos manuais de data, local, assinatura ou rodapés, pois estes são gerados automaticamente pelo sistema no cabeçalho e rodapé do documento de exportação.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "Erro ao gerar resumo clínico.";
}

export async function analyzePciAssessment(data: any) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `**Tarefa:** Agir como um supervisor clínico especialista. Analise os dados do Plano Clínico Integrado (PCI) a seguir e gere uma análise consolidada e um projeto terapêutico estruturado.

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
- **Crenças Periféricas:** ${data.crencasPerifericas || ''}
- **Excessos Comportamentais:** ${data.excessosComp || ''}
- **Déficits em Habilidades:** ${data.deficitsHab || ''}
- **Histórico Formativo:** ${data.historicoFormativo || ''}
- **Diagnóstico Topográfico (DSM/CID):** ${data.diagTopo || ''}
- **Diagnóstico Funcional (MDCF):** ${data.diagFunc || ''}
- **Projeto Terapêutico:** ${data.projetoTerap || ''}

Sua resposta DEVE ser em formato HTML (sem tags <html> ou <body>, apenas <h4>, <p>, <ul> e <li>) estruturada em 4 partes:
1. Síntese Diagnóstica Integrativa
2. Análise Funcional e de Esquemas
3. Proposta de Projeto Terapêutico (Metas e Intervenções)
4. Recomendações e Pontos de Atenção

Use linguagem profissional e científica de acordo com as diretrizes do CRP/CFP.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
Você é um assistente de IA especializado em psicologia, atuando como suporte para um(a) psicólogo(a). Sua tarefa é gerar uma análise qualitativa e interpretativa dos resultados do "Inventário de Habilidades Psicológicas – Poubel e Rodrigues (IHP-PR)", com base nos resultados quantitativos e nas respostas brutas de um(a) avaliando(a).

**INSTRUÇÕES IMPORTANTES:**
1. **Base da Análise:** Sua análise deve ser uma interpretação dos resultados quantitativos fornecidos. Use os escores e as classificações como ponto de partida principal. As respostas brutas podem ser usadas para dar exemplos específicos ou aprofundar a análise de uma habilidade específica.
2. **Estrutura do Relatório:** Gere um relatório em português do Brasil, utilizando Markdown para formatação (títulos com # ou ##, negrito), com as seguintes seções:
    * **Resumo Geral e Interpretação do QIP:** Inicie com uma síntese das tendências gerais, interpretando o Quociente de Inteligência Psicológica (QIP).
    * **Análise das Habilidades Psicológicas (Subescalas):** Discorra sobre as 10 subescalas. Agrupe habilidades com classificações similares. Explique o que cada habilidade significa.
    * **Potenciais Pontos Fortes:** Destaque as habilidades com pontuações mais altas (Satisfatório/Proficiente).
    * **Áreas para Desenvolvimento:** Identifique habilidades com pontuações mais baixas (Deficitário/Insuficiente).
    * **Sugestões e Encaminhamentos:** Ofereça sugestões gerais e hipotéticas de intervenções clínicas.
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
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "Erro ao gerar laudo do IHP-PR.";
}





