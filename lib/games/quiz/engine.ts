import { QuizAxis, QuizDefinition, QuizResult } from './types';

const axisPriority: QuizAxis[] = [
  'services',
  'labor',
  'mobility',
  'participation',
  'urban-memory',
];

function emptyScores(): Record<QuizAxis, number> {
  return {
    services: 0,
    labor: 0,
    mobility: 0,
    participation: 0,
    'urban-memory': 0,
  };
}

export function calculateQuizResult(
  quiz: QuizDefinition,
  selectedOptionIds: string[]
): QuizResult {
  const scores = emptyScores();

  quiz.questions.forEach((question, index) => {
    const selectedId = selectedOptionIds[index];
    if (!selectedId) {
      return;
    }

    const option = question.options.find((item) => item.id === selectedId);
    if (!option) {
      return;
    }

    Object.entries(option.impact).forEach(([axis, value]) => {
      scores[axis as QuizAxis] += value || 0;
    });
  });

  const dominantAxis = axisPriority.reduce((bestAxis, currentAxis) => {
    if (scores[currentAxis] > scores[bestAxis]) {
      return currentAxis;
    }
    return bestAxis;
  }, axisPriority[0]);

  const fallback = quiz.profiles[0];
  const profile =
    quiz.profiles.find((item) => item.axis === dominantAxis) || fallback;

  const answered = selectedOptionIds.filter(Boolean).length;
  const summary = `${profile.title}: ${profile.description} Próxima ação sugerida: ${profile.nextAction}`;

  return {
    profile,
    scores,
    answered,
    summary,
  };
}
