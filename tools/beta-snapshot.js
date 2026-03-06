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
} = require('./circulation-utils');

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

function aggregateFromLocal(registry, window = 'all') {
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
    readingCriteria,
    scorecards,
    experiments: experimentRows,
  };
}

async function aggregateFromRemote(registry, window = 'all') {
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
      'select=session_id,event_name,slug,engine_kind,cta_id,metadata&event_name=in.(outcome_view,primary_cta_click,secondary_cta_click,share_page_view,next_game_click,hub_return_click)&limit=10000',
    ),
    supabaseSelect('game_sessions', 'select=session_id,slug,engine_kind,status,utm_source,referrer&limit=10000'),
  ]);

  if (!funnelRows || funnelRows.length === 0) {
    return null;
  }

  const funnel = funnelRows[0];
  const circulation = buildCirculationFromRows(sessionRows || [], eventRows || [], window);
  const scorecards = buildExperimentScorecards(expRows || [], registry);
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
