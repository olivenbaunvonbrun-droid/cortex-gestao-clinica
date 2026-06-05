import { LifeEvent } from '../types';

export function generateFakeEvents(): LifeEvent[] {
  return [
    {
      id: 'mock-1',
      age: 6,
      title: 'Início da Vida Escolar',
      description: 'Entrada na escola primária. Lembro-me de sentir muito medo da separação dos pais, mas fiz amigos rapidamente.',
      type: 'positive',
      intensity: 3
    },
    {
      id: 'mock-2',
      age: 10,
      title: 'Falecimento do Avô Materno',
      description: 'Primeira perda significativa na família. Senti profunda tristeza e percebi a vulnerabilidade dos meus pais diante da dor.',
      type: 'negative',
      intensity: 4
    },
    {
      id: 'mock-3',
      age: 15,
      title: 'Mudança de Cidade',
      description: 'Tivemos que nos mudar devido ao trabalho do meu pai. Deixei todos os amigos para trás e me senti extremamente isolado no novo colégio.',
      type: 'negative',
      intensity: 4
    },
    {
      id: 'mock-4',
      age: 18,
      title: 'Ingresso na Universidade',
      description: 'Aprovação no vestibular público. Foi um momento de grande validação pessoal, orgulho familiar e percepção de liberdade.',
      type: 'positive',
      intensity: 5
    },
    {
      id: 'mock-5',
      age: 23,
      title: 'Primeira Conquista Profissional',
      description: 'Promoção para cargo de liderança no trabalho. Senti que meu esforço e inteligência foram reconhecidos formalmente.',
      type: 'positive',
      intensity: 4
    },
    {
      id: 'mock-6',
      age: 27,
      title: 'Rompimento de Relacionamento Longo',
      description: 'Término de um namoro de 5 anos. Gerou um período de profunda desorganização interna, questionamento de valor próprio e tristeza.',
      type: 'negative',
      intensity: 5
    },
    {
      id: 'mock-7',
      age: 30,
      title: 'Início da Terapia e Reestruturação',
      description: 'Decisão de buscar apoio psicológico e iniciar transição de carreira para alinhar minha vida aos meus verdadeiros valores.',
      type: 'positive',
      intensity: 5
    }
  ];
}
