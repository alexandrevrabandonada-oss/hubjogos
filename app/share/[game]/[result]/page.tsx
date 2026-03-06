/**
 * Página de share de resultado
 * Renderiza o card visual do resultado com botão de export automático
 */

import type { Metadata } from 'next';
import { buildShareMetadata } from '@/lib/games/metadata';
import { SharePageClient } from './SharePageClient';
import styles from './share.module.css';

interface SharePageProps {
  params: Promise<{
    game: string;
    result: string;
  }>;
  searchParams: Promise<{
    title?: string;
    summary?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
  const { game: gameSlug, result } = await params;
  const { title = 'Resultado', summary = 'Completei uma experiência política no Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado' } = await searchParams;

  return buildShareMetadata({
    gameSlug,
    resultId: result,
    title,
    summary,
  });
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { game, result } = await params;
  const { title = 'Seu Resultado', summary = 'Você completou uma experiência do hub!' } = await searchParams;

  return (
    <div className={styles.container}>
      <SharePageClient
        game={game}
        result={result}
        title={title}
        summary={summary}
      />
    </div>
  );
}
