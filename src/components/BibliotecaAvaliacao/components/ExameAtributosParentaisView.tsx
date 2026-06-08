import React, { useState } from "react";
import { PatientInfo } from "../types";
import { Users, Heart, AlertTriangle, Sparkles, Filter, Plus, Trash2, BookOpen, AlertCircle } from "lucide-react";

export interface ParentCaregiver {
  id: string;
  name: string;
  relationship: string;
  selectedAttributes: string[];
  notes?: string;
}

export interface AttributeMetadata {
  id: string;
  label: string;
  category: "healthy" | "stressor" | "harmful";
  description: string;
  suggestedSchemas: string[];
}

// 52 Attributes from the official sheet
export const PARENTAL_ATTRIBUTES: AttributeMetadata[] = [
  // Healthy
  { id: "atenciosos", label: "atenciosos", category: "healthy", description: "Demonstram atenção e cuidado com as necessidades e rotinas.", suggestedSchemas: [] },
  { id: "afetuosos", label: "afetuosos", category: "healthy", description: "Oferecem afeto físico e acolhimento caloroso.", suggestedSchemas: [] },
  { id: "cuidadores", label: "cuidadores", category: "healthy", description: "Zelam pelo bem-estar e saúde ativamente.", suggestedSchemas: [] },
  { id: "carinhosos", label: "carinhosos", category: "healthy", description: "Expressam carinho e amor espontaneamente.", suggestedSchemas: [] },
  { id: "gentis", label: "gentis", category: "healthy", description: "Tratam com cortesia, respeito e gentileza.", suggestedSchemas: [] },
  { id: "maleaveis", label: "maleáveis", category: "healthy", description: "São flexíveis, escutam ponderações e admitem erros.", suggestedSchemas: [] },
  { id: "provedores", label: "provedores", category: "healthy", description: "Asseguram suporte financeiro, alimentar e habitacional necessário.", suggestedSchemas: [] },
  { id: "protetores", label: "protetores", category: "healthy", description: "Praticam proteção adequada e saudável diante de perigos reais.", suggestedSchemas: [] },
  { id: "educados", label: "educados", category: "healthy", description: "Comportamento exemplar, civilizado e transmissão de bons modos.", suggestedSchemas: [] },
  { id: "democraticos", label: "democráticos", category: "healthy", description: "Incentivam a autonomia, o debate saudável e ouvem opiniões.", suggestedSchemas: [] },
  { id: "solicitos", label: "solícitos", category: "healthy", description: "Prontos para auxiliar e amparar em momentos de necessidade.", suggestedSchemas: [] },
  { id: "bondosos_1", label: "bondosos", category: "healthy", description: "Atitudes genuínas de generosidade e bondade.", suggestedSchemas: [] },
  { id: "bondosos_2", label: "bondosos (ii)", category: "healthy", description: "Atitudes recorrentes de generosidade e amabilidade com terceiros.", suggestedSchemas: [] },
  { id: "corajosos", label: "corajosos", category: "healthy", description: "Enfrentam dificuldades com determinação e destemor.", suggestedSchemas: [] },
  { id: "comunicativos", label: "comunicativos", category: "healthy", description: "Falam de forma aberta, transparente e clara com a família.", suggestedSchemas: [] },
  
  // Stressors (High Demands, Anxiety/Protections)
  { id: "autoritarios", label: "autoritários", category: "stressor", description: "Imposições rígidas, exigência de obediência cega e punições severas.", suggestedSchemas: ["Subjugação", "Postura Punitiva"] },
  { id: "exigentes", label: "exigentes", category: "stressor", description: "Cobrança exagerada por desempenho acadêmico, financeiro ou comportamental.", suggestedSchemas: ["Padrões Inflexíveis"] },
  { id: "superprotetores", label: "superprotetores", category: "stressor", description: "Cuidado asfixiante que impede o desenvolvimento da autoconfiança de explorar o mundo.", suggestedSchemas: ["Vulnerabilidade ao Dano", "Dependência/Incompetência"] },
  { id: "disciplinadores", label: "disciplinadores", category: "stressor", description: "Foco extremo em regras, controle rígido e modelagem de comportamento.", suggestedSchemas: ["Inibição Emocional", "Padrões Inflexíveis"] },
  { id: "ansiosos", label: "ansiosos", category: "stressor", description: "Preocupação hiperativa persistente, transmitindo insegurança contínua.", suggestedSchemas: ["Vulnerabilidade ao Dano"] },
  { id: "medrosos", label: "medrosos", category: "stressor", description: "Evitação de riscos de forma extrema, gerando timidez ou fobias comportamentais.", suggestedSchemas: ["Vulnerabilidade ao Dano"] },
  { id: "competidores", label: "competidores", category: "stressor", description: "Disputam atenção, status ou mérito diretamente com o filho.", suggestedSchemas: ["Defectividade/Vergonha", "Busca de Aprovação"] },
  { id: "passionais", label: "passionais", category: "stressor", description: "Agem de forma excessivamente emotiva, dramática ou impetuosa.", suggestedSchemas: ["Abandono/Instabilidade"] },
  { id: "ingenuos", label: "ingênuos", category: "stressor", description: "Falta de malícia ou preparo para lidar com o mundo, deixando o filho exposto.", suggestedSchemas: ["Vulnerabilidade ao Dano"] },

  // Harmful (Attachment trauma, neglect, toxicity, abuse)
  { id: "negligentes", label: "negligentes", category: "harmful", description: "Falta de cuidado básico de saúde, higiene ou amparo primordial.", suggestedSchemas: ["Privação Emocional", "Abandono/Instabilidade"] },
  { id: "distantes", label: "distantes", category: "harmful", description: "Fisicamente ausentes ou com barreira afetiva intransponível.", suggestedSchemas: ["Privação Emocional", "Inibição Emocional"] },
  { id: "maldosos", label: "maldosos", category: "harmful", description: "Ações deliberadas destinadas a magoar, ofender ou humilhar.", suggestedSchemas: ["Desconfiança/Abuso", "Defectividade/Vergonha"] },
  { id: "mentirosos", label: "mentirosos", category: "harmful", description: "Mentiras recorrentes, ocultação de fatos graves ou simulações.", suggestedSchemas: ["Desconfiança/Abuso"] },
  { id: "arrogantes", label: "arrogantes", category: "harmful", description: "Visão de superioridade, zombando ou diminuindo as conquistas alheias.", suggestedSchemas: ["Defectividade/Vergonha", "Merecimento/Grandiosidade"] },
  { id: "criticos", label: "críticos", category: "harmful", description: "Foco sistemático no erro, depreciação verbal direta e reprovações contínuas.", suggestedSchemas: ["Defectividade/Vergonha", "Padrões Inflexíveis"] },
  { id: "indulgentes", label: "indulgentes", category: "harmful", description: "Ausência total de regras e imposição de limites, gerando caprichos.", suggestedSchemas: ["Autocontrole Insuficiente", "Merecimento/Grandiosidade"] },
  { id: "bajuladores", label: "bajuladores", category: "harmful", description: "Lisonja falsa ou uso de agradabilidade para encobrir falhas ou manipular.", suggestedSchemas: ["Busca de Aprovação"] },
  { id: "agressivos", label: "agressivos", category: "harmful", description: "Ataques verbais fustigantes ou agressão física recorrente.", suggestedSchemas: ["Desconfiança/Abuso", "Defectividade/Vergonha", "Postura Punitiva"] },
  { id: "passivos", label: "passivos", category: "harmful", description: "Omissão diante de injustiças, permitindo abusos por parte de outros membros.", suggestedSchemas: ["Subjugação", "Abandono/Instabilidade"] },
  { id: "submissos", label: "submissos", category: "harmful", description: "Falta total de firmeza e entrega total da autoridade a terceiros agressores.", suggestedSchemas: ["Subjugação"] },
  { id: "manipuladores", label: "manipuladores", category: "harmful", description: "Artimanhas culpabilizantes que fazem a criança se sentir responsável pela dor do outro.", suggestedSchemas: ["Desconfiança/Abuso", "Auto-sacrifício", "Privação Emocional"] },
  { id: "desconfiados", label: "desconfiados", category: "harmful", description: "Instilação contínua de suspeitas de conspirações, traições ou perigos humanos.", suggestedSchemas: ["Desconfiança/Abuso"] },
  { id: "instaveis", label: "instáveis", category: "harmful", description: "Variações agudas de humor, onde o filho nunca sabe qual reação esperar do dia.", suggestedSchemas: ["Abandono/Instabilidade"] },
  { id: "dominadores", label: "dominadores", category: "harmful", description: "Exigência de controle sobre preferências pessoais e escolhas individuais básicas.", suggestedSchemas: ["Subjugação", "Dependência/Incompetência"] },
  { id: "imaturos", label: "imaturos", category: "harmful", description: "Comportamento birrento, egoísta ou inversão de papéis (parentificação do filho).", suggestedSchemas: ["Privação Emocional", "Auto-sacrifício"] },
  { id: "infelizes", label: "infelizes", category: "harmful", description: "Infelicidade crônica, pessimismo constante que intoxica o ambiente doméstico.", suggestedSchemas: ["Negatividade/Pessimismo", "Privação Emocional"] },
  { id: "desorganizados", label: "desorganizados", category: "harmful", description: "Caos rotineiro, instabilidade geográfica frequente, bagunça de agendas/regras.", suggestedSchemas: ["Autocontrole Insuficiente"] },
  { id: "indisponiveis", label: "indisponíveis", category: "harmful", description: "Fuga sistemática de engajamento emocional ou tempo com o filho.", suggestedSchemas: ["Privação Emocional"] },
  { id: "manipulaveis", label: "manipuláveis", category: "harmful", description: "Facilmente instrumentalizados pela criança ou terceiros, sem critério firme.", suggestedSchemas: ["Autocontrole Insuficiente"] },
  { id: "exploradores", label: "exploradores", category: "harmful", description: "Aproveitam-se do esforço, sustento ou docilidade do filho para o próprio usufruto.", suggestedSchemas: ["Desconfiança/Abuso", "Subjugação"] },
  { id: "intolerantes", label: "intolerantes", category: "harmful", description: "Sem paciência para manifestações infantis, riso, ruídos ou questionamentos.", suggestedSchemas: ["Inibição Emocional", "Postura Punitiva"] },
  { id: "injustos", label: "injustos", category: "harmful", description: "Relações diferenciadas (filho favorito x bode expiatório), punições sem critérios.", suggestedSchemas: ["Desconfiança/Abuso", "Subjugação"] },
  { id: "raivosos", label: "raivosos", category: "harmful", description: "Habitam um estado crônico de fúria, pavio curto e impulsividade hostil.", suggestedSchemas: ["Desconfiança/Abuso", "Postura Punitiva"] },
  { id: "traidores", label: "traidores", category: "harmful", description: "Rompem promessas solenes, revelam segredos íntimos ou abandonam apoios.", suggestedSchemas: ["Desconfiança/Abuso", "Abandono/Instabilidade"] },
  { id: "ignorantes", label: "ignorantes", category: "harmful", description: "Rejeitam esclarecimento, destratam psicologia e invalidam conselhos técnicos.", suggestedSchemas: ["Isolamento Social"] },
  { id: "melancolicos", label: "melancólicos", category: "harmful", description: "Melancolia sombria, prostração pessimista passiva frente aos desafios.", suggestedSchemas: ["Negatividade/Pessimismo"] },
  { id: "infieis", label: "infiéis", category: "harmful", description: "Quebram recorrentemente a lealdade conjugal ou familiar provocando cismas.", suggestedSchemas: ["Abandono/Instabilidade", "Desconfiança/Abuso"] }
];

interface ExameAtributosParentaisViewProps {
  patient: PatientInfo;
  caregivers: ParentCaregiver[];
  setCaregivers: React.Dispatch<React.SetStateAction<ParentCaregiver[]>>;
}

export default function ExameAtributosParentaisView({
  patient,
  caregivers,
  setCaregivers
}: ExameAtributosParentaisViewProps) {
  
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>(caregivers[0]?.id || "mae_g");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "healthy" | "stressor" | "harmful">("all");
  const [clinicalFilter, setClinicalFilter] = useState(true); // default true for better therapeutic help
  const [newCaregiverName, setNewCaregiverName] = useState("");
  const [newCaregiverRel, setNewCaregiverRel] = useState("Mãe");
  const [showAddModal, setShowAddModal] = useState(false);

  // Active caregiver
  const currentCaregiver = caregivers.find(c => c.id === selectedCaregiverId) || caregivers[0];

  const handleToggleAttribute = (attributeId: string) => {
    if (!currentCaregiver) return;
    
    setCaregivers(prev => prev.map(c => {
      if (c.id === currentCaregiver.id) {
        const isSelected = c.selectedAttributes.includes(attributeId);
        const updated = isSelected 
          ? c.selectedAttributes.filter(id => id !== attributeId)
          : [...c.selectedAttributes, attributeId];
        return { ...c, selectedAttributes: updated };
      }
      return c;
    }));
  };

  const updateCaregiverNotes = (notes: string) => {
    if (!currentCaregiver) return;
    setCaregivers(prev => prev.map(c => {
      if (c.id === currentCaregiver.id) {
        return { ...c, notes };
      }
      return c;
    }));
  };

  const handleAddCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaregiverName.trim()) return;

    const id = "cg_" + Date.now();
    const newCG: ParentCaregiver = {
      id,
      name: newCaregiverName,
      relationship: newCaregiverRel,
      selectedAttributes: [],
      notes: ""
    };

    setCaregivers(prev => [...prev, newCG]);
    setSelectedCaregiverId(id);
    setNewCaregiverName("");
    setShowAddModal(false);
  };

  const handleDeleteCaregiver = (id: string) => {
    if (caregivers.length <= 1) {
      alert("É necessário manter pelo menos uma figura cuidadora no exame.");
      return;
    }
    if (confirm("Deseja realmente remover esta figura do exame dos Atributos Parentais?")) {
      const remaining = caregivers.filter(c => c.id !== id);
      setCaregivers(remaining);
      // Select the first remaining
      setSelectedCaregiverId(remaining[0].id);
    }
  };

  // Indexes calculations
  const calculateIndexes = (cg: ParentCaregiver) => {
    if (!cg) return { inp: 0, isp: 0, ratio: 0, totalPositive: 0, totalNegative: 0 };
    
    const healthyTotal = PARENTAL_ATTRIBUTES.filter(a => a.category === "healthy").length;
    const diseaseTotal = PARENTAL_ATTRIBUTES.filter(a => a.category !== "healthy").length;

    const selectedHealthy = cg.selectedAttributes.filter(id => {
      const attr = PARENTAL_ATTRIBUTES.find(a => a.id === id);
      return attr?.category === "healthy";
    }).length;

    const selectedNegative = cg.selectedAttributes.filter(id => {
      const attr = PARENTAL_ATTRIBUTES.find(a => a.id === id);
      return attr?.category && attr.category !== "healthy";
    }).length;

    // Nutrition Index (INP): percentage of healthy attributes checked
    const inp = Math.round((selectedHealthy / healthyTotal) * 100);
    // Stressor/Interference Index (ISP): percentage of negative/stressor checked
    const isp = Math.round((selectedNegative / diseaseTotal) * 100);

    return {
      inp,
      isp,
      totalPositive: selectedHealthy,
      totalNegative: selectedNegative
    };
  };

  // Schema predictive mapping
  const calculatePredictedSchemas = (cg: ParentCaregiver) => {
    if (!cg || cg.selectedAttributes.length === 0) return [];
    
    const schemaCounts: Record<string, { count: number; max: number; attributes: string[] }> = {};
    
    // Max values for normalisation
    PARENTAL_ATTRIBUTES.forEach(attr => {
      if (attr.suggestedSchemas) {
        attr.suggestedSchemas.forEach(sc => {
          if (!schemaCounts[sc]) {
            schemaCounts[sc] = { count: 0, max: 0, attributes: [] };
          }
          schemaCounts[sc].max += 1;
        });
      }
    });

    cg.selectedAttributes.forEach(attrId => {
      const attr = PARENTAL_ATTRIBUTES.find(a => a.id === attrId);
      if (attr && attr.suggestedSchemas) {
        attr.suggestedSchemas.forEach(sc => {
          if (schemaCounts[sc]) {
            schemaCounts[sc].count += 1;
            schemaCounts[sc].attributes.push(attr.label);
          }
        });
      }
    });

    return Object.entries(schemaCounts)
      .map(([schema, data]) => {
        const percentage = Math.round((data.count / (data.max || 1)) * 100);
        return {
          schema,
          count: data.count,
          attributes: data.attributes,
          percentage
        };
      })
      .filter(s => s.count > 0)
      .sort((a, b) => b.percentage - a.percentage);
  };

  const currentIndexes = currentCaregiver ? calculateIndexes(currentCaregiver) : { inp: 0, isp: 0, totalPositive: 0, totalNegative: 0 };
  const currentSchemas = currentCaregiver ? calculatePredictedSchemas(currentCaregiver) : [];

  // Filtered attributes list
  const filteredAttributes = PARENTAL_ATTRIBUTES.filter(attr => {
    const matchesSearch = attr.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          attr.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || attr.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="atributos-parentais-root">
      
      {/* Clinician Psychoeducation Header */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-300 space-y-1 block" id="atributos-parentais-banner">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">👨‍👩‍👦 EXAME DOS ATRIBUTOS PARENTAIS</strong>
        <span className="text-gray-400">
          O Exame dos Atributos Parentais investiga de forma minuciosa as influências retroativas e transgeracionais exercidas pelos cuidadores primários (biológicos ou substitutos). 
          Aqui você pode mapear os comportamentos que moldaram as crenças e o repertório atual de Habilidades Psicológicas do seu cliente. 
          Adicione múltiplas fichas independentes para comparar o pai, a mãe, ou cuidadores substitutos, descobrindo tendências para o estabelecimento de esquemas terapêuticos e o reparo saudável correspondente.
        </span>
      </div>

      {/* Facilitator Bar Client info */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="atributos-parentais-meta">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Anônimo"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Profissional / Responsável</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Dr. Lincoln Poubel</div>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Registro CRP</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">CRP 04/99124-MG</div>
        </div>
      </div>

      {/* Caregiver Selection & Management Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/60 p-3 rounded-2xl border border-gray-900" id="atributos-parentais-tabs-bar">
        <div className="flex flex-wrap gap-2">
          {caregivers.map((cg) => {
            const indexes = calculateIndexes(cg);
            const isActive = cg.id === selectedCaregiverId;
            return (
              <button
                key={cg.id}
                onClick={() => setSelectedCaregiverId(cg.id)}
                className={`px-4 py-2 text-xs rounded-xl transition-all duration-150 flex items-center gap-2 border ${
                  isActive 
                    ? "bg-[#00A3FF]/15 border-[#00A3FF] text-[#00A3FF] shadow-lg font-bold" 
                    : "bg-[#111217] border-gray-900 text-gray-400 hover:text-white"
                }`}
                id={`cg-btn-${cg.id}`}
              >
                <Users className="w-3.5 h-3.5" />
                <div className="text-left">
                  <div className="leading-3 text-[11px]">{cg.name}</div>
                  <span className="text-[8px] opacity-75 font-mono">{cg.relationship}</span>
                </div>
                <span className="ml-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-emerald-400">
                  {indexes.totalPositive + indexes.totalNegative}
                </span>
                {caregivers.length > 1 && (
                  <Trash2 
                    className="w-3 h-3 text-red-500/50 hover:text-red-500 ml-1 cursor-pointer transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCaregiver(cg.id);
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-bold font-sans flex items-center gap-1"
          id="btn-add-parent"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cuidador</span>
        </button>
      </div>

      {showAddModal && (
        <div className="bg-[#111217] p-5 rounded-2xl border border-gray-800 space-y-4 max-w-md mx-auto block animate-fadeIn shadow-dark" id="modal-add-cg">
          <div className="flex justify-between items-center pb-2 border-b border-gray-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Adicionar Nova Figura Cuidadora</h4>
            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white text-xs">Excluir</button>
          </div>
          <form onSubmit={handleAddCaregiver} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-gray-400 font-medium block">Nome ou Apelido Identificador:</label>
              <input
                type="text"
                value={newCaregiverName}
                onChange={(e) => setNewCaregiverName(e.target.value)}
                placeholder="Ex. Mãe Biológica, Pai Adotivo, Avó Maria..."
                className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 font-medium block">Vínculo Parentesco:</label>
              <select
                value={newCaregiverRel}
                onChange={(e) => setNewCaregiverRel(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-lg text-white text-xs outline-none"
              >
                <option value="Mãe">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Avó/Avô">Avó/Avô</option>
                <option value="Padrasto/Madrasta">Padrasto/Madrasta</option>
                <option value="Tio/Tia">Tio/Tia</option>
                <option value="Outro Cuidador">Outro Responsável</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-950/80 text-gray-400 hover:text-white border border-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all"
              >
                Criar Cuidador
              </button>
            </div>
          </form>
        </div>
      )}

      {currentCaregiver ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="atributos-parentais-body">
          
          {/* Main Attributes Selection and filter (Left Column, col-span-7) */}
          <div className="xl:col-span-7 bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col space-y-4" id="atributos-parentais-chk-card">
            
            {/* Header info & filters inside Selection Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-900 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-[#00A3FF]">Atributos de {currentCaregiver.name}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Assinale as características que eram perceptivelmente predominantes neste cuidador</p>
              </div>

              {/* Clinical mode toggle */}
              <button
                onClick={() => setClinicalFilter(!clinicalFilter)}
                className={`px-3 py-1 text-[9px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                  clinicalFilter 
                    ? "bg-[#00A3FF]/10 border-[#00A3FF]/30 text-[#00A3FF]" 
                    : "bg-gray-950/80 border-gray-900 text-gray-500"
                }`}
                title="Ativar/Desativar categorização clínica visual (cores ajudam o profissional na análise)"
                id="btn-clinical-filter"
              >
                <Filter className="w-3 h-3" />
                <span>Legenda Clínica: {clinicalFilter ? "LIGADA" : "DESLIGADA"}</span>
              </button>
            </div>

            {/* Sub-Filters and search */}
            <div className="flex flex-col sm:flex-row gap-2" id="atributos-parentais-filters-sub">
              <input
                type="text"
                placeholder="🔍 Localizar atributo (ex: agressivo, atencioso...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-900 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-[#00A3FF]"
              />
              
              <div className="flex gap-1" id="sub-filter-buttons">
                {(["all", "healthy", "stressor", "harmful"] as const).map((mode) => {
                  const labels: Record<string, string> = {
                    all: "Todos",
                    healthy: "Nutritivos",
                    stressor: "Desafiadores",
                    harmful: "Tóxicos/Negligentes"
                  };
                  return (
                    <button
                      key={mode}
                      onClick={() => setActiveFilter(mode)}
                      className={`px-2.5 py-1 text-[9px] rounded-lg border font-medium ${
                        activeFilter === mode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-gray-950 border-gray-900 text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {labels[mode]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of the 52 attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent select-none text-xs" id="atributos-grid">
              {filteredAttributes.length > 0 ? (
                filteredAttributes.map((attr) => {
                  const isChecked = currentCaregiver.selectedAttributes.includes(attr.id);
                  
                  // Color codes based on category if clinical filter is active
                  let borderClass = "border-gray-900";
                  let bgClass = "bg-gray-950/40";
                  let checkAccent = "accent-emerald-500 focus:ring-emerald-500";
                  
                  if (isChecked) {
                    borderClass = "border-gray-850";
                    bgClass = "bg-gray-950/90 shadow-inner";
                  }

                  if (clinicalFilter) {
                    if (attr.category === "healthy") {
                      borderClass = isChecked ? "border-emerald-500/60" : "border-emerald-500/10";
                      bgClass = isChecked ? "bg-emerald-500/5" : "bg-emerald-500/[0.01]";
                      checkAccent = "accent-emerald-500 focus:ring-emerald-500";
                    } else if (attr.category === "stressor") {
                      borderClass = isChecked ? "border-amber-500/60" : "border-amber-500/10";
                      bgClass = isChecked ? "bg-amber-500/5" : "bg-amber-500/[0.01]";
                      checkAccent = "accent-amber-500 focus:ring-amber-500";
                    } else if (attr.category === "harmful") {
                      borderClass = isChecked ? "border-rose-500/60" : "border-rose-500/10";
                      bgClass = isChecked ? "bg-rose-500/5" : "bg-rose-500/[0.01]";
                      checkAccent = "accent-rose-500 focus:ring-rose-500";
                    }
                  }

                  return (
                    <label
                      key={attr.id}
                      className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${borderClass} ${bgClass} transition-all cursor-pointer hover:border-gray-750 block relative group`}
                      id={`lbl-attr-${attr.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAttribute(attr.id)}
                        className={`mt-0.5 w-3.5 h-3.5 rounded border-gray-800 ${checkAccent} cursor-pointer`}
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-sans font-semibold text-[11px] capitalize ${isChecked ? "text-white" : "text-gray-300"}`}>
                            {attr.label === "bondosos (ii)" ? "bondosos" : attr.label}
                          </span>
                          
                          {clinicalFilter && (
                            <span className={`text-[8px] px-1 font-mono uppercase rounded font-bold ${
                              attr.category === "healthy" ? "text-emerald-400 bg-emerald-500/5" :
                              attr.category === "stressor" ? "text-amber-400 bg-amber-500/5" :
                              "text-rose-400 bg-rose-500/5"
                            }`}>
                              {attr.category === "healthy" ? "Nutritivo" :
                               attr.category === "stressor" ? "Estressor/Rígido" : "Tóxico/Negligente"}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal block group-hover:text-gray-400 transition-colors">
                          {attr.description}
                        </p>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-10 text-gray-500 italic font-mono text-[10px]">
                  Nenhuma característica corresponde ao filtro ou busca selecionada.
                </div>
              )}
            </div>

            {/* Notes Section for current Caregiver */}
            <div className="border-t border-gray-900 pt-3 space-y-1" id="notes-current-cg">
              <label className="text-gray-400 font-sans font-bold text-[10px] block uppercase tracking-wide">
                📝 Notas Clínicas / Justificativas de {currentCaregiver.name}:
              </label>
              <textarea
                value={currentCaregiver.notes || ""}
                onChange={(e) => updateCaregiverNotes(e.target.value)}
                placeholder="Ex: Forneça episódios biográficos, comportamentos cruciais ou relatos adicionais do cliente sobre este cuidador para justificar as marcações ou amparar as hipóteses de esquemas."
                className="w-full min-h-[70px] p-2.5 bg-gray-950 border border-gray-900 text-xs rounded-xl text-white outline-none focus:ring-1 focus:ring-[#00A3FF]"
              />
            </div>
          </div>

          {/* Results Analysis Panel (Right Column, col-span-5) */}
          <div className="xl:col-span-5 flex flex-col space-y-4" id="atributos-parentais-analysis-card">
            
            {/* Scorecard Box */}
            <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col space-y-4 shadow-dark" id="analysis-summary-box">
              <div className="border-b border-gray-900 pb-2">
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-emerald-400">Score & Métricas Clínicas</h3>
                <p className="text-[9px] text-gray-500">Balanço comportamental de {currentCaregiver.name}</p>
              </div>

              {/* Progress bars for INP and ISP */}
              <div className="space-y-4" id="progress-bars-parental">
                {/* Nutrição Parental (INP) */}
                <div className="space-y-1.5" id="inp-wrapper">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-emerald-400 font-sans font-bold uppercase flex items-center gap-1">
                      <Heart className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />
                      Índice de Nutrição Parental (INP)
                    </span>
                    <strong className="text-white font-mono">{currentIndexes.inp}% ({currentIndexes.totalPositive} marcados)</strong>
                  </div>
                  <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentIndexes.inp}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 leading-snug">
                    Mensura o percentual de atitudes de validação, proteção saudável e amor seguro. Valores altos representam fortes vínculos primitivos estimulantes.
                  </p>
                </div>

                {/* Estressores Parentais (ISP) */}
                <div className="space-y-1.5" id="isp-wrapper">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-amber-500 font-sans font-bold uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Índice de Estressores Parentais (ISP)
                    </span>
                    <strong className="text-white font-mono">{currentIndexes.isp}% ({currentIndexes.totalNegative} marcados)</strong>
                  </div>
                  <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentIndexes.isp}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 leading-snug">
                    Mapeia o peso de privação emocional, rigidez, agressividade ou ausência de limites. Valores acima de 25% sugerem heranças de vulnerabilidade emocional marcantes.
                  </p>
                </div>
              </div>
            </div>

            {/* Early Maladaptive Schemas Predictive Mapping */}
            <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col space-y-4 shadow-dark" id="schemas_predict_card">
              <div className="border-b border-gray-900 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-pink-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    EIDs em Potencial Gerados
                  </h3>
                  <p className="text-[9px] text-gray-500">Sinalizadores preditivos com base na Terapia do Esquema</p>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-gray-950 text-emerald-400 font-bold border border-gray-900">
                  Transgeracional
                </span>
              </div>

              {currentSchemas.length > 0 ? (
                <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent text-xs" id="parent-schema-list">
                  {currentSchemas.map((schemaGroup) => (
                    <div 
                      key={schemaGroup.schema} 
                      className="p-3 bg-gray-950/50 rounded-xl border border-gray-900 space-y-1.5 hover:border-gray-850 transition-all"
                      id={`p-schema-${schemaGroup.schema.replace("/", "_")}`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-200 font-bold font-sans">
                          📌 Esquema de: <strong className="text-pink-400 font-black">{schemaGroup.schema}</strong>
                        </span>
                        <span className="font-mono text-purple-400 font-black bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/10">
                          Fator de Ativação {schemaGroup.percentage}%
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[8px] text-gray-500 font-mono">Gatilhos Parentais:</span>
                        {schemaGroup.attributes.map((attr, aIdx) => (
                          <span 
                            key={aIdx} 
                            className="bg-gray-900 px-1.5 py-0.5 rounded text-[8px] font-medium text-gray-400 border border-gray-850 capitalize"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>

                      <p className="text-[9px] text-gray-500 font-mono leading-tight">
                        {schemaGroup.schema === "Subjugação" && "Reflete a repressão de desejos e escolhas próprias em prol de agradar e apaziguar a figura cuidadora exigente ou punitiva."}
                        {schemaGroup.schema === "Postura Punitiva" && "Ativa pensamentos autodepreciativos e inflexíveis com autocobrança para punir-se por quaisquer falhas em relação a exigências rígidas."}
                        {schemaGroup.schema === "Padrões Inflexíveis" && "Instila a convicção crônica de que deve ser perfeito e buscar produtividade incansável, abrindo mão do repouso e lazer saudável."}
                        {schemaGroup.schema === "Vulnerabilidade ao Dano" && "Instila o pânico constante de que catástrofes de saúde, físicas, financeiras ou climáticas ocorrerão sem recursos de defesa."}
                        {schemaGroup.schema === "Dependência/Incompetência" && "Cria a sensação de ser incapaz de conduzir a própria vida de modo autônomo e maduro, dependendo de conselhos diretos alheios."}
                        {schemaGroup.schema === "Inibição Emocional" && "Determina a vergonha na expressão de sentimentos legítimos, risos, choro ou raiva, preferindo o silêncio anestesiado."}
                        {schemaGroup.schema === "Defectividade/Vergonha" && "Cria a convicção arraigada de ser quebrado, inadequado, feio ou não merecedor do carinho legítimo das pessoas."}
                        {schemaGroup.schema === "Busca de Aprovação" && "Dependência asfixiante do aval alheio, orientando cada comportamento para ser amado ou validado externamente."}
                        {schemaGroup.schema === "Privação Emocional" && "A expectativa crônica de que suas necessidades de afeto, escuta inteligente e proteção autêntica jamais serão saciadas."}
                        {schemaGroup.schema === "Abandono/Instabilidade" && "Cria o medo perene de que pessoas amadas irão embora, morrerão ou deixarão o cliente sozinho na imprevisibilidade."}
                        {schemaGroup.schema === "Desconfiança/Abuso" && "A crença de que as pessoas são perigosas, mentirosas ou vão se aproveitar de suas fragilidades, bloqueando a vulnerabilidade segura."}
                        {schemaGroup.schema === "Autocontrole Insuficiente" && "Cria extrema labilidade com frustração, impossibilitando persistir em rotinas sólidas, retardar gratificações e manter limites saudáveis."}
                        {schemaGroup.schema === "Merecimento/Grandiosidade" && "Cria a crença inflada de que é superior às regras normais e tem direito de reinar, explorar ou submeter terceiros."}
                        {schemaGroup.schema === "Auto-sacrifício" && "A compulsão constante por curar e cuidar da dor das figuras parentais imaturas, ignorando as próprias necessidades."}
                        {schemaGroup.schema === "Negatividade/Pessimism" && "Ativa um foco implacável nas adversidades do destino, no sofrimento inescapável e no desencanto com a vivência."}
                        {schemaGroup.schema === "Isolamento Social" && "Determina a sensação de inadequação e desajuste social, o sentimento de não pertencer a nenhum grupo coerente."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center italic text-[10px] min-h-[140px] flex items-center justify-center p-4 border border-dashed border-gray-900 rounded-2xl bg-gray-950/20">
                  <div className="flex flex-col items-center space-y-1">
                    <BookOpen className="w-5 h-5 text-gray-600 mb-1" />
                    <span>Nenhum atributo ou marcador selecionado para as figuras parentais ainda.</span>
                    <span className="text-[8px] text-gray-600">Assinale as características no painel ao lado para estimar as influências de esquemas do cliente!</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-20 italic text-xs text-gray-500">
          Nenhum cuidador cadastrado. Clique no botão superior para iniciar o exame de atributos.
        </div>
      )}

    </div>
  );
}
