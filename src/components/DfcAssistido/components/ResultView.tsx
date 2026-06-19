import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, User, Layers, Calendar, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DfcRecord } from '../types';
import { analyzeDfcAssessment } from '../../../services/geminiService';
import { toast } from 'react-hot-toast';

interface ResultViewProps {
  assessment: DfcRecord;
  onBack: () => void;
  onExport: () => void;
  onUpdateAnalysis?: (newAnalysis: string) => Promise<void> | void;
}

export function ResultView({ assessment, onBack, onExport, onUpdateAnalysis }: ResultViewProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await analyzeDfcAssessment(
        { name: assessment.patient.name, age: assessment.patient.age },
        assessment.fields
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
          className="flex items-center gap-2 text-text-dim hover:text-[#6366f1] font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para Edição
        </button>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#6366f1]/10 transition-all active:scale-95 cursor-pointer"
        >
          <Download size={14} /> Exportar Relatório HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient ID Card & Formulation Overview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient Card */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={12} className="text-[#6366f1]" /> Ficha de Identificação
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

          {/* DFC Structural Grid */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-5">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <Layers size={12} className="text-[#6366f1]" /> Estrutura do DFC
            </h3>
            
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 bg-bg-sidebar/45 rounded-2xl border border-border-subtle">
                <span className="text-[8px] font-black text-[#6366f1] uppercase tracking-wider block mb-1">Dados de Infância Relevantes</span>
                <p className="text-text-main font-medium">{assessment.relevantChildhoodData}</p>
              </div>

              <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/15">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-wider block mb-1">Crença(s) Central(ais)</span>
                <p className="text-text-main font-bold">{assessment.coreBeliefs}</p>
              </div>

              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/15">
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider block mb-1">Regras e Condicionais ("Se... Então...")</span>
                <p className="text-text-main font-medium">{assessment.conditionalRules}</p>
              </div>

              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider block mb-1">Estratégias Compensatórias</span>
                <p className="text-text-main font-medium">{assessment.compensatoryStrategies}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Conceptualization & Typical Situations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mapped Situations Cards */}
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-10 border border-border-subtle shadow-xl space-y-6">
            <div className="border-b border-border-subtle pb-4">
              <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                <Layers size={12} className="text-[#6366f1]" /> Fluxos Cognitivos de Situações Típicas
              </h3>
            </div>
            
            <div className="space-y-4">
              {assessment.situations.map((sit, idx) => (
                <div key={`result-sit-${idx}`} className="bg-bg-sidebar/30 border border-border-subtle rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                    <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Situação {idx + 1}</span>
                    <span className="font-bold text-xs text-text-main truncate max-w-[200px]">{sit.situation}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                    <div className="p-2.5 bg-bg-card rounded-xl border border-border-subtle">
                      <span className="text-[8px] font-black text-text-dim uppercase block mb-0.5">Pensamento Automático</span>
                      <p className="italic font-bold text-text-main">"{sit.automaticThought}"</p>
                    </div>
                    <div className="p-2.5 bg-bg-card rounded-xl border border-border-subtle">
                      <span className="text-[8px] font-black text-text-dim uppercase block mb-0.5">Significado Clínico</span>
                      <p className="text-text-main/90 font-medium">{sit.meaning}</p>
                    </div>
                    <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10">
                      <span className="text-[8px] font-black text-red-400 uppercase block mb-0.5">Emoções</span>
                      <p className="font-bold text-red-400">{sit.emotion}</p>
                    </div>
                    <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <span className="text-[8px] font-black text-emerald-400 uppercase block mb-0.5">Comportamento</span>
                      <p className="text-emerald-400 font-medium">{sit.behavior}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Clinical Case Report */}
          {(assessment.aiAnalysis || onUpdateAnalysis) && (
            <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-10 border border-border-subtle shadow-xl text-text-main font-serif leading-relaxed text-sm select-text">
              <div className="text-center mb-10 border-b border-border-subtle pb-6 flex flex-col items-center">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">DFC Conceituação Cognitiva</h2>
                <p className="italic text-text-dim text-[11px] font-sans uppercase font-bold tracking-wider">Laudo Analítico Focado em TCC</p>
              </div>

              <div className="space-y-6 max-w-none text-justify prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-[#6366f1] prose-h1:border-l-2 prose-h1:border-[#6366f1] prose-h1:pl-3 prose-p:text-text-main/90 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-[#6366f1]/95 prose-li:text-[13px] prose-ul:list-disc prose-ul:pl-5">
                {assessment.aiAnalysis ? (
                  <ReactMarkdown>{assessment.aiAnalysis}</ReactMarkdown>
                ) : (
                  <p className="text-xs text-text-dim italic">Sem análise de inteligência artificial cadastrada.</p>
                )}
              </div>
              
              {(!assessment.aiAnalysis || 
                assessment.aiAnalysis.includes('Não foi possível gerar a análise') || 
                assessment.aiAnalysis.trim() === '') && (
                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-4 text-center font-sans no-print">
                  <p className="text-xs text-text-dim max-w-md">
                    O relatório de inteligência artificial não pôde ser concluído no momento do salvamento do teste. Você pode tentar gerar a análise técnica novamente agora.
                  </p>
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-bg-deep px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Análise gerada eletronicamente pelo DFC Assistido
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
