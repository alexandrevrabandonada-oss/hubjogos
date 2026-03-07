import { QuizAxis, QuizDefinition, QuizResult } from './types';

const axisPriority: QuizAxis[] = [
  'services',
  'labor',
  'mobility',
  'participation',
  'urban-memory',
  'cost-of-living',
  'governance',
  'collective-power',
];

function emptyScores(): Record<QuizAxis, number> {
  return {
    services: 0,
    labor: 0,
    mobility: 0,
    participation: 0,
    'urban-memory': 0,
    'cost-of-living': 0,
    governance: 0,
    'collective-power': 0,
  };
}

function pickProfileByScoreBand(quiz: QuizDefinition, dominantAxis: QuizAxis, score: number) {
  const axisProfiles = quiz.profiles.filter((item) => item.axis === dominantAxis);

  if (axisProfiles.length === 0) {
    return quiz.profiles[0];
  }

  if (axisProfiles.length === 1) {
    return axisProfiles[0];
  }

  const maxScore = quiz.questions.reduce((sum, question) => {
    const optionMax = Math.max(...question.options.map((option) => Number(option.impact[dominantAxis] || 0)));
    return sum + Math.max(optionMax, 0);
  }, 0);

  if (maxScore <= 0) {
    return axisProfiles[0];
  }

  const normalized = Math.max(0, Math.min(1, score / maxScore));
  const index = Math.min(axisProfiles.length - 1, Math.floor(normalized * axisProfiles.length));
  return axisProfiles[index];
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

  const profile = pickProfileByScoreBand(quiz, dominantAxis, scores[dominantAxis]);

  const answered = selectedOptionIds.filter(Boolean).length;
  const summary = `${profile.title}: ${profile.description} Próxima ação sugerida: ${profile.nextAction}`;

  return {
    profile,
    scores,
    answered,
    summary,
  };
}
