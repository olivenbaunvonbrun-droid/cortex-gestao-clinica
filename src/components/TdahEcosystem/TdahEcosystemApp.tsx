import React, { useState, useEffect, useMemo } from 'react';
import { 
  TdahEcosystemAssessment, 
  EvaluationStage, 
  StageStatus, 
  PatientInfo,
  AsrsData,
  AnamneseData,
  EtdahData,
  EpfData,
  BdefsData,
  HeterorrelatoData,
  DiferenciaisData,
  LaudoTdahIntegrativo
} from './types';
import { tdahEcosystemDbWrapper } from './lib/ecosystemDbWrapper';
import { exportTdahEcosystemToHtml } from './utils/export';
import { db } from '../../lib/db';
import { toast } from 'react-hot-toast';
import { 
  Brain, 
  Users, 
  Save, 
  Printer, 
  Sparkles, 
  FolderCheck, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Helper components
import TdahStageStepper, { STAGES_CONFIG } from './components/TdahStageStepper';
import StageOverviewView from './components/StageOverviewView';
import StageAsrsView from './components/StageAsrsView';
import StageAnamneseView from './components/StageAnamneseView';
import StageEtdahView from './components/StageEtdahView';
import StageEpfView from './components/StageEpfView';
import StageBdefsView from './components/StageBdefsView';
import StageHeteroView from './components/StageHeteroView';
import StageDifferentialView from './components/StageDifferentialView';
import StageLaudoView from './components/StageLaudoView';

interface TdahEcosystemAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
  initialStage?: EvaluationStage;
  onClose?: () => void;
  openTool?: (toolId: string, patientId?: string | null) => void;
}

export default function TdahEcosystemApp({
  activePatientId,
  lockPatient = false,
  userId,
  initialStage = 'overview',
  onClose,
  openTool
}: TdahEcosystemAppProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(activePatientId ? String(activePatientId) : '');
  const [currentStage, setCurrentStage] = useState<EvaluationStage>(initialStage);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    professionalName: 'Psicólogo(a)',
    professionalCRP: '',
    professionalLogo: '',
    professionalSignature: ''
  });

  // Current Assessment state
  const [assessment, setAssessment] = useState<TdahEcosystemAssessment>(() => ({
    id: String(Date.now()),
    patientId: selectedPatientId,
    patientInfo: {
      id: selectedPatientId,
      name: 'Paciente em Avaliação',
      age: '',
      psychologistName: 'Psicólogo(a)',
      crp: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStage: initialStage,
    stageStatuses: {
      overview: 'in_progress',
      asrs18: 'pending',
      anamnese: 'pending',
      etdah: 'pending',
      epf: 'pending',
      bdefs: 'pending',
      heterorrelato: 'pending',
      diferenciais: 'pending',
      laudo: 'pending'
    }
  }));

  // Load Settings
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const items = await db.settings.toArray();
        const s: any = {};
        items.forEach(item => {
          s[item.key] = item.value;
        });
        const profName = (!s.appTitle || s.appTitle === 'Sistema de Gestão para Psicólogos') ? 'Psicólogo(a)' : s.appTitle;
        setSettings({
          professionalName: profName,
          professionalCRP: s.psychCrp || '',
          professionalLogo: s.appLogo || '',
          professionalSignature: s.psychSignature || ''
        });
      } catch (err) {
        console.error("Failed to load settings in TDAH Ecosystem:", err);
      }
    };
    loadSystemSettings();
  }, []);

  // Load Patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const all = await db.pacientes.toArray();
        setPatients(all);
        if (activePatientId) {
          setSelectedPatientId(String(activePatientId));
        } else if (all.length > 0 && !selectedPatientId) {
          setSelectedPatientId(String(all[0].id));
        }
      } catch (err) {
        console.error("Error loading patients in TDAH Ecosystem:", err);
      }
    };
    loadPatients();
  }, [activePatientId]);

  // Load or Initialize Assessment when selectedPatientId changes
  useEffect(() => {
    if (!selectedPatientId) return;

    const loadAssessment = async () => {
      const existing = await tdahEcosystemDbWrapper.getAssessment(selectedPatientId);
      const currentPatient = patients.find(p => String(p.id) === String(selectedPatientId));

      const patInfo: PatientInfo = {
        id: selectedPatientId,
        name: currentPatient?.nome || 'Paciente Selecionado',
        age: currentPatient?.nascimento ? String(new Date().getFullYear() - new Date(currentPatient.nascimento).getFullYear()) : '',
        birthDate: currentPatient?.nascimento || '',
        education: currentPatient?.escolaridade || '',
        profession: currentPatient?.profissao || '',
        phone: currentPatient?.telefone || '',
        psychologistName: settings.professionalName,
        crp: settings.professionalCRP
      };

      if (existing) {
        setAssessment({
          ...existing,
          patientInfo: {
            ...existing.patientInfo,
            ...patInfo
          }
        });
      } else {
        setAssessment(prev => ({
          ...prev,
          id: String(Date.now()),
          patientId: selectedPatientId,
          patientInfo: patInfo,
          currentStage: initialStage
        }));
      }
    };

    loadAssessment();
  }, [selectedPatientId, patients, settings]);

  // Compute Stage Statuses dynamically
  const stageStatuses = useMemo<Record<EvaluationStage, StageStatus>>(() => {
    const s = { ...assessment.stageStatuses };

    // Overview is completed if at least 4 stages are completed
    s.asrs18 = assessment.asrsData && Object.keys(assessment.asrsData.answers || {}).length >= 18 ? 'completed' : (assessment.asrsData ? 'in_progress' : 'pending');
    s.anamnese = assessment.anamneseData?.marcosDesenvolvimento?.idadeAndar ? 'completed' : (assessment.anamneseData?.queixaPrincipal ? 'in_progress' : 'pending');
    s.etdah = assessment.etdahData && Object.keys(assessment.etdahData.answers || {}).length >= 69 ? 'completed' : (assessment.etdahData ? 'in_progress' : 'pending');
    s.epf = assessment.epfData && Object.keys(assessment.epfData.answers || {}).length >= 58 ? 'completed' : (assessment.epfData ? 'in_progress' : 'pending');
    s.bdefs = assessment.bdefsData && Object.keys(assessment.bdefsData.answers || {}).length >= 89 ? 'completed' : (assessment.bdefsData ? 'in_progress' : 'pending');
    s.heterorrelato = assessment.heterorrelatoData?.respondenteNome ? 'completed' : 'pending';
    s.diferenciais = assessment.diferenciaisData ? 'completed' : 'pending';
    s.laudo = assessment.laudoData ? 'completed' : 'pending';

    const doneCount = Object.entries(s).filter(([k, v]) => k !== 'overview' && v === 'completed').length;
    s.overview = doneCount >= 4 ? 'completed' : 'in_progress';

    return s;
  }, [assessment]);

  // Overall Completion Percentage
  const completionPercentage = useMemo(() => {
    const stagesToCheck: EvaluationStage[] = ['asrs18', 'anamnese', 'etdah', 'epf', 'bdefs', 'diferenciais', 'laudo'];
    let completedCount = 0;
    stagesToCheck.forEach(st => {
      if (stageStatuses[st] === 'completed') completedCount++;
      else if (stageStatuses[st] === 'in_progress') completedCount += 0.5;
    });
    return Math.round((completedCount / stagesToCheck.length) * 100);
  }, [stageStatuses]);

  // Handlers for stage updates
  const handleUpdateAsrs = (asrsData: AsrsData) => {
    setAssessment(prev => {
      const updated = { ...prev, asrsData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleUpdateAnamnese = (anamneseData: AnamneseData) => {
    setAssessment(prev => {
      const updated = { ...prev, anamneseData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleUpdateEtdah = (etdahData: EtdahData) => {
    setAssessment(prev => {
      const updated = { ...prev, etdahData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleUpdateEpf = (epfData: EpfData) => {
    setAssessment(prev => {
      const updated = { ...prev, epfData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleUpdateBdefs = (bdefsData: BdefsData) => {
    setAssessment(prev => {
      const updated = { ...prev, bdefsData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleUpdateHeterorrelato = (heterorrelatoData: HeterorrelatoData) => {
    setAssessment(prev => {
      const updated = { ...prev, heterorrelatoData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleUpdateDiferenciais = (diferenciaisData: DiferenciaisData) => {
    setAssessment(prev => {
      const updated = { ...prev, diferenciaisData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleUpdateLaudo = (laudoData: LaudoTdahIntegrativo) => {
    setAssessment(prev => {
      const updated = { ...prev, laudoData, updatedAt: new Date().toISOString() };
      tdahEcosystemDbWrapper.saveDraftLocally(updated);
      return updated;
    });
  };

  const handleSaveToProntuario = async () => {
    if (!selectedPatientId) {
      toast.error('Selecione um paciente para salvar a avaliação no prontuário.');
      return;
    }

    try {
      setIsSaving(true);
      await tdahEcosystemDbWrapper.saveToMedicalRecord(assessment, userId);
      toast.success('Avaliação completa salva no prontuário com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar no prontuário:', err);
      toast.error('Erro ao registrar no prontuário do paciente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintLaudo = () => {
    exportTdahEcosystemToHtml(assessment, settings.professionalLogo, settings.professionalSignature);
  };

  return (
    <div className="w-full h-full flex flex-col bg-bg-deep text-text-main overflow-hidden font-sans">
      {/* Top Header Bar: Patient Selector & Actions */}
      <div className="h-16 border-b border-border-subtle bg-bg-sidebar/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Área Especializada</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">CFP & SATEPSI</span>
            </div>
            <h1 className="text-sm font-black uppercase tracking-wider text-text-main">
              Ecossistema de Avaliação: TDAH em Adultos
            </h1>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-deep border border-border-subtle rounded-2xl px-3 py-1.5 focus-within:border-amber-400 transition-colors">
            <Users size={14} className="text-amber-400" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={lockPatient}
              className="bg-transparent text-xs text-text-main font-bold outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="" disabled className="bg-bg-deep text-text-dim">Selecione o paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id} className="bg-bg-deep text-text-main">
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveToProntuario}
            disabled={isSaving}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Salvar no Prontuário"
          >
            <Save size={13} />
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>

          <button
            onClick={handlePrintLaudo}
            className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 text-text-main border border-white/10 rounded-xl transition-all cursor-pointer"
            title="Imprimir / Exportar Laudo CFP"
          >
            <Printer size={15} />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-text-dim hover:text-text-main transition-colors rounded-xl"
              title="Fechar Janela"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Stepper Navigation */}
      <TdahStageStepper
        currentStage={currentStage}
        onSelectStage={setCurrentStage}
        stageStatuses={stageStatuses}
        completionPercentage={completionPercentage}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
        <div className="max-w-7xl mx-auto space-y-6">
          {currentStage === 'overview' && (
            <StageOverviewView
              assessment={assessment}
              onNavigateStage={setCurrentStage}
              onSaveToProntuario={handleSaveToProntuario}
              onPrintLaudo={handlePrintLaudo}
              isSaving={isSaving}
            />
          )}

          {currentStage === 'asrs18' && (
            <StageAsrsView
              patientId={selectedPatientId}
              asrsData={assessment.asrsData}
              onUpdateAsrs={handleUpdateAsrs}
              onNextStage={() => setCurrentStage('anamnese')}
              onOpenStandaloneAsrs={openTool ? () => openTool('tdah-asrs18', selectedPatientId) : undefined}
            />
          )}

          {currentStage === 'anamnese' && (
            <StageAnamneseView
              anamneseData={assessment.anamneseData}
              onUpdateAnamnese={handleUpdateAnamnese}
              onNextStage={() => setCurrentStage('etdah')}
            />
          )}

          {currentStage === 'etdah' && (
            <StageEtdahView
              etdahData={assessment.etdahData}
              onUpdateEtdah={handleUpdateEtdah}
              onNextStage={() => setCurrentStage('epf')}
            />
          )}

          {currentStage === 'epf' && (
            <StageEpfView
              epfData={assessment.epfData}
              onUpdateEpf={handleUpdateEpf}
              onNextStage={() => setCurrentStage('bdefs')}
            />
          )}

          {currentStage === 'bdefs' && (
            <StageBdefsView
              bdefsData={assessment.bdefsData}
              onUpdateBdefs={handleUpdateBdefs}
              onNextStage={() => setCurrentStage('heterorrelato')}
            />
          )}

          {currentStage === 'heterorrelato' && (
            <StageHeteroView
              heterorrelatoData={assessment.heterorrelatoData}
              onUpdateHeterorrelato={handleUpdateHeterorrelato}
              onNextStage={() => setCurrentStage('diferenciais')}
            />
          )}

          {currentStage === 'diferenciais' && (
            <StageDifferentialView
              diferenciaisData={assessment.diferenciaisData}
              onUpdateDiferenciais={handleUpdateDiferenciais}
              onNextStage={() => setCurrentStage('laudo')}
            />
          )}

          {currentStage === 'laudo' && (
            <StageLaudoView
              assessment={assessment}
              onUpdateLaudo={handleUpdateLaudo}
              onSaveToProntuario={handleSaveToProntuario}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
