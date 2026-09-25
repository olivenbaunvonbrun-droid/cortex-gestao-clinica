import React, { useState } from 'react';
import { AnamneseData } from '../types';
import { BookOpen, CheckCircle2, ArrowRight, Brain, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StageAnamneseViewProps {
  anamneseData?: AnamneseData;
  onUpdateAnamnese: (data: AnamneseData) => void;
  onNextStage: () => void;
}

const DEFAULT_ANAMNESE: AnamneseData = {
  queixaPrincipal: '',
  impactoVidaDiaria: '',
  marcosDesenvolvimento: {
    idadeAndar: '',
    idadeFalar: '',
    idadeLer: '',
    desempenhoAcademicoInfancia: '',
    comportamentoEscola: '',
    problemasComportamentoInfanciaAdolescencia: '',
    repetenciaOuAdvertencias: '',
    esforcoCompensatorioOuApoioFamiliar: ''
  },
  historiaFamiliar: {
    temHistoricoFamiliar: false,
    parentesAfetados: '',
    detalhes: ''
  },
  historicoMedicoPsiquiatrico: {
    problemasMedicosInfancia: '',
    diagnosticosAnteriores: '',
    usoMedicacaoPsicotropica: '',
    tempoMedicacao: '',
    historicoSono: '',
    historicoSubstancias: ''
  },
  sintomasNuclearesAtuais: {
    focoEsforcoMental: '',
    organizacaoTarefas: '',
    seguirInstrucoes: '',
    lembrarDetalhes: '',
    procrastinacao: '',
    interrupcaoFala: '',
    inquietudeAgitacao: ''
  },
  tratamentosAnteriores: {
    fezTratamentoTdah: false,
    qualTratamentoETempo: '',
    houveMelhora: ''
  },
  expectativasTratamento: ''
};

export default function StageAnamneseView({
  anamneseData,
  onUpdateAnamnese,
  onNextStage
}: StageAnamneseViewProps) {
  const [formData, setFormData] = useState<AnamneseData>(anamneseData || DEFAULT_ANAMNESE);

  const updateField = (path: string[], value: any) => {
    setFormData(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      let current = clone;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      clone.completedAt = new Date().toISOString();
      onUpdateAnamnese(clone);
      return clone;
    });
  };

  const handleSimulate = () => {
    const simulated: AnamneseData = {
      queixaPrincipal: 'Dificuldade crônica de sustentação do foco atencional, desorganização no trabalho e esquecimentos frequentes de prazos e compromissos.',
      impactoVidaDiaria: 'Acúmulo de tarefas atrasadas, sobrecarga mental contínua, atritos conjugais por esquecer afazeres domésticos e sensação de esgotamento ao final do dia.',
      marcosDesenvolvimento: {
        idadeAndar: '12 meses',
        idadeFalar: '16 meses',
        idadeLer: '6 anos',
        desempenhoAcademicoInfancia: 'Notas muito oscilantes: excelente em matérias de alto interesse (história, ciências) e muito baixas em disciplinas com esforço repetitivo ou memorização árida.',
        comportamentoEscola: 'Professores relatavam que "vivia no mundo da lua", levantava frequentemente para apontar lápis ou beber água, perdia casacos e esquecia lições.',
        problemasComportamentoInfanciaAdolescencia: 'Na adolescência a hiperatividade motora transformou-se em inquietação mental interna constante, balançar de pernas e impulsividade verbal.',
        repetenciaOuAdvertencias: 'Não repetiu de ano, mas recebeu constantes advertências por conversar nas aulas e distrair colegas.',
        esforcoCompensatorioOuApoioFamiliar: 'A mãe estudava diariamente com ele para garantir a entrega das tarefas; estudava apenas na véspera sob intensa adrenalina de prazo.'
      },
      historiaFamiliar: {
        temHistoricoFamiliar: true,
        parentesAfetados: 'Pai e irmão mais novo',
        detalhes: 'Pai apresenta perfil nítido de desatenção, perde chaves/óculos com frequência e tem histórico de desorganização financeira crônica.'
      },
      historicoMedicoPsiquiatrico: {
        problemasMedicosInfancia: 'Desenvolvimento físico sem intercorrências; sem crises convulsivas ou TCE.',
        diagnosticosAnteriores: 'Diagnóstico prévio de Transtorno de Ansiedade Generalizada com resposta apenas parcial a ISRS.',
        usoMedicacaoPsicotropica: 'Sertralina 50mg/dia',
        tempoMedicacao: 'Uso contínuo há 8 meses',
        historicoSono: 'Dificuldade para iniciar o sono devido a pensamentos acelerados; sono agitado, acorda com sensação de cansaço.',
        historicoSubstancias: 'Consumo elevado de cafeína (5 a 6 xícaras de café/dia) como estratégia compensatória para manter o estado de alerta.'
      },
      sintomasNuclearesAtuais: {
        focoEsforcoMental: 'Evitação ativa de tarefas burocráticas ou com esforço mental prolongado; distrai-se com qualquer estímulo do ambiente.',
        organizacaoTarefas: 'Inicia múltiplos projetos simultâneos e tem enorme dificuldade em concluí-los; mesa de trabalho e ambiente digital caóticos.',
        seguirInstrucoes: 'Pula etapas de manuais e e-mails longos, lendo apenas trechos rápidos e cometendo erros de procedimento.',
        lembrarDetalhes: 'Esquece compromissos rotineiros, datas de aniversários, prazos de contas e onde guardou pertences essenciais.',
        procrastinacao: 'Severa: empurra decisões e tarefas complexas até o limite do prazo final, gerando picos intensos de estresse.',
        interrupcaoFala: 'Interrompe a fala de colegas por impaciência e costuma completar a frase dos outros.',
        inquietudeAgitacao: 'Necessidade constante de manipular objetos durante reuniões (caneta, mexer nas mãos, tamborilar dedos, balançar pernas).'
      },
      tratamentosAnteriores: {
        fezTratamentoTdah: false,
        qualTratamentoETempo: 'Nunca realizou avaliação neuropsicológica específica ou uso de psicoestimulantes.',
        houveMelhora: 'N/A'
      },
      expectativasTratamento: 'Obter clareza diagnóstica, desculpabilizar seu histórico de vida, estruturar rotinas funcionais e avaliar intervenção farmacológica e psicoterapêutica com médico psiquiatra.',
      completedAt: new Date().toISOString()
    };
    setFormData(simulated);
    onUpdateAnamnese(simulated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 2 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              Resgate Longitudinal (&lt; 12 anos)
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <BookOpen className="text-amber-400" size={18} /> Anamnese Clínica & Linha do Tempo Retrospectiva
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            O DSM-5-TR exige que os sintomas tenham início antes dos 12 anos. Investigue boletins escolares, queixas de professores, histórico familiar e estratégias de compensação que mascararam o quadro no passado.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSimulate}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 transition-all cursor-pointer shadow-sm"
            title="Preencher com dados simulados para teste"
          >
            <Zap size={11} /> Simular
          </button>
        </div>
      </div>

      {/* 1. Queixa Principal */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <span>1. Queixa Principal & Percepção de Impacto</span>
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1.5">
              Descreva a queixa principal apresentada pelo avaliando e como ela afeta sua vida diária:
            </label>
            <textarea
              value={formData.queixaPrincipal}
              onChange={(e) => updateField(['queixaPrincipal'], e.target.value)}
              placeholder="Ex: Queixa persistente de procrastinação crônica, sensação de esforço desmedido para iniciar tarefas rotineiras, desorganização no trabalho e esquecimento de compromissos..."
              rows={3}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-3 text-xs text-text-main focus:border-amber-400 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Marcos do Desenvolvimento & Histórico Escolar Infantil */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
            2. Marcos do Desenvolvimento e Infância (&lt;12 anos - DSM-5 Critério B)
          </h4>
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Obrigatório para Confirmação</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Idade em que começou a andar:
            </label>
            <input
              type="text"
              value={formData.marcosDesenvolvimento.idadeAndar}
              onChange={(e) => updateField(['marcosDesenvolvimento', 'idadeAndar'], e.target.value)}
              placeholder="Ex: 11 meses / 1 ano e 2 meses"
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Idade em que começou a falar:
            </label>
            <input
              type="text"
              value={formData.marcosDesenvolvimento.idadeFalar}
              onChange={(e) => updateField(['marcosDesenvolvimento', 'idadeFalar'], e.target.value)}
              placeholder="Ex: Primeiras palavras aos 10 meses"
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Idade em que começou a ler:
            </label>
            <input
              type="text"
              value={formData.marcosDesenvolvimento.idadeLer}
              onChange={(e) => updateField(['marcosDesenvolvimento', 'idadeLer'], e.target.value)}
              placeholder="Ex: 6 anos / Dificuldades com alfabetização"
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Como foi o desempenho acadêmico na infância? (Boletins, notas, reprovações, tempo para tarefas)
            </label>
            <textarea
              value={formData.marcosDesenvolvimento.desempenhoAcademicoInfancia}
              onChange={(e) => updateField(['marcosDesenvolvimento', 'desempenhoAcademicoInfancia'], e.target.value)}
              placeholder="Ex: Boas notas nos anos iniciais sustentadas por inteligência ou monitoramento parental intenso; queda de rendimento na transição para o ensino fundamental II..."
              rows={2}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-3 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Como era o comportamento na escola? (Queixas de professores, devaneios, esquecer material, agitação)
            </label>
            <textarea
              value={formData.marcosDesenvolvimento.comportamentoEscola}
              onChange={(e) => updateField(['marcosDesenvolvimento', 'comportamentoEscola'], e.target.value)}
              placeholder="Ex: 'Vive no mundo da lua', 'Inteligente mas não presta atenção', perde borrachas e cadernos com frequência, levantar da cadeira..."
              rows={2}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-3 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Estratégias compensatórias familiares ou escolares (Mães que estudavam junto, professores particulares):
            </label>
            <input
              type="text"
              value={formData.marcosDesenvolvimento.esforcoCompensatorioOuApoioFamiliar}
              onChange={(e) => updateField(['marcosDesenvolvimento', 'esforcoCompensatorioOuApoioFamiliar'], e.target.value)}
              placeholder="Ex: A mãe conferia a mochila diariamente e revisava a matéria na véspera das provas..."
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. História Familiar (Genética & Hereditariedade) */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
          3. História Familiar (Herança Genética)
        </h4>
        <p className="text-[10px] text-text-dim">
          O TDAH possui herdabilidade estimada em cerca de 70-80%. Investigue parentes de primeiro grau com traços semelhantes.
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.historiaFamiliar.temHistoricoFamiliar}
              onChange={(e) => updateField(['historiaFamiliar', 'temHistoricoFamiliar'], e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-bg-deep border-border-subtle"
            />
            <span className="text-xs text-text-main font-medium">
              Há histórico de TDAH ou outros transtornos psiquiátricos/neurodesenvolvimento na família?
            </span>
          </label>

          {formData.historiaFamiliar.temHistoricoFamiliar && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 border-l-2 border-amber-500/30">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
                  Quem teve / parentesco:
                </label>
                <input
                  type="text"
                  value={formData.historiaFamiliar.parentesAfetados}
                  onChange={(e) => updateField(['historiaFamiliar', 'parentesAfetados'], e.target.value)}
                  placeholder="Ex: Pai, irmão mais novo, prima materna"
                  className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
                  Quais manifestações ou diagnósticos confirmados:
                </label>
                <input
                  type="text"
                  value={formData.historiaFamiliar.detalhes}
                  onChange={(e) => updateField(['historiaFamiliar', 'detalhes'], e.target.value)}
                  placeholder="Ex: Pai nunca diagnosticado formalmente mas extremamente impulsivo e com troca frequente de empregos..."
                  className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Histórico Médico e Psiquiátrico Pregresso */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
          4. Histórico Médico, Psiquiátrico e Sono
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Já foi diagnosticado com algum transtorno anteriormente?
            </label>
            <input
              type="text"
              value={formData.historicoMedicoPsiquiatrico.diagnosticosAnteriores}
              onChange={(e) => updateField(['historicoMedicoPsiquiatrico', 'diagnosticosAnteriores'], e.target.value)}
              placeholder="Ex: Transtorno de Ansiedade Generalizada, Depressão, etc."
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Já fez uso de medicação psicotrópica? Qual e por quanto tempo?
            </label>
            <input
              type="text"
              value={formData.historicoMedicoPsiquiatrico.usoMedicacaoPsicotropica}
              onChange={(e) => updateField(['historicoMedicoPsiquiatrico', 'usoMedicacaoPsicotropica'], e.target.value)}
              placeholder="Ex: Escitalopram 10mg por 6 meses; Ritalina 10mg avulso..."
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Padrão de Sono e Ritmo Circadiano:
            </label>
            <input
              type="text"
              value={formData.historicoMedicoPsiquiatrico.historicoSono}
              onChange={(e) => updateField(['historicoMedicoPsiquiatrico', 'historicoSono'], e.target.value)}
              placeholder="Ex: Dificuldade para adormecer (mente agitada à noite), perfil vespertino/noturno..."
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Consumo de Álcool, Cafeína, Tabaco ou outras substâncias:
            </label>
            <input
              type="text"
              value={formData.historicoMedicoPsiquiatrico.historicoSubstancias}
              onChange={(e) => updateField(['historicoMedicoPsiquiatrico', 'historicoSubstancias'], e.target.value)}
              placeholder="Ex: Consumo excessivo de café para compensar a atenção (4 a 6 xícaras/dia)..."
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Navegação Inferior */}
      <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Anamnese salva automaticamente
        </span>

        <button
          onClick={onNextStage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          Próximo: ETDAH-AD (Sintomas) <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
