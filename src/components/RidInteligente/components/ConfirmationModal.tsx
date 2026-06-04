import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning'
}: ConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="text-rose-400" />,
          bg: 'bg-rose-500/10 border border-rose-500/25',
          button: 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="text-primary" />,
          bg: 'bg-primary/10 border border-primary/20',
          button: 'bg-primary hover:bg-primary-hover text-bg-deep font-black cursor-pointer'
        };
      default:
        return {
          icon: <AlertTriangle className="text-amber-400" />,
          bg: 'bg-amber-500/10 border border-amber-500/20',
          button: 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-bg-card rounded-3xl p-6 max-w-md w-full shadow-2xl border border-border-subtle relative overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-text-dim hover:text-text-main transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl ${styles.bg} flex items-center justify-center shrink-0`}>
                {styles.icon}
              </div>
              <div className="pt-1">
                <h3 className="text-lg font-black text-text-main leading-tight mb-2 uppercase tracking-wide">{title}</h3>
                <p className="text-sm text-text-dim leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-bg-sidebar border border-border-subtle text-text-main rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/5 transition-all cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${styles.button}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
