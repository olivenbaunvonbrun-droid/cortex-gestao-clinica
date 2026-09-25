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
  Send
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
