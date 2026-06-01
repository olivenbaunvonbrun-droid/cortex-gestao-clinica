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
            onClearPreSelection={() => setSelectedPatientId(null)} 
          />
        )}
        {activeSection === 'financeiro' && <Finance />}
        {activeSection === 'relatorios' && <Reports />}
        {activeSection === 'settings' && <Settings onUpdateSettings={(newS) => setSettings({ ...settings, ...newS })} />}
      </Layout>

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
