'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { CampaignMark } from '@/components/campaign/CampaignMark';
import { FinalShareCard } from '@/components/campaign/FinalShareCard';
import { DownloadCardButton } from '@/components/games/share/DownloadCardButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArcadeCanvasRuntime } from '@/components/games/arcade/ArcadeCanvasRuntime';
import { getGameBySlug, type Game } from '@/lib/games/catalog';
import { passeLivreNacionalLogic } from '@/lib/games/arcade/passe-livre-nacional';
import type { ArcadeInputKind, ArcadeRunResult } from '@/lib/games/arcade/types';
import {
  trackArcadeFirstInputTime,
  trackArcadePowerupCollect,
  trackArcadeReplayClick,
  trackArcadeRunEnd,
  trackArcadeRunStart,
  trackArcadeScore,
  trackFinalCardQRClick,
  trackFinalCardQRView,
} from '@/lib/analytics/track';
import styles from './PasseLivreArcadeGame.module.css';

interface PasseLivreArcadeGameProps {
  game: Game;
}

export function PasseLivreArcadeGame({ game }: PasseLivreArcadeGameProps) {
  const [phase, setPhase] = useState<'intro' | 'running' | 'finished'>('intro');
  const [runId, setRunId] = useState(1);
  const [result, setResult] = useState<ArcadeRunResult | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
      <Card className={styles.introCard}>
        <div className={styles.introContent}>
          <h2>{game.title}</h2>
          <p className={styles.description}>
            Coordene a expansão de uma rede de transporte público gratuita em toda a cidade.
            Transporte passageiros entre paradas, evite a privatização, organize sindicatos.
            <br />
            <br />
            <strong>90 segundos</strong> de estratégia coletiva em movimento.
          </p>

          <div className={styles.howtoplay}>
            <h4>Controles</h4>
            <ul>
              <li><strong>Toque nas paradas</strong> ou use A/D para se mover</li>
              <li><strong>Passe sobre passageiros</strong> para transportá-los</li>
              <li><strong>Organize sindicatos</strong> para defender sua rede</li>
              <li><strong>P</strong> para pausar, <strong>R</strong> para reiniciar</li>
            </ul>
          </div>

          <CampaignMark compact />

          <Button onClick={startRun} className={styles.playButton}>
            Começar Run
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === 'finished' && result) {
    return (
      <div className={styles.finishedContainer}>
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
          <DownloadCardButton
            cardContainerRef={cardRef}
            gameSlug={game.slug}
            resultId={result.resultId}
          />

          <Button onClick={restartRun} variant="secondary">
            Jogar de Novo
          </Button>

          <Link href="/explorar">
            <Button variant="secondary">Explorar Outros Jogos</Button>
          </Link>

          <Link href="/participar">
            <Button className={styles.campaignCTA}>
              Participar da Campanha
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ArcadeCanvasRuntime
      logic={passeLivreNacionalLogic}
      runId={runId}
      onRunEnd={handleRunEnd}
      onFirstInput={handleFirstInput}
      onPowerupCollect={handlePowerupCollect}
    />
  );
}
