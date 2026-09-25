import React, { useState } from 'react';
import { EtdahData } from '../types';
import { ETDAH_QUESTIONS, ETDAH_FACTORS, ETDAH_SCALE_OPTIONS } from '../data/etdahData';
import { calculateEtdahScoring } from '../lib/scoring';
import { Brain, CheckCircle2, ArrowRight, BarChart2, Filter, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface StageEtdahViewProps {
  etdahData?: EtdahData;
  onUpdateEtdah: (data: EtdahData) => void;
  onNextStage: () => void;
}

export default function StageEtdahView({
  etdahData,
  onUpdateEtdah,
  onNextStage
}: StageEtdahViewProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(etdahData?.answers || {});
  const [selectedFactorFilter, setSelectedFactorFilter] = useState<number | 'all'>('all');

  const handleSelectOption = (questionId: number, val: number) => {
    const nextAnswers = { ...answers, [questionId]: val };
    setAnswers(nextAnswers);
    const scored = calculateEtdahScoring(nextAnswers);
    onUpdateEtdah(scored);
  };

  const handleSimulateFill = () => {
    const mock: Record<number, number> = {};
    ETDAH_QUESTIONS.forEach(q => {
      // Simulate realistic elevated ADHD scores
      if (q.isInverted) {
        mock[q.id] = Math.floor(Math.random() * 2); // 0 or 1
      } else {
        mock[q.id] = 3 + Math.floor(Math.random() * 3); // 3, 4 or 5
      }
    });
    setAnswers(mock);
    const scored = calculateEtdahScoring(mock);
    onUpdateEtdah(scored);
  };

  const currentScoring = calculateEtdahScoring(answers);
  const totalAnswered = Object.keys(answers).length;

  const filteredQuestions = selectedFactorFilter === 'all'
    ? ETDAH_QUESTIONS
    : ETDAH_QUESTIONS.filter(q => q.factor === selectedFactorFilter);

  // Radar/Bar chart data
  const chartData = Object.values(currentScoring.factors).map(f => ({
    name: f.name.replace('Autorregulação da Atenção, Motivação e Ação', 'Autorregulação'),
    score: f.percentage,
    raw: f.rawScore,
    max: f.maxScore,
    level: f.level
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 3 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              {totalAnswered}/69 Itens Respondidos
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <Brain className="text-amber-400" size={18} /> ETDAH-AD: Escala de TDAH em Adultos
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            Instrumento psicométrico (Edyleine B. P. Benczik / Vetor Editora) investigando 5 fatores sintomatológicos normatizados: Desatenção, Impulsividade, Aspectos Emocionais, Autorregulação e Hiperatividade.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSimulateFill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-dim hover:text-text-main text-[10px] font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
            title="Preencher valores de demonstração"
          >
            <Sparkles size={12} className="text-amber-400" /> Preencher Exemplo
          </button>
        </div>
      </div>

      {/* Painel dos 5 Fatores com Gráfico Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cards dos Fatores (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-text-dim">
            Escores por Dimensão Fatorial
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(currentScoring.factors).map(f => (
              <div 
                key={f.factor}
                onClick={() => setSelectedFactorFilter(f.factor)}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer",
                  selectedFactorFilter === f.factor 
                    ? "bg-amber-500/10 border-amber-400 shadow-sm"
                    : "bg-bg-sidebar/40 border-border-subtle hover:border-border-subtle/80"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-main">
                    Fator {f.factor}: {f.name}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
                    f.level === 'Superior' ? "bg-red-500/15 text-red-400 border-red-500/30" :
                    f.level === 'Médio Superior' ? "bg-amber-500/15 text-amber-300 border-amber-500/30" :
                    "bg-white/5 text-text-dim border-white/10"
                  )}>
                    {f.level}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-text-dim font-mono">
                    {f.rawScore} / {f.maxScore} pts
                  </span>
                  <span className="text-sm font-mono font-black text-amber-400">
                    {f.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      f.percentage >= 75 ? "bg-red-500" : f.percentage >= 50 ? "bg-amber-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${f.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Total Global */}
            <div className="p-3.5 rounded-2xl border bg-white/[0.02] border-white/[0.08] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
                  Escore Total Global ETDAH-AD
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {currentScoring.totalScore}
                  </span>
                  <span className="text-xs text-text-dim font-mono">/ {currentScoring.maxTotalScore} pts</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-text-main mt-1">
                {currentScoring.overallClassification}
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico Radar Visual (5 cols) */}
        <div className="lg:col-span-5 bg-bg-sidebar/30 border border-border-subtle rounded-3xl p-4 flex flex-col items-center justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-dim mb-1">
            Perfil Poligonal dos 5 Fatores
          </span>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Intensidade (%)" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtros e Lista de Questões */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-text-dim flex items-center gap-2">
            <span>Caderno de Questões (69 Itens)</span>
            <span className="text-[9px] font-mono opacity-60">
              {filteredQuestions.length} mostrados
            </span>
          </h4>

          {/* Filtro por Fator */}
          <div className="flex items-center gap-1.5 overflow-x-auto scroller-hide pb-1">
            <button
              onClick={() => setSelectedFactorFilter('all')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0",
                selectedFactorFilter === 'all'
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05]"
              )}
            >
              Todos (69)
            </button>
            {[1, 2, 3, 4, 5].map(fId => (
              <button
                key={fId}
                onClick={() => setSelectedFactorFilter(fId)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0",
                  selectedFactorFilter === fId
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05]"
                )}
              >
                Fator {fId}
              </button>
            ))}
          </div>
        </div>

        {/* Itens */}
        <div className="space-y-2">
          {filteredQuestions.map((q) => {
            const currentVal = answers[q.id];
            return (
              <div 
                key={q.id}
                className="p-3.5 rounded-2xl bg-bg-sidebar/40 border border-border-subtle hover:border-border-subtle/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400">
                      Item {q.id}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-text-dim">
                      {q.factorName} {q.isInverted ? '(Item Invertido)' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-text-main font-medium leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {/* Opções de Escala 0 a 5 */}
                <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
                  {ETDAH_SCALE_OPTIONS.map(opt => {
                    const isSelected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectOption(q.id, opt.value)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer text-center min-w-[28px]",
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                            : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05] hover:text-text-main"
                        )}
                        title={opt.label}
                      >
                        {opt.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navegação Inferior */}
      <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
        <div className="text-xs text-text-dim">
          {totalAnswered === 69 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> ETDAH-AD Completo
            </span>
          ) : (
            <span>{totalAnswered} de 69 itens preenchidos</span>
          )}
        </div>

        <button
          onClick={onNextStage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          Próximo: EPF-TDAH (Prejuízos Funcionais) <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
