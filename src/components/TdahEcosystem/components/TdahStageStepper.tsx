import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Zap, 
  BookOpen, 
  Brain, 
  Briefcase, 
  Layers, 
  Users, 
  ShieldAlert, 
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { EvaluationStage, StageStatus } from '../types';
import { cn } from '../../../lib/utils';

interface TdahStageStepperProps {
  currentStage: EvaluationStage;
  onSelectStage: (stage: EvaluationStage) => void;
  stageStatuses: Record<EvaluationStage, StageStatus>;
  completionPercentage: number;
}

export const STAGES_CONFIG: { id: EvaluationStage; label: string; number: number; icon: any; shortTitle: string }[] = [
  { id: 'overview', label: 'Visão Geral & DSM-5', number: 0, icon: Sparkles, shortTitle: 'Visão Geral' },
  { id: 'asrs18', label: '1. Triagem (ASRS-18)', number: 1, icon: Zap, shortTitle: 'Triagem' },
  { id: 'anamnese', label: '2. Anamnese Retrospectiva', number: 2, icon: BookOpen, shortTitle: 'Anamnese' },
  { id: 'etdah', label: '3. Sintomas (ETDAH-AD)', number: 3, icon: Brain, shortTitle: 'ETDAH-AD' },
  { id: 'epf', label: '4. Prejuízos (EPF-TDAH)', number: 4, icon: Briefcase, shortTitle: 'EPF-TDAH' },
  { id: 'bdefs', label: '5. Executivo (BDEFS)', number: 5, icon: Layers, shortTitle: 'BDEFS' },
  { id: 'heterorrelato', label: '6. Heterorrelato', number: 6, icon: Users, shortTitle: 'Heterorrelato' },
  { id: 'diferenciais', label: '7. Diferenciais & Comorb.', number: 7, icon: ShieldAlert, shortTitle: 'Diferenciais' },
  { id: 'laudo', label: '8. Síntese & Laudo CFP', number: 8, icon: FileText, shortTitle: 'Laudo CFP' },
];

export default function TdahStageStepper({
  currentStage,
  onSelectStage,
  stageStatuses,
  completionPercentage
}: TdahStageStepperProps) {
  return (
    <div className="w-full bg-bg-card/80 backdrop-blur-md border-b border-border-subtle p-3 sm:p-4 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Brain size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Ecossistema Clínico</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-dim font-bold">TDAH Adulto</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-text-main">
              Trilha de Avaliação Diagnóstica Estruturada
            </h3>
          </div>
        </div>

        {/* Barra de Progresso Global */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-wider text-text-dim block">Progresso do Protocolo</span>
            <span className="text-xs font-mono font-bold text-amber-400">{completionPercentage}% Concluído</span>
          </div>
          <div className="w-32 h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto scroller-hide pb-1 scroll-smooth">
        {STAGES_CONFIG.map((stage, idx) => {
          const Icon = stage.icon;
          const status = stageStatuses[stage.id] || 'pending';
          const isActive = currentStage === stage.id;
          const isDone = status === 'completed';
          const isInProgress = status === 'in_progress';

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => onSelectStage(stage.id)}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0",
                  isActive 
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10 font-black"
                    : isDone
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : isInProgress
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-white/[0.02] text-text-dim border-white/[0.06] hover:bg-white/[0.05] hover:text-text-main"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                  isActive ? "bg-slate-950/20 text-slate-950" : isDone ? "text-emerald-400" : "text-text-dim"
                )}>
                  {isDone && !isActive ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <Icon size={12} />
                  )}
                </div>
                <span>{stage.shortTitle}</span>
              </button>

              {idx < STAGES_CONFIG.length - 1 && (
                <ChevronRight size={10} className="text-text-dim/30 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
