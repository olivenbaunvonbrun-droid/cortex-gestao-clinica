import React, { useState } from "react";
import { Patient } from "../types";
import { Sliders, Check, RefreshCw } from "lucide-react";

interface ExerciseProps {
  onAwardXp: (xp: number) => void;
}

export default function AutocontroleExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void }) {
  const [step, setStep] = useState<"intro" | "configure" | "success">("intro");
  const [switches, setSwitches] = useState({
    notifications: true,
    scheduledBreaks: false,
    cleanDesk: false,
    backgroundNoise: true,
    timeblocking: false
  });

  const getMetrics = () => {
    let focus = 30;
    let overload = 70;

    if (!switches.notifications) {
      focus += 25;
      overload -= 20;
    }
    if (switches.scheduledBreaks) {
      focus += 15;
      overload -= 15;
    }
    if (switches.cleanDesk) {
      focus += 15;
      overload -= 10;
    }
    if (!switches.backgroundNoise) {
      focus += 15;
      overload -= 15;
    }
    if (switches.timeblocking) {
      focus += 20;
      overload -= 20;
    }

    return {
      focus: Math.min(100, Math.max(0, focus)),
      overload: Math.min(100, Math.max(0, overload))
    };
  };

  const { focus, overload } = getMetrics();

  const handleToggle = (field: keyof typeof switches) => {
    setSwitches(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = () => {
    if (focus >= 75 && overload <= 35) {
      onAwardXp(120);
      setStep("success");
    }
  };

  const canSubmit = focus >= 75 && overload <= 35;

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-xl mx-auto space-y-4 shadow-sm" id="autocontrole-exercise">
      {step === "intro" && (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Exercício Clínico: Painel de Controle de Estímulos</h4>
            <p className="text-xs text-text-dim mt-1 leading-relaxed">
              O Autocontrole não decorre de força de vontade voluntarista crônica, mas sim do arranjo empírico do seu espaço de trabalho. Gerencie seus estímulos externos para maximizar o foco e proteger sua amígdala.
            </p>
          </div>
          <button
            onClick={() => setStep("configure")}
            className="px-5 py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition"
          >
            Configurar Estímulos (+120 XP)
          </button>
        </div>
      )}

      {step === "configure" && (
        <div className="space-y-4 text-left">
          <span className="px-2 py-0.5 bg-indigo-100 text-primary text-[10px] font-bold font-mono rounded uppercase">Simulador de Contexto</span>
          <h4 className="text-xs font-bold text-text-main">Desenhe os Ativadores do Ambiente de {patient?.name || "Paciente"}:</h4>

          <div className="space-y-3 bg-bg-sidebar p-4 rounded-xl border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Notificações Síncronas (Slack/Teams)</span>
                <p className="text-[10px] text-text-dim">Ativas causam perturbações na atenção dividida constantemente.</p>
              </div>
              <button
                onClick={() => handleToggle("notifications")}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  switches.notifications ? "bg-rose-500/50" : "bg-bg-deep"
                }`}
              >
                <div className={`bg-bg-sidebar w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  switches.notifications ? "translate-x-6" : ""
                }`} />
              </button>
            </div>

            <hr className="border-border-subtle" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Intervalos de Descanso Programados (Pomodoro)</span>
                <p className="text-[10px] text-text-dim">Pausas a cada 50 minutos para refrescar taxas de cortisol.</p>
              </div>
              <button
                onClick={() => handleToggle("scheduledBreaks")}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  switches.scheduledBreaks ? "bg-primary text-bg-deep font-bold" : "bg-bg-deep"
                }`}
              >
                <div className={`bg-bg-sidebar w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  switches.scheduledBreaks ? "translate-x-6" : ""
                }`} />
              </button>
            </div>

            <hr className="border-border-subtle" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Mesa Limpa e Minimalista</span>
                <p className="text-[10px] text-text-dim">Ocultar faturas, livros abertos ou bagunças visuais.</p>
              </div>
              <button
                onClick={() => handleToggle("cleanDesk")}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  switches.cleanDesk ? "bg-primary text-bg-deep font-bold" : "bg-bg-deep"
                }`}
              >
                <div className={`bg-bg-sidebar w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  switches.cleanDesk ? "translate-x-6" : ""
                }`} />
              </button>
            </div>

            <hr className="border-border-subtle" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Sons Ambientais Distrativos</span>
                <p className="text-[10px] text-text-dim">TV ligada, rádio de fundo ou trânsito excessivo sem fones.</p>
              </div>
              <button
                onClick={() => handleToggle("backgroundNoise")}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  switches.backgroundNoise ? "bg-rose-500/50" : "bg-bg-deep"
                }`}
              >
                <div className={`bg-bg-sidebar w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  switches.backgroundNoise ? "translate-x-6" : ""
                }`} />
              </button>
            </div>

            <hr className="border-border-subtle" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Time-Blocking na Agenda</span>
                <p className="text-[10px] text-text-dim">Reservar blocos inegociáveis de foco nas tarefas difíceis.</p>
              </div>
              <button
                onClick={() => handleToggle("timeblocking")}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  switches.timeblocking ? "bg-primary text-bg-deep font-bold" : "bg-bg-deep"
                }`}
              >
                <div className={`bg-bg-sidebar w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  switches.timeblocking ? "translate-x-6" : ""
                }`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-bg-deep text-white p-3.5 rounded-xl font-mono text-xs">
            <div>
              <span className="text-text-dim block uppercase text-[9px]">Foco Cognitivo:</span>
              <span className={`text-base font-bold ${focus >= 75 ? "text-emerald-400" : "text-amber-400"}`}>{focus}%</span>
              <div className="w-full bg-slate-700 h-1.5 rounded mt-1 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${focus}%` }} />
              </div>
            </div>
            <div>
              <span className="text-text-dim block uppercase text-[9px]">Sobrecarga Visceral:</span>
              <span className={`text-base font-bold ${overload <= 35 ? "text-emerald-400" : "text-rose-400"}`}>{overload}%</span>
              <div className="w-full bg-slate-700 h-1.5 rounded mt-1 overflow-hidden">
                <div className="bg-rose-500/50 h-full" style={{ width: `${overload}%` }} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-text-dim max-w-[200px] leading-tight">
              {canSubmit ? "✓ Equilíbrio Cortical atingido com sucesso!" : "⚠ Configuração instável. Desative notificações e sons e use agenda."}
            </span>
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="px-4 py-2 bg-slate-905 bg-bg-deep text-white font-bold rounded-lg hover:bg-white/10 disabled:opacity-40 select-none transition"
            >
              Confirmar Design de Ambiente
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto animate-bounce">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Design de Hábitos Concluido!</h4>
            <p className="text-xs text-text-dim max-w-sm mx-auto mt-1 leading-relaxed">
              {patient?.name || "O paciente"} organizou seu ambiente para evitar ativadores nocivos de esquiva, poupando fadiga decisória diária. O marcador de Autocuidado foi elevado.
            </p>
          </div>
          <button
            onClick={() => { setStep("intro"); setSwitches({ notifications: true, scheduledBreaks: false, cleanDesk: false, backgroundNoise: true, timeblocking: false }); }}
            className="px-5 py-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-bold rounded-lg transition flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Experimentar Novo Layout
          </button>
        </div>
      )}
    </div>
  );
}
