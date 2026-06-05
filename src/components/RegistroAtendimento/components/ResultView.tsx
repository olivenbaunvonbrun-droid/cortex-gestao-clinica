import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, FileText, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AttendanceRecord } from '../types';
import { ATTENDANCE_TEMPLATES } from '../utils/templates';

interface ResultViewProps {
  record: AttendanceRecord;
  onBack: () => void;
  onExport: () => void;
}

export function ResultView({ record, onBack, onExport }: ResultViewProps) {
  const template = ATTENDANCE_TEMPLATES.find(t => t.id === record.template);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 max-w-5xl mx-auto p-1 text-text-main font-sans select-text"
    >
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-dim hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para Edição
        </button>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-bg-deep px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95 cursor-pointer"
        >
          <Download size={14} /> Exportar Relatório HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Identification info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={12} className="text-primary" /> Ficha do Atendimento
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Paciente', value: record.patient.name },
                { label: 'Idade', value: `${record.patient.age} anos` },
                { label: 'Modelo Utilizado', value: template?.name || record.template },
                { label: 'Data', value: new Date(record.createdAt).toLocaleDateString('pt-BR') },
              ].map(item => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider">{item.label}</span>
                  <span className="font-bold text-text-main text-xs overflow-hidden text-ellipsis">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Filled fields & AI Summary */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border-subtle shadow-xl space-y-8">
            <div className="border-b border-border-subtle pb-6 flex flex-col items-center text-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">Anotações Clínicas Estruturadas</h2>
              <p className="italic text-text-dim text-[11px] uppercase font-bold tracking-wider font-sans">Registro de Atendimento</p>
            </div>

            {/* Render fields */}
            <div className="space-y-6">
              {template?.fields.map(f => {
                const val = record.fields[f.id];
                if (!val) return null;
                return (
                  <div key={f.id} className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">{f.label}</h4>
                    <p className="text-xs text-text-main/90 leading-relaxed font-medium bg-bg-sidebar/40 p-4 border border-border-subtle rounded-2xl whitespace-pre-wrap">{val}</p>
                  </div>
                );
              })}
            </div>

            {/* Render AI summary if present */}
            {record.aiAnalysis && (
              <div className="pt-8 border-t border-border-subtle space-y-6">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-black text-text-main uppercase tracking-widest">Resumo Clínico Integrativo (IA)</h3>
                </div>
                <div className="prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-primary prose-p:text-text-main/90 prose-p:text-xs prose-p:leading-relaxed prose-strong:text-primary/95 font-serif text-justify text-xs leading-relaxed space-y-4">
                  <ReactMarkdown>{record.aiAnalysis}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Signature Block */}
            <div className="mt-16 pt-8 border-t border-border-subtle font-sans">
              <div className="flex flex-col items-center">
                {record.patient.signatureUrl && (
                  <img src={record.patient.signatureUrl} className="max-w-[200px] max-height-[80px] mb-[-15px] mix-blend-multiply" alt="Assinatura" />
                )}
                <div className="w-48 h-[1px] bg-border-subtle mb-3" />
                <p className="font-black text-text-main text-[10px] uppercase tracking-widest">{record.patient.psychologistName}</p>
                <p className="text-[9px] font-black text-text-dim uppercase tracking-wider">CRP: {record.patient.crp}</p>
                <div className="mt-8 text-[8px] text-text-dim/30 uppercase tracking-[0.25em] font-black">
                  Documento Gerado Digitalmente no Cortex
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
