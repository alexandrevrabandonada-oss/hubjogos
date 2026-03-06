#!/usr/bin/env node
/**
 * Script operacional beta:ops (Tijolo 20)
 *
 * Check diario consolidado:
 * - Staleness (arquivo local quando existir)
 * - Severidade operacional consolidada
 * - Idade do ultimo snapshot
 * - Ultimo evento remoto visto
 * - Experimentos ativos sem trafego
 * - Pendencias prioritarias e backlog
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

function toHoursSince(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function formatAge(value) {
  const hours = toHoursSince(value);
  if (hours === null) {
    return 'n/d';
  }
  if (hours < 1) {
    return `${Math.max(1, Math.round(hours * 60))}min atras`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h atras`;
  }
  return `${Math.round(hours / 24)}d atras`;
}

function severityRank(severity) {
  if (severity === 'critical') return 3;
  if (severity === 'warning') return 2;
  return 1;
}

function highestSeverity(levels) {
  return levels.reduce((worst, current) =>
    severityRank(current) > severityRank(worst) ? current : worst,
  'info');
}

function severityLabel(level) {
  if (level === 'critical') return '🔴 CRITICO';
  if (level === 'warning') return '🟡 WARNING';
  return '🟢 INFO';
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

async function testSupabaseConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { configured: false, connected: false, error: 'Not configured', data: null };
  }

  try {
    const response = await fetch(`${url}/rest/v1/beta_funnel_overview?select=*`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      return { configured: true, connected: false, error: `HTTP ${response.status}`, data: null };
    }

    const data = await response.json();
    return { configured: true, connected: true, error: null, data: data[0] || null };
  } catch (err) {
    return { configured: true, connected: false, error: err?.message || 'Unknown error', data: null };
  }
}

function getExperimentsRegistry() {
  const registryPath = path.join(__dirname, '..', 'lib', 'experiments', 'registry.ts');
  if (!fs.existsSync(registryPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(registryPath, 'utf-8');
    const experiments = [];
    const expRegex = /'([^']+)':\s*\{[^}]*key:\s*'([^']+)'[^}]*name:\s*'([^']+)'[^}]*enabled:\s*(true|false)/g;

    let match;
    while ((match = expRegex.exec(content)) !== null) {
      const [, objKey, key, name, enabled] = match;
      if (objKey === key) {
        experiments.push({
          key,
          name,
          enabled: enabled === 'true',
          overridden: false,
        });
      }
    }

    const overrideStr = process.env.EXPERIMENTS_OVERRIDE || process.env.NEXT_PUBLIC_EXPERIMENTS_OVERRIDE;
    if (overrideStr) {
      const overrides = {};
      overrideStr.split(',').forEach((pair) => {
        const [key, value] = pair.split(':').map((s) => s.trim());
        if (key && (value === 'true' || value === 'false')) {
          overrides[key] = value === 'true';
        }
      });

      experiments.forEach((experiment) => {
        if (experiment.key in overrides) {
          experiment.enabled = overrides[experiment.key];
          experiment.overridden = true;
        }
      });
    }

    return experiments;
  } catch {
    return [];
  }
}

async function getAuditLogRecent() {
  return await supabaseSelect('ops_audit_recent', 'select=*');
}

async function getLatestSnapshotAudit() {
  const rows = await supabaseSelect(
    'ops_audit_log',
    'select=action_type,actor_source,actor_label,created_at,metadata&action_type=eq.snapshot_generated&order=created_at.desc&limit=1',
  );
  return rows?.[0] || null;
}

async function getLatestRemoteEvent() {
  const rows = await supabaseSelect('game_events', 'select=created_at,event_name,slug,engine_kind&order=created_at.desc&limit=1');
  return rows?.[0] || null;
}

async function getFeedbackPending() {
  const rows = await supabaseSelect('feedback_records', 'select=triage_status&triage_status=in.(pending,prioritario)');
  if (!rows) {
    return null;
  }

  const pending = rows.filter((row) => row.triage_status === 'pending').length;
  const prioritario = rows.filter((row) => row.triage_status === 'prioritario').length;
  return { pending, prioritario, total: rows.length };
}

async function getExperimentTrafficByKey() {
  const rows = await supabaseSelect('experiment_performance', 'select=experiment_key,sessions');
  if (!rows) {
    return null;
  }

  const traffic = {};
  rows.forEach((row) => {
    const key = row.experiment_key;
    traffic[key] = (traffic[key] || 0) + Number(row.sessions || 0);
  });
  return traffic;
}

function readLatestLocalAlert() {
  try {
    const filePath = path.join(__dirname, '..', 'reports', 'ops-alerts', 'latest.json');
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function readLatestStalenessReport() {
  try {
    const filePath = path.join(__dirname, '..', 'reports', 'ops', 'staleness-check-latest.json');
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function main() {
  console.log('# Beta Ops Check (Tijolo 20)\n');
  console.log(`Gerado em: ${new Date().toLocaleString('pt-BR')}\n`);

  const [
    supabase,
    experiments,
    auditLog,
    feedback,
    latestSnapshotAudit,
    latestRemoteEvent,
    experimentTraffic,
  ] = await Promise.all([
    testSupabaseConnection(),
    Promise.resolve(getExperimentsRegistry()),
    getAuditLogRecent(),
    getFeedbackPending(),
    getLatestSnapshotAudit(),
    getLatestRemoteEvent(),
    getExperimentTrafficByKey(),
  ]);

  const localAlert = readLatestLocalAlert();
  const staleness = readLatestStalenessReport();
  const activeExperiments = experiments.filter((exp) => exp.enabled);
  const activeWithoutTraffic = activeExperiments.filter((exp) => {
    if (!experimentTraffic) {
      return false;
    }
    return Number(experimentTraffic[exp.key] || 0) === 0;
  });

  const snapshotAgeHours = toHoursSince(latestSnapshotAudit?.created_at);
  const remoteEventAgeHours = toHoursSince(latestRemoteEvent?.created_at);

  const signals = [];
  if (supabase.configured && !supabase.connected) signals.push('critical');
  if ((feedback?.prioritario || 0) > 0) signals.push('critical');
  if ((staleness?.summary?.critical || 0) > 0) signals.push('critical');

  if ((staleness?.summary?.warnings || 0) > 0) signals.push('warning');
  if ((feedback?.pending || 0) > 10) signals.push('warning');
  if (snapshotAgeHours !== null && snapshotAgeHours > 24) signals.push('warning');
  if (remoteEventAgeHours !== null && remoteEventAgeHours > 24) signals.push('warning');
  if (activeWithoutTraffic.length > 0) signals.push('warning');

  const overallSeverity = highestSeverity(signals.length ? signals : ['info']);

  const summary = [];
  summary.push(`Status geral: ${severityLabel(overallSeverity)}`);
  if (!supabase.configured) summary.push('❌ Supabase nao configurado');
  else if (!supabase.connected) summary.push('🔴 Supabase offline');
  else summary.push('✅ Supabase conectado');

  summary.push(`📸 Snapshot: ${snapshotAgeHours === null ? 'sem rastro' : formatAge(latestSnapshotAudit.created_at)}`);
  summary.push(`🛰️ Ultimo evento remoto: ${latestRemoteEvent ? formatAge(latestRemoteEvent.created_at) : 'n/d'}`);
  summary.push(`🚨 Prioritarios: ${feedback?.prioritario || 0}`);

  console.log('## Resumo Operacional Curto');
  console.log(summary.join(' | '));
  console.log('');

  console.log('## Contexto Temporal');
  if (staleness) {
    console.log(`Staleness check: ${severityLabel((staleness.summary?.critical || 0) > 0 ? 'critical' : (staleness.summary?.warnings || 0) > 0 ? 'warning' : 'info')}`);
    console.log(`   - Verificado em: ${new Date(staleness.checkedAt).toLocaleString('pt-BR')}`);
    console.log(`   - Ultima sessao: ${staleness.lastSessionAt ? formatAge(staleness.lastSessionAt) : 'nunca'}`);
    console.log(`   - Ultimo evento: ${staleness.lastEventAt ? formatAge(staleness.lastEventAt) : 'nunca'}`);
    console.log(`   - Alertas: criticos=${staleness.summary?.critical || 0}, warnings=${staleness.summary?.warnings || 0}`);
  } else {
    console.log('⚪ Sem reports/ops/staleness-check-latest.json (degrade gracioso).');
    console.log('   Rode npm run beta:staleness-check -- --format=json > reports/ops/staleness-check-latest.json');
  }

  console.log(`\nIdade do ultimo snapshot auditado: ${snapshotAgeHours === null ? 'n/d' : formatAge(latestSnapshotAudit.created_at)}`);
  console.log(`Ultimo evento remoto visto: ${latestRemoteEvent ? `${formatAge(latestRemoteEvent.created_at)} (${latestRemoteEvent.event_name})` : 'n/d'}`);
  console.log('');

  console.log('## Conectividade Supabase');
  if (!supabase.configured) {
    console.log('❌ Nao configurado (NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausente)');
  } else if (!supabase.connected) {
    console.log(`🔴 Configurado mas sem conexao: ${supabase.error}`);
  } else {
    console.log('✅ Conectado com sucesso');
    if (supabase.data) {
      console.log(`   - Total de sessoes: ${supabase.data.total_sessions || 0}`);
      console.log(`   - Conclusoes: ${supabase.data.completions || 0}`);
    }
  }
  console.log('');

  console.log('## Experimentos Ativos');
  if (experiments.length === 0) {
    console.log('⚪ Nenhum experimento no registry');
  } else {
    const inactive = experiments.filter((exp) => !exp.enabled);
    const overridden = experiments.filter((exp) => exp.overridden);

    console.log(`Total: ${experiments.length} | Ativos: ${activeExperiments.length} | Inativos: ${inactive.length}`);
    if (overridden.length > 0) {
      console.log(`⚠️ ${overridden.length} experimento(s) com override via env`);
    }

    if (activeWithoutTraffic.length > 0) {
      console.log(`⚠️ Ativo(s) sem trafego: ${activeWithoutTraffic.map((exp) => exp.key).join(', ')}`);
    } else if (experimentTraffic) {
      console.log('✅ Nenhum experimento ativo sem trafego detectado.');
    } else {
      console.log('⚪ Trafego de experimento indisponivel (sem conexao remota).');
    }
  }
  console.log('');

  console.log('## Pendencias Criticas/Prioritarias');
  if (!feedback) {
    console.log('⚪ Nao disponivel (Supabase nao conectado)');
  } else if (feedback.total === 0) {
    console.log('✅ Nenhum feedback pendente');
  } else {
    if (feedback.prioritario > 0) {
      console.log(`🔴 Prioritarios: ${feedback.prioritario}`);
    }
    if (feedback.pending > 0) {
      console.log(`🟡 Pendentes: ${feedback.pending}`);
    }
    console.log(`Total em aberto: ${feedback.total}`);
  }
  console.log('');

  console.log('## Audit Log Operacional (Ultimas Acoes)');
  if (!auditLog || auditLog.length === 0) {
    console.log('⚪ Sem acoes registradas ou Supabase nao conectado');
  } else {
    const actionCounts = {};
    auditLog.forEach((entry) => {
      actionCounts[entry.action_type] = (actionCounts[entry.action_type] || 0) + 1;
    });

    console.log(`✅ ${auditLog.length} acao(oes) nos ultimos registros`);
    Object.entries(actionCounts).forEach(([action, count]) => {
      console.log(`   - ${action}: ${count}`);
    });

    const lastAction = auditLog[0];
    if (lastAction) {
      const createdAt = new Date(lastAction.created_at).toLocaleString('pt-BR');
      console.log(`   Ultima acao: ${lastAction.action_type} em ${createdAt}`);
      console.log(`   Ator: ${lastAction.actor_label} (${lastAction.actor_source || 'unknown'})`);
    }
  }
  console.log('');

  console.log('## Snapshot e Automacao');
  if (!latestSnapshotAudit) {
    console.log('⚪ Sem snapshot auditado encontrado (rode beta:snapshot ou workflow cron)');
  } else {
    const snapshotAt = new Date(latestSnapshotAudit.created_at).toLocaleString('pt-BR');
    const actorSource = latestSnapshotAudit.actor_source || 'unknown';
    console.log(`✅ Ultimo snapshot auditado em ${snapshotAt}`);
    console.log(`   - Origem: ${actorSource}`);
    console.log(`   - Idade: ${formatAge(latestSnapshotAudit.created_at)}`);
    if (latestSnapshotAudit.metadata?.source) {
      console.log(`   - Fonte de dados: ${latestSnapshotAudit.metadata.source}`);
    }
  }
  console.log('');

  if (localAlert) {
    console.log('## Ultimo Resultado de Alertas (local)');
    console.log(`Nivel: ${(localAlert.overallLevel || 'unknown').toUpperCase()}`);
    console.log(`Prioritario parado: ${localAlert.priorityAlert?.staleCount || 0}`);
    console.log(`Auditoria inativa: ${localAlert.auditAlert?.triggered ? 'sim' : 'nao'}`);
    console.log('');
  }

  const opsToken = process.env.OPS_ADMIN_TOKEN || process.env.NEXT_PUBLIC_OPS_ADMIN_TOKEN;
  console.log('## Operacoes Protegidas');
  if (!opsToken) {
    console.log('⚪ Nao configurado (OPS_ADMIN_TOKEN ausente) - operacao client-side');
  } else {
    console.log('🔐 Configurado - triagem de feedback com auditoria habilitada');
  }
  console.log('');

  console.log('---');
  console.log('Status operacional resumido:');

  const status = [];
  status.push(`Cockpit: ${severityLabel(overallSeverity)}`);
  if (supabase.connected) status.push('✅ Supabase conectado');
  else if (supabase.configured) status.push('🔴 Supabase offline');
  else status.push('❌ Supabase nao configurado');

  if (activeExperiments.length > 0) {
    status.push(`⚗️ ${activeExperiments.length} experimento(s) ativo(s)`);
  }
  if (activeWithoutTraffic.length > 0) {
    status.push(`⚠️ ${activeWithoutTraffic.length} ativo(s) sem trafego`);
  }
  if ((feedback?.total || 0) > 0) {
    status.push(`🚨 ${feedback.total} feedback(s) pendente(s)`);
  }
  if (latestSnapshotAudit) {
    status.push(`📸 snapshot ${formatAge(latestSnapshotAudit.created_at)}`);
  }
  if (latestRemoteEvent) {
    status.push(`🛰️ evento ${formatAge(latestRemoteEvent.created_at)}`);
  }

  console.log(status.join(' | '));
}

main().catch((err) => {
  console.error('Erro ao executar beta:ops:', err?.message || err);
  process.exit(1);
});
