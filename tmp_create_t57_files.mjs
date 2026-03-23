import fs from 'fs';
import path from 'path';

const basePath = 'c:/Projetos/Hub Jogos Pré Camp';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Create Route
const routeDir = path.join(basePath, 'app/arcade/bairro-resiste');
ensureDir(routeDir);

const pageTsxContent = \`import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { catalog } from '@/lib/games';

// Usa SSR=false pois games usam window/requestAnimationFrame/timers intensamente
const BairroResisteGame = dynamic(
  () => import('@/components/games/arcade/BairroResisteArcadeGame'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Bairro Resiste - Hub Pré-Campanha',
  description: 'Coordene a defesa e o cuidado do seu território contra o abandono e o mercado.',
};

export default function BairroResistePage() {
  const gameInfo = catalog.find((g) => g.slug === 'bairro-resiste')!;
  
  return (
    <main className="w-full h-screen bg-neutral-900 overflow-hidden">
      <BairroResisteGame gameInfo={gameInfo} />
    </main>
  );
}
\`;

fs.writeFileSync(path.join(routeDir, 'page.tsx'), pageTsxContent, 'utf8');

// 2. Create Component & CSS
const componentDir = path.join(basePath, 'components/games/arcade');
ensureDir(componentDir);

const cssContent = \`.container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #0f172a; /* Slate 900 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.mapBackground {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16/9;
  background-image: url('/arcade/bairro-resiste/bg/bg-bairro-base-v1.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.hotspot {
  position: absolute;
  width: 64px;
  height: 64px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s ease;
}

.hotspot:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hotspot:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.hotspotNormal {
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));
}

.hotspotWarning {
  filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.8));
  animation: pulseWarning 1.5s infinite;
}

.hotspotCritical {
  filter: drop-shadow(0 0 20px rgba(220, 38, 38, 0.9));
  animation: pulseCritical 0.8s infinite;
}

@keyframes pulseWarning {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes pulseCritical {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.playerIndicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  background-image: url('/arcade/bairro-resiste/player/player-brigada-base-v1.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
}
\`;

fs.writeFileSync(path.join(componentDir, 'BairroResisteArcadeGame.module.css'), cssContent, 'utf8');

const gameTsxContent = \`import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Game } from '@/lib/games';
import { FinalShareCard } from '../share/FinalShareCard';
import { useArcadeTelemetry } from '@/lib/games/arcade/useArcadeTelemetry';
import { useArcadeTimer } from '@/lib/games/arcade/useArcadeTimer';
import ArcadeHUDContainer from './ArcadeHUDContainer';
import ArcadeProgressBar from './ArcadeProgressBar';
import styles from './BairroResisteArcadeGame.module.css';

interface BairroResisteProps {
  gameInfo: Game;
}

type HotspotType = 'agua' | 'moradia' | 'mobilidade' | 'saude';
type HotspotState = 'normal' | 'warning' | 'critical';

interface Hotspot {
  id: HotspotType;
  x: number; // percentage
  y: number; // percentage
  pressure: number; // 0 to 100
  assetBase: string;
}

const INITIAL_HOTSPOTS: Hotspot[] = [
  { id: 'agua', x: 25, y: 35, pressure: 0, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-agua-v1.svg' },
  { id: 'moradia', x: 70, y: 40, pressure: 20, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-moradia-v1.svg' },
  { id: 'mobilidade', x: 80, y: 75, pressure: 0, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-mobilidade-v1.svg' },
  { id: 'saude', x: 30, y: 80, pressure: 10, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-saude-v1.svg' },
];

const GAME_DURATION_MS = 90000; // 90 segundos estruturais

export default function BairroResisteArcadeGame({ gameInfo }: BairroResisteProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'outcome'>('intro');
  const [integrity, setIntegrity] = useState(100);
  const [hotspots, setHotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);
  const [score, setScore] = useState(0);

  const { trackArcadeRunStart, trackArcadeRunEnd, trackCustomArcadeEvent } = useArcadeTelemetry(gameInfo.slug);

  // Shared Module: Arcade Timer
  const { isRunning, timeMs, startTimer, stopTimer, resetTimer } = useArcadeTimer(0, {
    direction: 'up',
    tickMs: 1000,
    onTick: (currentTimeMs) => {
      // Logic Hook structural: Increase pressure over time
      setHotspots(prev => {
        let anyCritical = false;
        const newHotspots = prev.map(h => {
          // Increase pressure random factor
          const increase = Math.random() * 5;
          const newPressure = Math.min(100, h.pressure + increase);
          if (newPressure >= 80) anyCritical = true;
          return { ...h, pressure: newPressure };
        });
        
        // Se houver algum crítico, perde integridade
        if (anyCritical) {
          setIntegrity(int => Math.max(0, int - 2));
        }
        
        return newHotspots;
      });
      
      // End game condition
      if (currentTimeMs >= GAME_DURATION_MS || integrity <= 0) {
        handleGameOver();
      }
    }
  });

  const startGame = useCallback(() => {
    trackArcadeRunStart();
    setGameState('playing');
    setIntegrity(100);
    setScore(0);
    setHotspots(INITIAL_HOTSPOTS);
    resetTimer();
    startTimer();
  }, [trackArcadeRunStart, startTimer, resetTimer]);

  const handleGameOver = useCallback(() => {
    stopTimer();
    setGameState('outcome');
    trackArcadeRunEnd({
      score: score,
      durationMs: timeMs,
      completionRate: integrity / 100,
      reason: integrity <= 0 ? 'failure' : 'timeout'
    } as any);
  }, [stopTimer, trackArcadeRunEnd, score, timeMs, integrity]);

  const handleHotspotClick = (h: Hotspot) => {
    if (gameState !== 'playing') return;
    
    trackCustomArcadeEvent('bairro_action_used', { hotspot: h.id, pressureReleaved: Math.min(h.pressure, 30) });
    
    setHotspots(prev => prev.map(item => {
      if (item.id === h.id) {
        return { ...item, pressure: Math.max(0, item.pressure - 30) }; // Repair action
      }
      return item;
    }));
    
    setScore(s => s + 10); // Reward for action
  };

  const getHotspotState = (pressure: number): HotspotState => {
    if (pressure >= 80) return 'critical';
    if (pressure >= 50) return 'warning';
    return 'normal';
  };

  const formattedTime = useMemo(() => {
    const remaining = Math.max(0, Math.floor((GAME_DURATION_MS - timeMs) / 1000));
    return \`0:\${remaining.toString().padStart(2, '0')}\`;
  }, [timeMs]);
  
  const getIntegrityState = () => {
    if (integrity > 60) return 'safe';
    if (integrity > 25) return 'warning';
    return 'critical';
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{gameInfo.title} | Jogos Pela Cidade</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      {gameState === 'intro' && (
        <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center text-slate-100 p-6 text-center">
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-blue-400">{gameInfo.title}</h1>
          <p className="text-xl max-w-lg mb-8 text-slate-300">{gameInfo.description}</p>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-sm w-full mb-8">
            <h3 className="font-bold mb-2 text-slate-200">Como jogar:</h3>
            <ul className="text-left text-sm text-slate-400 space-y-2">
              <li>1. A pressão do abandono sobe nos Hotspots do bairro.</li>
              <li>2. Toque nos pontos Críticos/Warning para coordenar reparos e abaixar a pressão.</li>
              <li>3. Sobreviva por 90 segundos sem deixar a Integridade do Bairro chegar a zero.</li>
            </ul>
          </div>
          <button 
            onClick={startGame}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xl shadow-lg shadow-blue-900/50 transition-transform active:scale-95"
          >
            Iniciar Mutirão
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <ArcadeHUDContainer 
          gameInfo={gameInfo}
          topBarContent={
            <div className="flex gap-4 items-center justify-between w-full px-2">
              <div className="w-1/3">
                <ArcadeProgressBar 
                  value={integrity} 
                  max={100} 
                  colorState={getIntegrityState()} 
                  label="INTEGRIDADE" 
                />
              </div>
              <div className="text-white font-mono font-bold text-xl bg-slate-900/60 px-4 py-1 rounded-full border border-slate-700">
                {formattedTime}
              </div>
              <div className="w-1/3 text-right">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">SCORE</div>
                <div className="text-xl text-blue-400 font-black">{score.toString().padStart(4, '0')}</div>
              </div>
            </div>
          }
        >
          {/* MAP BASE */}
          <div className={styles.mapBackground}>
            {hotspots.map((h) => {
              const state = getHotspotState(h.pressure);
              const stateClass = state === 'critical' ? styles.hotspotCritical : state === 'warning' ? styles.hotspotWarning : styles.hotspotNormal;
              
              return (
                <div 
                  key={h.id}
                  className={\`\${styles.hotspot} \${stateClass}\`}
                  style={{ left: \`\${h.x}%\`, top: \`\${h.y}%\`, backgroundImage: \`url('\${h.assetBase}')\` }}
                  onClick={() => handleHotspotClick(h)}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16">
                     {/* Mini bar for each hotspot */}
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div 
                           className={\`h-full \${state === 'critical' ? 'bg-red-500' : state === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}\`} 
                           style={{ width: \`\${h.pressure}%\` }}
                        />
                     </div>
                  </div>
                </div>
              );
            })}
            
            <div className={styles.playerIndicator} />
          </div>
        </ArcadeHUDContainer>
      )}

      {gameState === 'outcome' && (
        <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-4">
          <FinalShareCard
            game={gameInfo}
            score={score}
            performance={integrity > 0 ? \`Bairro Resistiu (\${integrity}% Integro)\` : "Colapso do Bairro"}
            ctaLabel="Tentar Novamente"
            onPlayAgain={startGame}
            callToAction="O descaso avança se não houver luta comunitária. Junte-se ao mutirão real!"
          />
        </div>
      )}
    </div>
  );
}
\`;

fs.writeFileSync(path.join(componentDir, 'BairroResisteArcadeGame.tsx'), gameTsxContent, 'utf8');

console.log('T57 logic files generated successfully');
