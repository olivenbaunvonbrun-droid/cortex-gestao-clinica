import { db } from '../../../lib/db';
import { Assessment, HP_DETAILS, IHP_QUESTIONS } from '../types';
import { syncService } from '../../../lib/syncService';

export function formatIhpToHtml(assessment: Assessment): string {
  const categorySums: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  IHP_QUESTIONS.forEach(q => {
    const val = Number(assessment.answers[q.id]) || 1;
    categorySums[q.categoryKey] = (categorySums[q.categoryKey] || 0) + val;
    categoryCounts[q.categoryKey] = (categoryCounts[q.categoryKey] || 0) + 1;
  });

  const proficient: string[] = [];
  const deficitary: string[] = [];

  Object.entries(HP_DETAILS).forEach(([key, info]) => {
    const score = (categorySums[key] || 0) / (categoryCounts[key] || 3);
    if (score >= 4.5) {
      proficient.push(info.name);
    } else if (score < 3.5) {
      deficitary.push(info.name);
    }
  });

  return `
    <div class="ihp-entry-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#10b981]">Inventário de Habilidades Psicológicas (IHP-PR)</h4>
        <span class="text-[9px] font-mono opacity-50">${new Date(assessment.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <p class="text-xs leading-relaxed opacity-95">
        Avaliação de habilidades psicológicas concluída com base nas 30 respostas do inventário de Poubel & Rodrigues.
      </p>
      
      ${proficient.length > 0 ? `
        <div class="text-[11px] space-y-1 py-1.5 px-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <strong class="text-xs text-emerald-400 font-bold">Habilidades Proficientes (Média ≥ 4.5):</strong>
          <p class="text-text-main/80 leading-relaxed font-semibold">${proficient.join(', ')}</p>
        </div>
      ` : ''}

      ${deficitary.length > 0 ? `
        <div class="text-[11px] space-y-1 py-1.5 px-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <strong class="text-xs text-amber-400 font-bold">Habilidades Deficitárias/Insuficientes (Média < 3.5):</strong>
          <p class="text-text-main/80 leading-relaxed font-semibold">${deficitary.join(', ')}</p>
        </div>
      ` : ''}

      ${assessment.aiAnalysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2">Relatório Clínico e Diagnóstico (IA)</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${assessment.aiAnalysis.substring(0, 300)}...
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class IhpDatabaseWrapper {
  async getHistory(patientId?: string): Promise<Assessment[]> {
    const assessments: Assessment[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'ihp_pr' || e.metadata?.type === 'ihp_pr') {
            const ihp = e.metadata?.ihpData;
            if (ihp) assessments.push(ihp);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'ihp_pr' || e.metadata?.type === 'ihp_pr') {
            const ihp = e.metadata?.ihpData;
            if (ihp) {
              assessments.push({
                ...ihp,
                patient: {
                  ...ihp.patient,
                  name: patient?.nome || ihp.patient.name
                }
              });
            }
          }
        });
      });
    }
    return assessments.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  }

  async saveEntry(assessment: Assessment, patientId: string, userId?: string): Promise<Assessment[]> {
    const record = await db.prontuarios.get(patientId);
    const textHtml = formatIhpToHtml(assessment);
    
    const newEntry = {
      timestamp: Number(assessment.id) || Date.now(),
      data: new Date(assessment.createdAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'ihp_pr' as any,
      metadata: {
        type: 'ihp_pr',
        ihpData: assessment
      }
    };

    if (record) {
      const filtered = record.entradas.filter(e => String(e.timestamp) !== String(assessment.id));
      const updatedEntradas = [newEntry, ...filtered];
      await db.prontuarios.update(patientId, { entradas: updatedEntradas });
    } else {
      const newRecord = {
        pacienteId: patientId,
        entradas: [newEntry],
        anamneseData: {}
      };
      await db.prontuarios.add(newRecord);
    }

    if (userId) {
      const updatedRecord = await db.prontuarios.get(patientId);
      if (updatedRecord) {
        await syncService.saveToCloud(userId, 'prontuarios', updatedRecord);
      }
    }

    return await this.getHistory(patientId);
  }

  async deleteEntry(id: string, patientId: string, userId?: string): Promise<Assessment[]> {
    const record = await db.prontuarios.get(patientId);
    if (record) {
      const updatedEntradas = record.entradas.filter(e => String(e.timestamp) !== String(id));
      await db.prontuarios.update(patientId, { entradas: updatedEntradas });
      
      if (userId) {
        const updatedRecord = await db.prontuarios.get(patientId);
        if (updatedRecord) {
          await syncService.saveToCloud(userId, 'prontuarios', updatedRecord);
        }
      }
    }
    return await this.getHistory(patientId);
  }
}

export const dbWrapper = new IhpDatabaseWrapper();
