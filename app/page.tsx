'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              ✨ Transforme Pautas em Experiências
            </div>

            <h1 className={styles.heroTitle}>
              Cada escolha<span className={styles.highlight}>é política</span>
            </h1>

            <p className={styles.heroDescription}>
              No <strong>Hub de Jogos da Pré-Campanha</strong>, você não só
              aprende sobre pautas reais—você vive, escolhe e descobre. Nossas
              experiências interativas transformam dilemas políticos em
              mecânicas lúdicas, educativas e compartilháveis.
            </p>

            <div className={styles.heroCTA}>
              <Link href="/explorar" className={styles.ctaPrimary}>
                Comece a Explorar
              </Link>
              <Link href="/sobre" className={styles.ctaSecondary}>
                Saiba Mais
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualBox}>
              🎮 🏙️ 🗳️ ⚖️ 🧩
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Experiências em Destaque</h2>

          <div className={styles.featuredGrid}>
            {/* Feature 1 */}
            <div className={styles.featureBox} style={{'--color': '#FFB81C'} as any}>
              <div className={styles.featureIcon}>🗳️</div>
              <h3>Voto Consciente</h3>
              <p>
                Descubra suas posições políticas reais respondendo sobre
                pautas concretas.
              </p>
              <span className={styles.status}>🔴 Ao Vivo</span>
            </div>

            {/* Feature 2 */}
            <div className={styles.featureBox} style={{'--color': '#FF1493'} as any}>
              <div className={styles.featureIcon}>⚖️</div>
              <h3>Escolhas Impossíveis</h3>
              <p>
                Diante de dilemas reais do trabalho urbano precário, qual é
                sua escolha?
              </p>
              <span className={styles.status}>⭕ Em Breve</span>
            </div>

            {/* Feature 3 */}
            <div className={styles.featureBox} style={{'--color': '#00D9FF'} as any}>
              <div className={styles.featureIcon}>🏙️</div>
              <h3>Cidade Real</h3>
              <p>
                Simule um orçamento municipal real. Como você distribuiria
                recursos limitados?
              </p>
              <span className={styles.status}>🟡 Beta</span>
            </div>
          </div>

          <div className={styles.featuredCTA}>
            <Link href="/explorar" className={styles.ctaPrimary}>
              Ver Todas as Experiências
            </Link>
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className={styles.whyMatters}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Por Que Isso Importa</h2>

          <div className={styles.pillarsGrid}>
            <div className={styles.pillar}>
              <h4>Educação Política</h4>
              <p>
                Pautas reais em mecânicas lúdicas. Você não aprende sobre
                política—você vive dilemas políticos.
              </p>
            </div>

            <div className={styles.pillar}>
              <h4>Consciência + Ação</h4>
              <p>
                Cada experiência é orientada para que você saia não só
                consciente, mas pronto pra agir.
              </p>
            </div>

            <div className={styles.pillar}>
              <h4>Compartilhável</h4>
              <p>
                Suas escolhas, seus resultados. Cada jogo gera um resultado
                único e compartilhável nas redes.
              </p>
            </div>

            <div className={styles.pillar}>
              <h4>Urbano & Contemporâneo</h4>
              <p>
                Sem templates genéricos. Design inspirado em universos reais
                de resistência e abandono urbano.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.finalCTA}>
        <div className={styles.container}>
          <h2>Pronto pra começar?</h2>
          <p>A próxima experiência aguarda sua escolha.</p>
          <Link href="/explorar" className={styles.ctaPrimary}>
            Explorar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4>Hub de Jogos</h4>
              <p>Transforme pautas em experiências. Escolha. Aprenda. Aja.</p>
            </div>

            <div className={styles.footerSection}>
              <h4>Explore</h4>
              <ul>
                <li>
                  <Link href="/explorar">Todas as Experiências</Link>
                </li>
                <li>
                  <Link href="/sobre">Sobre o Projeto</Link>
                </li>
                <li>
                  <Link href="/participar">Participar</Link>
                </li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Social</h4>
              <p>Em desenvolvimento. Compartilhe suas experiências.</p>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>
              © 2026 Hub de Jogos da Pré-Campanha. Código aberto em{' '}
              <a href="https://github.com/alexandrevrabandonada-oss/hubjogos">
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
