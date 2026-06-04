import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar as CalendarIcon, Link as LinkIcon, Plus, Trash2, CalendarClock, Ban, User, MessageCircle, Shield } from 'lucide-react';
import { db, type Appointment, type Patient, logAction } from '../../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { getHoliday } from '../../utils/holidays';
import { syncService } from '../../lib/syncService';
import { auth } from '../../lib/firebase';

export const checkBookingOverlap = async (dataStr: string, horaStr: string, excludeAppId?: string): Promise<boolean> => {
  const appsOnDate = await db.agendamentos.where('data').equals(dataStr).toArray();
  return appsOnDate.some(app => {
    if (excludeAppId && app.id === excludeAppId) return false;
    if (app.status === 'cancelled' || app.status === 'rescheduled') return false;
    return app.hora === horaStr;
  });
};

interface AppointmentModalProps {
  appointment: Appointment | null;
  initialDate: Date;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentModal({ appointment, initialDate, isOpen, onClose }: AppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [ufState, setUfState] = useState('SP');
  const [showUpdateSeriesConfirm, setShowUpdateSeriesConfirm] = useState(false);
  const [showRecurrenceDocConfirm, setShowRecurrenceDocConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    pacienteId: '',
    data: initialDate.toISOString().split('T')[0],
    hora: '',
    tipo: 'individual',
    recorrencia: 'nao',
    obsAgendamento: '',
    linksSessao: [],
    status: 'pending'
  });

  useEffect(() => {
    db.pacientes.toArray().then(setPatients);
    db.settings.get('ufState').then(item => {
      if (item) setUfState(item.value);
    });
    setIsRescheduling(false);
    setShowUpdateSeriesConfirm(false);
    setShowRecurrenceDocConfirm(false);
    if (appointment) {
      setFormData(appointment);
    } else {
      setFormData({
        pacienteId: '',
        data: initialDate.toISOString().split('T')[0],
        hora: '',
        tipo: 'individual',
        recorrencia: 'nao',
        obsAgendamento: '',
        linksSessao: [],
        status: 'pending'
      });
    }
  }, [appointment, initialDate, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addLink = () => {
    const links = [...(formData.linksSessao || []), { titulo: '', url: '' }];
    setFormData({ ...formData, linksSessao: links });
  };

  const removeLink = (index: number) => {
    const links = (formData.linksSessao || []).filter((_, i) => i !== index);
    setFormData({ ...formData, linksSessao: links });
  };

  const updateLink = (index: number, field: 'titulo' | 'url', value: string) => {
    const links = [...(formData.linksSessao || [])];
    links[index][field] = value;
    setFormData({ ...formData, linksSessao: links });
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    try {
      await db.agendamentos.update(appointment.id, { status: 'cancelled' });
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
      logAction(currentUser, `Cancelou agendamento de: ${formData.pacienteId}`);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const generateRecurrences = async (rootId: string, baseData: Partial<Appointment>) => {
    if (baseData.recorrencia === 'nao') return;

    const startDate = new Date(baseData.data + 'T00:00:00');
    const occurrences = 52; 

    for (let i = 1; i < occurrences; i++) {
      const nextDate = new Date(startDate);
      if (baseData.recorrencia === 'semanal') nextDate.setDate(startDate.getDate() + (7 * i));
      if (baseData.recorrencia === 'quinzenal') nextDate.setDate(startDate.getDate() + (14 * i));
      if (baseData.recorrencia === 'mensal_data') nextDate.setMonth(startDate.getMonth() + i);

      const dateStr = nextDate.toISOString().split('T')[0];
      const overlap = await checkBookingOverlap(dateStr, baseData.hora!);
      if (!overlap) {
        await db.agendamentos.add({
          ...baseData,
          id: `${rootId}_rec_${i}`,
          data: dateStr,
          recorrenciaPaiId: rootId
        } as Appointment);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.data || !formData.hora) return;

    try {
      // Prevent double bookings
      const hasOverlap = await checkBookingOverlap(formData.data, formData.hora, isRescheduling ? undefined : appointment?.id);
      if (hasOverlap) {
        alert("Conflito de agenda: Já existe um agendamento para este mesmo dia e horário.");
        return;
      }

      // Check if date is a holiday
      const holiday = getHoliday(formData.data, ufState);
      if (holiday) {
        const confirmMsg = `Atenção: A data selecionada (${formData.data}) coincide com o feriado ${holiday.type === 'nacional' ? 'nacional' : 'estadual'}: ${holiday.name}.\n\nDeseja realizar o agendamento mesmo assim?`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }

      // Check if recurrence changed
      const recurrenceChanged = appointment && formData.recorrencia !== appointment.recorrencia;
      if (recurrenceChanged) {
        setShowRecurrenceDocConfirm(true);
        return;
      }

      // Check if date/time changed for existing appointment and if they have future appointments
      if (appointment && (formData.data !== appointment.data || formData.hora !== appointment.hora)) {
        const futureApps = await db.agendamentos
          .where('pacienteId')
          .equals(formData.pacienteId)
          .and(a => a.data > appointment.data && a.status !== 'cancelled' && a.id !== appointment.id)
          .toArray();

        if (futureApps.length > 0) {
          setShowUpdateSeriesConfirm(true);
          return;
        }
      }

      await handleSaveConfirmed(false, false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveConfirmed = async (updateSeries: boolean, deleteDocs: boolean = false) => {
    try {
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';

      if (isRescheduling && appointment) {
        // Mark original as rescheduled
        await db.agendamentos.update(appointment.id, { status: 'rescheduled' });
        
        // Create new one as reagendamento
        const id = crypto.randomUUID();
        const newApp = { 
          ...formData, 
          id, 
          status: 'reagendamento',
          recorrencia: 'nao'
        } as Appointment;
        delete (newApp as any).recorrenciaPaiId;
        
        await db.agendamentos.add(newApp);
        logAction(currentUser, `Reagendou sessão de: ${formData.pacienteId}`);
      } else if (appointment) {
        const recurrenceChanged = formData.recorrencia !== appointment.recorrencia;

        // Run series update if selected and recurrence has not changed
        if (updateSeries && !recurrenceChanged) {
          const originalDate = new Date(appointment.data + 'T00:00:00');
          const newDate = new Date(formData.data! + 'T00:00:00');
          const diffDays = Math.round((newDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));

          const futureApps = await db.agendamentos
            .where('pacienteId')
            .equals(formData.pacienteId!)
            .and(a => a.data > appointment.data && a.status !== 'cancelled' && a.id !== appointment.id)
            .toArray();

          for (const fApp of futureApps) {
            const fAppDate = new Date(fApp.data + 'T00:00:00');
            fAppDate.setDate(fAppDate.getDate() + diffDays);
            const newFDateStr = fAppDate.toISOString().split('T')[0];

            const hasFOverlap = await checkBookingOverlap(newFDateStr, formData.hora!, fApp.id);
            if (hasFOverlap) {
              alert(`Aviso: O agendamento futuro do dia ${fApp.data} não pôde ser atualizado para ${newFDateStr} devido a um conflito com outro paciente.`);
            } else {
              await db.agendamentos.update(fApp.id, {
                data: newFDateStr,
                hora: formData.hora
              });
            }
          }
        }

        // If recurrence type has changed, adjust future appointments
        if (recurrenceChanged) {
          const oldRootId = appointment.recorrenciaPaiId || appointment.id;
          const firebaseUid = auth.currentUser?.uid;

          // Fetch old appointments to delete
          const appointmentsToDelete = await db.agendamentos
            .where('recorrenciaPaiId')
            .equals(oldRootId)
            .and(a => a.data > appointment.data && a.id !== appointment.id)
            .toArray();
          const idsToDelete = appointmentsToDelete.map(a => a.id);

          // Delete future occurrences of the old series
          await db.agendamentos
            .where('recorrenciaPaiId')
            .equals(oldRootId)
            .and(a => a.data > appointment.data && a.id !== appointment.id)
            .delete();

          if (firebaseUid && idsToDelete.length > 0) {
            await syncService.deleteFromCloudBatch(firebaseUid, 'agendamentos', idsToDelete);
          }

          // Delete medical records and attachments if user selected to delete
          if (deleteDocs) {
            await db.prontuarios.delete(formData.pacienteId!);
            if (firebaseUid) {
              await syncService.removeFromCloud(firebaseUid, 'prontuarios', formData.pacienteId!);
            }

            const attachments = await db.anexos.where('ownerId').equals(formData.pacienteId!).toArray();
            const attachmentIds = attachments.map(a => String(a.id));
            await db.anexos.where('ownerId').equals(formData.pacienteId!).delete();

            if (firebaseUid && attachmentIds.length > 0) {
              await syncService.deleteFromCloudBatch(firebaseUid, 'anexos', attachmentIds);
            }
          }

          // Generate new occurrences if new recurrence is active
          if (formData.recorrencia && formData.recorrencia !== 'nao') {
            formData.recorrenciaPaiId = undefined; // convert this appointment into the new root
            await generateRecurrences(appointment.id, {
              ...formData,
              recorrenciaPaiId: undefined
            });
          } else {
            formData.recorrenciaPaiId = undefined; // clear old parent reference
          }
        }

        await db.agendamentos.update(appointment.id, formData);
        logAction(currentUser, `Editou agendamento de: ${formData.pacienteId}${updateSeries ? ' (e série futura)' : ''}`);
      } else {
        const id = crypto.randomUUID();
        const newApp = { ...formData, id } as Appointment;
        await db.agendamentos.add(newApp);
        
        if (formData.recorrencia && formData.recorrencia !== 'nao') {
          await generateRecurrences(id, formData);
        }
        
        logAction(currentUser, `Criou agendamento para: ${formData.pacienteId}`);
      }

      setShowUpdateSeriesConfirm(false);
      setShowRecurrenceDocConfirm(false);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-text-main">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-bg-card border border-border-subtle w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            
            <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-bg-sidebar/50">
              <div>
                <h2 className="text-xl font-display font-bold text-text-main tracking-tight">
                  {isRescheduling ? 'Reagendamento de Sessão' : (appointment ? 'Gerenciar Sessão' : 'Nova Reserva de Agenda')}
                </h2>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mt-1">
                  {isRescheduling ? 'Alterando data original para novo ciclo' : 'Configuração de atendimento clínico'}
                </p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-bg-card rounded-2xl transition-all text-text-dim hover:text-red-400 border border-transparent hover:border-border-subtle">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-8 h-[600px] overflow-y-auto scroller-hide">
              {appointment && appointment.status === 'cancelled' && !isRescheduling && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                  <Ban className="text-red-500" size={18} />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Este agendamento consta como CANCELADO</span>
                </div>
              )}

              {appointment && appointment.status === 'rescheduled' && !isRescheduling && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                  <CalendarClock className="text-amber-500" size={18} />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Este agendamento foi REAGENDADO</span>
                </div>
              )}

              {/* Seção 1: Identificação */}
              <div className="bg-bg-sidebar/30 p-6 rounded-[2rem] border border-border-subtle group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={16} /></div>
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-widest">Identificação do Paciente</h3>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Paciente Integrado</label>
                  <select
                    name="pacienteId"
                    value={formData.pacienteId}
                    onChange={handleInputChange}
                    required
                    disabled={!!appointment && !isRescheduling}
                    className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold transition-all appearance-none cursor-pointer disabled:opacity-60"
                  >
                    <option value="">Buscar na base de dados...</option>
                    {patients.map((p, pIdx) => (
                      <option key={`opt-patient-modal-${p.id || pIdx}`} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seção 2: Referência Temporal */}
              <div className="bg-bg-sidebar/30 p-6 rounded-[2rem] border border-border-subtle group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><Clock size={16} /></div>
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-widest">Programação de Horário</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <CalendarIcon size={12} className="text-primary/40" /> {isRescheduling ? 'Nova Data' : 'Data Prevista'}
                    </label>
                    <input
                      type="date"
                      name="data"
                      value={formData.data}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-bold tabular-nums"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Clock size={12} className="text-primary/40" /> {isRescheduling ? 'Novo Horário' : 'Horário'}
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={formData.hora}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-bold tabular-nums"
                    />
                  </div>
                </div>

                {!isRescheduling && (
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Modalidade</label>
                      <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-[11px] font-black uppercase tracking-widest cursor-pointer text-primary"
                      >
                        <option value="individual">Presencial</option>
                        <option value="online">Online</option>
                        <option value="grupo">Em Grupo</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Frequência</label>
                      <select
                        name="recorrencia"
                        value={formData.recorrencia}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-[11px] font-black uppercase tracking-widest cursor-pointer"
                      >
                        <option value="nao">Sessão Única</option>
                        <option value="semanal">Semanalmente</option>
                        <option value="quinzenal">Quinzenalmente</option>
                        <option value="mensal_data">Mensal (Mesmo Dia)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção 3: Detalhamento Técnico */}
              <div className="bg-bg-sidebar/30 p-6 rounded-[2.5rem] border border-border-subtle group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><MessageCircle size={16} /></div>
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-widest">Informações Adicionais</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Briefing da Sessão</label>
                    <textarea
                      name="obsAgendamento"
                      value={formData.obsAgendamento}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all resize-none text-sm font-medium placeholder:text-text-dim/20"
                      placeholder="Foco clínico, pendências ou contexto..."
                    />
                  </div>

                  {!isRescheduling && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                          <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.1em] flex items-center gap-2">
                            <LinkIcon size={12} className="text-primary/40" /> Salas de Conferência
                          </label>
                          <button type="button" onClick={addLink} className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-hover flex items-center gap-1 transition-colors bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
                            <Plus size={12} /> Conectar
                          </button>
                      </div>
                      <div className="space-y-3">
                        {formData.linksSessao?.map((link, lIdx) => (
                          <div key={`link-v3-modal-${lIdx}`} className="flex gap-3 group">
                            <input
                              type="text"
                              value={link.titulo}
                              onChange={(e) => updateLink(lIdx, 'titulo', e.target.value)}
                              placeholder="Nome (Ex: Meet)"
                              className="w-1/3 px-4 py-3 bg-bg-sidebar border border-border-subtle rounded-xl text-xs font-bold outline-none focus:border-primary/40 transition-all placeholder:text-text-dim/10"
                            />
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => updateLink(lIdx, 'url', e.target.value)}
                              placeholder="URL de acesso"
                              className="flex-grow px-4 py-3 bg-bg-sidebar border border-border-subtle rounded-xl text-xs font-medium outline-none focus:border-primary/40 transition-all placeholder:text-text-dim/10"
                            />
                            <button type="button" onClick={() => removeLink(lIdx)} className="p-3 text-text-dim hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-border-subtle mt-10">
                <div className="flex gap-3">
                  {appointment && !isRescheduling && appointment.status !== 'cancelled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                      >
                        <CalendarClock size={16} /> Reagendar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAppointment}
                        className="flex items-center gap-2 px-6 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Ban size={16} /> Cancelar
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-bg-sidebar transition-all text-text-dim hover:text-text-main shadow-inner"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className={cn(
                      "px-10 py-4 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all flex items-center gap-3 hover:-translate-y-0.5 active:scale-95",
                      isRescheduling 
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25" 
                        : "bg-primary hover:bg-primary-hover text-bg-deep shadow-primary/25"
                    )}
                  >
                    <Save size={18} /> {isRescheduling ? 'Confirmar Reagendamento' : 'Confirmar Reserva'}
                  </button>
                </div>
              </div>
            </form>

            {showUpdateSeriesConfirm && (
              <div className="absolute inset-0 bg-bg-deep/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20">
                  <Clock size={28} />
                </div>
                <h3 className="text-lg font-display font-bold text-text-main mb-3 uppercase tracking-wider">Reagendamento de Série</h3>
                <p className="text-xs text-text-dim leading-relaxed max-w-sm mb-8 font-medium">
                  Você alterou o horário/data deste atendimento. Deseja aplicar esta alteração apenas a esta sessão ou a todos os agendamentos futuros deste paciente?
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => handleSaveConfirmed(false)}
                    className="w-full py-4 bg-primary text-bg-deep font-black text-[10px] tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
                  >
                    Apenas esta sessão
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveConfirmed(true)}
                    className="w-full py-4 bg-indigo-500 text-white font-black text-[10px] tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
                  >
                    Toda a série futura
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateSeriesConfirm(false)}
                    className="w-full py-4 bg-bg-sidebar border border-border-subtle text-text-dim hover:text-text-main font-black text-[10px] tracking-widest rounded-2xl transition-all uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {showRecurrenceDocConfirm && (
              <div className="absolute inset-0 bg-bg-deep/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 border border-indigo-500/20">
                  <Shield size={28} />
                </div>
                <h3 className="text-lg font-display font-bold text-text-main mb-3 uppercase tracking-wider">Alteração de Recorrência</h3>
                <p className="text-xs text-text-dim leading-relaxed max-w-sm mb-8 font-medium">
                  Você alterou a modalidade de recorrência. Deseja manter o prontuário clínico e todos os documentos já salvos deste paciente ou prefere apagá-los?
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => handleSaveConfirmed(false, false)}
                    className="w-full py-4 bg-primary text-bg-deep font-black text-[10px] tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
                  >
                    Manter prontuário e documentos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveConfirmed(false, true)}
                    className="w-full py-4 bg-red-500 text-white font-black text-[10px] tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
                  >
                    Apagar prontuário e documentos
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecurrenceDocConfirm(false)}
                    className="w-full py-4 bg-bg-sidebar border border-border-subtle text-text-dim hover:text-text-main font-black text-[10px] tracking-widest rounded-2xl transition-all uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
