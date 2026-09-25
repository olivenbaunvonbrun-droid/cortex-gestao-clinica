import { DifferentialItem } from '../types';

export const DIFFERENTIAL_CONDITIONS: DifferentialItem[] = [
  {
    id: 'ansiedade_generalizada',
    title: 'Transtorno de Ansiedade Generalizada (TAG)',
    description: 'Preocupação excessiva e apreensão mórbida com múltiplos temas cotidianos.',
    symptomOverlap: 'Inquietação física, dificuldade de concentração ("mente em branco"), fadiga mental e insônia.',
    distinguishingFeatures: 'No TAG, a falha atencional é secundária à intrusão de pensamentos ansiosos e preocupações catastróficas. No TDAH, a desatenção ocorre pela busca por estímulo ou tédio, mesmo sem preocupação ativa. No TDAH, o histórico remonta à infância precoce.',
    status: 'nao_avaliado',
    notes: ''
  },
  {
    id: 'transtorno_depressivo',
    title: 'Depressão Maior / Distimia',
    description: 'Humor deprimido persistente, anedonia, lentificação psicomotora e desesperança.',
    symptomOverlap: 'Procrastinação, baixa energia, dificuldade de focar a atenção, desorganização e perda de rendimento.',
    distinguishingFeatures: 'Na depressão, a falta de foco é episódica (acompanhada de anedonia, culpa e desvalia global). No TDAH, o indivíduo quer agir mas não consegue engajar a atenção voluntária se a tarefa não for estimulante. Quando engajado em hiperfoco, seu rendimento é alto.',
    status: 'nao_avaliado',
    notes: ''
  },
  {
    id: 'burnout_sobrecarga',
    title: 'Burnout & Sobrecarga Ambiental Crônica',
    description: 'Exaustão emocional ligada a estressores ocupacionais prolongados e descompasso de recursos.',
    symptomOverlap: 'Lapsos de memória recentes, esgotamento atencional, irritabilidade e queda no trabalho.',
    distinguishingFeatures: 'Início recente, circunscrito à carreira/trabalho e precedido por período de alto funcionamento sem histórico escolar na infância. Alívio perceptível em períodos de repouso ou afastamento.',
    status: 'nao_avaliado',
    notes: ''
  },
  {
    id: 'transtornos_sono',
    title: 'Transtornos do Sono (Apneia Obstrutiva / Insônia Crônica)',
    description: 'Sono não-restaurador, microdespertares e fragmentação arquitetural do sono.',
    symptomOverlap: 'Sonolência diurna, névoa mental (brain fog), déficit de memória de trabalho e irritabilidade.',
    distinguishingFeatures: 'Investigação clínica de ronco, engasgos noturnos, IMC elevado e queixa de acordar cansado. O TDAH frequentemente apresenta atraso de fase de sono circadiano ("coruja"), mas sem hipóxia noturna.',
    status: 'nao_avaliado',
    notes: ''
  },
  {
    id: 'transtorno_bipolar',
    title: 'Transtorno Bipolar (Hipomania / Mania)',
    description: 'Oscilações cíclicas de humor com episódios de exaltação, diminuição da necessidade de sono e grandiosidade.',
    symptomOverlap: 'Verborragia (falar sem parar), impulsividade, hiperatividade física, aceleração do pensamento.',
    distinguishingFeatures: 'No TDAH, os traços são estáveis ao longo da vida e não formam episódios delimitados com necessidade de sono reduzida a poucas horas sem fadiga diurna e planos grandiosos surreais.',
    status: 'nao_avaliado',
    notes: ''
  },
  {
    id: 'tea_nivel_1',
    title: 'Transtorno do Espectro Autista (TEA Nível 1)',
    description: 'Dificuldades na comunicação social e padrões restritos e repetitivos de comportamento.',
    symptomOverlap: 'Disfunção executiva, hiperfoco intenso em interesses específicos, dificuldade de adaptação a mudanças.',
    distinguishingFeatures: 'Alta comorbidade clínica com TDAH (30-50%). Investigar adesão inflexível a rotinas, hipo/hipersensibilidade sensorial e dificuldades pragmáticas de reciprocidade socioemocional desde tenra infância.',
    status: 'nao_avaliado',
    notes: ''
  },
  {
    id: 'substancias',
    title: 'Uso / Abuso de Substâncias e Medicamentos',
    description: 'Consumo frequente de álcool, maconha, estimulantes ou sedativos interferindo no SNC.',
    symptomOverlap: 'Comprometimento de memória recente, alterações de humor, oscilação atencional e problemas legais/profissionais.',
    distinguishingFeatures: 'Construir linha do tempo: as manifestações atencionais antecederam o primeiro contato com a substância na adolescência/infância? Muitas vezes o uso é automedicação para agitação/ansiedade.',
    status: 'nao_avaliado',
    notes: ''
  }
];
