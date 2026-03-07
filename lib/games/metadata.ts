import type { Metadata } from 'next';
import { getGameBySlug } from '@/lib/games/catalog';
import { resolveDefaultResultSummary, resolveGameResultById } from '@/lib/games/results';

const FALLBACK_SITE_URL = 'https://hub-jogos.exemplo.com';

const engineLabels: Record<string, string> = {
  quiz: 'Questionário político',
  branching_story: 'Narrativa de escolhas',
  simulation: 'Simulação de decisões',
  map: 'Exploração territorial',
  narrative: 'Narrativa interativa',
  arcade: 'Arcade de ação política',
};

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
}

export function getGameOgImageUrl(slug: string) {
  return `${getSiteUrl()}/api/og/game/${slug}`;
}

export function getResultOgImageUrl(gameSlug: string, resultId: string, title?: string, summary?: string) {
  const params = new URLSearchParams();
  if (title) {
    params.set('title', title);
  }
  if (summary) {
    params.set('summary', summary);
  }
  const qs = params.toString();
  return `${getSiteUrl()}/api/og/result/${gameSlug}/${resultId}${qs ? `?${qs}` : ''}`;
}

export function buildPlayMetadata(slug: string): Metadata {
  const game = getGameBySlug(slug);

  if (!game) {
    return {
      title: 'Jogo não encontrado',
      description: 'Este jogo não existe no catálogo.',
    };
  }

  const description = `${engineLabels[game.kind]}: ${game.shortDescription}`;
  const imageUrl = getGameOgImageUrl(slug);
  const url = `${getSiteUrl()}/play/${slug}`;

  return {
    title: `${game.title} - Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado`,
    description: game.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: game.title,
      description,
      type: 'website',
      url,
      siteName: 'Hub de Jogos da Pré-Campanha',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${game.title} - Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: game.title,
      description,
      images: [imageUrl],
    },
  };
}

interface ShareMetadataInput {
  gameSlug: string;
  resultId: string;
  title?: string;
  summary?: string;
}

export function buildShareMetadata({
  gameSlug,
  resultId,
  title,
  summary,
}: ShareMetadataInput): Metadata {
  const game = getGameBySlug(gameSlug);
  const fallbackResult = resolveGameResultById(gameSlug, resultId);

  const resolvedTitle = title || fallbackResult?.title || 'Resultado';
  const resolvedSummary =
    summary || fallbackResult?.summary || resolveDefaultResultSummary(gameSlug);

  const gameTitle = game?.title || 'Hub de Jogos';
  const fullTitle = `${resolvedTitle} - ${gameTitle}`;
  const imageUrl = getResultOgImageUrl(gameSlug, resultId, resolvedTitle, resolvedSummary);

  return {
    title: fullTitle,
    description: resolvedSummary,
    openGraph: {
      title: fullTitle,
      description: resolvedSummary,
      type: 'website',
      url: `${getSiteUrl()}/share/${gameSlug}/${resultId}`,
      siteName: 'Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${resolvedTitle} - ${gameTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: resolvedSummary,
      images: [imageUrl],
    },
  };
}
