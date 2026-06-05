import { db } from '../../../lib/db';
import { DfcRecord } from '../types';
import { syncService } from '../../../lib/syncService';

export function formatDfcToHtml(record: DfcRecord): string {
  return `
    <div class="dfc-entry-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#6366f1]">DFC Assistido</h4>
        <span class="text-[9px] font-mono opacity-50">${new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <p class="text-xs leading-relaxed opacity-95">
        Diagrama de Funcionamento Cognitivo (DFC) preenchido e estruturado com dados de histórico de infância, crenças centrais ("${record.coreBeliefs.substring(0, 60)}..."), estratégias de enfrentamento e ${record.situations.length} situação(ões) típica(s).
      </p>
      ${record.aiAnalysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2">Conceituação Clínica e Análise de IA</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${record.aiAnalysis.substring(0, 300)}...
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class DfcDatabaseWrapper {
  async getHistory(patientId?: string): Promise<DfcRecord[]> {
    const assessments: DfcRecord[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'dfc' || e.metadata?.type === 'dfc') {
            const dfc = e.metadata?.dfcData;
            if (dfc) assessments.push(dfc);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'dfc' || e.metadata?.type === 'dfc') {
            const dfc = e.metadata?.dfcData;
            if (dfc) {
              assessments.push({
                ...dfc,
                patient: {
                  ...dfc.patient,
                  name: patient?.nome || dfc.patient.name
                }
              });
            }
          }
        });
      });
    }
    return assessments.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  }

  async saveEntry(assessment: DfcRecord, patientId: string, userId?: string): Promise<DfcRecord[]> {
    const record = await db.prontuarios.get(patientId);
    const textHtml = formatDfcToHtml(assessment);
    
    const newEntry = {
      timestamp: Number(assessment.id) || Date.now(),
      data: new Date(assessment.createdAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'dfc' as const,
      metadata: {
        type: 'dfc',
        dfcData: assessment
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

  async deleteEntry(id: string, patientId: string, userId?: string): Promise<DfcRecord[]> {
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

export const dbWrapper = new DfcDatabaseWrapper();
