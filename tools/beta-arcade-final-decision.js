#!/usr/bin/env node

/**
 * T40: Janela Final de Decisão da Linha Arcade
 * 
 * Consolida T37 (decisão oficial), T38 (fairness), T39 (convergência)
 * e produz uma decisão final auditável sobre qual arcade deve puxar T41.
 * 
 * Saídas:
 * - focus_tarifa_zero: Tarifa lidera com confiança suficiente
 * - focus_mutirao: Mutirão lidera com confiança suficiente
 * - maintain_dual_arcade: Empate ou divergência útil
 * - defer_new_product: Ainda é cedo (amostra/convergência insuficiente)
 */

const fs = require('fs');
const path = require('path');
const { buildExport } = require('./beta-export');

// Load previous decision states to track persistence
function loadDecisionHistory() {
  const baseDir = path.join(__dirname, '..', 'reports', 'arcade-decision');
  
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const files = fs.readdirSync(baseDir)
    .filter(f => f.endsWith('-arcade-final-decision.json'))
    .sort()
    .reverse(); // Most recent first

  const history = [];
  for (let i = 0; i < Math.min(files.length, 30); i++) { // Last 30 snapshots
    try {
      const filePath = path.join(baseDir, files[i]);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      history.push({
        timestamp: data.generatedAt,
        decision: data.decision,
        confidence: data.confidence,
        t39State: data.t39?.state,
        t38Status: data.t38?.fairnessStatus,
        blockers: data.blockers || [],
      });
    } catch (error) {
      // Skip corrupted files
    }
  }

  return history;
}

// Compute stability metrics from decision history
function computeStabilityMetrics(currentDecision, currentT39State, currentT38Status, history) {
  if (history.length === 0) {
    return {
      stateDurationDays: 0,
      decisionStable: false,
      candidatePersistenceDays: 0,
      candidateReadyForPromotion: false,
      stateChanges: 0,
      lastStateChange: null,
      observationPeriod: '0d',
    };
  }

  let stateDurationDays = 0;
  let candidatePersistenceDays = 0;
  let stateChanges = 0;
  let lastStateChange = null;

  // Count how long current state has persisted
  for (let i = 0; i < history.length; i++) {
    const prevDecision = history[i];
    if (prevDecision.decision === currentDecision && prevDecision.t39State === currentT39State) {
      const hoursDiff = (new Date() - new Date(prevDecision.timestamp)) / (1000 * 60 * 60);
      stateDurationDays = Math.max(stateDurationDays, hoursDiff / 24);
    } else {
      lastStateChange = prevDecision.timestamp;
      stateChanges++;
      break;
    }
  }

  // Count how long decision_candidate has persisted
  if (currentT39State === 'decision_candidate') {
    for (let i = 0; i < history.length; i++) {
      const prevDecision = history[i];
      if (prevDecision.t39State === 'decision_candidate') {
        const hoursDiff = (new Date() - new Date(prevDecision.timestamp)) / (1000 * 60 * 60);
        candidatePersistenceDays = Math.max(candidatePersistenceDays, hoursDiff / 24);
      } else {
        break;
      }
    }
  }

  const decisionStable = stateDurationDays >= 1; // Stable if state held for 1+ days
  const candidateReadyForPromotion = candidatePersistenceDays >= 7; // Ready if candidate for 7+ days

  const oldestObservation = history[history.length - 1];
  const observationDays = (new Date() - new Date(oldestObservation.timestamp)) / (1000 * 60 * 60 * 24);

  return {
    stateDurationDays: Math.round(stateDurationDays * 10) / 10,
    decisionStable,
    candidatePersistenceDays: Math.round(candidatePersistenceDays * 10) / 10,
    candidateReadyForPromotion,
    stateChanges,
    lastStateChange,
    observationPeriod: `${Math.round(observationDays)}d`,
    historySize: history.length,
  };
}

async function getFinalArcadeDecision() {
  try {
    const exportData = await buildExport('7d');
    
    // Load decision history for stability tracking
    const history = loadDecisionHistory();
    
    const arcadeLineDecision = exportData.arcadeLineDecision || {};
    const arcadeExposureDuel = exportData.arcadeExposureDuel || {};
    const effectiveRuns = exportData.effectiveRuns || {};

    // T37: Official Leader
    const officialLeader = arcadeLineDecision.duel?.leader || 'insufficient_sample';
    const officialState = arcadeLineDecision.decision?.state || 'insufficient_sample';
    const officialConfidence = arcadeLineDecision.duel?.confidence || 'insufficient_sample';

    // T38: Fair Exposure Status
    const fairnessStatus = arcadeExposureDuel.fairness?.status || 'unbalanced_exposure';
    const exposureDeltaPct = arcadeExposureDuel.fairness?.exposureDeltaPct || 0;

    // T39: Convergence (compute if needed)
    const convergenceDimensions = computeConvergenceDimensions(arcadeLineDecision, arcadeExposureDuel, exportData);
    const convergenceState = convergenceDimensions.state;
    const alignedDimensions = convergenceDimensions.aligned;
    const totalDimensions = convergenceDimensions.total;
    const convergenceScore = convergenceDimensions.score;

    // Sample Assessment
    const scorecard = arcadeLineDecision.campaignStrength || {};
    const tarifaRuns = arcadeLineDecision.sample?.tarifaRuns || 0;
    const mutiraoRuns = arcadeLineDecision.sample?.mutiraoRuns || 0;
    const minRunsForSignal = arcadeLineDecision.sample?.minRunsForSignal || 30;
    const totalRuns = tarifaRuns + mutiraoRuns;

    // Stability & Duration (simplified: based on current state consistency)
    const stableIfConsistent = officialState === officialLeader ? 'stable' : 'fluctuating';

    // Decision Matrix
    let finalDecision = 'defer_new_product';
    let decisionRationale = '';
    let decisionConfidence = 0;
    const blockers = [];
    const enablers = [];

    // Check Fairness Gate
    if (fairnessStatus === 'unbalanced_exposure') {
      blockers.push(`Exposição desequilibrada (${exposureDeltaPct}pp). Decisão bloqueada até equilibrar.`);
    } else if (fairnessStatus === 'exposure_correction_in_progress') {
      blockers.push(`Exposição em correção. Reavaliar após equalizar gap.`);
    } else {
      enablers.push(`Exposição justa (${exposureDeltaPct}pp, status: ${fairnessStatus}).`);
    }

    // Check Sample Gate
    if (totalRuns < minRunsForSignal * 1.5) {
      blockers.push(`Amostra insuficiente (${totalRuns} runs vs ${minRunsForSignal * 1.5} meta). Continuar coleta.`);
    } else {
      enablers.push(`Amostra adequada (${totalRuns} runs).`);
    }

    // Check Convergence Gate
    if (convergenceState === 'insufficient_fair_sample') {
      blockers.push(`Convergência insuficiente (estado: insufficient_fair_sample).`);
    } else if (convergenceState === 'fair_sample_but_divergent') {
      blockers.push(`Líderes divergem em múltiplas dimensões. Investigar antes de decidir.`);
    } else if (convergenceState === 'directional_alignment') {
      enablers.push(`Sinais alinhados em ${alignedDimensions}/${totalDimensions} dimensões.`);
    } else if (convergenceState === 'decision_candidate' || convergenceState === 'ready_for_next_step') {
      enablers.push(`✅ Convergência forte (${alignedDimensions}/${totalDimensions} dims, score ${convergenceScore}/100).`);
    }

    // Decision Logic
    if (blockers.length === 0 && enablers.length >= 3) {
      // Ready to decide
      if (officialLeader === 'tarifa-zero-corredor') {
        finalDecision = 'focus_tarifa_zero';
        decisionRationale = `Tarifa Zero RJ lidera oficialmente (T37) com ${officialConfidence} confiança, exposição justa (T38), e convergência forte (T39: ${alignedDimensions}/${totalDimensions} dims).`;
        decisionConfidence = Math.min(convergenceScore, 95);
      } else if (officialLeader === 'mutirao-do-bairro') {
        finalDecision = 'focus_mutirao';
        decisionRationale = `Mutirão do Bairro lidera oficialmente (T37) com ${officialConfidence} confiança, exposição justa (T38), e convergência forte (T39: ${alignedDimensions}/${totalDimensions} dims).`;
        decisionConfidence = Math.min(convergenceScore, 95);
      } else if (officialLeader === 'technical_tie') {
        finalDecision = 'maintain_dual_arcade';
        decisionRationale = `Empate técnico (T37), mas ambos os arcades têm qualidades complementares. Manter distribuição pareada.`;
        decisionConfidence = 75;
      }
    } else if (blockers.length > 0) {
      finalDecision = 'defer_new_product';
      decisionRationale = `Decisão bloqueada por: ${blockers.join(' ')}`;
      decisionConfidence = 0;
    } else {
      finalDecision = convergenceState === 'decision_candidate' ? 'maintain_dual_arcade' : 'defer_new_product';
      decisionRationale = `Sinais parciais. Estado T39: ${convergenceState}. Validar por 7 dias adicionais.`;
      decisionConfidence = convergenceScore * 0.6; // Lower confidence if not fully ready
    }

    // Compute stability metrics
    const stability = computeStabilityMetrics(finalDecision, convergenceState, fairnessStatus, history);

    // Adjust decision based on persistence rule:
    // If decision_candidate persists for 7+ days, can authorize next step
    if (convergenceState === 'decision_candidate' && stability.candidateReadyForPromotion) {
      // Promote to authorized decision
      if (officialLeader === 'tarifa-zero-corredor') {
        finalDecision = 'focus_tarifa_zero';
        decisionRationale = `Tarifa Zero RJ lidera com convergência sustentada (${stability.candidatePersistenceDays}d como candidato). Autorizado por persistência de estado.`;
        decisionConfidence = Math.min(convergenceScore, 90);
      } else if (officialLeader === 'mutirao-do-bairro') {
        finalDecision = 'focus_mutirao';
        decisionRationale = `Mutirão do Bairro lidera com convergência sustentada (${stability.candidatePersistenceDays}d como candidato). Autorizado por persistência de estado.`;
        decisionConfidence = Math.min(convergenceScore, 90);
      } else {
        finalDecision = 'maintain_dual_arcade';
        decisionRationale = `Empate sustentado por ${stability.candidatePersistenceDays}d. Manter dual arcade strategy.`;
        decisionConfidence = 75;
      }
    }

    // Build Output Object
    const finalDecisionReport = {
      generatedAt: new Date().toISOString(),
      window: '7d',
      decision: finalDecision,
      confidence: Math.round(decisionConfidence),
      rationale: decisionRationale,
      blockers,
      enablers,
      
      // T37 Context
      t37: {
        leader: officialLeader,
        state: officialState,
        confidence: officialConfidence,
        summary: arcadeLineDecision.decision?.summary || 'Sem decisão consolidada.',
      },
      
      // T38 Context
      t38: {
        fairnessStatus,
        exposureDeltaPct,
        volumeLeader: arcadeExposureDuel.contextLeaders?.volumeLeader || 'technical_tie',
        efficiencyLeader: arcadeExposureDuel.contextLeaders?.efficiencyLeader || 'technical_tie',
      },
      
      // T39 Context
      t39: {
        state: convergenceState,
        alignedDimensions,
        totalDimensions,
        score: convergenceScore,
        dimensions: convergenceDimensions.list.map(d => ({
          key: d.key,
          label: d.label,
          leader: d.leader,
          signal: d.signal,
        })),
      },
      
      // Sample Context
      sample: {
        tarifaRuns,
        mutiraoRuns,
        totalRuns,
        minRunsForSignal,
        sufficient: totalRuns >= minRunsForSignal * 1.5,
      },
      
      // Recommendation
      recommendation: {
        actionIfDecidable: decisionRecommendationByDecision(finalDecision),
        actionIfDeferred: 'Continuar coleta pareada Tarifa vs Mutirão. Reavaliar em 7 dias.',
        campaignFocus: decisionCampaignFocus(finalDecision),
      },

      // T40: Stability & Persistence Context
      stability: {
        stateDurationDays: stability.stateDurationDays,
        decisionStable: stability.decisionStable,
        candidatePersistenceDays: stability.candidatePersistenceDays,
        candidateReadyForPromotion: stability.candidateReadyForPromotion,
        stateChanges: stability.stateChanges,
        lastStateChange: stability.lastStateChange,
        observationPeriod: stability.observationPeriod,
        historySize: stability.historySize,
      },
    };

    return finalDecisionReport;
  } catch (error) {
    console.error('Error computing final arcade decision:', error.message);
    throw error;
  }
}

function computeConvergenceDimensions(arcadeLineDecision, arcadeExposureDuel, exportData) {
  const arcadeInsights = exportData.arcadeInsights || { byArcadeGame: [] };
  const tarifaRow = arcadeInsights.byArcadeGame?.find(r => r.slug === 'tarifa-zero-corredor') || {};
  const mutiraoRow = arcadeInsights.byArcadeGame?.find(r => r.slug === 'mutirao-do-bairro') || {};

  const dimensions = [];

  // 1. Volume
  const volumeLeader = tarifaRow.runs > mutiraoRow.runs ? 'tarifa-zero-corredor' : 'mutirao-do-bairro';
  const volumeMargin = Math.abs(tarifaRow.runs - mutiraoRow.runs) / Math.max(tarifaRow.runs, mutiraoRow.runs, 1) * 100;
  dimensions.push({
    key: 'volume',
    label: 'Volume (runs)',
    leader: volumeLeader,
    margin: Math.round(volumeMargin),
    signal: volumeMargin >= 15 ? 'strong' : volumeMargin >= 8 ? 'moderate' : 'weak',
  });

  // 2. Exposure (from T38)
  const exposureLeader = arcadeExposureDuel.contextLeaders?.volumeLeader || 'technical_tie';
  const exposureDelta = arcadeExposureDuel.fairness?.exposureDeltaPct || 0;
  dimensions.push({
    key: 'exposure',
    label: 'Exposição',
    leader: exposureLeader,
    margin: Math.round(exposureDelta),
    signal: exposureDelta >= 20 ? 'strong' : exposureDelta >= 10 ? 'moderate' : 'weak',
  });

  // 3. Efficiency
  const efficiencyLeader = arcadeExposureDuel.contextLeaders?.efficiencyLeader || 'technical_tie';
  const scorecards = arcadeExposureDuel.scorecards || [];
  const tarifaEff = scorecards[0]?.exposureToStartRate || 0;
  const mutiraoEff = scorecards[1]?.exposureToStartRate || 0;
  const effDelta = Math.abs(tarifaEff - mutiraoEff);
  dimensions.push({
    key: 'efficiency',
    label: 'Eficiência (exposição→start)',
    leader: efficiencyLeader,
    margin: Math.round(effDelta),
    signal: effDelta >= 8 ? 'strong' : effDelta >= 4 ? 'moderate' : 'weak',
  });

  // 4. Engagement (Replay)
  const replayLeader = tarifaRow.replayClicks > mutiraoRow.replayClicks ? 'tarifa-zero-corredor' : 'mutirao-do-bairro';
  const replayDelta = Math.abs(tarifaRow.replayClicks - mutiraoRow.replayClicks) / Math.max(tarifaRow.replayClicks, mutiraoRow.replayClicks, 1) * 100;
  dimensions.push({
    key: 'engagement',
    label: 'Engajamento (replays)',
    leader: replayLeader,
    margin: Math.round(replayDelta),
    signal: replayDelta >= 20 ? 'strong' : replayDelta >= 10 ? 'moderate' : 'weak',
  });

  // 5. Campaign Strength (T37)
  const campaignLeader = arcadeLineDecision.campaignStrength?.winner || 'technical_tie';
  const campaignDelta = arcadeLineDecision.campaignStrength?.scoreDelta || 0;
  dimensions.push({
    key: 'campaign',
    label: 'Força de Campanha (T37)',
    leader: campaignLeader,
    margin: Math.round(campaignDelta),
    signal: campaignDelta >= 10 ? 'strong' : campaignDelta >= 5 ? 'moderate' : 'weak',
  });

  // Compute Convergence
  const tarifaCount = dimensions.filter(d => d.leader === 'tarifa-zero-corredor').length;
  const mutiraoCount = dimensions.filter(d => d.leader === 'mutirao-do-bairro').length;
  const maxAligned = Math.max(tarifaCount, mutiraoCount);
  const alignmentRatio = maxAligned / dimensions.length;

  // Determine State
  let state = 'insufficient_fair_sample';
  if (alignmentRatio >= 0.83) {
    state = 'ready_for_next_step';
  } else if (alignmentRatio >= 0.67) {
    state = 'decision_candidate';
  } else if (alignmentRatio >= 0.5) {
    state = 'directional_alignment';
  } else {
    state = 'fair_sample_but_divergent';
  }

  const score = Math.round(alignmentRatio * 100);

  return {
    state,
    aligned: maxAligned,
    total: dimensions.length,
    score,
    list: dimensions,
  };
}

function decisionRecommendationByDecision(decision) {
  switch (decision) {
    case 'focus_tarifa_zero':
      return 'Concentrar distribuição semanal em Tarifa Zero RJ. Usar como arcade focal para T41.';
    case 'focus_mutirao':
      return 'Concentrar distribuição semanal em Mutirão do Bairro. Usar como arcade focal para T41.';
    case 'maintain_dual_arcade':
      return 'Manter distribuição pareada Tarifa vs Mutirão. Ambos têm qualidades complementares.';
    case 'defer_new_product':
      return 'Não autorizar mudança operacional. Continuar coleta pareada com distribuição equilibrada.';
    default:
      return '';
  }
}

function decisionCampaignFocus(decision) {
  switch (decision) {
    case 'focus_tarifa_zero':
      return 'Tarifa Zero RJ — Corredor do Povo. Campanha eleitoral foco: transporte e mobilidade urbana.';
    case 'focus_mutirao':
      return 'Mutirão do Bairro. Campanha eleitoral foco: solidariedade comunitária e soluções locais.';
    case 'maintain_dual_arcade':
      return 'Ambos os arcades. Tarifa enfatiza sistemas; Mutirão enfatiza comunidade.';
    case 'defer_new_product':
      return 'Manter foco em consolidar amostra antes de pivotar campanha.';
    default:
      return '';
  }
}

async function main() {
  console.log('🎯 T40: Computando Decisão Final da Linha Arcade...\n');

  try {
    const decision = await getFinalArcadeDecision();

    // Print JSON
    const jsonOutput = JSON.stringify(decision, null, 2);
    console.log('## JSON Output\n');
    console.log(jsonOutput);

    // Print Markdown
    const mdOutput = formatDecisionAsMarkdown(decision);
    console.log('\n## Markdown Output\n');
    console.log(mdOutput);

    // Save both outputs
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const baseDir = path.join(__dirname, '..', 'reports', 'arcade-decision');

    // Ensure directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const jsonPath = path.join(baseDir, `${timestamp}-arcade-final-decision.json`);
    const mdPath = path.join(baseDir, `${timestamp}-arcade-final-decision.md`);

    fs.writeFileSync(jsonPath, jsonOutput, 'utf-8');
    fs.writeFileSync(mdPath, mdOutput, 'utf-8');

    console.log(`\n✅ Decision reports saved:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Markdown: ${mdPath}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function formatDecisionAsMarkdown(decision) {
  let md = `# T40: Decisão Final da Linha Arcade\n\n`;
  md += `**Gerado em:** ${new Date(decision.generatedAt).toLocaleString('pt-BR')}\n`;
  md += `**Janela:** ${decision.window}\n\n`;

  md += `## Decisão Final\n\n`;
  md += `**Status:** ${decision.decision.toUpperCase()}\n`;
  md += `**Confiança:** ${decision.confidence}/100\n\n`;
  md += `**Rationale:** ${decision.rationale}\n\n`;

  if (decision.blockers.length > 0) {
    md += `### ⚠️ Blocadores\n\n`;
    decision.blockers.forEach(b => {
      md += `- ${b}\n`;
    });
    md += `\n`;
  }

  if (decision.enablers.length > 0) {
    md += `### ✅ Habilitadores\n\n`;
    decision.enablers.forEach(e => {
      md += `- ${e}\n`;
    });
    md += `\n`;
  }

  md += `## Contexto T37 (Decisão Oficial)\n\n`;
  md += `- **Líder:** ${decision.t37.leader}\n`;
  md += `- **Estado:** ${decision.t37.state}\n`;
  md += `- **Confiança:** ${decision.t37.confidence}\n`;
  md += `- **Resumo:** ${decision.t37.summary}\n\n`;

  md += `## Contexto T38 (Duelo Justo por Exposição)\n\n`;
  md += `- **Status:** ${decision.t38.fairnessStatus}\n`;
  md += `- **Gap Exposição:** ${decision.t38.exposureDeltaPct}pp\n`;
  md += `- **Líder Volume:** ${decision.t38.volumeLeader}\n`;
  md += `- **Líder Eficiência:** ${decision.t38.efficiencyLeader}\n\n`;

  md += `## Contexto T39 (Convergência)\n\n`;
  md += `- **Estado:** ${decision.t39.state}\n`;
  md += `- **Dimensões Alinhadas:** ${decision.t39.alignedDimensions}/${decision.t39.totalDimensions}\n`;
  md += `- **Escore:** ${decision.t39.score}/100\n\n`;

  md += `**Dimensões:**\n`;
  decision.t39.dimensions.forEach(dim => {
    md += `| ${dim.label} | ${dim.leader} | ${dim.signal} |\n`;
  });
  md += `\n`;

  md += `## Amostra\n\n`;
  md += `- **Tarifa Zero:** ${decision.sample.tarifaRuns} runs\n`;
  md += `- **Mutirão:** ${decision.sample.mutiraoRuns} runs\n`;
  md += `- **Total:** ${decision.sample.totalRuns} runs\n`;
  md += `- **Meta Mínima:** ${decision.sample.minRunsForSignal * 1.5} runs\n`;
  md += `- **Suficiente?:** ${decision.sample.sufficient ? 'Sim ✅' : 'Não ❌'}\n\n`;

  md += `## Estabilidade & Persistência (T40)\n\n`;
  md += `- **Duração do Estado Atual:** ${decision.stability.stateDurationDays} dias\n`;
  md += `- **Estado Estável?:** ${decision.stability.decisionStable ? 'Sim ✅' : 'Não ⏳'}\n`;
  md += `- **Persistência como Candidato:** ${decision.stability.candidatePersistenceDays} dias\n`;
  md += `- **Pronto para Promoção (7d rule)?:** ${decision.stability.candidateReadyForPromotion ? 'Sim ✅' : 'Não ⏳'}\n`;
  md += `- **Mudanças de Estado:** ${decision.stability.stateChanges} (período de ${decision.stability.observationPeriod})\n`;
  md += `- **Última Mudança:** ${decision.stability.lastStateChange ? new Date(decision.stability.lastStateChange).toLocaleString('pt-BR') : 'N/A'}\n`;
  md += `- **Histórico Analisado:** ${decision.stability.historySize} snapshots\n\n`;

  md += `## Recomendações\n\n`;
  md += `### Ação Imediata\n`;
  md += `${decision.recommendation.actionIfDecidable}\n\n`;

  md += `### Foco de Campanha\n`;
  md += `${decision.recommendation.campaignFocus}\n\n`;

  md += `---\n\n`;
  md += `**Decisão:** ${decision.decision}\n`;
  md += `**Confiança:** ${decision.confidence}%\n`;

  return md;
}

module.exports = { getFinalArcadeDecision };

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
