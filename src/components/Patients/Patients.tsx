import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, UserPlus, Filter, Trash2, Edit2, FileText, Calendar as CalendarIcon, ExternalLink, LayoutGrid, List, MessageCircle, Mail, Shield, Users } from 'lucide-react';
import { db, type Patient, logAction } from '../../lib/db';
import { cn, formatDate, calculateAge, formatCurrency } from '../../lib/utils';
import { syncService } from '../../lib/syncService';
import { auth } from '../../lib/firebase';
import PatientModal from './PatientModal';
import ConfirmModal from '../ui/ConfirmModal';
import useConfirm from '../../hooks/useConfirm';

interface PatientsProps {
  onOpenProntuario?: (patientId: string) => void;
}

export default function Patients({ onOpenProntuario }: PatientsProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ativo' | 'inativo' | 'todos'>('ativo');
  
  const { isOpen, confirm, close, handleConfirm, options } = useConfirm();

  useEffect(() => {
    loadPatients();
  }, [searchTerm, statusFilter]);

  const loadPatients = async () => {
    let all = await db.pacientes.toArray();

    if (searchTerm) {
      all = all.filter(p => 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.cpf && p.cpf.includes(searchTerm)) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'todos') {
      all = all.filter(p => {
        const patientStatus = p.status || 'ativo';
        return patientStatus === statusFilter;
      });
    }

    all.sort((a, b) => a.nome.localeCompare(b.nome));
    setPatients(all);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name},`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleDelete = (id: string, nome: string) => {
    confirm({
      title: 'Excluir Paciente',
      message: `Deseja realmente excluir o paciente ${nome}? Todos os agendamentos, prontuários e transações também serão removidos definitivamente conforme diretrizes de limpeza LGPD.`,
      confirmLabel: 'Excluir Definitivamente',
      variant: 'danger',
      onConfirm: async () => {
        const appts = await db.agendamentos.where('pacienteId').equals(id).toArray();
        const apptIds = appts.map(a => a.id);
        const trans = await db.transacoes.where('pacienteId').equals(id).toArray();
        const transIds = trans.map(t => t.id);

        await db.transaction('rw', [db.pacientes, db.agendamentos, db.prontuarios, db.transacoes], async () => {
          await db.pacientes.delete(id);
          await db.agendamentos.where('pacienteId').equals(id).delete();
          await db.prontuarios.where('pacienteId').equals(id).delete();
          await db.transacoes.where('pacienteId').equals(id).delete();
        });

        const firebaseUid = auth.currentUser?.uid;
        if (firebaseUid) {
          await syncService.removeFromCloud(firebaseUid, 'pacientes', id);
          await syncService.removeFromCloud(firebaseUid, 'prontuarios', id);
          if (apptIds.length > 0) {
            await syncService.deleteFromCloudBatch(firebaseUid, 'agendamentos', apptIds);
          }
          if (transIds.length > 0) {
            await syncService.deleteFromCloudBatch(firebaseUid, 'transacoes', transIds);
          }
        }
        
        const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
        logAction(currentUser, `Exclusão atômica de paciente: ${nome}`);
        loadPatients();
      }
    });
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">Gestão de Pacientes</h2>
          <p className="text-text-dim text-sm font-medium mt-1">Administre o prontuário e cadastro clínico de seus pacientes.</p>
        </div>
        <button
          onClick={() => {
            setSelectedPatient(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.1em] text-xs rounded-2xl transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95"
        >
          <UserPlus size={18} />
          Novo Registro
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative group flex-grow max-w-2xl">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-dim group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar paciente por nome, CPF ou e-mail..."
            className="w-full pl-14 pr-6 py-4 bg-bg-card border border-border-subtle rounded-3xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all placeholder:text-text-dim/30 text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-bg-sidebar p-1.5 rounded-2xl border border-border-subtle shrink-0">
          {(['ativo', 'inativo', 'todos'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === filter
                  ? "bg-primary text-bg-deep shadow-lg shadow-primary/20"
                  : "text-text-dim hover:text-text-main"
              )}
            >
              {filter === 'ativo' ? 'Ativos' : filter === 'inativo' ? 'Inativos' : 'Todos'}
            </button>
          ))}
        </div>

        <div className="flex bg-bg-sidebar p-1.5 rounded-2xl border border-border-subtle shrink-0">
          <button 
            onClick={() => setView('grid')}
            className={cn(
              "p-2.5 rounded-xl transition-all", 
              view === 'grid' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
            )}
            title="Visualização em Grade"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setView('list')}
            className={cn(
              "p-2.5 rounded-xl transition-all", 
              view === 'list' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
            )}
            title="Visualização em Lista"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {patients.map((patient, pIdx) => (
              <motion.div
                key={`patient-grid-v2-${patient.id || pIdx}-${pIdx}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-bg-card/40 border border-border-subtle rounded-[2rem] p-6 hover:border-primary/40 transition-all hover:bg-bg-sidebar/50 relative overflow-hidden flex flex-col items-center shadow-xl hover:shadow-primary/5"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <button
                  onClick={() => handleDelete(patient.id, patient.nome)}
                  className="absolute top-4 right-4 p-2 text-text-dim/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-20"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>

                <div className="w-20 h-20 rounded-[2rem] bg-bg-sidebar flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-border-subtle group-hover:border-primary transition-all duration-500 mb-5 relative">
                  {patient.fotoPerfilDataUrl ? (
                    <img src={patient.fotoPerfilDataUrl} alt={patient.nome} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                  ) : (
                    <span className="text-2xl font-display font-black text-primary/40 group-hover:text-primary transition-colors">{patient.nome[0].toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="w-full text-center">
                  <h3 className="text-[13px] font-display font-bold text-text-main truncate tracking-tight mb-2 selection:bg-primary/30">
                    {patient.nome}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
                    <span className="text-[7.5px] font-black text-text-dim uppercase tracking-[0.2em] bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      {calculateAge(patient.nascimento || '')} anos
                    </span>
                    {patient.isMenor && (
                      <span className="text-[7.5px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        Menor
                      </span>
                    )}
                    {patient.status === 'inativo' && (
                      <span className="text-[7.5px] font-black text-red-400 uppercase tracking-[0.2em] bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                        Inativo
                      </span>
                    )}
                    {patient.estado && (
                      <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                        {patient.estado}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-8">
                    {patient.telefone && (
                      <button 
                        onClick={() => handleWhatsApp(patient.telefone!, patient.nome)}
                        className="w-9 h-9 flex items-center justify-center bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/5"
                      >
                        <MessageCircle size={14} />
                      </button>
                    )}
                    {patient.email && (
                      <button 
                        onClick={() => handleEmail(patient.email!)}
                        className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                      >
                        <Mail size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 w-full mt-auto">
                    <button
                      onClick={() => handleEdit(patient)}
                      className="flex items-center justify-center gap-2.5 py-3.5 bg-bg-sidebar hover:bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-text-main transition-all border border-border-subtle group-hover:border-primary/20"
                    >
                      <Edit2 size={12} className="text-primary/40 group-hover:text-primary transition-colors" /> Detalhes
                    </button>
                    <button
                      onClick={() => onOpenProntuario && onOpenProntuario(patient.id)}
                      className="flex items-center justify-center gap-2.5 py-3.5 bg-primary/10 hover:bg-primary text-primary hover:text-bg-deep rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-primary/20 shadow-xl shadow-primary/5"
                    >
                      <FileText size={12} /> Prontuário
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sidebar/50 border-b border-border-subtle/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dim">Paciente</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dim">Idade</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dim">Contato</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dim text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {patients.map((patient, pIdx) => (
                  <tr key={`patient-table-v2-${patient.id || pIdx}-${pIdx}`} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/20 transition-colors">
                          {patient.fotoPerfilDataUrl ? (
                            <img src={patient.fotoPerfilDataUrl} alt={patient.nome} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-display font-black text-primary/80">{patient.nome[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-main text-sm">{patient.nome}</span>
                          {patient.isMenor && (
                            <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1 mt-0.5">
                              <Shield size={8} /> Menor - Resp: {patient.responsavelNome}
                            </span>
                          )}
                          {patient.status === 'inativo' && (
                            <span className="text-[8px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-1 mt-0.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 w-max">
                              Inativo
                            </span>
                          )}
                          {patient.estado && (
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-1 mt-0.5 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 w-max">
                              UF: {patient.estado}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-text-dim uppercase tracking-wider">{calculateAge(patient.nascimento || '')} anos</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-between group/contact">
                          <div className="flex flex-col gap-0.5">
                             <span className="text-xs text-text-main font-medium">
                               {patient.isMenor 
                                 ? (patient.responsavelEmail || '—') 
                                 : (patient.email || '—')}
                             </span>
                             <span className="text-[10px] text-text-dim font-bold tabular-nums">
                               {patient.isMenor 
                                 ? (patient.responsavelTelefone || '—') 
                                 : (patient.telefone || '—')}
                             </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/contact:opacity-100 transition-opacity">
                            {patient.isMenor ? (
                              <>
                                {patient.responsavelTelefone && (
                                  <button onClick={() => handleWhatsApp(patient.responsavelTelefone!, patient.responsavelNome || patient.nome)} className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-500" title={`Resp: ${patient.responsavelNome}`}>
                                    <MessageCircle size={12} />
                                  </button>
                                )}
                                {patient.responsavelEmail && (
                                  <button onClick={() => handleEmail(patient.responsavelEmail!)} className="p-1.5 hover:bg-primary/10 rounded-lg text-primary" title={`Resp: ${patient.responsavelNome}`}>
                                    <Mail size={12} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {patient.telefone && (
                                  <button onClick={() => handleWhatsApp(patient.telefone!, patient.nome)} className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-500" title="WhatsApp">
                                    <MessageCircle size={12} />
                                  </button>
                                )}
                                {patient.email && (
                                  <button onClick={() => handleEmail(patient.email!)} className="p-1.5 hover:bg-primary/10 rounded-lg text-primary" title="E-mail">
                                    <Mail size={12} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {patient.telefone && (
                          <button
                            onClick={() => handleWhatsApp(patient.telefone!, patient.nome)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-green-500 transition-all border border-green-500/20"
                          >
                            <MessageCircle size={12} /> Enviar Mensagem
                          </button>
                        )}
                        {patient.email && (
                          <button
                            onClick={() => handleEmail(patient.email!)}
                            className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all border border-primary/20"
                          >
                            <Mail size={12} /> Enviar E-mail
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-text-dim hover:text-primary hover:border-primary/30 transition-all"
                          title="Detalhes"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onOpenProntuario && onOpenProntuario(patient.id)}
                          className="p-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-text-dim hover:text-blue-400 hover:border-blue-400/30 transition-all"
                          title="Prontuário"
                        >
                          <FileText size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id, patient.nome)}
                          className="p-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-text-dim hover:text-red-500 hover:border-red-500/30 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isOpen}
        title={options?.title || ''}
        message={options?.message || ''}
        confirmLabel={options?.confirmLabel}
        variant={options?.variant}
        onConfirm={handleConfirm}
        onCancel={close}
      />

      {patients.length === 0 && (
        <div className="text-center py-20 bg-bg-card/50 border-2 border-dashed border-border-subtle rounded-[2rem] animate-pulse">
          <p className="text-text-dim font-bold uppercase tracking-[0.2em] text-xs">Nenhum registro encontrado</p>
        </div>
      )}

      {isModalOpen && (
        <PatientModal
          patient={selectedPatient}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            loadPatients();
          }}
        />
      )}
    </div>
  );
}
