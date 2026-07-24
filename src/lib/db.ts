import Dexie, { type Table } from 'dexie';

export interface User {
  id: string;
  username: string;
  password?: string;
  crp?: string;
  keyword: string;
}

export interface Patient {
  id: string;
  nome: string;
  fotoPerfilDataUrl?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  nascimento?: string;
  endereco?: string;
  estado?: string;
  historicoHtml?: string;
  psicodiagnosticoHtml?: string;
  linksUteis?: { titulo: string; url: string }[];
  dataCadastro: string;
  // Novos campos LGPD/Menores/Contratos
  evidenciaLGPDAceite?: boolean;
  dataAceiteLGPD?: string;
  isMenor?: boolean;
  responsavelNome?: string;
  responsavelCpf?: string;
  responsavelTelefone?: string;
  responsavelEmail?: string;
  contratoTerapeuticoHtml?: string;
  valorConsulta?: number;
  frequenciaSemanal?: number;
  valorMensal?: number;
  valorFinalCombinado?: number;
  dataReajuste?: string;
  status?: 'ativo' | 'inativo';
}

export interface Appointment {
  id: string;
  pacienteId: string;
  data: string;
  hora: string;
  tipo: 'individual' | 'grupo' | 'online';
  recorrencia: 'nao' | 'semanal' | 'quinzenal' | 'mensal_data' | 'mensal_dia_semana' | 'anual_semanal';
  recorrenciaPaiId?: string;
  obsAgendamento?: string;
  linksSessao?: { titulo: string; url: string }[];
  registroAtendimentoData?: Record<string, any>;
  status?: 'pending' | 'completed' | 'cancelled' | 'rescheduled' | 'reagendamento' | 'confirmed';
}

export interface MedicalRecord {
  pacienteId: string;
  entradas: MedicalRecordEntry[];
  anamneseData: Record<string, any>;
  treatmentPlan?: { goals: { text: string; completed: boolean }[]; notes: string };
  longitudinalProfile?: string;
}

export interface MedicalRecordEntry {
  timestamp: number;
  data: string;
  textoHtml: string;
  tipo?: 'evolucao' | 'agendamento' | 'arquivo' | 'sistema';
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  pacienteId?: string;
  formaPagamento?: string;
  categoria?: string;
}

export interface ActionLog {
  id?: number;
  timestamp: string;
  user: string;
  action: string;
}

export interface Setting {
  key: string;
  value: any;
}

export interface Attachment {
  id?: number;
  ownerId: string;
  ownerType: 'prontuario' | 'agendamento';
  folderName?: string;
  nomeArquivo: string;
  tipoArquivo: string;
  conteudoArquivo: string;
}

// Tombstone record: tracks items deleted locally so syncAll never re-uploads them
export interface DeletedRecord {
  id: string;        // composite key: "tableName:itemId"
  tableName: string;
  itemId: string;
  deletedAt: number; // Unix timestamp ms
}

export class PsiGestDB extends Dexie {
  pacientes!: Table<Patient>;
  agendamentos!: Table<Appointment>;
  prontuarios!: Table<MedicalRecord>;
  transacoes!: Table<Transaction>;
  users!: Table<User>;
  actionLog!: Table<ActionLog>;
  settings!: Table<Setting>;
  anexos!: Table<Attachment>;
  deletedIds!: Table<DeletedRecord>;

  constructor() {
    super('PsiGestDB_v9_React');
    this.version(2).stores({
      pacientes: 'id, nome',
      agendamentos: 'id, data, pacienteId, recorrenciaPaiId',
      prontuarios: 'pacienteId',
      transacoes: 'id, data, tipo, pacienteId',
      users: 'id, &username',
      actionLog: '++id',
      settings: 'key',
      anexos: '++id, ownerId, ownerType'
    });
    // Version 3: add tombstone table for sync conflict prevention
    this.version(3).stores({
      pacientes: 'id, nome',
      agendamentos: 'id, data, pacienteId, recorrenciaPaiId',
      prontuarios: 'pacienteId',
      transacoes: 'id, data, tipo, pacienteId',
      users: 'id, &username',
      actionLog: '++id',
      settings: 'key',
      anexos: '++id, ownerId, ownerType',
      deletedIds: 'id, tableName, deletedAt'
    });
  }
}

export const db = new PsiGestDB();

export async function logAction(user: string, action: string) {
  if (!user) return;
  try {
    const logEntry = {
      timestamp: new Date().toLocaleString('pt-BR'),
      user: user,
      action: action
    };
    await db.actionLog.add(logEntry);
    const logCount = await db.actionLog.count();
    if (logCount > 200) {
      const logsToDelete = await db.actionLog.orderBy('id').limit(logCount - 100).keys();
      await db.actionLog.bulkDelete(logsToDelete as number[]);
    }
  } catch (error) {
    console.error("Falha ao registrar ação no DB:", error);
  }
}
