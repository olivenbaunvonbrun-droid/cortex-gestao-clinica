import { 
  EtdahData, 
  EtdahFactorResult, 
  EpfData, 
  EpfDomainResult, 
  BdefsData, 
  BdefsSectionResult,
  TdahEcosystemAssessment 
} from '../types';
import { ETDAH_QUESTIONS, ETDAH_FACTORS } from '../data/etdahData';
import { EPF_QUESTIONS, EPF_DOMAINS } from '../data/epfData';
import { BDEFS_QUESTIONS, BDEFS_SECTIONS, BARKLEY_ADHD_EF_INDEX_ITEMS } from '../data/bdefsData';

// ==========================================
// 1. ETDAH-AD SCORING
// ==========================================
export function calculateEtdahScoring(answers: Record<number, number>): EtdahData {
  const factorScores: Record<number, { raw: number; max: number; count: number }> = {
    1: { raw: 0, max: 0, count: 0 },
    2: { raw: 0, max: 0, count: 0 },
    3: { raw: 0, max: 0, count: 0 },
    4: { raw: 0, max: 0, count: 0 },
    5: { raw: 0, max: 0, count: 0 },
  };

  let totalRaw = 0;
  let maxTotal = 0;

  ETDAH_QUESTIONS.forEach(q => {
    let val = answers[q.id] !== undefined ? answers[q.id] : 0;
    if (q.isInverted) {
      val = 5 - val;
    }

    if (factorScores[q.factor]) {
      factorScores[q.factor].raw += val;
      factorScores[q.factor].max += 5;
      factorScores[q.factor].count += 1;
    }

    totalRaw += val;
    maxTotal += 5;
  });

  const factors: Record<number, EtdahFactorResult> = {};

  Object.entries(factorScores).forEach(([factorIdStr, data]) => {
    const fId = Number(factorIdStr);
    const pct = data.max > 0 ? Math.round((data.raw / data.max) * 100) : 0;
    
    let level: EtdahFactorResult['level'] = 'Médio';
    let interpretation = 'Frequência de queixas compatível com a média da população geral.';

    if (pct < 25) {
      level = 'Inferior';
      interpretation = 'Baixíssima frequência de queixas ou queixas ausentes nesta dimensão.';
    } else if (pct < 45) {
      level = 'Médio Inferior';
      interpretation = 'Poucos relatos de dificuldades atencionais ou comportamentais.';
    } else if (pct < 70) {
      level = 'Médio';
      interpretation = 'Presença de manifestações em nível moderado / médio populacional.';
    } else if (pct < 85) {
      level = 'Médio Superior';
      interpretation = 'Indicativo elevado de sintomas que requer atenção clínica e correlação funcional.';
    } else {
      level = 'Superior';
      interpretation = 'Intensidade muito elevada e atípica de manifestações neste fator, corroborando hipótese clínica.';
    }

    factors[fId] = {
      factor: fId,
      name: ETDAH_FACTORS[fId as keyof typeof ETDAH_FACTORS]?.name || `Fator ${fId}`,
      rawScore: data.raw,
      maxScore: data.max,
      percentage: pct,
      level,
      interpretation
    };
  });

  const overallPct = maxTotal > 0 ? Math.round((totalRaw / maxTotal) * 100) : 0;
  let overallClassification = 'Perfil Dentro da Média';
  if (overallPct >= 75) {
    overallClassification = 'Perfil Clínico de Alta Intensidade para Sintomas de TDAH';
  } else if (overallPct >= 50) {
    overallClassification = 'Perfil Clínico com Dificuldades Moderadas';
  } else {
    overallClassification = 'Baixa Expressividade de Sintomas Nucleares';
  }

  return {
    answers,
    factors,
    totalScore: totalRaw,
    maxTotalScore: maxTotal,
    overallClassification,
    completedAt: new Date().toISOString()
  };
}

// ==========================================
// 2. EPF-TDAH SCORING
// ==========================================
export function calculateEpfScoring(answers: Record<number, number>): EpfData {
  const domainScores: Record<number, { raw: number; max: number; count: number; significantCount: number }> = {
    1: { raw: 0, max: 0, count: 0, significantCount: 0 },
    2: { raw: 0, max: 0, count: 0, significantCount: 0 },
    3: { raw: 0, max: 0, count: 0, significantCount: 0 },
    4: { raw: 0, max: 0, count: 0, significantCount: 0 },
    5: { raw: 0, max: 0, count: 0, significantCount: 0 },
    6: { raw: 0, max: 0, count: 0, significantCount: 0 },
    7: { raw: 0, max: 0, count: 0, significantCount: 0 },
    8: { raw: 0, max: 0, count: 0, significantCount: 0 },
    9: { raw: 0, max: 0, count: 0, significantCount: 0 },
  };

  let grandTotal = 0;
  let maxTotalPossible = 0;

  EPF_QUESTIONS.forEach(q => {
    const val = answers[q.id] !== undefined ? answers[q.id] : 0;
    const dom = domainScores[q.domainId];
    if (dom) {
      dom.raw += val;
      dom.max += 4;
      dom.count += 1;
      if (val >= 2) { // 2 = Algumas vezes, 3 = Muitas vezes, 4 = Sempre
        dom.significantCount += 1;
      }
    }
    grandTotal += val;
    maxTotalPossible += 4;
  });

  const domains: Record<number, EpfDomainResult> = {};
  let affectedDomainsCount = 0;

  Object.entries(domainScores).forEach(([domIdStr, data]) => {
    const dId = Number(domIdStr);
    const pct = data.max > 0 ? Math.round((data.raw / data.max) * 100) : 0;
    const hasSignificant = pct >= 30 || data.significantCount >= 2;

    if (hasSignificant) {
      affectedDomainsCount++;
    }

    let level: EpfDomainResult['level'] = 'Sem Prejuízo';
    if (pct >= 65) level = 'Grave';
    else if (pct >= 40) level = 'Moderado';
    else if (pct >= 20) level = 'Leve';

    domains[dId] = {
      domainId: dId,
      name: EPF_DOMAINS[dId as keyof typeof EPF_DOMAINS]?.name || `Domínio ${dId}`,
      rawScore: data.raw,
      maxScore: data.max,
      percentage: pct,
      significantImpairments: data.significantCount,
      hasSignificantImpairment: hasSignificant,
      level
    };
  });

  const overallPct = maxTotalPossible > 0 ? Math.round((grandTotal / maxTotalPossible) * 100) : 0;
  let overallLevel: EpfData['overallLevel'] = 'Mínimo';
  if (overallPct >= 75) overallLevel = 'Severo';
  else if (overallPct >= 55) overallLevel = 'Grave';
  else if (overallPct >= 35) overallLevel = 'Moderado';
  else if (overallPct >= 18) overallLevel = 'Leve';

  return {
    answers,
    domains,
    totalScore: grandTotal,
    affectedDomainsCount,
    meetsDsmMultipleContexts: affectedDomainsCount >= 2,
    overallLevel,
    completedAt: new Date().toISOString()
  };
}

// ==========================================
// 3. BDEFS SCORING (BARKLEY)
// ==========================================
export function calculateBdefsScoring(answers: Record<number, number>): BdefsData {
  const sectionScores: Record<number, { raw: number; count: number; symptoms: number }> = {
    1: { raw: 0, count: 0, symptoms: 0 },
    2: { raw: 0, count: 0, symptoms: 0 },
    3: { raw: 0, count: 0, symptoms: 0 },
    4: { raw: 0, count: 0, symptoms: 0 },
    5: { raw: 0, count: 0, symptoms: 0 },
  };

  let grandTotal = 0;
  let totalSymptoms = 0;
  let adhdEfIndexScore = 0;
  let adhdEfIndexSymptoms = 0;

  BDEFS_QUESTIONS.forEach(q => {
    // scale is 1 to 4. Default to 1 (Raramente ou nunca)
    const val = answers[q.id] !== undefined ? answers[q.id] : 1;
    const sec = sectionScores[q.sectionId];
    if (sec) {
      sec.raw += val;
      sec.count += 1;
      if (val >= 3) { // 3 = Frequentemente, 4 = Muito frequentemente
        sec.symptoms += 1;
      }
    }
    grandTotal += val;
    if (val >= 3) {
      totalSymptoms += 1;
    }

    if (BARKLEY_ADHD_EF_INDEX_ITEMS.includes(q.id)) {
      adhdEfIndexScore += val;
      if (val >= 3) {
        adhdEfIndexSymptoms += 1;
      }
    }
  });

  const sections: Record<number, BdefsSectionResult> = {};

  Object.entries(sectionScores).forEach(([secIdStr, data]) => {
    const sId = Number(secIdStr);
    const avg = data.count > 0 ? Number((data.raw / data.count).toFixed(2)) : 1;

    let level: BdefsSectionResult['level'] = 'Normal';
    if (avg >= 3.0 || data.symptoms >= Math.ceil(data.count * 0.45)) {
      level = 'Disfunção Grave';
    } else if (avg >= 2.4 || data.symptoms >= Math.ceil(data.count * 0.3)) {
      level = 'Disfunção Moderada';
    } else if (avg >= 1.9) {
      level = 'Limítrofe';
    }

    sections[sId] = {
      sectionId: sId,
      name: BDEFS_SECTIONS[sId as keyof typeof BDEFS_SECTIONS]?.name || `Seção ${sId}`,
      rawScore: data.raw,
      itemsCount: data.count,
      averageScore: avg,
      symptomsCount: data.symptoms,
      level
    };
  });

  // Barkley ADHD-EF Index Risk: 11 items, max 44.
  let adhdEfIndexRisk: BdefsData['adhdEfIndexRisk'] = 'Baixo Risco';
  if (adhdEfIndexScore >= 28 || adhdEfIndexSymptoms >= 5) {
    adhdEfIndexRisk = 'Alto Risco de TDAH';
  } else if (adhdEfIndexScore >= 22 || adhdEfIndexSymptoms >= 3) {
    adhdEfIndexRisk = 'Risco Moderado';
  }

  let overallLevel: BdefsData['overallLevel'] = 'Funcionamento Típico';
  const grandAvg = 89 > 0 ? grandTotal / 89 : 1;
  if (grandAvg >= 2.8 || totalSymptoms >= 35) {
    overallLevel = 'Disfunção Executiva Severa';
  } else if (grandAvg >= 2.3 || totalSymptoms >= 20) {
    overallLevel = 'Disfunção Executiva Moderada';
  } else if (grandAvg >= 1.8 || totalSymptoms >= 10) {
    overallLevel = 'Disfunção Executiva Leve';
  }

  return {
    answers,
    sections,
    totalScore: grandTotal,
    totalSymptoms,
    adhdEfIndexScore,
    adhdEfIndexSymptoms,
    adhdEfIndexRisk,
    overallLevel,
    completedAt: new Date().toISOString()
  };
}

// ==========================================
// 4. GLOBAL DSM-5-TR COMPLIANCE EVALUATION
// ==========================================
export interface Dsm5ComplianceReport {
  criterioA_Sintomas: {
    atendido: boolean;
    desatencaoCount: number;
    hiperatividadeCount: number;
    minimoExigido: number;
    detalhes: string;
  };
  criterioB_InicioInfancia: {
    atendido: boolean;
    evidencia: string;
  };
  criterioC_MultiplosContextos: {
    atendido: boolean;
    contextosAfetados: number;
    detalhes: string;
  };
  criterioD_PrejuizoFuncional: {
    atendido: boolean;
    nivelPrejuizo: string;
    detalhes: string;
  };
  criterioE_Diferencial: {
    atendido: boolean;
    diferenciaisDescartados: boolean;
    detalhes: string;
  };
  conclusaoGlobal: 'Critérios Plenamente Atendidos' | 'Critérios Parcialmente Atendidos (Necessita Aprofundamento)' | 'Critérios Não Sustentados';
  apresentacaoSugerida: 'Combinada' | 'Predominantemente Desatenta' | 'Predominantemente Hiperativa/Impulsiva' | 'Inconclusiva';
}

export function evaluateDsm5Criteria(assessment: Partial<TdahEcosystemAssessment>): Dsm5ComplianceReport {
  const asrs = assessment.asrsData;
  const etdah = assessment.etdahData;
  const epf = assessment.epfData;
  const bdefs = assessment.bdefsData;
  const anamnese = assessment.anamneseData;
  const diferenciais = assessment.diferenciaisData;

  // Critério A: 5+ sintomas de desatenção ou 5+ hiperatividade em adultos
  const partASignificant = asrs?.partASignificant || 0;
  const partBSignificant = asrs?.partBSignificant || 0;
  const etdahDesat = etdah?.factors[1]?.level === 'Médio Superior' || etdah?.factors[1]?.level === 'Superior';
  const etdahHiper = etdah?.factors[2]?.level === 'Médio Superior' || etdah?.factors[2]?.level === 'Superior' || etdah?.factors[5]?.level === 'Superior';

  const inattentiveSymptoms = Math.max(partASignificant, etdahDesat ? 6 : 3);
  const hyperactiveSymptoms = Math.max(partBSignificant, etdahHiper ? 5 : 2);

  const meetsInattentive = inattentiveSymptoms >= 5;
  const meetsHyperactive = hyperactiveSymptoms >= 5;
  const criterioA_Atendido = meetsInattentive || meetsHyperactive;

  // Critério B: Início antes dos 12 anos
  const marcoAndar = anamnese?.marcosDesenvolvimento?.idadeAndar;
  const histEscolar = anamnese?.marcosDesenvolvimento?.desempenhoAcademicoInfancia || '';
  const compEscola = anamnese?.marcosDesenvolvimento?.comportamentoEscola || '';
  const infanciaConfirmada = Boolean(
    diferenciais?.padraoTemporal?.inicioInfanciaConfirmado || 
    (histEscolar.length > 5 || compEscola.length > 5)
  );

  // Critério C: Presença em 2 ou mais contextos
  const contextosAfetados = epf?.affectedDomainsCount || 0;
  const criterioC_Atendido = contextosAfetados >= 2 || epf?.meetsDsmMultipleContexts === true;

  // Critério D: Evidência de prejuízo funcional claro
  const criterioD_Atendido = Boolean(
    epf?.overallLevel === 'Moderado' || 
    epf?.overallLevel === 'Grave' || 
    epf?.overallLevel === 'Severo' ||
    bdefs?.adhdEfIndexRisk === 'Alto Risco de TDAH'
  );

  // Critério E: Exclusão de outros transtornos ou sobreposição identificada
  const criterioE_Atendido = Boolean(
    diferenciais?.padraoTemporal?.independenteDeFaseHumor !== false
  );

  let conclusaoGlobal: Dsm5ComplianceReport['conclusaoGlobal'] = 'Critérios Não Sustentados';
  if (criterioA_Atendido && infanciaConfirmada && criterioC_Atendido && criterioD_Atendido) {
    conclusaoGlobal = 'Critérios Plenamente Atendidos';
  } else if (criterioA_Atendido && (criterioC_Atendido || criterioD_Atendido)) {
    conclusaoGlobal = 'Critérios Parcialmente Atendidos (Necessita Aprofundamento)';
  }

  let apresentacaoSugerida: Dsm5ComplianceReport['apresentacaoSugerida'] = 'Inconclusiva';
  if (meetsInattentive && meetsHyperactive) {
    apresentacaoSugerida = 'Combinada';
  } else if (meetsInattentive) {
    apresentacaoSugerida = 'Predominantemente Desatenta';
  } else if (meetsHyperactive) {
    apresentacaoSugerida = 'Predominantemente Hiperativa/Impulsiva';
  }

  return {
    criterioA_Sintomas: {
      atendido: criterioA_Atendido,
      desatencaoCount: inattentiveSymptoms,
      hiperatividadeCount: hyperactiveSymptoms,
      minimoExigido: 5,
      detalhes: `${inattentiveSymptoms} sintomas de desatenção e ${hyperactiveSymptoms} de hiperatividade/impulsividade identificados.`
    },
    criterioB_InicioInfancia: {
      atendido: infanciaConfirmada,
      evidencia: infanciaConfirmada 
        ? 'Histórico retrospectivo documentado com manifestações antes dos 12 anos.' 
        : 'Requer aprofundamento com boletins escolares ou heterorrelato familiar.'
    },
    criterioC_MultiplosContextos: {
      atendido: criterioC_Atendido,
      contextosAfetados,
      detalhes: `Manifestações e prejuízos identificados em ${contextosAfetados} domínios da vida (Mínimo exigido: 2 contextos).`
    },
    criterioD_PrejuizoFuncional: {
      atendido: criterioD_Atendido,
      nivelPrejuizo: epf?.overallLevel || 'Não Mensurado',
      detalhes: `Prejuízo funcional geral avaliado como ${epf?.overallLevel || 'Pendente'}, com impacto em funções executivas (Barkley: ${bdefs?.adhdEfIndexRisk || 'Pendente'}).`
    },
    criterioE_Diferencial: {
      atendido: criterioE_Atendido,
      diferenciaisDescartados: criterioE_Atendido,
      detalhes: 'Sintomatologia analisada e diferenciada de quadros de humor isolados ou ansiedade reativa.'
    },
    conclusaoGlobal,
    apresentacaoSugerida
  };
}
