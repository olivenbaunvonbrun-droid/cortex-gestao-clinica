import { db } from '../../../lib/db';
import { syncService } from '../../../lib/syncService';
import { Report } from '../types';

export function formatPsicometrikToHtml(report: Report): string {
  return `
    <div class="psicometrik-entry-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#00A3FF]">Psicometrik - ${report.toolTitle}</h4>
        <span class="text-[9px] font-mono opacity-50">${report.evaluationDate}</span>
      </div>
      <div class="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
        <div>
          <span class="text-[9px] text-text-dim font-black uppercase tracking-widest block mb-0.5">Pontuação/Métrica</span>
          <span class="text-xs font-black text-primary">${report.calculatedScores.score} pontos</span>
        </div>
        <div>
          <span class="text-[9px] text-text-dim font-black uppercase tracking-widest block mb-0.5">Classificação</span>
          <span class="text-xs font-black text-emerald-400">${report.calculatedScores.classification}</span>
        </div>
      </div>
      ${report.aiReportText ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2">Conclusão do Laudo (IA)</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${report.aiReportText.substring(0, 300)}...
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class PsicometrikDatabaseWrapper {
  async getHistory(patientId?: string): Promise<Report[]> {
    const reports: Report[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'psicometrik' || e.metadata?.type === 'psicometrik') {
            const report = e.metadata?.psicometrikData;
            if (report) reports.push(report);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'psicometrik' || e.metadata?.type === 'psicometrik') {
            const report = e.metadata?.psicometrikData;
            if (report) {
              reports.push({
                ...report,
                patientName: patient?.nome || report.patientName
              });
            }
          }
        });
      });
    }
    return reports.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || (b.id || '').localeCompare(a.id || ''));
  }

  async saveEntry(report: Report, patientId: string, userId?: string): Promise<Report[]> {
    const record = await db.prontuarios.get(patientId);
    const textHtml = formatPsicometrikToHtml(report);
    
    const timestamp = Number(report.id) || Date.now();
    report.id = String(timestamp);
    
    // Create new entry
    const newEntry = {
      timestamp,
      data: report.evaluationDate,
      textoHtml: textHtml,
      tipo: 'psicometrik' as any,
      metadata: {
        type: 'psicometrik',
        psicometrikData: report
      }
    };

    if (record) {
      const filtered = record.entradas.filter(e => e.metadata?.psicometrikData?.id !== report.id && String(e.timestamp) !== String(report.id));
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

  async deleteEntry(id: string, patientId: string, userId?: string): Promise<Report[]> {
    const record = await db.prontuarios.get(patientId);
    if (record) {
      const updatedEntradas = record.entradas.filter(e => e.metadata?.psicometrikData?.id !== id);
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

export const psicometrikDbWrapper = new PsicometrikDatabaseWrapper();
