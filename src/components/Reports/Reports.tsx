import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon,
  MessageCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Check,
  CalendarDays,
  Globe
} from 'lucide-react';
import { db, type Patient, type Appointment } from '../../lib/db';
import { formatCurrency, cn } from '../../lib/utils';
import BrazilMapReport from './BrazilMapReport';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// BrazilMapReport is imported from ./BrazilMapReport


// ─── Main Reports Component ───────────────────────────────────────────────────
export default function Reports() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'indicators' | 'schedule' | 'geography'>('indicators');

  // --- ESTADOS PARA RELATÓRIO DE AGENDA E DISPONIBILIDADE ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<'scheduled' | 'availability' | 'both'>('both');
  const [customInformativo, setCustomInformativo] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Work schedule states loaded from settings
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [hasLunchBreak, setHasLunchBreak] = useState(true);
  // ----------------------------------------------------------

  const [stats, setStats] = useState({
    patientCount: 0,
    appointmentCount: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    financeData: { labels: [] as string[], income: [] as number[], expense: [] as number[] },
    patientAgeData: { labels: [] as string[], counts: [] as number[] },
    appointmentTypeData: { labels: [] as string[], counts: [] as number[] },
    churnData: { active: 0, inactive: 0 }
  });

  useEffect(() => {
    setIsMounted(true);
    loadStats();
  }, []);

  const loadStats = async () => {
    const listPatients = await db.pacientes.toArray();
    const activePatients = listPatients.filter(p => !p.status || p.status === 'ativo');
    const listAppointments = await db.agendamentos.toArray();
    const transactions = await db.transacoes.toArray();

    setPatients(activePatients);
    setAppointments(listAppointments);

    const settingsList = await db.settings.toArray();
    settingsList.forEach(item => {
      if (item.key === 'workDays' && Array.isArray(item.value)) setWorkDays(item.value);
      if (item.key === 'workStart') setWorkStart(item.value);
      if (item.key === 'workEnd') setWorkEnd(item.value);
      if (item.key === 'lunchStart') setLunchStart(item.value);
      if (item.key === 'lunchEnd') setLunchEnd(item.value);
      if (item.key === 'hasLunchBreak') setHasLunchBreak(item.value);
    });

    if (activePatients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(activePatients[0].id);
    }

    const months = [];
    const incomeByMonth = [];
    const expenseByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push(monthStr);

      const m = d.getMonth();
      const y = d.getFullYear();
      
      const monthlyIncome = transactions
        .filter(t => { const td = new Date(t.data + 'T00:00:00'); return td.getMonth() === m && td.getFullYear() === y && t.tipo === 'receita'; })
        .reduce((acc, t) => acc + t.valor, 0);

      const monthlyExpense = transactions
        .filter(t => { const td = new Date(t.data + 'T00:00:00'); return td.getMonth() === m && td.getFullYear() === y && t.tipo === 'despesa'; })
        .reduce((acc, t) => acc + t.valor, 0);

      incomeByMonth.push(monthlyIncome);
      expenseByMonth.push(monthlyExpense);
    }

    setStats({
      patientCount: activePatients.length,
      appointmentCount: listAppointments.length,
      monthlyIncome: incomeByMonth[incomeByMonth.length - 1],
      monthlyExpense: expenseByMonth[expenseByMonth.length - 1],
      financeData: { labels: months, income: incomeByMonth, expense: expenseByMonth },
      patientAgeData: { labels: ['0-18', '19-35', '36-60', '60+'], counts: [5, 12, 8, 3] },
      appointmentTypeData: { 
        labels: ['Individual', 'Grupo', 'Online'], 
        counts: [
          listAppointments.filter(a => a.tipo === 'individual').length,
          listAppointments.filter(a => a.tipo === 'grupo').length,
          listAppointments.filter(a => a.tipo === 'online').length
        ]
      },
      churnData: {
        active: activePatients.filter(p => listAppointments.some(a => a.pacienteId === p.id)).length,
        inactive: activePatients.filter(p => !listAppointments.some(a => a.pacienteId === p.id)).length
      }
    });
  };

  // --- INFORMATIVO DE AGENDA/DISPONIBILIDADE AUTO-GERADOR ---
  useEffect(() => {
    if (activeTab === 'schedule') {
      generateInformativeText();
    }
  }, [selectedPatientId, viewType, referenceDate, reportType, patients, appointments, activeTab, workDays, workStart, workEnd, lunchStart, lunchEnd, hasLunchBreak]);

  const generateInformativeText = () => {
    const patientObj = patients.find(p => p.id === selectedPatientId);
    const nomePaciente = patientObj ? patientObj.nome : '[Paciente]';
    
    let text = `Olá, ${nomePaciente}! Tudo bem?\n`;
    text += `Segue informativo da minha agenda e disponibilidades:\n\n`;

    const getWeekDays = (refDate: Date) => {
      const d = new Date(refDate);
      const dayOfWeek = d.getDay();
      const diff = d.getDate() - dayOfWeek;
      const sunday = new Date(d.setDate(diff));
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        days.push(day);
      }
      return days.filter(day => workDays.includes(day.getDay()));
    };

    const getFormattedDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const getDayNamePT = (d: Date) => {
      const daysStr = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      return daysStr[d.getDay()];
    };

    const TIME_SLOTS: string[] = [];
    const [startH] = workStart.split(':').map(Number);
    const [endH] = workEnd.split(':').map(Number);
    const [lunchSH] = lunchStart.split(':').map(Number);
    const [lunchEH] = lunchEnd.split(':').map(Number);
    
    for (let h = startH; h < endH; h++) {
      if (hasLunchBreak && h >= lunchSH && h < lunchEH) continue;
      TIME_SLOTS.push(String(h).padStart(2, '0') + ':00');
    }

    if (viewType === 'day') {
      const dateStr = getFormattedDateStr(referenceDate);
      const dayFormatted = `${String(referenceDate.getDate()).padStart(2, '0')}/${String(referenceDate.getMonth() + 1).padStart(2, '0')}/${referenceDate.getFullYear()}`;
      text += `📅 DATA: ${getDayNamePT(referenceDate)}, ${dayFormatted}\n\n`;

      if (reportType === 'scheduled' || reportType === 'both') {
        const patientSessions = appointments.filter(a => a.data === dateStr && a.pacienteId === selectedPatientId && a.status !== 'cancelled');
        if (patientSessions.length > 0) {
          text += `📌 Suas Sessões Agendadas:\n`;
          patientSessions.forEach(a => { text += `  • Horário: ${a.hora} (${a.tipo === 'online' ? 'Online' : 'Presencial'})\n`; });
          text += `\n`;
        }
      }

      if (reportType === 'availability' || reportType === 'both') {
        const freeSlots = TIME_SLOTS.filter(slot => !appointments.some(a => a.data === dateStr && a.hora === slot && a.status !== 'cancelled'));
        text += `✨ Horários Livres (Disponibilidade):\n`;
        if (freeSlots.length > 0) freeSlots.forEach(slot => { text += `  • ${slot}\n`; });
        else text += `  • Sem horários livres disponíveis para este dia.\n`;
      }
    } else if (viewType === 'week') {
      const weekDays = getWeekDays(referenceDate);
      if (weekDays.length > 0) {
        const firstDay = `${String(weekDays[0].getDate()).padStart(2, '0')}/${String(weekDays[0].getMonth() + 1).padStart(2, '0')}`;
        const lastDay = `${String(weekDays[weekDays.length - 1].getDate()).padStart(2, '0')}/${String(weekDays[weekDays.length - 1].getMonth() + 1).padStart(2, '0')}`;
        text += `📅 PERÍODO: Semana de ${firstDay} a ${lastDay}\n\n`;
      } else text += `📅 PERÍODO: Esta Semana\n\n`;

      if (reportType === 'scheduled' || reportType === 'both') {
        let hasSessions = false;
        let sessionLines = '';
        weekDays.forEach(day => {
          const dateStr = getFormattedDateStr(day);
          const patientSessions = appointments.filter(a => a.data === dateStr && a.pacienteId === selectedPatientId && a.status !== 'cancelled');
          if (patientSessions.length > 0) {
            hasSessions = true;
            sessionLines += `🗓️ ${getDayNamePT(day)} (${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}):\n`;
            patientSessions.forEach(a => { sessionLines += `  • Às ${a.hora} (${a.tipo === 'online' ? 'Online' : 'Presencial'})\n`; });
          }
        });
        if (hasSessions) text += `📌 Suas Sessões Agendadas nesta semana:\n` + sessionLines + `\n`;
      }

      if (reportType === 'availability' || reportType === 'both') {
        text += `✨ Nossos Horários Livres nesta semana:\n`;
        weekDays.forEach(day => {
          const dateStr = getFormattedDateStr(day);
          const freeSlots = TIME_SLOTS.filter(slot => !appointments.some(a => a.data === dateStr && a.hora === slot && a.status !== 'cancelled'));
          if (freeSlots.length > 0) text += `  • ${getDayNamePT(day)} (${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}): ${freeSlots.join(', ')}\n`;
        });
      }
    } else if (viewType === 'month') {
      const monthLabel = referenceDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      text += `📅 PERÍODO: Mês de ${monthLabel}\n\n`;

      if (reportType === 'scheduled' || reportType === 'both') {
        const year = referenceDate.getFullYear();
        const monthNum = referenceDate.getMonth();
        const patientSessions = appointments.filter(a => {
          if (a.pacienteId !== selectedPatientId || a.status === 'cancelled') return false;
          const ad = new Date(a.data + 'T12:00:00');
          return ad.getFullYear() === year && ad.getMonth() === monthNum;
        }).sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));

        if (patientSessions.length > 0) {
          text += `📌 Suas Sessões Agendadas no mês:\n`;
          patientSessions.forEach(a => {
            const [y, m, d] = a.data.split('-');
            text += `  • Dia ${d}/${m} às ${a.hora}\n`;
          });
          text += `\n`;
        }
      }

      if (reportType === 'availability' || reportType === 'both') {
        text += `✨ Breve resumo de horários recorrentes disponíveis neste mês:\n`;
        const weekDays = getWeekDays(referenceDate);
        weekDays.forEach(day => {
          const dateStr = getFormattedDateStr(day);
          const freeSlots = TIME_SLOTS.filter(slot => !appointments.some(a => a.data === dateStr && a.hora === slot && a.status !== 'cancelled'));
          if (freeSlots.length > 0) text += `  • Nos dias de ${getDayNamePT(day)}s: ${freeSlots.slice(0, 3).join(', ')}...\n`;
        });
      }
    }

    text += `\nQualquer dúvida ou caso queira realizar alguma alteração ou agendamento, fico à total disposição!`;
    setCustomInformativo(text);
  };

  const handleShareWhatsApp = () => {
    const patientObj = patients.find(p => p.id === selectedPatientId);
    if (!patientObj || !patientObj.telefone) return;
    const cleanPhone = patientObj.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(customInformativo)}`, '_blank');
  };

  const handleShareEmail = () => {
    const patientObj = patients.find(p => p.id === selectedPatientId);
    if (!patientObj || !patientObj.email) return;
    window.open(`mailto:${patientObj.email}?subject=${encodeURIComponent('Informativo de Agenda e Disponibilidade')}&body=${encodeURIComponent(customInformativo)}`, '_blank');
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(customInformativo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigateReference = (direction: 'prev' | 'next') => {
    const offset = direction === 'prev' ? -1 : 1;
    const newDate = new Date(referenceDate);
    if (viewType === 'day') newDate.setDate(newDate.getDate() + offset);
    else if (viewType === 'week') newDate.setDate(newDate.getDate() + (offset * 7));
    else if (viewType === 'month') newDate.setMonth(newDate.getMonth() + offset);
    setReferenceDate(newDate);
  };

  const financeChartData = {
    labels: stats.financeData.labels,
    datasets: [
      {
        label: 'Receita',
        data: stats.financeData.income,
        backgroundColor: 'rgba(191, 155, 107, 0.4)',
        borderColor: 'rgb(191, 155, 107)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(191, 155, 107, 0.6)',
      },
      {
        label: 'Despesa',
        data: stats.financeData.expense,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(239, 68, 68, 0.4)',
      },
    ],
  };

  const typeChartData = {
    labels: stats.appointmentTypeData.labels,
    datasets: [{
      data: stats.appointmentTypeData.counts,
      backgroundColor: ['rgba(191, 155, 107, 0.6)', 'rgba(77, 171, 247, 0.6)', 'rgba(129, 140, 248, 0.6)'],
      borderColor: ['rgb(191, 155, 107)', 'rgb(77, 171, 247)', 'rgb(129, 140, 248)'],
      borderWidth: 1,
    }],
  };

  const churnChartData = {
    labels: ['Ativos', 'Inativos'],
    datasets: [{
      data: [stats.churnData.active, stats.churnData.inactive],
      backgroundColor: ['rgba(34, 197, 94, 0.4)', 'rgba(239, 68, 68, 0.4)'],
      borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#808080', font: { family: 'Space Grotesk', weight: '700' as any, size: 10 }, boxWidth: 10, usePointStyle: true, padding: 20 }
      },
      tooltip: {
        backgroundColor: '#1A1A1A',
        titleFont: { family: 'Space Grotesk', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 12,
        borderColor: '#262626',
        borderWidth: 1
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#4D4D4D', font: { size: 10, family: 'JetBrains Mono' } } },
      x: { grid: { display: false }, ticks: { color: '#4D4D4D', font: { size: 10, family: 'JetBrains Mono' } } }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">Business Intelligence</h2>
          <p className="text-text-dim text-sm font-medium mt-1">Métricas de performance clínica, saúde financeira e relatórios de agenda.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-8 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('indicators')}
          className={cn("pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative outline-none whitespace-nowrap", activeTab === 'indicators' ? "text-primary border-b-2 border-primary" : "text-text-dim hover:text-text-main")}
        >
          Indicadores de Gestão
        </button>
        <button
          onClick={() => setActiveTab('geography')}
          className={cn("pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative outline-none whitespace-nowrap flex items-center gap-2", activeTab === 'geography' ? "text-primary border-b-2 border-primary" : "text-text-dim hover:text-text-main")}
        >
          <Globe size={13} /> Distribuição Geográfica
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={cn("pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative outline-none whitespace-nowrap", activeTab === 'schedule' ? "text-primary border-b-2 border-primary" : "text-text-dim hover:text-text-main")}
        >
          Relatório de Agenda &amp; Disponibilidade
        </button>
      </div>

      {activeTab === 'indicators' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard icon={<Users className="text-primary" />} label="Pacientes Ativos" value={stats.patientCount} />
            <StatCard icon={<CalendarIcon className="text-primary" />} label="Ciclos de Sessão" value={stats.appointmentCount} />
            <StatCard icon={<TrendingUp className="text-green-500" />} label="Receita Período" value={formatCurrency(stats.monthlyIncome)} />
            <StatCard icon={<BarChart3 className="text-primary" />} label="Resultado Líquido" value={formatCurrency(stats.monthlyIncome - stats.monthlyExpense)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-bg-card border border-border-subtle p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group col-span-1 lg:col-span-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
              <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <DollarSign size={14} className="text-primary" /> Performance Financeira (Semestral)
              </h3>
              <div className="h-[350px] w-full">
                {isMounted && <Bar data={financeChartData} options={chartOptions} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-bg-card border border-border-subtle p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <PieChart size={14} className="text-primary" /> Modalidades de Atendimento
              </h3>
              <div className="h-[300px] w-full flex justify-center">
                {isMounted && <Pie data={typeChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />}
              </div>
            </div>
            
            <div className="bg-bg-card border border-border-subtle p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <TrendingUp size={14} className="text-primary" /> Saúde da Carteira (Churn Analysis)
              </h3>
              <div className="h-[300px] w-full flex justify-center">
                {isMounted && <Pie data={churnChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />}
              </div>
              <p className="text-[9px] font-bold text-text-dim/40 uppercase tracking-widest mt-6 text-center">
                Pacientes Ativos vs. Pacientes sem sessões registradas
              </p>
            </div>
          </div>
        </>
      ) : activeTab === 'geography' ? (
        <BrazilMapReport patients={patients} />
      ) : (
        /* Aba: Relatório de Agenda & Disponibilidade */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-bg-card border border-border-subtle p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
              
              <div>
                <h3 className="text-base font-display font-bold text-text-main tracking-tight">Parametrizar Relatório</h3>
                <p className="text-[10px] text-text-dim font-black uppercase tracking-wider mt-0.5">Selecione paciente, período e conteúdo</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em] ml-1">Paciente Destinatário</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-5 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl focus:border-primary/50 outline-none text-xs text-text-main font-semibold transition-all"
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map(p => (<option key={p.id} value={p.id}>{p.nome}</option>))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em] ml-1">Tipo de Período</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'day', label: 'Dia' }, { id: 'week', label: 'Semana' }, { id: 'month', label: 'Mês' }].map(t => (
                    <button key={t.id} onClick={() => setViewType(t.id as any)}
                      className={cn("py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center",
                        viewType === t.id ? "bg-primary text-bg-deep shadow-lg shadow-primary/10" : "bg-bg-sidebar/60 border border-border-subtle text-text-dim hover:text-text-main")}
                    >{t.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em] ml-1">Navegação Temporal</label>
                <div className="flex items-center justify-between bg-bg-sidebar border border-border-subtle rounded-2xl p-2.5">
                  <button onClick={() => handleNavigateReference('prev')} className="p-2 hover:bg-white/5 rounded-xl text-text-dim hover:text-text-main transition-all border border-border-subtle/50"><ChevronLeft size={16} /></button>
                  <span className="text-[10px] font-mono font-bold text-text-main uppercase tracking-widest px-2 text-center truncate max-w-[180px]">
                    {viewType === 'day' && referenceDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {viewType === 'week' && (() => {
                      const start = new Date(referenceDate);
                      const day = start.getDay();
                      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
                      const mon = new Date(start.setDate(diff));
                      const fri = new Date(mon);
                      fri.setDate(mon.getDate() + 4);
                      return `${mon.getDate()}/${mon.getMonth()+1} - ${fri.getDate()}/${fri.getMonth()+1}`;
                    })()}
                    {viewType === 'month' && referenceDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => handleNavigateReference('next')} className="p-2 hover:bg-white/5 rounded-xl text-text-dim hover:text-text-main transition-all border border-border-subtle/50"><ChevronRight size={16} /></button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em] ml-1">Filtro de Conteúdo</label>
                <div className="space-y-2">
                  {[{ id: 'both', label: 'Agenda + Horários Livres' }, { id: 'scheduled', label: 'Apenas Meus Agendamentos' }, { id: 'availability', label: 'Apenas Horários Livres' }].map(r => (
                    <button key={r.id} onClick={() => setReportType(r.id as any)}
                      className={cn("w-full text-left px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border block",
                        reportType === r.id ? "bg-primary/20 border-primary text-primary" : "bg-bg-sidebar/40 border-border-subtle text-text-dim hover:border-primary/20 hover:text-text-main")}
                    >{r.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-border-subtle p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden">
              <h3 className="text-xs font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                <CalendarDays size={14} className="text-primary" /> Visualização da Grade de Período
              </h3>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {(() => {
                  const getWeekDays2 = (refDate: Date) => {
                    const d = new Date(refDate);
                    const dayOfWeek = d.getDay();
                    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                    const monday = new Date(d.setDate(diff));
                    const days = [];
                    for (let i = 0; i < 5; i++) {
                      const day = new Date(monday);
                      day.setDate(monday.getDate() + i);
                      days.push(day);
                    }
                    return days;
                  };
                  const getFormattedDateStr2 = (d: Date) =>
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  const getDayNamePT2 = (d: Date) => ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][d.getDay()];
                  const TIME_SLOTS2 = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

                  let daysToRender: Date[] = [];
                  if (viewType === 'day') daysToRender = [referenceDate];
                  else if (viewType === 'week') daysToRender = getWeekDays2(referenceDate);
                  else if (viewType === 'month') {
                    const year = referenceDate.getFullYear();
                    const month = referenceDate.getMonth();
                    const date = new Date(year, month, 1);
                    while (date.getMonth() === month) {
                      if (date.getDay() !== 0 && date.getDay() !== 6) daysToRender.push(new Date(date));
                      date.setDate(date.getDate() + 1);
                    }
                  }

                  return daysToRender.slice(0, 5).map(day => {
                    const dStr = getFormattedDateStr2(day);
                    const formattedDay = `${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}`;
                    const dayAppts = appointments.filter(a => a.data === dStr && a.status !== 'cancelled');
                    return (
                      <div key={dStr} className="p-4 bg-bg-sidebar/50 rounded-2xl border border-border-subtle/50 space-y-3">
                        <div className="flex justify-between items-center border-b border-border-subtle/40 pb-2">
                          <span className="text-[10px] font-bold text-text-main uppercase tracking-wider">{getDayNamePT2(day)}</span>
                          <span className="text-[9px] font-mono font-bold text-text-dim">{formattedDay}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {TIME_SLOTS2.map(slot => {
                            const appt = dayAppts.find(a => a.hora === slot);
                            const isBooked = !!appt;
                            const isPatientAppt = isBooked && appt.pacienteId === selectedPatientId;
                            return (
                              <div key={slot} className={cn("py-2 px-0.5 rounded-xl text-center font-mono transition-all border flex flex-col justify-between h-9",
                                isPatientAppt ? "bg-primary text-bg-deep border-primary" : isBooked ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/5 text-green-400 border-green-500/25")}
                                title={isPatientAppt ? 'Agendado com este paciente' : isBooked ? 'Ocupado' : 'Livre'}>
                                <span className="text-[9px] font-black">{slot}</span>
                                <span className="text-[6px] uppercase font-bold tracking-tighter opacity-80">
                                  {isPatientAppt ? 'Sua' : isBooked ? 'Ocup.' : 'Livre'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="bg-bg-card border border-border-subtle p-10 rounded-[3rem] shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-display font-bold text-text-main tracking-tight">Texto do Informativo</h3>
                    <p className="text-[10px] text-text-dim font-black uppercase tracking-wider mt-0.5">Visualize e edite antes de enviar ao paciente</p>
                  </div>
                  <button onClick={handleCopyClipboard}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-border-subtle hover:bg-white/5 text-text-dim hover:text-text-main transition-all">
                    {copied ? <Check size={11} className="text-green-400" /> : <Clipboard size={11} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <textarea
                  value={customInformativo}
                  onChange={(e) => setCustomInformativo(e.target.value)}
                  className="w-full h-[380px] bg-bg-sidebar border border-border-subtle p-6 rounded-2xl text-text-main text-xs font-semibold focus:border-primary/50 outline-none resize-none transition-all leading-relaxed"
                  placeholder="Gere o informativo selecionando um paciente e período..."
                />
              </div>

              <div className="border-t border-border-subtle/50 pt-8 mt-8">
                <span className="text-[9px] font-black text-text-dim uppercase tracking-[0.25em] block mb-4">Escolha o Meio de Envio</span>
                {(() => {
                  const patientObj = patients.find(p => p.id === selectedPatientId);
                  const hasPhone = !!patientObj?.telefone;
                  const hasEmail = !!patientObj?.email;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={handleShareWhatsApp} disabled={!selectedPatientId || !hasPhone}
                        className={cn("flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                          selectedPatientId && hasPhone ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/10 hover:scale-[1.01]" : "bg-border-subtle text-text-dim cursor-not-allowed opacity-45")}>
                        <MessageCircle size={15} /> Enviar via WhatsApp
                      </button>
                      <button onClick={handleShareEmail} disabled={!selectedPatientId || !hasEmail}
                        className={cn("flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                          selectedPatientId && hasEmail ? "bg-primary text-bg-deep hover:bg-white shadow-primary/10 hover:scale-[1.01]" : "bg-border-subtle text-text-dim cursor-not-allowed opacity-45")}>
                        <Mail size={15} /> Enviar via E-mail
                      </button>
                    </div>
                  );
                })()}
                {(() => {
                  const patientObj = patients.find(p => p.id === selectedPatientId);
                  if (selectedPatientId && patientObj && !patientObj.telefone && !patientObj.email) {
                    return <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider text-center mt-4">Aviso: Este paciente não possui e-mail nem telefone cadastrados.</p>;
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-bg-card border border-border-subtle p-8 rounded-[2rem] flex items-center gap-6 group hover:border-primary/20 transition-all shadow-xl hover:-translate-y-1">
      <div className="w-14 h-14 rounded-2xl bg-bg-sidebar border border-border-subtle flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-display font-black text-text-main tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
