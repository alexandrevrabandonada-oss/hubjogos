const EFFECTIVE_WINDOW_MS = 60 * 1000;
const DUEL_SLUGS = ['tarifa-zero-corredor', 'mutirao-do-bairro'];

function normalizeMetadata(metadata) {
  if (!metadata) {
    return {};
  }

  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof metadata === 'object' ? metadata : {};
}

function normalizeSlug(raw) {
  const slug = String(raw || '').trim();
  if (!slug) {
    return '';
  }
  return slug === 'tarifa-zero-rj' ? 'tarifa-zero-corredor' : slug;
}

function getEventName(event) {
  return String(event.event_name || event.event || '').trim();
}

function getSessionId(event) {
  return String(event.session_id || event.sessionId || '').trim();
}

function getTimestamp(event) {
  const raw = event.created_at || event.createdAt;
  const time = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function getArcadeSlugFromEntryEvent(eventName, metadata, eventSlug) {
  if (eventName === 'home_arcade_click' || eventName === 'explorar_arcade_click' || eventName === 'quick_to_arcade_click') {
    return normalizeSlug(metadata.arcadeSlug);
  }

  if (eventName === 'home_primary_play_click') {
    const targetType = String(metadata.targetType || '').toLowerCase();
    if (targetType === 'arcade') {
      return normalizeSlug(metadata.targetSlug);
    }
    return '';
  }

  if (eventName === 'above_fold_game_click') {
    const gameType = String(metadata.gameType || '').toLowerCase();
    if (gameType === 'arcade') {
      return normalizeSlug(metadata.gameSlug || eventSlug);
    }
    return '';
  }

  if (eventName === 'card_preview_interaction' || eventName === 'card_full_click') {
    return normalizeSlug(eventSlug);
  }

  return '';
}

function getStatusFromExposure(exposureDeltaPct, minExposure, minRuns, minExposureForFairWindow, minRunsForDecision) {
  if (exposureDeltaPct >= 35 || minExposure < 12) {
    return 'unbalanced_exposure';
  }

  if (exposureDeltaPct > 15 || minExposure < minExposureForFairWindow) {
    return 'exposure_correction_in_progress';
  }

  if (minRuns >= minRunsForDecision) {
    return 'decision_ready';
  }

  return 'fair_comparison_window';
}

function winnerByValue(tarifaValue, mutiraoValue) {
  if (tarifaValue === mutiraoValue) {
    return 'technical_tie';
  }
  return tarifaValue > mutiraoValue ? 'tarifa-zero-corredor' : 'mutirao-do-bairro';
}

function buildArcadeExposureDuelFromEvents(events = [], arcadeLineDecision = {}) {
  const rows = {
    'tarifa-zero-corredor': {
      slug: 'tarifa-zero-corredor',
      title: 'Tarifa Zero RJ - Corredor do Povo',
      exposureSignals: 0,
      intentClicks: 0,
      starts: 0,
      effectiveStarts: 0,
    },
    'mutirao-do-bairro': {
      slug: 'mutirao-do-bairro',
      title: 'Mutirao do Bairro',
      exposureSignals: 0,
      intentClicks: 0,
      starts: 0,
      effectiveStarts: 0,
    },
  };

  const clickEventsBySession = new Map();

  for (const event of events || []) {
    const eventName = getEventName(event);
    const metadata = normalizeMetadata(event.metadata);
    const eventSlug = normalizeSlug(event.slug);
    const sessionId = getSessionId(event);
    const timestamp = getTimestamp(event);

    const entrySlug = getArcadeSlugFromEntryEvent(eventName, metadata, eventSlug);
    const isExposureEvent = eventName === 'card_preview_interaction' || eventName === 'card_full_click' || eventName === 'home_arcade_click' || eventName === 'explorar_arcade_click' || eventName === 'quick_to_arcade_click' || eventName === 'home_primary_play_click' || eventName === 'above_fold_game_click';

    if (entrySlug && DUEL_SLUGS.includes(entrySlug) && isExposureEvent) {
      rows[entrySlug].exposureSignals += 1;

      const isIntentClick = eventName !== 'card_preview_interaction';
      if (isIntentClick) {
        rows[entrySlug].intentClicks += 1;
        if (sessionId && timestamp > 0) {
          if (!clickEventsBySession.has(sessionId)) {
            clickEventsBySession.set(sessionId, []);
          }
          clickEventsBySession.get(sessionId).push({ slug: entrySlug, timestamp });
        }
      }
    }

    if (eventName === 'arcade_run_start') {
      const runSlug = normalizeSlug(metadata.arcadeSlug || eventSlug);
      if (runSlug && rows[runSlug]) {
        rows[runSlug].starts += 1;

        if (sessionId && timestamp > 0) {
          const clicks = clickEventsBySession.get(sessionId) || [];
          const matched = clicks.find((click) => click.slug === runSlug && timestamp > click.timestamp && (timestamp - click.timestamp) <= EFFECTIVE_WINDOW_MS);
          if (matched) {
            rows[runSlug].effectiveStarts += 1;
          }
        }
      }
    }
  }

  const orderedRows = DUEL_SLUGS.map((slug) => rows[slug]);
  const totalExposure = orderedRows.reduce((sum, row) => sum + row.exposureSignals, 0);
  const totalRuns = orderedRows.reduce((sum, row) => sum + row.starts, 0);

  const scorecards = orderedRows.map((row) => {
    const exposureToIntentRate = row.exposureSignals > 0 ? Math.round((row.intentClicks / row.exposureSignals) * 100) : 0;
    const intentToStartRate = row.intentClicks > 0 ? Math.round((row.starts / row.intentClicks) * 100) : 0;
    const exposureToStartRate = row.exposureSignals > 0 ? Math.round((row.starts / row.exposureSignals) * 100) : 0;
    const exposureToEffectiveRate = row.exposureSignals > 0 ? Math.round((row.effectiveStarts / row.exposureSignals) * 100) : 0;
    const shareOfExposure = totalExposure > 0 ? Math.round((row.exposureSignals / totalExposure) * 100) : 0;
    const shareOfRuns = totalRuns > 0 ? Math.round((row.starts / totalRuns) * 100) : 0;

    return {
      ...row,
      exposureToIntentRate,
      intentToStartRate,
      exposureToStartRate,
      exposureToEffectiveRate,
      shareOfExposure,
      shareOfRuns,
    };
  });

  const tarifa = scorecards.find((row) => row.slug === 'tarifa-zero-corredor') || scorecards[0];
  const mutirao = scorecards.find((row) => row.slug === 'mutirao-do-bairro') || scorecards[1];

  const exposureDeltaPct = Math.abs((tarifa?.shareOfExposure || 0) - (mutirao?.shareOfExposure || 0));
  const runsDeltaPct = Math.abs((tarifa?.shareOfRuns || 0) - (mutirao?.shareOfRuns || 0));
  const minExposureForFairWindow = 30;
  const minRunsForDecision = Number(arcadeLineDecision?.sample?.minRunsForSignal || 30);
  const minExposure = Math.min(tarifa?.exposureSignals || 0, mutirao?.exposureSignals || 0);
  const minRuns = Math.min(tarifa?.starts || 0, mutirao?.starts || 0);
  const underexposedArcade = (tarifa?.exposureSignals || 0) === (mutirao?.exposureSignals || 0)
    ? null
    : (tarifa?.exposureSignals || 0) < (mutirao?.exposureSignals || 0)
      ? 'tarifa-zero-corredor'
      : 'mutirao-do-bairro';

  const exposureGapAbs = Math.abs((tarifa?.exposureSignals || 0) - (mutirao?.exposureSignals || 0));
  const recommendedExposureBoost = underexposedArcade ? Math.ceil(exposureGapAbs / 2) : 0;
  const status = getStatusFromExposure(exposureDeltaPct, minExposure, minRuns, minExposureForFairWindow, minRunsForDecision);

  const volumeLeader = winnerByValue(tarifa?.starts || 0, mutirao?.starts || 0);
  const efficiencyLeader = winnerByValue(tarifa?.exposureToStartRate || 0, mutirao?.exposureToStartRate || 0);
  const campaignLeader = String(arcadeLineDecision?.campaignStrength?.winner || 'technical_tie');

  const actions = [];
  if (underexposedArcade) {
    actions.push(`Aumentar distribuicao de ${underexposedArcade} em pelo menos +${recommendedExposureBoost} sinais de exposicao nesta janela.`);
  }
  actions.push('Manter mesma vitrine para os dois arcades (home, explorar e quick->arcade) ate fechar janela justa.');
  actions.push('Comparar vencedor oficial apenas quando exposicao e amostra de runs estiverem niveladas.');

  let summary = 'Janela equilibrada para comparacao entre Tarifa Zero e Mutirao.';
  if (status === 'unbalanced_exposure') {
    summary = `Duelo enviesado por exposicao (${exposureDeltaPct}pp de gap); corrigir distribuicao antes de interpretar vencedor.`;
  } else if (status === 'exposure_correction_in_progress') {
    summary = `Correcao de exposicao em andamento (${exposureDeltaPct}pp de gap); manter pareamento de vitrine ate convergir.`;
  } else if (status === 'fair_comparison_window') {
    summary = 'Janela de comparacao justa aberta por exposicao; aguardar mais runs para decisao oficial.';
  } else if (status === 'decision_ready') {
    summary = 'Exposicao equilibrada e amostra de runs suficiente para leitura oficial com menor vies.';
  }

  return {
    compared: {
      tarifaSlug: 'tarifa-zero-corredor',
      mutiraoSlug: 'mutirao-do-bairro',
    },
    scorecards,
    totals: {
      exposureSignals: totalExposure,
      starts: totalRuns,
    },
    fairness: {
      status,
      minExposureForFairWindow,
      minRunsForDecision,
      exposureDeltaPct,
      runsDeltaPct,
      underexposedArcade,
      recommendedExposureBoost,
      summary,
      actions,
    },
    contextLeaders: {
      volumeLeader,
      efficiencyLeader,
      campaignLeader,
    },
  };
}

module.exports = {
  buildArcadeExposureDuelFromEvents,
};
