import { db } from '../../../lib/db';
import { Assessment } from '../types';
import { syncService } from '../../../lib/syncService';

export function formatLinhaVidaToHtml(assessment: Assessment): string {
  return `
    <div class="linha-vida-entry-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#10b981]">Linha da Vida</h4>
        <span class="text-[9px] font-mono opacity-50">${new Date(assessment.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <p class="text-xs leading-relaxed opacity-95">
        Avaliação concluída e Linha da Vida gerada com base nos ${assessment.events.length} eventos cronológicos cadastrados (mapeando a trajetória emocional do paciente).
      </p>
      ${assessment.aiAnalysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2">Relatório Clínico e Conclusão</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${assessment.aiAnalysis.substring(0, 300)}...
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class LinhaVidaDatabaseWrapper {
  async getHistory(patientId?: string): Promise<Assessment[]> {
    const assessments: Assessment[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'linha_vida' || e.metadata?.type === 'linha_vida') {
            const lv = e.metadata?.linhaVidaData;
            if (lv) assessments.push(lv);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'linha_vida' || e.metadata?.type === 'linha_vida') {
            const lv = e.metadata?.linhaVidaData;
            if (lv) {
              assessments.push({
                ...lv,
                patient: {
                  ...lv.patient,
                  name: patient?.nome || lv.patient.name
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
    const textHtml = formatLinhaVidaToHtml(assessment);
    
    const newEntry = {
      timestamp: Number(assessment.id) || Date.now(),
      data: new Date(assessment.createdAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'linha_vida' as const,
      metadata: {
        type: 'linha_vida',
        linhaVidaData: assessment
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

export const dbWrapper = new LinhaVidaDatabaseWrapper();
