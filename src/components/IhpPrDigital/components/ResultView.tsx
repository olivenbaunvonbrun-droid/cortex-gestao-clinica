import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, User, Brain, AlertTriangle, CheckCircle, TrendingUp, Award, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Assessment, HP_DETAILS, IHP_QUESTIONS } from '../types';
import { calculateAssessment } from '../lib/scoring';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { cn } from '../../../lib/utils';
import { analyzeIhpAssessment } from '../../../services/geminiService';
import { toast } from 'react-hot-toast';

interface ResultViewProps {
  assessment: Assessment;
  onBack: () => void;
  onExport: () => void;
  onUpdateAnalysis?: (newAnalysis: string) => Promise<void> | void;
}

export function ResultView({ assessment, onBack, onExport, onUpdateAnalysis }: ResultViewProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await analyzeIhpAssessment(
        { name: assessment.patient.name, age: assessment.patient.age },
        categoryScores
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
  // Use exact scoring logic
  const { subscales, qip } = calculateAssessment(assessment.answers);

  const categoryScores = Object.entries(subscales).map(([key, res]) => {
    const pct = Math.round((res.score / res.maxScore) * 100);
    return {
      key,
      name: res.name,
      score: res.score,
      maxScore: res.maxScore,
      percentage: pct,
      classification: res.classification
    };
  });

  // Sort scores to identify strongest and weakest areas
  const sortedScores = [...categoryScores].sort((a, b) => b.percentage - a.percentage);
  
  const proficient = sortedScores.filter(s => s.classification === 'Proficiente');
  const satisfactory = sortedScores.filter(s => s.classification === 'Satisfatório');
  const insufficient = sortedScores.filter(s => s.classification === 'Insuficiente' || s.classification === 'Deficitário');

  const getStatusColorClass = (classification: string) => {
    if (classification === 'Proficiente') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (classification === 'Satisfatório') return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    if (classification === 'Insuficiente') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  // Chart data format
  const chartData = categoryScores.map(s => ({
    subject: s.name,
    score: s.percentage,
    rawScore: s.score
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 max-w-6xl mx-auto p-1 text-text-main font-sans"
    >
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-dim hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para Edição
        </button>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-bg-deep px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95 cursor-pointer"
        >
          <Download size={14} /> Exportar Relatório HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Identificação, Gráfico e Scores */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identificação & QIP */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-5">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={12} className="text-primary" /> Ficha de Identificação
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col col-span-2">
                <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider">Avaliando</span>
                <span className="font-bold text-text-main text-xs overflow-hidden text-ellipsis">{assessment.patient.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider">Idade</span>
                <span className="font-bold text-text-main text-xs">{assessment.patient.age} anos</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider">Profissional</span>
                <span className="font-bold text-text-main text-xs truncate">{assessment.patient.psychologistName}</span>
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                <span className="text-text-main/90 flex items-center gap-1"><Award size={12} className="text-primary" /> QIP Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-dim font-mono">{qip.score} / {qip.maxScore}</span>
                  <span className={cn("px-2 py-0.5 rounded text-[8px]", getStatusColorClass(qip.classification))}>
                    {qip.classification}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.round((qip.score / qip.maxScore) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl relative min-w-0">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3 mb-6">
              <TrendingUp size={12} className="text-primary" /> Perfil de Habilidades Psicológicas
            </h3>
            <div className="h-[260px] w-full mb-6 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={({ x, y, payload, ...rest }) => {
                      const words = payload.value.split(' ');
                      const shortName = words[0] + (words[1] && words[1].length > 3 ? ' ' + words[1].substring(0, 4) + '.' : '');
                      return (
                        <text
                          x={x}
                          y={y}
                          {...rest}
                          fontSize={8}
                          fill="#adb5bd"
                          fontWeight={900}
                          letterSpacing="0.05em"
                          textAnchor="middle"
                          dy={3}
                        >
                          {shortName}
                        </text>
                      );
                    }}
                  />
                  <Radar
                    name="Proficiência"
                    dataKey="score"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Quantitative list */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {categoryScores.map(c => (
                <div key={c.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                    <span className="text-text-main/90">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-dim font-mono">{c.score} / {c.maxScore}</span>
                      <span className={cn("px-2 py-0.5 rounded text-[8px]", getStatusColorClass(c.classification))}>
                        {c.classification}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${c.percentage}%` }}
                      className={cn(
                        "h-full rounded-full",
                        c.classification === 'Proficiente' ? "bg-emerald-500" :
                        c.classification === 'Satisfatório' ? "bg-sky-500" :
                        c.classification === 'Insuficiente' ? "bg-amber-500" : "bg-rose-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habilidades Destaques/Deficiências */}
          <div className="grid grid-cols-1 gap-4">
            {/* Habilidades Proficientes */}
            <div className="bg-emerald-500/5 rounded-3xl p-5 border border-emerald-500/10 space-y-3">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle size={12} /> Habilidades Proficientes (Classificação: Proficiente)
              </h4>
              {proficient.length > 0 ? (
                <ul className="space-y-1.5">
                  {proficient.map(p => (
                    <li key={p.key} className="text-xs font-semibold text-text-main/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {p.name}
                      <span className="text-[9px] font-mono text-emerald-400/80">({p.score}/{p.maxScore})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-text-dim/80 italic">Nenhuma habilidade nesta faixa nesta avaliação.</p>
              )}
            </div>

            {/* Habilidades Deficitárias */}
            <div className="bg-amber-500/5 rounded-3xl p-5 border border-amber-500/10 space-y-3">
              <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={12} /> Habilidades Frágeis (Deficitário/Insuficiente)
              </h4>
              {insufficient.length > 0 ? (
                <ul className="space-y-1.5">
                  {insufficient.map(p => (
                    <li key={p.key} className="text-xs font-semibold text-text-main/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {p.name}
                      <span className="text-[9px] font-mono text-amber-400/80">({p.score}/{p.maxScore})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-text-dim/80 italic">Nenhuma habilidade nesta faixa nesta avaliação.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Report */}
        <div className="lg:col-span-7">
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-10 border border-border-subtle shadow-xl text-text-main font-serif leading-relaxed text-sm select-text">
            <div className="text-center mb-10 border-b border-border-subtle pb-6 flex flex-col items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                <Brain size={20} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">Relatório Técnico - IHP-PR</h2>
              <p className="italic text-text-dim text-[11px] font-sans uppercase font-bold tracking-wider">Inventário de Habilidades Psicológicas (Poubel & Rodrigues)</p>
            </div>

            <div className="space-y-6 max-w-none text-justify prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-primary prose-h1:border-l-2 prose-h1:border-primary prose-h1:pl-3 prose-p:text-text-main/90 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-primary/95 prose-li:text-[13px] prose-ul:list-disc prose-ul:pl-5">
              {assessment.aiAnalysis ? (
                <ReactMarkdown>{assessment.aiAnalysis}</ReactMarkdown>
              ) : (
                <div className="text-center py-10 font-sans">
                  <p className="text-text-dim text-xs uppercase font-black tracking-widest">Nenhuma análise de IA gerada.</p>
                </div>
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
                    Documento Gerado Eletronicamente via IHP-PR Digital
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
