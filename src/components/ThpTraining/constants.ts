export interface PsychologicalSkill {
  name: string;
  desc: string;
  defaultExercises: string[];
}

export const PSYCHOLOGICAL_SKILLS: PsychologicalSkill[] = [
  {
    name: "Autoconhecimento",
    desc: "Capacidade de identificar as próprias emoções, pensamentos, padrões de comportamento, valores e crenças centrais.",
    defaultExercises: [
      "Diário de Registro de Pensamentos Automáticos e Gatilhos",
      "Lista de Valores Pessoais Fundamentais",
      "Auto-observação de reações físicas corporais associadas a emoções",
      "Identificação de pontos fortes e fraquezas em diferentes áreas da vida"
    ]
  },
  {
    name: "Autorregulação emocional",
    desc: "Capacidade de reconhecer, tolerar e modular a intensidade das reações emocionais de forma saudável e adaptativa.",
    defaultExercises: [
      "Prática de Respiração Diafragmática (Técnica 4-7-8)",
      "Aplicação do protocolo A.C.A.L.M.E.-S.E. durante crises de ansiedade",
      "Uso de técnicas de distração cognitiva ou mudança de foco de atenção",
      "Termômetro das Emoções (graduação da intensidade de 0 a 10)"
    ]
  },
  {
    name: "Raciocínio Realisticamente Otimista",
    desc: "Habilidade de interpretar situações cotidianas sob uma perspectiva construtiva, equilibrando realidade factual e esperança baseada em agência pessoal.",
    defaultExercises: [
      "Questionamento de evidências (A favor vs. Contra) de pensamentos catastróficos",
      "Geração de 3 interpretações alternativas realistas para um evento negativo",
      "Técnica da Torta de Responsabilidade (distribuição realista das culpas)",
      "Exercício do Pior Caso, Melhor Caso e Caso Mais Provável"
    ]
  },
  {
    name: "Autoestima",
    desc: "Sentimento de autovalorização, autoaceitação e respeito por si mesmo, independente de validações externas ou conquistas.",
    defaultExercises: [
      "Diário de Autoelogios e Reconhecimento de Conquistas Diárias",
      "Prática escrita de Autocompaixão diante de erros ou falhas",
      "Lista de Forças de Caráter e virtudes pessoais",
      "Treinamento para suavizar o diálogo interno crítico ou punitivo"
    ]
  },
  {
    name: "Resolutividade e Enfrentamento",
    desc: "Capacidade de definir problemas objetivamente, formular planos de ação factíveis e executar comportamentos de aproximação aos estressores.",
    defaultExercises: [
      "Brainstorming estruturado de soluções sem autojulgamento inicial",
      "Matriz de Prós e Contras para tomada de decisão clínica",
      "Montagem de uma Hierarquia de Enfrentamento/Exposição gradual",
      "Divisão de uma meta grande em micro-passos diários"
    ]
  },
  {
    name: "Autocontrole",
    desc: "Capacidade de adiar a gratificação imediata em prol de objetivos de longo prazo, gerenciando impulsos e hábitos automáticos.",
    defaultExercises: [
      "Técnica do adiamento do impulso ('Murchar a Onda' / Urge Surfing)",
      "Modificação do ambiente para remoção de gatilhos de comportamento impulsivo",
      "Contrato comportamental de compromisso com metas saudáveis",
      "Uso de Cartões de Enfrentamento visuais em momentos de forte desejo/impulso"
    ]
  },
  {
    name: "Sociabilidade",
    desc: "Habilidade de iniciar, manter e aprofundar interações sociais construtivas de forma recíproca e empática.",
    defaultExercises: [
      "Treino de comunicação assertiva utilizando a técnica do 'Disco Riscado'",
      "Exercício de iniciar conversas curtas com desconhecidos (treino informal)",
      "Uso de Comunicação Não-Violenta (CNV) para expressar necessidades interpessoais",
      "Auto-observação e aprimoramento da linguagem corporal e contato visual"
    ]
  },
  {
    name: "Imunidade Social",
    desc: "Capacidade de resistir a pressões de grupo, tolerar desaprovações sem sofrimento excessivo e definir limites interpessoais de forma assertiva.",
    defaultExercises: [
      "Treinar dizer 'Não' sem justificar ou pedir desculpas excessivas",
      "Uso da técnica de 'Fogging' (Nevoeiro) para lidar com críticas injustas",
      "Diferenciação escrita entre 'Validação Interna' e 'Necessidade de Aprovação'",
      "Estabelecimento e comunicação clara de limites em relacionamentos"
    ]
  },
  {
    name: "Sensibilidade Social",
    desc: "Habilidade de perceber, decodificar e empatizar com os sentimentos, necessidades e perspectivas das outras pessoas nas interações.",
    defaultExercises: [
      "Prática de Escuta Ativa (parafrasear o que o outro disse antes de responder)",
      "Exercício de decodificação de pistas não-verbais e expressões faciais",
      "Validação explícita dos sentimentos do outro em conversas difíceis",
      "Exercício de Tomada de Perspectiva (escrever o ponto de vista alheio)"
    ]
  },
  {
    name: "Hedonismo Responsável",
    desc: "Capacidade de programar e desfrutar de prazeres saudáveis a curto prazo sem comprometer a saúde física, emocional ou as metas de longo prazo.",
    defaultExercises: [
      "Planejamento de pelo menos 3 atividades prazerosas simples na agenda semanal",
      "Prática de Savoring (desfrute atento e consciente das sensações positivas)",
      "Avaliação do equilíbrio diário entre 'Deveres' e 'Prazeres'",
      "Identificação e substituição de prazeres compulsivos/autodestrutivos por saudáveis"
    ]
  }
];
