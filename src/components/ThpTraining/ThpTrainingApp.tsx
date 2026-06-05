import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { syncService } from '../../lib/syncService';
import { Patient, EarlyNeed, SchemaEID, CopingStyle, PsychologicalSkill, TrainingPeriod, SessionLog } from './types';
import Sidebar from './components/Sidebar';
import PatientSelector from './components/PatientSelector';
import ScalesCabinet from './components/ScalesCabinet';
import ClinicalMap from './components/ClinicalMap';
import PharmacologyConsultant from './components/PharmacologyConsultant';
import PeriodizationManager from './components/PeriodizationManager';
import TrainingModule from './components/TrainingModule';
import TherapistReport from './components/TherapistReport';
import { Toaster, toast } from 'react-hot-toast';
import { Activity } from 'lucide-react';

interface ThpTrainingAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
}

export default function ThpTrainingApp({ activePatientId, lockPatient = false, userId }: ThpTrainingAppProps) {
  const [activeTab, setActiveTab] = useState<string>('profiler');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [thpPatient, setThpPatient] = useState<Patient | null>(null);

  // Load patients list and map to Patient type
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const all = await db.pacientes.toArray();
        const mapped = await Promise.all(
          all.map(async (p) => {
            const prontuario = await db.prontuarios.get(p.id);
            if (prontuario?.thpState) {
              return prontuario.thpState;
            }

            let age = 30;
            if (p.nascimento) {
              age = new Date().getFullYear() - new Date(p.nascimento).getFullYear();
            }

            return {
              id: p.id,
              name: p.nome,
              age: age,
              profession: "Paciente",
              clinicalQueixa: "",
              establishingOperations: "",
              neglectedNeeds: [],
              activeSchemas: [],
              beliefs: { coreBeliefs: [], intermediateBeliefs: [], automaticThoughts: [] },
              copingStyleSelected: CopingStyle.Evitacao,
              copingBehaviors: [],
              periodization: [],
              sessionHistory: [],
              level: 1,
              xp: 0,
              streakDays: 1,
              unlockedBadges: [],
              scaleHistory: [],
              sudLogs: [],
              activePrescriptions: []
            } as Patient;
          })
        );
        setPatients(mapped);
        if (activePatientId) {
          setSelectedPatientId(String(activePatientId));
        } else if (mapped.length > 0) {
          setSelectedPatientId(mapped[0].id);
        }
      } catch (err) {
        console.error("Failed to load patients list:", err);
      }
    };
    loadPatients();
  }, [activePatientId]);

  // Load THP patient state when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      loadThpPatient(selectedPatientId);
    } else {
      setThpPatient(null);
    }
  }, [selectedPatientId]);

  const loadThpPatient = async (patientId: string) => {
    if (!patientId) return;
    try {
      const prontuario = await db.prontuarios.get(patientId);
      const paciente = await db.pacientes.get(patientId);
      if (!paciente) return;

      // Calculate age
      let age = 30;
      if (paciente.nascimento) {
        const birthYear = new Date(paciente.nascimento).getFullYear();
        const currentYear = new Date().getFullYear();
        age = currentYear - birthYear;
      }

      if (prontuario?.thpState) {
        const savedState = prontuario.thpState;
        setThpPatient({
          ...savedState,
          id: patientId,
          name: paciente.nome,
          age: age
        });
        return;
      }

      // No saved THP state. Let's auto-populate from PCI/YSQ/RIDs!
      console.log("Initializing THP patient state from prontuário data...");
      
      const activeSchemas: SchemaEID[] = [];
      const scaleHistory: any[] = [];
      
      let ysqAnswers: Record<number, number> = {};
      let ysqDate = "";
      
      const schemaKeyToEnum: Record<string, SchemaEID> = {
        ED: SchemaEID.PrivacaoEmocional,
        AB: SchemaEID.Abandono,
        MA: SchemaEID.Desconfianca,
        SI: SchemaEID.IsolamentoSocial,
        DS: SchemaEID.Defectividade,
        FA: SchemaEID.Fracasso,
        DI: SchemaEID.Dependencia,
        VH: SchemaEID.Vulnerabilidade,
        EM: SchemaEID.Emaranhamento,
        SB: SchemaEID.Subjugacao,
        SS: SchemaEID.AutoSacrificio,
        AS: SchemaEID.BuscaAprovacao,
        NP: SchemaEID.Negatividade,
        EI: SchemaEID.InibicaoEmocional,
        US: SchemaEID.PadroesInflexiveis,
        PU: SchemaEID.Punitividade,
        ET: SchemaEID.Grandiosidade,
        IS: SchemaEID.AutocontroleInsuficiente
      };

      if (prontuario?.entradas) {
        const ysqEntry = prontuario.entradas.find(e => e.tipo === 'ysq' || e.metadata?.type === 'ysq');
        if (ysqEntry) {
          const ysqData = ysqEntry.metadata?.ysqData;
          if (ysqData && ysqData.answers) {
            ysqAnswers = ysqData.answers;
            ysqDate = ysqEntry.data;
            
            const schemaSums: Record<string, number> = {};
            const schemaCounts: Record<string, number> = {};
            
            const schemaKeys = ["ED", "AB", "MA", "SI", "DS", "FA", "DI", "VH", "EM", "SB", "SS", "AS", "NP", "EI", "US", "PU", "ET", "IS"];
            
            Object.entries(ysqAnswers).forEach(([qidStr, val]) => {
              const qid = Number(qidStr);
              const keyIdx = (qid - 1) % 18;
              const schemaKey = schemaKeys[keyIdx];
              schemaSums[schemaKey] = (schemaSums[schemaKey] || 0) + Number(val);
              schemaCounts[schemaKey] = (schemaCounts[schemaKey] || 0) + 1;
            });

            Object.keys(schemaKeyToEnum).forEach(key => {
              const avg = (schemaSums[key] || 0) / (schemaCounts[key] || 5);
              if (avg >= 4) {
                activeSchemas.push(schemaKeyToEnum[key]);
              }
            });

            scaleHistory.push({
              id: `ysq-scale-${Date.now()}`,
              date: ysqDate || new Date().toISOString().split("T")[0],
              type: "BDI",
              score: activeSchemas.length,
              classification: `YSQ: ${activeSchemas.length} Esquemas Ativos`
            });
          }
        }
      }

      let clinicalQueixa = "";
      let establishingOperations = "";
      const neglectedNeeds: EarlyNeed[] = [];
      const beliefs = {
        coreBeliefs: [] as string[],
        intermediateBeliefs: [] as string[],
        automaticThoughts: [] as string[]
      };
      let copingStyleSelected = CopingStyle.Evitacao;
      const copingBehaviors: string[] = [];

      if (prontuario?.entradas) {
        const pciEntry = prontuario.entradas.find(e => e.tipo === 'pci' || e.metadata?.type === 'pci');
        if (pciEntry) {
          const pci = pciEntry.metadata?.pciData;
          if (pci) {
            clinicalQueixa = pci.eventoQueixas || "";
            establishingOperations = pci.rotina || "";
            
            const needsText = (pci.necessidadesIdentificadas || "") + " " + (pci.eventoQueixas || "");
            Object.values(EarlyNeed).forEach(need => {
              if (needsText.toLowerCase().includes(need.toLowerCase())) {
                if (!neglectedNeeds.includes(need)) neglectedNeeds.push(need);
              }
            });

            const schemasText = (pci.esquemasCognitivos || "");
            Object.values(SchemaEID).forEach(schema => {
              if (schemasText.toLowerCase().includes(schema.toLowerCase())) {
                if (!activeSchemas.includes(schema)) activeSchemas.push(schema);
              }
            });

            if (pci.crencasCentrais) {
              beliefs.coreBeliefs = pci.crencasCentrais.split(/[;\n]/).map((s: string) => s.trim()).filter(Boolean);
            }
            if (pci.crencasPerifericas) {
              beliefs.intermediateBeliefs = pci.crencasPerifericas.split(/[;\n]/).map((s: string) => s.trim()).filter(Boolean);
            }
            if (pci.ridPensamento) {
              beliefs.automaticThoughts = pci.ridPensamento.split(/[;\n]/).map((s: string) => s.trim()).filter(Boolean);
            }

            if (pci.ridComportamento) {
              const compText = pci.ridComportamento.toLowerCase();
              if (compText.includes("fuga") || compText.includes("evitar") || compText.includes("esquiva") || compText.includes("isol")) {
                copingStyleSelected = CopingStyle.Evitacao;
              } else if (compText.includes("agred") || compText.includes("combate") || compText.includes("hiper") || compText.includes("arrog")) {
                copingStyleSelected = CopingStyle.Hipercompensacao;
              } else {
                copingStyleSelected = CopingStyle.Rendicao;
              }
            }
            if (pci.excessosComp) {
              copingBehaviors.push(...pci.excessosComp.split(/[;\n]/).map((s: string) => s.trim()).filter(Boolean));
            }
          }
        }

        const ridEntries = prontuario.entradas.filter(e => e.tipo === 'rid');
        ridEntries.forEach(rid => {
          const ridData = rid.metadata?.ridData;
          if (ridData) {
            const needVal = ridData.needs || "";
            Object.values(EarlyNeed).forEach(need => {
              if (needVal.toLowerCase().includes(need.toLowerCase())) {
                if (!neglectedNeeds.includes(need)) neglectedNeeds.push(need);
              }
            });
            if (ridData.resThoughts && !beliefs.automaticThoughts.includes(ridData.resThoughts)) {
              beliefs.automaticThoughts.push(ridData.resThoughts);
            }
            if (ridData.resActions && !copingBehaviors.includes(ridData.resActions)) {
              copingBehaviors.push(ridData.resActions);
            }
          }
        });
      }

      if (neglectedNeeds.length === 0) {
        neglectedNeeds.push(EarlyNeed.Vinculo, EarlyNeed.Autonomia);
      }
      if (activeSchemas.length === 0) {
        activeSchemas.push(SchemaEID.Defectividade, SchemaEID.Fracasso);
      }
      if (beliefs.coreBeliefs.length === 0) {
        beliefs.coreBeliefs.push("Sou inadequado", "Vou falhar");
      }
      if (beliefs.intermediateBeliefs.length === 0) {
        beliefs.intermediateBeliefs.push("Se eu me expuser, vão rir de mim", "Devo ser perfeito");
      }
      if (beliefs.automaticThoughts.length === 0) {
        beliefs.automaticThoughts.push("Vou gaguejar e travar", "Todo mundo está olhando para meus erros");
      }
      if (copingBehaviors.length === 0) {
        copingBehaviors.push("Falar rápido para acabar logo", "Evitar contatos visuais prolongados");
      }

      const periodization: TrainingPeriod[] = [];
      
      const schemaToSkill: Record<SchemaEID, PsychologicalSkill> = {
        [SchemaEID.Fracasso]: PsychologicalSkill.RealismoOtimista,
        [SchemaEID.Abandono]: PsychologicalSkill.AutorregulacaoEmocional,
        [SchemaEID.Desconfianca]: PsychologicalSkill.ImunidadeSocial,
        [SchemaEID.PrivacaoEmocional]: PsychologicalSkill.Autoconhecimento,
        [SchemaEID.Defectividade]: PsychologicalSkill.Autoestima,
        [SchemaEID.IsolamentoSocial]: PsychologicalSkill.Sociabilidade,
        [SchemaEID.Dependencia]: PsychologicalSkill.Autocontrole,
        [SchemaEID.Vulnerabilidade]: PsychologicalSkill.AutorregulacaoEmocional,
        [SchemaEID.Emaranhamento]: PsychologicalSkill.Autoconhecimento,
        [SchemaEID.Grandiosidade]: PsychologicalSkill.SensibilidadeSocial,
        [SchemaEID.AutocontroleInsuficiente]: PsychologicalSkill.Autocontrole,
        [SchemaEID.Subjugacao]: PsychologicalSkill.ResolutividadeEnfrentamento,
        [SchemaEID.AutoSacrificio]: PsychologicalSkill.SensibilidadeSocial,
        [SchemaEID.BuscaAprovacao]: PsychologicalSkill.Autoestima,
        [SchemaEID.Negatividade]: PsychologicalSkill.RealismoOtimista,
        [SchemaEID.InibicaoEmocional]: PsychologicalSkill.Sociabilidade,
        [SchemaEID.PadroesInflexiveis]: PsychologicalSkill.HedonismoResponsavel,
        [SchemaEID.Punitividade]: PsychologicalSkill.SensibilidadeSocial
      };

      const addedSkills = new Set<PsychologicalSkill>();
      activeSchemas.forEach(schema => {
        const skill = schemaToSkill[schema];
        if (skill && !addedSkills.has(skill)) {
          addedSkills.add(skill);
          periodization.push({
            id: `p-${Date.now()}-${periodization.length}`,
            skill,
            title: `Treino Clínico: ${skill}`,
            durationWeeks: 4,
            phase: "Ativo",
            completed: false,
            priority: "Alta",
            exercises: []
          });
        }
      });

      if (periodization.length === 0) {
        periodization.push({
          id: `p-${Date.now()}-0`,
          skill: PsychologicalSkill.ResolutividadeEnfrentamento,
          title: "Treino Clínico: Resolutividade e Enfrentamento",
          durationWeeks: 4,
          phase: "Ativo",
          completed: false,
          priority: "Média",
          exercises: []
        });
      }

      const defaultPatient: Patient = {
        id: patientId,
        name: paciente.nome,
        age: age,
        profession: paciente.historicoHtml?.includes("Profissão") ? "Profissional" : "Estudante",
        clinicalQueixa,
        establishingOperations,
        neglectedNeeds,
        activeSchemas,
        beliefs,
        copingStyleSelected,
        copingBehaviors,
        periodization,
        sessionHistory: [],
        level: 1,
        xp: 0,
        streakDays: 1,
        unlockedBadges: [],
        scaleHistory,
        sudLogs: [],
        activePrescriptions: []
      };

      await db.prontuarios.update(patientId, { thpState: defaultPatient });
      setThpPatient(defaultPatient);
    } catch (err) {
      console.error("Failed to load patient THP state:", err);
    }
  };

  const handleUpdatePatient = async (updated: Patient) => {
    setThpPatient(updated);
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    
    // Save to Dexie prontuarios
    await db.prontuarios.update(updated.id, { thpState: updated });
    
    // Cloud sync
    if (userId) {
      const updatedRecord = await db.prontuarios.get(updated.id);
      if (updatedRecord) {
        await syncService.saveToCloud(userId, 'prontuarios', updatedRecord);
      }
    }
  };

  const handleUpdatePeriodization = async (periods: TrainingPeriod[]) => {
    if (!thpPatient) return;
    const updated = {
      ...thpPatient,
      periodization: periods
    };
    await handleUpdatePatient(updated);
    toast.success("Periodização de treino atualizada!");
  };

  const handleUpdateSessionHistory = async (log: SessionLog) => {
    if (!thpPatient) return;
    
    let newXp = thpPatient.xp + 100;
    let newLevel = thpPatient.level;
    const xpTarget = newLevel * 500;
    if (newXp >= xpTarget) {
      newXp -= xpTarget;
      newLevel += 1;
      toast.success(`Nível Clínico Elevado! ${thpPatient.name} atingiu Lvl ${newLevel}! 🎉`);
    }

    const updated = {
      ...thpPatient,
      sessionHistory: [log, ...(thpPatient.sessionHistory || [])],
      xp: newXp,
      level: newLevel
    };
    
    await handleUpdatePatient(updated);
    toast.success("Evolução clínica registrada no THP!");

    // Native Timeline entry log
    try {
      const record = await db.prontuarios.get(thpPatient.id);
      const textHtml = `
        <div class="thp-session-entry p-4 bg-white/[0.01] border border-white/[0.06] rounded-xl space-y-2">
          <div class="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2">
            <h5 class="text-xs font-black uppercase text-[#10b981]">Sessão de Treino THP</h5>
            <span class="text-[9px] font-mono opacity-50">${new Date(log.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <p class="text-xs font-semibold text-text-main">Evolução: ${log.evolutionSummary}</p>
          <div class="grid grid-cols-3 gap-2 text-[10px] text-text-dim mt-2 bg-white/[0.01] p-2 rounded-lg border border-white/[0.04]">
            <div><strong>Adesão:</strong> ${log.adherenceScore}%</div>
            <div><strong>Competência Verbal:</strong> ${log.verbalCompetenceScore}%</div>
            <div><strong>Competência Não-Verbal:</strong> ${log.nonVerbalCompetenceScore}%</div>
          </div>
          ${log.clinicalObservations ? `<p class="text-[10px] text-text-dim italic mt-1">Obs: ${log.clinicalObservations}</p>` : ''}
        </div>
      `;

      const newEntry = {
        timestamp: Date.now(),
        data: new Date(log.date).toLocaleDateString('pt-BR'),
        textoHtml: textHtml,
        tipo: 'evolucao' as any,
        metadata: {
          type: 'thp-session',
          thpSessionLog: log
        }
      };

      if (record) {
        const updatedEntradas = [newEntry, ...record.entradas];
        await db.prontuarios.update(thpPatient.id, { entradas: updatedEntradas });
      }
    } catch (e) {
      console.error("Failed to append timeline entry:", e);
    }
  };

  const handleAwardXp = async (amount: number) => {
    if (!thpPatient) return;
    let newXp = thpPatient.xp + amount;
    let newLevel = thpPatient.level;
    
    while (newXp >= newLevel * 500) {
      newXp -= newLevel * 500;
      newLevel += 1;
      toast.success(`Parabéns! Nível Clínico Subiu para Lvl ${newLevel}! 🚀`);
    }

    const unlockedBadges = [...(thpPatient.unlockedBadges || [])];
    const checkBadge = (badgeId: string, title: string, description: string) => {
      if (!unlockedBadges.some(b => b.id === badgeId)) {
        unlockedBadges.push({
          id: badgeId,
          title,
          description,
          unlockedAt: new Date().toISOString()
        });
        toast.success(`Nova Conquista Desbloqueada: ${title}! 🏆`);
      }
    };

    if (newLevel >= 3) checkBadge("lvl-3", "Explorador Ativo", "Atingiu o nível clínico 3 de competências.");
    if (newLevel >= 5) checkBadge("lvl-5", "Mestre de Si", "Atingiu o nível clínico 5 de autorregulação.");
    if (newLevel >= 8) checkBadge("lvl-8", "Resiliência Plena", "Atingiu o nível clínico 8 de imunidade social.");

    const updated = {
      ...thpPatient,
      xp: newXp,
      level: newLevel,
      unlockedBadges
    };
    await handleUpdatePatient(updated);
  };

  return (
    <div className="h-full w-full flex bg-slate-950 text-slate-100 font-sans overflow-hidden select-none relative">
      {thpPatient ? (
        <>
          {/* Left Sidebar */}
          <Sidebar
            currentTab={activeTab}
            setCurrentTab={setActiveTab}
            patientName={thpPatient.name}
            patientLevel={thpPatient.level}
            patientXp={thpPatient.xp}
            streakDays={thpPatient.streakDays}
          />

          {/* Right tab content area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-l border-slate-800">
            <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Módulo Ativo:
                </span>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-900/40">
                  {activeTab === "profiler" && "Prontuário Clínico"}
                  {activeTab === "scales" && "Escalas & Evidências"}
                  {activeTab === "clinical-map" && "Mapeamento Clínico TCC-4"}
                  {activeTab === "pharmacology" && "Psicofarmacologia"}
                  {activeTab === "periodization" && "Periodização de Treino"}
                  {activeTab === "training" && "Laboratório de Treino (HP)"}
                  {activeTab === "report" && "Relatório de Evolução"}
                </span>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 scroller-hide select-text">
              {activeTab === "profiler" && (
                <PatientSelector
                  patients={patients}
                  activePatientId={selectedPatientId}
                  onSelectPatient={setSelectedPatientId}
                  onAddPatient={async (newP) => {
                    // Patients are added via main Cortex menu, but we can initialize its thpState
                    await handleUpdatePatient(newP);
                  }}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={async (id) => {
                    // Archive thpState
                    const prontuario = await db.prontuarios.get(id);
                    if (prontuario) {
                      await db.prontuarios.update(id, { thpState: undefined });
                    }
                    if (selectedPatientId === id) {
                      setThpPatient(null);
                    }
                    toast.success("Perfil de prontuário THP redefinido.");
                  }}
                />
              )}
              {activeTab === "scales" && (
                <ScalesCabinet
                  patient={thpPatient}
                  onUpdatePatient={handleUpdatePatient}
                />
              )}
              {activeTab === "clinical-map" && (
                <ClinicalMap
                  patient={thpPatient}
                />
              )}
              {activeTab === "pharmacology" && (
                <PharmacologyConsultant
                  patient={thpPatient}
                  onUpdatePatient={handleUpdatePatient}
                />
              )}
              {activeTab === "periodization" && (
                <PeriodizationManager
                  patient={thpPatient}
                  onUpdatePeriodization={handleUpdatePeriodization}
                />
              )}
              {activeTab === "training" && (
                <TrainingModule
                  patient={thpPatient}
                  onAwardXp={handleAwardXp}
                  onAddLog={(summary, adherence, verbal, nonVerbal) => {
                    const newLog: SessionLog = {
                      id: `log-${Date.now()}`,
                      date: new Date().toISOString().split("T")[0],
                      evolutionSummary: summary,
                      adherenceScore: adherence,
                      verbalCompetenceScore: verbal,
                      nonVerbalCompetenceScore: nonVerbal,
                      clinicalObservations: `Evolução clínica registrada via simulador síncrono THP.`
                    };
                    handleUpdateSessionHistory(newLog);
                  }}
                />
              )}
              {activeTab === "report" && (
                <TherapistReport
                  patient={thpPatient}
                  onAddSessionLog={handleUpdateSessionHistory}
                />
              )}
            </main>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-slate-950">
          <Activity size={48} className="text-[#10b981] mb-4 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-100">Nenhum Paciente Selecionado</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 max-w-sm leading-relaxed">
            Selecione um paciente ativo no menu principal ou selecione acima para carregar o programa de treinamento e suas abas de evolução.
          </p>
        </div>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-slate-800 bg-slate-900 text-slate-100',
        }}
      />
    </div>
  );
}
