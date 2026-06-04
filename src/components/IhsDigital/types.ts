export enum Frequency {
  NEVER = 'A',
  RARELY = 'B',
  SOMETIMES = 'C',
  OFTEN = 'D',
  ALWAYS = 'E',
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  [Frequency.NEVER]: "Nunca ou Raramente (0-2 vezes em 10)",
  [Frequency.RARELY]: "Com Pouca Frequência (3-4 vezes em 10)",
  [Frequency.SOMETIMES]: "Com Regular Frequência (4-6 vezes em 10)",
  [Frequency.OFTEN]: "Muito Frequentemente (6-8 vezes em 10)",
  [Frequency.ALWAYS]: "Sempre ou Quase Sempre (8-10 vezes em 10)",
};

export interface Question {
  id: number;
  text: string;
  factor?: number;
}

export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  signatureUrl?: string;
  logoUrl?: string;
}

export interface Assessment {
  id: string;
  patient: PatientData;
  answers: Record<number, Frequency>;
  aiAnalysis: string;
  createdAt: string;
}

export const IHS_QUESTIONS: Question[] = [
  { id: 1, text: "Em um grupo de pessoas desconhecidas, fico à vontade, conversando naturalmente." },
  { id: 2, text: "Quando um de meus familiares (pais, irmãos mais velhos ou cônjuge) insiste em dizer o que eu devo fazer, contrariando o que penso, acabo aceitando para evitar problemas." },
  { id: 3, text: "Ao ser elogiado(a) sinceramente por alguém, respondo-lhe agradecendo." },
  { id: 4, text: "Em uma conversação, se uma pessoa me interrompe, solicito que aguarde até eu encerrar o que estava dizendo." },
  { id: 5, text: "Quando um(a) amigo(a) a quem emprestei dinheiro, esquece de me devolver, encontro um jeito de lembrá-lo(a)." },
  { id: 6, text: "Quando alguém faz algo que eu acho bom, mesmo que não seja diretamente a mim, faço menção a isso, elogiando-o(a) na primeira oportunidade." },
  { id: 7, text: "Ao sentir desejo de conhecer alguém a quem não fui apresentado(a), eu mesmo(a) me apresento a essa pessoa." },
  { id: 8, text: "Mesmo junto a conhecidos da escola ou trabalho, encontro dificuldade em participar da conversação (“enturmar”)." },
  { id: 9, text: "Evito fazer exposições ou palestras a pessoas desconhecidas." },
  { id: 10, text: "Em minha casa expresso sentimentos de carinho através de palavras e gestos a meus familiares." },
  { id: 11, text: "Em uma sala de aula ou reunião, se o professor ou dirigente faz uma afirmação incorreta, eu exponho meu ponto de vista." },
  { id: 12, text: "Se estou interessado(a) em uma pessoa para relacionamento sexual, consigo abordá-la para iniciar conversação." },
  { id: 13, text: "Em meu trabalho ou em minha escola, se alguém me faz um elogio, fico encabulado(a) sem saber o que dizer." },
  { id: 14, text: "Faço exposição (p.ex., palestras) em sala de aula ou no trabalho, quando sou indicado(a)." },
  { id: 15, text: "Quando um familiar me critica injustamente, expresso meu aborrecimento diretamente a ele." },
  { id: 16, text: "Em um grupo de pessoas conhecidas, se não concordo com a maioria, expresso verbalmente minha discordância." },
  { id: 17, text: "Em uma conversação com amigos, tenho dificuldade em encerrar a minha participação, preferindo aguardar que outros o façam." },
  { id: 18, text: "Quando um de meus familiares, por algum motivo, me critica, reajo de forma agressiva." },
  { id: 19, text: "Mesmo encontrando-me próximo(a) de uma pessoa importante, a quem gostaria de conhecer, tenho dificuldade em abordá-la para iniciar conversação." },
  { id: 20, text: "Quando estou gostando de alguém com quem venho saindo, tomo a iniciativa de expressar-lhe meus sentimentos." },
  { id: 21, text: "Ao receber uma mercadoria com defeito, dirijo-me até a loja onde a comprei, exigindo a sua substituição." },
  { id: 22, text: "Ao ser solicitado(a) por um(a) colega para colocar seu nome em um trabalho feito sem a sua participação, acabo aceitando mesmo achando que não devia." },
  { id: 23, text: "Evito fazer perguntas a pessoas desconhecidas." },
  { id: 24, text: "Tenho dificuldade em interromper uma conversa ao telefone mesmo com pessoas conhecidas." },
  { id: 25, text: "Ao deixar de gostar de uma pessoa com quem vinha saindo, tenho dificuldade em romper o relacionamento." },
  { id: 26, text: "Em campanhas de solidariedade, evito tarefas que envolvam pedir donativos ou favores a pessoas desconhecidas." },
  { id: 27, text: "Se um(a) amigo(a) abusa de minha boa vontade, expresso-lhe diretamente meu desagrado." },
  { id: 28, text: "Quando um de meus familiares (filhos, pais, irmãos, cônjuge) consegue alguma coisa importante pela qual se empenhou muito, eu o elogio pelo seu sucesso." },
  { id: 29, text: "Na escola ou no trabalho, quando não compreendo uma explicação sobre algo que estou interessado(a), faço as perguntas que julgo necessárias ao meu esclarecimento." },
  { id: 30, text: "Em uma situação de grupo, quando alguém é injustiçado, reajo em sua defesa." },
  { id: 31, text: "Ao entrar em um ambiente onde estão várias pessoas desconhecidas, cumprimento-as." },
  { id: 32, text: "Ao sentir que preciso de ajuda, tenho facilidade em pedi-la a alguém de meu círculo de amizades." },
  { id: 33, text: "Quando meu(minha) parceiro(a) insiste em fazer sexo sem o uso da camisinha, concordo para evitar que ele(a) fique irritado(a) ou magoado(a)." },
  { id: 34, text: "No trabalho ou na escola, concordo em fazer as tarefas que me pedem e que não são da minha obrigação, mesmo sentindo um certo abuso nesses pedidos." },
  { id: 35, text: "Se estou sentindo-me bem (feliz), expresso isso para as pessoas de meu círculo de amizades." },
  { id: 36, text: "Quando estou com uma pessoa que acabei de conhecer, sinto dificuldade em manter um papo interessante." },
  { id: 37, text: "Se preciso pedir um favor a um(a) colega, acabo desistindo de fazê-lo." },
  { id: 38, text: "Consigo “levar na esportiva” as gozações de colegas de escola ou de trabalho a meu respeito." },
  { id: 39, text: "Ao receber uma avaliação muito abaixo do que merecia, fico chateado(a) mas evito discuti-la com o professor." },
  { id: 40, text: "Em uma situação de conflito de opiniões, consigo convencer os demais para a minha posição." },
  { id: 41, text: "Em uma fila (banco, cinema, etc), se um estranho passa à minha frente, fico calado(a) sem manifestar meu desagrado." },
  { id: 42, text: "Prefiro ocultar minha opinião a ferir sentimentos alheios, mesmo quando solicitado(a) a dizer o que penso." }
];
