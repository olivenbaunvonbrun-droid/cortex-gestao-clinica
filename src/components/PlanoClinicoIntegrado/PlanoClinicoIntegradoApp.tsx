import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  History as HistoryIcon, 
  User, 
  FileText, 
  Zap, 
  Trash2,
  Users,
  Brain,
  ChevronRight,
  Sparkles,
  Save,
  Plus,
  Compass,
  Heart,
  Activity,
  Eraser,
  HelpCircle,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientData, PciRecord, PciPhase } from './types';
import { analyzePciAssessment } from '../../services/geminiService';
import { exportToHtml } from './utils/export';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/pciDbWrapper';
import { TCC_CONCEPTS } from './constants';
import { Toaster, toast } from 'react-hot-toast';

// Helper components
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';

interface PlanoClinicoIntegradoAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
}

export default function PlanoClinicoIntegradoApp({ activePatientId, lockPatient = false, userId }: PlanoClinicoIntegradoAppProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'history'>('test');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // Single form state
  const [formState, setFormState] = useState<Omit<PciRecord, 'id' | 'createdAt'>>({
    patient: {
      name: '',
      age: '',
      psychologistName: '',
      crp: '',
      logoUrl: '',
      signatureUrl: ''
    },
    approach: 'Terapia Cognitivo-Comportamental (TCC)',
    phase: 'triagem',
    idade: '',
    escolaridade: '',
    estadoCivil: 'Solteiro(a)',
    familiaOrigem: '',
    rotina: '',
    eventoQueixas: '',
    ridSituacao: '',
    ridPensamento: '',
    ridEmocao: '',
    ridEmocaoIntensidade: 50,
    ridComportamento: '',
    ridConsequencias: '',
    ridConsequenciasLP: '',
    satisfacaoPessoal: 50,
    satisfacaoInterpessoal: 50,
    satisfacaoOcupacional: 50,
    satisfacaoMaterial: 50,
    satisfacaoRecreativa: 50,
    satisfacaoExistencial: 50,
    necessidadesIdentificadas: '',
    esquemasCognitivos: '',
    crencasCentrais: '',
    crencasPerifericas: '',
    excessosComp: '',
    deficitsHab: '',
    historicoFormativo: '',
    instrumentos: '',
    diagTopo: '',
    diagFunc: '',
    projetoTerap: '',
    relacionamentoTerap: '',
    evolucao: '',
    aiAnalysis: ''
  });

  const [records, setRecords] = useState<PciRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<PciRecord | null>(null);

  // Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const [settings, setSettings] = useState({
    professionalName: 'Psicólogo(a)',
    professionalCRP: '',
    professionalLogo: '',
    professionalSignature: ''
  });

  // Load from Dexie settings
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const items = await db.settings.toArray();
        const s: any = {};
        items.forEach(item => {
          s[item.key] = item.value;
        });
        setSettings({
          professionalName: (!s.appTitle || s.appTitle === 'Sistema de Gestão para Psicólogos') ? 'Psicólogo(a)' : s.appTitle,
          professionalCRP: s.psychCrp || '',
          professionalLogo: s.appLogo || '',
          professionalSignature: s.psychSignature || ''
        });
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSystemSettings();
  }, []);

  // Load patients and pre-select
  useEffect(() => {
    const loadPatients = async () => {
      const all = await db.pacientes.toArray();
      setPatients(all);
      if (activePatientId) {
        setSelectedPatientId(String(activePatientId));
      }
    };
    loadPatients();
  }, [activePatientId]);

  // Update formState patient data when patient or settings change
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
      if (patientObj) {
        const age = patientObj.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : '';
        setFormState(prev => ({
          ...prev,
          idade: prev.idade || age,
          patient: {
            name: patientObj.nome,
            age: age,
            psychologistName: settings.professionalName,
            crp: settings.professionalCRP,
            logoUrl: settings.professionalLogo,
            signatureUrl: settings.professionalSignature
          }
        }));
      }
    }
  }, [selectedPatientId, patients, settings]);

  // Load history when selectedPatientId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (selectedPatientId) {
        const loadedHistory = await dbWrapper.getHistory(selectedPatientId);
        setRecords(loadedHistory);
      } else {
        setRecords([]);
      }
    };
    loadHistory();
  }, [selectedPatientId]);

  const handleClear = () => {
    if (window.confirm('Deseja limpar todos os campos do formulário atual?')) {
      setFormState(prev => ({
        ...prev,
        idade: '',
        escolaridade: '',
        estadoCivil: 'Solteiro(a)',
        familiaOrigem: '',
        rotina: '',
        eventoQueixas: '',
        ridSituacao: '',
        ridPensamento: '',
        ridEmocao: '',
        ridEmocaoIntensidade: 50,
        ridComportamento: '',
        ridConsequencias: '',
        ridConsequenciasLP: '',
        satisfacaoPessoal: 50,
        satisfacaoInterpessoal: 50,
        satisfacaoOcupacional: 50,
        satisfacaoMaterial: 50,
        satisfacaoRecreativa: 50,
        satisfacaoExistencial: 50,
        necessidadesIdentificadas: '',
        esquemasCognitivos: '',
        crencasCentrais: '',
        crencasPerifericas: '',
        excessosComp: '',
        deficitsHab: '',
        historicoFormativo: '',
        instrumentos: '',
        diagTopo: '',
        diagFunc: '',
        projetoTerap: '',
        relacionamentoTerap: '',
        evolucao: '',
        aiAnalysis: ''
      }));
      toast.success('Campos do formulário limpos!');
    }
  };

  const handleSimulate = () => {
    if (!selectedPatientId) {
      toast.error('Selecione um paciente para simular!');
      return;
    }
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    const mockComplaints = [
      "Sinto uma ansiedade constante quando preciso falar em público, meu coração acelera e travo.",
      "Tenho tido insônia e falta de apetite, sinto que nada mais faz sentido no meu trabalho.",
      "Brigo muito com meu parceiro por motivos bobos, me sinto irritado o tempo todo e depois me arrependo."
    ];
    const mockRotinas = [
      "Trabalha em horário comercial, dorme pouco (cerca de 5h por noite), sedentário.",
      "Estudante universitário, rotina irregular, consome muita cafeína, costuma ficar acordado até tarde."
    ];

    setFormState(prev => ({
      ...prev,
      idade: prev.idade || '28',
      escolaridade: 'Superior Completo',
      estadoCivil: 'Solteiro(a)',
      familiaOrigem: 'Família superprotetora, cobrança por alta performance e pouca validação afetiva.',
      rotina: mockRotinas[Math.floor(Math.random() * mockRotinas.length)],
      eventoQueixas: mockComplaints[Math.floor(Math.random() * mockComplaints.length)],
      ridSituacao: 'Durante apresentação de projeto para a diretoria.',
      ridPensamento: 'Vou travar, vão ver que sou um fracasso e serei demitido.',
      ridEmocao: 'Ansiedade severa, taquicardia, sudorese',
      ridEmocaoIntensidade: 85,
      ridComportamento: 'Falar muito rápido, abreviar a apresentação e sentar o mais rápido possível.',
      ridConsequencias: 'Alívio imediato da ansiedade por fugir da exposição.',
      ridConsequenciasLP: 'Confirmação do esquema de fracasso, vergonha e evitação de novas apresentações.',
      satisfacaoPessoal: 40,
      satisfacaoInterpessoal: 65,
      satisfacaoOcupacional: 35,
      satisfacaoMaterial: 70,
      satisfacaoRecreativa: 20,
      satisfacaoExistencial: 30,
      esquemasCognitivos: 'Fracasso; Defectividade/Vergonha',
      necessidadesIdentificadas: 'Admiração; Instrução; Autonomia',
      crencasCentrais: 'Incapacidade; Desvalor',
      crencasPerifericas: 'Se eu não for perfeito, provarei que sou um fracasso.',
      excessosComp: 'Perfeccionismo Paralisante; Ruminação Cognitiva',
      deficitsHab: 'Assertividade; Autorregulação Emocional',
      historicoFormativo: 'Clima de Crítica Punitiva; Exigência de Sucesso a Qualquer Custo',
      instrumentos: 'YSQ-S3; Inventário de Satisfação (IMF); Análise Funcional RID',
      diagTopo: 'TAG (Transtorno de Ansiedade Generalizada)',
      diagFunc: 'Esquiva Experiencial; Reforço Negativo (Alívio)',
      projetoTerap: 'Treino de Habilidades (THS); Reestruturação Cognitiva',
      relacionamentoTerap: 'Parceria colaborativa com foco em validação e segurança emocional.',
      evolucao: 'Primeira sessão focada no acolhimento e montagem do Plano Clínico Integrado.',
      aiAnalysis: ''
    }));
    toast.success('Dados clínicos simulados!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 4);
      setImportFiles(selectedFiles);
    }
  };

  const handleProcessImport = async () => {
    let combinedText = pastedText.trim();

    if (importFiles.length > 0) {
      setIsImporting(true);
      try {
        const filesTextPromises = importFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const htmlContent = event.target?.result as string;
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, 'text/html');
              resolve(doc.body.textContent || '');
            };
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
          });
        });

        const filesTexts = await Promise.all(filesTextPromises);
        combinedText += "\n" + filesTexts.join("\n");
      } catch (err) {
        console.error("Erro ao ler arquivos:", err);
        toast.error("Erro ao ler um ou mais arquivos.");
        setIsImporting(false);
        return;
      }
    }

    if (!combinedText.trim()) {
      toast.error("Por favor, digite algum texto ou anexe pelo menos um arquivo.");
      setIsImporting(false);
      return;
    }

    setIsImporting(true);
    try {
      const { extractPciFromText } = await import('../../services/geminiService');
      const data = await extractPciFromText(combinedText);
      
      setFormState(prev => ({
        ...prev,
        approach: data.approach || prev.approach,
        phase: data.phase || prev.phase,
        idade: data.idade || prev.idade,
        escolaridade: data.escolaridade || prev.escolaridade,
        estadoCivil: data.estadoCivil || prev.estadoCivil,
        familiaOrigem: data.familiaOrigem || prev.familiaOrigem,
        rotina: data.rotina || prev.rotina,
        eventoQueixas: data.eventoQueixas || prev.eventoQueixas,
        ridSituacao: data.ridSituacao || prev.ridSituacao,
        ridPensamento: data.ridPensamento || prev.ridPensamento,
        ridEmocao: data.ridEmocao || prev.ridEmocao,
        ridEmocaoIntensidade: data.ridEmocaoIntensidade !== undefined ? data.ridEmocaoIntensidade : prev.ridEmocaoIntensidade,
        ridComportamento: data.ridComportamento || prev.ridComportamento,
        ridConsequencias: data.ridConsequencias || prev.ridConsequencias,
        ridConsequenciasLP: data.ridConsequenciasLP || prev.ridConsequenciasLP,
        satisfacaoPessoal: data.satisfacaoPessoal !== undefined ? data.satisfacaoPessoal : prev.satisfacaoPessoal,
        satisfacaoInterpessoal: data.satisfacaoInterpessoal !== undefined ? data.satisfacaoInterpessoal : prev.satisfacaoInterpessoal,
        satisfacaoOcupacional: data.satisfacaoOcupacional !== undefined ? data.satisfacaoOcupacional : prev.satisfacaoOcupacional,
        satisfacaoMaterial: data.satisfacaoMaterial !== undefined ? data.satisfacaoMaterial : prev.satisfacaoMaterial,
        satisfacaoRecreativa: data.satisfacaoRecreativa !== undefined ? data.satisfacaoRecreativa : prev.satisfacaoRecreativa,
        satisfacaoExistencial: data.satisfacaoExistencial !== undefined ? data.satisfacaoExistencial : prev.satisfacaoExistencial,
        necessidadesIdentificadas: data.necessidadesIdentificadas || prev.necessidadesIdentificadas,
        esquemasCognitivos: data.esquemasCognitivos || prev.esquemasCognitivos,
        crencasCentrais: data.crencasCentrais || prev.crencasCentrais,
        crencasPerifericas: data.crencasPerifericas || prev.crencasPerifericas,
        excessosComp: data.excessosComp || prev.excessosComp,
        deficitsHab: data.deficitsHab || prev.deficitsHab,
        historicoFormativo: data.historicoFormativo || prev.historicoFormativo,
        instrumentos: data.instrumentos || prev.instrumentos,
        diagTopo: data.diagTopo || prev.diagTopo,
        diagFunc: data.diagFunc || prev.diagFunc,
        projetoTerap: data.projetoTerap || prev.projetoTerap,
        relacionamentoTerap: data.relacionamentoTerap || prev.relacionamentoTerap,
        evolucao: data.evolucao || prev.evolucao
      }));

      toast.success("Dados extraídos e preenchidos com sucesso!");
      setIsImportModalOpen(false);
      setPastedText('');
      setImportFiles([]);
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao extrair dados clínicos com IA: " + (err.message || err));
    } finally {
      setIsImporting(false);
    }
  };

  const handleGenerateAiPlan = async () => {
    if (!selectedPatientId) {
      toast.error('Selecione um paciente para acionar a IA!');
      return;
    }

    if (!formState.eventoQueixas.trim()) {
      toast.error('Preencha a queixa principal antes de gerar insights com a IA!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzePciAssessment(formState);
      const updatedFormState = { ...formState, aiAnalysis: analysis };
      setFormState(updatedFormState);

      const newRecord: PciRecord = {
        ...updatedFormState,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const updated = await dbWrapper.saveEntry(newRecord, selectedPatientId, userId);
      setRecords(updated);
      toast.success('Insights elaborados e salvos no prontuário!');
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      toast.error('Erro na análise da IA. Verifique as configurações.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error('Selecione um paciente para salvar!');
      return;
    }

    if (!formState.eventoQueixas.trim() && !formState.diagTopo.trim() && !formState.projetoTerap.trim()) {
      toast.error('Preencha ao menos a queixa, diagnóstico ou projeto terapêutico.');
      return;
    }

    try {
      const newRecord: PciRecord = {
        ...formState,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const updated = await dbWrapper.saveEntry(newRecord, selectedPatientId, userId);
      setRecords(updated);
      toast.success('Plano Clínico Integrado salvo com sucesso!');
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar no prontuário.');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Tem certeza que deseja excluir este plano clínico permanentemente?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setRecords(updated);
        toast.success('Plano clínico excluído com sucesso.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao deletar registro.');
      }
    }
  };

  const handleExport = (record: PciRecord) => {
    exportToHtml(record);
  };

  // Automated TCC conceptualization relationships
  const handleSelectSchema = (s: any) => {
    setFormState(p => {
      const updates: Partial<typeof formState> = {};
      
      const appendValues = (field: keyof typeof formState, values: string[]) => {
        const currentStr = (p[field] as string) || '';
        const current = currentStr.split('; ').map(v => v.trim()).filter(Boolean);
        const next = [...current];
        
        values.forEach(v => {
          if (!next.includes(v)) {
            next.push(v);
          }
        });
        
        (updates as any)[field] = next.join('; ');
      };

      // 1. Central Beliefs mapping
      if (s.for && Array.isArray(s.for)) {
        const beliefNames = TCC_CONCEPTS.CrencasCentrais
          .filter(cb => s.for.includes(cb.id))
          .map(b => b.name);
        if (beliefNames.length > 0) appendValues('crencasCentrais', beliefNames);
      }

      // 2. Peripheral Beliefs
      if (s.peripherals && Array.isArray(s.peripherals)) {
        appendValues('crencasPerifericas', s.peripherals);
      }

      // 3. Behavioral Excesses
      if (s.excesses && Array.isArray(s.excesses)) {
        appendValues('excessosComp', s.excesses);
      }

      // 4. Habilidade Deficits
      if (s.deficits && Array.isArray(s.deficits)) {
        appendValues('deficitsHab', s.deficits);
      }

      // 5. Formative History
      if (s.history && Array.isArray(s.history)) {
        appendValues('historicoFormativo', s.history);
      }

      return { ...p, ...updates };
    });
    toast.success(`Esquema "${s.name}" adicionado. Crenças, comportamentos e história relacionados foram preenchidos!`);
  };

  const handleSelectDisorder = (d: any) => {
    setFormState(p => {
      const updates: Partial<typeof formState> = {};
      
      const appendValues = (field: keyof typeof formState, values: string[]) => {
        const currentStr = (p[field] as string) || '';
        const current = currentStr.split('; ').map(v => v.trim()).filter(Boolean);
        const next = [...current];
        
        values.forEach(v => {
          if (!next.includes(v)) {
            next.push(v);
          }
        });
        
        (updates as any)[field] = next.join('; ');
      };

      if (d.history && Array.isArray(d.history)) appendValues('historicoFormativo', d.history);
      if (d.cognitions && Array.isArray(d.cognitions)) appendValues('ridPensamento', d.cognitions);
      if (d.maintaining && Array.isArray(d.maintaining)) appendValues('diagFunc', d.maintaining);
      if (d.behaviors && Array.isArray(d.behaviors)) appendValues('excessosComp', d.behaviors);
      if (d.deficits && Array.isArray(d.deficits)) appendValues('deficitsHab', d.deficits);
      if (d.newSkills && Array.isArray(d.newSkills)) appendValues('projetoTerap', d.newSkills);
      if (d.schemes && Array.isArray(d.schemes)) appendValues('esquemasCognitivos', d.schemes);
      if (d.coreBeliefs && Array.isArray(d.coreBeliefs)) appendValues('crencasCentrais', d.coreBeliefs);
      if (d.peripheralBeliefs && Array.isArray(d.peripheralBeliefs)) appendValues('crencasPerifericas', d.peripheralBeliefs);

      return { ...p, ...updates };
    });
    toast.success(`Condições de "${d.name}" mapeadas automaticamente na ficha clínica!`);
  };

  const handleSelectCentralBelief = (s: any) => {
    if (s.id) {
      const related = TCC_CONCEPTS.CrencasPerifericas.filter(cp => cp.cat === s.id);
      if (related.length > 0) {
        const relatedNamesList = related.map(r => r.name);
        setFormState(p => {
          const currentBeliefs = (p.crencasPerifericas || '').split('; ').filter(Boolean);
          const newBeliefs = [...currentBeliefs];
          
          relatedNamesList.forEach(name => {
            if (!newBeliefs.includes(name)) {
              newBeliefs.push(name);
            }
          });

          return {
            ...p,
            crencasPerifericas: newBeliefs.join('; ')
          };
        });
        toast.success(`Crença Central "${s.name}" adicionada. Crenças intermediárias associadas sugeridas!`);
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black transition-transform hover:scale-105">
            <Layers size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            Plano Clínico
            <span className="text-primary font-black">Integrado</span> 
          </h1>
        </div>
        
        {/* PATIENT SELECTOR */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-text-dim" />
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setCurrentResult(null);
            }}
            disabled={lockPatient}
            className={cn(
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all max-w-[200px] truncate",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`pci-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* TOP BAR ACTIONS */}
        <div className="flex items-center gap-3">
          {activeTab === 'test' && !currentResult && selectedPatientId && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSimulate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer animate-pulse"
                title="Simula respostas ideais para testes rápidos"
              >
                <Zap size={11} /> Simular
              </button>

              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer animate-pulse-subtle"
                title="Importar de arquivos HTML/TXT ou texto"
              >
                <Upload size={11} /> Importar
              </button>

              <button 
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-sidebar hover:bg-bg-sidebar-hover border border-border-subtle hover:border-text-dim/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-text-dim transition-all cursor-pointer"
              >
                <Eraser size={11} /> Limpar
              </button>
              
              <button 
                onClick={handleGenerateAiPlan}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Sparkles size={11} />
                )}
                Plano por IA
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-bg-deep rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Save size={11} />
                Salvar Plano
              </button>
            </div>
          )}
          <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
            {[
              { id: 'test', label: 'Novo Plano' },
              { id: 'history', label: 'Histórico' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentResult(null);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer",
                  activeTab === tab.id && !currentResult
                    ? "bg-bg-card text-primary border border-border-subtle shadow-sm" 
                    : "text-text-dim hover:text-text-main"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* MAIN CONTAINER */}
      <main className="flex-1 flex overflow-hidden relative">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
            <Layers size={48} className="text-primary mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no topo da janela para começar a estruturar o plano clínico integrado.
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Form Tab Panel */}
            <div className={cn("w-full h-full flex flex-col overflow-hidden", (activeTab === 'test' && !currentResult) ? "block" : "hidden")}>
              <div className="flex flex-1 overflow-hidden w-full relative h-full">
                  {/* LEFT SCROLLABLE FORM COLUMN */}
                  <div className="flex-1 overflow-y-auto bg-bg-deep p-6 md:p-8 scroller-hide select-text">
                    <div className="max-w-4xl mx-auto space-y-12 pb-24">
                      
                      {/* Abordagem & Fase Header selector */}
                      <div className="bg-bg-card p-6 rounded-[2rem] border border-border-subtle shadow-md grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-dim flex items-center gap-1.5"><Compass size={11} className="text-primary" /> Abordagem Clínico-Teórica</label>
                          <input
                            type="text"
                            value={formState.approach}
                            onChange={(e) => setFormState(p => ({ ...p, approach: e.target.value }))}
                            placeholder="Ex: Terapia Cognitivo-Comportamental (TCC)"
                            className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-dim flex items-center gap-1.5"><Activity size={11} className="text-primary" /> Fase Atual da Terapia</label>
                          <select
                            value={formState.phase}
                            onChange={(e) => setFormState(p => ({ ...p, phase: e.target.value as PciPhase }))}
                            className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all cursor-pointer"
                          >
                            <option value="triagem">Triagem / Avaliação Inicial</option>
                            <option value="intervencao">Intervenção Ativa</option>
                            <option value="alta">Preparação para Alta / Prevenção de Recaída</option>
                            <option value="recaida">Acompanhamento Pós-Alta / Manutenção</option>
                          </select>
                        </div>
                      </div>

                      {/* Section 01: Identificação */}
                      <SectionNumber title="Identificação do Paciente" number="01">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md">
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Paciente</label>
                            <input 
                              type="text"
                              value={formState.patient.name}
                              disabled
                              className="w-full bg-bg-sidebar/50 border border-border-subtle/50 text-text-dim text-xs font-semibold rounded-xl px-4 py-2.5 outline-none cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Idade</label>
                            <input 
                              type="text"
                              value={formState.idade}
                              onChange={(e) => setFormState(p => ({ ...p, idade: e.target.value }))}
                              placeholder="Ex: 30 anos"
                              className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Estado Civil</label>
                            <select
                              value={formState.estadoCivil}
                              onChange={(e) => setFormState(p => ({ ...p, estadoCivil: e.target.value }))}
                              className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all cursor-pointer"
                            >
                              <option value="Solteiro(a)">Solteiro(a)</option>
                              <option value="Casado(a)">Casado(a)</option>
                              <option value="Divorciado(a)">Divorciado(a)</option>
                              <option value="Viúvo(a)">Viúvo(a)</option>
                              <option value="União Estável">União Estável</option>
                            </select>
                          </div>
                          <div className="sm:col-span-3 space-y-2">
                            <label className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Escolaridade / Profissão</label>
                            <input 
                              type="text"
                              value={formState.escolaridade}
                              onChange={(e) => setFormState(p => ({ ...p, escolaridade: e.target.value }))}
                              placeholder="Ex: Superior Completo / Engenheiro"
                              className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all"
                            />
                          </div>
                        </div>
                      </SectionNumber>

                      {/* Section 02: Queixa & Contexto */}
                      <SectionNumber title="Queixa & Contexto" number="02">
                        <div className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md space-y-6">
                          <SuggestionTextArea 
                            label="Evento Precipitador & Queixas" 
                            value={formState.eventoQueixas} 
                            onChange={v => setFormState(p => ({ ...p, eventoQueixas: v }))} 
                            suggestions={TCC_CONCEPTS.QueixasComuns}
                            placeholder="Descreva a queixa inicial do paciente e eventos que dispararam a busca por ajuda..."
                            rows={3}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle/50">
                            <SuggestionTextArea 
                              label="Família de Origem" 
                              value={formState.familiaOrigem} 
                              onChange={v => setFormState(p => ({ ...p, familiaOrigem: v }))} 
                              suggestions={TCC_CONCEPTS.EstilosParentais}
                              placeholder="Estilos parentais, rede de apoio, conflitos familiares..."
                            />
                            <SuggestionTextArea 
                              label="Rotina Diária" 
                              value={formState.rotina} 
                              onChange={v => setFormState(p => ({ ...p, rotina: v }))} 
                              suggestions={TCC_CONCEPTS.RotinasComuns}
                              placeholder="Padrão de sono, exercícios, trabalho, lazer, vícios..."
                            />
                          </div>
                        </div>
                      </SectionNumber>

                      {/* Section 03: Análise Funcional (RID) */}
                      <SectionNumber title="Análise Funcional (RID)" number="03">
                        <div className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SuggestionTextArea 
                              label="Situação (Contexto)" 
                              value={formState.ridSituacao} 
                              onChange={v => setFormState(p => ({ ...p, ridSituacao: v }))} 
                              suggestions={TCC_CONCEPTS.RID_Contextos}
                              rows={2} 
                              placeholder="Onde? Quando? Com quem?" 
                            />
                            <SuggestionTextArea 
                              label="Pensamento Automático" 
                              value={formState.ridPensamento} 
                              onChange={v => setFormState(p => ({ ...p, ridPensamento: v }))} 
                              suggestions={TCC_CONCEPTS.RID_Pensamentos}
                              rows={2} 
                              placeholder="O que passou pela cabeça na hora?" 
                            />
                            <div className="space-y-4">
                              <SuggestionTextArea 
                                label="Emoção (Sentimentos e fisiologia)" 
                                value={formState.ridEmocao} 
                                onChange={v => setFormState(p => ({ ...p, ridEmocao: v }))} 
                                suggestions={TCC_CONCEPTS.RID_Emocoes}
                                rows={2} 
                                placeholder="Medo, ansiedade, aperto no peito..." 
                              />
                              <Slider 
                                 label="Intensidade da Emoção" 
                                 value={formState.ridEmocaoIntensidade} 
                                 onChange={v => setFormState(p => ({ ...p, ridEmocaoIntensidade: v }))} 
                                 compact
                              />
                            </div>
                            <SuggestionTextArea 
                              label="Comportamento (Reação motora)" 
                              value={formState.ridComportamento} 
                              onChange={v => setFormState(p => ({ ...p, ridComportamento: v }))} 
                              suggestions={TCC_CONCEPTS.RID_Comportamentos}
                              rows={2} 
                              placeholder="O que o paciente fez?" 
                            />
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle/50">
                              <SuggestionTextArea 
                                label="Consequências Imediatas (Curto Prazo)" 
                                value={formState.ridConsequencias} 
                                onChange={v => setFormState(p => ({ ...p, ridConsequencias: v }))} 
                                suggestions={TCC_CONCEPTS.RID_ConsequenciasCP}
                                rows={2} 
                                placeholder="Alívio rápido? Fuga? Esquiva?" 
                              />
                              <SuggestionTextArea 
                                label="Consequências a Longo Prazo" 
                                value={formState.ridConsequenciasLP} 
                                onChange={v => setFormState(p => ({ ...p, ridConsequenciasLP: v }))} 
                                suggestions={TCC_CONCEPTS.RID_ConsequenciasLP}
                                rows={2} 
                                placeholder="Prejuízos no trabalho, manutenção do medo, isolamento..." 
                              />
                            </div>
                          </div>
                        </div>
                      </SectionNumber>

                      {/* Section 04: Satisfação (IMF) */}
                      <SectionNumber title="Inventário de Satisfação (IMF)" number="04">
                        <div className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md space-y-6">
                          <div className="flex items-center gap-1.5 text-xs text-text-dim font-bold uppercase tracking-wider mb-2"><Heart size={14} className="text-primary" /> Nível de Satisfação por Áreas de Vida</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-bg-sidebar/45 p-6 rounded-2xl border border-border-subtle">
                            <Slider label="Pessoal (Autocuidado/Identidade)" value={formState.satisfacaoPessoal} onChange={v => setFormState(p => ({...p, satisfacaoPessoal: v}))} />
                            <Slider label="Interpessoal (Família/Relacionamentos)" value={formState.satisfacaoInterpessoal} onChange={v => setFormState(p => ({...p, satisfacaoInterpessoal: v}))} />
                            <Slider label="Ocupacional (Trabalho/Estudos)" value={formState.satisfacaoOcupacional} onChange={v => setFormState(p => ({...p, satisfacaoOcupacional: v}))} />
                            <Slider label="Material (Finanças/Bens)" value={formState.satisfacaoMaterial} onChange={v => setFormState(p => ({...p, satisfacaoMaterial: v}))} />
                            <Slider label="Recreativo (Hobbies/Lazer)" value={formState.satisfacaoRecreativa} onChange={v => setFormState(p => ({...p, satisfacaoRecreativa: v}))} />
                            <Slider label="Existencial (Sentido de Vida/Valores)" value={formState.satisfacaoExistencial} onChange={v => setFormState(p => ({...p, satisfacaoExistencial: v}))} />
                          </div>
                        </div>
                      </SectionNumber>

                      {/* Section 05: Análise Psicológica Profunda */}
                      <SectionNumber title="Análise Psicológica Profunda (TCC)" number="05">
                        <div className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="col-span-1 md:col-span-2">
                            <SuggestionTextArea 
                              label="Necessidades Identificadas (Não Satisfeitas)" 
                              value={formState.necessidadesIdentificadas} 
                              onChange={v => setFormState(p => ({ ...p, necessidadesIdentificadas: v }))} 
                              suggestions={[]}
                              isGrouped={true}
                              groups={[
                                { category: "Necessidades Infantis", label: "Infantis", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", items: TCC_CONCEPTS.NecessidadesInfantis },
                                { category: "Necessidades Conjugais", label: "Conjugais", color: "text-pink-400 bg-pink-500/10 border-pink-500/20", items: TCC_CONCEPTS.NecessidadesConjugais },
                                { category: "Necessidades Parentais", label: "Parentais", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", items: TCC_CONCEPTS.NecessidadesParentais },
                                { category: "Necessidades Adultas", label: "Adultas", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", items: TCC_CONCEPTS.NecessidadesAdultas },
                                { category: "Dimensões da Vida", label: "Dimensões da Vida", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", items: TCC_CONCEPTS.DimensoesVida },
                                { category: "P's da Felicidade", label: "P's da Felicidade", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", items: TCC_CONCEPTS.PsFelicidade }
                              ]}
                              placeholder="Selecione as necessidades infantis, parentais, conjugais ou adultas insatisfeitas..."
                            />
                          </div>
                            <SuggestionTextArea 
                              label="Esquemas Cognitivos Disfuncionais" 
                              value={formState.esquemasCognitivos} 
                              onChange={v => setFormState(p => ({ ...p, esquemasCognitivos: v }))} 
                              suggestions={TCC_CONCEPTS.Esquemas}
                              onSelect={handleSelectSchema}
                              placeholder="Selecione esquemas do jovem terapeuta..."
                            />
                            <SuggestionTextArea 
                              label="Crenças Centrais (Core Beliefs)" 
                              value={formState.crencasCentrais} 
                              onChange={v => setFormState(p => ({ ...p, crencasCentrais: v }))} 
                              suggestions={TCC_CONCEPTS.CrencasCentrais}
                              onSelect={handleSelectCentralBelief}
                              placeholder="Incapacidade, desamor ou desvalor..."
                            />
                            <SuggestionTextArea 
                              label="Crenças Periféricas (Regras/Pressupostos)" 
                              value={formState.crencasPerifericas} 
                              onChange={v => setFormState(p => ({ ...p, crencasPerifericas: v }))} 
                              suggestions={TCC_CONCEPTS.CrencasPerifericas}
                              placeholder="Regras auto-impostas do paciente..."
                            />
                            <SuggestionTextArea 
                              label="Excessos Comportamentais" 
                              value={formState.excessosComp} 
                              onChange={v => setFormState(p => ({ ...p, excessosComp: v }))} 
                              suggestions={TCC_CONCEPTS.Excessos_Comportamentais}
                              placeholder="Comportamentos nocivos frequentes..."
                            />
                            <SuggestionTextArea 
                              label="Déficits em Habilidades" 
                              value={formState.deficitsHab} 
                              onChange={v => setFormState(p => ({ ...p, deficitsHab: v }))} 
                              suggestions={TCC_CONCEPTS.HabilidadesPsicologicas}
                              placeholder="Assertividade, autorregulação..."
                            />
                            <SuggestionTextArea 
                              label="Histórico Formativo" 
                              value={formState.historicoFormativo} 
                              onChange={v => setFormState(p => ({ ...p, historicoFormativo: v }))} 
                              suggestions={TCC_CONCEPTS.Historico_Formativo}
                              placeholder="Traumas, abusos, superproteção..."
                            />
                          </div>
                        </div>
                      </SectionNumber>

                      {/* Section 06: Diagnóstico & Projeto */}
                      <SectionNumber title="Diagnóstico & Projeto Clínico" number="06">
                        <div className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md space-y-6">
                          <div className="space-y-6">
                            <SuggestionTextArea 
                              label="Diagnóstico Topográfico (DSM/CID)" 
                              value={formState.diagTopo} 
                              onChange={v => setFormState(p => ({ ...p, diagTopo: v }))} 
                              suggestions={TCC_CONCEPTS.TranstornosTopograficos}
                              onSelect={handleSelectDisorder}
                              placeholder="Ex: Transtorno Depressivo Maior, Fobia Social..."
                            />
                            <SuggestionTextArea 
                              label="Diagnóstico Funcional (Análise Contextual)" 
                              value={formState.diagFunc} 
                              onChange={v => setFormState(p => ({ ...p, diagFunc: v }))} 
                              suggestions={TCC_CONCEPTS.Diagnostico_Funcional}
                              placeholder="Mecanismos de manutenção do sofrimento..."
                            />
                            <SuggestionTextArea 
                              label="Instrumentos de Avaliação / Psicometria" 
                              value={formState.instrumentos} 
                              onChange={v => setFormState(p => ({ ...p, instrumentos: v }))} 
                              suggestions={TCC_CONCEPTS.InstrumentosComuns}
                              placeholder="Selecione ou digite inventários, questionários aplicados..."
                            />
                            <SuggestionTextArea 
                              label="Estratégia de Relacionamento Terapêutico" 
                              value={formState.relacionamentoTerap} 
                              onChange={v => setFormState(p => ({ ...p, relacionamentoTerap: v }))} 
                              suggestions={TCC_CONCEPTS.RelacionamentoTerapComuns}
                              placeholder="Estratégia de vínculo baseada no caso (ex: reparentalização limitada)..."
                            />
                            <SuggestionTextArea 
                              label="Projeto Terapêutico & Intervenções" 
                              value={formState.projetoTerap} 
                              onChange={v => setFormState(p => ({ ...p, projetoTerap: v }))} 
                              suggestions={[...TCC_CONCEPTS.Projeto_Terapeutico, ...TCC_CONCEPTS.NovasFuncoes]}
                              onSelect={(s) => {
                                 if (s.desc) {
                                    setFormState(p => {
                                       const current = (p.projetoTerap || '').split('; ').filter(Boolean);
                                       if (!current.includes(s.name)) {
                                          return { ...p, projetoTerap: [...current, s.name].join('; ') };
                                       }
                                       return p;
                                    });
                                 }
                              }}
                              rows={4} 
                              placeholder="Técnicas planejadas para as sessões..." 
                            />
                          </div>
                        </div>
                      </SectionNumber>

                      {/* Section 07: Evolução Clínica */}
                      <SectionNumber title="Evolução Clínica" number="07">
                        <div className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md">
                          <SuggestionTextArea 
                            label="Histórico de Evolução & Resumos" 
                            value={formState.evolucao} 
                            onChange={v => setFormState(p => ({ ...p, evolucao: v }))} 
                            suggestions={TCC_CONCEPTS.EvolucoesComuns}
                            rows={4}
                            placeholder="Resuma os avanços das sessões anteriores..."
                          />
                        </div>
                      </SectionNumber>

                      {/* AI Report Card Render */}
                      {formState.aiAnalysis && (
                        <div className="bg-bg-card p-6 rounded-[2rem] border border-emerald-500/20 shadow-md space-y-4">
                          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                              <Sparkles size={12} /> Insights Clínicos Elaborados pela IA
                            </h4>
                            <button
                              onClick={() => setFormState(p => ({ ...p, aiAnalysis: '' }))}
                              className="text-[9px] font-black text-text-dim hover:text-rose-400 uppercase tracking-widest cursor-pointer"
                            >
                              Descartar
                            </button>
                          </div>
                          <div 
                            className="text-xs text-text-main/90 font-serif leading-relaxed text-justify whitespace-pre-wrap select-text p-2 bg-bg-sidebar/20 rounded-xl"
                            dangerouslySetInnerHTML={{ __html: formState.aiAnalysis }}
                          />
                        </div>
                      )}

                    </div>
                  </div>

                  {/* RIGHT PANEL SUMMARY PREVIEW */}
                  <aside className="w-80 border-l border-border-subtle bg-bg-sidebar/30 p-6 flex flex-col gap-6 overflow-y-auto scroller-hide shrink-0 hidden lg:flex">
                    <div>
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Informações</h3>
                      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl space-y-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-dim/60 uppercase">Paciente</span>
                          <span className="font-bold text-xs truncate">{formState.patient.name || 'N/D'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-dim/60 uppercase">Idade</span>
                          <span className="font-bold text-xs">{formState.idade ? `${formState.idade} anos` : 'N/D'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-dim/60 uppercase">CRP do Psicólogo</span>
                          <span className="font-bold text-xs">{formState.patient.crp || 'N/D'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-subtle pt-6">
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Status da Ficha</h3>
                      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl space-y-3 text-xs">
                        <div className="flex justify-between font-bold">
                          <span className="text-text-dim text-[10px]">Esquemas</span>
                          <span className="text-primary">{formState.esquemasCognitivos ? formState.esquemasCognitivos.split(';').length : 0}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-text-dim text-[10px]">Crenças</span>
                          <span className="text-primary">{formState.crencasCentrais ? formState.crencasCentrais.split(';').length : 0}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-text-dim text-[10px]">RID Emoção</span>
                          <span className="text-primary">{formState.ridEmocao ? 'OK' : 'Pendente'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-subtle pt-6">
                      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl text-[10px] leading-relaxed text-text-dim/70">
                        <HelpCircle size={14} className="text-primary mb-1" />
                        Selecione as opções de <strong>Sugestão</strong> para expandir os termos técnicos de Terapia Cognitivo-Comportamental. O preenchimento é cumulativo.
                      </div>
                    </div>
                  </aside>

                </div>
              </div>

              {/* History Tab Panel */}
              <div className={cn("flex-grow overflow-y-auto p-6 bg-bg-deep scroller-hide select-text", (activeTab === 'history' && !currentResult) ? "block" : "hidden")}>
                <HistoryView 
                  key="history"
                  records={records} 
                  onView={setCurrentResult} 
                  onDelete={handleDeleteRecord}
                />
              </div>

              {/* Result View Container */}
              {currentResult && (
                <div className="flex-grow overflow-y-auto p-6 bg-bg-deep w-full scroller-hide select-text">
                  <ResultView 
                    key="result"
                    record={currentResult} 
                    onBack={() => setCurrentResult(null)} 
                    onExport={() => handleExport(currentResult)}
                  />
                </div>
              )}
            </div>
          )}
      </main>

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="absolute inset-0 bg-bg-deep/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 select-text">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-bg-card border border-border-subtle rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-card/50">
              <h3 className="font-bold text-text-main flex items-center gap-2 text-sm uppercase tracking-wider">
                <Sparkles className="text-primary w-4 h-4 animate-pulse" /> Importador Inteligente PCI
              </h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-text-dim hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 scroller-hide flex-1">
              <p className="text-[10px] text-text-dim font-bold uppercase tracking-wide leading-relaxed">
                Importe até 4 arquivos HTML de prontuário antigo ou cole o relato do caso. A inteligência artificial irá ler o texto e preencher automaticamente todos os campos do Plano Clínico Integrado.
              </p>

              {/* HTML/TXT File Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block">1. Enviar Arquivos Clínicos (Máx 4, formato .html, .txt)</label>
                <label className="flex flex-col items-center justify-center p-6 border border-border-subtle border-dashed rounded-[2rem] bg-bg-deep hover:bg-bg-sidebar/45 hover:border-primary/30 cursor-pointer transition-all group text-center">
                  <Upload className="text-text-dim/40 group-hover:text-primary mb-3 transition-colors" size={24} />
                  <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Selecionar arquivos HTML/TXT</span>
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".html,.htm,.txt" 
                  />
                </label>
                {importFiles.length > 0 && (
                  <div className="bg-bg-deep border border-border-subtle rounded-xl p-3 space-y-1">
                    <span className="text-[9px] font-black text-text-dim uppercase tracking-wider block">Arquivos Selecionados:</span>
                    {importFiles.map((file, idx) => (
                      <div key={idx} className="text-[10px] text-text-main font-semibold truncate">
                        • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pasted Text Editor area */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block">2. Ou digite/cole o relato da evolução/sessões do paciente</label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Cole aqui a evolução, anotações de sessões anteriores ou histórico clínico..."
                  className="w-full bg-bg-deep border border-border-subtle text-text-main text-xs font-semibold rounded-2xl p-4 focus:border-primary outline-none transition-all shadow-sm resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="p-4 bg-bg-card border-t border-border-subtle flex gap-3 justify-end">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-5 py-2 border border-border-subtle text-text-dim hover:text-text-main font-black rounded-xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessImport}
                disabled={isImporting}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-bg-deep font-black rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Extrair e Preencher
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-border-subtle bg-bg-card text-text-main',
        }}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SectionNumber({ title, number, children }: { title: string, number: string, children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-bg-sidebar border border-border-subtle text-primary text-[11px] font-black tracking-tighter">
          {number}
        </span>
        <h3 className="text-xs font-black uppercase tracking-widest text-text-main">
           {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function SuggestionTextArea({ 
  label, 
  value, 
  onChange, 
  onSelect, 
  suggestions, 
  placeholder, 
  rows = 3, 
  className,
  isGrouped,
  groups
}: { 
  label: string, 
  value?: string, 
  onChange: (v: string) => void, 
  onSelect?: (s: any) => void, 
  suggestions: any[], 
  placeholder?: string, 
  rows?: number, 
  className?: string,
  isGrouped?: boolean,
  groups?: Array<{ category: string, label: string, color: string, items: any[] }>
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleSelect = (s: any) => {
    const name = typeof s === 'string' ? s : s.name;
    const currentValues = (value || '').split('; ').map(v => v.trim()).filter(Boolean);
    
    if (currentValues.includes(name)) {
      setShowSuggestions(false);
      return;
    }

    const newValue = value ? `${value}; ${name}` : name;
    onChange(newValue);
    if (onSelect) onSelect(s);
    setShowSuggestions(false);
  };

  return (
    <div className={cn("space-y-2 relative", className)}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-text-dim uppercase tracking-widest">{label}</label>
        <button 
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-[9px] font-black text-primary hover:underline uppercase tracking-wider cursor-pointer"
        >
          {showSuggestions ? 'Fechar' : 'Sugestões'}
        </button>
      </div>
      
      <textarea 
        rows={rows}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-semibold rounded-2xl p-4 focus:border-primary outline-none transition-all shadow-sm resize-none leading-relaxed"
      />

      <AnimatePresence>
        {showSuggestions && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute z-[60] left-0 right-0 top-full mt-1 bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-y-auto scroller-hide p-3",
              isGrouped ? "max-h-96 space-y-4" : "max-h-56 p-2"
            )}
          >
            {isGrouped && groups ? (
              groups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2 pb-3 border-b border-border-subtle/30 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 px-1">
                    <span className={cn(
                      "px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border",
                      group.color
                    )}>
                      {group.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {group.items.map((s, idx) => {
                      const name = typeof s === 'string' ? s : s.name;
                      const desc = typeof s === 'string' ? '' : s.desc;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelect(s)}
                          className="text-left p-2 hover:bg-bg-sidebar rounded-xl border border-border-subtle/40 hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-start"
                        >
                          <span className="font-bold text-text-main text-[11px] mb-0.5">
                            {name}
                          </span>
                          {desc && <span className="text-[9px] text-text-dim/80 leading-normal">{desc}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              (suggestions || []).map((s, idx) => {
                const name = typeof s === 'string' ? s : s.name;
                const desc = typeof s === 'string' ? '' : s.desc;
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="w-full text-left px-3 py-2.5 hover:bg-bg-sidebar rounded-lg transition-colors border-b border-border-subtle/50 last:border-0 cursor-pointer"
                  >
                    <div className="font-bold text-text-main text-[11px] mb-0.5">
                      {name}
                    </div>
                    {desc && <p className="text-[10px] text-text-dim/80 leading-normal">{desc}</p>}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slider({ label, value, onChange, compact }: { label: string, value: number, onChange: (v: number) => void, compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact ? "space-y-1.5" : "space-y-3")}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-text-dim uppercase tracking-widest">{label}</label>
        <span className="text-[10px] font-black text-primary bg-primary/15 border border-primary/25 px-2 py-0.5 rounded-lg">{value}%</span>
      </div>
      <input 
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-primary"
      />
      {compact && value > 0 && (
         <div className="flex justify-between px-1 text-[8px] font-black uppercase text-text-dim/40 tracking-wider">
            <span>Leve</span>
            <span>Moderada</span>
            <span>Intensa</span>
         </div>
      )}
    </div>
  );
}
