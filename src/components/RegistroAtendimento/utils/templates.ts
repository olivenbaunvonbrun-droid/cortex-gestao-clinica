import { AttendanceTemplateType } from '../types';

export interface TemplateField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

export interface AttendanceTemplate {
  id: AttendanceTemplateType;
  name: string;
  description: string;
  fields: TemplateField[];
}

export const ATTENDANCE_TEMPLATES: AttendanceTemplate[] = [
  {
    id: 'soap',
    name: 'Modelo SOAP',
    description: 'Padrão clínico internacional estruturado em Subjetivo, Objetivo, Avaliação e Plano.',
    fields: [
      {
        id: 'subjective',
        label: 'Subjetivo (Relato do Paciente)',
        placeholder: 'Sintomas relatados, queixas principais, sentimentos expressos e percepção do paciente sobre seu estado.',
        type: 'textarea'
      },
      {
        id: 'objective',
        label: 'Objetivo (Observações do Profissional)',
        placeholder: 'Aparência, postura, afeto, linguagem não-verbal, sinais clínicos observados e comportamento geral.',
        type: 'textarea'
      },
      {
        id: 'assessment',
        label: 'Avaliação (Interpretação e Hipóteses)',
        placeholder: 'Análise clínica do terapeuta, hipóteses diagnósticas, evolução do quadro e conexões teóricas.',
        type: 'textarea'
      },
      {
        id: 'plan',
        label: 'Plano (Conduta e Encaminhamentos)',
        placeholder: 'Planejamento terapêutico, tarefas acordadas para casa, data da próxima consulta e encaminhamentos.',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'evolution',
    name: 'Evolução Clínico-Terapêutica',
    description: 'Estrutura ágil com foco nos temas discutidos, técnicas aplicadas e tarefas acordadas.',
    fields: [
      {
        id: 'humor',
        label: 'Estado de Humor Predominante',
        placeholder: 'Selecione o estado de humor observado...',
        type: 'select',
        options: ['Ansioso', 'Triste', 'Depressivo', 'Neutro/Estável', 'Alegre/Eufórico', 'Irritado/Hostil', 'Resistente']
      },
      {
        id: 'summary',
        label: 'Resumo da Sessão',
        placeholder: 'Temas centrais abordados e relato geral do andamento da sessão de hoje.',
        type: 'textarea'
      },
      {
        id: 'interventions',
        label: 'Intervenções do Terapeuta',
        placeholder: 'Técnicas utilizadas (TCC, psicanálise, etc.), manejos clínicos realizados e respostas do paciente.',
        type: 'textarea'
      },
      {
        id: 'homework',
        label: 'Tarefas de Casa / Resolução',
        placeholder: 'Tarefas de casa pactuadas, combinados ou resoluções práticas para o período inter-sessão.',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'screening',
    name: 'Anamnese Rápida / Triagem',
    description: 'Ideal para o primeiro contato, focando na queixa, histórico inicial e metas do tratamento.',
    fields: [
      {
        id: 'complaint',
        label: 'Queixa Principal',
        placeholder: 'O motivo principal que levou o paciente a buscar ajuda neste momento.',
        type: 'textarea'
      },
      {
        id: 'history',
        label: 'Histórico de Sintomas e Antecedentes',
        placeholder: 'Duração dos sintomas, frequência, tratamentos anteriores e histórico familiar/médico relevante.',
        type: 'textarea'
      },
      {
        id: 'goals',
        label: 'Objetivos Terapêuticos Iniciais',
        placeholder: 'O que o paciente espera alcançar com o processo psicoterapêutico.',
        type: 'textarea'
      },
      {
        id: 'recommendations',
        label: 'Recomendações e Encaminhamentos',
        placeholder: 'Orientações imediatas passadas ao paciente ou familiares, além de encaminhamentos para especialidades.',
        type: 'textarea'
      }
    ]
  }
];
