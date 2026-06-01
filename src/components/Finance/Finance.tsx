import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, Filter, Trash2, Search, Calendar as CalendarIcon, FileText, Target, Users, Landmark, ArrowUpRight, ArrowDownRight, Activity, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { db, type Transaction, type Patient, logAction } from '../../lib/db';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import TransactionModal from './TransactionModal';
import ConfirmModal from '../ui/ConfirmModal';
import useConfirm from '../../hooks/useConfirm';

export default function Finance() {
  const [transactions, setTransactions] = useState<(Transaction & { patientName?: string })[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'flow' | 'contracts'>('flow');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [revenueGoal, setRevenueGoal] = useState<number>(0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadSettings();
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const list = await db.pacientes.toArray();
    // Filtramos apenas pacientes de status ativo (ou sem status definido, assumidos ativos por padrão)
    const active = list.filter(p => !p.status || p.status === 'ativo');
    setPatients(active);
  };

  const loadSettings = async () => {
    const items = await db.settings.toArray();
    const s: any = {};
    items.forEach(item => s[item.key] = item.value);
    setSettings(s);
    if (s.revenueGoal) setRevenueGoal(s.revenueGoal);
  };

  const saveGoal = async (val: number) => {
    await db.settings.put({ key: 'revenueGoal', value: val });
    setRevenueGoal(val);
    setIsEditingGoal(false);
  };

  const calculateProjections = () => {
    const totalMonthly = patients.reduce((acc, p) => {
      const parseLocalNumber = (val: any) => {
        if (val === undefined || val === null || val === '') return 0;
        if (typeof val === 'number') return val;
        const cleaned = String(val)
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        const num = Number(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const valorFinal = parseLocalNumber(p.valorFinalCombinado);
      const valorMensal = parseLocalNumber(p.valorMensal);
      const valorConsulta = parseLocalNumber(p.valorConsulta);
      const freqSemanal = parseLocalNumber(p.frequenciaSemanal) || 1;

      const monthly = valorFinal > 0
        ? valorFinal
        : valorMensal > 0
          ? valorMensal
          : (valorConsulta * freqSemanal * 4.33);

      const safeMonthly = isNaN(monthly) ? 0 : monthly;
      return acc + safeMonthly;
    }, 0);

    const totalWeekly = totalMonthly / 4.33; // Média real de semanas num mês (52/12)
    const totalDaily = totalMonthly / 22; // Base de 22 dias úteis
    return { 
      totalDaily: isNaN(totalDaily) ? 0 : totalDaily, 
      totalWeekly: isNaN(totalWeekly) ? 0 : totalWeekly, 
      totalMonthly: isNaN(totalMonthly) ? 0 : totalMonthly 
    };
  };

  const projections = useMemo(() => calculateProjections(), [patients]);

  const chartData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    sorted.slice(-12).forEach(t => {
      const date = new Date(t.data);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      if (t.tipo === 'receita') months[monthKey].income += t.valor;
      else months[monthKey].expense += t.valor;
    });

    return Object.values(months);
  }, [transactions]);
  
  const { isOpen, confirm, close, handleConfirm, options } = useConfirm();

  useEffect(() => {
    loadTransactions();
  }, [searchTerm, filterType]);

  const loadTransactions = async () => {
    let query = db.transacoes.orderBy('data').reverse();
    const all = await query.toArray();
    
    const enriched = await Promise.all(all.map(async (t) => {
      let patientName = '-';
      if (t.pacienteId) {
        const p = await db.pacientes.get(t.pacienteId);
        patientName = p?.nome || 'Não Encontrado';
      }
      const valor = isNaN(Number(t.valor)) ? 0 : Number(t.valor);
      return { ...t, valor, patientName };
    }));

    const filtered = enriched.filter(t => {
      const matchSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'todos' ? true : t.tipo === filterType;
      return matchSearch && matchType;
    });

    setTransactions(filtered);

    const income = enriched.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + (isNaN(Number(t.valor)) ? 0 : Number(t.valor)), 0);
    const expense = enriched.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + (isNaN(Number(t.valor)) ? 0 : Number(t.valor)), 0);
    setStats({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    });
  };

  const handleDelete = (id: string, desc: string) => {
    confirm({
      title: 'Excluir Transação',
      message: `Deseja realmente remover o lançamento "${desc}"? Esta ação afetará permanentemente o fluxo de caixa consolidado.`,
      confirmLabel: 'Excluir Lançamento',
      variant: 'danger',
      onConfirm: async () => {
        await db.transacoes.delete(id);
        const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
        logAction(currentUser, `Removeu transação: ${desc}`);
        loadTransactions();
      }
    });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border-subtle pb-10">
        <div>
          <h2 className="text-4xl font-display font-black text-white tracking-tighter">Performance Financeira</h2>
          <div className="flex items-center gap-3 mt-2">
            <Activity size={14} className="text-primary animate-pulse" />
            <p className="text-text-dim text-xs font-black uppercase tracking-widest">Dashboards de Gestão & Fluxo em Tempo Real</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex bg-bg-sidebar p-1.5 rounded-[1.25rem] border border-border-subtle shadow-inner">
              <button 
                onClick={() => setActiveTab('flow')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                  activeTab === 'flow' ? "bg-primary text-bg-deep shadow-xl shadow-primary/20" : "text-text-dim hover:text-text-main"
                )}
              >
                <Landmark size={14} /> Fluxo
              </button>
              <button 
                onClick={() => setActiveTab('contracts')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                  activeTab === 'contracts' ? "bg-primary text-bg-deep shadow-xl shadow-primary/20" : "text-text-dim hover:text-text-main"
                )}
              >
                <Users size={14} /> Contratos
              </button>
           </div>
          <button
            onClick={() => {
              setSelectedTransaction(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-3 px-10 py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.1em] text-[10px] rounded-[1.25rem] transition-all shadow-2xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={18} />
            Lançar Transação
          </button>
        </div>
      </div>

      {activeTab === 'flow' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-bg-card/40 border border-border-subtle p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl hover:border-green-500/30 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                <ArrowUpRight size={112} className="text-green-500" />
              </div>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] mb-6">Total em Receitas</p>
              <h4 className="text-4xl font-display font-black text-green-500 tracking-tighter">{formatCurrency(stats.totalIncome)}</h4>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Caixa Realizado</span>
              </div>
            </div>

            <div className="bg-bg-card/40 border border-border-subtle p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl hover:border-red-500/30 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                <ArrowDownRight size={112} className="text-red-500" />
              </div>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] mb-6">Total em Despesas</p>
              <h4 className="text-4xl font-display font-black text-red-400 tracking-tighter">{formatCurrency(stats.totalExpense)}</h4>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Saídas Brutas</span>
              </div>
            </div>

            <div className="bg-bg-card/40 border border-border-subtle p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl hover:border-primary/30 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4 text-primary">
                <DollarSign size={112} />
              </div>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] mb-6">Saldo Líquido</p>
              <h4 className="text-4xl font-display font-black text-white tracking-tighter">{formatCurrency(stats.balance)}</h4>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-grow h-1.5 bg-border-subtle rounded-full overflow-hidden">
                   <div className="h-full bg-primary/40 w-1/2" />
                </div>
                <span className="text-[8px] font-black text-text-dim uppercase tracking-widest">Liquidez</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-indigo-500/30 group">
               <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.4em]">Faturamento • Meta</p>
                    <Target size={20} className="text-white/40" />
                 </div>
                 {isEditingGoal ? (
                   <input 
                     autoFocus
                     type="number"
                     onBlur={(e) => saveGoal(Number(e.target.value))}
                     onKeyDown={(e) => e.key === 'Enter' && saveGoal(Number((e.target as any).value))}
                     className="bg-white/10 border-b-2 border-white/30 outline-none text-white text-3xl font-display font-black w-full pb-2 mb-4"
                   />
                 ) : (
                   <h4 onClick={() => setIsEditingGoal(true)} className="text-4xl font-display font-black text-white tracking-tighter cursor-pointer hover:scale-105 transition-transform origin-left">
                     {formatCurrency(revenueGoal)}
                   </h4>
                 )}
                 <div className="mt-10 flex flex-col gap-3">
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                       <div 
                         className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-lg" 
                         style={{ width: `${Math.max(0, Math.min(100, isNaN(stats.totalIncome / (revenueGoal || 1)) ? 0 : (stats.totalIncome / (revenueGoal || 1)) * 100))}%` }} 
                       />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">{isNaN((stats.totalIncome / (revenueGoal || 1)) * 100) ? '0.0' : ((stats.totalIncome / (revenueGoal || 1)) * 100).toFixed(1)}% Atingido</p>
                      <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">{formatCurrency(Math.max(0, revenueGoal - stats.totalIncome))} faltante</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-bg-card/40 border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] flex items-center gap-3">
                   <TrendingUp size={16} className="text-primary" /> Tendência de Receitas x Despesas
                </h4>
              </div>
              <div className="h-[400px] w-full relative overflow-hidden" style={{ minHeight: '400px' }}>
                {isMounted && (
                  <ResponsiveContainer width="99%" height="100%" debounce={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}}
                        dy={10}
                      />
                      <YAxis 
                        hide
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px', color: '#fff' }}
                        itemStyle={{ textTransform: 'uppercase', fontWeight: 900 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                        name="Receita"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#f87171" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                        name="Despesa"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-bg-card/40 border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between">
               <div>
                  <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] mb-8">Saúde Financeira</h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-bg-sidebar/50 rounded-2xl border border-border-subtle">
                       <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Margem de Lucro</span>
                       <span className="text-sm font-display font-black text-green-500">
                         {stats.totalIncome > 0 && !isNaN(stats.balance / stats.totalIncome) ? ((stats.balance / stats.totalIncome) * 100).toFixed(1) : '0'}%
                       </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-bg-sidebar/50 rounded-2xl border border-border-subtle">
                       <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nº Lançamentos</span>
                       <span className="text-sm font-display font-black text-text-main">
                         {transactions.length}
                       </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-bg-sidebar/50 rounded-2xl border border-border-subtle">
                       <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Ticket Médio</span>
                       <span className="text-sm font-display font-black text-primary">
                        {formatCurrency(stats.totalIncome / (transactions.filter(t => t.tipo === 'receita').length || 1))}
                       </span>
                    </div>
                  </div>
               </div>
               <div className="mt-10 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <Sparkles size={12} /> Insight Rápido
                  </p>
                  <p className="text-[11px] text-text-dim font-medium leading-relaxed">
                    Seu saldo {stats.balance >= 0 ? 'está positivo e representa' : 'está negativo em'} um perfil de {isNaN((stats.balance / (stats.totalIncome || 1)) * 100) ? '0' : Math.abs((stats.balance / (stats.totalIncome || 1)) * 100).toFixed(0)}% sobre o faturamento total bruto.
                  </p>
               </div>
            </div>
          </div>

          <div className="bg-bg-card/40 border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl mt-12">
            <div className="p-8 border-b border-border-subtle flex flex-col lg:flex-row gap-8 bg-bg-sidebar/80 backdrop-blur-md sticky top-0 z-10">
              <div className="relative flex-grow group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Pesquisar por descrição, paciente ou competência..."
                  className="w-full pl-16 pr-8 py-4 bg-bg-sidebar/50 border border-border-subtle rounded-2xl outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/50 text-xs font-black uppercase tracking-widest transition-all placeholder:text-text-dim/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className={cn(
                    "px-8 py-4 bg-bg-sidebar/50 border rounded-2xl outline-none focus:ring-8 focus:ring-primary/5 text-[10px] font-black uppercase tracking-[0.2em] appearance-none cursor-pointer min-w-[220px] transition-all text-center",
                    filterType === 'receita' ? "text-green-500 border-green-500/20" : 
                    filterType === 'despesa' ? "text-red-400 border-red-400/20" : "text-text-main border-border-subtle"
                  )}
                >
                  <option value="todos">Todos os Registros</option>
                  <option value="receita">Filtro: Receitas</option>
                  <option value="despesa">Filtro: Despesas</option>
                </select>
                <button className="p-4 bg-bg-sidebar/50 border border-border-subtle rounded-2xl hover:border-primary/50 transition-all text-text-dim hover:text-text-main shadow-inner">
                  <Download size={22} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto scroller-hide">
              <table className="w-full text-left">
                <thead className="bg-bg-sidebar/30 text-[9px] font-black uppercase tracking-[0.3em] text-text-dim border-b border-border-subtle shadow-sm">
                  <tr>
                    <th className="px-10 py-6">Data de Lançamento</th>
                    <th className="px-10 py-6">Descrição Técnica</th>
                    <th className="px-10 py-6">Vínculo</th>
                    <th className="px-10 py-6">Forma</th>
                    <th className="px-10 py-6 text-right">Montante</th>
                    <th className="px-10 py-6 text-center">Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/30">
                  {transactions.map((t, idx) => (
                    <tr key={`trans-v2-${t.id || 'new'}-${idx}-${transactions.length}`} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-10 py-7 text-[11px] text-text-dim font-black tabular-nums uppercase whitespace-nowrap">{formatDate(t.data)}</td>
                      <td className="px-10 py-7 font-black text-text-main text-[11px] uppercase tracking-wider">{t.descricao}</td>
                      <td className="px-10 py-7 text-[10px] text-text-dim font-bold uppercase tracking-widest">{t.patientName}</td>
                      <td className="px-10 py-7">
                        <span className="px-4 py-1.5 bg-bg-sidebar/50 border border-border-subtle rounded-xl text-[8px] font-black uppercase tracking-widest text-text-dim group-hover:text-text-main group-hover:border-primary/20 transition-all">
                          {t.formaPagamento || 'Outro'}
                        </span>
                      </td>
                      <td className={cn(
                        "px-10 py-7 text-right font-display font-black text-base tabular-nums tracking-tighter",
                        t.tipo === 'receita' ? "text-green-500" : "text-red-400"
                      )}>
                        {t.tipo === 'receita' ? '+' : '-'} {formatCurrency(t.valor)}
                      </td>
                      <td className="px-10 py-7 text-center">
                        <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          {t.tipo === 'receita' && (
                            <button 
                              onClick={() => {
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  const psychName = settings.appTitle || "Psicólogo(a)";
                                  const psychCrp = settings.psychCrp || "_________________";
                                  
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Recibo - ${t.patientName}</title>
                                        <style>
                                          body { font-family: 'Inter', sans-serif; padding: 60px; line-height: 1.8; color: #1e293b; max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; }
                                          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; }
                                          .title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
                                          .content { margin-bottom: 60px; text-align: justify; }
                                          .signature { text-align: center; margin-top: 100px; border-top: 1px solid #94a3b8; padding-top: 10px; width: 300px; margin-left: auto; margin-right: auto; }
                                          .footer { position: fixed; bottom: 40px; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="header"><div class="title">Recibo de Honorários</div></div>
                                        <div class="content">
                                          <p>Recebi de <strong>\${t.patientName}</strong>, a importância de <strong>\${formatCurrency(t.valor)}</strong> referente a <strong>\${t.descricao}</strong>, realizado em \${formatDate(t.data)}.</p>
                                          <p>Por ser verdade, firmo o presente.</p>
                                          <p style="margin-top: 40px; text-align: right;">Data: \${new Date().toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div class="signature">
                                          <strong>\${psychName}</strong><br/>
                                          Psicólogo(a) - CRP nº \${psychCrp}
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                  printWindow.print();
                                }
                              }}
                              className="p-3 bg-bg-sidebar border border-border-subtle hover:border-primary/40 rounded-[1.25rem] text-text-dim hover:text-primary transition-all shadow-sm"
                              title="Gerar Recibo"
                            >
                              <FileText size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(t.id, t.descricao)}
                            className="p-3 bg-bg-sidebar border border-border-subtle hover:border-red-500/40 rounded-[1.25rem] text-text-dim hover:text-red-400 transition-all shadow-sm"
                            title="Remover"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-10 py-32 text-center">
                         <div className="w-20 h-20 bg-bg-sidebar rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-dim/20 shadow-inner">
                            <Landmark size={32} />
                         </div>
                         <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em]">Limpeza de Fluxo Total • Sem Lançamentos</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-bg-card/40 border border-border-subtle p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute -left-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] mb-6">Potencial Diário Projetado</p>
                 <h4 className="text-4xl font-display font-black text-white tracking-tighter">{formatCurrency(projections.totalDaily)}</h4>
                 <div className="mt-6 p-3 bg-bg-sidebar/50 border border-border-subtle rounded-2xl flex items-center gap-3">
                   <CalendarIcon size={14} className="text-primary/40" />
                   <p className="text-[9px] text-text-dim font-black uppercase tracking-widest">Base: 22 dias úteis / Competência</p>
                 </div>
              </div>
              <div className="bg-bg-card/40 border border-border-subtle p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute -left-12 -top-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] mb-6">Média Semanal Prevista</p>
                 <h4 className="text-4xl font-display font-black text-white tracking-tighter">{formatCurrency(projections.totalWeekly)}</h4>
                 <div className="mt-6 p-3 bg-bg-sidebar/50 border border-border-subtle rounded-2xl flex items-center gap-3">
                   <TrendingUp size={14} className="text-indigo-500/40" />
                   <p className="text-[9px] text-text-dim font-black uppercase tracking-widest">Ponto de Equilíbrio Semanal</p>
                 </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border-dashed">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                   <Activity size={12} /> Carteira de Contratos Ativos
                 </p>
                 <h4 className="text-4xl font-display font-black text-primary tracking-tighter">{formatCurrency(projections.totalMonthly)}</h4>
                 <p className="text-[10px] text-primary/40 mt-6 font-black uppercase tracking-widest">Soma Consolidada de Honorários Fixados</p>
              </div>
           </div>

           <div className="bg-bg-card/40 border border-border-subtle rounded-[3rem] overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto scroller-hide">
                 <table className="w-full text-left">
                    <thead className="bg-bg-sidebar/30 text-[9px] font-black uppercase tracking-[0.3em] text-text-dim border-b border-border-subtle">
                       <tr>
                          <th className="px-10 py-6">Paciente Colaborador</th>
                          <th className="px-10 py-6">Valor / Sessão</th>
                          <th className="px-10 py-6">Freq. Semanal</th>
                          <th className="px-10 py-6">Contrato Fixo</th>
                          <th className="px-10 py-6 text-right">Expectativa Bruta</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/30 text-sm font-medium">
                       {patients.map((p, idx) => (
                          <tr key={`contract-safe-${p.id || 'p'}-${idx}`} className="hover:bg-primary/[0.02] transition-colors group">
                             <td className="px-10 py-8 text-text-main font-black uppercase tracking-widest text-[11px]">{p.nome}</td>
                             <td className="px-10 py-8 text-text-dim tabular-nums font-black tabular-nums">{formatCurrency(p.valorConsulta || 0)}</td>
                             <td className="px-10 py-8">
                                <span className="px-4 py-1.5 bg-bg-sidebar/50 border border-border-subtle rounded-xl text-[8px] font-black uppercase tracking-widest text-text-dim">
                                  {p.frequenciaSemanal || 1}x por semana
                                </span>
                             </td>
                             <td className="px-10 py-8 text-text-dim tabular-nums font-black">{formatCurrency(p.valorFinalCombinado || p.valorMensal || 0)}</td>
                             <td className="px-10 py-8 text-primary font-black tabular-nums text-lg text-right tracking-tighter">
                               {formatCurrency(p.valorFinalCombinado || p.valorMensal || ((p.valorConsulta || 0) * (p.frequenciaSemanal || 1) * 4.33))}
                             </td>
                          </tr>
                       ))}
                       {patients.length === 0 && (
                          <tr>
                             <td colSpan={5} className="px-10 py-32 text-center text-text-dim/40 text-[10px] font-black uppercase tracking-[0.4em]">Sem contratos ativos na carteira</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
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

      {isModalOpen && (
        <TransactionModal
          transaction={selectedTransaction}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            loadTransactions();
          }}
        />
      )}
    </div>
  );
}
