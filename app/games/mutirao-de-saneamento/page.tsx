'use client';

// Mutirão de Saneamento - Entry Page
// T74 — Vertical Slice with T70 Entry Page

import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { Game } from '@/lib/games/catalog';

// Game metadata
const MUTIRAO_GAME: Game = {
  slug: 'mutirao-de-saneamento',
  title: 'Mutirão de Saneamento',
  shortDescription: 'Mobilize a comunidade para levar saneamento básico a um bairro abandonado pelo poder público.',
  fullDescription: 'Na Vila Esperança, na Baixada Fluminense, 500 famílias vivem sem esgoto tratado e com água encanada irregular. A prefeitura promete desde 2018. Neste jogo, você atua como organizador comunitário, mobilizando vizinhos, alocando recursos escassos e construindo soluções coletivas. Experimente o poder — e o peso — da organização popular em busca de direitos básicos.',
  genre: 'simulation',
  deviceSupport: ['mobile', 'desktop'],
  estimatedMinutes: 5,
  politicalThemes: ['organizacao-popular', 'cuidado', 'moradia', 'servicos-publicos'],
  territoryScope: 'baixada',
  pace: 'session',
  series: 'territorios-em-luta',
  icon: '🚰',
  coverImage: '/images/games/mutirao-saneamento/cover.jpg',
  gallery: [
    '/images/games/mutirao-saneamento/screenshot-1.jpg',
    '/images/games/mutirao-saneamento/screenshot-2.jpg',
    '/images/games/mutirao-saneamento/screenshot-3.jpg',
  ],
  playUrl: '/games/mutirao-de-saneamento',
};

// Entry page configuration
const ENTRY_CONFIG = {
  hero: {
    mediaType: 'image' as const,
    accentColor: '#228B22',
  },
  trustRow: {
    showPlayCount: true,
    showCompletionRate: true,
  },
  whyItMatters: {
    enabled: true,
    struggle: 'Saneamento é saúde, dignidade e direito. Milhões de brasileiros vivem sem esgoto tratado ou água potável.',
    relevance: 'O poder público abandona periferias enquanto investe em áreas nobres. A organização comunitária é resposta.',
    invitation: 'Experimente coordenar um mutirão de cuidado. Sinta o peso da escassez e a força do coletivo.',
  },
  genreCues: {
    enabled: true,
    onboarding: [
      'Observe as condições do bairro',
      'Converse com moradores para entender necessidades',
      'Mobilize voluntários para ações coletivas',
      'Alloque recursos de forma estratégica',
      'Responda a crises emergentes',
    ],
  },
  relatedGames: [
    {
      slug: 'tarifa-zero-corredor',
      reason: 'Mesmo território: Baixada Fluminense',
    },
    {
      slug: 'assembleia-territorial',
      reason: 'Tema similar: organização popular',
    },
  ],
  share: {
    ogTitle: 'Mutirão de Saneamento — Organização Popular em Ação',
    ogDescription: 'Mobilize a comunidade para levar saneamento básico a um bairro abandonado. Cuidado coletivo é resistência!',
  },
};

// Page component
export default function MutiraoEntryPage() {
  return (
    <GameEntryPage
      game={MUTIRAO_GAME}
      heroMediaType={ENTRY_CONFIG.hero.mediaType}
      accentColor={ENTRY_CONFIG.hero.accentColor}
      whyItMattersStruggle={ENTRY_CONFIG.whyItMatters.struggle}
      whyItMattersRelevance={ENTRY_CONFIG.whyItMatters.relevance}
      whyItMattersInvitation={ENTRY_CONFIG.whyItMatters.invitation}
      genreOnboarding={ENTRY_CONFIG.genreCues.onboarding}
      relatedGames={ENTRY_CONFIG.relatedGames}
      ogTitle={ENTRY_CONFIG.share.ogTitle}
      ogDescription={ENTRY_CONFIG.share.ogDescription}
    />
  );
}
