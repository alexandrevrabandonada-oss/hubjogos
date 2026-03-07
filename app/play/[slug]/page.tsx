import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GameRuntime } from '@/components/games/runtime/GameRuntime';
import { MetaChip } from '@/components/ui/MetaChip';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import {
  GAME_PACE_LABELS,
  GAME_SERIES_LABELS,
  TERRITORY_SCOPE_LABELS,
  getGameBySlug,
} from '@/lib/games/catalog';
import { buildPlayMetadata } from '@/lib/games/metadata';
import styles from './page.module.css';

interface PlayPageProps {
  params: {
    slug: string;
  };
}

export function generateMetadata({ params }: PlayPageProps): Metadata {
  return buildPlayMetadata(params.slug);
}

export default function PlayPage({ params }: PlayPageProps) {
  const game = getGameBySlug(params.slug);

  if (!game) {
    notFound();
  }

  const experienceHook: Record<string, string> = {
    quiz: 'Responda rápido, compare prioridades e veja seu perfil político.',
    branching_story: 'Escolha rotas em sequência e acompanhe a virada de cenário.',
    simulation: 'Teste distribuição de recursos e sinta os custos de cada decisão.',
    narrative: 'Acompanhe dilemas e veja como estrutura e escolha se cruzam.',
    map: 'Explore o território em camadas e descubra padrões ocultos.',
  };

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Sala de experiência"
        title={game.title}
        description={game.shortDescription}
        actions={
          <Link href="/explorar" className={styles.backLink}>
            ← Voltar ao catálogo
          </Link>
        }
      >
        <div className={styles.heroAside}>
          <div className={styles.heroIcon}>{game.icon}</div>
          <p>{experienceHook[game.kind]}</p>
        </div>
      </PageHero>

      <Section
        eyebrow="Contexto"
        title="Pauta, conflito e ação"
        description={game.description}
      >
        <div className={styles.metaWrap}>
          <MetaChip icon="⏱">{game.estimatedMinutes} min</MetaChip>
          <MetaChip icon="🏷">{game.theme}</MetaChip>
          <MetaChip icon="🧪">{game.status}</MetaChip>
          <MetaChip icon="🎮">{game.kind}</MetaChip>
          <MetaChip icon="⚡">{GAME_PACE_LABELS[game.pace]}</MetaChip>
          <MetaChip icon="🧱">{GAME_SERIES_LABELS[game.series]}</MetaChip>
          <MetaChip icon="🗺">{TERRITORY_SCOPE_LABELS[game.territoryScope]}</MetaChip>
          <MetaChip icon="⚙">{game.runtimeState}</MetaChip>
        </div>

        <div className={styles.layout}>
          <div className={styles.engineWrap}>
            <GameRuntime game={game} />
          </div>
          <aside className={styles.sidePanel}>
            <div className={styles.callout}>
              <h3>Relação entre jogo e pauta</h3>
              <p>
                O módulo usa escolhas para revelar conflito estrutural. O foco
                não é acertar respostas “certas”, mas explicitar qual projeto de
                cidade você prioriza.
              </p>
            </div>

            <div className={styles.callout}>
              <h3>Próxima ação</h3>
              <p>
                Termine a rodada, teste uma rota diferente e compare qual visão
                de cidade aparece em cada resultado.
              </p>
              <p>
                Esta experiência integra o Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado.
              </p>
              <Link href="/participar" className={styles.quizLink}>
                Entrar em ação →
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      <Section
        eyebrow="Mais módulos"
        title="Continue explorando"
        description="Cada experiência aborda uma dimensão diferente da disputa por cidade."
      >
        <div className={styles.relatedBox}>
          <p>Veja outros jogos no catálogo e compare seus resultados por tema.</p>
          <Link href="/explorar" className={styles.quizLink}>
            Explorar catálogo completo →
          </Link>
        </div>
      </Section>
    </div>
  );
}
