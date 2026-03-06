#!/usr/bin/env node
/**
 * Alertas operacionais leves (Tijolo 15)
 *
 * Checa:
 * - Feedback prioritario sem acao recente
 * - Ausencia de auditoria recente em ops_audit_log
 *
 * Saidas:
 * - reports/ops-alerts/ops-alerts-<timestamp>.json
 * - reports/ops-alerts/ops-alerts-<timestamp>.md
 * - reports/ops-alerts/latest.json
 * - reports/ops-alerts/latest.md
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
    priorityHours: Number(getArgValue('priority-hours') || process.env.OPS_ALERT_PRIORITY_HOURS || 24),
    auditHours: Number(getArgValue('audit-hours') || process.env.OPS_ALERT_AUDIT_MAX_AGE_HOURS || 48),
    strict: argv.includes('--strict') || process.env.OPS_ALERT_STRICT === 'true',
  };
}

async function supabaseSelect(tableOrView, query) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    const response = await fetch(`${url}/rest/v1/${tableOrView}?${query}`, {
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

function hoursSince(dateValue) {
  if (!dateValue) {
    return Infinity;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return Infinity;
  }

  return (Date.now() - parsed.getTime()) / (1000 * 60 * 60);
}

function toTimestampFileSafe(date) {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function formatMarkdown(result) {
  const priorityStatus = result.priorityAlert.triggered ? 'WARNING' : 'OK';
  const auditStatus = result.auditAlert.triggered ? 'WARNING' : 'OK';

  return `# Alertas Operacionais\n\n` +
    `**Gerado em:** ${new Date(result.generatedAt).toLocaleString('pt-BR')}\n` +
    `**Fonte:** ${result.source}\n\n` +
    `## Resumo\n\n` +
    `- Prioritario parado: **${priorityStatus}**\n` +
    `- Auditoria inativa: **${auditStatus}**\n` +
    `- Nivel geral: **${result.overallLevel.toUpperCase()}**\n\n` +
    `## Prioritario parado\n\n` +
    `- Janela configurada: ${result.priorityAlert.thresholdHours}h\n` +
    `- Total prioritario: ${result.priorityAlert.totalPrioritario}\n` +
    `- Total estagnado: ${result.priorityAlert.staleCount}\n` +
    `- IDs estagnados: ${result.priorityAlert.staleIds.length > 0 ? result.priorityAlert.staleIds.join(', ') : 'nenhum'}\n\n` +
    `## Ausencia de auditoria\n\n` +
    `- Janela configurada: ${result.auditAlert.thresholdHours}h\n` +
    `- Ultima acao: ${result.auditAlert.lastActionAt || 'nenhuma'}\n` +
    `- Ultima acao tipo: ${result.auditAlert.lastActionType || 'n/a'}\n` +
    `- Idade da ultima acao: ${result.auditAlert.lastActionAgeHours === null ? 'n/a' : `${result.auditAlert.lastActionAgeHours}h`}\n\n` +
    `## Politica de falha\n\n` +
    `- Modo estrito: ${result.strictMode ? 'ativo' : 'inativo'}\n` +
    `- Em modo inativo, o job segue com warning para manter operacao transparente.\n`;
}

async function runChecks(options) {
  const prioritarioRows =
    (await supabaseSelect(
      'feedback_action_items',
      'select=feedback_id,triage_status,triaged_at,created_at,last_audit&triage_status=eq.prioritario',
    )) || [];

  const stalePrioritario = prioritarioRows.filter((row) => {
    const reference = row.last_audit || row.triaged_at || row.created_at;
    return hoursSince(reference) > options.priorityHours;
  });

  const latestAuditRows =
    (await supabaseSelect('ops_audit_log', 'select=action_type,created_at&order=created_at.desc&limit=1')) || [];

  const lastAudit = latestAuditRows[0] || null;
  const lastAuditAge = lastAudit ? hoursSince(lastAudit.created_at) : null;

  const result = {
    generatedAt: new Date().toISOString(),
    source: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'supabase' : 'local',
    strictMode: options.strict,
    priorityAlert: {
      triggered: stalePrioritario.length > 0,
      thresholdHours: options.priorityHours,
      totalPrioritario: prioritarioRows.length,
      staleCount: stalePrioritario.length,
      staleIds: stalePrioritario.map((item) => item.feedback_id),
    },
    auditAlert: {
      triggered: lastAuditAge === null ? true : lastAuditAge > options.auditHours,
      thresholdHours: options.auditHours,
      lastActionAt: lastAudit ? lastAudit.created_at : null,
      lastActionType: lastAudit ? lastAudit.action_type : null,
      lastActionAgeHours: lastAuditAge === null ? null : Math.round(lastAuditAge * 10) / 10,
    },
  };

  result.overallLevel = result.priorityAlert.triggered || result.auditAlert.triggered ? 'warning' : 'ok';

  return result;
}

function persist(result) {
  const outputDir = path.join(__dirname, '..', 'reports', 'ops-alerts');
  fs.mkdirSync(outputDir, { recursive: true });

  const stamp = toTimestampFileSafe(new Date(result.generatedAt));
  const jsonPath = path.join(outputDir, `ops-alerts-${stamp}.json`);
  const mdPath = path.join(outputDir, `ops-alerts-${stamp}.md`);
  const latestJsonPath = path.join(outputDir, 'latest.json');
  const latestMdPath = path.join(outputDir, 'latest.md');

  const markdown = formatMarkdown(result);

  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  fs.writeFileSync(latestJsonPath, JSON.stringify(result, null, 2), 'utf-8');
  fs.writeFileSync(latestMdPath, markdown, 'utf-8');

  return { jsonPath, mdPath, latestJsonPath, latestMdPath };
}

async function main() {
  loadLocalEnv();

  const options = parseArgs(process.argv.slice(2));
  const result = await runChecks(options);
  const output = persist(result);

  console.log(`Prioritario parado: ${result.priorityAlert.triggered ? 'WARNING' : 'OK'} (estagnados: ${result.priorityAlert.staleCount})`);
  console.log(`Auditoria inativa: ${result.auditAlert.triggered ? 'WARNING' : 'OK'} (ultima idade: ${result.auditAlert.lastActionAgeHours ?? 'n/a'}h)`);
  console.log(`Nivel geral: ${result.overallLevel.toUpperCase()}`);
  console.log(`Arquivo JSON: ${output.jsonPath}`);
  console.log(`Arquivo MD: ${output.mdPath}`);

  if (options.strict && result.overallLevel === 'warning') {
    console.error('Modo estrito ativo: alerta operacional disparado.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Falha ao executar alertas operacionais:', error?.message || error);
  process.exit(1);
});
