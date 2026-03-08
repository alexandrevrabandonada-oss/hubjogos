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

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizePct(value, max) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(max, value));
}

function rowTemplate(slug, title) {
  return {
    slug,
    title,
    runs: 0,
    runEnds: 0,
    replayClicks: 0,
    campaignCtaClicks: 0,
    scoreSum: 0,
    scoreCount: 0,
    firstInputSum: 0,
    firstInputCount: 0,
  };
}

function buildArcadeRowsFromEvents(events = []) {
  const rows = {
    'tarifa-zero-corredor': rowTemplate('tarifa-zero-corredor', 'Tarifa Zero RJ - Corredor do Povo'),
    'mutirao-do-bairro': rowTemplate('mutirao-do-bairro', 'Mutirao do Bairro'),
  };

  for (const event of events) {
    const metadata = normalizeMetadata(event.metadata);
    const slug = String(metadata.arcadeSlug || event.slug || '');
    const key = slug === 'tarifa-zero-rj' ? 'tarifa-zero-corredor' : slug;

    if (!rows[key]) {
      continue;
    }

    const row = rows[key];

    if (event.event_name === 'arcade_run_start') {
      row.runs += 1;
    }

    if (event.event_name === 'arcade_run_end') {
      row.runEnds += 1;
      row.scoreSum += toNumber(metadata.score);
      row.scoreCount += 1;
    }

    if (event.event_name === 'arcade_score') {
      row.scoreSum += toNumber(metadata.score);
      row.scoreCount += 1;
    }

    if (event.event_name === 'arcade_replay_click' || event.event_name === 'replay_after_run_click') {
      row.replayClicks += 1;
    }

    if (event.event_name === 'arcade_campaign_cta_click' || event.event_name === 'campaign_cta_click_after_game') {
      row.campaignCtaClicks += 1;
    }

    if (event.event_name === 'arcade_first_input_time') {
      row.firstInputSum += toNumber(metadata.msSinceStart);
      row.firstInputCount += 1;
    }
  }

  return Object.values(rows).map((row) => {
    const runEndRate = row.runs > 0 ? Math.round((row.runEnds / row.runs) * 100) : 0;
    const replayRate = row.runs > 0 ? Math.round((row.replayClicks / row.runs) * 100) : 0;
    const campaignCtaRate = row.runs > 0 ? Math.round((row.campaignCtaClicks / row.runs) * 100) : 0;
    const scoreAverage = row.scoreCount > 0 ? Math.round(row.scoreSum / row.scoreCount) : 0;
    const firstInputAvgMs = row.firstInputCount > 0 ? Math.round(row.firstInputSum / row.firstInputCount) : 0;

    return {
      slug: row.slug,
      title: row.title,
      runs: row.runs,
      runEnds: row.runEnds,
      runEndRate,
      replayRate,
      replayClicks: row.replayClicks,
      campaignCtaClicks: row.campaignCtaClicks,
      campaignCtaRate,
      scoreAverage,
      firstInputAvgMs,
    };
  });
}

function buildArcadeLineDecisionFromRows(rows = []) {
  const tarifa = rows.find((row) => row.slug === 'tarifa-zero-corredor') || rowTemplate('tarifa-zero-corredor', 'Tarifa Zero RJ - Corredor do Povo');
  const mutirao = rows.find((row) => row.slug === 'mutirao-do-bairro') || rowTemplate('mutirao-do-bairro', 'Mutirao do Bairro');

  const minRunsForSignal = 30;
  const minRunsForReadiness = 80;
  const minRuns = Math.min(tarifa.runs || 0, mutirao.runs || 0);

  const tarifaFirstInputScore = tarifa.firstInputAvgMs > 0 ? normalizePct(Math.round(((4000 - tarifa.firstInputAvgMs) / 4000) * 100), 100) : 0;
  const mutiraoFirstInputScore = mutirao.firstInputAvgMs > 0 ? normalizePct(Math.round(((4000 - mutirao.firstInputAvgMs) / 4000) * 100), 100) : 0;

  const tarifaStrength = Math.round((tarifa.runEndRate || 0) * 0.25 + (tarifa.replayRate || 0) * 0.3 + (tarifa.campaignCtaRate || 0) * 0.3 + tarifaFirstInputScore * 0.15);
  const mutiraoStrength = Math.round((mutirao.runEndRate || 0) * 0.25 + (mutirao.replayRate || 0) * 0.3 + (mutirao.campaignCtaRate || 0) * 0.3 + mutiraoFirstInputScore * 0.15);

  const tarifaEngagement = Math.round((tarifa.replayRate || 0) * 0.6 + (tarifa.campaignCtaRate || 0) * 0.4);
  const mutiraoEngagement = Math.round((mutirao.replayRate || 0) * 0.6 + (mutirao.campaignCtaRate || 0) * 0.4);

  const dimensions = [
    {
      key: 'runs',
      label: 'Runs',
      tarifaValue: tarifa.runs || 0,
      mutiraoValue: mutirao.runs || 0,
      winner: (tarifa.runs || 0) === (mutirao.runs || 0) ? 'tie' : (tarifa.runs || 0) > (mutirao.runs || 0) ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1.5,
    },
    {
      key: 'run_end_rate',
      label: 'Run end rate',
      tarifaValue: tarifa.runEndRate || 0,
      mutiraoValue: mutirao.runEndRate || 0,
      winner: (tarifa.runEndRate || 0) === (mutirao.runEndRate || 0) ? 'tie' : (tarifa.runEndRate || 0) > (mutirao.runEndRate || 0) ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1,
    },
    {
      key: 'replay_rate',
      label: 'Replay rate',
      tarifaValue: tarifa.replayRate || 0,
      mutiraoValue: mutirao.replayRate || 0,
      winner: (tarifa.replayRate || 0) === (mutirao.replayRate || 0) ? 'tie' : (tarifa.replayRate || 0) > (mutirao.replayRate || 0) ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1.2,
    },
    {
      key: 'campaign_cta_rate',
      label: 'CTA pos-run rate',
      tarifaValue: tarifa.campaignCtaRate || 0,
      mutiraoValue: mutirao.campaignCtaRate || 0,
      winner: (tarifa.campaignCtaRate || 0) === (mutirao.campaignCtaRate || 0) ? 'tie' : (tarifa.campaignCtaRate || 0) > (mutirao.campaignCtaRate || 0) ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1.2,
    },
    {
      key: 'first_input_time',
      label: 'First input (menor melhor)',
      tarifaValue: tarifa.firstInputAvgMs || 0,
      mutiraoValue: mutirao.firstInputAvgMs || 0,
      winner:
        (tarifa.firstInputAvgMs || 0) === (mutirao.firstInputAvgMs || 0)
          ? 'tie'
          : (tarifa.firstInputAvgMs || 0) === 0
          ? 'mutirao-do-bairro'
          : (mutirao.firstInputAvgMs || 0) === 0
          ? 'tarifa-zero-corredor'
          : (tarifa.firstInputAvgMs || 0) < (mutirao.firstInputAvgMs || 0)
          ? 'tarifa-zero-corredor'
          : 'mutirao-do-bairro',
      weight: 0.7,
    },
    {
      key: 'engagement_index',
      label: 'Indice de engajamento',
      tarifaValue: tarifaEngagement,
      mutiraoValue: mutiraoEngagement,
      winner: tarifaEngagement === mutiraoEngagement ? 'tie' : tarifaEngagement > mutiraoEngagement ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1.4,
    },
  ];

  let tarifaPoints = 0;
  let mutiraoPoints = 0;

  for (const dimension of dimensions) {
    if (dimension.winner === 'tarifa-zero-corredor') {
      tarifaPoints += dimension.weight;
    }
    if (dimension.winner === 'mutirao-do-bairro') {
      mutiraoPoints += dimension.weight;
    }
  }

  const pointsDelta = Number((tarifaPoints - mutiraoPoints).toFixed(2));
  const absDelta = Math.abs(pointsDelta);

  let leader = 'technical_tie';
  if (minRuns < 10) {
    leader = 'insufficient_sample';
  } else if (pointsDelta > 0.99) {
    leader = 'tarifa-zero-corredor';
  } else if (pointsDelta < -0.99) {
    leader = 'mutirao-do-bairro';
  }

  const warnings = [];
  if ((tarifa.runs || 0) < minRunsForSignal || (mutirao.runs || 0) < minRunsForSignal) {
    warnings.push(`Amostra arcade ainda em consolidacao: Tarifa ${tarifa.runs || 0}/${minRunsForSignal} runs, Mutirao ${mutirao.runs || 0}/${minRunsForSignal} runs.`);
  }

  let state = 'directional_lead';
  let recommendation = 'technical_tie';
  let summary = 'Empate tecnico entre os arcades nesta janela.';
  let readyForNextStep = false;

  if (minRuns < 10) {
    state = 'insufficient_sample';
    recommendation = 'insufficient_sample';
    summary = 'Amostra insuficiente para declarar lideranca entre Tarifa Zero e Mutirao.';
  } else if (minRuns < minRunsForSignal) {
    state = 'early_signal';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : leader === 'mutirao-do-bairro' ? 'arcade_b_leads' : 'technical_tie';
    summary = leader === 'technical_tie' ? 'Sinal inicial sem vencedor claro; manter distribuicao equilibrada.' : `Sinal inicial aponta ${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} na frente, ainda sem massa critica.`;
  } else if (leader === 'technical_tie') {
    state = 'directional_lead';
    recommendation = 'technical_tie';
    summary = 'Com amostra minima atingida, a leitura continua em empate tecnico.';
  } else if (minRuns >= minRunsForReadiness && absDelta >= 2.4) {
    state = 'ready_for_next_step';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : 'arcade_b_leads';
    summary = `${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} lidera com amostra robusta para proximo passo.`;
    readyForNextStep = true;
  } else if (absDelta >= 2.4) {
    state = 'candidate_flagship';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : 'arcade_b_leads';
    summary = `${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} lidera com sinal forte, aguardando consolidacao.`;
  } else {
    state = 'directional_lead';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : 'arcade_b_leads';
    summary = `${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} lidera de forma direcional.`;
  }

  return {
    compared: {
      tarifaSlug: 'tarifa-zero-corredor',
      mutiraoSlug: 'mutirao-do-bairro',
    },
    sample: {
      tarifaRuns: tarifa.runs || 0,
      mutiraoRuns: mutirao.runs || 0,
      minRunsForSignal,
      minRunsForReadiness,
    },
    campaignStrength: {
      tarifa: {
        slug: 'tarifa-zero-corredor',
        title: 'Tarifa Zero RJ - Corredor do Povo',
        runs: tarifa.runs || 0,
        runEndRate: tarifa.runEndRate || 0,
        replayRate: tarifa.replayRate || 0,
        campaignCtaRate: tarifa.campaignCtaRate || 0,
        firstInputAvgMs: tarifa.firstInputAvgMs || 0,
        weightedScore: tarifaStrength,
      },
      mutirao: {
        slug: 'mutirao-do-bairro',
        title: 'Mutirao do Bairro',
        runs: mutirao.runs || 0,
        runEndRate: mutirao.runEndRate || 0,
        replayRate: mutirao.replayRate || 0,
        campaignCtaRate: mutirao.campaignCtaRate || 0,
        firstInputAvgMs: mutirao.firstInputAvgMs || 0,
        weightedScore: mutiraoStrength,
      },
      winner: tarifaStrength - mutiraoStrength > 2 ? 'tarifa-zero-corredor' : mutiraoStrength - tarifaStrength > 2 ? 'mutirao-do-bairro' : 'technical_tie',
      scoreDelta: tarifaStrength - mutiraoStrength,
    },
    duel: {
      leader,
      confidence: minRuns < 10 ? 'insufficient_sample' : minRuns < minRunsForSignal ? 'early_signal' : absDelta >= 2.4 ? 'strong' : 'directional',
      tarifaPoints,
      mutiraoPoints,
      pointsDelta,
      dimensions,
    },
    decision: {
      state,
      recommendation,
      readyForNextStep,
      summary,
      warnings,
    },
  };
}

module.exports = {
  buildArcadeRowsFromEvents,
  buildArcadeLineDecisionFromRows,
};
