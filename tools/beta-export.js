#!/usr/bin/env node
/**
 * Export operacional do beta (Tijolo 17)
 *
 * Exporta resumo estruturado em JSON com prioridade remota.
 * Uso: node tools/beta-export.js
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

async function supabaseSelect(table, query) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
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

function getExperimentsRegistry() {
  const registryPath = path.join(__dirname, '..', 'lib', 'experiments', 'registry.ts');
  if (!fs.existsSync(registryPath)) {
    return [];
  }

  const content = fs.readFileSync(registryPath, 'utf-8');
  return parseExperimentsRegistry(content);
}

function buildLocalExperimentRows(sessions) {
  const rows = [];
  for (const session of sessions) {
    for (const exp of session.experiments || []) {
      const found = rows.find((row) => row.experiment_key === exp.key && row.variant === exp.variant);
      if (found) {
        found.sessions += 1;
        if (session.status === 'completed') {
          found.completions += 1;
        }
      } else {
        rows.push({
          experiment_key: exp.key,
          variant: exp.variant,
          sessions: 1,
          completions: session.status === 'completed' ? 1 : 0,
        });
      }
    }
  }

  rows.forEach((row) => {
    row.completion_rate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
  });

  return rows;
}

function summarizeCirculation(circulation) {
  return {
    topCtas: circulation.topCtas,
    topExitSources: toTopRows(circulation.exitsBySource, 5),
    topExitGames: toTopRows(circulation.exitsByGame, 5),
    topExitEngines: toTopRows(circulation.exitsByEngine, 5),
  };
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
  const safeSessions = sessions || [];
  const safeEvents = events || [];

  const bySession = {};
  for (const session of safeSessions) {
    const variants = normalizeExperimentsPayload(session.experiments);
    const hit = variants.find((item) => item.key === 'final-card-qr-code');
    if (hit) {
      bySession[session.session_id || session.sessionId] = hit.variant;
    }
  }

  const summary = {
    'with-qr': { sessions: 0, completions: 0, qrViews: 0, qrClicks: 0, finalCardViews: 0 },
    'without-qr': { sessions: 0, completions: 0, qrViews: 0, qrClicks: 0, finalCardViews: 0 },
  };

  for (const session of safeSessions) {
    const variant = bySession[session.session_id || session.sessionId];
    if (!variant || !summary[variant]) {
      continue;
    }

    summary[variant].sessions += 1;
    if (session.status === 'completed') {
      summary[variant].completions += 1;
    }
  }

  for (const event of safeEvents) {
    const variant = bySession[event.session_id || event.sessionId];
    if (!variant || !summary[variant]) {
      continue;
    }

    const eventName = event.event_name || event.event;
    if (eventName === 'final_card_view') {
      summary[variant].finalCardViews += 1;
    }
    if (eventName === 'final_card_qr_view') {
      summary[variant].qrViews += 1;
    }
    if (eventName === 'final_card_qr_click') {
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

async function buildExport(window = 'all') {
  const registry = getExperimentsRegistry();
  const catalogMap = loadCatalogMetadata();
  const remoteFunnel = await supabaseSelect('beta_funnel_overview', 'select=*');

  if (remoteFunnel && remoteFunnel.length > 0) {
    const [sources, games, engines, events, experiments, feedback, auditRecent, auditSummaryRows, circulationEvents, sessions] =
      await Promise.all([
        supabaseSelect('beta_sources_overview', 'select=*'),
        supabaseSelect('beta_game_overview', 'select=*'),
        supabaseSelect('beta_engine_overview', 'select=*'),
        supabaseSelect('beta_events_overview', 'select=*'),
        supabaseSelect('experiment_performance', 'select=*'),
        supabaseSelect('feedback_recent', 'select=*'),
        supabaseSelect('ops_audit_log', 'select=action_type,target_id,actor_label,actor_source,created_at&order=created_at.desc&limit=50'),
        supabaseSelect('ops_audit_log', 'select=action_type'),
        supabaseSelect(
          'game_events',
          'select=session_id,event_name,slug,engine_kind,cta_id,metadata&event_name=in.(game_start,outcome_view,primary_cta_click,secondary_cta_click,campaign_cta_click_after_game,share_page_view,share_page_play_click,next_game_click,hub_return_click,result_copy,link_copy,final_card_view,final_card_download,final_card_share_click,final_card_qr_view,final_card_qr_click,quick_minigame_replay,replay_click,outcome_replay_intent,first_interaction_time)&limit=10000',
        ),
        supabaseSelect('game_sessions', 'select=session_id,slug,engine_kind,status,utm_source,referrer,experiments&limit=10000'),
      ]);

    const byActionType = {};
    (auditSummaryRows || []).forEach((entry) => {
      byActionType[entry.action_type] = (byActionType[entry.action_type] || 0) + 1;
    });

    const byDay = {};
    (auditRecent || []).forEach((entry) => {
      const day = String(entry.created_at || '').slice(0, 10);
      if (day) {
        byDay[day] = (byDay[day] || 0) + 1;
      }
    });

    const sourceMap = {};
    (sources || []).forEach((row) => {
      sourceMap[row.source] = Number(row.sessions || 0);
    });

    const circulation = buildCirculationFromRows(sessions || [], circulationEvents || [], window);
    const scorecards = buildExperimentScorecards(experiments || [], registry);
    const quickInsights = buildQuickLineInsights(sessions || [], circulationEvents || [], catalogMap, window);
    const qrExperimentSummary = buildQrExperimentSummary(sessions || [], circulationEvents || []);
    const readingCriteria = buildReadingCriteria(circulation, sourceMap, scorecards);

    return {
      source: 'supabase',
      generatedAt: new Date().toISOString(),
      funnel: remoteFunnel[0],
      sources: sources || [],
      games: games || [],
      engines: engines || [],
      events: events || [],
      experiments: experiments || [],
      scorecards,
      readingCriteria,
      circulation,
      circulationSummary: summarizeCirculation(circulation),
      quickInsights,
      qrExperimentSummary,
      feedback: feedback || [],
      audit: {
        recent: auditRecent || [],
        summary: {
          total: auditSummaryRows ? auditSummaryRows.length : 0,
          byActionType,
          byDay,
          lastAction: (auditRecent && auditRecent.length > 0) ? auditRecent[0] : null,
        },
      },
    };
  }

  const sessions = getLocalArray('sessions');
  const events = getLocalArray('events');
  const experiments = buildLocalExperimentRows(sessions);
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
    sessions.map((s) => ({
      session_id: s.sessionId,
      slug: s.slug,
      status: s.status,
      experiments: s.experiments || [],
    })),
    events.map((e) => ({
      session_id: e.sessionId,
      event_name: e.event,
      slug: e.slug,
      metadata: e.metadata,
    })),
    catalogMap,
    window,
  );
  const qrExperimentSummary = buildQrExperimentSummary(
    sessions.map((s) => ({
      session_id: s.sessionId,
      slug: s.slug,
      status: s.status,
      experiments: s.experiments || [],
    })),
    events.map((e) => ({
      session_id: e.sessionId,
      event_name: e.event,
      slug: e.slug,
      metadata: e.metadata,
    })),
  );

  const sourceMap = {};
  sessions.forEach((s) => {
    const source = s.utm_source || 'direto/desconhecido';
    sourceMap[source] = (sourceMap[source] || 0) + 1;
  });

  const scorecards = buildExperimentScorecards(experiments, registry);
  const readingCriteria = buildReadingCriteria(circulation, sourceMap, scorecards);

  return {
    source: 'local',
    generatedAt: new Date().toISOString(),
    sessions,
    events,
    results: getLocalArray('results'),
    feedback: getLocalArray('feedback'),
    experiments,
    scorecards,
    readingCriteria,
    circulation,
    circulationSummary: summarizeCirculation(circulation),
    quickInsights,
    qrExperimentSummary,
    audit: {
      recent: [],
      summary: {
        total: 0,
        byActionType: {},
        byDay: {},
        lastAction: null,
      },
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const window = args.find((a) => a.startsWith('--window='))?.split('=')[1] || 'all';
  const data = await buildExport(window);

  const outputDir = path.join(__dirname, '..', 'reports', 'exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputPath = path.join(outputDir, `beta-export-${stamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(JSON.stringify({ source: data.source, outputPath }, null, 2));
}

main().catch((error) => {
  console.error('Falha no export:', error?.message || error);
  process.exit(1);
});
