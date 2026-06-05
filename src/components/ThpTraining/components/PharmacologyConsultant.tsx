import React, { useState } from "react";
import { Patient } from "../types";
import { 
  Dna, 
  Plus, 
  Trash2, 
  Activity, 
  TrendingDown, 
  Heart, 
  HelpCircle, 
  Info,
  Calendar,
  AlertTriangle,
  Award
} from "lucide-react";

interface PharmacologyConsultantProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

// Bulario National Database
const drugDatabase = {
  isrs: [
    {
      name: "Sertralina (Zoloft / Assert / Tolrest)",
      mechanism: "Inibidor Seletivo de Recaptação de Serotonina (ISRS). Bloqueia o transportador SERT, aumentando a serotonina disponível na fenda sináptica para recrutar autorreceptores 5-HT1A e reorganizar a fiação córtico-límbica a longo prazo.",
      doses: "50mg a 200mg diários.",
      target: "Circuito CSTC (Preocupação) e Amígdala hiperativa. Excelente para Ansiedade Social crônica.",
      colaterais: "Náuseas leves, boca seca, flutuação do sono e atraso ejaculatório inicial.",
      warnings: "Exige 2 a 4 semanas para desensibilizar receptores e expor os benefícios clínicos permanentes."
    },
    {
      name: "Escitalopram (Lexapro / Exodus / reconter)",
      mechanism: "ISRS altamente seletivo com afinidade alostérica secundária no SERT. É o mais puro bloqueador de recaptação de serotonina.",
      doses: "10mg a 20mg diários.",
      target: "Modulação límbica rápida. Baixo impacto em enzimas hepáticas, ideal para idosos e polifarmácia.",
      colaterais: "Cefaleia inicial, desconforto gástrico leve, bocejos e fadiga.",
      warnings: "Interrupção abrupta gera sintomas de descontinuação sutil (parestesias, desmame)."
    },
    {
      name: "Fluoxetina (Prozac / Daforin)",
      mechanism: "ISRS com bloqueio adicional leve do receptor 5-HT2C (que pode aumentar o alerta e energia nos primeiros dias).",
      doses: "20mg a 80mg diários.",
      target: "Labilidade comportamental agravada por depressão apática. Longa meia-vida ativa (até 9 dias).",
      colaterais: "Perda leve de peso inicial, agitação psicomotora leve ou ansiedade paradoxal inicial.",
      warnings: "Cuidado com aumento transitório de ansiedade ou impulsos motores no início do tratamento."
    }
  ],
  gaba: [
    {
      name: "Clonazepam (Rivotril)",
      mechanism: "Modulador Alostérico Positivo do Canal Iônico Cloro GABA-A. Aumenta a frequência de abertura do canal de Cloro induzido pelo GABA, hiperpolarizando os neurônios da Amígdala e inibindo descargas elétricas instantâneas de pânico.",
      doses: "0.25mg a 2mg diários s.o.s ou fracionados.",
      target: "Silenciamento imediato de picos de sofrimento somático visceral (sufocamento, taquicardia, tremores).",
      colaterais: "Sonolência, relaxamento muscular excessivo, perda sutil de memória de fixação.",
      warnings: "Alto potencial de dependência física e tolerância. Deve ser usado estritamente como ponte ou S.O.S."
    },
    {
      name: "Alprazolam (Frontal)",
      mechanism: "Benzodiazepínico de ação e absorção ultra-rápida. Altamente lipofílico.",
      doses: "0.25mg a 1mg por tomada.",
      target: "Ansiedade antecipatória aguda de curtíssimo fôlego.",
      colaterais: "Sedação imediata, pico de rebote ansioso quando a concentração plasmática decai rápido.",
      warnings: "Potencial abusivo acentuado devido à ação farmacológica em flash e alívio instantâneo."
    }
  ]
};

export default function PharmacologyConsultant({ patient, onUpdatePatient }: PharmacologyConsultantProps) {
  const [selectedCategory, setSelectedCategory] = useState<"isrs" | "gaba">("isrs");
  
  // Forms inputs
  const [newDrug, setNewDrug] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("");
  
  // SUD input
  const [sudValue, setSudValue] = useState(50);
  const [sudNotes, setSudNotes] = useState("");

  // Check state and load defaults for Pedro Silveira if none exist
  const getPrescriptions = () => {
    if (patient.activePrescriptions && patient.activePrescriptions.length > 0) {
      return patient.activePrescriptions;
    }
    // Presets ONLY for Pedro Silveira
    if (patient.id === "pedro-30" || patient.name?.toLowerCase().includes("pedro")) {
      return [
        { id: "p-1", drugName: "Sertralina (Tolrest)", dosage: "50mg", frequency: "1x pela manhã", startDate: "2026-05-12", status: "active" as const },
        { id: "p-2", drugName: "Clonazepam (Rivotril)", dosage: "0.25mg", frequency: "Apenas em pânico extremo S.O.S", startDate: "2026-05-12", status: "active" as const }
      ];
    }
    return [];
  };

  const getSudLogs = () => {
    if (patient.sudLogs && patient.sudLogs.length > 0) {
      return patient.sudLogs;
    }
    if (patient.id === "pedro-30" || patient.name?.toLowerCase().includes("pedro")) {
      return [
        { date: "2026-05-11", sudValue: 95, notes: "Antes de iniciar Sertralina" },
        { date: "2026-05-15", sudValue: 80, notes: "1ª semana de Sertralina (ansiedade inicial sutil)" },
        { date: "2026-05-22", sudValue: 65, notes: "2ª semana (redução de taquicardia autonômica)" },
        { date: "2026-06-01", sudValue: 40, notes: "3ª semana (forte sinergia com treino do PDP)" },
        { date: "2026-06-05", sudValue: 35, notes: "Sessão de hoje (maior foco nos exercícios)" }
      ];
    }
    return [];
  };

  const prescriptions = getPrescriptions();
  const sudLogs = getSudLogs();

  // Add prescription handler
  const handleAddPrescription = () => {
    if (!newDrug.trim() || !newDosage.trim()) {
      return alert("Preencha o nome do fármaco e a dosagem.");
    }

    const newRec = {
      id: `rx-${Date.now()}`,
      drugName: newDrug,
      dosage: newDosage,
      frequency: newFrequency || "1x ao dia",
      startDate: new Date().toISOString().split("T")[0],
      status: "active" as const
    };

    const currentRx = patient.activePrescriptions || getPrescriptions();
    const updatedPatient: Patient = {
      ...patient,
      activePrescriptions: [...currentRx, newRec]
    };

    onUpdatePatient(updatedPatient);
    setNewDrug("");
    setNewDosage("");
    setNewFrequency("");
  };

  // Toggle/Delete prescription
  const handleDeletePrescription = (id: string) => {
    const currentRx = patient.activePrescriptions || getPrescriptions();
    const filtered = currentRx.filter(rx => rx.id !== id);
    const updatedPatient: Patient = {
      ...patient,
      activePrescriptions: filtered
    };
    onUpdatePatient(updatedPatient);
  };

  // Add SUD Log handler
  const handleAddSudLog = () => {
    const newLog = {
      date: new Date().toISOString().split("T")[0],
      sudValue: Number(sudValue),
      notes: sudNotes || "Registro clínico manual"
    };

    const currentLogs = patient.sudLogs || getSudLogs();
    
    // Sort chronological helper
    const updatedLogs = [...currentLogs, newLog].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const updatedPatient: Patient = {
      ...patient,
      sudLogs: updatedLogs,
      xp: patient.xp + 50
    };

    if (updatedPatient.xp >= updatedPatient.level * 500) {
      updatedPatient.xp -= updatedPatient.level * 500;
      updatedPatient.level += 1;
    }

    onUpdatePatient(updatedPatient);
    setSudNotes("");
    alert("Nível de sofrimento (SUD) inserido com sucesso para fins de análise epidemiológica individual.");
  };

  // Basic SVG plotting variables:
  const chartHeight = 160;
  const chartWidth = 500;
  const pointsCount = sudLogs.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER: ACTIVE PHARMACOLOGY AND CORRELATION CHART */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Prescription and Correlation card */}
        <div className="bg-bg-sidebar rounded-xl border border-border-subtle p-6 space-y-6 shadow-sm">
          <div className="border-b pb-3 space-y-1">
            <h3 className="text-base font-bold text-text-main flex items-center gap-1.5 uppercase font-mono">
              <Dna className="w-5 h-5 text-primary" />
              Integração Farmacológica e Ajuste do Sofrimento (SUD)
            </h3>
            <p className="text-xs text-text-dim leading-normal">
              Acompanhe a introdução empírica de fármacos de {patient.name} e confira se a cascata hormonal se correlaciona com a redução subjetiva do estresse em picos (Escala SUD - Unidades Subjetivas de Desconforto).
            </p>
          </div>

          {/* Interactive SVG SUD Graph */}
          <div className="p-4 bg-bg-deep rounded-xl border border-border-subtle space-y-3">
            <div className="flex justify-between items-center text-[10px] font-mono leading-none border-b border-border-subtle pb-2">
              <span className="text-primary font-bold uppercase tracking-wider">Mapeador Clínico SUD vs. Farmacoterapia</span>
              <span className="text-text-dim">Unidades: SUD % por Sessão</span>
            </div>

            {/* SVG Plotting */}
            <div className="w-full overflow-hidden">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} 
                className="w-full h-[180px] select-none overflow-visible"
              >
                {/* Horizontal reference grid lines */}
                {[0, 25, 50, 75, 100].map((level, i) => {
                  const y = chartHeight - (level / 100) * chartHeight + 20;
                  return (
                    <g key={i}>
                      <line 
                        x1="40" 
                        y1={y} 
                        x2={chartWidth - 20} 
                        y2={y} 
                        stroke="rgba(255, 255, 255, 0.08)" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                      <text x="5" y={y + 3} fill="#adb5bd" className="text-[9px] font-mono font-bold" textAnchor="start">
                        {level}%
                      </text>
                    </g>
                  );
                })}

                {/* X Axis dates & markers */}
                {sudLogs.map((log, index) => {
                  const x = 50 + (index / Math.max(1, pointsCount - 1)) * (chartWidth - 90);
                  const y = chartHeight - (log.sudValue / 100) * chartHeight + 20;
                  return (
                    <g key={index}>
                      {/* Vertical line helper */}
                      <line x1={x} y1="20" x2={x} y2={chartHeight + 20} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="2 2" />
                      
                      {/* Tiny circles for SUD */}
                      <circle cx={x} cy={y} r="4.5" fill="#ef4444" className="shadow animator" />
                      
                      {/* Score label */}
                      <text x={x} y={y - 8} fill="#ef4444" className="text-[9px] font-bold font-mono" textAnchor="middle">
                        {log.sudValue}%
                      </text>

                      {/* Date label */}
                      <text x={x} y={chartHeight + 35} fill="#475569" className="text-[8px] font-mono" textAnchor="middle">
                        {log.date.substring(5)}
                      </text>
                    </g>
                  );
                })}

                {/* Connecting Crimson line */}
                {pointsCount > 1 && (
                  <path 
                    d={sudLogs.map((log, index) => {
                      const x = 50 + (index / Math.max(1, pointsCount - 1)) * (chartWidth - 90);
                      const y = chartHeight - (log.sudValue / 100) * chartHeight + 20;
                      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    className="opacity-90"
                  />
                )}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] text-text-dim font-mono mt-1 pt-1.5 border-t border-border-subtle/60 leading-normal gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>
                <strong>SUD Curva de Desconforto:</strong> Evidencia decaimento sinérgico à medida que a dose sérica de Sertralina atinge o steady-state.
              </span>
              <span className="italic">Pedro Silveira</span>
            </div>
          </div>

          {/* Active Drugs prescriptions Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-main text-xs uppercase font-mono tracking-wider">
              Medicamentos Prescritos Ativos
            </h4>

            <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-sidebar/80 border-b border-border-subtle text-text-dim font-mono text-[10px] uppercase font-bold">
                    <th className="p-3">Fármaco</th>
                    <th className="p-3">Dosagem</th>
                    <th className="p-3">Frequência</th>
                    <th className="p-3">Data Início</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-bg-sidebar/30 transition text-[11px] font-mono text-text-main">
                      <td className="p-3 font-semibold text-text-main">{rx.drugName}</td>
                      <td className="p-3">{rx.dosage}</td>
                      <td className="p-3">{rx.frequency}</td>
                      <td className="p-3">{rx.startDate}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeletePrescription(rx.id)}
                          className="text-text-main hover:text-red-500 transition cursor-pointer"
                          title="Apagar no prontuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {prescriptions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-text-dim font-sans italic text-xs">
                        Nenhum medicamento ativo registrado comercialmente para o paciente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PRESCRIPTION AND SUD LOG INPUTS SIDE BY SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Input Prescription form */}
            <div className="p-4 bg-bg-card rounded-xl border border-border-subtle/80 space-y-3">
              <span className="text-[10px] uppercase font-bold font-mono text-text-dim block">Registrar Novo Psicotrópico</span>
              
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono text-text-dim">Nome Oficial / Genérico</label>
                    <input 
                      type="text"
                      placeholder="Ex: Escitalopram"
                      className="w-full bg-bg-sidebar p-2 border border-border-subtle rounded font-mono text-xs outline-none focus:border-primary"
                      value={newDrug}
                      onChange={(e) => setNewDrug(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-text-dim">Dosagem Estipulada</label>
                    <input 
                      type="text"
                      placeholder="Ex: 10mg"
                      className="w-full bg-bg-sidebar p-2 border border-border-subtle rounded font-mono text-xs outline-none focus:border-primary"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-text-dim">Frequência (Posologia)</label>
                  <input 
                    type="text"
                    placeholder="Ex: 1x pela manhã em jejum"
                    className="w-full bg-bg-sidebar p-2 border border-border-subtle rounded font-mono text-xs outline-none focus:border-primary"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="w-full py-2 bg-primary text-bg-deep font-bold hover:bg-primary-hover text-bg-deep font-bold text-white font-bold rounded text-xs transition"
                >
                  Registrar Fármaco no Prontuário
                </button>
              </div>
            </div>

            {/* Input SUD Log form */}
            <div className="p-4 bg-bg-card rounded-xl border border-border-subtle/80 space-y-3">
              <span className="text-[10px] uppercase font-bold font-mono text-text-dim block">Lançar Novo Índice SUD do Paciente</span>
              
              <div className="space-y-2 text-xs">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[9px] font-mono text-text-dim">Desconforto SUD (0% a 100%)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        className="w-full h-1.5 bg-bg-sidebar rounded-lg appearance-none cursor-pointer"
                        value={sudValue}
                        onChange={(e) => setSudValue(Number(e.target.value))}
                      />
                      <span className="font-mono font-bold text-red-500 text-xs w-8 text-right">{sudValue}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-text-dim">Contexto do Lançamento / Observação</label>
                  <input 
                    type="text"
                    placeholder="Ex: Estável em repouso após simulação"
                    className="w-full bg-bg-sidebar p-2 border border-border-subtle rounded text-xs outline-none focus:border-primary"
                    value={sudNotes}
                    onChange={(e) => setSudNotes(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddSudLog}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition"
                >
                  Acrescentar Ponto de Medição SUD (+50 XP)
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT: BULARIO INTERACTIVE NATIONAL DIRECTORY */}
      <div className="space-y-6">
        
        {/* Bulário Interativo Manual */}
        <div className="bg-bg-sidebar rounded-xl border border-border-subtle p-5 space-y-4 shadow-sm h-full flex flex-col">
          <div className="border-b pb-2 space-y-1">
            <h4 className="font-bold text-text-main text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" />
              Bulário Interativo Nacional de Psicofármacos
            </h4>
            <p className="text-[10px] text-text-dim leading-normal">
              Consulte os mecanismos de ação clínica e a modulação de receptores específicos da Terapia de 4ª Geração.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-bg-sidebar p-1 rounded-lg border text-[10px] font-mono">
            <button
              onClick={() => setSelectedCategory("isrs")}
              className={`flex-1 py-1.5 rounded transition font-bold cursor-pointer ${
                selectedCategory === "isrs" ? "bg-bg-sidebar text-primary shadow-3xs" : "text-text-dim hover:text-text-main"
              }`}
            >
              ISRS (Serotonina / CSTC)
            </button>
            <button
              onClick={() => setSelectedCategory("gaba")}
              className={`flex-1 py-1.5 rounded transition font-bold cursor-pointer ${
                selectedCategory === "gaba" ? "bg-bg-sidebar text-primary shadow-3xs" : "text-text-dim hover:text-text-main"
              }`}
            >
              Moduladores GABA (Canais Cloro)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {drugDatabase[selectedCategory].map((drug, index) => (
              <div key={index} className="p-4 bg-bg-card rounded-xl border border-border-subtle text-xs space-y-2">
                <span className="font-black font-sans text-text-main block text-[11px] uppercase tracking-tight">
                  {drug.name}
                </span>

                <p className="text-text-dim leading-relaxed text-[11px]">
                  <strong>Farmacodinâmica:</strong> {drug.mechanism}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-text-dim">
                  <div>
                    <span className="block text-[8px] font-bold text-text-dim uppercase">Posologia Alvo</span>
                    {drug.doses}
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-text-dim uppercase">Reguladores Neurais</span>
                    {drug.target}
                  </div>
                </div>

                <div className="p-2.5 bg-primary/5 border border-primary/20 text-[10px] rounded-lg font-mono text-text-dim leading-relaxed">
                  <span className="text-primary font-bold block uppercase text-[8px] tracking-wider mb-0.5">Efeitos Clínicos de Alerta</span>
                  {drug.colaterais}
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-200 text-[10px] rounded-lg font-mono text-text-dim leading-relaxed">
                  <span className="text-amber-800 font-bold flex items-center gap-1 uppercase text-[8px] tracking-wider mb-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Cuidado Clínico
                  </span>
                  {drug.warnings}
                </div>
              </div>
            ))}
          </div>
          
        </div>

      </div>

    </div>
  );
}
