'use client';

// Reusable progression/return surfaces for the Hub
// v1 — Complete implementation with GameCard, analytics, responsive design

import React, { useEffect, useRef } from 'react';
import { Game } from '@/lib/games/catalog';
import { GameCard } from './GameCard';
import { ProgressionBadge } from './ProgressionBadge';
import { RecommendationResult, RecommendationReason } from '@/lib/hub/recommendation';
import {
  trackContinueLaneImpression,
  trackRecentLaneImpression,
  trackRecommendations,
} from '@/lib/hub/analytics';
import styles from './ProgressionSurfaces.module.css';

// --- Continue Jogando Surface ---
interface ContinueJogandoProps {
  recommendations: RecommendationResult[];
  laneId?: string;
  title?: string;
}

export function ContinueJogando({
  recommendations,
  laneId = 'continue-jogando',
  title = 'Continue Jogando',
}: ContinueJogandoProps) {
  const games = recommendations.map(r => r.game);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && recommendations.length > 0) {
      trackContinueLaneImpression(games, laneId);
      trackRecommendations(recommendations, laneId);
      trackedRef.current = true;
    }
  }, [games, laneId, recommendations]);

  if (!recommendations.length) return null;

  return (
    <section className={styles.surface} data-surface="continue-jogando">
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.subtitle}>Continue onde parou</span>
      </div>
      <div className={styles.cardGrid}>
        {recommendations.map((rec) => (
          <div key={rec.game.slug} className={styles.cardWrapper}>
            <GameCard
              game={rec.game}
              laneId={laneId}
              variant="standard"
            />
            <div className={styles.reasonPill}>
              <ProgressionBadge type="continue" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Jogados Recentemente Surface ---
interface JogadosRecentementeProps {
  recommendations: RecommendationResult[];
  showCompleted?: boolean;
  maxItems?: number;
}

export function JogadosRecentemente({
  recommendations,
  showCompleted = false,
  maxItems = 4,
}: JogadosRecentementeProps) {
  const filtered = showCompleted
    ? recommendations
    : recommendations.filter(r => !isCompleted(r.game));

  const displayItems = filtered.slice(0, maxItems);
  const games = displayItems.map(r => r.game);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && displayItems.length > 0) {
      trackRecentLaneImpression(games);
      trackedRef.current = true;
    }
  }, [games, displayItems.length]);

  if (!displayItems.length) return null;

  return (
    <section className={styles.surface} data-surface="jogados-recentemente">
      <div className={styles.header}>
        <h2 className={styles.title}>Jogados Recentemente</h2>
        <span className={styles.subtitle}>Acesse seus jogos anteriores</span>
      </div>
      <div className={styles.cardGrid}>
        {displayItems.map((rec) => (
          <div key={rec.game.slug} className={styles.cardWrapper}>
            <GameCard
              game={rec.game}
              laneId="recentemente"
              variant="compact"
            />
            {isCompleted(rec.game) && (
              <div className={styles.reasonPill}>
                <ProgressionBadge type="concluído" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Próximo Passo Surface ---
interface ProximoPassoProps {
  recommendations: RecommendationResult[];
  maxItems?: number;
}

export function ProximoPasso({
  recommendations,
  maxItems = 3,
}: ProximoPassoProps) {
  const displayItems = recommendations.slice(0, maxItems);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && recommendations.length > 0) {
      trackRecommendations(recommendations, 'proximo-passo');
      trackedRef.current = true;
    }
  }, [recommendations]);

  if (!displayItems.length) return null;

  return (
    <section className={styles.surface} data-surface="proximo-passo">
      <div className={styles.header}>
        <h2 className={styles.title}>Próximo Passo</h2>
        <span className={styles.subtitle}>Sua jornada continua</span>
      </div>
      <div className={styles.cardGrid}>
        {displayItems.map((rec) => (
          <div key={rec.game.slug} className={styles.cardWrapper}>
            <GameCard
              game={rec.game}
              laneId="proximo-passo"
              variant="standard"
            />
            {rec.explanation && (
              <div className={styles.explanation}>
                {rec.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Você Pode Gostar Surface ---
interface VocePodeGostarProps {
  recommendations: RecommendationResult[];
  maxItems?: number;
}

export function VocePodeGostar({
  recommendations,
  maxItems = 3,
}: VocePodeGostarProps) {
  const displayItems = recommendations.slice(0, maxItems);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && recommendations.length > 0) {
      trackRecommendations(recommendations, 'voce-pode-gostar');
      trackedRef.current = true;
    }
  }, [recommendations]);

  if (!displayItems.length) return null;

  return (
    <section className={styles.surface} data-surface="voce-pode-gostar">
      <div className={styles.header}>
        <h2 className={styles.title}>Você Pode Gostar Também</h2>
        <span className={styles.subtitle}>Baseado nos seus interesses</span>
      </div>
      <div className={styles.cardGrid}>
        {displayItems.map((rec) => (
          <div key={rec.game.slug} className={styles.cardWrapper}>
            <GameCard
              game={rec.game}
              laneId="voce-pode-gostar"
              variant="standard"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Voltar para a Luta Surface ---
interface VoltarParaLutaProps {
  recommendations: RecommendationResult[];
  relatedTerritory?: string;
  maxItems?: number;
}

export function VoltarParaLuta({
  recommendations,
  relatedTerritory,
  maxItems = 2,
}: VoltarParaLutaProps) {
  const displayItems = recommendations.slice(0, maxItems);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && recommendations.length > 0) {
      trackRecommendations(recommendations, 'voltar-para-luta');
      trackedRef.current = true;
    }
  }, [recommendations]);

  if (!displayItems.length) return null;

  return (
    <section className={styles.surface} data-surface="voltar-para-luta">
      <div className={styles.header}>
        <h2 className={styles.title}>
          {relatedTerritory
            ? `Mais em ${relatedTerritory}`
            : 'Voltar para a Luta Relacionada'}
        </h2>
        <span className={styles.subtitle}>Conecte as lutas</span>
      </div>
      <div className={styles.cardGrid}>
        {displayItems.map((rec) => (
          <div key={rec.game.slug} className={styles.cardWrapper}>
            <GameCard
              game={rec.game}
              laneId="voltar-para-luta"
              variant="compact"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Compartilhar Surface ---
interface CompartilharSurfaceProps {
  shareableGames: RecommendationResult[];
  context?: 'post_game' | 'hub';
  maxItems?: number;
}

export function CompartilharSurface({
  shareableGames,
  context = 'hub',
  maxItems = 2,
}: CompartilharSurfaceProps) {
  const displayItems = shareableGames.slice(0, maxItems);
  if (!displayItems.length) return null;

  return (
    <section className={`${styles.surface} ${styles.shareSurface}`} data-surface="compartilhar">
      <div className={styles.header}>
        <h2 className={styles.title}>Perfeito para Compartilhar</h2>
        <span className={styles.subtitle}>Espalhe a mensagem</span>
      </div>
      <div className={styles.cardGrid}>
        {displayItems.map((rec) => (
          <div key={rec.game.slug} className={styles.cardWrapper}>
            <GameCard
              game={rec.game}
              laneId="compartilhar"
              variant={context === 'post_game' ? 'featured' : 'standard'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Return Message Banner ---
interface ReturnBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export function ReturnBanner({ message, onDismiss }: ReturnBannerProps) {
  if (!message) return null;

  return (
    <div className={styles.returnBanner} role="status">
      <span className={styles.returnMessage}>👋 {message}</span>
      {onDismiss && (
        <button
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dispensar mensagem"
        >
          ×
        </button>
      )}
    </div>
  );
}

// --- Utility Functions ---
function isCompleted(game: Game): boolean {
  if (typeof window === 'undefined') return false;
  const { loadProgression } = require('@/lib/hub/progression');
  const progression = loadProgression();
  return progression.completedGames.includes(game.slug);
}

// --- Types Re-exports for convenience ---
export type {
  RecommendationResult,
  RecommendationReason,
};
