'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CampaignMark } from '@/components/campaign/CampaignMark';
import { FinalShareCard } from '@/components/campaign/FinalShareCard';
import { DownloadCardButton } from '@/components/games/share/DownloadCardButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArcadeCanvasRuntime } from '@/components/games/arcade/ArcadeCanvasRuntime';
import { ArcadeProgressBar } from '@/components/games/arcade/ArcadeProgressBar';
import { getGameBySlug, type Game } from '@/lib/games/catalog';
import { mutiraoDoBairroLogic } from '@/lib/games/arcade/mutirao-do-bairro';
import { MUTIRAO_ASSET_SET, MUTIRAO_VISUAL_VERSION } from '@/lib/games/arcade/mutirao-assets';
import type { ArcadeInputKind, ArcadeRunResult, ArcadeRuntimeEvent } from '@/lib/games/arcade/types';
import {
  trackArcadeCampaignCtaClick,
  trackArcadeFirstInputTime,
  trackArcadeReplayClick,
  trackArcadeRunEnd,
  trackArcadeRunStart,
  trackArcadeScore,
  trackFinalCardQRClick,
  trackFinalCardQRView,
  trackMutiraoActionUsed,
  trackMutiraoEventTriggered,
  trackMutiraoPressurePeak,
} from '@/lib/analytics/track';
import styles from './MutiraoDoBairroArcadeGame.module.css';

interface MutiraoDoBairroArcadeGameProps {
  game: Game;
  previewFinal?: boolean;
}

function buildPreviewResult(): ArcadeRunResult {
  return {
    score: 1620,
    title: 'Mutirao segurou o bairro',
    summary: 'Voce coordenou reparo, defesa e mobilizacao para atravessar o pico de caos com estabilidade.',
    campaignLine:
      'Alexandre Fonseca para Deputado: mandato de territorio, ajuda mutua e defesa do comum no Estado do RJ.',
    resultId: 'preview-t36b-mutirao',
    stats: {
      apoio: 16,
      mutiroes: 3,
      bloqueios: 6,
      individualismos: 2,
      collectiveRate: 84,
      durationMs: 89_000,
    },
  };
}

export function MutiraoDoBairroArcadeGame({ game, previewFinal = false }: MutiraoDoBairroArcadeGameProps) {
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

    await trackMutiraoPressurePeak(game, pressurePeakRef.current, {
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
      void trackMutiraoActionUsed(game, event.actionId, {
        hotspotId: event.hotspotId || 'none',
      });
      return;
    }

    if (event.type === 'special_event') {
      void trackMutiraoEventTriggered(game, event.eventId);
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
          <h2>Mutirao do Bairro - Defesa do Comum</h2>
          <p>
            Coordene hotspots de bairro em tempo real. Repare servicos, defenda contra sabotagem e mobilize a rede
            para sustentar estabilidade e confianca durante 90 segundos de pressao.
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <strong>Reparar</strong>
            <p>Recupera estrutura e segura colapso.</p>
          </div>
          <div className={styles.feature}>
            <strong>Defender</strong>
            <p>Reduz dano de ameacas e sobe confianca.</p>
          </div>
          <div className={styles.feature}>
            <strong>Mobilizar</strong>
            <p>Espalha resposta coletiva e enche o mutirao.</p>
          </div>
          <div className={styles.feature}>
            <strong>Mutirao</strong>
            <p>Janela curta de boost para virar uma run no caos.</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={startRun} className={styles.playButton}>Iniciar mutirao</Button>
          <Link href="/explorar" className={styles.linkGhost}>← Voltar ao catalogo</Link>
        </div>
      </Card>
    );
  }

  if (phase === 'running') {
    return (
      <div className={styles.wrap}>
        <ArcadeCanvasRuntime
          logic={mutiraoDoBairroLogic}
          runId={runId}
          onRunEnd={handleRunEnd}
          onFirstInput={handleFirstInput}
          onRuntimeEvent={handleRuntimeEvent}
          hudBadge={MUTIRAO_VISUAL_VERSION}
          hudDetail={MUTIRAO_ASSET_SET}
          scoreLabel="Impacto"
          canvasAriaLabel="Jogo arcade Mutirao do Bairro"
          controlScheme="hotspot"
          actionLabels={{
            one: 'Reparar',
            two: 'Defender',
            three: 'Mobilizar',
            special: 'Mutirao',
          }}
          hintText="Toque em hotspots para priorizar. Acoes: 1 Reparar, 2 Defender, 3 Mobilizar, Espaco Mutirao, P pausa"
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
        <span className="eyebrow">Resultado da rodada</span>
        <h3>{result.title}</h3>
        <p>{result.summary}</p>
        <p className={styles.scoreLine}>Score total: <strong>{result.score}</strong></p>
        <p className={styles.statsLine}>
          Acoes coletivas {result.stats.apoio} • Mutiroes {result.stats.mutiroes} • Eventos {result.stats.bloqueios} •
          Eficiencia coletiva {result.stats.collectiveRate}%
        </p>
        <div style={{ padding: '0.5rem 0 1rem 0' }}>
          <ArcadeProgressBar 
            value={result.stats.collectiveRate} 
            max={100} 
            label="Eficiência Coletiva" 
            colorState={result.stats.collectiveRate >= 70 ? 'safe' : result.stats.collectiveRate > 50 ? 'primary' : 'warning'} 
            width={160}
          />
        </div>
        <CampaignMark compact />
      </Card>

      <div className={styles.finalCardShell}>
        <div ref={cardRef}>
          <FinalShareCard
            game={gameForCard}
            resultId={result.resultId}
            theme="mutirao-bairro-premium"
            resultTitle={result.title}
            resultSummary={`${result.campaignLine} ${result.summary}`}
            metrics={[
              { label: 'Score', value: String(result.score) },
              { label: 'Eficiencia coletiva', value: `${result.stats.collectiveRate}%` },
              { label: 'Mutiroes', value: String(result.stats.mutiroes) },
            ]}
            ctaLabel="Mutirao do Bairro"
            ctaSecondaryLabel="Reentre no mutirao, compare runs e convide o territorio"
            onQrClick={() => {
              void trackFinalCardQRClick(game, result.resultId);
            }}
            showQR
            showAvatar
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={restartRun} className={styles.playButton}>Jogar de novo</Button>
        <Link
          href="/arcade/tarifa-zero-corredor"
          className={styles.linkPrimary}
          onClick={() => {
            void trackArcadeCampaignCtaClick(game, 'tarifa-zero-corredor', 'arcade-next-game');
          }}
        >
          Proximo jogo →
        </Link>
        <DownloadCardButton cardContainerRef={cardRef} gameSlug={game.slug} resultId={result.resultId} />
        <Link
          href={shareHref}
          className={styles.linkPrimary}
          onClick={() => {
            void trackArcadeCampaignCtaClick(game, game.slug, 'arcade-post-run-share');
          }}
        >
          Compartilhar resultado
        </Link>
        <Link
          href="/participar"
          className={styles.linkGhost}
          onClick={() => {
            void trackArcadeCampaignCtaClick(game, game.slug, 'arcade-post-run-participar');
          }}
        >
          Participar da campanha →
        </Link>
      </div>
    </div>
  );
}
