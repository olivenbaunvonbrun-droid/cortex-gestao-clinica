/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import { db, logAction } from './lib/db';
import Patients from './components/Patients/Patients';
import Agenda from './components/Agenda/Agenda';
import Records from './components/Records/Records';
import Finance from './components/Finance/Finance';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import Dashboard from './components/Dashboard/Dashboard';
import RidInteligenteApp from './components/RidInteligente/RidInteligenteApp';
import IhsDigitalApp from './components/IhsDigital/IhsDigitalApp';
import YsqSmartAiApp from './components/YsqSmartAi/YsqSmartAiApp';
import RegistroAtendimentoApp from './components/RegistroAtendimento/RegistroAtendimentoApp';
import PlanoClinicoIntegradoApp from './components/PlanoClinicoIntegrado/PlanoClinicoIntegradoApp';
import IhpPrDigitalApp from './components/IhpPrDigital/IhpPrDigitalApp';
import LinhaVidaApp from './components/LinhaVida/LinhaVidaApp';
import PsidiagnosticProApp from './components/PsidiagnosticPro/PsidiagnosticProApp';
import DfcAssistidoApp from './components/DfcAssistido/DfcAssistidoApp';
import ThpTrainingApp from './components/ThpTraining/ThpTrainingApp';
import ToolsLibrary from './components/ToolsLibrary/ToolsLibrary';
import BibliotecaAvaliacaoApp from './components/BibliotecaAvaliacao/BibliotecaAvaliacaoApp';
import { ClinicalSuggestionsSidebar } from './components/BibliotecaAvaliacao/components/ClinicalSuggestionsHelper';
import TeleconsultationApp from './components/Teleconsultation/TeleconsultationApp';
import { Window } from './components/ui/Window';
import { Brain, Cloud, Users, Sparkles, ClipboardList, Layers, TrendingUp, FileSpreadsheet, Activity, BookOpen, Video, Pin } from 'lucide-react';
import { cn } from './lib/utils';
import LGPDNotice from './components/LGPDNotice';
import { useFirebase } from './hooks/useFirebase';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { syncService } from './lib/syncService';

export default function App() {
  const { user: firebaseUser, loading: firebaseLoading } = useFirebase();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLGPD, setShowLGPD] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    appTitle: "Sistema de Gestão para Psicólogos",
    appLogo: "",
    layoutScale: "large",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // === UNIFIED WINDOW MANAGER ===
  interface ToolWindow {
    id: string;
    type: 'section' | 'tool';
    title: string;
    isMinimized: boolean;
    isMaximized: boolean;
    snapState?: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;
    zIndex: number;
    patientId?: string | null;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  }

  const [openWindows, setOpenWindows] = useState<ToolWindow[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(60);
  const [syncState, setSyncState] = useState<any>(syncService.getSyncState());

  const [pinnedTools, setPinnedTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cortex_pinned_tools_v1');
      return saved ? JSON.parse(saved) : ['rid-inteligente', 'ysq-smart-ai', 'registro-atendimento'];
    } catch {
      return ['rid-inteligente', 'ysq-smart-ai', 'registro-atendimento'];
    }
  });

  const handleTogglePin = (toolId: string) => {
    setPinnedTools(prev => {
      const updated = prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId];
      localStorage.setItem('cortex_pinned_tools_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const toolMetadataMap: Record<string, { title: string; shortTitle: string; icon: React.ComponentType<any> }> = {
    'rid-inteligente': { title: 'RID Inteligente', shortTitle: 'RID', icon: Brain },
    'ihs-digital': { title: 'IHS Digital', shortTitle: 'IHS', icon: Users },
    'ysq-smart-ai': { title: 'YSQ-Smart AI', shortTitle: 'YSQ', icon: Sparkles },
    'registro-atendimento': { title: 'Registro de Atendimento', shortTitle: 'SOAP', icon: ClipboardList },
    'plano-clinico-integrado': { title: 'Plano Clínico Integrado', shortTitle: 'PCI', icon: Layers },
    'ihp-pr-digital': { title: 'IHP-PR Digital', shortTitle: 'IHP', icon: Brain },
    'linha-vida': { title: 'Linha da Vida', shortTitle: 'Vida', icon: TrendingUp },
    'psidiagnostic-pro': { title: 'Psidiagnostic Pro', shortTitle: 'Psi', icon: FileSpreadsheet },
    'dfc-assistido': { title: 'DFC Assistido', shortTitle: 'DFC', icon: Layers },
    'thp-training': { title: 'Treinamento THP', shortTitle: 'THP', icon: Activity },
    'biblioteca-avaliacao': { title: 'Biblioteca de Avaliação', shortTitle: 'Testes', icon: BookOpen },
    'teleconsulta': { title: 'Teleconsulta Virtual', shortTitle: 'Vídeo', icon: Video },
  };

  // Live clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenTool = (toolId: string, patientId?: string | null) => {
    const titleMap: Record<string, string> = {
      'rid-inteligente': 'RID Inteligente',
      'ihs-digital': 'IHS Digital',
      'ysq-smart-ai': 'YSQ-Smart AI',
      'neurolitera': 'NeuroLitera',
      'registro-atendimento': 'Registro de Atendimento',
      'plano-clinico-integrado': 'Plano Clínico Integrado',
      'ihp-pr-digital': 'IHP-PR Digital',
      'linha-vida': 'Linha da Vida',
      'psidiagnostic-pro': 'Psidiagnostic Pro',
      'dfc-assistido': 'DFC Assistido',
      'thp-training': 'Treinamento THP',
      'biblioteca-avaliacao': 'Biblioteca de Avaliação',
      'teleconsulta': 'Teleconsulta Virtual',
    };

    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === toolId);
      if (existing) {
        return prev.map(w => 
          w.id === toolId 
            ? { ...w, isMinimized: false, zIndex: nextZ, patientId: patientId || w.patientId } 
            : w
        );
      }
      return [...prev, {
        id: toolId,
        type: 'tool',
        title: titleMap[toolId] || 'Ferramenta',
        isMinimized: false,
        isMaximized: true,
        snapState: null,
        zIndex: nextZ,
        patientId: patientId,
        width: toolId === 'teleconsulta' ? 1100 : 850,
        height: 650,
        x: 150 + (prev.length * 30) % 200,
        y: 120 + (prev.length * 30) % 200
      }];
    });
  };

  const handleOpenSection = (sectionId: string) => {
    setActiveSection(sectionId);

    const titleMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'pacientes': 'Gestão de Pacientes',
      'agenda': 'Agenda de Consultas',
      'prontuarios': 'Prontuários e Linha do Tempo',
      'financeiro': 'Controle Financeiro',
      'relatorios': 'Relatórios Clínicos',
      'ferramentas': 'Biblioteca de Ferramentas',
      'settings': 'Configurações'
    };

    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === `section-${sectionId}`);
      if (existing) {
        return prev.map(w => 
          w.id === `section-${sectionId}`
            ? { ...w, isMinimized: false, zIndex: nextZ }
            : w
        );
      }
      return [...prev, {
        id: `section-${sectionId}`,
        type: 'section',
        title: titleMap[sectionId] || 'Painel',
        isMinimized: false,
        isMaximized: true,
        snapState: null,
        zIndex: nextZ,
        width: 1000,
        height: 700,
        x: 80 + (prev.length * 30) % 200,
        y: 80 + (prev.length * 30) % 200
      }];
    });
  };

  const handleCloseTool = (toolId: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== toolId));
  };

  const handleToggleMinimize = (toolId: string) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setOpenWindows(prev => prev.map(w => {
      if (w.id === toolId) {
        return { 
          ...w, 
          isMinimized: !w.isMinimized,
          zIndex: w.isMinimized ? nextZ : w.zIndex
        };
      }
      return w;
    }));
  };

  const handleMaximizeTool = (toolId: string) => {
    setOpenWindows(prev => prev.map(w => 
      w.id === toolId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const handleFocusTool = (toolId: string) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setOpenWindows(prev => prev.map(w => 
      w.id === toolId ? { ...w, zIndex: nextZ } : w
    ));

    if (toolId.startsWith('section-')) {
      const sectionId = toolId.replace('section-', '');
      setActiveSection(sectionId);
    }
  };

  const handleSnapWindow = (toolId: string, snap: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null) => {
    setOpenWindows(prev => prev.map(w => 
      w.id === toolId ? { ...w, snapState: snap, isMaximized: snap === null ? w.isMaximized : false } : w
    ));
  };

  // Keyboard shortcut Alt+\
  const [isAltTabOpen, setIsAltTabOpen] = useState(false);
  const [altTabSelectionIndex, setAltTabSelectionIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '\\') {
        e.preventDefault();
        if (openWindows.length === 0) return;

        setIsAltTabOpen(prevOpen => {
          if (!prevOpen) {
            setAltTabSelectionIndex(0);
            return true;
          } else {
            setAltTabSelectionIndex(prevIndex => (prevIndex + 1) % openWindows.length);
            return true;
          }
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltTabOpen(prevOpen => {
          if (prevOpen) {
            const targetWin = openWindows[altTabSelectionIndex];
            if (targetWin) {
              handleFocusTool(targetWin.id);
              if (targetWin.isMinimized) {
                handleToggleMinimize(targetWin.id);
              }
            }
          }
          return false;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [openWindows, altTabSelectionIndex]);

  // Open dashboard window by default when loaded
  useEffect(() => {
    if (currentUser) {
      handleOpenSection('dashboard');
    }
  }, [currentUser]);

  useEffect(() => {
    const init = async () => {
      if (!firebaseUser) {
        const lastUser = localStorage.getItem('psiCurrentUsername_v9');
        if (lastUser) {
          const user = await db.users.where('username').equals(lastUser).first();
          if (user) {
            setCurrentUser(user);
          }
        }
      } else {
        setCurrentUser({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Profissional',
          email: firebaseUser.email
        });
      }

      const items = await db.settings.toArray();
      const s = { ...settings };
      items.forEach(item => {
        if (item.key === 'appTitle') s.appTitle = item.value;
        if (item.key === 'appLogo') s.appLogo = item.value;
        if (item.key === 'layoutScale') s.layoutScale = item.value;
      });
      setSettings(s);
      setIsLoading(false);
    };

    if (!firebaseLoading) {
      init();
    }
  }, [firebaseUser, firebaseLoading]);

  const isGoogleUser = !!(currentUser && currentUser.id && currentUser.id.length > 20);

  useEffect(() => {
    if (isGoogleUser) {
      const unsubscribe = syncService.subscribe((state) => {
        setSyncState(state);
      });
      return unsubscribe;
    }
  }, [isGoogleUser]);

  useEffect(() => {
    const scale = settings.layoutScale || 'large';
    document.documentElement.classList.remove('layout-scale-small', 'layout-scale-medium', 'layout-scale-large');
    document.documentElement.classList.add(`layout-scale-${scale}`);
  }, [settings.layoutScale]);

  useEffect(() => {
    if (firebaseUser) {
      syncService.syncAll(firebaseUser.uid);
      const syncInterval = setInterval(() => {
        syncService.syncAll(firebaseUser.uid);
      }, 30000);
      return () => clearInterval(syncInterval);
    }
  }, [firebaseUser]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    if (!firebaseUser) {
      localStorage.setItem('psiCurrentUsername_v9', user.username);
    }
    logAction(user.username, 'Login');
    
    const lgpdAccepted = sessionStorage.getItem('psiLGPD_Accepted');
    if (!lgpdAccepted) {
      setShowLGPD(true);
    }
  };

  const handleLogout = async () => {
    logAction(currentUser?.username || '', 'Logout');
    if (firebaseUser) {
      await signOut(auth);
    }
    setCurrentUser(null);
    localStorage.removeItem('psiCurrentUsername_v9');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-bg-deep flex flex-col items-center justify-center z-[200]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-primary rounded-2xl rotate-45 animate-pulse" />
          </div>
        </div>
        <div className="mt-12 text-center">
          <h1 className="text-2xl font-display font-black text-text-main tracking-[0.4em] uppercase">PSI.CORE</h1>
          <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mt-3 animate-pulse">Iniciando Ambiente Seguro...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout
        currentUser={currentUser}
        activeSection={activeSection}
        onSectionChange={handleOpenSection}
        onLogout={handleLogout}
        appTitle={settings.appTitle}
        appLogo={settings.appLogo}
      >
        {/* Workspace background desktop wallpaper */}
        <div className="relative w-full h-full overflow-hidden rounded-3xl bg-[#08090c]/45 border border-border-subtle/30 shadow-inner flex flex-col items-center justify-center p-8 select-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px] animate-pulse" />
          
          <div className="text-center z-10 space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
              <Brain size={32} className="text-primary animate-pulse" />
            </div>
            <h2 className="text-lg font-display font-black text-text-main tracking-[0.2em] uppercase">Área de Trabalho</h2>
            <p className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest leading-relaxed">
              Bem-vindo ao Cortex, {currentUser?.username.replace(/^Dr\.\s?/, '')}. Selecione uma aba no menu superior ou abra uma ferramenta para começar.
            </p>
          </div>
        </div>
      </Layout>
 
      {/* FLOATING WINDOWS (SECTIONS & TOOLS) */}
      {openWindows.map(win => (
        <Window
          key={`win-instance-${win.id}`}
          title={win.title}
          isMinimized={win.isMinimized}
          isMaximized={win.isMaximized}
          snapState={win.snapState}
          onSnapChange={(snap) => handleSnapWindow(win.id, snap)}
          zIndex={win.zIndex}
          onClose={() => handleCloseTool(win.id)}
          onMinimize={() => handleToggleMinimize(win.id)}
          onMaximize={() => handleMaximizeTool(win.id)}
          onFocus={() => handleFocusTool(win.id)}
        >
          {win.type === 'section' && (
            <div className="w-full h-full overflow-y-auto p-6 scrollbar-thin">
              {win.id === 'section-dashboard' && <Dashboard onSectionChange={handleOpenSection} openTool={handleOpenTool} />}
              {win.id === 'section-pacientes' && (
                <Patients 
                  onOpenProntuario={(patientId) => {
                    setSelectedPatientId(patientId);
                    handleOpenSection('prontuarios');
                  }} 
                />
              )}
              {win.id === 'section-agenda' && <Agenda openTool={handleOpenTool} />}
              {win.id === 'section-prontuarios' && (
                <Records 
                  preSelectedPatientId={selectedPatientId} 
                  onPatientSelected={setSelectedPatientId}
                  openTool={handleOpenTool}
                />
              )}
              {win.id === 'section-financeiro' && <Finance />}
              {win.id === 'section-relatorios' && <Reports />}
              {win.id === 'section-ferramentas' && (
                <ToolsLibrary 
                  onOpenTool={handleOpenTool} 
                  openWindows={openWindows.filter(w => w.type === 'tool').map(w => w.id)} 
                  pinnedTools={pinnedTools}
                  onTogglePin={handleTogglePin}
                />
              )}
              {win.id === 'section-settings' && <Settings onUpdateSettings={(newS) => setSettings({ ...settings, ...newS })} />}
            </div>
          )}

          {win.type === 'tool' && (
            <>
              {win.id === 'rid-inteligente' && (
                <RidInteligenteApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'ihs-digital' && (
                <IhsDigitalApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'ysq-smart-ai' && (
                <YsqSmartAiApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'registro-atendimento' && (
                <RegistroAtendimentoApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  openTool={handleOpenTool}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'plano-clinico-integrado' && (
                <PlanoClinicoIntegradoApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'ihp-pr-digital' && (
                <IhpPrDigitalApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'linha-vida' && (
                <LinhaVidaApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'psidiagnostic-pro' && (
                <PsidiagnosticProApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'dfc-assistido' && (
                <DfcAssistidoApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'thp-training' && (
                <ThpTrainingApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'biblioteca-avaliacao' && (
                <BibliotecaAvaliacaoApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  lockPatient={false} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
              {win.id === 'teleconsulta' && (
                <TeleconsultationApp 
                  activePatientId={win.patientId || selectedPatientId || undefined} 
                  userId={currentUser?.id}
                  onClose={() => handleCloseTool(win.id)}
                />
              )}
            </>
          )}
        </Window>
      ))}

      {/* WINDOWS BOTTOM TASKBAR */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-bg-sidebar/90 backdrop-blur-xl border-t border-border-subtle/80 flex items-center justify-between px-6 z-[9999] select-none no-print">
        <div className="flex items-center gap-3">
          {/* Logo brand / start button */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-mono font-black text-primary tracking-wider shadow-inner">
            <Brain size={14} className="animate-pulse" />
            CORTEX
          </div>
          
          <div className="w-px h-6 bg-border-subtle/50 mx-1 shrink-0" />
          
          {/* Pinned Tools (Quick Launch) */}
          {pinnedTools.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] p-1 rounded-2xl shrink-0">
              {pinnedTools.map(toolId => {
                const meta = toolMetadataMap[toolId];
                if (!meta) return null;
                const Icon = meta.icon;
                const isOpened = openWindows.some(w => w.id === toolId);
                const activeWin = openWindows.find(w => w.id === toolId);
                const isActive = activeWin && !activeWin.isMinimized && activeWin.zIndex === maxZIndex;

                return (
                  <button
                    key={`pinned-taskbar-${toolId}`}
                    onClick={() => {
                      if (isOpened) {
                        if (isActive) {
                          handleToggleMinimize(toolId);
                        } else {
                          handleFocusTool(toolId);
                          if (activeWin?.isMinimized) {
                            handleToggleMinimize(toolId);
                          }
                        }
                      } else {
                        handleOpenTool(toolId, selectedPatientId);
                      }
                    }}
                    className={cn(
                      "p-2 rounded-xl transition-all relative group cursor-pointer flex items-center justify-center shrink-0 w-9 h-9 border",
                      isActive 
                        ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(56,189,248,0.15)]' 
                        : isOpened 
                          ? 'bg-white/5 border-white/10 text-text-main hover:bg-white/10' 
                          : 'bg-transparent border-transparent text-text-dim hover:text-text-main hover:bg-white/5'
                    )}
                    title={`${meta.title}${isOpened ? ' (Ativo)' : ' (Acesso Rápido)'}`}
                  >
                    <Icon size={14} />
                    {isOpened && (
                      <span className={cn(
                        "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        activeWin?.isMinimized ? 'bg-text-dim/60' : 'bg-emerald-500 shadow-[0_0_4px_rgb(16,185,129)]'
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {pinnedTools.length > 0 && <div className="w-px h-6 bg-border-subtle/50 mx-1 shrink-0" />}
          
          {/* Taskbar items */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-[60vw] scrollbar-none">
            {openWindows.map(win => {
              const isActive = !win.isMinimized && win.zIndex === maxZIndex;
              return (
                <button
                  key={`taskbar-${win.id}`}
                  onClick={() => {
                    if (isActive) {
                      handleToggleMinimize(win.id);
                    } else {
                      handleFocusTool(win.id);
                      if (win.isMinimized) {
                        handleToggleMinimize(win.id);
                      }
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3.5 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer shrink-0",
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary/30 shadow-lg' 
                      : 'bg-bg-card/45 border-border-subtle/50 text-text-dim hover:text-text-main hover:bg-bg-card/85'
                  )}
                >
                  <Brain size={12} className={cn(isActive ? "text-primary animate-pulse" : "text-text-dim")} />
                  <span className="max-w-[120px] truncate">{win.title}</span>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full ml-1",
                    win.isMinimized ? 'bg-text-dim/40' : 'bg-emerald-500 animate-pulse'
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side: Clock, sync, status */}
        <div className="flex items-center gap-4 text-[10px] font-mono font-black text-text-dim/80">
          {isGoogleUser && syncState && (
            <div className={cn(
              "hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-[9px] uppercase tracking-wider font-mono",
              syncState.status === 'synced' ? "bg-green-500/5 border-green-500/20 text-green-500" :
              syncState.status === 'syncing' ? "bg-primary/5 border-primary/30 text-primary animate-pulse" :
              "bg-red-500/5 border-red-500/20 text-red-500"
            )}>
              <Cloud size={10} />
              <span>Nuvem</span>
            </div>
          )}

          <div className="bg-bg-card/60 border border-border-subtle/40 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
            <span>{currentTime.toLocaleDateString('pt-BR')}</span>
            <span className="text-text-main">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Alt+Tab Overlay */}
      {isAltTabOpen && openWindows.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center">
          <div className="bg-bg-sidebar/95 backdrop-blur-xl border border-border-subtle p-6 rounded-[2rem] shadow-2xl w-[550px] max-w-full">
            <div className="text-center mb-6">
              <h3 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center justify-center gap-2">
                <Brain size={14} className="text-primary animate-pulse" /> Alternar Janelas (Alt + \)
              </h3>
              <p className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest mt-1">Pressione \ para navegar e solte Alt para selecionar</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {openWindows.map((win, idx) => {
                const isSelected = idx === altTabSelectionIndex;
                return (
                  <div
                    key={`alt-tab-${win.id}`}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-3",
                      isSelected
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(56,189,248,0.25)] text-text-main scale-105"
                        : "bg-bg-card/40 border-border-subtle/50 text-text-dim opacity-70"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border",
                      isSelected ? "bg-primary/20 border-primary/45" : "bg-bg-sidebar border-border-subtle/60"
                    )}>
                      <Brain size={20} className={cn(isSelected ? "text-primary animate-pulse" : "text-text-dim")} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1 w-full">
                      {win.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ClinicalSuggestionsSidebar />

      {showLGPD && (
        <LGPDNotice 
          onAccept={() => {
            setShowLGPD(false);
            sessionStorage.setItem('psiLGPD_Accepted', 'true');
          }} 
        />
      )}
    </>
  );
}
