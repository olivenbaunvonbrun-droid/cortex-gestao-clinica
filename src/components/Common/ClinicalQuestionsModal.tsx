import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Copy, Check, CornerDownLeft, X, Sparkles, MessageSquareQuote } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface QuestionItem {
  question: string;
  clinicalObjective: string;
}

interface ClinicalQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldLabel: string;
  toolName?: string;
  questions: QuestionItem[];
  onInsertQuestion?: (questionText: string) => void;
}

export function ClinicalQuestionsModal({
  isOpen,
  onClose,
  fieldLabel,
  toolName = "Cortex",
  questions,
  onInsertQuestion
}: ClinicalQuestionsModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (qText: string, index: number) => {
    navigator.clipboard.writeText(qText);
    setCopiedIndex(index);
    toast.success("Pergunta copiada para a área de transferência!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsert = (qText: string) => {
    if (onInsertQuestion) {
      onInsertQuestion(qText);
      toast.success("Pergunta inserida no campo!");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-bg-card border border-primary/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-primary/10 via-bg-card to-transparent border-b border-border-subtle flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-inner">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    TCC 4ª Geração • Inquérito Socrático
                  </span>
                  <span className="text-[10px] font-bold text-text-dim">{toolName}</span>
                </div>
                <h3 className="text-base font-black text-text-main mt-0.5 flex items-center gap-1.5">
                  Perguntas para Investigar: <span className="text-primary">{fieldLabel}</span>
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-dim hover:text-text-main hover:bg-bg-sidebar transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subtitle / Tip */}
          <div className="px-6 py-2.5 bg-bg-deep/60 border-b border-border-subtle/50 text-xs text-text-dim flex items-center gap-2">
            <MessageSquareQuote size={14} className="text-primary shrink-0" />
            <span>
              Perguntas experienciais formuladas para o psicólogo fazer diretamente ao paciente durante a sessão.
            </span>
          </div>

          {/* Questions List */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {questions.length === 0 ? (
              <div className="text-center py-10 text-text-dim text-xs">
                Nenhuma pergunta gerada. Verifique se o relato inicial possui conteúdo suficiente.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-bg-deep/80 hover:bg-bg-deep border border-border-subtle hover:border-primary/40 rounded-2xl transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-primary/30">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-text-main leading-relaxed select-text">
                        "{q.question}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border-subtle/40">
                    <div className="text-[10px] font-bold text-primary/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      <span className="uppercase tracking-wider">Foco Clínico:</span>
                      <span className="text-text-dim font-normal">{q.clinicalObjective}</span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(q.question, idx)}
                        className="px-3 py-1.5 rounded-xl bg-bg-sidebar hover:bg-bg-card border border-border-subtle text-text-main hover:text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check size={12} className="text-emerald-400" /> Copiada
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copiar
                          </>
                        )}
                      </button>

                      {onInsertQuestion && (
                        <button
                          type="button"
                          onClick={() => handleInsert(q.question)}
                          className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CornerDownLeft size={12} /> Inserir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-bg-card border-t border-border-subtle flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-bg-sidebar hover:bg-bg-deep border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
