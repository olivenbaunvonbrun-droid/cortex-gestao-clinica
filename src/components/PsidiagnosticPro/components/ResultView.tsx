import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, User, Calendar, FileText, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DiagnosticRecord } from '../types';
import { analyzePsidiagnosticAssessment } from '../../../services/geminiService';
import { toast } from 'react-hot-toast';

interface ResultViewProps {
  assessment: DiagnosticRecord;
  onBack: () => void;
  onExport: () => void;
  onUpdateAnalysis?: (newAnalysis: string) => Promise<void> | void;
}

export function ResultView({ assessment, onBack, onExport, onUpdateAnalysis }: ResultViewProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await analyzePsidiagnosticAssessment(
        { name: assessment.patient.name, age: assessment.patient.age },
        assessment.savedProntuarioText || '',
        assessment.savedFilesText || ''
      );
      if (onUpdateAnalysis) {
        await onUpdateAnalysis(generated);
      }
      toast.success('Relatório gerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao gerar relatório de IA. Verifique as configurações de chave de API.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 max-w-6xl mx-auto p-1 text-text-main font-sans"
    >
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-dim hover:text-[#8b5cf6] font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para Edição
        </button>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8b5cf6]/10 transition-all active:scale-95 cursor-pointer"
        >
          <Download size={14} /> Exportar Relatório HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Identification & Sources */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Card */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={12} className="text-[#8b5cf6]" /> Ficha de Identificação
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Avaliando', value: assessment.patient.name },
                { label: 'Idade', value: `${assessment.patient.age} anos` },
                { label: 'Profissional', value: assessment.patient.psychologistName },
              ].map(item => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider">{item.label}</span>
                  <span className="font-bold text-text-main text-xs overflow-hidden text-ellipsis">{item.value || 'N/D'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources Used Card */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <FileText size={12} className="text-[#8b5cf6]" /> Fontes Consultadas
            </h3>
            <div className="space-y-3">
              {assessment.hasProntuarioData && (
                <div className="flex items-center gap-2.5 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                  <CheckCircle size={16} className="text-[#8b5cf6] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-text-main uppercase tracking-wider">Histórico de Prontuário</p>
                    <p className="text-[9px] text-text-dim uppercase mt-0.5">Evoluções e sessões clínicas</p>
                  </div>
                </div>
              )}
              {assessment.uploadedFilesCount > 0 && (
                <div className="flex items-center gap-2.5 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <CheckCircle size={16} className="text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-text-main uppercase tracking-wider">{assessment.uploadedFilesCount} Arquivo(s) Anexo(s)</p>
                    <p className="text-[9px] text-text-dim uppercase mt-0.5">Laudos, exames ou triagens externas</p>
                  </div>
                </div>
              )}
              {!assessment.hasProntuarioData && assessment.uploadedFilesCount === 0 && (
                <p className="text-[10px] text-text-dim uppercase font-bold tracking-wider">Nenhuma fonte registrada.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:col-span-8">
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border-subtle shadow-xl text-text-main font-serif leading-relaxed text-sm select-text">
            <div className="text-center mb-10 border-b border-border-subtle pb-6 flex flex-col items-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">Psidiagnostic Pro</h2>
              <p className="italic text-text-dim text-[11px] font-sans uppercase font-bold tracking-wider">Laudo Psicodiagnóstico Clinicamente Integrado</p>
            </div>

            <div className="space-y-6 max-w-none text-justify prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-[#8b5cf6] prose-h1:border-l-2 prose-h1:border-[#8b5cf6] prose-h1:pl-3 prose-p:text-text-main/90 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-[#8b5cf6]/95 prose-li:text-[13px] prose-ul:list-disc prose-ul:pl-5">
              <ReactMarkdown>{assessment.aiAnalysis || ''}</ReactMarkdown>
            </div>

            {(!assessment.aiAnalysis || 
              assessment.aiAnalysis.includes('Não foi possível gerar a análise') || 
              assessment.aiAnalysis.trim() === '') && (
              <div className="mt-8 p-6 bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-2xl flex flex-col items-center justify-center gap-4 text-center font-sans no-print">
                <p className="text-xs text-text-dim max-w-md">
                  O relatório de inteligência artificial não pôde ser concluído no momento do salvamento do teste. Você pode tentar gerar a análise técnica novamente agora.
                </p>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Gerando Análise...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      Gerar Análise com IA
                    </>
                  )}
                </button>
              </div>
            )}
            
            <div className="mt-16 pt-8 border-t border-border-subtle font-sans">
               <div className="flex flex-col items-center">
                  <div className="w-48 h-[1px] bg-border-subtle mb-3" />
                  <p className="font-black text-text-main text-[10px] uppercase tracking-widest">{assessment.patient.psychologistName}</p>
                  <p className="text-[9px] font-black text-text-dim uppercase tracking-wider">CRP: {assessment.patient.crp}</p>
                  
                  <div className="mt-8 text-[8px] text-text-dim/30 uppercase tracking-[0.25em] font-black">
                    Documento Gerado Eletronicamente via Psidiagnostic Pro
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
