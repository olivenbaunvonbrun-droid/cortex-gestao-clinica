import React from "react";
import { Sparkles, FileUp, HelpCircle, Check, BookOpen, AlertCircle } from "lucide-react";

export default function UploadInstructions() {
  return (
    <div className="space-y-8 px-4 md:px-16 pb-20 max-w-4xl mx-auto" id="instructions-viewport">
      
      {/* Intro header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1 bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20 px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          ARQUITETURA ADAPTATIVA
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight font-display">Instruções para Calibrar Novas Ferramentas</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Veja abaixo os formatos e especificações que você pode enviar para que os slots da biblioteca se convertam em ferramentas digitais.
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="instructions-grid">
        
        {/* Card 1: Como funciona */}
        <div className="bg-[#111217]/50 border border-gray-900 rounded-xl p-6 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#00A3FF]" />
            Fluxo de Digitalização
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Quando você enviar as tabelas de scores, itens ou regras psicométricas de um novo teste psicológico, o agente de IA lerá e reajustará o código do aplicativo em tempo real.
          </p>
          
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Mapeamento de Itens:</strong> Perguntas e escalas Likert extraídas com fidedignidade analógica.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Cálculo Normativo:</strong> Regras matemáticas programadas em TypeScript de modo nativo.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Ajuste do Prompt do Laudo:</strong> Configuração personalizada de 4ª Geração de TCC correspondente à escala de destino.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Tipos de Arquivos Suportados */}
        <div className="bg-[#111217]/50 border border-gray-900 rounded-xl p-6 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <FileUp className="w-5 h-5 text-amber-500" />
            Formatos Suportados de Envio
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Você pode enviar qualquer material do seu arsenal clínico habitual. O processo de ingestão foi testado para decodificar:
          </p>
          
          <ul className="space-y-2.5 text-xs text-gray-400 font-mono text-[11px]">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>Documentos Clínicos / PDFs originais de escalas</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>Tabelas de pontuação ou fórmulas de regressão</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>Imagens escaneadas de testes impressos (OCR Ativo)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>Anamneses semiestruturadas em formato de texto simples</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Structured example guidelines */}
      <div className="bg-[#111217]/85 border border-[#00A3FF]/20 rounded-xl p-8 space-y-4" id="example-format-box">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest font-mono">Modelo Recomendado de Especificação por Texto</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Se optar por descrever a ferramenta no próprio chat do AI Studio, recomendo seguir o seguinte esqueleto para assegurar precisão cirúrgica de implantação imediata:
        </p>

        <div className="bg-gray-950 p-4 rounded border border-gray-900 text-xs font-mono text-gray-300 leading-relaxed space-y-2 select-all overflow-x-auto">
          <div><strong>1. NOME DA FERRAMENTA:</strong> Escala de Resiliência no Trabalho (ERT)</div>
          <div><strong>2. CÓDIGO DA ESCALA:</strong> 8 questões pontuadas de 1 a 5 (Likert)</div>
          <div><strong>3. REGRAS DE CÁLCULO:</strong> TotalScore é a soma direta. Inverter itens 3 e 7.</div>
          <div><strong>4. CLASSIFICADOR:</strong> Abaixo de 15 (Estresse), 16 a 28 (Normal), 29+ (Excelente)</div>
          <div><strong>5. FOCO DE LAUDO IA:</strong> Neurobiologia do estresse ocupacional e Protocolos de Mindfulness/ACT.</div>
        </div>
      </div>

      {/* Safe message info */}
      <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs text-amber-500/90">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div className="leading-relaxed">
          <strong>Vaga livre para atuação:</strong> A inteligência analítica já está embutida na plataforma através da integração server-side do Gemini. Assim que eu receber seu material, posso imediatamente transformá-lo em perguntas ativas, com progressão, pontuação em gráficos e laudo estendido.
        </div>
      </div>

    </div>
  );
}
