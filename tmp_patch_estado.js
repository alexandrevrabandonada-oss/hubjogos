const fs = require('fs');

const pgPath = 'c:/Projetos/Hub Jogos Pré Camp/app/estado/page.tsx';
let pgContent = fs.readFileSync(pgPath, 'utf8');

if (!pgContent.includes('const bairroResisteRuns')) {
  // 1. Calculate stats after cooperativaDecision
  const targetCalc = 'const cooperativaDecision = resolveCooperativaDecision(cooperativaEffectiveness);';
  const injectCalc = `const cooperativaDecision = resolveCooperativaDecision(cooperativaEffectiveness);

  const bairroResisteRuns = events.filter((e) => e.event === 'arcade_run_end' && e.slug === 'bairro-resiste');
  const bairroMostCriticalHotspots = bairroResisteRuns.map(e => e.metadata?.bairro_worst_hotspot).filter(Boolean);
  const bairroPhaseReached = bairroResisteRuns.map(e => e.metadata?.bairro_phase_reached as number).filter(Boolean);
  const bairroMostUsedAction = bairroResisteRuns.map(e => e.metadata?.bairro_most_used_action).filter(Boolean);

  const getMode = (arr) => arr.length ? arr.reduce((a,b,i,arr)=>
     (arr.filter(v=>v===a).length>=arr.filter(v=>v===b).length?a:b),null) : 'N/A';

  const bairroAvgPhase = bairroPhaseReached.length ? Math.round(bairroPhaseReached.reduce((a,b)=>a+b,0)/bairroPhaseReached.length) : 0;
  const bairroWorstHotspotMode = getMode(bairroMostCriticalHotspots);
  const bairroMostUsedActionMode = getMode(bairroMostUsedAction);
  const bairroRunCount = bairroResisteRuns.length;`;
  
  pgContent = pgContent.replace(targetCalc, injectCalc);

  // 2. Inject JSX block for Bairro Resiste 
  const targetJsx = 'title="Insights Cooperativa Na Pressão"';
  
  // Find where Cooperativa Na Pressão section ends. It's a `<Card ...>` inside `<div className={styles.grid2}>` usually.
  // I will just add Bairro Resiste right before `{/* Funil de Sessões */}` or after the container of cooperativa.
  
  const targetFunil = '{/* Funil de Sessões */}';
  const injectJsx = `
      {/* T59: Bairro Resiste Scorecard */}
      <Section
        eyebrow="T58 & T59"
        title="Insights Bairro Resiste"
        description="Medição do Vertical Slice de Defesa Territorial"
      >
        <div className={styles.grid3}>
          <Card>
            <span className="eyebrow">Amostra Local</span>
            <div className={styles.bigNumber}>{bairroRunCount}</div>
            <p className={styles.metricContext}>runs finalizadas</p>
          </Card>
          <Card>
            <span className="eyebrow">Maior Ameaça Geral</span>
            <div className={styles.bigNumber}>{bairroWorstHotspotMode.toString().toUpperCase()}</div>
            <p className={styles.metricContext}>hotspot mais colapsado</p>
          </Card>
          <Card>
            <span className="eyebrow">Sobrevivência</span>
            <div className={styles.bigNumber}>Fase {bairroAvgPhase}</div>
            <p className={styles.metricContext}>fase média de colapso</p>
          </Card>
        </div>
      </Section>

      {/* Funil de Sessões */}`;

  pgContent = pgContent.replace(targetFunil, injectJsx);
  
  fs.writeFileSync(pgPath, pgContent, 'utf8');
}
