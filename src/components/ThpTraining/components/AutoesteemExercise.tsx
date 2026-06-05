import React, { useState } from "react";
import { Patient } from "../types";
import { Award, Check, RotateCcw } from "lucide-react";

interface ExerciseProps {
  onAwardXp: (xp: number) => void;
}

export default function AutoestimaExercise({ onAwardXp }: ExerciseProps) {
  const [step, setStep] = useState<"intro" | "refraction" | "success">("intro");
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);

  const responses = [
    {
      id: 1,
      text: "Eu sou um erro ambulante por não ter decorado todos os slides perfeitamente.",
      feel: "Punição",
      isCorrect: false,
      feedback: "Isso perpetua a autocrítica doentia de que você deve ser sobre-humano. Rejeitado pelo crivo clínico."
    },
    {
      id: 2,
      text: "Eu fiz o melhor que meu corpo e minha ansiedade permitiram hoje. Errar e gaguejar não anula minha bagagem técnica nem a decência da minha história pessoal.",
      feel: "Autocompaixão",
      isCorrect: true,
      feedback: "Perfeito! Declara humanidade, valida o esforço real, limita as exigências draconianas do ego e preserva a dignidade incondicional."
    }
  ];

  const handleSubmit = () => {
    if (selectedResponse === 2) {
      onAwardXp(100);
      setStep("success");
    }
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-xl mx-auto space-y-4 shadow-sm" id="autoestima-exercise">
      {step === "intro" && (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-full mx-auto">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Exercício Clínico: Desarmando a Autopunição</h4>
            <p className="text-xs text-text-dim mt-1 leading-relaxed">
              {patient?.name || "O paciente"} frequentemente direciona ataques de extrema cobrança a si mesmo devido ao Esquema de {patient?.activeSchemas?.[0] || "Defectividade/Vergonha"}. Pratique escolher respostas de autocompaixão incondicional sob picos de estresse.
            </p>
          </div>
          <button
            onClick={() => setStep("refraction")}
            className="px-5 py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition"
          >
            Acessar Refração de Crítica (+100 XP)
          </button>
        </div>
      )}

      {step === "refraction" && (
        <div className="space-y-4 text-left">
          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold font-mono rounded uppercase">O Ataque do Autocrítico</span>
          <div className="p-3 bg-bg-sidebar border border-rose-500/20 rounded-xl text-xs text-rose-400 italic font-mono leading-normal">
            "Eu travei por 3 segundos na frente de todo mundo hoje. Sou um fracassado vergonhoso que nunca vai ser respeitado!"
          </div>

          <h5 className="font-bold text-text-main text-xs font-mono pt-2">Selecione uma reconstrução de auto-respeito segura:</h5>
          <div className="space-y-3">
            {responses.map((resp) => (
              <button
                key={resp.id}
                onClick={() => setSelectedResponse(resp.id)}
                className={`w-full text-left p-4 rounded-xl border transition text-xs block shadow-sm ${
                  selectedResponse === resp.id
                    ? "bg-primary/10 border-indigo-400"
                    : "bg-bg-sidebar border-border-subtle hover:bg-bg-card"
                }`}
              >
                <div className="font-bold text-text-main mb-1">{resp.text}</div>
                <div className="text-[10px] mt-1.5 font-mono text-text-dim">
                  Qualidade: <span className="font-bold uppercase">{resp.feel}</span>
                </div>
                {selectedResponse === resp.id && (
                  <p className="text-[10px] mt-2 font-mono text-primary font-semibold bg-primary/10 p-1.5 rounded">
                    <strong>Análise:</strong> {resp.feedback}
                  </p>
                )}
              </button>
            ))}
          </div>

          <button
            disabled={selectedResponse !== 2}
            onClick={handleSubmit}
            className="w-full py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
          >
            Registrar Auto-Acolhimento de Poder
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Auto-Apreciação Solidificada!</h4>
            <p className="text-xs text-text-dim max-w-sm mx-auto mt-1 leading-relaxed">
              Você acolheu {patient?.name || "o paciente"} com compaixão incondicional, mitigando a tirania de autocríticas e reforçando o valor de sua identidade clínica.
            </p>
          </div>
          <button
            onClick={() => { setStep("intro"); setSelectedResponse(null); }}
            className="px-5 py-2 bg-indigo-100 text-primary hover:bg-indigo-200 border border-primary/20 text-xs font-bold rounded-lg transition flex items-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refazer Exercício
          </button>
        </div>
      )}
    </div>
  );
}
