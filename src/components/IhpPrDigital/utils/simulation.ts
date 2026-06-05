import { Frequency } from '../types';

export function generateFakeAnswers(): Record<number, Frequency> {
  const answers: Record<number, Frequency> = {};
  
  // Generate fake responses for all 172 questions
  for (let id = 1; id <= 172; id++) {
    const values = [
      Frequency.F1,
      Frequency.F2,
      Frequency.F3,
      Frequency.F4,
      Frequency.F5
    ];
    answers[id] = values[Math.floor(Math.random() * values.length)];
  }

  return answers;
}
