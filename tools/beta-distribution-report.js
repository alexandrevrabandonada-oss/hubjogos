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
  const quicksInsuficientes = Object.entries(byQuick).filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento');
  const territoriosInsuficientes = Object.entries(byTerritory).filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento');
  
  // Ordenar quicks por progressPct (menor primeiro)
  quicksInsuficientes.sort((a, b) => (a[1].progressPct || 0) - (b[1].progressPct || 0));
  
  const weeklyPlan = [];
  
  if (quicksInsuficientes.length === 0 && territoriosInsuficientes.length === 0) {
    weeklyPlan.push('✅ **Metas atingidas!** Considerar avanço para Tijolo 29.');
  } else {
    // Determinar quick prioritário
    if (quicksInsuficientes.length > 0) {
      const topQuick = quicksInsuficientes[0];
      weeklyPlan.push(`**🎮 Quick prioritário:** ${topQuick[0]}`);
      weeklyPlan.push(`   - Progresso atual: ${topQuick[1].progressPct}% da meta`);
      weeklyPlan.push(`   - Distribuir nos canais: Instagram, WhatsApp, TikTok`);
      weeklyPlan.push(`   - Focar nos primeiros 2-3 dias da semana`);
    }
    
    // Determinar território prioritário
    if (territoriosInsuficientes.length > 0) {
      const topTerr = territoriosInsuficientes[0];
      weeklyPlan.push(`\n**🗺️ Território prioritário:** ${topTerr[0]}`);
      weeklyPlan.push(`   - Progresso atual: ${topTerr[1].progressPct}% da meta`);
      weeklyPlan.push(`   - Usar pacote: reports/distribution/packages/territorio-${topTerr[0]}.md`);
      weeklyPlan.push(`   - Contextualizar mensagens para o território`);
    }
    
    // Série recomendada
    const seriesInsuficientes = Object.entries(bySeries).filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento');
    if (seriesInsuficientes.length > 0) {
      seriesInsuficientes.sort((a, b) => (a[1].progressPct || 0) - (b[1].progressPct || 0));
      const topSerie = seriesInsuficientes[0];
      weeklyPlan.push(`\n**📚 Série prioritária:** ${topSerie[0]}`);
      weeklyPlan.push(`   - Progresso atual: ${topSerie[1].progressPct}% da meta`);
      weeklyPlan.push(`   - Empurrar quicks desta série primeiro`);
    }
    
    // Pacotes recomendados
    weeklyPlan.push(`\n**📦 Pacotes de distribuição recomendados:**`);
    weeklyPlan.push(`   - reports/distribution/packages/instagram-geral.md`);
    weeklyPlan.push(`   - reports/distribution/packages/whatsapp-geral.md`);
    weeklyPlan.push(`   - reports/distribution/packages/tiktok-geral.md`);
    if (territoriosInsuficientes.length > 0) {
      weeklyPlan.push(`   - reports/distribution/packages/territorio-${territoriosInsuficientes[0][0]}.md`);
    }
  }
  
  return weeklyPlan.join('\n');
})()}

### Recomendações operacionais

${(() => {
  const quicksInsuficientes = Object.entries(byQuick).filter(([, status]) => status.status === 'coleta-insuficiente');
  const seriesInsuficientes = Object.entries(bySeries).filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento');
  const territoriosInsuficientes = Object.entries(byTerritory).filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento');
  
  const recommendations = [];
  
  if (quicksInsuficientes.length > 0) {
    recommendations.push(`**1. Priorizar distribuição para os seguintes quicks:**`);
    quicksInsuficientes.forEach(([slug, status]) => {
      recommendations.push(`   - ${slug} (${status.progressPct}% da meta)`);
    });
  }
  
  if (seriesInsuficientes.length > 0) {
    recommendations.push(`\n**2. Séries que precisam de atenção:**`);
    seriesInsuficientes.forEach(([serie, status]) => {
      recommendations.push(`   - ${serie} (${status.progressPct}% da meta)`);
    });
  }
  
  if (territoriosInsuficientes.length > 0) {
    recommendations.push(`\n**3. Territórios que precisam de atenção:**`);
    territoriosInsuficientes.forEach(([territorio, status]) => {
      recommendations.push(`   - ${territorio} (${status.progressPct}% da meta)`);
    });
  }
  
  if (qrExperiment.status === 'coleta-insuficiente' || qrExperiment.status === 'coleta-em-andamento') {
    recommendations.push(`\n**4. Experimento QR precisa de mais exposições**`);
    recommendations.push(`   - Status: ${renderStatusBadge(qrExperiment.status)}`);
    Object.entries(qrExperiment.progressByVariant || {}).forEach(([variant, progress]) => {
      recommendations.push(`   - ${variant}: ${progress.progressPct}% da meta`);
    });
  }
  
  const readyForPriority = [
    ...Object.entries(bySeries).filter(([, status]) => status.status === 'pronto-para-priorizacao'),
    ...Object.entries(byTerritory).filter(([, status]) => status.status === 'pronto-para-priorizacao'),
  ];
  
  if (readyForPriority.length > 0) {
    recommendations.push(`\n**✅ Pronto para priorização no Tijolo 29:**`);
    readyForPriority.forEach(([key, status]) => {
      recommendations.push(`   - ${key} (meta atingida, ${status.progressPct}%)`);
    });
  }
  
  if (recommendations.length === 0) {
    return '- Nenhuma recomendação urgente. Continuar distribuição equilibrada.';
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
  return {
    generatedAt: data.generatedAt,
    source: data.source,
    window: data.window,
    collectionTargets: quickInsights.collectionTargets,
    collectionStatus: quickInsights.collectionStatus,
    warnings: quickInsights.warnings,
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
