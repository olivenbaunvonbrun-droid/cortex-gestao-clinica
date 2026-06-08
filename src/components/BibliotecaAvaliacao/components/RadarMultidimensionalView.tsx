import React, { useState } from "react";
import { PatientInfo } from "../types";

export const SUBSCALE_METADATA: Array<{
  id: string;
  label: string;
  group: 'pessoal' | 'interpessoal' | 'ocupacional' | 'material' | 'recreativa' | 'existencial';
  groupLabel: string;
  colorClass: string;
  fillColorActive: string;
  fillColorEmpty: string;
}> = [
  // PESSOAL
  { id: "valor_pessoal", label: "Valor Pessoal", group: "pessoal", groupLabel: "Pessoal", colorClass: "text-[#00A3FF]", fillColorActive: "rgba(0, 163, 255, 0.75)", fillColorEmpty: "rgba(0, 163, 255, 0.08)" },
  { id: "saude", label: "Saúde", group: "pessoal", groupLabel: "Pessoal", colorClass: "text-[#00A3FF]", fillColorActive: "rgba(0, 163, 255, 0.75)", fillColorEmpty: "rgba(0, 163, 255, 0.08)" },
  { id: "autocuidado", label: "Autocuidado", group: "pessoal", groupLabel: "Pessoal", colorClass: "text-[#00A3FF]", fillColorActive: "rgba(0, 163, 255, 0.75)", fillColorEmpty: "rgba(0, 163, 255, 0.08)" },
  // INTERPESSOAL
  { id: "amizade", label: "Amizade", group: "interpessoal", groupLabel: "Interpessoal", colorClass: "text-indigo-400", fillColorActive: "rgba(129, 140, 248, 0.75)", fillColorEmpty: "rgba(129, 140, 248, 0.08)" },
  { id: "familia", label: "Família", group: "interpessoal", groupLabel: "Interpessoal", colorClass: "text-indigo-400", fillColorActive: "rgba(129, 140, 248, 0.75)", fillColorEmpty: "rgba(129, 140, 248, 0.08)" },
  { id: "intimidade", label: "Intimidade", group: "interpessoal", groupLabel: "Interpessoal", colorClass: "text-indigo-400", fillColorActive: "rgba(129, 140, 248, 0.75)", fillColorEmpty: "rgba(129, 140, 248, 0.08)" },
  // OCUPACIONAL
  { id: "estudo", label: "Estudo", group: "ocupacional", groupLabel: "Ocupacional", colorClass: "text-purple-400", fillColorActive: "rgba(192, 132, 252, 0.75)", fillColorEmpty: "rgba(192, 132, 252, 0.08)" },
  { id: "trabalho", label: "Trabalho", group: "ocupacional", groupLabel: "Ocupacional", colorClass: "text-purple-400", fillColorActive: "rgba(192, 132, 252, 0.75)", fillColorEmpty: "rgba(192, 132, 252, 0.08)" },
  { id: "conquistas", label: "Conquistas", group: "ocupacional", groupLabel: "Ocupacional", colorClass: "text-purple-400", fillColorActive: "rgba(192, 132, 252, 0.75)", fillColorEmpty: "rgba(192, 132, 252, 0.08)" },
  // MATERIAL
  { id: "indep_financ", label: "Independência Financeira", group: "material", groupLabel: "Material", colorClass: "text-emerald-400", fillColorActive: "rgba(52, 211, 153, 0.75)", fillColorEmpty: "rgba(52, 211, 153, 0.08)" },
  { id: "patrimonio", label: "Patrimônio", group: "material", groupLabel: "Material", colorClass: "text-emerald-400", fillColorActive: "rgba(52, 211, 153, 0.75)", fillColorEmpty: "rgba(52, 211, 153, 0.08)" },
  { id: "qualidade_vida", label: "Qualidade de Vida", group: "material", groupLabel: "Material", colorClass: "text-emerald-400", fillColorActive: "rgba(52, 211, 153, 0.75)", fillColorEmpty: "rgba(52, 211, 153, 0.08)" },
  // RECREATIVA
  { id: "lazer", label: "Lazer", group: "recreativa", groupLabel: "Recreativa", colorClass: "text-amber-400", fillColorActive: "rgba(251, 191, 36, 0.75)", fillColorEmpty: "rgba(251, 191, 36, 0.08)" },
  { id: "hobbies", label: "Hobbies", group: "recreativa", groupLabel: "Recreativa", colorClass: "text-amber-400", fillColorActive: "rgba(251, 191, 36, 0.75)", fillColorEmpty: "rgba(251, 191, 36, 0.08)" },
  { id: "passatempo", label: "Passatempo", group: "recreativa", groupLabel: "Recreativa", colorClass: "text-amber-400", fillColorActive: "rgba(251, 191, 36, 0.75)", fillColorEmpty: "rgba(251, 191, 36, 0.08)" },
  // EXISTENCIAL
  { id: "metas_vida", label: "Metas de Vida", group: "existencial", groupLabel: "Existencial", colorClass: "text-rose-400", fillColorActive: "rgba(251, 113, 133, 0.75)", fillColorEmpty: "rgba(251, 113, 133, 0.08)" },
  { id: "espiritualidade", label: "Espiritualidade", group: "existencial", groupLabel: "Existencial", colorClass: "text-rose-400", fillColorActive: "rgba(251, 113, 133, 0.75)", fillColorEmpty: "rgba(251, 113, 133, 0.08)" },
  { id: "ativismo_ideol", label: "Ativismo Ideológico", group: "existencial", groupLabel: "Existencial", colorClass: "text-rose-400", fillColorActive: "rgba(251, 113, 133, 0.75)", fillColorEmpty: "rgba(251, 113, 133, 0.08)" }
];

export function getRadarArcPath(cx: number, cy: number, r_in: number, r_out: number, startAngleDeg: number, endAngleDeg: number) {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const x1_in = cx + r_in * Math.cos(startRad);
  const y1_in = cy + r_in * Math.sin(startRad);
  const x1_out = cx + r_out * Math.cos(startRad);
  const y1_out = cy + r_out * Math.sin(startRad);
  
  const x2_in = cx + r_in * Math.cos(endRad);
  const y2_in = cy + r_in * Math.sin(endRad);
  const x2_out = cx + r_out * Math.cos(endRad);
  const y2_out = cy + r_out * Math.sin(endRad);

  const largeArcFlag = Math.abs(endAngleDeg - startAngleDeg) > 180 ? 1 : 0;
  
  return `M ${x1_in} ${y1_in} L ${x1_out} ${y1_out} A ${r_out} ${r_out} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${r_in} ${r_in} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in} Z`;
}

interface RadarMultidimensionalViewProps {
  patient: PatientInfo;
  radarSubscales: Record<string, number>;
  setRadarSubscales: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  totalScore: number;
}

export default function RadarMultidimensionalView({
  patient,
  radarSubscales,
  setRadarSubscales,
  totalScore
}: RadarMultidimensionalViewProps) {
  
  const [hoveredSubscale, setHoveredSubscale] = useState<string | null>(null);

  const updateRadarSubscale = (subscaleId: string, value: number) => {
    setRadarSubscales(prev => ({
      ...prev,
      [subscaleId]: value
    }));
  };

  const groups = [
    {
      id: "pessoal",
      label: "1. Esfera Pessoal",
      subIds: ["valor_pessoal", "saude", "autocuidado"],
      colorClass: "text-[#00A3FF]",
      bgClass: "hover:border-[#00A3FF]/20"
    },
    {
      id: "interpessoal",
      label: "2. Esfera Interpessoal",
      subIds: ["amizade", "familia", "intimidade"],
      colorClass: "text-indigo-400",
      bgClass: "hover:border-indigo-500/20"
    },
    {
      id: "ocupacional",
      label: "3. Esfera Ocupacional",
      subIds: ["estudo", "trabalho", "conquistas"],
      colorClass: "text-purple-400",
      bgClass: "hover:border-purple-500/20"
    },
    {
      id: "material",
      label: "4. Esfera Material",
      subIds: ["indep_financ", "patrimonio", "qualidade_vida"],
      colorClass: "text-emerald-400",
      bgClass: "hover:border-emerald-500/20"
    },
    {
      id: "recreativa",
      label: "5. Esfera Recreativa",
      subIds: ["lazer", "hobbies", "passatempo"],
      colorClass: "text-amber-400",
      bgClass: "hover:border-amber-500/20"
    },
    {
      id: "existencial",
      label: "6. Esfera Existencial",
      subIds: ["metas_vida", "espiritualidade", "ativismo_ideol"],
      colorClass: "text-rose-400",
      bgClass: "hover:border-rose-500/20"
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="radar-multidim-root-view">
      
      {/* Informational banner */}
      <div className="bg-[#00A3FF]/15 border border-[#00A3FF]/30 p-4 rounded-xl text-xs text-blue-300 space-y-1 block" id="radar-multidim-instruction">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">📐 RADAR MULTIDIMENSIONAL VITAIS</strong>
        <span className="text-gray-400">Uma ferramenta clínica de alto impacto gráfico para mapear 18 subescalas vitais de funcionamento. Use o <strong>Gráfico Radar Interativo</strong> tocando em cada anel de 1 a 10 ou arrastando os sliders à direita para traçar vulnerabilidades e potencialidades do paciente de forma imediata.</span>
      </div>

      {/* Visual PDF header facsimile */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="radar-header-facsimile">
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

      {/* TWO-COLUMN LAYOUT: LEFT RADAR, RIGHT ADJUSTERS */}
      <div className="flex flex-col xl:flex-row gap-6" id="radar-multidim-two-column-layout">
        
        {/* LEFT PANEL: POLAR RADAR SVG DIAGRAM CARD */}
        <div className="xl:w-[460px] shrink-0 bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col items-center relative shadow-[0_4px_25px_rgba(0,0,0,0.4)]" id="polar-radar-diagram-card">
          <div className="text-center mb-4 border-b border-gray-900 pb-3 w-full">
            <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-[#00A3FF]">Radar de Equilíbrio</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Clique diretamente nos círculos para colorir níveis de 1 a 10</p>
          </div>
          
          {/* Responsive SVG canvas wrapper */}
          <div className="relative w-full max-w-[370px] aspect-square flex items-center justify-center select-none" id="radar-svg-wrapper">
            <svg viewBox="0 0 420 420" className="w-full h-full">
              {/* Concentric helper circle rings (Levels 1 to 10) */}
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

              {/* 18 Subscale concentric wedges */}
              {SUBSCALE_METADATA.map((sub, s) => {
                const val = radarSubscales[sub.id] || 0;
                const startAngle = -90 + s * 20;
                const endAngle = -90 + (s + 1) * 20;

                return (
                  <g key={sub.id} id={`wedge-${sub.id}`}>
                    {/* Loop L from level 1 to 10 filled */}
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
                          stroke="rgba(0, 0, 0, 0.25)"
                          strokeWidth={0.5}
                          onClick={() => updateRadarSubscale(sub.id, L)}
                          onMouseEnter={() => setHoveredSubscale(sub.id)}
                          onMouseLeave={() => setHoveredSubscale(null)}
                          className="cursor-pointer transition-all duration-150 hover:brightness-135 hover:stroke-[#00A3FF]/30"
                          id={`segment-${sub.id}-${L}`}
                        >
                          <title>{`${sub.groupLabel} > ${sub.label}: Nível ${L}`}</title>
                        </path>
                      );
                    })}

                    {/* Radial borders separating individual slices */}
                    {(() => {
                      const startRad = (startAngle * Math.PI) / 180;
                      const x1 = 210 + 45 * Math.cos(startRad);
                      const y1 = 210 + 45 * Math.sin(startRad);
                      const x2 = 210 + 170 * Math.cos(startRad);
                      const y2 = 210 + 170 * Math.sin(startRad);
                      return (
                        <line
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth={0.75}
                        />
                      );
                    })()}

                    {/* Text Label centered outside the concentric slices */}
                    {(() => {
                      const rad = ((startAngle + 10) * Math.PI) / 180;
                      const tx = 210 + 184 * Math.cos(rad);
                      const ty = 210 + 184 * Math.sin(rad);
                      
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
                          className={`font-mono text-[7px] font-bold select-none cursor-pointer uppercase transition-all duration-150 ${
                            isHovered ? "fill-white font-black scale-105" : "fill-gray-400"
                          }`}
                          onClick={() => updateRadarSubscale(sub.id, val === 10 ? 1 : val + 1)}
                          onMouseEnter={() => setHoveredSubscale(sub.id)}
                          onMouseLeave={() => setHoveredSubscale(null)}
                        >
                          {sub.label.replace("Independência ", "Indep. ").replace("Espiritualidade", "Espirit.")}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}

              {/* 6 Thick radial separating borders dividing the 6 major dimensions */}
              {[-90, -30, 30, 90, 150, 210].map((angle, k) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = 210 + 45 * Math.cos(rad);
                const y1 = 210 + 45 * Math.sin(rad);
                const x2 = 210 + 178 * Math.cos(rad);
                const y2 = 210 + 178 * Math.sin(rad);
                return (
                  <line
                    key={k}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#111217"
                    strokeWidth={2.5}
                  />
                );
              })}

              {/* Center hole displays overall score */}
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
                className="font-mono text-[9px] uppercase tracking-widest fill-gray-500 font-bold"
              >
                IFR
              </text>
              <text
                x={210}
                y={224}
                textAnchor="middle"
                className="font-sans text-xl font-extrabold fill-[#00A3FF]"
              >
                {totalScore}%
              </text>
            </svg>
          </div>

          {/* Interactive hover detailing card */}
          <div className="w-full mt-4 min-h-[55px] p-3 rounded-lg border border-gray-900 bg-gray-950/60 font-mono text-[10px] text-center flex flex-col items-center justify-center transition-all">
            {(() => {
              const hoveredMeta = SUBSCALE_METADATA.find(m => m.id === hoveredSubscale);
              if (hoveredMeta) {
                const currentVal = radarSubscales[hoveredMeta.id] || 0;
                return (
                  <div className="animate-fadeIn">
                    <span className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Esfera: {hoveredMeta.groupLabel}</span>
                    <div className={`text-xs font-bold font-sans mt-0.5 ${hoveredMeta.colorClass}`}>
                      {hoveredMeta.label}
                    </div>
                    <div className="mt-1 text-gray-300">
                      Satisfação Atual: <strong className="text-white font-bold">{currentVal} de 10</strong>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="text-gray-500 italic max-w-[300px]">
                    Cole no círculo ou use os sliders ao lado para preencher a saúde de cada quadrante!
                  </div>
                );
              }
            })()}
          </div>
        </div>

        {/* RIGHT PANEL: 6 ESFERAS SLIDER CONTROLS */}
        <div className="flex-1 space-y-6" id="radar-esferas-adjustment-scroller">
          {groups.map((grp) => {
            // Find overall average for this group
            const sumGroup = grp.subIds.reduce((sum, sId) => sum + (radarSubscales[sId] || 0), 0);
            const avgGroup = Math.round((sumGroup / grp.subIds.length) * 10);
            
            return (
              <div 
                key={grp.id} 
                className={`bg-[#111217] border border-gray-900 rounded-xl p-5 ${grp.bgClass} transition-all flex flex-col space-y-3`}
                id={`radar-group-card-${grp.id}`}
              >
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide font-sans">{grp.label}</h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-gray-950 border border-gray-900 ${grp.colorClass}`}>
                    Nível Médio: {avgGroup}%
                  </span>
                </div>

                <div className="space-y-3 bg-gray-950/60 p-3 rounded-lg border border-gray-900/60">
                  {grp.subIds.map((sId) => {
                    const subMeta = SUBSCALE_METADATA.find(m => m.id === sId)!;
                    const val = radarSubscales[sId] || 0;
                    
                    return (
                      <div key={sId} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-300">{subMeta.label}</span>
                          <span className="font-mono text-[#00A3FF] font-bold">{val}/10</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={val}
                          onChange={(e) => updateRadarSubscale(sId, parseInt(e.target.value))}
                          className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
