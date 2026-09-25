import React from 'react';
import { 
  TdahEcosystemAssessment, 
  EvaluationStage 
} from '../types';
import { evaluateDsm5Criteria } from '../lib/scoring';
import { 
  Zap, 
  BookOpen, 
  Brain, 
  Briefcase, 
  Layers, 
  Users, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Printer,
  Save
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { STAGES_CONFIG } from './TdahStageStepper';

interface StageOverviewViewProps {
  assessment: TdahEcosystemAssessment;
  onNavigateStage: (stage: EvaluationStage) => void;
  onSaveToProntuario: () => void;
  onPrintLaudo: () => void;
  isSaving?: boolean;
}

export default function StageOverviewView({
  assessment,
  onNavigateStage,
  onSaveToProntuario,
  onPrintLaudo,
  isSaving = false
}: StageOverviewViewProps) {
  const dsm5 = evaluateDsm5Criteria(assessment);
  const p = assessment.patientInfo;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Clínico & Princípio Deontológico CFP */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Info size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
              Diretriz Clínica Fundamental: O Diagnóstico de TDAH em Adultos é Estritamente Clínico
            </h4>
            <p className="text-xs text-text-main/80 leading-relaxed max-w-4xl">
              Nenhum teste isolado (como a ASRS-18) confirma o diagnóstico. A avaliação no adulto exige triangulação estruturada: 
              <strong> investigação retrospectiva da infância (&lt;12 anos)</strong>, 
              <strong> quantificação de sintomas atuais (ETDAH-AD)</strong>, 
              <strong> comprovação de prejuízo funcional em múltiplos contextos (EPF-TDAH)</strong>, 
              <strong> mapeamento das funções executivas no cotidiano (BDEFS)</strong> e 
              <strong> exclusão rigorosa de diagnósticos diferenciais</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={onSaveToProntuario}
            disabled={isSaving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? 'Salvando...' : 'Salvar no Prontuário'}
          </button>
          <button
            onClick={onPrintLaudo}
            className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 text-text-main border border-white/10 rounded-xl transition-all cursor-pointer"
            title="Imprimir / Exportar Laudo CFP"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Monitor de Atendimento aos Critérios Diagnósticos (DSM-5-TR) */}
      <div className="bg-bg-sidebar/50 border border-border-subtle rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-3 gap-2">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Padrão Ouro Internacional</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-text-main">
              Termômetro de Critérios DSM-5-TR para TDAH em Adultos
            </h3>
          </div>
          <span className={cn(
            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
            dsm5.conclusaoGlobal === 'Critérios Plenamente Atendidos' 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : dsm5.conclusaoGlobal === 'Critérios Parcialmente Atendidos (Necessita Aprofundamento)'
              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
              : "bg-white/5 text-text-dim border-white/10"
          )}>
            {dsm5.conclusaoGlobal}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Critério A */}
          <div className={cn(
            "p-3.5 rounded-2xl border transition-all space-y-1.5",
            dsm5.criterioA_Sintomas.atendido ? "bg-emerald-500/[0.04] border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06]"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Critério A</span>
              <span className={dsm5.criterioA_Sintomas.atendido ? "text-emerald-400 font-bold" : "text-text-dim"}>
                {dsm5.criterioA_Sintomas.atendido ? "✓ Atendido" : "○ Pendente"}
              </span>
            </div>
            <h5 className="text-xs font-bold text-text-main">≥ 5 Sintomas Nucleares</h5>
            <p className="text-[10px] text-text-dim leading-snug">
              {dsm5.criterioA_Sintomas.detalhes}
            </p>
          </div>

          {/* Critério B */}
          <div className={cn(
            "p-3.5 rounded-2xl border transition-all space-y-1.5",
            dsm5.criterioB_InicioInfancia.atendido ? "bg-emerald-500/[0.04] border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06]"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Critério B</span>
              <span className={dsm5.criterioB_InicioInfancia.atendido ? "text-emerald-400 font-bold" : "text-text-dim"}>
                {dsm5.criterioB_InicioInfancia.atendido ? "✓ Atendido" : "○ Pendente"}
              </span>
            </div>
            <h5 className="text-xs font-bold text-text-main">Início antes dos 12 anos</h5>
            <p className="text-[10px] text-text-dim leading-snug">
              {dsm5.criterioB_InicioInfancia.evidencia}
            </p>
          </div>

          {/* Critério C */}
          <div className={cn(
            "p-3.5 rounded-2xl border transition-all space-y-1.5",
            dsm5.criterioC_MultiplosContextos.atendido ? "bg-emerald-500/[0.04] border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06]"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Critério C</span>
              <span className={dsm5.criterioC_MultiplosContextos.atendido ? "text-emerald-400 font-bold" : "text-text-dim"}>
                {dsm5.criterioC_MultiplosContextos.atendido ? "✓ Atendido" : "○ Pendente"}
              </span>
            </div>
            <h5 className="text-xs font-bold text-text-main">Dois ou Mais Contextos</h5>
            <p className="text-[10px] text-text-dim leading-snug">
              {dsm5.criterioC_MultiplosContextos.detalhes}
            </p>
          </div>

          {/* Critério D */}
          <div className={cn(
            "p-3.5 rounded-2xl border transition-all space-y-1.5",
            dsm5.criterioD_PrejuizoFuncional.atendido ? "bg-emerald-500/[0.04] border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06]"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Critério D</span>
              <span className={dsm5.criterioD_PrejuizoFuncional.atendido ? "text-emerald-400 font-bold" : "text-text-dim"}>
                {dsm5.criterioD_PrejuizoFuncional.atendido ? "✓ Atendido" : "○ Pendente"}
              </span>
            </div>
            <h5 className="text-xs font-bold text-text-main">Prejuízo Funcional Claro</h5>
            <p className="text-[10px] text-text-dim leading-snug">
              {dsm5.criterioD_PrejuizoFuncional.detalhes}
            </p>
          </div>

          {/* Critério E */}
          <div className={cn(
            "p-3.5 rounded-2xl border transition-all space-y-1.5",
            dsm5.criterioE_Diferencial.atendido ? "bg-emerald-500/[0.04] border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06]"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-dim">Critério E</span>
              <span className={dsm5.criterioE_Diferencial.atendido ? "text-emerald-400 font-bold" : "text-text-dim"}>
                {dsm5.criterioE_Diferencial.atendido ? "✓ Atendido" : "○ Pendente"}
              </span>
            </div>
            <h5 className="text-xs font-bold text-text-main">Exclusão Diferencial</h5>
            <p className="text-[10px] text-text-dim leading-snug">
              {dsm5.criterioE_Diferencial.detalhes}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Ferramentas e Recursos em Ordem do Processo Clínico */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-text-dim mb-3 flex items-center gap-2">
          <span>Roteiro de Etapas da Avaliação Especializada</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES_CONFIG.filter(s => s.id !== 'overview').map((stage) => {
            const Icon = stage.icon;
            const status = assessment.stageStatuses[stage.id] || 'pending';
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in_progress';

            let stageDescription = '';
            let metaBadge = '';

            switch (stage.id) {
              case 'asrs18':
                stageDescription = 'Escala de rastreio inicial da OMS para checagem rápida de queixas atuais.';
                metaBadge = assessment.asrsData ? (assessment.asrsData.thresholdMetA ? 'Triagem Positiva' : 'Negativo') : 'Não iniciada';
                break;
              case 'anamnese':
                stageDescription = 'Resgate histórico da infância (<12 anos), marcos, boletins e histórico familiar.';
                metaBadge = assessment.anamneseData?.marcosDesenvolvimento?.idadeAndar ? 'Preenchida' : 'Pendente';
                break;
              case 'etdah':
                stageDescription = 'Escala normatizada (69 itens) avaliando 5 fatores de sintomas e intensidade.';
                metaBadge = assessment.etdahData ? `${assessment.etdahData.totalScore} pts` : 'Pendente';
                break;
              case 'epf':
                stageDescription = 'Mapeamento do impacto real e prejuízos em 9 domínios da vida adulta.';
                metaBadge = assessment.epfData ? `${assessment.epfData.affectedDomainsCount} contextos` : 'Pendente';
                break;
              case 'bdefs':
                stageDescription = 'Escala de disfunção executiva no cotidiano e Índice FE-TDAH de Barkley.';
                metaBadge = assessment.bdefsData ? `FE: ${assessment.bdefsData.adhdEfIndexScore} pts` : 'Pendente';
                break;
              case 'heterorrelato':
                stageDescription = 'Entrevista com cônjuge, pais ou irmãos para validação externa.';
                metaBadge = assessment.heterorrelatoData ? assessment.heterorrelatoData.grauParentesco : 'Opcional/Pendente';
                break;
              case 'diferenciais':
                stageDescription = 'Matriz de diferenciais (Ansiedade, Depressão, Burnout, Sono, Bipolaridade).';
                metaBadge = assessment.diferenciaisData ? 'Mapeados' : 'Pendente';
                break;
              case 'laudo':
                stageDescription = 'Síntese conclusiva, laudo psicológico CFP 06/2019 e encaminhamentos.';
                metaBadge = assessment.laudoData ? 'Minuta Pronta' : 'Aguardando etapas';
                break;
            }

            return (
              <div 
                key={stage.id}
                onClick={() => onNavigateStage(stage.id)}
                className={cn(
                  "p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.01]",
                  isCompleted 
                    ? "bg-emerald-500/[0.03] border-emerald-500/25 hover:border-emerald-500/50" 
                    : isInProgress
                    ? "bg-amber-500/[0.04] border-amber-500/30 hover:border-amber-500/50"
                    : "bg-bg-sidebar/40 border-border-subtle hover:border-primary/30"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border",
                      isCompleted 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                        : "bg-white/[0.03] text-amber-400 border-white/[0.08]"
                    )}>
                      <Icon size={18} />
                    </div>

                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border",
                      isCompleted 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : isInProgress
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : "bg-white/5 text-text-dim border-white/10"
                    )}>
                      {isCompleted ? 'Concluído' : isInProgress ? 'Em Aberto' : 'Não Iniciado'}
                    </span>
                  </div>

                  <h5 className="text-xs font-black uppercase tracking-wider text-text-main group-hover:text-amber-400 transition-colors">
                    {stage.label}
                  </h5>

                  <p className="text-[11px] text-text-dim leading-relaxed mt-1 mb-4">
                    {stageDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-[9px] font-mono text-text-dim/80">{metaBadge}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isCompleted ? 'Revisar' : 'Acessar'} <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
