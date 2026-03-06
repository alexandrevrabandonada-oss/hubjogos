import { Game } from '@/lib/games/catalog';
import { QuizDefinition } from '@/lib/games/quiz/types';
import { BranchingStoryDefinition } from '@/lib/games/branching/types';
import { SimulationDefinition } from '@/lib/games/simulation/types';
import { MapDefinition } from '@/lib/games/map/types';

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
      status: 'resolved';
      engineType: 'simulation';
      game: Game;
      simulation: SimulationDefinition;
    }
  | {
      status: 'resolved';
      engineType: 'map';
      game: Game;
      map: MapDefinition;
    }
  | {
      status: 'fallback';
      engineType: 'shell';
      game: Game;
      reason: string;
    }
