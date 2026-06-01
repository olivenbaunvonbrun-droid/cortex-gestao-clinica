
export type ContractType = 'individual' | 'menor' | 'casal' | 'avaliacao';

export interface ContractTemplate {
  id: ContractType;
  title: string;
  legend: string;
  content: string;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'individual',
    title: 'Psicoterapia Individual (Adulto)',
    legend: 'Indicado para atendimentos clínicos padrão com pacientes maiores de 18 anos. Foca em sigilo, honorários e política de faltas.',
    content: `
      <h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PSICOTERAPIA</h2>
      <p>Pelo presente instrumento, de um lado <strong>{psicologo_nome}</strong>, inscrito(a) no CRP nº {psicologo_crp}, adiante denominado(a) PSICÓLOGO(A), e de outro lado <strong>{paciente_nome}</strong>, portador(a) do CPF nº {paciente_cpf}, residente em {paciente_endereco}, adiante denominado(a) PACIENTE, celebram o presente contrato sob as seguintes cláusulas:</p>
      
      <h3>1. DO OBJETO</h3>
      <p>O objeto deste contrato é a prestação de serviços de psicoterapia, com sessões de 50 minutos, em frequência a ser acordada entre as partes.</p>
      
      <h3>2. DO SIGILO</h3>
      <p>O(A) PSICÓLOGO(A) compromete-se a manter o sigilo profissional conforme o Código de Ética Profissional do Psicólogo, ressalvadas as situações de risco de vida para o paciente ou terceiros.</p>
      
      <h3>3. DOS HONORÁRIOS E FALTAS</h3>
      <p>O valor de cada sessão é de R$ _________, a ser pago [forma de pagamento]. Faltas não comunicadas com 24 horas de antecedência serão cobradas integralmente.</p>
      
      <h3>4. DO ENCERRAMENTO</h3>
      <p>O processo psicoterapêutico pode ser interrompido a qualquer momento por ambas as partes, recomendando-se uma sessão de fechamento.</p>
    `
  },
  {
    id: 'menor',
    title: 'Psicoterapia para Menores (Infantil/Adolescente)',
    legend: 'Obrigatório para pacientes menores de idade. Inclui cláusulas sobre a responsabilidade dos pais/tutores e o limite do sigilo com os responsáveis.',
    content: `
      <h2>CONTRATO DE PSICOTERAPIA COM RESPONSÁVEL LEGAL</h2>
      <p>Pelo presente instrumento, de um lado <strong>{psicologo_nome}</strong>, CRP nº {psicologo_crp}, e de outro lado, o(a) Sr(a). <strong>{responsavel_nome}</strong>, CPF nº {responsavel_cpf}, na qualidade de responsável legal pelo(a) menor <strong>{paciente_nome}</strong>, celebram este acordo:</p>
      
      <h3>1. DO ATENDIMENTO AO MENOR</h3>
      <p>O atendimento ao menor requer autorização expressa dos responsáveis. O processo terapêutico buscará o bem-estar do menor, mantendo o sigilo sobre o conteúdo das sessões, exceto em situações que envolvam riscos ou necessidade de intervenção dos responsáveis.</p>
      
      <h3>2. PARTICIPAÇÃO DOS RESPONSÁVEIS</h3>
      <p>Os responsáveis comprometem-se a participar de entrevistas devolutivas e orientações conforme solicitado pelo terapeuta.</p>
      
      <h3>3. CONDIÇÕES FINANCEIRAS</h3>
      <p>O valor da sessão é de R$ _________, sob responsabilidade do contratante acima identificado.</p>
    `
  },
  {
    id: 'casal',
    title: 'Psicoterapia de Casal/Família',
    legend: 'Específico para quando o "cliente" é o vínculo. Define regras sobre segredos individuais e a presença de todos os membros nas sessões.',
    content: `
      <h2>CONTRATO DE PSICOTERAPIA DE CASAL / FAMÍLIA</h2>
      <p>Este contrato define as regras para o atendimento conjunto de <strong>{paciente_nome}</strong> e demais membros participantes.</p>
      
      <h3>1. DO "PACIENTE"</h3>
      <p>Na terapia de casal/família, o foco da intervenção é o sistema/vínculo. Portanto, informações dadas individualmente a um dos membros não serão tratadas como segredo em relação ao outro membro, se forem pertinentes ao processo clínico.</p>
      
      <h3>2. PRESENÇA</h3>
      <p>As sessões ocorrerão preferencialmente com a presença de todos os envolvidos, salvo indicação clínica contrária.</p>
    `
  },
  {
    id: 'avaliacao',
    title: 'Avaliação Psicológica / Psicodiagnóstico',
    legend: 'Focado em processos com início, meio e fim determinados. Detalha a entrega de laudos e a natureza dos testes aplicados.',
    content: `
      <h2>CONTRATO PARA AVALIAÇÃO PSICOLÓGICA</h2>
      <p>O presente acordo visa a realização de processo de avaliação para o(a) paciente <strong>{paciente_nome}</strong>.</p>
      
      <h3>1. DA NATUREZA DO PROCESSO</h3>
      <p>Trata-se de um processo técnico, com duração estimada de ____ sessões, utilizando testes, entrevistas e observações.</p>
      
      <h3>2. DOS DOCUMENTOS DECORRENTES</h3>
      <p>Ao final do processo, será realizada uma sessão de devolutiva e entregue o documento correspondente (Laudo ou Relatório), conforme as normas do CFP.</p>
    `
  }
];
