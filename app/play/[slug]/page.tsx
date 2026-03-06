'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameBySlug } from '@/lib/games/catalog';
import styles from './page.module.css';

interface PlayPageProps {
  params: {
    slug: string;
  };
}

export default function PlayPage({ params }: PlayPageProps) {
  const game = getGameBySlug(params.slug);

  if (!game) {
    notFound();
  }

  const statusLabels = {
    live: '🔴 Ao Vivo',
    beta: '🟡 Beta',
    coming: '⭕ Em Breve',
  };

  const difficultyColor = {
    easy: '#00FF88',
    medium: '#FFB81C',
    hard: '#FF3860',
  };

  return (
    <div className={styles.page}>
      {/* Header with Game Info */}
      <section
        className={styles.header}
        style={{'--accent-color': game.color} as any}
      >
        <div className={styles.container}>
          <Link href="/explorar" className={styles.backLink}>
            ← Voltar a Explorar
          </Link>

          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>{game.icon}</div>
            <h1>{game.title}</h1>
            <p className={styles.status}>{statusLabels[game.status]}</p>
          </div>
        </div>
      </section>

      {/* Game Details */}
      <section className={styles.details}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Main Content */}
            <div className={styles.main}>
              <h2>Sobre Esta Experiência</h2>
              <p className={styles.description}>{game.description}</p>

              {/* Meta Info */}
              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Duração</span>
                  <span>⏱️ {game.duration}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Dificuldade</span>
                  <span
                    style={{
                      color:
                        difficultyColor[
                          game.difficulty as keyof typeof difficultyColor
                        ],
                    }}
                  >
                    {game.difficulty === 'easy' && '⚪ Fácil'}
                    {game.difficulty === 'medium' && '🟡 Médio'}
                    {game.difficulty === 'hard' && '🔴 Difícil'}
                  </span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Tema</span>
                  <span>{game.theme}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Tags</span>
                  <div className={styles.tags}>
                    {game.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Placeholder */}
              <div className={styles.gamePlaceholder}>
                <p>
                  🎮 <strong>Engine do Jogo</strong>
                </p>
                <p>
                  A experiência interativa será implementada nos próximos
                  tijolos.
                </p>
                <p>
                  Este é o espaço onde você jogará, fará escolhas e gerará um
                  resultado único.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {/* CTA */}
              {game.status === 'live' ? (
                <div className={styles.ctaCard}>
                  <h3>Pronto para começar?</h3>
                  <p>Faça suas escolhas e descubra o resultado.</p>
                  <button
                    className={styles.ctaButton}
                    style={{'--accent-color': game.color} as any}
                  >
                    {game.cta}
                  </button>
                </div>
              ) : game.status === 'beta' ? (
                <div className={styles.ctaCard}>
                  <h3>Versão Beta</h3>
                  <p>Esta experiência está em testes. Bem-vindo ao time!</p>
                  <button
                    className={styles.ctaButton}
                    style={{'--accent-color': game.color} as any}
                  >
                    {game.cta}
                  </button>
                </div>
              ) : (
                <div className={styles.ctaCard}>
                  <h3>Em Desenvolvimento</h3>
                  <p>Volte em breve para esta experiência!</p>
                  <button className={styles.ctaButtonDisabled} disabled>
                    Em Breve
                  </button>
                </div>
              )}

              {/* Share */}
              <div className={styles.shareCard}>
                <h4>Compartilhar</h4>
                <p>Em breve você poderá compartilhar seus resultados!</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Games */}
      <section className={styles.related}>
        <div className={styles.container}>
          <h2>Outras Experiências</h2>
          <Link href="/explorar" className={styles.relatedLink}>
            Explorar Catálogo Completo →
          </Link>
        </div>
      </section>
    </div>
  );
}
