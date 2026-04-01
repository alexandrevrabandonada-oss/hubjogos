'use client';

import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { Game, getGameBySlug } from '@/lib/games/catalog';

const GAME_SLUG = 'desobstrucao';

const ENTRY_COPY = {
  hook: 'Quebre barreiras pesadas e restaure o fluxo. Saneamento é ação direta.',
  shortPremise:
    'Um vertical slice de arcade focado em física tátil: sinta o peso do impacto comunitário na ponta dos dedos.',
  whyItMatters: {
    struggle:
      'A manutenção da infraestrutura pública frequentemente trava por descaso ou burocracia.',
    relevance:
      'Quando o poder público falha, a organização popular age. Saneamento e acesso à água exigem força coletiva.',
    invitation:
      'Experimente a mecânica tátil do rompedor: mire e libere força bruta contra os obstáculos.',
  },
  whatThisGameIs:
    'Physics arcade, focado em destruição controlada, leitura instantânea e resistência de infraestrutura.',
  shareText:
    'Desobstrução é a nova experiência flagship do Hub: física tátil sobre infraestrutura abandonada.',
  socialBlurb:
    'Restaure o fluxo. Física pesada e infraestrutura comunitária em foco total.',
};

export default function DesobstrucaoPage() {
  const game = getGameBySlug(GAME_SLUG);
  if (!game) {
    return null;
  }

  const relatedGames = ['mutirao-do-bairro', 'bairro-resiste', 'tarifa-zero-corredor']
    .map((slug) => getGameBySlug(slug))
    .filter((item): item is Game => !!item);

  return (
    <GameEntryPage
      game={{
        ...game,
        shortDescription: ENTRY_COPY.shortPremise,
      }}
      heroMedia={{
        type: 'video',
        src: '/showcase/desobstrucao/motion/official-clip.webp',
        alt: 'Clip oficial de gameplay gerado em tempo real no browser',
      }}
      secondaryCta={{
        label: 'Ver prova de conceito',
        href: '/arcade/desobstrucao',
      }}
      whyItMatters={ENTRY_COPY.whyItMatters}
      howItWorks={{
        mechanics: [
           ENTRY_COPY.whatThisGameIs,
          'Mire angulação e potência para o impacto ideal.',
          'Barreiras dinâmicas: o concreto parte fácil, mas o aço requer insistência.'
        ],
        controls: 'Mobile/Desktop: Deslize ou clique/arraste para calibrar força e ângulo do rompedor.',
        objectives:
          'Romper a barreira final de aço e restaurar completamente a cascata infraestrutural com o menor número de tentativas.',
        screenshots: [
           { src: '/showcase/desobstrucao/motion/official-clip.webp', alt: 'Gravação Oficial do Motor de Física' },
           { src: '/showcase/desobstrucao/screenshot-initial.png', alt: 'Estado Inicial - Acionamento da Ferramenta' },
           { src: '/showcase/desobstrucao/screenshot-aiming.png', alt: 'Mecânica Tátil - Mirando a Trajetória' },
           { src: '/showcase/desobstrucao/screenshot-concrete-impact.png', alt: 'Resistência Estrutural - Colisão com Concreto' },
        ],
      }}
      relatedGames={relatedGames}
      shareData={{
        title: 'Desobstrução - FLAGSHIP ARCADE',
        description: ENTRY_COPY.shareText,
        url: 'https://hubjogos.com.br/games/desobstrucao',
      }}
    />
  );
}
