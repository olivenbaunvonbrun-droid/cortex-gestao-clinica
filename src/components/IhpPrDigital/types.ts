export enum Frequency {
  F1 = 1,
  F2 = 2,
  F3 = 3,
  F4 = 4,
  F5 = 5
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  [Frequency.F1]: 'Nunca ou quase nunca descreve meu comportamento',
  [Frequency.F2]: 'Pouco descreve meu comportamento',
  [Frequency.F3]: 'Regularmente descreve meu comportamento',
  [Frequency.F4]: 'Muito descreve meu comportamento',
  [Frequency.F5]: 'Sempre ou quase sempre descreve meu comportamento'
};

export interface IhpQuestion {
  id: number;
  text: string;
  categoryKey: string;
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

export interface HpCategoryDetails {
  name: string;
  description: string;
  minVal: number;
  maxVal: number;
}

export const HP_DETAILS: Record<string, HpCategoryDetails> = {
  ach: {
    name: 'Autoconhecimento',
    description: 'Compreender as próprias emoções, gatilhos, valores pessoais e padrões gerais de comportamento.',
    minVal: 19,
    maxVal: 95
  },
  aue: {
    name: 'Autoestima',
    description: 'Autovalorização saudável, autoaceitação, autocompaixão e autoconfiança de forma equilibrada.',
    minVal: 20,
    maxVal: 100
  },
  rro: {
    name: 'Raciocínio Realisticamente Otimista',
    description: 'Enxergar a realidade com esperança e otimismo, mantendo o pragmatismo e o foco nos fatos reais.',
    minVal: 27,
    maxVal: 135
  },
  are: {
    name: 'Autorregulação Emocional',
    description: 'Habilidade de modular emoções intensas de forma saudável, sem impulsividade ou inibição excessiva.',
    minVal: 15,
    maxVal: 75
  },
  ref: {
    name: 'Resolutividade e Enfrentamento',
    description: 'Proatividade para resolver problemas práticos e lidar assertivamente com conflitos ou conversas difíceis.',
    minVal: 17,
    maxVal: 85
  },
  ims: {
    name: 'Imunidade Social',
    description: 'Resiliência a críticas, pressão de grupos, desaprovação alheia e necessidade excessiva de aprovação externa.',
    minVal: 12,
    maxVal: 60
  },
  auc: {
    name: 'Autocontrole',
    description: 'Capacidade de adiar gratificação imediata em prol de metas maiores e de regular impulsos de curto prazo.',
    minVal: 15,
    maxVal: 75
  },
  soc: {
    name: 'Sociabilidade',
    description: 'Facilidade para iniciar, manter e aprofundar conexões interpessoais e cultivar relacionamentos saudáveis.',
    minVal: 14,
    maxVal: 70
  },
  hed: {
    name: 'Hedonismo Responsável',
    description: 'Equilibrar deveres e responsabilidades com momentos genuínos de lazer, diversão, relaxamento e prazer.',
    minVal: 15,
    maxVal: 75
  },
  ses: {
    name: 'Sensibilidade Social',
    description: 'Empatia, escuta ativa, percepção do estado emocional do próximo e compaixão em relação ao outro.',
    minVal: 18,
    maxVal: 90
  }
};

export const IHP_QUESTIONS: IhpQuestion[] = [
  { id: 1, text: "Consigo identificar e nomear diferentes emoções quando as experimento.", categoryKey: "ach" },
  { id: 2, text: "Consigo identificar o que dispara os meus diferentes sentimentos.", categoryKey: "ach" },
  { id: 3, text: "Consigo saber o que quero produzir quando ajo.", categoryKey: "ach" },
  { id: 4, text: "Percebo minhas diferentes necessidades em cada contexto.", categoryKey: "ach" },
  { id: 5, text: "Observo bem meus pensamentos e como eles me afetam.", categoryKey: "ach" },
  { id: 6, text: "Observo minhas mudanças de comportamentos em diferentes contextos.", categoryKey: "ach" },
  { id: 7, text: "Consigo relacionar minhas reações atuais a experiências que tive.", categoryKey: "ach" },
  { id: 8, text: "Percebo quando o que penso, sinto e faço foi influenciado por instruções ou modelos de pessoas significativas em minha vida.", categoryKey: "ach" },
  { id: 9, text: "Percebo quando o que penso, sinto e faço foi influenciado por grupos sociais (amigos, igreja, escola).", categoryKey: "ach" },
  { id: 10, text: "Reconheço quando não sei ou não sou competente em algo.", categoryKey: "ach" },
  { id: 11, text: "Reconheço quando sei ou sou competente em algo.", categoryKey: "ach" },
  { id: 12, text: "Consigo identificar minhas características mais marcantes.", categoryKey: "ach" },
  { id: 13, text: "Sei descrever meus comportamentos mais problemáticos.", categoryKey: "ach" },
  { id: 14, text: "Sei descrever meus comportamentos mais apreciáveis.", categoryKey: "ach" },
  { id: 15, text: "Consigo saber o que as pessoas que convivem comigo veem de bom e ruim a meu respeito.", categoryKey: "ach" },
  { id: 16, text: "Reconheço que os comportamentos apreciáveis que exibo derivam de pessoas, experiências e oportunidades que tive.", categoryKey: "ach" },
  { id: 17, text: "Reconheço que os comportamentos indesejáveis que exibo vieram de relações e experiências problemáticas que tive.", categoryKey: "ach" },
  { id: 18, text: "Percebo que as minhas limitações, inseguranças e dificuldades resultam da falta de oportunidade para aprendizados eficazes.", categoryKey: "ach" },
  { id: 19, text: "Por melhor que eu seja em algo comparado a outras pessoas, evito me mostrar superior, porque sei que tive oportunidades de aprendizados que elas não tiveram. E no que elas puderam se desenvolver e eu não, são mais competentes.", categoryKey: "ach" },
  { id: 20, text: "Gosto muito da minha aparência.", categoryKey: "aue" },
  { id: 21, text: "Não mudaria qualquer aspecto do meu corpo.", categoryKey: "aue" },
  { id: 22, text: "Gosto do meu estilo e jeito de vestir.", categoryKey: "aue" },
  { id: 23, text: "Sinto-me disposto e vigoroso.", categoryKey: "aue" },
  { id: 24, text: "Gosto da minha saúde física.", categoryKey: "aue" },
  { id: 25, text: "Me considero uma pessoa agradável e de fácil convivência.", categoryKey: "aue" },
  { id: 26, text: "Percebo que as pessoas gostam de mim assim que me conhecem.", categoryKey: "aue" },
  { id: 27, text: "Facilmente formo e mantenho vínculos duradouros de amizade.", categoryKey: "aue" },
  { id: 28, text: "Gosto do meu jeito de ser, personalidade e valores.", categoryKey: "aue" },
  { id: 29, text: "Aprendo facilmente as coisas que me interessam.", categoryKey: "aue" },
  { id: 30, text: "Tenho muitas habilidades e aprecio as coisas que aprendi.", categoryKey: "aue" },
  { id: 31, text: "Me sinto confiante em fazer qualquer coisa que exija minhas competências.", categoryKey: "aue" },
  { id: 32, text: "Cuido bem da minha saúde com exercícios, alimentação e exames médicos.", categoryKey: "aue" },
  { id: 33, text: "Cuido bem da minha aparência.", categoryKey: "aue" },
  { id: 34, text: "Procuro aprender coisas novas e melhorar o que sei.", categoryKey: "aue" },
  { id: 35, text: "Reconheço meus valores e competências.", categoryKey: "aue" },
  { id: 36, text: "Não prejudicando a outros, me priorizo e trabalho por meus interesses.", categoryKey: "aue" },
  { id: 37, text: "Busco lazer e diversão frequentes em minha rotina.", categoryKey: "aue" },
  { id: 38, text: "Sinto que me valorizam pelas minhas competências.", categoryKey: "aue" },
  { id: 39, text: "Sinto que me admiram pelos meus valores.", categoryKey: "aue" },
  { id: 40, text: "Mudo de opinião quando reconheço algo mais consistente e coerente.", categoryKey: "rro" },
  { id: 41, text: "Quando me interesso por algo que não sei, busco informações e evidências para formar e sustentar uma opinião.", categoryKey: "rro" },
  { id: 42, text: "Mudo de opinião diante de uma argumentação mais consistente e coerente.", categoryKey: "rro" },
  { id: 43, text: "Rejeito qualquer concepção ou argumento sem evidência.", categoryKey: "rro" },
  { id: 44, text: "Busco conceitos ou argumentos úteis para lidar com um problema.", categoryKey: "rro" },
  { id: 45, text: "Rejeito qualquer conceito ou argumento que não me ajude a lidar com um problema.", categoryKey: "rro" },
  { id: 46, text: "Rejeito concepções ou argumentos meramente especulativos ou simplórios.", categoryKey: "rro" },
  { id: 47, text: "Acredito que a maioria das coisas seja explicada por múltiplos fatores, mesmo que eu não os conheça.", categoryKey: "rro" },
  { id: 48, text: "Acredito que a maioria das coisas seja explicada por uma cadeia de acontecimentos ou fatores ao longo de um tempo.", categoryKey: "rro" },
  { id: 49, text: "Não acredito que as coisas surjam espontaneamente, mas que resultam de interações e transformações a partir de outras, mesmo que ao longo de muito tempo.", categoryKey: "rro" },
  { id: 50, text: "Para mim, nada pode ser afirmado se não puder ser demonstrado.", categoryKey: "rro" },
  { id: 51, text: "Para mim, o que pode ser afirmado sem evidência, pode ser negado sem evidência.", categoryKey: "rro" },
  { id: 52, text: "Se uma concepção não pode ser demonstrada ou é inútil, devo buscar outra melhor.", categoryKey: "rro" },
  { id: 53, text: "Assumo que não sei quando não tenho informação ou evidências sobre algo.", categoryKey: "rro" },
  { id: 54, text: "Acredito que há uma explicação verificável para as coisas, mesmo que eu a desconheça ou não tenha sido descoberta.", categoryKey: "rro" },
  { id: 55, text: "Tudo que existe e ocorre é físico e faz parte de um único universo natural de matéria e energia.", categoryKey: "rro" },
  { id: 56, text: "Quem afirma algo tem a responsabilidade de comprovar sua afirmação.", categoryKey: "rro" },
  { id: 57, text: "Aceito os fatos, ainda que incompatíveis com minhas idealizações e desejos.", categoryKey: "rro" },
  { id: 58, text: "Melhor enxergar as difíceis realidades da vida e tentar mudá-las se possível, do que um autoengano confortável.", categoryKey: "rro" },
  { id: 59, text: "Busco ver as coisas pelo lado bom e esperar sempre o melhor, ainda que de situações difíceis.", categoryKey: "rro" },
  { id: 60, text: "Quando algo não sai como eu espero, reviso a situação e extraio lições.", categoryKey: "rro" },
  { id: 61, text: "Quando não entendo algo importante para mim, busco decompor, estabelecer relações, interpretar e obter mais informações até compreender significativamente.", categoryKey: "rro" },
  { id: 62, text: "Tento agir em conformidade com o que acredito e defendo.", categoryKey: "rro" },
  { id: 63, text: "Tento conhecer uma diversidade de assuntos e examinar diferentes fontes, orientando minha conduta eficazmente.", categoryKey: "rro" },
  { id: 64, text: "Costumo reconhecer necessidades, direitos e propriedades das pessoas.", categoryKey: "rro" },
  { id: 65, text: "Tomo decisões analisando evidências e consequências de cada alternativa.", categoryKey: "rro" },
  { id: 66, text: "Procuro recompensar ou punir proporcionalmente um ato, de acordo com seus impactos, independente de quem o praticou.", categoryKey: "rro" },
  { id: 67, text: "Lido bem com meus sentimentos desagradáveis.", categoryKey: "are" },
  { id: 68, text: "Quando sinto uma emoção desconfortável, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 69, text: "Quando sinto medo ou ansiedade, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 70, text: "Quando sinto raiva, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 71, text: "Quando me sinto frustrado, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 72, text: "Quando fico triste, respiro fundo, espero passar ou tento me envolver com outras atividades até melhorar.", categoryKey: "are" },
  { id: 73, text: "Quando sinto culpa, respiro fundo, espero passar ou tento me envolver com outras atividades até melhorar.", categoryKey: "are" },
  { id: 74, text: "Quando sinto vergonha, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 75, text: "Quando me sinto eufórico para fazer algo, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 76, text: "Quando me sinto carente ou sozinho, respiro fundo, espero passar ou tento me envolver com outras atividades até melhorar.", categoryKey: "are" },
  { id: 77, text: "Quando me sinto angustiado com uma decisão a tomar, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 78, text: "Quando me sinto inseguro se uma decisão vai ser boa ou não, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar para decidir melhor.", categoryKey: "are" },
  { id: 79, text: "Quando sinto uma emoção desconfortável, evito me acalmar com coisas prejudiciais (fumar, comer compulsivamente, drogar-se, jogar patologicamente, reclamar excessivamente).", categoryKey: "are" },
  { id: 80, text: "Quando sinto incômodo com opiniões e condutas diferentes e não nocivas, respiro fundo, espero passar ou tento me envolver com outras atividades até me acalmar.", categoryKey: "are" },
  { id: 81, text: "Mesmo desconfortável com opiniões, sentimentos e condutas de alguém, quando não prejudiciais, me esforço para acolher e defender seu direito de expressão.", categoryKey: "are" },
  { id: 82, text: "Sei fazer uma análise de risco, probabilidades negativas e positivas antes de uma tomada de decisão.", categoryKey: "ref" },
  { id: 83, text: "Mesmo ansioso diante de uma situação com chance remota de perigo, consigo fazer o que considero necessário.", categoryKey: "ref" },
  { id: 84, text: "Quando surge um problema, conflito ou estressor, me ponho logo a resolvê-lo.", categoryKey: "ref" },
  { id: 85, text: "Consigo formular diferentes soluções para um problema e ter alternativas se a escolhida falhar.", categoryKey: "ref" },
  { id: 86, text: "Não me dou por vencido até encontrar uma solução para problemas que me afetam ou objetivos que desejo alcançar.", categoryKey: "ref" },
  { id: 87, text: "Recombino coisas e estratégias até criar uma forma de resolver um problema ou atender uma necessidade.", categoryKey: "ref" },
  { id: 88, text: "Mesmo com dúvidas se uma estratégia funcionará, testo-a antes de desistir.", categoryKey: "ref" },
  { id: 89, text: "Reluto a fazer algo só porque todos fazem ou me cobram, a menos que considere a proposta razoável.", categoryKey: "ref" },
  { id: 90, text: "Se considero nocivo alguma coisa, atividade, regra ou conduta humana, me posiciono contra e me recuso a aderir.", categoryKey: "ref" },
  { id: 91, text: "Se considero nocivo alguma coisa, atividade, regra ou conduta humana, luto contra ela.", categoryKey: "ref" },
  { id: 92, text: "Expresso minhas opiniões, mesmo que não sejam convencionais ou agradem a todos.", categoryKey: "ref" },
  { id: 93, text: "Quando faço alguma coisa que afeta alguém, assumo a responsabilidade e lido com as consequências.", categoryKey: "ref" },
  { id: 94, text: "Se alguém me diz algo ofensivo, expresso incômodo.", categoryKey: "ref" },
  { id: 95, text: "Se alguém tenta interferir em minhas decisões ou atividades que não prejudicam a mim ou a outros, exijo respeito para preservar minha liberdade.", categoryKey: "ref" },
  { id: 96, text: "Se vejo alguém ofendendo ou prejudicando uma pessoa que não pode se defender, me disponho a protegê-la.", categoryKey: "ref" },
  { id: 97, text: "Antes de pedir ajuda ou delegar um problema, busco alternativas para solucioná-lo.", categoryKey: "ref" },
  { id: 98, text: "Raramente fico paralisado ou procrastino o enfrentamento de um problema só porque ele me incomoda ou não sei o que fazer.", categoryKey: "ref" },
  { id: 99, text: "Gosto de tomar decisões baseado no meu próprio julgamento, valores e resultados desejados.", categoryKey: "ims" },
  { id: 100, text: "Não me importo com o que os outros vão pensar quando desejo me engajar em algo que considero benéfico.", categoryKey: "ims" },
  { id: 101, text: "Não me importo em fazer coisas de que as pessoas se envergonham, desde que não faça mal a alguém.", categoryKey: "ims" },
  { id: 102, text: "Não me importo em fazer coisas que sei que criticarão, desde que não faça mal a alguém.", categoryKey: "ims" },
  { id: 103, text: "Não me importo em fazer coisas que quase ninguém faz, desde que não faça mal a alguém.", categoryKey: "ims" },
  { id: 104, text: "Não consulto e não preciso da opinião das pessoas para coisas que estou seguro de que não prejudica alguém.", categoryKey: "ims" },
  { id: 105, text: "Gosto de fazer as coisas ao meu modo e com meus recursos, independente do modo como outros fazem.", categoryKey: "ims" },
  { id: 106, text: "Expresso quando oportuno opiniões não ofensivas, sem me preocupar se as pessoas irão gostar ou não.", categoryKey: "ims" },
  { id: 107, text: "Não tenho a necessidade de ser amado, aprovado ou admirado por todas as pessoas.", categoryKey: "ims" },
  { id: 108, text: "Se alguém discorda de mim ou critica minhas opiniões e atitudes, isso raramente me incomoda.", categoryKey: "ims" },
  { id: 109, text: "Falo a verdade e sou franco com o que quero das pessoas.", categoryKey: "ims" },
  { id: 110, text: "Não me importo com as opiniões alheias porque costumo agir e tomar decisões pensando bem nas consequências dos meus atos sobre mim e os demais.", categoryKey: "ims" },
  { id: 111, text: "Só construo metas que consigo alcançar com minhas capacidades e potenciais.", categoryKey: "auc" },
  { id: 112, text: "Consigo pensar em cada etapa a ser executada para alcançar minhas metas.", categoryKey: "auc" },
  { id: 113, text: "Consigo listar as atividades necessárias ao alcance de uma meta.", categoryKey: "auc" },
  { id: 114, text: "Consigo estabelecer prazos e cumpri-los.", categoryKey: "auc" },
  { id: 115, text: "Agendo tarefas em minha rotina para dar conta de todas elas.", categoryKey: "auc" },
  { id: 116, text: "Sei estabelecer prioridades para atender urgências e importâncias.", categoryKey: "auc" },
  { id: 117, text: "Raramente \"enrolo” ou procrastino as tarefas.", categoryKey: "auc" },
  { id: 118, text: "Consigo organizar e disponibilizar os materiais que precisarei para alcançar um resultado.", categoryKey: "auc" },
  { id: 119, text: "Consigo remover do meu ambiente tudo aquilo que me distrai e “rouba\" meu tempo.", categoryKey: "auc" },
  { id: 120, text: "Quando marco um compromisso, raramente me atraso, falto ou desmarco.", categoryKey: "auc" },
  { id: 121, text: "Consigo evitar diversões banais, nocivas ou que me impeçam de alcançar metas.", categoryKey: "auc" },
  { id: 122, text: "Sou dedicado ao aprendizado do que for necessário para me tornar mais competente e prosperar.", categoryKey: "auc" },
  { id: 123, text: "Quando encontro dificuldades para alcançar um resultado, me esforço mais ou penso em outras estratégias.", categoryKey: "auc" },
  { id: 124, text: "Não deixo que outras pessoas boicotem meus objetivos, mesmo que tenha que ser firme com elas ou me afastar.", categoryKey: "auc" },
  { id: 125, text: "Quando sei que algo de que gosto pode me fazer mal ou a alguém, interrompo esse mau hábito imediatamente.", categoryKey: "auc" },
  { id: 126, text: "Consigo iniciar e manter conversas com qualquer pessoa, em qualquer lugar.", categoryKey: "soc" },
  { id: 127, text: "Consigo me expressar e explicar coisas de forma clara e compreensível às pessoas.", categoryKey: "soc" },
  { id: 128, text: "Quando atraído ou interessado em alguém, sei cortejar e tentar cativar essa pessoa.", categoryKey: "soc" },
  { id: 129, text: "Sei tratar bem as pessoas e agir em conformidade com diferentes ambientes.", categoryKey: "soc" },
  { id: 130, text: "Conheço estratégias de persuasão para convencer alguém de uma ideia ou induzir uma ação.", categoryKey: "soc" },
  { id: 131, text: "Sei mediar conflitos e acalmar as pessoas.", categoryKey: "soc" },
  { id: 132, text: "Tenho facilidade para pechinchar e negociar as coisas que me interessam.", categoryKey: "soc" },
  { id: 133, text: "Tenho facilidade para montar uma palestra e falar em público.", categoryKey: "soc" },
  { id: 134, text: "Em decisões coletivas, costumo tomar a iniciativa e tenho facilidade para coordenar as pessoas.", categoryKey: "soc" },
  { id: 135, text: "Sou carinhoso e expresso meus sentimentos de afeto pelas pessoas que gosto.", categoryKey: "soc" },
  { id: 136, text: "Costumo elogiar as pessoas por características e atitudes que aprecio.", categoryKey: "soc" },
  { id: 137, text: "Costumo ser bem humorado, brincar com as pessoas e recebo bem suas gozações.", categoryKey: "soc" },
  { id: 138, text: "Percebo que as pessoas me elegem como porta-voz de notícias desagradáveis e me procuram para se consolarem.", categoryKey: "soc" },
  { id: 139, text: "Sei pedir e conseguir a adesão das pessoas.", categoryKey: "soc" },
  { id: 140, text: "Minhas necessidades são tão ou mais importantes quanto à de qualquer pessoa e, havendo um conflito de interesses, dedico-me as minhas tanto quanto todos devem se dedicar as próprias.", categoryKey: "hed" },
  { id: 141, text: "Estou sempre orientado para meus interesses desde que ninguém saia prejudicado.", categoryKey: "hed" },
  { id: 142, text: "Consigo encontrar tempo para hobbies e diversões.", categoryKey: "hed" },
  { id: 143, text: "Cuido da minha alimentação para manter-me saudável, vigoroso e com boa aparência.", categoryKey: "hed" },
  { id: 144, text: "Faço regularmente exercícios que gosto para manter-me saudável, vigoroso e com boa aparência.", categoryKey: "hed" },
  { id: 145, text: "Costumo planejar como me divertirei ou relaxarei no final de semana ou tempo livre.", categoryKey: "hed" },
  { id: 146, text: "Escolho sempre fontes de prazer que não me tragam danos ou a outros.", categoryKey: "hed" },
  { id: 147, text: "Consigo me entreter e divertir de diferentes formas.", categoryKey: "hed" },
  { id: 148, text: "Aprendi ao longo da vida muitas formas de diversão.", categoryKey: "hed" },
  { id: 149, text: "Consigo me entreter e divertir com pouco e de formas bastante simples.", categoryKey: "hed" },
  { id: 150, text: "Tenho habilidades que me permitem entretenimento e diversão em muitos lugares.", categoryKey: "hed" },
  { id: 151, text: "Meus lazeres não ofendem nem prejudicam qualquer pessoa.", categoryKey: "hed" },
  { id: 152, text: "Sou capaz de inventar brincadeiras e passatempos em muitos lugares ou situações.", categoryKey: "hed" },
  { id: 153, text: "Consigo me concentrar intensamente em atividades que me relaxam ou divertem.", categoryKey: "hed" },
  { id: 154, text: "Gosto de brincadeiras e levo na esportiva as saudáveis e bem-humoradas.", categoryKey: "hed" },
  { id: 155, text: "Tenho facilidade de me imaginar nas situações das pessoas.", categoryKey: "ses" },
  { id: 156, text: "Me comovo ou compadeço com o sofrimento alheio.", categoryKey: "ses" },
  { id: 157, text: "Consigo perceber o que as pessoas precisam sem que elas digam.", categoryKey: "ses" },
  { id: 158, text: "Costumo perceber o humor das pessoas só olhando ou conversando com elas.", categoryKey: "ses" },
  { id: 159, text: "Costumo elogiar as pessoas por características e atitudes que aprecio.", categoryKey: "ses" },
  { id: 160, text: "Percebo que as pessoas gostam de mim logo que me conhecem.", categoryKey: "ses" },
  { id: 161, text: "Construo intimidade com muita facilidade.", categoryKey: "ses" },
  { id: 162, text: "Sei formar e manter duradouros vínculos de amizade.", categoryKey: "ses" },
  { id: 163, text: "As pessoas de quem gosto contam comigo sempre que precisam.", categoryKey: "ses" },
  { id: 164, text: "Se percebo que um amigo está em apuros, prontamente lhe ofereço ajuda.", categoryKey: "ses" },
  { id: 165, text: "Tenho pessoas a quem recorrer em situações de necessidade.", categoryKey: "ses" },
  { id: 166, text: "Mesmo magoado com alguém, estou disponível para perdoar e ajudar.", categoryKey: "ses" },
  { id: 167, text: "Se tenho algo em abundância, costumo ceder a quem precise.", categoryKey: "ses" },
  { id: 168, text: "Frequentemente faço mais pelas pessoas do que elas me pedem.", categoryKey: "ses" },
  { id: 169, text: "Se vejo alguém ofendendo ou prejudicando uma pessoa que não pode se defender, me disponho a protegê-la.", categoryKey: "ses" },
  { id: 170, text: "Se me pedem ajuda, sendo possível, atendo.", categoryKey: "ses" },
  { id: 171, text: "Procuro pensar nas pessoas quando combino algo ou tenho que dividir alguma coisa.", categoryKey: "ses" },
  { id: 172, text: "As pessoas confiam em mim porque sou um bom confidente, não dissimulo nem manipulo.", categoryKey: "ses" }
];
