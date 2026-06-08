import React from "react";
import { PatientInfo } from "../types";

interface MultidimSatisfactionViewProps {
  patient: PatientInfo;
  multidimSatisfaction: Record<string, { satisfaction: number; desfrute: string; pendente: string }>;
  setMultidimSatisfaction: React.Dispatch<React.SetStateAction<Record<string, { satisfaction: number; desfrute: string; pendente: string }>>>;
}

export default function MultidimSatisfactionView({
  patient,
  multidimSatisfaction,
  setMultidimSatisfaction
}: MultidimSatisfactionViewProps) {
  
  const dimensions = [
    {
      key: "pessoal",
      title: "1. Dimensão Pessoal",
      icon: "🧬",
      colorClass: "text-[#00A3FF]",
      bgClass: "hover:border-[#00A3FF]/20",
      pillClass: "bg-[#00A3FF]/10 text-[#00A3FF] border-[#00A3FF]/20",
      accent: "accent-[#00A3FF]",
      borderColor: "focus:border-[#00A3FF]/30",
      desfrutePlaceholder: "Ex: Prática regular de exercícios leves, autocuidado básico em dia...",
      pendentePlaceholder: "Ex: Melhorar qualidade do sono, marcar consulta médica preventiva..."
    },
    {
      key: "interpessoal",
      title: "2. Dimensão Interpessoal",
      icon: "👥",
      colorClass: "text-indigo-400",
      bgClass: "hover:border-indigo-500/20",
      pillClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      accent: "accent-indigo-500",
      borderColor: "focus:border-indigo-500/30",
      desfrutePlaceholder: "Ex: Relação harmoniosa em família, contatos presenciais regulares com amigos...",
      pendentePlaceholder: "Ex: Evitar conflitos recorrentes, investir em tempo de qualidade conjugal..."
    },
    {
      key: "ocupacional",
      title: "3. Dimensão Ocupacional",
      icon: "💼",
      colorClass: "text-purple-400",
      bgClass: "hover:border-purple-500/20",
      pillClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      accent: "accent-purple-500",
      borderColor: "focus:border-purple-500/30",
      desfrutePlaceholder: "Ex: Trabalho estável, reconhecimento profissional e responsabilidade...",
      pendentePlaceholder: "Ex: Concluir curso técnico em aberto, planejar transição profissional..."
    },
    {
      key: "material",
      title: "4. Dimensão Material",
      icon: "💰",
      colorClass: "text-emerald-400",
      bgClass: "hover:border-emerald-500/20",
      pillClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      accent: "accent-emerald-500",
      borderColor: "focus:border-emerald-500/30",
      desfrutePlaceholder: "Ex: Renda mensal de acordo com as contas fundamentais, conforto em moradia...",
      pendentePlaceholder: "Ex: Formar reserva financeira de amortecimento, quitar pendências..."
    },
    {
      key: "recreativa",
      title: "5. Dimensão Recreativa",
      icon: "🎮",
      colorClass: "text-amber-400",
      bgClass: "hover:border-amber-500/20",
      pillClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accent: "accent-amber-500",
      borderColor: "focus:border-amber-500/30",
      desfrutePlaceholder: "Ex: Tempo de lazer assistindo a mídias, leituras descompromissadas...",
      pendentePlaceholder: "Ex: Retomar hobbies de pintura/artesanal, planejar férias..."
    },
    {
      key: "existencial",
      title: "6. Dimensão Existencial",
      icon: "🌌",
      colorClass: "text-rose-400",
      bgClass: "hover:border-rose-500/20",
      pillClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      accent: "accent-rose-500",
      borderColor: "focus:border-rose-500/30",
      desfrutePlaceholder: "Ex: Sentimento ético nas ações diárias, apoio a pessoas próximas...",
      pendentePlaceholder: "Ex: Clarificar valores pessoais de longo prazo, iniciar prática reflexiva..."
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="multidim-satisfaction-view">
      
      {/* Informational banner */}
      <div className="bg-[#00A3FF]/15 border border-[#00A3FF]/30 p-4 rounded-xl text-xs text-blue-300 space-y-1 block" id="multidim-satisfaction-instruction">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">📐 ANÁLISE DA SATISFAÇÃO MULTIDIMENSIONAL</strong>
        <span className="text-gray-400">Uma ferramenta clínica e terapêutica para mapear o nível de bem-estar nas 6 grandes dimensões da vida: Pessoal, Interpessoal, Ocupacional, Material, Recreativa e Existencial. Ajuste os sliders de satisfação de 1 a 10 e registre os ativos (investimentos correntes) e pendências para guiar as intervenções e metas terapêuticas.</span>
      </div>

      {/* Visual PDF header facsimile */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="multidim-header-facsimile">
        <div>
          <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Paciente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Anônimo"}</span>
        </div>
        <div>
          <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Profissional Avaliador</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Dr. Lincoln Poubel</div>
        </div>
        <div>
          <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">CRP / Registro</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">CRP 04/99124-MG</div>
        </div>
      </div>

      {/* Bento Grid layout with 6 main dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="multidim-dimension-bento-grid">
        {dimensions.map((dim) => {
          const stateData = multidimSatisfaction[dim.key] || { satisfaction: 5, desfrute: "", pendente: "" };
          
          return (
            <div 
              key={dim.key} 
              className={`bg-[#111217] border border-gray-900 ${dim.bgClass} rounded-xl p-5 transition-all flex flex-col space-y-4`} 
              id={`bento-dim-${dim.key}`}
            >
              <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{dim.icon}</span>
                  <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide font-sans">{dim.title}</h4>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${dim.pillClass}`}>
                  {stateData.satisfaction * 10}%
                </span>
              </div>

              {/* Slider controls */}
              <div className="space-y-1.5 bg-gray-950/60 p-2.5 rounded-lg border border-gray-900">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">Satisfeito</span>
                  <span className={`font-mono ${dim.colorClass} font-bold`}>{stateData.satisfaction} / 10</span>
                </div>
                <input
                  type="range" min="1" max="10" step="1"
                  value={stateData.satisfaction}
                  onChange={(e) => {
                    const copy = { ...multidimSatisfaction };
                    copy[dim.key] = {
                      ...stateData,
                      satisfaction: parseInt(e.target.value)
                    };
                    setMultidimSatisfaction(copy);
                  }}
                  className={`w-full ${dim.accent} h-1 bg-gray-900 rounded appearance-none cursor-pointer`}
                />
              </div>

              {/* Descriptive fields */}
              <div className="space-y-3 flex-grow">
                <div className="space-y-1">
                  <label className={`text-[9px] ${dim.colorClass} font-mono font-bold uppercase tracking-wider block`}>🟢 Investimento / Desfrute (Ativos)</label>
                  <textarea
                    rows={2}
                    placeholder={dim.desfrutePlaceholder}
                    value={stateData.desfrute}
                    onChange={(e) => {
                      const copy = { ...multidimSatisfaction };
                      copy[dim.key] = {
                        ...stateData,
                        desfrute: e.target.value
                      };
                      setMultidimSatisfaction(copy);
                    }}
                    className={`w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none ${dim.borderColor} resize-none font-sans`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider block">🔴 Coisas Pendentes / Metas</label>
                  <textarea
                    rows={2}
                    placeholder={dim.pendentePlaceholder}
                    value={stateData.pendente}
                    onChange={(e) => {
                      const copy = { ...multidimSatisfaction };
                      copy[dim.key] = {
                        ...stateData,
                        pendente: e.target.value
                      };
                      setMultidimSatisfaction(copy);
                    }}
                    className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-red-500/30 resize-none font-sans"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
