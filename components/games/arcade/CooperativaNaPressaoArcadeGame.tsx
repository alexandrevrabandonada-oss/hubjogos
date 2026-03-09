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
import { cooperativaNaPressaoLogic } from '@/lib/games/arcade/cooperativa-na-pressao';
import { COOPERATIVA_ASSET_SET, COOPERATIVA_VISUAL_VERSION } from '@/lib/games/arcade/cooperativa-assets';
import type { ArcadeInputKind, ArcadeRunResult, ArcadeRuntimeEvent } from '@/lib/games/arcade/types';
import {
  trackArcadeFirstInputTime,
  trackArcadeReplayClick,
  trackArcadeRunEnd,
  trackArcadeRunStart,
  trackArcadeScore,
  trackCampaignCtaClickAfterRun,
  trackCooperativaActionUsed,
  trackCooperativaEventTriggered,
  trackCooperativaPressurePeak,
  trackCooperativaStationSelected,
  trackCooperativaPhaseReached,
  trackCooperativaMutiraoActivated,
  trackCooperativaCollapseReason,
  trackFinalCardQRClick,
  trackFinalCardQRView,
} from '@/lib/analytics/track';
import styles from './CooperativaNaPressaoArcadeGame.module.css';

interface CooperativaNaPressaoArcadeGameProps {
  game: Game;
  previewFinal?: boolean;
}

function buildPreviewResult(): ArcadeRunResult {
  return {
    score: 1480,
    title: 'Cooperativa segurou o turno final',
    summary: 'Voce balanceou demanda, cuidado e solidariedade durante o pico de pressao de mercado.',
    campaignLine:
      'Alexandre Fonseca para Deputado: trabalho digno, autogestao e economia do comum como caminho de campanha.',
    resultId: 'preview-t42-cooperativa',
    stats: {
      apoio: 14,
      mutiroes: 2,
      bloqueios: 5,
      individualismos: 1,
      collectiveRate: 87,
      durationMs: 83_000,
    },
  };
}

export function CooperativaNaPressaoArcadeGame({
  game,
  previewFinal = false,
}: CooperativaNaPressaoArcadeGameProps) {
  const [phase, setPhase] = useState<'intro' | 'running' | 'finished'>(previewFinal ? 'finished' : 'intro');
  const [runId, setRunId] = useState(1);
  const [result, setResult] = useState<ArcadeRunResult | null>(previewFinal ? buildPreviewResult() : null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pressurePeakRef = useRef(0);

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
    pressurePeakRef.current = 0;

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

    await trackCooperativaPressurePeak(game, pressurePeakRef.current, {
      runId: nextResult.resultId,
      collectiveRate: nextResult.stats.collectiveRate,
    }).catch(console.error);

    await trackFinalCardQRView(game, nextResult.resultId).catch(console.error);
  }

  function handleFirstInput(msSinceStart: number, kind: ArcadeInputKind) {
    void trackArcadeFirstInputTime(game, msSinceStart, kind);
  }

  function handleRuntimeEvent(event: ArcadeRuntimeEvent) {
    if (event.type === 'action_used') {
      void trackCooperativaActionUsed(game, event.actionId, {
        stationId: event.hotspotId || 'none',
      });
      if (event.actionId === 'mutirao-cooperativo') {
        void trackCooperativaMutiraoActivated(game);
      }
      return;
    }

    if (event.type === 'special_event') {
      void trackCooperativaEventTriggered(game, event.eventId);
      return;
    }

    if (event.type === 'phase_transition') {
      void trackCooperativaPhaseReached(game, event.phase);
      return;
    }

    if (event.type === 'station_select') {
      void trackCooperativaStationSelected(game, event.stationId);
      return;
    }

    if (event.type === 'station_overload') {
      void trackCooperativaStationSelected(game, event.stationId, { overload: true });
      return;
    }

    if (event.type === 'collapse') {
      void trackCooperativaCollapseReason(game, event.reason);
      return;
    }

    if (event.type === 'powerup_collect' && event.powerupId === 'pressure-peak') {
      pressurePeakRef.current += 1;
    }
  }

  const gameForCard = getGameBySlug(game.slug) || game;

  if (phase === 'intro') {
    return (
      <Card className={styles.introCard}>
        <div className={styles.introHeader}>
          <span className="eyebrow">Linha arcade da campanha</span>
          <h2>Cooperativa na Pressao</h2>
          <p>
            <strong>Objetivo:</strong> Sobreviver 85 segundos coordenando o chao de fabrica coletivo.
          </p>
          <p>
            Equilibre fila de producao, exaustao e solidariedade. Cooperacao bate individualismo.
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <strong>1. Organizar turno</strong>
            <p>Reduz fila da estacao selecionada. Use quando uma estacao ficar sobrecarregada.</p>
          </div>
          <div className={styles.feature}>
            <strong>2. Redistribuir esforco</strong>
            <p>Equilibra trabalho entre todas as estacoes. Aumenta solidariedade.</p>
          </div>
          <div className={styles.feature}>
            <strong>3. Cuidar equipe</strong>
            <p>Reduz exaustao coletiva. Use quando burnout estiver alto.</p>
          </div>
          <div className={styles.feature}>
            <strong>Espaco: Mutirao cooperativo</strong>
            <p>Boost poderoso quando carga cheia (85%+). Guarde para momentos criticos.</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={startRun} className={styles.playButton}>Iniciar cooperativa</Button>
          <Link href="/explorar" className={styles.linkGhost}>← Voltar ao catalogo</Link>
        </div>
      </Card>
    );
  }

  if (phase === 'running') {
    return (
      <div className={styles.wrap}>
        <ArcadeCanvasRuntime
          logic={cooperativaNaPressaoLogic}
          runId={runId}
          onRunEnd={handleRunEnd}
          onFirstInput={handleFirstInput}
          onRuntimeEvent={handleRuntimeEvent}
          hudBadge={COOPERATIVA_VISUAL_VERSION}
          hudDetail={COOPERATIVA_ASSET_SET}
          scoreLabel="Impacto coletivo"
          canvasAriaLabel="Jogo arcade Cooperativa na Pressao"
          controlScheme="hotspot"
          actionLabels={{
            one: 'Organizar',
            two: 'Redistribuir',
            three: 'Cuidar',
            special: 'Mutirao',
          }}
          hintText="Selecione estacao (toque/setas). Acoes: 1-Organizar 2-Redistribuir 3-Cuidar Espaco-Mutirao"
        />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <Card className={styles.resultCard}>
        <span className="eyebrow">Resultado da run</span>
        <h3>{result.title}</h3>
        <p>{result.summary}</p>
        <p className={styles.scoreLine}>
          Score: <strong>{result.score}</strong> • Eficiencia coletiva: <strong>{result.stats.collectiveRate}%</strong>
        </p>
        <p className={styles.statsLine}>
          Durou {Math.floor(result.stats.durationMs / 1000)}s • {result.stats.apoio} acoes coletivas • {result.stats.bloqueios} eventos
        </p>
        {result.stats.collectiveRate >= 75 && (
          <p className={styles.highlightLine}>
            ✓ Coordenacao eficiente! Cooperacao superou individualismo.
          </p>
        )}
        {result.stats.collectiveRate < 60 && (
          <p className={styles.highlightLine}>
            Tente balancear melhor as acoes. Cooperacao rende mais que spam.
          </p>
        )}
        <CampaignMark compact />
      </Card>

      <div className={styles.finalCardShell}>
        <div ref={cardRef}>
          <FinalShareCard
            game={gameForCard}
            resultId={result.resultId}
            resultTitle={result.title}
            resultSummary={`${result.campaignLine} ${result.summary}`}
            metrics={[
              { label: 'Score', value: String(result.score) },
              { label: 'Eficiencia coletiva', value: `${result.stats.collectiveRate}%` },
              { label: 'Acoes coletivas', value: String(result.stats.apoio) },
            ]}
            ctaLabel="Cooperativa na Pressao"
            ctaSecondaryLabel="Reentre no chao de fabrica e compare sua organizacao coletiva"
            onQrClick={() => {
              void trackFinalCardQRClick(game, result.resultId);
            }}
            showQR
            showAvatar
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={restartRun} className={styles.playButton}>
          {result.stats.collectiveRate >= 65 ? 'Melhorar coordenacao' : 'Tentar de novo'}
        </Button>
        <Link
          href="/arcade/mutirao-do-bairro"
          className={styles.linkPrimary}
          onClick={() => {
            void trackCampaignCtaClickAfterRun(game, 'mutirao-do-bairro', 'arcade-next-game');
          }}
        >
          Proximo arcade →
        </Link>
        <DownloadCardButton cardContainerRef={cardRef} gameSlug={game.slug} resultId={result.resultId} />
        <Link
          href={shareHref}
          className={styles.linkPrimary}
          onClick={() => {
            void trackCampaignCtaClickAfterRun(game, 'share-result', 'arcade-post-run-share');
          }}
        >
          Compartilhar resultado
        </Link>
        <Link
          href="/participar"
          className={styles.linkGhost}
          onClick={() => {
            void trackCampaignCtaClickAfterRun(game, 'participar-campanha', 'arcade-post-run-participar');
          }}
        >
          Participar da campanha →
        </Link>
      </div>
    </div>
  );
}
