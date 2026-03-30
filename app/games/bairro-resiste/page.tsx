'use client';

import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { Game, getGameBySlug } from '@/lib/games/catalog';

const GAME_SLUG = 'bairro-resiste';

const ENTRY_COPY = {
  whyItMatters: {
    struggle:
      'Bairro Resiste transforma defesa territorial em ação direta: cada clique envia brigadas para segurar água, moradia, saúde e mobilidade antes que a crise se espalhe.',
    relevance:
      'O mapa deixa claro que colapso urbano não chega em partes isoladas. Quando um sistema cai, o bairro inteiro sente a cascata e a resposta precisa ser coletiva.',
    invitation:
      'Entre na central da brigada, leia o território vivo e descubra se você consegue manter o bairro respirando até o fim da crise.',
  },
  shareText:
    'Bairro Resiste leva RTS-lite de defesa territorial para um mapa vivo: brigadas, pressão em cadeia e resposta comunitária em loop curto.',
};

export default function BairroResistePage() {
  const game = getGameBySlug(GAME_SLUG);
  if (!game) {
    return null;
  }

  const relatedGames = ['tarifa-zero-corredor', 'cidade-real', 'cooperativa-na-pressao']
    .map((slug) => getGameBySlug(slug))
    .filter((item): item is Game => !!item);

  return (
    <GameEntryPage
      game={game}
      heroMedia={{
        type: 'video',
        src: '/showcase/bairro-resiste/motion/bairro-resiste-official-clip-01.webm',
        alt: 'Clip oficial de gameplay de Bairro Resiste',
      }}
      secondaryCta={{
        label: 'Jogar direto no RTS-lite',
        href: '/arcade/bairro-resiste',
      }}
      whyItMatters={ENTRY_COPY.whyItMatters}
      howItWorks={{
        mechanics: [
          'Quatro sistemas do bairro entram em pressão real ao mesmo tempo e exigem leitura territorial, não apenas reflexo puro.',
          'A brigada corta cascatas de crise setor por setor, com feedback de rádio, foco tático e impacto visível no mapa.',
          'O loop cabe em 90 segundos, mas a escalada em 3 fases entrega sensação de cerco, recuperação e colapso possível.',
        ],
        controls:
          'Desktop e mobile: toque ou clique em um setor para despachar a brigada. Escolha rápido, respeite o cooldown e impeça que a pressão transborde para os vizinhos.',
        objectives:
          'Manter o maior nível possível de controle territorial até o fim da contagem, proteger os sistemas críticos e fechar a rodada com o bairro ainda de pé.',
        screenshots: [
          { src: '/showcase/bairro-resiste/motion/gif-01-opening-pressure.gif', alt: 'GIF oficial - abertura do território sob pressão' },
          { src: '/showcase/bairro-resiste/motion/gif-02-brigade-dispatch.gif', alt: 'GIF oficial - despacho da brigada e estabilização' },
          { src: '/showcase/bairro-resiste/motion/gif-03-near-collapse-network.gif', alt: 'GIF oficial - rede territorial perto do colapso' },
          { src: '/showcase/bairro-resiste/screenshot-01-opening-board.png', alt: 'Bairro Resiste - abertura oficial' },
          { src: '/showcase/bairro-resiste/screenshot-02-mid-crisis.png', alt: 'Bairro Resiste - crise intermediária oficial' },
          { src: '/showcase/bairro-resiste/screenshot-03-brigade-response.png', alt: 'Bairro Resiste - resposta da brigada oficial' },
          { src: '/showcase/bairro-resiste/screenshot-04-near-collapse.png', alt: 'Bairro Resiste - pressão máxima oficial' },
          { src: '/showcase/bairro-resiste/screenshot-05-final-result.png', alt: 'Bairro Resiste - resultado final oficial' },
        ],
      }}
      relatedGames={relatedGames}
      shareData={{
        title: 'Bairro Resiste - RTS-lite Flagship do Hub',
        description: ENTRY_COPY.shareText,
        url: 'https://hubjogos.com.br/games/bairro-resiste',
      }}
    />
  );
}