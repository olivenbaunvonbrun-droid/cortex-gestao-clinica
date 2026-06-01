import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const bgs = {
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500'
  };

  const textColors = {
    danger: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-bg-deep/90 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-bg-card border border-border-subtle w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <div className="p-10 text-center">
            <div className={`w-20 h-20 rounded-[2rem] ${bgs[variant]}/10 flex items-center justify-center mx-auto mb-8 border border-${variant}-500/20 shadow-inner`}>
              <AlertTriangle size={36} className={`${textColors[variant]}`} />
            </div>
            
            <h3 className="text-2xl font-display font-bold text-text-main tracking-tight mb-4">{title}</h3>
            <p className="text-text-dim text-sm font-medium leading-relaxed uppercase tracking-widest opacity-60">
              {message}
            </p>
          </div>

          <div className="flex flex-col gap-3 p-10 pt-0">
            <button
              onClick={onConfirm}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-95 shadow-xl ${
                variant === 'danger' 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                  : 'bg-primary hover:bg-primary-hover text-bg-deep shadow-primary/20'
              }`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-dim hover:text-text-main hover:bg-bg-sidebar transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
