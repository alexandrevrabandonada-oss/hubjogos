import { votoConscienteQuiz } from './data/voto-consciente';
import { custodeViverQuiz } from './data/custo-de-viver';
import { quemPagaAContaQuiz } from './data/quem-paga-a-conta';
import { cidadeEmComumQuiz } from './data/cidade-em-comum';
import { QuizDefinition } from './types';

const quizRegistry: Record<string, QuizDefinition> = {
  'voto-consciente': votoConscienteQuiz,
  'custo-de-viver': custodeViverQuiz,
  'quem-paga-a-conta': quemPagaAContaQuiz,
  'cidade-em-comum': cidadeEmComumQuiz,
};

export function getQuizById(id?: string): QuizDefinition | null {
  if (!id) {
    return null;
  }
  return quizRegistry[id] || null;
}
