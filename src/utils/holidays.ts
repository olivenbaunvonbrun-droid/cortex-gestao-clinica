export interface Holiday {
  name: string;
  type: 'nacional' | 'estadual';
}

function getEasterDate(year: number): Date {
  const f = Math.floor;
  const a = year % 19;
  const b = f(year / 100);
  const c = year % 100;
  const d = f(b / 4);
  const e = b % 4;
  const g = f((8 * b + 13) / 25);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = f(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = f((a + 11 * h + 22 * l) / 451);
  const month = f((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  // Create Date object in local timezone
  return new Date(year, month - 1, day);
}

export function getHoliday(dateStr: string, uf: string): Holiday | null {
  if (!dateStr) return null;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  // Fixed National Holidays
  if (month === 1 && day === 1) return { name: 'Confraternização Universal (Ano Novo)', type: 'nacional' };
  if (month === 4 && day === 21) return { name: 'Tiradentes', type: 'nacional' };
  if (month === 5 && day === 1) return { name: 'Dia do Trabalhador', type: 'nacional' };
  if (month === 9 && day === 7) return { name: 'Independência do Brasil', type: 'nacional' };
  if (month === 10 && day === 12) return { name: 'Nossa Senhora Aparecida', type: 'nacional' };
  if (month === 11 && day === 2) return { name: 'Finados', type: 'nacional' };
  if (month === 11 && day === 15) return { name: 'Proclamação da República', type: 'nacional' };
  if (month === 11 && day === 20) return { name: 'Dia Nacional de Zumbi e da Consciência Negra', type: 'nacional' };
  if (month === 12 && day === 25) return { name: 'Natal', type: 'nacional' };

  // Mobile National Holidays (Easter based)
  const easter = getEasterDate(year);
  
  // Carnaval: Easter - 47 days
  const carnavalDate = new Date(easter);
  carnavalDate.setDate(easter.getDate() - 47);
  const cYear = carnavalDate.getFullYear();
  const cMonth = carnavalDate.getMonth() + 1;
  const cDay = carnavalDate.getDate();
  if (month === cMonth && day === cDay) return { name: 'Carnaval', type: 'nacional' };

  // Sexta-feira Santa: Easter - 2 days
  const goodFridayDate = new Date(easter);
  goodFridayDate.setDate(easter.getDate() - 2);
  const gfYear = goodFridayDate.getFullYear();
  const gfMonth = goodFridayDate.getMonth() + 1;
  const gfDay = goodFridayDate.getDate();
  if (month === gfMonth && day === gfDay) return { name: 'Sexta-feira Santa', type: 'nacional' };

  // Corpus Christi: Easter + 60 days
  const corpusChristiDate = new Date(easter);
  corpusChristiDate.setDate(easter.getDate() + 60);
  const ccYear = corpusChristiDate.getFullYear();
  const ccMonth = corpusChristiDate.getMonth() + 1;
  const ccDay = corpusChristiDate.getDate();
  if (month === ccMonth && day === ccDay) return { name: 'Corpus Christi', type: 'nacional' };

  // State-specific Holidays (Estaduais)
  const stateUf = (uf || '').toUpperCase();
  
  switch (stateUf) {
    case 'AC':
      if (month === 6 && day === 15) return { name: 'Aniversário do Estado do Acre', type: 'estadual' };
      if (month === 9 && day === 5) return { name: 'Dia da Amazônia (Acre)', type: 'estadual' };
      if (month === 11 && day === 17) return { name: 'Assinatura do Tratado de Petrópolis (Acre)', type: 'estadual' };
      break;
    case 'AL':
      if (month === 6 && day === 24) return { name: 'Dia de São João (Alagoas)', type: 'estadual' };
      if (month === 9 && day === 16) return { name: 'Emancipação Política de Alagoas', type: 'estadual' };
      if (month === 11 && day === 30) return { name: 'Dia Estadual do Evangélico (Alagoas)', type: 'estadual' };
      break;
    case 'AP':
      if (month === 2 && day === 5) return { name: 'Dia de São José (Amapá)', type: 'estadual' };
      if (month === 9 && day === 13) return { name: 'Criação do Território Federal (Amapá)', type: 'estadual' };
      break;
    case 'AM':
      if (month === 9 && day === 5) return { name: 'Elevação do Amazonas à Categoria de Província', type: 'estadual' };
      break;
    case 'BA':
      if (month === 7 && day === 2) return { name: 'Independência da Bahia (Dois de Julho)', type: 'estadual' };
      break;
    case 'CE':
      if (month === 3 && day === 25) return { name: 'Data Magna do Ceará (Abolição da Escravidão)', type: 'estadual' };
      break;
    case 'DF':
      if (month === 4 && day === 21) return { name: 'Fundação de Brasília (Distrito Federal)', type: 'estadual' };
      if (month === 11 && day === 30) return { name: 'Dia do Evangélico (Distrito Federal)', type: 'estadual' };
      break;
    case 'ES':
      if (month === 5 && day === 24) return { name: 'Colonização do Solo Espírito-santense', type: 'estadual' };
      break;
    case 'GO':
      if (month === 7 && day === 26) return { name: 'Fundação da Cidade de Goiás', type: 'estadual' };
      break;
    case 'MA':
      if (month === 7 && day === 28) return { name: 'Adesão do Maranhão à Independência do Brasil', type: 'estadual' };
      break;
    case 'MS':
      if (month === 10 && day === 11) return { name: 'Criação do Estado de Mato Grosso do Sul', type: 'estadual' };
      break;
    case 'MG':
      if (month === 4 && day === 21) return { name: 'Data Magna de Minas Gerais', type: 'estadual' };
      break;
    case 'PA':
      if (month === 8 && day === 15) return { name: 'Adesão do Pará à Independência do Brasil', type: 'estadual' };
      break;
    case 'PB':
      if (month === 8 && day === 5) return { name: 'Fundação da Paraíba', type: 'estadual' };
      break;
    case 'PR':
      if (month === 12 && day === 19) return { name: 'Emancipação Política do Paraná', type: 'estadual' };
      break;
    case 'PE':
      if (month === 3 && day === 6) return { name: 'Data Magna de Pernambuco (Revolução de 1817)', type: 'estadual' };
      break;
    case 'PI':
      if (month === 3 && day === 13) return { name: 'Dia da Batalha do Jenipapo (Piauí)', type: 'estadual' };
      if (month === 10 && day === 19) return { name: 'Dia do Piauí', type: 'estadual' };
      break;
    case 'RJ':
      if (month === 4 && day === 23) return { name: 'Dia de São Jorge (Rio de Janeiro)', type: 'estadual' };
      break;
    case 'RN':
      if (month === 10 && day === 3) return { name: 'Mártires de Cunhaú e Uruaçu (Rio Grande do Norte)', type: 'estadual' };
      break;
    case 'RS':
      if (month === 9 && day === 20) return { name: 'Revolução Farroupilha (Dia do Gaúcho)', type: 'estadual' };
      break;
    case 'RO':
      if (month === 1 && day === 4) return { name: 'Criação do Estado de Rondônia', type: 'estadual' };
      if (month === 6 && day === 18) return { name: 'Dia Estadual do Evangélico (Rondônia)', type: 'estadual' };
      break;
    case 'RR':
      if (month === 10 && day === 5) return { name: 'Criação do Estado de Roraima', type: 'estadual' };
      break;
    case 'SC':
      if (month === 8 && day === 11) return { name: 'Dia de Santa Catarina (Criação da Capitania)', type: 'estadual' };
      break;
    case 'SP':
      if (month === 7 && day === 9) return { name: 'Revolução Constitucionalista (São Paulo)', type: 'estadual' };
      break;
    case 'SE':
      if (month === 7 && day === 8) return { name: 'Autonomia Política de Sergipe', type: 'estadual' };
      break;
    case 'TO':
      if (month === 10 && day === 5) return { name: 'Criação do Estado de Tocantins', type: 'estadual' };
      break;
  }

  return null;
}
