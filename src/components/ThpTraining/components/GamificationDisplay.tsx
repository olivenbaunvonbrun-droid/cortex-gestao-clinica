/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Patient } from "../types";
import { Award, Flame, Star, Sparkles, Trophy, Zap } from "lucide-react";

interface GamificationDisplayProps {
  patient: Patient;
}

export default function GamificationDisplay({ patient }: GamificationDisplayProps) {
  // Badge database for reference
  const predefinedBadges = [
    { id: "b1", title: "Cientista de Si", description: "Primeiro registro RID concluído com sucesso.", icon: Trophy, color: "text-amber-500 bg-amber-50" },
    { id: "b2", title: "Postura Pronta", description: "Alcançou nota superior a 50 no treinamento não-verbal.", icon: Award, color: "text-primary bg-primary/10" },
    { id: "b3", title: "Inabalável", description: "Completou a Fase 3 (PDP) de Mentalidade Saudável.", icon: Star, color: "text-primary bg-primary/10" },
    { id: "b4", title: "Mestre Clínico", description: "Concluiu a exposição real de nível 2 com nota máxima.", icon: Zap, color: "text-purple-500 bg-purple-50" },
  ];

  return (
    <div className="bg-bg-sidebar rounded-xl border border-border-subtle shadow-sm p-6 space-y-6 font-sans">
      
      {/* Top Banner with Level Up stats */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-5 border border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-bg-deep font-bold border-4 border-indigo-400 flex items-center justify-center text-white font-black text-xl font-mono shadow-md">
            {patient.level}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-main">{patient.name}</span>
              <span className="text-[10px] bg-primary text-bg-deep font-bold text-white font-bold px-1.5 py-0.5 rounded-full font-mono uppercase">Paciente Nível {patient.level}</span>
            </div>
            <p className="text-xs text-text-dim font-mono">XP de Neuroplasticidade: {patient.xp} pts</p>
          </div>
        </div>

        {/* Streak details */}
        <div className="flex items-center gap-4 bg-bg-deep/40 p-3 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-1 text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500/10" />
            <span className="text-xl font-black font-mono tracking-tight">{patient.streakDays}d</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-[10px] text-text-dim font-mono leading-snug">
            Sessões Consecutivas<br/>
            de Foco Comportamental
          </div>
        </div>
      </div>

      {/* Badges and milestones achieved */}
      <div className="space-y-4">
        <h4 className="font-bold text-text-main text-sm flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          Conquistas Técnicas Desbloqueadas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {predefinedBadges.map((badgeDef) => {
            const isUnlocked = patient.unlockedBadges.some(b => b.id === badgeDef.id);
            const BadgeIcon = badgeDef.icon;

            return (
              <div 
                key={badgeDef.id}
                className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked 
                    ? "bg-bg-sidebar border-border-subtle shadow-sm" 
                    : "opacity-45 bg-bg-card border-border-subtle"
                }`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${badgeDef.color}`}>
                    <BadgeIcon className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-text-main text-xs tracking-tight">{badgeDef.title}</h5>
                  <p className="text-[10px] text-text-dim leading-snug mt-1">{badgeDef.description}</p>
                </div>

                <div className="mt-4 border-t border-border-subtle pt-2 flex items-center justify-between text-[9px] font-mono">
                  <span className={isUnlocked ? "text-primary font-bold" : "text-text-dim"}>
                    {isUnlocked ? "CONQUISTADO" : "PENDENTE"}
                  </span>
                  {isUnlocked && (
                    <span className="text-text-dim">
                      {patient.unlockedBadges.find(b => b.id === badgeDef.id)?.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification scientific background */}
      <div className="p-4 bg-amber-500/5 text-text-dim border border-amber-500/10 rounded-xl text-xs flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 animate-pulse" />
        <p className="leading-snug">
          <span className="font-bold text-text-main">Por que a gamificação funciona na TCC-4?</span> A ativação do sistema dopaminérgico mesolímbico, mediada por feedback visual imediato e conquistas ( badges, XP ), age como um potente motor motivacional. Ele reduz barreiras e resistências iniciais do paciente, inibindo gatilhos de procrastinação ou estresse somático de eixos traumáticos históricos.
        </p>
      </div>

    </div>
  );
}
