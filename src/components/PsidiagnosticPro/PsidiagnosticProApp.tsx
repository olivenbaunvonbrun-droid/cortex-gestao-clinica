import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  History as HistoryIcon, 
  User, 
  Users, 
  Zap, 
  Plus, 
  Trash2, 
  Brain, 
  X,
  Upload,
  FileText,
  Download,
  ClipboardCheck,
  CheckCircle2,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosticRecord, PatientData } from './types';
import { analyzePsidiagnosticAssessment } from '../../services/geminiService';
import { exportToHtml } from './utils/export';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/psidiagnosticDbWrapper';
import { Toaster, toast } from 'react-hot-toast';

// Helper components
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';

interface PsidiagnosticProAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  textContent?: string;
  base64Data?: string;
}

export default function PsidiagnosticProApp({ activePatientId, lockPatient = false, userId }: PsidiagnosticProAppProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'history'>('test');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [includeProntuario, setIncludeProntuario] = useState<boolean>(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [assessments, setAssessments] = useState<DiagnosticRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<DiagnosticRecord | null>(null);

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

  // Load history when selectedPatientId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (selectedPatientId) {
        const loadedHistory = await dbWrapper.getHistory(selectedPatientId);
        setAssessments(loadedHistory);
      } else {
        setAssessments([]);
      }
    };
    loadHistory();
  }, [selectedPatientId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.html') || file.name.endsWith('.json');
      
      reader.onload = (event: any) => {
        const newFile: UploadedFile = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          textContent: isText ? event.target.result : undefined,
          base64Data: !isText ? event.target.result : undefined
        };
        setUploadedFiles(prev => [...prev, newFile]);
        toast.success(`Arquivo ${file.name} anexado com sucesso!`);
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
    toast.success('Arquivo removido.');
  };

  const handleSimulate = () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente para simular!');
      return;
    }
    setIncludeProntuario(true);
    setUploadedFiles([
      {
        id: 'mock-f1',
        name: 'exame_neuropsicologico_escola.txt',
        type: 'text/plain',
        size: 1024,
        textContent: 'Paciente demonstra dificuldades severas de atenção concentrada e alternada em ambiente escolar. Escores na escala WISC-IV apontam déficit em memória de trabalho (percentil 12) e velocidade de processamento (percentil 18). Desempenho acadêmico prejudicado em leitura e matemática.'
      },
      {
        id: 'mock-f2',
        name: 'triagem_clinica_hospital.txt',
        type: 'text/plain',
        size: 512,
        textContent: 'Encaminhamento hospitalar devido a picos agudos de ansiedade e sintomas somáticos (palpitação, sudorese, dispneia). Avaliação médica descartou comprometimento cardiovascular ou respiratório orgânico.'
      }
    ]);
    toast.success('Simulação de documentos carregada com sucesso!');
  };

  const fetchProntuarioText = async (patientId: string): Promise<string> => {
    const patientRecord = await db.prontuarios.get(patientId);
    if (!patientRecord) return '';
    
    let text = '';
    
    if (patientRecord.anamneseData && Object.keys(patientRecord.anamneseData).length > 0) {
      text += `--- ANAMNESE E DADOS INICIAIS ---\n`;
      text += `${JSON.stringify(patientRecord.anamneseData, null, 2)}\n\n`;
    }
    
    if (patientRecord.entradas && patientRecord.entradas.length > 0) {
      text += `--- HISTÓRICO DE EVOLUÇÕES CLÍNICAS (SESSÕES) ---\n`;
      patientRecord.entradas.forEach((entry, idx) => {
        // Clear HTML tags
        const cleanText = entry.textoHtml.replace(/<[^>]*>/g, '').trim();
        text += `Sessão ${idx + 1} (${entry.data}): ${cleanText}\n\n`;
      });
    }

    if (patientRecord.longitudinalProfile) {
      text += `--- PANORAMA LONGITUDINAL ANTERIOR ---\n`;
      text += `${patientRecord.longitudinalProfile}\n\n`;
    }
    
    return text.trim();
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de analisar!');
      return;
    }
    
    if (!includeProntuario && uploadedFiles.length === 0) {
      toast.error('Selecione pelo menos uma fonte de dados (histórico do prontuário ou arquivos anexos).');
      return;
    }

    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    setIsAnalyzing(true);
    try {
      const pData: PatientData = {
        name: patientObj.nome,
        age: patientObj.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : 'N/D',
        psychologistName: settings.professionalName,
        crp: settings.professionalCRP,
        logoUrl: settings.professionalLogo,
        signatureUrl: settings.professionalSignature
      };

      // 1. Fetch prontuario if checked
      const prontuarioText = includeProntuario ? await fetchProntuarioText(selectedPatientId) : '';

      // 2. Parse files
      let filesText = '';
      uploadedFiles.forEach(f => {
        filesText += `Arquivo: ${f.name} (Tipo: ${f.type})\n`;
        if (f.textContent) {
          filesText += `Conteúdo do documento:\n${f.textContent}\n`;
        } else {
          filesText += `[Documento não-texto ou imagem anexada. Nome: ${f.name}]\n`;
        }
        filesText += `\n`;
      });

      // 3. AI Analysis
      let analysis = '';
      try {
        analysis = await analyzePsidiagnosticAssessment(
          { name: pData.name, age: pData.age },
          prontuarioText,
          filesText
        );
      } catch (err: any) {
        console.error("Erro ao gerar análise Psicodiagnóstico via IA:", err);
        toast.error('Não foi possível gerar a análise da IA, mas o laudo foi salvo localmente.');
        analysis = 'Não foi possível gerar a análise técnica de IA no momento do salvamento.';
      }

      const newRecord: DiagnosticRecord = {
        id: Date.now().toString(),
        patient: pData,
        hasProntuarioData: includeProntuario && prontuarioText.length > 0,
        uploadedFilesCount: uploadedFiles.length,
        aiAnalysis: analysis,
        createdAt: new Date().toISOString()
      };

      const updated = await dbWrapper.saveEntry(newRecord, selectedPatientId, userId);
      setAssessments(updated);
      setCurrentResult(newRecord);
      toast.success('Laudo psicodiagnóstico gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar e salvar o laudo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Tem certeza que deseja excluir permanentemente este laudo psicodiagnóstico?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setAssessments(updated);
        toast.success('Laudo excluído com sucesso.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao deletar laudo.');
      }
    }
  };

  const handleExport = (assessment: DiagnosticRecord) => {
    exportToHtml(assessment);
  };

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER COMPONENT */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#8b5cf6] h-8 w-8 rounded-lg flex items-center justify-center text-white font-black transition-transform hover:scale-105">
            <FileSpreadsheet size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            Psidiagnostic
            <span className="text-[#8b5cf6] font-black">Pro</span> 
          </h1>
        </div>
        
        {/* PATIENT SELECTOR DROPDOWN */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-text-dim" />
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setCurrentResult(null);
              setUploadedFiles([]);
            }}
            disabled={lockPatient}
            className={cn(
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-[#8b5cf6] transition-all max-w-[200px] truncate",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`pd-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* TOP BUTTONS & SUB-TABS */}
        <div className="flex items-center gap-3">
          {activeTab === 'test' && !currentResult && selectedPatientId && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSimulate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#8b5cf6] transition-all cursor-pointer"
              >
                <Zap size={11} /> Simular
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Brain size={11} />
                )}
                Gerar Laudo Psicodiagnóstico
              </button>
            </div>
          )}
          <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
            {[
              { id: 'test', label: 'Avaliação' },
              { id: 'history', label: 'Laudos Arquivados' }
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
                    ? "bg-bg-card text-[#8b5cf6] border border-border-subtle shadow-sm" 
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
      <main className="flex-1 flex overflow-auto relative">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
            <FileSpreadsheet size={48} className="text-[#8b5cf6] mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no topo da janela para começar a preencher as fontes psicodiagnósticas ou visualizar o histórico de laudos.
            </p>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col overflow-auto">
            {/* Form Tab Panel */}
            <div className={cn("w-full flex-1 flex flex-col overflow-auto", (activeTab === 'test' && !currentResult) ? "block" : "hidden")}>
              <div className="flex flex-1 overflow-auto w-full relative">
                  {/* Left panel info & stats */}
                  <aside className="w-64 border-r border-border-subtle bg-bg-sidebar/30 p-6 flex flex-col gap-6 overflow-y-auto scroller-hide shrink-0 hidden md:flex">
                    <div>
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Paciente</h3>
                      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl space-y-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-dim/60 uppercase">Nome</span>
                          <span className="font-bold text-xs truncate">{patients.find(p => String(p.id) === String(selectedPatientId))?.nome || 'N/D'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-dim/60 uppercase">Idade</span>
                          <span className="font-bold text-xs">
                            {(() => {
                              const p = patients.find(p => String(p.id) === String(selectedPatientId));
                              return p?.nascimento ? `${new Date().getFullYear() - new Date(p.nascimento).getFullYear()} anos` : 'N/D';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-subtle pt-6">
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Fontes de Entrada</h3>
                      <div className="space-y-3 text-[10px] text-text-dim font-bold uppercase tracking-wider">
                        <div className="flex justify-between items-center">
                          <span>Prontuário Ativo:</span>
                          <span className={cn("px-2 py-0.5 rounded text-[8px] font-black", includeProntuario ? "text-purple-400 bg-purple-500/10" : "text-text-dim/40 bg-bg-sidebar")}>
                            {includeProntuario ? 'SIM' : 'NÃO'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Arquivos Anexos:</span>
                          <span className="text-[#8b5cf6] font-black">{uploadedFiles.length}</span>
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Right main workspace split into Form + Interactive List */}
                  <div className="flex-1 flex flex-col lg:flex-row overflow-auto bg-bg-deep">
                    {/* Diagnostic configuration container */}
                    <div className="w-full lg:w-[380px] lg:border-r border-border-subtle p-6 overflow-y-auto scroller-hide shrink-0 bg-bg-sidebar/10">
                      <h2 className="text-sm font-bold tracking-tight text-text-main mb-6 flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-[#8b5cf6]" /> Fontes Psicodiagnósticas
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Include Prontuario Checkbox */}
                        <div 
                          onClick={() => setIncludeProntuario(!includeProntuario)}
                          className={cn(
                            "p-5 rounded-[2rem] border transition-all cursor-pointer flex items-start gap-4",
                            includeProntuario 
                              ? "bg-purple-500/5 border-purple-500/30 shadow-md"
                              : "bg-bg-sidebar/30 border-border-subtle hover:border-[#8b5cf6]/25"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                            includeProntuario ? "bg-[#8b5cf6] border-[#8b5cf6] text-white" : "border-border-subtle"
                          )}>
                            {includeProntuario && <CheckCircle2 size={12} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-text-main">Histórico do Prontuário</h4>
                            <p className="text-[10px] text-text-dim leading-relaxed font-medium mt-1">
                              Importa e cruza dados das evoluções, anamnese estruturada e resumos longitudinal do paciente selecionado.
                            </p>
                          </div>
                        </div>

                        {/* File Upload Box */}
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Anexar Documentos Médicos / Clínicos</label>
                          <label className="flex flex-col items-center justify-center p-6 border border-border-subtle border-dashed rounded-[2rem] bg-bg-card hover:bg-bg-sidebar/45 hover:border-[#8b5cf6]/30 cursor-pointer transition-all group text-center">
                            <Upload className="text-text-dim/40 group-hover:text-[#8b5cf6] mb-3 transition-colors" size={24} />
                            <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Selecionar arquivos</span>
                            <span className="text-[8px] font-bold text-text-dim/30 uppercase tracking-tighter mt-1">HTML, PDF, TXT, PNG, JPG (MÁX 5MB)</span>
                            <input 
                              type="file" 
                              multiple 
                              className="hidden" 
                              onChange={handleFileUpload} 
                              accept=".html,.pdf,.txt,.jpeg,.jpg,.png" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Files list workspace */}
                    <div className="flex-1 p-6 overflow-y-auto scroller-hide select-text">
                      <h2 className="text-xs font-black text-text-dim uppercase tracking-widest mb-4">
                        Documentos Anexos ({uploadedFiles.length})
                      </h2>
                      
                      {uploadedFiles.length === 0 ? (
                        <div className="text-center py-16 bg-bg-card/40 rounded-[2rem] border border-border-subtle border-dashed">
                          <FileText size={24} className="mx-auto text-text-dim mb-3" />
                          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhum documento externo anexado</p>
                          <p className="text-[8px] text-text-dim/60 uppercase tracking-widest mt-1 max-w-[240px] mx-auto leading-relaxed">
                            Envie laudos externos, avaliações neuropsicológicas ou relatórios de triagem para complementar a inteligência diagnóstica.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {uploadedFiles.map((file) => (
                            <div 
                              key={file.id}
                              className="p-4 bg-bg-card border border-border-subtle rounded-2xl flex items-center justify-between hover:border-[#8b5cf6]/25 transition-all duration-200 shadow-sm"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] shrink-0">
                                  <File size={16} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-text-main truncate pr-2">{file.name}</h4>
                                  <p className="text-[9px] text-text-dim font-bold uppercase tracking-wider">
                                    {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1] || 'doc'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-2 text-text-dim/50 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer shrink-0"
                                title="Remover Arquivo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            {/* History Tab Panel */}
            <div className={cn("flex-grow overflow-y-auto p-6 bg-bg-deep scroller-hide select-text", (activeTab === 'history' && !currentResult) ? "block" : "hidden")}>
              <HistoryView 
                key="history"
                assessments={assessments} 
                onView={setCurrentResult} 
                onDelete={handleDeleteAssessment}
              />
            </div>

            {/* Result View Container */}
            {currentResult && (
              <div className="flex-grow overflow-y-auto p-6 bg-bg-deep w-full scroller-hide select-text">
                <ResultView 
                  key="result"
                  assessment={currentResult} 
                  onBack={() => setCurrentResult(null)} 
                  onExport={() => handleExport(currentResult)}
                />
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
