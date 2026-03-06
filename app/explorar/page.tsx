'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { CTACluster } from '@/components/ui/CTACluster';
import { games } from '@/lib/games/catalog';
import { GameCard } from '@/components/hub/GameCard';
import styles from './page.module.css';

export default function ExplorarPage() {
  const liveGames = games.filter((g) => g.status === 'live');
  const betaGames = games.filter((g) => g.status === 'beta');
  const comingGames = games.filter((g) => g.status === 'coming');
  const realLiveGames = liveGames.filter((g) => g.runtimeState === 'real');
  const shellLiveGames = liveGames.filter((g) => g.runtimeState === 'shell');

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Catálogo vivo"
        title="Explore experiências por conflito político"
        description="Cada módulo responde a uma pergunta concreta da cidade: quem decide o orçamento, quem paga o custo do transporte, quem fica fora da política e por quê."
        actions={
          <CTACluster>
            <Link href="/play/voto-consciente" className={styles.ctaPrimary}>
              Jogar Voto Consciente
            </Link>
            <Link href="/participar" className={styles.ctaSecondary}>
              Sugerir nova pauta
            </Link>
          </CTACluster>
        }
      />

      {liveGames.length > 0 && (
        <Section
          eyebrow="Jogável agora"
          title="Experiências ao vivo"
          description={`Engines reais: ${realLiveGames.length} • shells: ${shellLiveGames.length}`}
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
