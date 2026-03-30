'use client';

import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { Game, getGameBySlug } from '@/lib/games/catalog';

const GAME_SLUG = 'tarifa-zero-corredor';

const ENTRY_COPY = {
  hook: 'Corra, desvie e mantenha o corredor do povo aberto.',
  shortPremise:
    'Um platformer arcade de speedrun territorial: cada run e curta, intensa e feita para rejogo imediato.',
  whyItMatters: {
    struggle:
      'Mobilidade popular e disputa de espaco publico aparecem aqui como acao direta: abrir corredor e sustentar fluxo.',
    relevance:
      'Quando o corredor fecha, o tempo da cidade trava. Em segundos, a run traduz pressao, escolha e resposta coletiva.',
    invitation:
      'Entre em uma rodada curta, veja seu resultado e compartilhe o melhor momento de corrida.',
  },
  whatThisGameIs:
    'Arcade platformer de corrida territorial com foco em leitura instantanea e screenshot power.',
  shareText:
    'Corredor Livre e o flagship do Hub: speedrun territorial em corrida curta. Joguei e recomendo.',
  socialBlurb:
    'Corredor Livre abre a vitrine publica do Hub com runs curtas, forte legibilidade visual e resultado compartilhavel.',
};

export default function CorredorLivrePage() {
  const game = getGameBySlug(GAME_SLUG);
  if (!game) {
    return null;
  }

  const relatedGames = ['mutirao-do-bairro', 'bairro-resiste', 'cooperativa-na-pressao']
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
        src: '/showcase/corredor-livre/motion/corredor-livre-official-clip-01.webm',
        alt: 'Clip oficial de gameplay de Corredor Livre',
      }}
      secondaryCta={{
        label: 'Jogar direto no arcade',
        href: '/games/corredor-livre/play',
      }}
      whyItMatters={ENTRY_COPY.whyItMatters}
      howItWorks={{
        mechanics: [
          ENTRY_COPY.whatThisGameIs,
          'Runs de 30s-3min com foco em fluxo, desvio e timing.',
          'Leitura rapida de estado para decidir quando acelerar ou segurar a linha.',
        ],
        controls: 'Desktop: setas ou WASD para mover e pular. Mobile: controles na tela com foco em resposta rapida.',
        objectives:
          'Alcancar a maior corrida consistente possivel, manter ritmo sob pressao e converter tentativa em resultado compartilhavel.',
        screenshots: [
          { src: '/showcase/corredor-livre/motion/gif-01-opening-run.gif', alt: 'GIF oficial - opening run' },
          { src: '/showcase/corredor-livre/motion/gif-02-wall-kick-vertical.gif', alt: 'GIF oficial - wall-kick e vertical climb' },
          { src: '/showcase/corredor-livre/motion/gif-03-fragile-hazard-pass.gif', alt: 'GIF oficial - fragile hazard pass' },
          { src: '/showcase/corredor-livre/screenshot-01-final-desktop.png', alt: 'Corredor Livre em desktop - frame final oficial' },
          { src: '/showcase/corredor-livre/screenshot-02-final-mobile.png', alt: 'Corredor Livre em mobile - frame final oficial' },
          { src: '/showcase/corredor-livre/screenshot-03-run-desktop.png', alt: 'Corredor Livre em desktop - run oficial' },
        ],
      }}
      relatedGames={relatedGames}
      shareData={{
        title: 'Corredor Livre - Flagship do Hub',
        description: ENTRY_COPY.shareText,
        url: 'https://hubjogos.com.br/games/corredor-livre',
      }}
    />
  );
}
