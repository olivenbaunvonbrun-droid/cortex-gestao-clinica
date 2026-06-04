import React, { useState } from 'react';
import { Calendar, Trash2, Eye, GitCompare, ChevronRight } from 'lucide-react';
import { RidEntry } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HistoryListProps {
  entries: RidEntry[];
  onDelete: (id: string) => void;
  onView: (entry: RidEntry) => void;
  onCompare: (entries: RidEntry[]) => void;
}

export function HistoryList({ entries, onDelete, onView, onCompare }: HistoryListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length !== 2) return;
    const toCompare = entries.filter(e => selectedIds.includes(e.id));
    onCompare(toCompare);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-bg-card/50 rounded-2xl border border-dashed border-border-subtle">
        <div className="bg-bg-deep w-12 h-12 rounded-xl border border-border-subtle flex items-center justify-center mx-auto mb-3 text-text-dim/40">
          <Calendar size={24} />
        </div>
        <h3 className="text-text-main font-black text-xs uppercase tracking-widest">Nenhum registro</h3>
        <p className="text-text-dim text-[11px] mt-1">Seus registros aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-bg-card border border-border-subtle p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-black text-text-main uppercase tracking-wider">Histórico de Sessões</h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-0.5">Gestão de {entries.length} Registros</p>
        </div>
        
        {selectedIds.length === 2 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleCompare}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <GitCompare size={14} />
            Comparar
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {entries.map((entry) => (
          <motion.div
            layout
            key={entry.id}
            className={cn(
              "group relative bg-bg-card p-4 rounded-xl border transition-all flex items-center gap-4 cursor-pointer",
              selectedIds.includes(entry.id) 
                ? "border-primary bg-bg-card ring-4 ring-primary/10" 
                : "border-border-subtle hover:border-text-dim/20 shadow-sm"
            )}
            onClick={() => toggleSelect(entry.id)}
          >
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded-lg border border-primary/20">
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-[10px] text-text-dim font-bold uppercase tracking-tighter truncate">
                  {entry.emocao.name} • {entry.emocao.intensity}%
                </span>
              </div>
              <h4 className="text-text-main text-xs font-semibold truncate leading-tight">{entry.situacao}</h4>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(entry);
                }}
                className="p-1.5 rounded hover:bg-white/5 text-text-dim hover:text-text-main transition-colors cursor-pointer"
                title="Visualizar"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry.id);
                }}
                className="p-1.5 rounded hover:bg-rose-500/10 text-text-dim hover:text-rose-400 transition-colors cursor-pointer"
                title="Apagar"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="absolute left-[-28px] top-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
               <input 
                type="checkbox" 
                checked={selectedIds.includes(entry.id)}
                onChange={() => toggleSelect(entry.id)}
                className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-bg-deep cursor-pointer border-border-subtle bg-bg-deep"
               />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
