/**
 * Beta Campaign Brief
 * Gera resumo executivo semanal da campanha jogável
 * 
 * Uso:
 * npm run campaign:brief
 * npm run campaign:brief -- --format=json
 */

const fs = require('fs');
const path = require('path');

const { buildExport } = require('./beta-export.js');

const QUICK_GAMES = [
  { slug: 'cidade-em-comum', title: 'Cidade em Comum', serie: 'serie-solucoes-coletivas' },
  { slug: 'custo-de-viver', title: 'Custo de Viver', serie: 'serie-trabalho-sobrevivencia' },
  { slug: 'quem-paga-a-conta', title: 'Quem Paga a Conta', serie: 'serie-solucoes-coletivas' },
];

const TERRITORIOS = [
  { slug: 'estado-rj', label: 'Estado do Rio de Janeiro', prioridade: 1, semanaFoco: 1 },
  { slug: 'volta-redonda', label: 'Volta Redonda', prioridade: 2, semanaFoco: 2 },
];

const SERIES = [
  { slug: 'serie-solucoes-coletivas', label: 'Soluções Coletivas', prioridade: 1, semanaFoco: 1 },
  { slug: 'serie-trabalho-sobrevivencia', label: 'Trabalho e Sobrevivência', prioridade: 2, semanaFoco: 2 },
];

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub-jogos-pre-campanha.vercel.app';

function getCurrentWeek() {
  // Simplificado: assume que começamos em 2026-03-07 (semana 1)
  const startDate = new Date('2026-03-07');
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const week = Math.ceil(diffDays / 7);
  return Math.max(1, Math.min(week, 2));
}

function getWeekRecommendations(week) {
  if (week === 1) {
    return {
      territorio: 'estado-rj',
      territorioLabel: 'Estado do Rio de Janeiro',
      serie: 'serie-solucoes-coletivas',
      serieLabel: 'Soluções Coletivas',
      quicksPrioritarios: ['cidade-em-comum', 'quem-paga-a-conta', 'custo-de-viver'],
      quickLabels: ['Cidade em Comum', 'Quem Paga a Conta', 'Custo de Viver'],
    };
  } else {
    return {
      territorio: 'volta-redonda',
      territorioLabel: 'Volta Redonda',
      serie: 'serie-trabalho-sobrevivencia',
      serieLabel: 'Trabalho e Sobrevivência',
      quicksPrioritarios: ['custo-de-viver', 'quem-paga-a-conta', 'cidade-em-comum'],
      quickLabels: ['Custo de Viver', 'Quem Paga a Conta', 'Cidade em Comum'],
    };
  }
}

function buildQuickLink(gameSlug, territorio, serie) {
  return `${BASE_URL}/play/${gameSlug}?utm_source=whatsapp&utm_medium=messaging&utm_campaign=pre-campanha-alexandre-fonseca&utm_content=${gameSlug}&territorio=${territorio}&serie=${serie}&jogo=${gameSlug}`;
}

async function generateBrief() {
  console.log('📋 Gerando brief de campanha...\n');
  
  // Determinar semana atual
  const currentWeek = getCurrentWeek();
  const weekRec = getWeekRecommendations(currentWeek);
  
  const exportData = await buildExport('7d');
  const insights = exportData.quickInsights || {};
  const effectiveRuns = exportData.effectiveRuns || {};
  const cooperativaInsights = exportData.cooperativaInsights || {};
  const arcadeLineDecision = exportData.arcadeLineDecision || {};
  const arcadeExposureDuel = exportData.arcadeExposureDuel || {};
  const arcadeConvergenceScorecard = exportData.arcadeConvergenceScorecard || {};
  const arcadeFinalDecision = exportData.arcadeFinalDecision || {}; // T40

  const quickRows = insights.quickComparison || [];
  const bySeriesRows = insights.rankedSeries || [];
  const byTerritoryRows = insights.rankedTerritory || [];
  
  const brief = {
    geradoEm: new Date().toISOString(),
    semanaAtual: currentWeek,
    objetivoCampanha: 'Consolidar amostra mínima comparável por quick/série/território para decisão baseada em evidência',
    candidato: 'Alexandre Fonseca',
    cargo: 'Deputado Estadual',
    estado: 'Rio de Janeiro',
    
    // Foco da semana
    focoSemanal: {
      semana: currentWeek,
      territorio: weekRec.territorioLabel,
      serie: weekRec.serieLabel,
      quicksPrioritarios: weekRec.quickLabels,
    },
    
    // Quick games ativos
    quickGamesAtivos: QUICK_GAMES.map(game => ({
      slug: game.slug,
      title: game.title,
      serie: game.serie,
      linkPronto: buildQuickLink(game.slug, weekRec.territorio, weekRec.serie),
    })),
    
    // Status de coleta
    statusColeta: {
      quicks: quickRows,
      series: bySeriesRows,
      territorios: byTerritoryRows,
      qrExperimento: insights?.qrReadout || {},
      statusGeral: insights?.collectionStatus || {},
    },

    sinaisEfetivos: {
      scorecards: effectiveRuns.scorecards || {},
      direction: effectiveRuns.direction || {},
      directionWinner: effectiveRuns.directionWinner || 'balanced',
      topRuns: effectiveRuns.topEffectiveRunsByGame || [],
      topReplays: effectiveRuns.topEffectiveReplayByGame || [],
      topBridges: effectiveRuns.crossGameBridges || [],
      byChannel: effectiveRuns.byChannel || [],
      byTerritory: effectiveRuns.byTerritory || [],
      warnings: effectiveRuns.warnings || [],
    },

    linhaArcade: {
      estado: arcadeLineDecision?.decision?.state || 'insufficient_sample',
      recomendacao: arcadeLineDecision?.decision?.recommendation || 'insufficient_sample',
      lider: arcadeLineDecision?.duel?.leader || 'insufficient_sample',
      confianca: arcadeLineDecision?.duel?.confidence || 'insufficient_sample',
      prontoParaProximoPasso: Boolean(arcadeLineDecision?.decision?.readyForNextStep),
      resumo: arcadeLineDecision?.decision?.summary || 'Sem leitura consolidada no momento.',
      forcaCampanha: arcadeLineDecision?.campaignStrength || {},
      dimensoes: arcadeLineDecision?.duel?.dimensions || [],
      alertas: arcadeLineDecision?.decision?.warnings || [],
      dueloJusto: arcadeExposureDuel || {},
      convergenciaDecisao: arcadeConvergenceScorecard || {}, // T39
      decisaoFinal: arcadeFinalDecision || {}, // T40
    },

    cooperativa: {
      status: cooperativaInsights?.decision?.status || 'insufficient_live_usage',
      finalDecision: cooperativaInsights?.decision?.finalDecision || 'keep_observing',
      recommendation: cooperativaInsights?.weeklyRecommendation || 'Manter observacao por mais 7 dias.',
      scorecard: cooperativaInsights?.scorecard || {},
      rationale: cooperativaInsights?.decision?.rationale || 'Sem leitura consolidada.',
    },
    // Recomendação da semana
    recomendacaoDaSemana: gerarRecomendacao(currentWeek, weekRec, insights, effectiveRuns, cooperativaInsights, arcadeLineDecision, arcadeExposureDuel, arcadeConvergenceScorecard, arcadeFinalDecision),
  };
  
  return brief;
}

function gerarRecomendacao(week, weekRec, insights, effectiveRuns, cooperativaInsights, arcadeLineDecision, arcadeExposureDuel, arcadeConvergenceScorecard, arcadeFinalDecision) {
  const recomendacao = {
    acoes: [],
    alertas: [],
    proximosPassos: [],
  };

  const scorecards = effectiveRuns?.scorecards || {};
  const topRuns = (effectiveRuns?.topEffectiveRunsByGame || []).slice(0, 2);
  const topReplays = (effectiveRuns?.topEffectiveReplayByGame || []).slice(0, 2);
  const topBridges = (effectiveRuns?.crossGameBridges || []).slice(0, 2);
  const topChannels = (effectiveRuns?.byChannel || []).slice(0, 2);
  const topTerritories = (effectiveRuns?.byTerritory || []).slice(0, 2);

  const previewStatus = scorecards.previewToPlay?.status || 'insufficient_data';
  const replayStatus = scorecards.replayEffectiveness?.status || 'insufficient_data';
  const crossStatus = scorecards.crossGameEffectiveness?.status || 'insufficient_data';
  const lowSample = [previewStatus, replayStatus, crossStatus].every((status) => status === 'insufficient_data');
  const arcadeState = arcadeLineDecision?.decision?.state || 'insufficient_sample';
  const arcadeRecommendation = arcadeLineDecision?.decision?.recommendation || 'insufficient_sample';
  const fairStatus = arcadeExposureDuel?.fairness?.status || 'unbalanced_exposure';
  const underexposedArcade = arcadeExposureDuel?.fairness?.underexposedArcade;
  const recommendedBoost = arcadeExposureDuel?.fairness?.recommendedExposureBoost || 0;
  const arcadeLeader = arcadeLineDecision?.duel?.leader || 'insufficient_sample';
  const cooperativaStatus = cooperativaInsights?.decision?.status || 'insufficient_live_usage';
  const cooperativaDecision = cooperativaInsights?.decision?.finalDecision || 'keep_observing';

  recomendacao.acoes.push(`Territorio da semana: ${weekRec.territorioLabel}`);
  recomendacao.acoes.push(`Serie da semana: ${weekRec.serieLabel}`);

  if (topRuns.length > 0) {
    recomendacao.acoes.push(`Jogo 1o push: ${topRuns[0].slug} (${topRuns[0].effectiveRuns}/${topRuns[0].cardClicks}, ${topRuns[0].effectiveRunRate}%)`);
  } else {
    recomendacao.acoes.push(`Jogo 1o push: ${weekRec.quicksPrioritarios[0]} (regra de coleta)`);
  }

  if (topReplays.length > 0) {
    recomendacao.acoes.push(`Jogo 2o clique: ${topReplays[0].slug} (${topReplays[0].effectiveReplay}/${topReplays[0].replayClicks}, ${topReplays[0].effectiveReplayRate}%)`);
  } else {
    recomendacao.acoes.push(`Jogo 2o clique: ${weekRec.quicksPrioritarios[1]} (ainda sem replay efetivo suficiente)`);
  }

  if (topChannels.length > 0) {
    recomendacao.acoes.push(`Canal prioritario: ${topChannels[0].channel}`);
  } else {
    recomendacao.acoes.push('Canal prioritario: distribuicao equilibrada Instagram/WhatsApp/TikTok');
  }

  if (topTerritories.length > 0) {
    recomendacao.acoes.push(`Territorio promissor por run real: ${topTerritories[0].territory}`);
  }

  if (topBridges.length > 0) {
    recomendacao.acoes.push(`Direcao promissora: ${topBridges[0].from} -> ${topBridges[0].to}`);
  } else {
    recomendacao.acoes.push(`Direcao promissora: ${effectiveRuns?.directionWinner || 'balanced'} (sinal ainda fraco)`);
  }

  if (arcadeRecommendation === 'arcade_a_leads') {
    recomendacao.acoes.push('Arcade lider da semana: Tarifa Zero RJ - Corredor do Povo.');
  } else if (arcadeRecommendation === 'arcade_b_leads') {
    recomendacao.acoes.push('Arcade lider da semana: Mutirao do Bairro.');
  } else if (arcadeRecommendation === 'technical_tie') {
    recomendacao.acoes.push('Arcade em empate tecnico: manter distribuicao comparavel Tarifa vs Mutirao.');
  } else {
    recomendacao.acoes.push('Arcade sem amostra minima: foco em coletar runs comparaveis antes de pivotar.');
  }

  if (fairStatus === 'unbalanced_exposure' || fairStatus === 'exposure_correction_in_progress') {
    recomendacao.acoes.push(`Correcao de exposicao arcade: aumentar ${underexposedArcade || 'o arcade subexposto'} em +${recommendedBoost} sinais nesta semana.`);
  } else {
    recomendacao.acoes.push('Duelo arcade em janela justa: comparar volume e eficiencia sem vies de vitrine.');
  }

  // T39: Convergência de decisão
  const convergenceState = arcadeConvergenceScorecard?.confidence?.state || 'insufficient_fair_sample';
  const alignedDimensions = arcadeConvergenceScorecard?.convergence?.alignedDimensions || 0;
  const convergenceFinalScore = arcadeConvergenceScorecard?.confidence?.finalScore || 0;
  const readyToDecide = arcadeConvergenceScorecard?.decision?.readyToDecide || false;
  const convergenceRecommendedLeader = arcadeConvergenceScorecard?.decision?.recommendedLeader || 'maintain parity';

  if (convergenceState === 'insufficient_fair_sample') {
    recomendacao.alertas.push('T39 - Amostra ainda insuficiente ou exposição desequilibrada para decisão confiável.');
  } else if (convergenceState === 'fair_sample_but_divergent') {
    recomendacao.alertas.push(`T39 - Amostra justa, mas líderes divergem em múltiplas dimensões. Avaliar qualidade antes de decidir.`);
  } else if (convergenceState === 'directional_alignment') {
    recomendacao.acoes.push(`T39 - Sinais alinhados em ${alignedDimensions}/6 dimensões (${convergenceFinalScore}/100). Monitorar consolidação.`);
  } else if (convergenceState === 'decision_candidate') {
    recomendacao.acoes.push(`T39 - Convergência forte em ${alignedDimensions}/6 dimensões (${convergenceFinalScore}/100). Recomendación: ${convergenceRecommendedLeader}.`);
    recomendacao.proximosPassos.push('Validar convergência T39 por mais 7 dias antes de concentrar distribuição em um arcade.');
  } else if (convergenceState === 'ready_for_next_step') {
    recomendacao.acoes.push(`T39 - Convergência forte e confiável (${alignedDimensions}/6, ${convergenceFinalScore}/100). Arcade pronto: ${convergenceRecommendedLeader}.`);
    recomendacao.proximosPassos.push(`T39 aprovado para T40: ${convergenceRecommendedLeader} é arcade focal com segurança operacional alta.`);
  }

  // T40: Decisão Final da Linha Arcade
  if (arcadeFinalDecision && arcadeFinalDecision.decision) {
    const finalDecision = arcadeFinalDecision.decision;
    const finalConfidence = arcadeFinalDecision.confidence || 0;
    const blockers = arcadeFinalDecision.blockers || [];
    const enablers = arcadeFinalDecision.enablers || [];

    if (finalDecision === 'focus_tarifa_zero') {
      recomendacao.acoes.push(`✅ T40 - Decisão AUTORIZADA: Concentrar distribuição em Tarifa Zero RJ (confiança ${finalConfidence}%).`);
      recomendacao.proximosPassos.push('T40: Usar Tarifa Zero como flagship arcade. Reduzir prioridade de Mutirão (manter disponível, mas sem push primário).');
      recomendacao.campaignFocus = 'Foco eleitoral: Transporte público e mobilidade urbana (Tarifa Zero).';
    } else if (finalDecision === 'focus_mutirao') {
      recomendacao.acoes.push(`✅ T40 - Decisão AUTORIZADA: Concentrar distribuição em Mutirão do Bairro (confiança ${finalConfidence}%).`);
      recomendacao.proximosPassos.push('T40: Usar Mutirão como flagship arcade. Reduzir prioridade de Tarifa (manter disponível, mas sem push primário).');
      recomendacao.campaignFocus = 'Foco eleitoral: Solidariedade comunitária e soluções locais (Mutirão).';
    } else if (finalDecision === 'maintain_dual_arcade') {
      recomendacao.acoes.push(`🔄 T40 - MANTER Dual Arcade: Ambos os arcades têm qualidades complementares (confiança ${finalConfidence}%).`);
      recomendacao.proximosPassos.push('T40: Continuar distribuição pareada Tarifa vs Mutirão. Reavaliar em 7 dias.');
      recomendacao.campaignFocus = 'Dual focus: Tarifa (sistemas) + Mutirão (comunidade).';
    } else if (finalDecision === 'defer_new_product') {
      recomendacao.alertas.push(`⛔ T40 - Decisão BLOQUEADA: ${arcadeFinalDecision.rationale || 'Aguardar condições de decisão.'}`);
      if (blockers.length > 0) {
        recomendacao.alertas.push(`Blocadores T40: ${blockers.join(' | ')}`);
      }
      recomendacao.proximosPassos.push('T40: Não autorizar mudança operacional. Continuar coleta pareada com distribuição equilibrada.');
    }

    // Always show enablers if present
    if (enablers.length > 0) {
      recomendacao.acoes.push(`Habilitadores T40: ${enablers.join(' | ')}`);
    }
  }

  const quickRows = insights?.quickComparison || [];
  if (!quickRows || quickRows.length === 0) {
    recomendacao.alertas.push('Sem sessoes quick na janela 7d; iniciar distribuicao imediatamente.');
  } else {
    quickRows.forEach((game) => {
      if ((game.sessions || 0) < 60) {
        recomendacao.alertas.push(`${game.title || game.slug} abaixo da meta de sessoes (${game.sessions || 0}/60).`);
      }
    });
  }

  if (lowSample) {
    recomendacao.alertas.push('Scorecards efetivos em `insufficient_data`: nao pivotar formato quick vs arcade nesta semana.');
  }

  if (arcadeState === 'insufficient_sample') {
    recomendacao.alertas.push('Linha arcade com amostra insuficiente para declarar vencedor oficial Tarifa vs Mutirao.');
  }

  if (fairStatus === 'unbalanced_exposure') {
    recomendacao.alertas.push('Duelo arcade com vies de exposicao. Equalizar vitrine antes de interpretar vencedor oficial.');
  }

  if ((arcadeLineDecision?.decision?.warnings || []).length > 0) {
    recomendacao.alertas.push(`Arcade/T37: ${(arcadeLineDecision.decision.warnings || []).join(' | ')}`);
  }

  if ((effectiveRuns?.warnings || []).length > 0) {
    recomendacao.alertas.push(`Avisos de amostra: ${(effectiveRuns.warnings || []).join(' | ')}`);
  }

  if (cooperativaStatus === 'ready_for_premium_pass') {
    recomendacao.acoes.push('Cooperativa: status ready_for_premium_pass. Preparar premium pass incremental sem abrir novo jogo.');
  } else if (cooperativaStatus === 'needs_more_tuning' || cooperativaDecision === 'run_one_more_tuning_cycle') {
    recomendacao.acoes.push('Cooperativa: executar um ciclo curto de tuning orientado por colapso dominante e replay.');
  } else {
    recomendacao.acoes.push('Cooperativa: manter observacao por mais 7 dias, sem forcar premiumizacao.');
  }

  recomendacao.proximosPassos.push('Abrir pacote de distribuicao do territorio da semana e iniciar 1o push em ate 48h.');
  recomendacao.proximosPassos.push('Executar 2o clique no jogo recomendado apos consumo do primeiro link.');
  recomendacao.proximosPassos.push('Checar /estado no meio e no fim da semana para validar run real por canal e territorio.');
  recomendacao.proximosPassos.push(`Rodar 'npm run beta:distribution-report' e 'npm run beta:campaign-brief' ao fim da semana ${week}.`);

  if (arcadeLineDecision?.decision?.readyForNextStep) {
    recomendacao.proximosPassos.push(`Linha arcade pronta para proximo passo: ${arcadeLeader}. Avaliar consolidacao como flagship sem abrir novo produto.`);
  } else {
    recomendacao.proximosPassos.push('Linha arcade ainda em consolidacao: manter duelo Tarifa vs Mutirao na mesma vitrine e metas de coleta.');
  }

  if (fairStatus === 'unbalanced_exposure' || fairStatus === 'exposure_correction_in_progress') {
    recomendacao.proximosPassos.push('Executar pacote corretivo de exposicao arcade e reavaliar status de duelo justo em 7 dias.');
  }

  if (week === 2) {
    recomendacao.proximosPassos.push('Com massa critica suficiente, revisar decisao direcional sem expandir escopo de produto.');
  }

  return recomendacao;
}

function formatAsMarkdown(brief) {
  let md = `# Brief de Campanha - Pré-Campanha Alexandre Fonseca para Deputado\n\n`;
  md += `**Gerado em:** ${new Date(brief.geradoEm).toLocaleString('pt-BR')}\n`;
  md += `**Semana:** ${brief.semanaAtual}/2\n\n`;
  md += `---\n\n`;
  
  // Candidato
  md += `## 👤 Candidato\n\n`;
  md += `**Nome:** ${brief.candidato}\n`;
  md += `**Cargo:** ${brief.cargo}\n`;
  md += `**Estado:** ${brief.estado}\n\n`;
  
  // Objetivo da campanha
  md += `## 🎯 Objetivo da Campanha Jogável\n\n`;
  md += `${brief.objetivoCampanha}\n\n`;
  
  // Foco da semana
  md += `## 📅 Foco da Semana ${brief.semanaAtual}\n\n`;
  md += `**Território:** ${brief.focoSemanal.territorio}\n`;
  md += `**Série:** ${brief.focoSemanal.serie}\n`;
  md += `**Quick Games Prioritários:**\n`;
  brief.focoSemanal.quicksPrioritarios.forEach((game, idx) => {
    md += `${idx + 1}. ${game}\n`;
  });
  md += `\n`;
  
  // Quick games ativos
  md += `## 🎮 Quick Games Ativos\n\n`;
  brief.quickGamesAtivos.forEach((game, idx) => {
    md += `### ${idx + 1}. ${game.title}\n\n`;
    md += `**Série:** ${game.serie}\n`;
    md += `**Link pronto (WhatsApp):**\n`;
    md += `\`\`\`\n${game.linkPronto}\n\`\`\`\n\n`;
  });
  
  // Status de coleta
  md += `## 📊 Status de Coleta (Últimos 7 dias)\n\n`;
  
  if (!brief.statusColeta.quicks || brief.statusColeta.quicks.length === 0) {
    md += `**Quicks:** Sem dados ainda. Iniciar distribuição.\n\n`;
  } else {
    md += `**Por Quick Game:**\n\n`;
    md += `| Jogo | Sessões | Status |\n`;
    md += `|------|---------|--------|\n`;
    brief.statusColeta.quicks.forEach(game => {
      const status = game.sessions >= 60 ? '✅' : game.sessions >= 30 ? '🟡' : '🔴';
      md += `| ${game.title || game.slug} | ${game.sessions}/60 | ${status} |\n`;
    });
    md += `\n`;
  }
  
  if (brief.statusColeta.territorios && brief.statusColeta.territorios.length > 0) {
    md += `**Por Território:**\n\n`;
    md += `| Território | Sessões | Status |\n`;
    md += `|-----------|---------|--------|\n`;
    brief.statusColeta.territorios.forEach(terr => {
      const status = terr.sessions >= 80 ? '✅' : terr.sessions >= 40 ? '🟡' : '🔴';
      md += `| ${terr.territory} | ${terr.sessions}/80 | ${status} |\n`;
    });
    md += `\n`;
  }

  // Sinais efetivos de campanha
  md += `## ⚡ Sinais de Run Efetiva\n\n`;
  const scorecards = brief.sinaisEfetivos?.scorecards || {};
  if (Object.keys(scorecards).length === 0) {
    md += `Sem dados suficientes de run efetiva na janela atual.\n\n`;
  } else {
    md += `- Preview -> play efetivo: ${scorecards.previewToPlay?.conversionRate || 0}% (${scorecards.previewToPlay?.status || 'insufficient_data'})\n`;
    md += `- Replay efetivo: ${scorecards.replayEffectiveness?.conversionRate || 0}% (${scorecards.replayEffectiveness?.status || 'insufficient_data'})\n`;
    md += `- Next-game start efetivo: ${scorecards.crossGameEffectiveness?.conversionRate || 0}% (${scorecards.crossGameEffectiveness?.status || 'insufficient_data'})\n`;
    md += `- Quick -> Arcade efetivo: ${scorecards.quickToArcadeEffective?.conversionRate || 0}% (${scorecards.quickToArcadeEffective?.status || 'insufficient_data'})\n`;
    md += `- Arcade -> Quick efetivo: ${scorecards.arcadeToQuickEffective?.conversionRate || 0}% (${scorecards.arcadeToQuickEffective?.status || 'insufficient_data'})\n`;
    md += `- Direção dominante: ${brief.sinaisEfetivos?.directionWinner || 'balanced'}\n\n`;

    const topRunGames = (brief.sinaisEfetivos?.topRuns || []).slice(0, 3);
    if (topRunGames.length > 0) {
      md += `**Jogos que mais geram run real:**\n`;
      topRunGames.forEach((row) => {
        md += `- ${row.slug}: ${row.effectiveRuns}/${row.cardClicks} (${row.effectiveRunRate}%)\n`;
      });
      md += `\n`;
    }

    const topReplayGames = (brief.sinaisEfetivos?.topReplays || []).slice(0, 3);
    if (topReplayGames.length > 0) {
      md += `**Jogos que puxam replay de verdade:**\n`;
      topReplayGames.forEach((row) => {
        md += `- ${row.slug}: ${row.effectiveReplay}/${row.replayClicks} (${row.effectiveReplayRate}%)\n`;
      });
      md += `\n`;
    }

    const topBridges = (brief.sinaisEfetivos?.topBridges || []).slice(0, 3);
    if (topBridges.length > 0) {
      md += `**Jogos que puxam o proximo jogo:**\n`;
      topBridges.forEach((row) => {
        md += `- ${row.from} -> ${row.to}: ${row.effectiveStarts}/${row.clicks} (${row.effectiveRate}%)\n`;
      });
      md += `\n`;
    }

    const byChannel = (brief.sinaisEfetivos?.byChannel || []).slice(0, 3);
    if (byChannel.length > 0) {
      md += `**Canais com melhor run real:**\n`;
      byChannel.forEach((row) => {
        md += `- ${row.channel}: ${row.effectiveRuns}/${row.cardClicks} (${row.effectiveRunRate}%)\n`;
      });
      md += `\n`;
    }

    const byTerritory = (brief.sinaisEfetivos?.byTerritory || []).slice(0, 3);
    if (byTerritory.length > 0) {
      md += `**Territorios com melhor run real:**\n`;
      byTerritory.forEach((row) => {
        md += `- ${row.territory}: ${row.effectiveRuns}/${row.cardClicks} (${row.effectiveRunRate}%)\n`;
      });
      md += `\n`;
    }

    if ((brief.sinaisEfetivos?.warnings || []).length > 0) {
      md += `**Avisos de amostra:** ${(brief.sinaisEfetivos.warnings || []).join(' | ')}\n\n`;
    }
  }
  
  // Recomendação da semana
  md += `## 💡 Recomendação da Semana\n\n`;

  // Linha arcade comparativa
  md += `## 🕹️ Linha Arcade - Decisão Oficial (T37)\n\n`;
  md += `- **Estado:** ${brief.linhaArcade?.estado || 'insufficient_sample'}\n`;
  md += `- **Recomendação:** ${brief.linhaArcade?.recomendacao || 'insufficient_sample'}\n`;
  md += `- **Líder:** ${brief.linhaArcade?.lider || 'insufficient_sample'}\n`;
  md += `- **Confiança:** ${brief.linhaArcade?.confianca || 'insufficient_sample'}\n`;
  md += `- **Pronto para próximo passo:** ${brief.linhaArcade?.prontoParaProximoPasso ? 'sim' : 'não'}\n`;
  md += `- **Resumo:** ${brief.linhaArcade?.resumo || 'Sem leitura consolidada no momento.'}\n\n`;

  const arcadeStrength = brief.linhaArcade?.forcaCampanha || {};
  md += `**Força de campanha (score):**\n`;
  md += `- Tarifa Zero: ${arcadeStrength?.tarifa?.weightedScore || 0}\n`;
  md += `- Mutirão: ${arcadeStrength?.mutirao?.weightedScore || 0}\n`;
  md += `- Vencedor técnico: ${arcadeStrength?.winner || 'technical_tie'}\n\n`;

  if ((brief.linhaArcade?.dimensoes || []).length > 0) {
    md += `**Dimensões comparadas:**\n`;
    brief.linhaArcade.dimensoes.forEach((dimension) => {
      md += `- ${dimension.label}: Tarifa ${dimension.tarifaValue} | Mutirão ${dimension.mutiraoValue} | vencedor ${dimension.winner}\n`;
    });
    md += `\n`;
  }

  if ((brief.linhaArcade?.alertas || []).length > 0) {
    md += `**Alertas de amostra:** ${(brief.linhaArcade.alertas || []).join(' | ')}\n\n`;
  }

  const dueloJusto = brief.linhaArcade?.dueloJusto || {};
  md += `## 🏭 Cooperativa na Pressão - Decisão T49\n\n`;
  md += `- Status: ${brief.cooperativa?.status || 'insufficient_live_usage'}\n`;
  md += `- Decisão formal: ${brief.cooperativa?.finalDecision || 'keep_observing'}\n`;
  md += `- Runs observadas: ${brief.cooperativa?.scorecard?.runs || 0}\n`;
  md += `- Survival: ${brief.cooperativa?.scorecard?.survivalRate || 0}%\n`;
  md += `- Collectivity: ${brief.cooperativa?.scorecard?.collectivityRate || 0}%\n`;
  md += `- Mutirão usage: ${brief.cooperativa?.scorecard?.mutiraoUsageRate || 0}%\n`;
  md += `- Replay: ${brief.cooperativa?.scorecard?.replayRate || 0}%\n`;
  md += `- CTA pós-run: ${brief.cooperativa?.scorecard?.postRunCtaRate || 0}%\n`;
  md += `- Causa principal de colapso: ${brief.cooperativa?.scorecard?.topCollapseReason || 'none'}\n`;
  md += `- Recomendação: ${brief.cooperativa?.recommendation || 'Manter observação.'}\n\n`;

  md += `### Duelo Justo por Exposição (T38)\n\n`;
  md += `- Status: ${dueloJusto.fairness?.status || 'unbalanced_exposure'}\n`;
  md += `- Resumo: ${dueloJusto.fairness?.summary || 'Sem leitura de exposição consolidada.'}\n`;
  md += `- Gap de exposição: ${dueloJusto.fairness?.exposureDeltaPct || 0}pp\n`;
  md += `- Arcade subexposto: ${dueloJusto.fairness?.underexposedArcade || 'nenhum'}\n`;
  md += `- Boost recomendado: +${dueloJusto.fairness?.recommendedExposureBoost || 0}\n`;
  md += `- Líder por volume: ${dueloJusto.contextLeaders?.volumeLeader || 'technical_tie'}\n`;
  md += `- Líder por eficiência: ${dueloJusto.contextLeaders?.efficiencyLeader || 'technical_tie'}\n`;
  md += `- Líder por força de campanha: ${dueloJusto.contextLeaders?.campaignLeader || 'technical_tie'}\n\n`;

  if ((dueloJusto.scorecards || []).length > 0) {
    md += `**Scorecards por arcade:**\n`;
    dueloJusto.scorecards.forEach((row) => {
      md += `- ${row.slug}: exposição ${row.exposureSignals}, interesse ${row.intentClicks}, starts ${row.starts}, exposição->start ${row.exposureToStartRate}%\n`;
    });
    md += `\n`;
  }

  const convergencia = brief.linhaArcade?.convergenciaDecisao || {};
  md += `### Decisão de Convergência (T39)\n\n`;
  md += `- Estado: ${convergencia.confidence?.state || 'insufficient_fair_sample'}\n`;
  md += `- Escore: ${convergencia.confidence?.finalScore || 0}/100\n`;
  md += `- Dimensões alinhadas: ${convergencia.convergence?.alignedDimensions || 0}/${convergencia.convergence?.totalDimensions || 6}\n`;
  md += `- Pronto para decidir?: ${convergencia.decision?.readyToDecide ? 'Sim' : 'Não'}\n`;
  md += `- Líder recomendado: ${convergencia.decision?.recommendedLeader || 'maintain parity'}\n`;
  md += `- Rationale: ${convergencia.decision?.rationale || 'Sem leitura consolidada.'}\n`;
  
  if ((convergencia.convergence?.divergentDimensions || []).length > 0) {
    md += `- Dimensões divergentes: ${(convergencia.convergence?.divergentDimensions || []).join(', ')}\n`;
  }
  
  md += `\n`;
  
  md += `### Ações Prioritárias\n\n`;
  brief.recomendacaoDaSemana.acoes.forEach(acao => {
    md += `- ${acao}\n`;
  });
  md += `\n`;
  
  if (brief.recomendacaoDaSemana.alertas.length > 0) {
    md += `### Alertas\n\n`;
    brief.recomendacaoDaSemana.alertas.forEach((alerta) => {
      md += `- ${alerta}\n`;
    });
    md += `\n`;
  }
  
  md += `### Próximos Passos\n\n`;
  brief.recomendacaoDaSemana.proximosPassos.forEach(passo => {
    md += `1. ${passo}\n`;
  });
  md += `\n`;
  
  // Recursos
  md += `## 📚 Recursos de Distribuição\n\n`;
  md += `**Pacotes prontos:**\n`;
  md += `- \`reports/distribution/packages/territorio-${brief.focoSemanal.territorio === 'Estado do Rio de Janeiro' ? 'estado-rj' : 'volta-redonda'}.md\`\n`;
  md += `- \`reports/distribution/packages/instagram-geral.md\`\n`;
  md += `- \`reports/distribution/packages/whatsapp-geral.md\`\n`;
  md += `- \`reports/distribution/packages/tiktok-geral.md\`\n\n`;
  
  md += `**Documentação:**\n`;
  md += `- \`docs/operacao-semanal-distribuicao.md\` - Roteiro completo\n`;
  md += `- \`docs/distribuicao-links.md\` - Sistema de links\n`;
  md += `- \`docs/plano-distribuicao-quick.md\` - Plano mestre\n\n`;
  
  md += `**Comandos úteis:**\n`;
  md += `\`\`\`bash\n`;
  md += `npm run campaign:links         # Gerar links de campanha\n`;
  md += `npm run beta:distribution-report # Verificar progresso de coleta\n`;
  md += `npm run campaign:brief         # Atualizar este brief\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  md += `**Use este brief como guia operacional para a semana. Distribua, monitore e ajuste conforme necessário.**\n`;
  
  return md;
}

async function main() {
  const args = process.argv.slice(2);
  const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'md';
  
  try {
    const brief = await generateBrief();
    
    // Criar diretório de output
    const outputDir = path.join(__dirname, '../reports/distribution/briefs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    if (format === 'json') {
      const outputPath = path.join(outputDir, `campaign-brief-${timestamp}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(brief, null, 2));
      console.log(`✅ Brief salvo em: ${outputPath}\n`);
    } else {
      const outputPath = path.join(outputDir, `campaign-brief-${timestamp}.md`);
      const markdown = formatAsMarkdown(brief);
      fs.writeFileSync(outputPath, markdown);
      console.log(`✅ Brief salvo em: ${outputPath}\n`);
      
      // Exibir resumo no console
      console.log('📋 Resumo do Brief:');
      console.log(`   Semana: ${brief.semanaAtual}/2`);
      console.log(`   Território foco: ${brief.focoSemanal.territorio}`);
      console.log(`   Série foco: ${brief.focoSemanal.serie}`);
      console.log(`   Quicks prioritários: ${brief.focoSemanal.quicksPrioritarios.join(', ')}\n`);
    }
  } catch (error) {
    console.error('❌ Erro ao gerar brief:', error);
    process.exit(1);
  }
}

main();
