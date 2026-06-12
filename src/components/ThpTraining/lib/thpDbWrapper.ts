import { db } from '../../../lib/db';
import { ThpRecord } from '../types';
import { syncService } from '../../../lib/syncService';

export function formatThpToHtml(record: ThpRecord): string {
  const completedCount = record.exercises.filter(e => e.completed).length;
  const totalCount = record.exercises.length;
  
  return `
    <div class="thp-entry-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#10b981]">Treinamento de Habilidade Psicológica (THP)</h4>
        <span class="text-[9px] font-mono opacity-50">${new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <div class="space-y-1">
        <h5 class="text-xs font-bold text-text-main">Habilidade: <span class="text-primary font-black uppercase">${record.skillName}</span></h5>
        <p class="text-[11px] text-text-dim/90 leading-relaxed">${record.skillDescription}</p>
      </div>
      <div class="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
        <div>
          <span class="text-[9px] text-text-dim font-black uppercase tracking-widest block mb-0.5">Progresso Clínico</span>
          <span class="text-xs font-black text-emerald-400">${record.currentLevel}% &rarr; ${record.targetLevel}% (Alvo)</span>
        </div>
        <div>
          <span class="text-[9px] text-text-dim font-black uppercase tracking-widest block mb-0.5">Exercícios Ativos</span>
          <span class="text-xs font-black text-primary">${completedCount} concluídos de ${totalCount}</span>
        </div>
      </div>
      ${record.sessions.length > 0 ? `
        <div class="space-y-1.5">
          <span class="text-[9px] text-text-dim font-black uppercase tracking-widest block">Último Registro de Treino</span>
          <p class="text-[11px] text-text-main/90 leading-relaxed italic">
            "${record.sessions[0].description}" (${record.sessions[0].duration} min - Dificuldade: ${record.sessions[0].difficulty}/5)
          </p>
        </div>
      ` : ''}
      ${record.aiAnalysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2">Relatório Clínico e Conclusão THP</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${record.aiAnalysis.substring(0, 300)}...
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class ThpDatabaseWrapper {
  async getHistory(patientId?: string): Promise<ThpRecord[]> {
    const assessments: ThpRecord[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'thp' || e.metadata?.type === 'thp') {
            const thp = e.metadata?.thpData;
            if (thp) assessments.push(thp);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'thp' || e.metadata?.type === 'thp') {
            const thp = e.metadata?.thpData;
            if (thp) {
              assessments.push({
                ...thp,
                patient: {
                  ...thp.patient,
                  name: patient?.nome || thp.patient.name
                }
              });
            }
          }
        });
      });
    }
    return assessments.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || (b.id || '').localeCompare(a.id || ''));
  }

  async saveEntry(assessment: ThpRecord, patientId: string, userId?: string): Promise<ThpRecord[]> {
    const record = await db.prontuarios.get(patientId);
    const textHtml = formatThpToHtml(assessment);
    
    const timestamp = Number(assessment.id) || Date.now();
    assessment.id = String(timestamp);
    
    const newEntry = {
      timestamp,
      data: new Date(assessment.createdAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'thp' as any, // dynamic tipo to not restrict db.ts
      metadata: {
        type: 'thp',
        thpData: assessment
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

  async deleteEntry(id: string, patientId: string, userId?: string): Promise<ThpRecord[]> {
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

export const dbWrapper = new ThpDatabaseWrapper();
