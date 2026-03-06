#!/usr/bin/env node
/**
 * Tijolo 18: Relatório de Prontidão para Produção
 *
 * Gera um sumário objetivo para as primeiras semanas de tráfego:
 * - Fontes ativas
 * - Jogos com tráfego
 * - Experimentos vivos
 * - Scorecards ainda insuficientes
 * - CTAs com sinais iniciais
 * - Share→reentry inicial
 * - Riscos de leitura prematura
 *
 * Uso: node tools/beta-readiness-report.js
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

function formatDate(dateString) {
  if (!dateString) return 'nunca';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'agora';
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

async function generateReadinessReport() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('⚠️  Supabase não configurado.');
    console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
    process.exit(1);
  }

  console.log('🔍 Coletando dados de prontidão...\n');

  const [
    funnel,
    sources,
    games,
    experiments,
    recentEvents,
  ] = await Promise.all([
    supabaseSelect('beta_funnel_overview', 'select=*&limit=1'),
    supabaseSelect('beta_sources_overview', 'select=*&limit=100'),
    supabaseSelect('beta_game_overview', 'select=*&limit=100'),
    supabaseSelect('experiment_performance', 'select=*&limit=300'),
    supabaseSelect('game_events', 'select=created_at&order=created_at.desc&limit=1'),
  ]);

  const report = [];
  
  report.push('# Relatório de Prontidão para Produção');
  report.push('');
  report.push(`**Gerado em:** ${new Date().toLocaleString('pt-BR')}`);
  report.push('**Objetivo:** Avaliar viabilidade de leitura disciplinada nas primeiras semanas de tráfego');
  report.push('');
  report.push('---');
  report.push('');

  // Data freshness
  const lastEvent = recentEvents && recentEvents[0] ? recentEvents[0].created_at : null;
  const freshness = lastEvent ? formatDate(lastEvent) : 'sem eventos';
  
  report.push('## 📊 Frescor dos Dados');
  report.push('');
  report.push(`- **Último evento registrado:** ${freshness}`);
  
  if (lastEvent) {
    const age = new Date() - new Date(lastEvent);
    const hoursAge = age / (1000 * 60 * 60);
    if (hoursAge > 72) {
      report.push(`- ⚠️ **Alerta:** Sem tráfego há mais de 3 dias (${Math.floor(hoursAge / 24)}d)`);
    } else if (hoursAge > 24) {
      report.push(`- ⚡ **Status:** Tráfego recente (${Math.floor(hoursAge)}h atrás)`);
    } else {
      report.push(`- ✅ **Status:** Dados frescos (última hora)`);
    }
  } else {
    report.push('- ⚠️ **Status:** Nenhum evento registrado');
  }
  
  report.push('');
  report.push('---');
  report.push('');

  // Funnel overview
  const funnelData = funnel && funnel[0] ? funnel[0] : null;
  const totalSessions = funnelData?.total_sessions || 0;
  const completions = funnelData?.completions || 0;
  const shares = funnelData?.shares || 0;

  report.push('## 🎯 Funil Geral');
  report.push('');
  report.push(`- **Sessões totais:** ${totalSessions}`);
  report.push(`- **Conclusões:** ${completions} (${totalSessions > 0 ? Math.round((completions / totalSessions) * 100) : 0}%)`);
  report.push(`- **Shares:** ${shares}`);
  
  if (totalSessions < 100) {
    report.push('');
    report.push('⚠️ **Alerta de prontidão:** Menos de 100 sessões registradas. Volume ainda insuficiente para leitura confiável de experimentos.');
  } else if (totalSessions < 500) {
    report.push('');
    report.push('⚡ **Sinal inicial:** Volume começando a acumular. Próximas semanas serão críticas para primeiros sinais.');
  } else {
    report.push('');
    report.push('✅ **Volume útil:** Dados suficientes para começar leitura disciplinada com cautela.');
  }

  report.push('');
  report.push('---');
  report.push('');

  // Active sources
  const activeSources = (sources || []).filter((s) => s.sessions > 0).length;
  const topSources = (sources || [])
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  report.push('## 🌐 Fontes Ativas');
  report.push('');
  report.push(`- **Total de fontes:** ${activeSources}`);
  
  if (topSources.length > 0) {
    report.push('');
    report.push('**Top 5 fontes:**');
    report.push('');
    topSources.forEach((s, i) => {
      report.push(`${i + 1}. **${s.source}**: ${s.sessions} sessões, ${s.completion_rate}% conclusão`);
    });
  }

  if (activeSources === 1) {
    report.push('');
    report.push('⚠️ **Risco de viés:** Apenas 1 fonte ativa. Resultados podem não generalizar.');
  } else if (activeSources < 3) {
    report.push('');
    report.push('⚡ **Diversificação limitada:** Poucas fontes. Interpretar resultados com cautela geográfica/demográfica.');
  }

  report.push('');
  report.push('---');
  report.push('');

  // Games with traffic
  const gamesWithTraffic = (games || []).filter((g) => g.initiated > 0).length;
  const topGames = (games || [])
    .sort((a, b) => b.initiated - a.initiated)
    .slice(0, 5);

  report.push('## 🎮 Jogos com Tráfego');
  report.push('');
  report.push(`- **Jogos ativos:** ${gamesWithTraffic}`);

  if (topGames.length > 0) {
    report.push('');
    report.push('**Top 5 jogos:**');
    report.push('');
    topGames.forEach((g, i) => {
      report.push(`${i + 1}. **${g.slug}**: ${g.initiated} iniciados, ${g.completed} concluídos (${g.completion_rate}%)`);
    });
  }

  if (gamesWithTraffic === 0) {
    report.push('');
    report.push('⚠️ **Sem tráfego:** Nenhum jogo foi iniciado ainda.');
  } else if (gamesWithTraffic < 3) {
    report.push('');
    report.push('⚡ **Concentração alta:** Poucos jogos recebendo tráfego. Considerar ampliar divulgação.');
  }

  report.push('');
  report.push('---');
  report.push('');

  // Experiments readiness
  const grouped = {};
  for (const row of experiments || []) {
    if (!grouped[row.experiment_key]) {
      grouped[row.experiment_key] = [];
    }
    grouped[row.experiment_key].push(row);
  }

  const experimentKeys = Object.keys(grouped);
  const insufficientExperiments = [];
  const monitoringExperiments = [];

  for (const key of experimentKeys) {
    const variants = grouped[key];
    const minSample = Math.min(...variants.map((v) => v.sessions || 0));
    
    if (minSample < 40) {
      insufficientExperiments.push({ key, minSample });
    } else {
      monitoringExperiments.push({ key, minSample });
    }
  }

  report.push('## 🧪 Estado dos Experimentos');
  report.push('');
  report.push(`- **Experimentos ativos:** ${experimentKeys.length}`);
  report.push(`- **Com amostra mínima (≥40/variante):** ${monitoringExperiments.length}`);
  report.push(`- **Ainda insuficientes:** ${insufficientExperiments.length}`);

  if (insufficientExperiments.length > 0) {
    report.push('');
    report.push('**Experimentos aguardando amostra mínima:**');
    report.push('');
    insufficientExperiments.forEach((exp) => {
      report.push(`- \`${exp.key}\`: ${exp.minSample} sessões/variante (mínimo: 40)`);
    });
  }

  if (monitoringExperiments.length > 0) {
    report.push('');
    report.push('**Experimentos em monitoramento:**');
    report.push('');
    monitoringExperiments.forEach((exp) => {
      report.push(`- \`${exp.key}\`: ${exp.minSample} sessões/variante ✅`);
    });
  }

  if (experimentKeys.length === 0) {
    report.push('');
    report.push('⚠️ **Sem experimentos:** Nenhum experimento ativo com dados.');
  } else if (monitoringExperiments.length === 0) {
    report.push('');
    report.push('⚡ **Acumulando amostra:** Todos os experimentos ainda precisam de mais sessões para leitura confiável.');
  } else {
    report.push('');
    report.push('✅ **Primeiros sinais disponíveis:** Alguns experimentos já atingiram amostra mínima para leitura inicial.');
  }

  report.push('');
  report.push('---');
  report.push('');

  // Risks summary
  report.push('## ⚠️ Riscos de Leitura Prematura');
  report.push('');

  const risks = [];

  if (totalSessions < 100) {
    risks.push('**Volume geral baixo:** Menos de 100 sessões totais dificulta qualquer comparação estatística.');
  }

  if (activeSources === 1) {
    risks.push('**Fonte única:** Resultados podem refletir apenas um canal/demográfico específico.');
  }

  if (insufficientExperiments.length === experimentKeys.length && experimentKeys.length > 0) {
    risks.push('**Todos experimentos insuficientes:** Nenhuma variante atingiu amostra mínima ainda.');
  }

  if (!lastEvent) {
    risks.push('**Sem eventos:** Nenhum dado de tráfego registrado. Verificar instrumentação.');
  } else {
    const age = new Date() - new Date(lastEvent);
    if (age / (1000 * 60 * 60) > 72) {
      risks.push('**Dados antigos:** Último evento há mais de 3 dias. Sistema pode estar parado.');
    }
  }

  if (risks.length === 0) {
    report.push('✅ **Nenhum risco crítico identificado.**');
    report.push('');
    report.push('O sistema está acumulando dados de forma saudável. Manter leitura disciplinada e aguardar amostras maiores antes de decisões de copy/layout.');
  } else {
    report.push('Os seguintes riscos foram identificados:');
    report.push('');
    risks.forEach((risk, i) => {
      report.push(`${i + 1}. ${risk}`);
    });
    report.push('');
    report.push('**Recomendação:** Evitar qualquer conclusão definitiva até mitigar riscos acima.');
  }

  report.push('');
  report.push('---');
  report.push('');

  // Recommendations
  report.push('## 🎯 Recomendações Operacionais');
  report.push('');

  if (totalSessions < 500) {
    report.push('1. **Aguardar acúmulo:** Manter experimentos rodando sem intervenção até atingir pelo menos 500 sessões totais.');
  }

  if (insufficientExperiments.length > 0) {
    report.push('2. **Monitorar scorecards:** Verificar `/estado` semanalmente para acompanhar evolução de amostras.');
  }

  if (activeSources < 3) {
    report.push('3. **Diversificar tráfego:** Considerar adicionar novas fontes de divulgação para reduzir viés.');
  }

  report.push('4. **Leitura disciplinada:** Não tomar decisões de copy/layout baseadas apenas em sinais direcionais (lift < 25%).');
  report.push('5. **Scorecards temporais:** Usar janelas de 7d e 30d em `/estado` para detectar tendências consistentes.');

  report.push('');
  report.push('---');
  report.push('');
  report.push('*Relatório gerado automaticamente pelo script beta:readiness-report (Tijolo 18)*');

  return report.join('\n');
}

generateReadinessReport()
  .then((report) => {
    console.log(report);
  })
  .catch((err) => {
    console.error('Erro ao gerar relatório de prontidão:', err.message);
    process.exit(1);
  });
