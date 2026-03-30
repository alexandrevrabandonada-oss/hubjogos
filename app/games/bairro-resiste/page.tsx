'use client';

import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { Game, getGameBySlug } from '@/lib/games/catalog';

const GAME_SLUG = 'bairro-resiste';

const ENTRY_COPY = {
  shortPremise:
    'RTS-lite de defesa territorial em 90 segundos: despache brigadas, corte cascatas e salve o bairro antes do colapso.',
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
      game={{
        ...game,
        shortDescription: ENTRY_COPY.shortPremise,
      }}
      heroMedia={{
        type: 'video',
        src: '/showcase/bairro-resiste/motion/bairro-resiste-official-clip-01.webm',
        alt: 'Clip oficial de gameplay de Bairro Resiste',
      }}
      trustIndicators={[
        { icon: '🧭', label: 'Formato', value: 'RTS-lite territorial' },
        { icon: '⏱️', label: 'Sessão', value: '90s reais' },
        { icon: '⚡', label: 'Fantasia', value: 'Pressão + resgate' },
        { icon: '🎬', label: 'Captação', value: 'Showpiece runtime real' },
        { icon: '📱', label: 'Suporte', value: 'Mobile + Desktop' },
      ]}
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
          { src: '/showcase/bairro-resiste/motion/gif-01-pressure-spread.gif', alt: 'GIF oficial - spread de pressão territorial' },
          { src: '/showcase/bairro-resiste/motion/gif-02-brigade-dispatch-save.gif', alt: 'GIF oficial - despacho da brigada e salvamento' },
          { src: '/showcase/bairro-resiste/motion/gif-03-critical-hero.gif', alt: 'GIF oficial - hero moment crítico' },
          { src: '/showcase/bairro-resiste/screenshot-01-calm-board.png', alt: 'Bairro Resiste - calm board oficial' },
          { src: '/showcase/bairro-resiste/screenshot-02-mid-pressure.png', alt: 'Bairro Resiste - pressão intermediária oficial' },
          { src: '/showcase/bairro-resiste/screenshot-03-critical-state.png', alt: 'Bairro Resiste - estado crítico oficial' },
          { src: '/showcase/bairro-resiste/screenshot-04-save-recovery.png', alt: 'Bairro Resiste - save/recovery oficial' },
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