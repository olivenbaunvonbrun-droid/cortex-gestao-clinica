import React, { useState } from 'react';
import { DiferenciaisData, DifferentialItem } from '../types';
import { DIFFERENTIAL_CONDITIONS } from '../data/differentialData';
import { ShieldAlert, CheckCircle2, ArrowRight, AlertTriangle, Clock, Activity, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StageDifferentialViewProps {
  diferenciaisData?: DiferenciaisData;
  onUpdateDiferenciais: (data: DiferenciaisData) => void;
  onNextStage: () => void;
}

const DEFAULT_DIFERENCIAIS: DiferenciaisData = {
  items: DIFFERENTIAL_CONDITIONS.reduce((acc, curr) => ({
    ...acc,
    [curr.id]: { ...curr }
  }), {}),
  padraoTemporal: {
    inicioInfanciaConfirmado: true,
    flutuacaoConformeInteresse: true,
    independenteDeFaseHumor: true,
    impactoEmMultiplosContextos: true
  },
  condicoesFisicasInvestigadas: '',
  conclusaoDiferencial: ''
};

export default function StageDifferentialView({
  diferenciaisData,
  onUpdateDiferenciais,
  onNextStage
}: StageDifferentialViewProps) {
  const [data, setData] = useState<DiferenciaisData>(diferenciaisData || DEFAULT_DIFERENCIAIS);

  const updateItemStatus = (id: string, status: DifferentialItem['status']) => {
    setData(prev => {
      const updated: DiferenciaisData = {
        ...prev,
        items: {
          ...prev.items,
          [id]: {
            ...prev.items[id],
            status
          }
        },
        completedAt: new Date().toISOString()
      };
      onUpdateDiferenciais(updated);
      return updated;
    });
  };

  const updateItemNotes = (id: string, notes: string) => {
    setData(prev => {
      const updated: DiferenciaisData = {
        ...prev,
        items: {
          ...prev.items,
          [id]: {
            ...prev.items[id],
            notes
          }
        },
        completedAt: new Date().toISOString()
      };
      onUpdateDiferenciais(updated);
      return updated;
    });
  };

  const updateTemporal = (key: keyof DiferenciaisData['padraoTemporal'], val: boolean) => {
    setData(prev => {
      const updated: DiferenciaisData = {
        ...prev,
        padraoTemporal: {
          ...prev.padraoTemporal,
          [key]: val
        },
        completedAt: new Date().toISOString()
      };
      onUpdateDiferenciais(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 7 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              Diagnósticos Diferenciais & Comorbidades
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <ShieldAlert className="text-amber-400" size={18} /> Matriz Diferencial & Análise de Linha do Tempo (DSM-5-TR)
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            Déficits atencionais e inquietação são sintomas transversais em saúde mental. 
            Superamos a oposição simplista ('oscila = humor; linear = TDAH'), pois o TDAH <strong>varia conforme interesse, novidade e estrutura ambiental</strong>.
            Construa a linha do tempo e investigue se as dificuldades atencionais persistem fora de episódios afetivos.
          </p>
        </div>
      </div>

      {/* Linha do Tempo & Padrão Temporal */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Clock size={14} /> Padrão Temporal & Características de Funcionamento do TDAH
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={cn(
            "p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all",
            data.padraoTemporal.inicioInfanciaConfirmado
              ? "bg-emerald-500/10 border-emerald-500/30 text-text-main"
              : "bg-white/[0.02] border-white/[0.06] text-text-dim"
          )}>
            <input
              type="checkbox"
              checked={data.padraoTemporal.inicioInfanciaConfirmado}
              onChange={(e) => updateTemporal('inicioInfanciaConfirmado', e.target.checked)}
              className="mt-0.5 text-emerald-500 rounded focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold block">Início Precoce na Infância</span>
              <span className="text-[10px] opacity-75">Manifestações presentes antes dos 12 anos, diferenciando de quadros iniciados na vida adulta.</span>
            </div>
          </label>

          <label className={cn(
            "p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all",
            data.padraoTemporal.flutuacaoConformeInteresse
              ? "bg-amber-500/10 border-amber-500/30 text-text-main"
              : "bg-white/[0.02] border-white/[0.06] text-text-dim"
          )}>
            <input
              type="checkbox"
              checked={data.padraoTemporal.flutuacaoConformeInteresse}
              onChange={(e) => updateTemporal('flutuacaoConformeInteresse', e.target.checked)}
              className="mt-0.5 text-amber-500 rounded focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold block">Flutuação por Interesse / Hiperfoco</span>
              <span className="text-[10px] opacity-75">Capacidade de foco sustentado quando a tarefa é estimulante ou sob pressão imediata (típico de TDAH).</span>
            </div>
          </label>

          <label className={cn(
            "p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all",
            data.padraoTemporal.independenteDeFaseHumor
              ? "bg-emerald-500/10 border-emerald-500/30 text-text-main"
              : "bg-white/[0.02] border-white/[0.06] text-text-dim"
          )}>
            <input
              type="checkbox"
              checked={data.padraoTemporal.independenteDeFaseHumor}
              onChange={(e) => updateTemporal('independenteDeFaseHumor', e.target.checked)}
              className="mt-0.5 text-emerald-500 rounded focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold block">Persistência Fora de Crises de Humor</span>
              <span className="text-[10px] opacity-75">As queixas de desatenção e procrastinação ocorrem mesmo quando o paciente está em eutimia (sem depressão ativa).</span>
            </div>
          </label>

          <label className={cn(
            "p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all",
            data.padraoTemporal.impactoEmMultiplosContextos
              ? "bg-emerald-500/10 border-emerald-500/30 text-text-main"
              : "bg-white/[0.02] border-white/[0.06] text-text-dim"
          )}>
            <input
              type="checkbox"
              checked={data.padraoTemporal.impactoEmMultiplosContextos}
              onChange={(e) => updateTemporal('impactoEmMultiplosContextos', e.target.checked)}
              className="mt-0.5 text-emerald-500 rounded focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold block">Pervasividade em Múltiplos Ambientes</span>
              <span className="text-[10px] opacity-75">Não está restrito a uma única fonte estressora (ex: chefe abusivo), atingindo trabalho, casa e relações.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Condições Clínicas Investigadas */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-text-dim px-1">
          Investigação Sistemática de Hipóteses Concorrentes ou Comórbidas
        </h4>

        <div className="space-y-3">
          {Object.values(data.items).map((cond) => (
            <div 
              key={cond.id}
              className="p-4 rounded-2xl bg-bg-sidebar/40 border border-border-subtle hover:border-border-subtle/80 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-text-main">
                    {cond.title}
                  </h5>
                  <p className="text-[11px] text-text-dim leading-snug">
                    {cond.description}
                  </p>
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {[
                    { val: 'descartado', label: 'Descartado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
                    { val: 'comorbidade_provavel', label: 'Comorbidade', color: 'bg-purple-500/10 text-purple-400 border-purple-500/25' },
                    { val: 'investigacao_adicional_necessaria', label: 'Investigar +', color: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
                    { val: 'nao_avaliado', label: 'Não Avaliado', color: 'bg-white/5 text-text-dim border-white/10' },
                  ].map(st => (
                    <button
                      key={st.val}
                      onClick={() => updateItemStatus(cond.id, st.val as any)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer",
                        cond.status === st.val 
                          ? `${st.color} font-black shadow-sm ring-1 ring-white/10` 
                          : "bg-white/[0.02] text-text-dim/60 border-white/[0.05] hover:bg-white/[0.04]"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Raciocínio Diferencial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.05] text-[11px]">
                <div>
                  <strong className="text-text-dim block text-[9px] uppercase tracking-wider mb-0.5">Sobreposição de Sintomas:</strong>
                  <p className="text-text-main/80">{cond.symptomOverlap}</p>
                </div>
                <div>
                  <strong className="text-amber-400 block text-[9px] uppercase tracking-wider mb-0.5">Critério Distintivo Clínico:</strong>
                  <p className="text-text-main/80">{cond.distinguishingFeatures}</p>
                </div>
              </div>

              {/* Notas do Psicólogo */}
              <div>
                <input
                  type="text"
                  value={cond.notes}
                  onChange={(e) => updateItemNotes(cond.id, e.target.value)}
                  placeholder="Anotações clínicas sobre esta hipótese (ex: Sintomas ansiosos secundários ao medo de errar decorrente do TDAH)..."
                  className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navegação Inferior */}
      <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Diferenciais mapeados
        </span>

        <button
          onClick={onNextStage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          Próximo: Síntese Diagnóstica & Laudo CFP <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
