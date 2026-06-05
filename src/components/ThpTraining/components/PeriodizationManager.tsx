/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Patient, TrainingPeriod, PsychologicalSkill } from "../types";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  BadgeAlert, 
  Edit, 
  CheckSquare, 
  AlertTriangle,
  PlayCircle
} from "lucide-react";
import FieldHelp from "./FieldHelp";

interface PeriodizationManagerProps {
  patient: Patient;
  onUpdatePeriodization: (periods: TrainingPeriod[]) => void;
}

export default function PeriodizationManager({ patient, onUpdatePeriodization }: PeriodizationManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  // Form states of editing or creating
  const [skill, setSkill] = useState<PsychologicalSkill>(PsychologicalSkill.ResolutividadeEnfrentamento);
  const [title, setTitle] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [phase, setPhase] = useState<"Aquece" | "Ativo" | "Consolidação">("Ativo");
  const [priority, setPriority] = useState<"Alta" | "Média" | "Baixa">("Média");

  // Exercise creation
  const [exTitle, setExTitle] = useState("");
  const [exXp, setExXp] = useState(150);
  const [activeExPeriodId, setActiveExPeriodId] = useState<string | null>(null);

  const startAddPeriod = () => {
    setSkill(PsychologicalSkill.ResolutividadeEnfrentamento);
    setTitle("");
    setDurationWeeks(4);
    setPhase("Ativo");
    setPriority("Média");
    setEditingPeriodId(null);
    setShowAddForm(true);
  };

  const savePeriod = () => {
    if (!title.trim()) return alert("Insira um título descritivo para a fase do treino.");

    let updatedPeriods = [...patient.periodization];

    if (editingPeriodId) {
      // Edit
      updatedPeriods = updatedPeriods.map(p => p.id === editingPeriodId ? {
        ...p,
        skill,
        title,
        durationWeeks: Number(durationWeeks),
        phase,
        priority
      } : p);
      setEditingPeriodId(null);
    } else {
      // Create new
      const newPeriod: TrainingPeriod = {
        id: `p-${Date.now()}`,
        skill,
        title,
        durationWeeks: Number(durationWeeks),
        phase,
        completed: false,
        priority,
        exercises: []
      };
      updatedPeriods.push(newPeriod);
    }

    onUpdatePeriodization(updatedPeriods);
    setShowAddForm(false);
  };

  const deletePeriod = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta fase de periodização técnica?")) {
      const filtered = patient.periodization.filter(p => p.id !== id);
      onUpdatePeriodization(filtered);
    }
  };

  const togglePeriodComplete = (id: string) => {
    const updated = patient.periodization.map(p => 
      p.id === id ? { ...p, completed: !p.completed } : p
    );
    onUpdatePeriodization(updated);
  };

  const startEditPeriod = (period: TrainingPeriod) => {
    setSkill(period.skill);
    setTitle(period.title);
    setDurationWeeks(period.durationWeeks);
    setPhase(period.phase);
    setPriority(period.priority);
    setEditingPeriodId(period.id);
    setShowAddForm(true);
  };

  /* Exercise Subactions */
  const addExerciseToPeriod = (periodId: string) => {
    if (!exTitle.trim()) return alert("Insira o nome do exercício clínico.");

    const updated = patient.periodization.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          exercises: [
            ...p.exercises,
            {
              id: `ex-${Date.now()}`,
              title: exTitle,
              completed: false,
              rewardXp: exXp
            }
          ]
        };
      }
      return p;
    });

    onUpdatePeriodization(updated);
    setExTitle("");
    setExXp(150);
    setActiveExPeriodId(null);
  };

  const deleteExerciseFromPeriod = (periodId: string, exId: string) => {
    const updated = patient.periodization.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          exercises: p.exercises.filter(ex => ex.id !== exId)
        };
      }
      return p;
    });
    onUpdatePeriodization(updated);
  };

  const toggleExerciseComplete = (periodId: string, exId: string) => {
    const updated = patient.periodization.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          exercises: p.exercises.map(ex => 
            ex.id === exId ? { ...ex, completed: !ex.completed } : ex
          )
        };
      }
      return p;
    });
    onUpdatePeriodization(updated);
  };

  // Get cumulative stats mapping
  const totalWeeks = patient.periodization.reduce((sum, p) => sum + p.durationWeeks, 0);
  const activeSkillsCount = new Set(patient.periodization.map(p => p.skill)).size;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Overview Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-sidebar rounded-xl border border-border-subtle p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-lg">
            <Calendar className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-text-dim font-mono block">Ciclo Completo THP</span>
            <span className="text-xl font-black text-text-main tracking-tight">{totalWeeks} Semanas</span>
          </div>
        </div>

        <div className="bg-bg-sidebar rounded-xl border border-border-subtle p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-lg">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-text-dim font-mono block">Habilidades em Foco</span>
            <span className="text-xl font-black text-text-main tracking-tight">{activeSkillsCount} de {Object.values(PsychologicalSkill).length} HPs</span>
          </div>
        </div>

        <div className="bg-bg-sidebar rounded-xl border border-border-subtle p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-primary rounded-lg">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-text-dim font-mono block">Exercícios Totais</span>
            <span className="text-xl font-black text-text-main tracking-tight">
              {patient.periodization.flatMap(p => p.exercises).filter(ex => ex.completed).length} / {patient.periodization.flatMap(p => p.exercises).length} Concluídos
            </span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex justify-between items-center bg-bg-sidebar p-4 rounded-xl border border-border-subtle shadow-sm">
        <div className="text-sm font-semibold text-text-main">Prontuário de HPs Ativo: <span className="font-bold text-primary">{patient.name}</span></div>
        <button
          onClick={startAddPeriod}
          className="flex items-center gap-1.5 px-4 py-2 bg-bg-deep hover:bg-white/10 text-white font-semibold text-xs rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Adicionar Bloco de Treino
        </button>
      </div>

      {/* Editor & Creation Form */}
      {showAddForm && (
        <div className="bg-bg-card rounded-xl border-2 border-dashed border-border-subtle p-6 space-y-4">
          <h4 className="font-bold text-text-main text-sm flex items-center gap-1.5">
            <Edit className="w-4 h-4 text-primary" />
            {editingPeriodId ? "Alterar Bloco de Treino Existente" : "Inserir Novo Bloco de Periodização Técnica"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center text-xs font-semibold text-text-dim mb-1">
                <span>Habilidade Psicológica (HP)</span>
                <FieldHelp 
                  title="Habilidade Psicológica"
                  suggestion="Selecione um déficit comportamental estrutural para focar."
                  explanation="Vincular a intervenção a uma competência sadia específica que se opõe ao EID ativado (ex: Sociabilidade se opõe ao Isolamento)."
                />
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as PsychologicalSkill)}
                className="w-full bg-bg-sidebar border border-border-subtle rounded-lg p-2 text-sm text-text-main outline-none"
              >
                {Object.values(PsychologicalSkill).map(hpVal => (
                  <option key={hpVal} value={hpVal}>{hpVal}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-text-dim mb-1">
                <span>Título/Meta da Fase</span>
                <FieldHelp 
                  title="Meta da Fase de Treino"
                  suggestion="O foco prático que o paciente tentará executar."
                  explanation="Consolida o escopo semântico das tarefas cotidianas do paciente nas próximas semanas."
                  example="Ex: Reestruturação Cognitiva síncrona sob fogo cruzado corporativo."
                />
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Treino Clínico de Assertividade Ativa"
                className="w-full bg-bg-sidebar border border-border-subtle rounded-lg p-2 text-sm text-text-main outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="flex items-center text-xs font-semibold text-text-dim mb-1">
                  <span>Duração (Sem)</span>
                  <FieldHelp 
                    title="Duração em Semanas"
                    suggestion="Recomendado de 4 a 12 semanas por ciclo de treinamento."
                    explanation="Ciclo cronológico estruturado compatível com os princípios de neuroplasticidade sináptica e consolidação de hábitos."
                  />
                </label>
                <input
                  type="number"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  min={1}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg p-2 text-sm text-text-main outline-none font-mono"
                />
              </div>

              <div>
                <label className="flex items-center text-xs font-semibold text-text-dim mb-1">
                  <span>Fase Técnica</span>
                  <FieldHelp 
                    title="Fase do Ciclo Técnico"
                    suggestion="Selecione o nível de autonomia do paciente."
                    explanation="Aquece foca em motivar; Ativo foca na prática clínica síncrona; Consolidação promove e testa ferramentas de autoterapia residual."
                  />
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as any)}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg p-2 text-sm text-text-main outline-none"
                >
                  <option value="Aquece">Aquece (Motivação)</option>
                  <option value="Ativo">Ativo (Treino Secundário)</option>
                  <option value="Consolidação">Consolidação</option>
                </select>
              </div>

              <div>
                <label className="flex items-center text-xs font-semibold text-text-dim mb-1">
                  <span>Prioridade</span>
                  <FieldHelp 
                    title="Prioridade Clínica"
                    suggestion="Relevância da intervenção baseada na queixa principal."
                    explanation="Auxilia a ordenar hierarquicamente as atenções da terapia face às limitações energéticas do paciente."
                  />
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg p-2 text-sm text-text-main outline-none"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setShowAddForm(false); setEditingPeriodId(null); }}
              className="px-3.5 py-1.5 bg-bg-sidebar hover:bg-bg-deep text-text-main text-xs font-bold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={savePeriod}
              className="px-4 py-1.5 bg-primary text-bg-deep font-bold hover:bg-primary-hover text-bg-deep font-bold text-white text-xs font-bold rounded-lg transition shadow-sm"
            >
              {editingPeriodId ? "Confirmar Mudança" : "Gravar Fase"}
            </button>
          </div>
        </div>
      )}

      {/* Main Periodization Loop */}
      <div className="space-y-4">
        {patient.periodization.map((period, index) => {
          const isCompleted = period.completed;

          return (
            <div 
              key={period.id} 
              className={`bg-bg-sidebar rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
                isCompleted ? "opacity-65 border-emerald-200 hover:opacity-100" : "border-border-subtle"
              }`}
            >
              <div className="p-5 flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-text-dim">Semana [0{index + 1}]</span>
                    
                    {/* Phase identifier */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      period.phase === "Aquece" ? "bg-amber-100 text-amber-700 border border-amber-200/50" :
                      period.phase === "Ativo" ? "bg-indigo-100 text-primary border border-primary/20/50" :
                      "bg-primary/10 text-primary border-emerald-200/50"
                    }`}>
                      {period.phase}
                    </span>

                    {/* Priority badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      period.priority === "Alta" ? "bg-red-50 text-red-700 border border-red-100" :
                      period.priority === "Média" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-bg-sidebar text-text-main"
                    }`}>
                      Prioridade {period.priority}
                    </span>

                    <span className="text-xs text-text-dim flex items-center gap-1">
                      <Clock className="w-3 h-3 text-text-dim" />
                      {period.durationWeeks} semanas de intervenção
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-text-main tracking-tight flex items-center gap-2">
                    <span className="text-primary">{period.skill}:</span> 
                    {period.title}
                  </h4>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePeriodComplete(period.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      isCompleted 
                        ? "bg-primary hover:bg-primary border-primary text-white" 
                        : "border-border-subtle hover:bg-bg-card text-text-dim"
                    }`}
                    title={isCompleted ? "Reativar Fase de Treino" : "Marcar Fase como Feita"}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => startEditPeriod(period)}
                    className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-card text-text-dim transition"
                    title="Editar Bloco de Periodização"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deletePeriod(period.id)}
                    className="p-1.5 rounded-lg border border-border-subtle hover:bg-red-50 hover:text-red-500 text-text-dim transition"
                    title="Excluir Bloco de Periodização"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Connected Clinical Exercises Area */}
              <div className="p-4 bg-bg-card/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim font-mono">Exercícios Comportamentais Vinculados</span>
                  
                  {activeExPeriodId !== period.id ? (
                    <button
                      onClick={() => setActiveExPeriodId(period.id)}
                      className="text-[10px] text-primary font-bold hover:underline bg-transparent border-0"
                    >
                      + Adicionar Exercício
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-bg-sidebar p-2 rounded-lg border border-border-subtle shadow-sm max-w-[400px]">
                      <input
                        type="text"
                        value={exTitle}
                        onChange={(e) => setExTitle(e.target.value)}
                        placeholder="Nome do exercício..."
                        className="bg-bg-card border border-border-subtle rounded px-2 py-1 text-[11px] text-text-main outline-none w-44"
                      />
                      <input
                        type="number"
                        value={exXp}
                        onChange={(e) => setExXp(Number(e.target.value))}
                        placeholder="XP"
                        className="bg-bg-card border border-border-subtle rounded px-1 py-1 text-[11px] text-text-main outline-none w-14 font-mono text-center"
                      />
                      <button
                        onClick={() => addExerciseToPeriod(period.id)}
                        className="px-2 py-1 bg-primary text-bg-deep font-bold text-white rounded text-[10px] font-bold"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => { setActiveExPeriodId(null); setExTitle(""); }}
                        className="text-[10px] text-text-dim font-bold hover:underline"
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {period.exercises.map(ex => {
                    return (
                      <div 
                        key={ex.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                          ex.completed 
                            ? "bg-emerald-50 bg-opacity-70 border-emerald-100 text-text-dim" 
                            : "bg-bg-sidebar border-border-subtle text-text-main"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={ex.completed}
                            onChange={() => toggleExerciseComplete(period.id, ex.id)}
                            className="rounded text-primary border-border-subtle w-4 h-4 cursor-pointer focus:ring-2 focus:ring-indigo-500/40"
                          />
                          <span className={`text-xs ${ex.completed ? "line-through text-text-dim" : "font-medium"}`}>
                            {ex.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-mono font-bold rounded">
                            +{ex.rewardXp} XP
                          </span>
                          <button
                            onClick={() => deleteExerciseFromPeriod(period.id, ex.id)}
                            className="p-1 text-text-main hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {period.exercises.length === 0 && (
                    <div className="md:col-span-2 text-center p-4 border border-dashed border-border-subtle rounded-lg text-text-dim text-xs">
                      Não há exercícios comportamentais pendentes de treino nesta fase. Adicione clicando no botão acima.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {patient.periodization.length === 0 && (
          <div className="text-center p-8 bg-bg-card border border-border-subtle rounded-xl text-text-dim text-xs">
            Nenhuma diretriz de periodização técnica cadastrada para o paciente atual. Adicione blocos para estruturar o tratamento dele.
          </div>
        )}
      </div>

    </div>
  );
}
