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
  X,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { calculateTdahAssessment } from '../TdahAsrs18/lib/scoring';
import { calculateEtdahScoring, calculateEpfScoring, calculateBdefsScoring } from './lib/scoring';
import { ETDAH_QUESTIONS } from './data/etdahData';
import { EPF_QUESTIONS } from './data/epfData';
import { BDEFS_QUESTIONS, BARKLEY_ADHD_EF_INDEX_ITEMS } from './data/bdefsData';
import { DIFFERENTIAL_CONDITIONS } from './data/differentialData';

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

  const handleSimulateAll = () => {
    // 1. ASRS-18
    const asrsAnswers: Record<number, number> = {
      1: 3, 2: 4, 3: 3, 4: 2, 5: 3, 6: 4,
      7: 3, 8: 2, 9: 3, 10: 4, 11: 3, 12: 2,
      13: 3, 14: 4, 15: 3, 16: 2, 17: 3, 18: 4
    };
    const asrsScoring = calculateTdahAssessment(asrsAnswers);
    const asrsData: AsrsData = {
      answers: asrsAnswers,
      partAScore: asrsScoring.partA.rawScore,
      partBScore: asrsScoring.partB.rawScore,
      partASignificant: asrsScoring.partA.significantSymptoms,
      partBSignificant: asrsScoring.partB.significantSymptoms,
      thresholdMetA: asrsScoring.partA.thresholdMet,
      classification: asrsScoring.classification,
      completedAt: new Date().toISOString()
    };

    // 2. Anamnese Retrospectiva (<12 anos)
    const anamneseData: AnamneseData = {
      queixaPrincipal: 'Dificuldade crônica de sustentação do foco atencional, desorganização no trabalho e esquecimentos frequentes de prazos e compromissos.',
      impactoVidaDiaria: 'Acúmulo de tarefas atrasadas, sobrecarga mental contínua, atritos conjugais por esquecer afazeres domésticos e sensação de esgotamento ao final do dia.',
      marcosDesenvolvimento: {
        idadeAndar: '12 meses',
        idadeFalar: '16 meses',
        idadeLer: '6 anos',
        desempenhoAcademicoInfancia: 'Notas muito oscilantes: excelente em matérias de alto interesse (história, ciências) e muito baixas em disciplinas com esforço repetitivo ou memorização árida.',
        comportamentoEscola: 'Professores relatavam que "vivia no mundo da lua", levantava frequentemente para apontar lápis ou beber água, perdia casacos e esquecia lições.',
        problemasComportamentoInfanciaAdolescencia: 'Na adolescência a hiperatividade motora transformou-se em inquietação mental interna constante, balançar de pernas e impulsividade verbal.',
        repetenciaOuAdvertencias: 'Não repetiu de ano, mas recebeu constantes advertências por conversar nas aulas e distrair colegas.',
        esforcoCompensatorioOuApoioFamiliar: 'A mãe estudava diariamente com ele para garantir a entrega das tarefas; estudava apenas na véspera sob intensa adrenalina de prazo.'
      },
      historiaFamiliar: {
        temHistoricoFamiliar: true,
        parentesAfetados: 'Pai e irmão mais novo',
        detalhes: 'Pai apresenta perfil nítido de desatenção, perde chaves/óculos com frequência e tem histórico de desorganização financeira crônica.'
      },
      historicoMedicoPsiquiatrico: {
        problemasMedicosInfancia: 'Desenvolvimento físico sem intercorrências; sem crises convulsivas ou TCE.',
        diagnosticosAnteriores: 'Diagnóstico prévio de Transtorno de Ansiedade Generalizada com resposta apenas parcial a ISRS.',
        usoMedicacaoPsicotropica: 'Sertralina 50mg/dia',
        tempoMedicacao: 'Uso contínuo há 8 meses',
        historicoSono: 'Dificuldade para iniciar o sono devido a pensamentos acelerados; sono agitado, acorda com sensação de cansaço.',
        historicoSubstancias: 'Consumo elevado de cafeína (5 a 6 xícaras de café/dia) como estratégia compensatória para manter o estado de alerta.'
      },
      sintomasNuclearesAtuais: {
        focoEsforcoMental: 'Evitação ativa de tarefas burocráticas ou com esforço mental prolongado; distrai-se com qualquer estímulo do ambiente.',
        organizacaoTarefas: 'Inicia múltiplos projetos simultâneos e tem enorme dificuldade em concluí-los; mesa de trabalho e ambiente digital caóticos.',
        seguirInstrucoes: 'Pula etapas de manuais e e-mails longos, lendo apenas trechos rápidos e cometendo erros de procedimento.',
        lembrarDetalhes: 'Esquece compromissos rotineiros, datas de aniversários, prazos de contas e onde guardou pertences essenciais.',
        procrastinacao: 'Severa: empurra decisões e tarefas complexas até o limite do prazo final, gerando picos intensos de estresse.',
        interrupcaoFala: 'Interrompe a fala de colegas por impaciência e costuma completar a frase dos outros.',
        inquietudeAgitacao: 'Necessidade constante de manipular objetos durante reuniões (caneta, mexer nas mãos, tamborilar dedos, balançar pernas).'
      },
      tratamentosAnteriores: {
        fezTratamentoTdah: false,
        qualTratamentoETempo: 'Nunca realizou avaliação neuropsicológica específica ou uso de psicoestimulantes.',
        houveMelhora: 'N/A'
      },
      expectativasTratamento: 'Obter clareza diagnóstica, desculpabilizar seu histórico de vida, estruturar rotinas funcionais e avaliar intervenção farmacológica e psicoterapêutica com médico psiquiatra.',
      completedAt: new Date().toISOString()
    };

    // 3. ETDAH-AD (69 itens)
    const etdahAnswers: Record<number, number> = {};
    ETDAH_QUESTIONS.forEach(q => {
      if (q.isInverted) {
        etdahAnswers[q.id] = 0;
      } else if (q.factor === 1 || q.factor === 4) {
        etdahAnswers[q.id] = 4;
      } else {
        etdahAnswers[q.id] = 3;
      }
    });
    const etdahData = calculateEtdahScoring(etdahAnswers);

    // 4. EPF-TDAH (58 itens)
    const epfAnswers: Record<number, number> = {};
    EPF_QUESTIONS.forEach(q => {
      if ([1, 2, 4, 6].includes(q.domainId)) {
        epfAnswers[q.id] = 3;
      } else {
        epfAnswers[q.id] = 1;
      }
    });
    const epfData = calculateEpfScoring(epfAnswers);

    // 5. BDEFS (89 itens)
    const bdefsAnswers: Record<number, number> = {};
    BDEFS_QUESTIONS.forEach(q => {
      if (BARKLEY_ADHD_EF_INDEX_ITEMS.includes(q.id) || [1, 2, 4].includes(q.sectionId)) {
        bdefsAnswers[q.id] = 3;
      } else {
        bdefsAnswers[q.id] = 2;
      }
    });
    const bdefsData = calculateBdefsScoring(bdefsAnswers);

    // 6. Heterorrelato
    const heterorrelatoData: HeterorrelatoData = {
      respondenteNome: 'Mariana Costa Ferreira',
      grauParentesco: 'Cônjuge/Parceiro(a)',
      tempoConvivio: '7 anos de casamento (convivência diária contínua)',
      conviveuNaInfancia: false,
      observacoesInfancia: 'A sogra relatou que na infância ele não parava quieto na cadeira, perdia agasalhos escolares com frequência e necessitava de supervisão constante para lições.',
      percepcaoDesatencao: 'Frequentemente parece não escutar quando conversamos diretamente; esquece tarefas combinadas minutos após o combinado; perde chaves, celular e carteira diariamente.',
      percepcaoHiperatividadeImpulsividade: 'Interrompe a fala dos outros por impaciência; tem extrema dificuldade em esperar filas e balança as pernas ou tamborila dedos o tempo todo.',
      percepcaoDisfuncaoExecutiva: 'Planeja rotinas mas não consegue cumpri-las; subestima gravemente o tempo necessário para deslocamentos ou tarefas domésticas; deixa armários abertos e projetos inacabados.',
      impactoRelacionamentoRotina: 'Gera sobrecarga e sensação de que a parceira precisa atuar como "gerente/mãe" da rotina doméstica, sendo fonte crônica de desgastes e atritos no casamento.',
      concordanciaGeralComAutorrelato: 'Alta Convergência',
      notasClinicasConfronto: 'Os relatos da cônjuge corroboram plenamente o autorrelato do paciente no ASRS e ETDAH-AD, descartando hipótese de distorção ou superestimação e confirmando o critério DSM-5 de prejuízo em múltiplos contextos.',
      completedAt: new Date().toISOString()
    };

    // 7. Diferenciais
    const diffItems = DIFFERENTIAL_CONDITIONS.reduce((acc, curr) => ({
      ...acc,
      [curr.id]: { ...curr }
    }), {} as any);
    if (diffItems['tag']) {
      diffItems['tag'].status = 'comorbidity';
      diffItems['tag'].notes = 'Ansiedade secundária à sobrecarga e medo de cometer falhas atencionais no trabalho.';
    }
    if (diffItems['depressao']) {
      diffItems['depressao'].status = 'ruled_out';
      diffItems['depressao'].notes = 'Sem anedonia global primária ou lentificação afetiva.';
    }
    if (diffItems['burnout']) {
      diffItems['burnout'].status = 'comorbidity';
      diffItems['burnout'].notes = 'Sobrecarga decorrente de esforço compensatório crônico.';
    }
    if (diffItems['sono']) {
      diffItems['sono'].status = 'ruled_out';
      diffItems['sono'].notes = 'Atraso de fase do sono habitual sem apneia ou narcolepsia.';
    }
    if (diffItems['bipolar']) {
      diffItems['bipolar'].status = 'ruled_out';
      diffItems['bipolar'].notes = 'Ausência de episódios maníacos ou hipomaníacos circunscritos independentes.';
    }
    if (diffItems['tea']) {
      diffItems['tea'].status = 'ruled_out';
      diffItems['tea'].notes = 'Reciprocidade socioemocional preservada; sem padrões rígidos de movimentos repetitivos.';
    }
    if (diffItems['substancias']) {
      diffItems['substancias'].status = 'ruled_out';
      diffItems['substancias'].notes = 'Apenas uso moderado de cafeína; sem histórico de abuso ou dependência de substâncias.';
    }

    const diferenciaisData: DiferenciaisData = {
      items: diffItems,
      padraoTemporal: {
        inicioInfanciaConfirmado: true,
        flutuacaoConformeInteresse: true,
        independenteDeFaseHumor: true,
        impactoEmMultiplosContextos: true
      },
      condicoesFisicasInvestigadas: 'Exames laboratoriais gerais (função tireoidiana TSH/T4L, ferritina, hemograma completo e vitamina B12) normais.',
      conclusaoDiferencial: 'Os sintomas atencionais e desexecutivos são crônicos, iniciaram-se de forma nítida na infância (<12 anos) e manifestam-se transversalmente em múltiplos contextos. Há presença de comorbidade secundária com Transtorno de Ansiedade decorrente dos prejuízos acumulados pelo TDAH.',
      completedAt: new Date().toISOString()
    };

    // 8. Laudo
    const pName = assessment.patientInfo.name || 'Pedro Henrique Albuquerque';
    const laudoData: LaudoTdahIntegrativo = {
      conclusaoFinal: 'Critérios Plenamente Atendidos para TDAH Tipo Combinado (F90.2) com comorbidade de Ansiedade Secundária',
      encaminhamentos: '1. Avaliação Psiquiátrica para farmacoterapia; 2. Psicoterapia TCC com Treino de Habilidades Psicológicas (THP); 3. Estruturação ergonômica ambiental.',
      completedAt: new Date().toISOString()
    };

    const simulatedAssessment: TdahEcosystemAssessment = {
      ...assessment,
      asrsData,
      anamneseData,
      etdahData,
      epfData,
      bdefsData,
      heterorrelatoData,
      diferenciaisData,
      laudoData,
      stageStatuses: {
        overview: 'completed',
        asrs18: 'completed',
        anamnese: 'completed',
        etdah: 'completed',
        epf: 'completed',
        bdefs: 'completed',
        heterorrelato: 'completed',
        diferenciais: 'completed',
        laudo: 'completed'
      },
      updatedAt: new Date().toISOString()
    };

    setAssessment(simulatedAssessment);
    tdahEcosystemDbWrapper.saveDraftLocally(simulatedAssessment);
    toast.success('Ecossistema simulado com sucesso em todas as 8 etapas!');
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

        {/* Patient Selection Dropdown & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            title="Preencher todo o ecossistema com dados clínicos simulados para teste"
          >
            <Zap size={12} />
            <span className="hidden md:inline">Simular Ecossistema</span>
          </button>

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
