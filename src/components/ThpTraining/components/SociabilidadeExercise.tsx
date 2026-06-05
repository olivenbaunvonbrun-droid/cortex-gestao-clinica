import React, { useState } from "react";
import { Patient } from "../types";
import { MessagesSquare, ThumbsUp, Check, AlertCircle } from "lucide-react";

interface ExerciseProps {
  onAwardXp: (xp: number) => void;
}

export default function SociabilidadeExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void }) {
  const [step, setStep] = useState<"intro" | "chat" | "feedback" | "success">("intro");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const options = [
    {
      id: 1,
      text: "Passivo-Submisso: 'Desculpe te incomodar, não precisa se preocupar, eu faço tudo sozinho para você de madruga para que não se estresse...'",
      clinicalRating: "Baixo (Subjugação de Direitos)",
      explain: `Anular suas próprias necessidades saudáveis gera amargura extrema. Isso fortalece o Esquema de ${patient?.activeSchemas?.[0] || "Auto-sacrifício"} de ${patient?.name || "Pedro"}.`,
      isCorrect: false
    },
    {
      id: 2,
      text: "Assertivo-Empático: 'Compreendo que você está com o prazo apertado e se sentindo sufocado. Vamos dividir essa planilha meio a meio para podermos entregar hoje sem estresse?'",
      clinicalRating: "Excelente (Síncrone de 4ª Geração)",
      explain: "Vocaliza empatia genuína à dor alheia sem abrir mão ou rebaixar seus próprios limites éticos institucionais. Estabelece cooperação horizontal madura.",
      isCorrect: true
    },
    {
      id: 3,
      text: "Agressivo-Punitivo: 'Se você não sabe formatar planilhas, devia ter feito um curso antes de pegar essa pasta de trabalho técnica!'",
      clinicalRating: "Crítico (Ataque Esquemático de Contra-ataque)",
      explain: "Agressões verbales detonam o vínculo terapêutico e profissional, disparando reações defensivas agudas na contraparte. Gera frentes de hostilidade.",
      isCorrect: false
    }
  ];

  const handleSelectOption = (id: number) => {
    setSelectedOption(id);
    setStep("feedback");
  };

  const handleConfirm = () => {
    if (selectedOption === 2) {
      onAwardXp(100);
      setStep("success");
    } else {
      setStep("chat");
      setSelectedOption(null);
    }
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-xl mx-auto space-y-4 shadow-sm" id="sociabilidade-exercise">
      {step === "intro" && (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-sky-105 bg-sky-100 text-sky-600 flex items-center justify-center rounded-full mx-auto">
            <MessagesSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Exercício Clínico: Role-play de Comunicação Empática</h4>
            <p className="text-xs text-text-dim mt-1 leading-relaxed">
              Cultivar laços sociais saudáveis exige equilibrar o acolhimento à vulnerabilidade alheia com a preservação de seus próprios limites. Pratique respostas síncronas para impasses cotidianos de equipe.
            </p>
          </div>
          <button
            onClick={() => setStep("chat")}
            className="px-5 py-2 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-lg transition"
          >
            Iniciar Simulação de Diálogo (+100 XP)
          </button>
        </div>
      )}

      {step === "chat" && (
        <div className="space-y-4 text-left">
          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold font-mono rounded uppercase">Fala do Colega de Trabalho</span>
          <div className="p-3 bg-bg-sidebar border border-border-subtle rounded-xl leading-normal text-xs text-text-main font-serif italic">
            "{patient?.name || "Pedro"}, estou completamente atolado hoje com esses relatórios e não vou conseguir formatar a planilha de clientes a tempo. Você tem a obrigação de me ajudar nisso rápido!"
          </div>

          <h5 className="font-bold text-text-main text-xs font-mono pt-2">Escolha sua Abordagem de Resposta:</h5>
          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className="w-full text-left p-3.5 bg-bg-sidebar border border-border-subtle rounded-xl hover:border-indigo-400 hover:bg-bg-card transition text-xs leading-relaxed text-text-main font-mono block shadow-sm border-2"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "feedback" && selectedOption !== null && (
        <div className="space-y-4 text-left bg-bg-sidebar p-5 rounded-2xl border border-border-subtle shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-dim font-mono uppercase">Abordagem Selecionada:</span>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
              options.find(o => o.id === selectedOption)?.isCorrect ? "bg-primary/10 text-emerald-800" : "bg-rose-500/10 text-rose-400"
            }`}>
              {options.find(o => o.id === selectedOption)?.clinicalRating}
            </span>
          </div>

          <p className="text-xs text-text-main italic border-l-2 border-indigo-505 border-primary pl-3">
            "{options.find(o => o.id === selectedOption)?.text.split(": ")[1]}"
          </p>

          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-dim leading-relaxed font-mono">
            <span className="font-bold text-text-main block mb-1">Raciocínio Clínico:</span>
            {options.find(o => o.id === selectedOption)?.explain}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            {options.find(o => o.id === selectedOption)?.isCorrect ? (
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-bg-deep text-white font-bold text-xs rounded-lg hover:bg-white/10 transition"
              >
                Confirmar Escolha e Consolidar (+100 XP)
              </button>
            ) : (
              <button
                onClick={() => setStep("chat")}
                className="px-4 py-2 bg-rose-500/10 text-rose-400 font-bold text-xs rounded-lg hover:bg-rose-200 transition"
              >
                Tentar Outra Abordagem
              </button>
            )}
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Síncrone Social Atingido!</h4>
            <p className="text-xs text-text-dim max-w-sm mx-auto mt-1 leading-relaxed">
              Você selecionou e internalizou a resposta assertiva sã de quarta geração terapêutica. O marcadores de sociabilidade e cooperação foram elevados para {patient?.name || "o paciente"}!
            </p>
          </div>
          <button
            onClick={() => { setStep("intro"); setSelectedOption(null); }}
            className="px-5 py-2 bg-indigo-100 text-primary hover:bg-indigo-200 border border-primary/20 text-xs font-bold rounded-lg transition mx-auto"
          >
            Refazer Simulação
          </button>
        </div>
      )}
    </div>
  );
}
