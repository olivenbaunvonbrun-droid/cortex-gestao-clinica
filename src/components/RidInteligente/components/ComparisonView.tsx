import React from 'react';
import { Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RidEntry, AppSettings } from '../types';
import { generateClinicalReportHTML } from '../lib/exportUtils';
import { Window } from '../../ui/Window';

interface ComparisonViewProps {
  entries: [RidEntry, RidEntry];
  onClose: () => void;
  isMinimized: boolean;
  isMaximized: boolean;
  snapState?: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;
  onSnapChange?: (snap: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null) => void;
  onMinimize: () => void;
  onMaximize: () => void;
  settings: AppSettings;
}

export function ComparisonView({ 
  entries, 
  onClose, 
  isMinimized, 
  isMaximized, 
  snapState = null, 
  onSnapChange, 
  onMinimize, 
  onMaximize, 
  settings 
}: ComparisonViewProps) {
  const handleExportHTML = (entry: RidEntry) => {
    if (!entry.analysis) return;
    
    const patientName = entry.patientName ? entry.patientName.replace(/\s+/g, '_') : 'Paciente';
    const dateFormatted = new Date(entry.date).toISOString().replace(/[:.]/g, '-').split('Z')[0];
    const fileName = `${patientName}_Protocolo_RID_${dateFormatted}.html`;

    const htmlContent = generateClinicalReportHTML(entry, settings);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    if (window.confirm('Relatório baixado! Deseja abrir em uma nova aba para impressão imediata?')) {
      const newWin = window.open();
      if (newWin) {
        newWin.document.write(htmlContent);
        newWin.document.close();
      }
    }
  };

  return (
    <Window
      title="Comparação Evolutiva de Registros"
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      snapState={snapState}
      onSnapChange={onSnapChange}
      zIndex={110}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onFocus={() => {}}
      defaultWidth={1200}
      defaultHeight={700}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-bg-card overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroller-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="flex flex-col gap-4">
                <div className="bg-bg-card p-5 rounded-2xl border border-border-subtle shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-black uppercase tracking-wider">
                      SESSÃO {idx === 0 ? 'ALFA' : 'BETA'}
                    </span>
                    <span className="text-[10px] font-bold text-text-dim uppercase">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-text-dim uppercase tracking-widest block">Gatilho</label>
                      <p className="text-text-main text-xs font-semibold leading-relaxed">{entry.situacao}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
                      <div>
                        <label className="text-[9px] font-black text-text-dim uppercase tracking-widest block">Intensidade</label>
                        <p className="text-primary font-black text-lg leading-tight">{entry.emocao.intensity}% <span className="text-[10px] text-text-dim uppercase ml-1">{entry.emocao.name}</span></p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-border-subtle">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-text-dim uppercase tracking-widest block">Necessidades</label>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(entry.necessidade) ? entry.necessidade : (entry.necessidade ? [entry.necessidade] : [])).map((n, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold uppercase border border-primary/20">{n}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-text-dim uppercase tracking-widest block">Esquemas</label>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(entry.esquema) ? entry.esquema : (entry.esquema ? [entry.esquema] : [])).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] font-bold uppercase border border-amber-500/20">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-text-dim uppercase tracking-widest block">Resposta</label>
                      <p className="text-text-main/90 text-xs italic bg-bg-deep p-2.5 rounded-lg border border-border-subtle leading-relaxed">{entry.comportamento}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-bg-card p-6 rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col min-h-[300px]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Análise IA
                    </h4>
                    <button 
                      onClick={() => handleExportHTML(entry)}
                      className="p-1 px-2 border border-border-subtle hover:bg-white/5 text-text-dim hover:text-primary rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      title="Exportar como Relatório Clínico"
                    >
                      <Printer size={12} />
                      <span className="text-[9px] font-bold uppercase">Exportar</span>
                    </button>
                  </div>
                  <div className="flex-1 prose prose-invert prose-sm max-w-none text-text-main/80 text-justify prose-p:leading-relaxed overflow-y-auto scroller-hide">
                    <ReactMarkdown>{entry.analysis || 'Análise não disponível para este registro.'}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}
