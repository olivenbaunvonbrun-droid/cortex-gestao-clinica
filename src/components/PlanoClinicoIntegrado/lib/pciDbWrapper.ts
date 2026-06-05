import { db } from '../../../lib/db';
import { PciRecord } from '../types';
import { syncService } from '../../../lib/syncService';

export function formatPciToHtml(record: PciRecord): string {
  return `
    <div class="pci-record-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#a78bfa]">Plano Clínico Integrado (PCI)</h4>
        <span class="text-[9px] font-mono opacity-50">${new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <div class="text-xs leading-relaxed space-y-2 opacity-95">
        <p><strong>Paciente:</strong> ${record.patient.name} (${record.idade || 'Idade N/D'})</p>
        <p><strong>Queixa Principal:</strong> ${record.eventoQueixas ? (record.eventoQueixas.length > 150 ? record.eventoQueixas.substring(0, 150) + '...' : record.eventoQueixas) : 'Não informada'}</p>
        <p><strong>Diagnóstico Topográfico:</strong> ${record.diagTopo || 'Não informado'}</p>
        ${record.instrumentos ? `<p><strong>Instrumentos:</strong> ${record.instrumentos}</p>` : ''}
        ${record.relacionamentoTerap ? `<p><strong>Relacionamento Terapêutico:</strong> ${record.relacionamentoTerap}</p>` : ''}
        <p><strong>Projeto Terapêutico:</strong> ${record.projetoTerap ? (record.projetoTerap.length > 150 ? record.projetoTerap.substring(0, 150) + '...' : record.projetoTerap) : 'Não informado'}</p>
      </div>
      ${record.aiAnalysis ? `
        <div class="mt-4 pt-4 border-t border-white/[0.08]">
          <h5 class="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2">Planejamento e Conceituação de Caso (IA)</h5>
          <div class="text-xs text-text-main/80 font-medium whitespace-pre-line leading-relaxed">
            ${record.aiAnalysis.length > 300 ? record.aiAnalysis.substring(0, 300) + '...' : record.aiAnalysis}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

class PciDatabaseWrapper {
  async getHistory(patientId?: string): Promise<PciRecord[]> {
    const records: PciRecord[] = [];
    if (patientId) {
      const record = await db.prontuarios.get(patientId);
      if (record) {
        record.entradas.forEach(e => {
          if (e.tipo === 'pci' || e.metadata?.type === 'pci') {
            const pci = e.metadata?.pciData;
            if (pci) records.push(pci);
          }
        });
      }
    } else {
      const allRecords = await db.prontuarios.toArray();
      const patients = await db.pacientes.toArray();
      allRecords.forEach(record => {
        const patient = patients.find(p => String(p.id) === String(record.pacienteId));
        record.entradas.forEach(e => {
          if (e.tipo === 'pci' || e.metadata?.type === 'pci') {
            const pci = e.metadata?.pciData;
            if (pci) {
              records.push({
                ...pci,
                patient: {
                  ...pci.patient,
                  name: patient?.nome || pci.patient.name
                }
              });
            }
          }
        });
      });
    }
    return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  }

  async saveEntry(record: PciRecord, patientId: string, userId?: string): Promise<PciRecord[]> {
    const prontuario = await db.prontuarios.get(patientId);
    const textHtml = formatPciToHtml(record);
    
    const newEntry = {
      timestamp: Number(record.id) || Date.now(),
      data: new Date(record.createdAt).toLocaleDateString('pt-BR'),
      textoHtml: textHtml,
      tipo: 'pci' as any,
      metadata: {
        type: 'pci',
        pciData: record
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

  async deleteEntry(id: string, patientId: string, userId?: string): Promise<PciRecord[]> {
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

export const dbWrapper = new PciDatabaseWrapper();
