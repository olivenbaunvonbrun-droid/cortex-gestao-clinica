import React, { useState } from "react";
import { Patient } from "../types";
import { Heart, Check, Users } from "lucide-react";

interface ExerciseProps {
  onAwardXp: (xp: number) => void;
}

export default function SensibilidadeSocialExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void }) {
  const [step, setStep] = useState<"intro" | "act" | "success">("intro");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const tasks = [
    {
      id: "help-junior",
      title: "Orientar um desenvolvedor júnior com dúvidas no Docker",
      desc: "Investir 15 minutos para destravar o ambiente de um novato de equipe de forma tranquila.",
      impact: "Eleva o sentimento de pertencimento mútuo e reduz o foco egocêntrico na própria ansiedade."
    },
    {
      id: "review-guideline",
      title: "Revisar um documento clínico de diretrizes sociais",
      desc: "Doar conhecimento técnico para polir e corrigir erros gramaticais em guias internos de processos.",
      impact: "Incentiva a cooperação desinteressada e restabelece a harmonia social do grupo."
    }
  ];

  const handleSubmit = () => {
    if (selectedTask) {
      onAwardXp(100);
      setStep("success");
    }
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-xl mx-auto space-y-4 shadow-sm" id="sensibilidade-social-exercise">
      {step === "intro" && (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-indigo-100 text-primary flex items-center justify-center rounded-full mx-auto">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Exercício Clínico: Desvio de Foco Egocêntrico</h4>
            <p className="text-xs text-text-dim mt-1 leading-relaxed">
              Picos agudos de ansiedade induzem o cérebro ao egoísmo ansioso (hiper-foco nas próprias palpitações viscerais). Praticar gestos éticos altruístas aciona descargas de ocitocina e ampara o relaxamento límbico.
            </p>
          </div>
          <button
            onClick={() => setStep("act")}
            className="px-5 py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition"
          >
            Acessar Mural de Apoio (+100 XP)
          </button>
        </div>
      )}

      {step === "act" && (
        <div className="space-y-4 text-left">
          <span className="px-2 py-0.5 bg-indigo-100 text-primary text-[10px] font-bold font-mono rounded uppercase">Ações do Bem Comum</span>
          <h5 className="font-bold text-text-main text-xs font-mono">Selecione um ato voluntário para realizar hoje:</h5>

          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task.id)}
                className={`w-full text-left p-4 rounded-xl border transition text-xs block shadow-sm ${
                  selectedTask === task.id
                    ? "bg-primary/10 border-indigo-400"
                    : "bg-bg-sidebar border-border-subtle hover:bg-bg-card"
                }`}
              >
                <div className="font-bold text-text-main mb-1">🤝 {task.title}</div>
                <p className="text-[11px] text-text-dim leading-relaxed mb-2">{task.desc}</p>
                <div className="text-[10px] font-mono text-primary font-semibold bg-primary/5 p-1.5 rounded">
                  <strong>Impacto Clínico:</strong> {task.impact}
                </div>
              </button>
            ))}
          </div>

          <button
            disabled={!selectedTask}
            onClick={handleSubmit}
            className="w-full py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
          >
            Consolidar Ato Solidário
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Ato de Sensibilidade Social Registrado!</h4>
            <p className="text-xs text-text-dim max-w-sm mx-auto mt-1 leading-relaxed">
              {patient?.name || "O paciente"} agendou e executou o suporte amigável. Essa quebra nos ciclos de medo egocêntrico foi reportada ao painel de evolução clínica.
            </p>
          </div>
          <button
            onClick={() => { setStep("intro"); setSelectedTask(null); }}
            className="px-5 py-2 bg-indigo-100 text-primary hover:bg-indigo-200 border border-primary/20 text-xs font-bold rounded-lg transition mx-auto"
          >
            Ver Outras Ações
          </button>
        </div>
      )}
    </div>
  );
}
