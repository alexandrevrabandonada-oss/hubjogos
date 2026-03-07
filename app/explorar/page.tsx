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
  GAME_LINE_LABELS,
  GAME_PACE_LABELS,
  TERRITORY_SCOPE_LABELS,
  type GameSeries,
} from '@/lib/games/catalog';
import { GameCard } from '@/components/hub/GameCard';
import { BetaBanner } from '@/components/ui/BetaBanner';
import { CampaignMark } from '@/components/campaign/CampaignMark';
import { trackSeriesClick } from '@/lib/analytics/track';
import styles from './page.module.css';

export default function ExplorarPage() {
  const [selectedSeries, setSelectedSeries] = useState<GameSeries | null>(null);
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

  const seriesEntries = Object.entries(GAME_SERIES_LABELS).map(([seriesKey, label]) => {
    const seriesGames = games.filter((game) => game.series === seriesKey);
    return {
      key: seriesKey as GameSeries,
      label,
      count: seriesGames.length,
      firstSlug: seriesGames[0]?.slug,
      territories: Array.from(new Set(seriesGames.map((game) => TERRITORY_SCOPE_LABELS[game.territoryScope]))).join(', '),
    };
  });

  const filteredLiveGames = useMemo(() => {
    if (!selectedSeries) {
      return liveGames;
    }
    return liveGames.filter((game) => game.series === selectedSeries);
  }, [liveGames, selectedSeries]);

  const paceSummary = Object.keys(GAME_PACE_LABELS)
    .filter((paceKey) => paceKey !== 'future-flagship')
    .map((paceKey) => {
      const count = games.filter((game) => game.pace === paceKey).length;
      return `${paceKey}: ${count}`;
    })
    .join(' • ');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const value = params.get('serie');
    setSelectedSeries((value as GameSeries | null) || null);
  }, []);

  async function handleSeriesClick(series: GameSeries) {
    const reference = games.find((game) => game.series === series) || games[0];
    if (!reference) {
      return;
    }
    await trackSeriesClick(reference as any, series, reference.territoryScope, 'explorar-series').catch(console.error);
  }

  return (
    <div className={styles.page}>
      <BetaBanner />
      <PageHero
        eyebrow="Catálogo vivo"
        title="Escolha um conflito e jogue agora"
        description="Linha oficial de jogos da pré-campanha de Alexandre Fonseca para Deputado: rápida para entrar, forte para compartilhar e pronta para escalar no RJ."
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
      >
        <CampaignMark compact />
      </PageHero>

      <Section
        eyebrow="Coleções"
        title="Séries da campanha"
        description="Navegue por blocos editoriais para seguir uma trilha de jogo, tema e território."
      >
        <div className={styles.seriesGrid}>
          {seriesEntries.map((entry) => (
            <Link
              key={entry.key}
              href={`/explorar?serie=${entry.key}`}
              className={`${styles.seriesCard} ${selectedSeries === entry.key ? styles.seriesCardActive : ''}`}
              onClick={() => {
                setSelectedSeries(entry.key);
                void handleSeriesClick(entry.key);
              }}
            >
              <h4>{entry.label}</h4>
              <p>{entry.count} jogos no catálogo</p>
              <p>Escopo: {entry.territories || 'a definir'}</p>
              {entry.firstSlug ? <span>Abrir série</span> : null}
            </Link>
          ))}
        </div>
      </Section>

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
          description={`${filteredLiveGames.length} jogáveis nesta visão • ${realLiveGames.length} totalmente implementadas • ${shellLiveGames.length} com dramaturgia pronta para próximas rodadas`}
        >
          <div className={styles.grid}>
            {filteredLiveGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </Section>
      )}

      <Section
        eyebrow="Taxonomia oficial"
        title="Tempo, tema e território"
        description={`Paces: ${paceSummary}`}
      >
        <div className={styles.taxonomyGrid}>
          {Object.entries(GAME_LINE_LABELS).map(([lineKey, label]) => (
            <article key={lineKey} className={styles.engineType}>
              <h4>{label}</h4>
              <p>{games.filter((game) => game.line === lineKey).length} jogos nesta linha.</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Próximos formatos"
        title="Universo em expansão"
        description="Sem prometer entrega imediata: estes formatos guiam o horizonte de campanha para o estado do Rio de Janeiro."
      >
        <div className={styles.taxonomyGrid}>
          <article className={styles.engineType}>
            <h4>Plataforma cívica</h4>
            <p>Missões curtas por território com progressão de campanha.</p>
          </article>
          <article className={styles.engineType}>
            <h4>RPG político</h4>
            <p>Personagens, alianças e escolhas de longo prazo no RJ.</p>
          </article>
          <article className={styles.engineType}>
            <h4>Tycoon de políticas públicas</h4>
            <p>Gestão de prioridades estaduais com trade-offs eleitorais.</p>
          </article>
          <article className={styles.engineType}>
            <h4>Mapa estadual de conflitos</h4>
            <p>Leitura comparada entre regiões para orientar narrativa da campanha.</p>
          </article>
        </div>
      </Section>

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
