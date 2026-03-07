/**
 * Effective runs utilities for operational scripts (Tijolo 33)
 */

const EFFECTIVE_RUN_WINDOW_MS = 60 * 1000;
const EFFECTIVE_REPLAY_WINDOW_MS = 60 * 1000;
const EFFECTIVE_CROSS_GAME_WINDOW_MS = 90 * 1000;

function getEventName(event) {
  return event.event_name || event.event || 'unknown';
}

function getSessionId(event) {
  return event.session_id || event.sessionId || 'unknown';
}

function getSlug(event) {
  return event.slug || event.gameSlug || 'unknown';
}

function getTimestamp(event) {
  const raw = event.created_at || event.createdAt;
  const value = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getStatus(total) {
  if (total < 10) return 'insufficient_data';
  if (total < 30) return 'monitoring';
  if (total < 100) return 'directional_signal';
  return 'useful_signal';
}

function normalizeChannel(source) {
  const raw = String(source || '').toLowerCase().trim();
  if (!raw || raw === 'direto/desconhecido') return 'site_direto';
  if (raw.includes('instagram') || raw === 'ig') return 'instagram';
  if (raw.includes('tiktok') || raw.includes('tik-tok')) return 'tiktok';
  if (raw.includes('whatsapp') || raw.includes('wa')) return 'whatsapp';
  if (raw.includes('youtube') || raw.includes('yt')) return 'youtube';
  if (raw === 'direto' || raw === 'direct' || raw.includes('organic')) return 'site_direto';
  return 'site_direto';
}

function normalizeTerritory(value) {
  const raw = String(value || '').toLowerCase().trim();
  if (!raw) return 'estado-rj';
  if (raw.includes('volta-redonda') || raw === 'volta redonda') return 'volta-redonda';
  if (raw.includes('estado-rj') || raw.includes('estado-do-rio') || raw === 'estado') return 'estado-rj';
  return raw;
}

function getSegment(map, key) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      label: key === 'site_direto' ? 'site/direto' : key,
      cardClicks: 0,
      effectiveRuns: 0,
      replayClicks: 0,
      effectiveReplays: 0,
      crossClicks: 0,
      effectiveCrossStarts: 0,
    });
  }
  return map.get(key);
}

function toSegmentRows(map) {
  return Array.from(map.values())
    .map((row) => {
      const totalSignals = row.cardClicks + row.replayClicks + row.crossClicks;
      const warning = getWarning(totalSignals, `Segmento ${row.key}`);
      return {
        key: row.key,
        label: row.label,
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

function getWarning(total, name) {
  if (total < 10) return `${name}: amostra insuficiente (${total} < 10)`;
  if (total < 30) return `${name}: monitorando, amostra ainda baixa (${total} < 30)`;
  return null;
}

function toScorecard(name, totalClicks, effectiveConversions) {
  const conversionRate = totalClicks > 0 ? Math.round((effectiveConversions / totalClicks) * 100) : 0;
  const status = getStatus(totalClicks);
  const sampleWarning = getWarning(totalClicks, name);
  return {
    name,
    totalClicks,
    effectiveConversions,
    conversionRate,
    status,
    sampleWarning,
  };
}

function analyzeEffectiveRuns(rawEvents, options = {}) {
  const events = (rawEvents || [])
    .map((event) => ({
      sessionId: getSessionId(event),
      eventName: getEventName(event),
      slug: getSlug(event),
      metadata: event.metadata || {},
      timestamp: getTimestamp(event),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const sessions = options.sessions || [];
  const territoryBySlug = options.territoryBySlug || {};
  const sessionSource = new Map();
  const sessionSlug = new Map();
  sessions.forEach((session) => {
    sessionSource.set(session.sessionId, normalizeChannel(session.utmSource));
    if (session.slug) {
      sessionSlug.set(session.sessionId, session.slug);
    }
  });

  const channelSegments = new Map();
  const territorySegments = new Map();

  const previewBySession = new Map();
  const cardClickBySession = new Map();
  const replayBySession = new Map();
  const nextGameBySession = new Map();
  const quickToArcadeBySession = new Map();
  const arcadeToQuickBySession = new Map();

  const byGame = new Map();
  const crossClicks = new Map();
  const crossEffective = new Map();

  const effectiveRunKeys = new Set();
  const effectivePreviewKeys = new Set();
  const effectiveReplayKeys = new Set();
  const effectiveCrossKeys = new Set();
  const effectiveQuickArcadeKeys = new Set();
  const effectiveArcadeQuickKeys = new Set();

  function ensureGame(slug) {
    if (!byGame.has(slug)) {
      byGame.set(slug, {
        slug,
        cardClicks: 0,
        previewInteractions: 0,
        replayClicks: 0,
        completions: 0,
        effectiveRuns: 0,
        effectiveFromPreview: 0,
        effectiveReplays: 0,
      });
    }
    return byGame.get(slug);
  }

  for (const event of events) {
    const row = ensureGame(event.slug);
    const sessionGame = sessionSlug.get(event.sessionId) || event.slug;
    const channel = sessionSource.get(event.sessionId) || 'site_direto';
    const territory = normalizeTerritory(territoryBySlug[sessionGame] || territoryBySlug[event.slug]);
    if (event.eventName === 'card_preview_interaction') {
      row.previewInteractions += 1;
      if (!previewBySession.has(event.sessionId)) previewBySession.set(event.sessionId, []);
      previewBySession.get(event.sessionId).push({ slug: event.slug, timestamp: event.timestamp });
    }

    if (event.eventName === 'card_full_click') {
      row.cardClicks += 1;
      if (!cardClickBySession.has(event.sessionId)) cardClickBySession.set(event.sessionId, []);
      cardClickBySession.get(event.sessionId).push({ slug: event.slug, timestamp: event.timestamp, channel, territory });
      getSegment(channelSegments, channel).cardClicks += 1;
      getSegment(territorySegments, territory).cardClicks += 1;
    }

    if (event.eventName === 'replay_after_run_click' || event.eventName === 'replay_click' || event.eventName === 'outcome_replay_intent' || event.eventName === 'arcade_replay_click') {
      row.replayClicks += 1;
      if (!replayBySession.has(event.sessionId)) replayBySession.set(event.sessionId, []);
      replayBySession.get(event.sessionId).push({ slug: event.slug, timestamp: event.timestamp, channel, territory });
      getSegment(channelSegments, channel).replayClicks += 1;
      getSegment(territorySegments, territory).replayClicks += 1;
    }

    if (event.eventName === 'game_complete') {
      row.completions += 1;
    }

    if (event.eventName === 'next_game_after_run_click' || event.eventName === 'next_game_click') {
      const nextSlug = String(event.metadata.nextGameSlug || event.metadata.slug || '').trim();
      if (nextSlug) {
        if (!nextGameBySession.has(event.sessionId)) nextGameBySession.set(event.sessionId, []);
        nextGameBySession.get(event.sessionId).push({ from: event.slug, to: nextSlug, timestamp: event.timestamp, channel, territory });

        if (!crossClicks.has(event.slug)) crossClicks.set(event.slug, new Map());
        const fromMap = crossClicks.get(event.slug);
        fromMap.set(nextSlug, (fromMap.get(nextSlug) || 0) + 1);
        getSegment(channelSegments, channel).crossClicks += 1;
        getSegment(territorySegments, territory).crossClicks += 1;
      }
    }

    if (event.eventName === 'quick_to_arcade_click') {
      const nextSlug = String(event.metadata.arcadeSlug || '').trim();
      if (nextSlug) {
        if (!quickToArcadeBySession.has(event.sessionId)) quickToArcadeBySession.set(event.sessionId, []);
        quickToArcadeBySession.get(event.sessionId).push({ from: event.slug, to: nextSlug, timestamp: event.timestamp });
      }
    }

    if (event.eventName === 'arcade_to_quick_click') {
      const nextSlug = String(event.metadata.quickSlug || '').trim();
      if (nextSlug) {
        if (!arcadeToQuickBySession.has(event.sessionId)) arcadeToQuickBySession.set(event.sessionId, []);
        arcadeToQuickBySession.get(event.sessionId).push({ from: event.slug, to: nextSlug, timestamp: event.timestamp });
      }
    }
  }

  for (const event of events) {
    const isStart = event.eventName === 'game_start' || event.eventName === 'first_interaction_time' || event.eventName === 'arcade_run_start' || event.eventName === 'arcade_first_input_time';
    if (!isStart) {
      continue;
    }

    const cardClicks = cardClickBySession.get(event.sessionId) || [];
    for (const click of cardClicks) {
      if (click.slug === event.slug && event.timestamp > click.timestamp && event.timestamp - click.timestamp <= EFFECTIVE_RUN_WINDOW_MS) {
        const key = `${event.sessionId}:${event.slug}:${click.timestamp}`;
        if (!effectiveRunKeys.has(key)) {
          effectiveRunKeys.add(key);
          ensureGame(event.slug).effectiveRuns += 1;
          getSegment(channelSegments, click.channel).effectiveRuns += 1;
          getSegment(territorySegments, click.territory).effectiveRuns += 1;
        }
      }
    }

    const previews = previewBySession.get(event.sessionId) || [];
    for (const preview of previews) {
      if (preview.slug === event.slug && event.timestamp > preview.timestamp && event.timestamp - preview.timestamp <= EFFECTIVE_RUN_WINDOW_MS) {
        const key = `${event.sessionId}:${event.slug}:${preview.timestamp}`;
        if (!effectivePreviewKeys.has(key)) {
          effectivePreviewKeys.add(key);
          ensureGame(event.slug).effectiveFromPreview += 1;
        }
      }
    }

    const replays = replayBySession.get(event.sessionId) || [];
    for (const replay of replays) {
      if (replay.slug === event.slug && event.timestamp > replay.timestamp && event.timestamp - replay.timestamp <= EFFECTIVE_REPLAY_WINDOW_MS) {
        const key = `${event.sessionId}:${event.slug}:${replay.timestamp}`;
        if (!effectiveReplayKeys.has(key)) {
          effectiveReplayKeys.add(key);
          ensureGame(event.slug).effectiveReplays += 1;
          getSegment(channelSegments, replay.channel).effectiveReplays += 1;
          getSegment(territorySegments, replay.territory).effectiveReplays += 1;
        }
      }
    }

    const nextClicks = nextGameBySession.get(event.sessionId) || [];
    for (const click of nextClicks) {
      if (click.to === event.slug && event.timestamp > click.timestamp && event.timestamp - click.timestamp <= EFFECTIVE_CROSS_GAME_WINDOW_MS) {
        const key = `${event.sessionId}:${click.from}:${event.slug}:${click.timestamp}`;
        if (!effectiveCrossKeys.has(key)) {
          effectiveCrossKeys.add(key);
          getSegment(channelSegments, click.channel).effectiveCrossStarts += 1;
          getSegment(territorySegments, click.territory).effectiveCrossStarts += 1;
          if (!crossEffective.has(click.from)) crossEffective.set(click.from, new Map());
          const fromMap = crossEffective.get(click.from);
          fromMap.set(event.slug, (fromMap.get(event.slug) || 0) + 1);
        }
      }
    }

    const q2aClicks = quickToArcadeBySession.get(event.sessionId) || [];
    for (const click of q2aClicks) {
      if (click.to === event.slug && event.timestamp > click.timestamp && event.timestamp - click.timestamp <= EFFECTIVE_CROSS_GAME_WINDOW_MS) {
        effectiveQuickArcadeKeys.add(`${event.sessionId}:${click.from}:${event.slug}:${click.timestamp}`);
      }
    }

    const a2qClicks = arcadeToQuickBySession.get(event.sessionId) || [];
    for (const click of a2qClicks) {
      if (click.to === event.slug && event.timestamp > click.timestamp && event.timestamp - click.timestamp <= EFFECTIVE_CROSS_GAME_WINDOW_MS) {
        effectiveArcadeQuickKeys.add(`${event.sessionId}:${click.from}:${event.slug}:${click.timestamp}`);
      }
    }
  }

  const gameRows = Array.from(byGame.values()).map((row) => ({
    ...row,
    effectiveRunRate: row.cardClicks > 0 ? Math.round((row.effectiveRuns / row.cardClicks) * 100) : 0,
    previewConversionRate: row.previewInteractions > 0 ? Math.round((row.effectiveFromPreview / row.previewInteractions) * 100) : 0,
    effectiveReplayRate: row.replayClicks > 0 ? Math.round((row.effectiveReplays / row.replayClicks) * 100) : 0,
    replayPerCompletion: row.completions > 0 ? Math.round((row.effectiveReplays / row.completions) * 100) : 0,
  }));

  const totalPreview = gameRows.reduce((acc, row) => acc + row.previewInteractions, 0);
  const totalCardClicks = gameRows.reduce((acc, row) => acc + row.cardClicks, 0);
  const totalReplayClicks = gameRows.reduce((acc, row) => acc + row.replayClicks, 0);
  const totalNextClicks = Array.from(nextGameBySession.values()).reduce((acc, list) => acc + list.length, 0);
  const totalQuickToArcadeClicks = Array.from(quickToArcadeBySession.values()).reduce((acc, list) => acc + list.length, 0);
  const totalArcadeToQuickClicks = Array.from(arcadeToQuickBySession.values()).reduce((acc, list) => acc + list.length, 0);

  const scorecards = {
    previewToPlay: toScorecard('Preview -> Play efetivo', totalPreview, effectivePreviewKeys.size),
    cardClickToRun: toScorecard('Card click -> Run efetivo', totalCardClicks, effectiveRunKeys.size),
    replayEffectiveness: toScorecard('Replay efetivo', totalReplayClicks, effectiveReplayKeys.size),
    crossGameEffectiveness: toScorecard('Cross-game efetivo', totalNextClicks, effectiveCrossKeys.size),
    quickToArcadeEffective: toScorecard('Quick -> Arcade efetivo', totalQuickToArcadeClicks, effectiveQuickArcadeKeys.size),
    arcadeToQuickEffective: toScorecard('Arcade -> Quick efetivo', totalArcadeToQuickClicks, effectiveArcadeQuickKeys.size),
  };

  const warnings = Object.values(scorecards)
    .map((card) => card.sampleWarning)
    .filter(Boolean);

  const topEffectiveRunsByGame = gameRows
    .filter((row) => row.cardClicks > 0)
    .sort((a, b) => b.effectiveRunRate - a.effectiveRunRate)
    .slice(0, 8);

  const topEffectiveReplayByGame = gameRows
    .filter((row) => row.replayClicks > 0)
    .sort((a, b) => b.effectiveReplayRate - a.effectiveReplayRate)
    .slice(0, 8);

  const crossGameBridges = Array.from(crossEffective.entries())
    .flatMap(([from, toMap]) => Array.from(toMap.entries()).map(([to, effectiveStarts]) => ({
      from,
      to,
      effectiveStarts,
      clicks: (crossClicks.get(from) && crossClicks.get(from).get(to)) || 0,
      effectiveRate: ((crossClicks.get(from) && crossClicks.get(from).get(to)) || 0) > 0
        ? Math.round((effectiveStarts / crossClicks.get(from).get(to)) * 100)
        : 0,
    })))
    .sort((a, b) => b.effectiveStarts - a.effectiveStarts);

  const direction = {
    quickToArcade: {
      clicks: totalQuickToArcadeClicks,
      effectiveStarts: effectiveQuickArcadeKeys.size,
      effectiveRate: totalQuickToArcadeClicks > 0 ? Math.round((effectiveQuickArcadeKeys.size / totalQuickToArcadeClicks) * 100) : 0,
    },
    arcadeToQuick: {
      clicks: totalArcadeToQuickClicks,
      effectiveStarts: effectiveArcadeQuickKeys.size,
      effectiveRate: totalArcadeToQuickClicks > 0 ? Math.round((effectiveArcadeQuickKeys.size / totalArcadeToQuickClicks) * 100) : 0,
    },
  };

  const directionWinner = direction.quickToArcade.effectiveRate === direction.arcadeToQuick.effectiveRate
    ? 'balanced'
    : direction.quickToArcade.effectiveRate > direction.arcadeToQuick.effectiveRate
      ? 'quick_to_arcade'
      : 'arcade_to_quick';

  const byChannel = toSegmentRows(channelSegments);
  const byTerritory = toSegmentRows(territorySegments);
  byChannel.forEach((row) => {
    if (row.warning) warnings.push(row.warning);
  });
  byTerritory.forEach((row) => {
    if (row.warning) warnings.push(row.warning);
  });

  const uniqueWarnings = Array.from(new Set(warnings));

  return {
    scorecards,
    warnings: uniqueWarnings,
    topEffectiveRunsByGame,
    topEffectiveReplayByGame,
    crossGameBridges: crossGameBridges.slice(0, 10),
    direction,
    directionWinner,
    byChannel,
    byTerritory,
  };
}

module.exports = {
  analyzeEffectiveRuns,
};
