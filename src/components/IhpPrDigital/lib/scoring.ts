import { HP_DETAILS } from '../types';

export interface QuantitativeResult {
  name: string;
  score: number;
  classification: string;
  maxScore: number;
}

export const QIP_INFO = {
  name: "Quociente de Inteligência Psicológica (QIP)",
  ranges: [
    { max: 344, label: "Deficitário" },
    { max: 516, label: "Insuficiente" },
    { max: 688, label: "Satisfatório" },
    { max: 860, label: "Proficiente" },
  ],
};

export const SUBSCALES_RANGES: Record<string, { max: number; label: string }[]> = {
  ach: [
    { max: 38, label: "Deficitário" },
    { max: 57, label: "Insuficiente" },
    { max: 76, label: "Satisfatório" },
    { max: 95, label: "Proficiente" },
  ],
  aue: [
    { max: 40, label: "Deficitário" },
    { max: 60, label: "Insuficiente" },
    { max: 80, label: "Satisfatório" },
    { max: 100, label: "Proficiente" },
  ],
  rro: [
    { max: 54, label: "Deficitário" },
    { max: 81, label: "Insuficiente" },
    { max: 108, label: "Satisfatório" },
    { max: 135, label: "Proficiente" },
  ],
  are: [
    { max: 30, label: "Deficitário" },
    { max: 45, label: "Insuficiente" },
    { max: 60, label: "Satisfatório" },
    { max: 75, label: "Proficiente" },
  ],
  ref: [
    { max: 34, label: "Deficitário" },
    { max: 51, label: "Insuficiente" },
    { max: 68, label: "Satisfatório" },
    { max: 85, label: "Proficiente" },
  ],
  ims: [
    { max: 24, label: "Deficitário" },
    { max: 36, label: "Insuficiente" },
    { max: 48, label: "Satisfatório" },
    { max: 60, label: "Proficiente" },
  ],
  auc: [
    { max: 30, label: "Deficitário" },
    { max: 45, label: "Insuficiente" },
    { max: 60, label: "Satisfatório" },
    { max: 75, label: "Proficiente" },
  ],
  soc: [
    { max: 28, label: "Deficitário" },
    { max: 42, label: "Insuficiente" },
    { max: 56, label: "Satisfatório" },
    { max: 70, label: "Proficiente" },
  ],
  hed: [
    { max: 30, label: "Deficitário" },
    { max: 45, label: "Insuficiente" },
    { max: 60, label: "Satisfatório" },
    { max: 75, label: "Proficiente" },
  ],
  ses: [
    { max: 36, label: "Deficitário" },
    { max: 54, label: "Insuficiente" },
    { max: 72, label: "Satisfatório" },
    { max: 90, label: "Proficiente" },
  ],
};

const getClassification = (score: number, ranges: { max: number; label: string }[]): string => {
  for (const range of ranges) {
    if (score <= range.max) {
      return range.label;
    }
  }
  return 'N/A';
};

export const calculateAssessment = (answers: Record<number, number>) => {
  const subscaleResults: Record<string, QuantitativeResult> = {};
  let totalScore = 0;

  Object.entries(HP_DETAILS).forEach(([subId, info]) => {
    // Find all question IDs mapping to this subId
    // Item IDs for each subscale
    let items: number[] = [];
    if (subId === 'ach') items = Array.from({ length: 19 }, (_, i) => i + 1);
    else if (subId === 'aue') items = Array.from({ length: 20 }, (_, i) => i + 20);
    else if (subId === 'rro') items = Array.from({ length: 27 }, (_, i) => i + 40);
    else if (subId === 'are') items = Array.from({ length: 15 }, (_, i) => i + 67);
    else if (subId === 'ref') items = Array.from({ length: 17 }, (_, i) => i + 82);
    else if (subId === 'ims') items = Array.from({ length: 12 }, (_, i) => i + 99);
    else if (subId === 'auc') items = Array.from({ length: 15 }, (_, i) => i + 111);
    else if (subId === 'soc') items = Array.from({ length: 14 }, (_, i) => i + 126);
    else if (subId === 'hed') items = Array.from({ length: 15 }, (_, i) => i + 140);
    else if (subId === 'ses') items = Array.from({ length: 18 }, (_, i) => i + 155);

    const score = items.reduce((acc, itemId) => {
      return acc + (answers[itemId] || 0);
    }, 0);
    
    totalScore += score;
    
    subscaleResults[subId] = {
      name: info.name,
      score,
      classification: getClassification(score, SUBSCALES_RANGES[subId]),
      maxScore: items.length * 5,
    };
  });

  const qipResult: QuantitativeResult = {
    name: QIP_INFO.name,
    score: totalScore,
    classification: getClassification(totalScore, QIP_INFO.ranges),
    maxScore: 172 * 5,
  };

  return {
    subscales: subscaleResults,
    qip: qipResult,
  };
};
