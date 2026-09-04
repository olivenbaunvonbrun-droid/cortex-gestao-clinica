import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Download, 
  User, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Brain, 
  Zap, 
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Assessment, ASRS_QUESTIONS, FREQUENCY_LABELS, Frequency } from '../types';
import { calculateTdahAssessment } from '../lib/scoring';
import { analyzeTdahAssessment } from '../../../services/geminiService';
import { cn } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

interface ResultViewProps {
  assessment: Assessment;
  onBack: () => void;
  onExport: () => void;
  onUpdateAnalysis?: (newAnalysis: string) => Promise<void> | void;
}

export function ResultView({ assessment, onBack, onExport, onUpdateAnalysis }: ResultViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const results = calculateTdahAssessment(assessment.answers);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const answersText = ASRS_QUESTIONS.map(q => {
        const val = assessment.answers[q.id] ?? 0;
        return `Item ${q.id} (${q.partCategory}): ${FREQUENCY_LABELS[val as Frequency]} - "${q.text}"`;
      }).join('\n');

      const generated = await analyzeTdahAssessment(
        { name: assessment.patient.name, age: assessment.patient.age },
        {
          classification: results.classification,
          riskLevel: results.riskLevel,
          totalScore: results.totalScore,
          partAScore: results.partA.rawScore,
          partASignificant: results.partA.significantSymptoms,
          thresholdMetA: results.partA.thresholdMet,
          partBScore: results.partB.rawScore,
          partBSignificant: results.partB.significantSymptoms,
          thresholdMetB: results.partB.thresholdMet,
          summaryText: results.summaryText
        },
        answersText
      );

      if (onUpdateAnalysis) {
        await onUpdateAnalysis(generated);
      }
      toast.success('Relatório TDAH regerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao gerar relatório de IA. Verifique as configurações de API.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getRiskBadgeClass = (risk: string) => {
    if (risk === 'Alta Probabilidade') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (risk === 'Moderada') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-6xl mx-auto p-2 text-text-main font-sans"
    >
      {/* Action Header */}
      <div className="flex items-center justify-between no-print bg-bg-card border border-border-subtle p-3.5 rounded-2xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-dim hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para Edição
        </button>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-bg-sidebar hover:bg-bg-sidebar/80 text-text-main px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-border-subtle transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={13} className="animate-spin text-amber-400" /> Regerando Análise...
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-amber-400" /> Refazer Análise com IA
              </>
            )}
          </button>
          
          <button 
            onClick={onExport}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Download size={13} /> Exportar Relatório HTML
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Identificação, Hipótese Diagnóstica e Subescalas */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ficha de Identificação */}
          <div className="bg-bg-card rounded-3xl p-5 border border-border-subtle shadow-lg space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={13} className="text-amber-400" /> Ficha do Paciente
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col col-span-2">
                <span className="text-[9px] font-black text-text-dim/70 uppercase tracking-wider">Avaliando</span>
                <span className="font-bold text-text-main text-sm truncate">{assessment.patient.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-text-dim/70 uppercase tracking-wider">Idade</span>
                <span className="font-bold text-text-main">{assessment.patient.age ? `${assessment.patient.age} Anos` : 'N/D'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-text-dim/70 uppercase tracking-wider">Data de Aplicação</span>
                <span className="font-bold text-text-main">{new Date(assessment.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-[9px] font-black text-text-dim/70 uppercase tracking-wider">Psicólogo(a) Responsável</span>
                <span className="font-bold text-text-main truncate">
                  {assessment.patient.psychologistName} {assessment.patient.crp ? `(CRP ${assessment.patient.crp})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Card Hipótese Diagnóstica */}
          <div className="bg-bg-card rounded-3xl p-5 border border-border-subtle shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <span className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" /> Hipótese Diagnóstica (OMS)
              </span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border", getRiskBadgeClass(results.riskLevel))}>
                {results.riskLevel}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-black text-text-main tracking-tight flex items-center gap-2">
                {results.classification}
              </h4>
              <p className="text-[11px] text-text-dim/90 leading-relaxed mt-1.5">
                {results.summaryText}
              </p>
            </div>

            {/* Total Score Bar */}
            <div className="p-3 bg-bg-sidebar rounded-2xl border border-border-subtle/70 space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-text-dim">Escore Global ASRS-18</span>
                <span className="text-amber-400 font-bold">{results.totalScore} / 54 pts</span>
              </div>
              <div className="h-2 w-full bg-border-subtle/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((results.totalScore / 54) * 100))}%` }} 
                />
              </div>
              <div className="flex justify-between text-[9px] text-text-dim/70">
                <span>{results.totalSignificantSymptoms} de 18 sintomas frequentes (≥ 2)</span>
                <span>{Math.round((results.totalScore / 54) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Card Subescalas Detalhadas */}
          <div className="bg-bg-card rounded-3xl p-5 border border-border-subtle shadow-lg space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-1.5 border-b border-border-subtle pb-3">
              <Activity size={13} className="text-amber-400" /> Domínios da ASRS-18
            </h3>

            {/* Parte A: Desatenção */}
            <div className="p-3.5 bg-bg-sidebar rounded-2xl border border-border-subtle/70 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-dim block">Parte A</span>
                  <span className="text-xs font-bold text-text-main">Desatenção</span>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                  results.partA.thresholdMet ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-bg-card text-text-dim border-border-subtle"
                )}>
                  {results.partA.significantSymptoms}/9 sintomas {results.partA.thresholdMet ? '(Critério ≥ 4 Atingido)' : ''}
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-border-subtle/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${results.partA.percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] text-text-dim/70">
                <span>Pontuação: {results.partA.rawScore} / 27 pts</span>
                <span>{results.partA.classification}</span>
              </div>
            </div>

            {/* Parte B: Hiperatividade / Impulsividade */}
            <div className="p-3.5 bg-bg-sidebar rounded-2xl border border-border-subtle/70 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-dim block">Parte B</span>
                  <span className="text-xs font-bold text-text-main">Hiperatividade / Impulsividade</span>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                  results.partB.thresholdMet ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-bg-card text-text-dim border-border-subtle"
                )}>
                  {results.partB.significantSymptoms}/9 sintomas {results.partB.thresholdMet ? '(Critério ≥ 4 Atingido)' : ''}
                </span>
              </div>

              <div className="h-1.5 w-full bg-border-subtle/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${results.partB.percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] text-text-dim/70">
                <span>Pontuação: {results.partB.rawScore} / 27 pts</span>
                <span>{results.partB.classification}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Parecer IA e Espelho de Respostas */}
        <div className="lg:col-span-7 space-y-6">
          {/* Parecer Clínico Gerado por IA */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Brain size={15} /> Parecer Clínico Interpretativo (IA)
              </h3>
              <span className="text-[9px] font-mono text-text-dim bg-bg-sidebar px-2 py-0.5 rounded border border-border-subtle">
                CFP Res. nº 06/2019
              </span>
            </div>

            <div className="prose prose-invert prose-sm max-w-none text-text-main/90 leading-relaxed font-sans text-xs space-y-3">
              {assessment.aiAnalysis ? (
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-base font-black text-text-main uppercase tracking-wide border-b border-border-subtle pb-1 mt-4 mb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mt-4 mb-1.5" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mt-3 mb-1" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2.5 text-text-main/80 leading-relaxed text-justify" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-2.5 text-text-main/80" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-text-main" {...props} />
                  }}
                >
                  {assessment.aiAnalysis}
                </ReactMarkdown>
              ) : (
                <div className="p-8 text-center text-text-dim">
                  <p>Nenhuma análise foi gerada ainda para esta avaliação.</p>
                  <button 
                    onClick={handleRegenerate}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles size={12} /> Gerar Análise com IA
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Espelho de Respostas */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-main flex items-center gap-2">
                Espelho de Respostas (18 Itens ASRS-18)
              </h3>
              <span className="text-[9px] text-text-dim">
                * Itens marcados com ★ atingiram o critério clínico (≥ 2)
              </span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {ASRS_QUESTIONS.map(q => {
                const ans = assessment.answers[q.id] ?? 0;
                const isSignificant = ans >= Frequency.OFTEN;

                return (
                  <div 
                    key={`res-q-${q.id}`}
                    className={cn(
                      "p-3 rounded-2xl border transition-all text-xs flex items-center justify-between gap-3",
                      isSignificant 
                        ? "bg-amber-500/5 border-amber-500/30" 
                        : "bg-bg-sidebar/50 border-border-subtle/50"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5",
                        isSignificant ? "bg-amber-400 text-slate-950" : "bg-bg-card text-text-dim border border-border-subtle"
                      )}>
                        {q.id}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-text-dim/70 block">
                          {q.partTitle}
                        </span>
                        <p className="text-text-main text-[11px] font-medium leading-tight">
                          {q.text}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={cn(
                        "px-2.5 py-1 rounded-xl text-[10px] font-bold border inline-block",
                        isSignificant 
                          ? "bg-amber-400/15 text-amber-300 border-amber-400/30" 
                          : "bg-bg-card text-text-dim border-border-subtle"
                      )}>
                        {FREQUENCY_LABELS[ans as Frequency]} {isSignificant ? '★' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
