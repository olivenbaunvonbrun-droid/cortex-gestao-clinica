import React from 'react';
import { Brain, Users, ClipboardList, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'soon';
  category: string;
}

interface ToolsLibraryProps {
  onOpenTool: (toolId: string) => void;
  openWindows: string[];
}

export default function ToolsLibrary({ onOpenTool, openWindows }: ToolsLibraryProps) {
  const tools: ToolItem[] = [
    {
      id: 'rid-inteligente',
      title: 'RID Inteligente',
      description: 'Registro de Informações Diárias avançado com análise automatizada de distorções cognitivas, esquemas e reestruturação via inteligência artificial.',
      icon: Brain,
      status: 'active',
      category: 'Clínico & TCC',
    },
    {
      id: 'ihs-digital',
      title: 'IHS Digital',
      description: 'Inventário de Habilidades Sociais para mapeamento, pontuação automática e acompanhamento de assertividade e empatia dos pacientes.',
      icon: Users,
      status: 'active',
      category: 'Avaliação Psicológica',
    },
    {
      id: 'ysq-smart-ai',
      title: 'YSQ-Smart AI',
      description: 'Questionário de Esquemas de Young (YSQ-S3) com cruzamento de dados sintomáticos e geração de gráficos de domínios desadaptativos.',
      icon: Sparkles,
      status: 'soon',
      category: 'Terapia do Esquema',
    },
    {
      id: 'neurolitera',
      title: 'NeuroLitera',
      description: 'Plataforma integrada de alfabetização clínica e neurofala, com acompanhamento de progresso de transtornos de aprendizagem.',
      icon: BookOpen,
      status: 'soon',
      category: 'Neuropsicologia',
    },
    {
      id: 'registro-atendimento',
      title: 'Registro de Atendimento',
      description: 'Estruturação simplificada e ágil de anamneses e relatórios evolutivos com exportação rápida em lote.',
      icon: ClipboardList,
      status: 'soon',
      category: 'Administração Clínica',
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">Biblioteca de Ferramentas</h2>
        <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
          <span className="w-4 h-[1px] bg-primary/40" /> Utilitários clínicos integrados para auxílio em sessões
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.status === 'active';
          const isOpened = openWindows.includes(tool.id);

          return (
            <div
              key={tool.id}
              className={cn(
                "bg-bg-card border rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group",
                isActive 
                  ? "border-border-subtle hover:border-primary/40 hover:-translate-y-1 shadow-lg hover:shadow-primary/5" 
                  : "border-border-subtle/40 opacity-60"
              )}
            >
              {/* Background gradient on hover for active */}
              {isActive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-opacity duration-300 opacity-50 group-hover:opacity-100" />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                    isActive 
                      ? "bg-primary/5 text-primary border-primary/25" 
                      : "bg-white/5 text-text-dim border-border-subtle/25"
                  )}>
                    {tool.category}
                  </span>
                  
                  {tool.status === 'soon' && (
                    <span className="text-[8.5px] font-black text-amber-500 uppercase tracking-widest">
                      Em breve
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    isActive 
                      ? "bg-primary text-bg-deep" 
                      : "bg-bg-sidebar border border-border-subtle/50 text-text-dim"
                  )}>
                    <Icon size={20} />
                  </div>
                  <h3 className={cn(
                    "text-lg font-bold tracking-tight",
                    isActive ? "text-text-main group-hover:text-primary transition-colors" : "text-text-dim"
                  )}>
                    {tool.title}
                  </h3>
                </div>

                <p className="text-[11px] text-text-dim/80 leading-relaxed font-medium">
                  {tool.description}
                </p>
              </div>

              <div className="pt-6 border-t border-border-subtle/40 mt-6 flex items-center justify-between">
                {isActive ? (
                  <>
                    <button
                      onClick={() => onOpenTool(tool.id)}
                      className={cn(
                        "py-3.5 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center gap-2 cursor-pointer shadow-md",
                        isOpened
                          ? "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                          : "bg-primary hover:bg-primary-hover text-bg-deep hover:-translate-y-0.5 active:scale-95 shadow-primary/10"
                      )}
                    >
                      <ExternalLink size={12} />
                      {isOpened ? 'Trazer para Frente' : 'Abrir Ferramenta'}
                    </button>
                    {isOpened && (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Ativa
                      </span>
                    )}
                  </>
                ) : (
                  <button
                    disabled
                    className="py-3.5 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] bg-bg-sidebar border border-border-subtle/50 text-text-dim/40 cursor-not-allowed"
                  >
                    Indisponível
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
