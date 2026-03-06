'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { Game } from '@/lib/games/catalog';
import { resolveGameEngine } from '@/lib/games/runtime/resolve-engine';
import { trackGameStart, trackGameView } from '@/lib/analytics/track';
import { EngineRuntimeErrorBoundary } from './EngineRuntimeErrorBoundary';
import { EngineRuntimeLoading } from './EngineRuntimeLoading';
import styles from './GameRuntime.module.css';

const QuizEngine = dynamic(
  () => import('@/components/games/quiz/QuizEngine').then((mod) => mod.QuizEngine),
  {
    ssr: false,
    loading: () => <EngineRuntimeLoading />,
  }
);

const BranchingStoryEngine = dynamic(
  () =>
    import('@/components/games/branching/BranchingStoryEngine').then(
      (mod) => mod.BranchingStoryEngine
    ),
  {
    ssr: false,
    loading: () => <EngineRuntimeLoading />,
  }
);

const SimulationEngine = dynamic(
  () => import('@/components/games/simulation/SimulationEngine').then((mod) => mod.SimulationEngine),
  {
    ssr: false,
    loading: () => <EngineRuntimeLoading />,
  }
);

const MapEngine = dynamic(
  () => import('@/components/games/map/MapEngine').then((mod) => mod.MapEngine),
  {
    ssr: false,
    loading: () => <EngineRuntimeLoading />,
  }
);

interface GameRuntimeProps {
  game: Game;
}

export function GameRuntime({ game }: GameRuntimeProps) {
  const resolved = useMemo(() => resolveGameEngine(game), [game]);

  useEffect(() => {
    void trackGameView(game);
    void trackGameStart(game);
  }, [game]);

  if (resolved.status === 'resolved' && resolved.engineType === 'quiz') {
    return (
      <EngineRuntimeErrorBoundary>
        <div className={styles.runtimeWrap}>
          <QuizEngine quiz={resolved.quiz} game={game} />
        </div>
      </EngineRuntimeErrorBoundary>
    );
  }

  if (resolved.status === 'resolved' && resolved.engineType === 'branching_story') {
    return (
      <EngineRuntimeErrorBoundary>
        <div className={styles.runtimeWrap}>
          <BranchingStoryEngine story={resolved.story} game={game} />
        </div>
      </EngineRuntimeErrorBoundary>
    );
  }

  if (resolved.status === 'resolved' && resolved.engineType === 'simulation') {
    return (
      <EngineRuntimeErrorBoundary>
        <div className={styles.runtimeWrap}>
          <SimulationEngine definition={resolved.simulation} game={game} />
        </div>
      </EngineRuntimeErrorBoundary>
    );
  }

  if (resolved.status === 'resolved' && resolved.engineType === 'map') {
    return (
      <EngineRuntimeErrorBoundary>
        <div className={styles.runtimeWrap}>
          <MapEngine definition={resolved.map} game={game} />
        </div>
      </EngineRuntimeErrorBoundary>
    );
  }

  return (
    <div className={styles.placeholder}>
      <h3>Engine em desenvolvimento</h3>
      <p>
        Esta experiência já possui dramaturgia, mas a engine real ainda está em
        implementação.
      </p>
      <p className={styles.placeholderReason}>Motivo atual: {resolved.reason}</p>
      <Link href="/play/voto-consciente" className={styles.quizLink}>
        Abrir experiência real disponível →
      </Link>
    </div>
  );
}
