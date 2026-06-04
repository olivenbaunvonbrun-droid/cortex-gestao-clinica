import React from 'react';
import { X, BookOpen, ChevronRight, Info } from 'lucide-react';
import { SCHEMAS_DATA, NEEDS_DATA, COPING_STYLES } from '../constants';

interface ClinicalLibraryProps {
  onClose: () => void;
}

export function ClinicalLibrary({ onClose }: ClinicalLibraryProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-bg-card border border-border-subtle w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-6 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl text-primary border border-primary/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-text-main uppercase tracking-wider">Biblioteca Clínica</h2>
              <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-0.5">Referência Técnica TCC / Esquema</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-text-dim hover:text-text-main"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 scroller-hide">
          {/* SCHEMAS */}
          <section>
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="h-1 w-4 bg-primary rounded-full"></div>
              18 Esquemas Iniciais Desadaptativos
            </h3>
            <div className="space-y-8">
              {SCHEMAS_DATA.map((domain, dIdx) => (
                <div key={dIdx} className="space-y-4">
                  <div className="bg-bg-deep p-4 rounded-2xl border border-border-subtle">
                    <h4 className="text-sm font-black text-text-main uppercase tracking-wide">{domain.domain}</h4>
                    <p className="text-[11px] text-text-dim mt-1">{domain.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                    {domain.schemas.map((schema, sIdx) => (
                      <div key={sIdx} className="p-3 bg-bg-deep/50 border border-border-subtle rounded-xl hover:border-primary/45 transition-colors group">
                        <div className="flex items-center gap-2 mb-1">
                          <ChevronRight size={14} className="text-primary" />
                          <span className="text-xs font-black text-text-main uppercase tracking-wider">{schema.name}</span>
                        </div>
                        <p className="text-[11px] text-text-dim leading-relaxed">{schema.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COPING */}
          <section>
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="h-1 w-4 bg-amber-400 rounded-full"></div>
              Estilos de Enfrentamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COPING_STYLES.map((style, idx) => (
                <div key={idx} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <span className="text-xs font-black text-amber-400 uppercase block mb-2">{style.name}</span>
                  <p className="text-[11px] text-text-dim leading-relaxed">{style.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* NEEDS */}
          <section>
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="h-1 w-4 bg-emerald-400 rounded-full"></div>
              Parâmetros de Necessidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {NEEDS_DATA.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-xs font-black text-text-dim uppercase tracking-wider">{cat.category}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.needs.map((need, nIdx) => (
                      <span key={nIdx} className="text-[10px] font-bold text-text-main bg-bg-deep border border-border-subtle px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="p-6 bg-bg-deep border-t border-border-subtle flex items-center gap-3">
          <Info size={16} className="text-text-dim shrink-0" />
          <p className="text-[10px] text-text-dim font-medium leading-relaxed">
            Esta biblioteca baseia-se no modelo original de Jeffrey Young e nos Parâmetros Clínicos de TCC. 
            Use estas informações para refinar seus registros e facilitar a análise da IA.
          </p>
        </footer>
      </div>
    </div>
  );
}
