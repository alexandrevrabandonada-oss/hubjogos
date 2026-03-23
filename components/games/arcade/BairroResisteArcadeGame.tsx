'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { type Game } from '@/lib/games/catalog';
import { ResultCard } from '../share/ResultCard';
import { useArcadeTelemetry } from '@/lib/games/arcade/useArcadeTelemetry';
import { useArcadeTimer } from '@/lib/games/arcade/useArcadeTimer';
import { ArcadeHUDContainer } from './ArcadeHUDContainer';
import { ArcadeProgressBar } from './ArcadeProgressBar';
import styles from './BairroResisteArcadeGame.module.css';


type HotspotType = 'agua' | 'moradia' | 'mobilidade' | 'saude';
type HotspotState = 'normal' | 'warning' | 'critical';

interface Hotspot {
  id: HotspotType;
  x: number;
  y: number;
  pressure: number;
  cooldownMs: number;
  totalCriticalTime: number;
  assetBase: string;
}

const INITIAL_HOTSPOTS: Hotspot[] = [
  { id: 'agua', x: 25, y: 35, pressure: 0, cooldownMs: 0, totalCriticalTime: 0, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-agua-v1.svg' },
  { id: 'moradia', x: 70, y: 40, pressure: 20, cooldownMs: 0, totalCriticalTime: 0, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-moradia-v1.svg' },
  { id: 'mobilidade', x: 80, y: 75, pressure: 0, cooldownMs: 0, totalCriticalTime: 0, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-mobilidade-v1.svg' },
  { id: 'saude', x: 30, y: 80, pressure: 0, cooldownMs: 0, totalCriticalTime: 0, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-saude-v1.svg' },
];

const GAME_DURATION_MS = 90000;
const TICK_RATE_MS = 1000;

export const getBairroPhase = (timeMs: number) => {
  if (timeMs < 30000) return 1; // Sondagem
  if (timeMs < 60000) return 2; // Aceleração
  return 3; // Caos
};

export function BairroResisteArcadeGame({ game }: { game: Game }) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'outcome'>('intro');
  const [integrity, setIntegrity] = useState(100);
  const [hotspots, setHotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);
  const [score, setScore] = useState(0);
  const [phaseReached, setPhaseReached] = useState<number>(1);
  const [actionStats, setActionStats] = useState<Record<HotspotType, number>>({ agua: 0, moradia: 0, mobilidade: 0, saude: 0 });
  
  // Ref for the latest state to be used in outcome without closure traps
  const stateRef = useRef({ integrity, hotspots, score, actionStats });
  stateRef.current = { integrity, hotspots, score, actionStats };

  const { trackStart, trackEnd, trackReplay } = useArcadeTelemetry(game);

  const getPhase = (timeMs: number) => {
    if (timeMs < 30000) return 1; // Sondagem
    if (timeMs < 60000) return 2; // Aceleração
    return 3; // Caos
  };

  const { ms: timeMs, start: startTimer, pause: stopTimer, reset: resetTimer } = useArcadeTimer(
    0,
    'countup',
    (currentTimeMs) => {
      const currentPhase = getPhase(currentTimeMs);
      if (currentPhase !== phaseReached) {
        setPhaseReached(currentPhase);
      }

      setHotspots(prev => {
        let activeCriticalCount = 0;
        
        const nextHotspots = prev.map(h => {
          // Decrement Cooldown
          const newCooldown = Math.max(0, h.cooldownMs - TICK_RATE_MS);
          
          // Escalada de pressão baseada na fase
          let pressureIncrease = 0;
          if (currentPhase === 1) pressureIncrease = Math.random() * 3; // 0 a 3 por seg
          if (currentPhase === 2) pressureIncrease = 1 + Math.random() * 5; // 1 a 6 por seg
          if (currentPhase === 3) pressureIncrease = 2 + Math.random() * 4; // 2 a 6 por seg
          
          // Evento de crise (burst estocástico de pressão em F2 e F3)
          if (currentPhase >= 2 && Math.random() < 0.05) {
             pressureIncrease += 15; // burst de 15 de pressão súbita
          }
          
          const factor = h.id === 'saude' ? 0.9 : 1.0;
          const newPressure = Math.min(100, h.pressure + (pressureIncrease * factor));
          const isCritical = newPressure >= 80;
          
          if (isCritical) activeCriticalCount++;
          
          return { 
            ...h, 
            pressure: newPressure, 
            cooldownMs: newCooldown,
            totalCriticalTime: isCritical ? h.totalCriticalTime + TICK_RATE_MS : h.totalCriticalTime
          };
        });
        
        // Se houver hotspots críticos, a integridade global é queimada
        if (activeCriticalCount > 0) {
          const damage = activeCriticalCount * 2; // 2% por hotspot crítico
          setIntegrity(int => {
             const newInt = Math.max(0, int - damage);
             if (newInt === 0) {
                 handleGameOver(nextHotspots, 0, currentTimeMs);
             }
             return newInt;
          });
        }
        
        return nextHotspots;
      });
      
      if (currentTimeMs >= GAME_DURATION_MS && stateRef.current.integrity > 0) {
        handleGameOver(stateRef.current.hotspots, stateRef.current.integrity, currentTimeMs);
      }
    },
    TICK_RATE_MS
  );

  const startGame = useCallback(() => {
    trackStart(Date.now().toString());
    setGameState('playing');
    setIntegrity(100);
    setScore(0);
    setPhaseReached(1);
    setHotspots(INITIAL_HOTSPOTS);
    setActionStats({ agua: 0, moradia: 0, mobilidade: 0, saude: 0 });
    resetTimer(0);
    startTimer();
  }, [trackStart, startTimer, resetTimer]);

  const handleGameOver = useCallback((finalHotspots: Hotspot[], finalIntegrity: number, finalTime: number) => {
    stopTimer();
    setGameState('outcome');
    
    // Calcular o hotspot mais sofrido
    let worstHotspot = finalHotspots[0];
    for (const h of finalHotspots) {
       if (h.totalCriticalTime > worstHotspot.totalCriticalTime) {
          worstHotspot = h;
       }
    }
    
    void trackEnd({
      runId: Date.now().toString(),
      score: stateRef.current.score,
      durationMs: finalTime,
      completionRate: finalIntegrity / 100,
      reason: finalIntegrity <= 0 ? 'failure' : 'timeout',
      bairro_phase_reached: getPhase(finalTime),
      bairro_worst_hotspot: worstHotspot.id,
      bairro_most_used_action: Object.keys(stateRef.current.actionStats).reduce((a, b) => stateRef.current.actionStats[a as HotspotType] > stateRef.current.actionStats[b as HotspotType] ? a : b)
    });
  }, [stopTimer, trackEnd]);

  const handleReplay = useCallback(() => {
    trackReplay();
    startGame();
  }, [trackReplay, startGame]);

  const handleHotspotClick = (h: Hotspot) => {
    if (gameState !== 'playing') return;
    if (h.cooldownMs > 0) return; // bloqueado por cooldown
    
    setActionStats(prev => ({ ...prev, [h.id]: prev[h.id] + 1 }));
    
    setHotspots(prev => prev.map(item => {
      if (item.id === h.id) {
        return { 
          ...item, 
          pressure: Math.max(0, item.pressure - 35), 
          cooldownMs: 1500 // 1.5s de cooldown para esse hotspot
        };
      }
      return item;
    }));
    
    setScore(s => s + (h.pressure >= 80 ? 50 : 20)); // Bônus por salvar no crítico
  };

  const getHotspotState = (pressure: number): HotspotState => {
    if (pressure >= 80) return 'critical';
    if (pressure >= 50) return 'warning';
    return 'normal';
  };

  const formattedTime = useMemo(() => {
    const remaining = Math.max(0, Math.floor((GAME_DURATION_MS - timeMs) / 1000));
    return `0:${remaining.toString().padStart(2, '0')}`;
  }, [timeMs]);
  
  const getIntegrityState = () => {
    if (integrity > 60) return 'safe';
    if (integrity > 25) return 'warning';
    return 'critical';
  };

  const getOutcomeSummary = () => {
     let worstHotspot = hotspots[0];
     for (const h of hotspots) {
        if (h.totalCriticalTime > worstHotspot.totalCriticalTime) {
           worstHotspot = h;
        }
     }
     
     if (integrity <= 0) {
        return `Colapso na Fase ${phaseReached} | Setor Crítico: ${worstHotspot.id.toUpperCase()} (Ficou ${worstHotspot.totalCriticalTime / 1000}s na zona vermelha)`;
     } else {
        return `Resistência Completa! Integridade: ${integrity}% | Ameaça Maior: ${worstHotspot.id.toUpperCase()}`;
     }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{game.title} | Jogos Pela Cidade</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      {gameState === 'intro' && (
        <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center text-slate-100 p-6 text-center">
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-blue-400">{game.title}</h1>
          <p className="text-xl max-w-lg mb-8 text-slate-300">{game.description}</p>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-sm w-full mb-8">
            <h3 className="font-bold mb-2 text-slate-200">Como jogar:</h3>
            <ul className="text-left text-sm text-slate-400 space-y-2">
              <li>1. A pressão territorial crescerá em 3 fases (Aceleração e Caos).</li>
              <li>2. Toque nos pontos Críticos (Vermelhos) para curar. Há um <strong>cooldown de 1.5s</strong> por ação!</li>
              <li>3. Hotspots no Crítico deterioram ativamente a sua Integridade Global.</li>
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
          topLeft={
            <div className="flex bg-slate-900/80 p-2 rounded-xl border border-slate-700 w-48 shadow-lg">
              <ArcadeProgressBar value={integrity} max={100} colorState={getIntegrityState()} label="INTEGRIDADE" />
            </div>
          }
          topRight={
            <div className="flex flex-col items-end bg-slate-900/80 p-2 rounded-xl border border-slate-700 shadow-lg px-4">
              <div className="text-white font-mono font-bold text-2xl">
                 {formattedTime}
                 {phaseReached >= 2 && <span className={`text-xs ml-2 uppercase ${phaseReached === 3 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>Fase {phaseReached}</span>}
              </div>
              <div className="text-xs text-slate-400 font-bold tracking-wider mt-1">SCORE: {score.toString().padStart(4, '0')}</div>
            </div>
          }
        >
          <div className={styles.mapBackground}>
            {integrity <= 30 && <div className={styles.dangerOverlay} />}
            {hotspots.map((h) => {
              const state = getHotspotState(h.pressure);
              const stateClass = state === 'critical' ? styles.hotspotCritical : state === 'warning' ? styles.hotspotWarning : styles.hotspotNormal;
              const isOnCooldown = h.cooldownMs > 0;
              
              return (
                <div 
                  key={h.id}
                  className={`${styles.hotspot} ${stateClass} ${isOnCooldown ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  style={{ left: `${h.x}%`, top: `${h.y}%`, backgroundImage: `url('${h.assetBase}')` }}
                  onClick={() => handleHotspotClick(h)}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16">
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div 
                           className={`h-full ${styles.smoothBar} ${state === 'critical' ? 'bg-red-500' : state === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} 
                           style={{ width: `${h.pressure}%` }}
                        />
                     </div>
                  </div>
                  {/* Cooldown feedback overlay */}
                  {isOnCooldown && (
                    <div className="absolute inset-0 rounded-full border-4 border-slate-400 border-t-white animate-spin" />
                  )}
                  {h.cooldownMs > 1000 && (
                    <div className={styles.healingEffect} />
                  )}
                </div>
              );
            })}
            <div className={styles.playerIndicator} />
          </div>
        </ArcadeHUDContainer>
      )}

      {gameState === 'outcome' && (
        <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center p-4 overflow-y-auto">
          <ResultCard
            gameSlug={game.slug}
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
          </div>
          <button 
            onClick={handleReplay}
            className="mt-6 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xl shadow-lg transition-transform active:scale-95"
          >
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
}
