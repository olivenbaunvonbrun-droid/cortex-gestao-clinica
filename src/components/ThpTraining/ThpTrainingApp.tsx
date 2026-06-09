import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { syncService } from '../../lib/syncService';
import { Patient, EarlyNeed, SchemaEID, CopingStyle, PsychologicalSkill, TrainingPeriod, SessionLog } from './types';
import Sidebar from './components/Sidebar';
import PatientSelector from './components/PatientSelector';
import ScalesCabinet from './components/ScalesCabinet';
import ClinicalMap from './components/ClinicalMap';
import PharmacologyConsultant from './components/PharmacologyConsultant';
import PeriodizationManager from './components/PeriodizationManager';
import TrainingModule from './components/TrainingModule';
import TherapistReport from './components/TherapistReport';
import { Toaster, toast } from 'react-hot-toast';
import { Activity, BookOpen } from 'lucide-react';
import UserGuideTour from './components/UserGuideTour';
import { YSQ_QUESTIONS } from '../YsqSmartAi/types';

const clinicalSchemaMappings: { schema: SchemaEID; keywords: string[] }[] = [
  {
    schema: SchemaEID.Fracasso,
    keywords: ["fracass", "falh", "incompet", "derrot", "incapaz", "não dou conta", "burro", "errei", "errar", "ruim", "farsa", "inútil", "insucesso"]
  },
  {
    schema: SchemaEID.Abandono,
    keywords: ["abandon", "rejeit", "sozinho", "me deixar", "solidão", "instáv", "instabil", "ir embora", "separ", "perder quem amo", "partir"]
  },
  {
    schema: SchemaEID.Desconfianca,
    keywords: ["desconfi", "abus", "trai", "traição", "menti", "engana", "passar a perna", "aproveitar de mim", "maldade", "maldoso", "prejudicar"]
  },
  {
    schema: SchemaEID.PrivacaoEmocional,
    keywords: ["privaç", "frio", "distante", "não me ouve", "não me apoia", "compreend", "sem afeto", "carinho", "desamparo", "solidão", "vazio", "negligenc"]
  },
  {
    schema: SchemaEID.Defectividade,
    keywords: ["defeit", "vergonh", "inadequa", "rejeita", "esconder", "imperfeit", "feio", "estranho", "culpa", "indigno", "mácula"]
  },
  {
    schema: SchemaEID.IsolamentoSocial,
    keywords: ["isol", "excluid", "estranho", "diferente", "desencaix", "não pertenço", "tímido", "fobia social", "retraído", "não me misturo"]
  },
  {
    schema: SchemaEID.Dependencia,
    keywords: ["depend", "incompet", "sem ajuda", "não consigo só", "inseguro", "infantil", "tutela", "apoio", "frágil", "indefeso"]
  },
  {
    schema: SchemaEID.Vulnerabilidade,
    keywords: ["vulnera", "doenç", "pânico", "morrer", "catástrofe", "perigo", "assalto", "louco", "enfart", "desastre", "infarto"]
  },
  {
    schema: SchemaEID.Emaranhamento,
    keywords: ["emaranh", "sufoc", "minha mãe", "meu pai", "sem identidade", "viver a vida do", "não sei quem sou", "simbiose", "fusionado"]
  },
  {
    schema: SchemaEID.Grandiosidade,
    keywords: ["grandios", "arrog", "superior", "especial", "regras não se aplicam", "controlar os outros", "exigir", "egoísta", "privilegiado"]
  },
  {
    schema: SchemaEID.AutocontroleInsuficiente,
    keywords: ["impuls", "desorganiz", "preguiç", "procrastin", "desist", "tédio", "não tolero frustração", "sem limites", "vício"]
  },
  {
    schema: SchemaEID.Subjugacao,
    keywords: ["subjug", "submiss", "agradar", "obedec", "medo de brigar", "medo de punição", "anular", "ceder", "sujeitar"]
  },
  {
    schema: SchemaEID.AutoSacrificio,
    keywords: ["auto-sacrific", "sacrific", "ajudar a todos", "carga dos outros", "não dizer não", "cuidar de todos", "esquecer de mim", "generoso demais"]
  },
  {
    schema: SchemaEID.BuscaAprovacao,
    keywords: ["aprov", "reconhec", "elogio", "status", "aparência", "agradar para ser aceito", "popularidade", "chamar atenção"]
  },
  {
    schema: SchemaEID.Negatividade,
    keywords: ["negativ", "pessim", "dar errado", "pior cenário", "reclam", "azar", "preocup", "desgraça"]
  },
  {
    schema: SchemaEID.InibicaoEmocional,
    keywords: ["inib", "reprim", "segurar", "não chorar", "frio", "racional", "esconder sentimentos", "controlar emoção"]
  },
  {
    schema: SchemaEID.PadroesInflexiveis,
    keywords: ["perfeit", "exig", "crítica", "cobranç", "detalhe", "erro é inadmissível", "sempre melhor", "rígido", "inflexível"]
  },
  {
    schema: SchemaEID.Punitividade,
    keywords: ["punitiv", "castig", "punir", "erro deve ser pago", "intolerante", "duro", "sem perdão", "vingança"]
  }
];

const clinicalNeedMappings: { need: EarlyNeed; keywords: string[] }[] = [
  {
    need: EarlyNeed.Vinculo,
    keywords: ["vínculo", "conexão", "pertencer", "amizade", "afeto", "amor", "família", "aceitação", "rejeitado", "solidão", "isolado"]
  },
  {
    need: EarlyNeed.Autonomia,
    keywords: ["autonomia", "independência", "escolha", "decidir", "liberdade", "crescer", "separar", "sufocado", "controlado"]
  },
  {
    need: EarlyNeed.Protecao,
    keywords: ["proteção", "segurança", "abrigo", "perigo", "defesa", "medo", "cuidado", "ameaçado", "desprotegido"]
  },
  {
    need: EarlyNeed.Cuidado,
    keywords: ["cuidado", "zelo", "atenção", "carinho", "apoio", "conforto", "negligenciado", "abandonado"]
  },
  {
    need: EarlyNeed.Diversao,
    keywords: ["diversão", "lazer", "brincar", "relaxar", "descontrair", "prazer", "alegria", "trabalho demais", "estressado"]
  },
  {
    need: EarlyNeed.Responsabilidade,
    keywords: ["responsabilidade", "limite", "dever", "compromisso", "disciplina", "regras", "folgado", "impulsivo"]
  },
  {
    need: EarlyNeed.Instrucao,
    keywords: ["instrução", "ensino", "aprendizado", "orientação", "diretriz", "desorientado", "sem rumo"]
  },
  {
    need: EarlyNeed.Identidade,
    keywords: ["identidade", "quem sou", "autenticidade", "autoexpressão", "singularidade", "confuso", "sem rumo"]
  },
  {
    need: EarlyNeed.Compreensao,
    keywords: ["compreensão", "escuta", "entendimento", "empatia", "validação", "incompreendido", "ignorado"]
  }
];

const schemaBeliefsMap: Record<SchemaEID, { core: string[]; intermediate: string[]; thoughts: string[]; behaviors: string[] }> = {
  [SchemaEID.Fracasso]: {
    core: ["Sou incompetente", "Não tenho capacidade de vencer", "Vou falhar novamente"],
    intermediate: ["Se eu tentar algo desafiador, vou falhar e passar vergonha", "Devo evitar riscos para não confirmar minha incompetência"],
    thoughts: ["Não vou dar conta", "Isso é difícil demais para mim", "Vou fracassar de novo"],
    behaviors: ["Procrastinar tarefas importantes", "Evitar aceitar promoções ou desafios", "Desistir diante da primeira dificuldade"]
  },
  [SchemaEID.Abandono]: {
    core: ["Estou sozinho no mundo", "As pessoas que eu amo vão me deixar", "Ninguém é estável"],
    intermediate: ["Se eu me aproximar de alguém, acabarei sendo abandonado", "Preciso monitorar constantemente se a pessoa quer ir embora"],
    thoughts: ["Ela está demorando a responder porque perdeu o interesse", "Vou ficar sozinho para sempre"],
    behaviors: ["Cobranças excessivas por atenção", "Afastar-se preventivamente para não ser rejeitado", "Tolerar abusos por medo da solidão"]
  },
  [SchemaEID.Desconfianca]: {
    core: ["As pessoas são maldosas", "Se eu baixar a guarda, serei passado para trás", "Ninguém é confiável"],
    intermediate: ["Se eu confiar nas pessoas, elas vão se aproveitar de mim", "Preciso manter distância emocional para me proteger"],
    thoughts: ["Ele está sendo legal porque quer alguma coisa em troca", "Estão tramando contra mi"],
    behaviors: ["Esconder informações pessoais", "Testar a lealdade das pessoas", "Reagir com agressividade defensiva preventiva"]
  },
  [SchemaEID.PrivacaoEmocional]: {
    core: ["Ninguém se importa comigo", "Minhas necessidades emocionais nunca serão atendidas", "Sou invisível"],
    intermediate: ["Se eu expressar o que sinto, ninguém vai ligar ou entender", "Não vale a pena pedir apoio, pois ninguém se voluntaria"],
    thoughts: ["Ninguém liga para o que eu sinto", "Estou completamente sozinho nessa dor"],
    behaviors: ["Não expressar sentimentos ou necessidades", "Escolher parceiros afetivamente frios ou distantes", "Fingir que está tudo bem sempre"]
  },
  [SchemaEID.Defectividade]: {
    core: ["Sou inadequado e defeituoso", "Se as pessoas me conhecerem de verdade, vão me rejeitar", "Tenho vergonha de quem sou"],
    intermediate: ["Se eu me expuser, vão perceber meus defeitos e rir de mim", "Preciso esconder minhas imperfeições a todo custo"],
    thoughts: ["Eles estão me julgando", "Falei bobagem, que vergonha", "Vão perceber que sou estranho"],
    behaviors: ["Evitar falar de si mesmo", "Reagir com extrema defensividade a críticas", "Comportar-se de forma retraída em grupos"]
  },
  [SchemaEID.IsolamentoSocial]: {
    core: ["Sou diferente dos outros", "Não pertenço a nenhum grupo", "Sou um desajustado"],
    intermediate: ["Se eu tentar me misturar, vou me sentir um peixe fora d'água", "É melhor ficar isolado do que tentar me encaixar"],
    thoughts: ["Não pertenço a este lugar", "Ninguém aqui compartilha dos meus interesses"],
    behaviors: ["Evitar interações sociais e eventos", "Permanecer em silêncio absoluto em reuniões sociais", "Isolar-se em atividades solitárias"]
  },
  [SchemaEID.Dependencia]: {
    core: ["Sou incapaz de tomar decisões sozinho", "Preciso de alguém para me guiar", "Sou frágil e indefeso"],
    intermediate: ["Se eu tomar uma decisão sozinho, cometerei um erro catastrófico", "Preciso de aprovação constante antes de agir"],
    thoughts: ["Não sei o que fazer", "Preciso que alguém faça isso por mim", "Vou errar se decidir sozinho"],
    behaviors: ["Pedir conselhos repetitivos para decisões simples", "Delegar a liderança da própria vida para terceiros", "Evitar tarefas autônomas"]
  },
  [SchemaEID.Vulnerabilidade]: {
    core: ["O mundo é extremamente perigoso", "Algo terrível vai acontecer a qualquer momento", "Não vou suportar o colapso"],
    intermediate: ["Se eu não estiver em alerta máximo constante, serei pego de surpresa pelo desastre", "Qualquer sintoma físico indica doença fatal"],
    thoughts: ["Meu coração está acelerado, vou ter um ataque cardíaco", "Esse avião vai cair", "Vou ser assaltado"],
    behaviors: ["Evitar viajar de avião ou ir a locais cheios", "Fazer checagens médicas repetitivas", "Evitar ler notícias de acidentes"]
  },
  [SchemaEID.Emaranhamento]: {
    core: ["Não existo sem meus pais/parceiro", "Minha identidade é fusionada com a do outro", "Não tenho limites próprios"],
    intermediate: ["Se eu tomar um rumo diferente do planejado pela minha família, serei um traidor", "Minha felicidade depende da aprovação deles"],
    thoughts: ["O que minha mãe pensaria disso?", "Não posso magoá-los seguindo meus próprios sonhos"],
    behaviors: ["Compartilhar detalhes excessivos da vida privada com familiares", "Mudar planos de carreira para agradar aos pais", "Dificuldade em impor limites"]
  },
  [SchemaEID.Grandiosidade]: {
    core: ["Sou superior aos outros", "As regras comuns não se aplicam a mim", "Mereço tratamento especial"],
    intermediate: ["Se eu não controlar as situações, serei rebaixado", "Tenho o direito de ter o que quero imediatamente"],
    thoughts: ["Eles são muito lentos e incompetentes", "Por que tenho que esperar na fila como os outros?"],
    behaviors: ["Falar de forma arrogante ou imperativa", "Interromper as pessoas com frequência", "Desrespeitar prazos ou combinados comuns"]
  },
  [SchemaEID.AutocontroleInsuficiente]: {
    core: ["Não tenho disciplina para nada", "Não suporto o tédio ou a frustração", "Desisto facilmente"],
    intermediate: ["Se uma tarefa for chata ou difícil, devo abandoná-la imediatamente para buscar prazer", "Não consigo me controlar"],
    thoughts: ["Vou deixar isso para depois", "Que saco, não quero fazer isso agora", "Só mais um episódio/jogo"],
    behaviors: ["Procrastinação severa e crônica", "Uso excessivo de telas, substâncias ou compras", "Dificuldade em manter hábitos saudáveis"]
  },
  [SchemaEID.Subjugacao]: {
    core: ["Minhas vontades não importam", "Preciso me submeter para evitar conflito ou punição", "Sou obrigado a ceder"],
    intermediate: ["Se eu expressar meu desejo, o outro ficará zangado e me punirá", "É melhor ceder do que confrontar"],
    thoughts: ["Vou fazer o que ele quer para não ter briga", "Não posso dizer não", "O que eles querem é mais importante"],
    behaviors: ["Concordar com opiniões alheias mesmo discordando", "Engolir sapos e guardar ressentimentos", "Dificuldade crônica em expressar raiva"]
  },
  [SchemaEID.AutoSacrificio]: {
    core: ["Devo carregar a dor do mundo", "O bem-estar dos outros é minha responsabilidade integral", "Meus sentimentos são secundários"],
    intermediate: ["Se eu focar em mim mesmo, serei uma pessoa egoísta e ruim", "Dizer não é magoar os outros"],
    thoughts: ["Preciso ajudar fulano, ele não vai dar conta sozinho", "Não posso ir embora enquanto eles precisarem de mim"],
    behaviors: ["Assumir tarefas de colegas de trabalho", "Colocar-se em segundo plano em todas as relações", "Sentir culpa intensa ao descansar"]
  },
  [SchemaEID.BuscaAprovacao]: {
    core: ["Meu valor depende do que os outros pensam de mim", "Preciso ser elogiado para me sentir bem", "Status é tudo"],
    intermediate: ["Se eu não receber elogios ou reconhecimento constante, significa que sou invisível", "Preciso moldar minha opinião para agradar"],
    thoughts: ["Será que eles gostaram da minha apresentação?", "Preciso postar isso para mostrar meu sucesso", "O que vão pensar de mim?"],
    behaviors: ["Mudar de estilo ou opinião para se encaixar", "Gastar dinheiro além do limite para obter status", "Pescar elogios indiretamente"]
  },
  [SchemaEID.Negatividade]: {
    core: ["Tudo vai dar errado no final", "A vida é uma sucessão de sofrimentos", "O otimismo é uma ilusão tola"],
    intermediate: ["Se eu me sentir feliz ou relaxado, algo ruim acontecerá para equilibrar", "Preciso prever todos os desastres possíveis"],
    thoughts: ["Isso não vai funcionar", "É bom demais para ser verdade, logo vem a pancada", "Sempre acontece o pior comigo"],
    behaviors: ["Ruminação constante sobre problemas", "Focar unicamente nos aspectos negativos de qualquer conquista", "Expressar pessimismo a terceiros"]
  },
  [SchemaEID.InibicaoEmocional]: {
    core: ["Mostrar emoções é sinal de fraqueza", "Devo ser racional e controlado o tempo todo", "A espontaneidade é perigosa"],
    intermediate: ["Se eu chorar ou demonstrar raiva, serei considerado descontrolado", "Preciso manter a postura neutra a todo custo"],
    thoughts: ["Não posso demonstrar que estou nervoso", "Ria de forma contida para não parecer bobo", "Melhor ficar calado e neutro"],
    behaviors: ["Falar de sentimentos de forma fria ou racionalizada", "Evitar contatos físicos de afeto", "Inabilidade de brincar ou rir alto"]
  },
  [SchemaEID.PadroesInflexiveis]: {
    core: ["Errar é inaceitável", "Eu devo ser o melhor em tudo o que faço", "O tempo é curto e a cobrança é alta"],
    intermediate: ["Se eu não atingir a perfeição, serei um fracasso comum", "Preciso dar 150% de mim em cada detalhe"],
    thoughts: ["Ficou bom, mas poderia estar melhor", "Não posso perder tempo descansando", "Isso está desalinhado, que desleixo"],
    behaviors: ["Checar e refazer trabalhos repetitivamente", "Trabalhar em fins de semana e feriados", "Criticar severamente os erros alheios"]
  },
  [SchemaEID.Punitividade]: {
    core: ["Quem erra deve ser punido rigorosamente", "Não há desculpas para falhas", "A justiça deve ser implacável"],
    intermediate: ["Se eu perdoar um erro, estarei sendo cúmplice da fraqueza", "Pessoas fracas ou preguiçosas merecem sofrer as consequências"],
    thoughts: ["Ele cometeu um erro bobo, merece ser demitido", "Eu errei, sou um lixo e mereço me ferrar"],
    behaviors: ["Reagir com hostilidade a falhas alheias", "Autopunição severa (privação, autocrítica corrosiva)", "Cortar relações sem chance de diálogo"]
  }
};

const skillExercisesMap: Record<PsychologicalSkill, { title: string; rewardXp: number }[]> = {
  [PsychologicalSkill.Autoconhecimento]: [
    { title: "Diário de Modos: Identificação de Gatilhos Semanais", rewardXp: 100 },
    { title: "Mapeamento Histórico de Modos de Sobrevivência", rewardXp: 150 }
  ],
  [PsychologicalSkill.RealismoOtimista]: [
    { title: "Descatastrofização de Cenários Profissionais", rewardXp: 150 },
    { title: "Tabela de Probabilidades Reais vs Piores Temores", rewardXp: 200 }
  ],
  [PsychologicalSkill.Autocontrole]: [
    { title: "Arranjo do Ambiente de Trabalho Contra Distrações", rewardXp: 100 },
    { title: "Fatiamento de Metas de Projetos Complexos", rewardXp: 150 }
  ],
  [PsychologicalSkill.Sociabilidade]: [
    { title: "Role-play: Diálogo de Assertividade e Cooperação", rewardXp: 150 },
    { title: "Declaração Expressa de Vontades Sinceras", rewardXp: 200 }
  ],
  [PsychologicalSkill.ResolutividadeEnfrentamento]: [
    { title: "Role-play: O Colega Distraído (Nível 1)", rewardXp: 200 },
    { title: "Role-play: O Superior Sarcástico (Nível 2)", rewardXp: 250 }
  ],
  [PsychologicalSkill.AutorregulacaoEmocional]: [
    { title: "Treino de Respiração Diafragmática (Ciclo Parassimpático)", rewardXp: 150 },
    { title: "Diário de Escala de Tensão e Biofeedback SUD", rewardXp: 100 }
  ],
  [PsychologicalSkill.HedonismoResponsavel]: [
    { title: "Agendamento de Pausas Lúdicas Sem Culpa", rewardXp: 150 },
    { title: "Ficha de Custo-Benefício do Perfeccionismo Crônico", rewardXp: 150 }
  ],
  [PsychologicalSkill.SensibilidadeSocial]: [
    { title: "Ação Voluntária de Suporte e Altruísmo", rewardXp: 100 },
    { title: "Prática de Escuta Ativa Sem Julgamentos", rewardXp: 150 }
  ],
  [PsychologicalSkill.Autoestima]: [
    { title: "Diário de Conquistas e Autoelogio Realista", rewardXp: 150 },
    { title: "Cadeira Vazia Contra Autocrítica Severa", rewardXp: 250 }
  ],
  [PsychologicalSkill.ImunidadeSocial]: [
    { title: "Exposição Imunizadora Voluntária (Meia Diferente)", rewardXp: 300 },
    { title: "Desfusão Cognitiva: Metáfora do Ônibus", rewardXp: 200 }
  ]
};

// Helper to decode Base64 strings handling UTF-8 (and special characters like accents) correctly
function decodeBase64Utf8(base64Str: string): string {
  try {
    const binaryString = atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (err) {
    try {
      return decodeURIComponent(escape(atob(base64Str)));
    } catch (e) {
      return atob(base64Str);
    }
  }
}

// Helper to remove HTML tags, CSS styles, script tags, and decode common entities
function cleanHtmlText(htmlStr: string): string {
  let text = htmlStr;
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<[^>]*>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text.replace(/\s+/g, " ").trim();
}

interface ThpTrainingAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
}

export default function ThpTrainingApp({ activePatientId, lockPatient = false, userId }: ThpTrainingAppProps) {
  const [activeTab, setActiveTab] = useState<string>('profiler');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [thpPatient, setThpPatient] = useState<Patient | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Load patients list and map to Patient type
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const all = await db.pacientes.toArray();
        const mapped = await Promise.all(
          all.map(async (p) => {
            const prontuario = await db.prontuarios.get(p.id);
            if (prontuario?.thpState) {
              return prontuario.thpState;
            }

            let age = 30;
            if (p.nascimento) {
              age = new Date().getFullYear() - new Date(p.nascimento).getFullYear();
            }

            return {
              id: p.id,
              name: p.nome,
              age: age,
              profession: "Paciente",
              clinicalQueixa: "",
              establishingOperations: "",
              neglectedNeeds: [],
              activeSchemas: [],
              beliefs: { coreBeliefs: [], intermediateBeliefs: [], automaticThoughts: [] },
              copingStyleSelected: CopingStyle.Evitacao,
              copingBehaviors: [],
              periodization: [],
              sessionHistory: [],
              level: 1,
              xp: 0,
              streakDays: 1,
              unlockedBadges: [],
              scaleHistory: [],
              sudLogs: [],
              activePrescriptions: []
            } as Patient;
          })
        );
        setPatients(mapped);
        if (activePatientId) {
          setSelectedPatientId(String(activePatientId));
        } else if (mapped.length > 0) {
          setSelectedPatientId(mapped[0].id);
        }
      } catch (err) {
        console.error("Failed to load patients list:", err);
      }
    };
    loadPatients();
  }, [activePatientId]);

  // Load THP patient state when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      loadThpPatient(selectedPatientId);
    } else {
      setThpPatient(null);
    }
  }, [selectedPatientId]);

  const loadThpPatient = async (patientId: string) => {
    if (!patientId) return;
    try {
      const prontuario = await db.prontuarios.get(patientId);
      const paciente = await db.pacientes.get(patientId);
      if (!paciente) return;

      // Calculate age
      let age = 30;
      if (paciente.nascimento) {
        const birthYear = new Date(paciente.nascimento).getFullYear();
        const currentYear = new Date().getFullYear();
        age = currentYear - birthYear;
      }

      // 1. Get current saved THP state or create a fresh one
      let thpState: Patient;
      const hasPreviousState = !!prontuario?.thpState;
      if (hasPreviousState) {
        // Deep copy of existing state
        thpState = JSON.parse(JSON.stringify(prontuario.thpState));
      } else {
        thpState = {
          id: patientId,
          name: paciente.nome,
          age: age,
          profession: paciente.historicoHtml?.includes("Profissão") ? "Profissional" : "Estudante",
          clinicalQueixa: "",
          establishingOperations: "",
          neglectedNeeds: [],
          activeSchemas: [],
          beliefs: { coreBeliefs: [], intermediateBeliefs: [], automaticThoughts: [] },
          copingStyleSelected: CopingStyle.Evitacao,
          copingBehaviors: [],
          periodization: [],
          sessionHistory: [],
          level: 1,
          xp: 0,
          streakDays: 1,
          unlockedBadges: [],
          scaleHistory: [],
          sudLogs: [],
          activePrescriptions: []
        };
      }

      // Ensure patient name and age are always synced with database
      thpState.name = paciente.nome;
      thpState.age = age;

      // 2. Extract latest PCI data if available
      let latestPci: any = null;
      if (prontuario?.entradas) {
        const pciEntries = prontuario.entradas.filter(e => e.tipo === 'pci' || e.metadata?.type === 'pci');
        if (pciEntries.length > 0) {
          pciEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          latestPci = pciEntries[0].metadata?.pciData;
        }
      }

      // 3. Extract YSQ data if available (active schemas)
      const activeYSQSchemas: SchemaEID[] = [];
      const schemaKeyToEnum: Record<string, SchemaEID> = {
        ED: SchemaEID.PrivacaoEmocional,
        AB: SchemaEID.Abandono,
        MA: SchemaEID.Desconfianca,
        SI: SchemaEID.IsolamentoSocial,
        DS: SchemaEID.Defectividade,
        FA: SchemaEID.Fracasso,
        DI: SchemaEID.Dependencia,
        VH: SchemaEID.Vulnerabilidade,
        EM: SchemaEID.Emaranhamento,
        SB: SchemaEID.Subjugacao,
        SS: SchemaEID.AutoSacrificio,
        AS: SchemaEID.BuscaAprovacao,
        NP: SchemaEID.Negatividade,
        EI: SchemaEID.InibicaoEmocional,
        US: SchemaEID.PadroesInflexiveis,
        PU: SchemaEID.Punitividade,
        ET: SchemaEID.Grandiosidade,
        IS: SchemaEID.AutocontroleInsuficiente
      };

      if (prontuario?.entradas) {
        const ysqEntries = prontuario.entradas.filter(e => e.tipo === 'ysq' || e.metadata?.type === 'ysq');
        if (ysqEntries.length > 0) {
          ysqEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          const ysqEntry = ysqEntries[0];
          const ysqData = ysqEntry.metadata?.ysqData;
          if (ysqData && ysqData.answers) {
            const ysqAnswers = ysqData.answers;
            const schemaSums: Record<string, number> = {};
            const schemaCounts: Record<string, number> = {};
            
            YSQ_QUESTIONS.forEach(q => {
              const val = Number(ysqAnswers[q.id]);
              if (val !== undefined && !isNaN(val)) {
                schemaSums[q.schemaKey] = (schemaSums[q.schemaKey] || 0) + val;
                schemaCounts[q.schemaKey] = (schemaCounts[q.schemaKey] || 0) + 1;
              }
            });

            Object.keys(schemaKeyToEnum).forEach(key => {
              const avg = (schemaSums[key] || 0) / (schemaCounts[key] || 5);
              if (avg >= 4) {
                activeYSQSchemas.push(schemaKeyToEnum[key]);
              }
            });
          }
        }
      }


      // 4. Extract RID entries
      const ridEntries = prontuario?.entradas ? prontuario.entradas.filter(e => e.tipo === 'rid') : [];

      // 5. Merge Clinical Profile Fields
      // Overwrite main description/complaint fields if new data exists
      if (latestPci?.eventoQueixas && latestPci.eventoQueixas.trim()) {
        thpState.clinicalQueixa = latestPci.eventoQueixas.trim();
      }
      if (latestPci?.rotina && latestPci.rotina.trim()) {
        thpState.establishingOperations = latestPci.rotina.trim();
      }
      if (latestPci?.escolaridade && latestPci.escolaridade.trim()) {
        thpState.profession = latestPci.escolaridade.trim();
      }

      // Needs: search and merge
      const needsSet = new Set<EarlyNeed>(thpState.neglectedNeeds || []);
      if (latestPci?.necessidadesIdentificadas) {
        const needsText = (latestPci.necessidadesIdentificadas || "") + " " + (latestPci.eventoQueixas || "");
        Object.values(EarlyNeed).forEach(need => {
          if (needsText.toLowerCase().includes(need.toLowerCase())) {
            needsSet.add(need);
          }
        });
      }
      ridEntries.forEach(rid => {
        const ridData = rid.metadata?.ridData;
        if (ridData?.needs) {
          Object.values(EarlyNeed).forEach(need => {
            if (ridData.needs.toLowerCase().includes(need.toLowerCase())) {
              needsSet.add(need);
            }
          });
        }
      });
      thpState.neglectedNeeds = Array.from(needsSet);

      // Active Schemas: search and merge
      const schemasSet = new Set<SchemaEID>(thpState.activeSchemas || []);
      activeYSQSchemas.forEach(s => schemasSet.add(s));
      if (latestPci?.esquemasCognitivos) {
        const schemasText = latestPci.esquemasCognitivos;
        Object.values(SchemaEID).forEach(schema => {
          if (schemasText.toLowerCase().includes(schema.toLowerCase())) {
            schemasSet.add(schema);
          }
        });
      }
      thpState.activeSchemas = Array.from(schemasSet);

      // Beliefs: merge arrays in a clean way (no duplicates)
      const mergeArrays = (existing: string[], incomingText: string | undefined, splitRegex = /[;\n]/) => {
        if (!incomingText) return existing;
        const currentSet = new Set<string>(existing.map(s => s.trim().toLowerCase()));
        const result = [...existing];
        incomingText.split(splitRegex).map(s => s.trim()).filter(Boolean).forEach(s => {
          if (!currentSet.has(s.toLowerCase())) {
            currentSet.add(s.toLowerCase());
            result.push(s);
          }
        });
        return result;
      };

      if (!thpState.beliefs) {
        thpState.beliefs = { coreBeliefs: [], intermediateBeliefs: [], automaticThoughts: [] };
      }
      thpState.beliefs.coreBeliefs = mergeArrays(thpState.beliefs.coreBeliefs || [], latestPci?.crencasCentrais);
      thpState.beliefs.intermediateBeliefs = mergeArrays(thpState.beliefs.intermediateBeliefs || [], latestPci?.crencasPerifericas);
      thpState.beliefs.automaticThoughts = mergeArrays(thpState.beliefs.automaticThoughts || [], latestPci?.ridPensamento);

      // Add thoughts from RIDs
      ridEntries.forEach(rid => {
        const ridData = rid.metadata?.ridData;
        if (ridData?.resThoughts) {
          thpState.beliefs.automaticThoughts = mergeArrays(thpState.beliefs.automaticThoughts, ridData.resThoughts);
        }
      });

      // Coping Style Selected
      if (latestPci?.ridComportamento) {
        const compText = latestPci.ridComportamento.toLowerCase();
        if (compText.includes("fuga") || compText.includes("evitar") || compText.includes("esquiva") || compText.includes("isol")) {
          thpState.copingStyleSelected = CopingStyle.Evitacao;
        } else if (compText.includes("agred") || compText.includes("combate") || compText.includes("hiper") || compText.includes("arrog")) {
          thpState.copingStyleSelected = CopingStyle.Hipercompensacao;
        } else {
          thpState.copingStyleSelected = CopingStyle.Rendicao;
        }
      }

      // Coping Behaviors: merge PCI excesses and RIDs actions
      thpState.copingBehaviors = mergeArrays(thpState.copingBehaviors || [], latestPci?.excessosComp);
      thpState.copingBehaviors = mergeArrays(thpState.copingBehaviors || [], latestPci?.ridComportamento);
      ridEntries.forEach(rid => {
        const ridData = rid.metadata?.ridData;
        if (ridData?.resActions) {
          thpState.copingBehaviors = mergeArrays(thpState.copingBehaviors, ridData.resActions);
        }
      });


      // 5.1 Local Keyword-based parsing of all evolution texts, attachments, and other records
      let attachmentsText = "";
      try {
        const attachments = await db.anexos.where('ownerId').equals(patientId).toArray();
        if (attachments && attachments.length > 0) {
          attachmentsText = attachments.map(att => `Arquivo Anexo: ${att.nomeArquivo} (Tipo: ${att.tipoArquivo})`).join("\n");
          for (const att of attachments) {
            if (att.conteudoArquivo) {
              const fileNameLower = (att.nomeArquivo || "").toLowerCase();
              const fileTypeLower = (att.tipoArquivo || "").toLowerCase();
              const isHtml = fileNameLower.endsWith(".html") || fileNameLower.endsWith(".htm") || fileTypeLower.includes("html");
              const isTxt = fileNameLower.endsWith(".txt") || fileNameLower.endsWith(".md") || fileNameLower.endsWith(".csv") || fileNameLower.endsWith(".json") || fileTypeLower.includes("text") || fileTypeLower.includes("json");
              
              if (isHtml || isTxt) {
                try {
                  let fileContent = att.conteudoArquivo;
                  if (fileContent.includes("base64,")) {
                    fileContent = decodeBase64Utf8(fileContent.split("base64,")[1]);
                  } else if (/^[A-Za-z0-9+/=]+$/.test(fileContent.trim()) && fileContent.length % 4 === 0) {
                    fileContent = decodeBase64Utf8(fileContent);
                  }
                  
                  if (isHtml) {
                    fileContent = cleanHtmlText(fileContent);
                  }
                  attachmentsText += `\nConteúdo do arquivo ${att.nomeArquivo}:\n${fileContent}\n`;
                } catch (e) {
                  console.error("Erro ao decodificar ou limpar anexo:", e);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to query attachments:", err);
      }

      let compiledText = attachmentsText;
      if (prontuario) {
        if (prontuario.longitudinalProfile) compiledText += " " + prontuario.longitudinalProfile;
        if (prontuario.anamneseData) compiledText += " " + JSON.stringify(prontuario.anamneseData);
        if (prontuario.entradas) {
          prontuario.entradas.forEach(e => {
            if (e.textoHtml) compiledText += " " + e.textoHtml;
          });
        }
      }
      if (paciente.historicoHtml) compiledText += " " + paciente.historicoHtml;
      if (paciente.psicodiagnosticoHtml) compiledText += " " + paciente.psicodiagnosticoHtml;

      const lowerCompiledText = compiledText.toLowerCase();

      // Scan for needs with advanced stem mapping:
      const localNeedsSet = new Set<EarlyNeed>(thpState.neglectedNeeds || []);
      clinicalNeedMappings.forEach(mapping => {
        const matches = mapping.keywords.some(kw => lowerCompiledText.includes(kw));
        if (matches) {
          localNeedsSet.add(mapping.need);
        }
      });
      thpState.neglectedNeeds = Array.from(localNeedsSet);

      // Scan for schemas with advanced stem mapping:
      const localSchemasSet = new Set<SchemaEID>(thpState.activeSchemas || []);
      clinicalSchemaMappings.forEach(mapping => {
        const matches = mapping.keywords.some(kw => lowerCompiledText.includes(kw));
        if (matches) {
          localSchemasSet.add(mapping.schema);
        }
      });
      thpState.activeSchemas = Array.from(localSchemasSet);

      // Scan for coping style:
      if (lowerCompiledText.includes("evitação") || lowerCompiledText.includes("esquiva") || lowerCompiledText.includes("fuga")) {
        thpState.copingStyleSelected = CopingStyle.Evitacao;
      } else if (lowerCompiledText.includes("hipercompensação") || lowerCompiledText.includes("compensar") || lowerCompiledText.includes("arrogância")) {
        thpState.copingStyleSelected = CopingStyle.Hipercompensacao;
      } else if (lowerCompiledText.includes("rendição") || lowerCompiledText.includes("submissão")) {
        thpState.copingStyleSelected = CopingStyle.Rendicao;
      }

      // If clinicalQueixa is empty, try to extract a brief summary from historical texts:
      if (!thpState.clinicalQueixa && lowerCompiledText.trim()) {
        if (paciente.historicoHtml) {
          const cleanHistory = paciente.historicoHtml.replace(/<[^>]*>/g, '').trim();
          if (cleanHistory) thpState.clinicalQueixa = cleanHistory.substring(0, 150) + "...";
        } else if (prontuario?.longitudinalProfile) {
          thpState.clinicalQueixa = prontuario.longitudinalProfile.substring(0, 150) + "...";
        }
      }

      // Merge clinical default beliefs for detected active schemas
      thpState.activeSchemas.forEach(schema => {
        const defaults = schemaBeliefsMap[schema];
        if (defaults) {
          thpState.beliefs.coreBeliefs = mergeArrays(thpState.beliefs.coreBeliefs || [], defaults.core.join("\n"));
          thpState.beliefs.intermediateBeliefs = mergeArrays(thpState.beliefs.intermediateBeliefs || [], defaults.intermediate.join("\n"));
          thpState.beliefs.automaticThoughts = mergeArrays(thpState.beliefs.automaticThoughts || [], defaults.thoughts.join("\n"));
          thpState.copingBehaviors = mergeArrays(thpState.copingBehaviors || [], defaults.behaviors.join("\n"));
        }
      });

      // 6. Define/Sync training periods for deficient skills (corresponding to active schemas)
      const schemaToSkill: Record<SchemaEID, PsychologicalSkill> = {
        [SchemaEID.Fracasso]: PsychologicalSkill.RealismoOtimista,
        [SchemaEID.Abandono]: PsychologicalSkill.AutorregulacaoEmocional,
        [SchemaEID.Desconfianca]: PsychologicalSkill.ImunidadeSocial,
        [SchemaEID.PrivacaoEmocional]: PsychologicalSkill.Autoconhecimento,
        [SchemaEID.Defectividade]: PsychologicalSkill.Autoestima,
        [SchemaEID.IsolamentoSocial]: PsychologicalSkill.Sociabilidade,
        [SchemaEID.Dependencia]: PsychologicalSkill.Autocontrole,
        [SchemaEID.Vulnerabilidade]: PsychologicalSkill.AutorregulacaoEmocional,
        [SchemaEID.Emaranhamento]: PsychologicalSkill.Autoconhecimento,
        [SchemaEID.Grandiosidade]: PsychologicalSkill.SensibilidadeSocial,
        [SchemaEID.AutocontroleInsuficiente]: PsychologicalSkill.Autocontrole,
        [SchemaEID.Subjugacao]: PsychologicalSkill.ResolutividadeEnfrentamento,
        [SchemaEID.AutoSacrificio]: PsychologicalSkill.SensibilidadeSocial,
        [SchemaEID.BuscaAprovacao]: PsychologicalSkill.Autoestima,
        [SchemaEID.Negatividade]: PsychologicalSkill.RealismoOtimista,
        [SchemaEID.InibicaoEmocional]: PsychologicalSkill.Sociabilidade,
        [SchemaEID.PadroesInflexiveis]: PsychologicalSkill.HedonismoResponsavel,
        [SchemaEID.Punitividade]: PsychologicalSkill.SensibilidadeSocial
      };

      if (!thpState.periodization) {
        thpState.periodization = [];
      }
      
      const currentSkills = new Set<PsychologicalSkill>(thpState.periodization.map(p => p.skill));
      thpState.activeSchemas.forEach(schema => {
        const skill = schemaToSkill[schema];
        if (skill && !currentSkills.has(skill)) {
          currentSkills.add(skill);
          const skillExercises = skillExercisesMap[skill] || [];
          thpState.periodization.push({
            id: `p-${Date.now()}-${thpState.periodization.length}`,
            skill,
            title: `Treino Clínico: ${skill}`,
            durationWeeks: 4,
            phase: "Ativo",
            completed: false,
            priority: "Alta",
            exercises: skillExercises.map((ex, idx) => ({
              id: `ex-${Date.now()}-${idx}`,
              title: ex.title,
              completed: false,
              rewardXp: ex.rewardXp
            }))
          });
        }
      });

      // 7. Add default placeholders only if everything remains completely empty (no PCI/YSQ/RID data or history available)
      const hasAnyProntuarioData = latestPci || activeYSQSchemas.length > 0 || ridEntries.length > 0 || lowerCompiledText.trim().length > 0;
      if (!hasAnyProntuarioData) {
        if (thpState.id === "pedro-30" || thpState.name?.toLowerCase().includes("pedro")) {
          if (thpState.neglectedNeeds.length === 0) {
            thpState.neglectedNeeds.push(EarlyNeed.Vinculo, EarlyNeed.Autonomia, EarlyNeed.Protecao, EarlyNeed.Admiracao, EarlyNeed.Compreensao);
          }
          if (thpState.activeSchemas.length === 0) {
            thpState.activeSchemas.push(SchemaEID.Fracasso, SchemaEID.Defectividade, SchemaEID.InibicaoEmocional);
          }
          if (thpState.beliefs.coreBeliefs.length === 0) {
            thpState.beliefs.coreBeliefs.push("Sou incompetente e inadequado", "Sei que serei ridicularizado", "Meus defeitos são visíveis a todos");
          }
          if (thpState.beliefs.intermediateBeliefs.length === 0) {
            thpState.beliefs.intermediateBeliefs.push("Se eu expressar minha opinião, as pessoas vão perceber que sou uma farsa", "Eu devo ser perfeito em minhas apresentações para evitar críticas");
          }
          if (thpState.beliefs.automaticThoughts.length === 0) {
            thpState.beliefs.automaticThoughts.push("Não vou conseguir falar", "Eles estão cochichando porque sabem que estou tremendo", "Vou gaguejar e estragar tudo");
          }
          if (thpState.copingBehaviors.length === 0) {
            thpState.copingBehaviors.push("Delegar apresentações para colegas juniores", "Terminar reuniões de forma abrupta", "Evitar contato visual");
          }
          if (thpState.periodization.length === 0) {
            thpState.periodization.push({
              id: `p-${Date.now()}-0`,
              skill: PsychologicalSkill.Autoconhecimento,
              title: "Treino Clínico: Autoconhecimento",
              durationWeeks: 4,
              phase: "Ativo",
              completed: false,
              priority: "Alta",
              exercises: [
                { id: `ex-${Date.now()}-0`, title: "Preencher Primeiro RID com o Terapeuta", completed: true, rewardXp: 100 },
                { id: `ex-${Date.now()}-1`, title: "Identificação Auditada de Padrões de Evitação", completed: false, rewardXp: 150 }
              ]
            });
          }
        }
      }


      // Update Dexie with the fully merged/auto-populated state
      await db.prontuarios.update(patientId, { thpState });
      setThpPatient(thpState);
    } catch (err) {
      console.error("Failed to load/sync patient THP state:", err);
    }
  };

  const handleUpdatePatient = async (updated: Patient) => {
    setThpPatient(updated);
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    
    // Save to Dexie prontuarios
    await db.prontuarios.update(updated.id, { thpState: updated });
    
    // Cloud sync
    if (userId) {
      const updatedRecord = await db.prontuarios.get(updated.id);
      if (updatedRecord) {
        await syncService.saveToCloud(userId, 'prontuarios', updatedRecord);
      }
    }
  };

  const handleUpdatePeriodization = async (periods: TrainingPeriod[]) => {
    if (!thpPatient) return;
    const updated = {
      ...thpPatient,
      periodization: periods
    };
    await handleUpdatePatient(updated);
    toast.success("Periodização de treino atualizada!");
  };

  const handleUpdateSessionHistory = async (log: SessionLog) => {
    if (!thpPatient) return;
    
    let newXp = thpPatient.xp + 100;
    let newLevel = thpPatient.level;
    const xpTarget = newLevel * 500;
    if (newXp >= xpTarget) {
      newXp -= xpTarget;
      newLevel += 1;
      toast.success(`Nível Clínico Elevado! ${thpPatient.name} atingiu Lvl ${newLevel}! 🎉`);
    }

    const updated = {
      ...thpPatient,
      sessionHistory: [log, ...(thpPatient.sessionHistory || [])],
      xp: newXp,
      level: newLevel
    };
    
    await handleUpdatePatient(updated);
    toast.success("Evolução clínica registrada no THP!");

    // Native Timeline entry log
    try {
      const record = await db.prontuarios.get(thpPatient.id);
      const textHtml = `
        <div class="thp-session-entry p-4 bg-white/[0.01] border border-white/[0.06] rounded-xl space-y-2">
          <div class="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2">
            <h5 class="text-xs font-black uppercase text-[#10b981]">Sessão de Treino THP</h5>
            <span class="text-[9px] font-mono opacity-50">${new Date(log.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <p class="text-xs font-semibold text-text-main">Evolução: ${log.evolutionSummary}</p>
          <div class="grid grid-cols-3 gap-2 text-[10px] text-text-dim mt-2 bg-white/[0.01] p-2 rounded-lg border border-white/[0.04]">
            <div><strong>Adesão:</strong> ${log.adherenceScore}%</div>
            <div><strong>Competência Verbal:</strong> ${log.verbalCompetenceScore}%</div>
            <div><strong>Competência Não-Verbal:</strong> ${log.nonVerbalCompetenceScore}%</div>
          </div>
          ${log.clinicalObservations ? `<p class="text-[10px] text-text-dim italic mt-1">Obs: ${log.clinicalObservations}</p>` : ''}
        </div>
      `;

      const newEntry = {
        timestamp: Date.now(),
        data: new Date(log.date).toLocaleDateString('pt-BR'),
        textoHtml: textHtml,
        tipo: 'evolucao' as any,
        metadata: {
          type: 'thp-session',
          thpSessionLog: log
        }
      };

      if (record) {
        const updatedEntradas = [newEntry, ...record.entradas];
        await db.prontuarios.update(thpPatient.id, { entradas: updatedEntradas });
      }
    } catch (e) {
      console.error("Failed to append timeline entry:", e);
    }
  };

  const handleAwardXp = async (amount: number) => {
    if (!thpPatient) return;
    let newXp = thpPatient.xp + amount;
    let newLevel = thpPatient.level;
    
    while (newXp >= newLevel * 500) {
      newXp -= newLevel * 500;
      newLevel += 1;
      toast.success(`Parabéns! Nível Clínico Subiu para Lvl ${newLevel}! 🚀`);
    }

    const unlockedBadges = [...(thpPatient.unlockedBadges || [])];
    const checkBadge = (badgeId: string, title: string, description: string) => {
      if (!unlockedBadges.some(b => b.id === badgeId)) {
        unlockedBadges.push({
          id: badgeId,
          title,
          description,
          unlockedAt: new Date().toISOString()
        });
        toast.success(`Nova Conquista Desbloqueada: ${title}! 🏆`);
      }
    };

    if (newLevel >= 3) checkBadge("lvl-3", "Explorador Ativo", "Atingiu o nível clínico 3 de competências.");
    if (newLevel >= 5) checkBadge("lvl-5", "Mestre de Si", "Atingiu o nível clínico 5 de autorregulação.");
    if (newLevel >= 8) checkBadge("lvl-8", "Resiliência Plena", "Atingiu o nível clínico 8 de imunidade social.");

    const updated = {
      ...thpPatient,
      xp: newXp,
      level: newLevel,
      unlockedBadges
    };
    await handleUpdatePatient(updated);
  };

  return (
    <div className="min-h-[calc(100vh-191px)] w-full flex bg-bg-deep text-text-main font-sans overflow-auto select-none relative">
      {thpPatient ? (
        <>
          {/* Left Sidebar */}
          <Sidebar
            currentTab={activeTab}
            setCurrentTab={setActiveTab}
            patientName={thpPatient.name}
            patientLevel={thpPatient.level}
            patientXp={thpPatient.xp}
            streakDays={thpPatient.streakDays}
          />

          {/* Right tab content area */}
          <div className="flex-1 flex flex-col overflow-auto bg-bg-card border-l border-border-subtle">
            <header className="h-14 bg-bg-card/90 backdrop-blur border-b border-border-subtle px-6 flex items-center justify-between shrink-0 z-50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-text-dim uppercase tracking-widest">
                  Módulo Ativo:
                </span>
                <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {activeTab === "profiler" && "Prontuário Clínico"}
                  {activeTab === "scales" && "Escalas & Evidências"}
                  {activeTab === "clinical-map" && "Mapeamento Clínico TCC-4"}
                  {activeTab === "pharmacology" && "Psicofarmacologia"}
                  {activeTab === "periodization" && "Periodização de Treino"}
                  {activeTab === "training" && "Laboratório de Treino (HP)"}
                  {activeTab === "report" && "Relatório de Evolução"}
                </span>
              </div>

              <button
                onClick={() => setIsTourOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-bg-sidebar border border-primary/20 hover:bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Guia de Operação
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 scroller-hide select-text">
              {activeTab === "profiler" && (
                <PatientSelector
                  patients={patients}
                  activePatientId={selectedPatientId}
                  onSelectPatient={setSelectedPatientId}
                  onAddPatient={async (newP) => {
                    await handleUpdatePatient(newP);
                  }}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={async (id) => {
                    const prontuario = await db.prontuarios.get(id);
                    if (prontuario) {
                      await db.prontuarios.update(id, { thpState: undefined });
                    }
                    if (selectedPatientId === id) {
                      setThpPatient(null);
                    }
                    toast.success("Perfil de prontuário THP redefinido.");
                  }}
                />
              )}
              {activeTab === "scales" && (
                <ScalesCabinet
                  patient={thpPatient}
                  onUpdatePatient={handleUpdatePatient}
                />
              )}
              {activeTab === "clinical-map" && (
                <ClinicalMap
                  patient={thpPatient}
                />
              )}
              {activeTab === "pharmacology" && (
                <PharmacologyConsultant
                  patient={thpPatient}
                  onUpdatePatient={handleUpdatePatient}
                />
              )}
              {activeTab === "periodization" && (
                <PeriodizationManager
                  patient={thpPatient}
                  onUpdatePeriodization={handleUpdatePeriodization}
                />
              )}
              {activeTab === "training" && (
                <TrainingModule
                  patient={thpPatient}
                  onAwardXp={handleAwardXp}
                  onAddLog={(summary, adherence, verbal, nonVerbal) => {
                    const newLog: SessionLog = {
                      id: `log-${Date.now()}`,
                      date: new Date().toISOString().split("T")[0],
                      evolutionSummary: summary,
                      adherenceScore: adherence,
                      verbalCompetenceScore: verbal,
                      nonVerbalCompetenceScore: nonVerbal,
                      clinicalObservations: `Evolução clínica registrada via simulador síncrono THP.`
                    };
                    handleUpdateSessionHistory(newLog);
                  }}
                />
              )}
              {activeTab === "report" && (
                <TherapistReport
                  patient={thpPatient}
                  onAddSessionLog={handleUpdateSessionHistory}
                />
              )}
            </main>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
          <Activity size={48} className="text-primary mb-4 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
            Selecione um paciente ativo no menu principal ou selecione acima para carregar o programa de treinamento e suas abas de evolução.
          </p>
        </div>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-border-subtle bg-bg-card text-text-main',
        }}
      />

      <UserGuideTour
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}
