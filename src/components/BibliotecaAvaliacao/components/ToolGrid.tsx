import React from "react";
import { Tool, ToolCategory } from "../types";
import { CATEGORIES } from "../data";
import { 
  BrainCircuit, Watch, Activity, PlusCircle, Clock, Target, Play, 
  ShieldAlert, Sparkles, ClipboardCheck, Users, Sliders, Heart, Pin
} from "lucide-react";

interface ToolGridProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
  searchQuery: string;
  pinnedToolIds: string[];
  onTogglePin: (id: string) => void;
}

export default function ToolGrid({ 
  tools, 
  onSelectTool, 
  searchQuery, 
  pinnedToolIds, 
  onTogglePin 
}: ToolGridProps) {
  const getToolIcon = (iconName: string, category: ToolCategory) => {
    const baseClass = "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ";
    let colorClass = "bg-gray-900 border border-gray-800 text-gray-500";
    
    if (category === "felicidade") colorClass = "bg-pink-950/40 border border-pink-800/30 text-pink-400";
    else if (category === "autoconhecimento") colorClass = "bg-blue-950/40 border border-blue-800/30 text-blue-400";
    else if (category === "autoestima") colorClass = "bg-purple-950/40 border border-purple-800/30 text-purple-400";
    else if (category === "racio_real_otimista") colorClass = "bg-cyan-950/40 border border-cyan-800/30 text-cyan-400";
    else if (category === "resolut_enfrent") colorClass = "bg-emerald-950/40 border border-emerald-800/30 text-emerald-400";
    else if (category === "imunidade_social") colorClass = "bg-violet-950/40 border border-violet-800/30 text-violet-400";
    else if (category === "autocontrole") colorClass = "bg-amber-950/40 border border-amber-800/30 text-amber-400";
    else if (category === "mentalidades") colorClass = "bg-rose-950/40 border border-rose-800/30 text-rose-400";

    switch (iconName) {
      case "BrainCircuit":
        return <div className={baseClass + colorClass}><BrainCircuit className="w-5 h-5" /></div>;
      case "Watch":
        return <div className={baseClass + colorClass}><Watch className="w-5 h-5" /></div>;
      case "Activity":
        return <div className={baseClass + colorClass}><Activity className="w-5 h-5" /></div>;
      case "ClipboardCheck":
        return <div className={baseClass + colorClass}><ClipboardCheck className="w-5 h-5" /></div>;
      case "Users":
        return <div className={baseClass + colorClass}><Users className="w-5 h-5" /></div>;
      case "Clock":
        return <div className={baseClass + colorClass}><Clock className="w-5 h-5" /></div>;
      case "Target":
        return <div className={baseClass + colorClass}><Target className="w-5 h-5" /></div>;
      case "ShieldAlert":
        return <div className={baseClass + colorClass}><ShieldAlert className="w-5 h-5" /></div>;
      case "Sliders":
        return <div className={baseClass + colorClass}><Sliders className="w-5 h-5" /></div>;
      case "Heart":
        return <div className={baseClass + colorClass}><Heart className="w-5 h-5" /></div>;
      default:
        return <div className={baseClass + colorClass}><PlusCircle className="w-5 h-5" /></div>;
    }
  };

  const filteredTools = tools.filter(tool => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.code.toLowerCase().includes(query) ||
      tool.skillsEvaluated.some(skill => skill.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-12 px-4 md:px-16 pb-20" id="tool-grid-container">
      {/* Category Sections: organized in beautiful horizontal rows or sections */}
      {CATEGORIES.map(category => {
        const categoryTools = filteredTools.filter(t => t.category === category.id);
        if (categoryTools.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4" id={`cat-section-${category.id}`}>
            {/* Header info for category */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-900 pb-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-5 bg-gradient-to-b ${category.color} rounded-sm`} />
                <h2 className="text-xl font-bold text-white tracking-tight font-display">
                  {category.label}
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-1 md:mt-0 max-w-md md:text-right italic">
                {category.description}
              </p>
            </div>

            {/* List/Grid layout - beautiful cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {categoryTools.map(tool => {
                const isReady = tool.status === "ready";
                const isPinned = pinnedToolIds.includes(tool.id);

                return (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool(tool)}
                    className="relative group bg-[#111217]/90 rounded-xl overflow-hidden border border-gray-900 hover:border-[#00A3FF]/60 p-5 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                    id={`tool-card-${tool.id}`}
                  >
                    {/* Glowing highlight standard netflix effect */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-[#00A3FF] to-indigo-600" />

                    {/* Pin button on top right */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(tool.id);
                      }}
                      className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-all duration-300 z-10 hover:scale-110 ${
                        isPinned 
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                          : "bg-gray-950/60 border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                      }`}
                      title={isPinned ? "Excluir do Acesso Rápido" : "Fixar no Acesso Rápido"}
                    >
                      <Pin className={`w-3.5 h-3.5 transition-transform ${isPinned ? "rotate-45" : ""}`} />
                    </button>

                    <div className="space-y-4">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3 pr-6">
                        <div className="flex gap-3">
                          {getToolIcon(tool.icon, tool.category)}
                          <div className="space-y-0.5">
                            <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                              <span className="text-[#00A3FF] font-mono font-bold mr-1.5">{tool.code}</span>
                              {tool.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-[#00A3FF]/15 text-[#00A3FF] px-1.5 py-0.5 rounded font-bold font-mono">
                                DIGITAL
                              </span>
                              <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                                <Clock className="w-2.5 h-2.5" />
                                {tool.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>

                    {/* Footer stats: Evaluated Skills & Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-950/80 flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {tool.skillsEvaluated.slice(0, 3).map((skill, i) => (
                          <span 
                            key={i} 
                            className="text-[9px] bg-gray-950 text-gray-400 border border-gray-900 px-2 py-0.5 rounded flex items-center gap-1 font-mono"
                          >
                            <Target className="w-2 h-2 text-[#00A3FF] shrink-0" />
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Button indicator */}
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-[10px] text-gray-500 truncate max-w-[190px]">
                          Foco: {tool.targetGroup}
                        </span>
                        
                        <span className="flex items-center gap-1 text-[#00A3FF] font-bold group-hover:text-[#38bcfd] transition-colors">
                          Testar
                          <Play className="w-3 h-3 fill-current ml-0.5 shrink-0" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
