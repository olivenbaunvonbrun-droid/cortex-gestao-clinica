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
    Você é um assistente sênior especialista em Terapia Cognitivo-Comportamental (TCC) e Terapia do Esquema. 
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
    Analise o caso utilizando como referência teórica os 18 Esquemas Iniciais Desadaptativos (EIDs) e os Domínios de Young.
    Forneça a resposta em formato Markdown estruturado com:
    1. **Análise do Ciclo Cognitivo**: Como a crença ativou o ciclo. Relacione com um dos 5 Domínios de Young se aplicável.
    2. **Distorções Cognitivas**: Identifique e explique as distorções presentes.
    3. **Funcionamento da Estratégia**: Identifique se o comportamento reflete Rendição, Evitação ou Hipercompensação.
    4. **Reestruturação Cognitiva**: Sugira pensamentos alternativos baseados na técnica de Seta Descendente ou evidências.
    5. **Ações Adaptativas**: Sugestões práticas (ex: técnicas de aterramento ou novos comportamentos).
    6. **Mensagem de Apoio**: Uma validação empática.

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
