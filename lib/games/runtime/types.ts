import { Game } from '@/lib/games/catalog';
import { QuizDefinition } from '@/lib/games/quiz/types';
import { BranchingStoryDefinition } from '@/lib/games/branching/types';

export type RuntimeResolution =
  | {
      status: 'resolved';
      engineType: 'quiz';
      game: Game;
      quiz: QuizDefinition;
    }
  | {
      status: 'resolved';
      engineType: 'branching_story';
      game: Game;
      story: BranchingStoryDefinition;
    }
  | {
      status: 'fallback';
      engineType: 'shell';
      game: Game;
      reason: string;
    };
