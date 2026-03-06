#!/usr/bin/env node
/**
 * Tijolo 18: Staleness Check
 * 
 * Verifica freshness dos dados e emite alertas quando experimentos
 * ou métricas estão sem tráfego recente (>72h)
 * 
 * Uso: node tools/beta-staleness-check.js [--format=json|md]
 */

const fs = require('fs');
const path = require('path');

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

const STALENESS_THRESHOLD_HOURS = 72;

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'nunca';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

function isStale(dateStr) {
  if (!dateStr) return true;
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  return diffHours > STALENESS_THRESHOLD_HOURS;
}

async function checkStaleness() {
  const [sessions, events, experiments] = await Promise.all([
    supabaseSelect('game_sessions', 'select=created_at&order=created_at.desc&limit=1'),
    supabaseSelect('game_events', 'select=created_at&order=created_at.desc&limit=1'),
    supabaseSelect('experiment_performance', 'select=experiment_key,variant,sessions'),
  ]);

  const lastSessionAt = sessions?.[0]?.created_at || null;
  const lastEventAt = events?.[0]?.created_at || null;

  const alerts = [];
  const info = [];

  // Check overall traffic staleness
  if (isStale(lastSessionAt)) {
    alerts.push({
      severity: 'critical',
      category: 'traffic',
      message: `Última sessão há ${formatTimeAgo(lastSessionAt)} (>${STALENESS_THRESHOLD_HOURS}h)`,
      lastActivity: lastSessionAt,
    });
  } else if (lastSessionAt) {
    info.push({
      category: 'traffic',
      message: `Tráfego ativo: última sessão há ${formatTimeAgo(lastSessionAt)}`,
      lastActivity: lastSessionAt,
    });
  }

  if (isStale(lastEventAt)) {
    alerts.push({
      severity: 'critical',
      category: 'events',
      message: `Último evento há ${formatTimeAgo(lastEventAt)} (>${STALENESS_THRESHOLD_HOURS}h)`,
      lastActivity: lastEventAt,
    });
  } else if (lastEventAt) {
    info.push({
      category: 'events',
      message: `Eventos ativos: último há ${formatTimeAgo(lastEventAt)}`,
      lastActivity: lastEventAt,
    });
  }

  // Check experiments with zero sessions
  const inactiveExperiments = (experiments || []).filter((exp) => exp.sessions === 0);
  if (inactiveExperiments.length > 0) {
    alerts.push({
      severity: 'warning',
      category: 'experiments',
      message: `${inactiveExperiments.length} experimentos sem tráfego`,
      details: inactiveExperiments.map((exp) => `${exp.experiment_key}:${exp.variant}`),
    });
  }

  return {
    checkedAt: new Date().toISOString(),
    stalenessThreshold: `${STALENESS_THRESHOLD_HOURS}h`,
    lastSessionAt,
    lastEventAt,
    hasStaleData: alerts.some((a) => a.severity === 'critical'),
    alerts,
    info,
    summary: {
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warnings: alerts.filter((a) => a.severity === 'warning').length,
      healthy: alerts.length === 0,
    },
  };
}

function renderMarkdown(report) {
  const status = report.summary.healthy ? '✅ SAUDÁVEL' : '⚠️ ALERTAS DETECTADOS';
  
  return `# Staleness Check (Tijolo 18)

**Status:** ${status}  
**Verificado em:** ${new Date(report.checkedAt).toLocaleString('pt-BR')}  
**Threshold:** ${report.stalenessThreshold}

## Resumo

- Alertas críticos: ${report.summary.critical}
- Alertas de aviso: ${report.summary.warnings}

## Última atividade

- Última sessão: ${report.lastSessionAt ? formatTimeAgo(report.lastSessionAt) : 'nunca'}
- Último evento: ${report.lastEventAt ? formatTimeAgo(report.lastEventAt) : 'nunca'}

## Alertas

${report.alerts.length > 0
  ? report.alerts.map((alert) => {
      const details = alert.details ? `\n  - ${alert.details.join('\n  - ')}` : '';
      return `- [${alert.severity.toUpperCase()}] ${alert.category}: ${alert.message}${details}`;
    }).join('\n')
  : '_Nenhum alerta detectado_'}

## Informações

${report.info.length > 0
  ? report.info.map((item) => `- ${item.category}: ${item.message}`).join('\n')
  : '_Sem informações adicionais_'}
`;
}

async function main() {
  const args = process.argv.slice(2);
  const format = args.find((a) => a.startsWith('--format='))?.split('=')[1] || 'md';

  const report = await checkStaleness();

  if (format === 'json') {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const markdown = renderMarkdown(report);
  console.log(markdown);

  // Exit with error code if critical alerts found
  if (report.summary.critical > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Falha no staleness check:', error?.message || error);
  process.exit(1);
});
