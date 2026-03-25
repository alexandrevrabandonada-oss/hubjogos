'use client';

// Endgame Result Layer + Share Packs v1
// T71 — Unified Result Screen System

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Game, GameGenre, GAME_GENRE_LABELS, TERRITORY_SCOPE_LABELS, POLITICAL_THEME_LABELS } from '@/lib/games/catalog';
import { recommendAfterGame, getVocêPodeGostar, RecommendationResult } from '@/lib/hub/recommendation';
import { recordGameCompletion } from '@/lib/hub/progression';
import { 
  trackResultScreenView, 
  trackResultReplayClick, 
  trackResultNextGameClick,
  trackResultShareClick,
  trackResultCopyTextClick,
  trackResultRelatedIssueClick 
} from '@/lib/hub/analytics';
import styles from './ResultScreen.module.css';

// --- Types ---

export type OutcomeType = 
  | 'score_rank'      // Arcade: score + rank
  | 'win_loss'        // Win / Loss / Survive / Collapse
  | 'route_path'      // Route / Path taken
  | 'territory_state' // City / Territory state reached
  | 'archetype'       // Profile / Archetype result
  | 'narrative'       // Narrative ending
  | 'mixed';          // Score + interpretation

export type OutcomeSeverity = 'triumph' | 'success' | 'neutral' | 'struggle' | 'collapse';

export interface ResultData {
  outcomeType: OutcomeType;
  outcomeSeverity: OutcomeSeverity;
  title: string;
  summary: string;
  interpretation: string;
  mainMetric?: {
    label: string;
    value: string | number;
    unit?: string;
  };
  secondaryMetrics?: {
    label: string;
    value: string | number;
  }[];
  politicalFraming?: {
    struggle: string;
    tension: string;
    reflection: string;
  };
  shareData?: {
    title: string;
    description: string;
    hashtags?: string[];
  };
  nextSteps?: {
    replayRecommended?: boolean;
    deeperGame?: Game;
    lighterGame?: Game;
    sameTerritory?: Game;
    sameTheme?: Game;
  };
  // Metadata for analytics and progression
  metadata?: {
    gameSlug: string;
    genre: GameGenre;
    territory: string;
    politicalTheme: string;
    sessionDuration?: number;
    replayCount?: number;
  };
}

export interface ResultScreenProps {
  game: Game;
  result: ResultData;
  onReplay?: () => void;
  onClose?: () => void;
}

// --- Main Result Screen Component ---

export function ResultScreen({ game, result, onReplay, onClose }: ResultScreenProps) {
  // Record completion and track view on mount
  useEffect(() => {
    recordGameCompletion(game);
    trackResultScreenView(game, result.outcomeType, result.outcomeSeverity);
  }, [game, result]);

  const severityConfig = SEVERITY_CONFIG[result.outcomeSeverity];
  const genreConfig = GENRE_RESULT_CONFIG[game.genre];

  const handleReplay = () => {
    trackResultReplayClick(game, result.outcomeType);
    onReplay?.();
  };

  const handleShare = () => {
    trackResultShareClick(game, result.outcomeType);
    shareResult(result.shareData);
  };

  const handleCopyText = () => {
    trackResultCopyTextClick(game, result.outcomeType);
    copyResultText(result);
  };

  return (
    <div 
      className={`${styles.resultScreen} ${severityConfig.className}`}
      data-outcome-type={result.outcomeType}
      data-outcome-severity={result.outcomeSeverity}
      data-genre={game.genre}
    >
      {/* Header / Severity Indicator */}
      <header className={styles.resultHeader}>
        <div className={styles.severityBadge} style={{ backgroundColor: severityConfig.color }}>
          <span className={styles.severityIcon}>{severityConfig.icon}</span>
          <span className={styles.severityLabel}>{severityConfig.label}</span>
        </div>
        <p className={styles.genreLabel}>{genreConfig.label}</p>
      </header>

      {/* Main Result Area */}
      <section className={styles.mainResult}>
        <h1 className={styles.resultTitle}>{result.title}</h1>
        <p className={styles.resultSummary}>{result.summary}</p>
        
        {/* Main Metric */}
        {result.mainMetric && (
          <div className={styles.mainMetric}>
            <span className={styles.metricValue}>{result.mainMetric.value}</span>
            <span className={styles.metricLabel}>{result.mainMetric.label}</span>
            {result.mainMetric.unit && (
              <span className={styles.metricUnit}>{result.mainMetric.unit}</span>
            )}
          </div>
        )}

        {/* Secondary Metrics */}
        {result.secondaryMetrics && result.secondaryMetrics.length > 0 && (
          <div className={styles.secondaryMetrics}>
            {result.secondaryMetrics.map((metric, index) => (
              <div key={index} className={styles.secondaryMetric}>
                <span className={styles.secondaryMetricValue}>{metric.value}</span>
                <span className={styles.secondaryMetricLabel}>{metric.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interpretation */}
        <p className={styles.interpretation}>{result.interpretation}</p>
      </section>

      {/* Why This Result Matters */}
      {result.politicalFraming && (
        <section className={styles.whyMatters} data-section="why-result-matters">
          <h2 className={styles.sectionTitle}>O que este resultado revela</h2>
          
          <div className={styles.framingBlocks}>
            <div className={styles.framingBlock}>
              <h3>A tensão</h3>
              <p>{result.politicalFraming.tension}</p>
            </div>
            
            <div className={styles.framingBlock}>
              <h3>O contexto</h3>
              <p>{result.politicalFraming.struggle}</p>
            </div>
            
            <div className={styles.framingBlock}>
              <h3>Para refletir</h3>
              <p>{result.politicalFraming.reflection}</p>
            </div>
          </div>
        </section>
      )}

      {/* Share Pack Foundation */}
      {result.shareData && (
        <section className={styles.shareSection} data-section="share-pack">
          <h2 className={styles.sectionTitle}>Compartilhe seu resultado</h2>
          
          {/* Share Preview Card */}
          <div className={styles.shareCard}>
            <div className={styles.shareCardHeader} style={{ backgroundColor: severityConfig.color }}>
              <span className={styles.shareCardIcon}>{game.icon}</span>
              <span className={styles.shareCardSeverity}>{severityConfig.label}</span>
            </div>
            <div className={styles.shareCardBody}>
              <h3 className={styles.shareCardTitle}>{result.shareData.title}</h3>
              <p className={styles.shareCardDescription}>{result.shareData.description}</p>
              {result.shareData.hashtags && (
                <div className={styles.shareCardHashtags}>
                  {result.shareData.hashtags.map((tag, i) => (
                    <span key={i} className={styles.hashtag}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Share Actions */}
          <div className={styles.shareActions}>
            <button className={styles.shareButton} onClick={handleShare}>
              <span>📤</span>
              Compartilhar
            </button>
            <button className={styles.copyButton} onClick={handleCopyText}>
              <span>📋</span>
              Copiar texto
            </button>
          </div>
        </section>
      )}

      {/* Smart Next Steps */}
      <section className={styles.nextSteps} data-section="smart-next">
        <h2 className={styles.sectionTitle}>E agora?</h2>
        
        <div className={styles.nextStepsGrid}>
          {/* Replay */}
          {result.nextSteps?.replayRecommended !== false && (
            <button className={styles.nextStepCard} onClick={handleReplay} data-action="replay">
              <span className={styles.nextStepIcon}>🔄</span>
              <h3>Jogar novamente</h3>
              <p>Tente um resultado diferente</p>
            </button>
          )}

          {/* Deeper Game */}
          {result.nextSteps?.deeperGame && (
            <Link 
              href={`/games/${result.nextSteps.deeperGame.slug}`}
              className={styles.nextStepCard}
              data-action="deeper"
              onClick={() => trackResultNextGameClick(game, result.nextSteps!.deeperGame!.slug, 'deeper')}
            >
              <span className={styles.nextStepIcon}>⬇️</span>
              <h3>Mergulhar mais fundo</h3>
              <p>{result.nextSteps.deeperGame.title}</p>
            </Link>
          )}

          {/* Lighter Game */}
          {result.nextSteps?.lighterGame && (
            <Link 
              href={`/games/${result.nextSteps.lighterGame.slug}`}
              className={styles.nextStepCard}
              data-action="lighter"
              onClick={() => trackResultNextGameClick(game, result.nextSteps!.lighterGame!.slug, 'lighter')}
            >
              <span className={styles.nextStepIcon}>⬆️</span>
              <h3>Algo mais leve</h3>
              <p>{result.nextSteps.lighterGame.title}</p>
            </Link>
          )}

          {/* Same Territory */}
          {result.nextSteps?.sameTerritory && (
            <Link 
              href={`/games/${result.nextSteps.sameTerritory.slug}`}
              className={styles.nextStepCard}
              data-action="same-territory"
              onClick={() => {
                trackResultNextGameClick(game, result.nextSteps!.sameTerritory!.slug, 'territory');
                trackResultRelatedIssueClick(game, result.nextSteps!.sameTerritory!.territoryScope);
              }}
            >
              <span className={styles.nextStepIcon}>🗺️</span>
              <h3>Mesmo território</h3>
              <p>{TERRITORY_SCOPE_LABELS[result.nextSteps.sameTerritory.territoryScope]}</p>
            </Link>
          )}

          {/* Same Theme */}
          {result.nextSteps?.sameTheme && (
            <Link 
              href={`/games/${result.nextSteps.sameTheme.slug}`}
              className={styles.nextStepCard}
              data-action="same-theme"
              onClick={() => trackResultNextGameClick(game, result.nextSteps!.sameTheme!.slug, 'theme')}
            >
              <span className={styles.nextStepIcon}>🏷️</span>
              <h3>Mesma luta</h3>
              <p>{POLITICAL_THEME_LABELS[result.nextSteps.sameTheme.politicalThemes[0]]}</p>
            </Link>
          )}

          {/* Share */}
          <button className={`${styles.nextStepCard} ${styles.shareCardAction}`} onClick={handleShare} data-action="share">
            <span className={styles.nextStepIcon}>📢</span>
            <h3>Compartilhar</h3>
            <p>Espalhe esta mensagem</p>
          </button>
        </div>
      </section>

      {/* Footer / Close */}
      <footer className={styles.resultFooter}>
        <Link href="/" className={styles.closeButton} onClick={onClose}>
          ← Voltar ao Hub
        </Link>
      </footer>
    </div>
  );
}

// --- Configuration ---

const SEVERITY_CONFIG: Record<OutcomeSeverity, {
  label: string;
  icon: string;
  color: string;
  className: string;
}> = {
  triumph: {
    label: 'Vitória Estratégica',
    icon: '🏆',
    color: '#16a34a',
    className: styles.severityTriumph,
  },
  success: {
    label: 'Resultado Positivo',
    icon: '✓',
    color: '#22c55e',
    className: styles.severitySuccess,
  },
  neutral: {
    label: 'Resultado Neutro',
    icon: '◆',
    color: '#6b7280',
    className: styles.severityNeutral,
  },
  struggle: {
    label: 'Sobrevivência',
    icon: '⚡',
    color: '#f59e0b',
    className: styles.severityStruggle,
  },
  collapse: {
    label: 'Colapso Sistêmico',
    icon: '⚠️',
    color: '#dc2626',
    className: styles.severityCollapse,
  },
};

const GENRE_RESULT_CONFIG: Record<GameGenre, {
  label: string;
  resultFocus: string;
}> = {
  arcade: {
    label: 'Experiência Arcade',
    resultFocus: 'score_and_reflex',
  },
  platform: {
    label: 'Desafio de Plataforma',
    resultFocus: 'completion_and_mastery',
  },
  simulation: {
    label: 'Simulação Sistêmica',
    resultFocus: 'state_and_tradeoffs',
  },
  management: {
    label: 'Gestão e Recursos',
    resultFocus: 'sacrifices_and_sustainability',
  },
  strategy: {
    label: 'Estratégia e Consequências',
    resultFocus: 'sequencing_and_priorities',
  },
  narration: {
    label: 'Jornada Narrativa',
    resultFocus: 'path_and_values',
  },
  quiz: {
    label: 'Reflexão e Perfil',
    resultFocus: 'profile_and_tendency',
  },
};

// --- Helper Functions ---

async function shareResult(shareData?: ResultData['shareData']) {
  if (!shareData) return;

  const shareText = `${shareData.title}\n${shareData.description}\n${shareData.hashtags?.map(h => `#${h}`).join(' ') || ''}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.description,
      });
    } catch {
      // User cancelled
    }
  } else {
    await copyResultText({ shareData } as ResultData);
  }
}

async function copyResultText(result: ResultData) {
  if (!result.shareData) return;

  const text = `${result.shareData.title}\n${result.shareData.description}\n\n${result.shareData.hashtags?.map(h => `#${h}`).join(' ') || ''}`;

  try {
    await navigator.clipboard.writeText(text);
    alert('Resultado copiado!');
  } catch {
    // Clipboard not available
  }
}

// --- Factory Functions for Easy Result Creation ---

export function createArcadeResult(
  game: Game,
  score: number,
  rank: string,
  highScore?: number
): ResultData {
  const isNewRecord = highScore ? score > highScore : false;
  
  return {
    outcomeType: 'score_rank',
    outcomeSeverity: isNewRecord ? 'triumph' : score > 0 ? 'success' : 'struggle',
    title: isNewRecord ? 'Novo Recorde!' : rank,
    summary: `Você marcou ${score} pontos em ${GAME_GENRE_LABELS[game.genre]}`,
    interpretation: isNewRecord 
      ? 'Seus reflexos e decisões rápidas levaram a um resultado excepcional.'
      : 'Cada tentativa é uma chance de melhorar. A prática leva à maestria.',
    mainMetric: {
      label: 'Pontuação',
      value: score,
    },
    secondaryMetrics: highScore ? [
      { label: 'Recorde anterior', value: highScore },
    ] : undefined,
    politicalFraming: {
      struggle: 'A urgência política exige reflexos rápidos e decisões sob pressão.',
      tension: 'Como em um mutirão de emergência, segundos importam.',
      reflection: 'O que você priorizou quando o tempo era curto?',
    },
    shareData: {
      title: `${isNewRecord ? '🏆 Recorde em' : '🎮 Joguei'} ${game.title}`,
      description: `Marquei ${score} pontos! ${game.shortDescription}`,
      hashtags: ['HubDeJogos', game.territoryScope.replace(/-/g, '')],
    },
    nextSteps: {
      replayRecommended: true,
    },
    metadata: {
      gameSlug: game.slug,
      genre: game.genre,
      territory: game.territoryScope,
      politicalTheme: game.politicalThemes[0],
    },
  };
}

export function createNarrativeResult(
  game: Game,
  endingBranch: string,
  endingTitle: string,
  valuesTension: string
): ResultData {
  return {
    outcomeType: 'narrative',
    outcomeSeverity: 'neutral',
    title: endingTitle,
    summary: `Você chegou ao final: "${endingBranch}"`,
    interpretation: 'Suas escolhas construíram este caminho único. Cada decisão importou.',
    mainMetric: {
      label: 'Caminho',
      value: endingBranch,
    },
    politicalFraming: {
      struggle: valuesTension,
      tension: 'Narrativas políticas reais não têm finais perfeitos, apenas consequências.',
      reflection: 'Como suas escolhas refletem seus valores políticos reais?',
    },
    shareData: {
      title: `Completei ${game.title}`,
      description: `Cheguei ao final "${endingBranch}". ${game.shortDescription}`,
      hashtags: ['HubDeJogos', 'Narrativa'],
    },
    nextSteps: {
      replayRecommended: true,
    },
    metadata: {
      gameSlug: game.slug,
      genre: game.genre,
      territory: game.territoryScope,
      politicalTheme: game.politicalThemes[0],
    },
  };
}

export function createSimulationResult(
  game: Game,
  finalState: string,
  tradeoffsExposed: string[],
  sustainability: 'high' | 'medium' | 'low'
): ResultData {
  const severity: OutcomeSeverity = 
    sustainability === 'high' ? 'success' : 
    sustainability === 'medium' ? 'neutral' : 'collapse';

  return {
    outcomeType: 'territory_state',
    outcomeSeverity: severity,
    title: `Estado Final: ${finalState}`,
    summary: `Sua gestão resultou em ${sustainability === 'high' ? 'sustentabilidade' : sustainability === 'medium' ? 'estabilidade frágil' : 'colapso sistêmico'}`,
    interpretation: 'Sistemas complexos revelam suas dinâmicas através de suas consequências.',
    mainMetric: {
      label: 'Sustentabilidade',
      value: sustainability === 'high' ? 'Alta' : sustainability === 'medium' ? 'Média' : 'Baixa',
    },
    secondaryMetrics: tradeoffsExposed.map(t => ({ label: 'Trade-off', value: t })),
    politicalFraming: {
      struggle: 'Orçamentos municipais exigem escolhas dolorosas entre necessidades vitais.',
      tension: 'Não há soluções perfeitas, apenas equilíbrios tensos.',
      reflection: 'Quem sofreu com suas escolhas? Quem se beneficiou?',
    },
    shareData: {
      title: `Gerenciei ${game.title}`,
      description: `Resultado: ${finalState}. ${game.shortDescription}`,
      hashtags: ['HubDeJogos', 'Simulação'],
    },
    nextSteps: {
      replayRecommended: true,
    },
    metadata: {
      gameSlug: game.slug,
      genre: game.genre,
      territory: game.territoryScope,
      politicalTheme: game.politicalThemes[0],
    },
  };
}

export default ResultScreen;
