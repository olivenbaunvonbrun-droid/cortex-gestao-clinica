import { Frequency } from '../types';

const FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fábio', 'Gisele', 'Hugo', 'Íris', 'João', 'Karen', 'Lucas', 'Marina', 'Nuno', 'Olívia', 'Paulo', 'Raquel', 'Samuel', 'Tânia', 'Vitor'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'];

export function generateFakePatient() {
  return {
    name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
    age: Math.floor(Math.random() * (60 - 18 + 1)) + 18,
  };
}

export function generateFakeAnswers(): Record<number, Frequency> {
  const answers: Record<number, Frequency> = {};
  const frequencies = Object.values(Frequency);
  
  for (let i = 1; i <= 42; i++) {
    answers[i] = frequencies[Math.floor(Math.random() * frequencies.length)];
  }
  
  return answers;
}
