import React from 'react';
import { Settings, History, ClipboardPen, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  patients: any[];
  selectedPatientId: string;
  onPatientChange: (id: string) => void;
  lockPatient?: boolean;
}

export function Header({ 
  activeTab, 
  setActiveTab, 
  patients = [], 
  selectedPatientId, 
  onPatientChange,
  lockPatient = false
}: HeaderProps) {
  const tabs = [
    { id: 'new', label: 'Novo Registro', icon: ClipboardPen },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  return (
    <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50 select-none">
      <div className="flex items-center gap-3">
        <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black transition-transform hover:scale-105">R</div>
        <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
          RID 
          <span className="text-primary font-black">Inteligente</span> 
        </h1>
      </div>
      
      {/* PATIENT SELECTOR DROPDOWN */}
      <div className="flex items-center gap-2">
        <Users size={14} className="text-text-dim" />
        <select
          value={selectedPatientId}
          onChange={(e) => onPatientChange(e.target.value)}
          disabled={lockPatient}
          className={cn(
            "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-primary transition-all max-w-[200px] truncate",
            lockPatient && "opacity-75 cursor-not-allowed border-transparent"
          )}
        >
          <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
          {(patients || []).map(p => (
            <option key={`rid-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {/* SUB-TABS */}
      <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer",
              activeTab === tab.id 
                ? "bg-bg-card text-primary border border-border-subtle shadow-sm" 
                : "text-text-dim hover:text-text-main"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
