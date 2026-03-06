/**
 * SharePageClient
 * Wrapper client-side para a share page.
 * Gerencia o ref do card container e a reentrada para o hub.
 */

'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { ResultCard } from '@/components/games/share/ResultCard';
import { DownloadCardButton } from '@/components/games/share/DownloadCardButton';
import { trackSharePageView, trackShareExportClick, trackNextGameClick, trackHubReturnClick } from '@/lib/analytics/track';
import { resolveExperimentVariantClient } from '@/lib/experiments/client';
import { games } from '@/lib/games/catalog';
import styles from './share.module.css';

interface SharePageClientProps {
  game: string;
  result: string;
  title: string;
  summary: string;
}

export function SharePageClient({ game, result, title, summary }: SharePageClientProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [reentryVariant, setReentryVariant] = useState<'soft-call' | 'strong-call'>('soft-call');

  useEffect(() => {
    const variant = resolveExperimentVariantClient('share-page-reentry-cta', 'soft-call');
    setReentryVariant(variant === 'strong-call' ? 'strong-call' : 'soft-call');

    const gameObj = games.find((g) => g.slug === game);
    if (gameObj) {
      trackSharePageView(gameObj, result).catch(console.error);
    }
  }, [game, result]);

  const handleExportClick = async () => {
    const gameObj = games.find((g) => g.slug === game);
    if (gameObj) {
      await trackShareExportClick(gameObj, result).catch(console.error);
    }
  };

  const handlePlayNowClick = async () => {
    const gameObj = games.find((g) => g.slug === game);
    if (gameObj) {
      await trackNextGameClick(gameObj, game).catch(console.error);
    }
  };

  const handleExploreClick = async () => {
    const gameObj = games.find((g) => g.slug === game);
    if (gameObj) {
      await trackHubReturnClick(gameObj, '/explorar').catch(console.error);
    }
  };

  return (
    <>
      <div className={styles.wrap}>
        <div ref={cardRef}>
          <ResultCard
            gameSlug={game}
            resultId={result}
            resultTitle={title}
            summary={summary}
          />
        </div>
      </div>

      <DownloadCardButton
        cardContainerRef={cardRef}
        gameSlug={game}
        resultId={result}
        onExportClick={handleExportClick}
      />

      <div className={styles.instructions}>
        <h3>Como compartilhar este resultado</h3>
        <ol>
          <li>
            <strong>Baixar imagem:</strong> use o botão acima para salvar o card como PNG.
          </li>
          <li>
            <strong>Link direto:</strong> copie a URL desta página e compartilhe nas redes.
          </li>
          <li>
            <strong>Contexto político curto:</strong> use o resumo para abrir a conversa com um problema concreto da cidade.
          </li>
        </ol>

        <div className={styles.reentryActions}>
          <Link href={`/play/${game}`} className={styles.reentryPrimary} onClick={handlePlayNowClick}>
            {reentryVariant === 'strong-call' ? 'Jogar agora esta experiência' : 'Jogar novamente'}
          </Link>
          <Link href="/explorar" className={styles.reentrySecondary} onClick={handleExploreClick}>
            Explorar outra experiência
          </Link>
        </div>

        <p className={styles.reentryHint}>
          Tempo estimado: 3-6 min. Tema: decisão política com consequência prática.
        </p>
      </div>
    </>
  );
}
