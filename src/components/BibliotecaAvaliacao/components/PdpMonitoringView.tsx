import React from "react";
import { PatientInfo } from "../types";
import { CheckSquare, Square, Award, BookOpen, Compass, Lightbulb, HelpCircle, CheckCircle2 } from "lucide-react";

interface PdpState {
  profissional: string;
  crp: string;
  dataInicio: string;
  hp: string;
  fase1: {
    nocoes_iniciais: { text: string; done: boolean };
    valores_relacionados: { text: string; done: boolean };
    beneficios_hp: { text: string; done: boolean };
    impactos_deficit: { text: string; done: boolean };
    ganhos_atual_padrao: { text: string; done: boolean };
  };
  fase2: {
    investigacao_reestruturacao: { text: string; done: boolean };
  };
  fase3: {
    leitura_selecao_reflexao: { text: string; done: boolean };
  };
  fase4: Array<{ id: number; text: string; done: boolean }>;
  fase5: Array<{ id: number; text: string; done: boolean }>;
}

interface PdpMonitoringViewProps {
  patient: PatientInfo;
  pdpState: PdpState;
  setPdpState: React.Dispatch<React.SetStateAction<PdpState>>;
  totalScore: number;
}

export default function PdpMonitoringView({
  patient,
  pdpState,
  setPdpState,
  totalScore
}: PdpMonitoringViewProps) {

  // Update helper functions
  const updateFase1Field = (key: keyof PdpState["fase1"], value: string) => {
    setPdpState(prev => ({
      ...prev,
      fase1: {
        ...prev.fase1,
        [key]: { ...prev.fase1[key], text: value }
      }
    }));
  };

  const toggleFase1Done = (key: keyof PdpState["fase1"]) => {
    setPdpState(prev => ({
      ...prev,
      fase1: {
        ...prev.fase1,
        [key]: { ...prev.fase1[key], done: !prev.fase1[key].done }
      }
    }));
  };

  const updateFase2Field = (value: string) => {
    setPdpState(prev => ({
      ...prev,
      fase2: {
        investigacao_reestruturacao: { ...prev.fase2.investigacao_reestruturacao, text: value }
      }
    }));
  };

  const toggleFase2Done = () => {
    setPdpState(prev => ({
      ...prev,
      fase2: {
        investigacao_reestruturacao: { 
          ...prev.fase2.investigacao_reestruturacao, 
          done: !prev.fase2.investigacao_reestruturacao.done 
        }
      }
    }));
  };

  const updateFase3Field = (value: string) => {
    setPdpState(prev => ({
      ...prev,
      fase3: {
        leitura_selecao_reflexao: { ...prev.fase3.leitura_selecao_reflexao, text: value }
      }
    }));
  };

  const toggleFase3Done = () => {
    setPdpState(prev => ({
      ...prev,
      fase3: {
        leitura_selecao_reflexao: { 
          ...prev.fase3.leitura_selecao_reflexao, 
          done: !prev.fase3.leitura_selecao_reflexao.done 
        }
      }
    }));
  };

  const updateFase4Item = (id: number, text: string) => {
    setPdpState(prev => ({
      ...prev,
      fase4: prev.fase4.map(item => item.id === id ? { ...item, text } : item)
    }));
  };

  const toggleFase4Item = (id: number) => {
    setPdpState(prev => ({
      ...prev,
      fase4: prev.fase4.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  };

  const updateFase5Item = (id: number, text: string) => {
    setPdpState(prev => ({
      ...prev,
      fase5: prev.fase5.map(item => item.id === id ? { ...item, text } : item)
    }));
  };

  const toggleFase5Item = (id: number) => {
    setPdpState(prev => ({
      ...prev,
      fase5: prev.fase5.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  };

  // Counting completed
  const totalCriteria = 23;
  const doneFase1 = Object.values(pdpState.fase1).filter(v => v.done).length;
  const doneFase2 = pdpState.fase2.investigacao_reestruturacao.done ? 1 : 0;
  const doneFase3 = pdpState.fase3.leitura_selecao_reflexao.done ? 1 : 0;
  const doneFase4 = pdpState.fase4.filter(v => v.done).length;
  const doneFase5 = pdpState.fase5.filter(v => v.done).length;
  const grandTotalDone = doneFase1 + doneFase2 + doneFase3 + doneFase4 + doneFase5;

  return (
    <div className="space-y-6 animate-fadeIn" id="pdp-monitoring-root-view">
      
      {/* Informational Banner */}
      <div className="bg-[#00A3FF]/15 border border-[#00A3FF]/30 p-4 rounded-xl text-xs text-blue-300 space-y-1 block" id="pdp-info-banner">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">📋 ACOMPANHAMENTO DO AVALIADOR: MÉTODO PDP</strong>
        <span className="text-gray-400">
          O <strong>Processo de Desenvolvimento Psicológico (PDP)</strong> é um programa estruturado de 5 Fases para formação, consolidação e acompanhamento de Habilidades Psicológicas (HP) no repertório do paciente. À medida que o paciente experimenta avanços práticos nas fontes de imersão e exercícios prescritos, marque os checkboxes para gerar o gráfico de progresso clínico dinâmico.
        </span>
      </div>

      {/* Main Stats Header Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="pdp-stats-grid">
        <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 flex flex-col justify-between" id="pdp-stat-patient">
          <div>
            <span className="text-gray-650 block uppercase font-mono font-bold text-[9px] mb-1">Paciente & Data de Início</span>
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
              value={pdpState.dataInicio} 
              onChange={(e) => setPdpState(prev => ({ ...prev, dataInicio: e.target.value }))}
              className="bg-transparent border-b border-transparent hover:border-gray-800 text-gray-300 ml-1 py-0 px-1 font-mono focus:outline-none focus:border-[#00A3FF]"
              style={{ width: '100px' }}
            />
          </div>
        </div>

        <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 flex flex-col justify-between" id="pdp-stat-hp">
          <div>
            <span className="text-gray-650 block uppercase font-mono font-bold text-[9px] mb-1 text-[#00A3FF]">HP de Alocação (Habilidade Praticada)</span>
            <input 
              type="text" 
              value={pdpState.hp} 
              onChange={(e) => setPdpState(prev => ({ ...prev, hp: e.target.value }))}
              className="bg-transparent border-b border-[#00A3FF]/10 text-gray-200 font-sans font-semibold text-xs w-full py-1 focus:outline-none focus:border-[#00A3FF]/50"
              placeholder="Ex: Autocontrole e Tolerância à Frustração"
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-gray-500">
            Acompanhamento Clínico: Dr. Lincoln Poubel (CRP 04/99124-MG)
          </div>
        </div>

        <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 flex flex-col justify-between" id="pdp-stat-progress">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">Progresso do PDP</span>
            <span className="text-sm font-sans font-black text-[#00A3FF]">{totalScore}%</span>
          </div>
          
          <div className="mt-2.5 space-y-1.5 w-full">
            <div className="h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900">
              <div 
                className="h-full bg-gradient-to-r from-[#00A3FF] to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${totalScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>{grandTotalDone} / {totalCriteria} critérios concluídos</span>
              <span>Metas do Tratamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOWING PHASES - 2 COLUMN GRID DESIGN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pdp-structure-grid">
        
        {/* LEFT COLUMN: PHASE 1, 2, 3 COGNITIVE FRAMEWORKS (6 Span out of 12) */}
        <div className="lg:col-span-7 space-y-6" id="pdp-left-flow">
          
          {/* FASE 1: MOTIVAÇÃO CARD */}
          <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-4 shadow-sm" id="pdp-card-phase-1">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 rounded text-xs bg-[#00A3FF]/10 text-[#00A3FF] font-sans font-black">FASE 1</span>
                <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans">Motivação para Mudança de Repertório</h4>
              </div>
              <span className="text-[9px] font-mono text-gray-500 px-2 py-0.5 rounded bg-gray-950 border border-gray-900">
                {doneFase1} / 5 Concluídos
              </span>
            </div>

            {/* Questions lists */}
            <div className="space-y-4">
              {/* Noções Iniciais */}
              <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">1. Noções Iniciais da HP</label>
                  <button 
                    onClick={() => toggleFase1Done("nocoes_iniciais")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                    style={{ color: pdpState.fase1.nocoes_iniciais.done ? '#00A3FF' : '#555' }}
                  >
                    {pdpState.fase1.nocoes_iniciais.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={pdpState.fase1.nocoes_iniciais.text}
                  onChange={(e) => updateFase1Field("nocoes_iniciais", e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans"
                  placeholder="Definição clínica e descrição básica do funcionamento desta HP..."
                />
              </div>

              {/* Valores Relacionados */}
              <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">2. Valores Existenciais Correlatos</label>
                  <button 
                    onClick={() => toggleFase1Done("valores_relacionados")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                    style={{ color: pdpState.fase1.valores_relacionados.done ? '#00A3FF' : '#555' }}
                  >
                    {pdpState.fase1.valores_relacionados.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={pdpState.fase1.valores_relacionados.text}
                  onChange={(e) => updateFase1Field("valores_relacionados", e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans"
                  placeholder="Quais valores vitais justificam o esforço de desenvolver essa HP?"
                />
              </div>

              {/* Beneficios */}
              <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">3. Benefícios dessa HP</label>
                  <button 
                    onClick={() => toggleFase1Done("beneficios_hp")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                    style={{ color: pdpState.fase1.beneficios_hp.done ? '#00A3FF' : '#555' }}
                  >
                    {pdpState.fase1.beneficios_hp.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={pdpState.fase1.beneficios_hp.text}
                  onChange={(e) => updateFase1Field("beneficios_hp", e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans"
                  placeholder="Quais ganhos adaptativos e libertação essa HP trará ao paciente?"
                />
              </div>

              {/* Impactos do deficit */}
              <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">4. Impactos do Déficit nessa HP</label>
                  <button 
                    onClick={() => toggleFase1Done("impactos_deficit")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                    style={{ color: pdpState.fase1.impactos_deficit.done ? '#00A3FF' : '#555' }}
                  >
                    {pdpState.fase1.impactos_deficit.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={pdpState.fase1.impactos_deficit.text}
                  onChange={(e) => updateFase1Field("impactos_deficit", e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans"
                  placeholder="Quais perdas, sintomas e crises o deficit dessa HP perpetua?"
                />
              </div>

              {/* Ganhos do atual padrao */}
              <div className="space-y-1.5 bg-gray-950/40 p-3 rounded-lg border border-gray-900/60 block">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">5. Ganhos Secundários do Padrão Atual</label>
                  <button 
                    onClick={() => toggleFase1Done("ganhos_atual_padrao")}
                    className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                    style={{ color: pdpState.fase1.ganhos_atual_padrao.done ? '#00A3FF' : '#555' }}
                  >
                    {pdpState.fase1.ganhos_atual_padrao.done ? (
                      <><CheckSquare size={13} strokeWidth={2.5} /> Concluída</>
                    ) : (
                      <><Square size={13} strokeWidth={2.5} /> Pendente</>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={pdpState.fase1.ganhos_atual_padrao.text}
                  onChange={(e) => updateFase1Field("ganhos_atual_padrao", e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans"
                  placeholder="Por que é tão difícil mudar? O que o atual padrão disfuncional protege temporariamente?"
                />
              </div>

            </div>
          </div>

          {/* FASE 2: CORRIGINDO DISTORÇÕES CARD */}
          <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3 shadow-sm" id="pdp-card-phase-2">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 rounded text-xs bg-indigo-500/10 text-indigo-400 font-sans font-black">FASE 2</span>
                <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans">Corrigindo Distorções (Reestruturação Célebre)</h4>
              </div>
              <button 
                onClick={toggleFase2Done}
                className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                style={{ color: pdpState.fase2.investigacao_reestruturacao.done ? '#00A3FF' : '#555' }}
              >
                {pdpState.fase2.investigacao_reestruturacao.done ? (
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
                value={pdpState.fase2.investigacao_reestruturacao.text}
                onChange={(e) => updateFase2Field(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans"
                placeholder="Questione as crenças sabotadoras limitantes que impedem o paciente de agir sob desconforto. Crie novas diretrizes para neutralizar as distorções..."
              />
            </div>
          </div>

          {/* FASE 3: MENTALIDADES CARD */}
          <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-3 shadow-sm" id="pdp-card-phase-3">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 rounded text-xs bg-purple-500/10 text-purple-400 font-sans font-black">FASE 3</span>
                <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans">Mentalidades de Suporte (Enfrentamento)</h4>
              </div>
              <button 
                onClick={toggleFase3Done}
                className="flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase hover:brightness-135 bg-transparent border-0 cursor-pointer"
                style={{ color: pdpState.fase3.leitura_selecao_reflexao.done ? '#00A3FF' : '#555' }}
              >
                {pdpState.fase3.leitura_selecao_reflexao.done ? (
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
                value={pdpState.fase3.leitura_selecao_reflexao.text}
                onChange={(e) => updateFase3Field(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-900/60 text-xs text-gray-250 py-1 px-0 focus:outline-none focus:border-[#00A3FF]/30 resize-none font-sans"
                placeholder="Declare frases e raciocínios saudáveis que contragolpeiam os esquemas desadaptativos do paciente ativados em situações de crise..."
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SOURCES & EXERCISES ACTION LISTS (5 Span out of 12) */}
        <div className="lg:col-span-5 space-y-6" id="pdp-right-flow">
          
          {/* FASE 4: IMERSÃO (FONTES DE CONHECIMENTO) */}
          <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-4 shadow-sm" id="pdp-card-phase-4">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 rounded text-xs bg-emerald-550/10 text-emerald-400 font-sans font-black">FASE 4</span>
                <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans flex items-center gap-1">
                  <BookOpen size={12} className="text-emerald-400" /> Fontes de Imersão
                </h4>
              </div>
              <span className="text-[9px] font-mono text-gray-500 px-2 py-0.5 rounded bg-gray-950 border border-gray-900">
                {doneFase4} / 6 Concluídas
              </span>
            </div>

            <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
              Indique livros, aulas, episódios de podcasts, artigos teóricos ou palestras sobre esta HP para educar os caminhos neurais secundários do cérebro.
            </p>

            <div className="space-y-3 h-[415px] overflow-y-auto pr-1">
              {pdpState.fase4.map((item, idx) => (
                <div key={item.id} className="flex gap-2.5 items-center p-2.5 rounded-lg border border-gray-900 hover:border-gray-800 bg-gray-950/45 transition-colors">
                  <span className="text-[11px] font-mono font-extrabold text-[#00A3FF] w-6 shrink-0 text-center bg-[#00A3FF]/5 py-0.5 rounded border border-[#00A3FF]/10">{idx + 1}ª</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateFase4Item(item.id, e.target.value)}
                    className="flex-1 bg-transparent border-0 text-xs text-gray-200 py-0 focus:outline-none focus:ring-0 min-w-0"
                    placeholder="Nome da fonte (Livro, Link, Podcast etc.)..."
                  />
                  <button
                    onClick={() => toggleFase4Item(item.id)}
                    className="bg-transparent border-0 cursor-pointer p-0.5 transition-colors"
                    style={{ color: item.done ? '#10B981' : '#374151' }}
                    title={item.done ? "Marcar como pendente" : "Marcar como concluída"}
                  >
                    {item.done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-750" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FASE 5: EXERCÍCIOS PRÁTICOS (REGIME DE TREINO) */}
          <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 space-y-4 shadow-sm" id="pdp-card-phase-5">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 rounded text-xs bg-amber-500/10 text-amber-400 font-sans font-black">FASE 5</span>
                <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-sans flex items-center gap-1">
                  <Award size={12} className="text-amber-400" /> Prescrição de Exercícios
                </h4>
              </div>
              <span className="text-[9px] font-mono text-gray-500 px-2 py-0.5 rounded bg-gray-950 border border-gray-900">
                {doneFase5} / 10 Praticados
              </span>
            </div>

            <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
              Insira as condutas, ações de exposição, treinos estruturados e modificações comportamentais deliberadas que o paciente exercita ativamente no seu dia a dia.
            </p>

            <div className="space-y-2.5 h-[415px] overflow-y-auto pr-1">
              {pdpState.fase5.map((item, idx) => (
                <div key={item.id} className="flex gap-2.5 items-center p-2 rounded-lg border border-gray-900 hover:border-gray-800 bg-gray-950/45 transition-colors">
                  <span className="text-[11px] font-mono font-extrabold text-amber-400 w-6 shrink-0 text-center bg-amber-500/5 py-0.5 rounded border border-amber-500/10">{idx + 1}º</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateFase5Item(item.id, e.target.value)}
                    className="flex-1 bg-transparent border-0 text-xs text-gray-250 py-0 focus:outline-none focus:ring-0 min-w-0"
                    placeholder="Exercício clínico ou ação de enfrentamento..."
                  />
                  <button
                    onClick={() => toggleFase5Item(item.id)}
                    className="bg-transparent border-0 cursor-pointer p-0.5 transition-colors"
                    style={{ color: item.done ? '#F59E0B' : '#374151' }}
                    title={item.done ? "Marcar como pendente" : "Marcar como concluído"}
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
  );
}
