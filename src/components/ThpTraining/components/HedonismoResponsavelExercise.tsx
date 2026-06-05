import React, { useState } from "react";
import { Patient } from "../types";
import { Heart, Check, Trash } from "lucide-react";

interface ExerciseProps {
  onAwardXp: (xp: number) => void;
}

export default function HedonismoResponsavelExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void }) {
  const [step, setStep] = useState<"intro" | "plan" | "success">("intro");
  const [activities, setActivities] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const addActivity = () => {
    if (currentInput.trim() && activities.length < 3) {
      setActivities([...activities, currentInput.trim()]);
      setCurrentInput("");
    }
  };

  const removeActivity = (idx: number) => {
    setActivities(activities.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (activities.length > 0) {
      onAwardXp(100);
      setStep("success");
    }
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-xl mx-auto space-y-4 shadow-sm" id="hedonismo-responsavel-exercise">
      {step === "intro" && (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-600 flex items-center justify-center rounded-full mx-auto">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Exercício Clínico: Lazer Sem Remorso</h4>
            <p className="text-xs text-text-dim mt-1 leading-relaxed">
              {patient?.name || "O paciente"} sofre com cobranças cognitivas rígidas que sabotam seus descansos com sentimentos fantasmas de culpa. Este exercício ensina a planejar e blindar pequenos momentos de lazer.
            </p>
          </div>
          <button
            onClick={() => setStep("plan")}
            className="px-5 py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition"
          >
            Acessar Agenda de Autocuidado (+100 XP)
          </button>
        </div>
      )}

      {step === "plan" && (
        <div className="space-y-4 text-left">
          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold font-mono rounded uppercase">Agenda de Lazer Coeso</span>
          
          <div className="space-y-2">
            <h5 className="font-bold text-text-main text-xs uppercase font-mono">1. Cadastre até 3 atividades divertidas sãs para o fim de semana:</h5>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Ex: Ir à cafeteria especial ler um livro"
                className="flex-1 text-xs p-2.5 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary/25 outline-none bg-bg-sidebar"
              />
              <button
                type="button"
                onClick={addActivity}
                className="px-3 py-2 bg-primary text-bg-deep font-bold hover:bg-primary text-bg-deep font-bold text-white font-bold text-xs rounded-lg transition"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h5 className="font-bold text-text-dim text-[10px] uppercase font-mono">Atividades Agendadas:</h5>
            {activities.length === 0 ? (
              <p className="text-xs text-text-dim italic font-mono bg-bg-sidebar p-3 rounded-lg border border-dashed text-center">Nenhuma atividade agendada para {patient?.name || "o paciente"}.</p>
            ) : (
              <div className="space-y-2">
                {activities.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-bg-sidebar p-3 rounded-xl border border-border-subtle">
                    <span className="text-xs font-mono font-semibold text-text-main">☕ {item}</span>
                    <button
                      onClick={() => removeActivity(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-500/5 rounded"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-950 text-indigo-200 p-3.5 rounded-xl text-[11px] leading-relaxed font-mono">
            <strong>Raciocínio Clínico:</strong> O lazer sadio restabelece os neurotransmissores essenciais (serotonina e dopamina) que evitam a estafa suprarrenal. {patient?.name || "O paciente"} deve agir voluntariamente mesmo sob a voz autocrítica da culpa para dessensibilizar o medo do ócio.
          </div>

          <button
            disabled={activities.length === 0}
            onClick={handleSubmit}
            className="w-full py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
          >
            Confirmar e Blindar Atividades (+100 XP)
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Ócio Blindado com Sucesso!</h4>
            <p className="text-xs text-text-dim max-w-sm mx-auto mt-1 leading-relaxed">
              Você estruturou e salvou as 3 atividades livres de obrigação para o final de semana. O nível de cansaço agudo foi atenuado!
            </p>
          </div>
          <button
            onClick={() => { setStep("intro"); setActivities([]); }}
            className="px-5 py-2 bg-rose-500/5 border border-rose-100 text-rose-400 hover:bg-rose-500/10 text-xs font-bold rounded-lg transition mx-auto"
          >
            Remanejar Agenda
          </button>
        </div>
      )}
    </div>
  );
}
