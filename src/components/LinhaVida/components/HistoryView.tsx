import React from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Trash2, Calendar, User, ChevronRight } from 'lucide-react';
import { Assessment } from '../types';

interface HistoryViewProps {
  assessments: Assessment[];
  onView: (a: Assessment) => void;
  onDelete: (id: string) => void;
}

export function HistoryView({ assessments, onView, onDelete }: HistoryViewProps) {
  if (assessments.length === 0) {
    return (
      <div className="text-center py-20 bg-bg-card rounded-[2rem] border border-border-subtle border-dashed">
        <div className="w-14 h-14 bg-bg-sidebar border border-border-subtle rounded-full flex items-center justify-center mx-auto mb-4 text-text-dim">
          <HistoryIcon size={24} />
        </div>
        <h3 className="text-xs font-black text-text-main uppercase tracking-widest">Nenhuma linha da vida encontrada</h3>
        <p className="text-text-dim text-[9px] mt-2 uppercase font-black tracking-wider">Os registros e laudos finalizados aparecerão nesta seção.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid gap-6 max-w-5xl mx-auto text-text-main font-sans"
    >
      <div className="flex items-center justify-between px-2 mb-2 border-b border-border-subtle pb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-text-main">
            Histórico <span className="text-[#10b981] uppercase text-[8px] tracking-widest bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-0.5 rounded-lg">Arquivado</span>
          </h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-wider mt-1">Gestão de mapeamentos e laudos emitidos</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-text-dim uppercase tracking-widest block">Total de Registros</span>
          <span className="text-2xl font-black text-[#10b981]">{assessments.length}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((a, idx) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="group relative bg-bg-card p-6 rounded-[2rem] border border-border-subtle hover:border-[#10b981]/40 transition-all duration-300 flex flex-col justify-between gap-6 shadow-lg hover:shadow-[#10b981]/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-bg-sidebar border border-border-subtle flex items-center justify-center text-text-dim group-hover:bg-[#10b981]/10 group-hover:text-[#10b981] group-hover:border-[#10b981]/20 transition-all duration-300 shrink-0">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-text-main group-hover:text-[#10b981] transition-colors truncate text-sm">
                  {a.patient.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[9px] text-text-dim font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#10b981]" /> 
                    {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="bg-bg-sidebar border border-border-subtle px-2 py-0.5 rounded-md">{a.patient.age} ANOS</span>
                  <span className="bg-bg-sidebar border border-border-subtle px-2 py-0.5 rounded-md text-emerald-400">{a.events.length} EVENTOS</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onView(a)}
                className="flex-1 px-4 py-2.5 bg-[#10b981] hover:bg-[#0ea5e9] text-bg-deep rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#10b981]/5"
              >
                Abrir Mapeamento <ChevronRight size={14} />
              </button>
              <button 
                onClick={() => onDelete(a.id)}
                className="p-2.5 text-text-dim/40 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
                title="Deletar Registro"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
