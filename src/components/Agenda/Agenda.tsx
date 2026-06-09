import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User, MoreVertical, Trash2, Edit2, MessageCircle, Mail, Shield, BarChart3, Info } from 'lucide-react';
import { db, type Appointment, type Patient, logAction } from '../../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate, getLocalDateString } from '../../lib/utils';
import AppointmentModal, { checkBookingOverlap } from './AppointmentModal';
import { syncService } from '../../lib/syncService';
import { auth } from '../../lib/firebase';
import RegistrationModal from './RegistrationModal';
import ConfirmModal from '../ui/ConfirmModal';
import useConfirm from '../../hooks/useConfirm';
import { getHoliday } from '../../utils/holidays';

function mapRecorrencia(recorrencia?: string) {
  if (!recorrencia || recorrencia === 'nao') return 'Sessão única';
  if (recorrencia === 'semanal') return 'Semanal';
  if (recorrencia === 'quinzenal') return 'Quinzenal';
  if (recorrencia === 'mensal_data' || recorrencia === 'mensal_dia_semana') return 'Mensal';
  return 'Sessão única';
}

function getCountdownText(dataStr: string, horaStr: string): string {
  const now = new Date();
  const targetDate = new Date(`${dataStr}T${horaStr}:00`);
  
  if (targetDate < now) {
    return 'Realizado';
  }
  
  const diffMs = targetDate.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  const remainingHours = diffHours % 24;
  const remainingMins = diffMins % 60;
  
  if (diffDays === 0) {
    if (diffHours === 0) {
      return `Em ${remainingMins} min`;
    }
    return `Em ${remainingHours}h ${remainingMins}m`;
  }
  
  return `Falta ${diffDays}d e ${remainingHours}h`;
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<(Appointment & { patientName?: string, patientPhoto?: string })[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [dragConfirmData, setDragConfirmData] = useState<{ app: Appointment, targetDate: string, futureApps: Appointment[] } | null>(null);

  const handleRegistration = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsRegistrationModalOpen(true);
  };
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  
  const { isOpen, confirm, close, handleConfirm, options } = useConfirm();
  const dayHoliday = getHoliday(getLocalDateString(currentDate), settings.ufState || 'SP');
  const isSunday = currentDate.getDay() === 0;
  const isSaturday = currentDate.getDay() === 6;

  useEffect(() => {
    loadAppointments();
    loadSettings();
  }, [currentDate, view]);

  const loadSettings = async () => {
    const items = await db.settings.toArray();
    const s: any = {};
    items.forEach(item => s[item.key] = item.value);
    setSettings(s);
  };

  const formatTemplate = (template: string, app: Appointment, patient: Patient) => {
    if (!template) return "";
    return template
      .replace(/{paciente}/g, patient.nome)
      .replace(/{data}/g, formatDate(app.data))
      .replace(/{hora}/g, app.hora)
      .replace(/{consultorio}/g, settings.appTitle || "Consultório");
  };

  const handleSendReceiptWA = async (app: Appointment & { patientName?: string }) => {
    const patient = await db.pacientes.get(app.pacienteId);
    if (!patient) return;

    const phone = patient.isMenor ? patient.responsavelTelefone : patient.telefone;
    if (!phone) return;

    const template = settings.appointmentMessageTemplate || "Olá {paciente}, confirmo seu agendamento para o dia {data} às {hora}. Local: {consultorio}";
    const messageText = formatTemplate(template, app, patient);
    
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  const handleSendReceiptEmail = async (app: Appointment & { patientName?: string }) => {
    const patient = await db.pacientes.get(app.pacienteId);
    if (!patient) return;

    const email = patient.isMenor ? patient.responsavelEmail : patient.email;
    if (!email) return;

    const template = settings.appointmentMessageTemplate || "Olá {paciente}, confirmo seu agendamento para o dia {data} às {hora}. Local: {consultorio}";
    const messageText = formatTemplate(template, app, patient);

    window.location.href = `mailto:${email}?subject=Confirmação de Agendamento&body=${encodeURIComponent(messageText)}`;
  };

  const loadAppointments = async () => {
    let startStr, endStr;
    
    if (view === 'day') {
      startStr = getLocalDateString(currentDate);
      endStr = startStr;
    } else if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startStr = getLocalDateString(start);
      endStr = getLocalDateString(end);
    } else {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      startStr = getLocalDateString(startOfMonth);
      endStr = getLocalDateString(endOfMonth);
    }

    const apps = await db.agendamentos
      .where('data')
      .between(startStr, endStr, true, true)
      .toArray();

    const enriched = await Promise.all(apps.map(async (app) => {
      const patient = await db.pacientes.get(app.pacienteId);
      return { 
        ...app, 
        patientName: patient?.nome || 'Paciente não encontrado',
        patientPhoto: patient?.fotoPerfilDataUrl,
        isMenor: patient?.isMenor,
        responsavelNome: patient?.responsavelNome
      };
    }));
    enriched.sort((a, b) => a.hora.localeCompare(b.hora));
    setAppointments(enriched);
  };

  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (view === 'day') {
      next.setDate(next.getDate() + 1);
    } else if (view === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const prevPeriod = () => {
    const prev = new Date(currentDate);
    if (view === 'day') {
      prev.setDate(prev.getDate() - 1);
    } else if (view === 'week') {
      prev.setDate(prev.getDate() - 7);
    } else {
      prev.setMonth(prev.getMonth() - 1);
    }
    setCurrentDate(prev);
  };

  const daysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    
    const daysArray = [];
    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    // Days of month
    for (let i = 1; i <= days; i++) {
      daysArray.push(new Date(year, month, i));
    }
    return daysArray;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = getLocalDateString(date);
    return appointments.filter(app => app.data === dateStr);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, app: Appointment) => {
    e.dataTransfer.setData('text/plain', app.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain');
    if (!appId) return;

    const app = appointments.find(a => a.id === appId);
    if (!app) return;

    if (app.data === targetDateStr) return;

    // Validate double booking
    const overlap = await checkBookingOverlap(targetDateStr, app.hora, app.id);
    if (overlap) {
      alert("Conflito de agenda: Já existe um agendamento para este mesmo dia e horário.");
      return;
    }

    try {
      const futureApps = await db.agendamentos
        .where('pacienteId')
        .equals(app.pacienteId)
        .and(a => a.data > app.data && a.status !== 'cancelled' && a.id !== app.id)
        .toArray();

      if (futureApps.length > 0) {
        setDragConfirmData({ app, targetDate: targetDateStr, futureApps });
      } else {
        await executeReschedule(app, targetDateStr, false);
      }
    } catch (error) {
      console.error("Erro ao processar movimentação:", error);
    }
  };

  const executeReschedule = async (app: Appointment, targetDateStr: string, updateSeries: boolean) => {
    try {
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';

      if (updateSeries) {
        const originalDate = new Date(app.data + 'T00:00:00');
        const newDate = new Date(targetDateStr + 'T00:00:00');
        const diffDays = Math.round((newDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));

        const futureApps = await db.agendamentos
          .where('pacienteId')
          .equals(app.pacienteId)
          .and(a => a.data > app.data && a.status !== 'cancelled' && a.id !== app.id)
          .toArray();

        for (const fApp of futureApps) {
          const fAppDate = new Date(fApp.data + 'T00:00:00');
          fAppDate.setDate(fAppDate.getDate() + diffDays);
          const newFDateStr = getLocalDateString(fAppDate);

          const hasFOverlap = await checkBookingOverlap(newFDateStr, fApp.hora, fApp.id);
          if (hasFOverlap) {
            alert(`Aviso: O agendamento futuro do dia ${fApp.data} não pôde ser atualizado para ${newFDateStr} devido a um conflito com outro paciente.`);
          } else {
            await db.agendamentos.update(fApp.id, { data: newFDateStr });
          }
        }
      }

      await db.agendamentos.update(app.id, { data: targetDateStr });
      logAction(currentUser, `Moveu agendamento ${app.id} para o dia ${targetDateStr}${updateSeries ? ' (e série futura)' : ''}`);
      
      setDragConfirmData(null);
      loadAppointments();
    } catch (error) {
      console.error("Erro ao reagendar:", error);
    }
  };

  const handleDelete = async (appointment: Appointment & { patientName?: string }) => {
    const isRecurring = appointment.recorrencia !== 'nao';
    
    // Check if patient has saved files (attachments)
    const files = await db.anexos.where('ownerId').equals(appointment.pacienteId).toArray();
    const hasFiles = files.length > 0;
    
    const warningMessage = hasFiles
      ? `\n\n⚠️ ATENÇÃO: Este paciente possui ${files.length} arquivo(s) salvos no prontuário. Se você excluir os agendamentos, poderá perder o vínculo ou dados do histórico. Recomenda-se realizar a exportação de backup do prontuário antes de prosseguir.`
      : "";

    confirm({
      title: 'Excluir Agendamento',
      message: (isRecurring 
        ? "Este é um agendamento recorrente. Deseja excluir apenas esta sessão ou toda a série?" 
        : "Deseja realmente remover este agendamento da grade fixa?") + warningMessage,
      confirmLabel: isRecurring ? 'Excluir Série Completa' : 'Excluir Sessão',
      variant: 'danger',
      onConfirm: async () => {
        const firebaseUid = auth.currentUser?.uid;
        if (isRecurring) {
          const rootId = appointment.recorrenciaPaiId || appointment.id;
          const appointmentsToDelete = await db.agendamentos
            .where('recorrenciaPaiId')
            .equals(rootId)
            .toArray();
          const ids = appointmentsToDelete.map(a => a.id);
          ids.push(rootId);

          await db.transaction('rw', db.agendamentos, async () => {
            await db.agendamentos.where('recorrenciaPaiId').equals(rootId).delete();
            await db.agendamentos.delete(rootId);
          });

          if (firebaseUid && ids.length > 0) {
            await syncService.deleteFromCloudBatch(firebaseUid, 'agendamentos', ids);
          }

          logAction(localStorage.getItem('psiCurrentUsername_v9') || 'system', `Excluiu série recorrente: ${appointment.patientName || 'Paciente'}`);
        } else {
          await db.agendamentos.delete(appointment.id);

          if (firebaseUid) {
            await syncService.removeFromCloud(firebaseUid, 'agendamentos', appointment.id);
          }

          logAction(localStorage.getItem('psiCurrentUsername_v9') || 'system', `Excluiu agendamento único: ${appointment.patientName || 'Paciente'}`);
        }
        loadAppointments();
      }
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">Agenda Clínica</h2>
          <p className="text-text-dim text-sm font-medium mt-1">Sua jornada diária de atendimentos e compromissos.</p>
        </div>
        <button
          onClick={() => {
            setSelectedAppointment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.1em] text-xs rounded-2xl transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={18} />
          Agendar Sessão
        </button>
      </div>

      <div className="bg-bg-card border border-border-subtle rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <button onClick={prevPeriod} className="p-3 bg-bg-sidebar border border-border-subtle hover:border-primary/30 rounded-2xl transition-all text-text-dim hover:text-primary"><ChevronLeft size={20} /></button>
          <div className="text-center min-w-[200px]">
            <h3 className="font-display font-black text-xs uppercase tracking-[0.3em] text-text-dim mb-1">
              {view === 'day' ? currentDate.toLocaleDateString('pt-BR', { weekday: 'long' }) : (view === 'week' ? 'Semana Clínica' : 'Calendário Mensal')}
            </h3>
            <p className="text-xl font-display font-bold text-text-main tracking-tight">
              {view === 'day' 
                ? currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : (view === 'week'
                    ? `De ${new Date(new Date(currentDate).setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a ${new Date(new Date(currentDate).setDate(currentDate.getDate() - currentDate.getDay() + 6)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
                    : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  )
              }
            </p>
          </div>
          <button onClick={nextPeriod} className="p-3 bg-bg-sidebar border border-border-subtle rounded-2xl transition-all text-text-dim hover:text-primary"><ChevronRight size={20} /></button>
        </div>
        <div className="flex bg-bg-sidebar p-1.5 rounded-2xl border border-border-subtle">
          <button 
            onClick={() => setView('day')}
            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === 'day' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main")}
          >
            Dia
          </button>
          <button 
            onClick={() => setView('week')}
            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === 'week' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main")}
          >
            Semana
          </button>
          <button 
            onClick={() => setView('month')}
            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === 'month' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main")}
          >
            Mês
          </button>
        </div>
      </div>

      {view === 'day' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Timeline View */}
          <div className="lg:col-span-8 space-y-6">
            <div className={cn(
              "flex items-center justify-between p-3 rounded-2xl border transition-all ml-2",
              dayHoliday ? "border-red-500/30 bg-red-500/5 text-red-400" :
              isSunday ? "border-purple-600/25 bg-purple-600/5 text-purple-400" :
              isSaturday ? "border-violet-500/25 bg-violet-500/5 text-violet-400" :
              "border-transparent text-text-dim"
            )}>
              <h4 className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3",
                dayHoliday ? "text-red-400" : isSunday ? "text-purple-400" : isSaturday ? "text-violet-400" : "text-text-dim"
              )}>
                <Clock size={14} className={dayHoliday ? "text-red-400" : isSunday ? "text-purple-400" : isSaturday ? "text-violet-400" : "text-primary"} /> Fluxo de Atendimentos do Dia
              </h4>
              {dayHoliday && (
                <div className="relative group flex items-center gap-1.5 cursor-pointer bg-red-500/15 px-3 py-1 rounded-full border border-red-500/30 text-red-400">
                  <Info size={12} className="shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-wider">{dayHoliday.name}</span>
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-bg-sidebar border border-border-subtle p-3 rounded-xl shadow-xl z-[250] text-[10px] font-medium text-text-main normal-case w-60 text-left">
                    Esta data é um feriado {dayHoliday.type === 'nacional' ? 'nacional' : 'estadual'}: <strong>{dayHoliday.name}</strong>.
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6 relative ml-4 pl-8 border-l-2 border-primary/10">
              {appointments.length > 0 ? (
                appointments.map((app, appIdx) => (
                  <motion.div
                    key={`day-app-v3-${app.id || appIdx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: appIdx * 0.05 }}
                    className="group bg-bg-card border border-border-subtle rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center gap-8 hover:border-primary/40 transition-all hover:shadow-2xl hover:bg-bg-sidebar/30 relative"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute top-1/2 -left-[41px] -translate-y-1/2 w-4 h-4 bg-bg-deep border-4 border-primary rounded-full z-10 shadow-[0_0_10px_rgba(56,189,248,0.3)] transition-transform group-hover:scale-125" />
                    
                    <div className="flex flex-col items-center justify-center min-w-[130px] bg-bg-sidebar rounded-3xl p-5 border border-border-subtle shadow-inner text-center select-none shrink-0">
                      <span className="text-2xl font-display font-black text-text-main tabular-nums leading-none">{app.hora}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-[0.2em] mt-2 px-3 py-1 rounded-full border",
                        app.tipo === 'online' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-primary/10 text-primary border-primary/20"
                      )}>{app.tipo}</span>
                      <div className="mt-3 pt-3 border-t border-border-subtle/30 w-full flex flex-col items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          {mapRecorrencia(app.recorrencia)}
                        </span>
                        <span className="text-[7px] font-mono font-black text-text-dim uppercase tracking-wider bg-white/5 py-0.5 px-1.5 rounded-md border border-white/5">
                          {getCountdownText(app.data, app.hora)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-14 h-14 rounded-2xl bg-bg-sidebar border border-border-subtle flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-primary/10">
                            {app.patientPhoto ? (
                              <img src={app.patientPhoto} alt={app.patientName} className="w-full h-full object-cover" />
                            ) : (
                              <User size={24} className="text-primary/40" />
                            )}
                         </div>
                         <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-bold text-text-main text-xl tracking-tight leading-tight">
                                {app.patientName}
                              </h4>
                              {app.status && app.status !== 'pending' && (
                                <span className={cn(
                                  "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border",
                                  app.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                  app.status === 'cancelled' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                  app.status === 'rescheduled' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                  {app.status === 'reagendamento' ? 'Reagendamento' : app.status}
                                </span>
                              )}
                            </div>
                            {app.isMenor && (
                              <p className="text-[9px] font-black text-primary/70 uppercase tracking-widest flex items-center gap-1.5">
                                <Shield size={10} strokeWidth={3} /> Menor de idade (Resp: {app.responsavelNome})
                              </p>
                            )}
                         </div>
                      </div>
                      {app.obsAgendamento && (
                        <p className="text-xs text-text-dim/60 font-medium italic border-l-2 border-primary/10 pl-4 py-1 ml-18 bg-bg-sidebar/20 rounded-r-xl">
                          "{app.obsAgendamento}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => handleRegistration(app)}
                        className="p-4 bg-primary/90 text-bg-deep rounded-2xl hover:bg-primary transition-all shadow-lg shadow-primary/20"
                        title="Registrar Atendimento"
                      >
                        <Plus size={20} />
                      </button>
                      
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleSendReceiptWA(app)}
                          className="p-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-green-500 hover:bg-green-500/10 transition-all"
                          title="WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleSendReceiptEmail(app)}
                          className="p-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-primary hover:bg-primary/10 transition-all"
                          title="E-mail"
                        >
                          <Mail size={16} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleEdit(app)}
                          className="p-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-text-dim hover:text-text-main transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(app)}
                          className="p-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-text-dim hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-24 bg-bg-card/20 border-2 border-dashed border-border-subtle rounded-[3rem] flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-bg-sidebar flex items-center justify-center text-text-dim/10 mb-8 border border-border-subtle">
                    <CalendarIcon size={48} />
                  </div>
                  <h3 className="text-lg font-display font-medium text-text-dim/60">Sem compromissos fixados para este dia.</h3>
                  <button onClick={() => setIsModalOpen(true)} className="mt-8 px-10 py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-bg-deep transition-all shadow-xl">
                    Agendar Agora
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats / Info Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-16 -mt-16" />
               <h3 className="text-[11px] font-black text-text-dim uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                 <BarChart3 size={16} className="text-primary" /> Resumo Clínico do Dia
               </h3>
               
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Atendimentos Totais</span>
                     <span className="text-2xl font-display font-black text-text-main tabular-nums">{appointments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Modalidade Online</span>
                     <span className="text-2xl font-display font-black text-blue-400 tabular-nums">
                       {appointments.filter(a => a.tipo === 'online').length}
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Finalizados</span>
                     <span className="text-2xl font-display font-black text-green-500 tabular-nums">
                       {appointments.filter(a => a.status === 'completed').length}
                     </span>
                  </div>

                  <div className="pt-8 border-t border-border-subtle mt-10">
                    <div className="bg-bg-sidebar p-6 rounded-3xl border border-border-subtle">
                       <MapPin size={24} className="text-primary mb-4" />
                       <h4 className="text-sm font-bold text-text-main mb-2">Ambiente de Operação</h4>
                       <p className="text-[10px] text-text-dim leading-relaxed font-medium uppercase tracking-widest opacity-60">
                         {settings.appTitle || "Clínica de Psicologia"} <br />
                         Status de Sincronização: Ativo
                       </p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-primary/95 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-bl-[8rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
               <h3 className="text-2xl font-display font-black text-bg-deep tracking-tighter leading-none mb-6">Foco na <br />Jornada</h3>
               <p className="text-bg-deep/70 text-sm font-medium leading-relaxed mb-10">
                 Mantenha o olhar humanizado em cada evolução. A tecnologia apoia, a clínica cura.
               </p>
               <div className="w-16 h-1 w-full bg-bg-deep/20 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-bg-deep" />
               </div>
            </div>
          </div>
        </div>
      ) : view === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - currentDate.getDay() + i);
            const dateStr = getLocalDateString(date);
            const dayApps = appointments.filter(app => app.data === dateStr);
            const isToday = date.toDateString() === new Date().toDateString();
            const weekHoliday = getHoliday(dateStr, settings.ufState || 'SP');
            const isSunday = date.getDay() === 0;
            const isSaturday = date.getDay() === 6;

            return (
              <div 
                key={i} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
                className={cn(
                  "bg-bg-card border border-border-subtle rounded-3xl p-4 flex flex-col min-h-[400px] transition-all",
                  isToday && "ring-2 ring-primary bg-primary/5",
                  weekHoliday ? "border-red-500/30 bg-red-500/5 text-red-400" :
                  isSunday ? "border-purple-600/30 bg-purple-600/5 text-purple-400" :
                  isSaturday ? "border-violet-500/30 bg-violet-500/5 text-violet-400" : ""
                )}
              >
                <div className="text-center mb-4 pb-4 border-b border-border-subtle relative flex flex-col items-center justify-center">
                  <p className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    weekHoliday ? "text-red-400" : isSunday ? "text-purple-400" : isSaturday ? "text-violet-400" : "text-text-dim"
                  )}>
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 justify-center">
                    <p className={cn(
                      "text-xl font-display font-black",
                      isToday ? "text-primary" : (weekHoliday ? "text-red-400" : isSunday ? "text-purple-400" : isSaturday ? "text-violet-400" : "text-text-main")
                    )}>
                      {date.getDate()}
                    </p>
                    {weekHoliday && (
                      <div className="relative group cursor-pointer text-red-400 hover:text-red-300 flex items-center">
                        <Info size={12} />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-bg-sidebar border border-border-subtle p-3 rounded-xl shadow-xl z-50 text-[10px] font-medium text-text-main normal-case w-48 text-center leading-normal">
                          Feriado: <strong>{weekHoliday.name}</strong> ({weekHoliday.type})
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto scroller-hide">
                  {dayApps.length > 0 ? dayApps.map((app, appIdx) => (
                    <div 
                      key={`week-app-v2-${app.id || appIdx}-${appIdx}`} 
                      onClick={() => handleEdit(app)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, app)}
                      className="group p-3 bg-bg-sidebar/40 border border-border-subtle rounded-2xl hover:border-primary/40 transition-all cursor-pointer relative"
                    >
                      <p className="text-[10px] font-black text-primary mb-1">{app.hora}</p>
                      <p className="text-[11px] font-bold text-text-main line-clamp-2">{app.patientName}</p>
                      <div className="mt-2 flex items-center justify-between border-b border-border-subtle/30 pb-2 mb-2">
                         <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-bg-deep", app.tipo === 'online' ? "text-blue-400" : "text-primary")}>{app.tipo}</span>
                         {app.status && app.status !== 'pending' && <span className={cn(
                           "text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded ml-1",
                           app.status === 'completed' ? "bg-green-500/10 text-green-500" :
                           app.status === 'cancelled' ? "bg-red-500/10 text-red-500" :
                           app.status === 'rescheduled' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                         )}>{app.status === 'reagendamento' ? 'Reag.' : app.status[0].toUpperCase() + app.status.slice(1, 3)}</span>}
                      </div>
                      <div className="flex flex-col gap-1 select-none">
                        <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">
                          {mapRecorrencia(app.recorrencia)}
                        </span>
                        <span className="text-[7.5px] font-mono font-bold text-text-dim/80">
                          {getCountdownText(app.data, app.hora)}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex items-center justify-center opacity-20 italic text-[10px] text-center px-4">
                      Vazio
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setCurrentDate(date);
                    setSelectedAppointment(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-4 w-full py-2 border border-dashed border-border-subtle rounded-xl text-[9px] font-black text-text-dim uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            );
          })}
        </div>
) : (
        <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
           <div className="grid grid-cols-7 gap-px bg-border-subtle/20 border border-border-subtle/50 rounded-2xl overflow-hidden">
             {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
               <div key={day} className="bg-bg-sidebar/50 py-4 text-center text-[10px] font-black uppercase tracking-widest text-text-dim border-b border-border-subtle/30">
                 {day}
               </div>
             ))}
             {daysInMonth().map((date, idx) => {
               const dayApps = date ? getAppointmentsForDay(date) : [];
               const isToday = date && date.toDateString() === new Date().toDateString();
               const isSelected = date && date.toDateString() === currentDate.toDateString();
               const isHovered = hoveredDay && date && date.toDateString() === hoveredDay.toDateString();
               const dateStr = date ? getLocalDateString(date) : '';
               const monthHoliday = date ? getHoliday(dateStr, settings.ufState || 'SP') : null;
               const isSunday = date && date.getDay() === 0;
               const isSaturday = date && date.getDay() === 6;

               return (
                 <div 
                   key={idx} 
                   onClick={() => date && setCurrentDate(date)}
                   onMouseEnter={() => date && setHoveredDay(date)}
                   onMouseLeave={() => setHoveredDay(null)}
                   onDragOver={date ? handleDragOver : undefined}
                   onDrop={date ? (e) => handleDrop(e, dateStr) : undefined}
                   className={cn(
                     "min-h-[140px] bg-bg-card p-4 transition-all cursor-pointer group hover:bg-white/[0.03] border-r border-b border-border-subtle/10 relative",
                     !date && "bg-bg-deep/20 pointer-events-none",
                     isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                     monthHoliday ? "bg-red-500/5 hover:bg-red-500/10 border-red-500/20 text-red-400" :
                     isSunday ? "bg-purple-600/5 hover:bg-purple-600/10 border-purple-600/20 text-purple-400" :
                     isSaturday ? "bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/20 text-violet-400" : ""
                   )}
                 >
                   {date && (
                     <>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-[10px] font-black tabular-nums transition-all",
                              isToday ? "w-7 h-7 rounded-lg bg-primary text-bg-deep flex items-center justify-center shadow-lg shadow-primary/20" : 
                              (monthHoliday ? "text-red-400" : isSunday ? "text-purple-400" : isSaturday ? "text-violet-400" : "text-text-dim group-hover:text-text-main")
                            )}>
                              {date.getDate()}
                            </span>
                            {monthHoliday && (
                              <div className="relative group cursor-pointer text-red-400 hover:text-red-300 flex items-center">
                                <Info size={12} />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-bg-sidebar border border-border-subtle p-3 rounded-xl shadow-xl z-[250] text-[10px] font-medium text-text-main normal-case w-48 text-center leading-normal">
                                  Feriado: <strong>{monthHoliday.name}</strong> ({monthHoliday.type})
                                </div>
                              </div>
                            )}
                          </div>
                          {dayApps.length > 0 && (
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                              {dayApps.length}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1.5 h-[60px] overflow-hidden">
                           {dayApps.slice(0, 2).map((app, appIdx) => (
                             <div 
                               key={`month-app-v2-${app.id || appIdx}-${appIdx}`}
                               draggable={true}
                               onDragStart={(e) => {
                                 e.stopPropagation();
                                 handleDragStart(e, app);
                               }}
                               className="text-[9px] font-bold text-text-main/70 truncate bg-bg-sidebar/40 border border-border-subtle/30 px-2 py-1.5 rounded-lg flex items-center gap-2 group-hover:border-primary/20 transition-all shadow-sm cursor-grab active:cursor-grabbing"
                             >
                               <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", app.tipo === 'sessão' ? "bg-primary" : (app.tipo === 'online' ? "bg-blue-400" : "bg-purple-400"))} />
                               <span className="tabular-nums opacity-60 shrink-0">{app.hora}</span>
                               <span className="truncate">{app.patientName}</span>
                             </div>
                           ))}
                           {dayApps.length > 2 && (
                             <div className="text-[8px] font-black text-text-dim text-center uppercase tracking-widest mt-1.5 opacity-60">
                               + {dayApps.length - 2} eventos
                             </div>
                           )}
                        </div>

                        {/* Hover Popover */}
                        <AnimatePresence>
                          {isHovered && dayApps.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: idx < 14 ? -10 : 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: idx < 14 ? -10 : 10, scale: 0.95 }}
                              className={cn(
                                "absolute left-1/2 -translate-x-1/2 w-[450px] bg-bg-sidebar border border-border-subtle rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-[200] p-5 transition-all",
                                idx < 14 
                                  ? "top-[calc(100%+12px)] before:bottom-full before:border-b-border-subtle after:bottom-full after:border-b-bg-sidebar" 
                                  : "bottom-[calc(100%+12px)] before:top-full before:border-t-border-subtle after:top-full after:border-t-bg-sidebar",
                                "before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent",
                                "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:border-[7px] after:border-transparent"
                              )}
                            >
                               <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                      <CalendarIcon size={16} />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">{date.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                                      <p className="text-sm font-bold text-text-main">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                  </div>
                                  <div className="bg-primary/10 px-2 py-1 rounded-lg">
                                    <span className="text-[10px] font-black text-primary">{dayApps.length}</span>
                                  </div>
                               </div>
                               <div className="space-y-3 max-h-[350px] overflow-y-auto scroller-hide pr-1">
                                  {dayApps.map((app, appIdx) => (
                                    <div key={`popover-app-v2-${app.id || appIdx}-${appIdx}`} className="group/item flex items-center gap-3 bg-white/[0.03] border border-white/5 p-3 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all">
                                       <div className="text-[10px] font-black text-primary tabular-nums shrink-0 border-r border-white/5 pr-3 flex items-center">
                                          {app.hora}
                                       </div>
                                       <div className="flex-grow min-w-0">
                                          <p className="text-[12px] font-bold text-text-main whitespace-nowrap overflow-hidden text-ellipsis">{app.patientName}</p>
                                          {app.status && app.status !== 'pending' && (
                                             <span className={cn(
                                               "text-[7px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md border inline-block mb-1",
                                               app.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                               app.status === 'cancelled' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                               app.status === 'rescheduled' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                             )}>
                                               {app.status}
                                             </span>
                                          )}
                                          {app.isMenor && (
                                            <p className="text-[8px] font-black text-primary uppercase tracking-widest leading-none flex items-center gap-1 mt-0.5">
                                              <Shield size={8} /> Menor (Resp: {app.responsavelNome})
                                            </p>
                                          )}
                                          <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mt-0.5">{app.tipo}</p>
                                       </div>
                                       <div className="flex items-center gap-1.5 opacity-100 transition-all scale-100 shrink-0">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendReceiptWA(app);
                                            }}
                                            className="p-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-all"
                                            title="WhatsApp"
                                          >
                                            <MessageCircle size={12} />
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendReceiptEmail(app);
                                            }}
                                            className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-bg-deep rounded-lg transition-all"
                                            title="E-mail"
                                          >
                                            <Mail size={12} />
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEdit(app);
                                            }}
                                            className="p-2 bg-white/5 hover:bg-primary hover:text-bg-deep rounded-lg transition-all"
                                          >
                                            <Edit2 size={12} />
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(app);
                                            }}
                                            className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </>
                   )}
                 </div>
               );
             })}
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

      <AnimatePresence>
        {dragConfirmData && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDragConfirmData(null)}
              className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card border border-border-subtle w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative z-10 text-center uppercase"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 mx-auto border border-amber-500/20">
                <Clock size={28} />
              </div>
              <h3 className="text-lg font-display font-bold text-text-main mb-3 tracking-wider">Reagendamento de Série</h3>
              <p className="text-xs text-text-dim leading-relaxed max-w-sm mb-8 font-medium">
                Você alterou a data deste atendimento ao arrastar. Deseja aplicar esta alteração apenas a esta sessão ou a todos os agendamentos futuros deste paciente?
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  type="button"
                  onClick={() => executeReschedule(dragConfirmData.app, dragConfirmData.targetDate, false)}
                  className="w-full py-4 bg-primary text-bg-deep font-black text-[10px] tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
                >
                  Apenas esta sessão
                </button>
                <button
                  type="button"
                  onClick={() => executeReschedule(dragConfirmData.app, dragConfirmData.targetDate, true)}
                  className="w-full py-4 bg-indigo-500 text-white font-black text-[10px] tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
                >
                  Toda a série futura
                </button>
                <button
                  type="button"
                  onClick={() => setDragConfirmData(null)}
                  className="w-full py-4 bg-bg-sidebar border border-border-subtle text-text-dim hover:text-text-main font-black text-[10px] tracking-widest rounded-2xl transition-all uppercase cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isModalOpen && (
        <AppointmentModal
          appointment={selectedAppointment}
          initialDate={currentDate}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            loadAppointments();
          }}
        />
      )}

      {isRegistrationModalOpen && (
        <RegistrationModal
          appointment={selectedAppointment}
          isOpen={isRegistrationModalOpen}
          onClose={() => {
            setIsRegistrationModalOpen(false);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
