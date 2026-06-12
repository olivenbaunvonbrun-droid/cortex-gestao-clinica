import { db } from '../../../lib/db';
import { AttendanceRecord } from '../types';
import { ATTENDANCE_TEMPLATES } from '../utils/templates';
import { syncService } from '../../../lib/syncService';

export function formatRecordToHtml(record: AttendanceRecord): string {
  const template = ATTENDANCE_TEMPLATES.find(t => t.id === record.template);
  const fieldsRendered = template?.fields.map(f => {
    const val = record.fields[f.id] || '';
    if (!val) return '';
    return `<p class="mb-1 text-[11px] text-text-main/90"><strong>${f.label}:</strong> ${val}</p>`;
  }).join('') || '';

  return `
    <div class="attendance-record-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#10b981]">Registro de Atendimento (${template?.name || record.template})</h4>
        <span class="text-[9px] font-mono opacity-50">${new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <div class="text-xs leading-relaxed space-y-2">
        ${fieldsRendered}
      </div>
      ${record.aiAnalysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2">Resumo Clínico Integrativo (IA)</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${record.aiAnalysis.substring(0, 300)}...
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class AttendanceDatabaseWrapper {
  async getHistory(patientId?: string): Promise<AttendanceRecord[]> {
    const records: AttendanceRecord[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'registro_atendimento' || e.metadata?.type === 'registro_atendimento') {
            const att = e.metadata?.attendanceData;
            if (att) records.push(att);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'registro_atendimento' || e.metadata?.type === 'registro_atendimento') {
            const att = e.metadata?.attendanceData;
            if (att) {
              records.push({
                ...att,
                patient: {
                  ...att.patient,
                  name: patient?.nome || att.patient.name
                }
              });
            }
          }
        });
      });
    }
    return records.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || (b.id || '').localeCompare(a.id || ''));
  }

  async saveEntry(record: AttendanceRecord, patientId: string, userId?: string): Promise<AttendanceRecord[]> {
    const prontuario = await db.prontuarios.get(patientId);
    const textHtml = formatRecordToHtml(record);
    
    const timestamp = Number(record.id) || Date.now();
    record.id = String(timestamp);
    
    const newEntry = {
      timestamp,
      data: new Date(record.createdAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'registro_atendimento' as any,
      metadata: {
        type: 'registro_atendimento',
        attendanceData: record
      }
    };

    if (prontuario) {
      const filtered = prontuario.entradas.filter(e => String(e.timestamp) !== String(record.id));
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

  async deleteEntry(id: string, patientId: string, userId?: string): Promise<AttendanceRecord[]> {
    const prontuario = await db.prontuarios.get(patientId);
    if (prontuario) {
      const updatedEntradas = prontuario.entradas.filter(e => String(e.timestamp) !== String(id));
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

export const dbWrapper = new AttendanceDatabaseWrapper();
