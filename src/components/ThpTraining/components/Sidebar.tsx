/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Users, 
  Map, 
  Calendar, 
  Flame, 
  Brain, 
  LineChart, 
  Award,
  Crown,
  ClipboardList,
  Dna
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  patientName: string;
  patientLevel: number;
  patientXp: number;
  streakDays: number;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  patientName,
  patientLevel,
  patientXp,
  streakDays
}: SidebarProps) {
  const tabs = [
    { id: "profiler", name: "Prontuário Clínico", icon: Users },
    { id: "scales", name: "Escalas & Evidências", icon: ClipboardList },
    { id: "clinical-map", name: "Mapeamento Clínico TCC-4", icon: Map },
    { id: "pharmacology", name: "Psicofarmacologia", icon: Dna },
    { id: "periodization", name: "Periodização de Treino", icon: Calendar },
    { id: "training", name: "Laboratório de Treino (HP)", icon: Brain },
    { id: "report", name: "Relatório de Evolução", icon: LineChart },
  ];

  return (
    <aside className="w-80 bg-bg-sidebar border-r border-border-subtle text-text-main flex flex-col justify-between h-screen sticky top-0 font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-4 h-4 bg-primary rounded-sm flex-shrink-0"></div>
          <h1 className="font-bold text-lg tracking-tight text-text-main leading-none">
            THP-<span className="text-primary">Neocortex</span>
          </h1>
        </div>
        <p className="text-[10px] text-text-dim font-mono uppercase tracking-wider">
          SISTEMA CLÍNICO DE 4ª GERAÇÃO
        </p>
      </div>

      {/* Navigation tabs */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-text-dim font-bold px-3 mb-2 font-mono">
          Navegação Clínica
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm transition-all duration-200 outline-none text-left ${
                isActive
                  ? "bg-bg-card text-text-main font-medium border-r-4 border-primary shadow-sm"
                  : "text-text-dim hover:text-text-main hover:bg-bg-card/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-text-dim group-hover:text-text-main"}`} />
                <span>{tab.name}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Patient Mini-Card & Gamification */}
      <div className="p-4 border-t border-border-subtle bg-bg-deep/60 m-4 rounded-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-bg-card border-2 border-primary flex items-center justify-center text-primary font-semibold font-mono text-sm shadow-sm">
                {patientName ? patientName.split(" ").map(n => n[0]).join("") : "PT"}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-[9px] font-bold text-bg-deep px-1.5 py-0.5 rounded-full border border-bg-deep flex items-center justify-center shadow">
                Lvl {patientLevel}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-text-main truncate max-w-[120px]">
                {patientName || "Sem Paciente"}
              </div>
              <div className="text-[10px] text-text-dim font-mono">
                Paciente Ativo
              </div>
            </div>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-xs font-mono font-bold px-2 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
            <span>{streakDays}d</span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-text-dim font-mono">
            <span>Progresso HP</span>
            <span>{patientXp} / {patientLevel * 500} XP</span>
          </div>
          <div className="w-full h-1.5 bg-bg-sidebar rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(77,171,247,0.5)]"
              style={{ width: `${Math.min(100, (patientXp / (patientLevel * 500)) * 100)}%` }}
            />
          </div>
        </div>

        {/* App Meta */}
        <div className="mt-3 flex items-center gap-1.5 justify-center text-[9px] text-text-dim/60 font-mono">
          <Crown className="w-3 h-3 text-amber-500/60" />
          <span>Foco baseado em Evidência</span>
        </div>
      </div>
    </aside>
  );
}
