import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Users, 
  ClipboardList, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  Layers, 
  TrendingUp, 
  FileSpreadsheet, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  GripVertical,
  Activity
} from 'lucide-react';
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

const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 'psidiagnostic-pro',
    title: 'Psidiagnostic Pro',
    description: 'Elaboração de laudos e pareceres psicodiagnósticos baseados no prontuário do paciente (evoluções, anamnese) e/ou arquivos de exames externos.',
    icon: FileSpreadsheet,
    status: 'active',
    category: 'Avaliação Psicológica',
  },
  {
    id: 'linha-vida',
    title: 'Linha da Vida',
    description: 'Mapeamento cronológico de marcos autobiográficos e de valência emocional (picos e vales) com elaboração de laudos integrativos via IA.',
    icon: TrendingUp,
    status: 'active',
    category: 'Clínico & TCC',
  },
  {
    id: 'thp-training',
    title: 'Treinamento THP',
    description: 'Programa estruturado para Treinamento de Habilidades Psicológicas (THP) do paciente, contendo diário de treino, plano de exercícios práticos e supervisão clínica via IA.',
    icon: Activity,
    status: 'active',
    category: 'Clínico & TCC',
  },
  {
    id: 'dfc-assistido',
    title: 'DFC Assistido',
    description: 'Modelagem interativa do Diagrama de Funcionamento Cognitivo (DFC/DCC) em TCC com mapeamento estrutural e formulação clínica assistida por IA.',
    icon: Layers,
    status: 'active',
    category: 'Clínico & TCC',
  },
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
    status: 'active',
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
    status: 'active',
    category: 'Administração Clínica',
  },
  {
    id: 'plano-clinico-integrado',
    title: 'Plano Clínico Integrado (PCI)',
    description: 'Estruturação de planos de tratamento integrados, metas terapêuticas (curto, médio e longo prazo) e cronogramas de intervenção com suporte de IA.',
    icon: Layers,
    status: 'active',
    category: 'Planejamento Clínico',
  },
  {
    id: 'ihp-pr-digital',
    title: 'IHP-PR Digital',
    description: 'Inventário de Habilidades Psicológicas (Poubel & Rodrigues) com cálculo automático, mapeamento em gráfico de radar e geração de laudos por IA.',
    icon: Brain,
    status: 'active',
    category: 'Avaliação Psicológica',
  }
];

export default function ToolsLibrary({ onOpenTool, openWindows }: ToolsLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderedTools, setOrderedTools] = useState<ToolItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Load from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem('cortex_tools_order_v1');
    if (saved) {
      try {
        const parsedIds = JSON.parse(saved) as string[];
        // Map saved IDs back to DEFAULT_TOOLS list, preserving defaults for missing ones
        const mapped = parsedIds
          .map(id => DEFAULT_TOOLS.find(t => t.id === id))
          .filter((t): t is ToolItem => !!t);
        
        // Add any new tools that aren't in the saved list yet
        const missing = DEFAULT_TOOLS.filter(t => !parsedIds.includes(t.id));
        setOrderedTools([...mapped, ...missing]);
      } catch (e) {
        setOrderedTools(DEFAULT_TOOLS);
      }
    } else {
      setOrderedTools(DEFAULT_TOOLS);
    }
  }, []);

  // Filter tools based on search
  const filteredTools = orderedTools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get categories in relative order of appearing in orderedTools
  const categories = Array.from(new Set(filteredTools.map(t => t.category)));

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = orderedTools.findIndex(t => t.id === draggedId);
    const targetIndex = orderedTools.findIndex(t => t.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTools = [...orderedTools];
    // Remove dragged item
    const [removed] = newTools.splice(draggedIndex, 1);
    // Insert at target index
    newTools.splice(targetIndex, 0, removed);

    setOrderedTools(newTools);
    localStorage.setItem('cortex_tools_order_v1', JSON.stringify(newTools.map(t => t.id)));
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Horizontal scroll handler
  const scrollRow = (categoryId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`row-${categoryId}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">Biblioteca de Ferramentas</h2>
          <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-primary/40" /> Utilitários clínicos organizados para sessões
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar ferramenta..."
            className="w-full h-11 bg-bg-card/60 backdrop-blur border border-border-subtle hover:border-border-subtle/80 focus:border-primary/50 text-text-main text-xs font-bold rounded-2xl pl-11 pr-4 outline-none transition-all placeholder:text-text-dim/60 shadow-inner"
          />
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 bg-bg-card/30 rounded-[2.5rem] border border-border-subtle border-dashed">
          <Search size={32} className="mx-auto text-text-dim mb-4 opacity-50" />
          <h4 className="text-sm font-bold text-text-main">Nenhuma ferramenta encontrada</h4>
          <p className="text-xs text-text-dim mt-2">Experimente buscar por outros termos ou categorias.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryTools = filteredTools.filter(t => t.category === category);
            // Unique ID for DOM lookup
            const categoryId = category.replace(/\s+/g, '-').toLowerCase();

            return (
              <div key={category} className="space-y-4 group/row relative">
                {/* Category Title */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {category}
                    <span className="text-[9px] text-text-dim/60 lowercase font-medium">({categoryTools.length} itens)</span>
                  </h3>
                </div>

                {/* Netflix Row Container */}
                <div className="relative w-full">
                  {/* Left Navigation Arrow */}
                  <button
                    onClick={() => scrollRow(categoryId, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 bg-bg-card/90 backdrop-blur border border-border-subtle/80 text-text-main rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 active:scale-95 hover:bg-primary hover:text-bg-deep shadow-xl z-25 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Right Navigation Arrow */}
                  <button
                    onClick={() => scrollRow(categoryId, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 bg-bg-card/90 backdrop-blur border border-border-subtle/80 text-text-main rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 active:scale-95 hover:bg-primary hover:text-bg-deep shadow-xl z-25 cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Horizontal Scroll Carousel */}
                  <div
                    id={`row-${categoryId}`}
                    className="flex gap-6 overflow-x-auto scroller-hide pb-4 pt-2 snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {categoryTools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = tool.status === 'active';
                      const isOpened = openWindows.includes(tool.id);
                      const isDragging = draggedId === tool.id;

                      return (
                        <div
                          key={tool.id}
                          draggable={isActive}
                          onDragStart={(e) => handleDragStart(e, tool.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, tool.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "bg-bg-card border rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group/card w-80 shrink-0 snap-start select-none",
                            isActive 
                              ? "border-border-subtle hover:border-primary/30 hover:scale-[1.03] shadow-md hover:shadow-primary/5 cursor-default" 
                              : "border-border-subtle/40 opacity-60",
                            isDragging && "opacity-30 border-primary/50 border-dashed"
                          )}
                        >
                          {/* Netflix-like subtle gradient header on active hover */}
                          {isActive && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none transition-opacity duration-300 opacity-40 group-hover/card:opacity-100" />
                          )}

                          <div className="space-y-4">
                            {/* Card Top: Category and Drag Handle */}
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border",
                                isActive 
                                  ? "bg-primary/5 text-primary border-primary/20" 
                                  : "bg-white/5 text-text-dim border-border-subtle/15"
                              )}>
                                {tool.category}
                              </span>

                              {/* Drag Handle Indicator */}
                              {isActive && (
                                <div 
                                  className="text-text-dim/30 group-hover/card:text-text-dim/80 hover:text-primary transition-colors p-1 cursor-grab active:cursor-grabbing"
                                  title="Arrastar para reordenar"
                                >
                                  <GripVertical size={14} />
                                </div>
                              )}

                              {!isActive && tool.status === 'soon' && (
                                <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-widest">
                                  Em breve
                                </span>
                              )}
                            </div>

                            {/* Card Title & Icon */}
                            <div className="flex items-center gap-3.5 pt-1">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                isActive 
                                  ? "bg-primary text-bg-deep shadow-inner" 
                                  : "bg-bg-sidebar border border-border-subtle/50 text-text-dim"
                              )}>
                                <Icon size={16} />
                              </div>
                              <h3 className={cn(
                                "text-sm font-bold tracking-tight truncate",
                                isActive ? "text-text-main group-hover/card:text-primary transition-colors" : "text-text-dim"
                              )}>
                                {tool.title}
                              </h3>
                            </div>

                            {/* Description */}
                            <p className="text-[10px] text-text-dim/85 leading-relaxed font-medium min-h-[48px] line-clamp-3">
                              {tool.description}
                            </p>
                          </div>

                          {/* Card Footer Action */}
                          <div className="pt-4 border-t border-border-subtle/30 mt-4 flex items-center justify-between shrink-0">
                            {isActive ? (
                              <>
                                <button
                                  onClick={() => onOpenTool(tool.id)}
                                  className={cn(
                                    "py-2.5 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm",
                                    isOpened
                                      ? "bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20"
                                      : "bg-primary hover:bg-primary-hover text-bg-deep active:scale-95 shadow-primary/5"
                                  )}
                                >
                                  <ExternalLink size={10} />
                                  {isOpened ? 'Foco' : 'Abrir'}
                                </button>
                                {isOpened && (
                                  <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 uppercase tracking-wider">
                                    <span className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                                    Ativa
                                  </span>
                                )}
                              </>
                            ) : (
                              <button
                                disabled
                                className="py-2.5 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] bg-bg-sidebar border border-border-subtle/50 text-text-dim/30 cursor-not-allowed"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
