import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  CheckCircle2, Sparkles, Heart, Scale, Award, Sliders, Activity, 
  Trash2, Plus, Info, Check, Copy, FileText, ChevronRight, Bookmark, 
  BookOpen, Eye, Edit2, Star, PlusCircle, HelpCircle,
  ShieldAlert, Lightbulb, CheckSquare, Users
} from "lucide-react";

export interface TherapeuticReflection {
  phraseId: string;
  reflectionText: string;
  isMantra: boolean;
}

export interface ExameMentalidadesSaudaveisState {
  selectedPhrases: string[]; // List of phrase IDs that are favorited/selected
  reflections: TherapeuticReflection[]; // Therapeutic writing for each phrase
  customPhrases: { id: string; text: string; author: string }[];
  clinicalNotes: string;
}

interface ExameMentalidadesSaudaveisViewProps {
  patient: PatientInfo;
  toolId: string;
  state: ExameMentalidadesSaudaveisState;
  setState: React.Dispatch<React.SetStateAction<ExameMentalidadesSaudaveisState>>;
}

interface DefaultPhrase {
  id: string;
  text: string;
  author: string;
}

// Data sources for the 5 HP tools
const HEDONISMO_RESPONSAVEL_PHRASES: DefaultPhrase[] = [
  { id: "hed-1", text: "Seu tempo de vida é um bem esgotável. Aproveite-o bem.", author: "Lincoln Poubel" },
  { id: "hed-2", text: "Cuidado para não perder a vida tentando ganhá-la.", author: "Desconhecido" },
  { id: "hed-3", text: "Trabalhe para viver, não viva para trabalhar.", author: "Desconhecido" },
  { id: "hed-4", text: "Existir longamente é diferente de viver intensamente.", author: "Desconhecido" },
  { id: "hed-5", text: "Uma vida simples não é uma vida simplória.", author: "Mário Sérgio Cortella" },
  { id: "hed-6", text: "Não espere se sentir bem para fazer algo. Envolva-se com algo que lhe faça se sentir bem.", author: "Lincoln Poubel" },
  { id: "hed-7", text: "Não passe pela vida sem que a vida passe por você.", author: "Desconhecido" },
  { id: "hed-8", text: "Existe uma diferença entre passar o dia e aproveitar o dia.", author: "Pedro Rodrigues" },
  { id: "hed-9", text: "O bem da humanidade deve consistir em que cada um goze o máximo de alegrais que possa, sem diminuir a alegria dos outros.", author: "Aldous Huxley" },
  { id: "hed-10", text: "Compre experiências, não apenas coisas materiais.", author: "Pedro Rodrigues" },
  { id: "hed-11", text: "Você deve sentar-se em meditação por 20 minutos ao dia, a não ser que esteja muito ocupado. Neste caso, deve sentar-se por 1 hora.", author: "Provérbio Zen" },
  { id: "hed-12", text: "Não deixe nada para amanhã. Somos instantes e num instante não somos nada.", author: "Desconhecido" },
  { id: "hed-13", text: "A vida é curta, então curta a vida.", author: "Desconhecido" },
  { id: "hed-14", text: "É curioso como a vida, tanto mais vazia, mais pesa.", author: "Léon Daudi" },
  { id: "hed-15", text: "O significado está na própria circunstância.", author: "Desconhecido" }
];

const AUTOCONHECIMENTO_PHRASES: DefaultPhrase[] = [
  { id: "aut-1", text: "Não podemos fazer mais do que a nossa história proporcionou de repertório.", author: "THP" },
  { id: "aut-2", text: "Uma pessoa que se “tornou consciente de si mesma” está em melhor posição de prever e controlar seu próprio comportamento.", author: "Skinner" },
  { id: "aut-3", text: "As ações são carregadas de experiências.", author: "Desconhecido" },
  { id: "aut-4", text: "O passado é lugar de referência, não de residência.", author: "Desconhecido" },
  { id: "aut-5", text: "É muito difícil conhecer as nossas limitações. Mas saiba que todos têm limitações.", author: "Desconhecido" },
  { id: "aut-6", text: "Cada pessoa é uma coletânea de experiências.", author: "Pedro Rodrigues" },
  { id: "aut-7", text: "É fácil encarar o passado como uma carga em vez de uma escola. É fácil deixar que ele o soterre em vez de educá-lo.", author: "Jim Rohn" },
  { id: "aut-8", text: "Nada é mais refinado que a simplicidade.", author: "Desconhecido" },
  { id: "aut-9", text: "Muitas vezes precisamos de respostas para perguntas que nem conseguimos formular.", author: "Pedro Rodrigues" },
  { id: "aut-10", text: "A vida só pode ser compreendida olhando para trás; mas só pode ser vivida olhando para frente.", author: "Soren Kierkegaard" },
  { id: "aut-11", text: "Cada vez que você subir um degrau no sucesso, suba dois na humildade.", author: "Desconhecido" },
  { id: "aut-12", text: "Quanto mais você investe em fantasias sobre você mesmo, menos terá os resultados que deseja ter na sua vida.", author: "Pedro Rodrigues" },
  { id: "aut-13", text: "Sou hoje o melhor que consegui ser, com o que eu tive que lidar.", author: "Pedro Rodrigues" },
  { id: "aut-14", text: "Refletir sobre os erros é o primeiro passo para não repeti-los.", author: "Lincoln Poubel" },
  { id: "aut-15", text: "Se antes eu tivesse a maturidade de hoje, talvez não tivesse errado tanto. Se eu não tivesse errado tanto, certamente não teria a maturidade de hoje.", author: "Desconhecido" },
  { id: "aut-16", text: "Aquilo que rejeitas te aprisiona. Aquilo que reconheces te liberta.", author: "Bert Hellinger" },
  { id: "aut-17", text: "Quando vires um homem bom, tenta imitá-lo; quando vires um homem mau, examina-te a ti mesmo.", author: "Confúcio" },
  { id: "aut-18", text: "Não possuímos virtudes antes de colocá-las em prática.", author: "Aristóteles" },
  { id: "aut-19", text: "Os hábitos que formamos desde a infância não fazem pouca diferença – na verdade, fazem toda a diferença.", author: "Aristóteles" },
  { id: "aut-20", text: "Uma vida desorganizada revela uma desordem interior.", author: "Desconhecido" },
  { id: "aut-21", text: "Podemos usar o passado como combustível para o crescimento no presente.", author: "Desconhecido" },
  { id: "aut-22", text: "Um adulto pode acreditar que o tratamento recebido na sua infância é o que ele merece.", author: "Desconhecido" },
  { id: "aut-23", text: "Tudo que você viveu interfere na sua vida, mesmo que não se lembre.", author: "Desconhecido" },
  { id: "aut-24", text: "Você é o registro vivo de sua história. Você é uma longa história.", author: "Desconhecido" },
  { id: "aut-25", text: "Eu sou eu e minha circunstância, e se não salvo a ela, não me salvo a mim.", author: "Ortega y Gasset" }
];

const AUTOESTIMA_PHRASES: DefaultPhrase[] = [
  { id: "est-1", text: "A maneira de desenvolver autoconfiança é obter um registro de experiências que foram bem-sucedidas.", author: "Lowel Thomas" },
  { id: "est-2", text: "Reconhecer humildemente as próprias virtudes não é arrogância, mas autoconfiança.", author: "Lincoln Poubel" },
  { id: "est-3", text: "Nossas características sempre serão boas para quem precisa delas.", author: "Lincoln Poubel" },
  { id: "est-4", text: "Tome bastante cuidado com seu corpo. É o único lugar que você tem para viver.", author: "Jim Rohn" },
  { id: "est-5", text: "Devemos estimar os valores que cada fase da vida exibe: a curiosidade das crianças, a força dos jovens, a seriedade dos adultos e a sabedoria da velhice.", author: "Pedro Rodrigues" },
  { id: "est-6", text: "Desenvolva seus interesses, porque se sua vida não for interessante para você, poderá não ser para mais ninguém.", author: "Desconhecido" },
  { id: "est-7", text: "O seu físico não revela todo o seu íntimo.", author: "Pedro Rodrigues" },
  { id: "est-8", text: "Quem não se enfeita por si se enjeita. Quem não se cuida se rejeita.", author: "Provérbio português" },
  { id: "est-9", text: "Solidão também se cura com amor próprio.", author: "Desconhecido" },
  { id: "est-10", text: "Se alguém lhe perguntasse 'o que você mais ama no mundo', quanto tempo você demoraria para citar a si mesmo?", author: "Desconhecido" }
];

const RACIOCINIO_OTIMISTA_PHRASES: DefaultPhrase[] = [
  { id: "oti-1", text: "Nunca se desvie; não se deixe desviar dos fatos.", author: "Bertrand Russel" },
  { id: "oti-2", text: "O conhecimento é relativo e provisório porque se afirmam os dados, mas novas informações levam a novas conclusões.", author: "Lincoln Poubel" },
  { id: "oti-3", text: "A ciência é uma disposição de aceitar os fatos mesmo quando eles são opostos aos desejos.", author: "B. F. Skinner" },
  { id: "oti-4", text: "O sábio pode mudar de opinião. O ignorante nunca.", author: "Immanuel Kant" },
  { id: "oti-5", text: "A inteligência se traduz na forma que você recolhe, julga, maneja e, sobretudo, onde e como aplica esta informação.", author: "Carl Sagan" },
  { id: "oti-6", text: "Nossos medos, desejos, preferências e opiniões não determinam o que é verdade.", author: "Carl Sagan" },
  { id: "oti-7", text: "Ninguém é tão ignorante que não tenha algo a ensinar. Ninguém é tão sábio que não tenha algo a aprender.", author: "Blaise Pascal" },
  { id: "oti-8", text: "Mudar seu ponto de vista em virtude de informações adicionais não é fraqueza, é grandeza.", author: "Pedro Rodrigues" },
  { id: "oti-9", text: "O teste de toda opinião é seu efeito prático na vida.", author: "Helen Keller" },
  { id: "oti-10", text: "O racional não deixa de se emocionar. O passional é que deixa de raciocinar.", author: "Lincoln Poubel" },
  { id: "oti-11", text: "A ignorância não justifica sua especulação.", author: "Desconhecido" },
  { id: "oti-12", text: "É difícil aprender enquanto você achar que já sabe.", author: "Desconhecido" },
  { id: "oti-13", text: "A verdade pode te arrebentar hoje e te curar amanhã.", author: "Pedro Rodrigues" },
  { id: "oti-14", text: "As coisas são o que os fatos mostram.", author: "Lincoln Poubel" },
  { id: "oti-15", text: "Você pode ignorar a realidade, mas não pode ignorar as consequências de ignorar a realidade.", author: "Ayn Rand" },
  { id: "oti-16", text: "A realidade tem primazia sobre o pensamento.", author: "Desconhecido" }
];

const AUTORREGULACAO_EMOCIONAL_PHRASES: DefaultPhrase[] = [
  { id: "reg-1", text: "Você nunca sabe a força que tem, até que a sua única alternativa é ser forte.", author: "Johnny Depp" },
  { id: "reg-2", text: "Às vezes sofremos muito pelo pouco e alegramo-nos pouco pelo muito.", author: "William Shakespeare" },
  { id: "reg-3", text: "Sufocar as emoções desagradáveis com compulsões é como querer se enxugar com toalha molhada.", author: "Pedro Rodrigues" },
  { id: "reg-4", text: "Não adianta achar injusta a dor de ter plantado dedicação e colhido decepção, se o fez em solo infértil.", author: "Pedro Rodrigues" },
  { id: "reg-5", text: "Paz não é ausência de dor, mas sim o entendimento do que a dor significa.", author: "Mark Brown" },
  { id: "reg-6", text: "Você suporta uma dor, se vê um propósito nela.", author: "Pedro Rodrigues" },
  { id: "reg-7", text: "O que não me mata, torna-me mais forte.", author: "Friedrich Nietzsche" },
  { id: "reg-8", text: "Toda emoção passa no seu passo.", author: "Pedro Rodrigues" },
  { id: "reg-9", text: "Não sofra com 'necessitites' e 'não-aguentites'.", author: "Lincoln Poubel" },
  { id: "reg-10", text: "Paciência não é simplesmente esperar e sim saber manter uma boa atitude enquanto espera.", author: "Desconhecido" },
  { id: "reg-11", text: "As emoções são temporárias reações físicas do corpo.", author: "Poubel e Rodrigues" },
  { id: "reg-12", text: "As emoções não lhe obrigam ou impedem de agir.", author: "Poubel e Rodrigues" },
  { id: "reg-13", text: "A dor é temporária, o resultado é um legado.", author: "Desconhecido" },
  { id: "reg-14", text: "O sofrimento maduro não dói tanto.", author: "Desconhecido" },
  { id: "reg-15", text: "Depois que recebe a lição do sofrimento, você percebe que não foi caro tolerá-lo.", author: "Desconhecido" },
  { id: "reg-16", text: "Não acredite em tudo o que sente.", author: "Desconhecido" }
];

const IMUNIDADE_SOCIAL_PHRASES: DefaultPhrase[] = [
  { id: "imu-1", text: "O maior juiz de seus atos deve ser você mesmo e não a sociedade.", author: "Dalai Lama" },
  { id: "imu-2", text: "Paus e pedras podem quebrar meus ossos, mas palavras jamais me atingirão.", author: "Ditado norteamericano" },
  { id: "imu-3", text: "Aprendi que não devo me importar com comentários que não vão mudar minha vida.", author: "Jô Soares" },
  { id: "imu-4", text: "Se você quer ser o maestro que orquestra a própria vida, aprenda também a virar as costas para a multidão.", author: "Pedro Rodrigues" },
  { id: "imu-5", text: "Fiz uma lista com os meus valores essenciais e com os princípios éticos para guiar minha vida e as opiniões alheias não estão nela.", author: "Pedro Rodrigues" },
  { id: "imu-6", text: "Você nunca vai chegar ao seu destino se parar para atirar pedras em cada cão que late pelo caminho.", author: "Winston Churchill" },
  { id: "imu-7", text: "O medo de perder pessoas não deve ser maior que o medo de perder-se.", author: "Pedro Rodrigues" },
  { id: "imu-8", text: "Interessante como algumas pessoas vão amar o que outras achavam que eram problemas em você!", author: "Pedro Rodrigues" },
  { id: "imu-9", text: "Quem se conhece não se ofende.", author: "Desconhecido" },
  { id: "imu-10", text: "Viver em função da aprovação do outro não é viver, é representar.", author: "Desconhecido" },
  { id: "imu-11", text: "Quando eu me aceito, eu me liberto do peso de precisar que você me aceite.", author: "Steve Maraboli" },
  { id: "imu-12", text: "As flechas das opiniões alheias não ultrapassam a fortaleza das minhas convicções.", author: "Pedro Rodrigues" },
  { id: "imu-13", text: "Muitas pessoas gastam dinheiro que não tem, para comprar coisas que não precisam, para impressionar pessoas que não gostam.", author: "Will Smith" },
  { id: "imu-14", text: "Não se preocupe mais com o errado se o certo já chegou.", author: "Desconhecido" },
  { id: "imu-15", text: "Ninguém pode zombar de quem não se ofende.", author: "Desconhecido" },
  { id: "imu-16", text: "Todo julgamento é uma confissão.", author: "Desconhecido" }
];

const RESOLUTIVIDADE_ENFRENTAMENTO_PHRASES: DefaultPhrase[] = [
  { id: "res-1", text: "Se não resolvemos um problema, pode ser que não tenhamos variado suficientemente.", author: "Lincoln Poubel" },
  { id: "res-2", text: "Resultados diferentes não podem ser alcançados com as mesmas ações e condições.", author: "Lincoln Poubel" },
  { id: "res-3", text: "Você erra 100% dos chutes que não dá.", author: "Wayne Gretzky" },
  { id: "res-4", text: "O tempo economizado pensando antes de agir é maior que o tempo gasto agindo sem pensar.", author: "Desconhecido" },
  { id: "res-5", text: "Aprenda como dizer não. Não deixe sua boca sobrecarregar suas costas.", author: "Jim Rohn" },
  { id: "res-6", text: "Assuma riscos. Se ganhar, será mais feliz. Se perder, será mais sábio.", author: "Desconhecido" },
  { id: "res-7", text: "Na vida perdemos mais por medo do que por tentativas.", author: "Desconhecido" },
  { id: "res-8", text: "O fundo do poço é um chão firme, ideal para iniciar uma escalada.", author: "Pedro Rodrigues" },
  { id: "res-9", text: "Se valer à pena, você resiste e o problema desiste.", author: "Pedro Rodrigues" },
  { id: "res-10", text: "Onde há um veneno, há um antídoto.", author: "Filme Rei Arthur, 2017" },
  { id: "res-11", text: "Você não pode controlar o vento para navegar, mas pode ajustar as velas.", author: "Pedro Rodrigues" },
  { id: "res-12", text: "Se alguém já fez, também posso fazê-lo se tiver as mesmas condições, os mesmos recursos e a mesma competência.", author: "Pedro Rodrigues" },
  { id: "res-13", text: "Alguém que envelheceu foi competente para driblar tudo que poderia tê-lo matado.", author: "Lincoln Poubel" },
  { id: "res-14", text: "Tempos difíceis criam homens fortes. Homens fortes criam tempos fáceis. Tempos fáceis criam homens fracos. Homens fracos criam tempos difíceis.", author: "Provérbio oriental" },
  { id: "res-15", text: "Melhor lutar por algo, do que viver para nada.", author: "Winston Churchill" },
  { id: "res-16", text: "Os métodos são as verdadeiras riquezas.", author: "Friedrich Nietzsche" },
  { id: "res-17", text: "Você não pode resolver um problema com a mesma mentalidade que o criou.", author: "Albert Einstein" }
];

const AUTOCONTROLE_PHRASES: DefaultPhrase[] = [
  { id: "con-1", text: "A alta produtividade é uma porta que se abre com duas chaves: planejamento e organização.", author: "Pedro Rodrigues" },
  { id: "con-2", text: "Nada é difícil se dividido em pequenas partes.", author: "Henry Ford" },
  { id: "con-3", text: "Se eu tivesse nove horas para cortar uma árvore, passaria seis horas afiando o meu machado.", author: "Abraham Lincoln" },
  { id: "con-4", text: "Mais importante que a motivação é a disciplina.", author: "Desconhecido" },
  { id: "con-5", text: "Transportai um punhado de terra todos os dias e fareis uma montanha.", author: "Confúcio" },
  { id: "con-6", text: "Os aplausos exigem a medalha. A medalha exige o treino.", author: "Pedro Rodrigues" },
  { id: "con-7", text: "Você não tem que ser grande para começar, mas tem que começar para ser grande.", author: "Zig Ziglar" },
  { id: "con-8", text: "Quem é muito bom de justificativa costuma ser ruim de iniciativa.", author: "Pedro Rodrigues" },
  { id: "con-9", text: "A melhor maneira de prever o futuro é criá-lo.", author: "Peter Drucker" },
  { id: "con-10", text: "Se você tiver por um resultado o cuidado suficiente, é quase certo que o conseguirá.", author: "William James" },
  { id: "con-11", text: "Esforço sem talento é superação. Talento sem esforço é desperdício.", author: "Lincoln Poubel" },
  { id: "con-12", text: "O crescimento da produtividade é o único caminho possível para alcançar prosperidade.", author: "Mario Draghi" },
  { id: "con-13", text: "Um trabalhador sem genialidade é melhor do que um gênio que não quer trabalhar.", author: "Leopold Auer" },
  { id: "con-14", text: "Quem desistiu jamais ganhou; quem ganhou nunca desistiu.", author: "Desconhecido" },
  { id: "con-15", text: "Quem quer e sabe, faz; quem não quer e não sabe, arruma uma desculpa.", author: "Jones Donizette" },
  { id: "con-16", text: "Os poucos que fazem são motivos de envieja para os muitos que apenas observam.", author: "Jim Rohn" },
  { id: "con-17", text: "A sua boca diz prosperidade, mas suas atitudes dizem futilidade.", author: "Pedro Rodrigues" },
  { id: "con-18", text: "Ter tempo é questão de prioridade.", author: "Desconhecido" }
];

const SOCIABILIDADE_PHRASES: DefaultPhrase[] = [
  { id: "soc-1", text: "Não levante a sua voz, melhore os seus argumentos.", author: "Desmond Tutu" },
  { id: "soc-2", text: "Quem faz pedidos indiretos tem o dever de tolerar a frustração de não ser atendido, bem como mudar para uma solicitação direta se quiser ser compreendido.", author: "Lincoln Poubel e Pedro Rodrigues" },
  { id: "soc-3", text: "Toda crítica bem colocada deve ser bem recebida.", author: "Lincoln Poubel" },
  { id: "soc-4", text: "A relação interpessoal é a chave que abre todas as portas.", author: "Daniel Leandro" },
  { id: "soc-5", text: "As opiniões que formamos sobre outras pessoas derivam dos aspectos visuais (55%), pela maneira de falar (38%) e pelo conteúdo da fala (7%).", author: "Robert Watson" },
  { id: "soc-6", text: "A mensagem é aquilo que o outro entende.", author: "Desconhecido" },
  { id: "soc-7", text: "Algumas vezes é bem mais compensador interpretar os silêncios do que pedir respostas.", author: "Desconhecido" }
];

const SENSIBILIDADE_SOCIAL_PHRASES: DefaultPhrase[] = [
  { id: "sen-1", text: "Ninguém é tão pobre que nada possa dar e ninguém é tão rico que não precise receber.", author: "Provérbio português" },
  { id: "sen-2", text: "É legal ser importante, mas é mais importante ser legal.", author: "Desconhecido" },
  { id: "sen-3", text: "As maiores necessidades da natureza humana são: sentir-se importante, ser reconhecido e ser valorizado.", author: "Thomas Dewey" },
  { id: "sen-4", text: "O desejo sexual só é superado pelo de ser especial.", author: "Desconhecido" },
  { id: "sen-5", text: "Tenha como hobby beneficiar as pessoas.", author: "Desconhecido" },
  { id: "sen-6", text: "Faça pelos outros o que eles não podem fazer por si mesmos.", author: "Desconhecido" },
  { id: "sen-7", text: "Sua vida nunca terá tanto valor, até que você faça algo por alguém, que não possa lhe retribuir o favor.", author: "Lincoln Poubel" },
  { id: "sen-8", text: "A diferença que fizemos na vida dos outros é que vai determinar a importância da vida que conduzimos.", author: "Nelson Mandela" },
  { id: "sen-9", text: "Não existe grandeza onde não há simplicidade, bondade e verdade.", author: "Leon Tolstoi" },
  { id: "sen-10", text: "Nós gastamos mais tempo parabenizando as pessoas que tiveram sucesso do que encorajando as que não tiveram.", author: "Neil deGrasse Tyson" },
  { id: "sen-11", text: "Você pode enganar uma pessoa por muito tempo; algumas por algum tempo; mas não consegue enganar todas por todo o tempo.", author: "Abraham Lincoln" },
  { id: "sen-12", text: "Ame o seu próximo como a si mesmo.", author: "Jesus Cristo" },
  { id: "sen-13", text: "Por um mundo com menos dedos apontados e mais mãos estendidas.", author: "Jean Rosana" },
  { id: "sen-14", text: "Você pode fazer mais amigos em 02 meses, se interessando pelos outros, do que em 02 anos tentando fazer com que eles se interessem por você.", author: "Dale Carnegie" },
  { id: "sen-15", text: "Um bom caráter é a melhor lápide. Entalhe seu nome nos corações, e não no mármore.", author: "C. H. Spurgeon" },
  { id: "sen-16", text: "Compaixão é a dor do outro doendo em mim.", author: "Desconhecido" },
  { id: "sen-17", text: "Ser interessante é atender ao interesse alheio.", author: "Desconhecido" },
  { id: "sen-18", text: "Maior é o que serve.", author: "Desconhecido" }
];

export default function ExameMentalidadesSaudaveisView({
  patient,
  toolId,
  state,
  setState
}: ExameMentalidadesSaudaveisViewProps) {
  const [viewMode, setViewMode] = useState<"cards" | "writing" | "facsimile">("cards");
  const [expandedReflectionId, setExpandedReflectionId] = useState<string | null>(null);
  const [newCustomText, setNewCustomText] = useState("");
  const [newCustomAuthor, setNewCustomAuthor] = useState("");

  // Get active phrases config based on toolId
  let phrases: DefaultPhrase[] = [];
  let hpName = "";
  let iconComponent = <Heart className="w-5 h-5 text-emerald-400" />;
  let colorTheme = "emerald";

  if (toolId === "mentalidades_hedonismo_responsavel") {
    phrases = HEDONISMO_RESPONSAVEL_PHRASES;
    hpName = "Hedonismo Responsável";
    iconComponent = <Heart className="w-5 h-5 text-rose-400 font-bold" />;
    colorTheme = "rose";
  } else if (toolId === "mentalidades_autoconhecimento") {
    phrases = AUTOCONHECIMENTO_PHRASES;
    hpName = "Autoconhecimento";
    iconComponent = <Scale className="w-5 h-5 text-blue-400" />;
    colorTheme = "blue";
  } else if (toolId === "mentalidades_autoestima") {
    phrases = AUTOESTIMA_PHRASES;
    hpName = "Autoestima";
    iconComponent = <Award className="w-5 h-5 text-amber-400" />;
    colorTheme = "amber";
  } else if (toolId === "mentalidades_raciocinio_otimista") {
    phrases = RACIOCINIO_OTIMISTA_PHRASES;
    hpName = "Raciocínio Realistamente Otimista";
    iconComponent = <Sliders className="w-5 h-5 text-indigo-400" />;
    colorTheme = "indigo";
  } else if (toolId === "mentalidades_autorregulacao_emocional") {
    phrases = AUTORREGULACAO_EMOCIONAL_PHRASES;
    hpName = "Autorregulação Emocional";
    iconComponent = <Activity className="w-5 h-5 text-teal-400" />;
    colorTheme = "teal";
  } else if (toolId === "mentalidades_imunidade_social") {
    phrases = IMUNIDADE_SOCIAL_PHRASES;
    hpName = "Imunidade Social";
    iconComponent = <ShieldAlert className="w-5 h-5 text-indigo-400" />;
    colorTheme = "indigo";
  } else if (toolId === "mentalidades_resolutividade_enfrentamento") {
    phrases = RESOLUTIVIDADE_ENFRENTAMENTO_PHRASES;
    hpName = "Resolutividade e Enfrentamento";
    iconComponent = <Lightbulb className="w-5 h-5 text-emerald-400" />;
    colorTheme = "emerald";
  } else if (toolId === "mentalidades_autocontrole") {
    phrases = AUTOCONTROLE_PHRASES;
    hpName = "Autocontrole";
    iconComponent = <CheckSquare className="w-5 h-5 text-cyan-400" />;
    colorTheme = "cyan";
  } else if (toolId === "mentalidades_sociabilidade") {
    phrases = SOCIABILIDADE_PHRASES;
    hpName = "Sociabilidade";
    iconComponent = <Users className="w-5 h-5 text-purple-400" />;
    colorTheme = "purple";
  } else if (toolId === "mentalidades_sensibilidade_social") {
    phrases = SENSIBILIDADE_SOCIAL_PHRASES;
    hpName = "Sensibilidade Social";
    iconComponent = <Heart className="w-5 h-5 text-pink-400" />;
    colorTheme = "pink";
  }

  // Combine default phrases + custom phrases on state
  const allPhrases = [...phrases, ...(state.customPhrases || [])];

  const handleToggleSelect = (id: string) => {
    setState(prev => {
      const currentSelected = prev.selectedPhrases || [];
      const hasId = currentSelected.includes(id);
      
      let nextSelected;
      if (hasId) {
        nextSelected = currentSelected.filter(item => item !== id);
      } else {
        nextSelected = [...currentSelected, id];
      }

      return {
        ...prev,
        selectedPhrases: nextSelected
      };
    });
  };

  const handleReflectionChange = (id: string, text: string) => {
    setState(prev => {
      const currentReflections = prev.reflections || [];
      const index = currentReflections.findIndex(r => r.phraseId === id);

      let nextReflections = [...currentReflections];
      if (index > -1) {
        nextReflections[index] = { ...nextReflections[index], reflectionText: text };
      } else {
        nextReflections.push({ phraseId: id, reflectionText: text, isMantra: false });
      }

      return {
        ...prev,
        reflections: nextReflections
      };
    });
  };

  const handleToggleMantra = (id: string) => {
    setState(prev => {
      const currentReflections = prev.reflections || [];
      
      // Clear mantra from all others, toggle for this one
      const nextReflections = currentReflections.map(r => ({
        ...r,
        isMantra: r.phraseId === id ? !r.isMantra : false
      }));

      // Ensure this reflection exists in state
      const exists = nextReflections.some(r => r.phraseId === id);
      if (!exists) {
        nextReflections.push({ phraseId: id, reflectionText: "", isMantra: true });
      }

      return {
        ...prev,
        reflections: nextReflections
      };
    });
  };

  const handleAddCustomPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomText.trim()) return;

    const newCustom = {
      id: `custom-${Date.now()}`,
      text: newCustomText.trim(),
      author: newCustomAuthor.trim() || patient.name || "Paciente"
    };

    setState(prev => ({
      ...prev,
      customPhrases: [...(prev.customPhrases || []), newCustom],
      selectedPhrases: [...(prev.selectedPhrases || []), newCustom.id]
    }));

    setNewCustomText("");
    setNewCustomAuthor("");
  };

  const handleRemoveCustomPhrase = (id: string) => {
    setState(prev => ({
      ...prev,
      customPhrases: (prev.customPhrases || []).filter(p => p.id !== id),
      selectedPhrases: (prev.selectedPhrases || []).filter(item => item !== id),
      reflections: (prev.reflections || []).filter(r => r.phraseId !== id)
    }));
  };

  const loadDemoData = () => {
    const selectedDemo: string[] = [];
    const reflectionsDemo: TherapeuticReflection[] = [];

    if (toolId === "mentalidades_hedonismo_responsavel") {
      selectedDemo.push("hed-1", "hed-3", "hed-6");
      reflectionsDemo.push({
        phraseId: "hed-1",
        reflectionText: "Compreendo que meu maior estresse diário vem de adiar o lazer para cumprir obrigações irrelevantes. Meu tempo é esgotável e preciso equilibrar a rotina agora.",
        isMantra: true
      });
      reflectionsDemo.push({
        phraseId: "hed-3",
        reflectionText: "Trabalhar em excesso serve para anestesiar frustrações pessoais. Tomar decisões para diminuir a jornada é saudável.",
        isMantra: false
      });
    } else if (toolId === "mentalidades_autoconhecimento") {
      selectedDemo.push("aut-4", "aut-10", "aut-14");
      reflectionsDemo.push({
        phraseId: "aut-4",
        reflectionText: "Minha infância dolorosa serve de referência clara das lições de limites que preciso pôr hoje, mas não posso morar emocionalmente lá.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_autoestima") {
      selectedDemo.push("est-1", "est-4", "est-10");
      reflectionsDemo.push({
        phraseId: "est-10",
        reflectionText: "Percebi que se alguém me perguntasse o que eu mais amo no mundo, demoraria horas para me citar. Quero mudar isso ativamente essa semana.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_raciocinio_otimista") {
      selectedDemo.push("oti-1", "oti-10", "oti-15");
      reflectionsDemo.push({
        phraseId: "oti-15",
        reflectionText: "A realidade me cobra limites reais de saúde física. Ignorar o cansaço traz consequências duras das quais não posso fugir recursivamente.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_autorregulacao_emocional") {
      selectedDemo.push("reg-3", "reg-8", "reg-16");
      reflectionsDemo.push({
        phraseId: "reg-3",
        reflectionText: "Quando fico triste, costumo me anestesiar comendo compulsivamente ou bebendo. Tentar enxugar-se com toalha molhada apenas perpetua a angústia inicial.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_imunidade_social") {
      selectedDemo.push("imu-1", "imu-7", "imu-9");
      reflectionsDemo.push({
        phraseId: "imu-1",
        reflectionText: "Percebo que coloco a opinião dos outros acima do meu próprio julgamento, o que drena minha energia. Meu maior juiz devo ser eu mesmo.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_resolutividade_enfrentamento") {
      selectedDemo.push("res-1", "res-8", "res-11");
      reflectionsDemo.push({
        phraseId: "res-8",
        reflectionText: "Bater no fundo do poço foi doloroso, mas agora vejo que é um chão firme sob meus pés, ideal para estruturar minha escalada de reabilitação.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_autocontrole") {
      selectedDemo.push("con-1", "con-3", "con-8");
      reflectionsDemo.push({
        phraseId: "con-1",
        reflectionText: "Preciso parar de confiar só na motivação passageira. Planejamento severo e organização tática são as duas chaves da minha real produtividade.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_sociabilidade") {
      selectedDemo.push("soc-1", "soc-2", "soc-4");
      reflectionsDemo.push({
        phraseId: "soc-2",
        reflectionText: "Costumo fazer rodeios e pedidos indiretos para evitar negações, mas isso só me gera frustração. Passarei a requisitar minhas necessidades diretamente.",
        isMantra: true
      });
    } else if (toolId === "mentalidades_sensibilidade_social") {
      selectedDemo.push("sen-1", "sen-8", "sen-16");
      reflectionsDemo.push({
        phraseId: "sen-8",
        reflectionText: "Fazer diferença na trajetória alheia é o que traz real significado existencial para mim. Quero praticar mais o altruísmo esta semana.",
        isMantra: true
      });
    }

    setState({
      selectedPhrases: selectedDemo,
      reflections: reflectionsDemo,
      customPhrases: [],
      clinicalNotes: `Sessão produtiva de acolhimento de HPs. O paciente conseguiu identificar com alto discernimento verbal as mentalidades cognitivas adequadas para modular as regras disfuncionais de seu cotidiano em relação à ${hpName}.`
    });
  };

  const clearAllData = () => {
    if (window.confirm("Deseja realmente limpar as seleções e reflexões desta HP?")) {
      setState({
        selectedPhrases: [],
        reflections: [],
        customPhrases: [],
        clinicalNotes: ""
      });
    }
  };

  // Calculations
  const selectedCount = (state.selectedPhrases || []).length;
  const reflectionsCount = (state.reflections || []).filter(r => r.reflectionText.trim()).length;
  const mantra = (state.reflections || []).find(r => r.isMantra);
  const mantraPhrase = mantra ? allPhrases.find(p => p.id === mantra.phraseId) : null;

  return (
    <div id={`exame_mentalidades_${toolId}_root`} className="space-y-6">
      {/* HEADER DE CARTÃO DETALHADO */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-850 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-950 text-slate-400 border border-slate-850 rounded-full">
                Abordagem de HP
              </span>
              <span className="text-slate-500 text-xs">• Atitude Cognitiva</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              {iconComponent}
              Mentalidades Saudáveis: {hpName}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Pesquise, selecione e medite nas diretrizes fundamentais da <strong>{hpName}</strong>. Desenvolva raciocínios alternativos saudáveis por meio da Escrita Terapêutica de aplicação.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadDemoData}
              className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-900/60 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Preencher com exemplo de reflexões clínicas saudáveis"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Preencher Demo
            </button>
            <button
              onClick={clearAllData}
              className="px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/30 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar
            </button>
          </div>
        </div>

        {/* INDICIAÇÃO DE PROGRESSO E SELEÇÃO */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">HP Selecionadas / Guardadas</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">{selectedCount} Escolhidas</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Exercício de Escrita Terapêutica</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">{reflectionsCount} Aplicadas</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-rose-400 fill-rose-400/20" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 font-semibold">Mantra da Semana</div>
              <div className="text-sm font-bold text-slate-300 truncate" title={mantraPhrase ? mantraPhrase.text : "Nenhum ativo"}>
                {mantraPhrase ? `"${mantraPhrase.text}"` : "Nenhum selecionado"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SELETORES DE ABAS DE ESTILO DO MOCKUP */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setViewMode("cards")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            viewMode === "cards"
              ? "border-emerald-500 text-emerald-400 bg-slate-900/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Análise e Acolhimento Cognitivo
        </button>

        <button
          onClick={() => setViewMode("writing")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            viewMode === "writing"
              ? "border-emerald-500 text-emerald-400 bg-slate-900/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Edit2 className="w-4 h-4" />
          Escrita Terapêutica de Aplicação ({reflectionsCount})
        </button>

        <button
          onClick={() => setViewMode("facsimile")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            viewMode === "facsimile"
              ? "border-emerald-500 text-emerald-400 bg-slate-900/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          Exame de Consultório (PDF)
        </button>
      </div>

      {/* PAINEL CENTRAL CARDS DE SELEÇÃO */}
      {viewMode === "cards" && (
        <div className="space-y-6">
          {/* PSICOEDUCAÇÃO INTERNA */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex gap-3 text-sm text-slate-300">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-200">Como funciona o treino de mentalidades?</strong>
              <p className="text-slate-400 leading-relaxed font-sans">
                Para estruturar qualquer Habilidade Psicológica, precisamos primeiro alinhar o nosso vocabulário e construir regras mentais saudáveis contrárias aos antigos dogmas disfuncionais. Clique nas estrelas para guardar frases-chave com as quais você se identifica e use o botão <span className="text-emerald-400 font-medium">Editar Reflexão</span> para detalhar por escrito um plano de ação.
              </p>
            </div>
          </div>

          {/* LISTA DAS MENTALIDADES */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
              <h3 className="text-base font-bold text-slate-200">
                Lista de Diretrizes e Provérbios - {hpName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Total de {allPhrases.length} frases</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPhrases.map((phrase, index) => {
                const isSelected = (state.selectedPhrases || []).includes(phrase.id);
                const refl = (state.reflections || []).find(r => r.phraseId === phrase.id);
                const isMantra = refl?.isMantra || false;

                return (
                  <div 
                    key={phrase.id}
                    className={`border rounded-xl p-4 transition-all relative flex flex-col justify-between group ${
                      isSelected 
                        ? "bg-slate-950 border-emerald-500/40 shadow-emerald-950/20 shadow-md"
                        : "bg-slate-950/55 border-slate-800 hover:border-slate-750"
                    }`}
                  >
                    {/* Botões rápidos canto superior */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                      {phrase.id.startsWith("custom-") && (
                        <button
                          onClick={() => handleRemoveCustomPhrase(phrase.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Remover frase personalizada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleMantra(phrase.id)}
                        className={`p-1.5 rounded transition-all hover:bg-slate-900 ${
                          isMantra 
                            ? "text-rose-450" 
                            : "text-slate-600 hover:text-rose-400"
                        }`}
                        title={isMantra ? "Mantra Semanal Ativo" : "Definir como Mantra Semanal"}
                      >
                        <Bookmark className={`w-4 h-4 ${isMantra ? "fill-current" : ""}`} />
                      </button>

                      <button
                        onClick={() => handleToggleSelect(phrase.id)}
                        className={`p-1.5 rounded transition-all hover:bg-slate-900 ${
                          isSelected 
                            ? "text-amber-400" 
                            : "text-slate-600 hover:text-amber-300"
                        }`}
                        title={isSelected ? "Favoritado" : "Favoritar Frase"}
                      >
                        <Star className={`w-4 h-4 ${isSelected ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Texto principal da mentalidade */}
                    <div className="space-y-3/2 pr-12">
                      <div className="text-xs font-mono font-bold text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <p className="text-sm font-medium text-slate-100 italic font-sans leading-relaxed">
                        "{phrase.text}"
                      </p>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        {phrase.author}
                      </div>
                    </div>

                    {/* Campo rápido de reflexão */}
                    <div className="mt-4 pt-4 border-t border-slate-900/80 space-y-2">
                      {refl?.reflectionText ? (
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Escrita de Aplicação</span>
                          <p className="text-xs text-slate-300 line-clamp-2 italic">"{refl.reflectionText}"</p>
                        </div>
                      ) : null}

                      <button
                        onClick={() => {
                          if (!state.selectedPhrases?.includes(phrase.id)) {
                            handleToggleSelect(phrase.id);
                          }
                          setExpandedReflectionId(expandedReflectionId === phrase.id ? null : phrase.id);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {refl?.reflectionText ? "Modificar Reflexão" : "Escrever Reflexão"}
                      </button>

                      {expandedReflectionId === phrase.id && (
                        <div className="mt-2 space-y-2 animate-fade-in z-10">
                          <textarea
                            rows={3}
                            placeholder="Escreva como você pode aplicar esse ensinamento em uma circunstância real ou de conflito atual..."
                            value={refl?.reflectionText || ""}
                            onChange={(e) => handleReflectionChange(phrase.id, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-755 focus:border-emerald-500 rounded-lg p-2 text-xs text-slate-200 outline-none outline-none resize-none placeholder:text-slate-600"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setExpandedReflectionId(null)}
                              className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-200"
                            >
                              Fechar
                            </button>
                            <button
                              onClick={() => {
                                handleReflectionChange(phrase.id, refl?.reflectionText || "");
                                setExpandedReflectionId(null);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded text-[10px] uppercase font-bold"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADICIONAR FRASE PERSONALIZADA */}
            <div className="mt-6 border-t border-slate-800/80 pt-6">
              <h4 className="text-sm font-bold text-slate-250 mb-3 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Inserir sua própria Frase / Mentalidade Saudável
              </h4>
              <form onSubmit={handleAddCustomPhrase} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Não há sucesso no trabalho que compense o fracasso da minha saúde..."
                    value={newCustomText}
                    onChange={(e) => setNewCustomText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-650"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="Autor (Opcional)"
                    value={newCustomAuthor}
                    onChange={(e) => setNewCustomAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-650"
                  />
                </div>
                <div className="md:col-span-1 justify-end flex">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* OBSERVATIVAS OBSERVADAS CLÍNICAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
                  Parcerias e Apontamentos Clínicos (Terapias Cognitivas)
                </h3>
             </div>
             <textarea
               rows={4}
               placeholder={`Digite notas clínicas adicionais e planos de meditação em relação à HP ${hpName}...`}
               value={state.clinicalNotes || ""}
               onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
               className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg p-3 text-xs text-slate-200 outline-none transition-all"
             />
          </div>
        </div>
      )}

      {/* MODO ESCRITA TERAPÊUTICA PROGRESSO */}
      {viewMode === "writing" && (
        <div className="space-y-6 animate-fade-in">
          {/* INTRO PROGRESS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <strong className="text-slate-200 text-sm flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                Dossiê de Escrita Analítica
              </strong>
              <p className="text-xs text-slate-400">Aqui estão compiladas apenas as mentalidades que você selecionou e as suas correspondentes reflexões terapêuticas aplicadas.</p>
            </div>
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
              Progresso Escrita: <span className="text-emerald-400 font-bold">{reflectionsCount}</span> de <span className="text-slate-400">{selectedCount}</span> selecionadas
            </div>
          </div>

          {state.selectedPhrases?.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
               <Star className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
               <p className="text-sm font-semibold">Nenhuma mentalidade favoritiada para escrita.</p>
               <p className="text-xs text-slate-600 mt-1">Primeiro marque com estrela suas frases na aba de <span className="text-emerald-400 hover:underline cursor-pointer" onClick={() => setViewMode("cards")}>Acolhimento Cognitivo</span> para iniciar o processo.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {allPhrases
                .filter(p => state.selectedPhrases?.includes(p.id))
                .map((phrase, idx) => {
                  const refl = (state.reflections || []).find(r => r.phraseId === phrase.id);
                  const isMantra = refl?.isMantra || false;

                  return (
                    <div 
                      key={phrase.id}
                      className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all shadow-md grid grid-cols-1 md:grid-cols-12 gap-4"
                    >
                      {/* Categoria/Frase */}
                      <div className="md:col-span-5 space-y-2 pr-4 md:border-r border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold flex items-center justify-center text-slate-400">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-slate-500 font-mono italic">Admitida no Repertório</span>
                        </div>
                        <p className="text-sm font-medium text-slate-100 italic leading-relaxed">
                          " {phrase.text} "
                        </p>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                          Estudo por: {phrase.author}
                        </p>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleToggleMantra(phrase.id)}
                            className={`p-1 text-xs border rounded-lg transition-all flex items-center gap-1 ${
                              isMantra
                                ? "bg-rose-950/30 text-rose-450 border-rose-900/60"
                                : "bg-slate-950 text-slate-400 hover:text-rose-400 border-slate-850"
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isMantra ? "fill-current" : ""}`} />
                            {isMantra ? "Mantra Semanal Ativo" : "Definir Mantra"}
                          </button>
                        </div>
                      </div>

                      {/* Escrita de Aplicação */}
                      <div className="md:col-span-7 space-y-2">
                        <label className="block text-xs font-bold text-slate-350 tracking-wide uppercase flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                          Plano Prático de Aplicação Cognitiva
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Reflicta por escrito: qual foi a última situação na sua vida em que você agiu no sentido oposto a essa mentalidade? E como você reagirá na próxima oportunidade guiado por esse pensamento saudável?"
                          value={refl?.reflectionText || ""}
                          onChange={(e) => handleReflectionChange(phrase.id, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-lg p-3 text-xs text-slate-200 outline-none resize-none transition-all placeholder:text-slate-650"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* PAINEL IMPRESSÃO FACSIMILE / PDF STYLE */}
      {viewMode === "facsimile" && (
        <div id={`exame_mentalidades_${toolId}_facsimile_preview`} className="bg-white border-2 border-slate-300 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl text-slate-950 font-sans leading-relaxed">
          <div className="border border-slate-950 p-6 space-y-6">
            
            {/* Cabecalho Principal */}
            <div className="flex justify-between items-start border-b-2 border-slate-950 pb-4">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900 font-mono">
                  Mentalidades Saudáveis
                </h1>
                <p className="text-xs font-bold font-mono text-slate-600 mt-1 uppercase">HP de {hpName}</p>
              </div>
              <div className="text-right font-mono text-[9px] text-slate-500 uppercase">
                <div>Consolidação de Regras</div>
                <div>Intel. Psicológica</div>
              </div>
            </div>

            {/* Cabeçalho do Paciente */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-400 pb-4">
              <div className="flex items-center gap-1">
                <span className="font-bold">PACIENTE:</span>
                <span className="border-b border-dotted border-slate-950 flex-1 px-1">
                  {patient.name || "____________________________________________"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">ATITUDE DE HP:</span>
                <span className="border-b border-dotted border-slate-950 flex-1 px-1 text-emerald-850 font-bold">
                  {hpName}
                </span>
              </div>
            </div>

            {/* LISTA DAS MENTALIDADES FORMATO PDF */}
            <div className="space-y-4">
              <div className="bg-slate-100 border border-slate-950 p-2 text-xs font-bold font-mono uppercase tracking-wider text-center">
                Mapeamento das Mentalidades Guardadas e Escrita de Reflexão
              </div>

              <div className="border border-slate-950 divide-y divide-slate-800">
                {allPhrases
                  .filter(p => state.selectedPhrases?.includes(p.id))
                  .map((phrase, idx) => {
                    const refl = (state.reflections || []).find(r => r.phraseId === phrase.id);
                    return (
                      <div key={phrase.id} className="grid grid-cols-12 divide-x divide-slate-800 p-3 leading-relaxed text-xs">
                        <div className="col-span-1 font-mono font-bold text-center text-slate-800 text-sm p-1">
                          {idx + 1}
                        </div>
                        <div className="col-span-5 pr-3 pl-2">
                          <p className="font-serif italic text-slate-950 font-medium">"{phrase.text}"</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">— {phrase.author}</span>
                        </div>
                        <div className="col-span-6 pl-3">
                          <strong className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Escrita de Aplicação Terapêutica:</strong>
                          <p className="text-slate-800 italic min-h-[40px]">
                            {refl?.reflectionText ? `"${refl.reflectionText}"` : "__________________________________________________________________________________"}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                {selectedCount === 0 && (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-12 divide-x divide-slate-800 min-h-[60px]">
                      <div className="col-span-1 p-2 text-center text-slate-300 font-mono text-xs">{idx + 1}</div>
                      <div className="col-span-5 p-2 text-slate-300 font-mono text-[9px] italic flex items-center">Selecione frases para preencher...</div>
                      <div className="col-span-6 p-2"></div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* NOTAS DE CONSULTÓRIO DO PROFISSIONAL */}
            {state.clinicalNotes && (
              <div className="border border-slate-950 p-4 space-y-2 mt-4 bg-slate-50">
                <strong className="text-xs uppercase font-mono tracking-wider block text-slate-900">Apontamentos Clínicos (Terapeuta):</strong>
                <p className="text-xs text-slate-850 font-mono italic whitespace-pre-line leading-relaxed">{state.clinicalNotes}</p>
              </div>
            )}

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-10 pt-10 text-center text-[10px] font-mono">
              <div className="space-y-1">
                <div className="border-t border-slate-900 pt-1"></div>
                <div className="font-bold">ASSINATURA DO PACIENTE</div>
                <div className="text-slate-500">Consentimento e Compromisso Comportamental</div>
              </div>
              <div className="space-y-1">
                <div className="border-t border-slate-900 pt-1"></div>
                <div className="font-bold">ASSINATURA DO PROFISSIONAL</div>
                <div className="text-slate-500">Coparticipação e Orientação de Repertório</div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
