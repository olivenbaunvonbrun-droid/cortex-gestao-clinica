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
  Activity,
  Pin,
  Zap,
  Heart,
  Award,
  Compass,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Smile
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
  pinnedTools?: string[];
  onTogglePin?: (toolId: string) => void;
}

const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 'tdah-ecosystem',
    title: 'Ecossistema TDAH Adulto',
    description: 'Diretório e protocolo clínico completo de avaliação diagnóstica de TDAH em adultos: Triagem (ASRS-18), Anamnese Retrospectiva (<12 anos), ETDAH-AD (69 itens), Prejuízos Funcionais (EPF-TDAH), Disfunções Executivas (BDEFS), Heterorrelato, Matriz Diferencial e Laudo Integrativo CFP.',
    icon: Brain,
    status: 'active',
    category: 'Áreas Especializadas de Avaliação',
  },
  {
    id: 'etdah-ad',
    title: 'ETDAH-AD (Benczik)',
    description: 'Escala de Transtorno do Déficit de Atenção/Hiperatividade em Adultos (69 itens) avaliando os 5 fatores normatizados para a população brasileira (Vetor Editora).',
    icon: Activity,
    status: 'active',
    category: 'Avaliação Psicológica',
  },
  {
    id: 'epf-tdah',
    title: 'EPF-TDAH (Prejuízos)',
    description: 'Escala de Prejuízos Funcionais do TDAH em 9 domínios (estudos, trabalho, afetivo, doméstico, financeiro, trânsito, etc.) para verificação do critério DSM-5 de múltiplos contextos.',
    icon: Layers,
    status: 'active',
    category: 'Avaliação Psicológica',
  },
  {
    id: 'bdefs-barkley',
    title: 'BDEFS (Barkley)',
    description: 'Escala de Avaliação de Disfunção Executiva de Barkley (89 itens) com cálculo automatizado do Índice FE-TDAH (11 itens-chave) e escores por seção.',
    icon: Sparkles,
    status: 'active',
    category: 'Avaliação Psicológica',
  },
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
  },
  {
    id: 'tdah-asrs18',
    title: 'TDAH ASRS-18',
    description: 'Escala de Autoavaliação de TDAH em Adultos (ASRS-18 - OMS) com cálculo de desatenção, hiperatividade/impulsividade e emissão de laudo neuropsicológico via IA.',
    icon: Zap,
    status: 'active',
    category: 'Avaliação Psicológica',
  },
  {
    id: 'biblioteca-avaliacao',
    title: 'Biblioteca de Avaliação',
    description: 'Plataforma integrada de avaliação e testes psicológicos (PsicoMetrik), contendo múltiplos instrumentos, escalas e inventários clínicos.',
    icon: BookOpen,
    status: 'active',
    category: 'Avaliação Psicológica',
  },
  {
    id: 'hp-autoconhecimento',
    title: 'HP 1: Autoconhecimento',
    description: 'Treino de metacognição, identificação de gatilhos somáticos corporais, mapeamento de valores vitais e observação de modos esquemáticos.',
    icon: Brain,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-autorregulacao',
    title: 'HP 2: Autorregulação Emocional',
    description: 'Protocolo interativo 4-7-8, termômetro de ativação fisiológica, tolerância ao mal-estar e aplicação guiada do A.C.A.L.M.E.-S.E.',
    icon: Heart,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-raciocinio-otimista',
    title: 'HP 3: Raciocínio Realisticamente Otimista',
    description: 'Matriz factual de evidências a favor e contra, formulação de alternativas realistas, torta de responsabilidade e descatastrofização.',
    icon: TrendingUp,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-autoestima',
    title: 'HP 4: Autoestima',
    description: 'Diário de autoelogios e méritos, autocompaixão de Kristin Neff, forças de caráter e desarmamento do crítico interno punitivo.',
    icon: Award,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-resolutividade',
    title: 'HP 5: Resolutividade e Enfrentamento',
    description: 'Matriz de decisão prós/contras ponderada, roteirização de micro-passos factíveis e hierarquia de exposição gradual.',
    icon: Compass,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-autocontrole',
    title: 'HP 6: Autocontrole',
    description: 'Cronômetro guiado de Urge Surfing (Surfando na Onda do Impulso), gestão de estímulos ambientais e adiamento da gratificação.',
    icon: ShieldAlert,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-sociabilidade',
    title: 'HP 7: Sociabilidade',
    description: 'Comunicação Não-Violenta (CNV em 4 passos), assertividade com técnica do Disco Riscado e quebra-gelo interpessoal.',
    icon: Users,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-imunidade-social',
    title: 'HP 8: Imunidade Social',
    description: 'Laboratório do NÃO assertivo sem desculpas, técnica do Nevoeiro (Fogging) para críticas e blindagem de limites.',
    icon: ShieldCheck,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-sensibilidade-social',
    title: 'HP 9: Sensibilidade Social',
    description: 'Laboratório de escuta ativa, paráfrase empática, decodificação de pistas não-verbais e validação emocional.',
    icon: Eye,
    status: 'active',
    category: 'Treino de HPs (THP)',
  },
  {
    id: 'hp-hedonismo',
    title: 'HP 10: Hedonismo Responsável',
    description: 'Programador semanal de reforçadores naturais, diário de Savoring (desfrute consciente) e balanço dever versus prazer.',
    icon: Smile,
    status: 'active',
    category: 'Treino de HPs (THP)',
  }
];

export default function ToolsLibrary({ onOpenTool, openWindows, pinnedTools = [], onTogglePin }: ToolsLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderedTools, setOrderedTools] = useState<ToolItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Load from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem('cortex_tools_order_v1');
    if (saved) {
      try {
        const parsedIds = JSON.parse(saved) as string[];
        const mapped = parsedIds
          .map(id => DEFAULT_TOOLS.find(t => t.id === id))
          .filter((t): t is ToolItem => !!t);
        
        // Priority tools that should be highlighted at the front if missing from previous saved order
        const priorityTools = ['tdah-ecosystem', 'etdah-ad', 'epf-tdah', 'bdefs-barkley'];
        const missing = DEFAULT_TOOLS.filter(t => !parsedIds.includes(t.id));
        const priorityMissing = missing.filter(t => priorityTools.includes(t.id));
        const otherMissing = missing.filter(t => !priorityTools.includes(t.id));

        setOrderedTools([...priorityMissing, ...mapped, ...otherMissing]);
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

  const [libraryTab, setLibraryTab] = useState<'all' | 'disorders'>('all');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header, Tab Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">CORTEX TOOLS</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black uppercase tracking-wider">
              Áreas Especializadas Ativas
            </span>
          </div>
          <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">Biblioteca de Ferramentas & Diretórios</h2>
          <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-primary/40" /> Utilitários clínicos e ecossistemas especializados de avaliação
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar ferramentas ou escalas..."
            className="w-full h-11 bg-bg-card/60 backdrop-blur border border-border-subtle hover:border-border-subtle/80 focus:border-primary/50 text-text-main text-xs font-bold rounded-2xl pl-11 pr-4 outline-none transition-all placeholder:text-text-dim/60 shadow-inner"
          />
        </div>
      </div>

      {/* Directory Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setLibraryTab('all')}
          className={cn(
            "flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
            libraryTab === 'all'
              ? "bg-primary text-bg-deep shadow-md font-black"
              : "bg-white/[0.02] text-text-dim hover:text-text-main hover:bg-white/[0.05] border border-white/[0.06]"
          )}
        >
          <Layers size={14} />
          Todas as Ferramentas ({DEFAULT_TOOLS.length})
        </button>

        <button
          onClick={() => setLibraryTab('disorders')}
          className={cn(
            "flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border",
            libraryTab === 'disorders'
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black"
              : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
          )}
        >
          <Brain size={14} />
          Áreas Especializadas de Transtornos
          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-400 text-slate-950">
            NOVO: TDAH
          </span>
        </button>
      </div>

      {/* HERO BANNER: Ecossistema de Avaliação de TDAH em Adultos (Sempre visível ou no topo) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-amber-500/15 via-bg-card to-indigo-500/10 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 shadow-sm">
                Diretório Especializado
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Brain size={13} /> TDAH em Adultos • Protocolo CFP / SATEPSI / DSM-5-TR
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-black text-text-main tracking-tight uppercase">
              Ecossistema de Avaliação Especializada: TDAH em Adultos
            </h3>

            <p className="text-xs text-text-dim leading-relaxed">
              Diretório clínico completo estruturado na ordem do processo avaliativo: 
              <strong> 1. Triagem (ASRS-18)</strong> • 
              <strong> 2. Anamnese Retrospectiva (&lt;12 anos)</strong> • 
              <strong> 3. ETDAH-AD (69 itens)</strong> • 
              <strong> 4. Prejuízos Funcionais (EPF-TDAH)</strong> • 
              <strong> 5. Funções Executivas (BDEFS)</strong> • 
              <strong> 6. Heterorrelato</strong> • 
              <strong> 7. Diagnósticos Diferenciais</strong> • 
              <strong> 8. Laudo Psicológico Integrativo (CFP nº 06/2019)</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-text-dim">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">8 Etapas Clínicas</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">3 Escalas Normatizadas</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Integrado ao Prontuário</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => onOpenTool('tdah-ecosystem')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/15 active:scale-95 cursor-pointer"
            >
              <ExternalLink size={14} /> Abrir Ecossistema TDAH
            </button>
            <button
              onClick={() => setLibraryTab(libraryTab === 'disorders' ? 'all' : 'disorders')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-text-main text-xs font-bold uppercase tracking-wider rounded-2xl border border-white/10 transition-all cursor-pointer"
            >
              {libraryTab === 'disorders' ? 'Ver Ferramentas Gerais' : 'Explorar Área de TDAH'}
            </button>
          </div>
        </div>
      </div>

      {/* DISORDERS DIRECTORY VIEW */}
      {libraryTab === 'disorders' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-text-main flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              Diretório de Avaliação de TDAH em Adultos: Ferramentas da Bateria
            </h3>
            <p className="text-xs text-text-dim">
              Acesse os instrumentos e etapas individualmente ou através do fluxo central do ecossistema:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'tdah-asrs18',
                step: 'Etapa 1',
                title: 'ASRS-18 (OMS)',
                type: 'Triagem / Screening',
                desc: 'Rastreio inicial sintomatológico dos últimos 6 meses com cálculo de Parte A e Parte B.',
                badge: 'Triagem Inicial',
                color: 'amber'
              },
              {
                id: 'tdah-ecosystem',
                step: 'Etapa 2',
                title: 'Anamnese Retrospectiva',
                type: 'Investigação Clínica',
                desc: 'Resgate de marcos motores, boletins escolares, queixas de professores e histórico familiar antes dos 12 anos.',
                badge: 'DSM-5 Critério B',
                color: 'blue'
              },
              {
                id: 'etdah-ad',
                step: 'Etapa 3',
                title: 'ETDAH-AD (Benczik)',
                type: 'Escala Psicométrica',
                desc: '69 itens avaliando Desatenção, Impulsividade, Aspectos Emocionais, Autorregulação e Hiperatividade.',
                badge: 'Vetor Editora',
                color: 'emerald'
              },
              {
                id: 'epf-tdah',
                step: 'Etapa 4',
                title: 'EPF-TDAH',
                type: 'Prejuízos Funcionais',
                desc: '58 itens em 9 domínios da vida (acadêmico, trabalho, afetivo, doméstico, financeiro, trânsito).',
                badge: 'DSM-5 Critério C',
                color: 'purple'
              },
              {
                id: 'bdefs-barkley',
                step: 'Etapa 5',
                title: 'BDEFS (Barkley)',
                type: 'Funções Executivas',
                desc: '89 itens e cálculo do Índice FE-TDAH de Barkley (11 itens-chave) no cotidiano.',
                badge: 'Hogrefe',
                color: 'sky'
              },
              {
                id: 'tdah-ecosystem',
                step: 'Etapa 6',
                title: 'Heterorrelato com Terceiros',
                type: 'Validação Externa',
                desc: 'Entrevista estruturada com cônjuge, pais ou irmãos para triangulação diagnóstica.',
                badge: 'Triangulação',
                color: 'indigo'
              },
              {
                id: 'tdah-ecosystem',
                step: 'Etapa 7',
                title: 'Matriz Diferencial & Temporal',
                type: 'Diferenciais & Comorbidades',
                desc: 'Mapeamento de TAG, Depressão, Burnout, Transtornos do Sono e análise de flutuação.',
                badge: 'DSM-5 Critério E',
                color: 'rose'
              },
              {
                id: 'tdah-ecosystem',
                step: 'Etapa 8',
                title: 'Laudo Psicológico Integrativo',
                type: 'Síntese & Parecer',
                desc: 'Redação assistida por IA conforme Resolução CFP nº 06/2019 e encaminhamentos médicos.',
                badge: 'CFP 06/2019',
                color: 'amber'
              }
            ].map(item => (
              <div 
                key={`${item.id}-${item.step}`}
                onClick={() => onOpenTool(item.id)}
                className="bg-bg-card border border-border-subtle hover:border-amber-400/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.step}
                    </span>
                    <span className="text-[8px] font-black uppercase text-text-dim bg-white/5 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>

                  <h4 className="text-xs font-black uppercase tracking-wider text-text-main group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[9px] font-bold text-text-dim block mb-2">{item.type}</span>

                  <p className="text-[11px] text-text-dim leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle mt-4 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Acessar Ferramenta <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Próximos Transtornos do Ecossistema */}
          <div className="pt-6 border-t border-border-subtle">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-dim mb-3">
              Próximas Áreas Especializadas em Expansão
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-bg-card/40 border border-dashed border-border-subtle opacity-60">
                <span className="text-[8px] font-black uppercase text-amber-400">Em Desenvolvimento</span>
                <h5 className="text-xs font-bold text-text-main mt-0.5">TEA em Adultos (Espectro Autista)</h5>
                <p className="text-[10px] text-text-dim mt-1">AQ-50, RAADS-R, CAT-Q (Camuflagem social) e perfil sensorial.</p>
              </div>
              <div className="p-4 rounded-xl bg-bg-card/40 border border-dashed border-border-subtle opacity-60">
                <span className="text-[8px] font-black uppercase text-amber-400">Em Desenvolvimento</span>
                <h5 className="text-xs font-bold text-text-main mt-0.5">Transtorno Bipolar & Ciclotimia</h5>
                <p className="text-[10px] text-text-dim mt-1">MDQ, BSDS e rastreio de episódios afetivos ao longo do desenvolvimento.</p>
              </div>
              <div className="p-4 rounded-xl bg-bg-card/40 border border-dashed border-border-subtle opacity-60">
                <span className="text-[8px] font-black uppercase text-amber-400">Em Desenvolvimento</span>
                <h5 className="text-xs font-bold text-text-main mt-0.5">TOC & Espectro Obsessivo</h5>
                <p className="text-[10px] text-text-dim mt-1">Y-BOCS e inventário de neutralizações e rituais cognitivos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL TOOLS VIEW */}
      {libraryTab === 'all' && (
        <>
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
                                <div className="flex items-center gap-2">
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
                                  <button
                                    onClick={() => onTogglePin?.(tool.id)}
                                    className={cn(
                                      "p-2.5 rounded-xl border transition-all cursor-pointer",
                                      pinnedTools?.includes(tool.id)
                                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                                        : "bg-bg-sidebar border-border-subtle/50 text-text-dim hover:text-text-main hover:border-border-subtle"
                                    )}
                                    title={pinnedTools?.includes(tool.id) ? "Desafixar da Barra de Tarefas" : "Fixar na Barra de Tarefas"}
                                  >
                                    <Pin size={10} className={cn(pinnedTools?.includes(tool.id) && "fill-primary")} />
                                  </button>
                                </div>
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
        </>
      )}
    </div>
  );
}
