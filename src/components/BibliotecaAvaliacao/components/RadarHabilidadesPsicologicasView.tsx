import React, { useState } from "react";
import { PatientInfo } from "../types";
import { getRadarArcPath } from "./RadarMultidimensionalView";

export const HAP_SUBSCALE_METADATA: Array<{
  id: string;
  label: string;
  colorClass: string;
  fillColorActive: string;
  fillColorEmpty: string;
  description: string;
  psychoeducation: string;
}> = [
  { 
    id: "autoconhecimento", 
    label: "Autoconhecimento", 
    colorClass: "text-[#00A3FF]", 
    fillColorActive: "rgba(0, 163, 255, 0.75)", 
    fillColorEmpty: "rgba(0, 163, 255, 0.08)",
    description: "Identificação de gatilhos, carências, sentimentos e histórico de padrões.",
    psychoeducation: "O quanto você identifica conscientemente seus gatilhos emocionais, suas carências, seus sentimentos, suas reações e as origens de seus padrões comportamentais habituais."
  },
  { 
    id: "autoestima", 
    label: "Autoestima", 
    colorClass: "text-indigo-400", 
    fillColorActive: "rgba(129, 140, 248, 0.75)", 
    fillColorEmpty: "rgba(129, 140, 248, 0.08)",
    description: "Satisfação e valorização de atributos físicos, personalidade e competências.",
    psychoeducation: "Refere-se à sua satisfação geral com quem você é. Abrange atributos físicos, autocuidado, saúde, virtudes, personalidade e inteligência."
  },
  { 
    id: "racionalidade", 
    label: "Racionalidade", 
    colorClass: "text-purple-400", 
    fillColorActive: "rgba(192, 132, 252, 0.75)", 
    fillColorEmpty: "rgba(192, 132, 252, 0.08)",
    description: "Detecção e reestruturação de crenças limitantes e distorções cognitivas.",
    psychoeducation: "Sua habilidade de analisar fatos de forma lógica e objetiva, detectando crenças automáticas enviesadas ou distorções da realidade que provocam sofrimento infundado."
  },
  { 
    id: "regulacao_emocional", 
    label: "Regulação Emocional", 
    colorClass: "text-pink-400", 
    fillColorActive: "rgba(244, 114, 182, 0.75)", 
    fillColorEmpty: "rgba(244, 114, 182, 0.08)",
    description: "Acalmar-se ativamente, tolerar sofrimento e decidir condutas construtivas.",
    psychoeducation: "Sua aptidão de aceitar, tolerar e modular sentimentos ruins ou intensos, permitindo tomar decisões conscientes sob forte descarga afetiva."
  },
  { 
    id: "enfrentamento", 
    label: "Enfrentamento", 
    colorClass: "text-rose-400", 
    fillColorActive: "rgba(251, 113, 133, 0.75)", 
    fillColorEmpty: "rgba(251, 113, 133, 0.08)",
    description: "Resolução proativa de problemas, exposição a medos e ação em adversidades.",
    psychoeducation: "Ações direcionadas a solucionar problemas reais, expor-se voluntariamente aos medos, assumir rédeas e fazer escolhas difíceis sob pressão."
  },
  { 
    id: "imunidade_social", 
    label: "Imunidade Social", 
    colorClass: "text-red-400", 
    fillColorActive: "rgba(248, 113, 113, 0.75)", 
    fillColorEmpty: "rgba(248, 113, 113, 0.08)",
    description: "Independência de aprovação externa constante e de críticas desconstrutivas.",
    psychoeducation: "Sua blindagem saudável contra desaprovações infundadas ou fofocas, focando em convicções saudáveis e desconsiderando ativamente ruídos sociais alheios."
  },
  { 
    id: "autocontrole", 
    label: "Autocontrole", 
    colorClass: "text-amber-400", 
    fillColorActive: "rgba(251, 191, 36, 0.75)", 
    fillColorEmpty: "rgba(251, 191, 36, 0.08)",
    description: "Diferimento de recompensas imediatas e manutenção ativa da disciplina de metas.",
    psychoeducation: "A habilidade de orientar ações a metas de longo prazo, contendo impulsos destrutivos ou imediatistas em prol do autocuidado e de rotinas organizadas."
  },
  { 
    id: "sociabilidade", 
    label: "Sociabilidade", 
    colorClass: "text-orange-400", 
    fillColorActive: "rgba(251, 146, 60, 0.75)", 
    fillColorEmpty: "rgba(251, 146, 60, 0.08)",
    description: "Iniciação de contatos, manutenção de laços e expressão clara de limites.",
    psychoeducation: "Capacidade de se conectar de maneira leve e confiante com novas pessoas, manter amizades saudáveis e demarcar seus direitos de forma assertiva."
  },
  { 
    id: "sensibilidade", 
    label: "Sensibilidade", 
    colorClass: "text-emerald-400", 
    fillColorActive: "rgba(52, 211, 153, 0.75)", 
    fillColorEmpty: "rgba(52, 211, 153, 0.08)",
    description: "Empatia compassiva saudável e acolhimento das próprias vulnerabilidades.",
    psychoeducation: "Sua aptidão para ouvir, exercer empatia com a dor do outro (sem absorvê-la destrutivamente) e praticar a autocompaixão por suas falhas e limites."
  },
  { 
    id: "hedonismo", 
    label: "Hedonismo", 
    colorClass: "text-teal-400", 
    fillColorActive: "rgba(45, 212, 191, 0.75)", 
    fillColorEmpty: "rgba(45, 212, 191, 0.08)",
    description: "Saborear momentos, repousar, rir e vivenciar alegrias livres de culpa.",
    psychoeducation: "Capacidade de se conceder repouso reparador, saborear pequenos deleites cotidianos, rir de si mesmo e relaxar em passatempos prazerosos de forma saudável."
  }
];

interface RadarHabilidadesPsicologicasViewProps {
  patient: PatientInfo;
  skillsRadarSubscales: Record<string, number>;
  setSkillsRadarSubscales: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  totalScore: number;
}

export default function RadarHabilidadesPsicologicasView({
  patient,
  skillsRadarSubscales,
  setSkillsRadarSubscales,
  totalScore
}: RadarHabilidadesPsicologicasViewProps) {
  
  const [hoveredSubscale, setHoveredSubscale] = useState<string | null>(null);

  const updateSubscale = (subscaleId: string, value: number) => {
    setSkillsRadarSubscales(prev => ({
      ...prev,
      [subscaleId]: value
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="radar-hap-root">
      
      {/* Informational Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-300 space-y-1 block" id="radar-hap-info-banner">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">🧠 RADAR DE HABILIDADES PSICOLÓGICAS (THP)</strong>
        <span className="text-gray-400">
          Esta escala de auto-informe avalia as 10 macro-habilidades do método de Treinamento de Habilidades Psicológicas. 
          Você pode psicoeducar seu cliente em cada uma destas esferas e orientá-lo a classificar sua própria destreza de 1 a 10. 
          Use o <strong>Radar Polar Interativo</strong> clicando diretamente nos anéis concêntricos ou ajuste os sliders ao lado para identificar lacunas que guiarão o projeto terapêutico.
        </span>
      </div>

      {/* Visual Header Facilitator */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="radar-hap-facilitator">
        <div>
          <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Anônimo"}</span>
        </div>
        <div>
          <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Profissional Responsável</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Dr. Lincoln Poubel</div>
        </div>
        <div>
          <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">CRP / Inscrição</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">CRP 04/99124-MG</div>
        </div>
      </div>

      {/* Dual Column Layout */}
      <div className="flex flex-col xl:flex-row gap-6" id="radar-hap-columns">
        
        {/* Left Interactive SVG Chart */}
        <div className="xl:w-[460px] shrink-0 bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col items-center relative shadow-[0_4px_25px_rgba(0,0,0,0.5)]" id="radar-hap-svg-card">
          <div className="text-center mb-4 border-b border-gray-900 pb-3 w-full">
            <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-emerald-400">Mapeamento Polar de HPs</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Defina o nível de 1 a 10 tocando em cada segmento concêntrico</p>
          </div>

          <div className="relative w-full max-w-[370px] aspect-square flex items-center justify-center select-none" id="radar-hap-svg-canvas">
            <svg viewBox="0 0 420 420" className="w-full h-full">
              {/* Polar help circles (Rings 1 to 10) */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ring) => (
                <circle
                  key={ring}
                  cx={210}
                  cy={210}
                  r={45 + ring * 12.5}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth={0.75}
                  strokeDasharray={ring % 5 === 0 ? "none" : "2,3"}
                />
              ))}

              {/* Slices for the 10 subscales (36 degrees each) */}
              {HAP_SUBSCALE_METADATA.map((sub, s) => {
                const val = skillsRadarSubscales[sub.id] || 0;
                // Offset start angle to align Autoconhecimento perfectly at the top center (-90 degrees is straight UP)
                // Offset by -18 degrees to center the top slice (Autoconhecimento)
                const startAngle = -90 - 18 + s * 36;
                const endAngle = -90 - 18 + (s + 1) * 36;

                return (
                  <g key={sub.id} id={`hap-g-${sub.id}`}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((L) => {
                      const r_in = 45 + (L - 1) * 12.5;
                      const r_out = 45 + L * 12.5;
                      const path = getRadarArcPath(210, 210, r_in, r_out, startAngle, endAngle);
                      const isActive = val >= L;

                      return (
                        <path
                          key={L}
                          d={path}
                          fill={isActive ? sub.fillColorActive : sub.fillColorEmpty}
                          stroke="rgba(0, 0, 0, 0.28)"
                          strokeWidth={0.5}
                          onClick={() => updateSubscale(sub.id, L)}
                          onMouseEnter={() => setHoveredSubscale(sub.id)}
                          onMouseLeave={() => setHoveredSubscale(null)}
                          className="cursor-pointer transition-all duration-150 hover:brightness-135 hover:stroke-emerald-400/30"
                          id={`hap-seg-${sub.id}-${L}`}
                        >
                          <title>{`${sub.label}: Nível ${L}`}</title>
                        </path>
                      );
                    })}

                    {/* Radial divider lines */}
                    {(() => {
                      const startRad = (startAngle * Math.PI) / 180;
                      const x1 = 210 + 45 * Math.cos(startRad);
                      const y1 = 210 + 45 * Math.sin(startRad);
                      const x2 = 210 + 172 * Math.cos(startRad);
                      const y2 = 210 + 172 * Math.sin(startRad);
                      return (
                        <line
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth={0.75}
                        />
                      );
                    })()}

                    {/* Outer label texts */}
                    {(() => {
                      const rad = (((startAngle + endAngle) / 2) * Math.PI) / 180;
                      const tx = 210 + 185 * Math.cos(rad);
                      const ty = 210 + 185 * Math.sin(rad);

                      let textAnchor = "middle";
                      if (Math.cos(rad) > 0.1) textAnchor = "start";
                      else if (Math.cos(rad) < -0.1) textAnchor = "end";

                      const isHovered = hoveredSubscale === sub.id;

                      return (
                        <text
                          x={tx}
                          y={ty}
                          dy="3"
                          textAnchor={textAnchor}
                          className={`font-mono text-[6.5px] font-bold select-none cursor-pointer uppercase transition-all duration-150 ${
                            isHovered ? "fill-white scale-105 font-black" : "fill-gray-400"
                          }`}
                          onClick={() => updateSubscale(sub.id, val === 10 ? 1 : val + 1)}
                          onMouseEnter={() => setHoveredSubscale(sub.id)}
                          onMouseLeave={() => setHoveredSubscale(null)}
                        >
                          {sub.label.replace("Regulação ", "Reg. ")}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Bold separator spoke rings or thick divider lines if any, for 10 slices we can just draw thin separator of wedges */}
              {Array.from({ length: 10 }).map((_, k) => {
                const angle = -90 - 18 + k * 36;
                const rad = (angle * Math.PI) / 180;
                const x1 = 210 + 45 * Math.cos(rad);
                const y1 = 210 + 45 * Math.sin(rad);
                const x2 = 210 + 172 * Math.cos(rad);
                const y2 = 210 + 172 * Math.sin(rad);
                return (
                  <line
                    key={k}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#111217"
                    strokeWidth={1.5}
                  />
                );
              })}

              {/* Center scoreboard display */}
              <circle
                cx={210}
                cy={210}
                r={45}
                fill="#0c0d10"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
              />
              <text
                x={210}
                y={204}
                textAnchor="middle"
                className="font-mono text-[9px] uppercase tracking-widest fill-gray-500 font-bold animate-pulse"
              >
                IAH
              </text>
              <text
                x={210}
                y={225}
                textAnchor="middle"
                className="font-sans text-xl font-extrabold fill-emerald-400"
              >
                {totalScore}%
              </text>
            </svg>
          </div>

          {/* Interactive psychoeducation descriptive card */}
          <div className="w-full mt-4 min-h-[110px] p-4 rounded-xl border border-gray-900 bg-gray-950/60 flex flex-col items-center justify-center transition-all duration-200">
            {(() => {
              const hoveredMeta = HAP_SUBSCALE_METADATA.find(m => m.id === hoveredSubscale);
              if (hoveredMeta) {
                const currentVal = skillsRadarSubscales[hoveredMeta.id] || 0;
                return (
                  <div className="animate-fadeIn space-y-1 text-center w-full">
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest font-mono font-bold block">Conceito Clínico</span>
                    <h4 className={`text-xs font-bold font-sans ${hoveredMeta.colorClass}`}>
                      {hoveredMeta.label}
                    </h4>
                    <p className="text-[10px] text-gray-300 leading-snug line-clamp-3">
                      {hoveredMeta.psychoeducation}
                    </p>
                    <div className="text-[9px] font-mono font-semibold pt-1 text-emerald-400">
                      Nível de Auto-reporte: <strong className="text-white font-extrabold">{currentVal} / 10</strong>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="text-gray-500 text-center italic text-[10px] max-w-[300px]">
                    Cole o cursor no gráfico circular ou clique nas fatias para abrir a psicoeducação e calibragem de cada Habilidade Psicológica!
                  </div>
                );
              }
            })()}
          </div>
        </div>

        {/* Right Slider controls panel */}
        <div className="flex-1 space-y-4" id="radar-hap-sliders">
          <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 flex flex-col space-y-3">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide font-sans">Ajuste de Repertório (HPs)</h4>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-gray-950 border border-gray-900 text-emerald-400">
                10 Competências THP
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-850 scrollbar-track-transparent">
              {HAP_SUBSCALE_METADATA.map((sub) => {
                const val = skillsRadarSubscales[sub.id] || 0;
                return (
                  <div 
                    key={sub.id} 
                    className="p-3 bg-gray-950/40 rounded-xl border border-gray-900/60 hover:border-gray-800 transition-all space-y-1.5"
                    onMouseEnter={() => setHoveredSubscale(sub.id)}
                    onMouseLeave={() => setHoveredSubscale(null)}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-200 font-medium">{sub.label}</span>
                      <span className={`font-mono font-bold ${sub.colorClass}`}>{val}/10</span>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-tight block line-clamp-1 h-3">{sub.description}</p>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={val}
                      onChange={(e) => updateSubscale(sub.id, parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-gray-900 pt-3 text-[10px] text-gray-500 italic block font-mono text-center">
              *Habilidades avaliadas abaixo do nível 6 sugerem inserção imediata no plano de ação de desenvolvimento psicológico do paciente.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
