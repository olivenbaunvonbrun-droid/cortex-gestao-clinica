import React from 'react';
import { Assessment } from '../types';
import { calculateTdahAssessment } from '../lib/scoring';
import { FileText, Trash2, Download, Eye, Calendar, User, Zap, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface HistoryViewProps {
  assessments: Assessment[];
  onSelect: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
  onExport: (assessment: Assessment) => void;
}

export function HistoryView({ assessments, onSelect, onDelete, onExport }: HistoryViewProps) {
  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-text-dim border border-border-subtle/50 rounded-3xl bg-bg-card/40 my-8">
        <FileText size={42} className="mb-3 opacity-30 text-amber-400" />
        <h3 className="text-sm font-bold text-text-main">Nenhuma avaliação encontrada</h3>
        <p className="text-xs text-text-dim/80 max-w-sm mt-1">
          Nenhum teste de TDAH (ASRS-18) foi registrado para este paciente ainda. Responda o questionário na aba "Avaliação" para salvar o primeiro laudo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-2">
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">
          Histórico de Aplicações ({assessments.length})
        </span>
      </div>

      <div className="grid gap-3">
        {assessments.map((a) => {
          const result = calculateTdahAssessment(a.answers);
          const date = new Date(a.createdAt).toLocaleDateString('pt-BR');
          const time = new Date(a.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          const getRiskBadge = (risk: string) => {
            if (risk === 'Alta Probabilidade') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            if (risk === 'Moderada') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          };

          return (
            <div 
              key={`tdah-hist-${a.id}`}
              className="bg-bg-card hover:bg-bg-sidebar/80 border border-border-subtle rounded-2xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-text-main truncate">
                      {a.patient.name}
                    </h4>
                    <span className={cn("px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border", getRiskBadge(result.riskLevel))}>
                      {result.riskLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                    {result.classification}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-text-dim mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {date} às {time}
                    </span>
                    <span>•</span>
                    <span>Total: {result.totalScore}/54 pts ({result.totalSignificantSymptoms} sintomas)</span>
                    <span>•</span>
                    <span>Parte A: {result.partA.rawScore} pts | Parte B: {result.partB.rawScore} pts</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => onSelect(a)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  title="Abrir laudo completo"
                >
                  <Eye size={12} /> Ver Resultado
                </button>
                <button
                  onClick={() => onExport(a)}
                  className="p-2 text-text-dim hover:text-primary hover:bg-bg-sidebar rounded-xl border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                  title="Exportar HTML/PDF"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="p-2 text-text-dim hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                  title="Excluir avaliação"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
