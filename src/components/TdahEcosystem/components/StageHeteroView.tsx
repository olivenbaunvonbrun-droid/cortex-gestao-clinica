import React, { useState } from 'react';
import { HeterorrelatoData } from '../types';
import { Users, CheckCircle2, ArrowRight, Info, Sparkles, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StageHeteroViewProps {
  heterorrelatoData?: HeterorrelatoData;
  onUpdateHeterorrelato: (data: HeterorrelatoData) => void;
  onNextStage: () => void;
}

const DEFAULT_HETERO: HeterorrelatoData = {
  respondenteNome: '',
  grauParentesco: 'Cônjuge/Parceiro(a)',
  tempoConvivio: '',
  conviveuNaInfancia: false,
  observacoesInfancia: '',
  percepcaoDesatencao: '',
  percepcaoHiperatividadeImpulsividade: '',
  percepcaoDisfuncaoExecutiva: '',
  impactoRelacionamentoRotina: '',
  concordanciaGeralComAutorrelato: 'Alta Convergência',
  notasClinicasConfronto: ''
};

export default function StageHeteroView({
  heterorrelatoData,
  onUpdateHeterorrelato,
  onNextStage
}: StageHeteroViewProps) {
  const [formData, setFormData] = useState<HeterorrelatoData>(heterorrelatoData || DEFAULT_HETERO);

  const updateField = (key: keyof HeterorrelatoData, val: any) => {
    const updated = {
      ...formData,
      [key]: val,
      completedAt: new Date().toISOString()
    };
    setFormData(updated);
    onUpdateHeterorrelato(updated);
  };

  const handleSimulate = () => {
    const simulated: HeterorrelatoData = {
      respondenteNome: 'Mariana Costa Ferreira',
      grauParentesco: 'Cônjuge/Parceiro(a)',
      tempoConvivio: '7 anos de casamento (convivência diária contínua)',
      conviveuNaInfancia: false,
      observacoesInfancia: 'A sogra relatou que na infância ele não parava quieto na cadeira, perdia agasalhos escolares com frequência e necessitava de supervisão constante para lições.',
      percepcaoDesatencao: 'Frequentemente parece não escutar quando conversamos diretamente; esquece tarefas combinadas minutos após o combinado; perde chaves, celular e carteira diariamente.',
      percepcaoHiperatividadeImpulsividade: 'Interrompe a fala dos outros por impaciência; tem extrema dificuldade em esperar filas e balança as pernas ou tamborila dedos o tempo todo.',
      percepcaoDisfuncaoExecutiva: 'Planeja rotinas mas não consegue cumpri-las; subestima gravemente o tempo necessário para deslocamentos ou tarefas domésticas; deixa armários abertos e projetos inacabados.',
      impactoRelacionamentoRotina: 'Gera sobrecarga e sensação de que a parceira precisa atuar como "gerente/mãe" da rotina doméstica, sendo fonte crônica de desgastes e atritos no casamento.',
      concordanciaGeralComAutorrelato: 'Alta Convergência',
      notasClinicasConfronto: 'Os relatos da cônjuge corroboram plenamente o autorrelato do paciente no ASRS e ETDAH-AD, descartando hipótese de distorção ou superestimação e confirmando o critério DSM-5 de prejuízo em múltiplos contextos.',
      completedAt: new Date().toISOString()
    };
    setFormData(simulated);
    onUpdateHeterorrelato(simulated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-5 rounded-3xl bg-bg-sidebar/50 border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Etapa 6 do Protocolo
            </span>
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
              Validação Externa & Triangulação
            </span>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <Users className="text-amber-400" size={18} /> Heterorrelato Clínico com Terceiros
          </h2>
          <p className="text-xs text-text-dim mt-1 max-w-2xl leading-relaxed">
            Adultos com TDAH podem subestimar ou superestimar sintomas por habituação ou estratégias compensatórias. 
            O heterorrelato com um observador próximo (cônjuge, pais ou irmãos) triangula a percepção cotidiana e a trajetória infantil. 
            <strong> Nota:</strong> Não funciona como uma votação de confirmação, mas como perspectiva clínica complementar.
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

      {/* Dados do Informante */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
          1. Identificação do Informante
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Nome do Informante:
            </label>
            <input
              type="text"
              value={formData.respondenteNome}
              onChange={(e) => updateField('respondenteNome', e.target.value)}
              placeholder="Ex: Mariana Silveira"
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Grau de Parentesco / Vínculo:
            </label>
            <select
              value={formData.grauParentesco}
              onChange={(e) => updateField('grauParentesco', e.target.value as any)}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            >
              <option value="Cônjuge/Parceiro(a)">Cônjuge / Parceiro(a)</option>
              <option value="Mãe/Pai">Mãe / Pai</option>
              <option value="Irmão/Irmã">Irmão / Irmã</option>
              <option value="Amigo(a) Próximo">Amigo(a) Próximo</option>
              <option value="Colega de Trabalho">Colega de Trabalho</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Tempo de Convivência:
            </label>
            <input
              type="text"
              value={formData.tempoConvivio}
              onChange={(e) => updateField('tempoConvivio', e.target.value)}
              placeholder="Ex: 8 anos de casamento / Desde a infância"
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.conviveuNaInfancia}
              onChange={(e) => updateField('conviveuNaInfancia', e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-bg-deep border-border-subtle"
            />
            <span className="text-xs text-text-main font-medium">
              O informante conviveu com o avaliando durante a infância (&lt;12 anos)?
            </span>
          </label>

          {formData.conviveuNaInfancia && (
            <div className="mt-2.5 pl-6 border-l-2 border-amber-500/30">
              <label className="text-[9px] font-black uppercase tracking-wider text-text-dim block mb-1">
                Relato do Informante sobre a Infância (Escola, rotina, esquecimentos, agitação):
              </label>
              <textarea
                value={formData.observacoesInfancia}
                onChange={(e) => updateField('observacoesInfancia', e.target.value)}
                placeholder="Ex: Lembra que desde criança precisava ser cobrado para fazer as tarefas, perdia brinquedos e casacos, mudava de brincadeira muito rápido..."
                rows={2}
                className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Observações do Cotidiano Atual */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
          2. Sintomas Observados no Cotidiano Atual
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Desatenção & Lapsos de Memória (Esquecer compromissos, perder objetos, não ouvir quando falam):
            </label>
            <textarea
              value={formData.percepcaoDesatencao}
              onChange={(e) => updateField('percepcaoDesatencao', e.target.value)}
              placeholder="Ex: Frequente perda de chaves/celular, desatenção durante conversas longas, esquecimento de tarefas domésticas acordadas..."
              rows={2}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Hiperatividade, Inquietação & Impulsividade (Falar antes da hora, interromper, inquietação motora):
            </label>
            <textarea
              value={formData.percepcaoHiperatividadeImpulsividade}
              onChange={(e) => updateField('percepcaoHiperatividadeImpulsividade', e.target.value)}
              placeholder="Ex: Dificuldade em relaxar parado, mexe pernas constantemente, fala rápida, decisões impulsivas sem avaliar custos..."
              rows={2}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1">
              Disfunção Executiva & Gestão do Tempo (Procrastinação, sobrecarga de tarefas inacabadas):
            </label>
            <textarea
              value={formData.percepcaoDisfuncaoExecutiva}
              onChange={(e) => updateField('percepcaoDisfuncaoExecutiva', e.target.value)}
              placeholder="Ex: Deixa tudo para a última hora, começa vários projetos e não termina, subestima o tempo necessário para se arrumar..."
              rows={2}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Triangulação Clínica e Convergência */}
      <div className="p-5 rounded-2xl bg-bg-sidebar/30 border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
          3. Triangulação & Síntese de Concordância Clínica
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1.5">
              Concordância Geral com o Autorrelato do Paciente:
            </label>
            <div className="flex flex-col gap-2">
              {[
                { val: 'Alta Convergência', desc: 'O informante confirma plenamente a intensidade dos prejuízos relatados.' },
                { val: 'Convergência Parcial', desc: 'Concordam nos sintomas centrais, com pequenas divergências na intensidade.' },
                { val: 'Divergência Notável', desc: 'Divergência expressiva (paciente relata muito mais ou muito menos sintomas que o informante).' }
              ].map(opt => (
                <label 
                  key={opt.val}
                  className={cn(
                    "p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all",
                    formData.concordanciaGeralComAutorrelato === opt.val
                      ? "bg-amber-500/10 border-amber-400 text-text-main"
                      : "bg-white/[0.02] border-white/[0.06] text-text-dim hover:bg-white/[0.04]"
                  )}
                >
                  <input
                    type="radio"
                    name="concordancia"
                    value={opt.val}
                    checked={formData.concordanciaGeralComAutorrelato === opt.val}
                    onChange={() => updateField('concordanciaGeralComAutorrelato', opt.val as any)}
                    className="mt-0.5 text-amber-500 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold block">{opt.val}</span>
                    <span className="text-[10px] opacity-75">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-dim block mb-1.5">
              Notas do Psicólogo sobre a Triangulação / Ponderação de Vieses:
            </label>
            <textarea
              value={formData.notasClinicasConfronto}
              onChange={(e) => updateField('notasClinicasConfronto', e.target.value)}
              placeholder="Ex: O parceiro corrobora o impacto substancial no ambiente doméstico e financeiro. As divergências pontuais refletem o esforço do paciente em compensar sintomas no trabalho..."
              rows={5}
              className="w-full bg-bg-deep border border-border-subtle rounded-xl p-3 text-xs text-text-main focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Navegação Inferior */}
      <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Heterorrelato registrado
        </span>

        <button
          onClick={onNextStage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          Próximo: Diagnósticos Diferenciais <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
