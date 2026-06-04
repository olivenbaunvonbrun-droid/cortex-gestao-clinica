import { db } from '../../../lib/db';
import { RidEntry } from '../types';
import { syncService } from '../../../lib/syncService';

export function formatRidToHtml(entry: RidEntry): string {
  return `
    <div class="rid-entry-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#4dabf7]">Registro de Informações Diárias (RID)</h4>
        <span class="text-[9px] font-mono opacity-50">${entry.date}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed opacity-95">
        <p><strong>Situação:</strong> ${entry.situacao}</p>
        <p><strong>Pensamentos Automáticos:</strong> ${entry.pensamento}</p>
        <p><strong>Comportamento:</strong> ${entry.comportamento}</p>
        <p><strong>Emoção:</strong> ${entry.emocao.name} (${entry.emocao.intensity}%)</p>
        <p><strong>Necessidade Emocional:</strong> ${Array.isArray(entry.necessidade) ? entry.necessidade.join(', ') : entry.necessidade}</p>
        <p><strong>Esquema/Crença:</strong> ${Array.isArray(entry.esquema) ? entry.esquema.join(', ') : entry.esquema}</p>
        <p><strong>Consequências de Curto Prazo:</strong> ${entry.consequenciasCurtoPrazo}</p>
        <p><strong>Consequências de Longo Prazo:</strong> ${entry.consequenciasLongoPrazo}</p>
      </div>
      ${entry.analysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2">Análise Clínico (IA)</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${entry.analysis}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class RidDatabaseWrapper {
  async getHistory(patientId?: string): Promise<RidEntry[]> {
    const rids: RidEntry[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'rid' || e.metadata?.type === 'rid') {
            const rid = e.metadata?.ridData;
            if (rid) rids.push(rid);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'rid' || e.metadata?.type === 'rid') {
            const rid = e.metadata?.ridData;
            if (rid) {
              rids.push({
                ...rid,
                patientName: patient?.nome || rid.patientName
              });
            }
          }
        });
      });
    }
    return rids.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }

  async saveEntry(entry: RidEntry, patientId: string, userId?: string): Promise<void> {
    const record = await db.prontuarios.get(patientId);
    const textHtml = formatRidToHtml(entry);
    
    const newEntry = {
      timestamp: Number(entry.id) || Date.now(),
      data: entry.date,
      textoHtml: textHtml,
      tipo: 'rid' as const,
      metadata: {
        type: 'rid',
        ridData: entry
      }
    };

    if (record) {
      const filtered = record.entradas.filter(e => String(e.timestamp) !== String(entry.id));
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
  }

  async deleteEntry(id: string, patientId: string, userId?: string): Promise<void> {
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
  }
}

export const dbWrapper = new RidDatabaseWrapper();
