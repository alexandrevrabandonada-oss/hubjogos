'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { type Game } from '@/lib/games/catalog';
import { ResultCard } from '../share/ResultCard';
import { useArcadeTelemetry } from '@/lib/games/arcade/useArcadeTelemetry';
import { useArcadeTimer } from '@/lib/games/arcade/useArcadeTimer';
import { ArcadeHUDContainer } from './ArcadeHUDContainer';
import { ArcadeProgressBar } from './ArcadeProgressBar';
import styles from './BairroResisteArcadeGame.module.css';


type HotspotType = 'agua' | 'moradia' | 'mobilidade' | 'saude';
type HotspotState = 'normal' | 'warning' | 'critical';

const SECTOR_LABELS: Record<HotspotType, string> = {
  agua: 'Água',
  moradia: 'Moradia',
  mobilidade: 'Transit',
  saude: 'Saúde',
};

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
  const [flashingHotspot, setFlashingHotspot] = useState<HotspotType | null>(null);
  
  // Ref for the latest state to be used in outcome without closure traps
  const stateRef = useRef({ integrity, hotspots, score, actionStats });
  stateRef.current = { integrity, hotspots, score, actionStats };

  const { trackStart, trackEnd, trackReplay } = useArcadeTelemetry(game);

  const getPhase = (timeMs: number) => {
    if (timeMs < 30000) return 1;
    if (timeMs < 60000) return 2;
    return 3;
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
          const newCooldown = Math.max(0, h.cooldownMs - TICK_RATE_MS);
          
          let pressureIncrease = 0;
          if (currentPhase === 1) pressureIncrease = Math.random() * 3;
          if (currentPhase === 2) pressureIncrease = 1 + Math.random() * 5;
          if (currentPhase === 3) pressureIncrease = 2 + Math.random() * 4;
          
          if (currentPhase >= 2 && Math.random() < 0.05) {
             pressureIncrease += 15;
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
        
        if (activeCriticalCount > 0) {
          const damage = activeCriticalCount * 2;
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
    setFlashingHotspot(null);
    resetTimer(0);
    startTimer();
  }, [trackStart, startTimer, resetTimer]);

  const handleGameOver = useCallback((finalHotspots: Hotspot[], finalIntegrity: number, finalTime: number) => {
    stopTimer();
    setGameState('outcome');
    
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
    if (h.cooldownMs > 0) return;
    
    setActionStats(prev => ({ ...prev, [h.id]: prev[h.id] + 1 }));
    
    // Trigger hit flash
    setFlashingHotspot(h.id);
    setTimeout(() => setFlashingHotspot(null), 350);
    
    setHotspots(prev => prev.map(item => {
      if (item.id === h.id) {
        return { 
          ...item, 
          pressure: Math.max(0, item.pressure - 35), 
          cooldownMs: 1500
        };
      }
      return item;
    }));
    
    setScore(s => s + (h.pressure >= 80 ? 50 : 20));
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

  const getWorstHotspot = () => {
    let worst = hotspots[0];
    for (const h of hotspots) {
      if (h.totalCriticalTime > worst.totalCriticalTime) worst = h;
    }
    return worst;
  };

  // ─── INTRO SCREEN ─────────────────────────────────────────────────────────
  if (gameState === 'intro') {
    return (
      <div className={styles.introCard}>
        <div className={styles.introHeader}>
          <span className={styles.introEyebrow}>Arcade de Defesa Territorial</span>
          <h2 className={styles.introTitle}>Bairro Resiste</h2>
          <p className={styles.introDesc}>
            A pressão cresce em 3 fases. Clique nos pontos críticos para defender o bairro.
            Se a integridade chegar a zero — o bairro colapsa.
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <strong>⚡ 3 Fases</strong>
            <p>Sondagem → Aceleração → Caos. Cada fase aumenta a pressão territorial.</p>
          </div>
          <div className={styles.feature}>
            <strong>🎯 4 Setores</strong>
            <p>Água, Moradia, Mobilidade e Saúde. Todos precisam de atenção.</p>
          </div>
          <div className={styles.feature}>
            <strong>🔴 Zona Crítica</strong>
            <p>Pontos vermelhos drenam a integridade global. Priorize-os!</p>
          </div>
          <div className={styles.feature}>
            <strong>⏱ Cooldown 1.5s</strong>
            <p>Cada ação tem cooldown. Escolha com sabedoria onde agir.</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={startGame} className={styles.playButton}>
            Defender o Bairro
          </button>
          <Link href="/explorar" className={styles.linkGhost}>
            ← Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  // ─── GAME BOARD ───────────────────────────────────────────────────────────
  if (gameState === 'playing') {
    return (
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
            const isFlashing = flashingHotspot === h.id;
            
            return (
              <div 
                key={h.id}
                className={`${styles.hotspot} ${stateClass} ${isOnCooldown ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${isFlashing ? styles.hitFlash : ''}`}
                style={{ left: `${h.x}%`, top: `${h.y}%`, backgroundImage: `url('${h.assetBase}')` }}
                onClick={() => handleHotspotClick(h)}
              >
                {/* Pressure bar */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16">
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div 
                         className={`h-full ${styles.smoothBar} ${state === 'critical' ? 'bg-red-500' : state === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} 
                         style={{ width: `${h.pressure}%` }}
                      />
                   </div>
                </div>

                {/* Sector label */}
                <span className={styles.sectorLabel}>{SECTOR_LABELS[h.id]}</span>

                {/* Cooldown spinner */}
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
    );
  }

  // ─── OUTCOME SCREEN ───────────────────────────────────────────────────────
  const survived = integrity > 0;
  const worstHotspot = getWorstHotspot();

  return (
    <div className={styles.container}>
      <div className={styles.resultCard}>
        {/* Title */}
        <p className={`${styles.resultOutcome} ${survived ? styles.survived : styles.collapsed}`}>
          {survived ? '🏘️ Bairro Resistiu!' : '💥 Colapso do Bairro'}
        </p>
        <p className={styles.resultSummary}>
          {survived
            ? `Você defendeu o território com ${integrity}% de integridade restante.`
            : `O bairro colapsou na Fase ${phaseReached} sob pressão territorial.`}
        </p>

        {/* Stats */}
        <div className={styles.resultStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{score}</span>
            <span className={styles.statLabel}>Score</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{phaseReached}</span>
            <span className={styles.statLabel}>Fase</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{integrity}%</span>
            <span className={styles.statLabel}>Integridade</span>
          </div>
        </div>

        {/* Worst sector */}
        {worstHotspot.totalCriticalTime > 0 && (
          <div className={styles.threatLine}>
            <div className={styles.threatDot} />
            Setor crítico: {SECTOR_LABELS[worstHotspot.id]} ({Math.floor(worstHotspot.totalCriticalTime / 1000)}s na zona vermelha)
          </div>
        )}

        {/* ResultCard for share */}
        <ResultCard
          gameSlug={game.slug}
          resultTitle={survived ? 'Bairro Resistiu!' : 'Colapso do Bairro'}
          resultId={Date.now().toString()}
          summary={survived
            ? `Integridade: ${integrity}% | Score: ${score} | Fase máxima: ${phaseReached}`
            : `Colapso na Fase ${phaseReached} | Setor mais crítico: ${SECTOR_LABELS[worstHotspot.id]}`}
        />

        <div className={styles.actions} style={{ marginTop: '1.25rem' }}>
          <button onClick={handleReplay} className={styles.playButton}>
            {survived ? 'Tentar Novamente' : 'Resistir de Novo'}
          </button>
          <Link href="/explorar" className={styles.linkGhost}>
            ← Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
