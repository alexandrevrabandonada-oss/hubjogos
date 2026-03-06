'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GameCard } from '@/components/hub/GameCard';
import { CTACluster } from '@/components/ui/CTACluster';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { ShellContainer } from '@/components/ui/ShellContainer';
import { BetaBanner } from '@/components/ui/BetaBanner';
import { games } from '@/lib/games/catalog';
import { resolveExperimentVariantClient } from '@/lib/experiments/client';
import styles from './page.module.css';

export default function Home() {
  const featured = games.slice(0, 3);
  const [heroVariant, setHeroVariant] = useState<'explore' | 'discover-now'>('explore');

  useEffect(() => {
    const variant = resolveExperimentVariantClient('home-hero-cta-copy', 'explore');
    setHeroVariant(variant === 'discover-now' ? 'discover-now' : 'explore');
  }, []);

  const primaryHeroLabel = heroVariant === 'discover-now' ? 'Descubra agora' : 'Explorar experiencias';
  const heroDescription =
    heroVariant === 'discover-now'
      ? 'Cada experiência transforma uma pauta real em decisão. Você testa escolhas, vê consequências e sai com um próximo passo político claro.'
      : 'Cada experiência transforma uma pauta real em decisão. Você testa escolhas, vê consequências e sai com uma leitura política acionável.';

  return (
    <>
      <BetaBanner />
      <PageHero
        eyebrow="Hub político-jogável"
        title="Jogue as contradições da cidade"
        description={heroDescription}
        actions={
          <CTACluster>
            <Link href="/explorar" className={styles.ctaPrimary}>
              {primaryHeroLabel}
            </Link>
            <Link href="/play/voto-consciente" className={styles.ctaSecondary}>
              Jogar quiz inaugural
            </Link>
          </CTACluster>
        }
      >
        <div className={styles.heroPanel}>
          <h3>Fluxo do hub</h3>
          <ol>
            <li>Pauta real</li>
            <li>Escolha jogável</li>
            <li>Conflito revelado</li>
            <li>Próxima ação</li>
          </ol>
        </div>
      </PageHero>

      <Section
        eyebrow="Em destaque"
        title="Portas de entrada para consciência e ação"
        description="Não é entretenimento vazio: cada módulo expõe disputas de orçamento, trabalho, território e participação."
      >
        {featured.length ? (
          <div className={styles.grid}>
            {featured.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sem experiências em destaque"
            description="O catálogo está sendo atualizado."
          />
        )}
      </Section>

      <Section
        eyebrow="Dramaturgia"
        title="Do jogo para a leitura política"
        description="Cada partida conecta quatro camadas: estrutura social, conflito, escolha possível e ação concreta no território."
      >
        <div className={styles.pillars}>
          <article className={styles.pillar}>
            <h4>Entender contradições</h4>
            <p>Simular política pública torna visível o que o discurso costuma esconder.</p>
          </article>
          <article className={styles.pillar}>
            <h4>Visualizar estruturas</h4>
            <p>O foco sai do indivíduo isolado e aponta para regras, orçamento e território.</p>
          </article>
          <article className={styles.pillar}>
            <h4>Compartilhar leitura</h4>
            <p>Resultados do jogo viram linguagem comum para conversa política nas redes.</p>
          </article>
          <article className={styles.pillar}>
            <h4>Entrar em ação</h4>
            <p>Cada módulo termina com uma ação de continuidade: pressão pública, debate local ou mobilização.</p>
          </article>
        </div>
      </Section>

      <Section>
        <ShellContainer className={styles.bottomCtaWrap}>
          <div className={styles.bottomCta}>
            <h3>Comece pelo quiz “Voto Consciente”</h3>
            <p>Uma experiência real, já jogável, para mapear prioridades políticas sem simplificação panfletária.</p>
            <Link href="/play/voto-consciente" className={styles.ctaPrimary}>
              Jogar agora
            </Link>
          </div>
        </ShellContainer>
      </Section>

      <footer className={styles.footer}>
        <ShellContainer>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4>Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado</h4>
              <p>Um universo político-jogável feito para ler a cidade e agir sobre ela.</p>
            </div>

            <div className={styles.footerSection}>
              <h4>Rotas</h4>
              <ul>
                <li>
                  <Link href="/explorar">Explorar experiências</Link>
                </li>
                <li>
                  <Link href="/sobre">Sobre o projeto</Link>
                </li>
                <li>
                  <Link href="/participar">Participar</Link>
                </li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Próximo passo</h4>
              <p>Jogue, compare resultado e leve a discussão para o seu território.</p>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>
              © 2026 Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado. Código aberto em{' '}
              <a href="https://github.com/alexandrevrabandonada-oss/hubjogos">
                GitHub
              </a>
              .
            </p>
          </div>
        </ShellContainer>
      </footer>
    </>
  );
}
