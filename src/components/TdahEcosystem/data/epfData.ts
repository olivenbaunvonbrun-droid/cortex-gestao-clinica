import { EpfQuestion } from '../types';

export const EPF_DOMAINS = {
  1: { id: 1, name: 'Estudos / Cursos / Treinamentos', description: 'Impacto no rendimento acadêmico, notas, prazos e conclusão de qualificações.' },
  2: { id: 2, name: 'Contexto Profissional', description: 'Desempenho no trabalho, relação com superiores/pares, estabilidade e carreira.' },
  3: { id: 3, name: 'Relacionamentos Afetivos e Sexuais', description: 'Sobrecarga de parceiros, conflitos precipitados, tédio e término de vínculos.' },
  4: { id: 4, name: 'Em Casa / Rotina Doméstica', description: 'Desorganização do lar, acidentes domésticos, prazos de contas/garantias e atritos.' },
  5: { id: 5, name: 'Relações Sociais e Amizades', description: 'Afastamento social, mal-entendidos, impressão de descaso ou desinteresse.' },
  6: { id: 6, name: 'Dinheiro / Finanças', description: 'Gastos impulsivos, dívidas, negativação (SPC/Serasa) e dependência de terceiros.' },
  7: { id: 7, name: 'Saúde & Autocuidado', description: 'Desregulação do sono, alimentação inadequada, sedentarismo e substâncias.' },
  8: { id: 8, name: 'Trânsito e Direção', description: 'Acidentes, multas, direção perigosa, conflito com outros motoristas.' },
  9: { id: 9, name: 'Conduta Social & Riscos Legais', description: 'Confronto com autoridade, processos, exposição a riscos e problemas judiciais.' }
};

export const EPF_QUESTIONS: EpfQuestion[] = [
  // 1. Estudos / Cursos / Treinamentos (8 itens)
  { id: 1, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Meus trabalhos foram de baixa qualidade.' },
  { id: 2, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Fui reprovado.' },
  { id: 3, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Meus professores e colegas deixaram de confiar em mim.' },
  { id: 4, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Fiquei estressado por deixar as tarefas para última hora.' },
  { id: 5, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Deixei cursos inacabados.' },
  { id: 6, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Obtive notas baixas.' },
  { id: 7, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Gastei mais tempo para concluí-los.' },
  { id: 8, domainId: 1, domainName: 'Estudos / Cursos / Treinamentos', text: 'Percebi variações no meu desempenho.' },

  // 2. Contexto Profissional (10 itens)
  { id: 9, domainId: 2, domainName: 'Contexto Profissional', text: 'As pessoas ficaram insatisfeitas com o meu desempenho.' },
  { id: 10, domainId: 2, domainName: 'Contexto Profissional', text: 'Fui repreendido pelo meu superior.' },
  { id: 11, domainId: 2, domainName: 'Contexto Profissional', text: 'Perdi oportunidades.' },
  { id: 12, domainId: 2, domainName: 'Contexto Profissional', text: 'Me senti fracassado.' },
  { id: 13, domainId: 2, domainName: 'Contexto Profissional', text: 'Me senti inseguro.' },
  { id: 14, domainId: 2, domainName: 'Contexto Profissional', text: 'As pessoas deixaram de confiar em mim.' },
  { id: 15, domainId: 2, domainName: 'Contexto Profissional', text: 'Fui demitido.' },
  { id: 16, domainId: 2, domainName: 'Contexto Profissional', text: 'Ocupei cargo abaixo do meu potencial.' },
  { id: 17, domainId: 2, domainName: 'Contexto Profissional', text: 'A minha carreira ficou parada.' },
  { id: 18, domainId: 2, domainName: 'Contexto Profissional', text: 'As minhas relações com os meus colegas de trabalho foram conflituosas.' },

  // 3. Relacionamentos Afetivos e Sexuais (8 itens)
  { id: 19, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'O (a) meu/minha parceiro (a) precisou assumir responsabilidades que eram minhas.' },
  { id: 20, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'Os términos foram precipitados.' },
  { id: 21, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'Recebi queixas sobre o meu modo de ser.' },
  { id: 22, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'Vivenciei conflitos com o (a) meu/minha companheiro (a).' },
  { id: 23, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'Pequenos desentendimentos ganharam uma grande proporção.' },
  { id: 24, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'Meu/minha parceiro (a) ficou insatisfeito (a) comigo.' },
  { id: 25, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'Me senti entediado (a).' },
  { id: 26, domainId: 3, domainName: 'Relacionamentos Afetivos e Sexuais', text: 'Tive dificuldade em manter relações duradouras.' },

  // 4. Em Casa (7 itens)
  { id: 27, domainId: 4, domainName: 'Em Casa / Rotina Doméstica', text: 'Os ambientes ficaram bagunçados por um grande período de tempo.' },
  { id: 28, domainId: 4, domainName: 'Em Casa / Rotina Doméstica', text: 'Meus familiares ficaram chateados pelo meu modo de ser.' },
  { id: 29, domainId: 4, domainName: 'Em Casa / Rotina Doméstica', text: 'Ocorreram pequenos acidentes (por exemplo, esqueci a panela no fogo, me cortei).' },
  { id: 30, domainId: 4, domainName: 'Em Casa / Rotina Doméstica', text: 'Me senti incapaz para realizar os afazeres domésticos.' },
  { id: 31, domainId: 4, domainName: 'Em Casa / Rotina Doméstica', text: 'Vivenciei conflitos com meus familiares.' },
  { id: 32, domainId: 4, domainName: 'Em Casa / Rotina Doméstica', text: 'Perdi o prazo de garantia de eletrodomésticos que precisavam de troca ou reparo.' },
  { id: 33, domainId: 4, domainName: 'Em Casa / Rotina Doméstica', text: 'Fui chamado (a) de irresponsável.' },

  // 5. Relações Sociais (9 itens)
  { id: 34, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'As pessoas se afastaram de mim.' },
  { id: 35, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'Me senti inseguro (a).' },
  { id: 36, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'Fui chamado (a) de enrolado (a).' },
  { id: 37, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'Fui considerado (a) inconveniente.' },
  { id: 38, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'Tive dificuldade em manter amizades duradouras.' },
  { id: 39, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'Passei uma impressão de descaso.' },
  { id: 40, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'Vivenciei conflitos com as pessoas.' },
  { id: 41, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'As pessoas ficaram chateadas comigo.' },
  { id: 42, domainId: 5, domainName: 'Relações Sociais e Amizades', text: 'Fui considerado (a) antipático (a).' },

  // 6. Relação com o Dinheiro (7 itens)
  { id: 43, domainId: 6, domainName: 'Dinheiro / Finanças', text: 'Tive gastos desnecessários.' },
  { id: 44, domainId: 6, domainName: 'Dinheiro / Finanças', text: 'Fiquei endividado (a).' },
  { id: 45, domainId: 6, domainName: 'Dinheiro / Finanças', text: 'Tive algum serviço cortado/suspenso por falta de pagamento.' },
  { id: 46, domainId: 6, domainName: 'Dinheiro / Finanças', text: 'Dependi de alguém para controlar minhas finanças.' },
  { id: 47, domainId: 6, domainName: 'Dinheiro / Finanças', text: 'Tive prejuízos financeiros.' },
  { id: 48, domainId: 6, domainName: 'Dinheiro / Finanças', text: 'Tive restrição de crédito.' },
  { id: 49, domainId: 6, domainName: 'Dinheiro / Finanças', text: 'Tive meu nome incluído em algum cadastro (SERASA, SPC) em função de dívidas.' },

  // 7. Saúde & Autocuidado (6 itens)
  { id: 50, domainId: 7, domainName: 'Saúde & Autocuidado', text: 'Tive horários de alimentação inadequados.' },
  { id: 51, domainId: 7, domainName: 'Saúde & Autocuidado', text: 'Adoeci por falta de prevenção.' },
  { id: 52, domainId: 7, domainName: 'Saúde & Autocuidado', text: 'A minha rotina de sono foi alterada.' },
  { id: 53, domainId: 7, domainName: 'Saúde & Autocuidado', text: 'Fiquei sedentário.' },
  { id: 54, domainId: 7, domainName: 'Saúde & Autocuidado', text: 'Tive doenças agravadas por falta de cuidado.' },
  { id: 55, domainId: 7, domainName: 'Saúde & Autocuidado', text: 'Tive problemas com álcool, cigarro e/ou drogas.' },

  // 8. No trânsito (6 itens)
  { id: 56, domainId: 8, domainName: 'Trânsito e Direção', text: 'As pessoas se sentiram inseguras em andar comigo enquanto eu dirigia o carro.' },
  { id: 57, domainId: 8, domainName: 'Trânsito e Direção', text: 'Me envolvi em acidentes.' },
  { id: 58, domainId: 8, domainName: 'Trânsito e Direção', text: 'Recebi multas de trânsito.' },
  { id: 59, domainId: 8, domainName: 'Trânsito e Direção', text: 'Me coloquei em situações de risco.' },
  { id: 60, domainId: 8, domainName: 'Trânsito e Direção', text: 'Me envolvi em conflitos com outros motoristas quando eu dirigia meu carro.' },
  { id: 61, domainId: 8, domainName: 'Trânsito e Direção', text: 'Meu veículo ficou exposto a danos e desgastes mecânicos.' },

  // 9. Conduta Social & Riscos Legais (5 itens)
  { id: 62, domainId: 9, domainName: 'Conduta Social & Riscos Legais', text: 'Vivenciei momentos difíceis por desacatar figuras de autoridade (como policiais, professores, meu/minha chefe).' },
  { id: 63, domainId: 9, domainName: 'Conduta Social & Riscos Legais', text: 'Me envolvi em situações graves em que eu poderia ter sido preso (a).' },
  { id: 64, domainId: 9, domainName: 'Conduta Social & Riscos Legais', text: 'Me expus a situações perigosas por fazer uso e/ou transportar substâncias ilícitas.' },
  { id: 65, domainId: 9, domainName: 'Conduta Social & Riscos Legais', text: 'Corri risco de ser processado por constranger, insultar e/ou humilhar outra pessoa.' },
  { id: 66, domainId: 9, domainName: 'Conduta Social & Riscos Legais', text: 'Corri o risco de ser processado por agredir outra pessoa.' }
];

export const EPF_SCALE_OPTIONS = [
  { value: 0, label: 'Não se aplica (NA)', code: 'NA', weight: 0 },
  { value: 0, label: 'Nunca (N)', code: 'N', weight: 0 },
  { value: 1, label: 'Raramente (R)', code: 'R', weight: 1 },
  { value: 2, label: 'Algumas vezes (AV)', code: 'AV', weight: 2 },
  { value: 3, label: 'Muitas vezes (MV)', code: 'MV', weight: 3 },
  { value: 4, label: 'Sempre (S)', code: 'S', weight: 4 }
];
