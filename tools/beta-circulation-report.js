#!/usr/bin/env node
/**
 * Relatorio operacional de circulacao/conversao (Tijolo 17)
 *
 * Uso:
 *   node tools/beta-circulation-report.js --format=md
 *   node tools/beta-circulation-report.js --format=json
 */

const fs = require('fs');
const path = require('path');
const { buildExport } = (() => {
  const betaExportPath = path.join(__dirname, 'beta-export.js');
  const source = fs.readFileSync(betaExportPath, 'utf-8');
  if (!/async function buildExport\s*\(/.test(source)) {
    throw new Error('beta-export.js sem buildExport disponível para relatório');
  }
  return {
    // Reuso simples executando script de export por child process
    async buildExport(window = 'all') {
      const { execSync } = require('child_process');
      execSync(`node tools/beta-export.js --window=${window}`, { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
      const exportsDir = path.join(__dirname, '..', 'reports', 'exports');
      const files = fs
        .readdirSync(exportsDir)
        .filter((name) => name.startsWith('beta-export-') && name.endsWith('.json'))
        .sort();
      const latest = files[files.length - 1];
      return JSON.parse(fs.readFileSync(path.join(exportsDir, latest), 'utf-8'));
    },
  };
})();

function parseArgs(argv) {
  return {
    format: argv.find((arg) => arg.startsWith('--format='))?.split('=')[1] || 'md',
    window: argv.find((arg) => arg.startsWith('--window='))?.split('=')[1] || 'all',
  };
}

function toRows(record, limit = 5) {
  return Object.entries(record || {})
    .sort(([, a], [, b]) => (b.exits || 0) - (a.exits || 0))
    .slice(0, limit)
    .map(([key, value]) => ({ key, ...value }));
}

function renderMarkdown(data) {
  const circulation = data.circulation || {};
  const scorecards = data.scorecards || [];
  const quickInsights = data.quickInsights || {};
  const qrExperimentSummary = data.qrExperimentSummary || {};

  return `# Circulation Report (Tijolo 17)

**Gerado em:** ${new Date(data.generatedAt).toLocaleString('pt-BR')}  
**Fonte:** ${data.source}

## Top CTAs
${(circulation.topCtas || [])
  .map((row, index) => `${index + 1}. ${row.ctaId} - ${row.clicks} clicks${row.trackingId ? ` (${row.trackingId})` : ''}`)
  .join('\n') || '_Sem dados_'}

## Top Origens por saida
${toRows(circulation.exitsBySource, 5)
  .map((row, index) => `${index + 1}. ${row.key} - ${row.exits} saídas (${row.exitRate}%)`)
  .join('\n') || '_Sem dados_'}

## Top Engines por saida
${toRows(circulation.exitsByEngine, 5)
  .map((row, index) => `${index + 1}. ${row.key} - ${row.exits} saídas (${row.exitRate}%)`)
  .join('\n') || '_Sem dados_'}

## Share -> Reentry
- Share views: ${circulation.shareReentry?.sharePageViews || 0}
- Next game clicks: ${circulation.shareReentry?.nextGameClicks || 0}
- Hub return clicks: ${circulation.shareReentry?.hubReturnClicks || 0}
- Reentry actions: ${circulation.shareReentry?.reentryActions || 0}
- Reentry rate: ${circulation.shareReentry?.reentryRate || 0}%

## Linha Quick (Tijolo 26)
${(quickInsights.quickComparison || [])
  .map(
    (row, index) =>
      `${index + 1}. ${row.title} - views ${row.sessions}, starts ${row.starts}, conclusão ${row.completionRate}%, replay ${row.replayRate}%, share ${row.shareRate}%, CTA pós-jogo ${row.postGameCtaClicks}, card final ${row.finalCardInteractions}, share→play ${row.reentryRate}%, QR CTR ${row.qrCtr}%, TFI ${row.firstInteractionAvgMs}ms, grude ${row.stickyScore}`,
  )
  .join('\n') || '_Sem dados quick suficientes_'}

### Ranking de grude (quick)
${(quickInsights.quickRanking || [])
  .map((row, index) => `${index + 1}. ${row.title} (${row.stickyScore})`)
  .join('\n') || '_Sem ranking_'}

### Ranking por série (quick)
${(quickInsights.rankedSeries || [])
  .map((row, index) => `${index + 1}. ${row.key} (${row.stickyScore}) - sessões ${row.sessions}, conv ${row.completionRate}%, share ${row.shareRate}%`)
  .join('\n') || '_Sem dados_' }

### Ranking por território (quick)
${(quickInsights.rankedTerritory || [])
  .map((row, index) => `${index + 1}. ${row.key} (${row.stickyScore}) - sessões ${row.sessions}, share ${row.shareRate}%, replay ${row.replayRate}%, jogo forte ${row.topGameTitle || row.topGameSlug}`)
  .join('\n') || '_Sem dados_' }

### Eixo político líder (quick)
${(quickInsights.rankedPoliticalAxis || [])
  .map((row, index) => `${index + 1}. ${row.key} (${row.stickyScore}) - sessões ${row.sessions}, conv ${row.completionRate}%, share ${row.shareRate}%`)
  .join('\n') || '_Sem dados_' }

### QR Experiment Summary
${Object.entries(quickInsights.qrReadout || qrExperimentSummary)
  .map(
    ([variant, row], index) =>
      `${index + 1}. ${variant} - sessões ${row.sessions}, conclusão ${row.completionRate}%, QR views ${row.qrViews}, QR clicks ${row.qrClicks}, QR CTR ${row.qrCtr}%, status ${row.status || 'monitorando'}, delta ${row.deltaVsBaselinePct ?? 0}pp`,
  )
  .join('\n') || '_Sem dados do experimento QR_'}

### Série / Território (quick)
- Série: ${Object.entries(quickInsights.bySeries || {})
  .map(([series, row]) => `${series}: ${row.sessions} sessões, ${row.completions} conclusões, ${row.shares} shares`)
  .join(' | ') || 'sem dados'}
- Território: ${Object.entries(quickInsights.byTerritory || {})
  .map(([territory, row]) => `${territory}: ${row.sessions} sessões, ${row.completions} conclusões, ${row.shares} shares`)
  .join(' | ') || 'sem dados'}
- Eixo político: ${Object.entries(quickInsights.byPoliticalAxis || {})
  .map(([axis, row]) => `${axis}: ${row.sessions} sessões, ${row.completions} conclusões, ${row.shares} shares`)
  .join(' | ') || 'sem dados'}
- Comum vs mercado: ${Object.entries(quickInsights.byCommonVsMarket || {})
  .map(([bucket, row]) => `${bucket}: ${row.sessions} sessões, ${row.completions} conclusões, ${row.shares} shares`)
  .join(' | ') || 'sem dados'}
- Mais grudento: ${quickInsights.topStickyGame?.title || 'n/a'}
- Alertas de amostra: ${(quickInsights.warnings || []).join(' | ') || 'sem alertas'}

## Scorecards com sinal inicial
${scorecards
  .filter((card) => ['directional_signal', 'candidate_winner'].includes(card.status))
  .map((card) => `- ${card.name}: ${card.status} (lift ${card.liftVsSecondPct}%)`)
  .join('\n') || '_Sem sinais iniciais ainda_'}

## Baixo desempenho observado
${Object.entries(circulation.ctrByPlacement || {})
  .filter(([, row]) => row.outcomeViews >= 10 && row.ctr < 10)
  .map(([placement, row]) => `- ${placement}: ${row.clicks}/${row.outcomeViews} (${row.ctr}%)`)
  .join('\n') || '_Sem alertas de baixo desempenho com amostra mínima_'}

## Alertas de amostra
${(data.readingCriteria?.warnings || []).map((warning) => `- ${warning}`).join('\n') || '- Sem alertas'}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const data = await buildExport(args.window);

  const outputDir = path.join(__dirname, '..', 'reports', 'circulation');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  if (args.format === 'json') {
    const outputPath = path.join(outputDir, `beta-circulation-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(JSON.stringify({ source: data.source, outputPath }, null, 2));
    return;
  }

  const markdown = renderMarkdown(data);
  const outputPath = path.join(outputDir, `beta-circulation-${timestamp}.md`);
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(markdown);
  console.log(`\nRelatório salvo em: ${outputPath}`);
}

main().catch((error) => {
  console.error('Falha no relatório de circulação:', error?.message || error);
  process.exit(1);
});
