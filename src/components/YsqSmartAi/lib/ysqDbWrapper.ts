import { db } from '../../../lib/db';
import { Assessment, SCHEMA_DETAILS, YSQ_QUESTIONS } from '../types';
import { syncService } from '../../../lib/syncService';

export function formatYsqToHtml(assessment: Assessment): string {
  // Calculate average scores for high schemas (average >= 4)
  const schemaSums: Record<string, number> = {};
  const schemaCounts: Record<string, number> = {};

  YSQ_QUESTIONS.forEach(q => {
    const val = Number(assessment.answers[q.id]) || 1;
    schemaSums[q.schemaKey] = (schemaSums[q.schemaKey] || 0) + val;
    schemaCounts[q.schemaKey] = (schemaCounts[q.schemaKey] || 0) + 1;
  });

  const highSchemas: string[] = [];
  Object.keys(SCHEMA_DETAILS).forEach(key => {
    const avg = (schemaSums[key] || 0) / (schemaCounts[key] || 5);
    if (avg >= 4) {
      highSchemas.push(`${SCHEMA_DETAILS[key].name} (${avg.toFixed(1)})`);
    }
  });

  return `
    <div class="ysq-entry-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#a78bfa]">Questionário de Esquemas de Young (YSQ-S3)</h4>
        <span class="text-[9px] font-mono opacity-50">${new Date(assessment.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <p class="text-xs leading-relaxed opacity-95">
        Avaliação concluída com base nas 90 respostas fornecidas sobre esquemas iniciais desadaptativos.
      </p>
      ${highSchemas.length > 0 ? `
        <div class="text-[11px] space-y-1 py-2 px-3 bg-red-500/5 border border-red-500/10 rounded-xl">
          <strong class="text-xs text-red-400 font-bold">Esquemas Ativos Detectados (Média ≥ 4):</strong>
          <p class="text-text-main/80 leading-relaxed font-semibold">${highSchemas.join(', ')}</p>
        </div>
      ` : `
        <div class="text-[11px] py-1 text-green-400 font-bold">Nenhum esquema clínico altamente ativado detectado.</div>
      `}
      ${assessment.aiAnalysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2">Relatório Clínico e Análise de Esquemas (IA)</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${assessment.aiAnalysis.substring(0, 300)}...
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class YsqDatabaseWrapper {
  async getHistory(patientId?: string): Promise<Assessment[]> {
    const assessments: Assessment[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'ysq' || e.metadata?.type === 'ysq') {
            const ysq = e.metadata?.ysqData;
            if (ysq) assessments.push(ysq);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'ysq' || e.metadata?.type === 'ysq') {
            const ysq = e.metadata?.ysqData;
            if (ysq) {
              assessments.push({
                ...ysq,
                patient: {
                  ...ysq.patient,
                  name: patient?.nome || ysq.patient.name
                }
              });
            }
          }
        });
      });
    }
    return assessments.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || (b.id || '').localeCompare(a.id || ''));
  }

  async saveEntry(assessment: Assessment, patientId: string, userId?: string): Promise<Assessment[]> {
    const record = await db.prontuarios.get(patientId);
    const textHtml = formatYsqToHtml(assessment);
    
    const timestamp = Number(assessment.id) || Date.now();
    assessment.id = String(timestamp);
    
    const newEntry = {
      timestamp,
      data: new Date(assessment.createdAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'ysq' as const,
      metadata: {
        type: 'ysq',
        ysqData: assessment
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

export const dbWrapper = new YsqDatabaseWrapper();
