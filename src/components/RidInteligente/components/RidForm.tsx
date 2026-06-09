import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, Save, AlertCircle, Loader2, BrainCircuit, Activity, BookOpen, Search, X, Printer, Upload, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { RidEntry, AppSettings } from '../types';
import { analyzeRid } from '../services/geminiService';
import { cn } from '../lib/utils';
import { storage } from '../lib/storage';
import { encryption } from '../lib/encryption';
import { sanitizeAnalysis } from '../lib/stringUtils';
import { 
  SCHEMAS_DATA, 
  NEEDS_DATA, 
  BASIC_EMOTIONS, 
  COGNITIVE_DISTORTIONS,
  SITUATION_SUGGESTIONS,
  BEHAVIOR_SUGGESTIONS,
  CONSEQUENCE_SUGGESTIONS
} from '../constants';
import { ClinicalLibrary } from './ClinicalLibrary';
import { generateClinicalReportHTML } from '../lib/exportUtils';
import { ConfirmationModal } from './ConfirmationModal';

interface RidFormProps {
  onSave: (entry: RidEntry) => void;
  onCancel?: () => void;
  initialData?: RidEntry;
  settings: AppSettings;
  patientName?: string;
  patientAge?: string;
}

export function RidForm({ onSave, onCancel, initialData, settings, patientName, patientAge }: RidFormProps) {
  const [formData, setFormData] = useState<Omit<RidEntry, 'id' | 'date' | 'analysis'>>(() => {
    if (initialData) {
      return {
        patientName: '',
        patientAge: '',
        situacao: '',
        pensamento: '',
        emocao: { name: '', intensity: 50 },
        comportamento: '',
        consequenciasCurtoPrazo: initialData.consequenciasCurtoPrazo || (initialData as any).consequencias || '',
        consequenciasLongoPrazo: initialData.consequenciasLongoPrazo || '',
        ...initialData,
        // Safety check for legacy string data in localStorage
        necessidade: Array.isArray(initialData.necessidade) ? initialData.necessidade : (typeof initialData.necessidade === 'string' && initialData.necessidade ? (initialData.necessidade as string).split(',').map(s => s.trim()) : []),
        esquema: Array.isArray(initialData.esquema) ? initialData.esquema : (typeof initialData.esquema === 'string' && initialData.esquema ? (initialData.esquema as string).split(',').map(s => s.trim()) : []),
      };
    }
    return {
      patientName: '',
      patientAge: '',
      situacao: '',
      necessidade: [],
      esquema: [],
      pensamento: '',
      emocao: { name: '', intensity: 50 },
      comportamento: '',
      consequenciasCurtoPrazo: '',
      consequenciasLongoPrazo: '',
    };
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | undefined>(initialData?.analysis);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false);
  const [lastGeneratedReport, setLastGeneratedReport] = useState<string | null>(null);

  // Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);

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
      const { extractRidFromText } = await import('../../../services/geminiService');
      const data = await extractRidFromText(combinedText);
      
      setFormData(prev => ({
        ...prev,
        situacao: data.situacao || prev.situacao,
        pensamento: data.pensamento || prev.pensamento,
        comportamento: data.comportamento || prev.comportamento,
        consequenciasCurtoPrazo: data.consequenciasCurtoPrazo || prev.consequenciasCurtoPrazo,
        consequenciasLongoPrazo: data.consequenciasLongoPrazo || prev.consequenciasLongoPrazo,
        emocao: data.emocao ? {
          name: data.emocao.name || prev.emocao.name,
          intensity: data.emocao.intensity !== undefined ? data.emocao.intensity : prev.emocao.intensity
        } : prev.emocao,
        necessidade: Array.isArray(data.necessidade) && data.necessidade.length > 0 ? data.necessidade : prev.necessidade,
        esquema: Array.isArray(data.esquema) && data.esquema.length > 0 ? data.esquema : prev.esquema
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

  const [activeSuggestionField, setActiveSuggestionField] = useState<'necessidade' | 'esquema' | 'pensamento' | 'emocao' | 'situacao' | 'comportamento' | 'consequenciasCurtoPrazo' | 'consequenciasLongoPrazo' | null>(null);

  const flatSchemas = SCHEMAS_DATA.flatMap(d => d.schemas);
  const allNeeds = NEEDS_DATA.flatMap(c => c.needs);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'emocao-name') {
      setFormData(prev => ({ ...prev, emocao: { ...prev.emocao, name: value } }));
    } else if (name === 'emocao-intensity') {
      setFormData(prev => ({ ...prev, emocao: { ...prev.emocao, intensity: parseInt(value) } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectSuggestion = (field: 'necessidade' | 'esquema' | 'pensamento' | 'emocao' | 'situacao' | 'comportamento' | 'consequenciasCurtoPrazo' | 'consequenciasLongoPrazo', value: string) => {
    if (field === 'necessidade' || field === 'esquema') {
      setFormData(prev => {
        const current = prev[field] as string[];
        if (current.includes(value)) return prev;
        return { ...prev, [field]: [...current, value] };
      });
    } else if (field === 'emocao') {
      setFormData(prev => ({ ...prev, emocao: { ...prev.emocao, name: value } }));
    } else if (field === 'pensamento') {
      setFormData(prev => {
        const current = prev.pensamento;
        const newValue = current ? `${current}\n[Distorção: ${value}] ` : `[Distorção: ${value}] `;
        return { ...prev, pensamento: newValue };
      });
    } else {
      setFormData(prev => {
        const current = prev[field] as string;
        const newValue = current ? `${current}\n${value}` : value;
        return { ...prev, [field]: newValue };
      });
    }
    setActiveSuggestionField(null);
  };

  const handleRemoveTag = (field: 'necessidade' | 'esquema', index: number) => {
    setFormData(prev => {
      const current = [...(prev[field] as string[])];
      current.splice(index, 1);
      return { ...prev, [field]: current };
    });
  };

  const handleAddCustomTag = (field: 'necessidade' | 'esquema', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        setFormData(prev => {
          const current = prev[field] as string[];
          if (current.includes(value)) return prev;
          return { ...prev, [field]: [...current, value] };
        });
        e.currentTarget.value = '';
      }
    }
  };

  const handleAnalyze = async () => {
    if (!formData.situacao || !formData.pensamento) {
      setError('Campos obrigatórios: Situação e Pensamentos.');
      return;
    }
    
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeRid(formData);
      setAnalysis(result);
      // Automatically save after successful analysis!
      const newEntry: RidEntry = {
        ...formData,
        patientName: patientName || formData.patientName || 'Paciente',
        patientAge: patientAge || formData.patientAge || '',
        id: initialData?.id || Date.now().toString(),
        date: initialData?.date || new Date().toISOString(),
        analysis: result,
      };
      onSave(newEntry);
      toast.success('Análise de IA concluída e salva no prontuário!');
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro na IA, mas salvando o registro localmente...');
      const fallbackAnalysis = 'Não foi possível gerar a análise técnica de IA no momento.';
      setAnalysis(fallbackAnalysis);
      const newEntry: RidEntry = {
        ...formData,
        patientName: patientName || formData.patientName || 'Paciente',
        patientAge: patientAge || formData.patientAge || '',
        id: initialData?.id || Date.now().toString(),
        date: initialData?.date || new Date().toISOString(),
        analysis: fallbackAnalysis,
      };
      onSave(newEntry);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    const newEntry: RidEntry = {
      ...formData,
      patientName: patientName || formData.patientName || 'Paciente',
      patientAge: patientAge || formData.patientAge || '',
      id: initialData?.id || Date.now().toString(),
      date: initialData?.date || new Date().toISOString(),
      analysis: analysis,
    };
    onSave(newEntry);
  };

  const handleLoadExample = () => {
    setFormData({
      patientName: '',
      patientAge: '',
      situacao: "Apresentação do projeto trimestral para a diretoria. O CEO entrou na sala inesperadamente durante minha fala.",
      necessidade: ["Competência", "Validação", "Aprovação"],
      esquema: ["Defeituosidade", "Fracasso"],
      pensamento: "Eles vão perceber que não sei o que estou dizendo. Vou ser demitido. Todo mundo está vendo que estou tremendo.",
      emocao: { name: "Ansiedade", intensity: 85 },
      comportamento: "Fuga: Encerrei a apresentação bruscamente para sair da sala.",
      consequenciasCurtoPrazo: "Alívio imediato da ansiedade.",
      consequenciasLongoPrazo: "Reforço do medo e perda de autoridade."
    });
    setAnalysis(undefined);
    toast.success('Exemplo clínico carregado!');
  };

  const handleClearFields = () => {
    setFormData({
      patientName: '',
      patientAge: '',
      situacao: '',
      necessidade: [],
      esquema: [],
      pensamento: '',
      emocao: { name: '', intensity: 50 },
      comportamento: '',
      consequenciasCurtoPrazo: '',
      consequenciasLongoPrazo: '',
    });
    setAnalysis(undefined);
    setError(null);
    toast.success('Campos limpos');
  };

  const handleExportHTML = () => {
    if (!analysis) return;
    
    const entry: RidEntry = {
      ...formData,
      patientName: patientName || formData.patientName || 'Paciente',
      patientAge: patientAge || formData.patientAge || '',
      id: initialData?.id || Date.now().toString(),
      date: initialData?.date || new Date().toISOString(),
      analysis: analysis,
    };

    const patientFileName = entry.patientName.replace(/\s+/g, '_');
    const dateFormatted = new Date(entry.date).toISOString().replace(/[:.]/g, '-').split('Z')[0];
    const fileName = `${patientFileName}_Protocolo_RID_${dateFormatted}.html`;

    const htmlContent = generateClinicalReportHTML(entry, settings);
    setLastGeneratedReport(htmlContent);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Also offer to open in new tab for immediate printing
    setTimeout(() => {
      setIsPrintConfirmOpen(true);
    }, 500);
  };

  const handlePrintReport = () => {
    if (lastGeneratedReport) {
      const newWin = window.open();
      if (newWin) {
        newWin.document.write(lastGeneratedReport);
        newWin.document.close();
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-auto bg-bg-deep relative select-none">
      {/* LEFT PANEL: INPUT FORM */}
      <section className="w-full lg:w-[640px] border-r border-border-subtle flex flex-col overflow-auto bg-bg-sidebar">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-bg-card/50">
          <h2 className="font-bold text-text-main flex items-center gap-2 text-xs uppercase tracking-wider">
            <span className="text-primary">🔍</span> Registro de Interação
          </h2>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer animate-pulse-subtle"
            >
              <Upload size={12} /> Importar Registros
            </button>
            <button 
              onClick={() => setShowLibrary(true)}
              className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
            >
              <BookOpen size={12} /> Biblioteca
            </button>
            <div className="flex gap-2 border-l border-border-subtle pl-4">
              <button 
                onClick={handleLoadExample}
                className="text-[10px] font-black text-text-dim hover:text-primary uppercase tracking-widest transition-colors cursor-pointer"
              >
                Exemplo
              </button>
              <button 
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-[10px] font-black text-text-dim hover:text-rose-500 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto space-y-4 scroller-hide">
          {/* PATIENT HEADER */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-bg-deep border border-border-subtle rounded-2xl mb-2">
            <div className="col-span-2 space-y-1">
              <span className="text-[10px] font-black text-text-dim uppercase tracking-widest pl-1">Nome do Paciente</span>
              <div className="w-full p-2.5 bg-bg-card border border-border-subtle rounded-xl text-xs font-semibold text-text-main truncate">
                {patientName || 'Nenhum Paciente Selecionado'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text-dim uppercase tracking-widest pl-1 text-center block">Idade</span>
              <div className="w-full p-2.5 bg-bg-card border border-border-subtle rounded-xl text-xs font-semibold text-text-main text-center">
                {patientAge ? `${patientAge} anos` : '--'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5 rounded-xl transition-all relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">1. Situação Ocorrente</label>
                <button 
                  onClick={() => setActiveSuggestionField(activeSuggestionField === 'situacao' ? null : 'situacao')}
                  className="text-[9px] font-bold text-text-dim hover:underline mb-1 cursor-pointer"
                >
                  Sugestões
                </button>
              </div>
              <textarea
                name="situacao"
                value={formData.situacao || ''}
                onChange={handleChange}
                className="w-full h-20 p-3 bg-bg-deep border border-border-subtle rounded-xl text-xs font-semibold text-text-main leading-relaxed resize-none focus:outline-none focus:border-primary transition-all placeholder:text-text-dim/30"
                placeholder="O que aconteceu? Quem estava presente?"
              />
              <AnimatePresence>
                {activeSuggestionField === 'situacao' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-2 max-h-40 overflow-y-auto grid grid-cols-1 gap-1"
                  >
                    {SITUATION_SUGGESTIONS.map(s => (
                      <button 
                        key={s}
                        onClick={() => handleSelectSuggestion('situacao', s)}
                        className="text-left px-3 py-1.5 text-[10px] font-bold text-text-main hover:bg-bg-sidebar hover:text-primary rounded-lg transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">2. Necessidade Básica</label>
                <div className="flex gap-2 mb-1">
                  <button 
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'necessidade' ? null : 'necessidade')}
                    className="text-[9px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Sugerir
                  </button>
                </div>
              </div>
              <div className="w-full min-h-[64px] p-2 bg-bg-deep border border-border-subtle rounded-xl flex flex-wrap gap-1.5 items-start focus-within:border-primary transition-all">
                {formData.necessidade.map((n, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[10px] font-black rounded-lg uppercase tracking-wider">
                    {n}
                    <button onClick={() => handleRemoveTag('necessidade', i)} className="hover:text-primary-hover cursor-pointer"><X size={10} /></button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder={formData.necessidade.length === 0 ? "Adicionar necessidade..." : ""}
                  className="flex-1 min-w-[80px] bg-transparent border-none text-xs text-text-main focus:ring-0 p-0.5 placeholder:text-text-dim/40 outline-none"
                  onKeyDown={(e) => handleAddCustomTag('necessidade', e)}
                />
              </div>
              <AnimatePresence>
                {activeSuggestionField === 'necessidade' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-2 max-h-80 overflow-y-auto space-y-3"
                  >
                    {[
                      { key: "Necessidades Infantis", label: "Infantis", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                      { key: "Necessidades Conjugais", label: "Conjugais", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
                      { key: "Necessidades Parentais", label: "Parentais", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                      { key: "Necessidades Adultas", label: "Adultas", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
                    ].map(group => {
                      const groupData = NEEDS_DATA.find(c => c.category === group.key);
                      if (!groupData) return null;
                      return (
                        <div key={group.key} className="space-y-1.5 p-1 border-b border-border-subtle/30 last:border-0 pb-2.5 last:pb-1">
                          <div className="flex items-center gap-1.5 px-1">
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border ${group.color}`}>
                              {group.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {groupData.needs.map(n => (
                              <button 
                                key={n}
                                type="button"
                                onClick={() => handleSelectSuggestion('necessidade', n)}
                                className="px-2 py-1 text-[10px] font-semibold text-text-main bg-bg-deep border border-border-subtle hover:border-primary hover:text-primary rounded-lg transition-colors cursor-pointer"
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">3. Esquema Ativado</label>
                <div className="flex gap-2 mb-1">
                  <button 
                     onClick={() => setActiveSuggestionField(activeSuggestionField === 'esquema' ? null : 'esquema')}
                     className="text-[9px] font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    Sugerir
                  </button>
                </div>
              </div>
              <div className="w-full min-h-[64px] p-2 bg-bg-deep border border-border-subtle rounded-xl flex flex-wrap gap-1.5 items-start focus-within:border-primary transition-all">
                {formData.esquema.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black rounded-lg uppercase tracking-wider">
                    {s}
                    <button onClick={() => handleRemoveTag('esquema', i)} className="hover:text-amber-300 cursor-pointer"><X size={10} /></button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder={formData.esquema.length === 0 ? "Adicionar esquema..." : ""}
                  className="flex-1 min-w-[80px] bg-transparent border-none text-xs text-text-main focus:ring-0 p-0.5 placeholder:text-text-dim/40 outline-none"
                  onKeyDown={(e) => handleAddCustomTag('esquema', e)}
                />
              </div>
              <AnimatePresence>
                {activeSuggestionField === 'esquema' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-2 max-h-40 overflow-y-auto grid grid-cols-1 gap-1"
                  >
                    {flatSchemas.map(s => (
                      <button 
                        key={s.name}
                        onClick={() => handleSelectSuggestion('esquema', s.name)}
                        className="text-left px-3 py-1.5 hover:bg-bg-sidebar rounded-lg transition-colors group cursor-pointer"
                      >
                        <span className="block text-[10px] font-black text-amber-400 uppercase tracking-wider group-hover:text-amber-300">{s.name}</span>
                        <span className="block text-[9px] text-text-dim truncate">{s.definition}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="col-span-2 space-y-1.5 relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">4. Pensamentos Automáticos</label>
                <button 
                  onClick={() => setActiveSuggestionField(activeSuggestionField === 'pensamento' ? null : 'pensamento')}
                  className="text-[9px] font-bold text-text-dim hover:underline mb-1 cursor-pointer"
                >
                  Distorções
                </button>
              </div>
              <textarea
                name="pensamento"
                value={formData.pensamento || ''}
                onChange={handleChange}
                className="w-full h-20 p-3 bg-bg-deep border border-border-subtle rounded-xl text-xs font-semibold text-text-main italic leading-relaxed resize-none focus:outline-none focus:border-primary transition-all placeholder:text-text-dim/30"
                placeholder="O que passou pela sua cabeça?"
              />
              <AnimatePresence>
                {activeSuggestionField === 'pensamento' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-2 max-h-48 overflow-y-auto grid grid-cols-1 gap-1"
                  >
                    {COGNITIVE_DISTORTIONS.map(d => (
                      <button 
                        key={d.name}
                        onClick={() => handleSelectSuggestion('pensamento', d.name)}
                        className="text-left px-3 py-1.5 hover:bg-bg-sidebar rounded-lg transition-colors group cursor-pointer"
                      >
                        <span className="block text-[10px] font-black text-text-main uppercase tracking-wider group-hover:text-primary">{d.name}</span>
                        <span className="block text-[9px] text-text-dim truncate">{d.description}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="col-span-1 space-y-1.5 relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">5. Intensidade Emocional</label>
                <button 
                  type="button"
                  onClick={() => setActiveSuggestionField(activeSuggestionField === 'emocao' ? null : 'emocao')}
                  className="text-[9px] font-bold text-text-dim hover:underline mb-1 cursor-pointer"
                >
                  Sintomas Físicos
                </button>
              </div>
              <div className="flex items-center gap-3 bg-bg-deep p-2 border border-border-subtle rounded-xl h-[52px]">
                <select
                  name="emocao-name"
                  value={formData.emocao.name || ''}
                  onChange={handleChange}
                  className="w-24 bg-transparent border-none text-[10px] font-black text-text-main uppercase focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="" className="bg-bg-card text-text-dim">Emoção</option>
                  {BASIC_EMOTIONS.map(e => (
                    <option key={e.name} value={e.name} className="bg-bg-card text-text-main">{e.name.toUpperCase()}</option>
                  ))}
                </select>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between text-[10px] text-text-dim font-bold mb-1">
                    <span>NÍVEL</span>
                    <span>{formData.emocao.intensity}%</span>
                  </div>
                  <input
                    type="range"
                    name="emocao-intensity"
                    min="0"
                    max="100"
                    value={formData.emocao.intensity}
                    onChange={handleChange}
                    className="w-full h-1.5 bg-bg-sidebar rounded-full appearance-none cursor-pointer accent-primary outline-none"
                  />
                </div>
              </div>
              <AnimatePresence>
                {activeSuggestionField === 'emocao' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 bottom-full left-0 right-0 mb-2 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-2 max-h-48 overflow-y-auto grid grid-cols-1 gap-1"
                  >
                    {BASIC_EMOTIONS.map(e => (
                      <button 
                        key={e.name}
                        type="button"
                        onClick={() => handleSelectSuggestion('emocao', e.name)}
                        className="text-left px-3 py-1.5 hover:bg-bg-sidebar rounded-lg transition-colors group cursor-pointer"
                      >
                        <span className="block text-[10px] font-black text-primary uppercase tracking-wider group-hover:text-primary-hover">{e.name}</span>
                        <span className="block text-[9px] text-text-dim whitespace-normal leading-tight">{e.symptoms}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {formData.emocao.name && (
                <div className="mt-1 p-2 bg-primary/5 border border-primary/10 rounded-lg text-[9px] text-text-dim leading-relaxed">
                  <span className="font-bold text-primary block mb-0.5">Sintomas Físicos Típicos:</span>
                  {BASIC_EMOTIONS.find(e => e.name === formData.emocao.name)?.symptoms}
                </div>
              )}
            </div>

            <div className="col-span-1 space-y-1.5 relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">6. Comportamento</label>
                <button 
                  onClick={() => setActiveSuggestionField(activeSuggestionField === 'comportamento' ? null : 'comportamento')}
                  className="text-[9px] font-bold text-text-dim hover:underline mb-1 cursor-pointer"
                >
                  Sugestões
                </button>
              </div>
              <textarea
                name="comportamento"
                value={formData.comportamento || ''}
                onChange={handleChange}
                className="w-full h-[52px] p-2.5 bg-bg-deep border border-border-subtle rounded-xl text-xs font-semibold text-text-main resize-none focus:outline-none focus:border-primary transition-all placeholder:text-text-dim/30 overflow-y-auto"
                placeholder="Ação tomada..."
              />
              <AnimatePresence>
                {activeSuggestionField === 'comportamento' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-3 max-h-60 overflow-y-auto"
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Desadaptativos
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                          {BEHAVIOR_SUGGESTIONS.maladaptive.map(s => (
                            <button 
                              key={s}
                              onClick={() => handleSelectSuggestion('comportamento', s)}
                              className="text-left px-3 py-1.5 text-[10px] font-bold text-text-main hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border-subtle">
                        <h4 className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Adaptativos
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                          {BEHAVIOR_SUGGESTIONS.adaptive.map(s => (
                            <button 
                              key={s}
                              onClick={() => handleSelectSuggestion('comportamento', s)}
                              className="text-left px-3 py-1.5 text-[10px] font-bold text-text-main hover:bg-primary/10 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20 cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="col-span-1 space-y-1.5 relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">7. Conseq. Curto Prazo</label>
                <button 
                  onClick={() => setActiveSuggestionField(activeSuggestionField === 'consequenciasCurtoPrazo' ? null : 'consequenciasCurtoPrazo')}
                  className="text-[9px] font-bold text-text-dim hover:underline mb-1 cursor-pointer"
                >
                  Sugestões
                </button>
              </div>
              <textarea
                name="consequenciasCurtoPrazo"
                value={formData.consequenciasCurtoPrazo || ''}
                onChange={handleChange}
                className="w-full h-16 p-3 bg-bg-deep border border-border-subtle rounded-xl text-xs font-semibold text-text-main leading-relaxed resize-none focus:outline-none focus:border-primary transition-all placeholder:text-text-dim/30"
                placeholder="Impacto imediato..."
              />
              <AnimatePresence>
                {activeSuggestionField === 'consequenciasCurtoPrazo' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-2 max-h-40 overflow-y-auto grid grid-cols-1 gap-1"
                  >
                    {CONSEQUENCE_SUGGESTIONS.shortTerm.map(s => (
                      <button 
                        key={s}
                        onClick={() => handleSelectSuggestion('consequenciasCurtoPrazo', s)}
                        className="text-left px-3 py-1.5 text-[10px] font-bold text-text-main hover:bg-bg-sidebar hover:text-primary rounded-lg transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="col-span-1 space-y-1.5 relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim pl-1">8. Conseq. Longo Prazo</label>
                <button 
                  onClick={() => setActiveSuggestionField(activeSuggestionField === 'consequenciasLongoPrazo' ? null : 'consequenciasLongoPrazo')}
                  className="text-[9px] font-bold text-text-dim hover:underline mb-1 cursor-pointer"
                >
                  Sugestões
                </button>
              </div>
              <textarea
                name="consequenciasLongoPrazo"
                value={formData.consequenciasLongoPrazo || ''}
                onChange={handleChange}
                className="w-full h-16 p-3 bg-bg-deep border border-border-subtle rounded-xl text-xs font-semibold text-text-main leading-relaxed resize-none focus:outline-none focus:border-primary transition-all placeholder:text-text-dim/30"
                placeholder="Impacto futuro..."
              />
              <AnimatePresence>
                {activeSuggestionField === 'consequenciasLongoPrazo' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-2 max-h-40 overflow-y-auto grid grid-cols-1 gap-1"
                  >
                    {CONSEQUENCE_SUGGESTIONS.longTerm.map(s => (
                      <button 
                        key={s}
                        onClick={() => handleSelectSuggestion('consequenciasLongoPrazo', s)}
                        className="text-left px-3 py-1.5 text-[10px] font-bold text-text-main hover:bg-bg-sidebar hover:text-primary rounded-lg transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        <div className="p-4 bg-bg-card border-t border-border-subtle flex gap-3 h-20 shrink-0">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-bg-sidebar border border-border-subtle text-text-dim font-black rounded-xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest cursor-pointer"
            >
              VOLTAR
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex-1 bg-primary/10 hover:bg-primary/20 disabled:opacity-50 border border-primary/20 text-primary font-black py-2 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest cursor-pointer"
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {isAnalyzing ? 'PROCESSANDO...' : 'PROCESSAR ANÁLISE IA'}
          </button>
          <button
            onClick={handleSave}
            disabled={isAnalyzing || !formData.situacao || !formData.pensamento}
            className="px-6 py-2 bg-bg-sidebar border border-border-subtle text-text-main font-black rounded-xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest disabled:opacity-40 disabled:hover:bg-bg-sidebar cursor-pointer"
          >
            SALVAR
          </button>
        </div>
      </section>

      {/* RIGHT PANEL: INSIGHTS & ANALYSIS */}
      <section className="hidden lg:flex flex-1 flex-col bg-bg-deep overflow-auto">
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="bg-bg-card p-8 rounded-[2rem] border border-border-subtle max-w-sm">
                <BrainCircuit className="w-12 h-12 text-text-dim/20 mx-auto mb-4" />
                <h3 className="text-text-main font-black text-xs uppercase tracking-widest">Painel de Insights</h3>
                <p className="text-text-dim text-xs mt-2 leading-relaxed">
                  Preencha o registro e clique em Processar para receber análise clínica em tempo real do Gemini AI.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="p-4 flex flex-col gap-4 h-full overflow-y-auto"
            >
              {/* AI INSIGHTS CARD */}
              <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center bg-primary/20 text-primary rounded-lg text-[10px] font-black">AI</span>
                    <h3 className="text-xs font-black text-text-main uppercase tracking-wider">Síntese de Reestruturação</h3>
                  </div>
                  <button 
                    onClick={handleExportHTML}
                    className="p-2 hover:bg-bg-sidebar text-text-dim hover:text-primary rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Exportar Relatório Clínico"
                  >
                    <Printer size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Exportar</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="prose prose-invert prose-sm max-w-none text-text-main/90 leading-relaxed text-justify">
                    <ReactMarkdown>{sanitizeAnalysis(analysis)}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CYCLE CARD */}
              <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-sm flex flex-col">
                <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={12} className="text-primary" /> Dinâmica Operacional
                </h3>
                
                <div className="space-y-3">
                   <div className="p-3 bg-bg-deep border-l-4 border-primary rounded-r-xl">
                      <p className="text-[9px] font-black text-text-dim uppercase tracking-wider">GATILHO DETECTADO</p>
                      <p className="text-xs font-semibold text-text-main mt-0.5">{formData.situacao ? `${formData.situacao.split('.')[0]}...` : '--'}</p>
                   </div>
                   <div className="p-3 bg-bg-deep border-l-4 border-amber-500 rounded-r-xl">
                      <p className="text-[9px] font-black text-text-dim uppercase tracking-wider">CRENÇAS CENTRAIS</p>
                      <p className="text-xs font-semibold text-text-main mt-0.5">{formData.esquema.length > 0 ? formData.esquema.join(', ') : 'Nenhum esquema adicionado'}</p>
                   </div>
                   <div className="p-3 bg-bg-deep border-l-4 border-rose-500 rounded-r-xl">
                      <p className="text-[9px] font-black text-text-dim uppercase tracking-wider">IMPULSO DE RESPOSTA</p>
                      <p className="text-xs font-bold text-rose-400 mt-0.5">{formData.comportamento ? (formData.comportamento.length > 50 ? `${formData.comportamento.substring(0, 50)}...` : formData.comportamento) : '--'}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* LIBRARY MODAL */}
      <AnimatePresence>
        {showLibrary && (
          <ClinicalLibrary onClose={() => setShowLibrary(false)} />
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODALS */}
      <ConfirmationModal 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleClearFields}
        title="Limpar Todos os Campos?"
        message="Deseja resetar todo o formulário de interação atual? Isso apagará o progresso não salvo, incluindo análises de IA."
        confirmLabel="Limpar Agora"
        variant="warning"
      />

      <ConfirmationModal 
        isOpen={isPrintConfirmOpen}
        onClose={() => setIsPrintConfirmOpen(false)}
        onConfirm={handlePrintReport}
        title="Relatório Gerado com Sucesso"
        message="O arquivo HTML foi baixado. Deseja abrir agora em uma nova página para visualização rápida ou impressão?"
        confirmLabel="Abrir e Imprimir"
        cancelLabel="Fechar"
        variant="info"
      />

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
                <Sparkles className="text-primary w-4 h-4 animate-pulse" /> Importador Inteligente RID
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
                Importe até 4 arquivos HTML de prontuário antigo ou cole o relato da sessão. A inteligência artificial irá ler o texto e preencher automaticamente todos os campos do RID.
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
                <label className="text-[10px] font-black text-text-dim uppercase tracking-wider block">2. Ou digite/cole o relato da sessão/atendimento</label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Cole aqui a conversa, anotações de evolução ou resumo do paciente..."
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
    </div>
  );
}
