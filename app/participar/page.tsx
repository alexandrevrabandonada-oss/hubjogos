'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function ParticiparPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1>Participar do Projeto</h1>
          <p>O Hub de Jogos é código aberto e precisa da sua contribuição.</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Code */}
            <div className={styles.card}>
              <div className={styles.icon}>💻</div>
              <h3>Contribuir com Código</h3>
              <p>
                Quer desenvolver? O projeto está em Next.js + React + TypeScript.
                Temos issues marcadas para iniciantes e veteranos.
              </p>
              <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos">
                GitHub Repository →
              </Link>
            </div>

            {/* Design */}
            <div className={styles.card}>
              <div className={styles.icon}>🎨</div>
              <h3>Design & Identidade</h3>
              <p>
                Queremos designer! Refinar nossa identidade visual, criar
                componentes, refinasse design system.
              </p>
              <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos/issues">
                Issues de Design →
              </Link>
            </div>

            {/* Ideas */}
            <div className={styles.card}>
              <div className={styles.icon}>💡</div>
              <h3>Ideias de Pautas</h3>
              <p>
                Qual pauta política deveria virar jogo? Você tem ideias?
                Abra uma discussão, sugira mecânicas.
              </p>
              <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos/discussions">
                Discussions →
              </Link>
            </div>

            {/* Testers */}
            <div className={styles.card}>
              <div className={styles.icon}>🧪</div>
              <h3>Testes & Feedback</h3>
              <p>
                Você não precisa saber programar. Teste as experiências, reporte bugs, sugira features.
              </p>
              <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos/issues">
                Reportar Bug →
              </Link>
            </div>

            {/* Advocacy */}
            <div className={styles.card}>
              <div className={styles.icon}>📢</div>
              <h3>Divulgação</h3>
              <p>
                Ama o projeto? Compartilhe com amigos, redes sociais, grupos
                políticos. Ajuda no crescimento.
              </p>
              <Link href="/">
                Compartilhar Hub →
              </Link>
            </div>

            {/* Community */}
            <div className={styles.card}>
              <div className={styles.icon}>🤝</div>
              <h3>Comunidade</h3>
              <p>
                Quer organizar encontros, workshops, eventos sobre jogos e
                política? Fale com a gente.
              </p>
              <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos/discussions">
                Comece uma Conversa →
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className={styles.finalCTA}>
            <h2>Pronto para Começar?</h2>
            <p>Não importa seu nível. Temos espaço para todos.</p>
            <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos">
              Acesse o Repositório
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
