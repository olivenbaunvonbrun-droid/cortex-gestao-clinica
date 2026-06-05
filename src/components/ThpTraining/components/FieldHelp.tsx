import React, { useState } from "react";
import { HelpCircle, ChevronUp, Info, CheckCircle2 } from "lucide-react";

interface FieldHelpProps {
  title: string;
  suggestion: string;
  explanation: string;
  example?: string;
  id?: string;
}

export default function FieldHelp({
  title,
  suggestion,
  explanation,
  example,
  id
}: FieldHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inline-block" id={id || `field-help-${Date.now()}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full font-mono text-[10px] font-bold select-none focus:outline-none transition-all duration-200 cursor-pointer border-0 ${
          isOpen
            ? "bg-primary text-bg-deep font-bold text-white shadow-xs scale-110"
            : "bg-slate-150 hover:bg-slate-250 text-text-dim hover:text-text-main"
        }`}
        title="Clique para sugestões e explicação de preenchimento"
      >
        ?
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-bg-card border border-primary/20 rounded-lg text-[11px] leading-relaxed text-text-main animate-slide-down space-y-2 max-w-md shadow-xs relative">
          <div className="flex items-center justify-between border-b border-primary/20 pb-1.5">
            <span className="font-bold text-text-main flex items-center gap-1 font-mono">
              <Info className="w-3.5 h-3.5 text-primary" />
              {title}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-text-dim hover:text-text-dim text-[10px] font-bold flex items-center gap-0.5 border-0 bg-transparent cursor-pointer"
            >
              Fechar <ChevronUp className="w-3 h-3" />
            </button>
          </div>

          <div>
            <span className="font-bold text-primary block uppercase font-mono text-[8px] tracking-wider mb-0.5">Sugestão de Preenchimento:</span>
            <p className="text-text-dim italic font-mono">{suggestion}</p>
          </div>

          <div>
            <span className="font-bold text-text-dim block uppercase font-mono text-[8px] tracking-wider mb-0.5">Fundamentação Clínica:</span>
            <p className="text-text-dim">{explanation}</p>
          </div>

          {example && (
            <div className="p-2 bg-primary/5 rounded border border-primary/20/50">
              <span className="font-bold text-text-dim block uppercase font-mono text-[8px] tracking-wider mb-0.5">Exemplo Prático:</span>
              <p className="text-[10px] text-text-main leading-normal font-mono font-medium">{example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
