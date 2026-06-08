import React from "react";
import { Tool, ToolCategory } from "../types";
import { 
  BrainCircuit, Watch, Activity, PlusCircle, Clock, Target, Play, 
  ShieldAlert, Sparkles, ClipboardCheck, Users, Sliders, Heart, Pin, X
} from "lucide-react";

interface QuickAccessProps {
  tools: Tool[];
  pinnedToolIds: string[];
  onSelectTool: (tool: Tool) => void;
  onTogglePin: (id: string) => void;
}

export default function QuickAccess({ 
  tools, 
  pinnedToolIds, 
  onSelectTool, 
  onTogglePin 
}: QuickAccessProps) {
  const getToolIcon = (iconName: string, category: ToolCategory) => {
    const baseClass = "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg border transition-all duration-300 group-hover:scale-110 ";
    let colorClass = "bg-gray-900 border-gray-800 text-gray-500";
    
    if (category === "felicidade") colorClass = "bg-pink-950/40 border-pink-800/20 text-pink-400 group-hover:border-pink-800/40";
    else if (category === "autoconhecimento") colorClass = "bg-blue-950/40 border-blue-800/20 text-blue-400 group-hover:border-blue-800/40";
    else if (category === "autoestima") colorClass = "bg-purple-950/40 border-purple-800/20 text-purple-400 group-hover:border-purple-800/40";
    else if (category === "racio_real_otimista") colorClass = "bg-cyan-950/40 border-cyan-800/20 text-cyan-400 group-hover:border-cyan-800/40";
    else if (category === "resolut_enfrent") colorClass = "bg-emerald-950/40 border-emerald-800/20 text-emerald-400 group-hover:border-emerald-800/40";
    else if (category === "imunidade_social") colorClass = "bg-violet-950/40 border-violet-800/20 text-violet-400 group-hover:border-violet-800/40";
    else if (category === "autocontrole") colorClass = "bg-amber-950/40 border-amber-800/20 text-amber-400 group-hover:border-amber-800/40";
    else if (category === "mentalidades") colorClass = "bg-rose-950/40 border-rose-800/20 text-rose-400 group-hover:border-rose-800/40";

    switch (iconName) {
      case "BrainCircuit": return <div className={baseClass + colorClass}><BrainCircuit className="w-6 h-6" /></div>;
      case "Watch": return <div className={baseClass + colorClass}><Watch className="w-6 h-6" /></div>;
      case "Activity": return <div className={baseClass + colorClass}><Activity className="w-6 h-6" /></div>;
      case "ClipboardCheck": return <div className={baseClass + colorClass}><ClipboardCheck className="w-6 h-6" /></div>;
      case "Users": return <div className={baseClass + colorClass}><Users className="w-6 h-6" /></div>;
      case "Clock": return <div className={baseClass + colorClass}><Clock className="w-6 h-6" /></div>;
      case "Target": return <div className={baseClass + colorClass}><Target className="w-6 h-6" /></div>;
      case "ShieldAlert": return <div className={baseClass + colorClass}><ShieldAlert className="w-6 h-6" /></div>;
      case "Sliders": return <div className={baseClass + colorClass}><Sliders className="w-6 h-6" /></div>;
      case "Heart": return <div className={baseClass + colorClass}><Heart className="w-6 h-6" /></div>;
      default: return <div className={baseClass + colorClass}><PlusCircle className="w-6 h-6" /></div>;
    }
  };

  const pinnedTools = tools.filter(t => pinnedToolIds.includes(t.id));

  return (
    <div className="px-4 md:px-16 mb-10" id="quick-access-section">
      <div className="bg-[#111217]/50 border border-gray-900 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-xl pointer-events-none" />
        
        {/* Section Title */}
        <div className="flex items-center justify-between mb-5 border-b border-gray-950 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg text-amber-400">
              <Pin className="w-4 h-4 rotate-45 text-amber-400 fill-amber-400/10 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Menu de Acesso Rápido
              </h2>
              <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                Selecione as ferramentas preferidas nos cards abaixo para exibi-las em atalhos simplificados por ícone aqui
              </p>
            </div>
          </div>
          
          {pinnedTools.length > 0 && (
            <span className="text-[10px] bg-gray-950 border border-gray-900 text-gray-400 px-2 py-0.5 rounded-md font-mono">
              {pinnedTools.length} {pinnedTools.length === 1 ? "Atalho" : "Atalhos"}
            </span>
          )}
        </div>

        {/* Shortcuts container */}
        {pinnedTools.length > 0 ? (
          <div className="flex flex-wrap gap-6 items-center">
            {pinnedTools.map(tool => (
              <div 
                key={tool.id} 
                className="relative group flex flex-col items-center text-center cursor-pointer max-w-[100px] select-none"
                onClick={() => onSelectTool(tool)}
                title={`Abrir instrumento: ${tool.title}`}
              >
                {/* Micro Unpin button visible on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(tool.id);
                  }}
                  className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow border border-red-950/30"
                  title="Remover do Acesso Rápido"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Animated colored icon wrapper */}
                <div className="relative mb-2">
                  {getToolIcon(tool.icon, tool.category)}
                  
                  {/* Micro label for custom codes */}
                  <div className="absolute -bottom-1 right-0 bg-[#00A3FF] text-[8px] text-black font-extrabold max-w-full px-1 py-0.2 rounded border border-[#001E35] font-mono select-none shadow">
                    {tool.code}
                  </div>
                </div>

                {/* Text Label */}
                <span className="text-[10px] font-bold text-gray-300 group-hover:text-white transition-colors tracking-tight truncate w-16">
                  {tool.title.split(":")[0].replace("Mentalidades Saudáveis", "Ment.")}
                </span>
                
                {/* Detail */}
                <span className="text-[8px] text-gray-600 group-hover:text-gray-400 transition-colors font-mono uppercase mt-0.5">
                  {tool.duration}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-gray-900 rounded-xl bg-gray-950/10" id="empty-quick-access">
            <Pin className="w-5 h-5 text-gray-700 mb-2 rotate-45 animate-bounce" />
            <p className="text-xs text-gray-400 font-bold">Nenhum atalho configurado</p>
            <p className="text-[10px] text-gray-600 mt-1 max-w-md mx-auto">
              Selecione quais ferramentas deseja exibir aqui. Vá em qualquer card de ferramentas abaixo e clique na <span className="text-amber-500">estrela/marcador (pin)</span> no canto superior direito para favoritar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
