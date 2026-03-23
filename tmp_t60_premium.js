const fs = require('fs');
const catalogPath = 'c:/Projetos/Hub Jogos Pré Camp/lib/games/catalog.ts';
let catalog = fs.readFileSync(catalogPath, 'utf8');

const bairroResisteEntry = `  {
    id: 'bairro-resiste',
    slug: 'bairro-resiste',
    title: 'Bairro Resiste - Defesa Territorial',
    description: 'Arcade hardcore de gestão de crise territorial. Administre o cooldown das brigadas, evite falhas em cascata de infraestrutura e segure a pressão sistêmica. O colapso de uma área puxa as demais.',
    shortDescription: 'Defenda a integridade do bairro em uma gestão de crise extrema',
    theme: 'city',
    icon: '🏘️',
    cover: '/arcade/bairro-resiste/bg/bg-bairro-base-v1.svg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'hard',
    tags: ['arcade', 'defesa territorial', 'crise', 'resistência', 'coletividade'],
    cta: 'Resistir',
    color: '#0f172a',
    kind: 'arcade',
    engineId: 'bairro-resiste-v1',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'baixada',
    series: 'serie-rio-de-janeiro',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'ajuda-mutua',
    commonVsMarket: 'comum',
    campaignFrame: 'defesa-dos-comuns',
    visualVersion: 'T60-premium-v1',
    assetSet: 'bairro-resiste-premium',
    premiumTheme: 'bairro-resiste-premium',
    season: 's1-verao-26',
    campaignRole: 'Conectar defesa territorial com risco eminente e solidariedade.',
    funRole: 'retencao',
  },`;

// Add to games array
if (!catalog.includes("slug: 'bairro-resiste'") || catalog.indexOf("slug: 'bairro-resiste'") > catalog.indexOf('plannedGameCandidates')) {
   catalog = catalog.replace('export const games: Game[] = [', 'export const games: Game[] = [\n' + bairroResisteEntry);
   
   // Remove from planned candidates
   catalog = catalog.replace(/\{\s*slug:\s*'bairro-resiste',[\s\S]*?\},/g, '');
   fs.writeFileSync(catalogPath, catalog, 'utf8');
}

const cssPath = 'c:/Projetos/Hub Jogos Pré Camp/components/games/arcade/BairroResisteArcadeGame.module.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Upgrade Critical and Warning animations
css = css.replace(/.hotspotCritical\s*\{[\s\S]*?\}/, `.hotspotCritical {
  filter: drop-shadow(0 0 25px rgba(220, 38, 38, 1));
  animation: pulseCriticalPremium 0.6s infinite cubic-bezier(0.25, 1, 0.5, 1);
}`);

css = css.replace(/.hotspotWarning\s*\{[\s\S]*?\}/, `.hotspotWarning {
  filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.9));
  animation: pulseWarningPremium 1.2s infinite ease-in-out;
}`);

css += `
@keyframes pulseCriticalPremium {
  0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  25% { transform: translate(-50%, -50%) scale(1.15) rotate(-1deg); filter: drop-shadow(0 0 40px rgba(220, 38, 38, 1)); }
  75% { transform: translate(-50%, -50%) scale(1.15) rotate(1deg); }
  100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
}

@keyframes pulseWarningPremium {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
  50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; filter: drop-shadow(0 0 25px rgba(234, 179, 8, 1)); }
}
`;

// Upgrade Danger Overlay
css = css.replace(/.dangerOverlay\s*\{[\s\S]*?\}/, `.dangerOverlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 150px rgba(220, 38, 38, 0.6);
  background: radial-gradient(transparent 50%, rgba(150, 0, 0, 0.3) 100%);
  animation: pulseDangerPremium 1s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}`);

css += `
@keyframes pulseDangerPremium {
  from { opacity: 0.4; backdrop-filter: saturate(1.2); }
  to { opacity: 0.95; backdrop-filter: saturate(1.5) contrast(1.1); }
}
`;

fs.writeFileSync(cssPath, css, 'utf8');


const tsxPath = 'c:/Projetos/Hub Jogos Pré Camp/components/games/arcade/BairroResisteArcadeGame.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf8');

// Insert sub-outcome HTML under ResultCard
const targetOutcome = `<ResultCard
            gameSlug={gameInfo.slug}
            resultTitle={integrity > 0 ? "Bairro Resistiu!" : "Colapso do Bairro"}
            resultId={Date.now().toString()}
            summary={getOutcomeSummary()}
          />`;

const replaceOutcome = `<ResultCard
            gameSlug={gameInfo.slug}
            resultTitle={integrity > 0 ? "Bairro Resistiu!" : "Colapso do Bairro"}
            resultId={Date.now().toString()}
            summary={getOutcomeSummary()}
          />
          <div className="mt-8 bg-slate-900/90 border border-slate-700 rounded-xl p-6 w-full max-w-sm mx-auto flex flex-col items-center shadow-2xl backdrop-blur-sm">
            <span className="text-xs tracking-[0.2em] text-slate-400 uppercase font-semibold mb-1">Diagnóstico Final</span>
            <div className="text-2xl font-black text-white mb-4 text-center">
               <span className="opacity-50 text-xl font-normal">Sobreviveu até: </span>
               Fase {phaseReached}
            </div>
            
            <div className="w-full h-px bg-slate-800 mb-4" />
            
            <span className="text-xs tracking-[0.2em] text-red-500/80 uppercase font-bold mb-1">Maior Ameaça Local</span>
            <div className="flex items-center space-x-2">
               <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
               <span className="text-xl font-black text-red-400 capitalize">{(() => {
                  let w = hotspots[0];
                  for(const h of hotspots) if (h.totalCriticalTime > w.totalCriticalTime) w = h;
                  return w.id;
               })()}</span>
            </div>
          </div>`;

if(tsx.includes('<ResultCard')) {
  // It uses `gameInfo.slug`? Wait, I changed it to `game.slug` in previous steps!
  // Let's just do a generic replace.
  tsx = tsx.replace(/<ResultCard[\s\S]*?\/>/, replaceOutcome.replace('gameInfo.slug','game.slug'));
}

fs.writeFileSync(tsxPath, tsx, 'utf8');
