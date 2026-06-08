import React, { useState, useEffect } from 'react';
import { User, LogOut, Users, Calendar, MessageSquare, DollarSign, BarChart3, Palette, Bell, HelpCircle, History, AlertTriangle, AlertCircle, Info, Check, X, CheckSquare, Cloud, CloudOff, RefreshCw, Brain } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/db';
import { syncService, SyncState } from '../lib/syncService';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentUser: { id?: string; username: string; crp?: string } | null;
  onLogout: () => void;
  appTitle?: string;
  appLogo?: string;
}

export default function Layout({
  children,
  activeSection,
  onSectionChange,
  currentUser,
  onLogout,
  appTitle = "Sistema de Gestão para Psicólogos",
  appLogo
}: LayoutProps) {
  const [adjustmentCount, setAdjustmentCount] = useState(0);

  const [syncState, setSyncState] = useState<SyncState>(syncService.getSyncState());
  const isGoogleUser = !!(currentUser && currentUser.id && currentUser.id.length > 20);

  useEffect(() => {
    if (isGoogleUser) {
      const unsubscribe = syncService.subscribe((state) => {
        setSyncState(state);
      });
      return unsubscribe;
    }
  }, [isGoogleUser]);

  // --- ENGINE DE NOTIFICAÇÕES REAL-TIME ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isOpenNotif, setIsOpenNotif] = useState(false);
  const [notifTab, setNotifTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('psiDismissedNotifs_v10') || '[]');
    setDismissedIds(loaded);
  }, []);

  const loadNotifications = async () => {
    try {
      const pts = await db.pacientes.toArray();
      const appts = await db.agendamentos.toArray();
      const newList: any[] = [];
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Consentimento LGPD Pendente
      pts.forEach(p => {
        if (p.status !== 'inativo' && !p.evidenciaLGPDAceite) {
          newList.push({
            id: `lgpd-${p.id}`,
            type: 'warning',
            title: 'Termo LGPD Pendente',
            description: `Paciente ${p.nome} não assinou o termo de consentimento regulamentar da LGPD.`,
            category: 'Legal',
            section: 'pacientes'
          });
        }
      });

      // 2. Reajuste contratual em breve (Próximos 30 dias)
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      pts.forEach(p => {
        if (p.status !== 'inativo' && p.dataReajuste) {
          const reajusteDate = new Date(p.dataReajuste + 'T12:00:00');
          if (reajusteDate <= thirtyDaysFromNow && reajusteDate >= now) {
            newList.push({
              id: `reajuste-${p.id}-${p.dataReajuste}`,
              type: 'info',
              title: 'Reajuste Contratual',
              description: `O contrato de ${p.nome} necessita de reajuste financeiro em ${new Date(p.dataReajuste).toLocaleDateString('pt-BR')}.`,
              category: 'Financeiro',
              section: 'pacientes'
            });
          }
        }
      });

      // 3. Cadastro incompleto (Falta telefone ou CPF)
      pts.forEach(p => {
        if (p.status !== 'inativo' && (!p.telefone || !p.cpf)) {
          newList.push({
            id: `cadastro-${p.id}`,
            type: 'warning',
            title: 'Cadastro Incompleto',
            description: `O cadastro de ${p.nome} está sem ${[!p.telefone ? 'Telefone' : '', !p.cpf ? 'CPF' : ''].filter(Boolean).join(' e ')}.`,
            category: 'Contatos',
            section: 'pacientes'
          });
        }
      });

      // 4. Sessões passadas sem evolução clínica ou registro de fechamento
      appts.forEach(a => {
        const patient = pts.find(p => p.id === a.pacienteId);
        if (a.data < todayStr && a.status !== 'completed' && a.status !== 'cancelled') {
          newList.push({
            id: `prontuario-${a.id}`,
            type: 'danger',
            title: 'Prontuário Pendente',
            description: `Sessão de ${patient?.nome || 'Paciente'} em ${new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} às ${a.hora} está sem evolução/fechamento clínico.`,
            category: 'Clínico',
            section: 'prontuarios'
          });
        }
      });

      // 5. Churn iminente (Pacientes ativos há mais de 15 dias sem agendamentos futuros)
      const futureAppts = appts.filter(a => a.data >= todayStr && a.status !== 'cancelled');
      pts.forEach(p => {
        if (p.status !== 'inativo') {
          const hasFuture = futureAppts.some(a => a.pacienteId === p.id);
          if (!hasFuture) {
            newList.push({
              id: `churn-${p.id}`,
              type: 'warning',
              title: 'Paciente Sem Consulta',
              description: `O paciente ${p.nome} está ativo mas não possui qualquer agendamento futuro (risco de evasão).`,
              category: 'Retenção',
              section: 'agenda'
            });
          }
        }
      });

      setNotifications(newList);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [dismissedIds]);

  const handleDismiss = (id: string) => {
    const list = [...dismissedIds, id];
    setDismissedIds(list);
    localStorage.setItem('psiDismissedNotifs_v10', JSON.stringify(list));
  };

  const handleResolve = (notif: any) => {
    handleDismiss(notif.id);
    onSectionChange(notif.section);
    setIsOpenNotif(false);
  };

  const pendingNotifs = notifications.filter(n => !dismissedIds.includes(n.id));
  const historyNotifs = notifications.filter(n => dismissedIds.includes(n.id));
  const unresolvedCount = pendingNotifs.length;

  useEffect(() => {
    const checkAdjustments = async () => {
      const patients = await db.pacientes.toArray();
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      const pending = patients.filter(p => {
        if (!p.dataReajuste) return false;
        const reajusteDate = new Date(p.dataReajuste + 'T12:00:00');
        return reajusteDate <= thirtyDaysFromNow && reajusteDate >= now;
      });
      setAdjustmentCount(pending.length);
    };
    checkAdjustments();
    // Check every hour
    const interval = setInterval(checkAdjustments, 3600000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'pacientes', label: 'Pacientes', icon: Users, badge: adjustmentCount > 0 ? adjustmentCount : null },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'prontuarios', label: 'Prontuários', icon: MessageSquare },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'ferramentas', label: 'Ferramentas', icon: Brain },
    { id: 'settings', label: 'Configurações', icon: Palette },
  ];

  if (!currentUser) return <>{children}</>;

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col selection:bg-primary/30 selection:text-white">
      <header className="bg-bg-sidebar border-b border-border-subtle py-4 px-6 fixed top-0 w-full z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {appLogo && <img src={appLogo} alt="Logo" className="h-9 w-auto rounded opacity-90" />}
            <h1 className="text-xl font-display font-bold text-primary flex items-center gap-2 tracking-tight">
              {appTitle}
            </h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-text-main">{currentUser.username.replace(/^Dr\.\s?/, '')}</p>
              {currentUser.crp && <p className="text-text-dim text-[11px] font-medium tracking-wide">CRP: {currentUser.crp}</p>}
            </div>

            {isGoogleUser && (
              <button
                onClick={() => currentUser.id && syncService.syncAll(currentUser.id)}
                disabled={syncState.status === 'syncing'}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all shrink-0 uppercase tracking-widest",
                  syncState.status === 'syncing' ? "bg-primary/5 border-primary/30 text-primary animate-pulse cursor-not-allowed" :
                  syncState.status === 'synced' ? "bg-green-500/5 border-green-500/20 text-green-500 hover:border-green-500/40" :
                  syncState.status === 'error' ? "bg-red-500/5 border-red-500/20 text-red-500 hover:border-red-500/40" :
                  "bg-bg-card border-border-subtle text-text-dim hover:text-text-main hover:border-border-subtle/80"
                )}
                title={
                  syncState.status === 'syncing' ? "Sincronizando com a Nuvem Google..." :
                  syncState.status === 'synced' ? `Sincronizado! Último backup: ${syncState.lastSync?.toLocaleTimeString('pt-BR')}` :
                  syncState.status === 'error' ? `Erro de sincronização: ${syncState.errorMessage}` :
                  "Sincronização inativa. Clique para sincronizar."
                }
              >
                {syncState.status === 'syncing' ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : syncState.status === 'error' ? (
                  <CloudOff size={12} />
                ) : (
                  <Cloud size={12} className={cn(syncState.status === 'synced' && "fill-green-500/20")} />
                )}
                <span className="hidden md:inline">
                  {syncState.status === 'syncing' ? 'Sincronizando' :
                   syncState.status === 'synced' ? 'Nuvem Ativa' :
                   syncState.status === 'error' ? 'Erro Backup' : 'Sincronizar'}
                </span>
              </button>
            )}

            {/* Notification Bell Icon & Component */}
            <div className="relative">
              <button
                onClick={() => setIsOpenNotif(!isOpenNotif)}
                className={cn(
                  "p-2.5 bg-bg-card border border-border-subtle hover:border-primary/50 text-text-dim hover:text-primary rounded-xl transition-all relative group",
                  isOpenNotif && "border-primary text-primary bg-primary/5"
                )}
                title="Notificações e Pendências"
              >
                <Bell size={18} className="group-hover:rotate-12 transition-transform duration-350" />
                {unresolvedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-bg-deep font-black text-[8px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-bg-sidebar animate-pulse font-display">
                    {unresolvedCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isOpenNotif && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpenNotif(false)} />
                  <div className="absolute right-0 mt-3 w-96 bg-bg-card border border-border-subtle rounded-[2.25rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                    
                    {/* Header */}
                    <div className="p-6 border-b border-border-subtle/60 flex items-center justify-between bg-bg-sidebar/90 relative z-10 shrink-0">
                      <div>
                        <h3 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                          <Bell size={14} className="text-primary" /> Central de Pendências
                        </h3>
                        <p className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest mt-1">Sinalização de inconsistências & lembretes</p>
                      </div>
                      <button 
                        onClick={() => setIsOpenNotif(false)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-text-dim hover:text-text-main border border-transparent hover:border-border-subtle transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border-subtle bg-bg-sidebar/40 shrink-0 relative z-10 text-[9px] font-black uppercase tracking-widest">
                      <button
                        onClick={() => setNotifTab('pending')}
                        className={cn(
                          "flex-1 py-3 text-center border-b-2 transition-all",
                          notifTab === 'pending'
                            ? "border-primary text-primary bg-bg-card/40"
                            : "border-transparent text-text-dim hover:text-text-main hover:bg-white/[0.01]"
                        )}
                      >
                        Pendentes ({unresolvedCount})
                      </button>
                      <button
                        onClick={() => setNotifTab('history')}
                        className={cn(
                          "flex-1 py-3 text-center border-b-2 transition-all",
                          notifTab === 'history'
                            ? "border-primary text-primary bg-bg-card/40"
                            : "border-transparent text-text-dim hover:text-text-main hover:bg-white/[0.01]"
                        )}
                      >
                        Histórico ({historyNotifs.length})
                      </button>
                    </div>

                    {/* Notification List Container */}
                    <div className="max-h-[350px] overflow-y-auto p-4 space-y-3 relative z-10 scroller-hide bg-bg-card/30">
                      {notifTab === 'pending' ? (
                        <>
                          {pendingNotifs.map((notif) => {
                            const isDanger = notif.type === 'danger';
                            const isWarning = notif.type === 'warning';
                            return (
                              <div 
                                key={notif.id} 
                                className="p-4 bg-bg-sidebar border border-border-subtle hover:border-border-subtle/80 rounded-2xl transition-all relative overflow-hidden flex gap-3 text-left border-l-4 border-l-primary"
                                style={{
                                  borderLeftColor: isDanger ? 'rgb(239, 68, 68)' : isWarning ? 'rgb(245, 158, 11)' : 'rgb(56, 189, 248)'
                                }}
                              >
                                <div className="shrink-0 mt-0.5">
                                  {isDanger ? (
                                    <AlertTriangle size={15} className="text-red-500 animate-pulse" />
                                  ) : isWarning ? (
                                    <AlertCircle size={15} className="text-amber-500" />
                                  ) : (
                                    <Info size={15} className="text-sky-400" />
                                  )}
                                </div>
                                <div className="flex-grow space-y-1">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-[11px] font-bold text-text-main leading-tight uppercase tracking-wider">{notif.title}</h4>
                                    <span className="text-[7.5px] font-black text-text-dim/30 uppercase tracking-widest bg-white/5 py-0.5 px-2 rounded-full border border-white/5">{notif.category}</span>
                                  </div>
                                  <p className="text-[10px] text-text-dim/75 leading-relaxed font-semibold">{notif.description}</p>
                                  <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/30 mt-2">
                                    <button
                                      onClick={() => handleResolve(notif)}
                                      className="py-1 px-2.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[8px] font-black tracking-widest uppercase hover:bg-primary hover:text-bg-deep transition-all"
                                    >
                                      Resolver
                                    </button>
                                    <button
                                      onClick={() => handleDismiss(notif.id)}
                                      className="py-1 px-2.5 bg-bg-card border border-border-subtle hover:border-red-500/30 text-text-dim hover:text-red-400 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all flex items-center gap-1"
                                      title="Remover e enviar para histórico"
                                    >
                                      <Check size={8} strokeWidth={4} /> Dispensar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {pendingNotifs.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                              <CheckSquare size={32} className="text-primary mb-3" />
                              <p className="text-[9px] font-black uppercase tracking-[0.25em]">Sua ferramenta está livre de pendências!</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {historyNotifs.map((notif) => (
                            <div 
                              key={`hist-${notif.id}`} 
                              className="p-4 bg-bg-sidebar/50 border border-border-subtle rounded-2xl relative overflow-hidden flex gap-3 opacity-60 text-left border-l-2 border-l-border-subtle"
                            >
                              <div className="shrink-0 mt-0.5">
                                <Check size={14} className="text-text-dim" />
                              </div>
                              <div className="flex-grow space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-[10px] font-semibold text-text-dim leading-tight uppercase tracking-wider">{notif.title}</h4>
                                  <span className="text-[7.5px] font-semibold text-text-dim/40 uppercase tracking-widest bg-white/5 py-0.5 px-1.5 rounded border border-white/5">{notif.category}</span>
                                </div>
                                <p className="text-[9px] text-text-dim/60 leading-relaxed font-semibold">{notif.description}</p>
                              </div>
                            </div>
                          ))}
                          {historyNotifs.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
                              <History size={28} className="text-text-dim mb-3" />
                              <p className="text-[9px] font-black uppercase tracking-[0.25em]">Histórico vazio.</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 bg-bg-card border border-border-subtle hover:border-red-500/50 rounded-xl transition-all text-text-dim hover:text-red-400 group"
              title="Sair"
            >
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-bg-sidebar/95 backdrop-blur-xl border-b border-border-subtle fixed top-[73px] w-full z-30 px-6">
        <div className="max-w-7xl mx-auto flex overflow-x-auto scroller-hide gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative min-w-max",
                  activeSection === item.id
                    ? "text-primary bg-bg-card"
                    : "text-text-dim hover:text-text-main hover:bg-white/[0.02]"
                )}
              >
                <Icon size={16} />
                {item.label}
                {item.id === 'pacientes' && item.badge && (
                  <span className="ml-2 flex items-center justify-center w-4 h-4 bg-amber-500 text-bg-deep text-[8px] font-black rounded-full animate-pulse border border-amber-400">
                    {item.badge}
                  </span>
                )}
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mt-[135px] h-[calc(100vh-135px-56px)] overflow-hidden p-6 relative">
        <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
