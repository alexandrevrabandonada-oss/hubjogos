/**
 * Effective Runs - Tijolo 33
 * 
 * Camada de análise que separa "cliques bonitos" de "runs efetivas".
 * 
 * Conceitos fundamentais:
 * - Effective Run: clique em card seguido de first input válido (game_start ou first_interaction_time)
 * - Effective Replay: replay_click seguido de nova run_start em janela < 60s
 * - Effective Cross-game: next_game_click seguido de game_start do próximo jogo em janela < 90s
 * 
 * Objetivos:
 * - Medir comportamento real, não sinalização superficial
 * - Informar distribuição baseada em runs efetivas, não CTR vazio
 * - Identificar jogos que realmente puxam replay e cross-game
 */

import type { AnalyticsEventPayload } from './events';

/**
 * Janelas temporais para considerar eventos como "conectados"
 */
const EFFECTIVE_RUN_WINDOW_MS = 60_000; // 60s entre click e first input
const EFFECTIVE_REPLAY_WINDOW_MS = 60_000; // 60s entre replay_click e novo run_start
const EFFECTIVE_CROSS_GAME_WINDOW_MS = 90_000; // 90s entre next_game_click e game_start do próximo

/**
 * Status de amostra para scorecards
 */
export type ScorecardStatus =
  | 'insufficient_data' // < 10 eventos
  | 'monitoring' // >= 10, mas < 30
  | 'directional_signal' // >= 30, but < 100
  | 'useful_signal'; // >= 100

/**
 * Scorecard de conversão efetiva
 */
export interface EffectiveConversionScorecard {
  name: string;
  totalClicks: number;
  effectiveConversions: number;
  conversionRate: number; // %
  status: ScorecardStatus;
  sampleWarning?: string;
}

export interface EffectiveDirectionSummary {
  clicks: number;
  effectiveStarts: number;
  effectiveRate: number;
}

export interface EffectiveSegmentRow {
  key: string;
  label: string;
  cardClicks: number;
  effectiveRuns: number;
  effectiveRunRate: number;
  replayClicks: number;
  effectiveReplays: number;
  effectiveReplayRate: number;
  crossClicks: number;
  effectiveCrossStarts: number;
  effectiveCrossRate: number;
  totalSignals: number;
  status: ScorecardStatus;
  warning?: string;
}

export interface EffectiveRunsAnalysisOptions {
  sessions?: Array<{
    sessionId: string;
    slug?: string;
    utmSource?: string | null;
    referrer?: string | null;
  }>;
  territoryBySlug?: Record<string, string>;
}

/**
 * Resultado de análise de runs efetivas
 */
export interface EffectiveRunsAnalysis {
  // Preview → Play efetivo
  previewToPlay: EffectiveConversionScorecard;
  
  // Card Full Click → Run efetivo
  cardClickToRun: EffectiveConversionScorecard;
  
  // Replay click → Replay efetivo
  replayEffectiveness: EffectiveConversionScorecard;
  
  // Next game click → Cross-game efetivo
  crossGameEffectiveness: EffectiveConversionScorecard;
  
  // Quick → Arcade efetivo
  quickToArcadeEffective: EffectiveConversionScorecard;
  
  // Arcade → Quick efetivo
  arcadeToQuickEffective: EffectiveConversionScorecard;

  // Pacote consolidado para leitura operacional
  scorecards: {
    previewToPlay: EffectiveConversionScorecard;
    cardClickToRun: EffectiveConversionScorecard;
    replayEffectiveness: EffectiveConversionScorecard;
    crossGameEffectiveness: EffectiveConversionScorecard;
    quickToArcadeEffective: EffectiveConversionScorecard;
    arcadeToQuickEffective: EffectiveConversionScorecard;
  };
  
  // Runs efetivas por jogo
  effectiveRunsByGame: Map<string, EffectiveGameRuns>;
  
  // Replay efetivo por jogo
  effectiveReplayByGame: Map<string, EffectiveReplayData>;
  
  // Cross-game efetivo (from → to)
  effectiveCrossGame: Map<string, Map<string, number>>;

  // Sumários operacionais
  topEffectiveRunsByGame: EffectiveGameRuns[];
  topEffectiveReplayByGame: EffectiveReplayData[];
  crossGameBridges: EffectiveCrossGameData[];
  direction: {
    quickToArcade: EffectiveDirectionSummary;
    arcadeToQuick: EffectiveDirectionSummary;
  };
  directionWinner: 'balanced' | 'quick_to_arcade' | 'arcade_to_quick';
  byChannel: EffectiveSegmentRow[];
  byTerritory: EffectiveSegmentRow[];
  
  // Warnings de baixa amostra
  warnings: string[];
}

/**
 * Dados de runs efetivas por jogo
 */
export interface EffectiveGameRuns {
  slug: string;
  cardClicks: number;
  effectiveRuns: number;
  effectiveRunRate: number; // %
  previewInteractions: number;
  effectiveFromPreview: number;
  previewConversionRate: number; // %
  avgClickToPlayMs: number;
  firstInputCount: number;
}

/**
 * Dados de replay efetivo por jogo
 */
export interface EffectiveReplayData {
  slug: string;
  replayClicks: number;
  effectiveReplays: number;
  effectiveReplayRate: number; // %
  completions: number; // Base para % de replay sobre completions
  replayPerCompletion: number; // %
}

/**
 * Dado de cross-game efetivo
 */
export interface EffectiveCrossGameData {
  from: string;
  to: string;
  clicks: number;
  effectiveStarts: number;
  effectiveRate: number; // %
}

/**
 * Determina status de scorecard baseado na amostra
 */
function getStatus(total: number): ScorecardStatus {
  if (total < 10) return 'insufficient_data';
  if (total < 30) return 'monitoring';
  if (total < 100) return 'directional_signal';
  return 'useful_signal';
}

/**
 * Gera warning de amostra se necessário
 */
function getSampleWarning(total: number, name: string): string | undefined {
  if (total < 10) {
    return `${name}: amostra insuficiente (${total} < 10)`;
  }
  if (total < 30) {
    return `${name}: monitorando, amostra ainda baixa (${total} < 30)`;
  }
  return undefined;
}

interface SegmentStats {
  key: string;
  label: string;
  cardClicks: number;
  effectiveRuns: number;
  replayClicks: number;
  effectiveReplays: number;
  crossClicks: number;
  effectiveCrossStarts: number;
}

function normalizeChannel(source?: string | null): string {
  const raw = String(source || '').toLowerCase().trim();
  if (!raw || raw === 'direto/desconhecido') {
    return 'site_direto';
  }
  if (raw.includes('instagram') || raw === 'ig') return 'instagram';
  if (raw.includes('tiktok') || raw.includes('tik-tok')) return 'tiktok';
  if (raw.includes('whatsapp') || raw.includes('wa')) return 'whatsapp';
  if (raw.includes('youtube') || raw.includes('yt')) return 'youtube';
  if (raw === 'direto' || raw === 'direct' || raw.includes('organic')) return 'site_direto';
  return 'site_direto';
}

function normalizeTerritory(value?: string | null): string {
  const raw = String(value || '').toLowerCase().trim();
  if (!raw) return 'estado-rj';
  if (raw.includes('volta-redonda') || raw === 'volta redonda') return 'volta-redonda';
  if (raw.includes('estado-rj') || raw.includes('estado-do-rio') || raw === 'estado') return 'estado-rj';
  return raw;
}

function getOrCreateSegment(map: Map<string, SegmentStats>, key: string): SegmentStats {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }

  const created: SegmentStats = {
    key,
    label: key,
    cardClicks: 0,
    effectiveRuns: 0,
    replayClicks: 0,
    effectiveReplays: 0,
    crossClicks: 0,
    effectiveCrossStarts: 0,
  };
  map.set(key, created);
  return created;
}

function formatSegmentLabel(key: string, kind: 'channel' | 'territory'): string {
  if (kind === 'channel') {
    if (key === 'site_direto') return 'site/direto';
    return key;
  }
  if (key === 'estado-rj') return 'estado-rj';
  if (key === 'volta-redonda') return 'volta-redonda';
  return key;
}

function toSegmentRows(map: Map<string, SegmentStats>, kind: 'channel' | 'territory'): EffectiveSegmentRow[] {
  return Array.from(map.values())
    .map((row) => {
      const totalSignals = row.cardClicks + row.replayClicks + row.crossClicks;
      const warning = getSampleWarning(totalSignals, `Segmento ${row.key}`);
      return {
        key: row.key,
        label: formatSegmentLabel(row.key, kind),
        cardClicks: row.cardClicks,
        effectiveRuns: row.effectiveRuns,
        effectiveRunRate: row.cardClicks > 0 ? Math.round((row.effectiveRuns / row.cardClicks) * 100) : 0,
        replayClicks: row.replayClicks,
        effectiveReplays: row.effectiveReplays,
        effectiveReplayRate: row.replayClicks > 0 ? Math.round((row.effectiveReplays / row.replayClicks) * 100) : 0,
        crossClicks: row.crossClicks,
        effectiveCrossStarts: row.effectiveCrossStarts,
        effectiveCrossRate: row.crossClicks > 0 ? Math.round((row.effectiveCrossStarts / row.crossClicks) * 100) : 0,
        totalSignals,
        status: getStatus(totalSignals),
        warning,
      };
    })
    .sort((a, b) => {
      if (b.effectiveRunRate !== a.effectiveRunRate) return b.effectiveRunRate - a.effectiveRunRate;
      return b.totalSignals - a.totalSignals;
    });
}

/**
 * Analisa eventos brutos para extrair runs efetivas
 * 
 * @param events - Array de eventos analytics ordenados por timestamp
 * @returns Análise completa de runs efetivas
 */
export function analyzeEffectiveRuns(
  events: AnalyticsEventPayload[],
  options?: EffectiveRunsAnalysisOptions,
): EffectiveRunsAnalysis {
  // Ordenar eventos por timestamp
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const sessionSource = new Map<string, string>();
  const sessionSlug = new Map<string, string>();
  for (const session of options?.sessions || []) {
    sessionSource.set(session.sessionId, normalizeChannel(session.utmSource));
    if (session.slug) {
      sessionSlug.set(session.sessionId, session.slug);
    }
  }

  const territoryBySlug = options?.territoryBySlug || {};
  const segmentByChannel = new Map<string, SegmentStats>();
  const segmentByTerritory = new Map<string, SegmentStats>();

  // Estruturas de dados para análise
  const previewClicks: Map<string, { timestamp: number; game: string }[]> = new Map();
  const cardClicks: Map<string, { timestamp: number; game: string; sessionId: string; channel: string; territory: string }[]> = new Map();
  const replayClicks: Map<string, { timestamp: number; game: string; sessionId: string; channel: string; territory: string }[]> = new Map();
  const nextGameClicks: Map<string, { timestamp: number; fromGame: string; toGame: string; sessionId: string; channel: string; territory: string }[]> = new Map();
  const quickToArcadeClicks: Map<string, { timestamp: number; fromGame: string; toGame: string }[]> = new Map();
  const arcadeToQuickClicks: Map<string, { timestamp: number; fromGame: string; toGame: string }[]> = new Map();
  
  const effectiveRuns: Set<string> = new Set(); // sessionId:game:timestamp
  const effectiveReplays: Set<string> = new Set();
  const effectiveCrossGames: Set<string> = new Set();
  const effectiveQuickToArcade: Set<string> = new Set();
  const effectiveArcadeToQuick: Set<string> = new Set();
  const effectiveFromPreview: Set<string> = new Set();

  // Contadores por jogo
  const gameCardClicks: Map<string, number> = new Map();
  const gamePreviewInteractions: Map<string, number> = new Map();
  const gameReplayClicks: Map<string, number> = new Map();
  const gameCompletions: Map<string, number> = new Map();
  const gameFirstInputTimes: Map<string, number[]> = new Map();
  
  const crossGameClicks: Map<string, Map<string, number>> = new Map();
  const crossGameEffective: Map<string, Map<string, number>> = new Map();

  // Primeira passagem: categorizar eventos
  for (const event of sortedEvents) {
    const timestamp = new Date(event.createdAt).getTime();
    const game = event.slug || 'unknown';
    const sessionId = event.sessionId;
    const sessionGame = sessionSlug.get(sessionId) || game;
    const territory = normalizeTerritory(territoryBySlug[sessionGame] || territoryBySlug[game]);
    const channel = sessionSource.get(sessionId) || 'site_direto';

  if (event.event === 'card_preview_interaction') {
      if (!previewClicks.has(sessionId)) previewClicks.set(sessionId, []);
      previewClicks.get(sessionId)!.push({ timestamp, game });
      gamePreviewInteractions.set(game, (gamePreviewInteractions.get(game) || 0) + 1);
    }

  if (event.event === 'card_full_click') {
      if (!cardClicks.has(sessionId)) cardClicks.set(sessionId, []);
      cardClicks.get(sessionId)!.push({ timestamp, game, sessionId, channel, territory });
      gameCardClicks.set(game, (gameCardClicks.get(game) || 0) + 1);
      getOrCreateSegment(segmentByChannel, channel).cardClicks += 1;
      getOrCreateSegment(segmentByTerritory, territory).cardClicks += 1;
    }

  if (event.event === 'replay_after_run_click' || 
    event.event === 'replay_click' || 
    event.event === 'outcome_replay_intent' ||
    event.event === 'arcade_replay_click') {
      if (!replayClicks.has(sessionId)) replayClicks.set(sessionId, []);
      replayClicks.get(sessionId)!.push({ timestamp, game, sessionId, channel, territory });
      gameReplayClicks.set(game, (gameReplayClicks.get(game) || 0) + 1);
      getOrCreateSegment(segmentByChannel, channel).replayClicks += 1;
      getOrCreateSegment(segmentByTerritory, territory).replayClicks += 1;
    }

  if (event.event === 'next_game_after_run_click' || event.event === 'next_game_click') {
      const toGame = (event.metadata?.nextGameSlug || event.metadata?.slug) as string;
      if (toGame) {
        if (!nextGameClicks.has(sessionId)) nextGameClicks.set(sessionId, []);
        nextGameClicks.get(sessionId)!.push({ timestamp, fromGame: game, toGame, sessionId, channel, territory });
        
        if (!crossGameClicks.has(game)) crossGameClicks.set(game, new Map());
        crossGameClicks.get(game)!.set(toGame, (crossGameClicks.get(game)!.get(toGame) || 0) + 1);
        getOrCreateSegment(segmentByChannel, channel).crossClicks += 1;
        getOrCreateSegment(segmentByTerritory, territory).crossClicks += 1;
      }
    }

  if (event.event === 'quick_to_arcade_click') {
      const toGame = event.metadata?.arcadeSlug as string;
      if (toGame) {
        if (!quickToArcadeClicks.has(sessionId)) quickToArcadeClicks.set(sessionId, []);
        quickToArcadeClicks.get(sessionId)!.push({ timestamp, fromGame: game, toGame });
      }
    }

  if (event.event === 'arcade_to_quick_click') {
      const toGame = event.metadata?.quickSlug as string;
      if (toGame) {
        if (!arcadeToQuickClicks.has(sessionId)) arcadeToQuickClicks.set(sessionId, []);
        arcadeToQuickClicks.get(sessionId)!.push({ timestamp, fromGame: game, toGame });
      }
    }

  if (event.event === 'game_complete') {
      gameCompletions.set(game, (gameCompletions.get(game) || 0) + 1);
    }

  if (event.event === 'first_interaction_time' || event.event === 'arcade_first_input_time') {
      const ms = Number(event.metadata?.msSinceStart || event.metadata?.ms || 0);
      if (ms > 0) {
        if (!gameFirstInputTimes.has(game)) gameFirstInputTimes.set(game, []);
        gameFirstInputTimes.get(game)!.push(ms);
      }
    }
  }

  // Segunda passagem: validar efetividade
  for (const event of sortedEvents) {
    const timestamp = new Date(event.createdAt).getTime();
    const game = event.slug || 'unknown';
    const sessionId = event.sessionId;

    // Validar effective run (card_full_click → game_start ou first_interaction)
    if (event.event === 'game_start' || 
      event.event === 'first_interaction_time' ||
      event.event === 'arcade_run_start' ||
      event.event === 'arcade_first_input_time') {
      
      const sessionCardClicks = cardClicks.get(sessionId) || [];
      for (const click of sessionCardClicks) {
        if (click.game === game && 
            timestamp > click.timestamp && 
            timestamp - click.timestamp <= EFFECTIVE_RUN_WINDOW_MS) {
          const key = `${sessionId}:${game}:${click.timestamp}`;
          if (!effectiveRuns.has(key)) {
            effectiveRuns.add(key);
            getOrCreateSegment(segmentByChannel, click.channel).effectiveRuns += 1;
            getOrCreateSegment(segmentByTerritory, click.territory).effectiveRuns += 1;
          }
        }
      }

      // Validar effective from preview
      const sessionPreviews = previewClicks.get(sessionId) || [];
      for (const preview of sessionPreviews) {
        if (preview.game === game && 
            timestamp > preview.timestamp && 
            timestamp - preview.timestamp <= EFFECTIVE_RUN_WINDOW_MS) {
          effectiveFromPreview.add(`${sessionId}:${game}:${preview.timestamp}`);
        }
      }

      // Validar effective replay
      const sessionReplays = replayClicks.get(sessionId) || [];
      for (const replay of sessionReplays) {
        if (replay.game === game && 
            timestamp > replay.timestamp && 
            timestamp - replay.timestamp <= EFFECTIVE_REPLAY_WINDOW_MS) {
          const key = `${sessionId}:${game}:${replay.timestamp}`;
          if (!effectiveReplays.has(key)) {
            effectiveReplays.add(key);
            getOrCreateSegment(segmentByChannel, replay.channel).effectiveReplays += 1;
            getOrCreateSegment(segmentByTerritory, replay.territory).effectiveReplays += 1;
          }
        }
      }
    }

    // Validar effective cross-game
    if (event.event === 'game_start' || event.event === 'arcade_run_start') {
      const sessionNextGameClicks = nextGameClicks.get(sessionId) || [];
      for (const click of sessionNextGameClicks) {
        if (click.toGame === game && 
            timestamp > click.timestamp && 
            timestamp - click.timestamp <= EFFECTIVE_CROSS_GAME_WINDOW_MS) {
          const key = `${sessionId}:${click.fromGame}:${game}:${click.timestamp}`;
          if (!effectiveCrossGames.has(key)) {
            effectiveCrossGames.add(key);
            getOrCreateSegment(segmentByChannel, click.channel).effectiveCrossStarts += 1;
            getOrCreateSegment(segmentByTerritory, click.territory).effectiveCrossStarts += 1;

            if (!crossGameEffective.has(click.fromGame)) {
              crossGameEffective.set(click.fromGame, new Map());
            }
            crossGameEffective.get(click.fromGame)!.set(
              game,
              (crossGameEffective.get(click.fromGame)!.get(game) || 0) + 1
            );
          }
        }
      }

      // Validar quick → arcade efetivo
      const sessionQuickToArcade = quickToArcadeClicks.get(sessionId) || [];
      for (const click of sessionQuickToArcade) {
        if (click.toGame === game && 
            timestamp > click.timestamp && 
            timestamp - click.timestamp <= EFFECTIVE_CROSS_GAME_WINDOW_MS) {
          effectiveQuickToArcade.add(`${sessionId}:${click.fromGame}:${game}:${click.timestamp}`);
        }
      }

      // Validar arcade → quick efetivo
      const sessionArcadeToQuick = arcadeToQuickClicks.get(sessionId) || [];
      for (const click of sessionArcadeToQuick) {
        if (click.toGame === game && 
            timestamp > click.timestamp && 
            timestamp - click.timestamp <= EFFECTIVE_CROSS_GAME_WINDOW_MS) {
          effectiveArcadeToQuick.add(`${sessionId}:${click.fromGame}:${game}:${click.timestamp}`);
        }
      }
    }
  }

  // Consolidar dados por jogo
  const effectiveRunsByGame = new Map<string, EffectiveGameRuns>();
  const effectiveReplayByGame = new Map<string, EffectiveReplayData>();

  const allGames = new Set([
    ...gameCardClicks.keys(),
    ...gamePreviewInteractions.keys(),
    ...gameReplayClicks.keys(),
    ...gameCompletions.keys(),
  ]);

  for (const slug of allGames) {
    const cardClicks = gameCardClicks.get(slug) || 0;
    const previewInteractions = gamePreviewInteractions.get(slug) || 0;
    const replayClicks = gameReplayClicks.get(slug) || 0;
    const completions = gameCompletions.get(slug) || 0;
    const firstInputTimes = gameFirstInputTimes.get(slug) || [];

    const effectiveRunsForGame = Array.from(effectiveRuns).filter((key) => key.includes(`:${slug}:`)).length;
    const effectiveFromPreviewForGame = Array.from(effectiveFromPreview).filter((key) => key.includes(`:${slug}:`)).length;
    const effectiveReplaysForGame = Array.from(effectiveReplays).filter((key) => key.includes(`:${slug}:`)).length;

    const avgClickToPlay = firstInputTimes.length > 0
      ? Math.round(firstInputTimes.reduce((a, b) => a + b, 0) / firstInputTimes.length)
      : 0;

    effectiveRunsByGame.set(slug, {
      slug,
      cardClicks,
      effectiveRuns: effectiveRunsForGame,
      effectiveRunRate: cardClicks > 0 ? Math.round((effectiveRunsForGame / cardClicks) * 100) : 0,
      previewInteractions,
      effectiveFromPreview: effectiveFromPreviewForGame,
      previewConversionRate: previewInteractions > 0 ? Math.round((effectiveFromPreviewForGame / previewInteractions) * 100) : 0,
      avgClickToPlayMs: avgClickToPlay,
      firstInputCount: firstInputTimes.length,
    });

    effectiveReplayByGame.set(slug, {
      slug,
      replayClicks,
      effectiveReplays: effectiveReplaysForGame,
      effectiveReplayRate: replayClicks > 0 ? Math.round((effectiveReplaysForGame / replayClicks) * 100) : 0,
      completions,
      replayPerCompletion: completions > 0 ? Math.round((effectiveReplaysForGame / completions) * 100) : 0,
    });
  }

  // Scorecards consolidados
  const totalCardClicks = Array.from(gameCardClicks.values()).reduce((a, b) => a + b, 0);
  const totalEffectiveRuns = effectiveRuns.size;
  const totalPreviewInteractions = Array.from(gamePreviewInteractions.values()).reduce((a, b) => a + b, 0);
  const totalEffectiveFromPreview = effectiveFromPreview.size;
  const totalReplayClicks = Array.from(gameReplayClicks.values()).reduce((a, b) => a + b, 0);
  const totalEffectiveReplays = effectiveReplays.size;
  const totalNextGameClicks = Array.from(nextGameClicks.values()).reduce((arr, val) => arr + val.length, 0);
  const totalEffectiveCrossGames = effectiveCrossGames.size;
  const totalQuickToArcadeClicks = Array.from(quickToArcadeClicks.values()).reduce((arr, val) => arr + val.length, 0);
  const totalEffectiveQuickToArcade = effectiveQuickToArcade.size;
  const totalArcadeToQuickClicks = Array.from(arcadeToQuickClicks.values()).reduce((arr, val) => arr + val.length, 0);
  const totalEffectiveArcadeToQuick = effectiveArcadeToQuick.size;

  const warnings: string[] = [];

  const previewToPlay: EffectiveConversionScorecard = {
    name: 'Preview → Play efetivo',
    totalClicks: totalPreviewInteractions,
    effectiveConversions: totalEffectiveFromPreview,
    conversionRate: totalPreviewInteractions > 0 ? Math.round((totalEffectiveFromPreview / totalPreviewInteractions) * 100) : 0,
    status: getStatus(totalPreviewInteractions),
    sampleWarning: getSampleWarning(totalPreviewInteractions, 'Preview → Play'),
  };
  if (previewToPlay.sampleWarning) warnings.push(previewToPlay.sampleWarning);

  const cardClickToRun: EffectiveConversionScorecard = {
    name: 'Card Click → Run efetivo',
    totalClicks: totalCardClicks,
    effectiveConversions: totalEffectiveRuns,
    conversionRate: totalCardClicks > 0 ? Math.round((totalEffectiveRuns / totalCardClicks) * 100) : 0,
    status: getStatus(totalCardClicks),
    sampleWarning: getSampleWarning(totalCardClicks, 'Card Click → Run'),
  };
  if (cardClickToRun.sampleWarning) warnings.push(cardClickToRun.sampleWarning);

  const replayEffectiveness: EffectiveConversionScorecard = {
    name: 'Replay efetivo',
    totalClicks: totalReplayClicks,
    effectiveConversions: totalEffectiveReplays,
    conversionRate: totalReplayClicks > 0 ? Math.round((totalEffectiveReplays / totalReplayClicks) * 100) : 0,
    status: getStatus(totalReplayClicks),
    sampleWarning: getSampleWarning(totalReplayClicks, 'Replay efetivo'),
  };
  if (replayEffectiveness.sampleWarning) warnings.push(replayEffectiveness.sampleWarning);

  const crossGameEffectiveness: EffectiveConversionScorecard = {
    name: 'Cross-game efetivo',
    totalClicks: totalNextGameClicks,
    effectiveConversions: totalEffectiveCrossGames,
    conversionRate: totalNextGameClicks > 0 ? Math.round((totalEffectiveCrossGames / totalNextGameClicks) * 100) : 0,
    status: getStatus(totalNextGameClicks),
    sampleWarning: getSampleWarning(totalNextGameClicks, 'Cross-game efetivo'),
  };
  if (crossGameEffectiveness.sampleWarning) warnings.push(crossGameEffectiveness.sampleWarning);

  const quickToArcadeEffective: EffectiveConversionScorecard = {
    name: 'Quick → Arcade efetivo',
    totalClicks: totalQuickToArcadeClicks,
    effectiveConversions: totalEffectiveQuickToArcade,
    conversionRate: totalQuickToArcadeClicks > 0 ? Math.round((totalEffectiveQuickToArcade / totalQuickToArcadeClicks) * 100) : 0,
    status: getStatus(totalQuickToArcadeClicks),
    sampleWarning: getSampleWarning(totalQuickToArcadeClicks, 'Quick → Arcade'),
  };
  if (quickToArcadeEffective.sampleWarning) warnings.push(quickToArcadeEffective.sampleWarning);

  const arcadeToQuickEffective: EffectiveConversionScorecard = {
    name: 'Arcade → Quick efetivo',
    totalClicks: totalArcadeToQuickClicks,
    effectiveConversions: totalEffectiveArcadeToQuick,
    conversionRate: totalArcadeToQuickClicks > 0 ? Math.round((totalEffectiveArcadeToQuick / totalArcadeToQuickClicks) * 100) : 0,
    status: getStatus(totalArcadeToQuickClicks),
    sampleWarning: getSampleWarning(totalArcadeToQuickClicks, 'Arcade → Quick'),
  };
  if (arcadeToQuickEffective.sampleWarning) warnings.push(arcadeToQuickEffective.sampleWarning);

  const topEffectiveRunsByGame = Array.from(effectiveRunsByGame.values())
    .filter((row) => row.cardClicks > 0)
    .sort((a, b) => b.effectiveRunRate - a.effectiveRunRate)
    .slice(0, 10);

  const topEffectiveReplayByGame = Array.from(effectiveReplayByGame.values())
    .filter((row) => row.replayClicks > 0)
    .sort((a, b) => b.effectiveReplayRate - a.effectiveReplayRate)
    .slice(0, 10);

  const crossGameBridges: EffectiveCrossGameData[] = Array.from(crossGameEffective.entries())
    .flatMap(([from, toMap]) =>
      Array.from(toMap.entries()).map(([to, starts]) => ({
        from,
        to,
        effectiveStarts: starts,
        clicks: crossGameClicks.get(from)?.get(to) || 0,
        effectiveRate: (crossGameClicks.get(from)?.get(to) || 0) > 0
          ? Math.round((starts / (crossGameClicks.get(from)?.get(to) || 1)) * 100)
          : 0,
      })),
    )
    .sort((a, b) => b.effectiveStarts - a.effectiveStarts)
    .slice(0, 10);

  const direction = {
    quickToArcade: {
      clicks: totalQuickToArcadeClicks,
      effectiveStarts: totalEffectiveQuickToArcade,
      effectiveRate: totalQuickToArcadeClicks > 0 ? Math.round((totalEffectiveQuickToArcade / totalQuickToArcadeClicks) * 100) : 0,
    },
    arcadeToQuick: {
      clicks: totalArcadeToQuickClicks,
      effectiveStarts: totalEffectiveArcadeToQuick,
      effectiveRate: totalArcadeToQuickClicks > 0 ? Math.round((totalEffectiveArcadeToQuick / totalArcadeToQuickClicks) * 100) : 0,
    },
  };

  const directionWinner: 'balanced' | 'quick_to_arcade' | 'arcade_to_quick' =
    direction.quickToArcade.effectiveRate === direction.arcadeToQuick.effectiveRate
      ? 'balanced'
      : direction.quickToArcade.effectiveRate > direction.arcadeToQuick.effectiveRate
        ? 'quick_to_arcade'
        : 'arcade_to_quick';

  const byChannel = toSegmentRows(segmentByChannel, 'channel');
  const byTerritory = toSegmentRows(segmentByTerritory, 'territory');
  byChannel.forEach((row) => {
    if (row.warning) warnings.push(row.warning);
  });
  byTerritory.forEach((row) => {
    if (row.warning) warnings.push(row.warning);
  });

  const uniqueWarnings = Array.from(new Set(warnings));

  return {
    previewToPlay,
    cardClickToRun,
    replayEffectiveness,
    crossGameEffectiveness,
    quickToArcadeEffective,
    arcadeToQuickEffective,
    scorecards: {
      previewToPlay,
      cardClickToRun,
      replayEffectiveness,
      crossGameEffectiveness,
      quickToArcadeEffective,
      arcadeToQuickEffective,
    },
    effectiveRunsByGame,
    effectiveReplayByGame,
    effectiveCrossGame: crossGameEffective,
    topEffectiveRunsByGame,
    topEffectiveReplayByGame,
    crossGameBridges,
    direction,
    directionWinner,
    byChannel,
    byTerritory,
    warnings: uniqueWarnings,
  };
}

/**
 * Helpers para formatar dados de runs efetivas para reports
 */
export function formatEffectiveRunsForReport(analysis: EffectiveRunsAnalysis): string {
  const lines: string[] = [];
  
  lines.push('## 📊 Scorecards de Conversão Efetiva');
  lines.push('');
  
  const scorecards = [
    analysis.previewToPlay,
    analysis.cardClickToRun,
    analysis.replayEffectiveness,
    analysis.crossGameEffectiveness,
    analysis.quickToArcadeEffective,
    analysis.arcadeToQuickEffective,
  ];

  for (const card of scorecards) {
    const statusEmoji = 
      card.status === 'useful_signal' ? '✅' :
      card.status === 'directional_signal' ? '🟡' :
      card.status === 'monitoring' ? '🟠' : '🔴';
    
    lines.push(`### ${statusEmoji} ${card.name}`);
    lines.push(`- Cliques totais: **${card.totalClicks}**`);
    lines.push(`- Conversões efetivas: **${card.effectiveConversions}**`);
    lines.push(`- Taxa de conversão: **${card.conversionRate}%**`);
    lines.push(`- Status: **${card.status}**`);
    if (card.sampleWarning) {
      lines.push(`- ⚠️ ${card.sampleWarning}`);
    }
    lines.push('');
  }

  lines.push('## 🎮 Top 5 Jogos por Run Efetiva');
  lines.push('');
  const topRuns = Array.from(analysis.effectiveRunsByGame.values())
    .filter((game) => game.cardClicks >= 3)
    .sort((a, b) => b.effectiveRunRate - a.effectiveRunRate)
    .slice(0, 5);

  for (const game of topRuns) {
    lines.push(`- **${game.slug}**: ${game.effectiveRuns}/${game.cardClicks} (${game.effectiveRunRate}%) - avg ${game.avgClickToPlayMs}ms`);
  }
  lines.push('');

  lines.push('## 🔁 Top 5 Jogos por Replay Efetivo');
  lines.push('');
  const topReplays = Array.from(analysis.effectiveReplayByGame.values())
    .filter((game) => game.replayClicks >= 3)
    .sort((a, b) => b.effectiveReplayRate - a.effectiveReplayRate)
    .slice(0, 5);

  for (const game of topReplays) {
    lines.push(`- **${game.slug}**: ${game.effectiveReplays}/${game.replayClicks} (${game.effectiveReplayRate}%) - ${game.replayPerCompletion}% por completion`);
  }
  lines.push('');

  if (analysis.warnings.length > 0) {
    lines.push('## ⚠️ Avisos de Amostra');
    lines.push('');
    for (const warning of analysis.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
