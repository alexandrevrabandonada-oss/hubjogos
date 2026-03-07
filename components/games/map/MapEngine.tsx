'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Game } from '@/lib/games/catalog';
import { GameOutcome } from '@/components/games/shared/GameOutcome';
import { EngineIntro } from '@/components/games/shared/EngineIntro';
import { getOutcomeCta } from '@/lib/games/ctas';
import {
  trackStepAdvance,
  trackGameComplete,
  trackCtaClick,
  trackFirstInteractionTime,
} from '@/lib/analytics/track';
import {
  createInitialMapState,
  visitPoint,
  canComplete,
  completeExploration,
  getProgressPercent,
} from '@/lib/games/map/engine';
import type { MapDefinition, MapState, MapPoint } from '@/lib/games/map/types';
import styles from './MapEngine.module.css';

interface MapEngineProps {
  definition: MapDefinition;
  game: Game;
}

const ICON_MAP: Record<MapPoint['iconType'], string> = {
  hospital: '🏥',
  school: '🏫',
  factory: '🏭',
  house: '🏠',
  theater: '🎭',
  market: '🏪',
};

export function MapEngine({ definition, game }: MapEngineProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [state, setState] = useState<MapState | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const introClosedAt = useRef<number | null>(null);
  const firstInteractionTracked = useRef(false);

  useEffect(() => {
    const initial = createInitialMapState(definition);
    setState(initial);
  }, [definition]);

  if (!state) {
    return <div className={styles.loading}>Carregando mapa...</div>;
  }

  if (showIntro) {
    return (
      <EngineIntro
        engineType="map"
        title={game.title}
        description={game.shortDescription}
        duration={game.duration}
        whatYouDiscover={definition.description}
        onStart={() => {
          introClosedAt.current = Date.now();
          setShowIntro(false);
        }}
        icon={game.icon}
      />
    );
  }

  if (state.explorationComplete && state.finalResult) {
    const ctas = getOutcomeCta(game);

    const handleRestart = () => {
      const initial = createInitialMapState(definition);
      setState(initial);
      setSelectedPointId(null);
      setShowIntro(true);
      firstInteractionTracked.current = false;
      introClosedAt.current = null;
    };

    return (
      <GameOutcome
        eyebrow="Resultado da exploração"
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

  const selectedPoint = selectedPointId ? state.points[selectedPointId] : null;
  const progress = getProgressPercent(state, definition);
  const canFinish = canComplete(state, definition.minPointsToComplete);

  const handlePointClick = async (pointId: string) => {
    const point = state.points[pointId];
    if (!point) return;

    if (!firstInteractionTracked.current) {
      firstInteractionTracked.current = true;
      const elapsed = introClosedAt.current ? Date.now() - introClosedAt.current : 0;
      await trackFirstInteractionTime(game, elapsed, 'map_point_open').catch(console.error);
    }

    setSelectedPointId(pointId);

    if (!point.discovered) {
      const nextState = visitPoint(state, pointId);
      setState(nextState);
      await trackStepAdvance(game, `point-${pointId}`);
    }
  };

  const handleComplete = async () => {
    if (!canFinish) return;

    const nextState = completeExploration(state, definition);
    setState(nextState);

    await trackGameComplete(game, {
      id: nextState.finalResult!.id,
      title: nextState.finalResult!.title,
      summary: nextState.finalResult!.revelation,
    });
  };

  const pointsByRegion: Record<string, MapPoint[]> = {};
  definition.regions.forEach((region) => {
    pointsByRegion[region.id] = definition.points.filter((p) => p.region === region.id);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.progressText}>
            {state.visitedPoints.length} de {definition.points.length} pontos explorados
            {canFinish && (
              <span className={styles.progressReady}> • Pronto para conclusão</span>
            )}
          </p>
        </div>
      </div>

      {selectedPoint && (
        <Card className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <span className={styles.detailIcon}>{ICON_MAP[selectedPoint.iconType]}</span>
            <div>
              <h3 className={styles.detailTitle}>{selectedPoint.name}</h3>
              <p className={styles.detailRegion}>
                {definition.regions.find((r) => r.id === selectedPoint.region)?.name}
              </p>
            </div>
          </div>

          <div className={styles.detailBody}>
            <div className={styles.detailSection}>
              <h4>Situação atual</h4>
              <p>{selectedPoint.description}</p>
            </div>

            <div className={styles.detailSection}>
              <h4>História</h4>
              <p>{selectedPoint.history}</p>
            </div>

            <div className={styles.detailSection}>
              <h4>Leitura política</h4>
              <p className={styles.politicalReading}>{selectedPoint.politicalReading}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setSelectedPointId(null)}
            className={styles.closeButton}
          >
            Fechar e continuar explorando
          </Button>
        </Card>
      )}

      <div className={styles.mapContainer}>
        {definition.regions.map((region) => {
          const points = pointsByRegion[region.id] || [];
          if (points.length === 0) return null;

          return (
            <div key={region.id} className={styles.region}>
              <h3 className={styles.regionTitle}>{region.name}</h3>
              <div className={styles.pointsGrid}>
                {points.map((point) => {
                  const statePoint = state.points[point.id];
                  const isDiscovered = statePoint?.discovered;
                  const isSelected = selectedPointId === point.id;

                  return (
                    <button
                      key={point.id}
                      className={`${styles.pointCard} ${isDiscovered ? styles.pointDiscovered : ''
                        } ${isSelected ? styles.pointSelected : ''}`}
                      onClick={() => handlePointClick(point.id)}
                      aria-label={`${point.name} - ${isDiscovered ? 'Já explorado' : 'Não explorado'}`}
                    >
                      <span className={styles.pointIcon}>{ICON_MAP[point.iconType]}</span>
                      <span className={styles.pointName}>{point.name}</span>
                      {isDiscovered && (
                        <span className={styles.pointBadge}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {canFinish && (
        <div className={styles.footer}>
          <Button onClick={handleComplete} variant="primary" fullWidth>
            Concluir exploração e ver padrão territorial
          </Button>
        </div>
      )}
    </div>
  );
}
