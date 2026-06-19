import { GoogleGenAI } from "@google/genai";
import { RidEntry } from "../types";
import { db } from "../../../lib/db";
import { decryptData } from "../../../lib/crypto";

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
  
  throw new Error("Chave API não encontrada no sistema local. Por favor, insira sua chave em 'Configurações' do Cortex para habilitar as funções de IA.");
}

export async function analyzeRid(data: Omit<RidEntry, 'id' | 'date' | 'analysis'>): Promise<string> {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Você é um assistente sênior especialista em Terapia Cognitivo-Comportamental (TCC) de quarta geração e Terapia do Esquema. 
    Analise o seguinte Registro de Interações Diárias (RID) e forneça insights clínicos profundos.

    DADOS DO REGISTRO:
    - Situação: ${data.situacao}
    - Necessidade Emocional: ${Array.isArray(data.necessidade) ? data.necessidade.join(', ') : data.necessidade}
    - Esquema/Crença: ${Array.isArray(data.esquema) ? data.esquema.join(', ') : data.esquema}
    - Pensamentos Automáticos: ${data.pensamento}
    - Emoção: ${data.emocao.name} (${data.emocao.intensity}%)
    - Comportamento: ${data.comportamento}
    - Consequências de Curto Prazo: ${data.consequenciasCurtoPrazo}
    - Consequências de Longo Prazo: ${data.consequenciasLongoPrazo}

    SUA TAREFA:
    Analise o caso de forma multidimensional utilizando como referência teórica os seguintes parâmetros clínicos avançados:
    - **Esquemas Cognitivos**: 18 Esquemas Iniciais Desadaptativos (EIDs / Domínios de Young) e os 15 Esquemas Adaptativos (YPQ).
    - **Crenças Centrais e Intermediárias**: Avaliar crenças (sobre si, outros, mundo) e regras/pressupostos/atitudes, distinguindo versões disfuncionais e adaptativas.
    - **Distorções Cognitivas e Vieses**: Identificar as 18 distorções de Beck (incluindo catastrofização, pensamento dicotômico, comparação injusta, falácias de justiça/controle/mudança e viés confirmatório) e vieses de negatividade/rejeição/comparação social.
    - **Estratégias de Enfrentamento (Coping) e Modos**: Diferenciar coping disfuncional (evitação, resignação, hipercompensação) de coping funcional (enfrentamento ativo, regulação emocional, flexibilidade) e mapear os Modos Esquemáticos (Criança Vulnerável/Irritada/Feliz, Pai Punitivo/Exigente, Protetor Distante, Capitulador Complacente, Hipercompensador e Adulto Saudável).
    - **Necessidades Emocionais Básicas**: Discernir quais necessidades primárias foram frustradas (na história formativa) e quais foram atendidas.
    - **Padrões Comportamentais, Emoções Nucleares e Fatores Protetivos**: Avaliar comportamentos disfuncionais (autossabotagem, isolamento) vs. funcionais (assertividade, autocuidado), emoções funcionais/disfuncionais e fatores protetivos (autoeficácia, rede de apoio, autocompaixão).
    - **Parâmetros Clínicos Avançados**: Mapear valores pessoais, metas, propósito existencial, nível de insight, metacognições, tolerância à incerteza/frustração e sensibilidade à rejeição/fracasso.

    Forneça a resposta em formato Markdown estruturado com:
    1. **Análise do Ciclo Cognitivo e Dinâmica de Esquemas**: Como as crenças centrais e intermediárias ativaram os EIDs ou ativaram modos esquemáticos disfuncionais. Identifique também quais Esquemas Adaptativos e necessidades básicas atendidas/frustradas estão em jogo.
    2. **Distorções Cognitivas e Vieses**: Identifique quais das 18 distorções clássicas e vieses de processamento ocorreram.
    3. **Funcionamento da Estratégia de Coping**: Identifique se o comportamento reflete resignação, evitação ou hipercompensação, e como treinar o enfrentamento ativo e flexibilidade psicológica.
    4. **Reestruturação Cognitiva e Raciocínio Adaptativo**: Sugira pensamentos e crenças alternativas funcionais (sobre si, outros e mundo).
    5. **Treinamento de Habilidades Psicológicas (Ações Adaptativas)**: Sugestões práticas baseadas em fatores protetivos, regulação emocional (mindfulness, autocompaixão) e parâmetros avançados (repertório de habilidades sociais, diferenciação do self).
    6. **Mensagem de Apoio e Validação Empática**.

    Use uma linguagem profissional, mas acessível e acolhedora.
    IMPORTANTE: Não utilize notação LaTeX (como $\\rightarrow$). Use setas simples em texto se necessário (-> ou =>).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Falha na comunicação com a inteligência artificial.");
  }
}
