#!/usr/bin/env node
/**
 * Gerador de Snapshot Operacional do Beta (Tijolo 17)
 *
 * Prioriza dados remotos (Supabase) e cai para local quando necessario.
 * Uso: node tools/beta-snapshot.js [--format=json|md]
 */

const fs = require('fs');
const path = require('path');
const {
  buildCirculationFromRows,
  parseExperimentsRegistry,
  buildExperimentScorecards,
  buildReadingCriteria,
  toTopRows,
  loadCatalogMetadata,
  buildQuickLineInsights,
} = require('./circulation-utils');
const { analyzeEffectiveRuns } = require('./effective-runs-utils');

function loadLocalEnv() {
  const candidates = ['.env.local', '.env'];

  for (const name of candidates) {
    const filePath = path.join(__dirname, '..', name);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const index = trimmed.indexOf('=');
      if (index <= 0) {
        continue;
      }

      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

function parseArgs(argv) {
  return {
    format: argv.find((a) => a.startsWith('--format='))?.split('=')[1] || 'md',
    window: argv.find((a) => a.startsWith('--window='))?.split('=')[1] || 'all',
  };
}

function getLocalArray(key) {
  try {
    const dataPath = path.join(__dirname, '..', '.local-data', `${key}.json`);
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch {
    // noop
  }
  return [];
}

async function supabaseSelect(table, query) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  const endpoint = `${url}/rest/v1/${table}?${query}`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

async function recordSnapshotAudit(snapshot, metadata = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return false;
  }

  const actorSource = process.env.GITHUB_ACTIONS === 'true' ? 'ops-cron' : 'ops-local';

  try {
    const response = await fetch(`${url}/rest/v1/rpc/log_ops_action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        p_action_type: 'snapshot_generated',
        p_target_type: 'ops',
        p_target_id: snapshot.source || 'unknown',
        p_previous_value: null,
        p_next_value: snapshot.generatedAt,
        p_actor_label: 'ops-routine',
        p_actor_source: actorSource,
        p_metadata: {
          source: snapshot.source,
          totalSessions: snapshot.overview?.totalSessions || 0,
          completedSessions: snapshot.overview?.completedSessions || 0,
          shareRate: snapshot.overview?.shareRate || 0,
          ...metadata,
        },
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

function getExperimentsRegistry() {
  const registryPath = path.join(__dirname, '..', 'lib', 'experiments', 'registry.ts');
  if (!fs.existsSync(registryPath)) {
    return [];
  }

  const content = fs.readFileSync(registryPath, 'utf-8');
  const registry = parseExperimentsRegistry(content);

  const overrideStr = process.env.EXPERIMENTS_OVERRIDE || process.env.NEXT_PUBLIC_EXPERIMENTS_OVERRIDE;
  if (!overrideStr) {
    return registry;
  }

  const overrides = {};
  overrideStr.split(',').forEach((pair) => {
    const [key, value] = pair.split(':').map((item) => item.trim());
    if (key && (value === 'true' || value === 'false')) {
      overrides[key] = value === 'true';
    }
  });

  return registry.map((exp) => ({
    ...exp,
    enabled: exp.key in overrides ? overrides[exp.key] : exp.enabled,
    overridden: exp.key in overrides,
  }));
}

function normalizeExperimentsPayload(experiments) {
  if (Array.isArray(experiments)) {
    return experiments;
  }

  if (!experiments) {
    return [];
  }

  if (typeof experiments === 'string') {
    try {
      const parsed = JSON.parse(experiments);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function buildQrExperimentSummary(sessions, events) {
  const bySession = {};
  for (const session of sessions || []) {
    const experiments = normalizeExperimentsPayload(session.experiments);
    const hit = experiments.find((item) => item.key === 'final-card-qr-code');
    if (hit) {
      bySession[session.session_id || session.sessionId] = hit.variant;
    }
  }

  const summary = {
    'with-qr': { sessions: 0, completions: 0, qrViews: 0, qrClicks: 0 },
    'without-qr': { sessions: 0, completions: 0, qrViews: 0, qrClicks: 0 },
  };

  for (const session of sessions || []) {
    const variant = bySession[session.session_id || session.sessionId];
    if (!variant || !summary[variant]) {
      continue;
    }
    summary[variant].sessions += 1;
    if (session.status === 'completed') {
      summary[variant].completions += 1;
    }
  }

  for (const event of events || []) {
    const variant = bySession[event.session_id || event.sessionId];
    if (!variant || !summary[variant]) {
      continue;
    }
    const name = event.event_name || event.event;
    if (name === 'final_card_qr_view') {
      summary[variant].qrViews += 1;
    }
    if (name === 'final_card_qr_click') {
      summary[variant].qrClicks += 1;
    }
  }

  return Object.fromEntries(
    Object.entries(summary).map(([variant, row]) => [
      variant,
      {
        ...row,
        completionRate: row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0,
        qrCtr: row.qrViews > 0 ? Math.round((row.qrClicks / row.qrViews) * 100) : 0,
      },
    ]),
  );
}

function aggregateFromLocal(registry, window = 'all') {
  const catalogMap = loadCatalogMetadata();
  const sessions = getLocalArray('sessions');
  const events = getLocalArray('events');
  const feedback = getLocalArray('feedback');

  const completedSessions = sessions.filter((s) => s.status === 'completed').length;
  const totalStarts = events.filter((e) => e.event === 'game_start').length;
  const totalShares = events.filter((e) => e.event === 'result_copy' || e.event === 'link_copy').length;

  const sources = {};
  sessions.forEach((s) => {
    const source = s.utm_source || 'direto/desconhecido';
    sources[source] = (sources[source] || 0) + 1;
  });

  const gameStats = {};
  sessions.forEach((s) => {
    if (!gameStats[s.slug]) {
      gameStats[s.slug] = { initiated: 0, completed: 0 };
    }
    gameStats[s.slug].initiated += 1;
    if (s.status === 'completed') {
      gameStats[s.slug].completed += 1;
    }
  });

  const topSources = Object.entries(sources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));

  const topGames = Object.entries(gameStats)
    .map(([slug, stats]) => ({
      slug,
      initiated: stats.initiated,
      completed: stats.completed,
      completionRate: stats.initiated > 0 ? Math.round((stats.completed / stats.initiated) * 100) : 0,
    }))
    .sort((a, b) => b.initiated - a.initiated)
    .slice(0, 5);

  const circulation = buildCirculationFromRows(
    sessions.map((s) => ({
      session_id: s.sessionId,
      slug: s.slug,
      engine_kind: s.engineKind,
      status: s.status,
      utm_source: s.utm_source,
      referrer: s.referrer,
      created_at: s.createdAt || s.created_at,
    })),
    events.map((e) => ({
      session_id: e.sessionId,
      event_name: e.event,
      slug: e.slug,
      engine_kind: e.engineKind,
      cta_id: e.ctaId,
      metadata: e.metadata,
      created_at: e.createdAt || e.created_at,
    })),
    window,
  );
  const quickInsights = buildQuickLineInsights(
    sessions.map((s) => ({ session_id: s.sessionId, slug: s.slug, status: s.status, experiments: s.experiments || [] })),
    events.map((e) => ({ session_id: e.sessionId, event_name: e.event, slug: e.slug, metadata: e.metadata })),
    catalogMap,
    window,
  );
  const qrExperimentSummary = buildQrExperimentSummary(
    sessions.map((s) => ({ session_id: s.sessionId, status: s.status, experiments: s.experiments || [] })),
    events.map((e) => ({ session_id: e.sessionId, event_name: e.event })),
  );
  const territoryBySlug = Object.fromEntries(
    Object.values(catalogMap || {}).map((game) => [game.slug, game.territoryScope || 'estado-rj']),
  );
  const effectiveRuns = analyzeEffectiveRuns(
    events.map((e) => ({
      session_id: e.sessionId,
      event_name: e.event,
      slug: e.slug,
      metadata: e.metadata,
      created_at: e.createdAt || e.created_at,
    })),
    {
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        slug: s.slug,
        utmSource: s.utm_source,
      })),
      territoryBySlug,
    },
  );

  const experimentRows = [];
  sessions.forEach((s) => {
    (s.experiments || []).forEach((exp) => {
      const existing = experimentRows.find((row) => row.experiment_key === exp.key && row.variant === exp.variant);
      if (existing) {
        existing.sessions += 1;
        if (s.status === 'completed') {
          existing.completions += 1;
        }
      } else {
        experimentRows.push({
          experiment_key: exp.key,
          variant: exp.variant,
          sessions: 1,
          completions: s.status === 'completed' ? 1 : 0,
          completion_rate: 0,
        });
      }
    });
  });

  experimentRows.forEach((row) => {
    row.completion_rate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
  });

  const scorecards = buildExperimentScorecards(experimentRows, registry);
  const readingCriteria = buildReadingCriteria(circulation, sources, scorecards);

  return {
    source: 'local',
    generatedAt: new Date().toISOString(),
    overview: {
      totalSessions: sessions.length,
      totalStarts,
      completedSessions,
      totalShares,
      completionRate: sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0,
      shareRate: completedSessions > 0 ? Math.round((totalShares / completedSessions) * 100) : 0,
    },
    feedback: {
      total: feedback.length,
      positive: feedback.filter((f) => f.rating === 'positive').length,
      neutral: feedback.filter((f) => f.rating === 'neutral').length,
      negative: feedback.filter((f) => f.rating === 'negative').length,
      withComments: feedback.filter((f) => f.comment && String(f.comment).trim()).length,
    },
    topSources,
    topGames,
    circulation,
    quickInsights,
    effectiveRuns,
    qrExperimentSummary,
    readingCriteria,
    scorecards,
    experiments: experimentRows,
  };
}

async function aggregateFromRemote(registry, window = 'all') {
  const catalogMap = loadCatalogMetadata();
  const [
    funnelRows,
    sourceRows,
    gameRows,
    engineRows,
    expRows,
    feedbackRows,
    eventRows,
    sessionRows,
  ] = await Promise.all([
    supabaseSelect('beta_funnel_overview', 'select=*'),
    supabaseSelect('beta_sources_overview', 'select=source,sessions&order=sessions.desc&limit=5'),
    supabaseSelect('beta_game_overview', 'select=slug,initiated,completed,completion_rate&order=initiated.desc&limit=5'),
    supabaseSelect('beta_engine_overview', 'select=engine_kind,sessions,completions,completion_rate&order=sessions.desc&limit=5'),
    supabaseSelect('experiment_performance', 'select=experiment_key,variant,sessions,completions,completion_rate'),
    supabaseSelect('feedback_records', 'select=rating,comment&limit=1000'),
    supabaseSelect(
      'game_events',
      'select=session_id,event_name,slug,engine_kind,cta_id,metadata,created_at&event_name=in.(game_start,arcade_run_start,arcade_first_input_time,game_complete,outcome_view,primary_cta_click,secondary_cta_click,campaign_cta_click_after_game,share_page_view,share_page_play_click,next_game_click,hub_return_click,result_copy,link_copy,final_card_view,final_card_download,final_card_share_click,final_card_qr_view,final_card_qr_click,quick_minigame_replay,replay_click,replay_after_run_click,outcome_replay_intent,first_interaction_time,card_preview_interaction,card_full_click,click_to_play_time,next_game_after_run_click,quick_to_arcade_click,arcade_to_quick_click)&limit=10000',
    ),
    supabaseSelect('game_sessions', 'select=session_id,slug,engine_kind,status,utm_source,referrer,experiments&limit=10000'),
  ]);

  if (!funnelRows || funnelRows.length === 0) {
    return null;
  }

  const funnel = funnelRows[0];
  const circulation = buildCirculationFromRows(sessionRows || [], eventRows || [], window);
  const scorecards = buildExperimentScorecards(expRows || [], registry);
  const quickInsights = buildQuickLineInsights(sessionRows || [], eventRows || [], catalogMap, window);
  const qrExperimentSummary = buildQrExperimentSummary(sessionRows || [], eventRows || []);
  const territoryBySlug = Object.fromEntries(
    Object.values(catalogMap || {}).map((game) => [game.slug, game.territoryScope || 'estado-rj']),
  );
  const effectiveRuns = analyzeEffectiveRuns(eventRows || [], {
    sessions: (sessionRows || []).map((session) => ({
      sessionId: session.session_id,
      slug: session.slug,
      utmSource: session.utm_source,
    })),
    territoryBySlug,
  });
  const sourceMap = {};
  (sourceRows || []).forEach((row) => {
    sourceMap[row.source] = Number(row.sessions || 0);
  });
  const readingCriteria = buildReadingCriteria(circulation, sourceMap, scorecards);

  return {
    source: 'supabase',
    generatedAt: new Date().toISOString(),
    overview: {
      totalSessions: Number(funnel.total_sessions || 0),
      totalStarts: Number(funnel.starts || 0),
      completedSessions: Number(funnel.completions || 0),
      totalShares: Number(funnel.shares || 0),
      completionRate:
        Number(funnel.total_sessions || 0) > 0
          ? Math.round((Number(funnel.completions || 0) / Number(funnel.total_sessions || 1)) * 100)
          : 0,
      shareRate:
        Number(funnel.completions || 0) > 0
          ? Math.round((Number(funnel.shares || 0) / Number(funnel.completions || 1)) * 100)
          : 0,
    },
    feedback: {
      total: (feedbackRows || []).length,
      positive: (feedbackRows || []).filter((f) => f.rating === 'positive').length,
      neutral: (feedbackRows || []).filter((f) => f.rating === 'neutral').length,
      negative: (feedbackRows || []).filter((f) => f.rating === 'negative').length,
      withComments: (feedbackRows || []).filter((f) => f.comment && String(f.comment).trim()).length,
    },
    topSources: (sourceRows || []).map((row) => ({ source: row.source, count: Number(row.sessions || 0) })),
    topGames: (gameRows || []).map((row) => ({
      slug: row.slug,
      initiated: Number(row.initiated || 0),
      completed: Number(row.completed || 0),
      completionRate: Number(row.completion_rate || 0),
    })),
    topEngines: (engineRows || []).map((row) => ({
      engine: row.engine_kind,
      sessions: Number(row.sessions || 0),
      completions: Number(row.completions || 0),
      completionRate: Number(row.completion_rate || 0),
    })),
    circulation,
    quickInsights,
    effectiveRuns,
    qrExperimentSummary,
    readingCriteria,
    scorecards,
    experiments: expRows || [],
  };
}

function mergeHybrid(remote, local) {
  if (!remote) {
    return local;
  }

  if (!local || local.overview.totalSessions === 0) {
    return remote;
  }

  return {
    ...remote,
    source: 'hybrid',
    generatedAt: new Date().toISOString(),
  };
}

async function generateSnapshot(window = 'all') {
  const registry = getExperimentsRegistry();
  const local = aggregateFromLocal(registry, window);
  const remote = await aggregateFromRemote(registry, window);

  if (!remote) {
    return local;
  }

  return mergeHybrid(remote, local);
}

function formatAsMarkdown(snapshot) {
  const topExitSources = toTopRows(snapshot.circulation.exitsBySource, 5);
  const topExitGames = toTopRows(snapshot.circulation.exitsByGame, 5);
  const topExitEngines = toTopRows(snapshot.circulation.exitsByEngine, 5);

  return `# Snapshot Operacional do Beta

**Gerado em:** ${new Date(snapshot.generatedAt).toLocaleString('pt-BR')}
**Fonte de dados:** ${snapshot.source}

---

## Visao Geral

- **Sessoes Totais:** ${snapshot.overview.totalSessions}
- **Inicios:** ${snapshot.overview.totalStarts}
- **Conclusoes:** ${snapshot.overview.completedSessions}
- **Compartilhamentos:** ${snapshot.overview.totalShares}
- **Taxa de Conclusao:** ${snapshot.overview.completionRate}%
- **Taxa de Share:** ${snapshot.overview.shareRate}%

## Circulacao (Tijolo 17)

### CTR por placement
${Object.entries(snapshot.circulation.ctrByPlacement)
  .map(([placement, row]) => `- **${placement}**: ${row.clicks}/${row.outcomeViews} (${row.ctr}%)`)
  .join('\n') || '_Sem dados_'}

### Top CTAs
${snapshot.circulation.topCtas
  .map((cta) => `- **${cta.ctaId}**: ${cta.clicks} clicks${cta.trackingId ? ` (${cta.trackingId})` : ''}`)
  .join('\n') || '_Sem dados_'}

### Share -> Reentry
- Share page views: ${snapshot.circulation.shareReentry.sharePageViews}
- Next game clicks: ${snapshot.circulation.shareReentry.nextGameClicks}
- Hub return clicks: ${snapshot.circulation.shareReentry.hubReturnClicks}
- Reentry actions: ${snapshot.circulation.shareReentry.reentryActions}
- Reentry rate: ${snapshot.circulation.shareReentry.reentryRate}%

### Saidas por origem (top 5)
${topExitSources.map((item) => `- **${item.key}**: ${item.value.exits} (${item.value.exitRate}%)`).join('\n') || '_Sem dados_'}

### Saidas por jogo (top 5)
${topExitGames.map((item) => `- **${item.key}**: ${item.value.exits} (${item.value.exitRate}%)`).join('\n') || '_Sem dados_'}

### Saidas por engine
${topExitEngines.map((item) => `- **${item.key}**: ${item.value.exits} (${item.value.exitRate}%)`).join('\n') || '_Sem dados_'}

## Linha Quick (Tijolo 26)

### Quick vs Quick
${(snapshot.quickInsights?.quickComparison || [])
  .map(
    (row) =>
      `- **${row.title}**: views ${row.sessions}, starts ${row.starts}, conclusão ${row.completionRate}%, replay ${row.replayRate}%, share ${row.shareRate}%, CTA pós-jogo ${row.postGameCtaClicks}, card final ${row.finalCardInteractions}, share→play ${row.reentryRate}%, TFI ${row.firstInteractionAvgMs}ms, QR CTR ${row.qrCtr}%, grude ${row.stickyScore}`,
  )
  .join('\n') || '_Sem dados quick suficientes_'}

### Ranking de grude (quick)
${(snapshot.quickInsights?.quickRanking || [])
  .map((row, index) => `${index + 1}. **${row.title}** (${row.stickyScore})`)
  .join('\n') || '_Sem ranking_'}

### Ranking por série (quick)
${(snapshot.quickInsights?.rankedSeries || [])
  .map((row, index) => `${index + 1}. **${row.key}** (${row.stickyScore}) - sessões ${row.sessions}, conv ${row.completionRate}%, share ${row.shareRate}%`)
  .join('\n') || '_Sem dados por série_'}

### Ranking por território (quick)
${(snapshot.quickInsights?.rankedTerritory || [])
  .map((row, index) => `${index + 1}. **${row.key}** (${row.stickyScore}) - sessões ${row.sessions}, share ${row.shareRate}%, replay ${row.replayRate}%, jogo forte ${row.topGameTitle || row.topGameSlug}`)
  .join('\n') || '_Sem dados por território_'}

### Eixo político líder (quick)
${(snapshot.quickInsights?.rankedPoliticalAxis || [])
  .map((row, index) => `${index + 1}. **${row.key}** (${row.stickyScore}) - sessões ${row.sessions}, conv ${row.completionRate}%, share ${row.shareRate}%`)
  .join('\n') || '_Sem dados por eixo_'}

### QR A/B (with-qr vs without-qr)
${Object.entries(snapshot.quickInsights?.qrReadout || snapshot.qrExperimentSummary || {})
  .map(([variant, row]) => `- **${variant}**: sessões ${row.sessions}, conclusão ${row.completionRate}%, QR views ${row.qrViews}, QR clicks ${row.qrClicks}, QR CTR ${row.qrCtr}%, status ${row.status || 'monitorando'}, delta ${row.deltaVsBaselinePct ?? 0}pp`)
  .join('\n') || '_Sem dados de experimento QR_'}

### Série e território (quick)
- Série: ${Object.entries(snapshot.quickInsights?.bySeries || {})
  .map(([key, row]) => `${key}=${row.sessions} sessões/${row.completions} conclusões`)
  .join(' | ') || 'sem dados'}
- Território: ${Object.entries(snapshot.quickInsights?.byTerritory || {})
  .map(([key, row]) => `${key}=${row.sessions} sessões/${row.completions} conclusões`)
  .join(' | ') || 'sem dados'}
- Eixo político: ${Object.entries(snapshot.quickInsights?.byPoliticalAxis || {})
  .map(([axis, row]) => `${axis}: ${row.sessions} sessões, ${row.completions} conclusões, ${row.shares} shares`)
  .join(' | ') || 'sem dados'}
- Comum vs mercado: ${Object.entries(snapshot.quickInsights?.byCommonVsMarket || {})
  .map(([bucket, row]) => `${bucket}: ${row.sessions} sessões, ${row.completions} conclusões, ${row.shares} shares`)
  .join(' | ') || 'sem dados'}
- Mais grudento: ${snapshot.quickInsights?.topStickyGame?.title || 'n/a'}

### Heurística e aviso de amostra
- Heurística: completion 30%, replay 20%, share 20%, CTA 15%, share→play 10%, TFI 5%
- Alertas: ${(snapshot.quickInsights?.warnings || []).join(' | ') || 'sem alertas de amostra no quick'}

## Run Efetiva (Tijolo 33)

### Scorecards de conversão real
${Object.values(snapshot.effectiveRuns?.scorecards || {})
  .map((card) => `- **${card.name}**: ${card.effectiveConversions}/${card.totalClicks} (${card.conversionRate}%) - status ${card.status}`)
  .join('\n') || '_Sem dados de run efetiva_'}

### Direção cross-game mais forte
- Quick -> Arcade: ${snapshot.effectiveRuns?.direction?.quickToArcade?.effectiveStarts || 0}/${snapshot.effectiveRuns?.direction?.quickToArcade?.clicks || 0} (${snapshot.effectiveRuns?.direction?.quickToArcade?.effectiveRate || 0}%)
- Arcade -> Quick: ${snapshot.effectiveRuns?.direction?.arcadeToQuick?.effectiveStarts || 0}/${snapshot.effectiveRuns?.direction?.arcadeToQuick?.clicks || 0} (${snapshot.effectiveRuns?.direction?.arcadeToQuick?.effectiveRate || 0}%)
- Vencedor da direção: ${snapshot.effectiveRuns?.directionWinner || 'balanced'}

### Top puxadores de run real
${(snapshot.effectiveRuns?.topEffectiveRunsByGame || [])
  .map((row, index) => `${index + 1}. **${row.slug}** - ${row.effectiveRuns}/${row.cardClicks} (${row.effectiveRunRate}%)`)
  .join('\n') || '_Sem amostra suficiente_'}

### Avisos de baixa amostra
${(snapshot.effectiveRuns?.warnings || []).map((warning) => `- ${warning}`).join('\n') || '- Sem alertas de amostra em run efetiva'}

## Scorecards de Experimento
${snapshot.scorecards
  .map(
    (card) =>
      `### ${card.name}\n- Status: **${card.status}**\n- Superficie: ${card.affectedSurface}\n- Metrica principal: ${card.primaryMetric}\n- Melhor variante: ${card.bestVariantKey || 'n/a'}\n- Lift vs 2a: ${card.liftVsSecondPct}%\n- Leitura: ${card.rationale}`,
  )
  .join('\n\n') || '_Sem scorecards_'}

## Criterios minimos de leitura
${snapshot.readingCriteria.warnings.map((warning) => `- ${warning}`).join('\n') || '- Sem alertas de amostra no momento.'}

---

_Este snapshot prioriza dados remotos quando Supabase estiver configurado._
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshot = await generateSnapshot(args.window);

  if (args.format === 'json') {
    const recorded = await recordSnapshotAudit(snapshot, { format: 'json' });
    console.log(JSON.stringify(snapshot, null, 2));
    if (!recorded) {
      console.error('Aviso: nao foi possivel registrar snapshot no audit log.');
    }
    return;
  }

  const markdown = formatAsMarkdown(snapshot);
  const outputDir = path.join(__dirname, '..', 'reports', 'snapshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `beta-snapshot-${timestamp}.md`;
  const outputPath = path.join(outputDir, filename);

  fs.writeFileSync(outputPath, markdown, 'utf-8');

  const recorded = await recordSnapshotAudit(snapshot, {
    format: 'md',
    outputPath: outputPath.replace(process.cwd(), '.'),
  });

  console.log(markdown);
  console.log(`\nSnapshot salvo em: ${outputPath}`);
  if (!recorded) {
    console.error('Aviso: nao foi possivel registrar snapshot no audit log.');
  }
}

main().catch((err) => {
  console.error('Falha ao gerar snapshot:', err?.message || err);
  process.exit(1);
});
