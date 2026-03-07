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

// Importar lógica de export existente
const { getQuickInsights } = require('./beta-export.js');

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
  
  // Obter insights de quick games
  const insights = await getQuickInsights('7d');
  
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
      quicks: insights?.byGame || [],
      series: insights?.bySeries || [],
      territorios: insights?.byTerritory || [],
      qrExperimento: insights?.qrExperiment || {},
      statusGeral: insights?.collectionStatus || {},
    },
    
    // Recomendação da semana
    recomendacaoDaSemana: gerarRecomendacao(currentWeek, weekRec, insights),
  };
  
  return brief;
}

function gerarRecomendacao(week, weekRec, insights) {
  const recomendacao = {
    acoes: [],
    alertas: [],
    proximosPassos: [],
  };
  
  // Ações prioritárias
  recomendacao.acoes.push(`Distribuir jogos no território: ${weekRec.territorioLabel}`);
  recomendacao.acoes.push(`Priorizar série: ${weekRec.serieLabel}`);
  recomendacao.acoes.push(`Focar nos quick games na ordem: ${weekRec.quickLabels.join(', ')}`);
  recomendacao.acoes.push('Usar canais prioritários: Instagram, WhatsApp, TikTok');
  
  // Alertas baseados em insights
  if (!insights || !insights.byGame || insights.byGame.length === 0) {
    recomendacao.alertas.push('⚠️ Sem sessões quick na janela 7d - iniciar distribuição imediatamente');
  } else {
    // Checar quais quicks estão abaixo da meta
    insights.byGame.forEach(game => {
      if (game.sessions < 60) {
        recomendacao.alertas.push(`⚠️ ${game.gameTitle} abaixo da meta (${game.sessions}/60 sessões)`);
      }
    });
  }
  
  // Próximos passos
  recomendacao.proximosPassos.push('Abrir pacote de distribuição correspondente ao território da semana');
  recomendacao.proximosPassos.push('Copiar links prontos e distribuir nos canais prioritários');
  recomendacao.proximosPassos.push('Checar progresso em /estado no meio e fim da semana');
  recomendacao.proximosPassos.push(`Rodar 'npm run beta:distribution-report' no fim da semana ${week}`);
  
  if (week === 2) {
    recomendacao.proximosPassos.push('Avaliar amostra consolidada e decisão sobre formato médio (Tijolo 29)');
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
      md += `| ${game.gameTitle} | ${game.sessions}/60 | ${status} |\n`;
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
  
  // Recomendação da semana
  md += `## 💡 Recomendação da Semana\n\n`;
  
  md += `### Ações Prioritárias\n\n`;
  brief.recomendacaoDaSemana.acoes.forEach(acao => {
    md += `- ${acao}\n`;
  });
  md += `\n`;
  
  if (brief.recomendacaoDaSemana.alertas.length > 0) {
    md += `### Alertas\n\n`;
    brief.recomendacaoDaSemana.alertas.forEach(alerta => {
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
