import { votoConscienteQuiz } from './data/voto-consciente';
import { QuizDefinition } from './types';

const quizRegistry: Record<string, QuizDefinition> = {
  'voto-consciente': votoConscienteQuiz,
};

export function getQuizById(id?: string): QuizDefinition | null {
  if (!id) {
    return null;
  }
  return quizRegistry[id] || null;
}
