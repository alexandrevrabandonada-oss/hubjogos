'use client';

// Mutirão de Saneamento - Entry Page
// T74 — Vertical Slice with T70 Entry Page

import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { Game, getGameBySlug } from '@/lib/games/catalog';

// Game metadata
export const MUTIRAO_GAME: Game = {
  id: 'mutirao-de-saneamento',
  slug: 'mutirao-de-saneamento',
  title: 'Mutirão de Saneamento',
  shortDescription: 'Mobilize a comunidade para levar saneamento básico a um bairro.',
  description: 'Na Vila Esperança, na Baixada Fluminense, 500 famílias vivem sem esgoto tratado e com água encanada irregular. A prefeitura promete desde 2018. Neste jogo, você atua como organizador comunitário, mobilizando vizinhos, alocando recursos escassos e construindo soluções coletivas. Experimente o poder — e o peso — da organização popular em busca de direitos básicos.',
  genre: 'simulation',
  theme: 'city',
  status: 'beta',
  runtimeState: 'real',
  estimatedMinutes: 5,
  duration: '5 min',
  participants: 1,
  difficulty: 'medium',
  tags: ['simulação', 'saneamento', 'baixada', 'organização'],
  cta: 'Mobilizar',
  color: '#228B22',
  kind: 'simulation',
  line: 'organizacao-popular',
  pace: 'session',
  territoryScope: 'baixada',
  territories: ['baixada'],
  politicalThemes: ['organizacao-popular', 'cuidado', 'moradia', 'servicos-publicos'],
  series: 'territorios-em-luta',
  politicalAxis: 'poder-popular',
  collectiveSolutionType: 'ajuda-mutua',
  commonVsMarket: 'comum',
  campaignFrame: 'comunidade-em-luta',
  season: 's1-verao-26',
  campaignRole: 'Experimentar o peso da escassez e a força do coletivo.',
  funRole: 'aprofundamento',
  deviceSupport: ['mobile', 'desktop'],
  priorityScore: 70,
  icon: '🚰',
  cover: '/images/games/mutirao-saneamento/cover.jpg',
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
  const relatedGames = ENTRY_CONFIG.relatedGames
    .map(rg => getGameBySlug(rg.slug))
    .filter((g): g is Game => !!g);

  return (
    <GameEntryPage
      game={MUTIRAO_GAME}
      heroMedia={{
        type: ENTRY_CONFIG.hero.mediaType,
        src: MUTIRAO_GAME.cover,
      }}
      whyItMatters={ENTRY_CONFIG.whyItMatters}
      relatedGames={relatedGames}
      shareData={{
        title: ENTRY_CONFIG.share.ogTitle,
        description: ENTRY_CONFIG.share.ogDescription,
        url: `https://hubjogos.com.br/games/${MUTIRAO_GAME.slug}`,
      }}
    />
  );
}
