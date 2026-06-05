import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, User, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Assessment } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from '../../../lib/utils';

interface ResultViewProps {
  assessment: Assessment;
  onBack: () => void;
  onExport: () => void;
}

export function ResultView({ assessment, onBack, onExport }: ResultViewProps) {
  // Sort events chronologically by age
  const sortedEvents = [...assessment.events].sort((a, b) => a.age - b.age);

  // Prepare data for the peaks and valleys chart
  const chartData = sortedEvents.map(e => ({
    age: e.age,
    title: e.title,
    impact: e.type === 'positive' ? e.intensity : e.type === 'negative' ? -e.intensity : 0,
    type: e.type,
    intensity: e.intensity
  }));

  // Statistics
  const totalEvents = sortedEvents.length;
  const positiveEvents = sortedEvents.filter(e => e.type === 'positive').length;
  const negativeEvents = sortedEvents.filter(e => e.type === 'negative').length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPos = data.type === 'positive';
      const isNeg = data.type === 'negative';
      const colorClass = isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-400';
      return (
        <div className="bg-bg-sidebar border border-border-subtle p-3 rounded-xl shadow-xl font-sans text-xs">
          <p className="font-black text-text-main uppercase tracking-widest mb-1">{data.title}</p>
          <p className="text-[10px] text-text-dim">Idade: <span className="font-bold text-text-main">{data.age} anos</span></p>
          <p className={cn("text-[10px] mt-0.5 font-bold", colorClass)}>
            Impacto: {isPos ? '+' : ''}{data.impact}
          </p>
        </div>
      );
    }
    return null;
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
          className="flex items-center gap-2 text-text-dim hover:text-[#10b981] font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para Edição
        </button>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 bg-[#10b981] hover:bg-[#10b981]/90 text-bg-deep px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#10b981]/10 transition-all active:scale-95 cursor-pointer"
        >
          <Download size={14} /> Exportar Relatório HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Identification & Statistics & Peaks Chart */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Card */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={12} className="text-[#10b981]" /> Ficha de Identificação
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

          {/* Emotional Statistics */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <TrendingUp size={12} className="text-[#10b981]" /> Métricas de Valência
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-bg-sidebar border border-border-subtle p-2.5 rounded-xl">
                <span className="text-[8px] font-black text-text-dim uppercase tracking-widest block">Total</span>
                <span className="text-lg font-black text-text-main">{totalEvents}</span>
              </div>
              <div className="bg-bg-sidebar border border-border-subtle p-2.5 rounded-xl">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">Positivos</span>
                <span className="text-lg font-black text-emerald-400">{positiveEvents}</span>
              </div>
              <div className="bg-bg-sidebar border border-border-subtle p-2.5 rounded-xl">
                <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest block">Negativos</span>
                <span className="text-lg font-black text-rose-400">{negativeEvents}</span>
              </div>
            </div>
          </div>

          {/* Peaks and Valleys Chart */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3 mb-6">
              <TrendingUp size={12} className="text-[#10b981]" /> Gráfico de Picos e Vales
            </h3>
            <div className="h-[240px] w-full relative flex items-center justify-center font-sans">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis 
                    dataKey="age" 
                    type="number"
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 9, fill: '#adb5bd', fontWeight: 700 }}
                    label={{ value: 'Idade', position: 'insideBottomRight', offset: -5, fill: '#adb5bd', fontSize: 8, fontWeight: 900, textAnchor: 'middle' }}
                  />
                  <YAxis 
                    domain={[-5, 5]} 
                    ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
                    tick={{ fontSize: 9, fill: '#adb5bd', fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1} />
                  <Line 
                    type="monotone" 
                    dataKey="impact" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[8px] text-text-dim font-bold uppercase tracking-wider text-center mt-3">
              Eixo X: Idade | Eixo Y: Impacto Emocional (-5 a +5)
            </p>
          </div>
        </div>

        {/* Right Column: AI Analysis & Timeline */}
        <div className="lg:col-span-8 space-y-8">
          {/* Vertical timeline inside results */}
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border-subtle shadow-xl">
            <div className="border-b border-border-subtle pb-4 mb-6">
              <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-[#10b981]" /> Mapeamento Cronológico
              </h3>
              <p className="text-[9px] text-text-dim font-bold uppercase tracking-wider mt-1">
                Visualização temporal de marcos autobiográficos
              </p>
            </div>

            <div className="relative border-l border-border-subtle pl-6 ml-4 space-y-6">
              {sortedEvents.map((e) => {
                const isPos = e.type === 'positive';
                const isNeg = e.type === 'negative';
                const isNeut = e.type === 'neutral';
                const dotColor = isPos 
                  ? 'bg-emerald-500 border-emerald-300/40 shadow-emerald-500/20' 
                  : isNeg 
                    ? 'bg-rose-500 border-rose-300/40 shadow-rose-500/20' 
                    : 'bg-slate-500 border-slate-300/40 shadow-slate-500/20';
                
                return (
                  <div key={e.id} className="relative">
                    {/* Circle marker on line */}
                    <span className={cn(
                      "absolute -left-[30px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border shadow-sm",
                      dotColor
                    )} />
                    
                    <div className="bg-bg-sidebar/40 p-4 rounded-2xl border border-border-subtle space-y-1 hover:border-[#10b981]/25 transition-all duration-300">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 text-[9px] font-black uppercase tracking-widest">
                        <span className="text-[#10b981]">{e.age} ANOS</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px]",
                          isPos ? "text-emerald-400 bg-emerald-500/10" : isNeg ? "text-rose-400 bg-rose-500/10" : "text-slate-400 bg-slate-500/10"
                        )}>
                          {isPos ? `Positivo (+${e.intensity})` : isNeg ? `Negativo (-${e.intensity})` : 'Neutro'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-text-main mt-1">{e.title}</h4>
                      <p className="text-[11px] text-text-dim/90 leading-relaxed font-medium mt-1.5">{e.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Clinical Report */}
          {assessment.aiAnalysis && (
            <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border-subtle shadow-xl text-text-main font-serif leading-relaxed text-sm select-text">
              <div className="text-center mb-10 border-b border-border-subtle pb-6 flex flex-col items-center">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">Linha da Vida</h2>
                <p className="italic text-text-dim text-[11px] font-sans uppercase font-bold tracking-wider">Laudo Analítico da Trajetória Autobiográfica</p>
              </div>

              <div className="space-y-6 max-w-none text-justify prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-[#10b981] prose-h1:border-l-2 prose-h1:border-[#10b981] prose-h1:pl-3 prose-p:text-text-main/90 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-[#10b981]/95 prose-li:text-[13px] prose-ul:list-disc prose-ul:pl-5">
                <ReactMarkdown>{assessment.aiAnalysis}</ReactMarkdown>
              </div>
              
              <div className="mt-16 pt-8 border-t border-border-subtle font-sans">
                 <div className="flex flex-col items-center">
                    <div className="w-48 h-[1px] bg-border-subtle mb-3" />
                    <p className="font-black text-text-main text-[10px] uppercase tracking-widest">{assessment.patient.psychologistName}</p>
                    <p className="text-[9px] font-black text-text-dim uppercase tracking-wider">CRP: {assessment.patient.crp}</p>
                    
                    <div className="mt-8 text-[8px] text-text-dim/30 uppercase tracking-[0.25em] font-black">
                      Análise gerada eletronicamente pelo módulo Linha da Vida
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
