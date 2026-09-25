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
import Settings from './components/Settings/Settings';
import Dashboard from './components/Dashboard/Dashboard';
import PatientSelfRegistration from './components/Patients/PatientSelfRegistration';

// Lazy loaded heavy tools and secondary sections (Code-Splitting)
const Reports = React.lazy(() => import('./components/Reports/Reports'));
const ToolsLibrary = React.lazy(() => import('./components/ToolsLibrary/ToolsLibrary'));
const RidInteligenteApp = React.lazy(() => import('./components/RidInteligente/RidInteligenteApp'));
const IhsDigitalApp = React.lazy(() => import('./components/IhsDigital/IhsDigitalApp'));
const YsqSmartAiApp = React.lazy(() => import('./components/YsqSmartAi/YsqSmartAiApp'));
const RegistroAtendimentoApp = React.lazy(() => import('./components/RegistroAtendimento/RegistroAtendimentoApp'));
const PlanoClinicoIntegradoApp = React.lazy(() => import('./components/PlanoClinicoIntegrado/PlanoClinicoIntegradoApp'));
const IhpPrDigitalApp = React.lazy(() => import('./components/IhpPrDigital/IhpPrDigitalApp'));
const LinhaVidaApp = React.lazy(() => import('./components/LinhaVida/LinhaVidaApp'));
const PsidiagnosticProApp = React.lazy(() => import('./components/PsidiagnosticPro/PsidiagnosticProApp'));
const DfcAssistidoApp = React.lazy(() => import('./components/DfcAssistido/DfcAssistidoApp'));
const ThpTrainingApp = React.lazy(() => import('./components/ThpTraining/ThpTrainingApp'));
const TdahAsrs18App = React.lazy(() => import('./components/TdahAsrs18/TdahAsrs18App'));
const BibliotecaAvaliacaoApp = React.lazy(() => import('./components/BibliotecaAvaliacao/BibliotecaAvaliacaoApp'));
const ClinicalSuggestionsApp = React.lazy(() => import('./components/BibliotecaAvaliacao/components/ClinicalSuggestionsHelper').then(m => ({ default: m.ClinicalSuggestionsApp })));
const TeleconsultationApp = React.lazy(() => import('./components/Teleconsultation/TeleconsultationApp'));
const HpIndividualTool = React.lazy(() => import('./components/HpTrainingTools/HpIndividualTool'));
const TdahEcosystemApp = React.lazy(() => import('./components/TdahEcosystem/TdahEcosystemApp'));

function WindowLoadingFallback() {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-bg-deep/50 text-text-dim gap-3 p-8">
      <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Carregando ferramenta...</span>
    </div>
  );
}

import { Window } from './components/ui/Window';
import { 
  Brain, 
  Cloud, 
  Users, 
  Sparkles, 
  ClipboardList, 
  Layers, 
  TrendingUp, 
  FileSpreadsheet, 
  Activity, 
  BookOpen, 
  Video, 
  Pin, 
  Zap, 
  X,
  Heart,
  Award,
  Compass,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Smile
} from 'lucide-react';
import { cn } from './lib/utils';
import LGPDNotice from './components/LGPDNotice';
import { useFirebase } from './hooks/useFirebase';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { syncService } from './lib/syncService';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

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

  // Check for patient self-registration link in URL (?c=... ou ?cad=... ou legado ?cadastro_paciente=...)
  const [selfRegistrationToken] = useState<string | null>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('c') || searchParams.get('cad') || searchParams.get('cadastro_paciente') || searchParams.get('cadastro');
      if (token) return token;

      if (window.location.hash.includes('c=') || window.location.hash.includes('cad=') || window.location.hash.includes('cadastro_paciente=') || window.location.hash.includes('cadastro=')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.hash.replace('#', ''));
        return hashParams.get('c') || hashParams.get('cad') || hashParams.get('cadastro_paciente') || hashParams.get('cadastro');
      }
    } catch {
      return null;
    }
    return null;
  });

  // Redirecionamento instantâneo para teleatendimento com link curto (?v=... ou ?tele=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const teleRoom = searchParams.get('v') || searchParams.get('tele') || searchParams.get('sala');
      if (teleRoom) {
        const domain = searchParams.get('srv') || localStorage.getItem('cortex_teleconsulta_server') || 'jitsi.riot.im';
        const quality = searchParams.get('q') || localStorage.getItem('cortex_teleconsulta_quality') || '480';
        const resNumber = quality === '720p' || quality === '720' ? 720 : quality === '360p' || quality === '360' ? 360 : 480;
        const redirectUrl = `https://${domain}/${teleRoom}#config.p2p.enabled=true&config.resolution=${resNumber}&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.disableDeepLinking=true`;
        window.location.replace(redirectUrl);
      }
    } catch (e) {
      console.warn("Teleconsultation short-link redirect error:", e);
    }
  }, []);

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
    'tdah-asrs18': { title: 'TDAH ASRS-18', shortTitle: 'TDAH', icon: Zap },
    'biblioteca-avaliacao': { title: 'Biblioteca de Avaliação', shortTitle: 'Testes', icon: BookOpen },
    'teleconsulta': { title: 'Teleconsulta Virtual', shortTitle: 'Vídeo', icon: Video },
    'parametros-clinicos': { title: 'Parâmetros Clínicos', shortTitle: 'Parâmetros', icon: Sparkles },
    'hp-autoconhecimento': { title: 'HP 1: Autoconhecimento', shortTitle: 'HP 1', icon: Brain },
    'hp-autorregulacao': { title: 'HP 2: Autorregulação', shortTitle: 'HP 2', icon: Heart },
    'hp-raciocinio-otimista': { title: 'HP 3: Raciocínio Otimista', shortTitle: 'HP 3', icon: TrendingUp },
    'hp-autoestima': { title: 'HP 4: Autoestima', shortTitle: 'HP 4', icon: Award },
    'hp-resolutividade': { title: 'HP 5: Resolutividade', shortTitle: 'HP 5', icon: Compass },
    'hp-autocontrole': { title: 'HP 6: Autocontrole', shortTitle: 'HP 6', icon: ShieldAlert },
    'hp-sociabilidade': { title: 'HP 7: Sociabilidade', shortTitle: 'HP 7', icon: Users },
    'hp-imunidade-social': { title: 'HP 8: Imunidade Social', shortTitle: 'HP 8', icon: ShieldCheck },
    'hp-sensibilidade-social': { title: 'HP 9: Sensibilidade Social', shortTitle: 'HP 9', icon: Eye },
    'hp-hedonismo': { title: 'HP 10: Hedonismo', shortTitle: 'HP 10', icon: Smile },
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
      'tdah-asrs18': 'TDAH ASRS-18',
      'tdah-ecosystem': 'Ecossistema TDAH Adulto',
      'etdah-ad': 'ETDAH-AD (Benczik)',
      'epf-tdah': 'EPF-TDAH (Prejuízos)',
      'bdefs-barkley': 'BDEFS (Barkley)',
      'biblioteca-avaliacao': 'Biblioteca de Avaliação',
      'teleconsulta': 'Teleconsulta Virtual',
      'parametros-clinicos': 'Parâmetros Clínicos',
      'hp-autoconhecimento': 'HP 1: Autoconhecimento',
      'hp-autorregulacao': 'HP 2: Autorregulação Emocional',
      'hp-raciocinio-otimista': 'HP 3: Raciocínio Realisticamente Otimista',
      'hp-autoestima': 'HP 4: Autoestima',
      'hp-resolutividade': 'HP 5: Resolutividade e Enfrentamento',
      'hp-autocontrole': 'HP 6: Autocontrole',
      'hp-sociabilidade': 'HP 7: Sociabilidade',
      'hp-imunidade-social': 'HP 8: Imunidade Social',
      'hp-sensibilidade-social': 'HP 9: Sensibilidade Social',
      'hp-hedonismo': 'HP 10: Hedonismo Responsável',
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
        width: toolId === 'parametros-clinicos' ? 520 : (toolId === 'teleconsulta' ? 1100 : 850),
        height: toolId === 'parametros-clinicos' ? 620 : 650,
        x: 150 + (prev.length * 30) % 200,
        y: 120 + (prev.length * 30) % 200
      }];
    });
  };

  const handleOpenSection = (sectionId: string) => {
    if (sectionId === 'tdah-ecosystem') {
      handleOpenTool('tdah-ecosystem');
      return;
    }
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

  const handleSnapWindow = (toolId: string, snap: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'pip' | null) => {
    const nextZ = maxZIndex + 10;
    setMaxZIndex(nextZ);
    setOpenWindows(prev => prev.map(w => 
      w.id === toolId 
        ? { 
            ...w, 
            snapState: snap, 
            isMaximized: snap === null ? w.isMaximized : false,
            isMinimized: false,
            zIndex: snap === 'pip' ? 99999 : nextZ
          } 
        : w
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

  if (selfRegistrationToken) {
    return <PatientSelfRegistration token={selfRegistrationToken} />;
  }

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
        <ErrorBoundary
          key={`eb-${win.id}`}
          toolTitle={win.title}
          onClose={() => handleCloseTool(win.id)}
        >
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
            <React.Suspense fallback={<WindowLoadingFallback />}>
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
                  {win.id === 'tdah-asrs18' && (
                    <TdahAsrs18App 
                      activePatientId={win.patientId || selectedPatientId || undefined} 
                      lockPatient={false} 
                      userId={currentUser?.id}
                      onClose={() => handleCloseTool(win.id)}
                    />
                  )}
                  {win.id === 'tdah-ecosystem' && (
                    <TdahEcosystemApp 
                      activePatientId={win.patientId || selectedPatientId || undefined} 
                      lockPatient={false} 
                      userId={currentUser?.id}
                      initialStage="overview"
                      openTool={handleOpenTool}
                      onClose={() => handleCloseTool(win.id)}
                    />
                  )}
                  {win.id === 'etdah-ad' && (
                    <TdahEcosystemApp 
                      activePatientId={win.patientId || selectedPatientId || undefined} 
                      lockPatient={false} 
                      userId={currentUser?.id}
                      initialStage="etdah"
                      openTool={handleOpenTool}
                      onClose={() => handleCloseTool(win.id)}
                    />
                  )}
                  {win.id === 'epf-tdah' && (
                    <TdahEcosystemApp 
                      activePatientId={win.patientId || selectedPatientId || undefined} 
                      lockPatient={false} 
                      userId={currentUser?.id}
                      initialStage="epf"
                      openTool={handleOpenTool}
                      onClose={() => handleCloseTool(win.id)}
                    />
                  )}
                  {win.id === 'bdefs-barkley' && (
                    <TdahEcosystemApp 
                      activePatientId={win.patientId || selectedPatientId || undefined} 
                      lockPatient={false} 
                      userId={currentUser?.id}
                      initialStage="bdefs"
                      openTool={handleOpenTool}
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
                      isPip={win.snapState === 'pip'}
                      onTogglePip={(enable) => handleSnapWindow(win.id, enable ? 'pip' : null)}
                    />
                  )}
                  {win.id === 'parametros-clinicos' && (
                    <ClinicalSuggestionsApp 
                      onClose={() => handleCloseTool(win.id)}
                    />
                  )}
                  {win.id.startsWith('hp-') && (
                    <HpIndividualTool 
                      hpId={win.id}
                      activePatientId={win.patientId || selectedPatientId || undefined} 
                      userId={currentUser?.id}
                      onClose={() => handleCloseTool(win.id)}
                    />
                  )}
                </>
              )}
            </React.Suspense>
          </Window>
        </ErrorBoundary>
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
                    onContextMenu={(e) => {
                      if (isOpened) {
                        e.preventDefault();
                        handleCloseTool(toolId);
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
                    title={`${meta.title}${isOpened ? ' (Ativo - Clique com botão direito para fechar)' : ' (Acesso Rápido)'}`}
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
                <div
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
                    "group/item flex items-center gap-2 pl-3.5 pr-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer shrink-0 select-none",
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary/30 shadow-lg' 
                      : 'bg-bg-card/45 border-border-subtle/50 text-text-dim hover:text-text-main hover:bg-bg-card/85'
                  )}
                >
                  <Brain size={12} className={cn(isActive ? "text-primary animate-pulse" : "text-text-dim")} />
                  <span className="max-w-[120px] truncate">{win.title}</span>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full ml-0.5",
                    win.isMinimized ? 'bg-text-dim/40' : 'bg-emerald-500 animate-pulse'
                  )} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTool(win.id);
                    }}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-text-dim/70 hover:text-red-400 transition-colors ml-1 cursor-pointer flex items-center justify-center"
                    title={`Fechar ${win.title}`}
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </div>
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

      {/* Floating Button for Clinical Parameters */}
      <button
        onClick={() => handleOpenTool('parametros-clinicos')}
        className="fixed bottom-[80px] right-6 z-[9999] flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-gray-950 font-sans text-xs font-black shadow-2xl p-3 px-4 rounded-full transition-transform hover:scale-105 active:scale-95 border-0 cursor-pointer uppercase tracking-wider no-print"
        title="Dicionário e Parâmetros Clínicos de Preenchimento"
        id="clinical-floating-trigger-btn"
      >
        <Sparkles size={14} className="animate-spin text-gray-950" style={{ animationDuration: "10s" }} />
        <span>Parâmetros Clínicos</span>
      </button>

      {showLGPD && (
        <LGPDNotice 
          onAccept={() => {
            setShowLGPD(false);
            sessionStorage.setItem('psiLGPD_Accepted', 'true');
          }} 
        />
      )}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-bg-sidebar border border-border-subtle text-text-main font-sans text-xs',
          duration: 4000,
        }}
      />
    </>
  );
}
