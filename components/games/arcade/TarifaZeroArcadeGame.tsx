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
import {
  TARIFA_ZERO_ASSET_SET,
  TARIFA_ZERO_VISUAL_VERSION,
} from '@/lib/games/arcade/tarifa-zero-assets';
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

function formatPhaseLabel(phase?: ArcadeRunResult['stats']['currentPhase']) {
  switch (phase) {
    case 'abertura':
      return 'Fase 1 · Abertura';
    case 'escalada':
      return 'Fase 2 · Escalada';
    case 'pressao':
      return 'Fase 3 · Pressao';
    case 'final':
      return 'Fase 4 · Final';
    default:
      return 'Fase encerrada';
  }
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
      <Card className={`${styles.wrap} ${styles.introShell}`}>
        <div className={styles.introHero}>
          <div className={styles.introCopy}>
            <span className="eyebrow">Linha arcade da campanha</span>
            <div className={styles.introKicker}>Mobilidade como direito • Coletivo em movimento</div>
            <h2>Tarifa Zero RJ — Corredor do Povo</h2>
            <p className={styles.introBrief}>
              Desvie o bloqueio, colete apoio popular e ative mutirão. O coletivo forte acelera a corrida,
              segura a pressão e abre passagem para todo mundo.
            </p>
            <div className={styles.introRhythm}>
              <span>55s de pressão urbana</span>
              <span>3 lanes de leitura rápida</span>
              <span>tarifa zero contra catraca</span>
            </div>
          </div>

          <div className={styles.introStage} aria-hidden="true">
            <div className={styles.introSkyline}></div>
            <div className={styles.introRoad}></div>
            <div className={`${styles.introSprite} ${styles.introBus}`}></div>
            <div className={`${styles.introSprite} ${styles.introApoio}`}></div>
            <div className={`${styles.introSprite} ${styles.introMutirao}`}></div>
            <div className={`${styles.introSprite} ${styles.introBloqueio}`}></div>
            <div className={`${styles.introSprite} ${styles.introChance}`}></div>
          </div>
        </div>

        <div className={styles.introFeatures}>
          <div className={styles.feature}>
            <span className={`${styles.featureAsset} ${styles.featureApoio}`} aria-hidden="true"></span>
            <div>
              <strong>Coleta Coletiva</strong>
              <p>Apoio, território e mutirão enchem o medidor comum e sustentam o combo.</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={`${styles.featureAsset} ${styles.featureBloqueio}`} aria-hidden="true"></span>
            <div>
              <strong>Leia o corredor</strong>
              <p>Catracas, barreiras e zonas de pressão exigem troca de lane no tempo certo.</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={`${styles.featureAsset} ${styles.featureBus}`} aria-hidden="true"></span>
            <div>
              <strong>Controle responsivo</strong>
              <p>Toque, mouse ou teclado (A/D, setas) com partida curta e replay imediato.</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={startRun} className={styles.premiumReplayButton}>Começar corrida</Button>
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
          hudBadge={TARIFA_ZERO_VISUAL_VERSION}
          hudDetail={TARIFA_ZERO_ASSET_SET}
        />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <Card className={`${styles.resultTop} ${styles.resultPremium}`}>
        <span className="eyebrow">Fim da run</span>
        <h3>{result.title}</h3>
        <p>{result.summary}</p>
        <p className={styles.scoreLine}>Score final: <strong>{result.score}</strong></p>
        <p className={styles.statsLine}>
          Apoio {result.stats.apoio} • Mutirões {result.stats.mutiroes} • Bloqueios {result.stats.bloqueios} •
          Coletivo {result.stats.collectiveRate}%
        </p>
        <div className={styles.visualMeta}>
          <span className={styles.visualTag}>{TARIFA_ZERO_VISUAL_VERSION}</span>
          <span className={styles.visualTag}>{TARIFA_ZERO_ASSET_SET}</span>
        </div>
        <div className={styles.scoreboardGrid}>
          <div className={styles.scoreboardCard}>
            <span>Score</span>
            <strong>{result.score}</strong>
          </div>
          <div className={styles.scoreboardCard}>
            <span>Fase</span>
            <strong>{formatPhaseLabel(result.stats.currentPhase)}</strong>
          </div>
          <div className={styles.scoreboardCard}>
            <span>Combo pico</span>
            <strong>{result.stats.comboMultiplierPeak?.toFixed(2) ?? '1.00'}x</strong>
          </div>
        </div>
        <CampaignMark compact />
      </Card>

      <div className={styles.finalCardShell}>
        <div className={styles.finalCardHeading}>
          <span>Final card premium</span>
          <span>QR e reentrada prontos</span>
        </div>
        <div ref={cardRef} className={styles.finalCardFrame}>
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
      </div>

      <div className={styles.actions}>
        <Button onClick={restartRun} className={styles.premiumReplayButton}>Jogar de novo</Button>
        <DownloadCardButton
          cardContainerRef={cardRef}
          gameSlug={game.slug}
          resultId={result.resultId}
        />
        <Link
          href="/arcade/passe-livre-nacional"
          className={`${styles.linkPrimary} ${styles.premiumNextLink}`}
          onClick={() => {
            void trackArcadeCampaignCtaClick(game, 'passe-livre-nacional', 'arcade-next-game');
          }}
        >
          Proximo jogo
        </Link>
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
