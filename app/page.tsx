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
import { CampaignMark } from '@/components/campaign/CampaignMark';
import {
  games,
  GAME_PACE_LABELS,
  GAME_SERIES_LABELS,
  TERRITORY_SCOPE_LABELS,
  type GameSeries,
} from '@/lib/games/catalog';
import { trackCampaignMarkClick, trackSeriesClick } from '@/lib/analytics/track';
import { resolveExperimentVariantClient } from '@/lib/experiments/client';
import styles from './page.module.css';

export default function Home() {
  const featured = games.slice(0, 3);
  const referenceGame = games[0];
  const [heroVariant, setHeroVariant] = useState<'explore' | 'discover-now'>('explore');

  const seriesEntries = Object.entries(GAME_SERIES_LABELS).map(([seriesKey, label]) => {
    const seriesGames = games.filter((game) => game.series === seriesKey);
    return {
      key: seriesKey as GameSeries,
      label,
      count: seriesGames.length,
      quick: seriesGames.filter((game) => game.pace === 'quick').length,
      session: seriesGames.filter((game) => game.pace === 'session').length,
      deep: seriesGames.filter((game) => game.pace === 'deep').length,
      territories: Array.from(new Set(seriesGames.map((game) => game.territoryScope))),
    };
  });

  const territoryEntries = Object.entries(TERRITORY_SCOPE_LABELS).map(([scope, label]) => ({
    scope,
    label,
    count: games.filter((game) => game.territoryScope === scope).length,
  }));

  async function handleCampaignClick() {
    await trackCampaignMarkClick({ slug: 'home', kind: 'quiz', engineId: 'campaign-mark' } as any, 'home-hero').catch(
      console.error,
    );
  }

  async function handleSeriesClick(series: GameSeries, placement: string) {
    if (!referenceGame) {
      return;
    }
    await trackSeriesClick(referenceGame as any, series, 'estado-rj', placement).catch(console.error);
  }

  useEffect(() => {
    const variant = resolveExperimentVariantClient('home-hero-cta-copy', 'explore');
    setHeroVariant(variant === 'discover-now' ? 'discover-now' : 'explore');
  }, []);

  const primaryHeroLabel = heroVariant === 'discover-now' ? 'Descubra agora' : 'Explorar experiências';
  const heroDescription =
    heroVariant === 'discover-now'
      ? 'Escolha, jogue e compare caminhos em poucos minutos. Cada experiência transforma pauta real em decisão concreta.'
      : 'Diversão primeiro: você testa escolhas, vê consequências e sai com uma leitura política acionável.';

  return (
    <>
      <BetaBanner />
      <PageHero
        eyebrow="Hub de Jogos da Pré-Campanha"
        title="Jogue, compare, compartilhe: Missões eleitorais do RJ"
        description={heroDescription}
        actions={
          <CTACluster>
            <Link href="/explorar" className={styles.ctaPrimary}>
              {primaryHeroLabel}
            </Link>
            <Link href="/play/voto-consciente" className={styles.ctaSecondary}>
              Jogar missão inaugural
            </Link>
          </CTACluster>
        }
      >
        <div className={styles.heroPanel}>
          <h3>Manifesto curto</h3>
          <ol>
            <li>Diversão primeiro, sermão nunca.</li>
            <li>Volta Redonda como laboratório vivo.</li>
            <li>Escala progressiva para todo o estado do RJ.</li>
            <li>Pré-campanha de Alexandre Fonseca presente em cada rodada.</li>
          </ol>
          <CampaignMark compact onClick={handleCampaignClick} />
        </div>
      </PageHero>

      <Section
        eyebrow="Séries da campanha"
        title="Não são jogos soltos. São coleções com continuidade."
        description="Cada série organiza conflitos eleitorais em blocos jogáveis para fortalecer memória de marca e retorno recorrente."
      >
        <div className={styles.seriesGrid}>
          {seriesEntries.map((entry) => (
            <Link
              key={entry.key}
              href={`/explorar?serie=${entry.key}`}
              className={styles.seriesCard}
              onClick={() => handleSeriesClick(entry.key, 'home-series-grid')}
            >
              <h4>{entry.label}</h4>
              <p>{entry.count} jogos no catálogo</p>
              <p>
                {entry.quick} quick • {entry.session} session • {entry.deep} deep
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Em destaque"
        title="Portas de entrada para engajamento eleitoral"
        description="Jogue rápido, compartilhe resultado e leve o nome de Alexandre Fonseca para o debate político local."
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
        eyebrow="Escala territorial"
        title="Do laboratório local ao estado do Rio"
        description="A arquitetura editorial já separa escopos para evoluir de Volta Redonda para Sul Fluminense, Baixada, Capital e Estado do RJ."
      >
        <div className={styles.territoryGrid}>
          {territoryEntries.map((entry) => (
            <article key={entry.scope} className={styles.pillar}>
              <h4>{entry.label}</h4>
              <p>{entry.count} jogos mapeados neste escopo.</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Escada de produto"
        title="Do minigame ao flagship"
        description="Este ciclo prepara a progressão: jogos rápidos agora, jogos médios seriados em seguida, formatos maiores no futuro."
      >
        <div className={styles.pillars}>
          <article className={styles.pillar}>
            <h4>Jogos rápidos</h4>
            <p>{GAME_PACE_LABELS.quick}: entrada instantânea para descoberta e compartilhamento.</p>
          </article>
          <article className={styles.pillar}>
            <h4>Jogos médios seriados</h4>
            <p>{GAME_PACE_LABELS.session}: continuidade por série para aumentar replay e retenção.</p>
          </article>
          <article className={styles.pillar}>
            <h4>Flagships futuros</h4>
            <p>{GAME_PACE_LABELS['future-flagship']}: plataforma, RPG e tycoon como horizonte de campanha.</p>
          </article>
        </div>
      </Section>

      <Section>
        <ShellContainer className={styles.bottomCtaWrap}>
          <div className={styles.bottomCta}>
            <h3>Comece pelo quiz “Voto Consciente”</h3>
            <p>Uma rodada rápida para mapear prioridades e abrir conversa política sem tom de sermão.</p>
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
