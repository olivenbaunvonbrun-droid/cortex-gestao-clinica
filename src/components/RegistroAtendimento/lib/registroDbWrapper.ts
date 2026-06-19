import { db } from '../../../lib/db';
import { AttendanceRecord } from '../types';
import { syncService } from '../../../lib/syncService';

// Format YYYY-MM-DD to DD/MM/YYYY
const formatBrazilianDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export function formatRecordToHtml(record: AttendanceRecord): string {
  const f = record.fields;
  
  // Parse approaches array if stored as stringified JSON
  let abordagens = f.abordagensSessao || '';
  try {
    if (abordagens.startsWith('[')) {
      const parsed = JSON.parse(abordagens);
      if (Array.isArray(parsed)) {
        abordagens = parsed.join(', ');
      }
    }
  } catch (e) {
    // Keep as is if not JSON
  }

  return `
    <div class="attendance-record-rendered p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl space-y-4 font-sans select-text">
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-[#10b981]">Registro de Atendimento Psicológico</h4>
        <span class="text-[9px] font-mono opacity-50">Cód: ${f.codigoRegistro || 'N/A'}</span>
      </div>
      
      <!-- Dados Técnicos -->
      <div class="grid grid-cols-2 gap-2 text-[10px] text-text-main/90 border-b border-white/[0.04] pb-3">
        <div><strong>Psicólogo:</strong> ${f.psicologo || 'Dr. Bruno de Oliveira Lima'}</div>
        <div><strong>CRP:</strong> ${f.crp || 'CRP05/75885'}</div>
        <div><strong>Data:</strong> ${formatBrazilianDate(f.dataAtendimento || '')}</div>
        <div><strong>Horário:</strong> ${f.horario || 'N/A'}</div>
        <div><strong>Sessão Nº:</strong> ${f.numeroSessao || 'N/A'}</div>
        <div><strong>Tipo/Local:</strong> ${f.tipoSessao || 'Individual'} (${f.localSessao || 'Online'})</div>
      </div>
      
      <!-- Identificação do Cliente -->
      <div class="text-[10px] text-text-main/90 border-b border-white/[0.04] pb-3 pt-1">
        <h5 class="font-bold uppercase tracking-wider text-text-dim text-[9px] mb-1.5">1. Identificação do Cliente</h5>
        <div class="grid grid-cols-2 gap-2">
          <div><strong>Nome:</strong> ${f.nomeCliente || 'Não informado'}</div>
          <div><strong>Idade:</strong> ${f.idadeCliente || 'Não informada'} anos</div>
          <div><strong>Sexo:</strong> ${f.sexoCliente || 'Não informado'}</div>
          <div><strong>Contato:</strong> ${f.contatoCliente || 'Não informado'}</div>
        </div>
        ${f.motivoConsulta ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80 pt-1">
            <strong>Motivo da Consulta / Queixa:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.motivoConsulta}</div>
          </div>
        ` : ''}
      </div>

      <!-- Objetivos -->
      <div class="text-[10px] text-text-main/90 border-b border-white/[0.04] pb-3 pt-1">
        <h5 class="font-bold uppercase tracking-wider text-text-dim text-[9px] mb-1.5">2. Objetivos da Sessão</h5>
        ${f.objetivosCliente ? `
          <div class="mt-1 text-xs leading-relaxed text-text-main/80">
            <strong>Definidos pelo Cliente:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.objetivosCliente}</div>
          </div>
        ` : ''}
        ${f.objetivosTerapeuta ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80">
            <strong>Definidos pelo Terapeuta:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.objetivosTerapeuta}</div>
          </div>
        ` : ''}
      </div>

      <!-- Prática da Sessão -->
      <div class="text-[10px] text-text-main/90 border-b border-white/[0.04] pb-3 pt-1">
        <h5 class="font-bold uppercase tracking-wider text-text-dim text-[9px] mb-1.5">3. Estrutura e Prática</h5>
        ${f.relatoCliente ? `
          <div class="mt-1 text-xs leading-relaxed text-text-main/80">
            <strong>Relato Detalhado:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.relatoCliente}</div>
          </div>
        ` : ''}
        ${f.intervencoes ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80">
            <strong>Intervenções Clínicas:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.intervencoes}</div>
          </div>
        ` : ''}
        ${f.observacoes ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80">
            <strong>Observações Complementares:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.observacoes}</div>
          </div>
        ` : ''}
        ${f.insights ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80">
            <strong>Insights Emergentes:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.insights}</div>
          </div>
        ` : ''}
      </div>

      <!-- Avaliação -->
      <div class="text-[10px] text-text-main/90 border-b border-white/[0.04] pb-3 pt-1">
        <h5 class="font-bold uppercase tracking-wider text-text-dim text-[9px] mb-1.5">4. Avaliação e Progresso</h5>
        <div><strong>Progresso Estimado:</strong> ${f.progresso || 'Não avaliado'}</div>
        ${f.percepcaoCliente ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80">
            <strong>Percepção do Cliente:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.percepcaoCliente}</div>
          </div>
        ` : ''}
      </div>

      <!-- Plano de Continuidade -->
      <div class="text-[10px] text-text-main/90 border-b border-white/[0.04] pb-3 pt-1">
        <h5 class="font-bold uppercase tracking-wider text-text-dim text-[9px] mb-1.5">5. Plano Terapêutico Intersessão</h5>
        ${f.tarefas ? `
          <div class="mt-1 text-xs leading-relaxed text-text-main/80">
            <strong>Tarefas Recomendadas:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.tarefas}</div>
          </div>
        ` : ''}
        ${f.planejamento ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80">
            <strong>Foco Próxima Sessão:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.planejamento}</div>
          </div>
        ` : ''}
      </div>

      <!-- Considerações Éticas / Encaminhamentos -->
      <div class="text-[10px] text-text-main/90 pb-2 pt-1">
        <h5 class="font-bold uppercase tracking-wider text-text-dim text-[9px] mb-1.5">6. Considerações Éticas e Técnicas</h5>
        ${f.confidencialidade ? `
          <div class="mt-1 text-xs leading-relaxed text-text-main/80">
            <strong>Confidencialidade:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.confidencialidade}</div>
          </div>
        ` : ''}
        ${f.encaminhamentos ? `
          <div class="mt-2 text-xs leading-relaxed text-text-main/80">
            <strong>Encaminhamentos Especiais:</strong>
            <div class="mt-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[11px] prose prose-invert max-w-none text-justify">${f.encaminhamentos}</div>
          </div>
        ` : ''}
      </div>
      
      ${f.assinatura ? `
        <div class="mt-6 pt-4 border-t border-white/[0.08] flex flex-col items-center">
          <img src="${f.assinatura}" alt="Assinatura" style="max-height: 50px; opacity: 0.85;" />
          <div class="text-[9px] font-mono text-text-dim uppercase mt-1">Assinado Eletronicamente</div>
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
