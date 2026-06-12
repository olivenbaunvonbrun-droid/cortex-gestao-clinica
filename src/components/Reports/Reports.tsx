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
  Globe,
  MapPin
} from 'lucide-react';
import { db, type Patient, type Appointment } from '../../lib/db';
import { formatCurrency, cn } from '../../lib/utils';
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

// ─── Brazil State SVG paths (simplified, corrected coordinates) ───────────────
// Each state has id (UF code), name and an SVG path for the Brazil map outline
const BRAZIL_STATES = [
  { id: 'AC', name: 'Acre', cx: 78, cy: 198 },
  { id: 'AL', name: 'Alagoas', cx: 355, cy: 218 },
  { id: 'AM', name: 'Amazonas', cx: 140, cy: 155 },
  { id: 'AP', name: 'Amapá', cx: 278, cy: 78 },
  { id: 'BA', name: 'Bahia', cx: 320, cy: 248 },
  { id: 'CE', name: 'Ceará', cx: 335, cy: 173 },
  { id: 'DF', name: 'Distrito Federal', cx: 283, cy: 288 },
  { id: 'ES', name: 'Espírito Santo', cx: 338, cy: 298 },
  { id: 'GO', name: 'Goiás', cx: 270, cy: 278 },
  { id: 'MA', name: 'Maranhão', cx: 285, cy: 173 },
  { id: 'MG', name: 'Minas Gerais', cx: 305, cy: 298 },
  { id: 'MS', name: 'Mato Grosso do Sul', cx: 225, cy: 318 },
  { id: 'MT', name: 'Mato Grosso', cx: 200, cy: 248 },
  { id: 'PA', name: 'Pará', cx: 228, cy: 143 },
  { id: 'PB', name: 'Paraíba', cx: 355, cy: 188 },
  { id: 'PE', name: 'Pernambuco', cx: 340, cy: 203 },
  { id: 'PI', name: 'Piauí', cx: 308, cy: 193 },
  { id: 'PR', name: 'Paraná', cx: 258, cy: 348 },
  { id: 'RJ', name: 'Rio de Janeiro', cx: 322, cy: 318 },
  { id: 'RN', name: 'Rio Grande do Norte', cx: 358, cy: 178 },
  { id: 'RO', name: 'Rondônia', cx: 145, cy: 218 },
  { id: 'RR', name: 'Roraima', cx: 168, cy: 88 },
  { id: 'RS', name: 'Rio Grande do Sul', cx: 245, cy: 388 },
  { id: 'SC', name: 'Santa Catarina', cx: 258, cy: 368 },
  { id: 'SE', name: 'Sergipe', cx: 348, cy: 228 },
  { id: 'SP', name: 'São Paulo', cx: 278, cy: 328 },
  { id: 'TO', name: 'Tocantins', cx: 270, cy: 228 },
];

// SVG paths approximating Brazil's states at ~450x500 viewBox
const STATE_PATHS: Record<string, string> = {
  AC: 'M 58 185 L 115 175 L 120 195 L 100 215 L 58 210 Z',
  AL: 'M 345 208 L 368 208 L 370 228 L 348 230 Z',
  AM: 'M 85 108 L 195 95 L 215 120 L 225 158 L 190 175 L 155 175 L 118 195 L 105 185 L 85 150 Z',
  AP: 'M 255 62 L 295 58 L 305 88 L 280 95 L 255 82 Z',
  BA: 'M 290 225 L 375 218 L 382 278 L 355 302 L 295 305 L 275 278 Z',
  CE: 'M 315 158 L 368 158 L 372 185 L 348 190 L 318 178 Z',
  DF: 'M 276 282 L 292 282 L 292 298 L 276 298 Z',
  ES: 'M 330 285 L 355 285 L 358 315 L 332 318 Z',
  GO: 'M 248 255 L 300 250 L 302 302 L 252 305 Z',
  MA: 'M 258 148 L 318 148 L 322 185 L 288 192 L 255 175 Z',
  MG: 'M 272 275 L 358 272 L 362 332 L 295 338 L 272 318 Z',
  MS: 'M 188 305 L 252 302 L 258 352 L 192 358 Z',
  MT: 'M 148 202 L 248 198 L 255 262 L 195 268 L 148 248 Z',
  PA: 'M 178 98 L 298 92 L 302 158 L 260 162 L 225 175 L 195 175 L 178 145 Z',
  PB: 'M 340 183 L 378 180 L 380 198 L 342 200 Z',
  PE: 'M 318 198 L 378 195 L 380 215 L 320 218 Z',
  PI: 'M 285 175 L 325 172 L 328 215 L 290 218 L 285 195 Z',
  PR: 'M 225 335 L 292 330 L 295 368 L 228 372 Z',
  RJ: 'M 305 308 L 358 305 L 362 335 L 308 338 Z',
  RN: 'M 340 162 L 382 158 L 385 182 L 342 185 Z',
  RO: 'M 118 195 L 168 192 L 172 235 L 120 238 Z',
  RR: 'M 148 68 L 212 62 L 218 105 L 152 108 Z',
  RS: 'M 215 368 L 290 365 L 295 412 L 218 415 Z',
  SC: 'M 222 352 L 295 348 L 298 370 L 225 373 Z',
  SE: 'M 340 220 L 368 218 L 370 242 L 342 245 Z',
  SP: 'M 248 308 L 318 305 L 322 352 L 250 355 Z',
  TO: 'M 248 198 L 302 195 L 305 255 L 250 258 Z',
};

// ─── BrazilMapReport Component ────────────────────────────────────────────────
function BrazilMapReport({ patients }: { patients: Patient[] }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Count patients per state
  const stateCounts: Record<string, number> = {};
  patients.forEach(p => {
    if (p.estado) {
      const uf = p.estado.trim().toUpperCase().substring(0, 2);
      stateCounts[uf] = (stateCounts[uf] || 0) + 1;
    }
  });

  const maxCount = Math.max(...Object.values(stateCounts), 1);
  const totalWithState = Object.values(stateCounts).reduce((a, b) => a + b, 0);

  // Heat-map color based on patient density
  const getStateColor = (stateId: string) => {
    const count = stateCounts[stateId] || 0;
    if (count === 0) return '#1e293b'; // bg-sidebar tone
    const intensity = count / maxCount;
    if (intensity <= 0.25) return '#78350f'; // amber-900
    if (intensity <= 0.50) return '#d97706'; // amber-600
    if (intensity <= 0.75) return '#f59e0b'; // amber-500
    return '#bf9b6b';                        // primary gold
  };

  const getStateStroke = (stateId: string) => {
    if (hoveredState === stateId) return '#ffffff';
    return stateCounts[stateId] ? '#0f172a' : '#334155';
  };

  // Ranked list
  const ranked = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([uf, count]) => ({
      uf,
      name: BRAZIL_STATES.find(s => s.id === uf)?.name || uf,
      count,
      pct: ((count / totalWithState) * 100).toFixed(1)
    }));

  const statesWithNoData = patients.length - totalWithState;
  const hoveredInfo = hoveredState
    ? { name: BRAZIL_STATES.find(s => s.id === hoveredState)?.name || hoveredState, count: stateCounts[hoveredState] || 0 }
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-subtle p-6 rounded-[2rem] shadow-xl">
          <p className="text-[9px] font-black text-text-dim uppercase tracking-[0.25em] mb-2">Total Mapeados</p>
          <p className="text-3xl font-display font-black text-text-main tabular-nums">{totalWithState}</p>
        </div>
        <div className="bg-bg-card border border-border-subtle p-6 rounded-[2rem] shadow-xl">
          <p className="text-[9px] font-black text-text-dim uppercase tracking-[0.25em] mb-2">Estados Presentes</p>
          <p className="text-3xl font-display font-black text-primary tabular-nums">{Object.keys(stateCounts).length}</p>
        </div>
        <div className="bg-bg-card border border-border-subtle p-6 rounded-[2rem] shadow-xl">
          <p className="text-[9px] font-black text-text-dim uppercase tracking-[0.25em] mb-2">Estado Líder</p>
          <p className="text-2xl font-display font-black text-amber-400 tabular-nums">{ranked[0]?.uf || '—'}</p>
          <p className="text-[9px] text-text-dim font-bold mt-1">{ranked[0]?.name}</p>
        </div>
        <div className="bg-bg-card border border-border-subtle p-6 rounded-[2rem] shadow-xl">
          <p className="text-[9px] font-black text-text-dim uppercase tracking-[0.25em] mb-2">Sem Estado</p>
          <p className="text-3xl font-display font-black text-text-dim tabular-nums">{statesWithNoData}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map Column */}
        <div className="lg:col-span-8 bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-3">
              <MapPin size={14} className="text-primary" /> Mapa de Distribuição — Brasil
            </h3>
            {hoveredInfo && (
              <div className="flex items-center gap-3 px-4 py-2 bg-bg-sidebar rounded-2xl border border-border-subtle animate-in fade-in duration-150">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-text-main uppercase tracking-wider">{hoveredInfo.name}</span>
                <span className="text-[10px] font-black text-primary">{hoveredInfo.count} pac.</span>
              </div>
            )}
          </div>

          {/* SVG Brazil Map */}
          <div className="relative">
            <svg
              viewBox="50 55 350 370"
              className="w-full h-auto drop-shadow-2xl"
              style={{ maxHeight: '520px' }}
            >
              <defs>
                <filter id="state-glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {BRAZIL_STATES.map(state => {
                const path = STATE_PATHS[state.id];
                if (!path) return null;
                const count = stateCounts[state.id] || 0;
                const isHovered = hoveredState === state.id;
                return (
                  <g key={state.id}>
                    <path
                      d={path}
                      fill={getStateColor(state.id)}
                      stroke={getStateStroke(state.id)}
                      strokeWidth={isHovered ? 2 : 0.8}
                      className="cursor-pointer transition-all duration-200"
                      filter={isHovered && count > 0 ? 'url(#state-glow)' : undefined}
                      onMouseEnter={() => setHoveredState(state.id)}
                      onMouseLeave={() => setHoveredState(null)}
                      style={{ transform: isHovered ? 'scale(1.01)' : 'scale(1)', transformOrigin: `${state.cx}px ${state.cy}px` }}
                    />
                    {/* State label for larger states */}
                    <text
                      x={state.cx}
                      y={state.cy + 4}
                      textAnchor="middle"
                      fontSize={count > 0 ? 7.5 : 6}
                      fontWeight={count > 0 ? '900' : '600'}
                      fill={count > 0 ? '#ffffff' : '#475569'}
                      className="pointer-events-none select-none"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {state.id}
                    </text>
                    {count > 0 && (
                      <text
                        x={state.cx}
                        y={state.cy + 14}
                        textAnchor="middle"
                        fontSize={6}
                        fontWeight="700"
                        fill="#f59e0b"
                        className="pointer-events-none select-none"
                      >
                        {count}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-6">
            <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Intensidade por Pacientes</span>
            <div className="flex items-center gap-2">
              {[
                { color: '#1e293b', label: 'Nenhum' },
                { color: '#78350f', label: '1' },
                { color: '#d97706', label: '2–3' },
                { color: '#f59e0b', label: '4–6' },
                { color: '#bf9b6b', label: '7+' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded-sm border border-white/10" style={{ background: item.color }} />
                  <span className="text-[8px] font-black text-text-dim uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ranking Column */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <BarChart3 size={14} className="text-primary" /> Ranking por Estado
          </h3>

          {ranked.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <Globe size={40} className="text-text-dim mb-4" />
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">
                Nenhum paciente com estado cadastrado
              </p>
              <p className="text-[9px] text-text-dim/60 mt-2 font-medium">
                Cadastre o campo "Estado" nos perfis de pacientes
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {ranked.map((item, i) => (
                <div
                  key={item.uf}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-default group",
                    hoveredState === item.uf
                      ? "bg-primary/10 border-primary/30"
                      : "bg-bg-sidebar/40 border-border-subtle hover:border-primary/20"
                  )}
                  onMouseEnter={() => setHoveredState(item.uf)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <span className="text-[9px] font-black text-text-dim w-5 text-center tabular-nums">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-text-main border border-border-subtle shrink-0"
                    style={{ background: getStateColor(item.uf) }}>
                    {item.uf}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-black text-text-main truncate">{item.name}</p>
                    <div className="w-full bg-bg-deep rounded-full h-1 mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                          background: getStateColor(item.uf)
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-black text-primary tabular-nums">{item.count}</p>
                    <p className="text-[8px] font-bold text-text-dim tabular-nums">{item.pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {statesWithNoData > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-[9px] font-black text-text-dim uppercase tracking-widest text-center">
                {statesWithNoData} paciente{statesWithNoData > 1 ? 's' : ''} sem estado cadastrado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
