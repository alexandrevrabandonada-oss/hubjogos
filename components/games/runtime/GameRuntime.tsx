'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { BranchingStoryEngine } from '@/components/games/branching/BranchingStoryEngine';
import { QuizEngine } from '@/components/games/quiz/QuizEngine';
import { Game } from '@/lib/games/catalog';
import { resolveGameEngine } from '@/lib/games/runtime/resolve-engine';
import { trackGameStart, trackGameView } from '@/lib/analytics/track';
import styles from './GameRuntime.module.css';

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
      <div className={styles.runtimeWrap}>
        <QuizEngine quiz={resolved.quiz} game={game} />
      </div>
    );
  }

  if (resolved.status === 'resolved' && resolved.engineType === 'branching_story') {
    return (
      <div className={styles.runtimeWrap}>
        <BranchingStoryEngine story={resolved.story} game={game} />
      </div>
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
