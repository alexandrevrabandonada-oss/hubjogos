'use client';

import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { getGameBySlug } from '@/lib/games/catalog';

const GAME_SLUG = 'cidade-real';

const ENTRY_COPY = {
  whyItMatters: {
    struggle:
      'Cidade Real transforma orçamento, manutenção e disputa por serviços em um tabuleiro vivo: a cidade reage, degrada e se reorganiza diante de cada intervenção.',
    relevance:
      'Quando um distrito afunda, outro sente o efeito. A simulação expõe o custo de governar por remendo e o peso de investir com prioridade pública.',
    invitation:
      'Escolha onde intervir, acompanhe a resposta do mapa e veja se sua cidade sai mais viva ou mais partida do ciclo de crise.',
  },
  shareText:
    'Cidade Real leva a disputa por orçamento e serviços para um mapa vivo: crise, intervenção e consequência visível distrito por distrito.',
};

export default function CidadeRealPage() {
  const game = getGameBySlug(GAME_SLUG);
  if (!game) {
    return null;
  }

  return (
    <GameEntryPage
      game={game}
      heroMedia={{
        type: 'video',
        src: '/showcase/cidade-real/motion/cidade-real-official-clip-01.webm',
        alt: 'Clip oficial de gameplay de Cidade Real',
      }}
      secondaryCta={{
        label: 'Jogar direto na simulação',
        href: '/play/cidade-real',
      }}
      whyItMatters={ENTRY_COPY.whyItMatters}
      howItWorks={{
        mechanics: [
          'Cidade viva em 4 distritos: cada área reage a crise, pressão e intervenção com mudanças visíveis.',
          'Projetos táticos disparam recuperação localizada, alteram confiança pública e reorganizam o mapa em tempo real.',
          'A rodada avança por ciclos curtos de crise urbana, exigindo leitura territorial em vez de painel abstrato.',
        ],
        controls:
          'Desktop e mobile: toque em um distrito para focar a leitura, escolha uma intervenção no gabinete e execute a decisão para avançar o ciclo.',
        objectives:
          'Sustentar o maior nível possível de integridade urbana média, impedir colapso dos distritos críticos e fechar o ciclo com uma cidade mais resiliente.',
        screenshots: [
          { src: '/showcase/cidade-real/motion/gif-01-district-focus.gif', alt: 'GIF oficial - foco de distrito e leitura de mapa' },
          { src: '/showcase/cidade-real/motion/gif-02-crisis-escalation.gif', alt: 'GIF oficial - escalada de crise urbana' },
          { src: '/showcase/cidade-real/motion/gif-03-intervention-impact.gif', alt: 'GIF oficial - intervenção e recuperação' },
          { src: '/showcase/cidade-real/screenshot-01-opening-city.png', alt: 'Cidade Real - estado inicial oficial' },
          { src: '/showcase/cidade-real/screenshot-02-mid-crisis.png', alt: 'Cidade Real - estado de crise média oficial' },
          { src: '/showcase/cidade-real/screenshot-03-near-collapse.png', alt: 'Cidade Real - pressão máxima oficial' },
          { src: '/showcase/cidade-real/screenshot-04-intervention-recovery.png', alt: 'Cidade Real - recuperação oficial' },
          { src: '/showcase/cidade-real/screenshot-05-final-result.png', alt: 'Cidade Real - resultado final oficial' },
        ],
      }}
      shareData={{
        title: 'Cidade Real - Simulação Flagship do Hub',
        description: ENTRY_COPY.shareText,
        url: 'https://hubjogos.com.br/games/cidade-real',
      }}
    />
  );
}