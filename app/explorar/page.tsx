'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { CTACluster } from '@/components/ui/CTACluster';
import {
  games,
  GAME_SERIES_LABELS,
  TERRITORY_SCOPE_LABELS,
  getPortfolioStage,
  plannedGameCandidates,
  type GameSeries,
  type TerritoryScope,
} from '@/lib/games/catalog';
import { GameCard } from '@/components/hub/GameCard';
import { BetaBanner } from '@/components/ui/BetaBanner';
import { CampaignMark } from '@/components/campaign/CampaignMark';
import {
  trackSeriesClick,
  trackExplorarArcadeClick,
  trackExplorarQuickClick,
  trackExplorarFilterChange,
} from '@/lib/analytics/track';
import styles from './page.module.css';

type KindFilter = 'all' | 'arcade' | 'quick';

export default function ExplorarPage() {
  const [selectedSeries, setSelectedSeries] = useState<GameSeries | 'all'>('all');
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryScope | 'all'>('all');
  const [selectedKind, setSelectedKind] = useState<KindFilter>('all');

  const playableGames = games.filter((g) => g.runtimeState === 'real' && (g.status === 'live' || g.status === 'beta'));
  const liveGames = games.filter((g) => getPortfolioStage(g) === 'live');
  const validatingGames = games.filter((g) => getPortfolioStage(g) === 'validating');
  const comingGames = games.filter((g) => getPortfolioStage(g) === 'coming');
  const preProductionCandidates = plannedGameCandidates.filter((g) => g.status === 'pre-producao');
  const coldBacklogCandidates = plannedGameCandidates.filter((g) => g.status === 'backlog-frio');
  const arcadeGames = playableGames.filter((g) => g.kind === 'arcade');
  const quickGames = playableGames.filter((g) => g.pace === 'quick' && g.kind !== 'arcade');
  const referenceGame = games[0];

  const filteredGames = useMemo(() => {
    return playableGames.filter((game) => {
      if (selectedSeries !== 'all' && game.series !== selectedSeries) {
        return false;
      }
      if (selectedTerritory !== 'all' && game.territoryScope !== selectedTerritory) {
        return false;
      }
      if (selectedKind === 'arcade' && game.kind !== 'arcade') {
        return false;
      }
      if (selectedKind === 'quick' && !(game.pace === 'quick' && game.kind !== 'arcade')) {
        return false;
      }
      return true;
    });
  }, [playableGames, selectedSeries, selectedTerritory, selectedKind]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const series = params.get('serie') as GameSeries | null;
    const kind = params.get('tipo') as KindFilter | null;
    const territory = params.get('territorio') as TerritoryScope | null;

    if (series && Object.prototype.hasOwnProperty.call(GAME_SERIES_LABELS, series)) {
      setSelectedSeries(series);
    }
    if (kind === 'all' || kind === 'arcade' || kind === 'quick') {
      setSelectedKind(kind);
    }
    if (territory && Object.prototype.hasOwnProperty.call(TERRITORY_SCOPE_LABELS, territory)) {
      setSelectedTerritory(territory);
    }
  }, []);

  async function handleSeriesClick(series: GameSeries) {
    const reference = games.find((game) => game.series === series) || games[0];
    if (!reference) {
      return;
    }
    await trackSeriesClick(reference as any, series, reference.territoryScope, 'explorar-series').catch(console.error);
  }

  async function handleFilterChange(filterType: string, value: string) {
    if (!referenceGame) {
      return;
    }
    await trackExplorarFilterChange(referenceGame as any, filterType, value).catch(console.error);
  }

  async function handleArcadeClick(slug: string) {
    if (!referenceGame) {
      return;
    }
    await trackExplorarArcadeClick(referenceGame as any, slug).catch(console.error);
  }

  async function handleQuickClick(slug: string) {
    if (!referenceGame) {
      return;
    }
    await trackExplorarQuickClick(referenceGame as any, slug).catch(console.error);
  }

  return (
    <div className={styles.page}>
      <BetaBanner />
      <PageHero
        eyebrow="🎮 Jogos prontos"
        title="Escolha um, jogue agora"
        description="Arcade de controle real ou quick de descoberta rápida. Cada jogo tem resultado compartilhável e leitura política."
        actions={
          <CTACluster>
            <Link
              href="/arcade/tarifa-zero-corredor"
              className={styles.ctaPrimary}
              onClick={() => handleArcadeClick('tarifa-zero-corredor')}
            >
              🎮 Jogar Arcade
            </Link>
            <Link
              href="/play/custo-de-viver"
              className={styles.ctaSecondary}
              onClick={() => handleQuickClick('custo-de-viver')}
            >
              ⚡ Jogar Quick
            </Link>
          </CTACluster>
        }
      >
        <CampaignMark compact />
      </PageHero>

      <Section
        eyebrow="Estado do portfolio"
        title="Fabrica do hub: live, validacao e pre-producao"
        description="Jogos jogaveis ficam visiveis como live/validacao. Pre-producao aparece como pipeline editorial, sem prometer release imediata."
      >
        <div className={styles.portfolioStageGrid}>
          <article className={styles.portfolioStageCard}>
            <strong>Live</strong>
            <p>{liveGames.length} jogos</p>
            <span>Prontos para distribuicao ampla.</span>
          </article>
          <article className={styles.portfolioStageCard}>
            <strong>Em validacao forte</strong>
            <p>{validatingGames.length} jogos</p>
            <span>Jogavel com monitoramento de decisao e fairness.</span>
          </article>
          <article className={styles.portfolioStageCard}>
            <strong>Em breve</strong>
            <p>{comingGames.length} jogos</p>
            <span>Conceito mapeado, sem publicacao como pronto.</span>
          </article>
          <article className={styles.portfolioStageCard}>
            <strong>Pre-producao</strong>
            <p>{preProductionCandidates.length} candidatos</p>
            <span>Shortlist de fabrica para proximos tijolos.</span>
          </article>
          <article className={styles.portfolioStageCard}>
            <strong>Backlog frio</strong>
            <p>{coldBacklogCandidates.length} conceitos</p>
            <span>Pre-producao madura sem promessa de release.</span>
          </article>
        </div>
      </Section>

      <Section
        eyebrow="🎮 Arcades"
        title="Jogar de verdade. Replay imediato."
        description="Controle real, game feel polido, runs de 30s a 3 min."
      >
        <div className={styles.arcadeSpotlightGrid}>
          {arcadeGames.map((game) => (
            <Link
              key={game.id}
              href={`/arcade/${game.slug}`}
              className={styles.arcadeSpotlightCard}
              onClick={() => handleArcadeClick(game.slug)}
            >
              <span className={styles.arcadeBadge}>🎮 ARCADE</span>
              <h3>{game.icon} {game.title}</h3>
              <p>{game.shortDescription}</p>
              <div className={styles.arcadeMeta}>
                <span>⏱ {game.duration}</span>
                <span>📍 {TERRITORY_SCOPE_LABELS[game.territoryScope]}</span>
                <span>🧱 {GAME_SERIES_LABELS[game.series]}</span>
              </div>
              <strong className={styles.arcadeCardCta}>{game.cta} agora →</strong>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Filtros"
        title="Encontre seu jogo rápido"
        description="Filtre por tipo, série ou território."
      >
        <div className={styles.filtersRow}>
          <label className={styles.filterField}>
            <span>Tipo</span>
            <select
              value={selectedKind}
              onChange={(e) => {
                const value = e.target.value as KindFilter;
                setSelectedKind(value);
                void handleFilterChange('kind', value);
              }}
            >
              <option value="all">Todos</option>
              <option value="arcade">Arcade</option>
              <option value="quick">Quick (1-3 min)</option>
            </select>
          </label>

          <label className={styles.filterField}>
            <span>Série</span>
            <select
              value={selectedSeries}
              onChange={(e) => {
                const value = e.target.value as GameSeries | 'all';
                setSelectedSeries(value);
                void handleFilterChange('series', value);
                if (value !== 'all') {
                  void handleSeriesClick(value);
                }
              }}
            >
              <option value="all">Todas</option>
              {Object.entries(GAME_SERIES_LABELS).map(([series, label]) => (
                <option key={series} value={series}>{label}</option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>Território</span>
            <select
              value={selectedTerritory}
              onChange={(e) => {
                const value = e.target.value as TerritoryScope | 'all';
                setSelectedTerritory(value);
                void handleFilterChange('territory', value);
              }}
            >
              <option value="all">Todos</option>
              {Object.entries(TERRITORY_SCOPE_LABELS).map(([scope, label]) => (
                <option key={scope} value={scope}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      <Section
        eyebrow="Quick games"
        title="Entrada rápida em 1-3 minutos"
        description="Para descobrir pauta rápido, comparar resultado e compartilhar sem fricção."
      >
        {quickGames.length > 0 ? (
          <div className={styles.quickStrip}>
            {quickGames.map((game) => (
              <Link
                key={game.id}
                href={`/play/${game.slug}`}
                className={styles.quickStripCard}
                onClick={() => handleQuickClick(game.slug)}
              >
                <span>{game.icon}</span>
                <div>
                  <h4>{game.title}</h4>
                  <p>{game.shortDescription}</p>
                </div>
                <strong>{game.cta} →</strong>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem quick games ativos" description="A linha quick está em atualização." />
        )}
      </Section>

      <Section
        eyebrow="Pipeline editorial"
        title="Validacao, pre-producao e backlog frio"
        description="Sem inflar escopo: o hub mostra o que esta jogavel agora e o que esta em preparo, sem vender conceito como pronto."
      >
        <div className={styles.pipelineGrid}>
          {validatingGames.map((game) => (
            <article key={`validating-${game.id}`} className={styles.pipelineCard}>
              <span className={styles.pipelineBadge}>VALIDACAO</span>
              <h4>{game.icon} {game.title}</h4>
              <p>{game.shortDescription}</p>
              <div className={styles.arcadeMeta}>
                <span>Tipo: {game.kind}</span>
                <span>Serie: {GAME_SERIES_LABELS[game.series]}</span>
                <span>Territorio: {TERRITORY_SCOPE_LABELS[game.territoryScope]}</span>
              </div>
            </article>
          ))}
          {plannedGameCandidates.map((candidate) => (
            <article key={candidate.slug} className={styles.pipelineCardMuted}>
              <span className={styles.pipelineBadgeMuted}>{candidate.status === 'pre-producao' ? 'PRE-PRODUCAO' : 'BACKLOG FRIO'}</span>
              <h4>{candidate.title}</h4>
              <p>{candidate.rationale}</p>
              <div className={styles.arcadeMeta}>
                <span>Tipo: {candidate.type}</span>
                <span>Serie: {GAME_SERIES_LABELS[candidate.series]}</span>
                <span>Territorio: {TERRITORY_SCOPE_LABELS[candidate.territoryScope]}</span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Catálogo ao vivo"
        title="Todos os jogos com filtros aplicados"
        description={`${filteredGames.length} jogos encontrados para esta combinação.`}
      >
        {filteredGames.length > 0 ? (
          <div className={styles.grid}>
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum jogo com esses filtros"
            description="Tente limpar filtros para voltar ao catálogo completo."
          />
        )}
      </Section>
    </div>
  );
}
