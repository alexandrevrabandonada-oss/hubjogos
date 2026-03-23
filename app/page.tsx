'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CTACluster } from '@/components/ui/CTACluster';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { ShellContainer } from '@/components/ui/ShellContainer';
import { BetaBanner } from '@/components/ui/BetaBanner';
import { CampaignAvatar } from '@/components/campaign/CampaignAvatar';
import { CampaignPortalSection } from '@/components/hub/CampaignPortalSection';
import { SeasonCollectionRail } from '@/components/hub/SeasonCollectionRail';
import {
  CAMPAIGN_FRAME_LABELS,
  COMMON_VS_MARKET_LABELS,
  COLLECTIVE_SOLUTION_LABELS,
  games,
  GAME_SERIES_LABELS,
  TERRITORY_SCOPE_LABELS,
  type GameSeries,
} from '@/lib/games/catalog';
import {
  trackSeriesClick,
  trackHomePrimaryPlayClick,
  trackHomeArcadeClick,
  trackHomeQuickClick,
  trackHomePlayNowBlockClick,
  trackHomeQuickVsArcadeChoice,
  trackArcadeVsQuickPreference,
  trackManifestoExpandClick,
  trackAboveFoldGameClick,
} from '@/lib/analytics/track';
import { resolveExperimentVariantClient } from '@/lib/experiments/client';
import styles from './page.module.css';

export default function Home() {
  const arcadeGames = games.filter((g) => g.kind === 'arcade' && g.status === 'live');
  const quickGames = games.filter((g) => g.pace === 'quick' && g.status === 'live');
  const featuredArcade = arcadeGames[0];
  const featuredQuicks = quickGames.slice(0, 3);
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
    };
  });

  async function handleSeriesClick(series: GameSeries, placement: string) {
    if (!referenceGame) return;
    await trackSeriesClick(referenceGame as any, series, 'estado-rj', placement).catch(console.error);
  }

  async function handlePrimaryPlayClick(slug: string, type: string) {
    if (!referenceGame) return;
    await trackHomePrimaryPlayClick(referenceGame as any, slug, type).catch(console.error);
  }

  async function handleArcadeClick(slug: string, placement: string) {
    if (!referenceGame) return;
    await trackHomeArcadeClick(referenceGame as any, slug, placement).catch(console.error);
  }

  async function handleQuickClick(slug: string, placement: string) {
    if (!referenceGame) return;
    await trackHomeQuickClick(referenceGame as any, slug, placement).catch(console.error);
  }

  async function handlePlayNowClick(slug: string, type: string) {
    if (!referenceGame) return;
    await trackHomePlayNowBlockClick(referenceGame as any, slug, type).catch(console.error);
  }

  async function handleQuickVsArcadeChoice(choice: 'quick' | 'arcade', slug: string) {
    if (!referenceGame) return;
    await trackHomeQuickVsArcadeChoice(referenceGame as any, choice, slug).catch(console.error);
    await trackArcadeVsQuickPreference(referenceGame as any, choice, slug).catch(console.error);
  }

  async function handleManifestoExpand(expanded: boolean) {
    if (!referenceGame) return;
    await trackManifestoExpandClick(referenceGame as any, expanded, 'home-campaign-manifesto').catch(console.error);
  }

  async function handleAboveFoldClick(slug: string, type: string, position: number) {
    if (!referenceGame) return;
    await trackAboveFoldGameClick(referenceGame as any, slug, type, position).catch(console.error);
  }

  useEffect(() => {
    const variant = resolveExperimentVariantClient('home-hero-cta-copy', 'explore');
    setHeroVariant(variant === 'discover-now' ? 'discover-now' : 'explore');
  }, []);

  const heroTitle =
    heroVariant === 'discover-now'
      ? 'Descubra e jogue as missões populares do RJ'
      : 'Jogue agora: missões populares do RJ';
  const heroDescription =
    heroVariant === 'discover-now'
      ? 'Entre em segundos, jogue uma rodada e compare resultados. Quick para descobrir, arcade para replay imediato.'
      : 'Arcade de controle real, quick de descoberta rápida. Escolha, jogue, compartilhe e organize.';

  return (
    <>
      <BetaBanner />
      <PageHero
        eyebrow="Hub de Jogos da Pré-Campanha"
        title={heroTitle}
        description={heroDescription}
        actions={
          <CTACluster>
            <Link
              href="/arcade/tarifa-zero-corredor"
              className={styles.ctaPrimary}
              onClick={() => handlePrimaryPlayClick('tarifa-zero-corredor', 'arcade')}
            >
              🚌 Jogar Tarifa Zero RJ
            </Link>
            <Link
              href="/play/custo-de-viver"
              className={styles.ctaSecondary}
              onClick={() => handlePrimaryPlayClick('custo-de-viver', 'quick')}
            >
              ⏱ Quick: Custo de Viver
            </Link>
          </CTACluster>
        }
      >
        <div className={styles.heroPanel}>
          <CampaignAvatar size="medium" expression="smile" className={styles.heroAvatar} />
          <p className={styles.heroTagline}>
            <strong>Alexandre Fonseca para Deputado:</strong> campanha como projeto coletivo, não como culto de personalidade.
          </p>
        </div>
      </PageHero>

      <Section
        eyebrow="🎮 Jogue agora"
        title="Missões jogáveis. Entre em segundos."
        description="Arcade de controle real ou quick de descoberta rápida. Escolha, jogue uma rodada, compartilhe o resultado."
      >
        <div className={styles.playNowGrid}>
          {featuredArcade && (
            <div className={styles.arcadeFeatured}>
              <Link
                href={`/arcade/${featuredArcade.slug}`}
                className={styles.arcadeFeatureCard}
                onClick={() => {
                  handlePlayNowClick(featuredArcade.slug, 'arcade');
                  handleAboveFoldClick(featuredArcade.slug, 'arcade', 0);
                }}
              >
                <div className={styles.arcadeFeatureBadge}>🎮 ARCADE</div>
                <div className={styles.arcadeFeatureIcon}>{featuredArcade.icon}</div>
                <h3>{featuredArcade.title}</h3>
                <p>{featuredArcade.shortDescription}</p>
                <div className={styles.arcadeFeatureMeta}>
                  <span>🎮 Arcade</span>
                  <span>⏱ {featuredArcade.duration}</span>
                  <span>🧱 {GAME_SERIES_LABELS[featuredArcade.series]}</span>
                  <span>🗺 {TERRITORY_SCOPE_LABELS[featuredArcade.territoryScope]}</span>
                  <span>🔁 Replay imediato</span>
                </div>
                <div className={styles.arcadeFeatureCta}>
                  <strong>{featuredArcade.cta} agora →</strong>
                </div>
              </Link>
              {arcadeGames[1] && (
                <Link
                  href={`/arcade/${arcadeGames[1].slug}`}
                  className={styles.arcadeSecondary}
                  onClick={() => {
                    handleArcadeClick(arcadeGames[1].slug, 'play_now_secondary');
                    handleAboveFoldClick(arcadeGames[1].slug, 'arcade', 1);
                  }}
                >
                  <span className={styles.arcadeSecondaryBadge}>🎮 ARCADE</span>
                  <h4>{arcadeGames[1].icon} {arcadeGames[1].title}</h4>
                  <p>{arcadeGames[1].shortDescription}</p>
                  <div className={styles.arcadeFeatureMeta}>
                    <span>🎮 Arcade</span>
                    <span>⏱ {arcadeGames[1].duration}</span>
                    <span>🧱 {GAME_SERIES_LABELS[arcadeGames[1].series]}</span>
                    <span>🗺 {TERRITORY_SCOPE_LABELS[arcadeGames[1].territoryScope]}</span>
                  </div>
                  <div className={styles.arcadeSecondaryCta}>
                    <strong>{arcadeGames[1].cta} →</strong>
                  </div>
                </Link>
              )}
            </div>
          )}

          <div className={styles.quickFeatured}>
            <h4 className={styles.quickFeaturedTitle}>⏱ Quick Games: 1-3 min</h4>
            {featuredQuicks.map((game, idx) => (
              <Link
                key={game.id}
                href={`/play/${game.slug}`}
                className={styles.quickFeatureCard}
                onClick={() => {
                  handleQuickClick(game.slug, 'play_now_block');
                  handleAboveFoldClick(game.slug, 'quick', idx + 2);
                }}
              >
                <div className={styles.quickFeatureIcon}>{game.icon}</div>
                <div className={styles.quickFeatureContent}>
                  <h5>{game.title}</h5>
                  <p>{game.shortDescription}</p>
                  <div className={styles.quickFeatureMeta}>
                    <span>🎮 Quick</span>
                    <span>⏱ {game.duration}</span>
                    <span>🧱 {GAME_SERIES_LABELS[game.series]}</span>
                    <span>🗺 {TERRITORY_SCOPE_LABELS[game.territoryScope]}</span>
                  </div>
                </div>
                <div className={styles.quickFeatureCta}>{game.cta} →</div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Escolha seu estilo"
        title="Quick ou Arcade?"
        description="Duas linhas de jogo para entradas diferentes. Escolha conforme seu tempo e vontade de controle."
      >
        <div className={styles.quickVsArcade}>
          <div className={styles.qvaColumn}>
            <div className={styles.qvaBadge}>⏱ QUICK</div>
            <h3>1-3 minutos</h3>
            <ul>
              <li>Descoberta rápida de pauta</li>
              <li>Quiz, narrative, simulation</li>
              <li>Compartilhamento imediato</li>
              <li>Introdução à campanha</li>
            </ul>
            <Link
              href="/play/custo-de-viver"
              className={styles.qvaCta}
              onClick={() => handleQuickVsArcadeChoice('quick', 'custo-de-viver')}
            >
              Jogar quick agora
            </Link>
          </div>

          <div className={styles.qvaColumn}>
            <div className={styles.qvaBadge}>🎮 ARCADE</div>
            <h3>30s-3 min por run</h3>
            <ul>
              <li>Controle real (keyboard, touch)</li>
              <li>Loop de ação + replay</li>
              <li>Game feel polido</li>
              <li>Diversão primeiro</li>
            </ul>
            <Link
              href="/arcade/tarifa-zero-corredor"
              className={styles.qvaCta}
              onClick={() => handleQuickVsArcadeChoice('arcade', 'tarifa-zero-corredor')}
            >
              Jogar arcade agora
            </Link>
          </div>
        </div>
      </Section>

      <CampaignPortalSection
        eyebrow="Pré-campanha"
        title="Alexandre Fonseca para Deputado"
        description="Campanha como ferramenta de organização coletiva. Jogos como porta de entrada para debate político concreto."
      >
        <div className={styles.campaignBlock}>
          <CampaignAvatar size="large" expression="determined" />
          <div className={styles.campaignContent}>
            <h3>Manifesto curto</h3>
            <details className={styles.manifestoDetails} onToggle={(event) => handleManifestoExpand(event.currentTarget.open)}>
              <summary>Expandir manifesto e direção política</summary>
              <ol>
                <li>Diversão primeiro, sermão nunca.</li>
                <li>Volta Redonda como laboratório vivo.</li>
                <li>Escala progressiva para todo o estado do RJ.</li>
                <li>Campanha como projeto coletivo, não como culto de personalidade.</li>
              </ol>
            </details>
            <div className={styles.campaignCtas}>
              <Link href="/sobre" className={styles.ctaSecondary}>
                Sobre a campanha
              </Link>
              <Link href="/participar" className={styles.ctaSecondary}>
                Participar e sugerir
              </Link>
            </div>
          </div>
        </div>
      </CampaignPortalSection>

      <SeasonCollectionRail 
        title="🚀 Novas Missões em Validação" 
        description="Amostragem antecipada de novas mecânicas. Jogue agora para ajudar a validar o tuning e o impacto dessas pautas."
        seasonId="VALIDATION-RJ"
        games={games.filter(g => g.series === 'serie-rio-de-janeiro' && g.status === 'live')}
      />

      <SeasonCollectionRail 
        title="Destaque: Soluções Coletivas" 
        description="Jogos com alternativas concretas de mutirão, passe livre e cooperativismo contra a privatização do cotidiano."
        seasonId="S1-VERÃO-26"
        games={games.filter(g => g.series === 'serie-solucoes-coletivas' && g.status === 'live')}
      />

      <Section
        eyebrow="Séries da campanha"
        title="Coleções com continuidade"
        description="Cada série organiza conflitos eleitorais em blocos jogáveis para memória de marca e retorno recorrente."
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
              <p>{entry.count} jogos</p>
              <p className={styles.seriesCardMeta}>
                {entry.quick} quick • {entry.session} session • {entry.deep} deep
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Motor ideológico"
        title="Do comum contra o mercado"
        description="Taxonomia aplicada no catálogo para guiar design e leitura de resultados."
      >
        <div className={styles.pillars}>
          <article className={styles.pillar}>
            <h4>{COMMON_VS_MARKET_LABELS.comum}</h4>
            <p>Organização coletiva e bens comuns como eixo central.</p>
          </article>
          <article className={styles.pillar}>
            <h4>{COLLECTIVE_SOLUTION_LABELS.autogestao}</h4>
            <p>Autogestão, cooperativismo e ajuda mútua.</p>
          </article>
          <article className={styles.pillar}>
            <h4>{CAMPAIGN_FRAME_LABELS['defesa-dos-comuns']}</h4>
            <p>Campanha como ferramenta de luta concreta.</p>
          </article>
        </div>
      </Section>

      <Section>
        <ShellContainer className={styles.bottomCtaWrap}>
          <div className={styles.bottomCta}>
            <h3>Não jogou ainda?</h3>
            <p>Comece pelo arcade Tarifa Zero RJ ou pelo quick Custo de Viver. Runs curtas e replay imediato.</p>
            <div className={styles.bottomCtaButtons}>
              <Link
                href="/arcade/tarifa-zero-corredor"
                className={styles.ctaPrimary}
                onClick={() => handleArcadeClick('tarifa-zero-corredor', 'bottom_cta')}
              >
                🚌 Arcade: Tarifa Zero
              </Link>
              <Link
                href="/play/custo-de-viver"
                className={styles.ctaSecondary}
                onClick={() => handleQuickClick('custo-de-viver', 'bottom_cta')}
              >
                ⏱ Quick: Custo de Viver
              </Link>
            </div>
          </div>
        </ShellContainer>
      </Section>

      <footer className={styles.footer}>
        <ShellContainer>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4>Hub de Jogos da Pré-Campanha</h4>
              <p>Portal jogável da campanha de Alexandre Fonseca para Deputado pelo RJ.</p>
            </div>

            <div className={styles.footerSection}>
              <h4>Rotas</h4>
              <ul>
                <li>
                  <Link href="/explorar">Explorar jogos</Link>
                </li>
                <li>
                  <Link href="/sobre">Sobre a campanha</Link>
                </li>
                <li>
                  <Link href="/participar">Participar</Link>
                </li>
                <li>
                  <Link href="/estado">Estado operacional</Link>
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
              © 2026 Hub de Jogos da Pré-Campanha. Alexandre Fonseca para Deputado pelo RJ.
            </p>
          </div>
        </ShellContainer>
      </footer>
    </>
  );
}
