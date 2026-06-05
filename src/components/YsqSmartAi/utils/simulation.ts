import { Frequency } from "../types";

export function generateFakeAnswers(): Record<number, Frequency> {
  const answers: Record<number, Frequency> = {};
  for (let i = 1; i <= 90; i++) {
    const values = [
      Frequency.F1,
      Frequency.F2,
      Frequency.F3,
      Frequency.F4,
      Frequency.F5,
      Frequency.F6
    ];
    answers[i] = values[Math.floor(Math.random() * values.length)];
  }
  return answers;
}
