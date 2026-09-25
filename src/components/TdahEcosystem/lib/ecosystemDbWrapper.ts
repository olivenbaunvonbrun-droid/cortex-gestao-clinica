import { db } from '../../../lib/db';
import { syncService } from '../../../lib/syncService';
import { TdahEcosystemAssessment } from '../types';
import { evaluateDsm5Criteria } from './scoring';

export function formatTdahEcosystemToHtml(assessment: TdahEcosystemAssessment): string {
  const dsm5 = evaluateDsm5Criteria(assessment);
  const etdah = assessment.etdahData;
  const epf = assessment.epfData;
  const bdefs = assessment.bdefsData;
  const asrs = assessment.asrsData;

  return `
    <div class="tdah-ecosystem-rendered p-6 bg-gradient-to-br from-amber-500/[0.04] to-indigo-500/[0.02] border border-amber-500/20 rounded-3xl space-y-5">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
            TDAH
          </div>
          <div>
            <h4 class="text-sm font-black uppercase tracking-wider text-amber-400">Ecossistema de Avaliação de TDAH em Adultos</h4>
            <p class="text-[10px] text-text-dim font-medium uppercase tracking-widest">
              Protocolo Multidimensional CFP / SATEPSI / DSM-5-TR
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            ${dsm5.conclusaoGlobal}
          </span>
          <span class="text-[10px] font-mono opacity-60">${new Date(assessment.updatedAt || assessment.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <!-- Resumo dos Instrumentos Aplicados -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <span class="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">1. Triagem (ASRS-18)</span>
          <span class="text-xs font-bold text-text-main">${asrs ? `${asrs.partASignificant} Desat. / ${asrs.partBSignificant} Hiper.` : 'Pendente'}</span>
          <span class="text-[9px] block opacity-60 mt-0.5">${asrs ? (asrs.thresholdMetA ? 'Positivo (Investigar)' : 'Negativo') : '-'}</span>
        </div>
        
        <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <span class="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">2. Sintomas (ETDAH-AD)</span>
          <span class="text-xs font-bold text-text-main">${etdah ? `${etdah.totalScore}/${etdah.maxTotalScore} pts` : 'Pendente'}</span>
          <span class="text-[9px] block opacity-60 mt-0.5">${etdah ? etdah.overallClassification : '-'}</span>
        </div>

        <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <span class="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">3. Prejuízo (EPF-TDAH)</span>
          <span class="text-xs font-bold text-text-main">${epf ? `${epf.affectedDomainsCount} contextos afetados` : 'Pendente'}</span>
          <span class="text-[9px] block opacity-60 mt-0.5">${epf ? `Nível ${epf.overallLevel}` : '-'}</span>
        </div>

        <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <span class="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">4. Executivo (BDEFS)</span>
          <span class="text-xs font-bold text-text-main">${bdefs ? `Índice FE: ${bdefs.adhdEfIndexScore} pts` : 'Pendente'}</span>
          <span class="text-[9px] block opacity-60 mt-0.5">${bdefs ? bdefs.adhdEfIndexRisk : '-'}</span>
        </div>
      </div>

      <!-- Alinhamento com Critérios DSM-5-TR -->
      <div class="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.06] space-y-2">
        <h5 class="text-[10px] font-black uppercase tracking-wider text-amber-400">Verificação de Critérios Diagnósticos (DSM-5-TR):</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-xs ${dsm5.criterioA_Sintomas.atendido ? 'text-emerald-400' : 'text-amber-400'} font-bold">
              ${dsm5.criterioA_Sintomas.atendido ? '✓' : '○'}
            </span>
            <span>Critério A (≥5 sintomas adultos): <strong>${dsm5.criterioA_Sintomas.detalhes}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs ${dsm5.criterioB_InicioInfancia.atendido ? 'text-emerald-400' : 'text-amber-400'} font-bold">
              ${dsm5.criterioB_InicioInfancia.atendido ? '✓' : '○'}
            </span>
            <span>Critério B (<12 anos): <strong>${dsm5.criterioB_InicioInfancia.evidencia}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs ${dsm5.criterioC_MultiplosContextos.atendido ? 'text-emerald-400' : 'text-amber-400'} font-bold">
              ${dsm5.criterioC_MultiplosContextos.atendido ? '✓' : '○'}
            </span>
            <span>Critério C (≥2 contextos): <strong>${dsm5.criterioC_MultiplosContextos.detalhes}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs ${dsm5.criterioD_PrejuizoFuncional.atendido ? 'text-emerald-400' : 'text-amber-400'} font-bold">
              ${dsm5.criterioD_PrejuizoFuncional.atendido ? '✓' : '○'}
            </span>
            <span>Critério D (Prejuízo claro): <strong>${dsm5.criterioD_PrejuizoFuncional.detalhes}</strong></span>
          </div>
        </div>
      </div>

      <!-- Apresentação Sugerida e Conclusão -->
      <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-text-main flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span class="text-[9px] font-black uppercase tracking-wider text-amber-300 block">Apresentação Clínica Sugerida</span>
          <span class="text-sm font-extrabold text-amber-300">TDAH - Apresentação ${dsm5.apresentacaoSugerida}</span>
        </div>
        <div class="text-[10px] text-text-dim max-w-md">
          Diagnóstico clínico multidisciplinar. Encaminhamento a psiquiatria/neurologia indicado para conduta compartilhada.
        </div>
      </div>
    </div>
  `;
}

class TdahEcosystemDbWrapper {
  private getStorageKey(patientId: string): string {
    return `cortex_tdah_ecosystem_${patientId}`;
  }

  async getAssessment(patientId: string): Promise<TdahEcosystemAssessment | null> {
    // First, check Dexie medical record
    try {
      const record = await db.prontuarios.get(patientId);
      if (record && record.entradas) {
        const found = record.entradas.find(
          e => e.tipo === ('tdah-ecosystem' as any) || e.metadata?.type === 'tdah-ecosystem'
        );
        if (found?.metadata?.ecosystemData) {
          return found.metadata.ecosystemData as TdahEcosystemAssessment;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler do prontuário Dexie:', e);
    }

    // Fallback to localStorage draft
    try {
      const draft = localStorage.getItem(this.getStorageKey(patientId));
      if (draft) {
        return JSON.parse(draft) as TdahEcosystemAssessment;
      }
    } catch (e) {
      console.warn('Erro ao ler draft local:', e);
    }

    return null;
  }

  async saveDraftLocally(assessment: TdahEcosystemAssessment): Promise<void> {
    try {
      localStorage.setItem(this.getStorageKey(assessment.patientId), JSON.stringify(assessment));
    } catch (e) {
      console.error('Erro ao salvar rascunho local:', e);
    }
  }

  async saveToMedicalRecord(assessment: TdahEcosystemAssessment, userId?: string): Promise<void> {
    const patientId = assessment.patientId;
    assessment.updatedAt = new Date().toISOString();
    
    // Save draft locally first
    await this.saveDraftLocally(assessment);

    const record = await db.prontuarios.get(patientId);
    const textHtml = formatTdahEcosystemToHtml(assessment);
    const timestamp = Number(assessment.id) || Date.now();
    assessment.id = String(timestamp);

    const newEntry = {
      timestamp,
      data: new Date(assessment.updatedAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'tdah-ecosystem' as any,
      metadata: {
        type: 'tdah-ecosystem',
        ecosystemData: assessment
      }
    };

    if (record) {
      // Check if entry already exists
      const existingIdx = record.entradas.findIndex(
        e => (e.tipo === ('tdah-ecosystem' as any) || e.metadata?.type === 'tdah-ecosystem') &&
             (String(e.timestamp) === assessment.id || e.metadata?.ecosystemData?.id === assessment.id)
      );

      if (existingIdx !== -1) {
        record.entradas[existingIdx] = newEntry;
      } else {
        record.entradas.unshift(newEntry);
      }

      await db.prontuarios.put(record);
      await syncService.enqueueChange('prontuarios', record.pacienteId, 'update', record);
    } else {
      const newRecord = {
        pacienteId: patientId,
        entradas: [newEntry],
        anamneseData: {},
        treatmentPlan: { goals: [], notes: '' }
      };
      await db.prontuarios.put(newRecord);
      await syncService.enqueueChange('prontuarios', newRecord.pacienteId, 'create', newRecord);
    }
  }
}

export const tdahEcosystemDbWrapper = new TdahEcosystemDbWrapper();
