'use client';

import { games } from '@/lib/games/catalog';
import { GameCard } from '@/components/hub/GameCard';
import styles from './page.module.css';

export default function ExplorarPage() {
  const liveGames = games.filter((g) => g.status === 'live');
  const betaGames = games.filter((g) => g.status === 'beta');
  const comingGames = games.filter((g) => g.status === 'coming');

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1>Explore Experiências</h1>
          <p>
            Cada jogo é uma porta de entrada para compreender pautas políticas
            reais através de mecânicas lúdicas, educativas e compartilháveis.
          </p>
        </div>
      </section>

      {/* Live Games */}
      {liveGames.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>🔴 Ao Vivo Agora</h2>
            <div className={styles.grid}>
              {liveGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Beta Games */}
      {betaGames.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>🟡 Em Teste (Beta)</h2>
            <div className={styles.grid}>
              {betaGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {comingGames.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>⭕ Em Desenvolvimento</h2>
            <div className={styles.grid}>
              {comingGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {games.length === 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.empty}>
              <p>Nenhuma experiência disponível ainda.</p>
              <p>Volte em breve para novidades! 🎮</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
