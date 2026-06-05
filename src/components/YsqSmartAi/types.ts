export enum Frequency {
  F1 = 1,
  F2 = 2,
  F3 = 3,
  F4 = 4,
  F5 = 5,
  F6 = 6
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  [Frequency.F1]: 'Completamente falso sobre mim',
  [Frequency.F2]: 'Na maior parte falso sobre mim',
  [Frequency.F3]: 'Ligeiramente mais verdadeiro do que falso sobre mim',
  [Frequency.F4]: 'Moderadamente verdadeiro sobre mim',
  [Frequency.F5]: 'Na maior parte verdadeiro sobre mim',
  [Frequency.F6]: 'Descreve-me perfeitamente'
};

export interface YsqQuestion {
  id: number;
  text: string;
  schemaKey: string;
}

export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export interface Assessment {
  id: string;
  patient: PatientData;
  answers: Record<number, Frequency>;
  aiAnalysis?: string;
  createdAt: string;
}

export interface SchemaScore {
  key: string;
  name: string;
  domain: string;
  score: number;
  description: string;
}

export const SCHEMA_DETAILS: Record<string, { name: string; domain: string; description: string }> = {
  ED: {
    name: 'Privação Emocional',
    domain: 'Desconexão e Rejeição',
    description: 'Expectativa de que os outros não suprirão as necessidades de apoio emocional (afeto, empatia, proteção).'
  },
  AB: {
    name: 'Abandono / Instabilidade',
    domain: 'Desconexão e Rejeição',
    description: 'Instabilidade percebida ou falta de confiabilidade daqueles que oferecem apoio e conexão.'
  },
  MA: {
    name: 'Desconfiança / Abuso',
    domain: 'Desconexão e Rejeição',
    description: 'Expectativa de que os outros irão magoar, abusar, humilhar, enganar ou mentir.'
  },
  SI: {
    name: 'Isolamento Social / Alienação',
    domain: 'Desconexão e Rejeição',
    description: 'Sensação de que se está isolado do resto do mundo, de ser diferente ou de não pertencer a nenhum grupo.'
  },
  DS: {
    name: 'Defectividade / Vergonha',
    domain: 'Desconexão e Rejeição',
    description: 'Sentimento de que se é inerentemente imperfeito, mau, indesejado, inferior ou inválido.'
  },
  FA: {
    name: 'Fracasso',
    domain: 'Autonomia e Desempenho Prejudicados',
    description: 'Crença de que se fracassou, falhará inevitavelmente ou é incompetente em comparação com os outros.'
  },
  DI: {
    name: 'Dependência / Incompetência',
    domain: 'Autonomia e Desempenho Prejudicados',
    description: 'Crença de que se é incapaz de lidar com as responsabilidades cotidianas sem ajuda substancial.'
  },
  VH: {
    name: 'Vulnerabilidade ao Dano ou Doença',
    domain: 'Autonomia e Desempenho Prejudicados',
    description: 'Medo exagerado de que uma catástrofe financeira, médica ou física aconteça a qualquer momento.'
  },
  EM: {
    name: 'Emaranhamento / Self Subdesenvolvido',
    domain: 'Autonomia e Desempenho Prejudicados',
    description: 'Envolvimento emocional excessivo com figuras de autoridade ou cuidadores à custa da individualidade.'
  },
  SB: {
    name: 'Subjugação',
    domain: 'Orientação para o Outro',
    description: 'Entrega excessiva do controle aos outros para evitar ira, retaliação ou abandono.'
  },
  SS: {
    name: 'Auto-sacrifício',
    domain: 'Orientação para o Outro',
    description: 'Foco voluntário em satisfazer as necessidades dos outros às custas da própria gratificação.'
  },
  AS: {
    name: 'Busca de Aprovação / Reconhecimento',
    domain: 'Orientação para o Outro',
    description: 'Ênfase excessiva na aprovação e no status à custa do desenvolvimento de um self autêntico.'
  },
  NP: {
    name: 'Negativismo / Pessimismo',
    domain: 'Supervigilância e Inibição',
    description: 'Foco persistente nos aspectos negativos da vida e minimização dos positivos, com medo de cometer erros.'
  },
  EI: {
    name: 'Inibição Emocional',
    domain: 'Supervigilância e Inibição',
    description: 'Restrição voluntária de ações, sentimentos ou comunicação para evitar desaprovação ou perda de controle.'
  },
  US: {
    name: 'Padrões Inflexíveis / Postura Crítica',
    domain: 'Supervigilância e Inibição',
    description: 'Crença de que se deve atingir padrões extremamente elevados de desempenho para evitar críticas.'
  },
  PU: {
    name: 'Postura Punitiva',
    domain: 'Supervigilância e Inibição',
    description: 'Crença de que as pessoas (incluindo si mesmo) devem ser punidas de forma severa pelos seus erros.'
  },
  ET: {
    name: 'Arrogância / Grandiosidade',
    domain: 'Limites Prejudicados',
    description: 'Crença de que se é superior aos outros, merecendo direitos especiais e não precisando seguir regras.'
  },
  IS: {
    name: 'Autocontrole / Autodisciplina Insuficientes',
    domain: 'Limites Prejudicados',
    description: 'Dificuldade crônica em exercer autocontrole para alcançar objetivos pessoais e tolerar frustrações.'
  }
};

export const YSQ_QUESTIONS: YsqQuestion[] = [
  // Item 1-18 (Cycle 1)
  { id: 1, text: "Eu não tive ninguém para me dar afeto, cuidado e proteção, que partilhasse sua vida comigo, ou que se importasse de verdade com o que me acontece.", schemaKey: "ED" },
  { id: 2, text: "Eu percebo que me agarro às pessoas que são próximas de mim com medo de que elas me abandonem.", schemaKey: "AB" },
  { id: 3, text: "Eu desconfio bastante das intenções das outras pessoas.", schemaKey: "MA" },
  { id: 4, text: "Sinto-me isolado do resto do mundo e não me encaixo em nenhum grupo.", schemaKey: "SI" },
  { id: 5, text: "Ninguém de quem eu goste iria me querer se conhecesse meus defeitos profundos.", schemaKey: "DS" },
  { id: 6, text: "Quase tudo o que tento fazer na vida profissional ou escolar dá errado ou não atinge o nível esperado.", schemaKey: "FA" },
  { id: 7, text: "Não me sinto capaz de resolver os problemas do dia a dia por mim mesmo.", schemaKey: "DI" },
  { id: 8, text: "Sinto que uma catástrofe financeira, de saúde ou física pode acontecer comigo a qualquer momento.", schemaKey: "VH" },
  { id: 9, text: "Não consigo me afastar ou me separar emocionalmente de meus pais ou parceiro.", schemaKey: "EM" },
  { id: 10, text: "Deixo que as outras pessoas tomem as decisões por mim porque tenho medo de que fiquem com raiva.", schemaKey: "SB" },
  { id: 11, text: "Estou sempre pronto a ajudar os outros, mesmo que isso signifique deixar minhas próprias necessidades de lado.", schemaKey: "SS" },
  { id: 12, text: "Minha autoestima depende em grande parte do que os outros pensam sobre mim.", schemaKey: "AS" },
  { id: 13, text: "Mesmo quando as coisas estão indo bem, sinto que é apenas temporário e que algo ruim vai acontecer em breve.", schemaKey: "NP" },
  { id: 14, text: "Acho muito difícil demonstrar afeto físico ou expressar sentimentos calorosos em público.", schemaKey: "EI" },
  { id: 15, text: "Preciso ser o melhor em tudo o que faço e não posso me dar ao luxo de cometer erros.", schemaKey: "US" },
  { id: 16, text: "Acho que as pessoas que erram ou quebram regras devem ser severamente punidas e responsabilizadas.", schemaKey: "PU" },
  { id: 17, text: "Acho que não deveria ter que seguir as mesmas regras e restrições que as outras pessoas seguem.", schemaKey: "ET" },
  { id: 18, text: "Tenho muita dificuldade em me forçar a realizar tarefas chatas ou rotineiras, mesmo quando são importantes.", schemaKey: "IS" },

  // Item 19-36 (Cycle 2)
  { id: 19, text: "Sinto que as pessoas não estão lá para suprir minhas necessidades emocionais de carinho e calor humano.", schemaKey: "ED" },
  { id: 20, text: "Sinto que as pessoas de quem eu gosto vão acabar me deixando ou desaparecendo da minha vida.", schemaKey: "AB" },
  { id: 21, text: "Sinto que preciso estar sempre alerta, pois as pessoas frequentemente tentam se aproveitar de mim.", schemaKey: "MA" },
  { id: 22, text: "Sinto-me muito diferente das outras pessoas e sinto que não pertenço a lugar nenhum.", schemaKey: "SI" },
  { id: 23, text: "Sinto que sou uma pessoa inerentemente imperfeita e cheia de falhas.", schemaKey: "DS" },
  { id: 24, text: "Sinto que sou incompetente quando me comparo com os outros em termos de conquistas e sucesso.", schemaKey: "FA" },
  { id: 25, text: "Preciso da opinião e do conselho de outras pessoas para tomar decisões cotidianas simples.", schemaKey: "DI" },
  { id: 26, text: "Preocupo-me constantemente com a possibilidade de ficar gravemente doente ou sofrer um acidente.", schemaKey: "VH" },
  { id: 27, text: "Sinto que não tenho uma identidade própria separada da identidade de meus pais ou parceiro.", schemaKey: "EM" },
  { id: 28, text: "Sinto que minhas próprias vontades e desejos não são importantes e que devo sempre agradar aos outros.", schemaKey: "SB" },
  { id: 29, text: "Sinto-me culpado quando dedico tempo ou dinheiro a mim mesmo em vez de ajudar os outros.", schemaKey: "SS" },
  { id: 30, text: "Esforço-me muito para obter a aprovação, o reconhecimento ou a admiração das pessoas ao meu redor.", schemaKey: "AS" },
  { id: 31, text: "Tendo a focar muito mais nos aspectos negativos da vida e dos meus relacionamentos do que nos positivos.", schemaKey: "NP" },
  { id: 32, text: "Controlo rigorosamente minhas emoções e impulsos para não parecer vulnerável ou perder a compostura.", schemaKey: "EI" },
  { id: 33, text: "Sinto uma pressão constante para realizar mais, produzir mais ou ser mais eficiente.", schemaKey: "US" },
  { id: 34, text: "Acho muito difícil perdoar os erros dos outros ou as minhas próprias falhas.", schemaKey: "PU" },
  { id: 35, text: "Sinto que mereço privilégios especiais e que minhas necessidades devem ser atendidas antes das dos outros.", schemaKey: "ET" },
  { id: 36, text: "Acho muito difícil resistir a impulsos de gratificação imediata (como comer demais, gastar demais, etc.).", schemaKey: "IS" },

  // Item 37-54 (Cycle 3)
  { id: 37, text: "Na maior parte da minha vida, não senti que sou especial ou importante para alguém.", schemaKey: "ED" },
  { id: 38, text: "Preocupo-me excessivamente com a possibilidade de que as pessoas que amo prefiram outra pessoa a mim.", schemaKey: "AB" },
  { id: 39, text: "Se eu não tomar cuidado, as pessoas vão me magoar, mentir para mim ou me manipular.", schemaKey: "MA" },
  { id: 40, text: "Sinto-me sozinho e excluído, como se fosse um estrangeiro na maior parte das situações sociais.", schemaKey: "SI" },
  { id: 41, text: "Sinto vergonha de quem sou; sinto que tenho segredos sombrios que não posso revelar a ninguém.", schemaKey: "DS" },
  { id: 42, text: "Sinto que sou um fracasso e que a maioria das pessoas da minha idade é mais bem-sucedida do que eu.", schemaKey: "FA" },
  { id: 43, text: "Sinto-me como uma criança quando se trata de gerenciar minhas responsabilidades práticas do dia a dia.", schemaKey: "DI" },
  { id: 44, text: "Sinto que o mundo é um lugar extremamente perigoso e que não estou seguro em lugar nenhum.", schemaKey: "VH" },
  { id: 45, text: "Muitas vezes sinto que meus pais ou parceiro vivem através de mim ou que eu vivo através deles.", schemaKey: "EM" },
  { id: 46, text: "Acho mais fácil ceder aos desejos dos outros do que expressar o que eu realmente quero.", schemaKey: "SB" },
  { id: 47, text: "As pessoas costumam me procurar com seus problemas porque sabem que eu sempre darei um jeito de ajudá-las.", schemaKey: "SS" },
  { id: 48, text: "Se eu não receber elogios ou reconhecimento pelo que faço, sinto-me desvalorizado ou sem importância.", schemaKey: "AS" },
  { id: 49, text: "Preocupo-me constantemente com o que pode dar errado em cada decisão que tomo.", schemaKey: "NP" },
  { id: 50, text: "Acho difícil expressar raiva ou descontentamento diretamente; prefiro guardar para mim.", schemaKey: "EI" },
  { id: 51, text: "Acho difícil relaxar e aproveitar o momento porque sinto que sempre há algo produtivo a ser feito.", schemaKey: "US" },
  { id: 52, text: "Sinto que o erro deve vir acompanhado de arrependimento profundo e punição adequada.", schemaKey: "PU" },
  { id: 53, text: "Acho muito difícil aceitar um 'no' como resposta ou tolerar ser contrariado.", schemaKey: "ET" },
  { id: 54, text: "Desisto facilmente de projetos ou metas quando eles começam a exigir esforço ou persistência a longo prazo.", schemaKey: "IS" },

  // Item 55-72 (Cycle 4)
  { id: 55, text: "Eu não tive ninguém que realmente me escutasse, me compreendesse ou estivesse sintonizado com minhas verdadeiras necessidades.", schemaKey: "ED" },
  { id: 56, text: "No final das contas, sinto que estarei sozinho porque as conexões na minha vida são instáveis.", schemaKey: "AB" },
  { id: 57, text: "É muito difícil para mim confiar nas pessoas; sinto que elas quase sempre têm segundas intenções.", schemaKey: "MA" },
  { id: 58, text: "Não me sinto parte de nenhuma comunidade ou grupo de amigos.", schemaKey: "SI" },
  { id: 59, text: "Se eu me expuser de verdade, as pessoas vão ver o quão inadequado e imperfeito eu sou por dentro.", schemaKey: "DS" },
  { id: 60, text: "Não me sinto tão inteligente ou talentoso quanto a maioria das pessoas que realizam o mesmo trabalho que eu.", schemaKey: "FA" },
  { id: 61, text: "Acho muito difícil tomar decisões importantes sem a aprovação ou ajuda de alguém próximo.", schemaKey: "DI" },
  { id: 62, text: "Preocupo-me frequentemente com a possibilidade de perder o controle de mim mesmo ou de enlouquecer.", schemaKey: "VH" },
  { id: 63, text: "É muito difícil para mim manter segredos ou limites privados em relação às pessoas que me são muito próximas.", schemaKey: "EM" },
  { id: 64, text: "Se eu expressar minha raiva ou discordar de alguém próximo, tenho medo de ser rejeitado ou punido.", schemaKey: "SB" },
  { id: 65, text: "Sinto-me responsável pelo bem-estar e pela felicidade das pessoas que estão ao meu redor.", schemaKey: "SS" },
  { id: 66, text: "Mudo meu comportamento ou minhas opiniões para me ajustar e ser aceito pelas pessoas de quem gosto.", schemaKey: "AS" },
  { id: 67, text: "Acho que as pessoas são excessivamente otimistas e que a realidade é muito mais difícil e cruel.", schemaKey: "NP" },
  { id: 68, text: "Sinto-me desconfortável quando as pessoas expressam sentimentos muito intensos perto de mim.", schemaKey: "EI" },
  { id: 70, text: "Fico muito irritado com as desculpas das pessoas quando elas falham em suas obrigações.", schemaKey: "PU" }, // note: replacing US Q69 with US Q87 and keeping sequence
  { id: 69, text: "Sou extremamente crítico comigo mesmo e com as falhas ou imperfeições que cometo.", schemaKey: "US" },
  { id: 71, text: "Sinto que sou especial e que as regras normais da sociedade não se aplicam a mim.", schemaKey: "ET" },
  { id: 72, text: "Acho difícil controlar minhas reações emocionais e impulsos imediatos no dia a dia.", schemaKey: "IS" },

  // Item 73-90 (Cycle 5)
  { id: 73, text: "Raramente tive alguém forte em quem eu pudesse me apoiar ou buscar proteção e conselhos.", schemaKey: "ED" },
  { id: 74, text: "Sinto que não posso contar com o apoio constante das pessoas de quem sou próximo; elas são imprevisíveis.", schemaKey: "AB" },
  { id: 75, text: "Tenho a sensação de que fui enganado ou abusado pelas pessoas em quem mais confiei no passado.", schemaKey: "MA" },
  { id: 76, text: "Sinto que sou uma pessoa solitária e que ninguém realmente me compreende ou compartilha dos meus interesses.", schemaKey: "SI" },
  { id: 77, text: "Sinto que sou inferior às outras pessoas e que não merece o amor ou o respeito delas.", schemaKey: "DS" },
  { id: 78, text: "Tenho medo de assumir novos desafios porque sinto que vou falhar ou decepcionar a todos.", schemaKey: "FA" },
  { id: 79, text: "Sinto que não consigo cuidar de mim mesmo no cotidiano e que preciso de alguém para me guiar.", schemaKey: "DI" },
  { id: 80, text: "Tenho ataques de ansiedade ou pânico pensando em possíveis desastres naturais ou crimes de que posso ser vítima.", schemaKey: "VH" },
  { id: 81, text: "Sinto que minha vida perderia totalmente o sentido se eu não estivesse conectado de forma tão intensa com meus pais ou parceiro.", schemaKey: "EM" },
  { id: 82, text: "Sinto que sou controlado pelas vontades alheias e que raramente consigo ser eu mesmo.", schemaKey: "SB" },
  { id: 83, text: "Acho muito difícil dizer 'não' quando alguém me pede um favor ou precisa da minha ajuda.", schemaKey: "SS" },
  { id: 84, text: "Preocupo-me muito em ter uma boa aparência, status social ou realizações para impressionar os outros.", schemaKey: "AS" },
  { id: 85, text: "Sinto que, por mais que eu me esforce, o resultado das coisas na minha vida quase sempre será decepcionante.", schemaKey: "NP" },
  { id: 86, text: "Prefiro parecer racional e frio a demonstrar o que realmente estou sentindo por dentro.", schemaKey: "EI" },
  { id: 87, text: "Tenho padrões de exigência tão altos para mim mesmo que raramente consigo ficar satisfeito com minhas conquistas.", schemaKey: "US" },
  { id: 88, text: "Sinto que as pessoas que cometem deslizes merecem sofrer as consequências rígidas sem compaixão excessiva.", schemaKey: "PU" },
  { id: 89, text: "Acho que tenho o direito de fazer o que eu quiser, mesmo que isso incomode ou prejudique os outros.", schemaKey: "ET" },
  { id: 90, text: "Tenho dificuldade em manter a autodisciplina necessária para alcançar meus objetivos profissionais ou pessoais.", schemaKey: "IS" }
];
