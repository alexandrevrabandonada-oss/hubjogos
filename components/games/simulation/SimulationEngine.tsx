'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Game } from '@/lib/games/catalog';
import { GameOutcome } from '@/components/games/shared/GameOutcome';
import { EngineIntro } from '@/components/games/shared/EngineIntro';
import { getOutcomeCta } from '@/lib/games/ctas';
import { trackStepAdvance, trackGameComplete, trackCtaClick } from '@/lib/analytics/track';
import {
  createInitialSimulationState,
  updateBudgetCategory,
  getRemainingBudget,
  getNextPressure,
  advanceStep,
  completeSimulation,
  getProgressPercent,
} from '@/lib/games/simulation/engine';
import type { SimulationDefinition, SimulationState } from '@/lib/games/simulation/types';
import styles from './SimulationEngine.module.css';

interface SimulationEngineProps {
  definition: SimulationDefinition;
  game: Game;
}

export function SimulationEngine({ definition, game }: SimulationEngineProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [state, setState] = useState<SimulationState | null>(null);
  const [feedback, setFeedback] = useState('');

  // Inicializa
  useEffect(() => {
    const initial = createInitialSimulationState(definition);
    setState(initial);
  }, [definition]);

  if (!state) {
    return <div className={styles.loading}>Carregando simulação...</div>;
  }

  if (showIntro) {
    return (
      <EngineIntro
        engineType="simulation"
        title={game.title}
        description={game.shortDescription}
        duration={game.duration}
        whatYouDiscover={definition.subtitle}
        onStart={() => setShowIntro(false)}
        icon={game.icon}
      />
    );
  }

  // Se completado, mostra resultado
  if (state.finalResult) {
    const ctas = getOutcomeCta(game);

    const handleRestart = () => {
      const initial = createInitialSimulationState(definition);
      setState(initial);
      setFeedback('');
      setShowIntro(true);
    };

    return (
      <GameOutcome
        eyebrow="Resultado da simulação"
        title={state.finalResult.title}
        revelation={state.finalResult.revelation}
        nextAction={state.finalResult.nextAction}
        summary={`${definition.title}: ${state.finalResult.title}. ${state.finalResult.revelation}`}
        ctas={ctas}
        onRestart={handleRestart}
        onCtaClick={(ctaId) => trackCtaClick(game, ctaId)}
        game={game}
      />
    );
  }

  const nextPressure = getNextPressure(state, definition);
  const remaining = getRemainingBudget(state);
  const progress = getProgressPercent(state, definition);

  const handleAllocate = (categoryKey: keyof typeof state.budget, amount: number) => {
    const updated = updateBudgetCategory(state, categoryKey, amount);
    setState(updated);
  };

  const handleContinue = () => {
    let nextState = advanceStep(state);

    // Se foi último step, completa simulação
    if (!getNextPressure(nextState, definition)) {
      nextState = completeSimulation(nextState, definition);
      void trackGameComplete(game, {
        id: nextState.finalResult!.id,
        title: nextState.finalResult!.title,
        summary: nextState.finalResult!.revelation,
      });
    } else {
      void trackStepAdvance(game, `step_${nextState.step}`);
    }

    setState(nextState);
    setFeedback('');
  };

  const canContinue = remaining === 0;

  return (
    <div className={styles.simulationWrap}>
      <div className={styles.header}>
        <h2>{definition.title}</h2>
        <p className={styles.subtitle}>{definition.subtitle}</p>
      </div>

      {nextPressure && (
        <Card className={styles.pressureCard}>
          <h3 className={styles.pressureTitle}>{nextPressure.title}</h3>
          <p className={styles.pressureDesc}>{nextPressure.description}</p>
          <p className={styles.pressureDemand}>
            Demanda aumentada em{' '}
            <strong>
              {nextPressure.demandPercentage}% para{' '}
              {definition.categories.find((c) => c.key === nextPressure.demandCategory)?.label}
            </strong>
          </p>
        </Card>
      )}

      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.stepCounter}>
          Decisão {state.step + 1} de {definition.pressures.length}
        </p>
      </div>

      <div className={styles.budgetGrid}>
        {definition.categories.map((cat) => (
          <div key={cat.key} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryIcon} aria-hidden="true">{cat.icon}</span>
              <h4 className={styles.categoryLabel}>{cat.label}</h4>
            </div>
            <p className={styles.categoryDesc}>{cat.description}</p>

            <div className={styles.budgetControl}>
              <input
                type="range"
                min="0"
                max={definition.totalBudget}
                value={state.budget[cat.key]}
                onChange={(e) => handleAllocate(cat.key, Number(e.target.value))}
                className={styles.budgetSlider}
                aria-label={`${cat.label}: ${state.budget[cat.key]} de ${definition.totalBudget} milhões`}
              />
              <div className={styles.budgetDisplay} aria-live="polite" aria-atomic="true">
                <span className={styles.budgetValue}>{state.budget[cat.key]}</span>
                <span className={styles.budgetUnit}>M</span>
              </div>
            </div>

            {state.budget[cat.key] < cat.criticalThreshold && (
              <p className={styles.warningText} role="alert">⚠️ Abaixo do crítico ({cat.criticalThreshold}M)</p>
            )}
          </div>
        ))}
      </div>

      <div className={styles.budgetSummary}>
        <p>
          <strong>Orçamento total:</strong> {definition.totalBudget}M
        </p>
        <p>
          <strong>Alocado:</strong> {definition.totalBudget - remaining}M
        </p>
        <p className={remaining === 0 ? styles.remaining0 : styles.remainingPositive}>
          <strong>Restante:</strong> {remaining}M
        </p>
      </div>

      {feedback && <p className={styles.feedback}>{feedback}</p>}

      <div className={styles.actions}>
        <Button
          variant={canContinue ? 'primary' : 'disabled'}
          onClick={handleContinue}
          disabled={!canContinue}
          aria-disabled={!canContinue}
        >
          {!canContinue
            ? `Distribua ${remaining > 0 ? remaining + 'M restante' : 'todo orçamento'}`
            : 'Continuar →'}
        </Button>
      </div>
    </div>
  );
}
