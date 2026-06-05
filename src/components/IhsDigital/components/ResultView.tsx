import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, FileText, Calendar, User, Zap, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Assessment, Frequency } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { cn } from '../../../lib/utils';

interface ResultViewProps {
  assessment: Assessment;
  onBack: () => void;
  onExport: () => void;
}

export function ResultView({ assessment, onBack, onExport }: ResultViewProps) {
  // Simple scoring for visualization (0-100 scale)
  const calculateFactorScore = (itemIds: number[]) => {
    let rawScore = 0;
    const scoreMap: Record<Frequency, number> = {
      [Frequency.NEVER]: 0,
      [Frequency.RARELY]: 1,
      [Frequency.SOMETIMES]: 2,
      [Frequency.OFTEN]: 3,
      [Frequency.ALWAYS]: 4,
    };

    const invertedItems = new Set([2, 8, 9, 13, 17, 18, 19, 22, 23, 24, 25, 26, 33, 34, 36, 37, 39, 41, 42]);

    itemIds.forEach(id => {
      const ans = assessment.answers[id];
      if (ans) {
        const value = scoreMap[ans];
        if (invertedItems.has(id)) {
          rawScore += (4 - value);
        } else {
          rawScore += value;
        }
      }
    });

    return Math.round((rawScore / (itemIds.length * 4)) * 100);
  };

  const factorData = [
    { factor: 'Enfrentamento', score: calculateFactorScore([15, 18, 21, 27, 30, 31, 33, 34, 38, 40]) },
    { factor: 'Positividade', score: calculateFactorScore([3, 6, 10, 20, 28, 32, 35]) },
    { factor: 'Conversação', score: calculateFactorScore([1, 4, 5, 7, 11, 12, 14, 16, 29, 39]) },
    { factor: 'Autoexposição', score: calculateFactorScore([9, 13, 19, 23, 26, 36, 37]) },
    { factor: 'Autocontrole', score: calculateFactorScore([2, 8, 17, 22, 24, 25, 41, 42]) },
  ];

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
        {/* Left Column: Summary & Scores */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={12} className="text-primary" /> Ficha de Identificação
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

          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl relative min-w-0">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3 mb-6">
              <Zap size={12} className="text-primary" /> Análise Quantitativa
            </h3>
            <div className="h-[220px] w-full mb-8 relative flex items-center justify-center">
              <ResponsiveContainer width="99%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={factorData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 8, fill: '#adb5bd', fontWeight: 900, letterSpacing: '0.1em' }} />
                  <Radar
                    name="Percentil"
                    dataKey="score"
                    stroke="#4dabf7"
                    fill="#4dabf7"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {factorData.map(f => (
                <div key={f.factor} className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                    <span className="text-text-dim">{f.factor}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px]",
                      f.score > 70 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                        : f.score > 40 
                          ? "bg-text-dim/5 text-text-dim border border-border-subtle" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                    )}>{f.score}%</span>
                  </div>
                  <div className="h-2 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${f.score}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:col-span-8">
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border-subtle shadow-xl text-text-main font-serif leading-relaxed text-sm select-text">
            <div className="text-center mb-10 border-b border-border-subtle pb-6 flex flex-col items-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">Inventário de Habilidades Sociais (IHS-2)</h2>
              <p className="italic text-text-dim text-[11px] font-sans uppercase font-bold tracking-wider">Relatório de Avaliação Técnica Clinicamente Estruturado</p>
            </div>

            <div className="space-y-6 max-w-none text-justify prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-primary prose-h1:border-l-2 prose-h1:border-primary prose-h1:pl-3 prose-p:text-text-main/90 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-primary/95 prose-li:text-[13px] prose-ul:list-disc prose-ul:pl-5">
              <ReactMarkdown>{assessment.aiAnalysis}</ReactMarkdown>
            </div>
            
            <div className="mt-16 pt-8 border-t border-border-subtle font-sans">
               <div className="flex flex-col items-center">
                  <div className="w-48 h-[1px] bg-border-subtle mb-3" />
                  <p className="font-black text-text-main text-[10px] uppercase tracking-widest">{assessment.patient.psychologistName}</p>
                  <p className="text-[9px] font-black text-text-dim uppercase tracking-wider">CRP: {assessment.patient.crp}</p>
                  
                  <div className="mt-8 text-[8px] text-text-dim/30 uppercase tracking-[0.25em] font-black">
                    Documento Gerado Eletronicamente via IHS Digital
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
