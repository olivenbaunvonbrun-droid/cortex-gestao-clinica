import React, { useState, useEffect } from 'react';
import { AsrsData, EvaluationStage } from '../types';
import { db } from '../../../lib/db';
import { Zap, AlertCircle, CheckCircle2, ArrowRight, Brain, RotateCcw, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ASRS_QUESTIONS, Frequency } from '../../TdahAsrs18/types';
import { calculateTdahAssessment } from '../../TdahAsrs18/lib/scoring';

interface StageAsrsViewProps {
  patientId: string;
  asrsData?: AsrsData;
  onUpdateAsrs: (data: AsrsData) => void;
  onNextStage: () => void;
  onOpenStandaloneAsrs?: () => void;
}

export default function StageAsrsView({
  patientId,
  asrsData,
  onUpdateAsrs,
  onNextStage,
  onOpenStandaloneAsrs
}: StageAsrsViewProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(asrsData?.answers || {});
  const [isImporting, setIsImporting] = useState(false);

  // Try importing from existing Cortex ASRS entries if available
  useEffect(() => {
    const importFromExisting = async () => {
      if (asrsData && Object.keys(asrsData.answers || {}).length > 0) return;
      try {
        setIsImporting(true);
        const record = await db.prontuarios.get(patientId);
        if (record && record.entradas) {
          const tdahEntry = record.entradas.find(
            e => e.tipo === ('tdah' as any) || e.metadata?.type === 'tdah'
          );
          if (tdahEntry?.metadata?.tdahData?.answers) {
            const rawAnswers = tdahEntry.metadata.tdahData.answers;
            const scoring = calculateTdahAssessment(rawAnswers);
            const imported: AsrsData = {
              answers: rawAnswers,
              partAScore: scoring.partA.rawScore,
              partBScore: scoring.partB.rawScore,
              partASignificant: scoring.partA.significantSymptoms,
              partBSignificant: scoring.partB.significantSymptoms,
              thresholdMetA: scoring.partA.thresholdMet,
              classification: scoring.classification,
              completedAt: tdahEntry.metadata.tdahData.createdAt || new Date().toISOString()
            };
            setAnswers(rawAnswers);
            onUpdateAsrs(imported);
          }
        }
      } catch (e) {
        console.warn('Erro ao importar ASRS existente:', e);
      } finally {
        setIsImporting(false);
      }
    };
    importFromExisting();
  }, [patientId]);

  const handleSelectOption = (questionId: number, freq: number) => {
    const nextAnswers = { ...answers, [questionId]: freq };
    setAnswers(nextAnswers);

    // If all questions are answered or updated, calculate
    const scoring = calculateTdahAssessment(nextAnswers);
    const updated: AsrsData = {
      answers: nextAnswers,
      partAScore: scoring.partA.rawScore,
      partBScore: scoring.partB.rawScore,
      partASignificant: scoring.partA.significantSymptoms,
      partBSignificant: scoring.partB.significantSymptoms,
      thresholdMetA: scoring.partA.thresholdMet,
      classification: scoring.classification,
      completedAt: new Date().toISOString()
    };
    onUpdateAsrs(updated);
  };

  const currentScoring = calculateTdahAssessment(answers);
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho da Etapa 1 */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 1 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              {totalAnswered}/18 Itens Preenchidos
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <Zap className="text-amber-400" size={18} /> ASRS-18: Triagem & Rastreio Inicial
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            A Adult ADHD Self-Report Scale (ASRS-18 - OMS) identifica a probabilidade de TDAH através de sintomas atuais. 
            <strong> Lembre-se:</strong> O resultado positivo NÃO estabelece o diagnóstico por si só — ele delimita a necessidade de confirmação nas etapas seguintes.
          </p>
        </div>

        {onOpenStandaloneAsrs && (
          <button
            onClick={onOpenStandaloneAsrs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-main text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
          >
            <ExternalLink size={13} /> Abrir Ferramenta Isolada
          </button>
        )}
      </div>

      {/* Painel de Resultados do Rastreio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Parte A (Desatenção)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-text-main">{currentScoring.partA.significantSymptoms} / 6</span>
            <span className="text-xs text-text-dim font-medium">sintomas significativos</span>
          </div>
          <span className={cn(
            "text-[9px] font-bold uppercase px-2 py-0.5 rounded border inline-block mt-1",
            currentScoring.partA.thresholdMet ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-white/5 text-text-dim border-white/10"
          )}>
            {currentScoring.partA.thresholdMet ? 'Ponto de Corte Atingido (≥4)' : 'Abaixo do Corte'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Parte B (Hiperatividade / Impulsividade)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-text-main">{currentScoring.partB.significantSymptoms} / 12</span>
            <span className="text-xs text-text-dim font-medium">sintomas frequentes</span>
          </div>
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-white/10 bg-white/5 text-text-dim inline-block mt-1">
            Escore Bruto: {currentScoring.partB.rawScore} pts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Indicação Clínica do Rastreio</span>
          <div className="text-sm font-bold text-amber-400">
            {currentScoring.riskLevel}
          </div>
          <p className="text-[10px] text-text-dim leading-snug">
            {currentScoring.partA.thresholdMet 
              ? 'Indicadores positivos sustentam investigação diagnóstica com anamnese e escalas adicionais.' 
              : 'Indicadores reduzidos na triagem inicial.'}
          </p>
        </div>
      </div>

      {/* Lista de Questões do ASRS-18 */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-text-dim px-1">
          Questionário de Rastreio (18 Questões)
        </h4>

        <div className="space-y-2">
          {ASRS_QUESTIONS.map((q) => {
            const currentVal = answers[q.id];
            return (
              <div 
                key={q.id}
                className="p-4 rounded-2xl bg-bg-sidebar/40 border border-border-subtle hover:border-border-subtle/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-dim">
                      {q.partTitle} • Item {q.numberInPart}
                    </span>
                  </div>
                  <p className="text-xs text-text-main font-medium leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {/* Opções de Frequência */}
                <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                  {[
                    { val: Frequency.NONE, label: 'Nunca (0)' },
                    { val: Frequency.SLIGHTLY, label: 'Raramente (1)' },
                    { val: Frequency.OFTEN, label: 'Frequentemente (2)' },
                    { val: Frequency.VERY_OFTEN, label: 'Muito Frequentemente (3)' },
                  ].map(opt => {
                    const isSelected = currentVal === opt.val;
                    return (
                      <button
                        key={opt.val}
                        onClick={() => handleSelectOption(q.id, opt.val)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer",
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                            : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05] hover:text-text-main"
                        )}
                      >
                        {opt.label}
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
          {totalAnswered === 18 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Triagem Concluída
            </span>
          ) : (
            <span>Preencha as 18 questões para consolidar a etapa de triagem.</span>
          )}
        </div>

        <button
          onClick={onNextStage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          Próximo: Anamnese Retrospectiva <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
