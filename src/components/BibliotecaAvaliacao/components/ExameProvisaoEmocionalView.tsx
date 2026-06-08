import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Heart, Sparkles, Scale, Info, Check, Printer, Edit2, 
  Trash2, AlertCircle, Plus, ChevronRight, CheckCircle2, Bookmark, Flame
} from "lucide-react";

export interface ProvisionItem {
  id: string;
  statement: string;
  category: "SAC" | "SAV"; // SAC: Aceitação e Conexão, SAV: Autonomia e Valorização
}

export const emotionalProvisionItems: ProvisionItem[] = [
  { id: "pe_1", statement: "Me senti admirado (a)", category: "SAC" },
  { id: "pe_2", statement: "Me senti amado", category: "SAC" },
  { id: "pe_3", statement: "Me senti apoiado", category: "SAC" },
  { id: "pe_4", statement: "Me senti aprovado (a)", category: "SAC" },
  { id: "pe_5", statement: "Me senti capaz de refletir sobre as coisas", category: "SAV" },
  { id: "pe_6", statement: "Me senti compreendido (a)", category: "SAC" },
  { id: "pe_7", statement: "Me senti corajoso (a)", category: "SAV" },
  { id: "pe_8", statement: "Me senti desejado (a)", category: "SAC" },
  { id: "pe_9", statement: "Me senti independente", category: "SAV" },
  { id: "pe_10", statement: "Me senti livre", category: "SAV" },
  { id: "pe_11", statement: "Me senti no controle das coisas", category: "SAV" },
  { id: "pe_12", statement: "Me senti notado (a)", category: "SAC" },
  { id: "pe_13", statement: "Me senti otimista", category: "SAV" },
  { id: "pe_14", statement: "Me senti protegido (a)", category: "SAC" },
  { id: "pe_15", statement: "Me senti realizado (a)", category: "SAV" },
  { id: "pe_16", statement: "Me senti responsável", category: "SAV" },
  { id: "pe_17", statement: "Me senti sociável", category: "SAV" },
  { id: "pe_18", statement: "Me senti único", category: "SAV" },
  { id: "pe_19", statement: "Me senti útil", category: "SAV" },
  { id: "pe_20", statement: "Me senti vinculado", category: "SAC" },
  { id: "pe_21", statement: "Senti que podia brincar ou me recrear", category: "SAV" },
  { id: "pe_22", statement: "Senti que podia confiar nas pessoas", category: "SAC" },
  { id: "pe_23", statement: "Senti que podia ser franco (a)", category: "SAC" }
];

export interface ExameProvisaoEmocionalState {
  ratings: Record<string, "N" | "P" | "M" | "S" | "">;
  facilitatingBehaviors: string; // Atitudes que aumentam esse efeito social no presente
  blockingBehaviors: string; // Atitudes que dificultam ou atrapalham
  clinicalNotes: string;
}

interface ExameProvisaoEmocionalViewProps {
  patient: PatientInfo;
  state: ExameProvisaoEmocionalState;
  setState: React.Dispatch<React.SetStateAction<ExameProvisaoEmocionalState>>;
}

export default function ExameProvisaoEmocionalView({
  patient,
  state,
  setState
}: ExameProvisaoEmocionalViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "facsimile">("editor");

  const handleRatingChange = (itemId: string, value: "N" | "P" | "M" | "S") => {
    setState((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [itemId]: value
      }
    }));
  };

  const fillAllWith = (value: "N" | "P" | "M" | "S") => {
    const newRatings: Record<string, "N" | "P" | "M" | "S"> = {};
    emotionalProvisionItems.forEach((item) => {
      newRatings[item.id] = value;
    });
    setState((prev) => ({
      ...prev,
      ratings: newRatings
    }));
  };

  const loadPresetSample = () => {
    // A clinical case of emotional deprivation: low SAC score but average SAV score,
    // reflecting a patient with high autonomy yet severe emotional hunger/loneliness history.
    const presetRatings: Record<string, "N" | "P" | "M" | "S"> = {
      pe_1: "P",  // Me senti admirado
      pe_2: "N",  // Me senti amado (Nada)
      pe_3: "P",  // Me senti apoiado
      pe_4: "P",  // Me senti aprovado
      pe_5: "M",  // Capaz de refletir (Muito)
      pe_6: "N",  // Compreendido (Nada)
      pe_7: "M",  // Corajoso
      pe_8: "N",  // Desejado (Nada)
      pe_9: "S",  // Independente (Sempre)
      pe_10: "M", // Livre
      pe_11: "P", // Controle das coisas
      pe_12: "N", // Notado (Nada)
      pe_13: "P", // Otimista
      pe_14: "N", // Protegido (Nada)
      pe_15: "P", // Realizado
      pe_16: "S", // Responsável (Sempre)
      pe_17: "P", // Sociável
      pe_18: "M", // Único
      pe_19: "M", // Útil
      pe_20: "N", // Vinculado (Nada)
      pe_21: "P", // Brincar/recrear
      pe_22: "N", // Confiar nas pessoas (Nada)
      pe_23: "P"  // Ser franco
    };

    setState({
      ratings: presetRatings,
      facilitatingBehaviors: "1. Praticar a autocompartilha emocional com amigos de confiança, reduzindo a hiper-autossuficiência defensiva.\n2. Inserir pequenos atos voluntários de vulnerabilidade e expressar necessidades afetivas de forma clara.\n3. Participar de círculos de diálogo terapêutico e aceitar demonstrações sinceras de carinho.",
      blockingBehaviors: "1. Afastamento preventivo das relações ao sinal de intimidade (esquiva protetiva).\n2. Adotar a postura de 'forte que cuida de todos mas não aceita ser cuidado'.\n3. Desconfiar sistematicamente do elogio alheio achando que é falso.",
      clinicalNotes: "O mapeamento clínico acusa um déficit grave no Subíndice de Aceitação e Conexão (SAC = 15%), típico de uma história de Privação Emocional e Desconfiança/Abuso. O paciente desenvolveu como sobrecompensação um excelente Subíndice de Autonomia e Valorização (SAV = 64%), gerando uma carapaça de independência rígida ('Eu me protejo sozinho'). A terapia focará na reparação esquemática, permitindo vulnerabilidade segura e fortalecendo as atitudes facilitadoras propostas."
    });
  };

  // Calculations
  const numericValue = (val: "N" | "P" | "M" | "S" | ""): number => {
    switch (val) {
      case "N": return 0;
      case "P": return 1;
      case "M": return 2;
      case "S": return 3;
      default: return 0;
    }
  };

  const ratedItems = emotionalProvisionItems.filter(item => state.ratings[item.id] !== undefined && state.ratings[item.id] !== "");
  const totalRated = ratedItems.length;

  const totalPossibleAll = totalRated * 3;
  const totalEarnedAll = ratedItems.reduce((acc, item) => acc + numericValue(state.ratings[item.id]), 0);
  const ipegScore = totalPossibleAll > 0 ? Math.round((totalEarnedAll / totalPossibleAll) * 100) : 0;

  // SAC items
  const sacItems = ratedItems.filter(item => item.category === "SAC");
  const sacEarned = sacItems.reduce((acc, item) => acc + numericValue(state.ratings[item.id]), 0);
  const sacPossible = sacItems.length * 3;
  const sacScore = sacPossible > 0 ? Math.round((sacEarned / sacPossible) * 100) : 0;

  // SAV items
  const savItems = ratedItems.filter(item => item.category === "SAV");
  const savEarned = savItems.reduce((acc, item) => acc + numericValue(state.ratings[item.id]), 0);
  const savPossible = savItems.length * 3;
  const savScore = savPossible > 0 ? Math.round((savEarned / savPossible) * 100) : 0;

  // Diagnostic Thresholds and Vulnerabilities
  const severeLackItems = ratedItems.filter(item => state.ratings[item.id] === "N" || state.ratings[item.id] === "P");

  let classificationText = "Sem Avaliação Completa";
  let classificationDesc = "Preencha as classificações de sentimentos do paciente para calcular o histórico de provisão emocional.";

  if (totalRated > 12) {
    if (ipegScore >= 75) {
      classificationText = "Sólida Provisão Emocional Histórica (Vínculos Seguros Predominantes)";
      classificationDesc = "O paciente relata uma base de desenvolvimento rica em afeto, validação e incentivo à autonomia. Possui recursos internos abundantes para manter relacionamentos saudáveis.";
    } else if (ipegScore >= 45) {
      classificationText = "Disponibilidade Emocional Flutuante ou Condicional";
      classificationDesc = "Houve provisão em certas áreas (por exemplo, incentivo à utilidade/independência), mas carências em outras (compreensão, proteção ou afeto incondicional). Pode apresentar distorções ou sentimentos de solidão sob estresse.";
    } else {
      classificationText = "Nível Crítico de Provisão Emocional Histórica (Privação e Solidão)";
      classificationDesc = "O histórico revela escassa nutrição afetiva. Alta propensão para o desenvolvimento de Esquemas Iniciais Desadaptativos (EIDs) como Privação Emocional, Isolamento Social ou Abandono.";
    }
  }

  return (
    <div className="space-y-6 text-[#E0E0E0] p-1" id="exame-provisao-emocional-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20 animate-pulse" />
            <span>Ferramenta Integradora nº 24</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mt-1">
            Exame Histórico da Provisão Emocional
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Sonda a frequência de <span className="text-[#00A3FF] font-semibold">23 vivências afetivas vitais</span> na história de vida do paciente. 
            Mapeia as origens de nutrição emocional ou privação crônica para fundamentar atitudes reparadoras no presente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("editor")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md border flex items-center gap-2 transition ${
              viewMode === "editor"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                : "border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white"
            }`}
            id="btn-pe-mode-editor"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Painel Clínico
          </button>
          
          <button
            onClick={() => setViewMode("facsimile")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md border flex items-center gap-2 transition ${
              viewMode === "facsimile"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                : "border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white"
            }`}
            id="btn-pe-mode-facsimile"
          >
            <Printer className="w-3.5 h-3.5" />
            Folha Oficial (PDF)
          </button>
        </div>
      </div>

      {viewMode === "editor" ? (
        <div className="space-y-6" id="pe-editor-layout">
          
          {/* TOP METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="pe-metrics-grid">
            
            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5">
                <span className="text-[8px] bg-indigo-950 text-indigo-400 font-mono px-1.5 py-0.5 rounded-full uppercase">Global</span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-400">{ipegScore}%</div>
              <div className="text-[10px] text-gray-300 uppercase tracking-wider font-mono mt-1">Provisão Global (IPEG)</div>
              <p className="text-[9px] text-gray-500 mt-0.5">{totalRated} de 23 itens preenchidos</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5">
                <span className="text-[8px] bg-rose-950 text-rose-400 font-mono px-1.5 py-0.5 rounded-full uppercase">SAC</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400">{sacScore}%</div>
              <div className="text-[10px] text-gray-300 uppercase tracking-wider font-mono mt-1">Aceitação e Conexão</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Vínculos de afeto e segurança</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5">
                <span className="text-[8px] bg-emerald-950 text-emerald-400 font-mono px-1.5 py-0.5 rounded-full uppercase">SAV</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{savScore}%</div>
              <div className="text-[10px] text-gray-300 uppercase tracking-wider font-mono mt-1">Autonomia e Valor</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Independência e valorização única</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg flex flex-col justify-center items-center">
              <button
                type="button"
                onClick={loadPresetSample}
                className="w-full h-full py-2 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-white border border-indigo-950 rounded-lg text-[10px] transition font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5"
                id="btn-pe-load-preset"
              >
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Déficit Clínico (Amostra)
              </button>
            </div>

          </div>

          {/* DIAGNOSTIC THRESHOLDS PANEL */}
          <div className="bg-gray-950/60 border border-gray-850 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono">
              <Scale className="w-5 h-5 text-[#00A3FF]" />
              <span>Diagnóstico de Histórico Afetivo: {classificationText}</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-4xl">
              {classificationDesc}
            </p>
            {severeLackItems.length > 0 && (
              <div className="pt-2 border-t border-gray-900 flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-mono text-amber-500 uppercase font-bold flex items-center gap-1 shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Alvos de Privação ou Insegurança ({severeLackItems.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {severeLackItems.slice(0, 7).map((item) => (
                    <span 
                      key={item.id} 
                      className="bg-rose-950/40 border border-rose-900/30 text-[10px] text-rose-300 px-2.5 py-0.5 rounded-full"
                    >
                      {item.statement.replace("Me senti ", "").replace("Senti que ", "")}
                    </span>
                  ))}
                  {severeLackItems.length > 7 && (
                    <span className="text-[9px] text-gray-500 font-mono">+{severeLackItems.length - 7} adicionais</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FILLING ACTIONS WIDGET */}
          <div className="bg-gray-950 border border-gray-850 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">Respostas Rápidas / Limpar:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillAllWith("N")}
                className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 rounded font-mono text-[9px] transition"
              >
                Tudo N (Nada)
              </button>
              <button
                type="button"
                onClick={() => fillAllWith("P")}
                className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 rounded font-mono text-[9px] transition"
              >
                Tudo P (Pouco)
              </button>
              <button
                type="button"
                onClick={() => fillAllWith("M")}
                className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 rounded font-mono text-[9px] transition"
              >
                Tudo M (Muito)
              </button>
              <button
                type="button"
                onClick={() => fillAllWith("S")}
                className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 rounded font-mono text-[9px] transition"
              >
                Tudo S (Sempre)
              </button>
              <button
                type="button"
                onClick={() => {
                  setState(prev => ({ ...prev, ratings: {} }));
                }}
                className="px-2.5 py-1 bg-rose-950/20 hover:bg-rose-900 text-rose-400 border border-rose-950 rounded font-mono text-[9px] transition"
              >
                Limpar Grade
              </button>
            </div>
          </div>

          {/* MAIN GRID ASSESSMENT OF SENTIMENTS */}
          <div className="bg-gray-950 border border-gray-850 rounded-xl overflow-hidden shadow-xl" id="pe-main-items-table">
            <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-300">
                Grade de Respostas (Classificação Vitalícia)
              </h3>
              <div className="flex gap-4 font-mono text-[10px] text-gray-400">
                <span><b>N</b> = Nada</span>
                <span><b>P</b> = Pouco</span>
                <span><b>M</b> = Muito</span>
                <span><b>S</b> = Sempre</span>
              </div>
            </div>

            <div className="divide-y divide-gray-900">
              {emotionalProvisionItems.map((item, idx) => {
                const currentVal = state.ratings[item.id] || "";
                return (
                  <div 
                    key={item.id} 
                    className={`px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition duration-150 ${
                      currentVal === "N" 
                        ? "bg-rose-950/5 hover:bg-rose-950/10" 
                        : currentVal === "S" 
                          ? "bg-emerald-950/5 hover:bg-emerald-950/10" 
                          : "hover:bg-gray-900/40"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-gray-500 text-[10px] w-5 shrink-0 text-right pt-0.5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <span className="font-bold text-gray-200 leading-normal">{item.statement}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                            item.category === "SAC" 
                              ? "bg-rose-950/40 text-rose-400 border border-rose-900/20" 
                              : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20"
                          }`}>
                            {item.category === "SAC" ? "Aceitação & Conexão" : "Autonomia & Valorização"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE BUTTON CHANGER SCALE */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {(["N", "P", "M", "S"] as const).map((opt) => {
                        const active = currentVal === opt;
                        let colorClass = "bg-gray-900 text-gray-400 hover:bg-gray-800 border-gray-800";
                        if (active) {
                          if (opt === "N") colorClass = "bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30";
                          else if (opt === "P") colorClass = "bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30";
                          else if (opt === "M") colorClass = "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30";
                          else if (opt === "S") colorClass = "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30";
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleRatingChange(item.id, opt)}
                            className={`w-9 h-9 rounded-lg border font-mono font-bold text-xs flex items-center justify-center transition-all ${colorClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* REMEDIAL PRESENT-DAY ACTIONS SYSTEM - KEY INPUT INSIGHTS FROM THE VIDEO SCREEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="pe-present-actions-row">
            
            <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl space-y-3 shadow-xl">
              <label className="block text-xs text-indigo-400 font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Atitudes Facilitadoras no Presente:</span>
              </label>
              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                Quais atitudes de autocompensação sadia ou engajamento social o paciente pode tomar hoje para elevar com ética e segurança a frequência dessas provisões em seus relacionamentos?
              </p>
              <textarea
                rows={4}
                value={state.facilitatingBehaviors}
                onChange={(e) => setState(prev => ({ ...prev, facilitatingBehaviors: e.target.value }))}
                placeholder="Ex:\n1. Compartilhar voluntariamente fragilidades com amigos qualificados...\n2. Pedir ajuda deliberada em pequenas tarefas diárias..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-[#d1d5db] focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                id="pe-facilitating-actions"
              />
            </div>

            <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl space-y-3 shadow-xl">
              <label className="block text-xs text-rose-400 font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Atitudes Bloqueadoras no Presente:</span>
              </label>
              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                Quais comportamentos desadaptativos automáticos, passividades, isolamentos ou reações esquemáticas repetitivas estão dificultando ou atrapalhando a absorção de provisão hoje?
              </p>
              <textarea
                rows={4}
                value={state.blockingBehaviors}
                onChange={(e) => setState(prev => ({ ...prev, blockingBehaviors: e.target.value }))}
                placeholder="Ex:\n1. Isolar-se socialmente ao primeiro sinal de estresse conjugal...\n2. Adotar orgulho intelectual arrogante que afasta pessoas calorosas..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-[#d1d5db] focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                id="pe-blocking-actions"
              />
            </div>

          </div>

          {/* CLINICAL SUMMARY NOTES */}
          <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl space-y-3">
            <label className="block text-xs text-[#00A3FF] font-mono uppercase tracking-widest font-bold">
              Discussão Diagnóstica, Reparação Afetiva e Formulação de Caso:
            </label>
            <p className="text-[10px] text-gray-500 italic">
              Conecte os dados acima com a infância e adolescência (origem transgeracional, cuidadores) e a formação de esquemas desadaptativos (abandono, defeituosidade, privação emocional).
            </p>
            <textarea
              rows={4}
              value={state.clinicalNotes}
              onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              placeholder="Digite o parecer clínico do terapeuta..."
              className="w-full px-3 py-3 bg-gray-900/60 border border-gray-800 rounded-lg text-xs text-[#d1d5db] focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              id="pe-clinical-notes"
            />
          </div>

        </div>
      ) : (
        /* FACSIMILE BLACK-AND-WHITE SHEET DESIGNED STRICITY TO PDF screenshot */
        <div id="facsimile-pe-view" className="bg-slate-900 p-6 rounded-xl flex justify-center">
          
          <div className="bg-white text-black p-8 shadow-2xl rounded-sm w-full max-w-[850px] border border-gray-300 relative min-h-[1120px] font-sans flex flex-col justify-between">
            <div>
              {/* ACCORDING TO DOUBLE BORDER SHOWN IN ALL OFFICIAL PDFs */}
              <div className="absolute inset-2 border-2 border-double border-black pointer-events-none" />

              {/* SHEET TITLE */}
              <div className="text-center py-6 border-b border-black mb-5">
                <h2 className="text-xl font-bold tracking-widest uppercase leading-none font-sans" style={{ letterSpacing: "0.15em" }}>
                  Exame Histórico da Provisão Emocional
                </h2>
              </div>

              {/* USER / CARE LABELS FORM */}
              <div className="grid grid-cols-3 gap-y-2 text-xs border border-black p-4 mb-5">
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Paciente:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5 uppercase tracking-wide text-black">
                    {patient.name || "NÃO INDICADO"}
                  </div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Data:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">07/06/2026</div>
                </div>
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Profissional:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5">Dr(a). Lincoln Poubel</div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block">CRP:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">05 / 48392-RJ</div>
                </div>
              </div>

              {/* PRINT GRAPHIC BANNER */}
              <div className="border border-black bg-gray-50 px-4 py-4 mb-5 text-center leading-relaxed">
                <h4 className="font-bold uppercase tracking-wider text-[11px] mb-2">Instruções para Classificação:</h4>
                <p className="text-[11px] font-sans text-gray-700 italic">
                  Classifique os sentimentos abaixo quanto à frequência com que os experimentou nos relacionamentos ao longo da vida.
                </p>
                <div className="flex justify-center gap-6 mt-3 font-mono text-[11px] font-bold border-t border-black/10 pt-2 shrink-0">
                  <span>N = Nada</span>
                  <span>P = Pouco</span>
                  <span>M = Muito</span>
                  <span>S = Sempre</span>
                </div>
              </div>

              {/* SCORE BOARD GRAPH FOR PRINT */}
              <div className="grid grid-cols-3 gap-2 text-center border-x border-t border-black bg-black/[0.03] py-2 text-[10.5px] font-mono uppercase tracking-wider">
                <div><b>PROVISÃO GLOBAL (IPEG):</b> {ipegScore}%</div>
                <div><b>ACEITAÇÃO-CONEXÃO (SAC):</b> {sacScore}%</div>
                <div><b>AUTONOMIA-VALOR (SAV):</b> {savScore}%</div>
              </div>

              {/* TABLE ACCORDING TO PDF LAYOUT */}
              <table className="w-full border border-black text-xs leading-normal">
                <thead>
                  <tr className="bg-black/5 font-bold uppercase tracking-wider text-[10px] text-center border-b border-black">
                    <th className="py-2.5 px-3 text-left w-12 border-r border-black">Item</th>
                    <th className="py-2.5 px-3 text-left border-r border-black">Sentimento Avaliado ao Longo de Sua Vida</th>
                    <th className="py-2.5 px-1 w-10 border-r border-black">N</th>
                    <th className="py-2.5 px-1 w-10 border-r border-black">P</th>
                    <th className="py-2.5 px-1 w-10 border-r border-black">M</th>
                    <th className="py-2.5 px-1 w-10">S</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {emotionalProvisionItems.map((item, idx) => {
                    const ans = state.ratings[item.id] || "";
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="py-1.5 px-3 text-center border-r border-black font-mono font-bold text-gray-600 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3 border-r border-black font-semibold text-[11.5px] text-black">
                          {item.statement}
                        </td>
                        <td className="py-1.5 text-center border-r border-black font-mono font-bold text-sm">
                          {ans === "N" ? "●" : ""}
                        </td>
                        <td className="py-1.5 text-center border-r border-black font-mono font-bold text-sm">
                          {ans === "P" ? "●" : ""}
                        </td>
                        <td className="py-1.5 text-center border-r border-black font-mono font-bold text-sm">
                          {ans === "M" ? "●" : ""}
                        </td>
                        <td className="py-1.5 text-center font-mono font-bold text-sm">
                          {ans === "S" ? "●" : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ATITUDES REPARADORAS FACSIMILE BANNER */}
              {(state.facilitatingBehaviors || state.blockingBehaviors) && (
                <div className="mt-5 grid grid-cols-2 gap-4 border border-black p-4 bg-gray-50 text-xs">
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px] mb-1">Comportamentos Reparadores Facilitantes:</span>
                    <p className="font-sans text-[11px] text-black whitespace-pre-wrap">{state.facilitatingBehaviors || "Nenhum mapeado."}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px] mb-1 text-rose-900">Comportamentos Esquêmicos Bloqueadores:</span>
                    <p className="font-sans text-[11px] text-black whitespace-pre-wrap">{state.blockingBehaviors || "Nenhum mapeado."}</p>
                  </div>
                </div>
              )}

              {/* FOOT NOTES FOR SHEET PRINT OUT */}
              {state.clinicalNotes && (
                <div className="mt-4 border border-black p-4 bg-white text-xs leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block text-[10px] mb-1">Parecer Clínico e Síntese de Formulação de Caso:</span>
                  <p className="font-sans text-[11.5px] text-black whitespace-pre-wrap">{state.clinicalNotes}</p>
                </div>
              )}

            </div>

            {/* CREDITS FOOTER BRAND */}
            <div className="mt-6 pt-3 border-t border-gray-300 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Protocolo de Habilidades Psicológicas (THP) v4 • Análise da História Afetiva</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-750">Inteligência Psicológica</span>
                <span>•</span>
                <span>CRM-CBT</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
