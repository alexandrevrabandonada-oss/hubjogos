'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CampaignMark } from '@/components/campaign/CampaignMark';
import { FinalShareCard } from '@/components/campaign/FinalShareCard';
import { DownloadCardButton } from '@/components/games/share/DownloadCardButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArcadeCanvasRuntime } from '@/components/games/arcade/ArcadeCanvasRuntime';
import { getGameBySlug, type Game } from '@/lib/games/catalog';
import { tarifaZeroCorredorLogic } from '@/lib/games/arcade/tarifa-zero-corredor';
import type { ArcadeInputKind, ArcadeRunResult } from '@/lib/games/arcade/types';
import {
  trackArcadeCampaignCtaClick,
  trackArcadeFirstInputTime,
  trackArcadePowerupCollect,
  trackArcadeReplayClick,
  trackArcadeRunEnd,
  trackArcadeRunStart,
  trackArcadeScore,
  trackFinalCardQRClick,
  trackFinalCardQRView,
  trackTarifaZeroComboPeak,
  trackTarifaZeroPhaseDeaths,
  trackTarifaZeroDepthMetrics,
} from '@/lib/analytics/track';
import styles from './TarifaZeroArcadeGame.module.css';

interface TarifaZeroArcadeGameProps {
  game: Game;
}

export function TarifaZeroArcadeGame({ game }: TarifaZeroArcadeGameProps) {
  const [phase, setPhase] = useState<'intro' | 'running' | 'finished'>('intro');
  const [runId, setRunId] = useState(1);
  const [result, setResult] = useState<ArcadeRunResult | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareHref = useMemo(() => {
    if (!result) {
      return '#';
    }
    const params = new URLSearchParams({
      title: result.title,
      summary: `${result.campaignLine} ${result.summary}`,
    });
    return `/share/${game.slug}/${result.resultId}?${params.toString()}`;
  }, [game.slug, result]);

  function startRun() {
    setPhase('running');
    setResult(null);
    setRunId((current) => current + 1);
    void trackArcadeRunStart(game, {
      arcadeSlug: game.slug,
      runId: `run-${Date.now()}`,
    });
  }

  function restartRun() {
    void trackArcadeReplayClick(game, game.slug);
    startRun();
  }

  async function handleRunEnd(nextResult: ArcadeRunResult) {
    setResult(nextResult);
    setPhase('finished');

    await trackArcadeScore(game, nextResult.score, {
      collectiveRate: nextResult.stats.collectiveRate,
      durationMs: nextResult.stats.durationMs,
    }).catch(console.error);

    await trackArcadeRunEnd(game, {
      arcadeSlug: game.slug,
      runId: nextResult.resultId,
      score: nextResult.score,
      durationMs: nextResult.stats.durationMs,
      collectiveRate: nextResult.stats.collectiveRate,
      apoio: nextResult.stats.apoio,
      mutiroes: nextResult.stats.mutiroes,
      bloqueios: nextResult.stats.bloqueios,
      individualismos: nextResult.stats.individualismos,
    }).catch(console.error);

    // Track depth metrics
    if (nextResult.stats.comboMultiplierPeak !== undefined) {
      await trackTarifaZeroComboPeak(game, {
        comboMultiplierPeak: nextResult.stats.comboMultiplierPeak,
        perfectStreakPeakMs: nextResult.stats.perfectStreakPeak || 0,
        apoioSequencePeak: nextResult.stats.apoioSequencePeak || 0,
        eventsTriggered: nextResult.stats.eventsTriggered || 0,
      }).catch(console.error);

      await trackTarifaZeroPhaseDeaths(
        game,
        nextResult.stats.currentPhase || 'final',
        nextResult.stats.durationMs,
        nextResult.stats.collectiveRate
      ).catch(console.error);

      await trackTarifaZeroDepthMetrics(game, {
        comboMultiplierPeak: nextResult.stats.comboMultiplierPeak,
        perfectStreakPeakMs: nextResult.stats.perfectStreakPeak || 0,
        apoioSequencePeak: nextResult.stats.apoioSequencePeak || 0,
        totalCollisions: nextResult.stats.totalCollisions || 0,
        eventsTriggered: nextResult.stats.eventsTriggered || 0,
        collectiveRate: nextResult.stats.collectiveRate,
        phase: nextResult.stats.currentPhase || 'unknown',
      }).catch(console.error);
    }

    await trackFinalCardQRView(game, nextResult.resultId).catch(console.error);
  }

  function handleFirstInput(msSinceStart: number, kind: ArcadeInputKind) {
    void trackArcadeFirstInputTime(game, msSinceStart, kind);
  }

  function handlePowerupCollect(powerupId: string) {
    void trackArcadePowerupCollect(game, powerupId, {
      arcadeSlug: game.slug,
    });
  }

  const gameForCard = getGameBySlug(game.slug) || game;

  if (phase === 'intro') {
    return (
      <Card className={styles.wrap}>
        <span className="eyebrow">Linha arcade da campanha</span>
        <h2>Tarifa Zero RJ — Corredor do Povo</h2>
        <p className={styles.introBrief}>
          Desvie o bloqueio, colete apoio popular e ative mutirão. 
          O coletivo forte vale mais pontos e estabiliza a corrida — 
          atalhos individualistas dão ponto rápido, mas sabotam o comum.
        </p>
        
        <div className={styles.introFeatures}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✊</span>
            <div>
              <strong>Coleta Coletiva</strong>
              <p>Apoio + Mutirão aumentam seu medidor coletivo</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🚧</span>
            <div>
              <strong>Evite Bloqueios</strong>
              <p>Desvie obstáculos que reduzem seu coletivo</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎮</span>
            <div>
              <strong>Controle Simples</strong>
              <p>Toque, mouse ou teclado (A/D, setas)</p>
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button onClick={startRun}>Começar corrida</Button>
          <Link href="/explorar" className={styles.linkGhost}>
            ← Voltar ao catálogo
          </Link>
        </div>
      </Card>
    );
  }

  if (phase === 'running') {
    return (
      <div className={styles.wrap}>
        <ArcadeCanvasRuntime
          logic={tarifaZeroCorredorLogic}
          runId={runId}
          onRunEnd={handleRunEnd}
          onFirstInput={handleFirstInput}
          onPowerupCollect={handlePowerupCollect}
        />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <Card className={styles.resultTop}>
        <span className="eyebrow">Fim da run</span>
        <h3>{result.title}</h3>
        <p>{result.summary}</p>
        <p className={styles.scoreLine}>Score final: <strong>{result.score}</strong></p>
        <p className={styles.statsLine}>
          Apoio {result.stats.apoio} • Mutirões {result.stats.mutiroes} • Bloqueios {result.stats.bloqueios} •
          Coletivo {result.stats.collectiveRate}%
        </p>
        <CampaignMark compact />
      </Card>

      <div ref={cardRef}>
        <FinalShareCard
          game={gameForCard}
          resultId={result.resultId}
          resultTitle={result.title}
          resultSummary={`${result.campaignLine} ${result.summary}`}
          onQrClick={() => {
            void trackFinalCardQRClick(game, result.resultId);
          }}
          showQR
          showAvatar
        />
      </div>

      <div className={styles.actions}>
        <Button onClick={restartRun}>Jogar de novo</Button>
        <DownloadCardButton
          cardContainerRef={cardRef}
          gameSlug={game.slug}
          resultId={result.resultId}
        />
        <Link
          href={shareHref}
          className={styles.linkPrimary}
          onClick={() => {
            void trackArcadeCampaignCtaClick(game, game.slug, 'arcade-post-run-share');
          }}
        >
          Abrir página de compartilhamento
        </Link>
        <Link
          href="/participar"
          className={styles.linkGhost}
          onClick={() => {
            void trackArcadeCampaignCtaClick(game, game.slug, 'arcade-post-run-participar');
          }}
        >
          Entrar na pré-campanha
        </Link>
      </div>
    </div>
  );
}
