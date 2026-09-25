import React, { useState } from 'react';
import { EpfData } from '../types';
import { EPF_QUESTIONS, EPF_DOMAINS, EPF_SCALE_OPTIONS } from '../data/epfData';
import { calculateEpfScoring } from '../lib/scoring';
import { Briefcase, CheckCircle2, ArrowRight, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface StageEpfViewProps {
  epfData?: EpfData;
  onUpdateEpf: (data: EpfData) => void;
  onNextStage: () => void;
}

export default function StageEpfView({
  epfData,
  onUpdateEpf,
  onNextStage
}: StageEpfViewProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(epfData?.answers || {});
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<number | 'all'>('all');

  const handleSelectOption = (questionId: number, val: number) => {
    const nextAnswers = { ...answers, [questionId]: val };
    setAnswers(nextAnswers);
    const scored = calculateEpfScoring(nextAnswers);
    onUpdateEpf(scored);
  };

  const handleSimulateFill = () => {
    const mock: Record<number, number> = {};
    EPF_QUESTIONS.forEach(q => {
      // Simulate realistic impairments in studies, work, home, finances
      if ([1, 2, 4, 6].includes(q.domainId)) {
        mock[q.id] = 2 + Math.floor(Math.random() * 3); // 2, 3 or 4
      } else {
        mock[q.id] = Math.floor(Math.random() * 3); // 0, 1 or 2
      }
    });
    setAnswers(mock);
    const scored = calculateEpfScoring(mock);
    onUpdateEpf(scored);
  };

  const currentScoring = calculateEpfScoring(answers);
  const totalAnswered = Object.keys(answers).length;

  const filteredQuestions = selectedDomainFilter === 'all'
    ? EPF_QUESTIONS
    : EPF_QUESTIONS.filter(q => q.domainId === selectedDomainFilter);

  const barChartData = Object.values(currentScoring.domains).map(d => ({
    name: d.name.split('/')[0].trim().substring(0, 12),
    prejuizo: d.percentage,
    level: d.level
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 4 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              {totalAnswered}/58 Itens Respondidos
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <Briefcase className="text-amber-400" size={18} /> EPF-TDAH: Escala de Prejuízos Funcionais
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            O DSM-5-TR exige evidências claras de prejuízo funcional em <strong>dois ou mais contextos de vida</strong>. 
            A EPF documenta e quantifica a interferência nas áreas: acadêmica, profissional, afetiva, doméstica, social, financeira, saúde, trânsito e conduta legal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSimulateFill}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 transition-all cursor-pointer shadow-sm"
            title="Preencher com dados simulados para teste"
          >
            <Zap size={11} /> Simular
          </button>
        </div>
      </div>

      {/* Monitor de Prejuízo & Critério DSM-5 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border",
            currentScoring.meetsDsmMultipleContexts
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          )}>
            {currentScoring.affectedDomainsCount}
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-text-dim block">
              Critério DSM-5: Prejuízo em ≥ 2 Contextos
            </span>
            <span className="text-xs font-bold text-text-main">
              {currentScoring.meetsDsmMultipleContexts
                ? `Critério Atendido: ${currentScoring.affectedDomainsCount} domínios com impacto significativo documentado.`
                : 'Critério em verificação: preencha as questões para mensurar múltiplos contextos.'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-dim block">Grau Geral de Prejuízo</span>
          <span className={cn(
            "text-xs font-extrabold uppercase px-2.5 py-0.5 rounded border inline-block",
            currentScoring.overallLevel === 'Severo' || currentScoring.overallLevel === 'Grave'
              ? "bg-red-500/15 text-red-400 border-red-500/30"
              : currentScoring.overallLevel === 'Moderado'
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-white/5 text-text-dim border-white/10"
          )}>
            Nível {currentScoring.overallLevel} ({currentScoring.totalScore} pts)
          </span>
        </div>
      </div>

      {/* Grid dos 9 Domínios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.values(currentScoring.domains).map(dom => (
          <div 
            key={dom.domainId}
            onClick={() => setSelectedDomainFilter(dom.domainId)}
            className={cn(
              "p-3.5 rounded-2xl border transition-all cursor-pointer",
              selectedDomainFilter === dom.domainId 
                ? "bg-amber-500/10 border-amber-400 shadow-sm"
                : "bg-bg-sidebar/40 border-border-subtle hover:border-border-subtle/80"
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-main truncate max-w-[170px]" title={dom.name}>
                {dom.domainId}. {dom.name}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shrink-0",
                dom.level === 'Grave' ? "bg-red-500/15 text-red-400 border-red-500/30" :
                dom.level === 'Moderado' ? "bg-amber-500/15 text-amber-300 border-amber-500/30" :
                dom.level === 'Leve' ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                "bg-white/5 text-text-dim border-white/10"
              )}>
                {dom.level}
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-mono text-text-dim">
                {dom.rawScore} / {dom.maxScore} pts ({dom.significantImpairments} itens ≥ AV)
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {dom.percentage}%
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  dom.percentage >= 60 ? "bg-red-500" : dom.percentage >= 35 ? "bg-amber-400" : "bg-emerald-400"
                )}
                style={{ width: `${dom.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filtro e Caderno de Questões */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-text-dim flex items-center gap-2">
            <span>Caderno de Itens da EPF-TDAH (58 Itens)</span>
            <span className="text-[9px] font-mono opacity-60">
              {filteredQuestions.length} mostrados
            </span>
          </h4>

          {/* Filtro por Domínio */}
          <div className="flex items-center gap-1.5 overflow-x-auto scroller-hide pb-1">
            <button
              onClick={() => setSelectedDomainFilter('all')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0",
                selectedDomainFilter === 'all'
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05]"
              )}
            >
              Todos (58)
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(dId => (
              <button
                key={dId}
                onClick={() => setSelectedDomainFilter(dId)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0",
                  selectedDomainFilter === dId
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05]"
                )}
              >
                D{dId}
              </button>
            ))}
          </div>
        </div>

        {/* Questões */}
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
                      {q.domainName}
                    </span>
                  </div>
                  <p className="text-xs text-text-main font-medium leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {/* Opções Likert 0 a 4 */}
                <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
                  {EPF_SCALE_OPTIONS.map((opt, oIdx) => {
                    const isSelected = currentVal === opt.value && (currentVal !== 0 || opt.code === (answers[q.id] === 0 ? 'N' : 'NA'));
                    return (
                      <button
                        key={`${q.id}-${opt.code}-${oIdx}`}
                        onClick={() => handleSelectOption(q.id, opt.weight)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer text-center",
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                            : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05] hover:text-text-main"
                        )}
                        title={opt.label}
                      >
                        {opt.code}
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
          {totalAnswered === 58 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> EPF-TDAH Completo
            </span>
          ) : (
            <span>{totalAnswered} de 58 itens preenchidos</span>
          )}
        </div>

        <button
          onClick={onNextStage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          Próximo: BDEFS (Funções Executivas) <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
