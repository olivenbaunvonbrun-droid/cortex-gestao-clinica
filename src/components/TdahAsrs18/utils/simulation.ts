import { Frequency, ASRS_QUESTIONS } from '../types';

export function generateFakeAnswers(): Record<number, Frequency> {
  const simulated: Record<number, Frequency> = {};
  
  ASRS_QUESTIONS.forEach(q => {
    const rand = Math.random();
    // Simulate typical ADHD clinical profile with frequent scores of 2 or 3
    if (rand < 0.2) {
      simulated[q.id] = Frequency.NONE; // 0
    } else if (rand < 0.45) {
      simulated[q.id] = Frequency.SLIGHTLY; // 1
    } else if (rand < 0.8) {
      simulated[q.id] = Frequency.OFTEN; // 2
    } else {
      simulated[q.id] = Frequency.VERY_OFTEN; // 3
    }
  });

  return simulated;
}
