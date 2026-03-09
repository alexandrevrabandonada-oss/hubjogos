import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { TarifaZeroArcadeGame } from '@/components/games/arcade/TarifaZeroArcadeGame';
import { PasseLivreArcadeGame } from '@/components/games/arcade/PasseLivreArcadeGame';
import { MutiraoDoBairroArcadeGame } from '@/components/games/arcade/MutiraoDoBairroArcadeGame';
import { CooperativaNaPressaoArcadeGame } from '@/components/games/arcade/CooperativaNaPressaoArcadeGame';
import { getGameBySlug } from '@/lib/games/catalog';
import styles from './page.module.css';

interface ArcadePageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    preview?: string;
    fixture?: string;
  };
}

export function generateMetadata({ params }: ArcadePageProps): Metadata {
  const game = getGameBySlug(params.slug);

  if (!game || game.kind !== 'arcade') {
    return {
      title: 'Arcade nao encontrado',
      description: 'A experiencia arcade solicitada nao existe no catalogo.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub-jogos.exemplo.com';
  const url = `${baseUrl}/arcade/${game.slug}`;

  return {
    title: `${game.title} - Linha Arcade da Pre-Campanha`,
    description: game.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: game.title,
      description: game.shortDescription,
      url,
      type: 'website',
    },
  };
}

export default function ArcadeGamePage({ params, searchParams }: ArcadePageProps) {
  const game = getGameBySlug(params.slug);
  const previewFinal =
    searchParams?.preview === 'final' ||
    searchParams?.fixture === 'final-premium' ||
    searchParams?.fixture === 'final-mutirao' ||
    searchParams?.fixture === 'final-cooperativa';

  if (!game || game.kind !== 'arcade') {
    notFound();
  }

  let gameComponent = null;

  if (game.slug === 'tarifa-zero-corredor') {
    gameComponent = <TarifaZeroArcadeGame game={game} previewFinal={previewFinal} />;
  } else if (game.slug === 'passe-livre-nacional') {
    gameComponent = <PasseLivreArcadeGame game={game} />;
  } else if (game.slug === 'mutirao-do-bairro') {
    gameComponent = <MutiraoDoBairroArcadeGame game={game} previewFinal={previewFinal} />;
  } else if (game.slug === 'cooperativa-na-pressao') {
    gameComponent = <CooperativaNaPressaoArcadeGame game={game} previewFinal={previewFinal} />;
  }

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Linha Arcade"
        title={game.title}
        description={game.shortDescription}
        actions={
          <Link href="/explorar" className={styles.backLink}>
            ← Voltar ao catálogo
          </Link>
        }
      >
        <p className={styles.heroCopy}>
          Jogo de verdade em loop curto: aprender em segundos, rejogar na hora e compartilhar resultado.
        </p>
      </PageHero>

      <Section
        eyebrow="Vertical slice"
        title={game.title}
        description={game.description}
      >
        {gameComponent}
      </Section>
    </div>
  );
}
