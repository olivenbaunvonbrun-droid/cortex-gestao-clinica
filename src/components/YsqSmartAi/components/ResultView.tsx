import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, FileText, Calendar, User, Zap, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Assessment, Frequency, SCHEMA_DETAILS, YSQ_QUESTIONS } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { cn } from '../../../lib/utils';
import { analyzeYsqAssessment } from '../../../services/geminiService';
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
      const generated = await analyzeYsqAssessment(
        { name: assessment.patient.name, age: assessment.patient.age },
        activeSchemas
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
  // Group answers by schema
  const schemaSums: Record<string, number> = {};
  const schemaCounts: Record<string, number> = {};

  YSQ_QUESTIONS.forEach(q => {
    const val = Number(assessment.answers[q.id]) || 1;
    schemaSums[q.schemaKey] = (schemaSums[q.schemaKey] || 0) + val;
    schemaCounts[q.schemaKey] = (schemaCounts[q.schemaKey] || 0) + 1;
  });

  const schemaScores = Object.entries(SCHEMA_DETAILS).map(([key, info]) => {
    const score = (schemaSums[key] || 0) / (schemaCounts[key] || 5);
    return {
      key,
      name: info.name,
      domain: info.domain,
      score,
      description: info.description
    };
  });

  // Calculate domain averages
  const domainGroups = [
    { name: 'Desconexão', schemas: ['ED', 'AB', 'MA', 'SI', 'DS'] },
    { name: 'Autonomia', schemas: ['FA', 'DI', 'VH', 'EM'] },
    { name: 'Limites', schemas: ['ET', 'IS'] },
    { name: 'Orientação', schemas: ['SB', 'SS', 'AS'] },
    { name: 'Supervigilância', schemas: ['NP', 'EI', 'US', 'PU'] }
  ];

  const domainData = domainGroups.map(d => {
    const schemasInDomain = schemaScores.filter(s => d.schemas.includes(s.key));
    const sum = schemasInDomain.reduce((acc, curr) => acc + curr.score, 0);
    const avg = sum / schemasInDomain.length;
    // Map 1-6 score to 0-100% scale for visual radar
    const percent = Math.round(((avg - 1) / 5) * 100);
    return {
      domain: d.name,
      score: percent,
      avgScore: avg
    };
  });

  const activeSchemas = schemaScores
    .filter(s => s.score >= 4.0)
    .sort((a, b) => b.score - a.score);

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

          {/* Radar Chart */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl relative min-w-0">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3 mb-6">
              <Zap size={12} className="text-primary" /> Ativação dos Domínios
            </h3>
            <div className="h-[220px] w-full mb-8 relative flex items-center justify-center">
              <ResponsiveContainer width="99%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={domainData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 8, fill: '#adb5bd', fontWeight: 900, letterSpacing: '0.05em' }} />
                  <Radar
                    name="Ativação"
                    dataKey="score"
                    stroke="#a78bfa"
                    fill="#a78bfa"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {domainData.map(d => (
                <div key={d.domain} className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                    <span className="text-text-dim">{d.domain}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px]",
                      d.avgScore >= 4.0 
                        ? "bg-red-500/10 text-red-400 border border-red-500/25" 
                        : d.avgScore >= 3.0 
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    )}>{d.avgScore.toFixed(1)} / 6.0</span>
                  </div>
                  <div className="h-2 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Schemas & AI Report */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Schemas Display */}
          <div className="bg-bg-card rounded-[2.5rem] p-8 border border-border-subtle shadow-xl space-y-6">
            <h3 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-4">
              <AlertTriangle size={14} className="text-red-400" /> Esquemas Clínicos Ativos (Média ≥ 4.0)
            </h3>
            {activeSchemas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSchemas.map(s => (
                  <div key={s.key} className="p-4 bg-bg-sidebar/40 border border-border-subtle rounded-2xl space-y-2 hover:border-red-500/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-text-main uppercase tracking-wide truncate max-w-[80%]">{s.name}</span>
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black rounded-lg">{s.score.toFixed(1)}</span>
                    </div>
                    <p className="text-[9px] text-text-dim uppercase tracking-wider font-bold">{s.domain}</p>
                    <p className="text-[11px] text-text-dim/80 leading-relaxed font-medium pt-1">{s.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-bg-sidebar/20 rounded-2xl border border-dashed border-border-subtle">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhum esquema altamente ativo detectado.</p>
              </div>
            )}
          </div>

          {/* AI Clinical Text */}
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border-subtle shadow-xl text-text-main font-serif leading-relaxed text-sm select-text">
            <div className="text-center mb-10 border-b border-border-subtle pb-6 flex flex-col items-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">Questionário de Esquemas de Young (YSQ-S3)</h2>
              <p className="italic text-text-dim text-[11px] font-sans uppercase font-bold tracking-wider">Laudo Técnico Informatizado e Síntese de IA</p>
            </div>

            <div className="space-y-6 max-w-none text-justify prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-primary prose-h1:border-l-2 prose-h1:border-primary prose-h1:pl-3 prose-p:text-text-main/90 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-primary/95 prose-li:text-[13px] prose-ul:list-disc prose-ul:pl-5">
              <ReactMarkdown>{assessment.aiAnalysis}</ReactMarkdown>
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
                    Documento Gerado Digitalmente via YSQ-Smart AI
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
