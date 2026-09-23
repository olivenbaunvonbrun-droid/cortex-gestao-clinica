import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
  Settings as SettingsIcon, 
  FilePlus, 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Volume2, 
  Square, 
  Upload, 
  Check, 
  Save, 
  RefreshCw, 
  X, 
  Download, 
  FileDown, 
  FileUp,
  Brain,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/registroDbWrapper';
import { RichTextEditor } from './components/RichTextEditor';
import { MultiSelect } from './components/MultiSelect';
import { AttendanceRecord, PatientData } from './types';
import { 
  generateContentWithSystemInstruction, 
  transcribeAudioFile 
} from '../../services/geminiService';
import { ClinicalAudioRecorder } from './components/ClinicalAudioRecorder';

interface RegistroAtendimentoAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
  openTool?: (toolId: string, patientId?: string | null) => void;
  onClose?: () => void;
}

export default function RegistroAtendimentoApp({ 
  activePatientId, 
  lockPatient = false, 
  userId, 
  openTool, 
  onClose 
}: RegistroAtendimentoAppProps) {
  // Navigation & UI state
  const [currentPage, setCurrentPage] = useState<"new-record" | "list-records" | "settings">("new-record");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientClinicalBackground, setPatientClinicalBackground] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [recordsList, setRecordsList] = useState<AttendanceRecord[]>([]);

  // Settings State
  const [apiKey, setApiKey] = useState("");
  const [theme, setTheme] = useState("theme-indigo");
  const [fontFamily, setFontFamily] = useState("'Inter', ui-sans-serif, system-ui, sans-serif");
  const [fontSize, setFontSize] = useState("16px");
  const [logo, setLogo] = useState("");
  const [customApproaches, setCustomApproaches] = useState<string[]>([]);
  const [defaultApproaches, setDefaultApproaches] = useState<string[]>([]);
  const [newApproachInput, setNewApproachInput] = useState("");

  // Record Form State
  const [recordId, setRecordId] = useState<string | undefined>(undefined);
  const [psicologo, setPsicologo] = useState("Bruno de Oliveira Lima");
  const [crp, setCrp] = useState("CRP05/75885");
  const [dataAtendimento, setDataAtendimento] = useState("");
  const [horario, setHorario] = useState("");
  const [codigoRegistro, setCodigoRegistro] = useState("");
  const [numeroSessao, setNumeroSessao] = useState("");
  const [tipoSessao, setTipoSessao] = useState("Individual");
  const [localSessao, setLocalSessao] = useState("Online");
  const [abordagensSessao, setAbordagensSessao] = useState<string[]>([]);

  // Client Identification fields
  const [nomeCliente, setNomeCliente] = useState("");
  const [idadeCliente, setIdadeCliente] = useState("");
  const [sexoCliente, setSexoCliente] = useState("Masculino");
  const [contatoCliente, setContatoCliente] = useState("");

  // Rich Text Fields States
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [objetivosCliente, setObjetivosCliente] = useState("");
  const [objetivosTerapeuta, setObjetivosTerapeuta] = useState("");
  const [relatoCliente, setRelatoCliente] = useState("");
  const [intervencoes, setIntervencoes] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [insights, setInsights] = useState("");
  const [percepcaoCliente, setPercepcaoCliente] = useState("");
  const [progresso, setProgresso] = useState("");
  const [tarefas, setTarefas] = useState("");
  const [planejamento, setPlanejamento] = useState("");
  const [confidencialidade, setConfidencialidade] = useState(
    `<p style="text-align: justify;">O atendimento é realizado em conformidade com o Código de Ética Profissional do Psicólogo, garantindo o sigilo das informações compartilhadas, conforme Resolução CFP Nº 10/2005.</p>`
  );
  const [encaminhamentos, setEncaminhamentos] = useState("");
  const [assinaturaPayload, setAssinaturaPayload] = useState(""); // base64 payload of signature image
  const [globalAssinatura, setGlobalAssinatura] = useState(""); // global signature settings payload

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("");
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  
  // AI Generation indicator state
  const [aiLoadingFields, setAiLoadingFields] = useState<Record<string, boolean>>({});
  const [isAutoFillingAll, setIsAutoFillingAll] = useState(false);

  // Debouncing & auto-saving references
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

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

  // Load defaults and configurations from Dexie settings
  useEffect(() => {
    const initApp = async () => {
      // Set default dates
      setDefaultFormDates();

      // Retrieve keys from db.settings
      const storedApiKey = await db.settings.get("gemini_api_key");
      const storedTheme = await db.settings.get("registro_theme");
      const storedFontFamily = await db.settings.get("registro_fontFamily");
      const storedFontSize = await db.settings.get("registro_fontSize");
      
      // Central professional settings
      const storedAppTitle = await db.settings.get("appTitle");
      const storedCrp = await db.settings.get("psychCrp");
      const storedLogo = await db.settings.get("appLogo");
      const storedAssinatura = await db.settings.get("psychSignature");

      const storedCustomApproaches = await db.settings.get("registro_customApproaches");
      const storedDefaultApproaches = await db.settings.get("registro_defaultApproaches");

      if (storedApiKey) setApiKey(storedApiKey.value);
      if (storedTheme) setTheme(storedTheme.value);
      if (storedFontFamily) setFontFamily(storedFontFamily.value);
      if (storedFontSize) setFontSize(storedFontSize.value);
      
      // Populate defaults from central Cortex settings
      if (storedAppTitle && storedAppTitle.value !== 'Sistema de Gestão para Psicólogos') {
        setPsicologo(storedAppTitle.value);
      }
      if (storedCrp) setCrp(storedCrp.value);
      if (storedLogo) setLogo(storedLogo.value);
      if (storedAssinatura) {
        setGlobalAssinatura(storedAssinatura.value);
        setAssinaturaPayload(storedAssinatura.value);
      }

      let initialCustomApproaches = [
        "Terapia Cognitivo-Comportamental (TCC)", 
        "Psicanálise", 
        "Abordagem Centrada na Pessoa (ACP)", 
        "Gestalt-terapia", 
        "Análise do Comportamento", 
        "Existencial-Humanista"
      ];
      if (storedCustomApproaches) {
        setCustomApproaches(storedCustomApproaches.value);
        initialCustomApproaches = storedCustomApproaches.value;
      } else {
        await db.settings.put({ key: "registro_customApproaches", value: initialCustomApproaches });
        setCustomApproaches(initialCustomApproaches);
      }

      let initialDefaultApproaches = ["Terapia Cognitivo-Comportamental (TCC)"];
      if (storedDefaultApproaches) {
        setDefaultApproaches(storedDefaultApproaches.value);
        initialDefaultApproaches = storedDefaultApproaches.value;
      } else {
        await db.settings.put({ key: "registro_defaultApproaches", value: initialDefaultApproaches });
        setDefaultApproaches(initialDefaultApproaches);
      }

      // If opening new form, fill in default approaches
      setAbordagensSessao(initialDefaultApproaches);

      // Fetch history records
      await fetchHistory();
    };

    initApp();
  }, []);

  const loadPatientClinicalBackground = async (patientId: string) => {
    if (!patientId) {
      setPatientClinicalBackground('');
      return;
    }
    try {
      const record = await db.prontuarios.get(patientId);
      if (!record || !record.entradas || record.entradas.length === 0) {
        setPatientClinicalBackground('');
        return;
      }

      const sections: string[] = [];

      // 1. PCI (Plano Clínico Integrado)
      const pciEntries = record.entradas.filter(e => e.tipo === 'pci' || e.metadata?.type === 'pci');
      if (pciEntries.length > 0) {
        const latestPci = pciEntries[pciEntries.length - 1]?.metadata?.pciData;
        if (latestPci) {
          sections.push(
            `### PLANO CLÍNICO INTEGRADO (PCI):\n` +
            `- Queixa Principal/Evento: ${latestPci.eventoQueixas || 'N/A'}\n` +
            `- Diagnóstico Topográfico: ${latestPci.diagTopo || 'N/A'}\n` +
            `- Hipótese Diagnóstica/Etiológica: ${latestPci.hipoteseDiag || 'N/A'}\n` +
            `- Esquemas/EIDs Identificados: ${latestPci.esquemasEids || 'N/A'}\n` +
            `- Necessidades Emocionais Básicas: ${latestPci.necessidadesEmocionais || 'N/A'}\n` +
            `- Crenças Nucleares/Centrais: ${latestPci.crencasCentrais || 'N/A'}\n` +
            `- Distorções Cognitivas/Regras: ${latestPci.distorcoesRegras || 'N/A'}\n` +
            `- Estilo de Enfrentamento/Modos: ${latestPci.estiloEnfrentamento || 'N/A'}\n` +
            `- Projeto Terapêutico & Metas: ${latestPci.projetoTerap || 'N/A'}\n` +
            (latestPci.aiAnalysis ? `- Análise Clínica da Formulação:\n${latestPci.aiAnalysis}\n` : '')
          );
        }
      }

      // 2. RIDs Recentes (Registros de Informações Diárias)
      const ridEntries = record.entradas.filter(e => e.tipo === 'rid' || e.metadata?.type === 'rid');
      if (ridEntries.length > 0) {
        const recentRids = ridEntries.slice(-3).map(e => e.metadata?.ridData).filter(Boolean);
        const ridSummaries = recentRids.map((rid, idx) => 
          `RID ${idx + 1} (${rid.date || 'Data N/D'}): Situação: "${rid.situacao || ''}" | Pensamento: "${rid.pensamento || ''}" | Emoção: ${rid.emocao?.name || ''} (${rid.emocao?.intensity || ''}%) | Necessidade: ${Array.isArray(rid.necessidade) ? rid.necessidade.join(', ') : (rid.necessidade || '')} | Esquema: ${Array.isArray(rid.esquema) ? rid.esquema.join(', ') : (rid.esquema || '')} | Enfrentamento/Comportamento: "${rid.comportamento || ''}"`
        ).join('\n');
        sections.push(`### REGISTROS DE INFORMAÇÕES DIÁRIAS (RID) RECENTES:\n${ridSummaries}`);
      }

      // 3. Escalas e Avaliações Psicométricas (YSQ, IHP, IHS, ASRS-18, etc.)
      const scaleEntries = record.entradas.filter(e => 
        ['ysq', 'ihp', 'ihs', 'asrs18', 'dfc', 'psicodiagnostico'].includes(e.tipo || '') ||
        ['ysq', 'ihp', 'ihs', 'asrs18', 'dfc', 'psicodiagnostico'].includes(e.metadata?.type || '')
      );
      if (scaleEntries.length > 0) {
        const scaleSummaries = scaleEntries.map(e => {
          const type = (e.tipo || e.metadata?.type || '').toUpperCase();
          const date = e.data || (e.timestamp ? new Date(e.timestamp).toLocaleDateString('pt-BR') : '');
          const meta = e.metadata || {};
          let detail = '';
          if (meta.ysqData?.aiAnalysis) detail = `Análise YSQ: ${meta.ysqData.aiAnalysis.substring(0, 250)}...`;
          else if (meta.ihpData?.aiAnalysis) detail = `Análise IHP: ${meta.ihpData.aiAnalysis.substring(0, 250)}...`;
          else if (meta.ihsData?.aiAnalysis) detail = `Análise IHS: ${meta.ihsData.aiAnalysis.substring(0, 250)}...`;
          else if (meta.asrs18Data?.aiAnalysis) detail = `Análise ASRS-18: ${meta.asrs18Data.aiAnalysis.substring(0, 250)}...`;
          else if (meta.summary) detail = meta.summary;
          return `- ${type} (${date})${detail ? `: ${detail}` : ''}`;
        }).join('\n');
        sections.push(`### RESULTADOS DE ESCALAS & AVALIAÇÕES PSICOMÉTRICAS:\n${scaleSummaries}`);
      }

      // 4. Longitudinal Profile / Tratamento
      if (record.longitudinalProfile) {
        sections.push(`### PERFIL LONGITUDINAL DO PACIENTE:\n${record.longitudinalProfile}`);
      }
      if (record.treatmentPlan?.goals && record.treatmentPlan.goals.length > 0) {
        const goalsList = record.treatmentPlan.goals.map(g => `- [${g.completed ? 'X' : ' '}] ${g.text}`).join('\n');
        sections.push(`### METAS TERAPÊUTICAS ATIVAS:\n${goalsList}\nNotas: ${record.treatmentPlan.notes || 'N/A'}`);
      }

      setPatientClinicalBackground(sections.join('\n\n'));
    } catch (err) {
      console.error("Erro ao carregar histórico clínico integrado do paciente:", err);
      setPatientClinicalBackground('');
    }
  };

  // Fetch history and clinical background when selectedPatientId changes
  useEffect(() => {
    fetchHistory();
    if (selectedPatientId) {
      loadPatientClinicalBackground(selectedPatientId);
    } else {
      setPatientClinicalBackground('');
    }
  }, [selectedPatientId]);

  // Pre-fill fields from selected patient
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const p = patients.find(p => String(p.id) === String(selectedPatientId));
      if (p) {
        setNomeCliente(p.nome || "");
        const age = p.nascimento ? String(new Date().getFullYear() - new Date(p.nascimento).getFullYear()) : "";
        setIdadeCliente(age);
        setSexoCliente(p.sexo || "Masculino");
        setContatoCliente(p.telefone || p.email || "");
      }
    }
  }, [selectedPatientId, patients]);

  const fetchHistory = async () => {
    try {
      const history = await dbWrapper.getHistory(selectedPatientId || undefined);
      setRecordsList(history);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const setDefaultFormDates = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const formattedTime = today.toTimeString().substring(0, 5);
    setDataAtendimento(formattedDate);
    setHorario(formattedTime);
    generateAndSetCode(formattedDate);
  };

  const generateAndSetCode = (dateStr: string) => {
    const cleanedDate = dateStr.replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    setCodigoRegistro(`REG${cleanedDate}${randomSuffix}`);
  };

  // Live Auto-Save loop
  useEffect(() => {
    if (recordId && selectedPatientId) {
      autoSaveIntervalRef.current = setInterval(() => {
        performSilentAutoSave();
      }, 15000);
    } else {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [
    recordId, selectedPatientId, psicologo, crp, dataAtendimento, horario, codigoRegistro, numeroSessao,
    tipoSessao, localSessao, abordagensSessao, nomeCliente, idadeCliente, sexoCliente,
    contatoCliente, motivoConsulta, objetivosCliente, objetivosTerapeuta, relatoCliente,
    intervencoes, observacoes, insights, percepcaoCliente, progresso, tarefas,
    planejamento, confidencialidade, encaminhamentos, assinaturaPayload
  ]);

  const performSilentAutoSave = async () => {
    if (!recordId || !selectedPatientId) return;
    try {
      setAutoSaveStatus("Gravando alterações...");
      const newRecord = getFormPayload();
      await dbWrapper.saveEntry(newRecord, selectedPatientId, userId);
      const timeStr = new Date().toLocaleTimeString();
      setAutoSaveStatus(`Autosalvo às ${timeStr}`);
      setTimeout(() => setAutoSaveStatus(""), 3000);
    } catch (e) {
      console.error("Auto-save failed:", e);
      setAutoSaveStatus("Erro ao auto-salvar!");
    }
  };

  const getFormPayload = (): AttendanceRecord => {
    const fieldsMap: Record<string, string> = {
      psicologo,
      crp,
      dataAtendimento,
      horario,
      codigoRegistro,
      numeroSessao,
      tipoSessao,
      localSessao,
      abordagensSessao: JSON.stringify(abordagensSessao),
      nomeCliente,
      idadeCliente,
      sexoCliente,
      contatoCliente,
      motivoConsulta,
      objetivosCliente,
      objetivosTerapeuta,
      relatoCliente,
      intervencoes,
      observacoes,
      insights,
      percepcaoCliente,
      progresso,
      tarefas,
      planejamento,
      confidencialidade,
      encaminhamentos,
      assinatura: assinaturaPayload
    };

    const patientData: PatientData = {
      name: nomeCliente || 'Paciente',
      age: idadeCliente || 'N/D',
      psychologistName: psicologo,
      crp: crp
    };

    return {
      id: recordId || Date.now().toString(),
      patient: patientData,
      template: 'completo',
      fields: fieldsMap,
      createdAt: new Date().toISOString()
    };
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Str = await convertFileToBase64(file);
        setLogo(base64Str);
        await db.settings.put({ key: "appLogo", value: base64Str });
        toast.success("Logotipo da clínica atualizado!");
      } catch (err) {
        toast.error("Erro ao ler o logotipo.");
      }
    }
  };

  const handleAssinaturaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/png") {
        toast.error("Utilize uma assinatura formato PNG.");
        return;
      }
      try {
        const base64Str = await convertFileToBase64(file);
        setGlobalAssinatura(base64Str);
        setAssinaturaPayload(base64Str);
        await db.settings.put({ key: "psychSignature", value: base64Str });
        toast.success("Assinatura digital atualizada!");
      } catch (err) {
        toast.error("Erro ao carregar a assinatura.");
      }
    }
  };

  const handleSaveBtnClick = async () => {
    if (!selectedPatientId) {
      toast.error("Selecione um paciente no topo antes de salvar!");
      return;
    }
    if (!nomeCliente.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }

    try {
      const payload = getFormPayload();
      const updated = await dbWrapper.saveEntry(payload, selectedPatientId, userId);
      setRecordsList(updated);
      setRecordId(payload.id);
      toast.success(recordId ? "Registro atualizado!" : "Registro salvo no prontuário!");
      setCurrentPage("list-records");
    } catch (err: any) {
      toast.error("Falha ao salvar: " + err.message);
    }
  };

  const editRecord = (record: AttendanceRecord) => {
    const f = record.fields;
    setRecordId(record.id);
    setPsicologo(f.psicologo || "");
    setCrp(f.crp || "");
    setDataAtendimento(f.dataAtendimento || "");
    setHorario(f.horario || "");
    setCodigoRegistro(f.codigoRegistro || "");
    setNumeroSessao(f.numeroSessao || "");
    setTipoSessao(f.tipoSessao || "Individual");
    setLocalSessao(f.localSessao || "Online");
    
    let parsedApproaches: string[] = [];
    try {
      if (f.abordagensSessao.startsWith('[')) {
        parsedApproaches = JSON.parse(f.abordagensSessao);
      }
    } catch (e) {
      if (f.abordagensSessao) parsedApproaches = [f.abordagensSessao];
    }
    setAbordagensSessao(parsedApproaches);

    setNomeCliente(f.nomeCliente || "");
    setIdadeCliente(f.idadeCliente || "");
    setSexoCliente(f.sexoCliente || "Masculino");
    setContatoCliente(f.contatoCliente || "");
    setMotivoConsulta(f.motivoConsulta || "");
    setObjetivosCliente(f.objetivosCliente || "");
    setObjetivosTerapeuta(f.objetivosTerapeuta || "");
    setRelatoCliente(f.relatoCliente || "");
    setIntervencoes(f.intervencoes || "");
    setObservacoes(f.observacoes || "");
    setInsights(f.insights || "");
    setPercepcaoCliente(f.percepcaoCliente || "");
    setProgresso(f.progresso || "");
    setTarefas(f.tarefas || "");
    setPlanejamento(f.planejamento || "");
    setConfidencialidade(f.confidencialidade || "");
    setEncaminhamentos(f.encaminhamentos || "");
    setAssinaturaPayload(f.assinatura || "");

    setCurrentPage("new-record");
    toast.success("Registro carregado para edição!");
  };

  const handleClearForm = async () => {
    if (window.confirm("Esta ação limpará o formulário corrente. Deseja prosseguir?")) {
      setRecordId(undefined);
      setDefaultFormDates();
      setNumeroSessao("");
      setTipoSessao("Individual");
      setLocalSessao("Online");
      
      const storedDefault = await db.settings.get("registro_defaultApproaches");
      setAbordagensSessao(storedDefault?.value || []);

      setNomeCliente("");
      setIdadeCliente("");
      setSexoCliente("Masculino");
      setContatoCliente("");
      setMotivoConsulta("");
      setObjetivosCliente("");
      setObjetivosTerapeuta("");
      setRelatoCliente("");
      setIntervencoes("");
      setObservacoes("");
      setInsights("");
      setPercepcaoCliente("");
      setProgresso("");
      setTarefas("");
      setPlanejamento("");
      setConfidencialidade(
        `<p style="text-align: justify;">O atendimento é realizado em conformidade com o Código de Ética Profissional do Psicólogo, garantindo o sigilo das informações compartilhadas, conforme Resolução CFP Nº 10/2005.</p>`
      );
      setEncaminhamentos("");
      setAssinaturaPayload(globalAssinatura);
      setAutoSaveStatus("");
      setRecordingStatus("");
      toast.success("Formulário limpo!");
    }
  };

  const deleteRecord = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm("Deseja mesmo remover permanentemente este atendimento?")) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setRecordsList(updated);
        toast.success("Registro excluído.");
      } catch (err) {
        toast.error("Erro ao deletar registro.");
      }
    }
  };

  const handleAddApproach = async () => {
    const trimmed = newApproachInput.trim();
    if (!trimmed) return;

    if (customApproaches.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Esta abordagem já está cadastrada.");
      return;
    }

    const updated = [...customApproaches, trimmed];
    setCustomApproaches(updated);
    await db.settings.put({ key: "registro_customApproaches", value: updated });
    setNewApproachInput("");
    toast.success("Abordagem adicionada!");
  };

  const handleRemoveApproach = async (item: string) => {
    if (window.confirm(`Deseja remover a abordagem "${item}"?`)) {
      const updated = customApproaches.filter(a => a !== item);
      setCustomApproaches(updated);
      await db.settings.put({ key: "registro_customApproaches", value: updated });

      const updatedDefaults = defaultApproaches.filter(a => a !== item);
      setDefaultApproaches(updatedDefaults);
      await db.settings.put({ key: "registro_defaultApproaches", value: updatedDefaults });
      toast.success("Abordagem removida.");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await db.settings.put({ key: "gemini_api_key", value: apiKey });
      await db.settings.put({ key: "registro_theme", value: theme });
      await db.settings.put({ key: "registro_fontFamily", value: fontFamily });
      await db.settings.put({ key: "registro_fontSize", value: fontSize });
      await db.settings.put({ key: "registro_defaultApproaches", value: defaultApproaches });

      toast.success("Configurações gravadas com sucesso!");
      setCurrentPage("new-record");
    } catch (e: any) {
      toast.error("Erro ao gravar parâmetros: " + e.message);
    }
  };

  // Real-time voice transcription utilizing standard browser speech-recognition API
  const handleToggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Transcrição de voz não suportada neste navegador.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setRecordingStatus("");
    } else {
      setIsRecording(true);
      setRecordingStatus("Escutando... Fale no microfone.");

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.lang = "pt-BR";
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        let textResult = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            textResult += event.results[i][0].transcript;
          }
        }

        if (textResult) {
          setRelatoCliente((prev) => {
            const trimmedPrev = prev.trim();
            if (trimmedPrev.endsWith("</p>")) {
              return trimmedPrev.slice(0, -4) + " " + textResult + "</p>";
            } else if (trimmedPrev === "") {
              return `<p style="text-align: justify;">${textResult}</p>`;
            } else {
              return trimmedPrev + `<p style="text-align: justify;">${textResult}</p>`;
            }
          });
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setRecordingStatus(`Erro detectado: ${e.error}`);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
        setRecordingStatus("");
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  // Decodes Audio Upload
  const handleTranscribalAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribingAudio(true);
    setRecordingStatus("Traduzindo áudio com Inteligência Artificial...");

    try {
      const base64Content = await convertFileToBase64(file);
      const actualBase64 = base64Content.split(",")[1];

      const textOutput = await transcribeAudioFile(actualBase64, file.type);

      if (textOutput.trim()) {
        setRelatoCliente((prev) => {
          const formattedText = textOutput.replace(/\n/g, "<br>");
          const trimmedPrev = prev.trim();
          if (trimmedPrev.endsWith("</p>")) {
            return trimmedPrev.slice(0, -4) + " " + formattedText + "</p>";
          } else if (trimmedPrev === "") {
            return `<p style="text-align: justify;">${formattedText}</p>`;
          } else {
            return trimmedPrev + `<p style="text-align: justify;">${formattedText}</p>`;
          }
        });
        setRecordingStatus("Transcrição feita com sucesso!");
      } else {
        setRecordingStatus("IA retornou resultado em branco.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao transcrever: " + err.message);
      setRecordingStatus("Erro de processamento.");
    } finally {
      setIsTranscribingAudio(false);
      e.target.value = "";
      setTimeout(() => setRecordingStatus(""), 4000);
    }
  };

  const triggerAiForField = async (fieldName: string, promptType: string) => {
    let promptHeader = "Você é um Supervisor Clínico Sênior e Especialista de Mais Alto Nível em Psicologia Clínica Integrada, com domínio absoluto dos seguintes 5 PILARES FUNDAMENTAIS:\n";
    promptHeader += "1. TCC DE 4ª GERAÇÃO & TERAPIA BASEADA EM PROCESSOS (PBT de Stefan Hofmann & Steven Hayes, Contextualismo Funcional, RFT, ACT/Hexaflex, FAP, DBT): Analise redes causais e alavancas dinâmicas nas 6 dimensões clínicas (Cognição, Afeto, Atenção, Self, Motivação e Comportamento Overt). Promova flexibilidade psicológica (desfusão vs fusão; aceitação experiencial vs esquiva; momento presente; self-como-contexto; valores vitais e ações comprometidas).\n";
    promptHeader += "2. TERAPIA DO ESQUEMA AVANÇADA (Jeffrey Young): Mapeamento aprofundado dos 18 EIDs, necessidades emocionais básicas negligenciadas na história de vida e dinâmicas de Modos Esquemáticos (Criança Vulnerável/Irritada, Pais Disfuncionais Crítico/Punitivo/Exigente, Modos de Enfrentamento Desadaptativo e fortalecimento do Adulto Saudável).\n";
    promptHeader += "3. ANÁLISE DO COMPORTAMENTO (Behaviorismo Radical & Contextualismo Funcional): Análise Funcional de Contingências (Tríplice Contingência S-R-C: Estímulos Antecedentes discriminativos Sd/S-delta, Respostas operantes públicas/encobertas e Consequências mantenedoras). Discrimine reforçamento positivo de reforçamento negativo (fuga e esquiva experiencial), contingências de extinção/punição e Comportamento Governado por Regras Verbais rígidas.\n";
    promptHeader += "4. PSICOLOGIA POSITIVA & CIÊNCIA DO BEM-ESTAR (Peterson, Seligman, VIA Institute & Fredrickson): Mapeie e alavanque as Forças de Caráter e Virtudes (VIA), os 5 pilares do modelo PERMA (Positive Emotions, Engagement, Relationships, Meaning, Accomplishment), fatores de resiliência, autoeficácia (Bandura) e ampliação de recursos adaptativos (Broaden-and-Build).\n";
    promptHeader += "5. NEUROCIÊNCIA CLÍNICA & PSICOBIOLOGIA: Avalie a ativação psicofisiológica do Sistema Nervoso Autônomo sob a Teoria Polivagal de Stephen Porges (estados ventral-vagal de conexão e segurança, simpático de hiperarousal/luta/fuga e dorsal-vagal de colapso/imobilização), modulação do Eixo HPA, balanço de regulação Córtico-Límbica (Córtex Pré-Frontal vs Amígdala) e estimulação da neuroplasticidade dependente de experiência.\n\n";

    promptHeader += "DIRETRIZ MANDATÓRIA DE VOLUME ANALÍTICO E PROFUNDIDADE TÉCNICO-DIAGNÓSTICA:\n";
    promptHeader += "O conteúdo produzido DEVE ser substancial, denso, aprofundado e de alta excelência médica/psicológica. NÃO produza resumos superficiais, telegráficos ou burocráticos. Desenvolva redações clínicas completas, com parágrafos justificados extensos (<p style='text-align: justify;'>), tópicos analíticos detalhados (<ul> e <li>) e citações literais do paciente preservadas entre aspas duplas (\"> '...'\") em conformidade estrita com a Resolução CFP nº 06/2019.\n\n";

    if (patientClinicalBackground) {
      promptHeader += "CONFORMIDADE CLÍNICA MANDATÓRIA COM O HISTÓRICO INTEGRADO DO PRONTUÁRIO (RID + PCI + ESCALAS):\n";
      promptHeader += "A sua formulação DEVE seguir rigorosamente a mesma linha diagnóstica, os mesmos Esquemas Iniciais Desadaptativos (EIDs), as mesmas Necessidades Emocionais Básicas violadas e as metas terapêuticas consolidadas no histórico clínico do paciente:\n";
      promptHeader += `${patientClinicalBackground}\n\n`;
    }

    if (abordagensSessao.length > 0) {
      promptHeader += `Seu direcionamento teórico prioritário deve ser: ${abordagensSessao.join(", ")}.\n\n`;
    }

    promptHeader += "FORMATAÇÃO: Retorne APENAS o conteúdo final estruturado em código HTML clássico que contenha parágrafos justificados (<p style='text-align: justify;'>), tópicos usando (<ul> e <li>) ou ênfases usando (<strong>). NÃO envolva a resposta com marcações de blocos de código como ```html.";

    let customPrompt = "";
    const relatoSecText = relatoCliente ? relatoCliente.replace(/<[^>]*>/g, " ").trim() : "";

    switch (promptType) {
      case "motivo-consulta":
        customPrompt = `Elabore uma formulação técnico-diagnóstica aprofundada do "Motivo da Consulta e Queixa Primária" em 2 a 3 parágrafos densos e justificados (<p style='text-align: justify;'>), integrando os 5 pilares clínicos:\n` +
          `1. <strong>Queixa Manifesta vs. Função Comportamental Operante:</strong> Diferencie a queixa declarada imediata da função mantenedora latente (esquiva experiencial, reforçamento negativo, evitação de afetos aversivos);\n` +
          `2. <strong>Necessidades Emocionais Básicas e EIDs:</strong> Identifique explicitamente quais Necessidades Nucleares foram negligenciadas na história formativa e quais EIDs (Esquemas Iniciais Desadaptativos) operam como gatilhos primários do sofrimento contemporâneo;\n` +
          `3. <strong>Correlatos Psicofisiológicos e Neurociência:</strong> Mapeie os sinais de ativação neurovegetativa (tônus autonômico, mobilização do Eixo HPA ou estado de desligamento dorsal-vagal) associados à queixa.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "formatar-relato":
        if (!relatoSecText) {
          toast.error("Preencha o relato do cliente antes de formatar.");
          return;
        }
        customPrompt = `Reformule na íntegra o relato a seguir, transformando-o em um Relato Clínico Estruturado de Alta Precisão Semiológica, Análise Funcional e Volume Analítico Expandido, organizado em 4 seções com subtópicos em <strong> e parágrafos justificados (<p style='text-align: justify;'>):\n` +
          `  1. <strong>Contexto Fático e Estímulos Antecedentes Discriminativos (Sd):</strong> Descrição pormenorizada do cenário disparador, contingências ambientais imediatas e eventos históricos evocadores, com precisão descritiva e ausência de julgamentos morais.\n` +
          `  2. <strong>Tríplice Resposta Clínica e Psicobiológica:</strong>\n` +
          `     • <em>Dimensão Fisiológica/Somática e Tônus Autonômico:</em> Ativação do SNA sob a Teoria Polivagal (hiperativação simpática com taquicardia/tensão muscular ou colapso dorsal-vagal com congelamento/embotamento), mobilização do Eixo HPA e sintomas corporais somatizados;\n` +
          `     • <em>Dimensão Cognitiva, EIDs e Regras Verbais:</em> Pensamentos automáticos, distorções de Beck, regras condicionais ("Se... então...") e modos esquemáticos ativados, preservando literalmente as falas e metáforas do paciente entre aspas (\"> '...'\");\n` +
          `     • <em>Dimensão Motora/Comportamental Operante:</em> Comportamentos manifestos de enfrentamento (evitação experiencial, resignação complacente ou hipercompensação agressiva/perfeccionista) e padrões de ação.\n` +
          `  3. <strong>Análise Funcional de Contingências e Custos Evolutivos:</strong> Função de alívio imediato (reforçamento negativo da esquiva a curto prazo) versus manutenção do ciclo disfuncional, erosão de vínculos e prejuízos cumulativos a longo prazo.\n` +
          `  4. <strong>Recursos Protetivos, Forças de Caráter (VIA) e Resiliência:</strong> Forças de caráter identificadas no paciente (ex: perseverança, bravura, integridade, autorregulação) e pontos de alavancagem para desenvolvimento de flexibilidade psicológica e bem-estar (PERMA).\n\n` +
          `Original: "${relatoSecText}"`;
        break;
      case "objetivos-cliente":
        customPrompt = `Analise detalhadamente o relato e formule em tópicos estruturados (<ul> e <li>) os objetivos declarados pelo próprio paciente, articulando-os tecnicamente com os 5 pilares:\n` +
          `- Meta explícita na voz do cliente, preservando suas palavras entre aspas;\n` +
          `- Tradução técnica para os déficits funcionais nas 10 HPs (Habilidades Psicológicas - Poubel & Rodrigues: Autoconhecimento, Autorregulação, Autoestima, Imunidade Social, etc.);\n` +
          `- Conexão direta com os pilares do modelo PERMA da Psicologia Positiva (cultivo de emoções positivas, engajamento autêntico, vínculos fortalecidos, sentido existencial e realizações com propósito).\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "objetivos-terapeuta":
        customPrompt = `Elabore de 4 a 6 objetivos clínicos do terapeuta de alta densidade técnico-diagnóstica para o tratamento, estruturados em tópicos (<ul> e <li>) baseados nos 5 pilares:\n` +
          `- Desativação e enfraquecimento de EIDs e modos esquemáticos disfuncionais específicos mapeados na sessão;\n` +
          `- Promoção de flexibilidade psicológica via PBT/ACT (desfusão de regras verbais rígidas, aceitação de desconforto experiencial e ações comprometidas com valores vitais);\n` +
          `- Regulação neurovegetativa e autonômica (estimulação do tônus ventral-vagal e atenuação da hiperatividade amigdalar/simpática);\n` +
          `- Prescrição de alvos de treino deliberado nas 10 HPs em déficit com critérios operacionais claros de evolução clínica;\n` +
          `- Mobilização de forças de caráter VIA para consolidação e autonomia do Modo Adulto Saudável.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "intervencoes":
        customPrompt = `Analise a sessão e documente minuciosamente em tópicos analíticos estruturados (<ul> e <li>) as intervenções e posturas clínicas de 4ª Geração aplicadas pelo terapeuta, com alta fundamentação técnica:\n` +
          `- Especifique procedimentos clínicos concretos (ex: Rastreamento Funcional S-R-C de Contingências, Validação Dialética e Regulação Emocional DBT, Metáforas de Desfusão Cognitiva da ACT, Ancoragem Somática Polivagal no Momento Presente, Trabalho de Cadeiras e Diálogo de Modos Esquemáticos, Confrontação Empática, Psicoeducação em Forças de Caráter VIA e HPs);\n` +
          `- Descreva detalhadamente a resposta clínica, verbal e psicofisiológica do paciente a cada intervenção durante a sessão.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "observacoes":
        customPrompt = `Elabore uma descrição clínica e semiológica aprofundada sobre o estado mental do paciente e dinâmica psicodinâmico-funcional em parágrafos justificados (<p style='text-align: justify;'>):\n` +
          `- Exame do Estado Mental semiológico minucioso (afeto, gama emocional, modulação e congruência ideo-afetiva, curso e velocidade do pensamento, psicomotricidade);\n` +
          `- Estado neuroautonômico e reatividade polivagal observada ao longo do atendimento;\n` +
          `- Mapeamento da dinâmica dos Modos Esquemáticos em sessão (Criança Vulnerável, Protetor Desligado, Pais Críticos/Exigentes ou Adulto Saudável);\n` +
          `- Análise funcional da relação terapêutica (FAP): identificação de Comportamentos Clinicamente Relevantes em sessão (CRB1 - padrões disfuncionais emitidos na consulta; CRB2 - progressos e ensaios adaptativos em tempo real);\n` +
          `- Identificação das regras condicionais implícitas com preservação das metáforas e termos originais do paciente entre aspas.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "insights":
        customPrompt = `Extraia de 3 a 5 insights clínicos densos alcançados na sessão ou a serem promovidos, estruturados em tópicos (<ul> e <li>):\n` +
          `- Conexão ontogenética e funcional entre os gatilhos e sintomas atuais e as experiências formativas da infância/adolescência (origem biográfica dos EIDs e das regras de sobrevivência);\n` +
          `- Diferenciação funcional de contextos (Self-como-Contexto vs Self-como-Conteúdo): reconhecimento de que a ameaça pertencia ao contexto familiar prévio e não à realidade presente;\n` +
          `- Desmantelamento de regras verbais rígidas e fortalecimento de autocompaixão, tomada de perspectiva e reconexão com forças de caráter.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "percepcao-cliente":
        customPrompt = `Elabore uma avaliação profunda sobre o fechamento da sessão sob a ótica da aliança terapêutica e engajamento em parágrafos justificados (<p style='text-align: justify;'>):\n` +
          `- Qualidade do vínculo e da aliança terapêutica empírica (confiança, segurança psicológica e colaboração ativa);\n` +
          `- Estágio motivacional de prontidão para a mudança (Pré-contemplação, Contemplação, Preparação ou Ação de Prochaska & DiClemente);\n` +
          `- Grau de abertura e disposição experiencial manifestada pelo cliente para tolerar desconfortos e vulnerabilidades em prol de seus valores vitais.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "tarefas":
        customPrompt = `Prescreva de 3 a 5 tarefas comportamentais intersessão altamente estruturadas sob o PDP (Plano de Desenvolvimento de HPs de Poubel & Rodrigues) em tópicos (<ul> e <li>):\n` +
          `- Formato de micro-passos comportamentais graduados e factíveis (ex: Preenchimento de 2 registros de RID na semana, 3 minutos diários de respiração ventral 4-7-8, treino de limite assertivo sem justificativas excessivas);\n` +
          `- Regra de contingência operacional: "Se [gatilho ou ativação somática aversiva surgir], Então [ativar HP treinada / técnica polivagal / ação de valor]";\n` +
          `- Ativação deliberada de Forças de Caráter VIA e método de automonitoramento ou registro do exercício.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "planejamento":
        customPrompt = `Construa um planejamento técnico e estratégico longitudinal para as próximas sessões em tópicos analíticos estruturados (<ul> e <li>):\n` +
          `- Eixos temáticos e alavancas prioritárias na rede de processos de mudança (PBT);\n` +
          `- Técnicas específicas a serem introduzidas (ex: Trabalho de imaginação com reescrita - Imagery Rescripting - para ressignificação de memórias formativas de esquemas, role-playing de assertividade, intervenções somáticas polivagais);\n` +
          `- Manejo antecipatório e empático de possíveis esquivas experienciais, comportamentos de fuga ou resistências do paciente.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      case "confidencialidade":
        customPrompt = `Escreva uma declaração técnica formal de confidencialidade e sigilo profissional em conformidade com o Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005 e Resolução CFP nº 006/2019 sobre registros documentais), destacando a guarda sigilosa dos registros de atendimento.`;
        break;
      case "encaminhamentos":
        customPrompt = `Analise minuciosamente o quadro clínico e emita um parecer técnico-diagnóstico aprofundado e fundamentado sobre suporte interdisciplinar em parágrafos justificados (<p style='text-align: justify;'>):\n` +
          `- Avalie indicadores psicofisiológicos para suporte médico/psiquiátrico (sintomas autonômicos refratários, alteração crônica do ciclo sono-vigília, oscilações severas de humor, ideação);\n` +
          `- Considere pertinência de interconsultas em neuropsicologia, nutrição clínica ou medicina geral quando houver suspeitas de desregulação somática/metabólica;\n` +
          `- Caso não haja necessidade imediata de encaminhamento, explicite tecnicamente a justificativa e segurança do plano de acompanhamento exclusivo em psicoterapia clínica no momento.\n\n` +
          `Relato Clínico: "${relatoSecText || "Não fornecido"}"`;
        break;
      default:
        customPrompt = `Elabore um parecer clínico estruturado e aprofundado baseado na TCC de 4ª Geração, Terapia do Esquema, Análise do Comportamento, Psicologia Positiva e Neurociência Clínica.`;
    }

    setAiLoadingFields(prev => ({ ...prev, [fieldName]: true }));

    try {
      const generatedHtml = await generateContentWithSystemInstruction(customPrompt, promptHeader);
      let cleanedHtml = generatedHtml.replace(/^```html\s*/i, "").replace(/```\s*$/i, "").trim();
      setFieldState(fieldName, cleanedHtml);
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao comunicar com IA: " + err.message);
    } finally {
      setAiLoadingFields(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleAutoFillAllFields = async () => {
    const relatoSecText = relatoCliente ? relatoCliente.replace(/<[^>]*>/g, " ").trim() : "";
    if (!relatoSecText) {
      toast.error("Preencha o 'Relato Detalhado' antes do preenchimento automático.");
      return;
    }

    if (!window.confirm("Esta operação preencherá sequencialmente todos os campos por IA a partir do Relato Detalhado. Deseja iniciar?")) {
      return;
    }

    setIsAutoFillingAll(true);

    const fieldsToAutoFill = [
      { name: "motivoConsulta", type: "motivo-consulta" },
      { name: "objetivosCliente", type: "objetivos-cliente" },
      { name: "objetivosTerapeuta", type: "objetivos-terapeuta" },
      { name: "intervencoes", type: "intervencoes" },
      { name: "observacoes", type: "observacoes" },
      { name: "insights", type: "insights" },
      { name: "percepcaoCliente", type: "percepcao-cliente" },
      { name: "tarefas", type: "tarefas" },
      { name: "planejamento", type: "planejamento" },
      { name: "confidencialidade", type: "confidencialidade" },
      { name: "encaminhamentos", type: "encaminhamentos" }
    ];

    try {
      for (const field of fieldsToAutoFill) {
        await triggerAiForField(field.name, field.type);
      }
      toast.success("Preenchimento automático concluído!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro no preenchimento sequencial.");
    } finally {
      setIsAutoFillingAll(false);
    }
  };

  const setFieldState = (fieldName: string, val: string) => {
    switch (fieldName) {
      case "motivoConsulta": setMotivoConsulta(val); break;
      case "objetivosCliente": setObjetivosCliente(val); break;
      case "objetivosTerapeuta": setObjetivosTerapeuta(val); break;
      case "relatoCliente": setRelatoCliente(val); break;
      case "intervencoes": setIntervencoes(val); break;
      case "observacoes": setObservacoes(val); break;
      case "insights": setInsights(val); break;
      case "percepcaoCliente": setPercepcaoCliente(val); break;
      case "confidencialidade": setConfidencialidade(val); break;
      case "encaminhamentos": setEncaminhamentos(val); break;
      case "tarefas": setTarefas(val); break;
      case "planejamento": setPlanejamento(val); break;
    }
  };

  const handleScribeProgressiveUpdate = (partialData: Record<string, string>) => {
    if (partialData.relatoCliente) setRelatoCliente(partialData.relatoCliente);
    if (partialData.motivoConsulta) setMotivoConsulta(partialData.motivoConsulta);
    if (partialData.objetivosCliente) setObjetivosCliente(partialData.objetivosCliente);
    if (partialData.objetivosTerapeuta) setObjetivosTerapeuta(partialData.objetivosTerapeuta);
    if (partialData.intervencoes) setIntervencoes(partialData.intervencoes);
    if (partialData.observacoes) setObservacoes(partialData.observacoes);
    if (partialData.insights) setInsights(partialData.insights);
    if (partialData.percepcaoCliente) setPercepcaoCliente(partialData.percepcaoCliente);
    if (partialData.progresso) setProgresso(partialData.progresso);
    if (partialData.tarefas) setTarefas(partialData.tarefas);
    if (partialData.planejamento) setPlanejamento(partialData.planejamento);
    if (partialData.encaminhamentos) setEncaminhamentos(partialData.encaminhamentos);
  };

  const handleScribeComplete = async (analysisData: any) => {
    if (analysisData.relatoCliente) setRelatoCliente(analysisData.relatoCliente);
    if (analysisData.motivoConsulta) setMotivoConsulta(analysisData.motivoConsulta);
    if (analysisData.objetivosCliente) setObjetivosCliente(analysisData.objetivosCliente);
    if (analysisData.objetivosTerapeuta) setObjetivosTerapeuta(analysisData.objetivosTerapeuta);
    if (analysisData.intervencoes) setIntervencoes(analysisData.intervencoes);
    if (analysisData.observacoes) setObservacoes(analysisData.observacoes);
    if (analysisData.insights) setInsights(analysisData.insights);
    if (analysisData.percepcaoCliente) setPercepcaoCliente(analysisData.percepcaoCliente);
    if (analysisData.progresso) setProgresso(analysisData.progresso);
    if (analysisData.tarefas) setTarefas(analysisData.tarefas);
    if (analysisData.planejamento) setPlanejamento(analysisData.planejamento);
    if (analysisData.encaminhamentos) setEncaminhamentos(analysisData.encaminhamentos);

    // Auto-gravar o registro clínico no prontuário do paciente se selecionado
    try {
      const nextNum = (numeroSessao && numeroSessao.trim())
        ? numeroSessao
        : String((recordsList.length || 0) + 1);
      setNumeroSessao(nextNum);

      const newRecordId = recordId || Date.now().toString();
      setRecordId(newRecordId);

      const payload: AttendanceRecord = {
        id: newRecordId,
        patient: {
          name: nomeCliente || 'Paciente',
          age: idadeCliente || 'N/D',
          psychologistName: psicologo,
          crp: crp
        },
        template: 'completo',
        fields: {
          psicologo,
          crp,
          dataAtendimento: dataAtendimento || new Date().toISOString().slice(0, 10),
          horario: horario || new Date().toTimeString().substring(0, 5),
          codigoRegistro: codigoRegistro || `REG${Date.now()}`,
          numeroSessao: nextNum,
          tipoSessao,
          localSessao,
          abordagensSessao: JSON.stringify(abordagensSessao),
          nomeCliente: nomeCliente || 'Paciente',
          idadeCliente,
          sexoCliente,
          contatoCliente,
          motivoConsulta: analysisData.motivoConsulta || motivoConsulta,
          objetivosCliente: analysisData.objetivosCliente || objetivosCliente,
          objetivosTerapeuta: analysisData.objetivosTerapeuta || objetivosTerapeuta,
          relatoCliente: analysisData.relatoCliente || relatoCliente,
          intervencoes: analysisData.intervencoes || intervencoes,
          observacoes: analysisData.observacoes || observacoes,
          insights: analysisData.insights || insights,
          percepcaoCliente: analysisData.percepcaoCliente || percepcaoCliente,
          progresso: analysisData.progresso || progresso || 'Satisfatório',
          tarefas: analysisData.tarefas || tarefas,
          planejamento: analysisData.planejamento || planejamento,
          confidencialidade,
          encaminhamentos: analysisData.encaminhamentos || encaminhamentos,
          assinatura: assinaturaPayload
        },
        createdAt: new Date().toISOString()
      };

      if (selectedPatientId) {
        const updated = await dbWrapper.saveEntry(payload, selectedPatientId, userId);
        setRecordsList(updated);
        toast.success("✅ Atendimento registrado e salvo no prontuário do paciente com sucesso!", { duration: 6000 });
      } else {
        await db.settings.put({ key: 'cortex_attendance_draft_unsaved', value: payload });
        toast("Campos preenchidos e rascunho protegido! Selecione o paciente no topo para arquivar no prontuário.", { icon: "ℹ️", duration: 8000 });
      }
    } catch (err: any) {
      console.error("Falha no auto-registro clínico pós-transcrição:", err);
      toast.error("Erro ao salvar no prontuário: " + (err.message || "Erro desconhecido"));
    }
  };

  // Export HTML
  const handleExportHtml = () => {
    const recordPayload = getFormPayload();
    const logoHtml = logo ? `<img src="${logo}" alt="Logo Clínica" style="max-height: 60px; max-width: 200px; object-fit: contain;">` : "";
    const formattedDate = formatBrazilianDate(recordPayload.fields.dataAtendimento || "");

    const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Prontuário - ${nomeCliente || 'Sem Nome'}</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; font-size: 11pt; color: #2d3748; line-height: 1.6; max-width: 18cm; margin: 2cm auto; padding: 0 1.5cm; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4a5568; padding-bottom: 20px; margin-bottom: 25px; }
        h1 { font-size: 15pt; font-weight: 800; margin: 0; color: #1a202c; text-transform: uppercase; }
        h2 { font-size: 11pt; font-weight: 700; border-bottom: 1px solid #cbd5e0; padding-bottom: 3px; margin-top: 30px; text-transform: uppercase; color: #2d3748; }
        h3 { font-size: 10pt; font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #4a5568; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-bottom: 20px; font-size: 10pt; }
        .content { text-align: justify; font-size: 10pt; }
        .assinatura { margin-top: 50px; text-align: center; font-size: 10pt; page-break-inside: avoid; }
        .assinatura img { max-height: 60px; display: block; margin: 0 auto 5px; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Registro de Atendimento Psicológico</h1>
            <p style="margin: 3px 0 0 0; font-size:9.5pt; color: #718096;">Documento Clínico Confidencial</p>
        </div>
        ${logoHtml}
    </div>

    <div class="grid">
        <div><strong>Psicólogo:</strong> ${recordPayload.fields.psicologo}</div>
        <div><strong>CRP:</strong> ${recordPayload.fields.crp}</div>
        <div><strong>Data do Atendimento:</strong> ${formattedDate}</div>
        <div><strong>Horário:</strong> ${recordPayload.fields.horario}</div>
        <div><strong>Código do Registro:</strong> ${recordPayload.fields.codigoRegistro}</div>
        <div><strong>Número da Sessão:</strong> ${recordPayload.fields.numeroSessao || 'N/A'}</div>
        <div><strong>Tipo de Sessão:</strong> ${recordPayload.fields.tipoSessao}</div>
        <div><strong>Local da Sessão:</strong> ${recordPayload.fields.localSessao}</div>
    </div>

    <h2>1. Dados do Cliente</h2>
    <div class="grid">
        <div><strong>Nome do Cliente:</strong> ${nomeCliente}</div>
        <div><strong>Idade:</strong> ${idadeCliente}</div>
        <div><strong>Sexo:</strong> ${sexoCliente}</div>
        <div><strong>Contato:</strong> ${contatoCliente}</div>
    </div>
    <h3>Motivo da Consulta / Queixa Primária:</h3>
    <div class="content">${motivoConsulta || '<p>Não preenchido.</p>'}</div>

    <h2>2. Objetivos da Sessão</h2>
    <h3>Objetivos do Cliente:</h3>
    <div class="content">${objetivosCliente || '<p>Não preenchido.</p>'}</div>
    <h3>Objetivos do Terapeuta:</h3>
    <div class="content">${objetivosTerapeuta || '<p>Não preenchido.</p>'}</div>

    <h2>3. Estrutura da Sessão</h2>
    <h3>3.1. Relato Detalhado:</h3>
    <div class="content">${relatoCliente || '<p>Sem anotações.</p>'}</div>
    <h3>3.2. Intervenções Utilizadas:</h3>
    <div class="content">${intervencoes || '<p>Sem anotações.</p>'}</div>
    <h3>3.3. Observações Clínicas:</h3>
    <div class="content">${observacoes || '<p>Sem anotações.</p>'}</div>
    <h3>3.4. Insights Emergentes:</h3>
    <div class="content">${insights || '<p>Sem anotações.</p>'}</div>

    <h2>4. Avaliação da Sessão</h2>
    <h3>Percepção Subjetiva do Cliente:</h3>
    <div class="content">${percepcaoCliente || '<p>Não preenchido.</p>'}</div>
    <p><strong>Status de Progresso:</strong> ${progresso || 'Não avaliado'}</p>

    <h2>5. Plano de Continuidade</h2>
    <h3>Tarefas Recomendadas (Intersessão):</h3>
    <div class="content">${tarefas || '<p>Nenhuma tarefa definida.</p>'}</div>
    <h3>Planejamento da Próxima Sessão:</h3>
    <div class="content">${planejamento || '<p>Não registrado.</p>'}</div>

    <h2>6. Considerações Éticas e Técnicas</h2>
    <h3>Confidencialidade:</h3>
    <div class="content">${confidencialidade || '<p>Não aplicável.</p>'}</div>
    <h3>Encaminhamentos Especiais:</h3>
    <div class="content">${encaminhamentos || '<p>Nenhum encaminhamento registrado.</p>'}</div>

    <div class="assinatura">
        ${assinaturaPayload ? `<img src="${assinaturaPayload}" alt="Assinatura">` : ''}
        ____________________________________________________<br>
        <strong>${recordPayload.fields.psicologo}</strong><br>
        Psicólogo(a) Clínico(a) | CRP: ${recordPayload.fields.crp}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Prontuario_${nomeCliente.replace(/\s+/g, "_") || "Atendimento"}_${recordPayload.fields.dataAtendimento}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Documento HTML baixado!");
  };

  // Import HTML
  const handleImportHtml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const htmlText = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      // Parse rich text content fields
      const contentBlocks = doc.querySelectorAll(".content");
      contentBlocks.forEach((item) => {
        const parentHeader = item.previousElementSibling;
        const headerText = parentHeader?.textContent?.toLowerCase() || "";
        const innerHTML = item.innerHTML.trim();

        if (headerText.includes("queixa") || headerText.includes("motivo")) setMotivoConsulta(innerHTML);
        else if (headerText.includes("objetivos do cliente")) setObjetivosCliente(innerHTML);
        else if (headerText.includes("objetivos do terapeuta")) setObjetivosTerapeuta(innerHTML);
        else if (headerText.includes("relato detalhado")) setRelatoCliente(innerHTML);
        else if (headerText.includes("intervenções")) setIntervencoes(innerHTML);
        else if (headerText.includes("observações")) setObservacoes(innerHTML);
        else if (headerText.includes("insights")) setInsights(innerHTML);
        else if (headerText.includes("percepção")) setPercepcaoCliente(innerHTML);
        else if (headerText.includes("tarefas")) setTarefas(innerHTML);
        else if (headerText.includes("próxima sessão") || headerText.includes("planejamento")) setPlanejamento(innerHTML);
        else if (headerText.includes("confidencialidade")) setConfidencialidade(innerHTML);
        else if (headerText.includes("encaminhamentos")) setEncaminhamentos(innerHTML);
      });

      // Parse signature img
      const signatureImg = doc.querySelector(".assinatura img");
      if (signatureImg) {
        const base64 = signatureImg.getAttribute("src") || "";
        setAssinaturaPayload(base64);
      }

      toast.success("Prontuário importado para o formulário!");
    } catch (err: any) {
      toast.error("Falha ao analisar arquivo HTML.");
    } finally {
      e.target.value = "";
    }
  };

  const handleExportBackupJson = async () => {
    try {
      const backup = {
        records: recordsList,
        exportedAt: new Date().toISOString(),
        version: "5.0-cortex"
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Backup_RegistroAtendimento_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Backup baixado com sucesso!");
    } catch (e: any) {
      toast.error("Falha ao exportar backup.");
    }
  };

  const handleImportBackupJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedPatientId) {
      toast.error("Por favor, selecione um paciente para onde importar os registros.");
      return;
    }

    if (!window.confirm("Importar substituirá ou adicionará registros no prontuário do paciente selecionado. Deseja prosseguir?")) {
      e.target.value = "";
      return;
    }

    try {
      const rawText = await file.text();
      const parsedData = JSON.parse(rawText);

      if (parsedData.records && Array.isArray(parsedData.records)) {
        for (const rec of parsedData.records) {
          await dbWrapper.saveEntry(rec, selectedPatientId, userId);
        }
        toast.success("Backup restaurado no prontuário do paciente!");
        await fetchHistory();
      } else {
        toast.error("Arquivo JSON inválido.");
      }
    } catch (err: any) {
      toast.error("Erro ao importar backup: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER BAR */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black transition-transform hover:scale-105">
            <ClipboardList size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            Registro de
            <span className="text-primary font-black">Atendimento</span> 
          </h1>
        </div>

        {/* PATIENT SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-text-dim uppercase tracking-wider hidden sm:inline">Paciente:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            disabled={lockPatient}
            className={cn(
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-primary transition-all max-w-[200px] truncate cursor-pointer",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`patient-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
          {selectedPatientId && openTool && (
            <button
              onClick={() => openTool('teleconsulta', selectedPatientId)}
              className="p-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-bg-deep rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Iniciar Teleconsulta"
            >
              <Video size={14} />
              <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">Teleconsulta</span>
            </button>
          )}
        </div>

        {/* NAV TABS */}
        <div className="flex items-center gap-2 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
          {[
            { id: 'new-record', label: 'Novo Registro', icon: FilePlus },
            { id: 'list-records', label: 'Histórico', icon: ClipboardList },
            { id: 'settings', label: 'Configurações', icon: SettingsIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer",
                  isSel
                    ? "bg-bg-card text-primary border border-border-subtle shadow-sm animate-in fade-in duration-200" 
                    : "text-text-dim hover:text-text-main"
                )}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-y-auto relative p-6">
        {!selectedPatientId && currentPage !== 'settings' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
            <ClipboardList size={48} className="text-primary mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Selecione um paciente no topo da janela para começar a preencher as anotações do atendimento ou visualizar o histórico.
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto h-full">
            {/* 1. FORM PAGE */}
            {currentPage === "new-record" && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6 select-text pb-20">
                {/* Módulo Escriba Clínico de IA (Noa Health / Voa Notes) */}
                <ClinicalAudioRecorder 
                  patient={{ id: selectedPatientId, name: nomeCliente, age: idadeCliente, clinicalProfile: patientClinicalBackground }}
                  approaches={abordagensSessao.length > 0 ? abordagensSessao : ['TCC 4ª Geração']}
                  onTranscriptionComplete={handleScribeComplete}
                  onProgressiveUpdate={handleScribeProgressiveUpdate}
                />

                {/* Dados Técnicos */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">Dados Técnicos do Atendimento</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Psicólogo Clínico</label>
                      <input 
                        type="text" 
                        value={psicologo} 
                        onChange={(e) => setPsicologo(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">CRP</label>
                      <input 
                        type="text" 
                        value={crp} 
                        onChange={(e) => setCrp(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Data do Atendimento</label>
                      <input 
                        type="date" 
                        value={dataAtendimento} 
                        onChange={(e) => {
                          setDataAtendimento(e.target.value);
                          generateAndSetCode(e.target.value);
                        }} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Horário</label>
                      <input 
                        type="time" 
                        value={horario} 
                        onChange={(e) => setHorario(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Código do Registro</label>
                      <input 
                        type="text" 
                        value={codigoRegistro} 
                        onChange={(e) => setCodigoRegistro(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-dim font-mono font-bold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Sessão Nº</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={numeroSessao} 
                        onChange={(e) => setNumeroSessao(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Tipo da Sessão</label>
                      <select 
                        value={tipoSessao} 
                        onChange={(e) => setTipoSessao(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Individual">Individual</option>
                        <option value="Casal">Casal</option>
                        <option value="Família">Família</option>
                        <option value="Mentoria">Mentoria</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Local / Canal</label>
                      <select 
                        value={localSessao} 
                        onChange={(e) => setLocalSessao(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Online">Online</option>
                        <option value="Consultório">Consultório</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block">Abordagem Psicoterapêutica</label>
                    <MultiSelect 
                      options={customApproaches} 
                      selectedValues={abordagensSessao} 
                      onChange={(values) => setAbordagensSessao(values)} 
                    />
                  </div>
                </div>

                {/* 1. Identificação do Cliente */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">1. Identificação de Prontuário do Cliente</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Nome do Cliente *</label>
                      <input 
                        type="text" 
                        required
                        value={nomeCliente} 
                        onChange={(e) => setNomeCliente(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Idade</label>
                      <input 
                        type="number" 
                        min="0"
                        value={idadeCliente} 
                        onChange={(e) => setIdadeCliente(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Sexo</label>
                      <select 
                        value={sexoCliente} 
                        onChange={(e) => setSexoCliente(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                      </select>
                    </div>
                  </div>

                  <div className="max-w-md space-y-1.5">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Contato</label>
                    <input 
                      type="text" 
                      value={contatoCliente} 
                      onChange={(e) => setContatoCliente(e.target.value)} 
                      className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Motivo da Consulta / Queixa Primária</label>
                    <RichTextEditor 
                      id="motivoConsulta" 
                      value={motivoConsulta} 
                      onChange={(val) => setMotivoConsulta(val)} 
                      isAiEnabled={true}
                      isAiLoading={aiLoadingFields["motivoConsulta"]}
                      onAiTrigger={() => triggerAiForField("motivoConsulta", "motivo-consulta")}
                    />
                  </div>
                </div>

                {/* 2. Objetivos */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">2. Objetivos da Sessão</h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Objetivos do Cliente</label>
                      <RichTextEditor 
                        id="objetivosCliente" 
                        value={objetivosCliente} 
                        onChange={(val) => setObjetivosCliente(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["objetivosCliente"]}
                        onAiTrigger={() => triggerAiForField("objetivosCliente", "objetivos-cliente")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Objetivos do Terapeuta</label>
                      <RichTextEditor 
                        id="objetivosTerapeuta" 
                        value={objetivosTerapeuta} 
                        onChange={(val) => setObjetivosTerapeuta(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["objetivosTerapeuta"]}
                        onAiTrigger={() => triggerAiForField("objetivosTerapeuta", "objetivos-terapeuta")}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Estrutura e Prática */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">3. Estrutura e Prática do Atendimento</h4>
                  <div className="space-y-4">
                    <div className="bg-bg-deep p-4 border border-border-subtle rounded-2xl space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h5 className="text-[10px] font-black text-text-main uppercase tracking-widest">3.1. Relato Detalhado do Cliente</h5>
                          <p className="text-[9px] text-text-dim mt-0.5 uppercase tracking-wider font-bold">Use os botões abaixo para gravar ou enviar áudio e transcrever.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleToggleVoiceRecording}
                            disabled={isTranscribingAudio}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all border",
                              isRecording 
                                ? "bg-rose-500/25 border-rose-500/40 text-rose-500 animate-pulse" 
                                : "bg-bg-card hover:bg-white/5 border-border-subtle text-text-main"
                            )}
                          >
                            {isRecording ? <Square size={10} fill="currentColor" /> : <Volume2 size={10} />}
                            <span>{isRecording ? "Parar Gravação" : "Gravar Voz"}</span>
                          </button>
                          
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-bg-card hover:bg-white/5 border border-border-subtle text-text-main cursor-pointer transition-all">
                            <Upload size={10} />
                            <span>Transcrever Áudio</span>
                            <input 
                              type="file" 
                              accept="audio/*" 
                              onChange={handleTranscribalAudioUpload} 
                              className="hidden" 
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => triggerAiForField("relatoCliente", "formatar-relato")}
                            disabled={aiLoadingFields["relatoCliente"] || isTranscribingAudio}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 cursor-pointer transition-all disabled:opacity-50"
                          >
                            <Sparkles size={10} />
                            <span>Formatar Relato</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleAutoFillAllFields}
                            disabled={isAutoFillingAll || isTranscribingAudio}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-primary to-emerald-500 text-bg-deep font-black shadow-md cursor-pointer transition-all disabled:opacity-50"
                          >
                            <Sparkles size={10} className="text-bg-deep" />
                            <span>{isAutoFillingAll ? "Gerando..." : "Preencher Tudo"}</span>
                          </button>
                        </div>
                      </div>
                      
                      {recordingStatus && (
                        <div className="px-3 py-1.5 bg-bg-card border border-border-subtle rounded-xl text-[9px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                          <span>{recordingStatus}</span>
                        </div>
                      )}
                    </div>

                    <RichTextEditor 
                      id="relatoCliente" 
                      value={relatoCliente} 
                      onChange={(val) => setRelatoCliente(val)} 
                      isAiEnabled={false}
                    />

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">3.2. Intervenções Utilizadas</label>
                      <RichTextEditor 
                        id="intervencoes" 
                        value={intervencoes} 
                        onChange={(val) => setIntervencoes(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["intervencoes"]}
                        onAiTrigger={() => triggerAiForField("intervencoes", "intervencoes")}
                      />
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">3.3. Observações Clínicas</label>
                      <RichTextEditor 
                        id="observacoes" 
                        value={observacoes} 
                        onChange={(val) => setObservacoes(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["observacoes"]}
                        onAiTrigger={() => triggerAiForField("observacoes", "observacoes")}
                      />
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">3.4. Insights Emergentes</label>
                      <RichTextEditor 
                        id="insights" 
                        value={insights} 
                        onChange={(val) => setInsights(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["insights"]}
                        onAiTrigger={() => triggerAiForField("insights", "insights")}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Avaliação */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">4. Avaliação e Progresso Clínico</h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Percepção do Cliente</label>
                      <RichTextEditor 
                        id="percepcaoCliente" 
                        value={percepcaoCliente} 
                        onChange={(val) => setPercepcaoCliente(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["percepcaoCliente"]}
                        onAiTrigger={() => triggerAiForField("percepcaoCliente", "percepcao-cliente")}
                      />
                    </div>
                    <div className="max-w-md space-y-1.5 pt-1">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block">Progresso Estimado</label>
                      <select 
                        value={progresso} 
                        onChange={(e) => setProgresso(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="">Selecione status de progresso</option>
                        <option value="Excelente">Excelente</option>
                        <option value="Satisfatório">Satisfatório</option>
                        <option value="Em desenvolvimento">Em desenvolvimento</option>
                        <option value="Necessita de ajuste">Necessita de ajuste</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. Continuidade */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">5. Continuidade e Plano Intersessão</h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Tarefas de Casa Recomendadas</label>
                      <RichTextEditor 
                        id="tarefas" 
                        value={tarefas} 
                        onChange={(val) => setTarefas(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["tarefas"]}
                        onAiTrigger={() => triggerAiForField("tarefas", "tarefas")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Planejamento da Próxima Sessão</label>
                      <RichTextEditor 
                        id="planejamento" 
                        value={planejamento} 
                        onChange={(val) => setPlanejamento(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["planejamento"]}
                        onAiTrigger={() => triggerAiForField("planejamento", "planejamento")}
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Considerações Éticas */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">6. Considerações Éticas e Técnicas</h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Declaração de Confidencialidade</label>
                      <RichTextEditor 
                        id="confidencialidade" 
                        value={confidencialidade} 
                        onChange={(val) => setConfidencialidade(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["confidencialidade"]}
                        onAiTrigger={() => triggerAiForField("confidencialidade", "confidencialidade")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1">Encaminhamentos Especiais</label>
                      <RichTextEditor 
                        id="encaminhamentos" 
                        value={encaminhamentos} 
                        onChange={(val) => setEncaminhamentos(val)} 
                        isAiEnabled={true}
                        isAiLoading={aiLoadingFields["encaminhamentos"]}
                        onAiTrigger={() => triggerAiForField("encaminhamentos", "encaminhamentos")}
                      />
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-bg-card border border-border-subtle rounded-2xl sticky bottom-2 shadow-2xl z-20">
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider font-bold">
                    {autoSaveStatus ? (
                      <span className="text-primary font-black animate-pulse flex items-center gap-1.5">
                        <RefreshCw size={10} className="animate-spin text-primary" />
                        {autoSaveStatus}
                      </span>
                    ) : (
                      <span className="text-text-dim">Alterações salvas localmente.</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-bg-sidebar hover:bg-white/5 text-text-main text-[9px] font-black uppercase tracking-wider border border-border-subtle rounded-xl cursor-pointer transition-all">
                      <FileUp size={12} />
                      <span>Importar HTML</span>
                      <input 
                        type="file" 
                        accept=".html,.htm" 
                        onChange={handleImportHtml} 
                        className="hidden" 
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleExportHtml}
                      className="flex items-center gap-1.5 px-3 py-2 bg-bg-sidebar hover:bg-white/5 text-text-main text-[9px] font-black uppercase tracking-wider border border-border-subtle rounded-xl transition-all cursor-pointer"
                    >
                      <FileDown size={12} />
                      <span>Exportar HTML</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="px-3.5 py-2 bg-bg-sidebar hover:bg-white/5 text-text-dim hover:text-text-main text-[9px] font-black uppercase tracking-wider border border-border-subtle rounded-xl transition-all cursor-pointer"
                    >
                      Limpar
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveBtnClick}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-primary/95 text-bg-deep text-[9px] font-black uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <Save size={12} />
                      <span>{recordId ? "Re-gravar Registro" : "Salvar Registro"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 2. HISTORY LIST PAGE */}
            {currentPage === "list-records" && (
              <div className="space-y-6 pb-20 select-text">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 bg-bg-sidebar border border-border-subtle rounded-2xl shadow-md">
                  <div>
                    <h3 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                      <ClipboardList size={16} className="text-primary" />
                      Prontuários Clínicos Salvos
                    </h3>
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-wider mt-1">Busque por cliente ou filtre datas.</p>
                  </div>

                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-dim" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar cliente ou data (AAAA-MM-DD)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main placeholder-text-dim/60 font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {recordsList.filter(r => {
                    const queryLower = searchQuery.toLowerCase();
                    return !searchQuery || 
                      r.patient.name.toLowerCase().includes(queryLower) ||
                      (r.fields.codigoRegistro && r.fields.codigoRegistro.toLowerCase().includes(queryLower)) ||
                      (r.fields.dataAtendimento && r.fields.dataAtendimento.includes(searchQuery));
                  }).length === 0 ? (
                    <div className="p-12 text-center bg-bg-sidebar border border-border-subtle/50 rounded-2xl">
                      <ClipboardList size={38} className="mx-auto text-text-dim/40 mb-3" />
                      <p className="text-text-dim text-xs font-bold uppercase tracking-wider">Nenhum prontuário correspondente ou salvo encontrado.</p>
                      <button 
                        onClick={() => setCurrentPage("new-record")}
                        className="mt-3 text-[10px] text-primary hover:underline font-black uppercase tracking-widest cursor-pointer"
                      >
                        Criar Novo Registro
                      </button>
                    </div>
                  ) : (
                    recordsList.filter(r => {
                      const queryLower = searchQuery.toLowerCase();
                      return !searchQuery || 
                        r.patient.name.toLowerCase().includes(queryLower) ||
                        (r.fields.codigoRegistro && r.fields.codigoRegistro.toLowerCase().includes(queryLower)) ||
                        (r.fields.dataAtendimento && r.fields.dataAtendimento.includes(searchQuery));
                    }).map((record) => {
                      const f = record.fields;
                      let abordagensArray: string[] = [];
                      try {
                        if (f.abordagensSessao.startsWith('[')) {
                          abordagensArray = JSON.parse(f.abordagensSessao);
                        }
                      } catch (e) {}

                      return (
                        <div 
                          key={record.id} 
                          className="p-5 bg-bg-sidebar border border-border-subtle rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/30 hover:bg-bg-sidebar/95 shadow-sm"
                        >
                          <div className="space-y-1 min-w-0">
                            <p className="font-black text-text-main text-xs uppercase tracking-wider">{record.patient.name || 'Sem Nome'}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-dim font-mono">
                              <span>📅 Atendimento: {f.dataAtendimento ? f.dataAtendimento.split('-').reverse().join('/') : 'N/A'}</span>
                              <span>⏱️ Horário: {f.horario || 'N/A'}</span>
                              {f.numeroSessao && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Sessão {f.numeroSessao}</span>}
                              {f.tipoSessao && <span className="bg-white/5 text-text-main px-1.5 py-0.5 rounded text-[9px] font-black uppercase">{f.tipoSessao}</span>}
                            </div>

                            {abordagensArray.length > 0 && (
                              <p className="text-[10px] text-text-dim italic mt-1 font-semibold">
                                Abordagem: {abordagensArray.join(", ")}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => editRecord(record)}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-card hover:bg-white/5 text-text-main text-[9px] font-black uppercase tracking-widest rounded-xl border border-border-subtle transition-all cursor-pointer"
                            >
                              <Edit3 size={11} />
                              <span>Editar</span>
                            </button>
                            
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="flex items-center justify-center p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-bg-deep rounded-xl border border-rose-500/20 hover:border-transparent transition-all cursor-pointer"
                              title="Deletar este prontuário"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 3. SETTINGS PAGE */}
            {currentPage === "settings" && (
              <div className="space-y-6 pb-20 select-text">
                {/* Visual */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-5 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">Aparência e Identidade Visual</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block">Tema de Cor local (Registro)</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "theme-light", name: "Padrão Claro", primary: "#efefef" },
                        { key: "theme-dark", name: "Moderno Escuro", primary: "#1e1e1e" },
                        { key: "theme-indigo", name: "Frosted Indigo", primary: "#4f46e5" },
                        { key: "theme-purple", name: "Ametista Purple", primary: "#7c3aed" },
                        { key: "theme-teal", name: "Turquesa Teal", primary: "#0d9488" }
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setTheme(preset.key)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5",
                            theme === preset.key 
                              ? "bg-primary text-bg-deep border-primary shadow-md font-bold" 
                              : "bg-bg-card text-text-dim border-border-subtle hover:bg-white/5"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: preset.primary }} />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Tipo de Fonte</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="'Inter', ui-sans-serif, system-ui, sans-serif">Inter (Padrão)</option>
                        <option value="'Tinos', 'Times New Roman', serif">Times New Roman (Clássico)</option>
                        <option value="Arial, Helvetica, sans-serif">Arial</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Tamanho Padrão da Fonte</label>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-semibold outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="14px">Pequeno (14px)</option>
                        <option value="16px">Médio (16px, Recomendado)</option>
                        <option value="18px">Grande (18px)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Logo Profissional (PDF/HTML)</label>
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-1.5 px-4 h-10 bg-bg-deep hover:bg-white/5 border border-border-subtle rounded-xl cursor-pointer transition-all text-xs font-semibold text-text-main">
                          <Upload size={14} />
                          <span>Carregar Logo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoUpload} 
                            className="hidden" 
                          />
                        </label>
                        {logo && (
                          <button
                            type="button"
                            onClick={async () => {
                              setLogo("");
                              await db.settings.delete("appLogo");
                              toast.success("Logo removido");
                            }}
                            className="px-3.5 py-2.5 text-xs text-rose-400 hover:text-rose-300 font-bold hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer border border-transparent"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      {logo && (
                        <div className="p-4 bg-bg-deep border border-border-subtle rounded-xl max-w-xs flex items-center justify-center">
                          <img src={logo} alt="Logo" className="max-h-16 object-contain" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Assinatura Digitalizada (PNG com Fundo Transparente)</label>
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-1.5 px-4 h-10 bg-bg-deep hover:bg-white/5 border border-border-subtle rounded-xl cursor-pointer transition-all text-xs font-semibold text-text-main">
                          <Upload size={14} />
                          <span>Carregar Assinatura</span>
                          <input 
                            type="file" 
                            accept="image/png" 
                            onChange={handleAssinaturaUpload} 
                            className="hidden" 
                          />
                        </label>
                        {globalAssinatura && (
                          <button
                            type="button"
                            onClick={async () => {
                              setGlobalAssinatura("");
                              setAssinaturaPayload("");
                              await db.settings.delete("psychSignature");
                              toast.success("Assinatura removida");
                            }}
                            className="px-3.5 py-2.5 text-xs text-rose-400 hover:text-rose-300 font-bold hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer border border-transparent"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      {globalAssinatura && (
                        <div className="p-4 bg-bg-deep border border-border-subtle rounded-xl max-w-xs flex items-center justify-center">
                          <img src={globalAssinatura} alt="Assinatura" className="max-h-16 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gemini Setup */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">Configuração da IA (Google Gemini)</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Chave de API Gemini Pessoal</label>
                      <input 
                        type="password" 
                        placeholder="Chave de API do Gemini..."
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)} 
                        className="w-full px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main font-mono outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Abordagens */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-border-subtle/50">Abordagens Psicológicas Disponíveis</h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Adicionar nova abordagem à lista</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ex: Terapia de Aceitação e Compromisso (ACT)..."
                        value={newApproachInput} 
                        onChange={(e) => setNewApproachInput(e.target.value)} 
                        className="flex-1 px-3 py-2 text-xs bg-bg-deep border border-border-subtle rounded-xl text-text-main outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddApproach}
                        className="px-4 py-2 bg-primary text-bg-deep font-black text-[10px] uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block mb-1.5">Filas e opções cadastradas</label>
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-2">
                      {customApproaches.map((item) => (
                        <div key={item} className="p-2.5 bg-bg-deep border border-border-subtle rounded-xl flex items-center justify-between gap-4 text-xs font-semibold text-text-main">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveApproach(item)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-border-subtle/40" />

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block">Abordagens Padrão Pré-Selecionadas em Novas Consultas</label>
                    <MultiSelect 
                      options={customApproaches} 
                      selectedValues={defaultApproaches} 
                      onChange={(values) => setDefaultApproaches(values)} 
                    />
                  </div>
                </div>

                {/* Backups */}
                <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-4 shadow-md">
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider pb-2 border-b border-border-subtle/50">Gerenciador e Backup Geral de Prontuários</h4>
                  <p className="text-[10px] text-text-dim font-medium leading-relaxed">
                    Exporte todas as consultas, históricos e configurações de seu dispositivo para fins de backup permanente.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleExportBackupJson}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-bg-deep hover:bg-white/5 text-text-main text-[10px] font-black uppercase tracking-wider border border-border-subtle rounded-xl transition-all cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Exportar Backup (.JSON)</span>
                    </button>

                    <label className="flex items-center gap-1.5 px-3.5 py-2.5 bg-bg-deep hover:bg-white/5 text-text-main text-[10px] font-black uppercase tracking-wider border border-border-subtle rounded-xl cursor-pointer transition-all">
                      <Upload size={13} />
                      <span>Restaurar Backup (.JSON)</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImportBackupJson} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* SAVE PARAMETERS CONTROL BUTTON */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="flex items-center gap-1.5 px-6 py-3 bg-primary text-bg-deep font-black text-xs uppercase tracking-widest rounded-xl shadow-xl transition-all cursor-pointer active:scale-95"
                  >
                    <Save size={14} />
                    <span>Gravar Configurações</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-border-subtle bg-bg-card text-text-main',
        }}
      />
    </div>
  );
}
