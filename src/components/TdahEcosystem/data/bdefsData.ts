import { BdefsQuestion } from '../types';

export const BDEFS_SECTIONS = {
  1: { id: 1, name: 'Seção 1: Gerenciamento do Tempo e Procrastinação', description: 'Noção temporal, pontualidade, prazos, adiamento de tarefas e preparação futura.' },
  2: { id: 2, name: 'Seção 2: Organização, Solução de Problemas e Memória de Trabalho', description: 'Capacidade de estruturar ideias, manter informações na mente, raciocínio rápido e foco.' },
  3: { id: 3, name: 'Seção 3: Autocontenção e Inibição da Resposta (Impulsividade)', description: 'Tolerância à espera, controle de impulsos verbais/motores e consideração de consequências.' },
  4: { id: 4, name: 'Seção 4: Automotivação e Persistência Voltada a Metas', description: 'Esforço contínuo, tolerância ao tédio, busca de recompensas a longo prazo e disciplina.' },
  5: { id: 5, name: 'Seção 5: Autorregulação Emocional e Tolerância à Frustração', description: 'Acalmar-se após descontrole, manejo da raiva, reatividade exagerada e racionalidade afetiva.' }
};

export const BARKLEY_ADHD_EF_INDEX_ITEMS = [1, 6, 14, 16, 24, 49, 50, 55, 60, 65, 69];

export const BDEFS_QUESTIONS: BdefsQuestion[] = [
  // SEÇÃO 1 (Itens 1 a 21)
  { id: 1, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Procrastino ou adio fazer as coisas até o último minuto.', isAdhdEfIndexItem: true },
  { id: 2, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho pouca noção de tempo.' },
  { id: 3, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Desperdiço ou administro mal o meu tempo.' },
  { id: 4, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Sou despreparado para trabalhos ou tarefas a mim atribuídas.' },
  { id: 5, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Não cumpro os prazos das tarefas.' },
  { id: 6, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho problemas para planejar com antecedência ou para me preparar para eventos futuros.', isAdhdEfIndexItem: true },
  { id: 7, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Esqueço de fazer coisas que deveria fazer.' },
  { id: 8, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Parece que eu não consigo cumprir as metas que estabeleço para mim mesmo.' },
  { id: 9, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Me atraso para o trabalho ou compromissos agendados.' },
  { id: 10, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Parece que eu não consigo manter em mente coisas das quais preciso me lembrar de fazer.' },
  { id: 11, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Parece que eu não consigo finalizar as coisas, a menos que tenham um prazo final imediato.' },
  { id: 12, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho dificuldade em julgar quanto tempo irei gastar para fazer algo ou para ir a algum lugar.' },
  { id: 13, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho dificuldades em me motivar para começar a trabalhar.' },
  { id: 14, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho dificuldade para me motivar a continuar com o meu trabalho e terminá-lo.', isAdhdEfIndexItem: true },
  { id: 15, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Fico desmotivado para me preparar com antecedência para coisas que devo fazer.' },
  { id: 16, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho problemas em completar uma atividade antes de iniciar uma nova.', isAdhdEfIndexItem: true },
  { id: 17, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho dificuldades em fazer aquilo que eu digo a mim mesmo para fazer.' },
  { id: 18, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho dificuldades em cumprir as promessas ou compromissos que eu possa ter assumido com outras pessoas.' },
  { id: 19, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho falta de auto-disciplina.' },
  { id: 20, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Tenho dificuldades em me organizar ou em fazer meu trabalho de acordo com sua prioridade ou importância; não consigo "priorizar" bem.' },
  { id: 21, sectionId: 1, sectionName: 'Gerenciamento do Tempo e Procrastinação', text: 'Acho difícil começar ou continuar a fazer coisas que preciso terminar.' },

  // SEÇÃO 2 (Itens 22 a 45)
  { id: 22, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Parece que eu não consigo antecipar o futuro tanto ou tão bem quanto os outros.' },
  { id: 23, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Parece que eu não consigo me lembrar do que ouvi ou li anteriormente.' },
  { id: 24, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Tenho dificuldades em organizar meus pensamentos.', isAdhdEfIndexItem: true },
  { id: 25, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Quando me apresentam coisas complicadas de se fazer, eu não consigo manter as informações na cabeça para fazer igual ou fazer corretamente.' },
  { id: 26, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Tenho problemas quando preciso avaliar várias opções para fazer as coisas e ponderar as suas consequências.' },
  { id: 27, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Tenho dificuldades para dizer o que eu quero dizer.' },
  { id: 28, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Sou incapaz de criar ou inventar tantas soluções para problemas quanto os outros.' },
  { id: 29, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'As palavras parecem me faltar quando quero explicar alguma coisa para os outros.' },
  { id: 30, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Tenho dificuldade em expressar meus pensamentos por escrito tão bem ou tão rapidamente quanto os outros.' },
  { id: 31, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Sinto que não sou tão criativo ou inventivo quanto os outros com o mesmo nível de inteligência.' },
  { id: 32, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Quando tento cumprir metas ou compromissos, não me acho capaz de pensar em tantas maneiras de fazer as coisas como os outros.' },
  { id: 33, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Tenho dificuldade em aprender atividades novas e complexas tão bem como os outros.' },
  { id: 34, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Tenho dificuldades em explicar as coisas na ordem ou sequência apropriada.' },
  { id: 35, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Não consigo concluir minhas explicações tão rapidamente como os outros.' },
  { id: 36, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Tenho dificuldades em fazer as coisas na ordem ou sequência apropriada.' },
  { id: 37, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Sou incapaz de pensar e reagir rapidamente ou de modo tão eficiente quanto outras pessoas quando ocorrem eventos inesperados.' },
  { id: 38, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Eu sou mais lento do que outros para resolver problemas que encontro no meu dia a dia.' },
  { id: 39, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Fico facilmente distraído por pensamentos irrelevantes quando eu tenho que me concentrar em algo.' },
  { id: 40, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Sou incapaz de entender o que leio tão bem quanto eu deveria. Tenho que reler o material para entender seu significado.' },
  { id: 41, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Não consigo focar minha atenção em tarefas ou no trabalho tão bem quanto os outros.' },
  { id: 42, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Fico facilmente confuso.' },
  { id: 43, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Não consigo manter a minha concentração na leitura, em formulários, em palestras ou no trabalho.' },
  { id: 44, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Acho difícil focar no que é importante diante do que não é importante quando estou fazendo alguma coisa.' },
  { id: 45, sectionId: 2, sectionName: 'Organização, Solução de Problemas e Memória de Trabalho', text: 'Parece que eu não consigo processar informações de modo tão rápido ou preciso quanto os outros.' },

  // SEÇÃO 3 (Itens 46 a 64)
  { id: 46, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Acho difícil tolerar esperas; impaciente.' },
  { id: 47, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Tomo decisões impulsivamente.' },
  { id: 48, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Sou incapaz de inibir minhas reações ou respostas a situações ou aos outros.' },
  { id: 49, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Tenho dificuldade em parar minhas atividades ou comportamento quando deveria.', isAdhdEfIndexItem: true },
  { id: 50, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Tenho dificuldade em mudar meu comportamento quando me falam sobre os meus erros.', isAdhdEfIndexItem: true },
  { id: 51, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Faço comentários impulsivos para os outros.' },
  { id: 52, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Sou propenso a fazer coisas sem considerar as consequências.' },
  { id: 53, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Mudo meus planos no último minuto por um capricho ou impulso de último minuto.' },
  { id: 54, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Não levo em consideração fatos relevantes do passado ou experiências passadas antes de responder às situações (Eu ajo sem pensar).' },
  { id: 55, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Não tenho consciência das coisas que eu falo ou faço.', isAdhdEfIndexItem: true },
  { id: 56, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Tenho dificuldade em ser objetivo com as coisas que mexem comigo.' },
  { id: 57, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Acho difícil assumir as perspectivas de outras pessoas sobre um problema ou uma situação.' },
  { id: 58, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Não penso nem falo as coisas comigo mesmo antes de fazer algo.' },
  { id: 59, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Tenho dificuldade para seguir as regras em uma situação.' },
  { id: 60, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Tenho tendência a dirigir mais rápido que os outros (velocidade excessiva).', isAdhdEfIndexItem: true },
  { id: 61, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Não tolero muito bem situações frustrantes.' },
  { id: 62, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Não consigo inibir minhas emoções tão bem quanto os outros.' },
  { id: 63, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Não olho para frente e não penso sobre quais serão os resultados futuros antes de fazer alguma coisa (Não faço previsões).' },
  { id: 64, sectionId: 3, sectionName: 'Autocontenção e Inibição da Resposta', text: 'Eu me envolvo em atividades de risco mais do que os outros estão propensos a fazer.' },

  // SEÇÃO 4 (Itens 65 a 76)
  { id: 65, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Tenho tendência a pular partes do trabalho e não faço tudo o que devo fazer.', isAdhdEfIndexItem: true },
  { id: 66, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Sou propenso a abandonar um trabalho mais cedo se ele é chato ou se tenho outras coisas para fazer.' },
  { id: 67, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Não me esforço tanto no meu trabalho como eu deveria ou tanto quanto os outros são capazes.' },
  { id: 68, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Os outros me dizem que sou preguiçoso ou desmotivado.' },
  { id: 69, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Tenho que depender de outros para me ajudar a terminar meu trabalho.', isAdhdEfIndexItem: true },
  { id: 70, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'As coisas devem ter uma recompensa imediata para mim ou não consigo terminá-las.' },
  { id: 71, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Tenho dificuldades de resistir em fazer algo divertido ou mais interessante quando deveria estar trabalhando.' },
  { id: 72, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'O meu desempenho no trabalho não tem consistência na quantidade e na qualidade.' },
  { id: 73, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Sou incapaz de trabalhar tão bem quanto os outros sem supervisão ou instruções frequentes.' },
  { id: 74, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Eu não tenho a força de vontade ou determinação que os outros parecem ter.' },
  { id: 75, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Eu não sou capaz de trabalhar em busca de recompensas em longo prazo ou postergadas assim como outros.' },
  { id: 76, sectionId: 4, sectionName: 'Automotivação e Persistência Voltada a Metas', text: 'Eu não consigo resistir em fazer coisas que levam a ganhos imediatos, mesmo quando elas não são boas para mim em longo prazo.' },

  // SEÇÃO 5 (Itens 77 a 89)
  { id: 77, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Fico com raiva ou chateado rapidamente.' },
  { id: 78, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Tenho reações emocionais exageradas.' },
  { id: 79, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Fico excitado com facilidade.' },
  { id: 80, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Sou incapaz de inibir demonstrações emocionais negativas ou positivas.' },
  { id: 81, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Tenho dificuldade em me acalmar uma vez que estou emocionalmente descontrolado.' },
  { id: 82, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Parece que não consigo retornar o controle emocional e ficar mais racional depois que eu estou emocionalmente afetado.' },
  { id: 83, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Parece que não consigo me distrair ou afastar do que está me perturbando emocionalmente, para ajudar a me acalmar. Não consigo redirecionar minha mente para coisas mais positivas.' },
  { id: 84, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Sou incapaz de controlar as minhas emoções para atingir as minhas metas com sucesso ou me dar bem com os outros.' },
  { id: 85, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Permaneço emotivo ou chateado por mais tempo que os outros.' },
  { id: 86, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Acho difícil me afastar de encontros emocionalmente desgastantes com outros ou sair de situações nas quais fiquei muito afetado emocionalmente.' },
  { id: 87, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Eu não consigo redirecionar minhas emoções para formas ou soluções mais positivas quando fico chateado.' },
  { id: 88, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Eu não sou capaz de avaliar de forma mais objetiva uma situação emocionalmente perturbadora.' },
  { id: 89, sectionId: 5, sectionName: 'Autorregulação Emocional e Tolerância à Frustração', text: 'Não consigo ver o lado positivo de fatos negativos quando sinto emoções fortes.' }
];

export const BDEFS_SCALE_OPTIONS = [
  { value: 1, label: 'Raramente ou nunca', code: '1', score: 1 },
  { value: 2, label: 'Às vezes', code: '2', score: 2 },
  { value: 3, label: 'Frequentemente', code: '3', score: 3 },
  { value: 4, label: 'Muito frequentemente', code: '4', score: 4 }
];
