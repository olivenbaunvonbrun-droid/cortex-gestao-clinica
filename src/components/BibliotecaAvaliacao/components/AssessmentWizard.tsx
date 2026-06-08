import React, { useState, useEffect, useRef } from "react";
import { Tool, Report, PatientInfo, PmeState } from "../types";
import { IDAI_QUESTIONS, EFCA_QUESTIONS } from "../data";
import { renderMarkdown } from "../utils/markdown";
import MultidimSatisfactionView from "./MultidimSatisfactionView";
import RadarMultidimensionalView from "./RadarMultidimensionalView";
import RadarHabilidadesPsicologicasView, { HAP_SUBSCALE_METADATA } from "./RadarHabilidadesPsicologicasView";
import ExameAtributosParentaisView, { ParentCaregiver } from "./ExameAtributosParentaisView";
import ExameEvidenciasCognicaoView, { CognitiveEvidenceState } from "./ExameEvidenciasCognicaoView";
import ReestruturacaoSemanticaView, { SemanticRestructuringState } from "./ReestruturacaoSemanticaView";
import ExameDesenvolvimentoAutoestimaView, { SelfEsteemState } from "./ExameDesenvolvimentoAutoestimaView";
import CartaoEnfrentamentoView, { CopingCardsState } from "./CartaoEnfrentamentoView";
import DespolarizacaoAlternativasView, { DespolarizacaoState } from "./DespolarizacaoAlternativasView";
import EspectroCognitivoView, { EspectroCognitivoState } from "./EspectroCognitivoView";
import RidInteracoesView, { RidInteracoesState } from "./RidInteracoesView";
import TransicaoMecanismoView, { TransicaoMecanismoState } from "./TransicaoMecanismoView";
import ExameDuploVantagensView, { ExameDuploVantagensState } from "./ExameDuploVantagensView";
import ExameFeedbacksEntrevistaView, { ExameFeedbacksEntrevistaState } from "./ExameFeedbacksEntrevistaView";
import ExameAtributosPessoaisView, { ExameAtributosPessoaisState } from "./ExameAtributosPessoaisView";
import ExameSingularesCompartilhadasView, { ExameSingularesCompartilhadasState } from "./ExameSingularesCompartilhadasView";
import ExameProvisaoEmocionalView, { ExameProvisaoEmocionalState } from "./ExameProvisaoEmocionalView";
import ExameAtitudesDimensoesView, { ExameAtitudesDimensoesState } from "./ExameAtitudesDimensoesView";
import ExameReacoesSociaisView, { ExameReacoesSociaisState, LIST_SOCIAL_REACTIONS } from "./ExameReacoesSociaisView";
import ExameHierarquiaExposicaoEnfrentamentoView, { ExameHierarquiaExposicaoState } from "./ExameHierarquiaExposicaoEnfrentamentoView";
import ExameModelosPessoaisView, { ExameModelosPessoaisState } from "./ExameModelosPessoaisView";
import ExameMentalidadesSaudaveisView, { ExameMentalidadesSaudaveisState } from "./ExameMentalidadesSaudaveisView";
import PdpMonitoringView from "./PdpMonitoringView";
import PmeMonitoringView from "./PmeMonitoringView";
import { ClinicalSuggestionsSidebar, ClinicalSuggestionsButton } from "./ClinicalSuggestionsHelper";
import { generatePsicometrikReport } from "../../../services/geminiService";
import { 
  ArrowLeft, BrainCircuit, Watch, Activity, User, Clipboard, 
  Sparkles, ShieldAlert, Cpu, Check, Play, Timer, CheckCircle, 
  RotateCcw, Sliders, ChevronRight, Save, Printer, Download,
  Users, Trash2, Plus, MessageSquare, AlertTriangle, HelpCircle,
  Lightbulb, CheckSquare, ArrowRight, Minus, Square, Minimize2, Maximize2, X
} from "lucide-react";

interface AssessmentWizardProps {
  key?: string;
  tool: Tool;
  onClose: () => void;
  onSaveReport: (report: Report) => void;
  prefilledPatient?: PatientInfo | null;
  windowId?: string;
  isMinimized?: boolean;
  isMaximized?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  onFocus?: () => void;
  onUpdatePosition?: (x: number, y: number) => void;
  onUpdateSize?: (width: number, height: number, x?: number, y?: number) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}


export const SUBSCALE_METADATA: Array<{
  id: string;
  label: string;
  group: 'pessoal' | 'interpessoal' | 'ocupacional' | 'material' | 'recreativa' | 'existencial';
  groupLabel: string;
  colorClass: string;
  fillColorActive: string;
  fillColorEmpty: string;
}> = [
  // PESSOAL
  { id: "valor_pessoal", label: "Valor Pessoal", group: "pessoal", groupLabel: "Pessoal", colorClass: "text-[#00A3FF]", fillColorActive: "rgba(0, 163, 255, 0.75)", fillColorEmpty: "rgba(0, 163, 255, 0.08)" },
  { id: "saude", label: "Saúde", group: "pessoal", groupLabel: "Pessoal", colorClass: "text-[#00A3FF]", fillColorActive: "rgba(0, 163, 255, 0.75)", fillColorEmpty: "rgba(0, 163, 255, 0.08)" },
  { id: "autocuidado", label: "Autocuidado", group: "pessoal", groupLabel: "Pessoal", colorClass: "text-[#00A3FF]", fillColorActive: "rgba(0, 163, 255, 0.75)", fillColorEmpty: "rgba(0, 163, 255, 0.08)" },
  // INTERPESSOAL
  { id: "amizade", label: "Amizade", group: "interpessoal", groupLabel: "Interpessoal", colorClass: "text-indigo-400", fillColorActive: "rgba(129, 140, 248, 0.75)", fillColorEmpty: "rgba(129, 140, 248, 0.08)" },
  { id: "familia", label: "Família", group: "interpessoal", groupLabel: "Interpessoal", colorClass: "text-indigo-400", fillColorActive: "rgba(129, 140, 248, 0.75)", fillColorEmpty: "rgba(129, 140, 248, 0.08)" },
  { id: "intimidade", label: "Intimidade", group: "interpessoal", groupLabel: "Interpessoal", colorClass: "text-indigo-400", fillColorActive: "rgba(129, 140, 248, 0.75)", fillColorEmpty: "rgba(129, 140, 248, 0.08)" },
  // OCUPACIONAL
  { id: "estudo", label: "Estudo", group: "ocupacional", groupLabel: "Ocupacional", colorClass: "text-purple-400", fillColorActive: "rgba(192, 132, 252, 0.75)", fillColorEmpty: "rgba(192, 132, 252, 0.08)" },
  { id: "trabalho", label: "Trabalho", group: "ocupacional", groupLabel: "Ocupacional", colorClass: "text-purple-400", fillColorActive: "rgba(192, 132, 252, 0.75)", fillColorEmpty: "rgba(192, 132, 252, 0.08)" },
  { id: "conquistas", label: "Conquistas", group: "ocupacional", groupLabel: "Ocupacional", colorClass: "text-purple-400", fillColorActive: "rgba(192, 132, 252, 0.75)", fillColorEmpty: "rgba(192, 132, 252, 0.08)" },
  // MATERIAL
  { id: "indep_financ", label: "Independência Financeira", group: "material", groupLabel: "Material", colorClass: "text-emerald-400", fillColorActive: "rgba(52, 211, 153, 0.75)", fillColorEmpty: "rgba(52, 211, 153, 0.08)" },
  { id: "patrimonio", label: "Patrimônio", group: "material", groupLabel: "Material", colorClass: "text-emerald-400", fillColorActive: "rgba(52, 211, 153, 0.75)", fillColorEmpty: "rgba(52, 211, 153, 0.08)" },
  { id: "qualidade_vida", label: "Qualidade de Vida", group: "material", groupLabel: "Material", colorClass: "text-emerald-400", fillColorActive: "rgba(52, 211, 153, 0.75)", fillColorEmpty: "rgba(52, 211, 153, 0.08)" },
  // RECREATIVA
  { id: "lazer", label: "Lazer", group: "recreativa", groupLabel: "Recreativa", colorClass: "text-amber-400", fillColorActive: "rgba(251, 191, 36, 0.75)", fillColorEmpty: "rgba(251, 191, 36, 0.08)" },
  { id: "hobbies", label: "Hobbies", group: "recreativa", groupLabel: "Recreativa", colorClass: "text-amber-400", fillColorActive: "rgba(251, 191, 36, 0.75)", fillColorEmpty: "rgba(251, 191, 36, 0.08)" },
  { id: "passatempo", label: "Passatempo", group: "recreativa", groupLabel: "Recreativa", colorClass: "text-amber-400", fillColorActive: "rgba(251, 191, 36, 0.75)", fillColorEmpty: "rgba(251, 191, 36, 0.08)" },
  // EXISTENCIAL
  { id: "metas_vida", label: "Metas de Vida", group: "existencial", groupLabel: "Existencial", colorClass: "text-rose-400", fillColorActive: "rgba(251, 113, 133, 0.75)", fillColorEmpty: "rgba(251, 113, 133, 0.08)" },
  { id: "espiritualidade", label: "Espiritualidade", group: "existencial", groupLabel: "Existencial", colorClass: "text-rose-400", fillColorActive: "rgba(251, 113, 133, 0.75)", fillColorEmpty: "rgba(251, 113, 133, 0.08)" },
  { id: "ativismo_ideol", label: "Ativismo Ideológico", group: "existencial", groupLabel: "Existencial", colorClass: "text-rose-400", fillColorActive: "rgba(251, 113, 133, 0.75)", fillColorEmpty: "rgba(251, 113, 133, 0.08)" }
];

export function getRadarArcPath(cx: number, cy: number, r_in: number, r_out: number, startAngleDeg: number, endAngleDeg: number) {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const x1_in = cx + r_in * Math.cos(startRad);
  const y1_in = cy + r_in * Math.sin(startRad);
  const x1_out = cx + r_out * Math.cos(startRad);
  const y1_out = cy + r_out * Math.sin(startRad);
  
  const x2_in = cx + r_in * Math.cos(endRad);
  const y2_in = cy + r_in * Math.sin(endRad);
  const x2_out = cx + r_out * Math.cos(endRad);
  const y2_out = cy + r_out * Math.sin(endRad);

  const largeArcFlag = Math.abs(endAngleDeg - startAngleDeg) > 180 ? 1 : 0;
  
  return `M ${x1_in} ${y1_in} L ${x1_out} ${y1_out} A ${r_out} ${r_out} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${r_in} ${r_in} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in} Z`;
}

export default function AssessmentWizard({ 
  tool, 
  onClose, 
  onSaveReport,
  prefilledPatient,
  windowId,
  isMinimized = false,
  isMaximized = false,
  x = 0,
  y = 0,
  width = 850,
  height = 600,
  zIndex = 10,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  onMinimize,
  onMaximize
}: AssessmentWizardProps) {
  // Wizard Steps: 'patient' | 'evaluation' | 'results' | 'report'
  const [step, setStep] = useState<'patient' | 'evaluation' | 'results' | 'report'>('patient');

  // Dragging event handlers for the title bar
  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea')) {
      return;
    }
    
    if (onFocus) onFocus();
    if (isMaximized) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = x;
    const initialY = y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 100, initialX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, initialY + deltaY));
      
      if (onUpdatePosition) {
        onUpdatePosition(newX, newY);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Resizing event handlers
  const startResize = (e: React.MouseEvent, direction: 'e' | 's' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onFocus) onFocus();
    if (isMaximized) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = width;
    const initialHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;

      if (direction === 'e' || direction === 'se') {
        newWidth = Math.max(480, Math.min(window.innerWidth - 40, initialWidth + deltaX));
      }
      if (direction === 's' || direction === 'se') {
        newHeight = Math.max(400, Math.min(window.innerHeight - 100, initialHeight + deltaY));
      }

      if (onUpdateSize) {
        onUpdateSize(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Patient Info State
  const [patient, setPatient] = useState<PatientInfo>(() => {
    if (prefilledPatient) {
      return prefilledPatient;
    }
    return {
      name: "",
      age: 30,
      gender: "Masculino",
      clinicalContext: ""
    };
  });

  useEffect(() => {
    if (prefilledPatient) {
      setPatient(prefilledPatient);
    }
  }, [prefilledPatient]);

  // Questionnaire scores state
  const [idaiAnswers, setIdaiAnswers] = useState<Record<string, number>>({});
  const [efcaAnswers, setEfcaAnswers] = useState<Record<string, number>>({});

  // States for Avaliação Central (Mapeamento Clínico)
  const [disfunctionalSituations, setDisfunctionalSituations] = useState([
    { situacao: "", data: "", gravidade: 5 },
    { situacao: "", data: "", gravidade: 5 },
    { situacao: "", data: "", gravidade: 5 }
  ]);
  const [signatureStrengths, setSignatureStrengths] = useState([
    { forca: "", utilidade: 5 },
    { forca: "", utilidade: 5 },
    { forca: "", utilidade: 5 },
    { forca: "", utilidade: 5 },
    { forca: "", utilidade: 5 }
  ]);
  const [maladaptiveSchemes, setMaladaptiveSchemes] = useState([
    { esquema: "", necessidade: "", ativacao: 5 },
    { esquema: "", necessidade: "", ativacao: 5 },
    { esquema: "", necessidade: "", ativacao: 5 },
    { esquema: "", necessidade: "", ativacao: 5 },
    { esquema: "", necessidade: "", ativacao: 5 }
  ]);
  const [psychologicalSkills, setPsychologicalSkills] = useState([
    { hp: "", valores: "", dominio: 5 },
    { hp: "", valores: "", dominio: 5 },
    { hp: "", valores: "", dominio: 5 },
    { hp: "", valores: "", dominio: 5 },
    { hp: "", valores: "", dominio: 5 }
  ]);
  const [curativeSituations, setCurativeSituations] = useState([
    { situacao: "", data: "", consolidacao: 5 },
    { situacao: "", data: "", consolidacao: 5 },
    { situacao: "", data: "", consolidacao: 5 }
  ]);
  const [activeSegment, setActiveSegment] = useState<'dys' | 'str' | 'sch' | 'ski' | 'cur'>('dys');

  // States for Genealogia dos Atributos Pessoais
  const [genealogyData, setGenealogyData] = useState<Record<string, { forcas: string; fraquezas: string }>>({
    avoPaterno: { forcas: "", fraquezas: "" },
    avoPaterna: { forcas: "", fraquezas: "" },
    avoMaterno: { forcas: "", fraquezas: "" },
    avoMaterna: { forcas: "", fraquezas: "" },
    pai: { forcas: "", fraquezas: "" },
    mae: { forcas: "", fraquezas: "" },
    eu: { forcas: "", fraquezas: "" }
  });

  // State for Linha da Vida (Life Line tool)
  const [lifeLineEvents, setLifeLineEvents] = useState<Array<{ id: string; age: string; type: 'positive' | 'negative' | ''; description: string }>>([
    { id: "1", age: "7", type: "positive", description: "Primeiro reconhecimento escolar e sentimentos de competência." },
    { id: "2", age: "12", type: "negative", description: "Mudança drástica de ambiente e sentimento de isolamento residual." },
    { id: "3", age: "16", type: "positive", description: "Início em práticas esportivas coletivas e superação de fobia social." },
    { id: "4", age: "19", type: "negative", description: "Reprovação em teste crucial gerando questionamentos de incapacidade." },
    { id: "5", age: "22", type: "positive", description: "Conquista da primeira alocação profissional e sensação de autoeficácia ativa." }
  ]);

  // State for Multidimensional Satisfaction Assessment
  const [multidimSatisfaction, setMultidimSatisfaction] = useState<Record<string, { satisfaction: number; desfrute: string; pendente: string }>>({
    pessoal: {
      satisfaction: 7,
      desfrute: "Prática regular de exercícios leves duas vezes por semana, autocuidado básico em dia.",
      pendente: "Melhorar a qualidade e regularidade do sono, estabelecer alimentação mais equilibrada."
    },
    interpessoal: {
      satisfaction: 6,
      desfrute: "Amigos de longa data confiáveis e contatos familiares amigáveis.",
      pendente: "Aumentar a frequência de encontros presenciais, estabelecer limites saudáveis nas relações estressantes."
    },
    ocupacional: {
      satisfaction: 5,
      desfrute: "Trabalho estável, reconhecimento técnico pontual pelas minhas entregas.",
      pendente: "Buscar alocação em projetos de maior criatividade, planejar transição para cargo de liderança."
    },
    material: {
      satisfaction: 6,
      desfrute: "Possuo renda suficiente para as contas essenciais e padrão de vida modesto.",
      pendente: "Criar uma reserva de emergência sólida e planejar aquisição de veículo próprio."
    },
    recreativa: {
      satisfaction: 4,
      desfrute: "Algumas horas de lazer assistindo a séries ou filmes no fim de semana.",
      pendente: "Retomar hobbies antigos como pintura ou leitura recreativa, planejar uma viagem de férias."
    },
    existencial: {
      satisfaction: 6,
      desfrute: "Sentimento geral de que minhas ações têm valor ético e ajudam os outros.",
      pendente: "Alinhar rotina diária aos meus valores de longo prazo, iniciar prática meditativa guiada."
    }
  });

  // State for Radar Multidimensional (18 subscales)
  const [radarSubscales, setRadarSubscales] = useState<Record<string, number>>({
    valor_pessoal: 7, saude: 8, autocuidado: 6,
    amizade: 6, familia: 7, intimidade: 5,
    estudo: 5, trabalho: 6, conquistas: 4,
    indep_financ: 6, patrimonio: 5, qualidade_vida: 7,
    lazer: 4, hobbies: 5, passatempo: 3,
    metas_vida: 6, espiritualidade: 7, ativismo_ideol: 5
  });

  // State for Radar de Habilidades Psicológicas (10 skills)
  const [skillsRadarSubscales, setSkillsRadarSubscales] = useState<Record<string, number>>({
    autoconhecimento: 7,
    autoestima: 6,
    racionalidade: 5,
    regulacao_emocional: 4,
    enfrentamento: 6,
    imunidade_social: 5,
    autocontrole: 5,
    sociabilidade: 7,
    sensibilidade: 8,
    hedonismo: 6
  });

  // State for Exame dos Atributos Parentais
  const [parentalCaregivers, setParentalCaregivers] = useState<ParentCaregiver[]>([
    {
      id: "mae_g",
      name: "Mãe (Maternal)",
      relationship: "Mãe",
      selectedAttributes: ["atenciosos", "cuidadores", "protetores", "autoritarios", "exigentes", "criticos"],
      notes: "Cuidou de forma primária na infância. Cobrava muito o desempenho escolar."
    },
    {
      id: "pai_g",
      name: "Pai (Paternal)",
      relationship: "Pai",
      selectedAttributes: ["provedores", "distantes", "indisponiveis", "passivos"],
      notes: "Trabalhava a maior parte do tempo. Era muito distante emocionalmente."
    }
  ]);

  // State for Exame de Evidências da Cognição
  const [cognitiveEvidence, setCognitiveEvidence] = useState<CognitiveEvidenceState>({
    belief: "Não serei capaz de aprender e lidar com os novos desafios deste cargo técnico complexo.",
    initialBeliefPercentage: 90,
    currentBeliefPercentage: 45,
    evidenceFor: [
      "Fiquei travado por 5 minutos tentando configurar as configurações do servidor ontem.",
      "Nunca trabalhei de forma totalmente autônoma em projetos desse porte antes."
    ],
    evidenceAgainst: [
      "Fui contratado justamente pelas minhas competências e avaliações no processo seletivo.",
      "Já configurei ambientes parecidos no meu projeto anterior em duas ocasiões.",
      "Posso consultar toda a documentação, fóruns ou perguntar a colegas seniores quando tiver dificuldades pontuais."
    ],
    alternativeThoughts: [
      {
        id: "alt_default_1",
        text: "Embora o início em um cargo de alta complexidade traga desafios e dúvidas reais, possuo a base necessária e os recursos para aprender ativamente e tirar dúvidas.",
        beliefPercentage: 75
      }
    ],
    balancedConclusion: "A análise factual demonstra que minha hipótese de fracasso absoluto origina-se do medo seletivo ao noviciado técnico, ignorando totalmente meu histórico prévio de conquistas de ambientes similares e minhas defesas de busca de ajuda."
  });

  // State for Reestruturação Semântica
  const [semanticRestructuring, setSemanticRestructuring] = useState<SemanticRestructuringState>({
    term: "Ser Racional",
    synonyms: [
      { id: "syn_def_1", text: "Ser frio e insensível", isDesadaptative: true, explanation: "Fusão de racionalidade com alexitimia ou apatia. Ser racional de fato envolve aceitar e regular as emoções, não fingir que elas não existem." },
      { id: "syn_def_2", text: "Ser calculista e obsessivo", isDesadaptative: true, explanation: "" },
      { id: "syn_def_3", text: "Agir matematicamente sob dados frios", isDesadaptative: false, explanation: "" }
    ],
    antonyms: [
      { id: "ant_def_1", text: "Ser emocional / Dramático", isDesadaptative: true, explanation: "Dicotomização inadequada. Emoções são dados biológicos e informativos, perfeitamente integráveis com a razão." },
      { id: "ant_def_2", text: "Pessoa espontânea e leve", isDesadaptative: false, explanation: "" }
    ],
    socraticQuestions: [
      { question: "O que significa ser 'racional' de acordo com as circunstâncias reais da vida?", answer: "Significa ponderar as consequências práticas de cada escolha usando a razão, o que paradoxalmente exige sensibilidade e flexibilidade, não frieza cega." }
    ],
    healthyDefinition: "Racionalidade salutar significa possuir a capacidade de observar pensamentos e sentimentos à luz das circunstâncias práticas e fatos históricos reais, optando por comportamentos flexíveis que aproximem o indivíduo de seus valores vitais."
  });

  // State for Exame e Desenvolvimento da Autoestima
  const [selfEsteem, setSelfEsteem] = useState<SelfEsteemState>({
    dimensions: [
      {
        id: "aparencia",
        title: "Aparência Física e Estética",
        description: "Percepção corporal, cuidados diários, expressão visual e conforto com a própria imagem física.",
        satisfaction: 6,
        currentAttributes: [
          { id: "ap_init_1", text: "Tenho exames de saúde estáveis e boa funcionalidade física" },
          { id: "ap_init_2", text: "Gosto do meu estilo de corte de cabelo e vestimenta" }
        ],
        developGoals: [
          { id: "ap_init_g1", text: "Manter rotina de skincare simplificada e uso regular de filtro solar" }
        ],
        relatedHPs: ["Autoaceitação", "Autocuidado"]
      },
      {
        id: "competencias",
        title: "Competências",
        description: "Habilidades técnicas, conquistas intelectuais, talentos, capacidade de resolução e aprendizado.",
        satisfaction: 5,
        currentAttributes: [
          { id: "cp_init_1", text: "Excelente habilidade para estruturar relatórios técnicos coerentes" }
        ],
        developGoals: [
          { id: "cp_init_g1", text: "Estudar conceitos de inteligência analítica aplicados aos meus projetos" }
        ],
        relatedHPs: ["Autoconfiança", "Resolutividade de Problemas"]
      },
      {
        id: "interpessoal",
        title: "Estilo Interpessoal",
        description: "Relacionamentos, conexões com amigos e familiares, e assertividade de comunicação.",
        satisfaction: 7,
        currentAttributes: [
          { id: "int_init_1", text: "Consigo escutar meus amigos próximos de forma sensível e acolhedora" }
        ],
        developGoals: [
          { id: "int_init_g1", text: "Expressar meus limites pessoais sem excesso de justificativas ou culpa" }
        ],
        relatedHPs: ["Assertividade Social", "Comunicação Não-Violenta"]
      },
      {
        id: "autonomia",
        title: "Autonomia",
        description: "Independência de decisões, capacidade de tolerar desaprovação alheia e autogestão.",
        satisfaction: 4,
        currentAttributes: [
          { id: "aut_init_1", text: "Consigo organizar meu tempo de estudo por iniciativa própria" }
        ],
        developGoals: [
          { id: "aut_init_g1", text: "Tomar decisões simples sobre projetos sem pedir validação constante" }
        ],
        relatedHPs: ["Autonomia Regulatória"]
      },
      {
        id: "valores",
        title: "Valores",
        description: "Alinhamento de conduta com propósitos existenciais, ética e causas norteadoras pessoais.",
        satisfaction: 8,
        currentAttributes: [
          { id: "val_init_1", text: "Extremo compromisso ético na entrega de promessas de trabalho" }
        ],
        developGoals: [
          { id: "val_init_g1", text: "Dedicar tempo para atividades de suporte acadêmico voluntário na comunidade" }
        ],
        relatedHPs: ["Comprometimento com Valores", "Altruísmo"]
      }
    ],
    actionStrategy: "Melhorar o nível de autonomia decisória e praticar a expressão de limites de forma polida e firme."
  });

  // State for Cartão de Enfrentamento
  const [copingCards, setCopingCards] = useState<CopingCardsState>({
    cards: [
      {
        id: "card_init_1",
        trigger: "Antes de entregar um relatório técnico ou iniciar uma apresentação complexa no trabalho",
        distortedThought: "Se eu cometer qualquer deslize ou hesitar durante a fala, todos vão descobrir que sou uma farsa completa e que não deveria estar aqui. Esse projeto tem que estar rigorosamente impecável, pois um único erro anula todo o meu esforço restante, deixando claro que sou incompetente e que serei demitido sumariamente na primeira avaliação de desempenho.",
        restructuredThought: "Cometer deslizes ou hesitar é um comportamento comum no noviciado profissional e não diminui minha integridade ou competência global comprovada. O perfeccionismo é uma exigência química e existencial irrealista. Erros secundários são oportunidades metodológicas de refino e não determinam demissão automática, pois meu histórico real mostra entregas consistentes, elogiadas e amparadas por suporte mútuo.",
        distortionsSelected: ["catastrofizacao", "preto_branco", "desqualificacao_positivo"],
        passesScientificCheck: true,
        passesCircumstanceCheck: true,
        scientificObservation: "Estudos em Psicologia Organizacional atestam que a tolerância a pequenas falhas e a segurança psicológica aumentam a inovação das equipes. A performance ideal humana segue a curva de Yerkes-Dosson, onde cobranças extremas degradam o foco.",
        ethicalCheck: {
          focusOnValues: true,
          protectsSelfCare: true,
          respectsLimits: true
        },
        convictionRating: 80
      }
    ]
  });

  // State for Geração de Alternativas para Despolarização
  const [despolarizacao, setDespolarizacao] = useState<DespolarizacaoState>({
    blocks: [
      {
        id: "polar_init_1",
        theme: "Perfeccionismo sobre Trabalho e Entregas Técnicas",
        leftPolar: "Eu tenho que trabalhar 16 horas por dia, nunca recusar nenhuma tarefa da chefia e ser absolutely impecável em tudo, senão serei despedido e serei considerado um fracasso completo.",
        leftExtremism: 9,
        rightPolar: "Já que a cobrança empresarial é tóxica e injusta, eu deveria parar de me esforçar totalmente, fazer o mínimo absoluto para sobreviver ou pedir demissão impulsiva de tudo por rebeldia.",
        rightExtremism: 8,
        intermediateAlternative: "Posso manter uma conduta profissional responsável e engajada dentro do meu horário normal de expediente. Definir limites saudáveis para horas extras me possibilita ter um rendimento sustentável, mantendo minha integridade física e mental sem arriscar meu sustento ou minha reputação profissional real.",
        intermediateConviction: 85,
        checkedPoints: {
          factBased: true,
          respectsBoundaries: true,
          actionsDrivenByValues: true
        }
      }
    ],
    notes: ""
  });

  // State for Geração de Alternativas no Espectro Cognitivo
  const [espectroCognitivo, setEspectroCognitivo] = useState<EspectroCognitivoState>({
    scenarios: [
      {
        id: "scen_init_1",
        situation: "Apresentar o resultado anual da empresa para toda a diretoria e conselho administrativo",
        catastrofismo: "Eu vou gaguejar logo na primeira frase, esquecer as informações cruciais, ser vaiado abertamente, mandado embora no mesmo dia e nunca mais conseguirei recolocação profissional no mercado.",
        pessimismo: "É muito provável que eu me sinta extremamente nervoso, faça uma apresentação abaixo da média, as pessoas fiquem entediadas ou façam perguntas difíceis que eu não saberei responder com perfeição.",
        realismo: "Eu já revisei e dominei os slides e conheço os dados do meu setor. Posso sentir algum nervosismo físico normal nos primeiros minutos, mas tenho anotações de apoio, e perguntas difíceis fazem parte de qualquer reunião executiva saudável.",
        otimismo: "O conselho está interessado em entender os números reais, não em me sabotar. Se eu mantiver a calma e conduzir a reunião de forma transparente, as propostas serão bem recebidas e obterei aprovação das diretrizes.",
        utopismo: "Minha apresentação será a mais impecável e memorável da história da corporação. Todos se levantarão para me aplaudir de pé por 10 minutos, serei promovido instantaneamente a vice-presidente no dia seguinte.",
        initialBeliefLocation: "pessimismo",
        jointSynthesis: "Fatos comprovados mostram que conheço o produto e estou preparado. Combinando isso com a expectativa saudável de que eles buscam cooperação, vou iniciar a reunião focado nas soluções práticas, aceitando qualquer frio na abriga provisório.",
        convictionSynthesis: 85
      }
    ],
    generalObservations: ""
  });

  // State for Registro de Interações Disfuncionais (RID)
  const [ridInteracoes, setRidInteracoes] = useState<RidInteracoesState>({
    interactions: [
      {
        id: "rid_init_1",
        situation: "Cônjuge chega cansado em casa, isola-se no telefone celular ignorando tentativas de diálogo sobre as contas conjuntas.",
        necessity: "Pertencimento, conexão emocional íntima e cooperação segura no planejamento da vida doméstica.",
        realStressors: "Fadiga extrema do cônjuge após jornada de 11h úteis de logística operacional e contas mensais acumuladas ultrapassando reservas.",
        distortedStressors: "Pensamento do tipo tudo-ou-nada; leitura mental ('Ele não sente mais respeito por mim e está escondendo um desinteresse vitalício').",
        lifeHistory: "Vivência de divórcio explosivo dos pais na infância marcado por silêncios hostis de semanas seguidos por abandono domiciliar paterno repentino.",
        cognitions: "Crença Intermediária: 'Se eu não me impor de forma barulhenta com ultimatos agora, serei invisibilizada e abandonada como minha mãe foi'. Crença Central: 'Não sou importante o suficiente para ser escutada'.",
        emotions: "Ira defensiva intensa (8/10), ansiedade de desamparo (9/10), taquicardia severa e aperto doloroso no tórax.",
        excessActions: "Cobranças agressivas com tom sarcástico, batidas de portas na cozinha, ultimatos repetidos sob ameaça de recolha de aliança conjugal.",
        deficitActions: "Falta de assertividade tranquila para adiar o assunto, escuta terapêutica da exaustão física do parceiro e comunicação aberta em tom calmo no dia seguinte.",
        immediateReinforcement: "Alívio momentâneo da ansiedade devido à descarga de ira e atenção reativa (embora belicosa) obtida à força do parceiro.",
        immediatePunishment: "Briga explosiva mútua em que ambos trocam ofensas pesadas e se retiram para dormir em ambientes apartados da residência.",
        finalReinforcement: "Prevenção disfuncional provisória do abandono (mantém o parceiro ocupado na discussão reativa, sem espaço para silêncio espontâneo).",
        finalPunishment: "Corrosão progressiva do afeto recíproco, distanciamento voluntário do cônjuge que passa a evitar voltar cedo para casa, aumento da sensação de inadequação e desamparo pessoal crônico."
      }
    ],
    clinicalNotes: ""
  });

  // State for Transição para Mecanismo Funcional (Tool 19)
  const [transicaoMecanismo, setTransicaoMecanismo] = useState<TransicaoMecanismoState>({
    transitions: [
      {
        id: "trans_init_1",
        disfunctionalSchema: "Esquema de Abandono / Instabilidade (Necessidade de Conexão Segura desregulada).",
        disfunctionalThought: "Se eu me distanciar ou se ela demorar para responder por 2 horas, significa que serei abandonada de forma inevitável e ficarei completamente sozinha para sempre.",
        disfunctionalBehavior: "Cobranças agressivas instantâneas por redes sociais, vigilância insistente de conexões de status (fuga-esquiva ativa).",
        disfunctionalResults: "Brigas desnecessárias de ciúmes, fadiga crônica de vigilância e indução do distanciamento reativo do parceiro (mecanismo que se autoconfirma).",
        disfunctionalDisadvantages: "Desgaste total do afeto do parceiro, ansiedade diária insuportável e estagnação de projetos pessoais e profissionais.",
        functionalSchema: "Autonomia Funcional e Vínculos Seguros (Necessidade de Conexão Segura autorregulada).",
        functionalThought: "O silêncio do outro reflete sua própria rotina diária atarefada e fustigada de trabalho, não insolvência afetiva. Eu sou autoeficaz e completa em meu próprio espaço de vida.",
        functionalBehavior: "Trilhar o próprio cronograma com dedicação militar a metas, respeitar o tempo alheio e responder aos chats de forma serena quando oportuno.",
        functionalResultsKey: "Atração autêntica mútua, relações tranquilas baseadas na liberdade responsável e crescimento progressivo da autoconfiança de subsistência.",
        functionalAdvantages: "Paz existencial indestrutível, aproveitamento máximo do tempo operacional diário e preservação de relacionamentos prósperos e duradouros."
      }
    ],
    clinicalNotes: ""
  });

  // State for Exame Duplo de Vantagens e Desvantagens (Tool 20)
  const [exameDuploVantagens, setExameDuploVantagens] = useState<ExameDuploVantagensState>({
    alternativa1: "Mudar para transição de carreira de Tecnologia ou Empreendedorismo de forma autônoma.",
    alternativa2: "Manter cargo no emprego atual corporativo tradicional garantindo estabilidade.",
    pros1: [
      {
        id: "p1_init_1",
        text: "Autonomia de horários extrema e flexibilidade de agenda de trabalho.",
        weight: 5,
        isFantasy: true,
        fantasyType: "utopia",
        realistAdjustment: "Maior autonomia e flexibilidade na agenda, embora requeira disciplina militar e autogestão rigorosa."
      }
    ],
    contras1: [
      {
        id: "c1_init_1",
        text: "Ficarei completamente sem dinheiro no primeiro mês e passarei fome de forma miserável.",
        weight: 5,
        isFantasy: true,
        fantasyType: "catastrophism",
        realistAdjustment: "Período de instabilidade financeira inicial que exige uma reserva financeira de segurança para no mínimo 6 a 12 meses."
      }
    ],
    pros2: [
      {
        id: "p2_init_1",
        text: "Estabilidade do salário previsível na conta todo dia 5 de forma segura.",
        weight: 5,
        isFantasy: false,
        fantasyType: null,
        realistAdjustment: ""
      }
    ],
    contras2: [
      {
        id: "c2_init_1",
        text: "Estagnação existencial absoluta, depressão severa crônica e impossibilidade de qualquer alegria.",
        weight: 5,
        isFantasy: true,
        fantasyType: "catastrophism",
        realistAdjustment: "Prejuízo na satisfação profissional de longo prazo e limitação de crescimento, mas posso desenvolver projetos paralelos saudáveis e lazer."
      }
    ],
    clinicalNotes: ""
  });

  // State for Exame de Feedbacks (Entrevista & Filtros) (Tool 21)
  const [exameFeedbacksEntrevista, setExameFeedbacksEntrevista] = useState<ExameFeedbacksEntrevistaState>({
    items: [],
    clinicalNotes: ""
  });

  // State for Exame de Atributos Pessoais (Tool 22)
  const [exameAtributosPessoais, setExameAtributosPessoais] = useState<ExameAtributosPessoaisState>({
    souGosto: [],
    souNaoGosto: [],
    naoSouGostaria: [],
    naoSouGostoNao: [],
    clinicalNotes: ""
  });

  // State for Exame de Características Singulares e Compartilhadas (Tool 23)
  const [exameSingularesCompartilhadas, setExameSingularesCompartilhadas] = useState<ExameSingularesCompartilhadasState>({
    attributes: [],
    clinicalNotes: ""
  });

  // State for Exame Histórico da Provisão Emocional (Tool 24)
  const [exameProvisaoEmocional, setExameProvisaoEmocional] = useState<ExameProvisaoEmocionalState>({
    ratings: {},
    facilitatingBehaviors: "",
    blockingBehaviors: "",
    clinicalNotes: ""
  });

  // State for Exame das Atitudes e Efeitos nas Dimensões (Tool 25)
  const [exameAtitudesDimensoes, setExameAtitudesDimensoes] = useState<ExameAtitudesDimensoesState>({
    cells: {},
    satisfaction: {},
    clinicalNotes: ""
  });

  // State for Exame das Reações Sociais aos Meus Comportamentos (Tool 26)
  const [exameReacoesSociais, setExameReacoesSociais] = useState<ExameReacoesSociaisState>({
    contexts: {
      geral: {
        checkedReactions: [],
        customReactions: [],
        intensities: {},
        precipitators: {},
        alternatives: {}
      }
    },
    activeContextId: "geral",
    clinicalNotes: ""
  });

  // State for Hierarquia de Exposição e Enfrentamento (Tool 27)
  const [exameHierarquiaExposicao, setExameHierarquiaExposicao] = useState<ExameHierarquiaExposicaoState>({
    items: [],
    clinicalNotes: ""
  });

  // State for Análise dos Modelos Pessoais (Tool 28)
  const [exameModelosPessoais, setExameModelosPessoais] = useState<ExameModelosPessoaisState>({
    currentModels: [],
    idealModels: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Hedonismo Responsável (Tool 29)
  const [mentalidadesHedonismo, setMentalidadesHedonismo] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Autoconhecimento (Tool 30)
  const [mentalidadesAutoconhecimento, setMentalidadesAutoconhecimento] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Autoestima (Tool 31)
  const [mentalidadesAutoestima, setMentalidadesAutoestima] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Raciocínio Otimista (Tool 32)
  const [mentalidadesRaciocinioOtimista, setMentalidadesRaciocinioOtimista] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Autorregulação Emocional (Tool 33)
  const [mentalidadesAutorregulacaoEmocional, setMentalidadesAutorregulacaoEmocional] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Imunidade Social (Tool 34)
  const [mentalidadesImunidadeSocial, setMentalidadesImunidadeSocial] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Resolutividade e Enfrentamento (Tool 35)
  const [mentalidadesResolutividadeEnfrentamento, setMentalidadesResolutividadeEnfrentamento] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Autocontrole (Tool 36)
  const [mentalidadesAutocontrole, setMentalidadesAutocontrole] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Sociabilidade (Tool 37)
  const [mentalidadesSociabilidade, setMentalidadesSociabilidade] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  // State for Mentalidades Saudáveis Sensibilidade Social (Tool 38)
  const [mentalidadesSensibilidadeSocial, setMentalidadesSensibilidadeSocial] = useState<ExameMentalidadesSaudaveisState>({
    selectedPhrases: [],
    reflections: [],
    customPhrases: [],
    clinicalNotes: ""
  });

  const [hoveredSubscale, setHoveredSubscale] = useState<string | null>(null);

  const updateRadarSubscale = (subscaleId: string, value: number) => {
    setRadarSubscales(prev => {
      const updated = { ...prev, [subscaleId]: value };
      const meta = SUBSCALE_METADATA.find(m => m.id === subscaleId);
      if (meta) {
        const groupKey = meta.group;
        const groupSubscales = SUBSCALE_METADATA.filter(m => m.group === groupKey);
        const sum = groupSubscales.reduce((acc, curr) => {
          return acc + (curr.id === subscaleId ? value : (updated[curr.id] !== undefined ? updated[curr.id] : 0));
        }, 0);
        const avg = Math.round(sum / groupSubscales.length);
        
        setMultidimSatisfaction(prevMulti => ({
          ...prevMulti,
          [groupKey]: {
            ...prevMulti[groupKey],
            satisfaction: avg
          }
        }));
      }
      return updated;
    });
  };

  // State for Análise dos Tipos de Críticos
  const [criticList, setCriticList] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    type: 'ignorante' | 'repetidor' | 'pesquisador' | 'pensante';
    characteristicFeedback: string;
    impactLevel: number;
    filterCapability: number;
    notesNotes: string;
  }>>([
    {
      id: "c1",
      name: "Colega Marcos (Trabalho)",
      relationship: "Profissional",
      type: "ignorante",
      characteristicFeedback: "Opina sobre a complexidade das minhas tarefas técnicas sem nunca ter programado ou estudado nossa regra de negócio.",
      impactLevel: 7,
      filterCapability: 4,
      notesNotes: "Crítica sem dados técnicos ou conhecimento de mercado. Lembrar-se de ignorar ou filtrar ativamente sem abalo da autoeficácia."
    },
    {
      id: "c2",
      name: "Tio Alberto (Eventos de Família)",
      relationship: "Familiar",
      type: "repetidor",
      characteristicFeedback: "Repete jargões e fofocas familiares sobre como escolher carreira estável, sem compreender o mercado contemporâneo.",
      impactLevel: 5,
      filterCapability: 6,
      notesNotes: "Apenas reproduz rumores e fofocas obsoletas da família. Praticar audição flexível: aceitar o afeto, descartar o julgamento."
    },
    {
      id: "c3",
      name: "Diretora Cláudia (Feedback Anual)",
      relationship: "Profissional",
      type: "pesquisador",
      characteristicFeedback: "Apresenta métricas de mercado e aponta gargalos pontuais na velocidade de entrega de forma justificada e referenciada estruturalmente.",
      impactLevel: 6,
      filterCapability: 8,
      notesNotes: "Baseia-se em fontes fidedignas e relatórios reais. Usar feedback para plano de ação de aprimoramento técnico relevante."
    },
    {
      id: "c4",
      name: "Esposa Helena (Convivência)",
      relationship: "Pessoal",
      type: "pensante",
      characteristicFeedback: "Analisa minuciosamente nossas finanças conjuntas e propõe ajustes com reflexões profundas sobre meus padrões de consumo impulsivo.",
      impactLevel: 3,
      filterCapability: 9,
      notesNotes: "Demonstra alta profundidade reflexiva, carinho emocional e racionalidade lógica. Considerar com reflexão ativa cooperativa."
    }
  ]);

  const [isAddingCritic, setIsAddingCritic] = useState(false);
  const [newCriticName, setNewCriticName] = useState("");
  const [newCriticRelation, setNewCriticRelation] = useState("");
  const [newCriticType, setNewCriticType] = useState<'ignorante' | 'repetidor' | 'pesquisador' | 'pensante'>("ignorante");
  const [newCriticFeedback, setNewCriticFeedback] = useState("");
  const [newCriticImpact, setNewCriticImpact] = useState(5);
  const [newCriticFilter, setNewCriticFilter] = useState(5);
  const [newCriticNotes, setNewCriticNotes] = useState("");

  // State for Exame de Feedbacks (Rótulos Comportamentais)
  const [feedbackTab, setFeedbackTab] = useState<'self' | 'observers' | 'alignment' | 'situations'>('self');
  const [customFeedbackLabels, setCustomFeedbackLabels] = useState<string[]>(["Perfeccionista", "Centralizador"]);
  const [feedbackSelfRatings, setFeedbackSelfRatings] = useState<Record<string, 'N' | 'P' | 'M' | 'S'>>({
    "Autoritário": "P",
    "Carinhoso": "M",
    "Passivo": "N",
    "Inseguro": "P",
    "Arrogante": "N",
    "Paciente": "M",
    "Calado": "P",
    "Acomodado": "N",
    "Persistente": "S",
    "Responsável": "S",
    "Pacificador": "M",
    "Queixoso": "P",
    "Controlador": "P",
    "Ciumento": "P",
    "Determinado": "S",
    "Impulsivo": "M",
    "Com iniciativa / proativo": "S",
    "Crítico": "M",
    "Prestativo": "M",
    "Produtivo": "M",
    "Extrovertido": "M",
    "Educado": "S",
    "Compreensivo": "M",
    "Tranquilo": "P",
    "Agressivo": "P",
    "Indiferente": "N",
    "Sedutor": "P",
    "Exigente consigo": "S",
    "Exigente com os outros": "M",
    "Autêntico / fala o que pensa": "S",
    "Teimoso / insistente": "M",
    "Perfeccionista": "S",
    "Centralizador": "M"
  });

  const [feedbackObservers, setFeedbackObservers] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    ratings: Record<string, 'N' | 'P' | 'M' | 'S'>;
  }>>([
    {
      id: "obs1",
      name: "Helena (Esposa)",
      relationship: "Pessoal / Cônjuge",
      ratings: {
        "Autoritário": "M",
        "Carinhoso": "M",
        "Passivo": "N",
        "Inseguro": "N",
        "Arrogante": "N",
        "Paciente": "P",
        "Calado": "M",
        "Acomodado": "N",
        "Persistente": "S",
        "Responsável": "S",
        "Pacificador": "P",
        "Queixoso": "P",
        "Controlador": "M",
        "Ciumento": "M",
        "Determinado": "S",
        "Impulsivo": "S",
        "Com iniciativa / proativo": "M",
        "Crítico": "S",
        "Prestativo": "M",
        "Produtivo": "M",
        "Extrovertido": "P",
        "Educado": "S",
        "Compreensivo": "P",
        "Tranquilo": "P",
        "Agressivo": "M",
        "Indiferente": "N",
        "Sedutor": "M",
        "Exigente consigo": "S",
        "Exigente com os outros": "S",
        "Autêntico / fala o que pensa": "S",
        "Teimoso / insistente": "S",
        "Perfeccionista": "S",
        "Centralizador": "S"
      }
    },
    {
      id: "obs2",
      name: "Cláudio (Sócio)",
      relationship: "Profissional",
      ratings: {
        "Autoritário": "M",
        "Carinhoso": "P",
        "Passivo": "N",
        "Inseguro": "P",
        "Arrogante": "P",
        "Paciente": "M",
        "Calado": "N",
        "Acomodado": "N",
        "Persistente": "S",
        "Responsável": "S",
        "Pacificador": "M",
        "Queixoso": "N",
        "Controlador": "S",
        "Ciumento": "N",
        "Determinado": "S",
        "Impulsivo": "P",
        "Com iniciativa / proativo": "S",
        "Crítico": "M",
        "Prestativo": "P",
        "Produtivo": "S",
        "Extrovertido": "M",
        "Educado": "M",
        "Compreensivo": "M",
        "Tranquilo": "M",
        "Agressivo": "P",
        "Indiferente": "P",
        "Sedutor": "N",
        "Exigente consigo": "S",
        "Exigente com os outros": "S",
        "Autêntico / fala o que pensa": "S",
        "Teimoso / insistente": "M",
        "Perfeccionista": "S",
        "Centralizador": "S"
      }
    }
  ]);

  const [feedbackSituations, setFeedbackSituations] = useState<Array<{
    id: string;
    behavior: string;
    situation: string;
    context: string;
  }>>([
    {
      id: "s1",
      behavior: "Autoritário",
      situation: "Interrompeu o liderado Roberto na apresentação sobre metas.",
      context: "Sente ansiedade sobre prazos e assume tom imperativo de cobrança excessiva."
    },
    {
      id: "s2",
      behavior: "Impulsivo",
      situation: "Comprou curso de pós-graduação internacional no impulso em momento de tédio.",
      context: "Lidar com tédio ocupacional através de gastos imediatistas sem viabilidade de agenda."
    },
    {
      id: "s3",
      behavior: "Exigente consigo",
      situation: "Trabalhou até as 2h da manhã corrigindo detalhes de formatação inconsequentes.",
      context: "Dificuldade de delegar e estabelecer limites saudáveis ao perfeccionismo analítico."
    }
  ]);

  const [isAddingObserver, setIsAddingObserver] = useState(false);
  const [newObserverName, setNewObserverName] = useState("");
  const [newObserverRelation, setNewObserverRelation] = useState("");

  const [isAddingSituation, setIsAddingSituation] = useState(false);
  const [newSituationBehavior, setNewSituationBehavior] = useState("");
  const [newSituationDescription, setNewSituationDescription] = useState("");
  const [newSituationContext, setNewSituationContext] = useState("");

  const [newCustomLabel, setNewCustomLabel] = useState("");

  // State for Mapeamento de Estressores (Stressors Mapping)
  const [stressorsTab, setStressorsTab] = useState<'brainstorm' | 'separation' | 'hierarchy'>('brainstorm');
  const [newStressorText, setNewStressorText] = useState("");
  const [newStressorType, setNewStressorType] = useState<'controllable' | 'uncontrollable'>('controllable');
  const [newStressorSeverity, setNewStressorSeverity] = useState<number>(3);
  const [stressorsList, setStressorsList] = useState<Array<{
    id: string;
    text: string;
    type: 'controllable' | 'uncontrollable';
    severity: number; // 1-5
    visualAngle: number;
    visualDistance: number;
  }>>([
    { id: "st1", text: "Trabalho acumulado e e-mails profissionais não respondidos", type: "controllable", severity: 4, visualAngle: 45, visualDistance: 110 },
    { id: "st2", text: "Incerteza sobre a inflação nacional e taxas de câmbio", type: "uncontrollable", severity: 3, visualAngle: 120, visualDistance: 160 },
    { id: "st3", text: "Prazo final iminente do projeto de desenvolvimento de software", type: "controllable", severity: 5, visualAngle: 210, visualDistance: 90 },
    { id: "st4", text: "Críticas destrutivas recorrentes por parte de parentes distantes", type: "uncontrollable", severity: 2, visualAngle: 300, visualDistance: 150 },
    { id: "st5", text: "Dificuldade crônica em estabelecer consistência para treinos físicos", type: "controllable", severity: 3, visualAngle: 345, visualDistance: 110 }
  ]);
  const [stressorHierarchy, setStressorHierarchy] = useState<string[]>([
    "st3", "st1", "st5"
  ]);

  // Neuropsychological Game State (TAVP)
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameTimeLeft, setGameTimeLeft] = useState(30);
  const [gameGrid, setGameGrid] = useState<{ id: number; symbol: string; clicked: boolean; isTarget: boolean }[]>([]);
  const [gameHits, setGameHits] = useState(0);
  const [gameErrors, setGameErrors] = useState(0);
  const [gameReactionTimes, setGameReactionTimes] = useState<number[]>([]);
  const lastClickTimeRef = useRef<number>(0);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Generation State
  const [isGeneratingHtmlReport, setIsGeneratingHtmlReport] = useState(false);
  const [aiReportText, setAiReportText] = useState("");
  const [aiError, setAiError] = useState("");

  // Simulated File Upload for placeholders
  const [simulatedFile, setSimulatedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // State for Acompanhamento do PDP
  const [pdpState, setPdpState] = useState<{
    profissional: string;
    crp: string;
    dataInicio: string;
    hp: string;
    fase1: {
      nocoes_iniciais: { text: string; done: boolean };
      valores_relacionados: { text: string; done: boolean };
      beneficios_hp: { text: string; done: boolean };
      impactos_deficit: { text: string; done: boolean };
      ganhos_atual_padrao: { text: string; done: boolean };
    };
    fase2: {
      investigacao_reestruturacao: { text: string; done: boolean };
    };
    fase3: {
      leitura_selecao_reflexao: { text: string; done: boolean };
    };
    fase4: Array<{ id: number; text: string; done: boolean }>;
    fase5: Array<{ id: number; text: string; done: boolean }>;
  }>({
    profissional: "Dr. Lincoln Poubel",
    crp: "CRP 04/99124-MG",
    dataInicio: new Date().toLocaleDateString("pt-BR"),
    hp: "Autocontrole e Tolerância à Frustração",
    fase1: {
      nocoes_iniciais: { text: "Compreensão de que o autocontrole é a habilidade de postergar a gratificação imediata em prol de metas de longo prazo.", done: true },
      valores_relacionados: { text: "Persistência, foco, disciplina, responsabilidade e integridade moral.", done: true },
      beneficios_hp: { text: "Redução da impulsividade, tomadas de decisões mais ponderadas, alcance de metas financeiras e consistência na rotina acadêmica.", done: true },
      impactos_deficit: { text: "Procrastinação excessiva, gastos por impulso, oscilações constantes no humor e sensação recorrente de culpa e insuficiência.", done: true },
      ganhos_atual_padrao: { text: "Alívio imediato (evitação), desfrute temporário sem esforço e preservação de energia.", done: true }
    },
    fase2: {
      investigacao_reestruturacao: { text: "Investigar crenças de que 'não consigo tolerar frustrações.' Reestruturar para: 'Eu posso suportar o desconforto temporário do esforço para ter benefícios reais depois.'", done: true }
    },
    fase3: {
      leitura_selecao_reflexao: { text: "Selecionar cartão de enfrentamento: 'O esforço de hoje constrói a liberdade de amanhã. O desconforto da disciplina pesa gramas; o desconforto do arrependimento pesa toneladas.'", done: true }
    },
    fase4: [
      { id: 1, text: "Livro: Rápido e Devagar (Daniel Kahneman)", done: true },
      { id: 2, text: "Podcast: Neurociência do Autocontrole (Eslen Delanogare)", done: true },
      { id: 3, text: "Curso: Inteligência Comportamental e Hábitos Práticos", done: false },
      { id: 4, text: "Vídeo: A Psicologia do Esforço Voluntário", done: false },
      { id: 5, text: "Artigo científico sobre regulação emocional ativa", done: false },
      { id: 6, text: "Áudio explicativo sobre controle inibitório e atenção concentrada", done: false }
    ],
    fase5: [
      { id: 1, text: "Praticar 15 minutos adicionais de estudo focado diário mesmo sob cansaço.", done: true },
      { id: 2, text: "Anotar impulsos de compras e esperar 48 horas antes de efetivar o pagamento.", done: true },
      { id: 3, text: "Realizar o exercício clínico da tolerância ao tédio de 5 minutos diários.", done: true },
      { id: 4, text: "Manter diário de resiliência e tomada de decisão consciente.", done: false },
      { id: 5, text: "Atrasar o café da manhã em 30 minutos praticando tolerância ao incômodo físico leve.", done: false },
      { id: 6, text: "Resolver um problema pendente logo no primeiro bloco de tarefas do dia.", done: false },
      { id: 7, text: "Fazer alongamento estático focado na respiração ventral ao invés de abrir redes sociais.", done: false },
      { id: 8, text: "Utilizar cronômetro Pomodoro de 45 minutos sem desvios de atenção.", done: false },
      { id: 9, text: "Fazer pausa consciente de 2 minutos antes de responder a e-mails estressantes.", done: false },
      { id: 10, text: "Praticar atividade física em horário pré-definido omitindo desculpas circunstanciais.", done: false }
    ]
  });

  // State for Acompanhamento do PME
  const [pmeState, setPmeState] = useState<PmeState>({
    profissional: "Dr. Lincoln Poubel",
    crp: "CRP 04/99124-MG",
    dataInicio: new Date().toLocaleDateString("pt-BR"),
    esquemaPrincipal: "Fracasso",
    origemTraumatica: "Humilhação no festival de talentos escolar aos 7 anos",
    fase1: { 
      text: "Esquema de Fracasso ativado em apresentações no trabalho perante superiores (EID de Fracasso e Defectividade/Vergonha). Evitação e fuga ativa do palco profissional de fala.", 
      done: true 
    },
    fase2: { 
      text: "Aplicação da Metáfora do Ônibus. Diferenciação clara entre o Eu Adulto (piloto de 30 anos com maturidade) e as reações infantis (criança de 7 anos assustada no banco de trás).", 
      done: true 
    },
    fase3: { 
      text: "Ativação de lembranças precoces: identificada a origem aos 7 anos de idade no teatro da escola, onde esqueceu os passos do truque de mágica e os colegas e a professora riram.", 
      done: true 
    },
    fase4: { 
      text: "Mapeamento de perdas: prejuízo no avanço de carreira como engenheiro de software, recuo diante de promoções, estresse de antecipação fóbica em reuniões.", 
      done: true 
    },
    fase5: { 
      text: "Contrato estabelecido: compromisso assumido para confrontar o sentimento de inadequação e reabilitar a dor do fracasso imaginado em benefício do crescimento adulto.", 
      done: true 
    },
    fase6: { 
      text: "Questionamento socrático sobre as distorções cognitivas: desafiar o pensamento de 'se eu errar eles vão rir' para 'eu tenho o direito humano básico de ser falível'. Como o adulto, reestruturar para: 'Errar faz parte do aprendizado'.", 
      done: true 
    },
    fase7: { 
      text: "Aplicação prática da técnica vivencial de Reparentalização Limitada: o Eu Adulto de hoje entra na lembrança do palco escolar de 7 anos, sobe no palco, valida a coragem da criança, protege-a, silencia os críticos e a retira com um abraço acolhedor.", 
      done: true 
    },
    fase8: { 
      text: "Início planejado das atividades práticas no PDP: iniciar exposições controladas de fala ativa nas reuniões semanais, testando e construindo as HPs de Imunidade Social e Resolutividade de forma gradual.", 
      done: true 
    },
    
    // Initializing nested PDP fields
    pdpHp: "Imunidade Social & Assertividade",
    pdpFase1: {
      nocoes_iniciais: { text: "Compreensão de que a imunidade social é a blindagem emocional contra julgamentos alheios e a validação autoconstruída.", done: true },
      valores_relacionados: { text: "Assertividade, autovalorização, coragem existencial, honestidade identitária e maturidade emocional.", done: true },
      beneficios_hp: { text: "Redução da fobia de julgamento profissional, maior proatividade em reuniões e liberdade para expressar opiniões técnicas divergentes.", done: true },
      impactos_deficit: { text: "Padrões de subjugação às opiniões alheias, isolamento laboral protetivo, estresse fóbico paralisante e autosabotagem profissional.", done: true },
      ganhos_atual_padrao: { text: "Preservação da zona de conforto, evitação temporária da ansiedade de exposição social e fuga de potenciais críticas.", done: true }
    },
    pdpFase2: {
      investigacao_reestruturacao: { text: "Investigar e reescrever a crença de que 'críticas provam meu fracasso profissional'. Reestruturar para: 'O erro e a crítica no trabalho são feedbacks neutros de refinamento, não determinantes do meu valor existencial'.", done: true }
    },
    pdpFase3: {
      leitura_selecao_reflexao: { text: "Selecionar cartão de enfrentamento: 'O silêncio submisso alimenta o medo. A minha competência vale mais do que a aprovação irrestrita das pessoas na sala.'", done: true }
    },
    pdpFase4: [
      { id: 1, text: "Livro: A Coragem de Ser Imperfeito (Brené Brown)", done: true },
      { id: 2, text: "Podcast: Imunidade Social e Terapia Cognitiva (Lincoln Poubel)", done: true },
      { id: 3, text: "Curso Acadêmico: Inteligência Social e Comunicação Não-Violenta", done: false },
      { id: 4, text: "Vídeo Clínico: Anatomia da Vulnerabilidade Emocional", done: false },
      { id: 5, text: "Artigo: Dessensibilização Sistemática no Transtorno de Ansiedade Social", done: false },
      { id: 6, text: "Áudio: O Poder do Posicionamento Assertivo", done: false }
    ],
    pdpFase5: [
      { id: 1, text: "Falar ativamente pelo menos uma vez em todas as reuniões semanais de equipe.", done: true },
      { id: 2, text: "Apresentar slides explicativos para duas pessoas do time de engenharia como ensaio.", done: true },
      { id: 3, text: "Exercício de exposição: fazer uma pergunta em uma conferência pública da empresa.", done: false },
      { id: 4, text: "Dar feedback construtivo direto e respeitoso para um colega de trabalho próximo.", done: false },
      { id: 5, text: "Anotar as reações do corpo durante a ativação da ansiedade de fala usando a escala SUDs.", done: false },
      { id: 6, text: "Parar de pedir desculpas antecipadas antes de iniciar uma explanação técnica curricular.", done: false },
      { id: 7, text: "Pedir feedback explícito a um par técnico sobre uma entrega sem justificar erros antes.", done: false },
      { id: 8, text: "Fazer perguntas de esclarecimento em fóruns públicos em vez de saná-las em reuniões particulares.", done: false },
      { id: 9, text: "Praticar respirar pausadamente (3-2-5) por 3 minutos antes do início de reuniões com diretoria.", done: false },
      { id: 10, text: "Recusar educadamente uma pendência externa que ultrapassa sua capacidade de entrega semanal (Assertividade).", done: false }
    ]
  });

  // Initialize Questionnaire values
  useEffect(() => {
    if (tool.id === "idai") {
      const initial: Record<string, number> = {};
      IDAI_QUESTIONS.forEach(q => { initial[q.id] = 0; });
      setIdaiAnswers(initial);
    } else if (tool.id === "efca") {
      const initial: Record<string, number> = {};
      EFCA_QUESTIONS.forEach(e => { initial[e.id] = 3; }); // Mid rating
      setEfcaAnswers(initial);
    }
  }, [tool.id]);

  // Handle questionnaire change
  const handleIdaiChange = (qid: string, val: number) => {
    setIdaiAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const handleEfcaChange = (eid: string, val: number) => {
    setEfcaAnswers(prev => ({ ...prev, [eid]: val }));
  };

  // --- GAME ENGINE (TAVP Test) ---
  const initTavpGame = () => {
    const symbols = ["⨂", "⨀", "▲", "■", "★", "◆", "✚", "⬡"];
    const targetSymbol = "⨂";
    const grid: { id: number; symbol: string; clicked: boolean; isTarget: boolean }[] = [];
    
    // Create 30 items matrix. ~10 targets, ~20 distractors
    for (let i = 0; i < 30; i++) {
      const rand = Math.random();
      let symbol = "";
      let isTarget = false;
      
      if (rand < 0.35) {
        symbol = targetSymbol;
        isTarget = true;
      } else {
        const distroSymbols = symbols.filter(s => s !== targetSymbol);
        symbol = distroSymbols[Math.floor(Math.random() * distroSymbols.length)];
      }

      grid.push({
        id: i,
        symbol,
        clicked: false,
        isTarget
      });
    }

    setGameGrid(grid);
    setGameHits(0);
    setGameErrors(0);
    setGameReactionTimes([]);
    setGameTimeLeft(30);
    setIsGameActive(true);
    lastClickTimeRef.current = Date.now();

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setGameTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current!);
          setIsGameActive(false);
          setStep('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGameCellClick = (index: number) => {
    if (!isGameActive) return;
    const clickedCell = gameGrid[index];
    if (clickedCell.clicked) return; // Already clicked

    const now = Date.now();
    const rt = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    const newGrid = [...gameGrid];
    newGrid[index] = { ...clickedCell, clicked: true };
    setGameGrid(newGrid);

    if (clickedCell.isTarget) {
      setGameHits(prev => prev + 1);
      setGameReactionTimes(prev => [...prev, rt]);
      
      // Check if all targets found
      const remainingTargets = newGrid.filter(c => c.isTarget && !c.clicked).length;
      if (remainingTargets === 0) {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        setIsGameActive(false);
        setStep('results');
      }
    } else {
      setGameErrors(prev => prev + 1);
    }
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  // --- SCORE CALCULATORS ---
  const calculateFinalScores = () => {
    if (tool.id === "idai") {
      let totalScore = 0;
      const subscales: Record<string, number> = {
        "Espectro Depressivo": 0,
        "Hiperativação Simpática": 0,
        "Tensão Somática": 0
      };

      IDAI_QUESTIONS.forEach(q => {
        const val = idaiAnswers[q.id] || 0;
        totalScore += val;
        subscales[q.subscale] += val;
      });

      let classification = "Mínimo";
      if (totalScore >= 23) classification = "Grave";
      else if (totalScore >= 15) classification = "Moderado";
      else if (totalScore >= 8) classification = "Leve";

      return { totalScore, classification, subscales };
    } 
    
    if (tool.id === "efca") {
      let totalScore = 0;
      const subscales: Record<string, number> = {
        "Esquiva Experiencial": 0,
        "Fusão Cognitiva": 0,
        "Compromisso com Valores": 0
      };

      EFCA_QUESTIONS.forEach(e => {
        const rawVal = efcaAnswers[e.id] || 3;
        // If reversed q3, q5, q6: point scale is 5 - rawVal
        const finalVal = e.reversed ? (5 - rawVal) : rawVal;
        
        totalScore += finalVal;
        subscales[e.subscale] += finalVal;
      });

      let classification = "Baixa Flexibilidade (Fusão Ativa)";
      if (totalScore >= 28) classification = "Alta Flexibilidade Psicológica";
      else if (totalScore >= 16) classification = "Flexibilidade Moderada";

      return { totalScore, classification, subscales };
    }

    if (tool.id === "tavp") {
      // Find targets remaining
      const omissions = gameGrid.filter(c => c.isTarget && !c.clicked).length;
      const totalScore = Math.max(0, gameHits - (gameErrors + omissions));
      
      let classification = "Abaixo das Faixas de Normalidade";
      if (totalScore >= 8) classification = "Excelente Controle Inibitório";
      else if (totalScore >= 5) classification = "Média Padrão Saudável";
      else if (totalScore >= 2) classification = "Déficits Leves de Atenção";

      const avgReactionTime = gameReactionTimes.length > 0
        ? Math.round(gameReactionTimes.reduce((a, b) => a + b, 0) / gameReactionTimes.length)
        : 0;

      return {
        totalScore,
        classification,
        subscales: {
          "Acertos (Hits)": gameHits,
          "Erros / Penalidades": gameErrors,
          "Omissões de Alvo": omissions,
          "Tempo Médio Reação (ms)": avgReactionTime
        }
      };
    }

    if (tool.id === "avaliacao_central") {
      const activeDysfunctional = disfunctionalSituations.filter(s => s.situacao.trim() !== "");
      const activeStrengths = signatureStrengths.filter(s => s.forca.trim() !== "");
      const activeSchemas = maladaptiveSchemes.filter(s => s.esquema.trim() !== "");
      const activeSkills = psychologicalSkills.filter(s => s.hp.trim() !== "");
      const activeCurative = curativeSituations.filter(s => s.situacao.trim() !== "");

      const dysAvg = activeDysfunctional.length > 0
        ? activeDysfunctional.reduce((acc, curr) => acc + curr.gravidade, 0) / activeDysfunctional.length
        : 5;
      const strAvg = activeStrengths.length > 0
        ? activeStrengths.reduce((acc, curr) => acc + curr.utilidade, 0) / activeStrengths.length
        : 5;
      const schAvg = activeSchemas.length > 0
        ? activeSchemas.reduce((acc, curr) => acc + curr.ativacao, 0) / activeSchemas.length
        : 5;
      const skiAvg = activeSkills.length > 0
        ? activeSkills.reduce((acc, curr) => acc + curr.dominio, 0) / activeSkills.length
        : 5;
      const curAvg = activeCurative.length > 0
        ? activeCurative.reduce((acc, curr) => acc + curr.consolidacao, 0) / activeCurative.length
        : 5;

      const fpAvg = (strAvg + skiAvg + curAvg) / 3;
      const fvAvg = (dysAvg + schAvg) / 2;

      const totalScore = Math.max(0, Math.min(100, Math.round((fpAvg * 10) - (fvAvg * 3) + 30)));

      let classification = "Labilidade de Recursos & Vulnerabilidade Ativa";
      if (totalScore >= 75) classification = "Funcionamento Altamente Adaptativo & Resiliência Estabelecida";
      else if (totalScore >= 50) classification = "Funcionamento de Transição (Equilíbrio Dinâmico)";
      else if (totalScore < 30) classification = "Comprometimento Severo das Contingências e Esquemas";

      return {
        totalScore,
        classification,
        subscales: {
          "Índice de Forças de Assinatura": Math.round(strAvg * 10),
          "Índice de Controle de Esquemas (Inverso)": Math.round((10 - schAvg) * 10),
          "Habilidades Clínicas (HP)": Math.round(skiAvg * 10),
          "Consolidação de Vivências Curativas": Math.round(curAvg * 10),
          "Fatores Globais de Risco/Estressores": Math.round(dysAvg * 10)
        }
      };
    }

    if (tool.id === "genealogia_atributos") {
      const countItems = (text: string) => {
        if (!text) return 0;
        return text.split(/[,\/;]+/).map(s => s.trim()).filter(s => s.length > 0).length;
      };

      const { avoPaterno, avoPaterna, avoMaterno, avoMaterna, pai, mae, eu } = genealogyData;

      const hasAvoPaterno = countItems(avoPaterno.forcas) + countItems(avoPaterno.fraquezas) > 0 ? 1 : 0;
      const hasAvoPaterna = countItems(avoPaterna.forcas) + countItems(avoPaterna.fraquezas) > 0 ? 1 : 0;
      const hasPai = countItems(pai.forcas) + countItems(pai.fraquezas) > 0 ? 1 : 0;

      const hasAvoMaterno = countItems(avoMaterno.forcas) + countItems(avoMaterno.fraquezas) > 0 ? 1 : 0;
      const hasAvoMaterna = countItems(avoMaterna.forcas) + countItems(avoMaterna.fraquezas) > 0 ? 1 : 0;
      const hasMae = countItems(mae.forcas) + countItems(mae.fraquezas) > 0 ? 1 : 0;

      const profPaterna = Math.min(100, Math.round(((hasAvoPaterno + hasAvoPaterna + hasPai) / 3) * 100));
      const profMaterna = Math.min(100, Math.round(((hasAvoMaterno + hasAvoMaterna + hasMae) / 3) * 100));

      const totalForcesCount = countItems(avoPaterno.forcas) + countItems(avoPaterna.forcas) + countItems(avoMaterno.forcas) + countItems(avoMaterna.forcas) + countItems(pai.forcas) + countItems(mae.forcas);
      const totalWeaknessesCount = countItems(avoPaterno.fraquezas) + countItems(avoPaterna.fraquezas) + countItems(avoMaterno.fraquezas) + countItems(avoMaterna.fraquezas) + countItems(pai.fraquezas) + countItems(mae.fraquezas);

      const euForces = countItems(eu.forcas);
      const euWeaknesses = countItems(eu.fraquezas);

      const canForces = Math.min(100, Math.round(((totalForcesCount + euForces) / 10) * 100));
      const canWeaknesses = Math.min(100, Math.round(((totalWeaknessesCount + euWeaknesses) / 10) * 100));
      const canEu = Math.min(100, Math.round(((euForces + euWeaknesses) / 4) * 100));

      const totalScore = Math.min(100, Math.round((profPaterna + profMaterna + canForces + canWeaknesses + canEu) / 5));

      let classification = "Mapeamento Transgeracional Inicial / Difuso";
      if (totalScore >= 75) classification = "Consciência Transgeracional Altamente Integrada";
      else if (totalScore >= 50) classification = "Consciência Sistêmica em Desenvolvimento";

      return {
        totalScore,
        classification,
        subscales: {
          "Profundidade Linhagem Paterna": profPaterna,
          "Profundidade Linhagem Materna": profMaterna,
          "Mapeamento de Forças Hereditárias": canForces,
          "Índice de Consciência de Vulnerabilidades": canWeaknesses,
          "Autoconsciência Individual (EU)": canEu
        }
      };
    }

    if (tool.id === "linha_vida") {
      const activeEvents = lifeLineEvents.filter(e => e.age.trim() !== "" && e.type !== "" && e.description.trim() !== "");
      const totalCount = activeEvents.length;
      const posCount = activeEvents.filter(e => e.type === "positive").length;
      const negCount = activeEvents.filter(e => e.type === "negative").length;

      const explorerScore = Math.min(100, totalCount * 20); // 5 events to reach 100%
      const resilienciaScore = totalCount > 0 ? Math.round((posCount / totalCount) * 100) : 50;
      const elaboracaoScore = totalCount > 0 ? Math.round((negCount / totalCount) * 100) : 50;
      const icbScore = Math.min(100, Math.round((totalCount * 12) + (posCount * 4) + (negCount * 4)));

      const totalScore = Math.min(100, Math.round((explorerScore + resilienciaScore + icbScore) / 3));

      let classification = "Mapeamento Biográfico Inicial / Parcial";
      if (totalScore >= 75) classification = "Alta Integração Dinâmica e Resiliência Biográfica Sistematizada";
      else if (totalScore >= 50) classification = "Estruturação Biográfica e Consciência Histórica Equilibrada";
      else if (totalScore >= 30) classification = "Mapeamento em Processamento de Adversidades";

      return {
        totalScore,
        classification,
        subscales: {
          "Amplitude de Autoexploração": explorerScore,
          "Estabilidade e Recursos (Positivos)": resilienciaScore,
          "Elaboração de Adversidades (Negativos)": elaboracaoScore,
          "Índice de Conexão Biográfica (ICB)": icbScore
        }
      };
    }

    if (tool.id === "satisfacao_multidimensional") {
      const { pessoal, interpessoal, ocupacional, material, recreativa, existencial } = multidimSatisfaction;
      const sum = pessoal.satisfaction + interpessoal.satisfaction + ocupacional.satisfaction + material.satisfaction + recreativa.satisfaction + existencial.satisfaction;
      const totalScore = Math.round((sum / 60) * 100);

      let classification = "Baixa Satisfação Global (Foco em Reestruturação Existencial)";
      if (totalScore >= 75) {
        classification = "Alto Índice de Satisfação Geral e Plenitude Multidimensional";
      } else if (totalScore >= 50) {
        classification = "Satisfação Moderada Equilibrada com Áreas de Aperfeiçoamento";
      } else if (totalScore >= 35) {
        classification = "Satisfação Instável com Sintomatologia de Bloqueios/Frustração";
      }

      return {
        totalScore,
        classification,
        subscales: {
          "Dimensão Pessoal (Corporal/Autocuidado)": pessoal.satisfaction * 10,
          "Dimensão Interpessoal (Social/Afetiva)": interpessoal.satisfaction * 10,
          "Dimensão Ocupacional (Trabalho/Estudos)": ocupacional.satisfaction * 10,
          "Dimensão Material (Renda/Conforto)": material.satisfaction * 10,
          "Dimensão Recreativa (Hobbies/Lazer)": recreativa.satisfaction * 10,
          "Dimensão Existencial (Propósito/Valores)": existencial.satisfaction * 10
        }
      };
    }

    if (tool.id === "radar_multidimensional") {
      const { valor_pessoal, saude, autocuidado, amizade, familia, intimidade, estudo, trabalho, conquistas, indep_financ, patrimonio, qualidade_vida, lazer, hobbies, passatempo, metas_vida, espiritualidade, ativismo_ideol } = radarSubscales;
      const sum = valor_pessoal + saude + autocuidado + amizade + familia + intimidade + estudo + trabalho + conquistas + indep_financ + patrimonio + qualidade_vida + lazer + hobbies + passatempo + metas_vida + espiritualidade + ativismo_ideol;
      const totalScore = Math.round((sum / 180) * 100);

      let classification = "Desequilíbrio Vital Relevante (Bloqueios e Demandas Clínicas)";
      if (totalScore >= 75) {
        classification = "Alto Equilíbrio Vital e Alinhamento Radial Harmonioso";
      } else if (totalScore >= 50) {
        classification = "Equilíbrio Vital Moderado com Áreas Setoriais Desalinhadas";
      } else if (totalScore >= 35) {
        classification = "Desalinhamento Vital Significativo com Demandas de Enfrentamento";
      }

      const pessoalAvg = Math.round(((valor_pessoal + saude + autocuidado) / 3) * 10);
      const interpessoalAvg = Math.round(((amizade + familia + intimidade) / 3) * 10);
      const ocupacionalAvg = Math.round(((estudo + trabalho + conquistas) / 3) * 10);
      const materialAvg = Math.round(((indep_financ + patrimonio + qualidade_vida) / 3) * 10);
      const recreativaAvg = Math.round(((lazer + hobbies + passatempo) / 3) * 10);
      const existencialAvg = Math.round(((metas_vida + espiritualidade + ativismo_ideol) / 3) * 10);

      return {
        totalScore,
        classification,
        subscales: {
          "Equilíbrio Pessoal (Ativos)": pessoalAvg,
          "Equilíbrio Interpessoal (Laços)": interpessoalAvg,
          "Equilíbrio Ocupacional (Atuação)": ocupacionalAvg,
          "Equilíbrio Material (Subsistência)": materialAvg,
          "Equilíbrio Recreativo (Saturação)": recreativaAvg,
          "Equilíbrio Existencial (Propósito)": existencialAvg
        }
      };
    }

    if (tool.id === "radar_habilidades") {
      const sum = Object.values(skillsRadarSubscales).reduce((acc: number, v: number) => acc + v, 0) as number;
      const totalScore = Math.round((sum / 100) * 100);

      let classification = "Baixa Amplitude Geral de Habilidades Psicológicas (Necessidades Críticas)";
      if (totalScore >= 75) {
        classification = "Alta Fortitude e Amplitude de Habilidades Psicológicas (THP Harmonioso)";
      } else if (totalScore >= 50) {
        classification = "Amplitude Geral Moderada com Lactâncias Setoriais Específicas";
      } else if (totalScore >= 35) {
        classification = "Amplitude Insuficiente com Necessidades de Estruturação Terapêutica";
      }

      return {
        totalScore,
        classification,
        subscales: {
          "Autoconhecimento": (skillsRadarSubscales.autoconhecimento || 0) * 10,
          "Autoestima": (skillsRadarSubscales.autoestima || 0) * 10,
          "Racionalidade": (skillsRadarSubscales.racionalidade || 0) * 10,
          "Regulação Emocional": (skillsRadarSubscales.regulacao_emocional || 0) * 10,
          "Enfrentamento": (skillsRadarSubscales.enfrentamento || 0) * 10,
          "Imunidade Social": (skillsRadarSubscales.imunidade_social || 0) * 10,
          "Autocontrole": (skillsRadarSubscales.autocontrole || 0) * 10,
          "Sociabilidade": (skillsRadarSubscales.sociabilidade || 0) * 10,
          "Sensibilidade": (skillsRadarSubscales.sensibilidade || 0) * 10,
          "Hedonismo": (skillsRadarSubscales.hedonismo || 0) * 10
        }
      };
    }

    if (tool.id === "exame_atributos_parentais") {
      if (parentalCaregivers.length === 0) {
        return {
          totalScore: 0,
          classification: "Nenhuma figura parental avaliada",
          subscales: {
            "Média de Nutrição Parental (INP)": 0,
            "Média de Estressores Parentais (ISP)": 0
          }
        };
      }

      let sumInp = 0;
      let sumIsp = 0;
      const healthyTotal = 15; // 15 healthy attributes
      const diseaseTotal = 37; // 37 non-healthy attributes (9 stressors + 28 harmfuls)

      parentalCaregivers.forEach(cg => {
        const selectedHealthy = cg.selectedAttributes.filter(id => {
          // Compare with PARENTAL_ATTRIBUTES
          return id === "atenciosos" || id === "afetuosos" || id === "cuidadores" ||
                 id === "carinhosos" || id === "gentis" || id === "maleaveis" ||
                 id === "provedores" || id === "protetores" || id === "educados" ||
                 id === "democraticos" || id === "solicitos" || id === "bondosos_1" ||
                 id === "bondosos_2" || id === "corajosos" || id === "comunicativos";
        }).length;
        
        const selectedNegative = cg.selectedAttributes.filter(id => {
          const isHealthy = id === "atenciosos" || id === "afetuosos" || id === "cuidadores" ||
                            id === "carinhosos" || id === "gentis" || id === "maleaveis" ||
                            id === "provedores" || id === "protetores" || id === "educados" ||
                            id === "democraticos" || id === "solicitos" || id === "bondosos_1" ||
                            id === "bondosos_2" || id === "corajosos" || id === "comunicativos";
          return !isHealthy;
        }).length;

        sumInp += Math.round((selectedHealthy / healthyTotal) * 100);
        sumIsp += Math.round((selectedNegative / diseaseTotal) * 100);
      });

      const avgInp = Math.round(sumInp / parentalCaregivers.length);
      const avgIsp = Math.round(sumIsp / parentalCaregivers.length);
      
      const totalScore = avgInp;

      let classification = "Baixo Fator de Integração e Amparo de Vínculos Primitivos";
      if (avgInp >= 70 && avgIsp < 15) {
        classification = "Vínculos Primitivos Nutritivos e Seguros (Apego Seguro transgeracional)";
      } else if (avgInp >= 40 && avgIsp < 30) {
        classification = "Vínculos Parentais Moderados com Ampla Integração de Recursos";
      } else if (avgIsp >= 40) {
        classification = "Forte Sobrecarga Parental ou Interferências Primitivas Hostis";
      } else if (avgInp < 40) {
        classification = "Privação ou Distanciamento Afetivo de Cuidadores Principais";
      }

      return {
        totalScore,
        classification,
        subscales: {
          "Média de Nutrição Parental (INP)": avgInp,
          "Média de Estressores Parentais (ISP)": avgIsp
        }
      };
    }

    if (tool.id === "exame_evidencias_cognicao") {
      const initialBelief = cognitiveEvidence.initialBeliefPercentage;
      const currentBelief = cognitiveEvidence.currentBeliefPercentage;
      const flexChange = initialBelief - currentBelief;
      
      const scoreContra = Math.min(5, cognitiveEvidence.evidenceAgainst.length) * 10;
      const scoreAlt = Math.min(3, cognitiveEvidence.alternativeThoughts.length) * 15;
      const scoreDelta = flexChange > 0 ? (flexChange / (initialBelief || 1)) * 100 : 0;
      
      const totalScore = Math.max(0, Math.min(100, Math.round(scoreDelta * 0.4 + scoreContra * 0.3 + scoreAlt * 0.3)));
      
      let classification = "Baixa Reestruturação Cognitiva (Pensamento Rígido)";
      if (totalScore >= 75) {
        classification = "Alta Flexibilidade Cognitiva (Raciocínio Altamente Realista-Otimista)";
      } else if (totalScore >= 50) {
        classification = "Reestruturação Moderada com Redução de Enviesamentos Críticos";
      } else if (totalScore >= 30) {
        classification = "Flexibilidade Cognitiva Insuficiente (Adesão Parcial à Crença)";
      }

      return {
        totalScore,
        classification,
        subscales: {
          "Convencimento Inicial da Crença": initialBelief,
          "Convencimento Atual da Crença": currentBelief,
          "Fator de Flexibilização": Math.max(0, flexChange)
        }
      };
    }

    if (tool.id === "reestruturacao_semantica") {
      const totalDes = [
        ...semanticRestructuring.synonyms,
        ...semanticRestructuring.antonyms
      ].filter(item => item.isDesadaptative).length;

      const explained = [
        ...semanticRestructuring.synonyms,
        ...semanticRestructuring.antonyms
      ].filter(item => item.isDesadaptative && item.explanation && item.explanation.trim().length > 5).length;

      const totalScore = Math.min(100, Math.round(
        (totalDes > 0 ? (explained / totalDes) * 50 : 30) + 
        (Math.min(3, semanticRestructuring.socraticQuestions.filter(q => q.answer.trim().length > 5).length) * 10) +
        (semanticRestructuring.healthyDefinition.trim().length > 10 ? 20 : 0)
      ));

      let classification = "Fusão Semântica Rígida (Preconceito de Rótulos)";
      if (totalScore >= 75) {
        classification = "Excelente Dissociação Semântica (Significados Altamente Flexibilizados)";
      } else if (totalScore >= 50) {
        classification = "Dissociação Semântica Moderada com Reelaboração Conceitual";
      } else if (totalScore >= 30) {
        classification = "Quebra Parcial de Fusão Semântica (Adesão Parcial a Regras Rígidas)";
      }

      return {
        totalScore,
        classification,
        subscales: {
          "Associações Disfuncionais": totalDes,
          "Rótulos Resignificados": explained,
          "Índice de Dissociação Semântica (IDS)": totalScore
        }
      };
    }

    if (tool.id === "exame_desenvolvimento_autoestima") {
      const activeSatisfaction = selfEsteem.dimensions.reduce((acc, d) => acc + d.satisfaction, 0);
      const totalScore = Math.round((activeSatisfaction / (selfEsteem.dimensions.length * 10)) * 100);

      const totalGoals = selfEsteem.dimensions.reduce((acc, d) => acc + d.developGoals.length, 0);
      const hpsMapped = selfEsteem.dimensions.reduce((acc, d) => acc + d.relatedHPs.length, 0);
      const developmentScore = Math.min(100, Math.round(
        (totalGoals * 10) + (hpsMapped * 5) + (selfEsteem.actionStrategy.trim().length > 15 ? 25 : 0)
      ));

      let classification = "Autoestima Rebaixada com Necessidade de Auto-investimento";
      if (totalScore >= 75) {
        classification = "Alta Autoestima e Autoapreciação Consolidada";
      } else if (totalScore >= 50) {
        classification = "Autoestima Moderada com Focos Normativos de Aperfeiçoamento";
      } else if (totalScore >= 35) {
        classification = "Autoestima Insegura com Dependência Interpessoal ou Corporal";
      }

      return {
        totalScore,
        classification,
        subscales: {
          "Índice de Autoestima Global (IAG)": totalScore,
          "Auto-investimento Programado (IDA)": developmentScore,
          "Esferas com Metas de Crescimento": selfEsteem.dimensions.filter(d => d.developGoals.length > 0).length
        }
      };
    }

    if (tool.id === "cartao_enfrentamento") {
      const totalCards = copingCards.cards.length;
      const avgConviction = totalCards > 0 
        ? Math.round(copingCards.cards.reduce((acc, c) => acc + c.convictionRating, 0) / totalCards) 
        : 0;

      const cardsEfficiencyList = copingCards.cards.map(c => {
        let score = 30; // base score for written narrative
        if (c.distortionsSelected.length > 0) score += 15;
        if (c.passesScientificCheck) score += 15;
        if (c.passesCircumstanceCheck) score += 10;
        if (c.scientificObservation && c.scientificObservation.length > 15) score += 10;
        const ethicalCount = Object.values(c.ethicalCheck).filter(Boolean).length;
        score += (ethicalCount * 5); // max 15
        score += Math.round((c.convictionRating / 100) * 15); // max 15
        return Math.min(100, score);
      });

      const avgEfficiency = cardsEfficiencyList.length > 0 
        ? Math.round(cardsEfficiencyList.reduce((acc, val) => acc + val, 0) / cardsEfficiencyList.length)
        : 0;

      let classification = "Necessidade de Maior Embasamento Lógico e Validação Ético-Científica nos Cartões";
      if (avgEfficiency >= 75) {
        classification = "Excelente Capacidade de Reestruturação por Auto-Instrução Consolidada";
      } else if (avgEfficiency >= 50) {
        classification = "Habilidade Geral Prática com Bons Desdobramentos de Enfrentamento Ativo";
      } else if (avgEfficiency >= 30) {
        classification = "Grau Inicial de Reestruturação Narrativa com necessidade de calibração pragmática";
      }

      return {
        totalScore: avgEfficiency,
        classification,
        subscales: {
          "Eficácia do Enfrentamento (IEE)": avgEfficiency,
          "Adesão e Convicção Média (ACM)": avgConviction,
          "Volume de Cartões Consolidados": totalCards
        }
      };
    }

    if (tool.id === "despolarizacao_alternativas") {
      const totalBlocks = despolarizacao.blocks.length;
      if (totalBlocks === 0) {
        return {
          totalScore: 0,
          classification: "Nenhum Tema Mapeado para Despolarização",
          subscales: {
            "Índice de Moderação Cognitiva (IMC)": 0,
            "Adesão à Alternativa Intermediária": 0,
            "Temas Mapeados": 0
          }
        };
      }

      const blockScoresList = despolarizacao.blocks.map(b => {
        let score = 30; // base for completing content
        
        // Assess extremes distance (severity)
        if (b.leftExtremism > 3 && b.rightExtremism > 3) {
          score += 15; // recognized major polarization dynamics
        }

        // Checking evidence constraints
        const checkedCount = Object.values(b.checkedPoints).filter(Boolean).length;
        score += (checkedCount * 12); // max 36

        // Scaled by conviction in intermediate thought
        score += Math.round((b.intermediateConviction / 100) * 19); // max 19

        return Math.min(100, score);
      });

      const avgIMC = Math.round(blockScoresList.reduce((acc, val) => acc + val, 0) / totalBlocks);
      const avgConviction = Math.round(despolarizacao.blocks.reduce((acc, b) => acc + b.intermediateConviction, 0) / totalBlocks);

      let classification = "Necessidade de Maior Equilíbrio de Evidências e Redução de Rigidezes Cognitivas";
      if (avgIMC >= 75) {
        classification = "Alta Flexibilidade Cognitiva e Excelente Moderação Logística de Extremos";
      } else if (avgIMC >= 50) {
        classification = "Moderada Integração Racional de Contrapontos e Sintonia Saudável";
      } else if (avgIMC >= 30) {
        classification = "Raciocínio Polarizado Recorrente com Esforços Iniciais de Integração";
      }

      return {
        totalScore: avgIMC,
        classification,
        subscales: {
          "Índice de Moderação Cognitiva (IMC)": avgIMC,
          "Convicção no Ponto Intermediário": avgConviction,
          "Volume de Conflitos Despolarizados": totalBlocks
        }
      };
    }

    if (tool.id === "espectro_cognitivo") {
      const totalScenarios = espectroCognitivo.scenarios.length;
      if (totalScenarios === 0) {
        return {
          totalScore: 0,
          classification: "Nenhuma Situação Mapeada no Espectro Cognitivo",
          subscales: {
            "Índice de Equilíbrio do Espectro (IEE)": 0,
            "Adesão à Reestruturação": 0,
            "Cenários Mapeados": 0
          }
        };
      }

      const scenarioScoresList = espectroCognitivo.scenarios.map(s => {
        let score = 20; // completed basic presence
        
        const keys: ("catastrofismo" | "pessimismo" | "realismo" | "otimismo" | "utopismo")[] = ["catastrofismo", "pessimismo", "realismo", "otimismo", "utopismo"];
        keys.forEach(k => {
          const val = s[k] as string;
          if (val && val.length > 15 && !val.includes("Ex: ") && !val.includes("Tudo vai sempre dar errado:")) {
            score += 8; // max 40
          }
        });

        if (s.jointSynthesis && s.jointSynthesis.length > 20) {
          score += 15;
        }

        score += Math.round((s.convictionSynthesis / 100) * 25); // max 25

        return Math.min(100, score);
      });

      const avgIEE = Math.round(scenarioScoresList.reduce((acc, val) => acc + val, 0) / totalScenarios);
      const avgConviction = Math.round(espectroCognitivo.scenarios.reduce((acc, s) => acc + s.convictionSynthesis, 0) / totalScenarios);

      let classification = "Necessidade de Redução de Vieses Extremos (Catastrofismo/Pessimismo)";
      if (avgIEE >= 75) {
        classification = "Excelente Flexibilidade no Trânsito de Perspectivas e Alinhamento Realístico-Otimista";
      } else if (avgIEE >= 50) {
        classification = "Moderada Capacidade de Desgarrar de Extremos e Enxergar Matizes Reais";
      } else if (avgIEE >= 30) {
        classification = "Tentativas Iniciais de Desgaste das Crenças com Permanência Frequente nas Margens";
      }

      return {
        totalScore: avgIEE,
        classification,
        subscales: {
          "Índice de Equilíbrio do Espectro (IEE)": avgIEE,
          "Convicção na Lente Realístico-Otimista": avgConviction,
          "Cenários de Espectro Mapeados": totalScenarios
        }
      };
    }

    if (tool.id === "rid_interacoes") {
      const totalInteractions = ridInteracoes.interactions.length;
      if (totalInteractions === 0) {
        return {
          totalScore: 0,
          classification: "Nenhuma Interação Mapeada no RID",
          subscales: {
            "Índice de Completude de Autoconsciência (ICA)": 0,
            "Volume de Interações Mapeadas": 0,
            "Pontuação Média de Reflexão": 0
          }
        };
      }

      const scoreList = ridInteracoes.interactions.map(item => {
        let score = 10; // completed basic presence
        const fieldsToTest = [
          "situation", "necessity", "realStressors", "distortedStressors", "lifeHistory",
          "cognitions", "emotions", "excessActions", "deficitActions",
          "immediateReinforcement", "immediatePunishment", "finalReinforcement", "finalPunishment"
        ];

        let filledCount = 0;
        fieldsToTest.forEach(f => {
          const val = item[f as keyof typeof item] as string;
          if (val && val.length > 20 && !val.includes("Ex: ") && !val.startsWith("Situação:") && !val.startsWith("Necessidade") && !val.includes("...")) {
            filledCount++;
          }
        });

        score += (filledCount * 7); // max 91. 10 + 91 = 101, capped at 100
        return Math.min(100, score);
      });

      const avgICA = Math.round(scoreList.reduce((acc, val) => acc + val, 0) / totalInteractions);

      let classification = "Autoconsciência Inicial (Menor Autoconhecimento dos Padrões Operantes)";
      if (avgICA >= 80) {
        classification = "Excelente Diferenciação e Nitidez Psicoeducativa de Padrões Autoderrotistas";
      } else if (avgICA >= 50) {
        classification = "Moderada Autoconsciência Funcional com Potencial de Manejo de Excessos";
      } else if (avgICA >= 30) {
        classification = "Mapeamento Primário de Gatilhos com Necessidade de Refinamento Terapêutico";
      }

      return {
        totalScore: avgICA,
        classification,
        subscales: {
          "Índice de Completude de Autoconsciência (ICA)": avgICA,
          "Volume de Interações Mapeadas": totalInteractions,
          "Pontuação Média de Reflexão": avgICA
        }
      };
    }

    if (tool.id === "transicao_mecanismo") {
      const totalTransitions = transicaoMecanismo.transitions.length;
      if (totalTransitions === 0) {
        return {
          totalScore: 0,
          classification: "Nenhum Padrão de Transição Mapeado",
          subscales: {
            "Índice de Eficácia Transicional (IET)": 0,
            "Total de Mecanismos Sincronizados": 0,
            "Mapeamento Funcional de Atitudes": 0
          }
        };
      }

      const scoreList = transicaoMecanismo.transitions.map(item => {
        let score = 15;
        const disfunctionalFields = [
          "disfunctionalSchema", "disfunctionalThought", "disfunctionalBehavior", "disfunctionalResults", "disfunctionalDisadvantages"
        ];
        const functionalFields = [
          "functionalSchema", "functionalThought", "functionalBehavior", "functionalResultsKey", "functionalAdvantages"
        ];

        let filledDisf = 0;
        disfunctionalFields.forEach(f => {
          const val = item[f as keyof typeof item] as string;
          if (val && val.length > 15 && !val.includes("Esquema desregulado") && !val.includes("...")) filledDisf++;
        });

        let filledFunc = 0;
        functionalFields.forEach(f => {
          const val = item[f as keyof typeof item] as string;
          if (val && val.length > 15 && !val.includes("Esquema saudável") && !val.includes("...")) filledFunc++;
        });

        score += (filledDisf * 6); // max 30
        score += (filledFunc * 11); // max 55
        return Math.min(100, score);
      });

      const avgIET = Math.round(scoreList.reduce((acc, val) => acc + val, 0) / totalTransitions);

      let classification = "Mecanismo Disfuncional Altamente Ativo e Dominante";
      if (avgIET >= 85) {
        classification = "Excepcional Clareza Diagnóstica e Alta Resolução Funcional de Hábitos Autoderrotistas";
      } else if (avgIET >= 55) {
        classification = "Transição Ativa em Progresso: Delineamento Maduro da Conduta Adaptativa";
      } else if (avgIET >= 30) {
        classification = "Fase Inicial de Identificação com Pouco Ensaio Comportamental Saudável";
      }

      return {
        totalScore: avgIET,
        classification,
        subscales: {
          "Índice de Eficácia Transicional (IET)": avgIET,
          "Total de Mecanismos Sincronizados": totalTransitions,
          "Balanço Decisório Saudável": avgIET
        }
      };
    }

    if (tool.id === "exame_duplo_vantagens") {
      const allItems = [
        ...exameDuploVantagens.pros1,
        ...exameDuploVantagens.contras1,
        ...exameDuploVantagens.pros2,
        ...exameDuploVantagens.contras2
      ];
      const totalCount = allItems.length;

      if (totalCount === 0) {
        return {
          totalScore: 0,
          classification: "Nenhum Fator Decisório Cadastrado",
          subscales: {
            "Índice de Racionalidade Realista (IRR)": 0,
            "Total de Fatores Cadastrados": 0,
            "Eficácia de Filtragem de Vieses": 0
          }
        };
      }

      // Basic progress: 10 pts per factor (up to 50)
      const baseCompletionScore = Math.min(50, totalCount * 10);

      // Cognitive adjustment points: elements marked as fantasy that have been successfully adjusted (15pts each, up to 50)
      const fantasyItems = allItems.filter(i => i.isFantasy);
      const adjustedFantasyCount = fantasyItems.filter(i => i.realistAdjustment && i.realistAdjustment.length > 10).length;
      
      const adjustmentPoints = fantasyItems.length > 0 
        ? Math.round((adjustedFantasyCount / fantasyItems.length) * 50)
        : 50; // if no fantasy is detected, the thought is already realistic

      const totalDecisionScore = Math.min(100, baseCompletionScore + adjustmentPoints);

      let classification = "Ambivalência Rígida com Alta Influência de Fantasias Evitativas/Idealizadas";
      if (totalDecisionScore >= 85) {
        classification = "Excepcional Nível de Raciocínio Otimista-Realista e Clareza Decisória";
      } else if (totalDecisionScore >= 55) {
        classification = "Capacidade Decisória Equilibrada com Exercício Ativo de Descatastrofização";
      } else if (totalDecisionScore >= 30) {
        classification = "Resolução de Conflitos em Estágio Inicial com Ambivalência Ativa";
      }

      return {
        totalScore: totalDecisionScore,
        classification,
        subscales: {
          "Índice de Racionalidade Realista (IRR)": totalDecisionScore,
          "Total de Fatores Cadastrados": totalCount,
          "Eficácia de Filtragem de Vieses": adjustmentPoints
        }
      };
    }

    if (tool.id === "exame_feedbacks_entrevista") {
      const allItems = exameFeedbacksEntrevista.items;
      const totalCount = allItems.length;

      if (totalCount === 0) {
        return {
          totalScore: 0,
          classification: "Nenhum Feedback Registrado",
          subscales: {
            "Índice de Racionalidade de Feedback (IRF)": 0,
            "Total de Depoimentos Cadastrados": 0,
            "Eficácia de Filtragem do Self": 0
          }
        };
      }

      const totalCientifico = allItems.map(item => {
        return (item.correspondenciaRealidade + item.verificabilidade + item.justicaConceitual) / 3;
      });
      
      const avgScientificVal = totalCientifico.reduce((a, b) => a + b, 0) / totalCount;
      const avgEthicalVal = allItems.reduce((sum, item) => sum + item.integridadeEtica, 0) / totalCount;

      const irfScore = Math.min(100, Math.round((avgScientificVal * 10) + (avgEthicalVal * 10)));

      const filterHits = allItems.filter(item => {
        const isFeedbackRacional = (item.correspondenciaRealidade + item.verificabilidade + item.justicaConceitual) / 3 >= 3.5;
        if (isFeedbackRacional && (item.classificacao === "defice_real" || item.classificacao === "reforco_potencial")) {
          return true;
        }
        if (!isFeedbackRacional && (item.classificacao === "ruido_injusto" || item.classificacao === "incoerente")) {
          return true;
        }
        return false;
      }).length;

      const filtroEficaciaScore = Math.round((filterHits / totalCount) * 100);

      let classification = "Alta Vulnerabilidade ao Ruído Crítico Interpessoal";
      if (irfScore >= 80 && filtroEficaciaScore >= 80) {
        classification = "Excelente Funcionamento de Imunidade Social e Assertividade Perceptiva";
      } else if (irfScore >= 60) {
        classification = "Imunidade Social Equilibrada com Assimilação Moderada";
      }

      return {
        totalScore: irfScore,
        classification,
        subscales: {
          "Índice de Racionalidade de Feedback (IRF)": irfScore,
          "Total de Depoimentos Cadastrados": totalCount,
          "Eficácia de Filtragem do Self": filtroEficaciaScore
        }
      };
    }

    if (tool.id === "exame_atributos_pessoais") {
      const sgCount = exameAtributosPessoais.souGosto.length;
      const sngCount = exameAtributosPessoais.souNaoGosto.length;
      const nsgCount = exameAtributosPessoais.naoSouGostaria.length;
      const nsgnCount = exameAtributosPessoais.naoSouGostoNao.length;
      const totalCount = sgCount + sngCount + nsgCount + nsgnCount;

      if (totalCount === 0) {
        return {
          totalScore: 0,
          classification: "Nenhum Atributo Registrado",
          subscales: {
            "Índice de Satisfação Consciencial (ISC)": 0,
            "Potencial de Desenvolvimento de HPs (PDH)": 0,
            "Acurácia de Autoimagem Crítica": 0
          }
        };
      }

      const iscScore = Math.round(((sgCount + nsgnCount) / totalCount) * 100);
      
      const structuralProjects = exameAtributosPessoais.naoSouGostaria.filter(item => item.contextOrNotes && item.contextOrNotes.length > 15).length;
      const pdhScore = nsgCount > 0
        ? Math.round((structuralProjects / nsgCount) * 100)
        : 100;

      const mappedVulnerabilities = exameAtributosPessoais.souNaoGosto.filter(item => item.contextOrNotes && item.contextOrNotes.length > 15).length;
      const icvScore = sngCount > 0
        ? Math.round((mappedVulnerabilities / sngCount) * 100)
        : 100;

      const aggregateScore = Math.round((iscScore * 0.4) + (pdhScore * 0.3) + (icvScore * 0.3));

      let classification = "Mapeamento Primário de Autoimagem";
      if (aggregateScore >= 80) {
        classification = "Excelente Nível de Autoconsciência Dinâmica e Projetos de HP Alinhados";
      } else if (aggregateScore >= 50) {
        classification = "Autoconsciência em Consolidação com Desafios de Enfrentamento";
      }

      return {
        totalScore: aggregateScore,
        classification,
        subscales: {
          "Índice de Satisfação Consciencial (ISC)": iscScore,
          "Potencial de Desenvolvimento de HPs (PDH)": pdhScore,
          "Acurácia de Autoimagem Crítica": icvScore
        }
      };
    }

    if (tool.id === "exame_singulares_compartilhadas") {
      const singulars = exameSingularesCompartilhadas.attributes.filter(a => a.nature === "singular");
      const shareds = exameSingularesCompartilhadas.attributes.filter(a => a.nature === "compartilhada");

      const sCount = singulars.length;
      const cCount = shareds.length;
      const totalCount = exameSingularesCompartilhadas.attributes.length;

      if (totalCount === 0) {
        return {
          totalScore: 0,
          classification: "Sem Registros de Autoimagem",
          subscales: {
            "Índice de Exclusividade Identitária (IEI)": 0,
            "Índice de Pertencimento Compartilhado (IPC)": 0,
            "Sinergia da Autoestima (SAS)": 0
          }
        };
      }

      const ieiScore = Math.min(100, sCount * 25 + (singulars.filter(a => a.howItBuildsSelfEsteem.length > 15).length * 8));
      const ipcScore = Math.min(100, cCount * 25 + (shareds.filter(a => a.howItBuildsSelfEsteem.length > 15).length * 8));
      const balanceFactor = totalCount > 0 ? 1 - Math.abs(sCount - cCount) / totalCount : 0;
      const rawSas = totalCount > 0 ? ((ieiScore + ipcScore) / 2) * (0.6 + 0.4 * balanceFactor) : 0;
      const sasScore = Math.min(100, Math.round(rawSas));

      let classification = "Ancoragem Frágil ou Fracionada de Autoestima";
      if (sasScore >= 80) {
        classification = "Perfeita Sinergia Identitária (Identidade Singular e Pertencimento Pleno)";
      } else if (sasScore >= 50) {
        classification = "Integração Moderada de Autoimagem com Pequena Dissociação";
      }

      return {
        totalScore: sasScore,
        classification,
        subscales: {
          "Índice de Exclusividade Identitária (IEI)": ieiScore,
          "Índice de Pertencimento Compartilhado (IPC)": ipcScore,
          "Sinergia da Autoestima (SAS)": sasScore
        }
      };
    }

    if (tool.id === "exame_provisao_emocional") {
      const items = [
        { id: "pe_1", category: "SAC" },
        { id: "pe_2", category: "SAC" },
        { id: "pe_3", category: "SAC" },
        { id: "pe_4", category: "SAC" },
        { id: "pe_5", category: "SAV" },
        { id: "pe_6", category: "SAC" },
        { id: "pe_7", category: "SAV" },
        { id: "pe_8", category: "SAC" },
        { id: "pe_9", category: "SAV" },
        { id: "pe_10", category: "SAV" },
        { id: "pe_11", category: "SAV" },
        { id: "pe_12", category: "SAC" },
        { id: "pe_13", category: "SAV" },
        { id: "pe_14", category: "SAC" },
        { id: "pe_15", category: "SAV" },
        { id: "pe_16", category: "SAV" },
        { id: "pe_17", category: "SAV" },
        { id: "pe_18", category: "SAV" },
        { id: "pe_19", category: "SAV" },
        { id: "pe_20", category: "SAC" },
        { id: "pe_21", category: "SAV" },
        { id: "pe_22", category: "SAC" },
        { id: "pe_23", category: "SAC" }
      ];

      const numericValue = (val: string): number => {
        if (val === "N") return 0;
        if (val === "P") return 1;
        if (val === "M") return 2;
        if (val === "S") return 3;
        return 0;
      };

      const ratedItems = items.filter(item => exameProvisaoEmocional.ratings[item.id] !== undefined && exameProvisaoEmocional.ratings[item.id] !== "");
      const totalRated = ratedItems.length;

      if (totalRated === 0) {
        return {
          totalScore: 0,
          classification: "Sem Avaliação Completa",
          subscales: {
            "Índice de Provisão Emocional Global (IPEG)": 0,
            "Subíndice de Aceitação e Conexão (SAC)": 0,
            "Subíndice de Autonomia e Valorização (SAV)": 0
          }
        };
      }

      const totalEarnedAll = ratedItems.reduce((acc, item) => acc + numericValue(exameProvisaoEmocional.ratings[item.id]), 0);
      const totalPossibleAll = totalRated * 3;
      const ipegScore = Math.round((totalEarnedAll / totalPossibleAll) * 100);

      const sacItems = ratedItems.filter(item => item.category === "SAC");
      const sacEarned = sacItems.reduce((acc, item) => acc + numericValue(exameProvisaoEmocional.ratings[item.id]), 0);
      const sacPossible = sacItems.length * 3;
      const sacScore = sacPossible > 0 ? Math.round((sacEarned / sacPossible) * 105 / 105 * 100) : 0; // standard clean calc

      const savItems = ratedItems.filter(item => item.category === "SAV");
      const savEarned = savItems.reduce((acc, item) => acc + numericValue(exameProvisaoEmocional.ratings[item.id]), 0);
      const savPossible = savItems.length * 3;
      const savScore = savPossible > 0 ? Math.round((savEarned / savPossible) * 100) : 0;

      let classification = "Sem Avaliação Completa";
      if (totalRated > 12) {
        if (ipegScore >= 75) {
          classification = "Sólida Provisão Emocional Histórica (Vínculos Seguros Predominantes)";
        } else if (ipegScore >= 45) {
          classification = "Disponibilidade Emocional Flutuante ou Condicional";
        } else {
          classification = "Nível Crítico de Provisão Emocional Histórica (Privação e Solidão)";
        }
      }

      return {
        totalScore: ipegScore,
        classification,
        subscales: {
          "Índice de Provisão Emocional Global (IPEG)": ipegScore,
          "Subíndice de Aceitação e Conexão (SAC)": sacScore,
          "Subíndice de Autonomia e Valorização (SAV)": savScore
        }
      };
    }

    if (tool.id === "exame_atitudes_dimensoes") {
      const dimensions = ["pessoal", "interpessoal", "ocupacional", "material", "recreativa", "existencial"];
      const satisVals = dimensions.map(d => exameAtitudesDimensoes.satisfaction[d] !== undefined ? exameAtitudesDimensoes.satisfaction[d] : 0);
      const satisCount = dimensions.filter(d => exameAtitudesDimensoes.satisfaction[d] !== undefined).length;
      
      const averageSat = satisCount > 0 ? (satisVals.reduce((acc, v) => acc + v, 0) / satisCount) : 0;
      const nceScore = Math.round(averageSat * 10); // 0-100 score

      let filledFieldsCount = 0;
      dimensions.forEach(d => {
        const cell = exameAtitudesDimensoes.cells[d] || { sou: "", faco: "", tenho: "" };
        if (cell.sou?.trim()) filledFieldsCount++;
        if (cell.faco?.trim()) filledFieldsCount++;
        if (cell.tenho?.trim()) filledFieldsCount++;
      });
      const ipgScore = Math.round((filledFieldsCount / 18) * 100);

      let classification = "Análise Multidimensional Inicial";
      if (satisCount >= 4) {
        if (nceScore >= 75) {
          classification = "Alto Alinhamento Existencial e Satisfação Coerente";
        } else if (nceScore >= 45) {
          classification = "Alinhamento Existencial Moderado / Desequilíbrio de Polaridades";
        } else {
          classification = "Colapso Multidimensional / Desconexão Existencial Severa";
        }
      }

      return {
        totalScore: nceScore,
        classification,
        subscales: {
          "Índice de Preenchimento Geral (IPG)": ipgScore,
          "Nível de Coerência Existencial (NCE)": nceScore,
          "Áreas em Desequilíbrio Crítico": dimensions.filter(d => (exameAtitudesDimensoes.satisfaction[d] || 0) < 5).length
        }
      };
    }

    if (tool.id === "exame_reacoes_sociais") {
      const activeCtxId = exameReacoesSociais.activeContextId || "geral";
      const activeCData = exameReacoesSociais.contexts?.[activeCtxId] || {
        checkedReactions: [],
        customReactions: [],
        intensities: {},
        precipitators: {},
        alternatives: {}
      };

      const selectedList = LIST_SOCIAL_REACTIONS.filter(r => activeCData.checkedReactions.includes(r.id));
      const selectedCust = activeCData.customReactions.filter(r => activeCData.checkedReactions.includes(r.id));
      const totalChecked = selectedList.length + selectedCust.length;

      const posCount = selectedList.filter(r => r.type === "positive").length + selectedCust.filter(r => r.type === "positive").length;
      const negCount = totalChecked - posCount;

      const harmonyFactor = totalChecked > 0 ? Math.round((posCount / totalChecked) * 100) : 50;

      // Calculate how many of the checked items have filled inputs
      let completeCount = 0;
      const allSelected = [...selectedList, ...selectedCust];
      allSelected.forEach(r => {
        const prep = activeCData.precipitators[r.id]?.trim() || "";
        const alt = activeCData.alternatives[r.id]?.trim() || "";
        if (prep || alt) {
          completeCount++;
        }
      });
      const icisScore = totalChecked > 0 ? Math.round((completeCount / totalChecked) * 100) : 0;

      let classification = "Mapeamento Sociométrico Inicial";
      if (totalChecked > 0) {
        if (harmonyFactor >= 70) {
          classification = "Predomínio de Relações Coerentes / Sinergia Social Elevada";
        } else if (harmonyFactor >= 40) {
          classification = "Balanço Interpessoal Moderado (Presença de Conflitos ou Atritos)";
        } else {
          classification = "Vulnerabilidade Interpessoal Severa (Predomínio de Conflitos / Ambientes Ácidos)";
        }
      }

      return {
        totalScore: harmonyFactor,
        classification,
        subscales: {
          "Índice de Consciência de Impacto Social (ICIS)": icisScore,
          "Fator de Harmonia Interpessoal (FHI)": harmonyFactor,
          "Eventos Desadaptativos / Conflitos Ativos": negCount
        }
      };
    }

    if (tool.id === "hierarquia_exposicao_enfrentamento") {
      const totalItemsCount = exameHierarquiaExposicao.items.length;
      const facedItemsCount = exameHierarquiaExposicao.items.filter(i => i.status === "enfrentado").length;
      const inProgressCount = exameHierarquiaExposicao.items.filter(i => i.status === "em_progresso").length;
      const pendingCount = exameHierarquiaExposicao.items.filter(i => i.status === "pendente").length;

      const resolutionRate = totalItemsCount > 0 ? Math.round((facedItemsCount / totalItemsCount) * 100) : 0;

      const maxPossiblePoints = totalItemsCount * 30;
      const cumulativeActivePoints = exameHierarquiaExposicao.items.reduce((acc, i) => {
        if (i.status === "pendente") return acc + i.total;
        if (i.status === "em_progresso") return acc + (i.total * 0.5);
        return acc;
      }, 0);

      const activeLoadIndex = maxPossiblePoints > 0 ? Math.round((cumulativeActivePoints / maxPossiblePoints) * 100) : 0;

      let classification = "Sem Circunstâncias Registradas";
      if (totalItemsCount > 0) {
        if (activeLoadIndex >= 70) {
          classification = "Carga de Evitação Fóbica Crítica";
        } else if (activeLoadIndex >= 40) {
          classification = "Carga de Enfrentamento Moderada";
        } else {
          classification = "Carga Sob Controle (Altamente Resiliente)";
        }
      }

      return {
        totalScore: activeLoadIndex,
        classification,
        subscales: {
          "Índice de Carga de Evitação Ativa": activeLoadIndex,
          "Taxa de Resolutividade de Exposição": resolutionRate,
          "Total de Circunstâncias Mapeadas": totalItemsCount
        }
      };
    }

    if (tool.id === "analise_modelos_pessoais") {
      const currentCount = exameModelosPessoais.currentModels?.length || 0;
      const idealCount = exameModelosPessoais.idealModels?.length || 0;
      
      const currentFilled = exameModelosPessoais.currentModels?.filter(m => m.name.trim() && m.forces.trim() && m.impact.trim()).length || 0;
      const idealFilled = exameModelosPessoais.idealModels?.filter(m => m.name.trim() && m.forces.trim() && m.impact.trim()).length || 0;

      // Modelagem Consciente Score: 25 points per well-structured model, up to 100.
      const consciousnessScore = Math.min(100, Math.round(((currentFilled * 25) + (idealFilled * 25))));

      let classification = "Nenhum Modelo Mapeado";
      if (currentCount > 0 || idealCount > 0) {
        if (consciousnessScore >= 75) {
          classification = "Modelagem Madura e Altamente Intencional";
        } else if (consciousnessScore >= 40) {
          classification = "Modelagem Ativa em Desenvolvimento";
        } else {
          classification = "Modelagem Majoritariamente Inconsciente (Pouca Direção)";
        }
      }

      return {
        totalScore: consciousnessScore,
        classification,
        subscales: {
          "Índice de Consciência de Modelagem (ICM)": consciousnessScore,
          "Proporção de Forças Prospectadas (%)": Math.min(100, Math.round((idealCount / 3) * 100)),
          "Foco em Aprendizagem e Conduta Ativa": Math.min(100, Math.round((currentCount / 3) * 100))
        }
      };
    }

    if (
      tool.id === "mentalidades_hedonismo_responsavel" ||
      tool.id === "mentalidades_autoconhecimento" ||
      tool.id === "mentalidades_autoestima" ||
      tool.id === "mentalidades_raciocinio_otimista" ||
      tool.id === "mentalidades_autorregulacao_emocional" ||
      tool.id === "mentalidades_imunidade_social" ||
      tool.id === "mentalidades_resolutividade_enfrentamento" ||
      tool.id === "mentalidades_autocontrole" ||
      tool.id === "mentalidades_sociabilidade" ||
      tool.id === "mentalidades_sensibilidade_social"
    ) {
      let activeState: ExameMentalidadesSaudaveisState;
      let title = "";
      if (tool.id === "mentalidades_hedonismo_responsavel") {
        activeState = mentalidadesHedonismo;
        title = "Hedonismo Responsável";
      } else if (tool.id === "mentalidades_autoconhecimento") {
        activeState = mentalidadesAutoconhecimento;
        title = "Autoconhecimento";
      } else if (tool.id === "mentalidades_autoestima") {
        activeState = mentalidadesAutoestima;
        title = "Autoestima";
      } else if (tool.id === "mentalidades_raciocinio_otimista") {
        activeState = mentalidadesRaciocinioOtimista;
        title = "Raciocínio Realistamente Otimista";
      } else if (tool.id === "mentalidades_autorregulacao_emocional") {
        activeState = mentalidadesAutorregulacaoEmocional;
        title = "Autorregulação Emocional";
      } else if (tool.id === "mentalidades_imunidade_social") {
        activeState = mentalidadesImunidadeSocial;
        title = "Imunidade Social";
      } else if (tool.id === "mentalidades_resolutividade_enfrentamento") {
        activeState = mentalidadesResolutividadeEnfrentamento;
        title = "Resolutividade e Enfrentamento";
      } else if (tool.id === "mentalidades_autocontrole") {
        activeState = mentalidadesAutocontrole;
        title = "Autocontrole";
      } else if (tool.id === "mentalidades_sociabilidade") {
        activeState = mentalidadesSociabilidade;
        title = "Sociabilidade";
      } else {
        activeState = mentalidadesSensibilidadeSocial;
        title = "Sensibilidade Social";
      }

      const selectedCount = activeState.selectedPhrases?.length || 0;
      const totalWrittenReflections = activeState.reflections?.filter(r => r.reflectionText.trim()).length || 0;
      const hasMantra = activeState.reflections?.some(r => r.isMantra) ? 100 : 0;

      const choiceFactor = Math.min(100, Math.round((selectedCount / 3) * 100));
      const writingFactor = Math.min(100, Math.round((totalWrittenReflections / 2) * 100));
      const totalScore = Math.round((choiceFactor * 0.4) + (writingFactor * 0.4) + (hasMantra * 0.2));

      let classification = "Iniciando Prática de Atitude";
      if (totalScore >= 80) {
        classification = `Atitude de ${title} Altamente Estruturada`;
      } else if (totalScore >= 40) {
        classification = `Atitude de ${title} em Desenvolvimento`;
      }

      return {
        totalScore,
        classification,
        subscales: {
          "Taxa de Acolhimento de Diretrizes (%)": choiceFactor,
          "Índice de Escrita Analítico-Terapêutica": writingFactor,
          "Foco e Ancoragem por Mantra Ativo": hasMantra
        }
      };
    }

    if (tool.id === "analise_criticos") {
      const totalCritics = criticList.length;
      if (totalCritics === 0) {
        return {
          totalScore: 0,
          classification: "Nenhum Crítico Mapeado",
          subscales: {
            "Capacidade de Filtragem de Ruído": 0,
            "Aproveitamento de Feedback Técnico": 0,
            "Mitigação do Impacto Emocional": 0,
            "Índice de Imunidade Social (IIS)": 0
          }
        };
      }

      const noiseCritics = criticList.filter(c => c.type === 'ignorante' || c.type === 'repetidor');
      const noiseFilterAverage = noiseCritics.length > 0
        ? Math.round((noiseCritics.reduce((sum, c) => sum + c.filterCapability, 0) / noiseCritics.length) * 10)
        : 50;

      const constructiveCritics = criticList.filter(c => c.type === 'pesquisador' || c.type === 'pensante');
      const constructiveFilterAverage = constructiveCritics.length > 0
        ? Math.round((constructiveCritics.reduce((sum, c) => sum + c.filterCapability, 0) / constructiveCritics.length) * 10)
        : 50;

      const averageImpact = criticList.reduce((sum, c) => sum + c.impactLevel, 0) / totalCritics;
      const impactMitigation = Math.round((10 - averageImpact) * 10);

      const overallFilterAverage = criticList.reduce((sum, c) => sum + c.filterCapability, 0) / totalCritics;
      const totalScore = Math.round((overallFilterAverage * 6 + (10 - averageImpact) * 4) * 10) / 10;
      const totalScoreRounded = Math.min(100, Math.round(totalScore));

      let classification = "Baixa Imunidade Social (Elevada Susceptibilidade)";
      if (totalScoreRounded >= 75) {
        classification = "Alta Autoconfiança e Imunidade Social Estruturada";
      } else if (totalScoreRounded >= 50) {
        classification = "Imunidade Social Equilibrada com Filtros Ativos";
      } else if (totalScoreRounded >= 30) {
        classification = "Reatividade Moderada (Vulnerável a Julgamentos Distorcidos)";
      }

      return {
        totalScore: totalScoreRounded,
        classification,
        subscales: {
          "Capacidade de Filtragem de Ruído": noiseFilterAverage,
          "Aproveitamento de Feedback Técnico": constructiveFilterAverage,
          "Mitigação do Impacto Emocional": impactMitigation,
          "Índice de Imunidade Social (IIS)": totalScoreRounded
        }
      };
    }

    if (tool.id === "exame_feedbacks") {
      const STANDARD_FEEDBACK_LABELS = [
        "Autoritário", "Carinhoso", "Passivo", "Inseguro", "Arrogante", "Paciente",
        "Calado", "Acomodado", "Persistente", "Responsável", "Pacificador", "Queixoso",
        "Controlador", "Ciumento", "Determinado", "Impulsivo", "Com iniciativa / proativo",
        "Crítico", "Prestativo", "Produtivo", "Extrovertido", "Educado", "Compreensivo",
        "Tranquilo", "Agressivo", "Indiferente", "Sedutor", "Exigente consigo",
        "Exigente com os outros", "Autêntico / fala o que pensa", "Teimoso / insistente"
      ];
      const allLabels = [...STANDARD_FEEDBACK_LABELS, ...customFeedbackLabels];
      const totalAttributes = allLabels.length;

      const rateToValue = (r: 'N' | 'P' | 'M' | 'S' | undefined): number => {
        if (!r) return 0;
        if (r === 'N') return 0;
        if (r === 'P') return 1;
        if (r === 'M') return 2;
        if (r === 'S') return 3;
        return 0;
      };

      let totalDiff = 0;
      const virtues = ["Carinhoso", "Paciente", "Persistente", "Responsável", "Pacificador", "Determinado", "Com iniciativa / proativo", "Prestativo", "Produtivo", "Educado", "Compreensivo", "Tranquilo", "Autêntico / fala o que pensa"];
      const vulnerabilities = ["Autoritário", "Passivo", "Inseguro", "Arrogante", "Acomodado", "Queixoso", "Controlador", "Ciumento", "Impulsivo", "Crítico", "Agressivo", "Indiferente", "Exigente consigo", "Exigente com os outros", "Teimoso / insistente", "Centralizador"];

      let sumVirtues = 0;
      let countVirtues = 0;
      let sumVulnerabilities = 0;
      let countVulnerabilities = 0;
      let blindSpotsCount = 0;

      allLabels.forEach(label => {
        const selfVal = rateToValue(feedbackSelfRatings[label]);
        const obsValues = feedbackObservers.map(obs => rateToValue(obs.ratings[label]));
        const avgObsVal = obsValues.length > 0 
          ? (obsValues.reduce((a, b) => a + b, 0) / obsValues.length)
          : selfVal;

        const diff = Math.abs(selfVal - avgObsVal);
        totalDiff += diff;

        if (diff >= 1.5) {
          blindSpotsCount++;
        }

        const isVirtue = virtues.includes(label);
        const isVuln = vulnerabilities.includes(label);
        const overallWeight = (selfVal + avgObsVal) / 2;

        if (isVirtue) {
          sumVirtues += overallWeight;
          countVirtues++;
        } else if (isVuln) {
          sumVulnerabilities += overallWeight;
          countVulnerabilities++;
        }
      });

      const avgDiff = totalAttributes > 0 ? (totalDiff / totalAttributes) : 0;
      const iap = Math.max(0, Math.min(100, Math.round((1 - (avgDiff / 3)) * 100)));
      const avgVirt = countVirtues > 0 ? (sumVirtues / countVirtues) : 0;
      const ivc = Math.max(0, Math.min(100, Math.round((avgVirt / 3) * 100)));
      const avgVuln = countVulnerabilities > 0 ? (sumVulnerabilities / countVulnerabilities) : 0;
      const isc = Math.max(0, Math.min(100, Math.round((avgVuln / 3) * 100)));

      const rawFinalScore = Math.round((iap * 0.6) + (ivc * 0.4) - (isc * 0.2));
      const totalScoreRounded = Math.max(0, Math.min(100, rawFinalScore));

      let classification = "Alinhamento Perceptivo Crítico (Sérios Pontos Cegos de Convivência)";
      if (totalScoreRounded >= 75) {
        classification = "Excelente Consciência Sociointeracional e Alinhamento Sólido";
      } else if (totalScoreRounded >= 50) {
        classification = "Equilíbrio Adaptativo com Pontos Cegos Moderados Ajustáveis";
      } else if (totalScoreRounded >= 30) {
        classification = "Labilidade Interpessoal (Reatividade e Desalinhamento Relevantes)";
      }

      return {
        totalScore: totalScoreRounded,
        classification,
        subscales: {
          "Índice de Alinhamento Perceptivo (IAP)": iap,
          "Índice de Virtudes de Convivência (IVC)": ivc,
          "Índice de Sobrecarga Comportamental (ISC)": isc,
          "Pontos Cegos Identificados": blindSpotsCount
        }
      };
    }

    if (tool.id === "mapeamento_estressores") {
      const totalStressors = stressorsList.length;
      const controllableList = stressorsList.filter(s => s.type === "controllable");
      const totalControllable = controllableList.length;
      const totalUncontrollable = totalStressors - totalControllable;
      
      const ice = totalStressors > 0 ? Math.round((totalControllable / totalStressors) * 100) : 0;
      
      const validHierarchyIds = stressorHierarchy.filter(id => stressorsList.some(s => s.id === id && s.type === "controllable"));
      const irp = totalControllable > 0 ? Math.min(100, Math.round((validHierarchyIds.length / totalControllable) * 100)) : 0;
      
      const totalSeverity = stressorsList.reduce((acc, curr) => acc + curr.severity, 0);
      const iso = totalStressors > 0 ? Math.round((totalSeverity / (totalStressors * 5)) * 100) : 0;
      
      const ira = Math.round((ice * 0.4) + (irp * 0.6));
      
      let classification = "Paralisia e Desesperança Perceptivo-Estressora Severa";
      if (ira >= 75) {
        classification = "Enfrentamento Ativo Sólido e Alta Resolutividade";
      } else if (ira >= 50) {
        classification = "Enfrentamento Adaptativo com Resolutividade Moderada";
      } else if (ira >= 35) {
        classification = "Enfrentamento Instável (Frágil diferenciação de controle e paralisia)";
      }
      
      return {
        totalScore: ira,
        classification,
        subscales: {
          "Índice de Controlabilidade de Estressores (ICE)": ice,
          "Índice de Resolutividade Prática (IRP)": irp,
          "Índice de Sobrecarga Geral (ISO)": iso,
          "Estressores Controláveis Mapeados": totalControllable,
          "Estressores Incontroláveis Mapeados": totalUncontrollable
        }
      };
    }

    if (tool.id === "acompanhamento_pdp") {
      const doneFase1Count = (Object.values(pdpState.fase1) as Array<{ text: string; done: boolean }>).filter(item => item.done).length;
      const doneFase2Count = pdpState.fase2.investigacao_reestruturacao.done ? 1 : 0;
      const doneFase3Count = pdpState.fase3.leitura_selecao_reflexao.done ? 1 : 0;
      const doneFase4Count = pdpState.fase4.filter(item => item.done).length;
      const doneFase5Count = pdpState.fase5.filter(item => item.done).length;

      const totalDone = doneFase1Count + doneFase2Count + doneFase3Count + doneFase4Count + doneFase5Count;
      const progressPercent = Math.round((totalDone / 23) * 100);

      let classification = "Plano de Desenvolvimento em Estágio Inicial (Psicoeducação)";
      if (progressPercent >= 85) {
        classification = "Habilidade Psicológica Formada e Incorporada ao Repertório Comportamental";
      } else if (progressPercent >= 50) {
        classification = "Alta Prática de Habilidades Psicológicas (Consolidação e Treinamento Dinâmico)";
      } else if (progressPercent >= 25) {
        classification = "Desenvolvimento Ativo em Processamento (Fase de Imersão e Reestruturação)";
      }

      return {
        totalScore: progressPercent,
        classification,
        subscales: {
          "Fase 1: Motivação (Psicoeducação)": Math.round((doneFase1Count / 5) * 100),
          "Fase 2: Reestruturação Cognitiva": doneFase2Count * 100,
          "Fase 3: Mentalidades (Enfrentamento)": doneFase3Count * 100,
          "Fase 4: Fontes de Imersão (Estudo-Teoria)": Math.round((doneFase4Count / 6) * 100),
          "Fase 5: Treinamento de Exercícios (Comportamento)": Math.round((doneFase5Count / 10) * 100)
        }
      };
    }

    if (tool.id === "acompanhamento_pme") {
      const pmeFase1 = pmeState.fase1.done ? 1 : 0;
      const pmeFase2 = pmeState.fase2.done ? 1 : 0;
      const pmeFase3 = pmeState.fase3.done ? 1 : 0;
      const pmeFase4 = pmeState.fase4.done ? 1 : 0;
      const pmeFase5 = pmeState.fase5.done ? 1 : 0;
      const pmeFase6 = pmeState.fase6.done ? 1 : 0;
      const pmeFase7 = pmeState.fase7.done ? 1 : 0;
      const pmeFase8 = pmeState.fase8.done ? 1 : 0;

      const pmeTotal = pmeFase1 + pmeFase2 + pmeFase3 + pmeFase4 + pmeFase5 + pmeFase6 + pmeFase7 + pmeFase8;
      const pmeProgressValue = Math.round((pmeTotal / 8) * 100);

      const pdpFase1 = (Object.values(pmeState.pdpFase1) as Array<{ text: string; done: boolean }>).filter(item => item.done).length;
      const pdpFase2 = pmeState.pdpFase2.investigacao_reestruturacao.done ? 1 : 0;
      const pdpFase3 = pmeState.pdpFase3.leitura_selecao_reflexao.done ? 1 : 0;
      const pdpFase4 = pmeState.pdpFase4.filter(item => item.done).length;
      const pdpFase5 = pmeState.pdpFase5.filter(item => item.done).length;

      const pdpTotal = pdpFase1 + pdpFase2 + pdpFase3 + pdpFase4 + pdpFase5;
      const pdpProgressValue = Math.round((pdpTotal / 23) * 100);

      // Average of the two processes
      const progressPercent = Math.round((pmeProgressValue + pdpProgressValue) / 2);

      let classification = "Diagnóstico & Conceituação Esquemática Em Andamento";
      if (progressPercent >= 85) {
        classification = "Transição Clínica Concluída: Esquemas Reabilitados e HP Consolidada no PDP";
      } else if (progressPercent >= 60) {
        classification = "Consolidação de Habilidade Psicológica (HP) em Regime de Exercícios e Imersões";
      } else if (progressPercent >= 30) {
        classification = "Reabilitação Esquemática Ativa (PME Concluído/Avançado e PDP Iniciado)";
      }

      return {
        totalScore: progressPercent,
        classification,
        subscales: {
          "PME: Reabilitação do Passado (8 Etapas)": pmeProgressValue,
          "PDP: Cognição & Motivação (Fases 1-3)": Math.round(((pdpFase1 + pdpFase2 + pdpFase3) / 7) * 100),
          "PDP: Imersão Teórica (Fase 4 - Fontes)": Math.round((pdpFase4 / 6) * 100),
          "PDP: Treino Comportamental (Fase 5 - Exercícios)": Math.round((pdpFase5 / 10) * 100)
        }
      };
    }

    return { totalScore: 0, classification: "Não aplicável", subscales: {} };
  };

  const currentScores = calculateFinalScores();

  // --- FILE UPLOAD SIMULATOR (Therapist's custom submissions) ---
  const handleFakeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSimulatedFile(file);
      setIsUploading(true);
      setUploadSuccess(false);

      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
      }, 2200); // Simulated processing speed
    }
  };

  // --- API CALL FOR AI REPORT ---
  const handleGenerateAiReport = async () => {
    setIsGeneratingHtmlReport(true);
    setAiError("");
    setAiReportText("");

    try {
      const patientInfo = patient;
      const toolInfo = {
        title: tool.title,
        description: tool.description,
        skillsEvaluated: tool.skillsEvaluated
      };
      const scores = {
        totalScore: currentScores.totalScore,
        classification: currentScores.classification,
        subscales: currentScores.subscales
      };
      const rawAnswers = tool.id === "idai" 
        ? idaiAnswers 
        : tool.id === "efca" 
          ? efcaAnswers 
          : tool.id === "avaliacao_central"
            ? { disfunctionalSituations, signatureStrengths, maladaptiveSchemes, psychologicalSkills, curativeSituations }
            : tool.id === "genealogia_atributos"
              ? { genealogyData }
              : tool.id === "linha_vida"
                ? { lifeLineEvents }
                : tool.id === "satisfacao_multidimensional"
                  ? { multidimSatisfaction, radarSubscales }
                  : tool.id === "radar_habilidades"
                    ? { skillsRadarSubscales }
                    : tool.id === "exame_atributos_parentais"
                      ? { parentalCaregivers }
                      : tool.id === "exame_evidencias_cognicao"
                        ? { cognitiveEvidence }
                        : tool.id === "reestruturacao_semantica"
                          ? { semanticRestructuring }
                          : tool.id === "exame_desenvolvimento_autoestima"
                            ? { selfEsteem }
                            : tool.id === "cartao_enfrentamento"
                              ? { copingCards }
                              : tool.id === "despolarizacao_alternativas"
                                ? { despolarizacao }
                                : tool.id === "espectro_cognitivo"
                                  ? { espectroCognitivo }
                                  : tool.id === "rid_interacoes"
                                    ? { ridInteracoes }
                                    : tool.id === "transicao_mecanismo"
                                      ? { transicaoMecanismo }
                                      : tool.id === "exame_duplo_vantagens"
                                        ? { exameDuploVantagens }
                                        : tool.id === "exame_feedbacks_entrevista"
                                          ? { exameFeedbacksEntrevista }
                                           : tool.id === "exame_atributos_pessoais"
                                             ? { exameAtributosPessoais }
                                           : tool.id === "exame_singulares_compartilhadas"
                                             ? { exameSingularesCompartilhadas }
                                           : tool.id === "exame_provisao_emocional"
                                             ? { exameProvisaoEmocional }
                                           : tool.id === "exame_atitudes_dimensoes"
                                             ? { exameAtitudesDimensoes }
                                           : tool.id === "exame_reacoes_sociais"
                                             ? { exameReacoesSociais }
                                            : tool.id === "hierarquia_exposicao_enfrentamento"
                                              ? { exameHierarquiaExposicao }
                                             : tool.id === "analise_modelos_pessoais"
                                               ? { exameModelosPessoais }
                                      : tool.id === "mentalidades_hedonismo_responsavel"
                                        ? { mentalidadesHedonismo }
                                      : tool.id === "mentalidades_autoconhecimento"
                                        ? { mentalidadesAutoconhecimento }
                                      : tool.id === "mentalidades_autoestima"
                                        ? { mentalidadesAutoestima }
                                      : tool.id === "mentalidades_raciocinio_otimista"
                                        ? { mentalidadesRaciocinioOtimista }
                                      : tool.id === "mentalidades_autorregulacao_emocional"
                                        ? { mentalidadesAutorregulacaoEmocional }
                                      : tool.id === "mentalidades_imunidade_social"
                                        ? { mentalidadesImunidadeSocial }
                                      : tool.id === "mentalidades_resolutividade_enfrentamento"
                                        ? { mentalidadesResolutividadeEnfrentamento }
                                      : tool.id === "mentalidades_autocontrole"
                                        ? { mentalidadesAutocontrole }
                                      : tool.id === "mentalidades_sociabilidade"
                                        ? { mentalidadesSociabilidade }
                                      : tool.id === "mentalidades_sensibilidade_social"
                                        ? { mentalidadesSensibilidadeSocial }
                                      : tool.id === "mentalidades_hedonismo_responsavel"
                                        ? { mentalidadesHedonismo }
                                      : tool.id === "mentalidades_autoconhecimento"
                                        ? { mentalidadesAutoconhecimento }
                                      : tool.id === "mentalidades_autoestima"
                                        ? { mentalidadesAutoestima }
                                      : tool.id === "mentalidades_raciocinio_otimista"
                                        ? { mentalidadesRaciocinioOtimista }
                                      : tool.id === "mentalidades_autorregulacao_emocional"
                                        ? { mentalidadesAutorregulacaoEmocional }
                                      : tool.id === "mentalidades_imunidade_social"
                                        ? { mentalidadesImunidadeSocial }
                                      : tool.id === "mentalidades_resolutividade_enfrentamento"
                                        ? { mentalidadesResolutividadeEnfrentamento }
                                      : tool.id === "mentalidades_autocontrole"
                                        ? { mentalidadesAutocontrole }
                                      : tool.id === "mentalidades_sociabilidade"
                                        ? { mentalidadesSociabilidade }
                                      : tool.id === "mentalidades_sensibilidade_social"
                                        ? { mentalidadesSensibilidadeSocial }
                                          : tool.id === "analise_criticos"
                     ? { criticList }
                     : tool.id === "exame_feedbacks"
                       ? { feedbackSelfRatings, feedbackObservers, feedbackSituations, customFeedbackLabels }
                       : tool.id === "mapeamento_estressores"
                         ? { stressorsList, stressorHierarchy }
                         : tool.id === "acompanhamento_pdp"
                           ? { pdpState }
                         : tool.id === "acompanhamento_pme"
                           ? { pmeState }
                           : { gameGridCleared: true, stats: currentScores.subscales };

      const reportText = await generatePsicometrikReport(patientInfo, toolInfo, scores, rawAnswers);
      if (!reportText) throw new Error("Não foi possível obter a resposta do laudo.");

      setAiReportText(reportText);
      setStep('report');
    } catch (err: any) {
      setAiError(err.message || "Erro desconhecido ao requisitar o laudo.");
    } finally {
      setIsGeneratingHtmlReport(false);
    }
  };

  // --- SAVE CLINICAL DOSSIER ---
  const handleSaveDossier = () => {
    const report: Report = {
      id: "rep_" + Math.random().toString(36).substring(2, 11),
      patientName: patient.name || "Paciente Anônimo",
      patientAge: patient.age,
      patientGender: patient.gender,
      toolId: tool.id,
      toolTitle: tool.title,
      evaluationDate: new Date().toLocaleDateString("pt-BR"),
      rawAnswers: tool.id === "idai" 
        ? idaiAnswers 
        : tool.id === "efca" 
          ? efcaAnswers 
          : tool.id === "avaliacao_central"
            ? { disfunctionalSituations, signatureStrengths, maladaptiveSchemes, psychologicalSkills, curativeSituations }
            : tool.id === "genealogia_atributos"
              ? { genealogyData }
              : tool.id === "linha_vida"
                ? { lifeLineEvents }
                : tool.id === "satisfacao_multidimensional"
                  ? { multidimSatisfaction, radarSubscales }
                  : tool.id === "radar_habilidades"
                    ? { skillsRadarSubscales }
                    : tool.id === "exame_atributos_parentais"
                      ? { parentalCaregivers }
                      : tool.id === "exame_evidencias_cognicao"
                        ? { cognitiveEvidence }
                        : tool.id === "reestruturacao_semantica"
                          ? { semanticRestructuring }
                          : tool.id === "exame_desenvolvimento_autoestima"
                            ? { selfEsteem }
                            : tool.id === "cartao_enfrentamento"
                              ? { copingCards }
                              : tool.id === "despolarizacao_alternativas"
                                ? { despolarizacao }
                                : tool.id === "espectro_cognitivo"
                                  ? { espectroCognitivo }
                                  : tool.id === "rid_interacoes"
                                    ? { ridInteracoes }
                                    : tool.id === "transicao_mecanismo"
                                      ? { transicaoMecanismo }
                                      : tool.id === "exame_duplo_vantagens"
                                        ? { exameDuploVantagens }
                                        : tool.id === "exame_feedbacks_entrevista"
                                          ? { exameFeedbacksEntrevista }
                                        : tool.id === "exame_atributos_pessoais"
                                          ? { exameAtributosPessoais }
                                        : tool.id === "exame_singulares_compartilhadas"
                                          ? { exameSingularesCompartilhadas }
                                        : tool.id === "exame_provisao_emocional"
                                          ? { exameProvisaoEmocional }
                                        : tool.id === "exame_atitudes_dimensoes"
                                          ? { exameAtitudesDimensoes }
                                        : tool.id === "exame_reacoes_sociais"
                                          ? { exameReacoesSociais }
                                         : tool.id === "hierarquia_exposicao_enfrentamento"
                                           ? { exameHierarquiaExposicao }
                                         : tool.id === "analise_modelos_pessoais"
                                           ? { exameModelosPessoais }
                                         : tool.id === "mentalidades_hedonismo_responsavel"
                                           ? { mentalidadesHedonismo }
                                         : tool.id === "mentalidades_autoconhecimento"
                                           ? { mentalidadesAutoconhecimento }
                                         : tool.id === "mentalidades_autoestima"
                                           ? { mentalidadesAutoestima }
                                         : tool.id === "mentalidades_raciocinio_otimista"
                                           ? { mentalidadesRaciocinioOtimista }
                                         : tool.id === "mentalidades_autorregulacao_emocional"
                                           ? { mentalidadesAutorregulacaoEmocional }
                                         : tool.id === "mentalidades_imunidade_social"
                                           ? { mentalidadesImunidadeSocial }
                                         : tool.id === "mentalidades_resolutividade_enfrentamento"
                                           ? { mentalidadesResolutividadeEnfrentamento }
                                         : tool.id === "mentalidades_autocontrole"
                                           ? { mentalidadesAutocontrole }
                                         : tool.id === "mentalidades_sociabilidade"
                                           ? { mentalidadesSociabilidade }
                                         : tool.id === "mentalidades_sensibilidade_social"
                                           ? { mentalidadesSensibilidadeSocial }
                                        : tool.id === "analise_criticos"
                    ? { criticList }
                    : tool.id === "exame_feedbacks"
                      ? { feedbackSelfRatings, feedbackObservers, feedbackSituations, customFeedbackLabels }
                      : tool.id === "mapeamento_estressores"
                        ? { stressorsList, stressorHierarchy }
                        : tool.id === "acompanhamento_pdp"
                          ? { pdpState }
                        : tool.id === "acompanhamento_pme"
                          ? { pmeState }
                          : { stats: currentScores.subscales },
      calculatedScores: {
        score: currentScores.totalScore,
        classification: currentScores.classification,
        subscales: currentScores.subscales
      },
      aiReportText,
      createdAt: new Date().toISOString()
    };

    onSaveReport(report);
    onClose();
  };

  // Export full Standalone report as styled HTML file
  const handleDownloadHtml = () => {
    const htmlStyles = `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #fafafa; }
      .header-box { background: linear-gradient(135deg, #111827, #1f2937); color: white; padding: 25px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header-box h1 { margin: 0 0 10px 0; font-size: 24px; color: #00A3FF; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; font-size: 14px; border-top: 1px solid #374151; padding-top: 15px; }
      .score-badge { display: inline-block; background-color: #00A3FF15; border: 1.5px solid #00A3FF; color: #00A3FF; padding: 6px 12px; border-radius: 6px; font-weight: bold; margin: 15px 0; }
      .subscale-card { background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-top: 15px; }
      .subscale-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
      .ai-report { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-top: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      h2 { color: #111827; border-left: 4px solid #00A3FF; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; font-size: 19px; }
      h3 { color: #00A3FF; font-size: 16px; margin-top: 20px;}
      p, li { color: #4b5563; font-size: 14.5px; }
      blockquote { border-left: 4px solid #4b5563; background: #f9fafb; padding: 10px 15px; margin: 15px 0; font-style: italic; color: #4b5563; }
      hr { border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0; }
      @media print { body { padding: 0; background: white; } .header-box { box-shadow: none; border: 1px solid #ddd; } }
    `;

    const reportContentString = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Laudo Clínico AI - ${patient.name}</title>
        <style>${htmlStyles}</style>
      </head>
      <body>
        <div class="header-box">
          <h1>LAUDO NEUROCLÍNICO & PSICOMÉTRICO AUTOMATIZADO</h1>
          <div>Emissão inteligente assistida por Inteligência Artificial (Modelo Gemini)</div>
          <div class="meta-grid">
            <div><strong>Paciente:</strong> ${patient.name}</div>
            <div><strong>Idade/Gênero:</strong> ${patient.age} anos | ${patient.gender}</div>
            <div><strong>Instumento:</strong> ${tool.title}</div>
            <div><strong>Data da Coleta:</strong> ${new Date().toLocaleDateString("pt-BR")}</div>
          </div>
        </div>

        <h2>Resultados dos Cálculos Automatizados</h2>
        <div class="score-badge">Classificação Clínica: ${currentScores.classification} | Score Total: ${currentScores.totalScore}</div>
        
        <div class="subscale-card">
          <h4>Detalhamento das Subescalas</h4>
          ${Object.entries(currentScores.subscales || {}).map(([key, val]) => `
            <div class="subscale-item">
              <span>${key}</span>
              <strong>${val}</strong>
            </div>
          `).join("")}
        </div>

        ${patient.clinicalContext ? `
          <h2>Anotações do Contexto de Entrada</h2>
          <p>${patient.clinicalContext}</p>
        ` : ""}

        <hr />

        <div class="ai-report">
          <h2>Análise Técnica de Alta Inteligência Analítica (CBT G4 & Neurociência)</h2>
          <div style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;"><em>Este relatório foi gerado por IA calibrada com as orientações de Terapia Cognitivo-Comportamental de Quarta Geração e Neurociência Clínica.</em></div>
          ${aiReportText ? aiReportText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>").replace(/## (.*)/g, "<h2>$1</h2>").replace(/### (.*)/g, "<h3>$1</h3>") : "<p>Laudo IA não anexado.</p>"}
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af;">
          Plataforma PsicoMetrik • Registro Digital Seguro
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportContentString], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laudo_psicometrik_${patient.name.toLowerCase().replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if placeholder slot was selected
  const isPlaceholder = tool.status === "pending";

  const isWindowed = !!windowId;

  const windowStyle: React.CSSProperties = isWindowed ? {
    left: isMaximized ? 0 : x,
    top: isMaximized ? 0 : y,
    width: isMaximized ? "100vw" : width,
    height: isMaximized ? "calc(100vh - 48px)" : height,
    zIndex: zIndex,
    display: isMinimized ? "none" : "flex",
    position: "fixed",
    maxHeight: isMaximized ? "calc(100vh - 48px)" : "none",
  } : {};

  const cardClassName = isWindowed 
    ? "bg-[#111217] border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-2xl pointer-events-auto relative select-none animate-fadeIn flex-1"
    : "bg-[#111217] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative";

  const cardStyle = isWindowed ? windowStyle : {};

  return (
    <div 
      className={isWindowed ? "fixed inset-0 z-50 pointer-events-none" : "fixed inset-0 z-50 bg-[#0c0d10]/95 flex items-center justify-center p-4 overflow-y-auto pointer-events-auto"}
      id="assessment-wizard-viewport"
    >
      <div 
        className={cardClassName}
        style={cardStyle}
        onMouseDown={() => { if (onFocus) onFocus(); }}
        id="assessment-wizard-card"
      >
        
        {/* TOP BAR info */}
        <div 
          className={`bg-gray-950 px-6 py-4 border-b border-gray-900 flex items-center justify-between shrink-0 select-none ${isWindowed ? 'cursor-move' : ''}`}
          onMouseDown={isWindowed ? startDrag : undefined}
          onDoubleClick={isWindowed && onMaximize ? onMaximize : undefined}
        >
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-900 transition-colors"
              id="wizard-close-back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-0.5 pointer-events-none">
              <span className="text-[10px] text-[#00A3FF] font-mono tracking-wider font-bold uppercase block leading-none mb-1">
                {tool.category === "felicidade" ? "Felicidade e Bem-estar" : tool.category === "autoconhecimento" ? "Autoconhecimento" : tool.category === "autoestima" ? "Autoestima" : tool.category === "racio_real_otimista" ? "Raciocínio Realista" : tool.category === "resolut_enfrent" ? "Resolutividade" : tool.category === "imunidade_social" ? "Imunidade Social" : tool.category === "autocontrole" ? "Autocontrole" : "Mentalidades Saudáveis"}
              </span>
              <h2 className="text-sm md:text-base font-bold text-gray-200 truncate max-w-[150px] md:max-w-[400px] leading-tight">{tool.title}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Active step indicators */}
            {!isPlaceholder && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                <span className={step === 'patient' ? "text-[#00A3FF] font-bold" : "text-gray-500"}>1. Perfil</span>
                <ChevronRight className="w-3 text-gray-700" />
                <span className={step === 'evaluation' ? "text-[#00A3FF] font-bold" : "text-gray-500"}>2. Coleta</span>
                <ChevronRight className="w-3 text-gray-700" />
                <span className={step === 'results' ? "text-[#00A3FF] font-bold" : "text-gray-500"}>3. Resumo</span>
                <ChevronRight className="w-3 text-gray-700" />
                <span className={step === 'report' ? "text-[#00A3FF] font-bold" : "text-gray-500"}>4. Laudo IA</span>
              </div>
            )}

            {/* Windows Style Control Buttons */}
            {isWindowed && (
              <div className="flex items-center gap-1 border-l border-gray-900 pl-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMinimize) onMinimize();
                  }}
                  className="text-gray-500 hover:text-white hover:bg-gray-900 p-1 rounded transition-colors"
                  title="Minimizar"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMaximize) onMaximize();
                  }}
                  className="text-gray-500 hover:text-white hover:bg-gray-900 p-1 rounded transition-colors"
                  title={isMaximized ? "Restaurar" : "Maximizar"}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-500/15 p-1 rounded transition-colors"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BODY MAIN PANEL */}
        <div className={`flex-1 overflow-y-auto space-y-6 ${isWindowed ? 'p-4 md:p-6' : 'p-6 md:p-8'}`}>

          {/* ======================================= */}
          {/* PLACEHOLDER SLOT WORKFLOW (Upload tool) */}
          {/* ======================================= */}
          {isPlaceholder && (
            <div className="space-y-6 max-w-2xl mx-auto py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white font-display">Digitalize sua Própria Ferramenta</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Esta categoria está calibrada! Envie-me a especificação, imagens de escalas impressas, arquivos PDF de questionários ou tabelas que deseja automatizar. Minha inteligência de analista clínico criará o slot ativo.
                </p>
              </div>

              {/* Upload panel box */}
              <div className="border border-dashed border-gray-800 rounded-xl bg-gray-950/50 p-8 flex flex-col items-center justify-center space-y-4 hover:border-amber-600/50 transition-colors relative">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,image/*" 
                  onChange={handleFakeUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  disabled={isUploading || uploadSuccess}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Cpu className="w-8 h-8 text-amber-500 animate-spin" />
                    <span className="text-sm font-semibold text-gray-300 font-mono">Processando psicometria e variáveis da escala...</span>
                  </div>
                ) : uploadSuccess ? (
                  <div className="flex flex-col items-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-200">Arquivo processado com sucesso!</span>
                    <span className="text-xs text-gray-400 font-mono">{simulatedFile?.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400">
                      <Clipboard className="w-6 h-6" />
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-amber-500 font-bold hover:underline">Clique para selecionar</span> ou arraste o arquivo da escala aqui
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Arquivos suportados: PDF, DOCX, PNG, JPG (Qualquer tabela ou inventário psicoterapeuta)
                    </div>
                  </>
                )}
              </div>

              {uploadSuccess && (
                <div className="bg-emerald-950/20 border border-emerald-800/30 p-4 rounded-lg text-left text-xs text-emerald-400 space-y-1.5 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-sm mb-1 text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Análise Preditiva do Agente Concluída
                  </div>
                  <div>• <strong>Variáveis mapeadas:</strong> Itens clínicos identificados viaOCR de inteligência neural.</div>
                  <div>• <strong>Cálculos gerados:</strong> Tabelas normativas de scores preparadas.</div>
                  <div className="font-semibold text-gray-300 mt-2">Dica: Informe o agente sobre a regulação dos cálculos por chat para que fiquem salvas na aplicação final!</div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-900">
                <button
                  onClick={onClose}
                  className="bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold px-6 py-2.5 rounded-md transition-colors text-xs"
                >
                  Voltar ao Catálogo
                </button>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* STEP 1: PATIENT PROFILE DATA FORM */}
          {/* ======================================= */}
          {!isPlaceholder && step === 'patient' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#00A3FF]/10 border border-[#00A3FF]/20 rounded-full flex items-center justify-center mx-auto text-[#00A3FF]">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">Identificação Fisiopsicossocial do Paciente</h3>
                <p className="text-xs text-gray-400">Insira as informações básicas para contextualizar o algoritmo psicométrico e orientar a IA.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold uppercase font-mono">Nome Completo (ou Iniciais)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva Santos"
                    value={patient.name}
                    onChange={(e) => setPatient(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-950 text-sm text-gray-200 px-4 py-2.5 rounded border border-gray-800 focus:outline-none focus:border-[#00A3FF] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase font-mono">Idade (Anos)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={patient.age}
                      onChange={(e) => setPatient(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-gray-950 text-sm text-gray-200 px-4 py-2.5 rounded border border-gray-800 focus:outline-none focus:border-[#00A3FF] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase font-mono">Gênero Identificado</label>
                    <select
                      value={patient.gender}
                      onChange={(e) => setPatient(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-gray-950 text-sm text-gray-200 px-4 py-2.5 rounded border border-gray-800 focus:outline-none focus:border-[#00A3FF] transition-colors"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro / Não Binário</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold uppercase font-mono">Queixa Principal / Histórico de Encaminhamento</label>
                  <textarea
                    rows={4}
                    placeholder="Relate brevemente o contexto clínico, sintomas declarados pela pessoa e objetivos na consulta terapêutica..."
                    value={patient.clinicalContext}
                    onChange={(e) => setPatient(prev => ({ ...prev, clinicalContext: e.target.value }))}
                    className="w-full bg-gray-950 text-sm text-gray-200 px-4 py-2.5 rounded border border-gray-800 focus:outline-none focus:border-[#00A3FF] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-900">
                <button
                  onClick={onClose}
                  className="bg-gray-900 hover:bg-gray-800 text-gray-400 font-medium px-4 py-2 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={!patient.name.trim()}
                  onClick={() => setStep('evaluation')}
                  className="bg-[#00A3FF] hover:bg-[#38bcfd] disabled:bg-gray-900 disabled:text-gray-500 text-white font-bold px-6 py-2 rounded text-xs transition-colors flex items-center gap-1.5"
                >
                  Confirmar Perfil
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* STEP 2: QUESTIONNAIRE OR INTERACTIVE GAME */}
          {/* ======================================= */}
          {!isPlaceholder && step === 'evaluation' && (
            <div className="space-y-6">
              
              {/* --- IDAI QUESTIONNAIRE VIEW --- */}
              {tool.id === "idai" && (
                <div className="space-y-6">
                  <div className="bg-gray-950 p-4 rounded-lg border border-gray-900 flex justify-between items-center text-xs">
                    <span className="text-gray-400">Assinale as intensidades dos sintomas observados ou declarados:</span>
                    <span className="text-[#00A3FF] font-mono font-bold">Respostas salvas</span>
                  </div>

                  <div className="space-y-4">
                    {IDAI_QUESTIONS.map((q, idx) => {
                      const selectedVal = idaiAnswers[q.id] || 0;
                      return (
                        <div key={q.id} className="p-4 rounded-lg bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 md:max-w-xl">
                            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">{q.subscale}</span>
                            <div className="text-sm text-gray-200">
                              <span className="text-gray-500 font-mono mr-1.5">{idx + 1}.</span> {q.text}
                            </div>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            {[0, 1, 2, 3].map((val) => {
                              const labels = ["Ausente", "Leve", "Moderado", "Grave"];
                              const colors = [
                                "hover:bg-gray-800 text-gray-400",
                                "hover:bg-amber-950 hover:text-amber-400 text-gray-400",
                                "hover:bg-orange-950 hover:text-orange-400 text-gray-400",
                                "hover:bg-red-950 hover:text-red-400 text-gray-400"
                              ];
                              const activeColors = [
                                "bg-gray-800 text-white font-bold border-gray-700",
                                "bg-amber-950 text-amber-400 font-bold border-amber-800",
                                "bg-orange-950 text-orange-400 font-bold border-orange-800",
                                "bg-[#002B47] text-[#00A3FF] font-bold border-[#00A3FF]"
                              ];

                              const isSelected = selectedVal === val;

                              return (
                                <button
                                  key={val}
                                  onClick={() => handleIdaiChange(q.id, val)}
                                  className={`px-3 py-1.5 rounded border text-[11px] font-mono transition-all border-transparent ${
                                    isSelected ? activeColors[val] : colors[val]
                                  }`}
                                  title={labels[val]}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- EFCA QUESTIONNAIRE VIEW --- */}
              {tool.id === "efca" && (
                <div className="space-y-6">
                  <div className="bg-gray-950 p-4 rounded-lg border border-gray-900 text-xs text-gray-400">
                    Avalie cada item de acordo com a frequência vivenciada pelo paciente sendo <strong>0 (Discordo Totalmente)</strong> a <strong>5 (Concordo Totalmente)</strong>:
                  </div>

                  <div className="space-y-4">
                    {EFCA_QUESTIONS.map((e, idx) => {
                      const selectedVal = efcaAnswers[e.id] || 3;
                      return (
                        <div key={e.id} className="p-4 rounded-lg bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 md:max-w-xl">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">{e.subscale}</span>
                              {e.reversed && <span className="text-[9px] bg-sky-950 text-sky-400 px-1 py-0.2 rounded font-mono font-bold">Item Reverso</span>}
                            </div>
                            <div className="text-sm text-gray-200">
                              <span className="text-gray-500 font-mono mr-1.5">{idx + 1}.</span> {e.text}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {[0, 1, 2, 3, 4, 5].map((val) => {
                              const isSelected = selectedVal === val;
                              return (
                                <button
                                  key={val}
                                  onClick={() => handleEfcaChange(e.id, val)}
                                  className={`w-8 h-8 rounded border text-xs font-mono transition-all flex items-center justify-center ${
                                    isSelected 
                                      ? "bg-[#00A3FF]/15 text-[#00A3FF] font-bold border-[#00A3FF]/50" 
                                      : "bg-gray-950 text-gray-400 border-gray-900 hover:bg-gray-900"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- TAVP NEUROPSYCHOLOGICAL INTERACTIVE GAME VIEW --- */}
              {tool.id === "tavp" && (
                <div className="space-y-6 max-w-xl mx-auto py-2">
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-900 space-y-3">
                    <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                      <Watch className="w-4 h-4 text-blue-500 animate-pulse" />
                      Protocolo Informatizado de Atenção Concentrada
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Instruções: O paciente deve clicar o mais rápido possível **apenas no Símbolo Alvo: ⨂**. Clicar em outras figuras gera penalidades por erro. Alvos não clicados ao fim da contagem regressiva geram omissões.
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-gray-900 pt-3">
                      <span className="text-[11px] text-gray-400 font-bold uppercase font-mono">Símbolo Alvo:</span>
                      <span className="text-2xl text-[#00A3FF] font-extrabold animate-bounce leading-none">⨂</span>
                    </div>
                  </div>

                  {/* GAME BOARD WORKFLOW */}
                  {!isGameActive && gameReactionTimes.length === 0 ? (
                    <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-10 text-center space-y-4">
                      <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400">
                        <Timer className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Cronômetro pronto: 30 Segundos</h4>
                        <p className="text-xs text-gray-400">Mantenha o mouse ou tela touchscreen desobstruídos.</p>
                      </div>
                      <button
                        onClick={initTavpGame}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded text-xs transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Disparar Cronômetro Clínico
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* STAT BAR HEADERS */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-950 p-2.5 rounded border border-gray-900 flex flex-col justify-center">
                          <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Tempo</span>
                          <span className={`text-sm font-bold font-mono ${gameTimeLeft < 10 ? 'text-[#00A3FF] animate-pulse' : 'text-blue-400'}`}>
                            {gameTimeLeft} s
                          </span>
                        </div>
                        <div className="bg-gray-950 p-2.5 rounded border border-gray-900 flex flex-col justify-center">
                          <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Acertos</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">{gameHits}</span>
                        </div>
                        <div className="bg-gray-950 p-2.5 rounded border border-gray-900 flex flex-col justify-center">
                          <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Erros</span>
                          <span className="text-sm font-bold text-[#00A3FF] font-mono">{gameErrors}</span>
                        </div>
                      </div>

                      {/* Smooth progress remaining bar */}
                      <div className="h-1.5 w-full bg-gray-900 rounded overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000"
                          style={{ width: `${(gameTimeLeft / 30) * 100}%` }}
                        />
                      </div>

                      {/* THE INTERACTIVE CLICKABLE ELEMENT MATRIX */}
                      <div className="grid grid-cols-6 gap-2 bg-gray-950 p-4 rounded-xl border border-gray-900 select-none">
                        {gameGrid.map((cell, idx) => {
                          let bgColor = "bg-[#16171e]/70 border-gray-800 text-gray-400 hover:border-blue-600/50";
                          let symbolShow = cell.symbol;

                          if (cell.clicked) {
                            if (cell.isTarget) {
                              bgColor = "bg-emerald-950/40 border-emerald-500 text-emerald-400 scale-95 transition-transform";
                              symbolShow = "✓";
                            } else {
                              bgColor = "bg-red-950/40 border-red-800 text-red-500 animate-shake";
                              symbolShow = "✗";
                            }
                          }

                          return (
                            <div
                              key={cell.id}
                              onClick={() => handleGameCellClick(idx)}
                              className={`aspect-square rounded border flex items-center justify-center text-lg font-bold cursor-pointer transition-all ${bgColor}`}
                            >
                              {symbolShow}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-center">
                        <button
                          onClick={initTavpGame}
                          className="text-[10px] text-gray-500 hover:text-gray-300 font-mono flex items-center gap-1 mx-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reiniciar Exercício
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* --- AVALIAÇÃO CENTRAL VIEW --- */}
              {tool.id === "avaliacao_central" && (
                <div className="space-y-6" id="central-evaluation-view">
                  {/* Segment controller tabs */}
                  <div className="flex border-b border-gray-900 pb-px gap-1 overflow-x-auto no-scrollbar" id="central-evaluation-tabs">
                    {[
                      { id: 'dys', label: "1. Contingências Disfuncionais", color: "border-red-500 text-red-500 bg-red-950/10" },
                      { id: 'str', label: "2. Forças de Assinatura", color: "border-amber-500 text-amber-500 bg-amber-950/10" },
                      { id: 'sch', label: "3. Esquemas Desadaptativos", color: "border-purple-500 text-purple-500 bg-purple-950/10" },
                      { id: 'ski', label: "4. Habilidades Psicológicas", color: "border-[#00A3FF] text-[#00A3FF] bg-[#00A3FF]/10" },
                      { id: 'cur', label: "5. Contingências Curativas", color: "border-emerald-500 text-emerald-500 bg-emerald-950/10" }
                    ].map(seg => {
                      const isActive = activeSegment === seg.id;
                      return (
                        <button
                          key={seg.id}
                          type="button"
                          onClick={() => setActiveSegment(seg.id as any)}
                          className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider font-mono border-b-2 shrink-0 transition-all cursor-pointer rounded-t ${
                            isActive 
                              ? `${seg.color} border-current opacity-100` 
                              : "border-transparent text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {seg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* TAB 1: Dysfunctional Contingencies */}
                  {activeSegment === 'dys' && (
                    <div className="space-y-4 animate-fadeIn" id="tab-dysfunctional">
                      <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl text-xs text-red-400 space-y-1">
                        <strong className="text-red-300 block font-sans">CONTINGÊNCIAS DISFUNCIONAIS (Triggers, Queixas e Sofrimento)</strong>
                        <span>Mapeie até 3 episódios ou padrões comportamentais frequentes que evidenciam o sofrimento do paciente. Classifique o nível de estresse/gravidade de 0 a 10.</span>
                      </div>

                      <div className="space-y-4">
                        {disfunctionalSituations.map((item, idx) => (
                          <div key={idx} className="bg-gray-950/40 p-4 rounded-xl border border-gray-900 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono text-gray-400 uppercase">Situação {idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] text-gray-500 font-mono">Data do Ocorrido:</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Abr/2026"
                                  value={item.data}
                                  onChange={(e) => {
                                    const newArr = [...disfunctionalSituations];
                                    newArr[idx].data = e.target.value;
                                    setDisfunctionalSituations(newArr);
                                  }}
                                  className="bg-gray-900 border border-gray-800 text-xs px-2 py-1 rounded focus:outline-none focus:border-red-500 text-gray-200 font-mono w-28"
                                />
                              </div>
                            </div>

                            <textarea
                              rows={2}
                              value={item.situacao}
                              onChange={(e) => {
                                const newArr = [...disfunctionalSituations];
                                newArr[idx].situacao = e.target.value;
                                setDisfunctionalSituations(newArr);
                              }}
                              placeholder={`Descreva a situação desencadeadora ou comportamento disfuncional...`}
                              className="w-full bg-gray-900 text-xs text-gray-200 px-3 py-2 rounded border border-gray-800 focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-900/50 pt-2.5">
                              <span className="text-[10px] text-gray-500 font-mono">Severidade / Grau de Sofrimento: <strong className="text-red-400 font-bold">{item.gravidade}/10</strong></span>
                              <div className="flex items-center gap-0.5 overflow-x-auto">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      const newArr = [...disfunctionalSituations];
                                      newArr[idx].gravidade = v;
                                      setDisfunctionalSituations(newArr);
                                    }}
                                    className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-all cursor-pointer ${
                                      item.gravidade === v
                                        ? "bg-red-500/20 text-red-400 border border-red-500/50 font-bold"
                                        : "bg-gray-900 text-gray-500 border border-transparent hover:bg-gray-800 hover:text-gray-300"
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Signature Strengths */}
                  {activeSegment === 'str' && (
                    <div className="space-y-4 animate-fadeIn" id="tab-strengths">
                      <div className="bg-amber-950/10 border border-amber-900/30 p-4 rounded-xl text-xs text-amber-400 space-y-1">
                        <strong className="text-amber-300 block font-sans">FORÇAS DE ASSINATURA (Recursos de Caráter)</strong>
                        <span>Insira até 5 forças marcantes do paciente (ex: Curiosidade, Autocontrole, Honestidade, Gratidão) e avalie o quanto ele as utiliza ativamente hoje (0-10).</span>
                      </div>

                      <div className="space-y-3">
                        {signatureStrengths.map((item, idx) => (
                          <div key={idx} className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-1 text-center md:text-left">
                              <span className="text-xs font-bold font-mono text-gray-400">#{idx + 1}</span>
                            </div>
                            <div className="md:col-span-4">
                              <input
                                type="text"
                                placeholder={`Insira a Força ${idx + 1}...`}
                                value={item.forca}
                                onChange={(e) => {
                                  const newArr = [...signatureStrengths];
                                  newArr[idx].forca = e.target.value;
                                  setSignatureStrengths(newArr);
                                }}
                                className="w-full bg-gray-900 border border-gray-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-amber-500 text-gray-200"
                              />
                            </div>
                            <div className="md:col-span-7 flex flex-col sm:flex-row sm:items-center justify-end gap-2">
                              <span className="text-[10px] text-gray-500 font-mono shrink-0">Uso: <strong className="text-amber-400 font-bold">{item.utilidade}/10</strong></span>
                              <div className="flex items-center gap-0.5 overflow-x-auto">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      const newArr = [...signatureStrengths];
                                      newArr[idx].utilidade = v;
                                      setSignatureStrengths(newArr);
                                    }}
                                    className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-all cursor-pointer ${
                                      item.utilidade === v
                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/50 font-bold"
                                        : "bg-gray-900 text-gray-500 border border-transparent hover:bg-gray-800 hover:text-gray-300"
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Maladaptive Schemas */}
                  {activeSegment === 'sch' && (
                    <div className="space-y-4 animate-fadeIn" id="tab-schemas">
                      <div className="bg-purple-950/10 border border-purple-900/30 p-4 rounded-xl text-xs text-purple-400 space-y-1">
                        <strong className="text-purple-300 block font-sans">ESQUEMAS DESADAPTATIVOS E NECESSIDADES</strong>
                        <span>Mapeie até 5 esquemas desadaptativos ativos e a Correspondente Necessidade Psicológica Não Atendida. Classifique a ativação e gatilho corporal (0-10).</span>
                      </div>

                      <div className="space-y-4">
                        {maladaptiveSchemes.map((item, idx) => (
                          <div key={idx} className="bg-gray-950/40 p-4 rounded-xl border border-gray-900 space-y-3">
                            <span className="text-xs font-bold font-mono text-purple-400 uppercase">Esquema Psicológico {idx + 1}</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-mono uppercase font-bold">Esquema Desadaptativo:</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Abandono / Instabilidade"
                                  value={item.esquema}
                                  onChange={(e) => {
                                    const newArr = [...maladaptiveSchemes];
                                    newArr[idx].esquema = e.target.value;
                                    setMaladaptiveSchemes(newArr);
                                  }}
                                  className="w-full bg-gray-900 border border-gray-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-purple-500 text-gray-200"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-mono uppercase font-bold">Necessidade Não Suprida:</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Segurança, afeto e estabilidade"
                                  value={item.necessidade}
                                  onChange={(e) => {
                                    const newArr = [...maladaptiveSchemes];
                                    newArr[idx].necessidade = e.target.value;
                                    setMaladaptiveSchemes(newArr);
                                  }}
                                  className="w-full bg-gray-900 border border-gray-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-purple-500 text-gray-200"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-900/50 pt-2.5">
                              <span className="text-[10px] text-gray-500 font-mono">Nível de Ativação / Intensidade: <strong className="text-purple-400 font-bold">{item.ativacao}/10</strong></span>
                              <div className="flex items-center gap-0.5 overflow-x-auto">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      const newArr = [...maladaptiveSchemes];
                                      newArr[idx].ativacao = v;
                                      setMaladaptiveSchemes(newArr);
                                    }}
                                    className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-all cursor-pointer ${
                                      item.ativacao === v
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/50 font-bold"
                                        : "bg-gray-900 text-gray-500 border border-transparent hover:bg-gray-800 hover:text-gray-300"
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Psychological Skills */}
                  {activeSegment === 'ski' && (
                    <div className="space-y-4 animate-fadeIn" id="tab-skills">
                      <div className="bg-[#00A3FF]/10 border border-[#00A3FF]/30 p-4 rounded-xl text-xs text-[#00A3FF] space-y-1">
                        <strong className="text-sky-300 block font-sans">HABILIDADES PSICOLÓGICAS (HP) E VALORES A DESENVOLVER (THGP)</strong>
                        <span>Mapeie até 5 HPs cruciais para autonomia do paciente e os Valores de validação dessa HP. Avalie o grau atual de domínio clínico (0-10).</span>
                      </div>

                      <div className="space-y-4">
                        {psychologicalSkills.map((item, idx) => (
                          <div key={idx} className="bg-gray-950/40 p-4 rounded-xl border border-gray-900 space-y-3">
                            <span className="text-xs font-bold font-mono text-[#00A3FF] uppercase">Habilidade {idx + 1}</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-mono uppercase font-bold">Habilidade a Desenvolver (HP):</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Comunicação Assertiva"
                                  value={item.hp}
                                  onChange={(e) => {
                                    const newArr = [...psychologicalSkills];
                                    newArr[idx].hp = e.target.value;
                                    setPsychologicalSkills(newArr);
                                  }}
                                  className="w-full bg-gray-900 border border-gray-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#00A3FF] text-gray-200"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-mono uppercase font-bold">Valores Orientadores:</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Autenticidade, Companheirismo"
                                  value={item.valores}
                                  onChange={(e) => {
                                    const newArr = [...psychologicalSkills];
                                    newArr[idx].valores = e.target.value;
                                    setPsychologicalSkills(newArr);
                                  }}
                                  className="w-full bg-gray-900 border border-gray-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#00A3FF] text-gray-200"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-900/50 pt-2.5">
                              <span className="text-[10px] text-gray-500 font-mono font-bold">Domínio Presente: <strong className="text-[#00A3FF] font-bold">{item.dominio}/10</strong></span>
                              <div className="flex items-center gap-0.5 overflow-x-auto">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      const newArr = [...psychologicalSkills];
                                      newArr[idx].dominio = v;
                                      setPsychologicalSkills(newArr);
                                    }}
                                    className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-all cursor-pointer ${
                                      item.dominio === v
                                        ? "bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/50 font-bold"
                                        : "bg-gray-900 text-gray-500 border border-transparent hover:bg-gray-800 hover:text-gray-300"
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: Curative Contingencies */}
                  {activeSegment === 'cur' && (
                    <div className="space-y-4 animate-fadeIn" id="tab-curative">
                      <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-xl text-xs text-emerald-400 space-y-1">
                        <strong className="text-emerald-300 block font-sans">CONTINGÊNCIAS CURATIVAS (Experiências Saudáveis e Reestruturação)</strong>
                        <span>Mapeie até 3 vivências clínicas ou ensaiadas de experiências curativas que mostram avanço sobre os estressores. Classifique o nível de consolidação atual (0-10).</span>
                      </div>

                      <div className="space-y-4">
                        {curativeSituations.map((item, idx) => (
                          <div key={idx} className="bg-gray-950/40 p-4 rounded-xl border border-gray-900 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono text-gray-400 uppercase">Ocorrência Curativa {idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] text-gray-500 font-mono">Data do Ganho:</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Mai/2026"
                                  value={item.data}
                                  onChange={(e) => {
                                    const newArr = [...curativeSituations];
                                    newArr[idx].data = e.target.value;
                                    setCurativeSituations(newArr);
                                  }}
                                  className="bg-gray-900 border border-gray-800 text-xs px-2 py-1 rounded focus:outline-none focus:border-emerald-500 text-gray-200 font-mono w-28"
                                />
                              </div>
                            </div>

                            <textarea
                              rows={2}
                              value={item.situacao}
                              onChange={(e) => {
                                const newArr = [...curativeSituations];
                                newArr[idx].situacao = e.target.value;
                                setCurativeSituations(newArr);
                              }}
                              placeholder={`Descreva a situação/vivência curativa e saudável aprendida...`}
                              className="w-full bg-gray-900 text-xs text-gray-200 px-3 py-2 rounded border border-gray-800 focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-900/50 pt-2.5">
                              <span className="text-[10px] text-gray-500 font-mono">Domínio / Consolidação: <strong className="text-emerald-400 font-bold">{item.consolidacao}/10</strong></span>
                              <div className="flex items-center gap-0.5 overflow-x-auto">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      const newArr = [...curativeSituations];
                                      newArr[idx].consolidacao = v;
                                      setCurativeSituations(newArr);
                                    }}
                                    className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-all cursor-pointer ${
                                      item.consolidacao === v
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold"
                                        : "bg-gray-900 text-gray-500 border border-transparent hover:bg-gray-800 hover:text-gray-300"
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* --- GENEALOGIA DOS ATRIBUTOS PESSOAIS VIEW --- */}
              {tool.id === "genealogia_atributos" && (
                <div className="space-y-6" id="genealogy-evaluation-view">
                  <div className="bg-purple-950/10 border border-purple-900/30 p-4 rounded-xl text-xs text-purple-400 space-y-1">
                    <strong className="text-purple-300 block font-sans">GENEALOGIA DOS ATRIBUTOS PESSOAIS (HP de Autoconhecimento)</strong>
                    <span>Insira as principais Forças (virtudes, valores, recursos) e Fraquezas (bloqueios, excessos, esquemas, déficits de habilidade) identificadas em cada membro da família. Separe os termos por vírgulas.</span>
                  </div>

                  <div className="space-y-8 py-4 relative" id="genealogy-tree-container">
                    {/* Visual Connector Line Hints */}
                    <div className="hidden md:block absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                      <svg className="w-full h-full text-purple-950/20" style={{ stroke: "currentColor", strokeWidth: "1.5", fill: "none", strokeDasharray: "4 4" }}>
                        {/* Connecting lines between Grandparents, Parents and Self */}
                        <path d="M 110 90 L 110 130 L 225 130 L 225 180" />
                        <path d="M 330 90 L 330 130 L 225 130 L 225 180" />
                        <path d="M 550 90 L 550 130 L 660 130 L 660 180" />
                        <path d="M 770 90 L 770 130 L 660 130 L 660 180" />
                        <path d="M 225 330 L 225 370 L 440 370 L 440 420" />
                        <path d="M 660 330 L 660 370 L 440 370 L 440 420" />
                      </svg>
                    </div>

                    {/* ROW 1: GRANDPARENTS (AVÓS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                      {/* AVÔ PATERNO */}
                      <div className="bg-[#111217]/80 p-4 rounded-xl border border-gray-900 hover:border-blue-500/30 transition-all space-y-3">
                        <div className="border-b border-gray-900 pb-1.5">
                          <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider font-bold block">Linhagem Paterna</span>
                          <h4 className="text-xs font-bold text-gray-200">Avô Paterno</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase block">Forças:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Trabalho ético, Coragem"
                              value={genealogyData.avoPaterno.forcas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoPaterno.forcas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase block">Fraquezas:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Rigidez, Distanciamento"
                              value={genealogyData.avoPaterno.fraquezas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoPaterno.fraquezas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* AVÓ PATERNA */}
                      <div className="bg-[#111217]/80 p-4 rounded-xl border border-gray-900 hover:border-blue-500/30 transition-all space-y-3">
                        <div className="border-b border-gray-900 pb-1.5">
                          <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider font-bold block">Linhagem Paterna</span>
                          <h4 className="text-xs font-bold text-gray-200">Avó Paterna</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase block">Forças:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Resiliência, Afetuosidade"
                              value={genealogyData.avoPaterna.forcas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoPaterna.forcas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase block">Fraquezas:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Preocupação excessiva"
                              value={genealogyData.avoPaterna.fraquezas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoPaterna.fraquezas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* AVÔ MATERNO */}
                      <div className="bg-[#111217]/80 p-4 rounded-xl border border-gray-900 hover:border-amber-500/30 transition-all space-y-3">
                        <div className="border-b border-gray-900 pb-1.5">
                          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider font-bold block">Linhagem Materna</span>
                          <h4 className="text-xs font-bold text-gray-200">Avô Materno</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase block">Forças:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Sabedoria prática, Humor"
                              value={genealogyData.avoMaterno.forcas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoMaterno.forcas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase block">Fraquezas:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Impulsividade, Teimosia"
                              value={genealogyData.avoMaterno.fraquezas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoMaterno.fraquezas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* AVÓ MATERNA */}
                      <div className="bg-[#111217]/80 p-4 rounded-xl border border-gray-900 hover:border-amber-500/30 transition-all space-y-3">
                        <div className="border-b border-gray-900 pb-1.5">
                          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider font-bold block">Linhagem Materna</span>
                          <h4 className="text-xs font-bold text-gray-200">Avó Materna</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase block">Forças:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Empatia, Organização"
                              value={genealogyData.avoMaterna.forcas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoMaterna.forcas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase block">Fraquezas:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Rigidez emocional"
                              value={genealogyData.avoMaterna.fraquezas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.avoMaterna.fraquezas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-2 py-1 rounded focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ROW 2: PARENTS (PAIS) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 max-w-3xl mx-auto">
                      {/* PAI */}
                      <div className="bg-[#111217]/90 p-4 rounded-xl border border-gray-900 hover:border-blue-500/40 transition-all space-y-3">
                        <div className="border-b border-gray-900 pb-1.5 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider font-bold block">Filho Paternal</span>
                            <h4 className="text-sm font-bold text-gray-200">Pai</h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase block">Forças do Pai:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Disciplina, Paciência"
                              value={genealogyData.pai.forcas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.pai.forcas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-3 py-2 rounded focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase block">Fraquezas do Pai:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Dificuldade afetiva"
                              value={genealogyData.pai.fraquezas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.pai.fraquezas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-3 py-2 rounded focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* MÃE */}
                      <div className="bg-[#111217]/90 p-4 rounded-xl border border-gray-900 hover:border-amber-500/40 transition-all space-y-3">
                        <div className="border-b border-gray-900 pb-1.5 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider font-bold block">Filha Maternal</span>
                            <h4 className="text-sm font-bold text-gray-200">Mãe</h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase block">Forças da Mãe:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Generosidade, Cuidado"
                              value={genealogyData.mae.forcas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.mae.forcas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-3 py-2 rounded focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase block">Fraquezas de Mãe:</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Cobrança, Ansiedade"
                              value={genealogyData.mae.fraquezas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.mae.fraquezas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-200 px-3 py-2 rounded focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ROW 3: PATIENT (EU) */}
                    <div className="relative z-10 max-w-xl mx-auto">
                      {/* EU */}
                      <div className="bg-[#161324] p-5 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/60 shadow-xl transition-all space-y-4">
                        <div className="border-b border-purple-900/40 pb-2 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider font-extrabold block">Alvo de Autoexame Sistêmico</span>
                            <h4 className="text-base font-black text-white">EU (O Paciente)</h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase block">Minhas Forças de Herança / Atributos:</label>
                            <textarea
                              rows={3}
                              placeholder="Ex: Criatividade, Resiliência estruturada, Senso de dever"
                              value={genealogyData.eu.forcas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.eu.forcas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-800 text-xs text-gray-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-red-400 font-mono font-extrabold uppercase block">Minhas Vulnerabilidades / Esquemas:</label>
                            <textarea
                              rows={3}
                              placeholder="Ex: Perfeccionismo, Medo do abandono, Fusão cognitiva"
                              value={genealogyData.eu.fraquezas}
                              onChange={(e) => {
                                const copy = { ...genealogyData };
                                copy.eu.fraquezas = e.target.value;
                                setGenealogyData(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-800 text-xs text-gray-100 px-3 py-2 rounded-xl focus:outline-none focus:border-red-500/50 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* --- LINHA DA VIDA VIEW --- */}
              {tool.id === "linha_vida" && (
                <div className="space-y-6" id="lifeline-evaluation-view">
                  <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-xl text-xs text-emerald-400 space-y-1">
                    <strong className="text-emerald-300 block font-sans">LINHA DA VIDA (HP de Autoconhecimento)</strong>
                    <span>Uma perspectiva sócio-histórica de autoconhecimento. Insira a idade no círculo correspondente e selecione se a vivência foi <strong>Positiva</strong> (desenha um vetor para cima) ou <strong>Negativa</strong> (desenha um vetor para baixo). Componha a narrativa de cada evento para rastrear sua herança comportamental e resiliência ativa.</span>
                  </div>

                  {/* Dynamic Graphic Life Line Board */}
                  <div className="bg-[#111217] border border-gray-900 rounded-2xl p-6 space-y-6 overflow-hidden relative shadow-lg">
                    {/* Header Labels matching PDF design */}
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase pb-2 border-b border-gray-900">
                      <span className="text-emerald-500 font-extrabold flex items-center gap-1">🔺 Experiências Positivas</span>
                      <span className="text-gray-500 font-bold">Cronologia Biográfica</span>
                      <span className="text-red-500 font-extrabold flex items-center gap-1">🔻 Experiências Negativas</span>
                    </div>

                    {/* Timeline Strip Component */}
                    <div className="relative overflow-x-auto pb-4 pt-1 px-4 custom-scrollbar" style={{ minHeight: "380px" }}>
                      {/* Horizontal Axis Line */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-gray-900 via-emerald-800/30 to-gray-900 z-0 pointer-events-none" />

                      <div className="flex items-center gap-8 md:gap-14 relative z-10 min-w-max py-10">
                        {/* Sort events by age numerically before rendering so it's a real chronological timeline line! */}
                        {[...lifeLineEvents]
                          .sort((a, b) => {
                            const ageA = parseInt(a.age) || 0;
                            const ageB = parseInt(b.age) || 0;
                            return ageA - ageB;
                          })
                          .map((ev) => {
                            const isPositive = ev.type === "positive";
                            const isNegative = ev.type === "negative";
                            
                            return (
                              <div key={ev.id} className="flex flex-col items-center w-[180px] relative shrink-0">
                                
                                {/* UPPER CARD: POSITIVE EXPERIENCE BARNER */}
                                <div className="h-[120px] flex flex-col justify-end w-full pb-3">
                                  {isPositive && (
                                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-2 text-center text-[10px] text-emerald-300 shadow-xl space-y-1 relative duration-200">
                                      <div className="font-mono text-[9px] text-emerald-500 font-extrabold">Idade: {ev.age} anos</div>
                                      <p className="line-clamp-3 font-sans break-words">{ev.description || "Descrição vazia"}</p>
                                      {/* Indicator Vector Line pointing Down to Circle */}
                                      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-16px] w-[2px] h-[16px] bg-emerald-500/50" />
                                    </div>
                                  )}
                                </div>

                                {/* CENTRAL ROW: CIRCLE & CONNECTORS */}
                                <div className="relative my-3 flex flex-col items-center">
                                  {/* Event circle bubble */}
                                  <button
                                    onClick={() => {}}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all duration-300 z-10 ${
                                      isPositive
                                        ? "bg-emerald-950 border-emerald-500 text-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                        : isNegative
                                          ? "bg-red-950 border-red-500 text-red-400 font-black shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                          : "bg-gray-950 border-gray-800 text-gray-500 border-dashed"
                                    }`}
                                  >
                                    {ev.age || "?"}
                                  </button>

                                  {/* Line markers to connect arrows visually */}
                                  {isPositive && (
                                    <span className="text-emerald-500 font-extrabold text-xs absolute top-[-18px]">▲</span>
                                  )}
                                  {isNegative && (
                                    <span className="text-red-500 font-extrabold text-xs absolute bottom-[-18px]">▼</span>
                                  )}
                                </div>

                                {/* LOWER CARD: NEGATIVE EXPERIENCE BARNER */}
                                <div className="h-[120px] flex flex-col justify-start w-full pt-3">
                                  {isNegative && (
                                    <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-2 text-center text-[10px] text-red-300 shadow-xl space-y-1 relative duration-200">
                                      {/* Indicator Vector Line pointing Up to Circle */}
                                      <div className="absolute left-1/2 -translate-x-1/2 top-[-16px] w-[2px] h-[16px] bg-red-500/50" />
                                      <div className="font-mono text-[9px] text-red-500 font-extrabold">Idade: {ev.age} anos</div>
                                      <p className="line-clamp-3 font-sans break-words">{ev.description || "Descrição vazia"}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                        {/* FINAL DESIGN ARROW SYMBOL FROM PDF ( O O O O > ) */}
                        <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-950/40 text-gray-600 font-mono text-lg z-10">
                          ⟫
                        </div>
                      </div>
                    </div>

                    {/* Interactive Editor Panel for building the Life Line Events */}
                    <div className="border-t border-gray-900 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-100 font-sans tracking-wide flex items-center gap-2">
                          <span className="p-1 rounded bg-[#00A3FF]/10 text-[#00A3FF]">📜</span>
                          Editar Eventos da Minha Linha da Vida
                        </h4>
                        <button
                          onClick={() => {
                            const newId = (Math.random() + 1).toString(36).substring(7);
                            const copy = [...lifeLineEvents];
                            // Default new event age based on highest current event age + 4
                            const maxAge = Math.max(...copy.map(c => parseInt(c.age) || 0), 20);
                            copy.push({
                              id: newId,
                              age: (maxAge + 4).toString(),
                              type: "positive",
                              description: "Ação de enfrentamento / Vivência significativa."
                            });
                            setLifeLineEvents(copy);
                          }}
                          className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/60 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                          + Adicionar Círculo (Época)
                        </button>
                      </div>

                      {/* Timeline Editor Form grid row per item */}
                      <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {lifeLineEvents.map((ev, index) => (
                          <div
                            key={ev.id}
                            className="bg-gray-950 border border-gray-900 p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-3 relative hover:border-gray-800 transition-colors"
                          >
                            {/* Chronology Badge / Index */}
                            <span className="text-[10px] text-gray-600 font-mono w-5">#{index + 1}</span>

                            {/* Age field */}
                            <div className="flex items-center gap-2 w-full md:w-[130px] shrink-0">
                              <span className="text-[9px] text-gray-500 font-mono uppercase">Idade:</span>
                              <input
                                type="number"
                                min="0"
                                max="120"
                                value={ev.age}
                                onChange={(e) => {
                                  const copy = [...lifeLineEvents];
                                  const item = copy.find(x => x.id === ev.id);
                                  if (item) {
                                    item.age = e.target.value;
                                    setLifeLineEvents(copy);
                                  }
                                }}
                                className="w-16 bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </div>

                            {/* Type toggle: Positive Up / Negative Down */}
                            <div className="flex items-center gap-1 bg-gray-900 p-0.5 border border-gray-800 rounded-lg shrink-0">
                              <button
                                onClick={() => {
                                  const copy = [...lifeLineEvents];
                                  const item = copy.find(x => x.id === ev.id);
                                  if (item) {
                                    item.type = "positive";
                                    setLifeLineEvents(copy);
                                  }
                                }}
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                                  ev.type === "positive"
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                                    : "text-gray-500 hover:text-gray-300"
                                }`}
                              >
                                ▲ Positiva
                              </button>
                              <button
                                onClick={() => {
                                  const copy = [...lifeLineEvents];
                                  const item = copy.find(x => x.id === ev.id);
                                  if (item) {
                                    item.type = "negative";
                                    setLifeLineEvents(copy);
                                  }
                                }}
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                                  ev.type === "negative"
                                    ? "bg-red-950 text-red-400 border border-red-500/20"
                                    : "text-gray-500 hover:text-gray-300"
                                }`}
                              >
                                ▼ Negativa
                              </button>
                            </div>

                            {/* Event short summary */}
                            <input
                              type="text"
                              value={ev.description}
                              placeholder="Ex: Nascimento do irmão menor, sensação de responsabilidade"
                              onChange={(e) => {
                                const copy = [...lifeLineEvents];
                                const item = copy.find(x => x.id === ev.id);
                                if (item) {
                                  item.description = e.target.value;
                                  setLifeLineEvents(copy);
                                }
                              }}
                              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                            />

                            {/* Delete button */}
                            <button
                              onClick={() => {
                                if (lifeLineEvents.length <= 1) return; // keep at least 1
                                setLifeLineEvents(lifeLineEvents.filter(x => x.id !== ev.id));
                              }}
                              className="text-red-500/70 hover:text-red-400 text-xs font-mono ml-auto"
                              title="Remover Evento"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* --- ANALISE DA SATISFACAO MULTIDIMENSIONAL VIEW --- */}
              {tool.id === "satisfacao_multidimensional" && (
                <MultidimSatisfactionView
                  patient={patient}
                  multidimSatisfaction={multidimSatisfaction}
                  setMultidimSatisfaction={setMultidimSatisfaction}
                />
              )}

              {/* --- RADAR MULTIDIMENSIONAL VIEW --- */}
              {tool.id === "radar_multidimensional" && (
                <RadarMultidimensionalView
                  patient={patient}
                  radarSubscales={radarSubscales}
                  setRadarSubscales={setRadarSubscales}
                  totalScore={currentScores.totalScore}
                />
              )}

              {/* --- RADAR DE HABILIDADES PSICOLOGICAS VIEW --- */}
              {tool.id === "radar_habilidades" && (
                <RadarHabilidadesPsicologicasView
                  patient={patient}
                  skillsRadarSubscales={skillsRadarSubscales}
                  setSkillsRadarSubscales={setSkillsRadarSubscales}
                  totalScore={currentScores.totalScore}
                />
              )}

              {/* --- EXAME DOS ATRIBUTOS PARENTAIS VIEW --- */}
              {tool.id === "exame_atributos_parentais" && (
                <ExameAtributosParentaisView
                  patient={patient}
                  caregivers={parentalCaregivers}
                  setCaregivers={setParentalCaregivers}
                />
              )}

              {/* --- EXAME DE EVIDENCIAS DA COGNICAO VIEW --- */}
              {tool.id === "exame_evidencias_cognicao" && (
                <ExameEvidenciasCognicaoView
                  patient={patient}
                  state={cognitiveEvidence}
                  setState={setCognitiveEvidence}
                />
              )}

              {/* --- REESTRUTURACAO SEMANTICA VIEW --- */}
              {tool.id === "reestruturacao_semantica" && (
                <ReestruturacaoSemanticaView
                  patient={patient}
                  state={semanticRestructuring}
                  setState={setSemanticRestructuring}
                />
              )}

              {/* --- EXAME E DESENVOLVIMENTO DA AUTOESTIMA VIEW --- */}
              {tool.id === "exame_desenvolvimento_autoestima" && (
                <ExameDesenvolvimentoAutoestimaView
                  patient={patient}
                  state={selfEsteem}
                  setState={setSelfEsteem}
                />
              )}

              {/* --- CARTAO DE ENFRENTAMENTO VIEW --- */}
              {tool.id === "cartao_enfrentamento" && (
                <CartaoEnfrentamentoView
                  patient={patient}
                  state={copingCards}
                  setState={setCopingCards}
                />
              )}

              {/* --- DESPOLARIZACAO ALTERNATIVAS VIEW --- */}
              {tool.id === "despolarizacao_alternativas" && (
                <DespolarizacaoAlternativasView
                  patient={patient}
                  state={despolarizacao}
                  setState={setDespolarizacao}
                />
              )}

              {/* --- ESPECTRO COGNITIVO VIEW --- */}
              {tool.id === "espectro_cognitivo" && (
                <EspectroCognitivoView
                  patient={patient}
                  state={espectroCognitivo}
                  setState={setEspectroCognitivo}
                />
              )}

              {/* --- REGISTRO DE INTERAÇÕES DISFUNCIONAIS (RID) VIEW --- */}
              {tool.id === "rid_interacoes" && (
                <RidInteracoesView
                  patient={patient}
                  state={ridInteracoes}
                  setState={setRidInteracoes}
                />
              )}

              {/* --- TRANSIÇÃO PARA MECANISMO FUNCIONAL (TOOL 19) VIEW --- */}
              {tool.id === "transicao_mecanismo" && (
                <TransicaoMecanismoView
                  patient={patient}
                  state={transicaoMecanismo}
                  setState={setTransicaoMecanismo}
                />
              )}

              {/* --- EXAME DUPLO DE VANTAGENS E DESVANTAGENS (TOOL 20) VIEW --- */}
              {tool.id === "exame_duplo_vantagens" && (
                <ExameDuploVantagensView
                  patient={patient}
                  state={exameDuploVantagens}
                  setState={setExameDuploVantagens}
                />
              )}

              {/* --- EXAME DE FEEDBACKS (ENTREVISTA E FILTROS) (TOOL 21) VIEW --- */}
              {tool.id === "exame_feedbacks_entrevista" && (
                <ExameFeedbacksEntrevistaView
                  patient={patient}
                  state={exameFeedbacksEntrevista}
                  setState={setExameFeedbacksEntrevista}
                />
              )}

              {/* --- EXAME DA QUALIDADE DOS ATRIBUTOS PESSOAIS (TOOL 22) VIEW --- */}
              {tool.id === "exame_atributos_pessoais" && (
                <ExameAtributosPessoaisView
                  patient={patient}
                  state={exameAtributosPessoais}
                  setState={setExameAtributosPessoais}
                />
              )}

              {/* --- EXAME DE CARACTERÍSTICAS SINGULARES E COMPARTILHADAS (TOOL 23) VIEW --- */}
              {tool.id === "exame_singulares_compartilhadas" && (
                <ExameSingularesCompartilhadasView
                  patient={patient}
                  state={exameSingularesCompartilhadas}
                  setState={setExameSingularesCompartilhadas}
                />
              )}

              {/* --- EXAME HISTÓRICO DA PROVISÃO EMOCIONAL (TOOL 24) VIEW --- */}
              {tool.id === "exame_provisao_emocional" && (
                <ExameProvisaoEmocionalView
                  patient={patient}
                  state={exameProvisaoEmocional}
                  setState={setExameProvisaoEmocional}
                />
              )}

              {/* --- EXAME DAS ATITUDES E EFEITOS NAS DIMENSÕES (TOOL 25) VIEW --- */}
              {tool.id === "exame_atitudes_dimensoes" && (
                <ExameAtitudesDimensoesView
                  patient={patient}
                  state={exameAtitudesDimensoes}
                  setState={setExameAtitudesDimensoes}
                />
              )}

              {/* --- EXAME DAS REAÇÕES SOCIAIS AOS MEUS COMPORTAMENTOS (TOOL 26) VIEW --- */}
              {tool.id === "exame_reacoes_sociais" && (
                <ExameReacoesSociaisView
                  patient={patient}
                  state={exameReacoesSociais}
                  setState={setExameReacoesSociais}
                />
              )}

              {/* --- HIERARQUIA DE EXPOSIÇÃO E ENFRENTAMENTO (TOOL 27) VIEW --- */}
              {tool.id === "hierarquia_exposicao_enfrentamento" && (
                <ExameHierarquiaExposicaoEnfrentamentoView
                  patient={patient}
                  state={exameHierarquiaExposicao}
                  setState={setExameHierarquiaExposicao}
                />
              )}

              {/* --- ANÁLISE DOS MODELOS PESSOAIS (TOOL 28) VIEW --- */}
              {tool.id === "analise_modelos_pessoais" && (
                <ExameModelosPessoaisView
                  patient={patient}
                  state={exameModelosPessoais}
                  setState={setExameModelosPessoais}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: HEDONISMO RESPONSÁVEL (TOOL 29) VIEW --- */}
              {tool.id === "mentalidades_hedonismo_responsavel" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_hedonismo_responsavel"
                  state={mentalidadesHedonismo}
                  setState={setMentalidadesHedonismo}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: AUTOCONHECIMENTO (TOOL 30) VIEW --- */}
              {tool.id === "mentalidades_autoconhecimento" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_autoconhecimento"
                  state={mentalidadesAutoconhecimento}
                  setState={setMentalidadesAutoconhecimento}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: AUTOESTIMA (TOOL 31) VIEW --- */}
              {tool.id === "mentalidades_autoestima" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_autoestima"
                  state={mentalidadesAutoestima}
                  setState={setMentalidadesAutoestima}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: RACIOCÍNIO OTIMISTA (TOOL 32) VIEW --- */}
              {tool.id === "mentalidades_raciocinio_otimista" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_raciocinio_otimista"
                  state={mentalidadesRaciocinioOtimista}
                  setState={setMentalidadesRaciocinioOtimista}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: AUTORREGULAÇÃO EMOCIONAL (TOOL 33) VIEW --- */}
              {tool.id === "mentalidades_autorregulacao_emocional" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_autorregulacao_emocional"
                  state={mentalidadesAutorregulacaoEmocional}
                  setState={setMentalidadesAutorregulacaoEmocional}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: IMUNIDADE SOCIAL (TOOL 34) VIEW --- */}
              {tool.id === "mentalidades_imunidade_social" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_imunidade_social"
                  state={mentalidadesImunidadeSocial}
                  setState={setMentalidadesImunidadeSocial}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: RESOLUTIVIDADE E ENFRENTAMENTO (TOOL 35) VIEW --- */}
              {tool.id === "mentalidades_resolutividade_enfrentamento" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_resolutividade_enfrentamento"
                  state={mentalidadesResolutividadeEnfrentamento}
                  setState={setMentalidadesResolutividadeEnfrentamento}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: AUTOCONTROLE (TOOL 36) VIEW --- */}
              {tool.id === "mentalidades_autocontrole" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_autocontrole"
                  state={mentalidadesAutocontrole}
                  setState={setMentalidadesAutocontrole}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: SOCIABILIDADE (TOOL 37) VIEW --- */}
              {tool.id === "mentalidades_sociabilidade" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_sociabilidade"
                  state={mentalidadesSociabilidade}
                  setState={setMentalidadesSociabilidade}
                />
              )}

              {/* --- MENTALIDADES SAUDÁVEIS: SENSIBILIDADE SOCIAL (TOOL 38) VIEW --- */}
              {tool.id === "mentalidades_sensibilidade_social" && (
                <ExameMentalidadesSaudaveisView
                  patient={patient}
                  toolId="mentalidades_sensibilidade_social"
                  state={mentalidadesSensibilidadeSocial}
                  setState={setMentalidadesSensibilidadeSocial}
                />
              )}

              {/* --- ACOMPANHAMENTO DO PDP VIEW --- */}
              {tool.id === "acompanhamento_pdp" && (
                <PdpMonitoringView
                  patient={patient}
                  pdpState={pdpState}
                  setPdpState={setPdpState}
                  totalScore={currentScores.totalScore}
                />
              )}

              {/* --- ACOMPANHAMENTO DO PME VIEW --- */}
              {tool.id === "acompanhamento_pme" && (
                <PmeMonitoringView
                  patient={patient}
                  pmeState={pmeState}
                  setPmeState={setPmeState}
                  totalScore={currentScores.totalScore}
                />
              )}

              {/* --- OLD DEPRECATED SATISFACAO MULTIDIMENSIONAL VIEW --- */}
              {tool.id === "satisfacao_multidimensional_old" && (
                <div className="space-y-6 animate-fadeIn" id="multidim-satisfaction-view">
                  
                  {/* Informational banner */}
                  <div className="bg-[#00A3FF]/15 border border-[#00A3FF]/30 p-4 rounded-xl text-xs text-blue-300 space-y-1 block" id="multidim-satisfaction-instruction">
                    <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">📐 ANÁLISE DA SATISFAÇÃO MULTIDIMENSIONAL (RADAR INTEGRADO)</strong>
                    <span className="text-gray-400">Uma ferramenta terapêutica para mapear as 6 esferas vitais e suas 18 sub-esferas de funcionamento. Use o <strong>Gráfico Radar Interativo</strong> ou os <strong>sliders detalhados</strong> para calibrar de 1 a 10 a satisfação percebida do paciente. Descreva os ativos (investimentos já consolidados) e as metas terapêuticas em cada quadrante.</span>
                  </div>

                  {/* Visual PDF header facsimile mirroring the PDF credentials */}
                  <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="multidim-header-facsimile">
                    <div>
                      <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Paciente</span>
                      <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Anônimo"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Profissional Avaliador</span>
                      <input
                        type="text"
                        placeholder="Ex: Dr. Lincoln Poubel"
                        className="bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 px-2.5 py-1 text-gray-200 font-sans text-xs focus:outline-none w-full rounded"
                        defaultValue="Dr. Lincoln Poubel"
                      />
                    </div>
                    <div>
                      <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">CRP / Registro</span>
                      <input
                        type="text"
                        placeholder="Ex: CRP 04/99124-MG"
                        className="bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 px-2.5 py-1 text-gray-200 font-sans text-xs focus:outline-none w-full rounded"
                        defaultValue="CRP 04/99124-MG"
                      />
                    </div>
                  </div>

                  {/* TWO-COLUMN LAYOUT: LEFT RADAR, RIGHT BENTO ADJUSTERS */}
                  <div className="flex flex-col xl:flex-row gap-6" id="radar-multidim-two-column-layout">
                    
                    {/* LEFT PANEL: EXQUISITE RADAR DIAGRAM CARD */}
                    <div className="xl:w-[460px] shrink-0 bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col items-center relative shadow-[0_4px_25px_rgba(0,0,0,0.4)]" id="polar-radar-diagram-card">
                      <div className="text-center mb-4 border-b border-gray-900 pb-3 w-full">
                        <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-[#00A3FF]">Radar Multidimensional Vitais</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Clique diretamente nos círculos para colorir níveis de 1 a 10</p>
                      </div>
                      
                      {/* Responsive SVG canvas wrapper */}
                      <div className="relative w-full max-w-[370px] aspect-square flex items-center justify-center select-none" id="radar-svg-wrapper">
                        <svg viewBox="0 0 420 420" className="w-full h-full">
                          {/* Concentric helper circle rings (Levels 1 to 10) */}
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ring) => (
                            <circle
                              key={ring}
                              cx={210}
                              cy={210}
                              r={45 + ring * 12.5}
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.03)"
                              strokeWidth={0.75}
                              strokeDasharray={ring % 5 === 0 ? "none" : "2,3"}
                            />
                          ))}

                          {/* 18 Subscale concentric wedges */}
                          {SUBSCALE_METADATA.map((sub, s) => {
                            const val = radarSubscales[sub.id] || 0;
                            const startAngle = -90 + s * 20;
                            const endAngle = -90 + (s + 1) * 20;

                            return (
                              <g key={sub.id} id={`wedge-${sub.id}`}>
                                {/* Loop L from level 1 to 10 filled */}
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((L) => {
                                  const r_in = 45 + (L - 1) * 12.5;
                                  const r_out = 45 + L * 12.5;
                                  const path = getRadarArcPath(210, 210, r_in, r_out, startAngle, endAngle);
                                  const isActive = val >= L;
                                  
                                  return (
                                    <path
                                      key={L}
                                      d={path}
                                      fill={isActive ? sub.fillColorActive : sub.fillColorEmpty}
                                      stroke="rgba(0, 0, 0, 0.25)"
                                      strokeWidth={0.5}
                                      onClick={() => updateRadarSubscale(sub.id, L)}
                                      onMouseEnter={() => setHoveredSubscale(sub.id)}
                                      onMouseLeave={() => setHoveredSubscale(null)}
                                      className="cursor-pointer transition-all duration-150 hover:brightness-135 hover:stroke-[#00A3FF]/30"
                                      id={`segment-${sub.id}-${L}`}
                                    >
                                      <title>{`${sub.groupLabel} > ${sub.label}: Nível ${L}`}</title>
                                    </path>
                                  );
                                })}

                                {/* Radial borders separating individual slices */}
                                {(() => {
                                  const startRad = (startAngle * Math.PI) / 180;
                                  const x1 = 210 + 45 * Math.cos(startRad);
                                  const y1 = 210 + 45 * Math.sin(startRad);
                                  const x2 = 210 + 170 * Math.cos(startRad);
                                  const y2 = 210 + 170 * Math.sin(startRad);
                                  return (
                                    <line
                                      x1={x1} y1={y1} x2={x2} y2={y2}
                                      stroke="rgba(255,255,255,0.06)"
                                      strokeWidth={0.75}
                                    />
                                  );
                                })()}

                                {/* Text Label centered outside the concentric slices */}
                                {(() => {
                                  const rad = ((startAngle + 10) * Math.PI) / 180;
                                  const tx = 210 + 184 * Math.cos(rad);
                                  const ty = 210 + 184 * Math.sin(rad);
                                  
                                  let textAnchor = "middle";
                                  if (Math.cos(rad) > 0.1) textAnchor = "start";
                                  else if (Math.cos(rad) < -0.1) textAnchor = "end";

                                  const isHovered = hoveredSubscale === sub.id;

                                  return (
                                    <text
                                      x={tx}
                                      y={ty}
                                      dy="3"
                                      textAnchor={textAnchor}
                                      className={`font-mono text-[7px] font-bold select-none cursor-pointer uppercase transition-all duration-150 ${
                                        isHovered ? "fill-white font-black scale-105" : "fill-gray-400"
                                      }`}
                                      onClick={() => updateRadarSubscale(sub.id, val === 10 ? 1 : val + 1)}
                                      onMouseEnter={() => setHoveredSubscale(sub.id)}
                                      onMouseLeave={() => setHoveredSubscale(null)}
                                    >
                                      {sub.label.replace("Independência ", "Indep. ").replace("Espiritualidade", "Espirit.")}
                                    </text>
                                  );
                                })()}
                              </g>
                            );
                          })}

                          {/* 6 Thick radial separating borders dividing the 6 major dimensions */}
                          {[-90, -30, 30, 90, 150, 210].map((angle, k) => {
                            const rad = (angle * Math.PI) / 180;
                            const x1 = 210 + 45 * Math.cos(rad);
                            const y1 = 210 + 45 * Math.sin(rad);
                            const x2 = 210 + 178 * Math.cos(rad);
                            const y2 = 210 + 178 * Math.sin(rad);
                            return (
                              <line
                                key={k}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="#111217"
                                strokeWidth={2.5}
                              />
                            );
                          })}

                          {/* Center hole displays overall score (ISG) */}
                          <circle
                            cx={210}
                            cy={210}
                            r={45}
                            fill="#0c0d10"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth={1}
                          />
                          <text
                            x={210}
                            y={204}
                            textAnchor="middle"
                            className="font-mono text-[9px] uppercase tracking-widest fill-gray-500 font-bold"
                          >
                            ISG
                          </text>
                          <text
                            x={210}
                            y={224}
                            textAnchor="middle"
                            className="font-sans text-xl font-extrabold fill-[#00A3FF]"
                          >
                            {currentScores.totalScore}%
                          </text>
                        </svg>
                      </div>

                      {/* Interactive hover detailing card */}
                      <div className="w-full mt-4 min-h-[55px] p-3 rounded-lg border border-gray-900 bg-gray-950/60 font-mono text-[10px] text-center flex flex-col items-center justify-center transition-all">
                        {(() => {
                          const hoveredMeta = SUBSCALE_METADATA.find(m => m.id === hoveredSubscale);
                          if (hoveredMeta) {
                            const currentVal = radarSubscales[hoveredMeta.id] || 0;
                            return (
                              <div className="animate-fadeIn">
                                <span className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Esfera: {hoveredMeta.groupLabel}</span>
                                <div className={`text-xs font-bold font-sans mt-0.5 ${hoveredMeta.colorClass}`}>
                                  {hoveredMeta.label}
                                </div>
                                <div className="mt-1 text-gray-300">
                                  Satisfação Atual: <strong className="text-white font-bold">{currentVal} de 10</strong>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="text-gray-500 italic max-w-[300px]">
                                Passe o mouse nas fatias do círculo para ver subesferas e clique em qualquer anel para calibrar!
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>

                    {/* RIGHT PANEL: 6 DIMENSION CARD BENTO ADJUSTERS */}
                    <div className="flex-1 space-y-6" id="bento-adjusters-satisfaction-list">
                      
                      {/* DIMENSION 1: PESSOAL */}
                      <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 hover:border-[#00A3FF]/20 transition-all flex flex-col space-y-4" id="bento-dim-pessoal">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🧬</span>
                            <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">1. Dimensão Pessoal</h4>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20">
                            {multidimSatisfaction.pessoal.satisfaction * 10}%
                          </span>
                        </div>

                        {/* Sliders for sub-scales */}
                        <div className="space-y-3 bg-gray-950/60 p-3 rounded-lg border border-gray-900/60">
                          <div className="flex justify-between items-center text-[10px] border-b border-gray-900/40 pb-1 mb-1.5 font-mono">
                            <span className="text-gray-500 uppercase font-bold text-[9px]">Sub-setores</span>
                            <span className="text-[#00A3FF] font-bold">Média: {multidimSatisfaction.pessoal.satisfaction} / 10</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Valor Pessoal</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.valor_pessoal || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.valor_pessoal || 0}
                                onChange={(e) => updateRadarSubscale("valor_pessoal", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Saúde</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.saude || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.saude || 0}
                                onChange={(e) => updateRadarSubscale("saude", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Autocuidado</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.autocuidado || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.autocuidado || 0}
                                onChange={(e) => updateRadarSubscale("autocuidado", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Descriptive areas */}
                        <div className="space-y-4 flex-grow">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider block">🟢 Investimento / Desfrute (Ativos)</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Prática regular de exercícios leves, autocuidado básico em dia..."
                              value={multidimSatisfaction.pessoal.desfrute}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.pessoal.desfrute = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-emerald-500/30 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider block">🔴 Coisas Pendentes / Metas</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Melhorar qualidade do sono, marcar consulta médica preventiva..."
                              value={multidimSatisfaction.pessoal.pendente}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.pessoal.pendente = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-red-500/30 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DIMENSION 2: INTERPESSOAL */}
                      <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 hover:border-[#00A3FF]/20 transition-all flex flex-col space-y-4" id="bento-dim-interpessoal">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">👥</span>
                            <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">2. Dimensão Interpessoal</h4>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20">
                            {multidimSatisfaction.interpessoal.satisfaction * 10}%
                          </span>
                        </div>

                        {/* Sliders for sub-scales */}
                        <div className="space-y-3 bg-gray-950/60 p-3 rounded-lg border border-gray-900/60">
                          <div className="flex justify-between items-center text-[10px] border-b border-gray-900/40 pb-1 mb-1.5 font-mono">
                            <span className="text-gray-500 uppercase font-bold text-[9px]">Sub-setores</span>
                            <span className="text-[#00A3FF] font-bold">Média: {multidimSatisfaction.interpessoal.satisfaction} / 10</span>
                          </div>

                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Amizade</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.amizade || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.amizade || 0}
                                onChange={(e) => updateRadarSubscale("amizade", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Família</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.familia || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.familia || 0}
                                onChange={(e) => updateRadarSubscale("familia", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Intimidade</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.intimidade || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.intimidade || 0}
                                onChange={(e) => updateRadarSubscale("intimidade", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Descriptive areas */}
                        <div className="space-y-4 flex-grow">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider block">🟢 Investimento / Desfrute (Ativos)</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Amigos confiáveis e contatos familiares amigáveis e constantes..."
                              value={multidimSatisfaction.interpessoal.desfrute}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.interpessoal.desfrute = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-emerald-500/30 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider block">🔴 Coisas Pendentes / Metas</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Aumentar frequência de encontros presenciais, limites interpessoais saudáveis..."
                              value={multidimSatisfaction.interpessoal.pendente}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.interpessoal.pendente = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-red-500/30 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DIMENSION 3: OCUPACIONAL */}
                      <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 hover:border-[#00A3FF]/20 transition-all flex flex-col space-y-4" id="bento-dim-ocupacional">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">💼</span>
                            <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">3. Dimensão Ocupacional</h4>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20">
                            {multidimSatisfaction.ocupacional.satisfaction * 10}%
                          </span>
                        </div>

                        {/* Sliders for sub-scales */}
                        <div className="space-y-3 bg-gray-950/60 p-3 rounded-lg border border-gray-900/60">
                          <div className="flex justify-between items-center text-[10px] border-b border-gray-900/40 pb-1 mb-1.5 font-mono">
                            <span className="text-gray-500 uppercase font-bold text-[9px]">Sub-setores</span>
                            <span className="text-[#00A3FF] font-bold">Média: {multidimSatisfaction.ocupacional.satisfaction} / 10</span>
                          </div>

                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Estudo</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.estudo || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.estudo || 0}
                                onChange={(e) => updateRadarSubscale("estudo", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Trabalho</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.trabalho || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.trabalho || 0}
                                onChange={(e) => updateRadarSubscale("trabalho", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Conquistas</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.conquistas || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.conquistas || 0}
                                onChange={(e) => updateRadarSubscale("conquistas", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Descriptive areas */}
                        <div className="space-y-4 flex-grow">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider block">🟢 Investimento / Desfrute (Ativos)</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Trabalho tecnicamente estável, reconhecimento técnico pontual pelas minhas entregas..."
                              value={multidimSatisfaction.ocupacional.desfrute}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.ocupacional.desfrute = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-emerald-500/30 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider block">🔴 Coisas Pendentes / Metas</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Buscar alocidade em projetos mais criativos, planejar cargo de liderança..."
                              value={multidimSatisfaction.ocupacional.pendente}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.ocupacional.pendente = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-red-500/30 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DIMENSION 4: MATERIAL */}
                      <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 hover:border-[#00A3FF]/20 transition-all flex flex-col space-y-4" id="bento-dim-material">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🪙</span>
                            <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">4. Dimensão Material</h4>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20">
                            {multidimSatisfaction.material.satisfaction * 10}%
                          </span>
                        </div>

                        {/* Sliders for sub-scales */}
                        <div className="space-y-3 bg-gray-950/60 p-3 rounded-lg border border-gray-900/60">
                          <div className="flex justify-between items-center text-[10px] border-b border-gray-900/40 pb-1 mb-1.5 font-mono">
                            <span className="text-gray-500 uppercase font-bold text-[9px]">Sub-setores</span>
                            <span className="text-[#00A3FF] font-bold">Média: {multidimSatisfaction.material.satisfaction} / 10</span>
                          </div>

                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Indep. Financeira</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.indep_financ || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.indep_financ || 0}
                                onChange={(e) => updateRadarSubscale("indep_financ", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Patrimônio</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.patrimonio || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.patrimonio || 0}
                                onChange={(e) => updateRadarSubscale("patrimonio", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Qualidade de Vida</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.qualidade_vida || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.qualidade_vida || 0}
                                onChange={(e) => updateRadarSubscale("qualidade_vida", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Descriptive areas */}
                        <div className="space-y-4 flex-grow">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider block">🟢 Investimento / Desfrute (Ativos)</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Renda adequada para as necessidades básicas e estabilidade familiar corrente..."
                              value={multidimSatisfaction.material.desfrute}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.material.desfrute = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-emerald-500/30 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider block">🔴 Coisas Pendentes / Metas</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Reserva de emergência sólida e planejamento estruturado para compras de patrimônio..."
                              value={multidimSatisfaction.material.pendente}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.material.pendente = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-red-500/30 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DIMENSION 5: RECREATIVA */}
                      <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 hover:border-[#00A3FF]/20 transition-all flex flex-col space-y-4" id="bento-dim-recreativa">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">⛵</span>
                            <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">5. Dimensão Recreativa</h4>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20">
                            {multidimSatisfaction.recreativa.satisfaction * 10}%
                          </span>
                        </div>

                        {/* Sliders for sub-scales */}
                        <div className="space-y-3 bg-gray-950/60 p-3 rounded-lg border border-gray-900/60">
                          <div className="flex justify-between items-center text-[10px] border-b border-gray-900/40 pb-1 mb-1.5 font-mono">
                            <span className="text-gray-500 uppercase font-bold text-[9px]">Sub-setores</span>
                            <span className="text-[#00A3FF] font-bold">Média: {multidimSatisfaction.recreativa.satisfaction} / 10</span>
                          </div>

                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Lazer</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.lazer || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.lazer || 0}
                                onChange={(e) => updateRadarSubscale("lazer", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Hobbies</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.hobbies || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.hobbies || 0}
                                onChange={(e) => updateRadarSubscale("hobbies", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Passatempo</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.passatempo || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.passatempo || 0}
                                onChange={(e) => updateRadarSubscale("passatempo", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Descriptive areas */}
                        <div className="space-y-4 flex-grow">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider block">🟢 Investimento / Desfrute (Ativos)</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Assistência pontual de mídias, leitura recreativa aos finais de semana..."
                              value={multidimSatisfaction.recreativa.desfrute}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.recreativa.desfrute = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-emerald-500/30 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider block">🔴 Coisas Pendentes / Metas</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Resgatar hobbies analógicos, planejar viagens de descompressão ativa..."
                              value={multidimSatisfaction.recreativa.pendente}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.recreativa.pendente = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-red-500/30 resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DIMENSION 6: EXISTENCIAL */}
                      <div className="bg-[#111217] border border-gray-900 rounded-xl p-5 hover:border-[#00A3FF]/20 transition-all flex flex-col space-y-4" id="bento-dim-existencial">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🧘</span>
                            <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">6. Dimensão Existencial</h4>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20">
                            {multidimSatisfaction.existencial.satisfaction * 10}%
                          </span>
                        </div>

                        {/* Sliders for sub-scales */}
                        <div className="space-y-3 bg-gray-950/60 p-3 rounded-lg border border-gray-900/60">
                          <div className="flex justify-between items-center text-[10px] border-b border-gray-900/40 pb-1 mb-1.5 font-mono">
                            <span className="text-gray-500 uppercase font-bold text-[9px]">Sub-setores</span>
                            <span className="text-[#00A3FF] font-bold">Média: {multidimSatisfaction.existencial.satisfaction} / 10</span>
                          </div>

                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Metas de Vida</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.metas_vida || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.metas_vida || 0}
                                onChange={(e) => updateRadarSubscale("metas_vida", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Espiritualidade</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.espiritualidade || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.espiritualidade || 0}
                                onChange={(e) => updateRadarSubscale("espiritualidade", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-300">Ativismo Ideológico</span>
                                <span className="font-mono text-[#00A3FF] font-bold">{radarSubscales.ativismo_ideol || 0}/10</span>
                              </div>
                              <input
                                type="range" min="1" max="10" step="1"
                                value={radarSubscales.ativismo_ideol || 0}
                                onChange={(e) => updateRadarSubscale("ativismo_ideol", parseInt(e.target.value))}
                                className="w-full accent-[#00A3FF] h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Descriptive areas */}
                        <div className="space-y-4 flex-grow">
                          <div className="space-y-1">
                            <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider block">🟢 Investimento / Desfrute (Ativos)</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Forte alinhamento ético existencial com valores de comunidade e bondade..."
                              value={multidimSatisfaction.existencial.desfrute}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.existencial.desfrute = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-emerald-500/30 resize-none font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider block">🔴 Coisas Pendentes / Metas</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Dedicar-se de forma sistemática à meditação ativa e clareza de valores existenciais..."
                              value={multidimSatisfaction.existencial.pendente}
                              onChange={(e) => {
                                const copy = { ...multidimSatisfaction };
                                copy.existencial.pendente = e.target.value;
                                setMultidimSatisfaction(copy);
                              }}
                              className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-300 p-2 rounded-lg focus:outline-none focus:border-[#0000] resize-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}


              {/* --- ANALISE DOS TIPOS DE CRITICOS VIEW --- */}
              {tool.id === "analise_criticos" && (
                <div className="space-y-6 animate-fadeIn" id="critics-analysis-view">
                  
                  {/* Informational banner */}
                  <div className="bg-[#00A3FF]/15 border border-[#00A3FF]/30 p-4 rounded-xl text-xs space-y-1 block" id="critics-banner">
                    <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">🛡️ ANÁLISE DOS TIPOS DE CRÍTICOS & IMUNIDADE SOCIAL</strong>
                    <span className="text-gray-400">Uma ferramenta clínica de 4ª Geração para mapear a influência dos julgamentos alheios e desenvolver robustez emocional (<strong>imunidade social</strong>). Classifique os críticos que orbitam sua experiência nos 4 níveis intelectuais. Pratique a resposta saudável, rejeitando ruídos ofensivos ou absorvendo conselhos instruídos.</span>
                  </div>

                  {/* Visual PDF header facsimile mirroring credentials */}
                  <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="critics-header-facsimile">
                    <div>
                      <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Paciente</span>
                      <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Anônimo"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">Profissional Avaliador</span>
                      <input
                        type="text"
                        placeholder="Ex: Dr. Lincoln Poubel"
                        className="bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 px-2.5 py-1 text-gray-200 font-sans text-xs focus:outline-none w-full rounded"
                        defaultValue="Dr. Lincoln Poubel"
                      />
                    </div>
                    <div>
                      <span className="text-gray-600 block uppercase font-bold text-[9px] mb-1">CRP / Registro</span>
                      <input
                        type="text"
                        placeholder="Ex: CRP 04/99124-MG"
                        className="bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 px-2.5 py-1 text-gray-200 font-sans text-xs focus:outline-none w-full rounded"
                        defaultValue="CRP 04/99124-MG"
                      />
                    </div>
                  </div>

                  {/* The 4 Quadrants Definition Box (replicating PDF columns visually) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="quadrant-matrix">
                    <div className="bg-[#111217] border border-gray-900 hover:border-red-900/30 rounded-xl p-4 space-y-1 block transition-all" id="quadrant-ignorante">
                      <div className="flex items-center gap-1.5 text-red-500 font-bold uppercase text-[10px] tracking-wider font-mono">
                        <span>🔴</span> IGNORANTE
                      </div>
                      <p className="text-[11px] text-gray-200 font-sans font-semibold">Desconhece as informações.</p>
                      <p className="text-[10px] text-gray-500 font-mono leading-tight pt-1">Opina sem dados, estudos ou proximidade do assunto. Recomenda-se: Filtrar inteiramente.</p>
                      <span className="inline-block mt-3 font-mono text-[9px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded border border-red-900/40 font-bold">
                        {criticList.filter(c => c.type === 'ignorante').length} Mapeados
                      </span>
                    </div>

                    <div className="bg-[#111217] border border-gray-900 hover:border-amber-900/30 rounded-xl p-4 space-y-1 block transition-all" id="quadrant-repetidor">
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold uppercase text-[10px] tracking-wider font-mono">
                        <span>🟡</span> REPETIDOR
                      </div>
                      <p className="text-[11px] text-gray-200 font-sans font-semibold">Parafraseia o que ouviu.</p>
                      <p className="text-[10px] text-gray-500 font-mono leading-tight pt-1">Ecoa boatos, fofocas ou jargões sem raciocínio próprio. Recomenda-se: Audiência flexível superficial.</p>
                      <span className="inline-block mt-3 font-mono text-[9px] bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded border border-amber-900/40 font-bold">
                        {criticList.filter(c => c.type === 'repetidor').length} Mapeados
                      </span>
                    </div>

                    <div className="bg-[#111217] border border-gray-900 hover:border-cyan-900/30 rounded-xl p-4 space-y-1 block transition-all" id="quadrant-pesquisador">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[10px] tracking-wider font-mono">
                        <span>🔵</span> PESQUISADOR
                      </div>
                      <p className="text-[11px] text-gray-200 font-sans font-semibold">Mais instruído, acessa fontes.</p>
                      <p className="text-[10px] text-gray-500 font-mono leading-tight pt-1">Fundamenta-se em dados objetivos e métricas. Recomenda-se: Consideração ponderada.</p>
                      <span className="inline-block mt-3 font-mono text-[9px] bg-cyan-950/40 text-cyan-400 px-2 py-0.5 rounded border border-cyan-900/40 font-bold">
                        {criticList.filter(c => c.type === 'pesquisador').length} Mapeados
                      </span>
                    </div>

                    <div className="bg-[#111217] border border-gray-900 hover:border-emerald-950 rounded-xl p-4 space-y-1 block transition-all" id="quadrant-pensante">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px] tracking-wider font-mono">
                        <span>🟢</span> PENSANTE
                      </div>
                      <p className="text-[11px] text-gray-200 font-sans font-semibold">Reflete e delibera opinião.</p>
                      <p className="text-[10px] text-gray-500 font-mono leading-tight pt-1">Une dados amplos, reflexão racional autônoma e bom senso. Recomenda-se: Diálogo ativo profícuo.</p>
                      <span className="inline-block mt-3 font-mono text-[9px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40 font-bold">
                        {criticList.filter(c => c.type === 'pensante').length} Mapeados
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Metrics Panel */}
                  <div className="bg-[#111217] border border-gray-900 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center items-center" id="critics-metrics-deck">
                    <div className="p-2 space-y-1 block">
                      <span className="text-gray-500 font-mono text-[9px] uppercase block font-bold">Total Mapeado</span>
                      <strong className="text-xl font-bold font-sans text-gray-100 block">{criticList.length} críticos</strong>
                    </div>
                    <div className="p-2 space-y-1 block border-l border-gray-900/60">
                      <span className="text-gray-500 font-mono text-[9px] uppercase block font-bold">Autodefesa ao Ruído</span>
                      <strong className="text-xl font-bold font-sans text-red-400 block">
                        {currentScores.subscales["Capacidade de Filtragem de Ruído"]}%
                      </strong>
                    </div>
                    <div className="p-2 space-y-1 block border-l border-gray-900/60">
                      <span className="text-gray-500 font-mono text-[9px] uppercase block font-bold">Assimilação de Feedbacks</span>
                      <strong className="text-xl font-bold font-sans text-cyan-400 block">
                        {currentScores.subscales["Aproveitamento de Feedback Técnico"]}%
                      </strong>
                    </div>
                    <div className="p-2 space-y-1 block border-l border-gray-900/60 bg-[#00A3FF]/5 rounded-lg border border-[#00A3FF]/15">
                      <span className="text-[#00A3FF] font-mono text-[9px] font-bold uppercase block">Imunidade Social (IIS)</span>
                      <strong className="text-xl font-black font-sans text-white block">
                        {currentScores.totalScore}%
                      </strong>
                    </div>
                  </div>

                  {/* List of Mapped Critics (Table or Cards visualizer) */}
                  <div className="space-y-4" id="critics-active-list">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-gray-100 uppercase tracking-widest font-mono">👥 CRÍTICOS ATIVOS MAPEADOS EM CONSULTA</h4>
                      {!isAddingCritic && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewCriticName("");
                            setNewCriticRelation("");
                            setNewCriticType("ignorante");
                            setNewCriticFeedback("");
                            setNewCriticImpact(5);
                            setNewCriticFilter(5);
                            setNewCriticNotes("");
                            setIsAddingCritic(true);
                          }}
                          className="bg-[#00A3FF]/10 hover:bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/20 hover:border-[#00A3FF]/40 text-[10px] font-bold font-mono px-3 py-1.5 rounded transition-all flex items-center gap-1 shadow-lg"
                        >
                          <span>＋</span> NOVO CRÍTICO
                        </button>
                      )}
                    </div>

                    {/* Inline adding form */}
                    {isAddingCritic && (
                      <div className="bg-[#111217] border-2 border-[#00A3FF]/20 p-5 rounded-xl space-y-4 animate-fadeIn" id="new-critic-box-form">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <span className="text-xs font-bold font-mono text-[#00A3FF] uppercase tracking-wider">📐 Cadastrar Personagem do Convivio</span>
                          <button
                            type="button"
                            onClick={() => setIsAddingCritic(false)}
                            className="text-gray-500 hover:text-gray-400 text-xs font-mono"
                          >
                            Cancelar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                          <div className="space-y-1">
                            <label className="text-gray-500 block font-bold text-[9px] uppercase font-mono">Nome ou Pseudônimo</label>
                            <input
                              type="text"
                              value={newCriticName}
                              onChange={(e) => setNewCriticName(e.target.value)}
                              placeholder="Familiar X, Colega Y"
                              className="w-full bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 px-3 py-2 text-gray-200 outline-none rounded"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-gray-500 block font-bold text-[9px] uppercase font-mono">Vínculo / Organização</label>
                            <input
                              type="text"
                              value={newCriticRelation}
                              onChange={(e) => setNewCriticRelation(e.target.value)}
                              placeholder="Trabalho, Família, Amigo"
                              className="w-full bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 px-3 py-2 text-gray-200 outline-none rounded"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-gray-500 block font-bold text-[9px] uppercase font-mono">Tipo de Crítico (Quadrante)</label>
                            <select
                              value={newCriticType}
                              onChange={(e) => setNewCriticType(e.target.value as any)}
                              className="w-full bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 px-3 py-2 text-gray-200 outline-none rounded text-xs"
                            >
                              <option value="ignorante">🔴 Ignorante (Desconhece dados)</option>
                              <option value="repetidor">🟡 Repetidor (Repete boatos/jargões)</option>
                              <option value="pesquisador">🔵 Pesquisador (Consulta várias fontes)</option>
                              <option value="pensante">🟢 Pensante (Opinião autônoma e madura)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs font-sans">
                          <label className="text-gray-500 block font-bold text-[9px] uppercase font-mono">Como essa pessoa costuma criticar? / O que ela diz?</label>
                          <textarea
                            rows={2}
                            value={newCriticFeedback}
                            onChange={(e) => setNewCriticFeedback(e.target.value)}
                            placeholder="Fale brevemente sobre o teor ou frequência da crítica disfuncional que ela emite..."
                            className="w-full bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 p-2.5 text-gray-200 outline-none rounded resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 bg-gray-950 p-3 rounded-lg border border-gray-900 text-xs">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-400 font-sans">Nível de Impacto Inicial (Incômodo)</span>
                              <span className="text-red-400 font-bold font-mono">{newCriticImpact} / 10</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="1"
                              value={newCriticImpact}
                              onChange={(e) => setNewCriticImpact(parseInt(e.target.value))}
                              className="w-full accent-red-500 h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer mt-2"
                            />
                          </div>

                          <div className="space-y-1 bg-gray-950 p-3 rounded-lg border border-gray-900 text-xs">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-400 font-sans">Capacidade de Filtro Atual / Imunidade Adquirida</span>
                              <span className="text-emerald-400 font-bold font-mono">{newCriticFilter} / 10</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="1"
                              value={newCriticFilter}
                              onChange={(e) => setNewCriticFilter(parseInt(e.target.value))}
                              className="w-full accent-emerald-500 h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer mt-2"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-xs font-sans">
                          <label className="text-gray-500 block font-bold text-[9px] uppercase font-mono">Estratégia Cognitivo-Comportamental de Imunidade</label>
                          <textarea
                            rows={2}
                            value={newCriticNotes}
                            onChange={(e) => setNewCriticNotes(e.target.value)}
                            placeholder="Ex: Não debater jargões, aceitar o afeto e descartar o ruído intelectual vazio."
                            className="w-full bg-gray-950 border border-gray-900 focus:border-[#00A3FF]/50 p-2.5 text-gray-200 outline-none rounded resize-none"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingCritic(false)}
                            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 font-mono text-[10px] uppercase font-bold px-4 py-1.5 rounded transition"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCriticName.trim()) return;
                              const newCritic = {
                                id: "crit_" + Math.random().toString(36).substring(2, 9),
                                name: newCriticName,
                                relationship: newCriticRelation || "Social",
                                type: newCriticType,
                                characteristicFeedback: newCriticFeedback || "Sem feedbacks relatados.",
                                impactLevel: newCriticImpact,
                                filterCapability: newCriticFilter,
                                notesNotes: newCriticNotes || "Estudar reações saudáveis de imunidade."
                              };
                              setCriticList([...criticList, newCritic]);
                              setIsAddingCritic(false);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold px-5 py-1.5 rounded transition"
                          >
                            Salvar Crítico
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Active critics render block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {criticList.map((critic) => (
                        <div 
                          key={critic.id} 
                          className="bg-[#111217] border border-gray-900 hover:border-gray-800/80 p-5 rounded-xl space-y-4 relative flex flex-col justify-between"
                          id={`critic-card-${critic.id}`}
                        >
                          <div className="space-y-3">
                            {/* Card top banner with colored category details */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-bold font-sans text-sm text-gray-100">{critic.name}</h5>
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{critic.relationship}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                                  critic.type === 'ignorante' 
                                    ? 'bg-red-950/40 text-red-400 border border-red-900/40' 
                                    : critic.type === 'repetidor'
                                      ? 'bg-amber-950/40 text-amber-500 border border-amber-900/40'
                                      : critic.type === 'pesquisador'
                                        ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/40'
                                        : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                                }`}>
                                  {critic.type}
                                </span>
                              </div>
                            </div>

                            {/* Standard text inputs for criticisms */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block font-bold">🗣️ Comportamento ou Crítica Frequente</span>
                              <textarea
                                rows={2}
                                value={critic.characteristicFeedback}
                                onChange={(e) => {
                                  const copy = [...criticList];
                                  const match = copy.find(c => c.id === critic.id);
                                  if (match) {
                                    match.characteristicFeedback = e.target.value;
                                    setCriticList(copy);
                                  }
                                }}
                                className="w-full bg-gray-950 border border-gray-905 focus:border-[#00A3FF]/50 text-xs text-gray-300 p-2.5 rounded-lg focus:outline-none resize-none font-sans"
                              />
                            </div>

                            {/* Direct Sliders inside card */}
                            <div className="grid grid-cols-2 gap-4 text-[10px]">
                              <div className="bg-gray-950/60 p-2.5 rounded border border-gray-900 space-y-1 block">
                                <div className="flex justify-between text-[9px] font-mono">
                                  <span className="text-gray-500">Métrica de Incômodo</span>
                                  <strong className="text-red-450 font-bold">{critic.impactLevel} / 10</strong>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  step="1"
                                  value={critic.impactLevel}
                                  onChange={(e) => {
                                    const copy = [...criticList];
                                    const match = copy.find(c => c.id === critic.id);
                                    if (match) {
                                      match.impactLevel = parseInt(e.target.value);
                                      setCriticList(copy);
                                    }
                                  }}
                                  className="w-full accent-red-500 h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                                />
                              </div>

                              <div className="bg-gray-950/60 p-2.5 rounded border border-gray-900 space-y-1 block">
                                <div className="flex justify-between text-[9px] font-mono">
                                  <span className="text-gray-500">Imunidade</span>
                                  <strong className="text-emerald-400 font-bold">{critic.filterCapability} / 10</strong>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  step="1"
                                  value={critic.filterCapability}
                                  onChange={(e) => {
                                    const copy = [...criticList];
                                    const match = copy.find(c => c.id === critic.id);
                                    if (match) {
                                      match.filterCapability = parseInt(e.target.value);
                                      setCriticList(copy);
                                    }
                                  }}
                                  className="w-full accent-emerald-500 h-1 bg-gray-900 rounded appearance-none cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Strategy Strategy */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-wider block font-bold">🛡️ Conduta de Imunidade Coerciva / Terapia</span>
                              <textarea
                                rows={2}
                                value={critic.notesNotes}
                                onChange={(e) => {
                                  const copy = [...criticList];
                                  const match = copy.find(c => c.id === critic.id);
                                  if (match) {
                                    match.notesNotes = e.target.value;
                                    setCriticList(copy);
                                  }
                                }}
                                className="w-full bg-gray-950 border border-gray-905 focus:border-emerald-800/30 text-xs text-gray-300 p-2.5 rounded-lg focus:outline-none resize-none font-sans"
                              />
                            </div>
                          </div>

                          {/* Delete action button */}
                          <div className="flex justify-end pt-2 border-t border-gray-950">
                            <button
                              type="button"
                              onClick={() => {
                                  setCriticList(criticList.filter(c => c.id !== critic.id));
                              }}
                              className="text-[9px] font-mono text-red-500 hover:text-red-400 font-bold transition-all block"
                            >
                              ⚠️ Excluir Personagem
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}


              {/* --- EXAME DE FEEDBACKS VIEW --- */}
              {tool.id === "exame_feedbacks" && (
                <div className="space-y-6 text-[#E0E0E0]" id="exame-feedbacks-assessment-panel">
                  
                  {/* Decorative Clinician facsimile card matching PDF style */}
                  <div className="border border-gray-800 p-4 rounded-lg bg-gray-950/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 py-1 px-3 bg-[#00A3FF]/10 text-[#00A3FF] border-l border-b border-gray-800 text-[10px] font-mono uppercase tracking-wider font-bold">
                      Ferramenta Integradora nº 6
                    </div>
                    <div className="border-b border-gray-800 pb-3 mb-3 text-center">
                      <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-[#00A3FF]">Exame de Feedbacks</h2>
                      <p className="text-[11px] text-gray-400 mt-1">Marque as características abaixo segundo a frequência com que as exibe.</p>
                      <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-400 font-mono">
                        <span><b className="text-gray-300">N</b> = Nada</span>
                        <span>│</span>
                        <span><b className="text-[#00A3FF]">P</b> = Pouco</span>
                        <span>│</span>
                        <span><b className="text-purple-400">M</b> = Muito</span>
                        <span>│</span>
                        <span><b className="text-amber-400">S</b> = Sempre</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-gray-500 uppercase font-mono text-[10px] font-bold">Profissional Responsável:</span>
                        <div className="text-gray-300 font-medium py-0.5 border-b border-gray-900">Dr(a). Lincoln Poubel</div>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase font-mono text-[10px] font-bold">Paciente em Avaliação:</span>
                        <div className="text-gray-300 font-medium py-0.5 border-b border-gray-900">{patient.name || "Paciente Selecionado"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tabbed workflow controllers */}
                  <div className="flex border-b border-gray-900 gap-1 overflow-x-auto pb-1" id="feedbacks-tabs-container">
                    <button
                      type="button"
                      onClick={() => setFeedbackTab('self')}
                      className={`px-3 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all uppercase whitespace-nowrap ${
                        feedbackTab === 'self' 
                          ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      1. Autoavaliação (Eu)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackTab('observers')}
                      className={`px-3 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all uppercase whitespace-nowrap ${
                        feedbackTab === 'observers' 
                          ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      2. Observadores ({feedbackObservers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackTab('alignment')}
                      className={`px-3 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all uppercase whitespace-nowrap ${
                        feedbackTab === 'alignment' 
                          ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      3. Matriz de Alinhamento & Índices
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackTab('situations')}
                      className={`px-3 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all uppercase whitespace-nowrap ${
                        feedbackTab === 'situations' 
                          ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      4. Interações Diárias ({feedbackSituations.length})
                    </button>
                  </div>

                  {/* TAB 1: SELF ASSESSMENT */}
                  {feedbackTab === 'self' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-950/20 border border-gray-900 rounded font-mono text-[11px] text-gray-400">
                        Insira as características que melhor descrevem seu funcionamento interpessoal técnico ou doméstico. Use a barra segmented abaixo para classificar a frequência. Adicione outros rótulos customizados ao fim da lista, caso necessário.
                      </div>

                      {/* Attribute rating grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Autoritário", "Carinhoso", "Passivo", "Inseguro", "Arrogante", "Paciente",
                          "Calado", "Acomodated", "Acomodado", "Persistente", "Responsável", "Pacificador", "Queixoso",
                          "Controlador", "Ciumento", "Determinado", "Impulsivo", "Com iniciativa / proativo",
                          "Crítico", "Prestativo", "Produtivo", "Extrovertido", "Educado", "Compreensivo",
                          "Tranquilo", "Agressivo", "Indiferente", "Sedutor", "Exigente consigo",
                          "Exigente com os outros", "Autêntico / fala o que pensa", "Teimoso / insistente",
                          ...customFeedbackLabels
                        ].filter((val, idx, self) => self.indexOf(val) === idx && val !== "Acomodated").map((label) => (
                          <div key={label} className="bg-gray-950/20 border border-gray-900/50 p-2.5 rounded flex items-center justify-between text-xs hover:border-gray-800 transition-all">
                            <span className="font-medium text-gray-300 font-sans">{label}</span>
                            
                            {/* Segment selector */}
                            <div className="flex bg-gray-950 rounded border border-gray-900 p-0.5">
                              {(['N', 'P', 'M', 'S'] as const).map((lvl) => {
                                const isSelected = feedbackSelfRatings[label] === lvl;
                                return (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => {
                                      setFeedbackSelfRatings(prev => ({ ...prev, [label]: lvl }));
                                    }}
                                    className={`w-7 h-6 rounded font-mono text-[10px] font-bold transition-all ${
                                      isSelected
                                        ? lvl === 'N' ? 'bg-gray-800 text-gray-200'
                                          : lvl === 'P' ? 'bg-[#00A3FF] text-black'
                                          : lvl === 'M' ? 'bg-purple-600 text-white'
                                          : 'bg-amber-500 text-black'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                  >
                                    {lvl}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add custom attributes (the 'Outro:' elements of the PDF) */}
                      <div className="p-3 border border-dashed border-gray-800 rounded bg-gray-950/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-gray-400">
                          <b className="text-[#00A3FF] uppercase font-mono text-[10px] block">Rótulos Customizados (Outro)</b>
                          Adicione atributos comportamentais adicionais de interesse terapêutico.
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                          <input
                            type="text"
                            placeholder="Ex: Centralizador"
                            value={newCustomLabel}
                            onChange={(e) => setNewCustomLabel(e.target.value)}
                            className="bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2.5 py-1.5 rounded outline-none focus:border-[#00A3FF]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cleaned = newCustomLabel.trim();
                              if (cleaned && !customFeedbackLabels.includes(cleaned)) {
                                setCustomFeedbackLabels(prev => [...prev, cleaned]);
                                setFeedbackSelfRatings(prev => ({ ...prev, [cleaned]: "P" }));
                                setNewCustomLabel("");
                              }
                            }}
                            className="bg-[#00A3FF] hover:bg-[#007FCC] text-black text-xs font-bold px-3 py-1.5 rounded font-mono uppercase tracking-wider flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Incluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: OBSERVERS */}
                  {feedbackTab === 'observers' && (
                    <div className="space-y-6">
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          <span className="text-[#00A3FF] font-mono uppercase text-[10px] font-bold block">Feedback de Confidentes</span>
                          Entregue o diagnóstico a cônjuges, parceiros ou pais para obter estimativas fidedignas.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingObserver(true);
                            setNewObserverName("");
                            setNewObserverRelation("");
                          }}
                          className="bg-gray-950 border border-gray-800 hover:bg-gray-900 text-xs font-bold font-mono tracking-wider text-gray-300 px-3 py-2 rounded uppercase flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-[#00A3FF]" /> Novo Observador
                        </button>
                      </div>

                      {/* Observer Add modal/form inside inline panel */}
                      {isAddingObserver && (
                        <div className="p-4 rounded border border-gray-800 bg-gray-950/60 space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#00A3FF]">Adicionar Novo Observador</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Identificação / Nome:</label>
                              <input
                                type="text"
                                placeholder="Ex: Roberto (Gerente)"
                                value={newObserverName}
                                onChange={(e) => setNewObserverName(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2.5 py-1.5 rounded outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Vínculo Médico / Parceria:</label>
                              <input
                                type="text"
                                placeholder="Ex: Relação Profissional"
                                value={newObserverRelation}
                                onChange={(e) => setNewObserverRelation(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2.5 py-1.5 rounded outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingObserver(false);
                              }}
                              className="text-gray-500 px-3 py-1.5 font-bold uppercase font-mono"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nameCleaned = newObserverName.trim();
                                const relationCleaned = newObserverRelation.trim();
                                if (nameCleaned && relationCleaned) {
                                  // Initialize with default ratings
                                  const ratingsInit: Record<string, 'N' | 'P' | 'M' | 'S'> = {};
                                  const labels = [
                                    "Autoritário", "Carinhoso", "Passivo", "Inseguro", "Arrogante", "Paciente",
                                    "Calado", "Acomodado", "Persistente", "Responsável", "Pacificador", "Queixoso",
                                    "Controlador", "Ciumento", "Determinado", "Impulsivo", "Com iniciativa / proativo",
                                    "Crítico", "Prestativo", "Produtivo", "Extrovertido", "Educado", "Compreensivo",
                                    "Tranquilo", "Agressivo", "Indiferente", "Sedutor", "Exigente consigo",
                                    "Exigente com os outros", "Autêntico / fala o que pensa", "Teimoso / insistent", "Teimoso / insistente",
                                    ...customFeedbackLabels
                                  ];
                                  labels.forEach(l => {
                                    ratingsInit[l] = "P"; // default minimal representation
                                  });

                                  setFeedbackObservers(prev => [
                                    ...prev,
                                    {
                                      id: "obs_" + Date.now(),
                                      name: nameCleaned,
                                      relationship: relationCleaned,
                                      ratings: ratingsInit
                                    }
                                  ]);
                                  setIsAddingObserver(false);
                                }
                              }}
                              className="bg-[#00A3FF] hover:bg-[#007FCC] text-black px-4 py-1.5 rounded font-mono font-bold uppercase tracking-wider"
                            >
                              Salvar Observador
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display existing observers cards */}
                      <div className="space-y-4">
                        {feedbackObservers.map((obs) => (
                          <div key={obs.id} className="border border-gray-900 bg-gray-950/20 p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                              <div>
                                <h4 className="text-xs font-bold text-[#00A3FF]">{obs.name}</h4>
                                <span className="text-[10px] uppercase font-mono text-gray-500 font-bold">{obs.relationship}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFeedbackObservers(feedbackObservers.filter(o => o.id !== obs.id));
                                }}
                                className="text-[10px] font-mono text-red-500 hover:text-red-400 font-bold flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remover
                              </button>
                            </div>

                            {/* Observers compact matrix control */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {[
                                "Autoritário", "Carinhoso", "Passivo", "Inseguro", "Arrogante", "Paciente",
                                "Calado", "Acomodado", "Persistente", "Responsável", "Pacificador", "Queixoso",
                                "Controlador", "Ciumento", "Determinado", "Impulsivo", "Com iniciativa / proativo",
                                "Crítico", "Prestativo", "Produtivo", "Extrovertido", "Educado", "Compreensivo",
                                "Tranquilo", "Agressivo", "Indiferente", "Sedutor", "Exigente consigo",
                                "Exigente com os outros", "Autêntico / fala o que pensa", "Teimoso / insistente",
                                ...customFeedbackLabels
                              ].filter((val, idx, self) => self.indexOf(val) === idx).map(label => {
                                const value = obs.ratings[label] || 'N';
                                return (
                                  <div key={label} className="flex items-center justify-between p-2 rounded bg-gray-950/30 border border-gray-900/40 text-[11px]">
                                    <span className="font-medium text-gray-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">{label}</span>
                                    
                                    <div className="flex bg-gray-950/50 rounded border border-gray-900 p-0.5">
                                      {(['N', 'P', 'M', 'S'] as const).map(lvl => (
                                        <button
                                          key={lvl}
                                          type="button"
                                          onClick={() => {
                                            const updatedObservers = feedbackObservers.map(o => {
                                              if (o.id === obs.id) {
                                                return {
                                                  ...o,
                                                  ratings: { ...o.ratings, [label]: lvl }
                                                };
                                              }
                                              return o;
                                            });
                                            setFeedbackObservers(updatedObservers);
                                          }}
                                          className={`w-5 h-5 rounded font-mono text-[9px] font-bold ${
                                            value === lvl
                                              ? lvl === 'N' ? 'bg-gray-800 text-gray-200'
                                                : lvl === 'P' ? 'bg-[#00A3FF] text-black'
                                                : lvl === 'M' ? 'bg-purple-600 text-white'
                                                : 'bg-amber-500 text-black'
                                              : 'text-gray-600 hover:text-gray-400'
                                          }`}
                                        >
                                          {lvl}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* TAB 3: COMPARATIVE MATRIX & CLINICAL INDEXES */}
                  {feedbackTab === 'alignment' && (
                    <div className="space-y-6">
                      
                      {/* Interactive Metrics Dashboard */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-gray-950/20 border border-gray-900 text-center flex flex-col justify-between h-28">
                          <h5 className="text-[10px] uppercase font-mono text-gray-400 font-bold">Consonância (IAP)</h5>
                          <span className="text-3xl font-bold text-[#00A3FF]">{currentScores.subscales?.["Índice de Alinhamento Perceptivo (IAP)"]}%</span>
                          <span className="text-[9px] text-gray-500">Alinhamento Eu vs. Outros</span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-950/20 border border-gray-900 text-center flex flex-col justify-between h-28">
                          <h5 className="text-[10px] uppercase font-mono text-gray-400 font-bold">Virtudes de Convivência</h5>
                          <span className="text-3xl font-bold text-emerald-400">{currentScores.subscales?.["Índice de Virtudes de Convivência (IVC)"]}%</span>
                          <span className="text-[9px] text-gray-500">Média de Rótulos Construtivos</span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-950/20 border border-gray-900 text-center flex flex-col justify-between h-28">
                          <h5 className="text-[10px] uppercase font-mono text-gray-400 font-bold">Sobrecarga Conduta (ISC)</h5>
                          <span className="text-3xl font-bold text-amber-500">{currentScores.subscales?.["Índice de Sobrecarga Comportamental (ISC)"]}%</span>
                          <span className="text-[9px] text-gray-500">Intensidade de Vulnerabilidades</span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-950/20 border border-gray-900 text-center flex flex-col justify-between h-28">
                          <h5 className="text-[10px] uppercase font-mono text-gray-400 font-bold">Divergências / Pontos Cegos</h5>
                          <span className={`text-3xl font-bold ${Number(currentScores.subscales?.["Pontos Cegos Identificados"]) > 0 ? 'text-red-400' : 'text-gray-400'}`}>{currentScores.subscales?.["Pontos Cegos Identificados"]}</span>
                          <span className="text-[9px] text-gray-500">Rótulos com Desvios Elevados</span>
                        </div>
                      </div>

                      {/* Side by side alignment comparison matrix */}
                      <div className="border border-gray-900 rounded-lg overflow-hidden bg-gray-950/20">
                        <div className="p-3 border-b border-gray-900 bg-gray-950/50 flex justify-between items-center">
                          <span className="text-xs uppercase font-mono font-bold tracking-wider text-gray-300">Análise Cruzada de Rótulos Comportamentais</span>
                          <span className="text-[10px] font-mono text-[#00A3FF]">Compara classificação com o consenso dos confidentes</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-gray-900 bg-gray-950/40 text-gray-500 font-mono text-[10px] font-bold uppercase">
                                <th className="p-3">Rótulo Comportamental</th>
                                <th className="p-3 text-center">Autoavaliação (Eu)</th>
                                {feedbackObservers.map(obs => (
                                  <th key={obs.id} className="p-3 text-center whitespace-nowrap">{obs.name}</th>
                                ))}
                                <th className="p-3 text-center">Média Observadores</th>
                                <th className="p-3 text-right">Diagnóstico de Alinhamento</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                "Autoritário", "Carinhoso", "Passivo", "Inseguro", "Arrogante", "Paciente",
                                "Calado", "Acomodado", "Persistente", "Responsável", "Pacificador", "Queixoso",
                                "Controlador", "Ciumento", "Determinado", "Impulsivo", "Com iniciativa / proativo",
                                "Crítico", "Prestativo", "Produtivo", "Extrovertido", "Educado", "Compreensivo",
                                "Tranquilo", "Agressivo", "Indiferente", "Sedutor", "Exigente consigo",
                                "Exigente com os outros", "Autêntico / fala o que pensa", "Teimoso / insistente",
                                ...customFeedbackLabels
                              ].filter((val, idx, self) => self.indexOf(val) === idx).map(label => {
                                const rateToValue = (r: 'N' | 'P' | 'M' | 'S' | undefined): number => {
                                  if (!r) return 0;
                                  if (r === 'N') return 0;
                                  if (r === 'P') return 1;
                                  if (r === 'M') return 2;
                                  if (r === 'S') return 3;
                                  return 0;
                                };

                                const valueToLabel = (v: number): string => {
                                  if (v < 0.5) return 'N';
                                  if (v < 1.5) return 'P';
                                  if (v < 2.5) return 'M';
                                  return 'S';
                                };

                                const selfVal = rateToValue(feedbackSelfRatings[label]);
                                const obsValues = feedbackObservers.map(obs => rateToValue(obs.ratings[label]));
                                const avgObsVal = obsValues.length > 0 
                                  ? (obsValues.reduce((a, b) => a + b, 0) / obsValues.length)
                                  : selfVal;

                                const diff = Math.abs(selfVal - avgObsVal);

                                // Alignment diagnosis
                                let diffLabel = "Consonância Excelente";
                                let colorClass = "text-emerald-400";
                                
                                if (diff >= 1.5) {
                                  if (avgObsVal > selfVal) {
                                    diffLabel = "⚠️ Ponto Cego (Vulnerabilidade Oculta)";
                                    colorClass = "text-red-400 font-bold";
                                  } else {
                                    diffLabel = "🔎 Subestimado pelo Paciente";
                                    colorClass = "text-indigo-400";
                                  }
                                } else if (diff >= 0.75) {
                                  diffLabel = "Consonância Moderada";
                                  colorClass = "text-gray-400";
                                }

                                return (
                                  <tr key={label} className="border-b border-gray-900/50 hover:bg-gray-950/15">
                                    <td className="p-3 font-medium text-gray-200">{label}</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                        feedbackSelfRatings[label] === 'S' ? 'bg-amber-500 text-black' :
                                        feedbackSelfRatings[label] === 'M' ? 'bg-purple-600 text-white' :
                                        feedbackSelfRatings[label] === 'P' ? 'bg-[#00A3FF] text-black' : 'bg-gray-800 text-gray-200'
                                      }`}>{feedbackSelfRatings[label] || 'N'}</span>
                                    </td>
                                    {feedbackObservers.map(obs => {
                                      const rating = obs.ratings[label] || 'N';
                                      return (
                                        <td key={obs.id} className="p-3 text-center">
                                          <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                                            rating === 'S' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/35' :
                                            rating === 'M' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/35' :
                                            rating === 'P' ? 'bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/35' : 'bg-gray-850 text-gray-500'
                                          }`}>{rating}</span>
                                        </td>
                                      );
                                    })}
                                    <td className="p-3 text-center text-gray-400 font-mono font-bold">
                                      {avgObsVal.toFixed(1)} <span className="text-[9px] text-gray-600">({valueToLabel(avgObsVal)})</span>
                                    </td>
                                    <td className={`p-3 text-right font-mono text-[10px] ${colorClass}`}>{diffLabel}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 4: CLINICAL REGISTRY OF SITUATIONS */}
                  {feedbackTab === 'situations' && (
                    <div className="space-y-6">
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          <span className="text-[#00A3FF] font-mono uppercase text-[10px] font-bold block">Histórico de Interações Interpessoais</span>
                          Registre condutas clínicas, incidentes problemáticos ou conflitos reais estimulados por esses traços de caráter.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingSituation(true);
                            setNewSituationBehavior("Autoritário");
                            setNewSituationDescription("");
                            setNewSituationContext("");
                          }}
                          className="bg-gray-950 border border-gray-800 hover:bg-gray-900 text-xs font-bold font-mono tracking-wider text-gray-300 px-3 py-2 rounded uppercase flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-[#00A3FF]" /> Registrar Situação
                        </button>
                      </div>

                      {/* Register Situation Card Form */}
                      {isAddingSituation && (
                        <div className="p-4 rounded border border-gray-800 bg-gray-950/60 space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#00A3FF]">Registrar Nova Situação Clínica</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Característica Relacionada:</label>
                              <select
                                value={newSituationBehavior}
                                onChange={(e) => setNewSituationBehavior(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2 py-1.5 rounded outline-none"
                              >
                                {[
                                  "Autoritário", "Carinhoso", "Passivo", "Inseguro", "Arrogante", "Paciente",
                                  "Calado", "Acomodado", "Persistente", "Responsável", "Pacificador", "Queixoso",
                                  "Controlador", "Ciumento", "Determinado", "Impulsivo", "Com iniciativa / proativo",
                                  "Crítico", "Prestativo", "Produtivo", "Extrovertido", "Educado", "Compreensivo",
                                  "Tranquilo", "Agressivo", "Indiferente", "Sedutor", "Exigente consigo",
                                  "Exigente com os outros", "Autêntico / fala o que pensa", "Teimoso / insistente",
                                  ...customFeedbackLabels
                                ].filter((val, idx, self) => self.indexOf(val) === idx).map(label => (
                                  <option key={label} value={label}>{label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Situação Concreta Ocorrida:</label>
                              <input
                                type="text"
                                placeholder="Descreva brevemente o evento ou conduta"
                                value={newSituationDescription}
                                onChange={(e) => setNewSituationDescription(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2.5 py-1.5 rounded outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Reflexão / Conduta Alternativa Construtiva:</label>
                            <textarea
                              placeholder="Análise funcional do estressor e conduta alternativa saudável..."
                              value={newSituationContext}
                              onChange={(e) => setNewSituationContext(e.target.value)}
                              rows={2}
                              className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2.5 py-1.5 rounded outline-none resize-none"
                            />
                          </div>
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingSituation(false);
                              }}
                              className="text-gray-500 px-3 py-1.5 font-bold uppercase font-mono"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const descCleaned = newSituationDescription.trim();
                                const ctxCleaned = newSituationContext.trim();
                                if (descCleaned && ctxCleaned) {
                                  setFeedbackSituations(prev => [
                                    ...prev,
                                    {
                                      id: "s_" + Date.now(),
                                      behavior: newSituationBehavior,
                                      situation: descCleaned,
                                      context: ctxCleaned
                                    }
                                  ]);
                                  setIsAddingSituation(false);
                                }
                              }}
                              className="bg-[#00A3FF] hover:bg-[#007FCC] text-black px-4 py-1.5 rounded font-mono font-bold uppercase tracking-wider"
                            >
                              Gravar Situação
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display registered behavior logs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feedbackSituations.map((sit) => (
                          <div key={sit.id} className="border border-gray-900 bg-gray-950/20 p-4 rounded-lg flex flex-col justify-between hover:border-gray-800 transition-colors">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 bg-gray-900 border border-gray-800 text-gray-300 rounded font-mono text-[10px] font-bold tracking-wider uppercase">
                                  {sit.behavior}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFeedbackSituations(feedbackSituations.filter(s => s.id !== sit.id));
                                  }}
                                  className="text-[9px] font-mono text-red-500 hover:text-red-400 font-bold"
                                >
                                  Excluir
                                </button>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Situação Concreta:</span>
                                <p className="text-xs text-gray-300 font-sans leading-relaxed">{sit.situation}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Análise & Alternativa Saudável:</span>
                                <p className="text-xs text-gray-400 bg-gray-950/40 p-2 border border-gray-900 rounded font-sans leading-relaxed">{sit.context}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>
              )}


              {/* --- MAPEAMENTO DE ESTRESSORES VIEW --- */}
              {tool.id === "mapeamento_estressores" && (
                <div className="space-y-6 text-[#E0E0E0]" id="mapeamento-estressores-assessment-panel">

                  {/* Aesthetic Clinician Header Card resembling the PDF layout */}
                  <div className="border border-gray-800 p-4 rounded-lg bg-gray-950/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 py-1 px-3 bg-[#00A3FF]/10 text-[#00A3FF] border-l border-b border-gray-800 text-[10px] font-mono uppercase tracking-wider font-bold">
                      Ferramenta Integradora nº 7
                    </div>
                    <div className="border-b border-gray-800 pb-3 mb-3 text-center">
                      <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-[#00A3FF]">Mapeamento de Estressores</h2>
                      <p className="text-[11px] text-gray-400 mt-1">Estratégia de Alívio, Discriminação de Controle e Fortalecimento de Resolutividade Ativa</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-gray-500 uppercase font-mono text-[10px] font-bold">Responsável Clínico:</span>
                        <div className="text-gray-300 font-medium py-0.5 border-b border-gray-900">Dr(a). Lincoln Poubel & Pedro Rodrigues</div>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase font-mono text-[10px] font-bold">Paciente em Avaliação:</span>
                        <div className="text-gray-300 font-medium py-0.5 border-b border-gray-900">{patient.name || "Paciente Selecionado"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Flow controls */}
                  <div className="flex border-b border-gray-900 gap-1 overflow-x-auto pb-1" id="stressors-tabs-container">
                    <button
                      type="button"
                      onClick={() => setStressorsTab('brainstorm')}
                      className={`px-3 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all uppercase whitespace-nowrap ${
                        stressorsTab === 'brainstorm' 
                          ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      1. Descarga Mental & Órbita ({stressorsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStressorsTab('separation')}
                      className={`px-3 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all uppercase whitespace-nowrap ${
                        stressorsTab === 'separation' 
                          ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      2. Controle de Estressores
                    </button>
                    <button
                      type="button"
                      onClick={() => setStressorsTab('hierarchy')}
                      className={`px-3 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all uppercase whitespace-nowrap ${
                        stressorsTab === 'hierarchy' 
                          ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      3. Hierarquia de Resolução ({stressorHierarchy.length})
                    </button>
                  </div>

                  {/* TAB 1: BRAINSTORMING & FLOATING ORBIT VISUALIZATION */}
                  {stressorsTab === 'brainstorm' && (
                    <div className="space-y-6">
                      <div className="p-3 bg-gray-950/20 border border-gray-900 rounded font-mono text-[11px] text-gray-400 flex gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Descarga Mental:</strong> Insira livremente todas as suas pendências, preocupações imediatas ou históricas, grandes ou pequenas, que ocupam espaço na sua mente. Veja-as visualmente orbitando ao seu redor.
                        </div>
                      </div>

                      {/* Insertion row */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const textClean = newStressorText.trim();
                          if (textClean) {
                            // Assign unique visual attributes for the interactive constellation
                            const genAngle = Math.floor(Math.random() * 360);
                            const genDistance = 100 + Math.floor(Math.random() * 70); // 100px - 170px radius
                            const newStressor = {
                              id: "st_" + Date.now(),
                              text: textClean,
                              type: newStressorType,
                              severity: newStressorSeverity,
                              visualAngle: genAngle,
                              visualDistance: genDistance
                            };
                            setStressorsList(prev => [...prev, newStressor]);
                            setNewStressorText("");
                          }
                        }}
                        className="p-4 border border-gray-900 rounded bg-gray-950/40 space-y-4"
                      >
                        <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#00A3FF]">Drenar Nova Preocupação à Mente</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Qual pendência / preocupação está pesando?</label>
                            <input
                              type="text"
                              value={newStressorText}
                              onChange={(e) => setNewStressorText(e.target.value)}
                              placeholder="Ex: Pagar fatura do cartão ou Discussão pendente com sócio"
                              className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2.5 py-2.5 rounded outline-none focus:border-[#00A3FF]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Severidade subjetiva (1-5):</label>
                            <select
                              value={newStressorSeverity}
                              onChange={(e) => setNewStressorSeverity(Number(e.target.value))}
                              className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2.5 py-2.5 rounded outline-none"
                            >
                              <option value={1}>1 - Muito leve / Incômodo periférico</option>
                              <option value={2}>2 - Leve / Preocupação ocasional</option>
                              <option value={3}>3 - Moderada / Ruminada com frequência</option>
                              <option value={4}>4 - Elevada / Tensão somática relevante</option>
                              <option value={5}>5 - Extrema / Fonte de sofrimento/paralisia</option>
                            </select>
                          </div>

                          <div>
                            <button
                              type="submit"
                              className="w-full bg-[#00A3FF] hover:bg-[#007FCC] text-black text-xs font-bold py-2.5 rounded font-mono uppercase tracking-wider flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" /> Descarregar
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* SPECTACULAR CONSTELLATION ORBIT STAGED DESIGN */}
                      <div className="border border-gray-900 rounded-lg p-3 bg-gray-950/20">
                        <div className="text-center py-2 border-b border-gray-900/60 mb-4 flex justify-between items-center px-4">
                          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">Visualização Espacial de Sobrecarga Mental (Órbita)</span>
                          <span className="text-[9px] font-mono text-[#00A3FF]">O tamanho do estressor reflete seu grau de severidade</span>
                        </div>

                        {/* Relative canvas positioning */}
                        <div className="relative w-full h-[450px] bg-gray-950 rounded flex items-center justify-center overflow-hidden border border-gray-900/40">
                          
                          {/* Radial Background Orbit Circles */}
                          <div className="absolute w-[200px] h-[200px] rounded-full border border-gray-900/30 border-dashed animate-[spin_40s_linear_infinite]" />
                          <div className="absolute w-[300px] h-[300px] rounded-full border border-gray-900/20 border-dashed" />
                          <div className="absolute w-[400px] h-[400px] rounded-full border border-gray-900/10 border-dashed" />

                          {/* Central centerpiece: "O Self do Paciente" */}
                          <div className="absolute z-10 bg-gray-900 border-2 border-[#00A3FF] p-4 rounded-full flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(0,163,255,0.15)] select-none">
                            <div className="w-10 h-10 rounded-full bg-[#00A3FF]/10 flex items-center justify-center text-[#00A3FF] border border-[#00A3FF]/20">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] text-[#00A3FF] font-mono font-bold uppercase tracking-widest mt-1">Foco</span>
                          </div>

                          {/* Floating stressors positioning inside container */}
                          {stressorsList.map((stress) => {
                            // Calculate trigonometric cartesian offsets from the center of the orbit
                            const posX = Math.cos((stress.visualAngle * Math.PI) / 180) * stress.visualDistance;
                            const posY = Math.sin((stress.visualAngle * Math.PI) / 180) * stress.visualDistance;

                            // Color severity mapping
                            const severityStyles = 
                              stress.severity === 5 ? 'border-red-500/50 bg-red-950/40 text-red-300' :
                              stress.severity === 4 ? 'border-orange-500/50 bg-orange-950/40 text-orange-300' :
                              stress.severity === 3 ? 'border-amber-500/40 bg-amber-950/30 text-amber-200' :
                              'border-blue-500/40 bg-blue-950/20 text-blue-200';

                            return (
                              <div
                                key={stress.id}
                                style={{
                                  transform: `translate(${posX}px, ${posY}px)`
                                }}
                                className={`absolute z-20 px-3 py-1.5 rounded-full border text-[10px] font-sans shadow-lg flex items-center gap-1.5 group hover:scale-105 hover:z-30 transition-all ${severityStyles}`}
                              >
                                {/* Dot indicator */}
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  stress.severity === 5 ? 'bg-red-500' :
                                  stress.severity === 4 ? 'bg-orange-400' :
                                  stress.severity === 3 ? 'bg-amber-400' : 'bg-blue-400'
                                }`} />
                                
                                <span className="font-semibold max-w-[130px] text-ellipsis overflow-hidden whitespace-nowrap block" title={stress.text}>
                                  {stress.text}
                                </span>
                                
                                <span className="font-mono text-[9px] opacity-65 font-bold">({stress.severity})</span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setStressorsList(stressorsList.filter(s => s.id !== stress.id));
                                    setStressorHierarchy(stressorHierarchy.filter(id => id !== stress.id));
                                  }}
                                  className="text-[9px] font-mono text-red-500 hover:text-red-400 hover:scale-110 ml-0.5 transition-all opacity-0 group-hover:opacity-100 font-bold block"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fallback clean textual list */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono uppercase text-gray-500 font-bold">Lista Detalhada de Preocupações ({stressorsList.length})</h4>
                        <div className="space-y-1.5">
                          {stressorsList.map((stress) => (
                            <div key={stress.id} className="p-2.5 rounded bg-gray-950/20 border border-gray-900/60 flex items-center justify-between text-xs hover:border-gray-800 transition-all">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                  stress.severity === 5 ? 'bg-red-950 text-red-400 border border-red-900' :
                                  stress.severity === 4 ? 'bg-orange-950 text-orange-400 border border-orange-900' :
                                  stress.severity === 3 ? 'bg-amber-950 text-amber-400 border border-amber-900' : 'bg-blue-950 text-blue-400 border border-blue-900'
                                }`}>Sev: {stress.severity}</span>
                                <span className="text-gray-200">{stress.text}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setStressorsList(stressorsList.filter(s => s.id !== stress.id));
                                  setStressorHierarchy(stressorHierarchy.filter(id => id !== stress.id));
                                }}
                                className="text-[10px] font-mono text-red-500 hover:text-red-400 font-bold flex items-center gap-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: SEPARATION (CONTROL DISCRIMINATION) */}
                  {stressorsTab === 'separation' && (
                    <div className="space-y-4">
                      
                      <div className="p-3 bg-gray-950/20 border border-gray-900 rounded font-mono text-[11px] text-gray-400 flex gap-2">
                        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Discriminação de Controle:</strong> Classifique cada estressor para romper a sensação de desesperança e desamparo.
                          <div className="mt-1 flex flex-col gap-1 text-[10px] text-gray-400">
                            <span>● <strong className="text-[#00A3FF]">Controláveis:</strong> Coisas de menor ou maior profundidade sobre as quais você pode agir, agendar, delegar ou solucionar diretamente.</span>
                            <span>● <strong className="text-purple-400">Incontroláveis:</strong> Fatores macro, escolhas de outras pessoas ou eventos consumados que fogem do seu poder direto de ação imediata.</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* CONTROLÁVEIS COLUMN */}
                        <div className="border border-gray-900 rounded-lg p-3 bg-gray-950/15 space-y-3">
                          <h4 className="text-xs font-bold font-mono tracking-wider text-[#00A3FF] border-b border-gray-900 pb-2 uppercase flex items-center gap-1">
                            <CheckSquare className="w-4 h-4 text-[#00A3FF]" /> Controláveis ({stressorsList.filter(s => s.type === 'controllable').length})
                          </h4>
                          <div className="space-y-2 min-h-[150px]">
                            {stressorsList.filter(s => s.type === 'controllable').map(st => (
                              <div key={st.id} className="p-2.5 rounded bg-gray-950 border border-gray-900 flex flex-col gap-2 relative group">
                                <span className="text-xs text-gray-200 pr-8">{st.text}</span>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-gray-400 font-mono">Prioridade: {st.severity} ★</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = stressorsList.map(item => {
                                        if (item.id === st.id) return { ...item, type: 'uncontrollable' as const };
                                        return item;
                                      });
                                      setStressorsList(updated);
                                      // Remove from hierarchy if switched to uncontrollable
                                      setStressorHierarchy(stressorHierarchy.filter(id => id !== st.id));
                                    }}
                                    className="text-[9px] font-mono text-[#00A3FF] hover:text-white bg-gray-950 border border-gray-800 px-2 py-0.5 rounded transition-all"
                                  >
                                    Tornar Incontrolável →
                                  </button>
                                </div>
                              </div>
                            ))}
                            {stressorsList.filter(s => s.type === 'controllable').length === 0 && (
                              <div className="text-center py-8 text-xs text-gray-500 font-mono">Nenhum estressor classificado como controlável ainda.</div>
                            )}
                          </div>
                        </div>

                        {/* INCONTROLÁVEIS COLUMN */}
                        <div className="border border-gray-900 rounded-lg p-3 bg-gray-950/15 space-y-3">
                          <h4 className="text-xs font-bold font-mono tracking-wider text-purple-400 border-b border-gray-900 pb-2 uppercase flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-purple-400" /> Incontroláveis ({stressorsList.filter(s => s.type === 'uncontrollable').length})
                          </h4>
                          <div className="space-y-2 min-h-[150px]">
                            {stressorsList.filter(s => s.type === 'uncontrollable').map(st => (
                              <div key={st.id} className="p-2.5 rounded bg-gray-950 border border-gray-900 flex flex-col gap-2 relative group">
                                <span className="text-xs text-gray-200 pr-8">{st.text}</span>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-gray-400 font-mono">Prioridade: {st.severity} ★</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = stressorsList.map(item => {
                                        if (item.id === st.id) return { ...item, type: 'controllable' as const };
                                        return item;
                                      });
                                      setStressorsList(updated);
                                    }}
                                    className="text-[9px] font-mono text-purple-400 hover:text-white bg-gray-950 border border-gray-800 px-2 py-0.5 rounded transition-all"
                                  >
                                    ← Tornar Controlável
                                  </button>
                                </div>
                              </div>
                            ))}
                            {stressorsList.filter(s => s.type === 'uncontrollable').length === 0 && (
                              <div className="text-center py-8 text-xs text-gray-500 font-mono">Nenhum estressor classificado como incontrolável ainda.</div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* TAB 3: RESOLUTION HIERARCHY (ACTION PLAN MODEL) */}
                  {stressorsTab === 'hierarchy' && (
                    <div className="space-y-6">
                      
                      <div className="p-3 bg-gray-950/20 border border-gray-900 rounded font-mono text-[11px] text-gray-400 flex gap-2">
                        <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Hierarquia de Resolução:</strong> Ordene as pendências que estão sob seu controle (1 a 10) e trace estratégias concretas imediatas de enfrentamento. Isso desarticula o ciclo de ansiedade reativa e fomenta a proatividade.
                        </div>
                      </div>

                      {/* Display slots 1 to 10 as structured on the PDF */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono uppercase text-gray-500 font-body block">Configurador da Hierarquia de Resolução</h4>
                        
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((slotIndex) => {
                          const associatedId = stressorHierarchy[slotIndex - 1];
                          const associatedStressor = stressorsList.find(s => s.id === associatedId && s.type === "controllable");

                          return (
                            <div key={slotIndex} className="p-3 rounded-lg border border-gray-900 bg-gray-950/20 flex flex-col md:flex-row gap-3 items-center justify-between hover:border-gray-800 transition-all">
                              <div className="flex gap-3 items-center w-full md:w-auto">
                                <span className="w-6 h-6 rounded bg-gray-900 text-gray-300 border border-gray-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                  {slotIndex}
                                </span>
                                
                                <div className="w-full sm:w-[280px]">
                                  <select
                                    value={associatedId || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedHierarchy = [...stressorHierarchy];
                                      if (val) {
                                        updatedHierarchy[slotIndex - 1] = val;
                                      } else {
                                        // Clear slot or compact
                                        updatedHierarchy.splice(slotIndex - 1, 1);
                                      }
                                      // Remove potential duplicates in other slots
                                      const filtered = updatedHierarchy.filter((id, i) => id && updatedHierarchy.indexOf(id) === i || i === slotIndex - 1);
                                      setStressorHierarchy(filtered.filter(Boolean));
                                    }}
                                    className="w-full bg-gray-950 border border-gray-900 text-gray-200 text-xs px-2 py-1.5 rounded outline-none"
                                  >
                                    <option value="">-- Vincular Estressor Controlável --</option>
                                    {stressorsList.filter(s => s.type === "controllable").map(s => (
                                      <option key={s.id} value={s.id}>{s.text} (Severidade: {s.severity})</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Action plans placeholder detail */}
                              <div className="w-full md:flex-1">
                                {associatedStressor ? (
                                  <div className="text-xs text-gray-400 bg-gray-950/40 p-2 rounded border border-gray-900 flex items-center gap-2">
                                    <span className="font-semibold text-[#00A3FF] uppercase font-mono text-[9px] border border-[#00A3FF]/30 px-1.5 py-0.5 rounded bg-[#00A3FF]/5 shrink-0 block">AÇÃO SAUDÁVEL</span>
                                    <input
                                      type="text"
                                      placeholder="Descreva o próximo passo concreto solucionável..."
                                      className="bg-transparent border-none text-gray-200 text-xs outline-none block w-full placeholder-gray-600 focus:placeholder-gray-500"
                                      defaultValue={associatedStressor.severity >= 4 ? "Estabelecer dedicação delimitada ou delegar à equipe técnica" : "Incluir na agenda da semana e cumprir de forma desfragmentada"}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-600 font-mono italic">Aguardando vinculação para detalhar plano de ação de resolutividade ativa...</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              )}


              {/* ACTION BACK-NEXT BUTTONS FOR DIRECT TESTS */}
              {tool.id !== "tavp" && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-900">
                  <button
                    onClick={() => setStep('patient')}
                    className="bg-gray-900 hover:bg-gray-800 text-gray-400 font-medium px-4 py-2 rounded text-xs transition-colors"
                  >
                    Voltar ao Perfil
                  </button>
                  
                  <button
                    onClick={() => setStep('results')}
                    className="bg-[#00A3FF] hover:bg-[#38bcfd] text-white font-bold px-6 py-2 rounded text-xs transition-colors flex items-center gap-1.5"
                  >
                    Prosseguir para Resumo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* STEP 3: PSYCHOMETRIC CALCULATED RESULTS */}
          {/* ======================================= */}
          {!isPlaceholder && step === 'results' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Header result */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-600/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">Perfil Psicométrico e Scores Calculados</h3>
                <p className="text-xs text-gray-400">Verifique os cálculos normativos computadorizados pelo sistema antes de acionar a inteligência interpretativa.</p>
              </div>

              {/* Profile overview box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-900">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase block">Paciente sob Exame</span>
                  <span className="text-sm font-bold text-gray-100">{patient.name}</span>
                  <span className="text-xs text-gray-400 block">{patient.age} anos • {patient.gender}</span>
                </div>
                <div className="space-y-1 sm:border-l sm:border-gray-900 sm:pl-4">
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase block">Instrumento</span>
                  <span className="text-sm font-bold text-[#00A3FF]">{tool.title}</span>
                  <span className="text-xs text-gray-400 block">Classificação: <strong>{currentScores.classification}</strong></span>
                </div>
              </div>

              {/* CORE METRICS BIG BADGE */}
              <div className="bg-gradient-to-r from-indigo-950/20 to-gray-950 p-6 rounded-xl border border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] text-[#00A3FF] font-mono font-bold uppercase tracking-wider block">MÉTRICA / SCORE PRINCIPAL</span>
                  <h4 className="text-xl font-black text-white leading-none">{currentScores.classification}</h4>
                  <p className="text-xs text-gray-400">Conforme tabelas normativas e pontuações consolidadas do teste.</p>
                </div>
                <div className="shrink-0 text-center bg-[#00A3FF]/15 border border-[#00A3FF]/25 w-20 h-20 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase block">SCORE</span>
                  <span className="text-3xl font-black text-[#00A3FF] leading-none">{currentScores.totalScore}</span>
                </div>
              </div>

              {/* DETAILED SUBSCALES */}
              <div className="space-y-3">
                <h4 className="text-xs text-gray-400 font-bold uppercase font-mono tracking-wider">Subescalas e Parâmetros Parciais</h4>
                
                <div className="space-y-4">
                  {Object.entries(currentScores.subscales || {}).map(([key, val]) => {
                    // Normalize rating to show progress bar
                    let percent = 50;
                    if (tool.id === "idai") percent = (val / 10) * 100;
                    else if (tool.id === "efca") percent = (val / 15) * 100; // max around 15 per subscale
                    else if (tool.id === "avaliacao_central" || tool.id === "genealogia_atributos" || tool.id === "linha_vida" || tool.id === "satisfacao_multidimensional" || tool.id === "radar_multidimensional" || tool.id === "radar_habilidades" || tool.id === "exame_atributos_parentais" || tool.id === "exame_evidencias_cognicao" || tool.id === "reestruturacao_semantica" || tool.id === "exame_desenvolvimento_autoestima" || tool.id === "cartao_enfrentamento" || tool.id === "despolarizacao_alternativas" || tool.id === "espectro_cognitivo" || tool.id === "rid_interacoes" || tool.id === "transicao_mecanismo" || tool.id === "analise_criticos" || tool.id === "exame_feedbacks" || tool.id === "mapeamento_estressores" || tool.id === "acompanhamento_pdp" || tool.id === "hierarquia_exposicao_enfrentamento" || tool.id === "analise_modelos_pessoais" || tool.id === "mentalidades_hedonismo_responsavel" || tool.id === "mentalidades_autoconhecimento" || tool.id === "mentalidades_autoestima" || tool.id === "mentalidades_raciocinio_otimista" || tool.id === "mentalidades_autorregulacao_emocional" || tool.id === "mentalidades_imunidade_social" || tool.id === "mentalidades_resolutividade_enfrentamento" || tool.id === "mentalidades_autocontrole" || tool.id === "mentalidades_sociabilidade" || tool.id === "mentalidades_sensibilidade_social") percent = val;
                    else if (tool.id === "exame_duplo_vantagens" || tool.id === "exame_feedbacks_entrevista" || tool.id === "exame_atributos_pessoais" || tool.id === "exame_singulares_compartilhadas" || tool.id === "exame_provisao_emocional") percent = val;
                    else if (tool.id === "exame_reacoes_sociais") {
                      if (key === "Eventos Desadaptativos / Conflitos Ativos") percent = Math.min(100, (val / 15) * 100);
                      else percent = val;
                    }
                    else if (tool.id === "exame_atitudes_dimensoes") {
                      if (key === "Áreas em Desequilíbrio Crítico") percent = (val / 6) * 100;
                      else percent = val;
                    }
                    else percent = Math.min(100, (val / 10) * 100);

                    return (
                      <div key={key} className="space-y-1.5 p-3 rounded bg-gray-950/30 border border-gray-900">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-300 font-medium">{key}</span>
                          <span className="font-mono font-semibold text-[#00A3FF]">{val} / pt</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-900 rounded overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00A3FF] to-indigo-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TRIGGER GENERATE REPORT FORM */}
              {isGeneratingHtmlReport ? (
                <div className="bg-gray-950 border border-[#00A3FF]/40 p-10 rounded-xl text-center space-y-4 animate-pulse">
                  <div className="w-12 h-12 bg-[#00A3FF]/10 border border-[#00A3FF]/20 rounded-full flex items-center justify-center mx-auto text-[#00A3FF] animate-spin">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white font-mono">Gerando Laudo de Alta Inteligência Analítica...</h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      O modelo Gemini está cruzando pontuações com o Hexaflex da TCC e mapeando os circuitos neurais da regulação emocional do paciente.
                    </p>
                  </div>
                  
                  {/* Cybernetic telemetry log */}
                  <div className="text-[9px] font-mono text-left bg-[#0c0d10] p-3 rounded border border-gray-900 text-gray-500 max-w-sm mx-auto space-y-1">
                    <div>[INFO] Conectando ao modelo gemini-3.5-flash...</div>
                    <div className="text-[#00A3FF] animate-pulse">[LOAD] Analisando TCC G4 & Circuitos Neurais...</div>
                    <div>[CORE] Cruzando dados psicométricos de {patient.name}...</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  {aiError && (
                    <div className="bg-red-950/20 border border-red-800/30 p-3 rounded text-xs text-red-400 font-mono">
                      Erro na Geração: {aiError}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setStep('evaluation')}
                      className="bg-gray-900 hover:bg-gray-800 text-gray-400 font-medium px-4 py-2 rounded text-xs transition-colors"
                    >
                      Voltar ao Teste
                    </button>
                    
                    <button
                      onClick={handleGenerateAiReport}
                      className="bg-[#00A3FF] hover:bg-[#38bcfd] text-white font-bold px-6 py-3 rounded-md text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#00A3FF]/20"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      Gerar Relatório por IA (TCC & Neurociência)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* STEP 4: GENERATED AI REPORT DISPLAY */}
          {/* ======================================= */}
          {!isPlaceholder && step === 'report' && (
            <div className="space-y-6">
              
              {/* Toolbar */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-900 flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs text-gray-300 font-mono">Laudo Acadêmico Prontuário Disponível</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadHtml}
                    className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 font-mono"
                    title="Exportar como arquivo HTML independente"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar HTML
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 font-mono"
                    title="Imprimir laudo"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir / PDF
                  </button>

                  <button
                    onClick={handleSaveDossier}
                    className="bg-[#00A3FF] hover:bg-[#38bcfd] text-white font-bold px-4 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar no Histórico
                  </button>
                </div>
              </div>

              {/* THE REPORT CONTAINER (PRINT-STYLABLE) */}
              <div className="bg-white text-gray-900 p-8 md:p-12 rounded-xl border border-gray-200 shadow-sm print-card space-y-6 font-sans">
                {/* Printable header block only shown under print */}
                <div className="border-b-2 border-gray-900 pb-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-black text-[#00A3FF] tracking-tight uppercase font-display">PsicoMetrik</h1>
                      <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">LAUDO NEUROCLÍNICO COMPLEMENTAR</div>
                    </div>
                    <div className="text-right text-xs text-gray-500 font-mono">
                      <div>IDAI-SCORE INTEGRADO</div>
                      <div>Emissão: {new Date().toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                    <div><strong>Paciente:</strong> <span className="text-gray-800">{patient.name}</span></div>
                    <div><strong>Idade:</strong> <span className="text-gray-800">{patient.age} anos</span></div>
                    <div><strong>Gênero:</strong> <span className="text-gray-800">{patient.gender}</span></div>
                    <div><strong>Coleta:</strong> <span className="text-gray-800">{tool.title}</span></div>
                  </div>
                </div>

                {/* Score classifications boxes for printing */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-gray-500 block">Classificação Computada</span>
                    <strong className="text-sm font-bold text-gray-900">{currentScores.classification}</strong>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-gray-500 block">Métrica Bruta</span>
                    <strong className="text-sm font-bold text-[#00A3FF]">{currentScores.totalScore} PONTOS</strong>
                  </div>
                </div>

                {/* THE PORTUGUESE MARKDOWN BODY TEXT */}
                <div className="prose prose-sm max-w-none text-gray-800">
                  {renderMarkdown(aiReportText)}
                </div>

                <div className="border-t border-gray-200 pt-6 text-center space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Assinatura do Profissional Responsável</div>
                  <div className="w-48 h-0.5 bg-gray-300 mx-auto mt-6" />
                  <div className="text-xs font-semibold text-gray-700">{patient.name ? "Psicólogo(a) Assistente" : ""}</div>
                </div>
              </div>

              {/* BACK ACTION FOR CANCELLING OR REVISING */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-900 no-print">
                <button
                  onClick={() => setStep('results')}
                  className="bg-gray-900 hover:bg-gray-800 text-gray-400 font-medium px-4 py-2 rounded text-xs transition-colors"
                >
                  Voltar ao Resumo
                </button>
                <button
                  onClick={handleSaveDossier}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded text-xs transition-colors"
                >
                  Finalizar & Salvar Dossier
                </button>
              </div>
            </div>
          )}

        </div>
        {/* RESIZE HANDLERS (Only if not maximized) */}
        {isWindowed && !isMaximized && (
          <>
            <div 
              className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize z-50 hover:bg-[#00A3FF]/10 select-none" 
              onMouseDown={(e) => startResize(e, 'e')}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize z-50 hover:bg-[#00A3FF]/10 select-none" 
              onMouseDown={(e) => startResize(e, 's')}
            />
            <div 
              className="absolute right-0 bottom-0 w-3.5 h-3.5 cursor-se-resize z-[60] hover:bg-[#00A3FF]/20 flex items-end justify-end p-[2px] select-none pointer-events-auto" 
              onMouseDown={(e) => startResize(e, 'se')}
            >
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                <path d="M6 1L1 6M6 3L3 6M6 5L5 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          </>
        )}
        <ClinicalSuggestionsSidebar />
      </div>
    </div>
  );
}
