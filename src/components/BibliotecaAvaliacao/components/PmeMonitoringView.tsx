import React, { useState } from "react";
import { PatientInfo, PmeState } from "../types";
import { 
  CheckSquare, Square, Award, BookOpen, Compass, Lightbulb, 
  HelpCircle, CheckCircle2, ShieldAlert, Heart, Activity, 
  TrendingUp, FileText, Sparkles, Smile
} from "lucide-react";
import { ClinicalSuggestionsButton } from "./ClinicalSuggestionsHelper";

interface PmeMonitoringViewProps {
  patient: PatientInfo;
  pmeState: PmeState;
  setPmeState: React.Dispatch<React.SetStateAction<PmeState>>;
  totalScore: number;
}

const YOUNG_SCHEMAS = [
  "Fracasso",
  "Defectividade/Vergonha",
  "Privação Emocional",
  "Abandono/Instabilidade",
  "Desconfiança/Abuso",
  "Isolamento Social/Alienação",
  "Dependência/Incompetência",
  "Vulnerabilidade a Danos ou Doenças",
  "Emaranhamento/Self Subdesenvolvido",
  "Grandiosidade/Arrogância",
  "Autocontrole/Autodisciplina Insuficientes",
  "Subjugação",
  "Auto-sacrifício",
  "Busca de Aprovação/Reconhecimento",
  "Negatividade/Pessimismo",
  "Inibição Emocional",
  "Padrões Inflexíveis/Crítica Exagerada",
  "Punitividade"
];

export default function PmeMonitoringView({
  patient,
  pmeState,
  setPmeState,
  totalScore
}: PmeMonitoringViewProps) {

  // Local state for active tab within the combined PME + PDP Workspace
  const [activeTab, setActiveTab] = useState<"pme" | "pdp">("pme");

  // Helper function to update PME text fields
  const updateFaseField = (key: keyof PmeState, value: string) => {
    setPmeState(prev => {
      const field = prev[key];
      if (typeof field === "object" && field !== null && "text" in field) {
        return {
          ...prev,
          [key]: { ...field, text: value }
        };
      }
      return prev;
    });
  };

  // Helper function to toggle PME done status
  const toggleFaseDone = (key: keyof PmeState) => {
    setPmeState(prev => {
      const field = prev[key];
      if (typeof field === "object" && field !== null && "done" in field) {
        return {
          ...prev,
          [key]: { ...field, done: !field.done }
        };
      }
      return prev;
    });
  };

  // Helper functions for PDP elements replicated inside PmeState
  const updatePdpFase1Field = (key: keyof PmeState["pdpFase1"], value: string) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase1: {
        ...prev.pdpFase1,
        [key]: { ...prev.pdpFase1[key], text: value }
      }
    }));
  };

  const togglePdpFase1Done = (key: keyof PmeState["pdpFase1"]) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase1: {
        ...prev.pdpFase1,
        [key]: { ...prev.pdpFase1[key], done: !prev.pdpFase1[key].done }
      }
    }));
  };

  const updatePdpFase2Field = (value: string) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase2: {
        investigacao_reestruturacao: { ...prev.pdpFase2.investigacao_reestruturacao, text: value }
      }
    }));
  };

  const togglePdpFase2Done = () => {
    setPmeState(prev => ({
      ...prev,
      pdpFase2: {
        investigacao_reestruturacao: { 
          ...prev.pdpFase2.investigacao_reestruturacao, 
          done: !prev.pdpFase2.investigacao_reestruturacao.done 
        }
      }
    }));
  };

  const updatePdpFase3Field = (value: string) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase3: {
        leitura_selecao_reflexao: { ...prev.pdpFase3.leitura_selecao_reflexao, text: value }
      }
    }));
  };

  const togglePdpFase3Done = () => {
    setPmeState(prev => ({
      ...prev,
      pdpFase3: {
        leitura_selecao_reflexao: { 
          ...prev.pdpFase3.leitura_selecao_reflexao, 
          done: !prev.pdpFase3.leitura_selecao_reflexao.done 
        }
      }
    }));
  };

  const updatePdpFase4Item = (id: number, text: string) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase4: prev.pdpFase4.map(item => item.id === id ? { ...item, text } : item)
    }));
  };

  const togglePdpFase4Item = (id: number) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase4: prev.pdpFase4.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  };

  const updatePdpFase5Item = (id: number, text: string) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase5: prev.pdpFase5.map(item => item.id === id ? { ...item, text } : item)
    }));
  };

  const togglePdpFase5Item = (id: number) => {
    setPmeState(prev => ({
      ...prev,
      pdpFase5: prev.pdpFase5.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  };

  // Counting completed checkpoints for PME
  const pmeDoneCount = [
    pmeState.fase1.done, pmeState.fase2.done, pmeState.fase3.done, pmeState.fase4.done,
    pmeState.fase5.done, pmeState.fase6.done, pmeState.fase7.done, pmeState.fase8.done
  ].filter(Boolean).length;
  const pmePercent = Math.round((pmeDoneCount / 8) * 100);

  // Counting completed checkpoints for PDP
  const pdpDoneFase1 = Object.values(pmeState.pdpFase1).filter(v => v.done).length;
  const pdpDoneFase2 = pmeState.pdpFase2.investigacao_reestruturacao.done ? 1 : 0;
  const pdpDoneFase3 = pmeState.pdpFase3.leitura_selecao_reflexao.done ? 1 : 0;
  const pdpDoneFase4 = pmeState.pdpFase4.filter(v => v.done).length;
  const pdpDoneFase5 = pmeState.pdpFase5.filter(v => v.done).length;
  
  const pdpTotalDone = pdpDoneFase1 + pdpDoneFase2 + pdpDoneFase3 + pdpDoneFase4 + pdpDoneFase5;
  const pdpPercent = Math.round((pdpTotalDone / 23) * 100);

  return (
    <div className="space-y-6 animate-fadeIn" id="pme-monitoring-root-view">
      
      {/* Informational Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-300 space-y-1 block" id="pme-info-banner">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">💼 CLINICAL WORKSPACE INTEGRADO: MÉTODO PME+PDP</strong>
        <span className="text-gray-400 leading-relaxed">
          O <strong>Processo de Modificação Esquemática (PME)</strong> é focado em reabilitar vulnerabilidades precoces e esquemas disfuncionais de Young (reabilitação estruturada do passado). O correspondente <strong>Processo de Desenvolvimento Psicológico (PDP)</strong> consolida as novas Habilidades Psicológicas (HP) no repertório do paciente por meio de imersões neurais e exercícios prescritos. A integração de ambos os processos atende todo o percurso clínico de ponta a ponta.
        </span>
      </div>

      {/* Main Stats Header Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="pme-stats-grid">
        {/* Patient Block */}
        <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 flex flex-col justify-between" id="pme-stat-patient">
          <div>
            <span className="text-gray-500 block uppercase font-mono font-bold text-[9px] mb-1">Paciente & Data de Início</span>
            <input 
              type="text" 
              value={patient.name || "Paciente Anônimo"} 
              disabled
              className="bg-transparent border-0 text-gray-200 font-sans font-semibold text-sm w-full p-0 focus:ring-0 cursor-not-allowed"
            />
          </div>
          <div className="mt-2 text-[11px] font-mono text-gray-500">
            Iniciado em: 
            <input 
              type="text" 
              value={pmeState.dataInicio} 
              onChange={(e) => setPmeState(prev => ({ ...prev, dataInicio: e.target.value }))}
              className="bg-transparent border-b border-transparent hover:border-gray-800 text-gray-300 ml-1 py-0 px-1 font-mono focus:outline-none focus:border-amber-500"
              style={{ width: '100px' }}
            />
          </div>
        </div>

        {/* Selected Schema & HP Target Block */}
        <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 flex flex-col justify-start space-y-2.5" id="pme-stat-schema">
          <div>
            <span className="text-amber-500 block uppercase font-mono font-bold text-[9px] mb-1">Esquema Alvo (PME) & HP Alocada (PDP)</span>
            <div className="flex gap-2 items-center">
              <select
                value={pmeState.esquemaPrincipal}
                onChange={(e) => setPmeState(prev => ({ ...prev, esquemaPrincipal: e.target.value }))}
                className="bg-[#191a20] border border-gray-900 text-gray-250 text-[11px] rounded p-1 w-1/2 focus:outline-none focus:border-amber-500/50"
              >
                {YOUNG_SCHEMAS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input 
                type="text" 
                value={pmeState.pdpHp} 
                onChange={(e) => setPmeState(prev => ({ ...prev, pdpHp: e.target.value }))}
                className="bg-[#191a20] border border-gray-900 text-gray-250 text-[11px] rounded p-1 w-1/2 focus:outline-none focus:border-amber-500/50"
                placeholder="HP Alocada..."
                title="Habilidade Psicológica correspondente praticada"
              />
            </div>
          </div>
          <div className="text-[9px] font-mono text-gray-500 flex justify-between pt-0.5 border-t border-gray-900/30">
            <span>Acompanhamento: Lincoln Poubel</span>
            <span className="text-amber-400 font-bold">TERAPIA INTEGRADA</span>
          </div>
        </div>

        {/* Live Combined Progress Block */}
        <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 flex flex-col justify-between" id="pme-stat-progress">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">Progresso Clínico PME+PDP</span>
            <span className="text-sm font-sans font-black text-amber-500">{totalScore}%</span>
          </div>
          
          <div className="mt-2 space-y-1.5 w-full">
            <div className="h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${totalScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-gray-500">
              <span>PME: {pmePercent}% ({pmeDoneCount}/8)</span>
              <span>PDP: {pdpPercent}% ({pdpTotalDone}/23)</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEGMENTED TABS CONTROLLER --- */}
      <div className="flex border-b border-gray-900 p-0.5 bg-gray-950 rounded-lg max-w-lg" id="pme-pdp-tabs-controller">
        <button
          onClick={() => setActiveTab("pme")}
          className={`flex-1 py-2 text-center rounded-md font-sans text-xs font-bold transition-all uppercase flex items-center justify-center gap-1.5 border-0 cursor-pointer ${
            activeTab === "pme" 
              ? "bg-amber-500/15 text-amber-500 shadow-sm border border-amber-500/20" 
              : "bg-transparent text-gray-450 hover:text-gray-200"
          }`}
        >
          <Heart size={14} className={activeTab === "pme" ? "animate-pulse text-amber-500" : ""} />
          1. Reabilitação de Esquemas (PME)
        </button>
        <button
          onClick={() => setActiveTab("pdp")}
          className={`flex-1 py-2 text-center rounded-md font-sans text-xs font-bold transition-all uppercase flex items-center justify-center gap-1.5 border-0 cursor-pointer ${
            activeTab === "pdp" 
              ? "bg-[#00A3FF]/15 text-[#00A3FF] shadow-sm border border-[#00A3FF]/20" 
              : "bg-transparent text-gray-450 hover:text-gray-200"
          }`}
        >
          <Sparkles size={14} className={activeTab === "pdp" ? "text-[#00A3FF]" : ""} />
          2. Consolidação de HP (PDP)
        </button>
      </div>

      {/* --- WORKSPACE VIEW RENDER --- */}

      {activeTab === "pme" ? (
        /* PME SECTION */
        <div className="space-y-6 animate-fadeIn" id="pme-phase-panel">
          {/* Informational Subtitle */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-sans italic">
            <span>Editando as 8 etapas para eliminação e modificação racional de esquemas precoces.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pme-structure-grid-internal">
            
            {/* LEFT COLUMN: ETAPAS 1 A 4 */}
            <div className="lg:col-span-6 space-y-6" id="pme-left-phases-internal">
              
              {/* ETAPA 1 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa1">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black">1. IDENTIFICAÇÃO</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Mapeamento do Esquema (EID)</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase1")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase1.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase1.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 pb-1">
                  <p className="text-[11px] text-gray-400 leading-relaxed italic shrink">
                    Objetivo: Identificar e nomear o Esquema Inicial Desadaptativo prioritário e os gatilhos circunstanciais. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Autoconhecimento.</span>
                  </p>
                  <ClinicalSuggestionsButton
                    category="esquemas"
                    onSelectSuggestion={(val) => updateFaseField("fase1", val)}
                    className="shrink-0 self-end sm:self-auto"
                  />
                </div>
                <textarea
                  rows={3}
                  value={pmeState.fase1.text}
                  onChange={(e) => updateFaseField("fase1", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Escreva as características clínicas constatadas na identificação do esquema..."
                />
              </div>

              {/* ETAPA 2 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa2">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black">2. DESFUSÃO</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Desfusão Identitária & Modos</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase2")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase2.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase2.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 pb-1">
                  <p className="text-[11px] text-gray-400 leading-relaxed italic shrink">
                    Objetivo: Aplicar a <strong>Metáfora do Ônibus (Instruir o Eu Adulto)</strong> para se apartar das respostas regimentadas automáticas regressivas sob sequestro de modos. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Autoestima.</span>
                  </p>
                  <ClinicalSuggestionsButton
                    category="sentimentos"
                    onSelectSuggestion={(val) => updateFaseField("fase2", val)}
                    className="shrink-0 self-end sm:self-auto"
                  />
                </div>
                <textarea
                  rows={3}
                  value={pmeState.fase2.text}
                  onChange={(e) => updateFaseField("fase2", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Descreva o andamento da diferenciação identitária construído..."
                />
              </div>

              {/* ETAPA 3 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa3">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black">3. ORIGEM HISTÓRICA</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Construção da Linha da Vida</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase3")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase3.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase3.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <p className="text-[11px] text-gray-500 leading-relaxed italic">
                  Objetivo: Mapear experiências formativas na infância que consolidaram os esquemas disadaptativos prioritários no cérebro. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Autoconhecimento.</span>
                </p>
                <textarea
                  rows={3}
                  value={pmeState.fase3.text}
                  onChange={(e) => updateFaseField("fase3", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Registre as memórias ativadas com o paciente..."
                />
              </div>

              {/* ETAPA 4 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa4">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black">4. IMPACTOS ATUAIS</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Psicoeducação sobre Perdas</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase4")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase4.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase4.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <p className="text-[11px] text-gray-500 leading-relaxed italic">
                  Objetivo: Conscientizar sobre as perdas sociais, afetivas, identitárias e ocupacionais que decorrem do padrão de evitação/fuga atual. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Autoconhecimento.</span>
                </p>
                <textarea
                  rows={3}
                  value={pmeState.fase4.text}
                  onChange={(e) => updateFaseField("fase4", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Relacione o balanço real de perdas que constatam a insustentabilidade do esquema..."
                />
              </div>

            </div>

            {/* RIGHT COLUMN: ETAPAS 5 A 8 */}
            <div className="lg:col-span-6 space-y-6" id="pme-right-phases-internal">
              
              {/* ETAPA 5 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa5">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black">5. CONTRATO</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Compromisso e Aliança de Mudança</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase5")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase5.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase5.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 pb-1">
                  <p className="text-[11px] text-gray-400 leading-relaxed italic shrink">
                    Objetivo: Firmar o compromisso de se expor deliberadamente sob desconforto controlado para reorganizar a conduta madura. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Resolutividade.</span>
                  </p>
                  <ClinicalSuggestionsButton
                    category="enfrentamento"
                    onSelectSuggestion={(val) => updateFaseField("fase5", val)}
                    className="shrink-0 self-end sm:self-auto"
                  />
                </div>
                <textarea
                  rows={3}
                  value={pmeState.fase5.text}
                  onChange={(e) => updateFaseField("fase5", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Estruture os termos do pacto clínico terapêutico do paciente com ele mesmo..."
                />
              </div>

              {/* ETAPA 6 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa6">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black">6. REESTRUTURAÇÃO</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Desafio Clínico de Distorções</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase6")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase6.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase6.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 pb-1">
                  <p className="text-[11px] text-gray-400 leading-relaxed italic shrink">
                    Objetivo: Reestruturar pensamentos automáticos e regras irracionais herdadas do esquema alvo. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Raciocínio Realisticamente Otimista.</span>
                  </p>
                  <ClinicalSuggestionsButton
                    category="distorcoes"
                    onSelectSuggestion={(val) => updateFaseField("fase6", val)}
                    className="shrink-0 self-end sm:self-auto"
                  />
                </div>
                <textarea
                  rows={3}
                  value={pmeState.fase6.text}
                  onChange={(e) => updateFaseField("fase6", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Insira as racionalizações e contra-discursos adaptativos..."
                />
              </div>

              {/* ETAPA 7 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa7">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black animate-pulse">7. RESSIGNIFICAÇÃO</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Reparentalização em Imaginação</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase7")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase7.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase7.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 pb-1">
                  <p className="text-[11px] text-gray-400 leading-relaxed italic shrink">
                    Objetivo: Ponto máximo da terapia vivencial. O Eu Adulto re-instancia cenários traumáticos da criança para prover amparo básico, silenciar abusadores e ressignificar a memória. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Autorregulação.</span>
                  </p>
                  <ClinicalSuggestionsButton
                    category="sentimentos"
                    onSelectSuggestion={(val) => updateFaseField("fase7", val)}
                    className="shrink-0 self-end sm:self-auto"
                  />
                </div>
                <textarea
                  rows={3}
                  value={pmeState.fase7.text}
                  onChange={(e) => updateFaseField("fase7", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Relate minuciosamente os desbloqueios afetivos na técnica imagética..."
                />
              </div>

              {/* ETAPA 8 */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3" id="pme-card-etapa8">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono font-black">8. PDP INTEGRADO</span>
                    <h4 className="text-xs font-bold text-gray-150 uppercase tracking-wide">Ruptura de Padrões e Alocação</h4>
                  </div>
                  <button 
                    onClick={() => toggleFaseDone("fase8")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-110 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.fase8.done ? '#f59e0b' : '#555' }}
                  >
                    {pmeState.fase8.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluso</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                
                <p className="text-[11px] text-gray-500 leading-relaxed italic">
                  Objetivo: Integrar as descobertas obtidas com a estruturação prática de Habilidades no PDP para manter comportamentos consistentes de longo prazo. <span className="text-amber-500 font-semibold font-mono">HP Alvo: Autocontrole.</span>
                </p>
                <textarea
                  rows={3}
                  value={pmeState.fase8.text}
                  onChange={(e) => updateFaseField("fase8", e.target.value)}
                  className="w-full bg-[#191a20] border border-gray-950 rounded-lg p-3 text-xs text-gray-300 font-sans focus:outline-none focus:border-amber-500/30"
                  placeholder="Especifique as diretrizes de alocação de repertório que serão trabalhadas sequencialmente na aba PDP..."
                />
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* REPLICATED PDP SECTION VALUE */
        <div className="space-y-6 animate-fadeIn" id="pdp-replicated-panel">
          {/* Informational Subtitle */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-sans italic">
            <span>Editando as 5 fases do Processo de Desenvolvimento Psicológico (PDP) para a HP <strong>{pmeState.pdpHp || "(Defina uma HP)"}</strong>.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pdp-structure-grid-internal">
            
            {/* LEFT COLUMN: PHASE 1, 2, 3 COGNITIVE FRAMEWORKS */}
            <div className="lg:col-span-7 space-y-6" id="pdp-left-flow-internal">
              
              {/* FASE 1: MOTIVAÇÃO */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-4 shadow-sm" id="pdp-card-phase-1">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-xs bg-[#00A3FF]/10 text-[#00A3FF] font-sans font-black">FASE 1</span>
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans">Motivação para Mudança de Repertório</h4>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 px-2 py-0.5 rounded bg-gray-950 border border-gray-900">
                    {pdpDoneFase1} / 5 Concluídos
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Noções Iniciais */}
                  <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">1. Noções Iniciais da HP ({pmeState.pdpHp})</label>
                      <button 
                        onClick={() => togglePdpFase1Done("nocoes_iniciais")}
                        className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                        style={{ color: pmeState.pdpFase1.nocoes_iniciais.done ? '#00A3FF' : '#555' }}
                      >
                        {pmeState.pdpFase1.nocoes_iniciais.done ? (
                          <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                        ) : (
                          <><Square size={13} strokeWidth={2.5} /> Pendente</>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={pmeState.pdpFase1.nocoes_iniciais.text}
                      onChange={(e) => updatePdpFase1Field("nocoes_iniciais", e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans font-normal"
                      placeholder="Definição clínica e descrição básica do funcionamento desta HP..."
                    />
                  </div>

                  {/* Valores Relacionados */}
                  <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">2. Valores Existenciais Correlatos</label>
                      <button 
                        onClick={() => togglePdpFase1Done("valores_relacionados")}
                        className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                        style={{ color: pmeState.pdpFase1.valores_relacionados.done ? '#00A3FF' : '#555' }}
                      >
                        {pmeState.pdpFase1.valores_relacionados.done ? (
                          <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                        ) : (
                          <><Square size={13} strokeWidth={2.5} /> Pendente</>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={pmeState.pdpFase1.valores_relacionados.text}
                      onChange={(e) => updatePdpFase1Field("valores_relacionados", e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans font-normal"
                      placeholder="Quais valores vitais justificam o esforço de desenvolver essa HP?"
                    />
                  </div>

                  {/* Benefícios HP */}
                  <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">3. Benefícios adaptativos da HP</label>
                      <button 
                        onClick={() => togglePdpFase1Done("beneficios_hp")}
                        className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                        style={{ color: pmeState.pdpFase1.beneficios_hp.done ? '#00A3FF' : '#555' }}
                      >
                        {pmeState.pdpFase1.beneficios_hp.done ? (
                          <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                        ) : (
                          <><Square size={13} strokeWidth={2.5} /> Pendente</>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={pmeState.pdpFase1.beneficios_hp.text}
                      onChange={(e) => updatePdpFase1Field("beneficios_hp", e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans font-normal"
                      placeholder="Quais ganhos adaptativos e libertação essa HP trará ao paciente?"
                    />
                  </div>

                  {/* Impactos do Déficit */}
                  <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">4. Impactos do Déficit nessa HP</label>
                      <button 
                        onClick={() => togglePdpFase1Done("impactos_deficit")}
                        className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                        style={{ color: pmeState.pdpFase1.impactos_deficit.done ? '#00A3FF' : '#555' }}
                      >
                        {pmeState.pdpFase1.impactos_deficit.done ? (
                          <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                        ) : (
                          <><Square size={13} strokeWidth={2.5} /> Pendente</>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={pmeState.pdpFase1.impactos_deficit.text}
                      onChange={(e) => updatePdpFase1Field("impactos_deficit", e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans font-normal"
                      placeholder="Quais perdas, sintomas e crises o deficit dessa HP perpetua?"
                    />
                  </div>

                  {/* Ganhos do Padrão Atual */}
                  <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">5. Ganhos Secundários do Padrão Atual disadaptativo</label>
                      <button 
                        onClick={() => togglePdpFase1Done("ganhos_atual_padrao")}
                        className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                        style={{ color: pmeState.pdpFase1.ganhos_atual_padrao.done ? '#00A3FF' : '#555' }}
                      >
                        {pmeState.pdpFase1.ganhos_atual_padrao.done ? (
                          <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                        ) : (
                          <><Square size={13} strokeWidth={2.5} /> Pendente</>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={pmeState.pdpFase1.ganhos_atual_padrao.text}
                      onChange={(e) => updatePdpFase1Field("ganhos_atual_padrao", e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans font-normal"
                      placeholder="Por que é tão difícil mudar? O que o atual padrão disfuncional protege temporariamente?"
                    />
                  </div>
                </div>
              </div>

              {/* FASE 2: DETECTANDO Crenças */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3 shadow-sm" id="pdp-card-phase-2">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-xs bg-indigo-500/10 text-indigo-400 font-sans font-black">FASE 2</span>
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans">Corrigindo Distorções (Reestruturação Célebre)</h4>
                  </div>
                  <button 
                    onClick={togglePdpFase2Done}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.pdpFase2.investigacao_reestruturacao.done ? '#00A3FF' : '#555' }}
                  >
                    {pmeState.pdpFase2.investigacao_reestruturacao.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                  <label className="text-[10px] text-[#00A3FF] font-mono font-bold uppercase tracking-wider block">Investigação e Reestruturação Cognitiva</label>
                  <textarea
                    rows={3}
                    value={pmeState.pdpFase2.investigacao_reestruturacao.text}
                    onChange={(e) => updatePdpFase2Field(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans font-normal"
                    placeholder="Questione as crenças sabotadoras limitantes que impedem o paciente de agir sob desconforto. Crie novas diretrizes para neutralizar as distorções..."
                  />
                </div>
              </div>

              {/* FASE 3: MENTALIDADES */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3 shadow-sm" id="pdp-card-phase-3">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-xs bg-purple-500/10 text-purple-400 font-sans font-black">FASE 3</span>
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans">Mentalidades de Suporte (Enfrentamento)</h4>
                  </div>
                  <button 
                    onClick={togglePdpFase3Done}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                    style={{ color: pmeState.pdpFase3.leitura_selecao_reflexao.done ? '#00A3FF' : '#555' }}
                  >
                    {pmeState.pdpFase3.leitura_selecao_reflexao.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                  <label className="text-[10px] text-[#00A3FF] font-mono font-bold uppercase tracking-wider block">Leitura, Seleção e Reflexão (Frases Âncora)</label>
                  <textarea
                    rows={3}
                    value={pmeState.pdpFase3.leitura_selecao_reflexao.text}
                    onChange={(e) => updatePdpFase3Field(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans font-normal"
                    placeholder="Declare frases e raciocínios saudáveis que contragolpeiam os esquemas desadaptativos do paciente..."
                  />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: SOURCES & EXERCISES */}
            <div className="lg:col-span-5 space-y-6" id="pdp-right-flow-internal">
              
              {/* FASE 4: IMERSÃO */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-4 shadow-sm" id="pdp-card-phase-4">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-xs bg-emerald-550/10 text-emerald-400 font-sans font-black">FASE 4</span>
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans flex items-center gap-1">
                      <BookOpen size={12} className="text-emerald-400" /> Fontes de Imersão
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 px-2 py-0.5 rounded bg-gray-950 border border-gray-900">
                    {pdpDoneFase4} / 6 Concluídas
                  </span>
                </div>

                <p className="text-[10px] text-gray-550 font-sans leading-relaxed">
                  Indique livros, aulas, áudios de podcasts e artigos científicos para alicerçar a nova HP no repertório do paciente.
                </p>

                <div className="space-y-3 h-[415px] overflow-y-auto pr-1">
                  {pmeState.pdpFase4.map((item, idx) => (
                    <div key={item.id} className="flex gap-2.5 items-center p-2.5 rounded-lg border border-gray-900 hover:border-gray-800 bg-gray-950/45 transition-colors">
                      <span className="text-[11px] font-mono font-extrabold text-[#00A3FF] w-6 shrink-0 text-center bg-[#00A3FF]/5 py-0.5 rounded border border-[#00A3FF]/10">{idx + 1}ª</span>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updatePdpFase4Item(item.id, e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-gray-200 py-0 focus:outline-none focus:ring-0 min-w-0"
                        placeholder="Nome do livro, palestra, documentário..."
                      />
                      <button
                        onClick={() => togglePdpFase4Item(item.id)}
                        className="bg-transparent border-0 cursor-pointer p-0.5 transition-colors"
                        style={{ color: item.done ? '#10B981' : '#374151' }}
                        title={item.done ? "Pendente" : "Concluído"}
                      >
                        {item.done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-750" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FASE 5: EXERCÍCIOS PRÁTICOS */}
              <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-4 shadow-sm" id="pdp-card-phase-5">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 rounded text-xs bg-amber-500/10 text-amber-400 font-sans font-black">FASE 5</span>
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans flex items-center gap-1">
                      <Award size={12} className="text-amber-400" /> Prescrição de Exercícios
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 px-2 py-0.5 rounded bg-gray-950 border border-gray-900">
                    {pdpDoneFase5} / 10 Praticados
                  </span>
                </div>

                <p className="text-[10px] text-gray-550 font-sans leading-relaxed">
                  Condutas comportamentais diárias e hábitos estruturados monitorados ativamente no meio social do paciente.
                </p>

                <div className="space-y-2.5 h-[415px] overflow-y-auto pr-1">
                  {pmeState.pdpFase5.map((item, idx) => (
                    <div key={item.id} className="flex gap-2.5 items-center p-2 rounded-lg border border-gray-900 hover:border-gray-800 bg-gray-950/45 transition-colors">
                      <span className="text-[11px] font-mono font-extrabold text-amber-400 w-6 shrink-0 text-center bg-amber-500/5 py-0.5 rounded border border-amber-500/10">{idx + 1}º</span>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updatePdpFase5Item(item.id, e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-gray-250 py-0 focus:outline-none focus:ring-0 min-w-0"
                        placeholder="Conduta ou desafio disciplinado..."
                      />
                      <button
                        onClick={() => togglePdpFase5Item(item.id)}
                        className="bg-transparent border-0 cursor-pointer p-0.5 transition-colors"
                        style={{ color: item.done ? '#F59E0B' : '#374151' }}
                        title={item.done ? "Pendente" : "Concluído"}
                      >
                        {item.done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-750" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
