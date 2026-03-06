'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MetaChip } from '@/components/ui/MetaChip';
import { GameOutcome } from '@/components/games/shared/GameOutcome';
import {
  computeBranchingResult,
  getBranchingNode,
  resolveNextStep,
} from '@/lib/games/branching/engine';
import { BranchingStoryDefinition } from '@/lib/games/branching/types';
import { Game } from '@/lib/games/catalog';
import { getOutcomeCta } from '@/lib/games/ctas';
import {
  trackCtaClick,
  trackGameComplete,
  trackLinkCopy,
  trackResultCopy,
  trackStepAdvance,
} from '@/lib/analytics/track';
import styles from './BranchingStoryEngine.module.css';

interface BranchingStoryEngineProps {
  story: BranchingStoryDefinition;
  game: Game;
}

export function BranchingStoryEngine({ story, game }: BranchingStoryEngineProps) {
  const [currentNodeId, setCurrentNodeId] = useState(story.startNodeId);
  const [history, setHistory] = useState<Array<{ nodeId: string; choiceId: string }>>([]);
  const [endingId, setEndingId] = useState<string | null>(null);
  const completedRef = useRef(false);

  const currentNode = getBranchingNode(story, currentNodeId);
  const ctas = getOutcomeCta(game);

  const result = useMemo(() => {
    if (!endingId) {
      return null;
    }
    return computeBranchingResult(story, endingId, history);
  }, [endingId, history, story]);

  async function handleChoice(choiceId: string) {
    if (!currentNode) {
      return;
    }

    const step = history.length + 1;
    await trackStepAdvance(game, `branching-step-${step}`);

    const resolved = resolveNextStep(story, currentNode, choiceId);
    if (!resolved.choice) {
      return;
    }

    setHistory((prev) => [...prev, { nodeId: currentNode.id, choiceId }]);

    if (resolved.endingId) {
      setEndingId(resolved.endingId);
      return;
    }

    if (resolved.nextNode) {
      setCurrentNodeId(resolved.nextNode.id);
    }
  }

  async function handleCopySummary(summary: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
    }
    await trackResultCopy(game);
  }

  async function handleCopyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
    await trackLinkCopy(game);
  }

  function restart() {
    completedRef.current = false;
    setCurrentNodeId(story.startNodeId);
    setHistory([]);
    setEndingId(null);
  }

  if (result) {
    if (!completedRef.current) {
      completedRef.current = true;
      void trackGameComplete(game, {
        id: result.ending.id,
        title: result.ending.title,
        summary: result.summary,
      });
    }

    return (
      <GameOutcome
        eyebrow="Resultado da narrativa"
        title={result.ending.title}
        revelation={result.ending.revelation}
        nextAction={result.ending.nextAction}
        summary={`${ctas.shareLine} ${result.summary}`}
        ctas={ctas}
        onRestart={restart}
        onCopySummary={() => handleCopySummary(`${ctas.shareLine} ${result.summary}`)}
        onCopyLink={handleCopyLink}
        onCtaClick={(ctaId) => trackCtaClick(game, ctaId)}
      />
    );
  }

  if (!currentNode) {
    return (
      <Card className={styles.engine}>
        <h3>Narrativa indisponível</h3>
        <p>Não foi possível carregar esta história agora.</p>
      </Card>
    );
  }

  return (
    <Card className={styles.engine}>
      <header className={styles.head}>
        <span className="eyebrow">Narrativa em andamento</span>
        <h3>{story.title}</h3>
        <p>{story.subtitle}</p>
        <MetaChip icon="🧭">Etapa {history.length + 1}</MetaChip>
      </header>

      <section className={styles.node}>
        <h4>{currentNode.title}</h4>
        <p>{currentNode.body}</p>
      </section>

      <section className={styles.choices}>
        {currentNode.choices.map((choice) => (
          <button
            key={choice.id}
            className={styles.choice}
            type="button"
            onClick={() => handleChoice(choice.id)}
          >
            <strong>{choice.label}</strong>
            <span>{choice.consequence}</span>
          </button>
        ))}
      </section>

      <footer className={styles.footer}>
        <span className={styles.history}>Decisões registradas: {history.length}</span>
        <Button variant="ghost" onClick={restart}>
          Reiniciar história
        </Button>
      </footer>
    </Card>
  );
}
