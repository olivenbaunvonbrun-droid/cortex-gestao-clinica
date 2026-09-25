import React, { useState } from 'react';
import { BdefsData } from '../types';
import { BDEFS_QUESTIONS, BDEFS_SECTIONS, BDEFS_SCALE_OPTIONS, BARKLEY_ADHD_EF_INDEX_ITEMS } from '../data/bdefsData';
import { calculateBdefsScoring } from '../lib/scoring';
import { Layers, CheckCircle2, ArrowRight, Sparkles, AlertCircle, Bookmark } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StageBdefsViewProps {
  bdefsData?: BdefsData;
  onUpdateBdefs: (data: BdefsData) => void;
  onNextStage: () => void;
}

export default function StageBdefsView({
  bdefsData,
  onUpdateBdefs,
  onNextStage
}: StageBdefsViewProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(bdefsData?.answers || {});
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<number | 'all' | 'index'>('all');

  const handleSelectOption = (questionId: number, val: number) => {
    const nextAnswers = { ...answers, [questionId]: val };
    setAnswers(nextAnswers);
    const scored = calculateBdefsScoring(nextAnswers);
    onUpdateBdefs(scored);
  };

  const handleSimulateFill = () => {
    const mock: Record<number, number> = {};
    BDEFS_QUESTIONS.forEach(q => {
      // Simulate realistic elevated ADHD-EF scores
      if (BARKLEY_ADHD_EF_INDEX_ITEMS.includes(q.id) || [1, 2, 4].includes(q.sectionId)) {
        mock[q.id] = 2 + Math.floor(Math.random() * 3); // 2, 3 or 4
      } else {
        mock[q.id] = 1 + Math.floor(Math.random() * 3); // 1, 2 or 3
      }
    });
    setAnswers(mock);
    const scored = calculateBdefsScoring(mock);
    onUpdateBdefs(scored);
  };

  const currentScoring = calculateBdefsScoring(answers);
  const totalAnswered = Object.keys(answers).length;

  const filteredQuestions = selectedSectionFilter === 'all'
    ? BDEFS_QUESTIONS
    : selectedSectionFilter === 'index'
    ? BDEFS_QUESTIONS.filter(q => q.isAdhdEfIndexItem)
    : BDEFS_QUESTIONS.filter(q => q.sectionId === selectedSectionFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 5 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              {totalAnswered}/89 Itens Respondidos
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <Layers className="text-amber-400" size={18} /> BDEFS: Avaliação de Disfunção Executiva de Barkley
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            Muitos adultos compensam desatenção em ambientes controlados, mas sofrem intensa desorganização diária. 
            A BDEFS avalia gerenciamento de tempo, memória de trabalho, autocontenção, motivação e autorregulação emocional, calculando o <strong>Índice FE-TDAH de Barkley</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSimulateFill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-dim hover:text-text-main text-[10px] font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
          >
            <Sparkles size={12} className="text-amber-400" /> Preencher Exemplo
          </button>
        </div>
      </div>

      {/* Destaque do Índice FE-TDAH de Barkley & Escores Globais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card do Índice FE-TDAH (11 Itens Chave) */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1">
              <Bookmark size={11} /> Índice FE-TDAH (Barkley)
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
              currentScoring.adhdEfIndexRisk === 'Alto Risco de TDAH'
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : currentScoring.adhdEfIndexRisk === 'Risco Moderado'
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-white/10 text-text-dim border-white/10"
            )}>
              {currentScoring.adhdEfIndexRisk}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {currentScoring.adhdEfIndexScore}
            </span>
            <span className="text-xs text-text-dim font-mono">/ 44 pts ({currentScoring.adhdEfIndexSymptoms} sintomas)</span>
          </div>

          <p className="text-[10px] text-text-main/80 leading-snug">
            Soma dos 11 itens mais discriminantes de TDAH em adultos (Itens 1, 6, 14, 16, 24, 49, 50, 55, 60, 65, 69).
          </p>
        </div>

        {/* Card Total de Sintomas de FE */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">
            Total de Sintomas de FE Frequentes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-main font-mono">
              {currentScoring.totalSymptoms}
            </span>
            <span className="text-xs text-text-dim font-mono">/ 89 itens marcados 3 ou 4</span>
          </div>
          <p className="text-[10px] text-text-dim leading-snug">
            Itens assinalados com 'Frequentemente' ou 'Muito frequentemente'.
          </p>
        </div>

        {/* Card Nível Global de Disfunção Executiva */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">
            Disfunção Executiva Geral
          </span>
          <div className="text-sm font-black text-amber-400">
            {currentScoring.overallLevel}
          </div>
          <div className="text-xs font-mono text-text-dim">
            Escore Total: {currentScoring.totalScore} / 356 pts
          </div>
        </div>
      </div>

      {/* Cards das 5 Seções da BDEFS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.values(currentScoring.sections).map(sec => (
          <div 
            key={sec.sectionId}
            onClick={() => setSelectedSectionFilter(sec.sectionId)}
            className={cn(
              "p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between",
              selectedSectionFilter === sec.sectionId 
                ? "bg-amber-500/10 border-amber-400 shadow-sm"
                : "bg-bg-sidebar/40 border-border-subtle hover:border-border-subtle/80"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-main">
                  Seção {sec.sectionId}
                </span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase border",
                  sec.level === 'Disfunção Grave' ? "bg-red-500/15 text-red-400 border-red-500/30" :
                  sec.level === 'Disfunção Moderada' ? "bg-amber-500/15 text-amber-300 border-amber-500/30" :
                  "bg-white/5 text-text-dim border-white/10"
                )}>
                  {sec.level}
                </span>
              </div>
              <h5 className="text-[10px] font-bold text-text-dim leading-snug line-clamp-2" title={sec.name}>
                {sec.name.split(':')[1] || sec.name}
              </h5>
            </div>

            <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-baseline justify-between">
              <span className="text-[10px] font-mono text-text-dim">{sec.rawScore} pts</span>
              <span className="text-[10px] font-mono font-bold text-amber-400">Média: {sec.averageScore}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Caderno de Questões */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-text-dim flex items-center gap-2">
            <span>Caderno de Questões da BDEFS (89 Itens)</span>
            <span className="text-[9px] font-mono opacity-60">
              {filteredQuestions.length} exibidos
            </span>
          </h4>

          {/* Filtros */}
          <div className="flex items-center gap-1.5 overflow-x-auto scroller-hide pb-1">
            <button
              onClick={() => setSelectedSectionFilter('all')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0",
                selectedSectionFilter === 'all'
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05]"
              )}
            >
              Todos (89)
            </button>
            <button
              onClick={() => setSelectedSectionFilter('index')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0",
                selectedSectionFilter === 'index'
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
              )}
            >
              ★ Índice FE-TDAH (11)
            </button>
            {[1, 2, 3, 4, 5].map(sId => (
              <button
                key={sId}
                onClick={() => setSelectedSectionFilter(sId)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0",
                  selectedSectionFilter === sId
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05]"
                )}
              >
                Seção {sId}
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
                className={cn(
                  "p-3.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3",
                  q.isAdhdEfIndexItem 
                    ? "bg-amber-500/[0.03] border-amber-500/20 hover:border-amber-500/40"
                    : "bg-bg-sidebar/40 border-border-subtle hover:border-border-subtle/80"
                )}
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400">
                      Item {q.id}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-text-dim">
                      {q.sectionName}
                    </span>
                    {q.isAdhdEfIndexItem && (
                      <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Índice FE-TDAH
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-main font-medium leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {/* Opções de Escala 1 a 4 */}
                <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                  {BDEFS_SCALE_OPTIONS.map(opt => {
                    const isSelected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectOption(q.id, opt.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-[9px] font-bold border transition-all cursor-pointer text-center",
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                            : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05] hover:text-text-main"
                        )}
                        title={opt.label}
                      >
                        {opt.value} - {opt.label.split(' ')[0]}
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
          {totalAnswered === 89 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> BDEFS Completo
            </span>
          ) : (
            <span>{totalAnswered} de 89 itens preenchidos</span>
          )}
        </div>

        <button
          onClick={onNextStage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          Próximo: Heterorrelato <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
