import React, { useState } from 'react';
import { TdahEcosystemAssessment, LaudoTdahIntegrativo } from '../types';
import { evaluateDsm5Criteria } from '../lib/scoring';
import { exportTdahEcosystemToHtml } from '../utils/export';
import { analyzeTdahEcosystemAssessment } from '../../../services/geminiService';
import { 
  FileText, 
  Sparkles, 
  Save, 
  Printer, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Check,
  Send,
  Zap
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

interface StageLaudoViewProps {
  assessment: TdahEcosystemAssessment;
  onUpdateLaudo: (laudo: LaudoTdahIntegrativo) => void;
  onSaveToProntuario: () => void;
  isSaving?: boolean;
}

export default function StageLaudoView({
  assessment,
  onUpdateLaudo,
  onSaveToProntuario,
  isSaving = false
}: StageLaudoViewProps) {
  const dsm5 = evaluateDsm5Criteria(assessment);
  const p = assessment.patientInfo;

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize or read current report draft
  const [reportText, setReportText] = useState<string>(() => {
    if (assessment.laudoData?.aiAssistedSynthesis) {
      return assessment.laudoData.aiAssistedSynthesis;
    }
    return `LAUDO PSICOLÓGICO CLÍNICO
(Conforme Resolução CFP nº 06/2019)

I. IDENTIFICAÇÃO
Nome: ${p.name || '[Nome do Paciente]'}
Idade: ${p.age || '[Idade]'}
Escolaridade: ${p.education || 'Não informada'}
Profissão: ${p.profession || 'Não informada'}
Finalidade: Avaliação psicológica pericial/clínica e investigação diagnóstica de TDAH em adultos.
Psicólogo(a) Responsável: ${p.psychologistName || 'Psicólogo(a)'} - CRP: ${p.crp || '00/00000'}

II. DESCRIÇÃO DA DEMANDA
O avaliando buscou o serviço em razão de queixas atencionais crônicas, episódios frequentes de procrastinação, dificuldade na gestão do tempo e desorganização da rotina, com prejuízos funcionais acumulados no âmbito profissional e acadêmico.

III. PROCEDIMENTOS UTILIZADOS
1. ASRS-18 (Adult ADHD Self-Report Scale - OMS): Triagem sintomatológica inicial.
2. Anamnese Retrospectiva da Infância (< 12 anos): Investigação do desenvolvimento psicomotor, histórico escolar e familiar.
3. ETDAH-AD (Escala de TDAH em Adultos): Mensuração dos fatores Desatenção, Impulsividade, Aspectos Emocionais, Autorregulação e Hiperatividade.
4. EPF-TDAH (Escala de Prejuízos Funcionais): Mensuração de prejuízos em 9 domínios da vida adulta.
5. BDEFS (Barkley Deficits in Executive Functioning Scale): Avaliação de disfunções executivas e Índice FE-TDAH.
6. Heterorrelato: Triangulação de dados com informante próximo.
7. Entrevista Clínica Estruturada para Diagnósticos Diferenciais (DSM-5-TR / CID-11).

IV. ANÁLISE DOS RESULTADOS
- Triagem (ASRS-18): ${assessment.asrsData ? `${assessment.asrsData.partASignificant} sintomas significativos na Parte A.` : 'Etapa pendente.'}
- Sintomas (ETDAH-AD): ${assessment.etdahData ? `Escore Total: ${assessment.etdahData.totalScore} pontos (${assessment.etdahData.overallClassification}).` : 'Etapa pendente.'}
- Prejuízo Funcional (EPF-TDAH): ${assessment.epfData ? `${assessment.epfData.affectedDomainsCount} contextos com impacto significativo (Nível ${assessment.epfData.overallLevel}). Atende ao critério DSM-5 de múltiplos ambientes.` : 'Etapa pendente.'}
- Funções Executivas (BDEFS): ${assessment.bdefsData ? `Índice FE-TDAH de Barkley: ${assessment.bdefsData.adhdEfIndexScore} pts (${assessment.bdefsData.adhdEfIndexRisk}).` : 'Etapa pendente.'}
- Histórico Retrospectivo: ${assessment.anamneseData?.marcosDesenvolvimento?.desempenhoAcademicoInfancia || 'Histórico de esforço compensatório na infância documentado.'}

V. CONCLUSÃO DIAGNÓSTICA
Com base na triangulação dos achados clínicos, histórico desde a infância e mensuração dos prejuízos cotidianos, os dados ${dsm5.conclusaoGlobal === 'Critérios Plenamente Atendidos' ? 'sustentam a hipótese diagnóstica de Transtorno do Déficit de Atenção/Hiperatividade em Adultos' : 'indicam sintomatologia a ser correlacionada com fatores contextuais ou comorbidades'}.
Apresentação sugerida: ${dsm5.apresentacaoSugerida}.

VI. ENCAMINHAMENTOS E RECOMENDAÇÕES
1. Encaminhamento a Psiquiatria / Neurologia para avaliação médica e discussão de conduta farmacológica.
2. Continuidade de Psicoterapia Cognitivo-Comportamental voltada para treino de funções executivas e contingências ambientais.
3. Estruturação de rotinas e suportes ergonômicos e atencionais no trabalho e estudos.`;
  });

  const handleGenerateAiReport = async () => {
    try {
      setIsGeneratingAi(true);
      toast.loading('Gerando laudo clínico integrativo com IA...', { id: 'ai-laudo' });

      const asrs = assessment.asrsData;
      const etdah = assessment.etdahData;
      const epf = assessment.epfData;
      const bdefs = assessment.bdefsData;
      const anamnese = assessment.anamneseData;
      const hetero = assessment.heterorrelatoData;
      const diff = assessment.diferenciaisData;

      const aiText = await analyzeTdahEcosystemAssessment(
        {
          name: p.name || 'Paciente',
          age: p.age || '30',
          education: p.education,
          profession: p.profession
        },
        {
          asrsSummary: asrs 
            ? `Parte A: ${asrs.partASignificant}/6 sintomas significativos. Parte B: ${asrs.partBSignificant}/12 sintomas. Classificação: ${asrs.classification}. Triagem ${asrs.thresholdMetA ? 'Positiva' : 'Negativa'}.` 
            : 'ASRS-18 não realizada.',
          anamneseRetrospectiva: anamnese 
            ? `Queixa: ${anamnese.queixaPrincipal}. Marcos: Andar (${anamnese.marcosDesenvolvimento.idadeAndar}), Falar (${anamnese.marcosDesenvolvimento.idadeFalar}), Ler (${anamnese.marcosDesenvolvimento.idadeLer}). Histórico escolar: ${anamnese.marcosDesenvolvimento.desempenhoAcademicoInfancia}. Comportamento escola: ${anamnese.marcosDesenvolvimento.comportamentoEscola}. Estratégias compensatórias: ${anamnese.marcosDesenvolvimento.esforcoCompensatorioOuApoioFamiliar}. Família: ${anamnese.historiaFamiliar.detalhes || 'Sem relato'}.` 
            : 'Anamnese retrospectiva pendente.',
          etdahSummary: etdah 
            ? `Total: ${etdah.totalScore}/${etdah.maxTotalScore} pts. Classificação: ${etdah.overallClassification}. Fatores: ${Object.values(etdah.factors).map(f => `${f.name}: ${f.level} (${f.percentage}%)`).join('; ')}.` 
            : 'ETDAH-AD pendente.',
          epfSummary: epf 
            ? `Total: ${epf.totalScore} pts. Domínios afetados significativamente: ${epf.affectedDomainsCount} de 9. Atende múltiplos contextos: ${epf.meetsDsmMultipleContexts ? 'SIM' : 'NÃO'}. Nível de Prejuízo Geral: ${epf.overallLevel}.` 
            : 'EPF-TDAH pendente.',
          bdefsSummary: bdefs 
            ? `Escore Total: ${bdefs.totalScore}/356 pts. Sintomas de FE marcados: ${bdefs.totalSymptoms}/89. Índice FE-TDAH de Barkley: ${bdefs.adhdEfIndexScore}/44 pts (${bdefs.adhdEfIndexRisk}). Nível Executivo Geral: ${bdefs.overallLevel}.` 
            : 'BDEFS pendente.',
          heterorrelatoSummary: hetero 
            ? `Informante: ${hetero.respondenteNome} (${hetero.grauParentesco}, convivência: ${hetero.tempoConvivio}). Conviveu na infância: ${hetero.conviveuNaInfancia ? 'Sim' : 'Não'}. Concordância com autorrelato: ${hetero.concordanciaGeralComAutorrelato}. Percepção: ${hetero.percepcaoDesatencao || 'Observada desatenção marcante'}.` 
            : 'Heterorrelato não preenchido.',
          diferenciaisSummary: diff 
            ? `Início infância confirmado: ${diff.padraoTemporal.inicioInfanciaConfirmado}. Varia por interesse: ${diff.padraoTemporal.flutuacaoConformeInteresse}. Independente de humor: ${diff.padraoTemporal.independenteDeFaseHumor}. Múltiplos ambientes: ${diff.padraoTemporal.impactoEmMultiplosContextos}. Condições: ${Object.values(diff.items).map(i => `${i.title}: ${i.status}`).join('; ')}.` 
            : 'Diferenciais não mapeados.',
          dsm5ComplianceSummary: `Critério A: ${dsm5.criterioA_Sintomas.detalhes}; Critério B (<12 anos): ${dsm5.criterioB_InicioInfancia.evidencia}; Critério C (≥2 contextos): ${dsm5.criterioC_MultiplosContextos.detalhes}; Critério D (Prejuízo claro): ${dsm5.criterioD_PrejuizoFuncional.detalhes}; Conclusão Geral: ${dsm5.conclusaoGlobal}; Apresentação sugerida: ${dsm5.apresentacaoSugerida}.`
        }
      );

      setReportText(aiText);
      const updatedLaudo: LaudoTdahIntegrativo = {
        identificacao: {
          nome: p.name,
          idade: p.age,
          nascimento: p.birthDate || '',
          documento: '',
          escolaridade: p.education || '',
          profissao: p.profession || '',
          solicitante: 'O Próprio Paciente / Médico Assistente',
          finalidade: 'Avaliação Diagnóstica de TDAH em Adultos',
          dataAvaliacao: new Date().toLocaleDateString('pt-BR'),
          psicologo: p.psychologistName,
          crp: p.crp
        },
        descricaoDemanda: assessment.anamneseData?.queixaPrincipal || '',
        procedimentosUtilizados: ['ASRS-18', 'Anamnese Retrospectiva', 'ETDAH-AD', 'EPF-TDAH', 'BDEFS', 'Heterorrelato', 'Exame Clínico DSM-5-TR'],
        analiseSintomatologica: assessment.etdahData?.overallClassification || '',
        analisePrejuizoFuncional: assessment.epfData?.overallLevel || '',
        analiseFuncoesExecutivas: assessment.bdefsData?.overallLevel || '',
        triangulacaoHeterorrelato: assessment.heterorrelatoData?.concordanciaGeralComAutorrelato || '',
        diagnosticosDiferenciaisEComorbidades: 'Mapeamento temporal concluído',
        criteriosDsm5Fulfillment: {
          desatencaoMet: dsm5.criterioA_Sintomas.desatencaoCount >= 5,
          hiperatividadeMet: dsm5.criterioA_Sintomas.hiperatividadeCount >= 5,
          inicioAntes12: dsm5.criterioB_InicioInfancia.atendido,
          multiplosContextos: dsm5.criterioC_MultiplosContextos.atendido,
          prejuizoFuncionalSignificativo: dsm5.criterioD_PrejuizoFuncional.atendido,
          exclusaoOutrasCausas: dsm5.criterioE_Diferencial.atendido,
          apresentacaoSugerida: dsm5.apresentacaoSugerida as any
        },
        conclusaoDiagnostica: `Hipótese diagnóstica de TDAH em adultos - Apresentação ${dsm5.apresentacaoSugerida}`,
        encaminhamentosEOrientacoes: ['Avaliação médica (psiquiatria/neurologia)', 'Psicoterapia Cognitivo-Comportamental'],
        aiAssistedSynthesis: aiText,
        completedAt: new Date().toISOString()
      };
      onUpdateLaudo(updatedLaudo);

      toast.success('Laudo CFP elaborado com sucesso pela IA!', { id: 'ai-laudo' });
    } catch (err: any) {
      console.error('Erro na IA do laudo:', err);
      toast.error('Não foi possível gerar com IA. Você pode editar o texto manualmente.', { id: 'ai-laudo' });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSimulate = () => {
    const simulatedText = `LAUDO PSICOLÓGICO CLÍNICO
(Elaborado em conformidade estrita com a Resolução CFP nº 06/2019)

I. IDENTIFICAÇÃO
Nome do Avaliando: ${p.name || 'Pedro Henrique Albuquerque'}
Data de Nascimento: ${p.age ? `Aprox. ${new Date().getFullYear() - parseInt(p.age)}` : '14/05/1992'} (Idade: ${p.age || '32 anos'})
Escolaridade: ${p.education || 'Ensino Superior Completo'}
Profissão: ${p.profession || 'Engenheiro de Software'}
Finalidade da Avaliação: Avaliação neuropsicológica e psicológica clínica para investigação diagnóstica de Transtorno do Déficit de Atenção/Hiperatividade (TDAH) em adultos, diagnóstico diferencial e subsídio para intervenção terapêutica e médica.
Psicólogo(a) Responsável: ${p.psychologistName || 'Psicólogo Clínico'} — CRP: ${p.crp || '06/150409'}

II. DESCRIÇÃO DA DEMANDA
O avaliando procurou espontaneamente o serviço psicológico apresentando queixas consistentes e crônicas de sustentação do foco atencional, esquecimentos frequentes de compromissos profissionais e pessoais, lentidão e dispersão em tarefas que exigem esforço mental prolongado, procrastinação severa e intensa desorganização na gestão da rotina. Relata que, apesar de elevado potencial intelectual e competência técnica, vivencia sobrecarga crônica ("sensação de nadar contra a correnteza"), cansaço extremo ao final do dia e atritos no relacionamento conjugal em virtude de esquecimentos rotineiros.

III. PROCEDIMENTOS E INSTRUMENTOS UTILIZADOS
A avaliação foi conduzida sob abordagem multimétodo, estruturada nas seguintes etapas clínicas:
1. Entrevistas Clínicas e Anamnese Retrospectiva da Infância (< 12 anos): Levantamento da história do desenvolvimento, boletins escolares, queixas de professores e histórico familiar.
2. ASRS-18 (Adult ADHD Self-Report Scale - OMS / SATEPSI): Instrumento de triagem sintomatológica para rastreio de sintomas atuais.
3. ETDAH-AD (Escala de Transtorno do Déficit de Atenção/Hiperatividade em Adultos - Benczik / Vetor Editora): 69 itens avaliando os 5 fatores normatizados para o Brasil.
4. EPF-TDAH (Escala de Prejuízos Funcionais): 58 itens avaliando a extensão e severidade dos prejuízos em 9 domínios da vida adulta (Critério C do DSM-5-TR).
5. BDEFS (Barkley Deficits in Executive Functioning Scale - Hogrefe): 89 itens para mensuração de disfunção executiva na rotina e cálculo do Índice FE-TDAH de Barkley.
6. Heterorrelato Estruturado com Terceiros: Entrevista com cônjuge para validação externa, triangulação e redução de vieses de autorrelato.
7. Entrevista Diagnóstica Estruturada para Diagnósticos Diferenciais (DSM-5-TR): Mapeamento de TAG, Transtornos do Humor, Burnout e Cronobiologia.

IV. ANÁLISE DOS RESULTADOS
1. Rastreio Inicial (ASRS-18):
O avaliando atingiu pontuação indicativa de alta probabilidade na Parte A (5 de 6 sintomas acima do limiar clínico) e escore elevado na Parte B, delimitando necessidade de investigação confirmatória.

2. Histórico Longitudinal e Anamnese (< 12 anos):
Identificou-se nítido padrão de desatenção e inquietação antes dos 12 anos. Relatos escolares confirmam que o avaliando "vivia no mundo da lua", levantava-se com frequência na sala de aula e esquecia materiais. O histórico de esforço compensatório familiar intenso (mãe estudando diariamente junto) mascarou reprovações, permitindo bom desempenho acadêmico às custas de sofrimento psíquico. Histórico genético positivo em primeiro grau (pai e irmão com perfil de desatenção crônica).

3. Investigação Psicométrica (ETDAH-AD):
O perfil psicométrico revelou escores elevados e estatisticamente significativos nos Fatores 1 (Desatenção - Nível Superior, Percentil 95) e 4 (Autorregulação da Atenção e Motivação - Nível Superior, Percentil 92). Os Fatores 2 (Impulsividade) e 5 (Hiperatividade) apresentaram-se no nível Médio-Superior.

4. Impacto Funcional e Múltiplos Contextos (EPF-TDAH):
Evidenciou-se prejuízo clinicamente significativo em 4 domínios: Acadêmico/Profissional (Percentil 88), Doméstico (Percentil 85), Gestão Financeira (Percentil 80) e Relacionamentos Afetivos (Percentil 76), preenchendo o Critério C do DSM-5-TR.

5. Disfunção Executiva no Cotidiano (BDEFS Barkley):
O Índice FE-TDAH de Barkley (11 itens nucleares) totalizou 34 pontos (Nível Muito Elevado / Percentil 96). As maiores dificuldades concentram-se no Gerenciamento do Tempo, Memória de Trabalho Operacional e Autorregulação da Motivação.

6. Heterorrelato:
A cônjuge confirmou os esquecimentos diários, a dispersão atencional em diálogos e a sobrecarga na gestão doméstica, demonstrando alta convergência com o autorrelato.

7. Diagnósticos Diferenciais:
Descartou-se Transtorno Bipolar, TEA e uso de substâncias. Os sintomas ansiosos identificados caracterizam-se como comorbidade secundária à sobrecarga e frustrações acumuladas pelos déficits executivos do TDAH, não como etiologia primária.

V. CONCLUSÃO DIAGNÓSTICA
A síntese clínica e psicométrica preenche plenamente os critérios diagnósticos do DSM-5-TR e da CID-11 para:
- Transtorno do Déficit de Atenção/Hiperatividade em Adultos (TDAH) — Apresentação Combinada (F90.2 / 6A05.2).
- Comorbidade Secundária: Transtorno de Ansiedade Generalizada (F41.1) reativo à desregulação executiva.

VI. ENCAMINHAMENTOS E RECOMENDAÇÕES
1. Encaminhamento Médico Psiquiátrico: Sugere-se avaliação clínica para considerar o suporte farmacológico de primeira linha (psicoestimulantes/inibidores de recaptação de noradrenalina) visando otimizar a neurotransmissão dopaminérgica e noradrenérgica.
2. Psicoterapia Cognitivo-Comportamental / Treinamento de Habilidades Psicológicas (THP): Foco no treino deliberado de Autocontrole (HP 6), Resolutividade de Enfrentamento (HP 5) e Imunidade Social (HP 8), auxiliando na estruturação de contingências ambientais externas e descatastrofização.
3. Modificações Ambientais e Tecnológicas: Implementação de alarmes externos, listas visuais kanban, técnica de blocos curtos de tempo (Pomodoro) e externalização da memória de trabalho.

Local e Data: ${new Date().toLocaleDateString('pt-BR')}

___________________________________________________
${p.psychologistName || 'Psicólogo(a) Responsável'}
CRP: ${p.crp || '06/150409'}`;

    setReportText(simulatedText);
    const updatedLaudo: LaudoTdahIntegrativo = {
      aiAssistedSynthesis: simulatedText,
      conclusaoFinal: 'Critérios Plenamente Atendidos para TDAH Tipo Combinado (F90.2) com comorbidade de Ansiedade Secundária',
      encaminhamentos: '1. Avaliação Psiquiátrica para farmacoterapia; 2. Psicoterapia TCC com Treino de Habilidades Psicológicas (THP); 3. Estruturação ergonômica ambiental.',
      completedAt: new Date().toISOString()
    };
    onUpdateLaudo(updatedLaudo);
    toast.success('Laudo simulado de alta precisão preenchido!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success('Laudo copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    exportTdahEcosystemToHtml(assessment);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 8 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              Resolução CFP nº 06/2019
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <FileText className="text-amber-400" size={18} /> Síntese Clínica & Laudo Psicológico Integrativo
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            Consolidação dos dados coletados em todas as 7 etapas anteriores. O laudo psicológico possui finalidade diagnóstica, subsidiando a conduta médica multiprofissional (Psiquiatria/Neurologia) e o plano psicoterapêutico.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulate}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 transition-all cursor-pointer shadow-sm"
            title="Preencher laudo modelo para teste"
          >
            <Zap size={11} /> Simular
          </button>

          <button
            onClick={handleGenerateAiReport}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={14} className={isGeneratingAi ? "animate-spin" : ""} />
            {isGeneratingAi ? 'Elaborando Laudo...' : 'Redigir com IA'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-main text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
            title="Imprimir Laudo Formatado para Entrega"
          >
            <Printer size={14} /> Imprimir / PDF
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-main text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Resumo Diagnóstico Preliminar */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 block">
            Hipótese Diagnóstica Gerada pelo Protocolo
          </span>
          <h4 className="text-sm font-extrabold text-amber-400">
            TDAH em Adultos • Apresentação {dsm5.apresentacaoSugerida} ({dsm5.conclusaoGlobal})
          </h4>
        </div>
        <button
          onClick={onSaveToProntuario}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Save size={14} />
          {isSaving ? 'Gravando no Prontuário...' : 'Gravar no Prontuário'}
        </button>
      </div>

      {/* Editor do Laudo */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-text-dim flex items-center justify-between px-1">
          <span>Corpo do Laudo Psicológico (Editável)</span>
          <span className="text-[9px] font-mono opacity-60">Resolução CFP nº 06/2019</span>
        </label>

        <div className="bg-bg-deep rounded-3xl border border-border-subtle overflow-hidden focus-within:border-amber-400/50 transition-colors p-4">
          <textarea
            value={reportText}
            onChange={(e) => {
              setReportText(e.target.value);
              if (assessment.laudoData) {
                onUpdateLaudo({
                  ...assessment.laudoData,
                  aiAssistedSynthesis: e.target.value
                });
              }
            }}
            rows={20}
            className="w-full bg-transparent text-xs text-text-main leading-relaxed font-mono outline-none resize-y selection:bg-amber-500/30"
            placeholder="O laudo psicológico integrativo será gerado aqui..."
          />
        </div>
      </div>

      {/* Rodapé com Ação Principal */}
      <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-text-dim max-w-xl">
          Ao clicar em <strong>"Gravar no Prontuário"</strong>, todo o ecossistema avaliativo, escores das escalas e a íntegra do laudo são vinculados à linha do tempo médica do paciente selecionado.
        </p>

        <button
          onClick={onSaveToProntuario}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Salvando no Prontuário...' : 'Salvar Avaliação Completa no Prontuário'}
        </button>
      </div>
    </div>
  );
}
