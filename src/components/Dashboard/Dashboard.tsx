import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  Activity, 
  UserCheck, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  Gift,
  Cake,
  MessageCircle,
  Mail,
  Send,
  X,
  Edit2,
  Play
} from 'lucide-react';
import { db, type Patient, type Appointment } from '../../lib/db';
import { motion } from 'motion/react';
import AppointmentModal from '../Agenda/AppointmentModal';
import RegistrationModal from '../Agenda/RegistrationModal';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { cn, formatDate } from '../../lib/utils';

// Helper for countdown
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
      return `${remainingMins}m`;
    }
    return `${remainingHours}h ${remainingMins}m`;
  }
  
  return `${diffDays}d ${remainingHours}h`;
}

interface DashboardProps {
  onSectionChange?: (section: string) => void;
}

export default function Dashboard({ onSectionChange }: DashboardProps = {}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Modal States for Dashboard Actions
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppForRecord, setSelectedAppForRecord] = useState<Appointment | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Estados para Lembrete de Aniversário
  const [selectedBirthdayPatient, setSelectedBirthdayPatient] = useState<Patient | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [customMessage, setCustomMessage] = useState<string>('');

  const fetchData = async () => {
    try {
      const [ps, apps, setts] = await Promise.all([
        db.pacientes.toArray(),
        db.agendamentos.toArray(),
        db.settings.toArray()
      ]);
      setPatients(ps);
      setAppointments(apps);
      const s: any = {};
      setts.forEach(item => s[item.key] = item.value);
      setSettings(s);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTemplate = (template: string, app: Appointment, patient: Patient) => {
    if (!template) return "";
    return template
      .replace(/{paciente}/g, patient.nome)
      .replace(/{data}/g, formatDate(app.data))
      .replace(/{hora}/g, app.hora)
      .replace(/{consultorio}/g, settings.appTitle || "Consultório");
  };

  const handleSendConfirmWA = async (app: Appointment) => {
    const patient = patients.find(p => p.id === app.pacienteId);
    if (!patient) return;

    const phone = patient.isMenor ? patient.responsavelTelefone : patient.telefone;
    if (!phone) return;

    const template = settings.appointmentMessageTemplate || "Olá {paciente}, confirmo seu agendamento para o dia {data} às {hora}. Local: {consultorio}";
    const messageText = formatTemplate(template, app, patient);
    
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  const handleSendConfirmEmail = async (app: Appointment) => {
    const patient = patients.find(p => p.id === app.pacienteId);
    if (!patient) return;

    const email = patient.isMenor ? patient.responsavelEmail : patient.email;
    if (!email) return;

    const template = settings.appointmentMessageTemplate || "Olá {paciente}, confirmo seu agendamento para o dia {data} às {hora}. Local: {consultorio}";
    const messageText = formatTemplate(template, app, patient);

    window.location.href = `mailto:${email}?subject=Confirmação de Agendamento&body=${encodeURIComponent(messageText)}`;
  };

  const handleConfirmDirect = async (appId: string) => {
    try {
      await db.agendamentos.update(appId, { status: 'confirmed' });
      fetchData();
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
    }
  };

  // Stats Calculations
  const activePatients = patients.length;
  const minorsCount = patients.filter(p => p.isMenor).length;
  const completedSessions = appointments.filter(a => a.status === 'completed').length;

  // Map upcoming appointments (from today onwards)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentDay = today.getDay();
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + daysUntilSunday);
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

  const upcomingAppointments = appointments
    .filter(a => a.data >= todayStr && a.data <= endOfWeekStr && a.status !== 'cancelled')
    .map(a => {
      const patient = patients.find(p => p.id === a.pacienteId);
      return {
        ...a,
        patientName: patient?.nome || 'Paciente não encontrado',
        patientPhoto: patient?.fotoPerfilDataUrl,
        telefone: patient?.telefone
      };
    });

  // Sort upcoming appointments by data ASC, hora ASC
  upcomingAppointments.sort((a, b) => {
    const dateDiff = a.data.localeCompare(b.data);
    if (dateDiff === 0) {
      return a.hora.localeCompare(b.hora);
    }
    return dateDiff;
  });
  
  const sessionsThisMonth = appointments.filter(a => {
    const d = new Date(a.data);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Map 24h pending/reagendamento appointments
  const nowTime = new Date();
  const oneDayFromNow = new Date(nowTime.getTime() + 24 * 60 * 60 * 1000);

  const pending24hAppointments = appointments
    .filter(a => {
      const appDateTime = new Date(`${a.data}T${a.hora}:00`);
      const statusMatch = a.status === 'pending' || a.status === 'reagendamento' || !a.status;
      return statusMatch && appDateTime >= nowTime && appDateTime <= oneDayFromNow;
    })
    .map(a => {
      const patient = patients.find(p => p.id === a.pacienteId);
      return {
        ...a,
        patientName: patient?.nome || 'Paciente não encontrado',
        patientPhoto: patient?.fotoPerfilDataUrl,
        telefone: patient?.telefone,
        email: patient?.email,
        isMenor: patient?.isMenor,
        responsavelTelefone: patient?.responsavelTelefone,
        responsavelEmail: patient?.responsavelEmail,
        responsavelNome: patient?.responsavelNome
      };
    });

  // Sort by date ASC, hora ASC
  pending24hAppointments.sort((a, b) => {
    const dateDiff = a.data.localeCompare(b.data);
    if (dateDiff === 0) {
      return a.hora.localeCompare(b.hora);
    }
    return dateDiff;
  });

  // Age Distribution Data
  const ageDist = [
    { name: '0-12', value: patients.filter(p => {
      const age = calculateAge(p.nascimento || '');
      return age <= 12;
    }).length },
    { name: '13-18', value: patients.filter(p => {
      const age = calculateAge(p.nascimento || '');
      return age > 12 && age <= 18;
    }).length },
    { name: '19-35', value: patients.filter(p => {
      const age = calculateAge(p.nascimento || '');
      return age > 18 && age <= 35;
    }).length },
    { name: '36-60', value: patients.filter(p => {
      const age = calculateAge(p.nascimento || '');
      return age > 35 && age <= 60;
    }).length },
    { name: '60+', value: patients.filter(p => {
      const age = calculateAge(p.nascimento || '');
      return age > 60;
    }).length },
  ];

  function calculateAge(birthday: string) {
    if (!birthday) return 0;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // --- LÓGICA DE LEMBRETE DE ANIVERSÁRIOS ---
  const getBirthdayStatus = (nascimentoStr?: string) => {
    if (!nascimentoStr) return null;
    const today = new Date();
    const [yearStr, monthStr, dayStr] = nascimentoStr.split('-');
    const bMonth = parseInt(monthStr, 10);
    const bDay = parseInt(dayStr, 10);
    
    if (isNaN(bMonth) || isNaN(bDay)) return null;

    const isToday = today.getDate() === bDay && (today.getMonth() + 1) === bMonth;
    
    let nextBirthday = new Date(today.getFullYear(), bMonth - 1, bDay);
    if (nextBirthday.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = nextBirthday.getTime() - todayZero.getTime();
    const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      isToday,
      daysRemaining,
      formattedDate: `${String(bDay).padStart(2, '0')}/${String(bMonth).padStart(2, '0')}`
    };
  };

  const birthdayKids = React.useMemo(() => {
    return patients
      .map(p => {
        const birthdayInfo = getBirthdayStatus(p.nascimento);
        return birthdayInfo ? { ...p, birthdayInfo } : null;
      })
      .filter((p): p is (Patient & { birthdayInfo: { isToday: boolean; daysRemaining: number; formattedDate: string } }) => p !== null)
      .filter(p => p.birthdayInfo.isToday || p.birthdayInfo.daysRemaining <= 30)
      .sort((a, b) => {
        if (a.birthdayInfo.isToday && !b.birthdayInfo.isToday) return -1;
        if (!a.birthdayInfo.isToday && b.birthdayInfo.isToday) return 1;
        return a.birthdayInfo.daysRemaining - b.birthdayInfo.daysRemaining;
      });
  }, [patients]);

  const birthdayTemplates = [
    {
      name: 'Profissional & Elegante',
      text: (nome: string) => `Olá, ${nome}! Passando para lhe desejar um feliz aniversário! Que seu novo ciclo seja de muita paz, saúde, conquistas e desenvolvimento pessoal. Um grande abraço profissional!`
    },
    {
      name: 'Acolhedor & Humano',
      text: (nome: string) => `Querido(a) ${nome}, parabéns pelo seu aniversário! Que este dia especial marque o início de um ano de muita luz, autocuidado e realizações. É um privilégio acompanhar sua jornada. Parabéns pelo seu dia!`
    },
    {
      name: 'Curto & Amigável',
      text: (nome: string) => `Feliz aniversário, ${nome}! Que o dia de hoje traga muita alegria e que o novo ano comece cheio de energia positiva, saúde e realizações. Sucesso na sua jornada!`
    }
  ];

  useEffect(() => {
    if (selectedBirthdayPatient) {
      setCustomMessage(birthdayTemplates[selectedTemplateIndex].text(selectedBirthdayPatient.nome));
    }
  }, [selectedBirthdayPatient, selectedTemplateIndex]);

  const handleSendBirthdayWhatsApp = (phone?: string, name?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(customMessage);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    setSelectedBirthdayPatient(null);
  };

  const handleSendBirthdayEmail = (email?: string) => {
    if (!email) return;
    const text = encodeURIComponent(customMessage);
    const subject = encodeURIComponent('Feliz Aniversário!');
    window.open(`mailto:${email}?subject=${subject}&body=${text}`, '_blank');
    setSelectedBirthdayPatient(null);
  };
  // ------------------------------------------

  const COLORS = ['#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2'];

  const sessionTypes = [
    { name: 'Individual', value: appointments.filter(a => a.tipo === 'individual').length },
    { name: 'Online', value: appointments.filter(a => a.tipo === 'online').length },
    { name: 'Grupo', value: appointments.filter(a => a.tipo === 'grupo').length },
  ].filter(t => t.value > 0);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-primary animate-pulse" size={48} />
        <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em]">Sincronizando Indicadores...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Confirmações Pendentes (24h) */}
      {pending24hAppointments.length > 0 && (
        <div className="bg-bg-card/70 backdrop-blur-md border border-border-subtle rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-display font-bold text-text-main tracking-tight flex items-center gap-3">
                <Clock className="text-primary animate-pulse" size={20} /> Confirmações Pendentes (Próximas 24h)
              </h2>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mt-1">
                Confirme a presença dos pacientes com antecedência por e-mail ou whatsapp
              </p>
            </div>
            <span className="text-[10px] font-black bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full animate-bounce">
              {pending24hAppointments.length} Pendentes
            </span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-subtle/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/50">
            {pending24hAppointments.map((app, idx) => {
              const formattedDate = new Date(app.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              return (
                <div
                  key={`pending-24h-${app.id || idx}`}
                  className="p-6 bg-bg-sidebar/40 border border-border-subtle hover:border-primary/20 rounded-2xl transition-all relative flex flex-col justify-between group min-w-[320px] max-w-[350px] flex-shrink-0 snap-start"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[9px] font-mono font-black text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1 select-none w-max">
                        {formattedDate} às {app.hora}
                      </div>
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Pendente
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/20 transition-all select-none">
                        {app.patientPhoto ? (
                          <img src={app.patientPhoto} alt={app.patientName} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={18} className="text-primary/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-bold text-text-main text-sm truncate">{app.patientName}</h4>
                        {app.isMenor && (
                          <p className="text-[8px] font-black text-primary/70 uppercase tracking-widest truncate">
                            Resp: {app.responsavelNome}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle/30 flex items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => handleConfirmDirect(app.id)}
                      className="px-3 py-2 bg-primary text-bg-deep rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => handleSendConfirmWA(app)}
                        className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-xl text-text-dim/60 border border-border-subtle/40 hover:border-green-500/20 cursor-pointer transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </button>
                      <button
                        onClick={() => handleSendConfirmEmail(app)}
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl text-text-dim/60 border border-border-subtle/40 hover:border-primary/20 cursor-pointer transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                        title="Enviar E-mail"
                      >
                        <Mail size={12} /> E-mail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Próximos Pacientes */}
      <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-8 relative">
          <div>
            <h2 className="text-xl font-display font-medium text-text-main tracking-tight flex items-center gap-3">
              <Calendar className="text-primary animate-pulse" size={24} /> Próximos Pacientes
            </h2>
            <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mt-1">Fluxo cronológico de atendimentos futuros</p>
          </div>
          {onSectionChange && (
            <button
              onClick={() => onSectionChange?.('agenda')}
              className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5 transition-all"
            >
              Ver Agenda Completa <ChevronRight size={12} />
            </button>
          )}
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
            <Clock size={36} className="text-text-dim/40 mb-3" />
            <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Nenhum paciente agendado para esta semana</span>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-subtle/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/50">
            {upcomingAppointments.map((app, idx) => {
              const formattedDate = new Date(app.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              return (
                <div
                  key={`next-pt-${app.id || idx}`}
                  className="p-6 bg-bg-sidebar/50 hover:bg-bg-sidebar border border-border-subtle hover:border-primary/30 rounded-2xl transition-all relative flex flex-col justify-between group min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-start"
                >
                  <div className="text-[9px] font-mono font-black text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1 mb-4 select-none w-max">
                    {formattedDate} às {app.hora}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/20 transition-all select-none">
                        {app.patientPhoto ? (
                          <img src={app.patientPhoto} alt={app.patientName} className="w-full h-full object-cover referral-no-referrer" referrerPolicy="no-referrer" />
                        ) : (
                          <Users size={18} className="text-primary/40" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main text-sm truncate max-w-[120px]">{app.patientName}</h4>
                        <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">
                          {app.tipo === 'online' ? 'Online' : 'Presencial'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border-subtle/30 flex justify-between items-center text-[10px] gap-2">
                    <span className="text-[8px] font-black text-text-dim/80 uppercase tracking-wide">Falta: {getCountdownText(app.data, app.hora)}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedAppForEdit(app);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-text-dim/60 border border-transparent hover:border-primary/20 cursor-pointer"
                        title="Editar Agendamento"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppForRecord(app);
                          setIsRecordModalOpen(true);
                        }}
                        className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-all text-text-dim/60 border border-transparent hover:border-green-500/20 cursor-pointer"
                        title="Iniciar Atendimento"
                      >
                        <Play size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seção de Lembretes de Aniversário */}
      <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
        <div className="flex items-center justify-between mb-8 relative">
          <div>
            <h2 className="text-xl font-display font-medium text-text-main tracking-tight flex items-center gap-3">
              <Gift className="text-primary animate-bounce" size={24} /> Lembretes de Aniversário
            </h2>
            <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mt-1">Pacientes com aniversário hoje ou nos próximos 30 dias</p>
          </div>
        </div>

        {birthdayKids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Cake size={32} className="text-text-dim/20 mb-3" />
            <span className="text-[10px] font-black text-text-dim/50 uppercase tracking-[0.2em]">Nenhum aniversariante nos próximos 30 dias</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {birthdayKids.map((patient, pIdx) => {
              const isToday = patient.birthdayInfo.isToday;
              return (
                <div 
                  key={`bday-kid-${patient.id || pIdx}-${pIdx}`} 
                  className={cn(
                    "p-6 rounded-2xl border transition-all flex flex-col justify-between h-44 hover:-translate-y-1",
                    isToday 
                      ? "bg-gradient-to-br from-primary/15 to-transparent border-primary/40 shadow-lg shadow-primary/5" 
                      : "bg-bg-sidebar/40 border-border-subtle hover:border-primary/20"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                        isToday 
                          ? "bg-primary/20 text-primary border-primary/35 animate-pulse" 
                          : "bg-white/5 text-text-dim border-white/5"
                      )}>
                        {isToday ? "🎉 É hoje!" : `Em ${patient.birthdayInfo.daysRemaining} dias`}
                      </span>
                      <span className="text-[10px] font-mono font-black text-text-dim/60">
                        {patient.birthdayInfo.formattedDate}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-text-main truncate">{patient.nome}</h3>
                    <p className="text-[11px] text-text-dim mt-1">
                      Completando {calculateAge(patient.nascimento || '') + (isToday ? 0 : 1)} anos
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border-subtle/40 pt-3">
                    <span className="text-[10px] text-text-dim font-mono">{patient.telefone || 'Sem telefone'}</span>
                    <button
                      onClick={() => setSelectedBirthdayPatient(patient)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        isToday
                          ? "bg-primary text-bg-deep hover:bg-white"
                          : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-bg-deep"
                      )}
                    >
                      <MessageCircle size={10} /> Parabenizar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pacientes Ativos', value: activePatients, icon: Users, color: 'text-blue-400', sub: 'Base total cadastrada' },
          { label: 'Sessões Marcadas', value: sessionsThisMonth, icon: Calendar, color: 'text-primary', sub: 'Competência do mês atual' },
          { label: 'Atend. Menores', value: minorsCount, icon: ShieldCheck, color: 'text-amber-400', sub: 'Com gestão de responsáveis' },
          { label: 'Histórico Total', value: completedSessions, icon: UserCheck, color: 'text-green-400', sub: 'Sessões finalizadas' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-bg-card border border-border-subtle rounded-[2rem] p-8 hover:border-primary/30 transition-all hover:bg-bg-sidebar/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-4 rounded-2xl bg-bg-sidebar border border-border-subtle group-hover:border-primary/20 transition-all", stat.color)}>
                <stat.icon size={24} />
              </div>
              <span className="text-3xl font-display font-black text-text-main tabular-nums">{stat.value}</span>
            </div>
            <h3 className="text-[11px] font-black text-text-dim uppercase tracking-[0.2em]">{stat.label}</h3>
            <p className="text-[10px] text-text-dim/40 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Patient Demographics */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[8rem] -mr-32 -mt-32" />
            
            <div className="flex items-center justify-between mb-10 relative">
              <div>
                <h2 className="text-xl font-display font-medium text-text-main tracking-tight">Distribuição Etária</h2>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mt-1">Perfil demográfico dos pacientes</p>
              </div>
              <Users className="text-primary/20" size={32} />
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDist} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4dabf7" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4dabf7" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 900 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: '#1E1E26', 
                      border: '1px solid #ffffff10', 
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 900,
                      textTransform: 'uppercase'
                    }} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)" 
                    radius={[10, 10, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 shadow-xl">
              <h4 className="text-[11px] font-black text-text-dim uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Target size={14} className="text-primary" /> Metas de Atendimento
              </h4>
              <div className="space-y-6">
                {[
                  { label: 'Evoluções Completas', value: 85, color: 'bg-green-500' },
                  { label: 'Taxa de Retenção', value: 92, color: 'bg-primary' },
                  { label: 'Documentação OK', value: 78, color: 'bg-amber-500' },
                ].map(meta => (
                  <div key={meta.label} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-text-main">{meta.label}</span>
                      <span className="text-text-dim">{meta.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-bg-sidebar rounded-full overflow-hidden border border-border-subtle p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${meta.value}%` }}
                        className={cn("h-full rounded-full transition-all", meta.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-50" />
              <div className="relative z-10">
                <Stethoscope size={40} className="text-primary mb-4 mx-auto" />
                <h3 className="text-lg font-display font-bold text-text-main mb-2">Próxima Jornada</h3>
                <p className="text-[11px] text-text-dim/60 leading-relaxed px-4">
                  Acompanhe o engajamento clínico para garantir o melhor desfecho terapêutico.
                </p>
                <button 
                  onClick={() => onSectionChange?.('relatorios')}
                  className="mt-6 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-bg-deep transition-all"
                >
                  Ver Relatórios Clínicos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modalidade / Session Summary */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-xl font-display font-medium text-text-main tracking-tight mb-2">Modalidades</h2>
            <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-10">Volume histórico por tipo</p>
            
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {sessionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E1E26', 
                      border: '1px solid #ffffff10', 
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 900,
                      textTransform: 'uppercase'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-display font-black text-text-main">{completedSessions}</span>
                <span className="text-[8px] font-black text-text-dim uppercase tracking-widest">Total Sinc.</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {sessionTypes.map((type, i) => (
                <div key={type.name} className="flex items-center justify-between p-4 bg-bg-sidebar/50 border border-border-subtle rounded-2xl hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black text-text-main uppercase tracking-widest">{type.name}</span>
                  </div>
                  <span className="text-xs font-black text-text-dim tabular-nums">{type.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/95 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-bl-[10rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
            <TrendingUp size={48} className="text-bg-deep mb-6" />
            <h2 className="text-2xl font-display font-black text-bg-deep tracking-tighter mb-4">Crescimento Sustentável</h2>
            <p className="text-bg-deep/70 text-sm font-medium leading-relaxed mb-8">
              A base de pacientes cresceu {activePatients > 0 ? (activePatients/10).toFixed(1) : 0}% em relação ao trimestre anterior.
            </p>
            <button 
              onClick={() => onSectionChange?.('financeiro')}
              className="w-full py-4 bg-bg-deep text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-bg-sidebar transition-all font-sans"
            >
              Planejamento Estratégico <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Mensagem de Parabenização */}
      {selectedBirthdayPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            
            <button 
              onClick={() => setSelectedBirthdayPatient(null)}
              className="absolute top-8 right-8 p-2.5 hover:bg-white/5 rounded-full text-text-dim hover:text-text-main transition-all border border-border-subtle/40"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                <Gift size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-text-main">Parabenizar Paciente</h3>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mt-0.5">{selectedBirthdayPatient.nome}</p>
              </div>
            </div>

            <span className="text-[9px] font-black text-text-dim uppercase tracking-[0.22em] block mb-3">Selecione um Template</span>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {birthdayTemplates.map((tpl, idx) => (
                <button
                  key={tpl.name}
                  onClick={() => setSelectedTemplateIndex(idx)}
                  className={cn(
                    "py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border transition-all truncate",
                    selectedTemplateIndex === idx
                      ? "bg-primary text-bg-deep border-primary"
                      : "bg-bg-sidebar/60 border-border-subtle text-text-dim hover:border-primary/20 hover:text-text-main"
                  )}
                  title={tpl.name}
                >
                  {tpl.name}
                </button>
              ))}
            </div>

            <span className="text-[9px] font-black text-text-dim uppercase tracking-[0.22em] block mb-3">Mensagem Personalizada</span>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full h-36 bg-bg-sidebar border border-border-subtle p-5 rounded-2xl text-text-main text-xs font-semibold focus:border-primary/50 outline-none resize-none transition-all leading-relaxed"
            />

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                disabled={!selectedBirthdayPatient.telefone}
                onClick={() => handleSendBirthdayWhatsApp(selectedBirthdayPatient.telefone, selectedBirthdayPatient.nome)}
                className={cn(
                  "flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                  selectedBirthdayPatient.telefone
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/5 hover:scale-[1.02]"
                    : "bg-border-subtle text-text-dim cursor-not-allowed opacity-40"
                )}
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button
                disabled={!selectedBirthdayPatient.email}
                onClick={() => handleSendBirthdayEmail(selectedBirthdayPatient.email)}
                className={cn(
                  "flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                  selectedBirthdayPatient.email
                    ? "bg-primary text-bg-deep hover:bg-white hover:scale-[1.02]"
                    : "bg-border-subtle text-text-dim cursor-not-allowed opacity-40"
                )}
              >
                <Mail size={14} /> E-mail
              </button>
            </div>
            {!selectedBirthdayPatient.telefone && !selectedBirthdayPatient.email && (
              <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest text-center mt-4">
                Nenhum meio de contato cadastrado para este paciente.
              </p>
            )}
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <AppointmentModal
          appointment={selectedAppForEdit}
          initialDate={selectedAppForEdit ? new Date(selectedAppForEdit.data + 'T12:00:00') : new Date()}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            fetchData();
          }}
        />
      )}

      {isRecordModalOpen && (
        <RegistrationModal
          appointment={selectedAppForRecord}
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
