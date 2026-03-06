import { getBranchingStoryById } from '@/lib/games/branching/registry';
import { Game } from '@/lib/games/catalog';
import { getQuizById } from '@/lib/games/quiz/registry';
import { RuntimeResolution } from './types';

export function resolveGameEngine(game: Game): RuntimeResolution {
  if (game.kind === 'quiz') {
    const quiz = getQuizById(game.engineId);

    if (quiz) {
      return {
        status: 'resolved',
        engineType: 'quiz',
        game,
        quiz,
      };
    }

    return {
      status: 'fallback',
      engineType: 'shell',
      game,
      reason: 'Quiz não encontrado para este engineId.',
    };
  }

  if (game.kind === 'branching_story') {
    const story = getBranchingStoryById(game.engineId);

    if (story) {
      return {
        status: 'resolved',
        engineType: 'branching_story',
        game,
        story,
      };
    }

    return {
      status: 'fallback',
      engineType: 'shell',
      game,
      reason: 'Branching story ainda não possui engine real vinculada.',
    };
  }

  return {
    status: 'fallback',
    engineType: 'shell',
    game,
    reason: 'Engine ainda não implementada para este tipo de experiência.',
  };
}
