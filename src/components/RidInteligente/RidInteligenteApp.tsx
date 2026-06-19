import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RidForm } from './components/RidForm';
import { HistoryList } from './components/HistoryList';
import { ComparisonView } from './components/ComparisonView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { RidEntry, AppSettings } from './types';
import { storage } from './lib/storage';
import { db } from '../../lib/db';
import { Toaster, toast } from 'react-hot-toast';
import { Brain, Sparkles } from 'lucide-react';

import { cn } from '../../lib/utils';

interface RidInteligenteAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
  onClose?: () => void;
}

export default function RidInteligenteApp({ activePatientId, lockPatient = false, userId, onClose }: RidInteligenteAppProps) {
  const [activeTab, setActiveTab] = useState('new');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [history, setHistory] = useState<RidEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<RidEntry | undefined>(undefined);
  const [comparisonEntries, setComparisonEntries] = useState<[RidEntry, RidEntry] | null>(null);
  const [comparisonMinimized, setComparisonMinimized] = useState(false);
  const [comparisonMaximized, setComparisonMaximized] = useState(false);
  const [comparisonSnapState, setComparisonSnapState] = useState<any>(null);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    fontSize: '14px',
    lgpdAccepted: true,
    professionalName: 'Psicólogo(a)',
    professionalCRP: '',
    professionalLogo: '',
    professionalSignature: ''
  });

  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const items = await db.settings.toArray();
        const s: any = {};
        items.forEach(item => {
          s[item.key] = item.value;
        });
        setSettings(prev => ({
          ...prev,
          professionalName: (!s.appTitle || s.appTitle === 'Sistema de Gestão para Psicólogos') ? 'Psicólogo(a)' : s.appTitle,
          professionalCRP: s.psychCrp || '',
          professionalLogo: s.appLogo || '',
          professionalSignature: s.psychSignature || ''
        }));
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSystemSettings();
  }, []);
  
  // Confirmation Modal States
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Load patients and pre-select
  useEffect(() => {
    const loadPatients = async () => {
      const all = await db.pacientes.toArray();
      setPatients(all);
      if (activePatientId) {
        setSelectedPatientId(String(activePatientId));
      }
    };
    loadPatients();
  }, [activePatientId]);

  // Load history when selectedPatientId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (selectedPatientId) {
        const loadedHistory = await storage.getHistory(selectedPatientId);
        setHistory(loadedHistory);
      } else {
        setHistory([]);
      }
    };
    loadHistory();
  }, [selectedPatientId]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEntry = async (entry: RidEntry) => {
    if (isSaving) return;
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de salvar!');
      return;
    }
    setIsSaving(true);
    try {
      const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
      const enrichedEntry = {
        ...entry,
        patientName: patientObj?.nome || '',
        patientAge: patientObj?.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : ''
      };
      const updated = await storage.saveEntry(enrichedEntry, selectedPatientId, userId);
      setHistory(updated);
      setActiveTab('history');
      setEditingEntry(undefined);
      toast.success('Registro salvo no prontuário do paciente!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar o registro no prontuário.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!selectedPatientId) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Registro',
      message: 'Tem certeza que deseja apagar este registro permanentemente do prontuário? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const updated = await storage.deleteEntry(id, selectedPatientId, userId);
          setHistory(updated);
          toast.success('Registro apagado.');
        } catch (err) {
          console.error('Failed to delete entry:', err);
          toast.error('Erro ao apagar registro no banco de dados.');
        }
      }
    });
  };

  const handleViewEntry = (entry: RidEntry) => {
    setEditingEntry(entry);
    setActiveTab('new');
  };

  const handleCompare = (selected: RidEntry[]) => {
    if (selected.length === 2) {
      setComparisonEntries([selected[0], selected[1]]);
    }
  };

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none">
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'new') setEditingEntry(undefined);
          setActiveTab(tab);
        }} 
        patients={patients}
        selectedPatientId={selectedPatientId}
        onPatientChange={setSelectedPatientId}
        lockPatient={!!activePatientId}
      />
      
      <main className="flex-1 flex overflow-auto relative">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
            <Brain size={48} className="text-primary mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no topo da janela para começar a preencher ou visualizar o histórico de RIDs.
            </p>
          </div>
        ) : (
          <div className="w-full flex">
            {/* Draft Form Container */}
            <div className={cn("w-full flex-grow flex", (activeTab === 'new' && !editingEntry) ? 'block' : 'hidden')}>
              {(() => {
                const selectedPatient = patients.find(p => String(p.id) === String(selectedPatientId));
                const pName = selectedPatient?.nome || '';
                const pAge = selectedPatient?.nascimento 
                  ? String(new Date().getFullYear() - new Date(selectedPatient.nascimento).getFullYear()) 
                  : '';
                return (
                  <RidForm 
                    key="draft"
                    onSave={handleSaveEntry} 
                    settings={settings}
                    patientName={pName}
                    patientAge={pAge}
                    isSaving={isSaving}
                  />
                );
              })()}
            </div>

            {/* Edit/View Form Container */}
            {editingEntry && (
              <div className="w-full flex-grow flex">
                {(() => {
                  const selectedPatient = patients.find(p => String(p.id) === String(selectedPatientId));
                  const pName = selectedPatient?.nome || '';
                  const pAge = selectedPatient?.nascimento 
                    ? String(new Date().getFullYear() - new Date(selectedPatient.nascimento).getFullYear()) 
                    : '';
                  return (
                    <RidForm 
                      key={editingEntry.id}
                      onSave={handleSaveEntry} 
                      onCancel={() => setEditingEntry(undefined)}
                      initialData={editingEntry} 
                      settings={settings}
                      patientName={pName}
                      patientAge={pAge}
                      isSaving={isSaving}
                    />
                  );
                })()}
              </div>
            )}
            
            {/* History List Container */}
            <div className={cn("flex-1 overflow-y-auto p-6 bg-bg-deep", (activeTab === 'history' && !editingEntry) ? 'block' : 'hidden')}>
              <div className="max-w-4xl mx-auto">
                <HistoryList 
                  entries={history}
                  onDelete={handleDeleteEntry}
                  onView={handleViewEntry}
                  onCompare={handleCompare}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        variant={confirmConfig.variant}
      />

      {comparisonEntries && (
        <ComparisonView 
          entries={comparisonEntries} 
          isMinimized={comparisonMinimized}
          isMaximized={comparisonMaximized}
          snapState={comparisonSnapState}
          onSnapChange={setComparisonSnapState}
          onClose={() => {
            setComparisonEntries(null);
            setComparisonMinimized(false);
            setComparisonMaximized(false);
            setComparisonSnapState(null);
          }}
          onMinimize={() => setComparisonMinimized(true)}
          onMaximize={() => setComparisonMaximized(!comparisonMaximized)}
          settings={settings}
        />
      )}

      {comparisonEntries && comparisonMinimized && (
        <div className="fixed bottom-20 right-6 z-[120] bg-bg-card border border-border-subtle shadow-2xl rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-main">Comparação RID (Minimizada)</span>
          </div>
          <button 
            onClick={() => setComparisonMinimized(false)}
            className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg transition-all"
          >
            Restaurar
          </button>
        </div>
      )}

      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-border-subtle bg-bg-card text-text-main',
        }}
      />
    </div>
  );
}
