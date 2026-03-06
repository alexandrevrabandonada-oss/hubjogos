'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { CTACluster } from '@/components/ui/CTACluster';
import { games } from '@/lib/games/catalog';
import { GameCard } from '@/components/hub/GameCard';
import { BetaBanner } from '@/components/ui/BetaBanner';
import styles from './page.module.css';

export default function ExplorarPage() {
  const liveGames = games.filter((g) => g.status === 'live');
  const betaGames = games.filter((g) => g.status === 'beta');
  const comingGames = games.filter((g) => g.status === 'coming');
  const realLiveGames = liveGames.filter((g) => g.runtimeState === 'real');
  const shellLiveGames = liveGames.filter((g) => g.runtimeState === 'shell');

  // Count by engine type
  const engineCounts = realLiveGames.reduce((acc, game) => {
    acc[game.kind] = (acc[game.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const engineTypeLabels: Record<string, string> = {
    quiz: 'Questionários',
    branching_story: 'Narrativas',
    simulation: 'Simulações',
    map: 'Mapas',
    narrative: 'Narrativas',
  };

  const engineTypeDescriptions: Record<string, string> = {
    quiz: 'Compare prioridades políticas através de perguntas direcionadas',
    branching_story: 'Explore consequências estruturais de escolhas encadeadas',
    simulation: 'Teste cenários e observe custos invisíveis de decisões',
    map: 'Descubra padrões territoriais através de exploração espacial',
  };

  return (
    <div className={styles.page}>
      <BetaBanner />
      <PageHero
        eyebrow="Catálogo vivo"
        title="Explore experiências por conflito político"
        description="Cada módulo responde a uma pergunta concreta da cidade: quem decide o orçamento, quem paga o custo do transporte, quem fica fora da política e por quê."
        actions={
          <CTACluster>
            <Link href="/play/voto-consciente" className={styles.ctaPrimary}>
              Jogar agora: Voto Consciente
            </Link>
            <Link href="/participar" className={styles.ctaSecondary}>
              Sugerir nova pauta
            </Link>
          </CTACluster>
        }
      />

      {realLiveGames.length > 0 && (
        <Section
          eyebrow="Formatos disponíveis"
          title="Diversidade de mecânicas"
          description={
            Object.entries(engineCounts)
              .map(([kind, count]) => `${count} ${engineTypeLabels[kind] || kind}`)
              .join(' • ')
          }
        >
          <div className={styles.engineTypes}>
            {Object.entries(engineCounts).map(([kind, count]) => (
              <div key={kind} className={styles.engineType}>
                <h4>{engineTypeLabels[kind] || kind}</h4>
                <p>{engineTypeDescriptions[kind] || ''}</p>
                <span className={styles.engineCount}>{count} disponível{count !== 1 ? 'is' : ''}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {liveGames.length > 0 && (
        <Section
          eyebrow="Jogável agora"
          title="Experiências ao vivo"
          description={`${realLiveGames.length} totalmente implementadas • ${shellLiveGames.length} com dramaturgia pronta`}
        >
          <div className={styles.grid}>
            {liveGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </Section>
      )}

      {betaGames.length > 0 && (
        <Section
          eyebrow="Campo de teste"
          title="Módulos em refinamento"
          description="Experiências quase prontas, com ajustes de ritmo, dificuldade e legibilidade política."
        >
          <div className={styles.grid}>
            {betaGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </Section>
      )}

      {comingGames.length > 0 && (
        <Section
          eyebrow="Próxima leva"
          title="Módulos em desenvolvimento"
          description="Pautas já mapeadas, com dramaturgia e mecânicas em construção."
        >
          <div className={styles.grid}>
            {comingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </Section>
      )}

      {games.length === 0 && (
        <Section>
          <EmptyState
            title="Catálogo temporariamente vazio"
            description="Estamos preparando novas experiências de pauta."
          />
        </Section>
      )}
    </div>
  );
}
