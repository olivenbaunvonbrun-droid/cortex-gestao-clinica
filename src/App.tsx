/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import ToolsLibrary from './components/ToolsLibrary/ToolsLibrary';
import { Window } from './components/ui/Window';
import { Brain } from 'lucide-react';
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

  // === WINDOW MANAGER FOR TOOLS ===
  interface ToolWindow {
    id: string;
    title: string;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    patientId?: string | null;
  }

  const [openWindows, setOpenWindows] = useState<ToolWindow[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(60);

  const handleOpenTool = (toolId: string, patientId?: string | null) => {
    const titleMap: Record<string, string> = {
      'rid-inteligente': 'RID Inteligente',
      'ihs-digital': 'IHS Digital',
      'ysq-smart-ai': 'YSQ-Smart AI',
      'neurolitera': 'NeuroLitera',
      'registro-atendimento': 'Registro de Atendimento',
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
        title: titleMap[toolId] || 'Ferramenta',
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZ,
        patientId: patientId
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

  const handleMinimizeTool = (toolId: string) => {
    setOpenWindows(prev => prev.map(w => 
      w.id === toolId ? { ...w, isMinimized: true } : w
    ));
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
  };

  useEffect(() => {
    const init = async () => {
      // Check for saved session if no firebase user
      if (!firebaseUser) {
        const lastUser = localStorage.getItem('psiCurrentUsername_v9');
        if (lastUser) {
          const user = await db.users.where('username').equals(lastUser).first();
          if (user) {
            setCurrentUser(user);
          }
        }
      } else {
        // Map Firebase user to app user
        setCurrentUser({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Profissional',
          email: firebaseUser.email
        });
      }

      // Load settings
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

  useEffect(() => {
    const scale = settings.layoutScale || 'large';
    document.documentElement.classList.remove('layout-scale-small', 'layout-scale-medium', 'layout-scale-large');
    document.documentElement.classList.add(`layout-scale-${scale}`);
  }, [settings.layoutScale]);

  useEffect(() => {
    if (firebaseUser) {
      // Immediate sync
      syncService.syncAll(firebaseUser.uid);

      // Recursive background sync every 30 seconds
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
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        appTitle={settings.appTitle}
        appLogo={settings.appLogo}
      >
        {activeSection === 'dashboard' && <Dashboard onSectionChange={setActiveSection} />}
        {activeSection === 'pacientes' && (
          <Patients 
            onOpenProntuario={(patientId) => {
              setSelectedPatientId(patientId);
              setActiveSection('prontuarios');
            }} 
          />
        )}
        {activeSection === 'agenda' && <Agenda />}
        {activeSection === 'prontuarios' && (
          <Records 
            preSelectedPatientId={selectedPatientId} 
            onPatientSelected={setSelectedPatientId}
            openTool={handleOpenTool}
          />
        )}
        {activeSection === 'financeiro' && <Finance />}
        {activeSection === 'relatorios' && <Reports />}
        {activeSection === 'ferramentas' && <ToolsLibrary onOpenTool={handleOpenTool} openWindows={openWindows.map(w => w.id)} />}
        {activeSection === 'settings' && <Settings onUpdateSettings={(newS) => setSettings({ ...settings, ...newS })} />}
      </Layout>
 
      {/* FLOATING TOOL WINDOWS */}
      {openWindows.map(win => (
        <Window
          key={`win-instance-${win.id}`}
          title={win.title}
          isMinimized={win.isMinimized}
          isMaximized={win.isMaximized}
          zIndex={win.zIndex}
          onClose={() => handleCloseTool(win.id)}
          onMinimize={() => handleToggleMinimize(win.id)}
          onMaximize={() => handleMaximizeTool(win.id)}
          onFocus={() => handleFocusTool(win.id)}
        >
          {win.id === 'rid-inteligente' && (
            <RidInteligenteApp 
              activePatientId={win.patientId || selectedPatientId || undefined} 
              lockPatient={false} 
              userId={currentUser?.id}
            />
          )}
          {win.id === 'ihs-digital' && (
            <IhsDigitalApp 
              activePatientId={win.patientId || selectedPatientId || undefined} 
              lockPatient={false} 
              userId={currentUser?.id}
            />
          )}
        </Window>
      ))}

      {/* FLOATING WINDOWS DOCK */}
      {openWindows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-bg-sidebar/85 backdrop-blur-xl border border-border-subtle/60 px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-widest border-r border-border-subtle/50 pr-4">Ferramentas Ativas</span>
          <div className="flex items-center gap-2">
            {openWindows.map(win => (
              <button
                key={`dock-win-${win.id}`}
                onClick={() => handleToggleMinimize(win.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 cursor-pointer",
                  win.isMinimized
                    ? "bg-bg-card border-border-subtle text-text-dim hover:text-text-main"
                    : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                )}
              >
                <Brain size={12} className={cn(!win.isMinimized && "text-primary")} />
                {win.title}
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  win.isMinimized ? "bg-text-dim/40" : "bg-emerald-500 animate-pulse"
                )} />
              </button>
            ))}
          </div>
        </div>
      )}

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
