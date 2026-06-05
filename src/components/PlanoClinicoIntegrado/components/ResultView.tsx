import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, FileText, User, Heart, Settings, ShieldAlert, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PciRecord } from '../types';

interface ResultViewProps {
  record: PciRecord;
  onBack: () => void;
  onExport: () => void;
}

export function ResultView({ record, onBack, onExport }: ResultViewProps) {
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
          <Download size={14} /> Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Metadata) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <User size={12} className="text-primary" /> Identificação
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Paciente', value: record.patient.name },
                { label: 'Idade', value: record.idade || 'N/D' },
                { label: 'Escolaridade', value: record.escolaridade || 'N/D' },
                { label: 'Estado Civil', value: record.estadoCivil || 'N/D' },
                { label: 'Data do Plano', value: new Date(record.createdAt).toLocaleDateString('pt-BR') },
                { label: 'Psicólogo(a)', value: record.patient.psychologistName },
                { label: 'CRP', value: record.patient.crp }
              ].map(item => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider">{item.label}</span>
                  <span className="font-bold text-text-main text-xs overflow-hidden text-ellipsis">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction Indicators */}
          <div className="bg-bg-card rounded-3xl p-6 border border-border-subtle shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-3">
              <Heart size={12} className="text-primary" /> Índice de Satisfação (IMF)
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Pessoal', value: record.satisfacaoPessoal },
                { label: 'Interpessoal', value: record.satisfacaoInterpessoal },
                { label: 'Ocupacional', value: record.satisfacaoOcupacional },
                { label: 'Material', value: record.satisfacaoMaterial },
                { label: 'Recreativa', value: record.satisfacaoRecreativa },
                { label: 'Existencial', value: record.satisfacaoExistencial }
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold uppercase text-text-dim/80">
                    <span>{item.label}</span>
                    <span className="font-black text-primary">{item.value || 0}%</span>
                  </div>
                  <div className="h-2 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${item.value || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Clinical Sections) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border-subtle shadow-xl space-y-8">
            <div className="border-b border-border-subtle pb-6 flex flex-col items-center text-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main mb-2 font-display">Plano Clínico Integrado (PCI)</h2>
              <p className="italic text-text-dim text-[11px] uppercase font-bold tracking-wider font-sans">Conceituação Cognitiva e Conduta Terapêutica</p>
            </div>

            {/* Anamnese */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <FileText size={12} /> 1. Queixa Principal & Contexto
              </h4>
              <div className="grid grid-cols-1 gap-4 bg-bg-sidebar/40 p-4 border border-border-subtle rounded-2xl">
                <div>
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Evento Precipitador & Queixas</span>
                  <p className="text-xs text-text-main/90 whitespace-pre-wrap leading-relaxed mt-1">{record.eventoQueixas || 'Não informado.'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle/50 pt-3">
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Família de Origem</span>
                    <p className="text-xs text-text-main/90 whitespace-pre-wrap leading-relaxed mt-1">{record.familiaOrigem || 'Não informado.'}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Rotina Diária</span>
                    <p className="text-xs text-text-main/90 whitespace-pre-wrap leading-relaxed mt-1">{record.rotina || 'Não informado.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Análise Funcional RID */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <ShieldAlert size={12} /> 2. Análise Funcional (RID)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-sidebar/40 p-4 border border-border-subtle rounded-2xl">
                <div>
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Situação (Contexto)</span>
                  <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.ridSituacao || 'N/D'}</p>
                </div>
                <div>
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Pensamento Automático</span>
                  <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.ridPensamento || 'N/D'}</p>
                </div>
                <div>
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Emoção (Intensidade: {record.ridEmocaoIntensidade || 0}%)</span>
                  <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.ridEmocao || 'N/D'}</p>
                </div>
                <div>
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Comportamento</span>
                  <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.ridComportamento || 'N/D'}</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-subtle/50 pt-3">
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Consequências (Curto Prazo)</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.ridConsequencias || 'N/D'}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Consequências (Longo Prazo)</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.ridConsequenciasLP || 'N/D'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deep Analysis */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Settings size={12} /> 3. Funcionamento Psicológico Profundo (TCC)
              </h4>
              <div className="grid grid-cols-1 gap-4 bg-bg-sidebar/40 p-5 border border-border-subtle rounded-2xl space-y-3">
                {record.necessidadesIdentificadas && (
                  <div className="border-b border-border-subtle/40 pb-3">
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Necessidades Identificadas (Cronicamente Insatisfeitas)</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.necessidadesIdentificadas}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Esquemas Cognitivos Disfuncionais</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.esquemasCognitivos || 'N/D'}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Crenças Centrais</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.crencasCentrais || 'N/D'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle/40 pt-3">
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Crenças Periféricas / Regras</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.crencasPerifericas || 'N/D'}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Excessos Comportamentais</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.excessosComp || 'N/D'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle/40 pt-3">
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Déficits em Habilidades</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.deficitsHab || 'N/D'}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-text-dim/60 uppercase">Histórico Formativo</span>
                    <p className="text-xs text-text-main/90 mt-1 leading-relaxed">{record.historicoFormativo || 'N/D'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnóstico & Conduta */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Award size={12} /> 4. Diagnóstico & Conduta Clínica
              </h4>
              <div className="grid grid-cols-1 gap-4 bg-bg-sidebar/40 p-4 border border-border-subtle rounded-2xl">
                <div>
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Diagnóstico Topográfico (DSM/CID)</span>
                  <p className="text-xs text-text-main/90 leading-relaxed mt-1">{record.diagTopo || 'Não informado.'}</p>
                </div>
                <div className="border-t border-border-subtle/50 pt-3">
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Diagnóstico Funcional (MDCF)</span>
                  <p className="text-xs text-text-main/90 leading-relaxed mt-1">{record.diagFunc || 'Não informado.'}</p>
                </div>
                <div className="border-t border-border-subtle/50 pt-3">
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Instrumentos de Avaliação / Psicometria</span>
                  <p className="text-xs text-text-main/90 leading-relaxed mt-1">{record.instrumentos || 'Não informado.'}</p>
                </div>
                <div className="border-t border-border-subtle/50 pt-3">
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Estratégia de Relacionamento Terapêutico</span>
                  <p className="text-xs text-text-main/90 leading-relaxed mt-1">{record.relacionamentoTerap || 'Não informado.'}</p>
                </div>
                <div className="border-t border-border-subtle/50 pt-3">
                  <span className="text-[8px] font-black text-text-dim/60 uppercase">Projeto Terapêutico & Intervenções</span>
                  <p className="text-xs text-text-main/90 leading-relaxed mt-1">{record.projetoTerap || 'Não informado.'}</p>
                </div>
              </div>
            </div>

            {/* AI Summary result box */}
            {record.aiAnalysis && (
              <div className="pt-8 border-t border-border-subtle space-y-6">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  <h3 className="text-xs font-black text-text-main uppercase tracking-widest">Conceituação & Insights de IA</h3>
                </div>
                <div className="prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-sm prose-h1:uppercase prose-h1:tracking-[0.15em] prose-h1:text-primary prose-p:text-text-main/90 prose-p:text-xs prose-p:leading-relaxed prose-strong:text-primary/95 font-serif text-justify text-xs leading-relaxed space-y-4">
                  <ReactMarkdown>{record.aiAnalysis}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Evolucao */}
            <div className="space-y-2 pt-6 border-t border-border-subtle/50">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Evolução Clínica</h4>
              <p className="text-xs text-text-main/90 leading-relaxed bg-bg-sidebar/40 p-4 border border-border-subtle rounded-2xl whitespace-pre-wrap">{record.evolucao || 'Nenhuma evolução registrada.'}</p>
            </div>

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
