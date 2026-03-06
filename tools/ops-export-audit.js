#!/usr/bin/env node
/**
 * Export operacional de audit log (Tijolo 15)
 *
 * Gera export JSON + Markdown com:
 * - ultimas acoes do ops_audit_log
 * - resumo por action_type
 * - resumo por dia
 * - estimativa de backlog acima da janela de retencao
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

function parseArgs(argv) {
  const getArgValue = (name) => {
    const found = argv.find((item) => item.startsWith(`--${name}=`));
    if (!found) return undefined;
    return found.split('=')[1];
  };

  return {
    days: Number(getArgValue('days') || process.env.OPS_AUDIT_EXPORT_DAYS || 7),
    limit: Number(getArgValue('limit') || process.env.OPS_AUDIT_EXPORT_LIMIT || 300),
    retentionDays: Number(getArgValue('retention-days') || process.env.OPS_AUDIT_RETENTION_DAYS || 90),
  };
}

function toTimestampFileSafe(date) {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

async function supabaseRequest(pathname, { method = 'GET', headers = {}, body } = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    const response = await fetch(`${url}/rest/v1/${pathname}`, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        ...headers,
      },
      body,
    });

    return response;
  } catch {
    return null;
  }
}

async function fetchAuditRows(sinceIso, limit) {
  const query = `ops_audit_log?select=id,action_type,target_type,target_id,previous_value,next_value,actor_label,actor_source,created_at,metadata&created_at=gte.${encodeURIComponent(sinceIso)}&order=created_at.desc&limit=${limit}`;
  const response = await supabaseRequest(query);

  if (!response || !response.ok) {
    return null;
  }

  return await response.json();
}

async function countOlderThan(retentionIso) {
  const query = `ops_audit_log?select=id&created_at=lt.${encodeURIComponent(retentionIso)}&limit=1`;
  const response = await supabaseRequest(query, {
    headers: {
      Prefer: 'count=exact',
      Range: '0-0',
    },
  });

  if (!response || !response.ok) {
    return null;
  }

  const contentRange = response.headers.get('content-range');
  if (!contentRange || !contentRange.includes('/')) {
    return null;
  }

  const total = Number(contentRange.split('/')[1]);
  return Number.isFinite(total) ? total : null;
}

function summarize(rows) {
  const byActionType = {};
  const byDay = {};

  rows.forEach((row) => {
    byActionType[row.action_type] = (byActionType[row.action_type] || 0) + 1;

    const day = String(row.created_at || '').slice(0, 10);
    if (day) {
      byDay[day] = (byDay[day] || 0) + 1;
    }
  });

  return { byActionType, byDay };
}

function markdownReport(payload) {
  const actionLines = Object.entries(payload.summary.byActionType)
    .sort(([, a], [, b]) => b - a)
    .map(([action, count]) => `- ${action}: ${count}`)
    .join('\n') || '- sem dados';

  const dayLines = Object.entries(payload.summary.byDay)
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([day, count]) => `- ${day}: ${count}`)
    .join('\n') || '- sem dados';

  const lastLine = payload.lastAction
    ? `- Ultima acao: ${payload.lastAction.action_type} (${payload.lastAction.created_at})`
    : '- Ultima acao: nenhuma';

  return `# Export de Audit Log\n\n` +
    `**Gerado em:** ${new Date(payload.generatedAt).toLocaleString('pt-BR')}\n` +
    `**Janela:** ultimos ${payload.window.days} dia(s)\n` +
    `**Limite de linhas:** ${payload.window.limit}\n` +
    `**Retencao recomendada:** ${payload.retention.retentionDays} dia(s)\n\n` +
    `## Resumo\n\n` +
    `- Total exportado: ${payload.totalRows}\n` +
    `${lastLine}\n` +
    `- Registros acima da janela de retencao: ${payload.retention.olderThanRetentionCount ?? 'n/a'}\n\n` +
    `## Por action_type\n\n` +
    `${actionLines}\n\n` +
    `## Por periodo (dia)\n\n` +
    `${dayLines}\n`;
}

function persist(payload) {
  const outputDir = path.join(__dirname, '..', 'reports', 'exports');
  fs.mkdirSync(outputDir, { recursive: true });

  const stamp = toTimestampFileSafe(new Date(payload.generatedAt));
  const jsonPath = path.join(outputDir, `audit-export-${stamp}.json`);
  const mdPath = path.join(outputDir, `audit-export-${stamp}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf-8');
  fs.writeFileSync(mdPath, markdownReport(payload), 'utf-8');

  return { jsonPath, mdPath };
}

async function main() {
  loadLocalEnv();

  const options = parseArgs(process.argv.slice(2));
  const now = new Date();

  const since = new Date(now.getTime() - options.days * 24 * 60 * 60 * 1000).toISOString();
  const retentionThreshold = new Date(now.getTime() - options.retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const rows = await fetchAuditRows(since, options.limit);
  if (!rows) {
    console.error('Nao foi possivel consultar ops_audit_log. Verifique configuracao Supabase.');
    process.exit(1);
  }

  const summary = summarize(rows);
  const olderCount = await countOlderThan(retentionThreshold);

  const payload = {
    generatedAt: now.toISOString(),
    source: 'supabase',
    window: {
      days: options.days,
      limit: options.limit,
      since,
    },
    retention: {
      retentionDays: options.retentionDays,
      retentionThreshold,
      olderThanRetentionCount: olderCount,
    },
    totalRows: rows.length,
    lastAction: rows[0] || null,
    summary,
    rows,
  };

  const output = persist(payload);

  console.log(`Export de auditoria gerado: ${output.jsonPath}`);
  console.log(`Resumo markdown: ${output.mdPath}`);
  console.log(`Total exportado: ${payload.totalRows}`);
}

main().catch((error) => {
  console.error('Falha ao exportar audit log:', error?.message || error);
  process.exit(1);
});
