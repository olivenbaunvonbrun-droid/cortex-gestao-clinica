import React, { useState } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Download, Trash2, Calendar, User, ChevronRight, CheckSquare, Square, ClipboardCheck } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { ATTENDANCE_TEMPLATES } from '../utils/templates';

interface HistoryViewProps {
  records: AttendanceRecord[];
  onView: (r: AttendanceRecord) => void;
  onDelete: (id: string) => void;
  onExport: (records: AttendanceRecord | AttendanceRecord[]) => void;
}

export function HistoryView({ records, onView, onDelete, onExport }: HistoryViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const handleBatchExport = () => {
    const selectedRecords = records.filter(r => selectedIds.includes(r.id));
    if (selectedRecords.length === 0) return;
    onExport(selectedRecords);
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-20 bg-bg-card rounded-[2rem] border border-border-subtle border-dashed">
        <div className="w-14 h-14 bg-bg-sidebar border border-border-subtle rounded-full flex items-center justify-center mx-auto mb-4 text-text-dim">
          <HistoryIcon size={24} />
        </div>
        <h3 className="text-xs font-black text-text-main uppercase tracking-widest">Nenhum registro encontrado</h3>
        <p className="text-text-dim text-[9px] mt-2 uppercase font-black tracking-wider">Anotações e triagens salvas aparecerão nesta seção.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid gap-6 max-w-5xl mx-auto text-text-main font-sans"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 mb-2 border-b border-border-subtle pb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-text-main">
            Histórico <span className="text-primary uppercase text-[8px] tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">Arquivado</span>
          </h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-wider mt-1">Evoluções e Anamneses registradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 bg-bg-sidebar hover:bg-bg-card border border-border-subtle rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 border-dashed"
          >
            {selectedIds.length === records.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
          
          <button
            onClick={handleBatchExport}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-primary disabled:bg-bg-sidebar disabled:border disabled:border-border-subtle disabled:text-text-dim/40 text-bg-deep rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/5"
          >
            <Download size={12} />
            Exportar em Lote ({selectedIds.length})
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((r, idx) => {
          const isSelected = selectedIds.includes(r.id);
          const template = ATTENDANCE_TEMPLATES.find(t => t.id === r.template);
          
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="group relative bg-bg-card p-6 rounded-[2rem] border border-border-subtle hover:border-primary/40 transition-all duration-300 flex flex-col justify-between gap-6 shadow-lg hover:shadow-primary/5"
            >
              {/* Checkbox selector */}
              <button
                onClick={() => handleToggleSelect(r.id)}
                className="absolute top-4 right-4 p-1 text-text-dim/60 hover:text-primary transition-colors cursor-pointer"
              >
                {isSelected ? (
                  <CheckSquare size={18} className="text-primary" />
                ) : (
                  <Square size={18} />
                )}
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-bg-sidebar border border-border-subtle flex items-center justify-center text-text-dim group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 shrink-0">
                  <User size={20} />
                </div>
                <div className="min-w-0 pr-6">
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                    {template?.name || r.template}
                  </span>
                  <h3 className="font-bold text-text-main group-hover:text-primary transition-colors truncate text-sm mt-2">
                    {r.patient.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[9px] text-text-dim font-black uppercase tracking-widest font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-primary" /> 
                      {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="bg-bg-sidebar border border-border-subtle px-2 py-0.5 rounded-md">{r.patient.age} ANOS</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onView(r)}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-bg-deep rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/5"
                >
                  Abrir Registro Clínico <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => onDelete(r.id)}
                  className="p-2.5 text-text-dim/40 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
                  title="Deletar Registro"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
