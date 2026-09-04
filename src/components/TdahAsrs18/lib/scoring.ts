import { TdahScoringResult, TdahSubscaleResult, Frequency } from '../types';

export function calculateTdahAssessment(answers: Record<number, Frequency>): TdahScoringResult {
  // Parte A: Desatenção (Itens 1 a 9)
  let partAScore = 0;
  let partASignificantCount = 0;
  for (let i = 1; i <= 9; i++) {
    const val = answers[i] ?? 0;
    partAScore += val;
    if (val >= Frequency.OFTEN) {
      partASignificantCount++;
    }
  }

  // Parte B: Hiperatividade / Impulsividade (Itens 10 a 18)
  let partBScore = 0;
  let partBSignificantCount = 0;
  for (let i = 10; i <= 18; i++) {
    const val = answers[i] ?? 0;
    partBScore += val;
    if (val >= Frequency.OFTEN) {
      partBSignificantCount++;
    }
  }

  const thresholdMetA = partASignificantCount >= 4;
  const thresholdMetB = partBSignificantCount >= 4;

  const partAPercentage = Math.round((partAScore / 27) * 100);
  const partBPercentage = Math.round((partBScore / 27) * 100);

  const partAResult: TdahSubscaleResult = {
    name: 'Desatenção',
    part: 'A',
    rawScore: partAScore,
    maxScore: 27,
    significantSymptoms: partASignificantCount,
    thresholdMet: thresholdMetA,
    percentage: partAPercentage,
    classification: thresholdMetA 
      ? 'Consistente com Desatenção Clínica (≥ 4 sintomas)' 
      : (partASignificantCount >= 2 ? 'Sintomas Leves de Desatenção' : 'Desatenção Não Sugestiva')
  };

  const partBResult: TdahSubscaleResult = {
    name: 'Hiperatividade / Impulsividade',
    part: 'B',
    rawScore: partBScore,
    maxScore: 27,
    significantSymptoms: partBSignificantCount,
    thresholdMet: thresholdMetB,
    percentage: partBPercentage,
    classification: thresholdMetB 
      ? 'Consistente com Hiperatividade/Impulsividade (≥ 4 sintomas)' 
      : (partBSignificantCount >= 2 ? 'Sintomas Leves de Hiperatividade' : 'Hiperatividade Não Sugestiva')
  };

  const totalScore = partAScore + partBScore;
  const totalSignificant = partASignificantCount + partBSignificantCount;

  let classification = '';
  let riskLevel: 'Alta Probabilidade' | 'Moderada' | 'Baixa Probabilidade' = 'Baixa Probabilidade';
  let summaryText = '';

  if (thresholdMetA && thresholdMetB) {
    classification = 'TDAH - Tipo Combinado';
    riskLevel = 'Alta Probabilidade';
    summaryText = `Apresenta critérios clínicos significativos tanto para Desatenção (${partASignificantCount}/9 sintomas ativos) quanto para Hiperatividade/Impulsividade (${partBSignificantCount}/9 sintomas ativos), sugerindo alta probabilidade de TDAH de Apresentação Combinada.`;
  } else if (thresholdMetA && !thresholdMetB) {
    classification = 'TDAH - Tipo Predominantemente Desatento';
    riskLevel = 'Alta Probabilidade';
    summaryText = `Apresenta critérios clínicos positivos para Desatenção (${partASignificantCount}/9 sintomas ativos), com sintomas de hiperatividade abaixo do ponto de corte (${partBSignificantCount}/9 sintomas), sugerindo alta probabilidade de TDAH de Apresentação Desatenta.`;
  } else if (!thresholdMetA && thresholdMetB) {
    classification = 'TDAH - Tipo Predominantemente Hiperativo/Impulsivo';
    riskLevel = 'Alta Probabilidade';
    summaryText = `Apresenta critérios clínicos positivos para Hiperatividade/Impulsividade (${partBSignificantCount}/9 sintomas ativos), com desatenção abaixo do ponto de corte (${partASignificantCount}/9 sintomas), sugerindo alta probabilidade de TDAH de Apresentação Hiperativa/Impulsiva.`;
  } else if (partASignificantCount >= 2 || partBSignificantCount >= 2 || totalScore >= 18) {
    classification = 'Sintomas Subclínicos / Risco Leve a Moderado';
    riskLevel = 'Moderada';
    summaryText = `Apresenta sintomas dispersos de desatenção ou agitação motora (${totalSignificant} sintomas frequentes), porém sem atingir o limiar formal de 4 sintomas em nenhuma das partes. Recomenda-se investigação clínica longitudinal.`;
  } else {
    classification = 'Não Sugestivo de TDAH';
    riskLevel = 'Baixa Probabilidade';
    summaryText = `A pontuação total (${totalScore}/54) e o número de sintomas marcados como frequentes (${totalSignificant}/18) encontram-se dentro dos parâmetros normativos para adultos, indicando baixa probabilidade de TDAH.`;
  }

  return {
    partA: partAResult,
    partB: partBResult,
    totalScore,
    maxTotalScore: 54,
    totalSignificantSymptoms: totalSignificant,
    classification,
    riskLevel,
    summaryText
  };
}
