/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Patient, EarlyNeed, SchemaEID, CopingStyle, PsychologicalSkill } from "../types";
import { Plus, Edit2, Trash2, Check, UserPlus, Info, Save, X, Sparkles, Loader2 } from "lucide-react";
import FieldHelp from "./FieldHelp";
import { db } from "../../../lib/db";
import { extractThpProfileFromProntuario } from "../../../services/geminiService";
import { toast } from "react-hot-toast";

// Helper to decode Base64 strings handling UTF-8 (and special characters like accents) correctly
function decodeBase64Utf8(base64Str: string): string {
  try {
    const binaryString = atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (err) {
    try {
      return decodeURIComponent(escape(atob(base64Str)));
    } catch (e) {
      return atob(base64Str);
    }
  }
}

// Helper to remove HTML tags, CSS styles, script tags, and decode common entities
function cleanHtmlText(htmlStr: string): string {
  let text = htmlStr;
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<[^>]*>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text.replace(/\s+/g, " ").trim();
}

interface PatientSelectorProps {
  patients: Patient[];
  activePatientId: string;
  onSelectPatient: (id: string) => void;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export default function PatientSelector({
  patients,
  activePatientId,
  onSelectPatient,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient
}: PatientSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(30);
  const [profession, setProfession] = useState("");
  const [clinicalQueixa, setClinicalQueixa] = useState("");
  const [establishingOperations, setEstablishingOperations] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<EarlyNeed[]>([]);
  const [selectedSchemas, setSelectedSchemas] = useState<SchemaEID[]>([]);
  const [copingStyle, setCopingStyle] = useState<CopingStyle>(CopingStyle.Evitacao);
  const [copingBehaviorsStr, setCopingBehaviorsStr] = useState("");
  const [coreBeliefsStr, setCoreBeliefsStr] = useState("");
  const [intermediateBeliefsStr, setIntermediateBeliefsStr] = useState("");
  const [automaticThoughtsStr, setAutomaticThoughtsStr] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  const activePatient = patients.find(p => p.id === activePatientId);

  const handleGenerateAiProfile = async () => {
    if (!activePatient) return;
    setIsGenerating(true);
    try {
      // 1. Load the prontuario from IndexedDB
      const prontuario = await db.prontuarios.get(activePatient.id);
      
      // 2. Compile all available text data from the patient's chart
      let textData = "";
      if (prontuario) {
        if (prontuario.anamneseData) {
          textData += "=== DADOS DE ANAMNESE ===\n";
          textData += JSON.stringify(prontuario.anamneseData, null, 2) + "\n\n";
        }
        if (prontuario.longitudinalProfile) {
          textData += "=== PERFIL LONGITUDINAL ===\n";
          textData += prontuario.longitudinalProfile + "\n\n";
        }
        if (prontuario.entradas && prontuario.entradas.length > 0) {
          textData += "=== EVOLUÇÕES E EXAMES ===\n";
          prontuario.entradas.forEach((e) => {
            textData += `[${e.data}] Tipo: ${e.tipo || 'evolucao'}\nConteúdo: ${e.textoHtml.replace(/<[^>]*>/g, '')}\n---\n`;
          });
        }
      }

      // Also append paciente data
      const paciente = await db.pacientes.get(activePatient.id);
      if (paciente) {
        if (paciente.historicoHtml) {
          textData += "=== HISTÓRICO GERAL ===\n" + paciente.historicoHtml.replace(/<[^>]*>/g, '') + "\n\n";
        }
        if (paciente.psicodiagnosticoHtml) {
          textData += "=== PSICODIAGNÓSTICO ===\n" + paciente.psicodiagnosticoHtml.replace(/<[^>]*>/g, '') + "\n\n";
        }
      }

      // Also append attachments from db.anexos
      try {
        const attachments = await db.anexos.where('ownerId').equals(activePatient.id).toArray();
        if (attachments && attachments.length > 0) {
          let attachmentsText = "";
          for (const att of attachments) {
            if (att.conteudoArquivo) {
              const fileNameLower = (att.nomeArquivo || "").toLowerCase();
              const fileTypeLower = (att.tipoArquivo || "").toLowerCase();
              const isHtml = fileNameLower.endsWith(".html") || fileNameLower.endsWith(".htm") || fileTypeLower.includes("html");
              const isTxt = fileNameLower.endsWith(".txt") || fileNameLower.endsWith(".md") || fileNameLower.endsWith(".csv") || fileNameLower.endsWith(".json") || fileTypeLower.includes("text") || fileTypeLower.includes("json");
              
              if (isHtml || isTxt) {
                try {
                  let fileContent = att.conteudoArquivo;
                  if (fileContent.includes("base64,")) {
                    fileContent = decodeBase64Utf8(fileContent.split("base64,")[1]);
                  } else if (/^[A-Za-z0-9+/=]+$/.test(fileContent.trim()) && fileContent.length % 4 === 0) {
                    fileContent = decodeBase64Utf8(fileContent);
                  }
                  
                  if (isHtml) {
                    fileContent = cleanHtmlText(fileContent);
                  }
                  
                  attachmentsText += `[Arquivo: ${att.nomeArquivo}]\nConteúdo:\n${fileContent}\n---\n`;
                } catch (e) {
                  console.error(`Erro ao processar anexo ${att.nomeArquivo}:`, e);
                }
              }
            }
          }
          if (attachmentsText) {
            textData += "=== ARQUIVOS ANEXADOS ===\n" + attachmentsText + "\n";
          }
        }
      } catch (err) {
        console.error("Erro ao ler anexos para IA:", err);
      }

      if (!textData.trim()) {
        toast.error("O prontuário deste paciente está completamente vazio. Cadastre evoluções, PCI ou preencha a anamnese primeiro.");
        setIsGenerating(false);
        return;
      }

      // 3. Call the AI service to conceptualize the patient case
      const loadingToastId = toast.loading("Analisando prontuário e estruturando perfil de HP...");
      const aiProfile = await extractThpProfileFromProntuario(textData);
      
      // 4. Map returned strings to typed enums
      const mappedNeeds = (aiProfile.neglectedNeeds || []).map((needStr: string) => {
        return Object.values(EarlyNeed).find(n => n.toLowerCase() === needStr.toLowerCase() || needStr.toLowerCase().includes(n.toLowerCase())) || null;
      }).filter(Boolean) as EarlyNeed[];

      const mappedSchemas = (aiProfile.activeSchemas || []).map((schemaStr: string) => {
        return Object.values(SchemaEID).find(s => s.toLowerCase() === schemaStr.toLowerCase() || schemaStr.toLowerCase().includes(s.toLowerCase())) || null;
      }).filter(Boolean) as SchemaEID[];

      let mappedCopingStyle = CopingStyle.Evitacao;
      const copingStr = String(aiProfile.copingStyleSelected || "").toLowerCase();
      if (copingStr.includes("rendição") || copingStr.includes("ceder")) {
        mappedCopingStyle = CopingStyle.Rendicao;
      } else if (copingStr.includes("hipercompensação") || copingStr.includes("contrário") || copingStr.includes("contra")) {
        mappedCopingStyle = CopingStyle.Hipercompensacao;
      }

      // 5. Update patient object
      const updatedPatient: Patient = {
        ...activePatient,
        clinicalQueixa: aiProfile.clinicalQueixa || activePatient.clinicalQueixa,
        establishingOperations: aiProfile.establishingOperations || activePatient.establishingOperations,
        neglectedNeeds: mappedNeeds.length > 0 ? mappedNeeds : activePatient.neglectedNeeds,
        activeSchemas: mappedSchemas.length > 0 ? mappedSchemas : activePatient.activeSchemas,
        beliefs: {
          coreBeliefs: aiProfile.beliefs?.coreBeliefs || activePatient.beliefs.coreBeliefs,
          intermediateBeliefs: aiProfile.beliefs?.intermediateBeliefs || activePatient.beliefs.intermediateBeliefs,
          automaticThoughts: aiProfile.beliefs?.automaticThoughts || activePatient.beliefs.automaticThoughts
        },
        copingStyleSelected: mappedCopingStyle,
        copingBehaviors: aiProfile.copingBehaviors || activePatient.copingBehaviors
      };

      // 6. Define/Sync training periods for newly identified schemas
      const schemaToSkill: Record<SchemaEID, PsychologicalSkill> = {
        [SchemaEID.Fracasso]: PsychologicalSkill.RealismoOtimista,
        [SchemaEID.Abandono]: PsychologicalSkill.AutorregulacaoEmocional,
        [SchemaEID.Desconfianca]: PsychologicalSkill.ImunidadeSocial,
        [SchemaEID.PrivacaoEmocional]: PsychologicalSkill.Autoconhecimento,
        [SchemaEID.Defectividade]: PsychologicalSkill.Autoestima,
        [SchemaEID.IsolamentoSocial]: PsychologicalSkill.Sociabilidade,
        [SchemaEID.Dependencia]: PsychologicalSkill.Autocontrole,
        [SchemaEID.Vulnerabilidade]: PsychologicalSkill.AutorregulacaoEmocional,
        [SchemaEID.Emaranhamento]: PsychologicalSkill.Autoconhecimento,
        [SchemaEID.Grandiosidade]: PsychologicalSkill.SensibilidadeSocial,
        [SchemaEID.AutocontroleInsuficiente]: PsychologicalSkill.Autocontrole,
        [SchemaEID.Subjugacao]: PsychologicalSkill.ResolutividadeEnfrentamento,
        [SchemaEID.AutoSacrificio]: PsychologicalSkill.SensibilidadeSocial,
        [SchemaEID.BuscaAprovacao]: PsychologicalSkill.Autoestima,
        [SchemaEID.Negatividade]: PsychologicalSkill.RealismoOtimista,
        [SchemaEID.InibicaoEmocional]: PsychologicalSkill.Sociabilidade,
        [SchemaEID.PadroesInflexiveis]: PsychologicalSkill.HedonismoResponsavel,
        [SchemaEID.Punitividade]: PsychologicalSkill.SensibilidadeSocial
      };

      if (!updatedPatient.periodization) {
        updatedPatient.periodization = [];
      }
      
      const currentSkills = new Set<PsychologicalSkill>(updatedPatient.periodization.map(p => p.skill));
      updatedPatient.activeSchemas.forEach(schema => {
        const skill = schemaToSkill[schema];
        if (skill && !currentSkills.has(skill)) {
          currentSkills.add(skill);
          updatedPatient.periodization.push({
            id: `p-${Date.now()}-${updatedPatient.periodization.length}`,
            skill,
            title: `Treino Clínico: ${skill}`,
            durationWeeks: 4,
            phase: "Ativo",
            completed: false,
            priority: "Alta",
            exercises: []
          });
        }
      });

      // 7. Save to DB
      await onUpdatePatient(updatedPatient);
      toast.dismiss(loadingToastId);
      toast.success("Conceituação Clínica baseada em evidências gerada com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.dismiss();
      toast.error(`Erro ao conceituar com IA: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startEdition = (patient: Patient) => {
    setName(patient.name);
    setAge(patient.age);
    setProfession(patient.profession);
    setClinicalQueixa(patient.clinicalQueixa);
    setEstablishingOperations(patient.establishingOperations);
    setSelectedNeeds(patient.neglectedNeeds);
    setSelectedSchemas(patient.activeSchemas);
    setCopingStyle(patient.copingStyleSelected);
    setCopingBehaviorsStr(patient.copingBehaviors.join("\n"));
    setCoreBeliefsStr(patient.beliefs.coreBeliefs.join("\n"));
    setIntermediateBeliefsStr(patient.beliefs.intermediateBeliefs.join("\n"));
    setAutomaticThoughtsStr(patient.beliefs.automaticThoughts.join("\n"));
    setIsEditing(true);
    setIsCreating(false);
  };

  const startCreation = () => {
    setName("");
    setAge(30);
    setProfession("");
    setClinicalQueixa("");
    setEstablishingOperations("");
    setSelectedNeeds([]);
    setSelectedSchemas([]);
    setCopingStyle(CopingStyle.Evitacao);
    setCopingBehaviorsStr("");
    setCoreBeliefsStr("");
    setIntermediateBeliefsStr("");
    setAutomaticThoughtsStr("");
    setIsCreating(true);
    setIsEditing(false);
  };

  const savePatient = () => {
    if (!name.trim()) return alert("Insira o nome do paciente");

    const calculatedPatient: Patient = {
      id: isCreating ? `patient-${Date.now()}` : activePatientId,
      name,
      age: Number(age),
      profession,
      clinicalQueixa,
      establishingOperations,
      neglectedNeeds: selectedNeeds,
      activeSchemas: selectedSchemas,
      beliefs: {
        coreBeliefs: coreBeliefsStr.split("\n").filter(line => line.trim()),
        intermediateBeliefs: intermediateBeliefsStr.split("\n").filter(line => line.trim()),
        automaticThoughts: automaticThoughtsStr.split("\n").filter(line => line.trim())
      },
      copingStyleSelected: copingStyle,
      copingBehaviors: copingBehaviorsStr.split("\n").filter(line => line.trim()),
      // Copy over unmodified records if updating, else defaults for new patients
      periodization: isCreating ? [
        {
          id: `p-${Date.now()}-1`,
          skill: activePatient?.periodization[0]?.skill || Object.values(SchemaEID).length > 0 ? Object.values(SchemaEID)[0] as any : "Autoconhecimento" as any,
          title: "Fase 1: Mapeamento Inicial",
          durationWeeks: 2,
          phase: "Aquece",
          completed: false,
          priority: "Média",
          exercises: []
        }
      ] : (activePatient?.periodization || []),
      sessionHistory: isCreating ? [] : (activePatient?.sessionHistory || []),
      level: isCreating ? 1 : (activePatient?.level || 1),
      xp: isCreating ? 0 : (activePatient?.xp || 0),
      streakDays: isCreating ? 1 : (activePatient?.streakDays || 1),
      unlockedBadges: isCreating ? [] : (activePatient?.unlockedBadges || [])
    };

    if (isCreating) {
      onAddPatient(calculatedPatient);
      setIsCreating(false);
    } else {
      onUpdatePatient(calculatedPatient);
      setIsEditing(false);
    }
  };

  const toggleNeed = (need: EarlyNeed) => {
    setSelectedNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const toggleSchema = (schema: SchemaEID) => {
    setSelectedSchemas(prev => 
      prev.includes(schema) ? prev.filter(s => s !== schema) : [...prev, schema]
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja arquivar/deletar este registro de prontuário?")) {
      onDeletePatient(id);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-card p-5 rounded-2xl border border-border-subtle shadow-md">
        <div>
          <h2 className="text-sm font-black text-text-main tracking-wide uppercase">Prontuário de Habilidades Psicológicas (THP)</h2>
          <p className="text-[10px] text-text-dim uppercase tracking-wider font-mono">Mapeador Neuropsicológico e Treinamento Psicoeducativo Integrado</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={activePatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer transition-all"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id} className="bg-bg-card text-text-main">{p.name} ({p.age} anos)</option>
            ))}
          </select>

          <button
            onClick={startCreation}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-bg-deep font-black text-[10px] uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Criar Paciente
          </button>

          {activePatient && (
            <>
              <button
                onClick={() => startEdition(activePatient)}
                className="flex items-center gap-1 px-4 py-2 bg-bg-sidebar border border-border-subtle hover:bg-bg-sidebar/5 text-text-main font-black text-[10px] uppercase tracking-widest rounded-xl transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-primary" />
                Editar Perfil
              </button>

              <button
                onClick={handleGenerateAiProfile}
                disabled={isGenerating}
                className="flex items-center gap-1 px-4 py-2 bg-bg-sidebar border border-primary/20 hover:bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest rounded-xl transition cursor-pointer disabled:opacity-40"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                )}
                Conceituar com IA
              </button>

              <button
                onClick={() => handleDelete(activePatient.id)}
                className="flex items-center gap-1 px-4 py-2 bg-bg-sidebar border border-rose-500/20 hover:bg-rose-500/50/10 text-rose-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode selectors */}
      {(isEditing || isCreating) ? (
        <div className="bg-bg-card rounded-2xl border border-border-subtle shadow-md p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider">
              {isCreating ? "Novo Prontuário de Paciente" : `Editando Prontuário de: ${name}`}
            </h3>
            <button 
              onClick={() => { setIsEditing(false); setIsCreating(false); }}
              className="text-text-dim hover:text-text-main cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identification Area */}
            <div className="space-y-4 bg-bg-sidebar/30 p-4 rounded-xl border border-border-subtle">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-dim font-mono mb-2">1. Identificação Geral</h4>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Nome Completo</span>
                  <FieldHelp 
                    title="Nome do Paciente"
                    suggestion="Fórmulas ou nome real para referenciar na terapia."
                    explanation="Nome demográfico que ampara o endereçamento individualizado e gera o cabeçalho de prontuário biomédico síncrono."
                    example="Ex: Pedro Henrique"
                  />
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-primary transition-all"
                  placeholder="Ex: Pedro Henrique"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                    <span>Idade</span>
                    <FieldHelp 
                      title="Idade Cronológica"
                      suggestion="Idade em números inteiros."
                      explanation="Variável demográfica relevante para calcular fases de maturidade biológica pré-frontal e hormonal correspondente."
                    />
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                    <span>Profissão/Ocupação</span>
                    <FieldHelp 
                      title="Profissão / Ocupação"
                      suggestion="A atividade principal dele atualmente."
                      explanation="Indica o contexto de sobrecarga ocupacional do indivíduo e potenciais estressores executivos."
                      example="Ex: Engenheiro de Software Fullstack"
                    />
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-primary transition-all"
                    placeholder="Ex: Engenheiro"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Queixa Clínica Principal</span>
                  <FieldHelp 
                    title="Queixa Clínica"
                    suggestion="Os sintomas de timidez síncronos e angústias cotidianas."
                    explanation="Expressa a dor do paciente ligando seus estressores cognitivos com as dores periféricas diárias."
                    example="Ex: Palpitações intensas em reuniões, timidez residual gaguejando diante dos chefes."
                  />
                </label>
                <textarea
                  value={clinicalQueixa}
                  onChange={(e) => setClinicalQueixa(e.target.value)}
                  rows={3}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main leading-relaxed outline-none focus:border-primary transition-all resize-none"
                  placeholder="Queixas, reações e comportamentos que causam o sofrimento atual..."
                />
              </div>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Operações Estabelecedoras (Crises/Gatilhos)</span>
                  <FieldHelp 
                    title="Operações Estabelecedoras"
                    suggestion="Gatilhos que elevam temporariamente a fobia social."
                    explanation="Contextos que acionam a ansiedade de forma imediata (ex: auditoria técnica crítica)."
                    example="Ex: Reuniões de feedback surpresa convocadas pela diretoria."
                  />
                </label>
                <textarea
                  value={establishingOperations}
                  onChange={(e) => setEstablishingOperations(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main leading-relaxed outline-none focus:border-primary transition-all resize-none"
                  placeholder="Ex: Prazos inflexíveis de diretores, reuniões de feedback síncronas..."
                />
              </div>
            </div>

            {/* Cognitive mapping Area */}
            <div className="space-y-4 bg-bg-sidebar/30 p-4 rounded-xl border border-border-subtle">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-dim font-mono mb-2">2. Sistema de Crenças Clínico</h4>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Crenças Centrais (Uma por linha)</span>
                  <FieldHelp 
                    title="Crenças Centrais (Core)"
                    suggestion="Ideias fundamentais incondicionais e severas."
                    explanation="Conceitos nucleares estáticos de si, do mundo e dos outros estruturados pelo id."
                    example="Ex: Sou incompetente&#10;Sou fraco"
                  />
                </label>
                <textarea
                  value={coreBeliefsStr}
                  onChange={(e) => setCoreBeliefsStr(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main leading-relaxed font-mono outline-none focus:border-primary transition-all resize-y"
                  placeholder="Ex: Sou incompetente&#10;O mundo é hostil"
                />
              </div>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Crenças Intermediárias/Regras (Uma por linha)</span>
                  <FieldHelp 
                    title="Crenças Intermediárias"
                    suggestion="Regras e suposições condicionais criadas para sobreviver."
                    explanation="Gera a atitude compensatória que tenta esconder a dor das crenças centrais."
                    example="Ex: Se eu falar na reunião, serei criticado e confirmarei que sou uma farsa."
                  />
                </label>
                <textarea
                  value={intermediateBeliefsStr}
                  onChange={(e) => setIntermediateBeliefsStr(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main leading-relaxed font-mono outline-none focus:border-primary transition-all resize-y"
                  placeholder="Ex: Se eu falar na reunião, vão descobrir que sou uma farsa"
                />
              </div>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Pensamentos Automáticos Típicos (Um por linha)</span>
                  <FieldHelp 
                    title="Pensamentos Automáticos"
                    suggestion="Frases rápidas e espontâneas que surgem na mente sob estresse."
                    explanation="Pensamentos imediatos que disparam a ansiedade gaguejante em momentos chave."
                    example="Ex: Vou errar tudo e todos vão rir."
                  />
                </label>
                <textarea
                  value={automaticThoughtsStr}
                  onChange={(e) => setAutomaticThoughtsStr(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main leading-relaxed font-mono outline-none focus:border-primary transition-all resize-y"
                  placeholder="Ex: Não vou dar conta&#10;Eles vão me julgar"
                />
              </div>
            </div>

            {/* Coping & behaviors */}
            <div className="space-y-4 bg-bg-sidebar/30 p-4 rounded-xl border border-border-subtle">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-dim font-mono mb-2">3. Enfrentamento & Deficits</h4>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Estilo de Coping Predominante</span>
                  <FieldHelp 
                    title="Estilo de Coping"
                    suggestion="O padrão adaptativo de defesa psicológica usado."
                    explanation="A atitude central para apaziguar o estresse (Evitação, Rendição ao esquema ou Hipercompensação)."
                  />
                </label>
                <select
                  value={copingStyle}
                  onChange={(e) => setCopingStyle(e.target.value as CopingStyle)}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-primary transition-all cursor-pointer"
                >
                  {Object.values(CopingStyle).map(cs => (
                    <option key={cs} value={cs} className="bg-bg-card text-text-main">{cs}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                  <span>Comportamentos Desadaptativos (Um por linha)</span>
                  <FieldHelp 
                    title="Comportamentos Desadaptativos"
                    suggestion="Hábitos e ações indesejáveis em momentos de timidez."
                    explanation="Comportamentos síncronos de fuga neurótica de Pedro que impedem novas experiências corretivas de sucesso de timidez."
                    example="Ex: Desligar webcam de imediato&#10;Gaguejar e justificar erro alegando conexão instável."
                  />
                </label>
                <textarea
                  value={copingBehaviorsStr}
                  onChange={(e) => setCopingBehaviorsStr(e.target.value)}
                  rows={5}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-xl p-2.5 text-xs text-text-main leading-relaxed font-mono outline-none focus:border-primary transition-all resize-y"
                  placeholder="Ex: Fugir da sala no primeiro questionamento&#10;Evitar olhar nos olhos do chefe"
                />
              </div>
            </div>
          </div>

          {/* Childhood Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-subtle pt-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-dim mb-3">Necessidades Infantis Negligenciadas/Violadas</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2.5 bg-bg-deep rounded-xl border border-border-subtle">
                {Object.values(EarlyNeed).map(need => {
                  const isChecked = selectedNeeds.includes(need);
                  return (
                    <button
                      key={need}
                      type="button"
                      onClick={() => toggleNeed(need)}
                      className={`flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                        isChecked 
                          ? "bg-primary/20 text-primary border-primary/30" 
                          : "bg-bg-sidebar hover:bg-bg-sidebar/5 text-text-dim border-border-subtle"
                      }`}
                    >
                      <span className="truncate">{need}</span>
                      {isChecked && <Check className="w-3 h-3 flex-shrink-0 ml-1 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-dim mb-3">Esquemas Cognitivos Iniciais Disfuncionais (EIDs)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2.5 bg-bg-deep rounded-xl border border-border-subtle">
                {Object.values(SchemaEID).map(schema => {
                  const isChecked = selectedSchemas.includes(schema);
                  return (
                    <button
                      key={schema}
                      type="button"
                      onClick={() => toggleSchema(schema)}
                      className={`flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-[9px] leading-tight font-bold transition-all border cursor-pointer h-10 ${
                        isChecked 
                          ? "bg-primary/20 text-primary border-primary/30" 
                          : "bg-bg-sidebar hover:bg-bg-sidebar/5 text-text-dim border-border-subtle"
                      }`}
                    >
                      <span className="line-clamp-2">{schema}</span>
                      {isChecked && <Check className="w-3 h-3 flex-shrink-0 ml-1 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
            <button
              onClick={() => { setIsEditing(false); setIsCreating(false); }}
              className="px-4 py-2 bg-bg-sidebar hover:bg-bg-sidebar/5 border border-border-subtle text-text-main text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={savePatient}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-hover text-bg-deep text-xs font-black uppercase tracking-widest rounded-xl transition shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Registro
            </button>
          </div>
        </div>
      ) : activePatient ? (
        /* Patient presentation card */
        <div className="bg-bg-card rounded-2xl border border-border-subtle shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3">
          {/* Col 1: Basic Stats & Info */}
          <div className="bg-bg-sidebar/35 p-6 border-r border-border-subtle space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 font-mono text-[8px] uppercase font-bold rounded-md">Ativo</span>
                <span className="text-[10px] text-text-dim font-mono">Registro: #{activePatient.id}</span>
              </div>
              <h3 className="text-lg font-black text-text-main tracking-wide uppercase">{activePatient.name}</h3>
              <p className="text-xs text-text-dim mt-1">{activePatient.age} anos · <span className="italic">{activePatient.profession}</span></p>
            </div>

            <div className="h-px bg-border-subtle" />
            
            {/* Child and development stats */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim font-mono">Déficits Infantis Detectados</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activePatient.neglectedNeeds.map(need => (
                  <span key={need} className="px-2.5 py-1 bg-rose-500/50/10 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {need}
                  </span>
                ))}
                {activePatient.neglectedNeeds.length === 0 && <span className="text-xs text-text-dim">Nenhum registrado.</span>}
              </div>
            </div>

            <div className="h-px bg-border-subtle" />

            {/* Cognitive schemas */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim font-mono">Esquemas Iniciais Ativados (EIDs)</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activePatient.activeSchemas.map(schema => (
                  <span key={schema} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {schema}
                  </span>
                ))}
                {activePatient.activeSchemas.length === 0 && <span className="text-xs text-text-dim">Nenhum registrado.</span>}
              </div>
            </div>
          </div>

          {/* Col 2: The Core clinical Complaint & context */}
          <div className="p-6 md:col-span-2 space-y-5">
            <div>
              <h4 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-text-dim font-mono mb-2">
                <Info className="w-3.5 h-3.5 text-primary" /> Queixa Clínica e Contextualização
              </h4>
              <p className="text-text-main text-xs leading-relaxed bg-bg-sidebar/50 p-4 rounded-xl border border-border-subtle">
                {activePatient.clinicalQueixa}
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-text-dim font-mono mb-2">Operações Estabelecedoras Atuais</h4>
              <p className="text-text-dim text-xs leading-relaxed font-mono">
                {activePatient.establishingOperations || "Nenhum histórico ambiental registrado."}
              </p>
            </div>

            <div className="h-px bg-border-subtle" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-bg-sidebar/40 rounded-xl border border-border-subtle">
                <h5 className="font-bold text-text-main text-[10px] uppercase font-mono mb-2">Padrão de Coping</h5>
                <div className="text-xs font-semibold text-primary mb-2">{activePatient.copingStyleSelected}</div>
                <div className="text-[10px] text-text-dim uppercase tracking-wider font-bold">Comportamentos de Evitação/Rendição:</div>
                <ul className="list-disc list-inside text-xs text-text-main mt-1.5 space-y-1">
                  {activePatient.copingBehaviors.map((beh, idx) => (
                    <li key={idx}>{beh}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-bg-sidebar/40 rounded-xl border border-border-subtle">
                <h5 className="font-bold text-text-main text-[10px] uppercase font-mono mb-2">Cognição Profunda (Crenças Centrais)</h5>
                <ul className="list-disc list-inside text-xs text-text-main space-y-1.5">
                  {activePatient.beliefs.coreBeliefs.map((cb, idx) => (
                    <li key={idx} className="font-mono italic">"{cb}"</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-bg-card text-center p-12 rounded-2xl border border-border-subtle shadow-md">
          <p className="text-text-dim text-xs">Nenhum paciente selecionado ou cadastrado.</p>
          <button 
            onClick={startCreation} 
            className="mt-4 px-5 py-2.5 bg-primary text-bg-deep font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary-hover transition cursor-pointer"
          >
            Adicionar Primeiro Paciente
          </button>
        </div>
      )}
    </div>
  );
}
