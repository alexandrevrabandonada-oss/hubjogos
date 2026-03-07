#!/usr/bin/env node
/**
 * Relatório operacional de distribuição e coleta (Tijolo 27)
 *
 * Uso:
 *   node tools/beta-distribution-report.js --format=md
 *   node tools/beta-distribution-report.js --format=json
 *   node tools/beta-distribution-report.js --window=7d --format=md
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  return {
    format: argv.find((arg) => arg.startsWith('--format='))?.split('=')[1] || 'md',
    window: argv.find((arg) => arg.startsWith('--window='))?.split('=')[1] || '7d',
  };
}

async function buildDistributionReport(window = '7d') {
  const { execSync } = require('child_process');
  // Gera export com janela específica
  execSync(`node tools/beta-export.js --window=${window}`, { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  
  const exportsDir = path.join(__dirname, '..', 'reports', 'exports');
  const files = fs
    .readdirSync(exportsDir)
    .filter((name) => name.startsWith('beta-export-') && name.endsWith('.json'))
    .sort();
  const latest = files[files.length - 1];
  return JSON.parse(fs.readFileSync(path.join(exportsDir, latest), 'utf-8'));
}

function renderStatusBadge(status) {
  switch (status) {
    case 'coleta-insuficiente':
      return '🔴 Insuficiente';
    case 'coleta-em-andamento':
      return '🟡 Em andamento';
    case 'coleta-minima-atingida':
      return '🟢 Meta atingida';
    case 'pronto-para-priorizacao':
      return '✅ Pronto';
    default:
      return '⚪ Indetect';
  }
}

function renderMarkdown(data) {
  const quickInsights = data.quickInsights || {};
  const effectiveRuns = data.effectiveRuns || {};
  const collectionTargets = quickInsights.collectionTargets || {};
  const collectionStatus = quickInsights.collectionStatus || {};
  const byQuick = collectionStatus.byQuick || {};
  const bySeries = collectionStatus.bySeries || {};
  const byTerritory = collectionStatus.byTerritory || {};
  const qrExperiment = collectionStatus.qrExperiment || {};

  const warnings = quickInsights.warnings || [];
  const window = data.window || '7d';
  const windowLabel = window === '7d' ? 'Últimos 7 dias' : window === '30d' ? 'Últimos 30 dias' : 'Todo histórico';

  return `# Relatório de Distribuição - Linha Quick

**Gerado em:** ${new Date(data.generatedAt).toLocaleString('pt-BR')}  
**Fonte:** ${data.source}  
**Janela:** ${windowLabel}

---

## 📊 Metas de Coleta (${windowLabel})

### Por quick game
- Sessões mínimas: **${collectionTargets.quick?.sessions || 'n/a'}**
- Starts mínimos: **${collectionTargets.quick?.starts || 'n/a'}**
- Completions mínimas: **${collectionTargets.quick?.completions || 'n/a'}**
- Shares mínimas: **${collectionTargets.quick?.shares || 'n/a'}**
- Replays mínimos: **${collectionTargets.quick?.replays || 'n/a'}**

### Por série
- Sessões mínimas: **${collectionTargets.series?.sessions || 'n/a'}**
- Starts mínimos: **${collectionTargets.series?.starts || 'n/a'}**
- Completions mínimas: **${collectionTargets.series?.completions || 'n/a'}**
- Shares mínimas: **${collectionTargets.series?.shares || 'n/a'}**

### Por território
- Sessões mínimas: **${collectionTargets.territory?.sessions || 'n/a'}**
- Starts mínimos: **${collectionTargets.territory?.starts || 'n/a'}**
- Completions mínimas: **${collectionTargets.territory?.completions || 'n/a'}**
- Shares mínimas: **${collectionTargets.territory?.shares || 'n/a'}**

### Por variante QR
- Sessões mínimas: **${collectionTargets.qrVariant?.sessions || 'n/a'}**
- QR views mínimas: **${collectionTargets.qrVariant?.qrViews || 'n/a'}**
- QR clicks mínimos: **${collectionTargets.qrVariant?.qrClicks || 'n/a'}**

---

## 🎮 Status de Coleta por Quick Game

${Object.entries(byQuick)
  .map(([slug, status]) => {
    const progress = status.progress || {};
    const targetQuick = collectionTargets.quick || {};
    return `### ${slug}
**Status:** ${renderStatusBadge(status.status)} (${status.progressPct}% da meta)

**Progresso atual:**
- Sessões: ${progress.sessions}/${targetQuick.sessions} (${targetQuick.sessions > 0 ? Math.round((progress.sessions / targetQuick.sessions) * 100) : 0}%)
- Starts: ${progress.starts}/${targetQuick.starts} (${targetQuick.starts > 0 ? Math.round((progress.starts / targetQuick.starts) * 100) : 0}%)
- Completions: ${progress.completions}/${targetQuick.completions} (${targetQuick.completions > 0 ? Math.round((progress.completions / targetQuick.completions) * 100) : 0}%)
- Shares: ${progress.shares}/${targetQuick.shares} (${targetQuick.shares > 0 ? Math.round((progress.shares / targetQuick.shares) * 100) : 0}%)
- Replays: ${progress.replays}/${targetQuick.replays || 'n/a'} (${(targetQuick.replays || 0) > 0 ? Math.round((progress.replays / (targetQuick.replays || 1)) * 100) : 0}%)
`;
  })
  .join('\n') || '_Sem dados de quicks_'}

---

## 📚 Status de Coleta por Série

${Object.entries(bySeries)
  .map(([serie, status]) => {
    const progress = status.progress || {};
    const targetSeries = collectionTargets.series || {};
    const gamesInSeries = status.gamesInSeries || [];
    return `### ${serie}
**Status:** ${renderStatusBadge(status.status)} (${status.progressPct}% da meta)

**Progresso atual:**
- Sessões: ${progress.sessions}/${targetSeries.sessions} (${targetSeries.sessions > 0 ? Math.round((progress.sessions / targetSeries.sessions) * 100) : 0}%)
- Starts: ${progress.starts}/${targetSeries.starts} (${targetSeries.starts > 0 ? Math.round((progress.starts / targetSeries.starts) * 100) : 0}%)
- Completions: ${progress.completions}/${targetSeries.completions} (${targetSeries.completions > 0 ? Math.round((progress.completions / targetSeries.completions) * 100) : 0}%)
- Shares: ${progress.shares}/${targetSeries.shares} (${targetSeries.shares > 0 ? Math.round((progress.shares / targetSeries.shares) * 100) : 0}%)

**Jogos nesta série:** ${gamesInSeries.join(', ') || 'nenhum'}
`;
  })
  .join('\n') || '_Sem dados de séries_'}

---

## 🗺️ Status de Coleta por Território

${Object.entries(byTerritory)
  .map(([territorio, status]) => {
    const progress = status.progress || {};
    const targetTerritory = collectionTargets.territory || {};
    const gamesInTerritory = status.gamesInTerritory || [];
    return `### ${territorio}
**Status:** ${renderStatusBadge(status.status)} (${status.progressPct}% da meta)

**Progresso atual:**
- Sessões: ${progress.sessions}/${targetTerritory.sessions} (${targetTerritory.sessions > 0 ? Math.round((progress.sessions / targetTerritory.sessions) * 100) : 0}%)
- Starts: ${progress.starts}/${targetTerritory.starts} (${targetTerritory.starts > 0 ? Math.round((progress.starts / targetTerritory.starts) * 100) : 0}%)
- Completions: ${progress.completions}/${targetTerritory.completions} (${targetTerritory.completions > 0 ? Math.round((progress.completions / targetTerritory.completions) * 100) : 0}%)
- Shares: ${progress.shares}/${targetTerritory.shares} (${targetTerritory.shares > 0 ? Math.round((progress.shares / targetTerritory.shares) * 100) : 0}%)

**Jogos neste território:** ${gamesInTerritory.join(', ') || 'nenhum'}
${status.topGameSlug ? `**Jogo mais forte:** ${status.topGameSlug} (${status.topGameSessions} sessões)` : ''}
`;
  })
  .join('\n') || '_Sem dados de territórios_'}

---

## 🔬 Status experimento QR A/B

**Status geral:** ${renderStatusBadge(qrExperiment.status)}

${Object.entries(qrExperiment.progressByVariant || {})
  .map(([variant, progress]) => {
    const targetQR = collectionTargets.qrVariant || {};
    return `### ${variant}
- Sessões: ${progress.sessions}/${targetQR.sessions} (${targetQR.sessions > 0 ? Math.round((progress.sessions / targetQR.sessions) * 100) : 0}%)
- QR views: ${progress.qrViews}/${targetQR.qrViews} (${targetQR.qrViews > 0 ? Math.round((progress.qrViews / targetQR.qrViews) * 100) : 0}%)
- QR clicks: ${progress.qrClicks}/${targetQR.qrClicks} (${targetQR.qrClicks > 0 ? Math.round((progress.qrClicks / targetQR.qrClicks) * 100) : 0}%)
- Progresso geral: ${progress.progressPct}%
`;
  })
  .join('\n') || '_Sem dados de variantes QR_'}

---

## ⚠️ Alertas e Recomendações

### Alertas de amostra
${warnings.map((warning) => `- ${warning}`).join('\n') || '- Sem alertas'}

### O que distribuir esta semana

${(() => {
  const scorecards = effectiveRuns.scorecards || {};
  const topRuns = (effectiveRuns.topEffectiveRunsByGame || []).slice(0, 1);
  const topReplays = (effectiveRuns.topEffectiveReplayByGame || []).slice(0, 1);
  const topBridge = (effectiveRuns.crossGameBridges || []).slice(0, 1);
  const channels = (effectiveRuns.byChannel || []).slice(0, 1);
  const territories = (effectiveRuns.byTerritory || []).slice(0, 1);

  const previewStatus = scorecards.previewToPlay?.status || 'insufficient_data';
  const replayStatus = scorecards.replayEffectiveness?.status || 'insufficient_data';
  const crossStatus = scorecards.crossGameEffectiveness?.status || 'insufficient_data';
  const insufficientSample = [previewStatus, replayStatus, crossStatus].every((status) => status === 'insufficient_data');

  const weeklyPlan = [];

  if (insufficientSample) {
    weeklyPlan.push('**Sem base para pivot de formato.**');
    weeklyPlan.push('- Manter plano atual de coleta por mais 7 dias (sem abrir novo jogo/formato).');
    weeklyPlan.push('- Objetivo da semana: aumentar `effective_run_start` e `effective_replay` sem mudar narrativa central.');
    weeklyPlan.push('- Regra operacional: nao interpretar vencedor quick vs arcade enquanto scorecards estiverem em `insufficient_data`.');
  }

  if (topRuns.length > 0) {
    const row = topRuns[0];
    weeklyPlan.push(`- **Jogo 1o push:** ${row.slug} (${row.effectiveRuns}/${row.cardClicks}, ${row.effectiveRunRate}%).`);
  } else {
    weeklyPlan.push('- **Jogo 1o push:** usar quick com menor progresso de coleta para fechar lacuna.');
  }

  if (topReplays.length > 0) {
    const row = topReplays[0];
    weeklyPlan.push(`- **Jogo 2o clique:** ${row.slug} (${row.effectiveReplay}/${row.replayClicks}, ${row.effectiveReplayRate}%).`);
  } else {
    weeklyPlan.push('- **Jogo 2o clique:** reforcar o mesmo jogo do 1o push ate gerar replay efetivo mensuravel.');
  }

  if (topBridge.length > 0) {
    const bridge = topBridge[0];
    weeklyPlan.push(`- **Direcao promissora:** ${bridge.from} -> ${bridge.to} (${bridge.effectiveStarts}/${bridge.clicks}, ${bridge.effectiveRate}%).`);
  } else {
    weeklyPlan.push('- **Direcao promissora:** sem ponte valida; manter sequencia quick -> arcade padrao e observar proxima janela.');
  }

  if (channels.length > 0) {
    const channel = channels[0];
    weeklyPlan.push(`- **Canal prioritario:** ${channel.channel} (${channel.effectiveRuns}/${channel.cardClicks}, ${channel.effectiveRunRate}%).`);
  } else {
    weeklyPlan.push('- **Canal prioritario:** sem sinal de canal; distribuir equilibrado entre Instagram, WhatsApp e TikTok.');
  }

  if (territories.length > 0) {
    const territory = territories[0];
    weeklyPlan.push(`- **Territorio prioritario:** ${territory.territory} (${territory.effectiveRuns}/${territory.cardClicks}, ${territory.effectiveRunRate}%).`);
  } else {
    weeklyPlan.push('- **Territorio prioritario:** sem sinal de territorio; manter cobertura multi-territorio.');
  }

  weeklyPlan.push('\n**Pacotes de distribuicao recomendados:**');
  weeklyPlan.push('- reports/distribution/packages/instagram-geral.md');
  weeklyPlan.push('- reports/distribution/packages/whatsapp-geral.md');
  weeklyPlan.push('- reports/distribution/packages/tiktok-geral.md');
  if (territories.length > 0) {
    weeklyPlan.push(`- reports/distribution/packages/territorio-${territories[0].territory}.md`);
  }

  return weeklyPlan.join('\n');
})()}

## ⚡ Distribuição guiada por run real

${(() => {
  const lines = [];
  const scorecards = effectiveRuns.scorecards || {};
  const topRuns = (effectiveRuns.topEffectiveRunsByGame || []).slice(0, 5);
  const bridges = (effectiveRuns.crossGameBridges || []).slice(0, 5);

  if (Object.keys(scorecards).length === 0) {
    return '- Sem dados de run efetiva suficientes para orientar distribuição.';
  }

  lines.push(`- Preview -> Play efetivo: ${scorecards.previewToPlay?.conversionRate || 0}% (${scorecards.previewToPlay?.status || 'insufficient_data'})`);
  lines.push(`- Replay efetivo: ${scorecards.replayEffectiveness?.conversionRate || 0}% (${scorecards.replayEffectiveness?.status || 'insufficient_data'})`);
  lines.push(`- Cross-game efetivo: ${scorecards.crossGameEffectiveness?.conversionRate || 0}% (${scorecards.crossGameEffectiveness?.status || 'insufficient_data'})`);

  if (topRuns.length > 0) {
    lines.push('\n**Jogos que mais viram run real:**');
    topRuns.forEach((row) => {
      lines.push(`- ${row.slug}: ${row.effectiveRuns}/${row.cardClicks} (${row.effectiveRunRate}%)`);
    });
  }

  if (bridges.length > 0) {
    lines.push('\n**Pontes de cross-game efetivo:**');
    bridges.forEach((row) => {
      lines.push(`- ${row.from} -> ${row.to}: ${row.effectiveStarts}/${row.clicks} (${row.effectiveRate}%)`);
    });
  }

  lines.push(`\n- Direção dominante: ${effectiveRuns.directionWinner || 'balanced'}`);
  if ((effectiveRuns.warnings || []).length > 0) {
    lines.push(`- Aviso: ${(effectiveRuns.warnings || []).join(' | ')}`);
  }

  return lines.join('\n');
})()}

### Recomendacoes operacionais

${(() => {
  const scorecards = effectiveRuns.scorecards || {};
  const channels = (effectiveRuns.byChannel || []).slice(0, 3);
  const territories = (effectiveRuns.byTerritory || []).slice(0, 3);
  const topRuns = (effectiveRuns.topEffectiveRunsByGame || []).slice(0, 3);
  const recommendations = [];

  const previewStatus = scorecards.previewToPlay?.status || 'insufficient_data';
  const replayStatus = scorecards.replayEffectiveness?.status || 'insufficient_data';
  const crossStatus = scorecards.crossGameEffectiveness?.status || 'insufficient_data';

  recommendations.push('1. **Meta da semana:** priorizar aumento de run real (`effective_run_start`) e replay efetivo (`effective_replay`).');

  if (topRuns.length > 0) {
    recommendations.push(`2. **Distribuicao por jogo:** concentrar 60% do volume em ${topRuns[0].slug} e 40% no segundo melhor sinal.`);
  } else {
    recommendations.push('2. **Distribuicao por jogo:** usar regra de coleta (quicks com menor progresso) ate surgir sinal efetivo.');
  }

  if (channels.length > 0) {
    recommendations.push(`3. **Canal com maior sinal:** ${channels[0].channel}. Replicar copy e criativo nos proximos 7 dias.`);
  } else {
    recommendations.push('3. **Canal com maior sinal:** sem evidencias; manter distribuicao equilibrada entre canais principais.');
  }

  if (territories.length > 0) {
    recommendations.push(`4. **Territorio a reforcar:** ${territories[0].territory}. Direcionar pacotes territoriais primeiro para este bloco.`);
  } else {
    recommendations.push('4. **Territorio a reforcar:** sem destaque; manter cobertura territorial balanceada.');
  }

  if (previewStatus === 'insufficient_data' && replayStatus === 'insufficient_data' && crossStatus === 'insufficient_data') {
    recommendations.push('5. **Nao interpretar vencedor de formato ainda.** Janela atual sem massa critica para pivot quick vs arcade.');
  } else {
    recommendations.push(`5. **Leitura de direcao:** ${effectiveRuns.directionWinner || 'balanced'} (usar apenas como sinal direcional).`);
  }

  if (qrExperiment.status === 'coleta-insuficiente' || qrExperiment.status === 'coleta-em-andamento') {
    recommendations.push('6. **QR A/B:** manter exposicao balanceada por variante e adiar conclusao ate bater meta minima.');
  }

  const readyForPriority = [
    ...Object.entries(bySeries).filter(([, status]) => status.status === 'pronto-para-priorizacao'),
    ...Object.entries(byTerritory).filter(([, status]) => status.status === 'pronto-para-priorizacao'),
  ];
  if (readyForPriority.length > 0) {
    recommendations.push('7. **Itens prontos para priorizacao (sem mudar escopo de produto):**');
    readyForPriority.forEach(([key, status]) => {
      recommendations.push(`- ${key} (${status.progressPct}%)`);
    });
  }

  return recommendations.join('\n');
})()}

---

## 📋 Próximos Passos

${(() => {
  const allQuicksReady = Object.values(byQuick).every((status) => status.status === 'coleta-minima-atingida' || status.status === 'pronto-para-priorizacao');
  const allSeriesReady = Object.values(bySeries).every((status) => status.status === 'pronto-para-priorizacao');
  const qrReady = qrExperiment.status === 'coleta-minima-atingida' || qrExperiment.status === 'pronto-para-priorizacao';
  
  if (allQuicksReady && allSeriesReady && qrReady) {
    return '✅ **Todos os critérios atingidos!** Preparar Tijolo 28 (decisão de formato médio e priorização de série).';
  }
  
  const steps = [];
  if (!allQuicksReady) {
    steps.push('1. Distribuir tráfego para quicks insuficientes');
  }
  if (!allSeriesReady) {
    steps.push('2. Focar distribuição na série líder (serie-solucoes-coletivas)');
  }
  if (!qrReady) {
    steps.push('3. Garantir exposição balanceada do experimento QR');
  }
  steps.push('4. Repetir este relatório após 7 dias para verificar progresso');
  
  return steps.join('\n');
})()}

---

_Relatório gerado em: ${new Date().toISOString()}_
`;
}

function renderJSON(data) {
  const quickInsights = data.quickInsights || {};
  const effectiveRuns = data.effectiveRuns || {};
  return {
    generatedAt: data.generatedAt,
    source: data.source,
    window: data.window,
    collectionTargets: quickInsights.collectionTargets,
    collectionStatus: quickInsights.collectionStatus,
    warnings: quickInsights.warnings,
    effectiveRuns: {
      scorecards: effectiveRuns.scorecards || {},
      direction: effectiveRuns.direction || {},
      directionWinner: effectiveRuns.directionWinner || 'balanced',
      topEffectiveRunsByGame: (effectiveRuns.topEffectiveRunsByGame || []).slice(0, 5),
      topEffectiveReplayByGame: (effectiveRuns.topEffectiveReplayByGame || []).slice(0, 5),
      topBridges: (effectiveRuns.crossGameBridges || []).slice(0, 5),
      byChannel: (effectiveRuns.byChannel || []).slice(0, 5),
      byTerritory: (effectiveRuns.byTerritory || []).slice(0, 5),
      warnings: effectiveRuns.warnings || [],
    },
    readySeries: Object.entries(quickInsights.collectionStatus?.bySeries || {})
      .filter(([, status]) => status.status === 'pronto-para-priorizacao')
      .map(([key]) => key),
    readyTerritories: Object.entries(quickInsights.collectionStatus?.byTerritory || {})
      .filter(([, status]) => status.status === 'pronto-para-priorizacao')
      .map(([key]) => key),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const data = await buildDistributionReport(args.window);

  let output;
  if (args.format === 'json') {
    output = JSON.stringify(renderJSON(data), null, 2);
  } else {
    output = renderMarkdown(data);
  }

  const reportsDir = path.join(__dirname, '..', 'reports', 'distribution');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const ext = args.format === 'json' ? 'json' : 'md';
  const filename = `beta-distribution-${timestamp}.${ext}`;
  const filepath = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, output, 'utf-8');
  console.log(`✅ Relatório de distribuição salvo em: ${filepath}`);
  console.log(output);
}

main().catch((err) => {
  console.error('Erro ao gerar relatório de distribuição:', err);
  process.exit(1);
});
