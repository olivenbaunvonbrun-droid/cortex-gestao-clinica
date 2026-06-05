import React, { useState } from "react";
import { Patient } from "../types";
import { Sparkles, Check, ChevronRight } from "lucide-react";

interface ExerciseProps {
  onAwardXp: (xp: number) => void;
}

export default function RealismoOtimistaExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void }) {
  const [step, setStep] = useState<"intro" | "analyze" | "success">("intro");
  const [probs, setProbs] = useState({ pessimistic: 50, realistic: 40, optimistic: 10 });
  const [userCorrection, setUserCorrection] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const startExercise = () => {
    setStep("analyze");
  };

  const handleProbChange = (field: "pessimistic" | "realistic" | "optimistic", val: number) => {
    setProbs(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCorrection.trim()) return;
    setIsSubmitted(true);
    onAwardXp(100);
    setStep("success");
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-xl mx-auto space-y-4 shadow-sm" id="realismo-otimista-exercise">
      {step === "intro" && (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 flex items-center justify-center rounded-full mx-auto">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Exercício Clínico: Raciocínio Probabilístico</h4>
            <p className="text-xs text-text-dim mt-1 leading-relaxed">
              Adversidades inesperadas costumam ativar o viés catastrófico basolímbico. Este exercício ensina você a fatiar cenários em probabilidades reais e construir racionalizações lógicas em vez de sofrer por antecipação.
            </p>
          </div>
          <button
            onClick={startExercise}
            className="px-5 py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition"
          >
            Iniciar Análise (+100 XP)
          </button>
        </div>
      )}

      {step === "analyze" && (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold font-mono rounded uppercase">Cenário Desafiador</span>
          <p className="text-xs font-semibold text-text-main leading-normal font-mono bg-bg-sidebar p-3 rounded-lg border border-rose-500/20">
            "A diretoria convocou uma reunião de emergência para amanhã cedo sem colocar pauta. Tenho certeza absoluta de que vão me demitir ou cortar o orçamento do meu projeto."
          </p>

          <div className="space-y-3 pt-2">
            <h5 className="font-bold text-text-main text-xs uppercase font-mono">1. Distribua as Probabilidades Pessoais (Total Livre)</h5>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-text-dim flex justify-between">
                <span>Péssimo (Fui demitido e humilhado):</span>
                <span className="font-bold text-rose-600">{probs.pessimistic}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={probs.pessimistic}
                onChange={(e) => handleProbChange("pessimistic", parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-text-dim flex justify-between">
                <span>Realista (Ajuste técnico ou novos prazos):</span>
                <span className="font-bold text-sky-600">{probs.realistic}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={probs.realistic}
                onChange={(e) => handleProbChange("realistic", parseInt(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-text-dim flex justify-between">
                <span>Otimista (Meu projeto foi validado e promovido):</span>
                <span className="font-bold text-primary">{probs.optimistic}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={probs.optimistic}
                onChange={(e) => handleProbChange("optimistic", parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h5 className="font-bold text-text-main text-xs uppercase font-mono">2. Escreva uma Justificativa Alternativa baseada em Fatos Reais</h5>
            <textarea
              required
              rows={3}
              value={userCorrection}
              onChange={(e) => setUserCorrection(e.target.value)}
              placeholder="Ex: Não há histórico de demissões sumárias na empresa e meu chefe elogiou meu engajamento na semana anterior. Provavelmente a pauta é uma mudança tática de cronograma..."
              className="w-full text-xs p-3 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary/25 outline-none focus:ring-0 bg-bg-sidebar"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition"
          >
            Submeter Análise Probabilística
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Parabéns {patient?.name || "Paciente"}!</h4>
            <p className="text-xs text-text-dim max-w-sm mx-auto mt-1 leading-relaxed">
              Você concluiu a análise comportamental de Realismo Otimista. Suas chances estimadas foram registradas no log do terapeuta para correlação hemodinâmica.
            </p>
          </div>
          <div className="p-3 bg-primary/10 text-primary text-left rounded-xl border border-primary/20 max-w-sm mx-auto">
            <span className="text-[9px] font-mono font-bold uppercase block tracking-wider text-primary">Roteiro Escrito Registrado:</span>
            <p className="text-xs font-mono mt-1 font-semibold italic text-indigo-900">
              "{userCorrection}"
            </p>
          </div>
          <button
            onClick={() => { setStep("intro"); setIsSubmitted(false); setUserCorrection(""); }}
            className="px-5 py-2 bg-indigo-100 text-primary border border-primary/20 hover:bg-indigo-200 text-xs font-bold rounded-lg transition flex items-center gap-1 mx-auto"
          >
            Refazer Exercício <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
