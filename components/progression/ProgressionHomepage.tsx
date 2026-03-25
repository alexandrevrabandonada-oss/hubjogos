'use client';

// Progression-Aware Homepage
// v1 — Dynamic homepage that adapts to user progression state

import React, { useEffect, useState } from 'react';
import { games, Game } from '@/lib/games/catalog';
import {
  loadProgression,
  getProgressionState,
  getReturnMessage,
  isReturningSession,
  ProgressionState,
} from '@/lib/hub/progression';
import {
  getContinuePlaying,
  getRecentlyPlayed,
  getNextStepRecommendations,
  getVocêPodeGostar,
  getShareableRecommendations,
  recommendNextGames,
  FlowDirection,
} from '@/lib/hub/recommendation';
import { trackReturningSession } from '@/lib/hub/analytics';
import {
  ContinueJogando,
  JogadosRecentemente,
  ProximoPasso,
  VocePodeGostar,
  CompartilharSurface,
  ReturnBanner,
} from '@/components/hub/ProgressionSurfaces';
import { PortfolioLane } from '@/components/hub/PortfolioLane';
import { getFeaturedGames, getLiveGames } from '@/lib/games/catalog';
import styles from './ProgressionHomepage.module.css';

// --- Main Progression-Aware Homepage Component ---
export function ProgressionHomepage() {
  const [progressionState, setProgressionState] = useState<ProgressionState>('first_time');
  const [returnMessage, setReturnMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const state = getProgressionState();
    setProgressionState(state);

    // Check for returning session
    if (isReturningSession()) {
      const progression = loadProgression();
      if (progression.lastSession) {
        const hoursSince = (Date.now() - progression.lastSession) / (1000 * 60 * 60);
        trackReturningSession(hoursSince);
      }
      setReturnMessage(getReturnMessage());
    }
  }, []);

  if (!isClient) {
    // Server-side or initial render: show default homepage
    return <DefaultHomepage />;
  }

  // Render based on progression state
  switch (progressionState) {
    case 'first_time':
      return <FirstTimeHomepage />;
    case 'first_play_completed':
      return <FirstPlayCompletedHomepage />;
    case 'returning_player':
      return <ReturningPlayerHomepage returnMessage={returnMessage} />;
    case 'multi_game_explorer':
      return <MultiGameExplorerHomepage returnMessage={returnMessage} />;
    case 'deep_engagement':
      return <DeepEngagementHomepage returnMessage={returnMessage} />;
    default:
      return <ReturningPlayerHomepage returnMessage={returnMessage} />;
  }
}

// --- Default Homepage (no progression data) ---
function DefaultHomepage() {
  const featuredGames = getFeaturedGames();
  const liveGames = getLiveGames();

  return (
    <div className={styles.homepage}>
      <PortfolioLane
        title="Experiências em Destaque"
        category="Comece sua jornada"
        games={featuredGames}
        laneId="featured-default"
      />
      <PortfolioLane
        title="Todos os Jogos"
        category="Explore o catálogo"
        games={liveGames}
        laneId="all-games-default"
      />
    </div>
  );
}

// --- First-Time Visitor Homepage ---
function FirstTimeHomepage() {
  const featuredGames = getFeaturedGames();
  const liveGames = getLiveGames().filter(g => !g.isFeatured);
  
  // Recommend quick-start games for first-time visitors
  const quickStartGames = liveGames
    .filter(g => g.pace === 'quick' && g.difficulty !== 'hard')
    .slice(0, 3);

  return (
    <div className={styles.homepage}>
      <WelcomeSection />
      
      <PortfolioLane
        title="Comece Aqui"
        category="Experiências rápidas"
        games={quickStartGames}
        laneId="quick-start"
      />
      
      <PortfolioLane
        title="Experiências em Destaque"
        category="O melhor do Hub"
        games={featuredGames}
        laneId="featured"
      />
      
      <PortfolioLane
        title="Explore por Território"
        category="Descubra lutas na sua região"
        games={liveGames}
        laneId="by-territory"
      />
    </div>
  );
}

// --- First Play Completed Homepage ---
function FirstPlayCompletedHomepage() {
  const allGames = games;
  const nextStepRecs = getNextStepRecommendations(allGames, 3);
  const youMayLikeRecs = getVocêPodeGostar(allGames, 3);
  const liveGames = getLiveGames();

  return (
    <div className={styles.homepage}>
      <CongratulationsSection />
      
      <ProximoPasso recommendations={nextStepRecs} />
      
      <VocePodeGostar recommendations={youMayLikeRecs} />
      
      <PortfolioLane
        title="Mais Experiências"
        category="Continue explorando"
        games={liveGames}
        laneId="more-games"
      />
    </div>
  );
}

// --- Returning Player Homepage ---
interface ReturningHomepageProps {
  returnMessage: string | null;
}

function ReturningPlayerHomepage({ returnMessage }: ReturningHomepageProps) {
  const allGames = games;
  const progression = loadProgression();
  
  // Get various recommendation types
  const continueRecs = getContinuePlaying(allGames);
  const recentRecs = getRecentlyPlayed(allGames);
  const nextStepRecs = getNextStepRecommendations(allGames, 3);
  const shareableRecs = getShareableRecommendations(allGames, 2);

  return (
    <div className={styles.homepage}>
      {returnMessage && (
        <ReturnBanner
          message={returnMessage}
          onDismiss={() => {}}
        />
      )}
      
      {continueRecs.length > 0 && (
        <ContinueJogando recommendations={continueRecs} />
      )}
      
      {recentRecs.length > 0 && (
        <JogadosRecentemente
          recommendations={recentRecs}
          showCompleted={false}
          maxItems={4}
        />
      )}
      
      <ProximoPasso recommendations={nextStepRecs} />
      
      {shareableRecs.length > 0 && progression.completedGames.length > 0 && (
        <CompartilharSurface
          shareableGames={shareableRecs}
          context="hub"
        />
      )}
    </div>
  );
}

// --- Multi-Game Explorer Homepage ---
function MultiGameExplorerHomepage({ returnMessage }: ReturningHomepageProps) {
  const allGames = games;
  const progression = loadProgression();
  
  // Get cross-genre and cross-territory recommendations
  const lastCompletedSlug = progression.completedGames[progression.completedGames.length - 1];
  const lastCompleted = allGames.find(g => g.slug === lastCompletedSlug);
  
  const flowDirection: FlowDirection = 'genre_explore';
  const exploreRecs = lastCompleted
    ? recommendNextGames(allGames, lastCompleted, flowDirection, 3)
    : getNextStepRecommendations(allGames, 3);
  
  const continueRecs = getContinuePlaying(allGames);
  const youMayLikeRecs = getVocêPodeGostar(allGames, 3);
  const shareableRecs = getShareableRecommendations(allGames, 2);

  return (
    <div className={styles.homepage}>
      {returnMessage && (
        <ReturnBanner
          message={returnMessage}
          onDismiss={() => {}}
        />
      )}
      
      {continueRecs.length > 0 && (
        <ContinueJogando recommendations={continueRecs} />
      )}
      
      <div className={styles.explorerSection}>
        <h2 className={styles.sectionTitle}>Continue Explorando</h2>
        <p className={styles.sectionSubtitle}>
          Você já completou {progression.completedGames.length} experiências. Hora de expandir horizontes.
        </p>
      </div>
      
      <ProximoPasso recommendations={exploreRecs} />
      
      <VocePodeGostar recommendations={youMayLikeRecs} />
      
      {shareableRecs.length > 0 && (
        <CompartilharSurface
          shareableGames={shareableRecs}
          context="hub"
        />
      )}
    </div>
  );
}

// --- Deep Engagement Homepage ---
function DeepEngagementHomepage({ returnMessage }: ReturningHomepageProps) {
  const allGames = games;
  const progression = loadProgression();
  
  const continueRecs = getContinuePlaying(allGames);
  const deepGames = allGames.filter(g => g.pace === 'deep' && g.status === 'live');
  const savedGames = allGames.filter(g => progression.savedGames.includes(g.slug));
  
  return (
    <div className={styles.homepage}>
      {returnMessage && (
        <ReturnBanner
          message={returnMessage}
          onDismiss={() => {}}
        />
      )}
      
      <div className={styles.veteranBadge}>
        🏆 Você é um explorador dedicado
      </div>
      
      {continueRecs.length > 0 && (
        <ContinueJogando recommendations={continueRecs} />
      )}
      
      {savedGames.length > 0 && (
        <PortfolioLane
          title="Seus Salvos"
          category="Experiências marcadas"
          games={savedGames}
          laneId="saved-games"
        />
      )}
      
      <PortfolioLane
        title="Experiências Profundas"
        category="Para quem quer ir além"
        games={deepGames}
        laneId="deep-experiences"
      />
      
      <VocePodeGostar recommendations={getVocêPodeGostar(allGames, 4)} />
    </div>
  );
}

// --- Welcome Section (for first-time visitors) ---
function WelcomeSection() {
  return (
    <div className={styles.welcomeSection}>
      <h1 className={styles.welcomeTitle}>Bem-vindo ao Hub de Jogos</h1>
      <p className={styles.welcomeText}>
        Experiências interativas sobre política, território e transformação social.
        Jogue, aprenda e descubra como fazer parte da mudança.
      </p>
      <div className={styles.welcomeStats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{getLiveGames().length}+</span>
          <span className={styles.statLabel}>Experiências</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>5</span>
          <span className={styles.statLabel}>Territórios</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>0</span>
          <span className={styles.statLabel}>Precisa de cadastro</span>
        </div>
      </div>
    </div>
  );
}

// --- Congratulations Section ---
function CongratulationsSection() {
  return (
    <div className={styles.congratulationsSection}>
      <div className={styles.congratulationsIcon}>🎉</div>
      <h2 className={styles.congratulationsTitle}>Parabéns pela primeira conclusão!</h2>
      <p className={styles.congratulationsText}>
        Você deu o primeiro passo. Agora, que tal explorar mais experiências relacionadas?
      </p>
    </div>
  );
}

// --- Hook for using progression data ---
export function useProgression() {
  const [state, setState] = useState<{
    progressionState: ProgressionState;
    recentlyPlayed: Game[];
    completedGames: Game[];
    sessionCount: number;
    isReturning: boolean;
  }>({
    progressionState: 'first_time',
    recentlyPlayed: [],
    completedGames: [],
    sessionCount: 0,
    isReturning: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const progression = loadProgression();
    const allGames = games;

    setState({
      progressionState: getProgressionState(),
      recentlyPlayed: progression.recentlyPlayed
        .map(slug => allGames.find(g => g.slug === slug))
        .filter((g): g is Game => !!g),
      completedGames: progression.completedGames
        .map(slug => allGames.find(g => g.slug === slug))
        .filter((g): g is Game => !!g),
      sessionCount: progression.sessionCount,
      isReturning: isReturningSession(),
    });
  }, []);

  return state;
}

export default ProgressionHomepage;
