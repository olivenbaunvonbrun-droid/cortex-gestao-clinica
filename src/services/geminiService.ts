import { GoogleGenAI as OriginalGoogleGenAI, Type } from "@google/genai";
import { db } from "../lib/db";
import { decryptData } from "../lib/crypto";

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-pro",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

class GoogleGenAI extends OriginalGoogleGenAI {
  constructor(options: any) {
    super(options);
    const originalGenerateContent = this.models.generateContent.bind(this.models);
    this.models.generateContent = async (params: any) => {
      let lastError: any = null;
      for (const modelName of GEMINI_MODELS) {
        try {
          console.log(`[Resiliência] Tentando modelo Gemini: ${modelName}`);
          return await originalGenerateContent({
            ...params,
            model: modelName
          });
        } catch (err: any) {
          console.warn(`[Resiliência] Falha no modelo ${modelName}:`, err.message || err);
          lastError = err;
        }
      }
      throw lastError || new Error("Todos os modelos candidatos do Gemini falharam.");
    };
  }
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

// Framework de Parâmetros Clínicos Avançados
export const CLINICAL_FRAMEWORK_PROMPT = `
DIRETRIZES DO FRAMEWORK DE PARÂMETROS CLÍNICOS AVANÇADOS (MÉTODO DE 4ª GERAÇÃO E TCC):
1. ESQUEMAS COGNITIVOS: Mapear os 18 Esquemas Iniciais Desadaptativos (EIDs / Domínios de Young) e os 15 Esquemas Adaptativos (YPQ - Apego Seguro, Autonomia, Competência, Valor Pessoal, etc.).
2. CRENÇAS NUCLEARES E INTERMEDIÁRIAS: Crenças Centrais (Incapacidade, Não-Amabilidade, Desvalor, Fracasso) vs. Crenças Funcionais; Crenças Intermediárias (Regras condicionais "Se... então...", pressupostos e atitudes) disfuncionais e adaptativas.
3. DISTORÇÕES COGNITIVAS E VIESES: Mapear as 18 distorções de Beck (catastrofização, pensamento dicotômico, leitura de mente, comparação injusta, falácias de justiça/controle/mudança, viés confirmatório) e vieses de negatividade, rejeição ou comparação.
4. ESTRATÉGIAS DE ENFRENTAMENTO (COPING) E MODOS: Coping disfuncional (evitação, resignação, hipercompensação) vs. Coping funcional (enfrentamento ativo, regulação emocional, flexibilidade); Modos Esquemáticos (Criança Vulnerável/Irritada/Feliz, Pai Punitivo/Exigente, Protetor Distante, Adulto Saudável).
5. NECESSIDADES EMOCIONAIS BÁSICAS: Identificar as necessidades primárias frustradas ou atendidas (Infantis, Parentais, Conjugais ou Adultas).
6. HABILIDADES PSICOLÓGICAS (HPs): Identificar déficits ou progressos nas 8 HPs centrais (Autoconhecimento, Autorregulação Emocional, Raciocínio Realisticamente Otimista, Autoestima, Resolutividade/Enfrentamento, Autocontrole, Sociabilidade, Imunidade Social).
7. PARÂMETROS CLÍNICOS AVANÇADOS: Valores pessoais, propósito existencial, nível de insight, metacognições, tolerância à incerteza/frustração e sensibilidade à rejeição/fracasso.
8. INTERPRETAÇÃO DE ITENS INVERTIDOS/NEGATIVOS (CRÍTICO): Vários inventários contêm itens com enunciados negativos ou deficitários (ex: "fico encabulado(a) sem saber o que dizer", "evito falar em público", "concordo com pedidos abusivos"). Se o paciente responder "Nunca ou Raramente" ou pontuar muito baixo nesses itens, significa que ele NÃO apresenta a dificuldade descrita, o que indica comportamento SAUDÁVEL e assertivo. Não confunda a menção de um comportamento negativo com a presença dele se a resposta do paciente indicar baixa frequência.
`;

export async function generateContentWithSystemInstruction(prompt: string, systemInstruction: string) {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
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
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { text: "Por favor, realize a transcrição clínica estruturada deste áudio." },
      { inlineData: { mimeType, data: audioBase64 } }
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text || "Erro ao gerar laudo do IHP-PR.";
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
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
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text;
}
