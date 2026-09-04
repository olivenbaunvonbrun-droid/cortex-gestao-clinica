import React from 'react';
import { motion } from 'motion/react';
import { User, Zap, AlertTriangle, Calendar, Activity, Clock, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { renderMarkdown } from '../BibliotecaAvaliacao/utils/markdown';
import { SCHEMA_DETAILS, YSQ_QUESTIONS } from '../YsqSmartAi/types';

// ==========================================
// 1. IHS RESULT VIEWER
// ==========================================

interface IhsResultViewerProps {
  assessment?: {
    answers?: Record<number, any>;
    patient?: {
      name: string;
      age: string;
      psychologistName: string;
      crp: string;
    };
    aiAnalysis?: string;
    createdAt?: string;
  };
}

export function IhsResultViewer({ assessment }: IhsResultViewerProps) {
  if (!assessment) {
    return (
      <div className="p-8 text-center bg-bg-card border border-border-subtle rounded-3xl">
        <p className="text-xs font-black uppercase text-text-dim tracking-widest">Nenhum dado do IHS disponível.</p>
      </div>
    );
  }

  const calculateFactorScore = (itemIds: number[]) => {
    const answers = assessment.answers || {};
    let rawScore = 0;
    const scoreMap: Record<string, number> = {
      'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4,
    };

    const invertedItems = new Set([2, 8, 9, 13, 17, 18, 19, 22, 23, 24, 25, 26, 33, 34, 36, 37, 39, 41, 42]);

    itemIds.forEach(id => {
      const ans = answers[id];
      if (ans) {
        const value = scoreMap[ans] !== undefined ? scoreMap[ans] : (Number(ans) || 0);
        if (invertedItems.has(id)) {
          rawScore += (4 - value);
        } else {
          rawScore += value;
        }
      }
    });

    return Math.round((rawScore / (itemIds.length * 4)) * 100);
  };

  const factorData = [
    { factor: 'Enfrentamento', score: calculateFactorScore([15, 18, 21, 27, 30, 31, 33, 34, 38, 40]) },
    { factor: 'Positividade', score: calculateFactorScore([3, 6, 10, 20, 28, 32, 35]) },
    { factor: 'Conversação', score: calculateFactorScore([1, 4, 5, 7, 11, 12, 14, 16, 29, 39]) },
    { factor: 'Autoexposição', score: calculateFactorScore([9, 13, 19, 23, 26, 36, 37]) },
    { factor: 'Autocontrole', score: calculateFactorScore([2, 8, 17, 22, 24, 25, 41, 42]) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 text-text-main font-sans max-h-[550px] overflow-y-auto pr-2">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">
        {/* Identificação */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-3">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
            <User size={12} className="text-primary" /> Ficha de Identificação
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider block">Avaliando</span>
              <span className="font-bold text-text-main truncate block">{assessment.patient?.name || 'N/D'}</span>
            </div>
            <div>
              <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider block">Idade</span>
              <span className="font-bold text-text-main block">{assessment.patient?.age ? `${assessment.patient.age} anos` : 'N/D'}</span>
            </div>
            <div className="col-span-2 border-t border-border-subtle/50 pt-2 mt-1">
              <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider block">Profissional</span>
              <span className="font-bold text-text-main block">{assessment.patient?.psychologistName || 'N/D'} (CRP: {assessment.patient?.crp || 'N/D'})</span>
            </div>
          </div>
        </div>

        {/* Análise Quantitativa / Gráfico */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2 mb-4">
            <Zap size={12} className="text-primary" /> Análise Quantitativa
          </h3>
          <div className="h-[180px] w-full mb-4 relative flex items-center justify-center">
            <ResponsiveContainer width="99%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={factorData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 7, fill: '#adb5bd', fontWeight: 900, letterSpacing: '0.05em' }} />
                <Radar
                  name="Percentil"
                  dataKey="score"
                  stroke="#4dabf7"
                  fill="#4dabf7"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {factorData.map(f => (
              <div key={f.factor} className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                  <span className="text-text-dim">{f.factor}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px]",
                    f.score > 70 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : f.score > 40 
                        ? "bg-text-dim/5 text-text-dim border border-border-subtle" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  )}>{f.score}%</span>
                </div>
                <div className="h-1.5 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${f.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-7">
        <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-lg space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-primary">Inventário de Habilidades Sociais (IHS-2)</h2>
            <p className="italic text-text-dim text-[9px] uppercase font-bold tracking-wider mt-0.5">Relatório Técnico Clinicamente Estruturado</p>
          </div>
          <div className="text-xs leading-relaxed max-w-none text-justify font-sans space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {assessment.aiAnalysis ? (
              renderMarkdown(assessment.aiAnalysis)
            ) : (
              <span className="text-text-dim/40 italic">Sem análise de inteligência artificial cadastrada.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. YSQ RESULT VIEWER
// ==========================================

interface YsqResultViewerProps {
  assessment?: {
    answers?: Record<number, any>;
    patient?: {
      name: string;
      age: string;
      psychologistName: string;
      crp: string;
    };
    aiAnalysis?: string;
    createdAt?: string;
  };
}

export function YsqResultViewer({ assessment }: YsqResultViewerProps) {
  if (!assessment) {
    return (
      <div className="p-8 text-center bg-bg-card border border-border-subtle rounded-3xl">
        <p className="text-xs font-black uppercase text-text-dim tracking-widest">Nenhum dado do YSQ disponível.</p>
      </div>
    );
  }

  const answers = assessment.answers || {};
  const schemaSums: Record<string, number> = {};
  const schemaCounts: Record<string, number> = {};

  YSQ_QUESTIONS.forEach(q => {
    const val = Number(answers[q.id]) || 1;
    schemaSums[q.schemaKey] = (schemaSums[q.schemaKey] || 0) + val;
    schemaCounts[q.schemaKey] = (schemaCounts[q.schemaKey] || 0) + 1;
  });

  const schemaScores = Object.entries(SCHEMA_DETAILS).map(([key, info]) => {
    const score = (schemaSums[key] || 0) / (schemaCounts[key] || 5);
    return {
      key,
      name: info.name,
      domain: info.domain,
      score,
      description: info.description
    };
  });

  const domainGroups = [
    { name: 'Desconexão', schemas: ['ED', 'AB', 'MA', 'SI', 'DS'] },
    { name: 'Autonomia', schemas: ['FA', 'DI', 'VH', 'EM'] },
    { name: 'Limites', schemas: ['ET', 'IS'] },
    { name: 'Orientação', schemas: ['SB', 'SS', 'AS'] },
    { name: 'Supervigilância', schemas: ['NP', 'EI', 'US', 'PU'] }
  ];

  const domainData = domainGroups.map(d => {
    const schemasInDomain = schemaScores.filter(s => d.schemas.includes(s.key));
    const sum = schemasInDomain.reduce((acc, curr) => acc + curr.score, 0);
    const avg = sum / (schemasInDomain.length || 1);
    const percent = Math.round(((avg - 1) / 5) * 100);
    return {
      domain: d.name,
      score: percent,
      avgScore: avg
    };
  });

  const activeSchemas = schemaScores
    .filter(s => s.score >= 4.0)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 text-text-main font-sans max-h-[550px] overflow-y-auto pr-2">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">
        {/* Identificação */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-3">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
            <User size={12} className="text-primary" /> Ficha de Identificação
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider block">Avaliando</span>
              <span className="font-bold text-text-main truncate block">{assessment.patient?.name || 'N/D'}</span>
            </div>
            <div>
              <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-wider block">Idade</span>
              <span className="font-bold text-text-main block">{assessment.patient?.age ? `${assessment.patient.age} anos` : 'N/D'}</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Radar de Domínios */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2 mb-4">
            <Zap size={12} className="text-primary" /> Ativação dos Domínios
          </h3>
          <div className="h-[180px] w-full mb-4 relative flex items-center justify-center">
            <ResponsiveContainer width="99%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={domainData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 7, fill: '#adb5bd', fontWeight: 900, letterSpacing: '0.05em' }} />
                <Radar
                  name="Ativação"
                  dataKey="score"
                  stroke="#a78bfa"
                  fill="#a78bfa"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {domainData.map(d => (
              <div key={d.domain} className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                  <span className="text-text-dim">{d.domain}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px]",
                    d.avgScore >= 4.0 
                      ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                      : d.avgScore >= 3.0 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  )}>{d.avgScore.toFixed(1)} / 6.0</span>
                </div>
                <div className="h-1.5 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Esquemas Ativos */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-4">
          <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
            <AlertTriangle size={12} className="text-red-400 animate-pulse" /> Esquemas Clínicos Ativos (Média &ge; 4.0)
          </h3>
          {activeSchemas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
              {activeSchemas.map(s => (
                <div key={s.key} className="p-3 bg-bg-sidebar/40 border border-border-subtle rounded-xl space-y-1 hover:border-red-500/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-text-main uppercase truncate max-w-[80%]">{s.name}</span>
                    <span className="px-1.5 py-0.2 bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-black rounded">{s.score.toFixed(1)}</span>
                  </div>
                  <span className="text-[8px] text-text-dim uppercase tracking-wider block font-bold">{s.domain}</span>
                  <p className="text-[10px] text-text-dim/80 leading-relaxed font-medium line-clamp-2">{s.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center bg-bg-sidebar/20 rounded-xl border border-dashed border-border-subtle">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Nenhum esquema clínico ativo detectado.</span>
            </div>
          )}
        </div>

        {/* Laudo Completo */}
        <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-lg space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-purple-400">Questionário de Esquemas de Young (YSQ-S3)</h2>
            <p className="italic text-text-dim text-[9px] uppercase font-bold tracking-wider mt-0.5">Laudo Técnico Informatizado e Análise do Perfil Esquemático</p>
          </div>
          <div className="text-xs leading-relaxed max-w-none text-justify font-sans space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {assessment.aiAnalysis ? (
              renderMarkdown(assessment.aiAnalysis)
            ) : (
              <span className="text-text-dim/40 italic">Sem análise de inteligência artificial cadastrada.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. RID RESULT VIEWER
// ==========================================

interface RidResultViewerProps {
  entry?: {
    date?: string;
    patientName?: string;
    patientAge?: string;
    situacao: string;
    necessidade?: string[];
    esquema?: string[];
    pensamento?: string;
    emocao?: {
      name: string;
      intensity: number;
    };
    comportamento?: string;
    consequenciasCurtoPrazo?: string;
    consequenciasLongoPrazo?: string;
    analysis?: string;
  };
}

export function RidResultViewer({ entry }: RidResultViewerProps) {
  if (!entry) {
    return (
      <div className="p-8 text-center bg-bg-card border border-border-subtle rounded-3xl">
        <p className="text-xs font-black uppercase text-text-dim tracking-widest">Nenhum dado do RID disponível.</p>
      </div>
    );
  }

  const dateString = entry.date ? new Date(entry.date).toLocaleDateString('pt-BR') : 'Sem data';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 text-text-main font-sans max-h-[550px] overflow-y-auto pr-2">
      {/* Left Column - Struct Data */}
      <div className="lg:col-span-5 space-y-6">
        {/* Identificação Básica */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-2">
          <div className="flex justify-between items-center border-b border-border-subtle pb-2">
            <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[8px] font-black uppercase tracking-wider">
              REGISTRO DE PENSAMENTOS
            </span>
            <span className="text-[9px] font-black text-text-dim uppercase flex items-center gap-1">
              <Calendar size={10} /> {dateString}
            </span>
          </div>
          <div className="text-xs grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[8px] text-text-dim/60 font-black uppercase block">Paciente</span>
              <span className="font-bold text-text-main block truncate">{entry.patientName || 'N/D'}</span>
            </div>
            <div>
              <span className="text-[8px] text-text-dim/60 font-black uppercase block">Idade</span>
              <span className="font-bold text-text-main block">{entry.patientAge ? `${entry.patientAge} anos` : 'N/D'}</span>
            </div>
          </div>
        </div>

        {/* Registro Clínico */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-4">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
            <Activity size={12} className="text-primary" /> Mapeamento Cognitivo
          </h3>
          
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block">Gatilho / Situação</span>
              <p className="text-text-main font-semibold leading-relaxed bg-bg-sidebar/50 p-2.5 rounded-xl border border-border-subtle/50">{entry.situacao}</p>
            </div>

            {entry.emocao && (
              <div className="grid grid-cols-2 gap-4 bg-bg-sidebar/30 p-2.5 rounded-xl border border-border-subtle/40">
                <div>
                  <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block mb-0.5">Emoção Ativada</span>
                  <span className="font-black text-text-main text-xs uppercase">{entry.emocao.name}</span>
                </div>
                <div>
                  <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block mb-0.5">Intensidade</span>
                  <span className="font-black text-primary text-xs">{entry.emocao.intensity}%</span>
                </div>
              </div>
            )}

            {entry.pensamento && (
              <div className="space-y-1">
                <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block">Pensamento Automático</span>
                <p className="text-text-main/90 font-medium leading-relaxed italic bg-bg-sidebar/50 p-2.5 rounded-xl border border-border-subtle/50">
                  &ldquo;{entry.pensamento}&rdquo;
                </p>
              </div>
            )}

            {entry.comportamento && (
              <div className="space-y-1">
                <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block">Comportamento (Resposta)</span>
                <p className="text-text-main/90 font-medium leading-relaxed bg-bg-sidebar/50 p-2.5 rounded-xl border border-border-subtle/50">{entry.comportamento}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Clincal Mapping and AI Report */}
      <div className="lg:col-span-7 space-y-6">
        {/* Clincal Badges */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-4">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
            <ShieldAlert size={12} className="text-amber-500 animate-pulse" /> Ativações Terapêuticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block">Necessidades Negligenciadas</span>
              <div className="flex flex-wrap gap-1">
                {entry.necessidade && entry.necessidade.length > 0 ? (
                  entry.necessidade.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[9px] font-bold uppercase">
                      {n}
                    </span>
                  ))
                ) : (
                  <span className="text-text-dim/30 italic text-[10px]">Nenhuma cadastrada</span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block">Esquemas Ativos</span>
              <div className="flex flex-wrap gap-1">
                {entry.esquema && entry.esquema.length > 0 ? (
                  entry.esquema.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-bold uppercase">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-text-dim/30 italic text-[10px]">Nenhum cadastrado</span>
                )}
              </div>
            </div>
          </div>
          {/* Consequences */}
          {(entry.consequenciasCurtoPrazo || entry.consequenciasLongoPrazo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border-subtle/50 text-[11px] leading-relaxed">
              {entry.consequenciasCurtoPrazo && (
                <div className="bg-bg-sidebar/30 p-2.5 rounded-xl border border-border-subtle/30">
                  <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block mb-1">Impacto a Curto Prazo</span>
                  <p className="text-text-main/95 font-medium">{entry.consequenciasCurtoPrazo}</p>
                </div>
              )}
              {entry.consequenciasLongoPrazo && (
                <div className="bg-bg-sidebar/30 p-2.5 rounded-xl border border-border-subtle/30">
                  <span className="text-[8px] text-text-dim font-black uppercase tracking-widest block mb-1">Impacto a Longo Prazo</span>
                  <p className="text-text-main/95 font-medium">{entry.consequenciasLongoPrazo}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Restructure Analysis */}
        <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-lg space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400">Síntese de Reestruturação (Gemini AI)</h2>
            <p className="italic text-text-dim text-[9px] uppercase font-bold tracking-wider mt-0.5">Análise Clínica e Alternativas Cognitivo-Comportamentais</p>
          </div>
          <div className="text-xs leading-relaxed max-w-none text-justify font-sans space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {entry.analysis ? (
              renderMarkdown(entry.analysis)
            ) : (
              <span className="text-text-dim/40 italic">Sem análise de inteligência artificial gerada para este registro.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. THP RESULT VIEWER
// ==========================================

interface ThpResultViewerProps {
  record?: {
    skillName?: string;
    skillDescription?: string;
    currentLevel?: number;
    targetLevel?: number;
    createdAt?: string;
    exercises?: {
      id: string;
      text: string;
      completed: boolean;
      notes?: string;
    }[];
    sessions?: {
      date: string;
      duration: number;
      difficulty: number;
      description: string;
      achievements?: string;
      obstacles?: string;
      strategy?: string;
    }[];
    aiAnalysis?: string;
    patient?: {
      name: string;
      age: number;
      psychologistName: string;
      crp: string;
    };
  };
}

export function ThpResultViewer({ record }: ThpResultViewerProps) {
  if (!record) {
    return (
      <div className="p-8 text-center bg-bg-card border border-border-subtle rounded-3xl">
        <p className="text-xs font-black uppercase text-text-dim tracking-widest">Nenhum dado do THP disponível.</p>
      </div>
    );
  }

  const totalExercises = record.exercises?.length || 0;
  const completedExercises = record.exercises?.filter(e => e.completed).length || 0;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const totalDuration = record.sessions?.reduce((acc, s) => acc + s.duration, 0) || 0;
  const dateString = record.createdAt ? new Date(record.createdAt).toLocaleDateString('pt-BR') : 'Sem data';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 text-text-main font-sans max-h-[550px] overflow-y-auto pr-2">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">
        {/* Identificação */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-3">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
            <User size={12} className="text-[#10b981]" /> Identificação Geral (THP)
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[8px] text-text-dim/60 font-black uppercase block">Paciente</span>
              <span className="font-bold text-text-main block truncate">{record.patient?.name || 'N/D'}</span>
            </div>
            <div>
              <span className="text-[8px] text-text-dim/60 font-black uppercase block">Idade</span>
              <span className="font-bold text-text-main block">{record.patient?.age ? `${record.patient.age} Anos` : 'N/D'}</span>
            </div>
            <div className="col-span-2 border-t border-border-subtle/50 pt-2">
              <span className="text-[8px] text-text-dim/60 font-black uppercase block">Habilidade Alvo</span>
              <span className="font-black text-[#10b981] uppercase block text-[13px]">{record.skillName || 'N/D'}</span>
              <p className="text-[10px] text-text-dim/80 leading-relaxed font-medium mt-0.5">{record.skillDescription || ''}</p>
            </div>
          </div>
        </div>

        {/* Progresso e Estatísticas */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-4">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
            <Zap size={12} className="text-[#10b981]" /> Métricas Clínicas
          </h3>
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-bg-sidebar/55 p-3 border border-border-subtle/50 rounded-xl">
              <span className="text-lg font-black text-emerald-400 block">{record.currentLevel}%</span>
              <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Nível Atual</span>
            </div>
            <div className="bg-bg-sidebar/55 p-3 border border-border-subtle/50 rounded-xl">
              <span className="text-lg font-black text-[#10b981] block">{record.targetLevel}%</span>
              <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Nível Alvo</span>
            </div>
            <div className="bg-bg-sidebar/55 p-3 border border-border-subtle/50 rounded-xl">
              <span className="text-lg font-black text-primary block">{record.sessions?.length || 0}</span>
              <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Sessões Realizadas</span>
            </div>
            <div className="bg-bg-sidebar/55 p-3 border border-border-subtle/50 rounded-xl">
              <span className="text-lg font-black text-purple-400 block">{totalDuration} min</span>
              <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Tempo de Treino</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider">
              <span className="text-text-dim">Progresso de Exercícios</span>
              <span className="text-emerald-400">{completedExercises} / {totalExercises} ({progressPercent}%)</span>
            </div>
            <div className="h-2 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Exercícios */}
        {record.exercises && record.exercises.length > 0 && (
          <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-3">
            <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest flex items-center gap-2 border-b border-border-subtle pb-2">
              <CheckCircle2 size={12} className="text-[#10b981]" /> Exercícios Prescritos
            </h3>
            <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
              {record.exercises.map((e, idx) => (
                <div key={idx} className="flex items-start justify-between bg-bg-sidebar/35 p-2.5 rounded-xl border border-border-subtle/40 text-xs">
                  <div className="space-y-0.5 max-w-[80%]">
                    <span className="font-bold text-text-main block leading-snug">{e.text}</span>
                    {e.notes && <p className="text-[10px] text-text-dim font-medium leading-relaxed">{e.notes}</p>}
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                    e.completed 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {e.completed ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Supervision Report */}
        <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-lg space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#10b981]">Análise Interpretativa por IA</h2>
            <p className="italic text-text-dim text-[9px] uppercase font-bold tracking-wider mt-0.5">Supervisão Clínica do Treino de Habilidades Psicológicas</p>
          </div>
          <div className="text-xs leading-relaxed max-w-none text-justify font-sans space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {record.aiAnalysis ? (
              renderMarkdown(record.aiAnalysis)
            ) : (
              <span className="text-text-dim/40 italic">Sem supervisão clínica de inteligência artificial gerada.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. TDAH RESULT VIEWER
// ==========================================

interface TdahResultViewerProps {
  assessment?: {
    answers?: Record<number, any>;
    patient?: {
      name: string;
      age: string;
      psychologistName: string;
      crp: string;
    };
    aiAnalysis?: string;
    createdAt?: string;
  };
}

export function TdahResultViewer({ assessment }: TdahResultViewerProps) {
  if (!assessment) {
    return (
      <div className="p-8 text-center bg-bg-card border border-border-subtle rounded-3xl">
        <p className="text-xs font-black uppercase text-text-dim tracking-widest">Nenhum dado de TDAH disponível.</p>
      </div>
    );
  }

  const answers = assessment.answers || {};
  let partAScore = 0;
  let partASignificant = 0;
  for (let i = 1; i <= 9; i++) {
    const val = Number(answers[i]) || 0;
    partAScore += val;
    if (val >= 2) partASignificant++;
  }

  let partBScore = 0;
  let partBSignificant = 0;
  for (let i = 10; i <= 18; i++) {
    const val = Number(answers[i]) || 0;
    partBScore += val;
    if (val >= 2) partBSignificant++;
  }

  const totalScore = partAScore + partBScore;
  const totalSignificant = partASignificant + partBSignificant;
  const thresholdMetA = partASignificant >= 4;
  const thresholdMetB = partBSignificant >= 4;

  let classification = 'Não Sugestivo de TDAH';
  let riskLevel = 'Baixa Probabilidade';
  if (thresholdMetA && thresholdMetB) {
    classification = 'TDAH - Tipo Combinado';
    riskLevel = 'Alta Probabilidade';
  } else if (thresholdMetA) {
    classification = 'TDAH - Tipo Predomínio Desatento';
    riskLevel = 'Alta Probabilidade';
  } else if (thresholdMetB) {
    classification = 'TDAH - Tipo Predomínio Hiperativo/Impulsivo';
    riskLevel = 'Alta Probabilidade';
  } else if (partASignificant >= 2 || partBSignificant >= 2 || totalScore >= 18) {
    classification = 'Sintomas Subclínicos';
    riskLevel = 'Moderada';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full font-sans">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={13} /> Escala TDAH (ASRS-18)
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border",
              riskLevel === 'Alta Probabilidade' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}>
              {riskLevel}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-black text-text-main">{classification}</h4>
            <p className="text-[10px] text-text-dim mt-0.5">Escore Global: {totalScore}/54 pts • {totalSignificant}/18 sintomas frequentes</p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="p-2.5 bg-bg-sidebar/40 rounded-xl border border-border-subtle/50 text-xs flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase text-text-dim block">Parte A: Desatenção</span>
                <span className="font-bold text-text-main">{partAScore}/27 pts ({partASignificant}/9 sintomas)</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[8.5px] font-black uppercase border",
                thresholdMetA ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-bg-card text-text-dim border-border-subtle"
              )}>
                {thresholdMetA ? 'Critério Positivo' : 'Abaixo do Limiar'}
              </span>
            </div>

            <div className="p-2.5 bg-bg-sidebar/40 rounded-xl border border-border-subtle/50 text-xs flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase text-text-dim block">Parte B: Hiperatividade</span>
                <span className="font-bold text-text-main">{partBScore}/27 pts ({partBSignificant}/9 sintomas)</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[8.5px] font-black uppercase border",
                thresholdMetB ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-bg-card text-text-dim border-border-subtle"
              )}>
                {thresholdMetB ? 'Critério Positivo' : 'Abaixo do Limiar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-lg space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">Parecer Clínico Interpretativo (IA)</h2>
            <p className="italic text-text-dim text-[9px] uppercase font-bold tracking-wider mt-0.5">ASRS-18 v1.1 OMS • Diretrizes CFP nº 06/2019</p>
          </div>
          <div className="text-xs leading-relaxed max-w-none text-justify font-sans space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {assessment.aiAnalysis ? (
              renderMarkdown(assessment.aiAnalysis)
            ) : (
              <span className="text-text-dim/40 italic">Sem laudo interpretativo de IA gerado.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

