'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { type Game } from '@/lib/games/catalog';
import { ResultCard } from '../share/ResultCard';
import { useArcadeTelemetry } from '@/lib/games/arcade/useArcadeTelemetry';
import { useArcadeTimer } from '@/lib/games/arcade/useArcadeTimer';
import { ArcadeHUDContainer } from './ArcadeHUDContainer';
import { ArcadeProgressBar } from './ArcadeProgressBar';
import { createArcadeAudioController } from '@/lib/games/arcade/audio/arcade-audio';
import styles from './BairroResisteArcadeGame.module.css';

type HotspotType = 'agua' | 'moradia' | 'mobilidade' | 'saude';
type HotspotState = 'normal' | 'warning' | 'critical';
type SectorGroup = 'vale-cachoeira' | 'morro-povo';

interface BlockIdentity {
  name: string;
  sector: SectorGroup;
  density: number; // 1-10
  infrastructure: ('power' | 'water' | 'comms')[];
}

const SECTOR_LABELS: Record<HotspotType, string> = {
  agua: 'Estação de Tratamento',
  moradia: 'Conjunto Habitacional',
  mobilidade: 'Terminal de Ônibus',
  saude: 'Posto de Saúde',
};

const SECTOR_NEIGHBORHOODS: Record<HotspotType, string> = {
  agua: 'Vale da Cachoeira',
  moradia: 'Morro do Povo',
  mobilidade: 'Morro do Povo',
  saude: 'Vale da Cachoeira',
};

const BLOCK_IDENTITIES: Record<HotspotType, BlockIdentity> = {
  agua: {
    name: 'Estação Norte',
    sector: 'vale-cachoeira',
    density: 3,
    infrastructure: ['power', 'water', 'comms'],
  },
  moradia: {
    name: 'Laje Comunitária',
    sector: 'morro-povo',
    density: 9,
    infrastructure: ['power', 'water'],
  },
  mobilidade: {
    name: 'Terminal Central',
    sector: 'morro-povo',
    density: 5,
    infrastructure: ['power', 'comms'],
  },
  saude: {
    name: 'UBS Vale',
    sector: 'vale-cachoeira',
    density: 4,
    infrastructure: ['power', 'water', 'comms'],
  },
};

const SECTOR_ICONS: Record<HotspotType, string> = {
  agua: '🚰',
  moradia: '🏠',
  mobilidade: '🚌',
  saude: '🏥',
};

const SECTOR_COLORS: Record<HotspotType, string> = {
  agua: '#4bb0ff',
  moradia: '#e0884a',
  mobilidade: '#4a88cc',
  saude: '#44c47a',
};

const HOTSPOT_BRIEFS: Record<HotspotType, { watch: string; response: string; neighborhood: string }> = {
  agua: {
    watch: 'Adutoras estouram, reservatorios perdem pressao e o bairro começa a falhar em cadeia.',
    response: 'Despache a brigada cedo para conter o vazamento antes que a crise avance para os outros sistemas.',
    neighborhood: 'Vale da Cachoeira',
  },
  moradia: {
    watch: 'Blocos habitacionais entram em sobrecarga e puxam o resto do territorio para o limite.',
    response: 'Moradia exige presença constante: alivie a pressão e abra margem para o restante do mapa respirar.',
    neighborhood: 'Morro do Povo',
  },
  mobilidade: {
    watch: 'O corredor trava, ambulancias atrasam e a cidade perde capacidade de resposta.',
    response: 'Estabilize a circulação para manter a brigada chegando a tempo nos setores vizinhos.',
    neighborhood: 'Morro do Povo',
  },
  saude: {
    watch: 'O posto entra em saturação, piscam alarmes e o risco social sobe rápido.',
    response: 'Se a saúde desaba, a janela de recuperação encurta. Reforce antes do colapso crítico.',
    neighborhood: 'Vale da Cachoeira',
  },
};

const HOTSPOT_CONNECTIONS: Array<{ from: HotspotType; to: HotspotType }> = [
  { from: 'agua', to: 'moradia' },
  { from: 'moradia', to: 'mobilidade' },
  { from: 'mobilidade', to: 'saude' },
  { from: 'saude', to: 'agua' },
  { from: 'moradia', to: 'saude' },
];

type CommandFeedTone = 'alert' | 'dispatch' | 'stabilized' | 'phase';

interface CommandFeedItem {
  id: number;
  tone: CommandFeedTone;
  text: string;
}

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
  // moradia starts under initial pressure so first 10s feel urgent
  { id: 'moradia', x: 70, y: 40, pressure: 38, cooldownMs: 0, totalCriticalTime: 0, assetBase: '/arcade/bairro-resiste/entities/entity-hotspot-moradia-v1.svg' },
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
  const PHASE_CONFIG = useMemo(() => [
    null,
    { label: 'Fase 1', title: 'SONDAGEM', color: '' },
    { label: 'Fase 2', title: 'ACELERAÇÃO', color: styles.phaseBannerPhase2 },
    { label: 'Fase 3', title: 'CAOS TOTAL', color: styles.phaseBannerPhase3 },
  ], []);

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'outcome'>('intro');
  const [integrity, setIntegrity] = useState(100);
  const [hotspots, setHotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);
  const [score, setScore] = useState(0);
  const [phaseReached, setPhaseReached] = useState<number>(1);
  const [actionStats, setActionStats] = useState<Record<HotspotType, number>>({ agua: 0, moradia: 0, mobilidade: 0, saude: 0 });
  const [flashingHotspot, setFlashingHotspot] = useState<HotspotType | null>(null);
  const [dispatchPos, setDispatchPos] = useState<{ x: number, y: number } | null>(null);
  const [phaseBanner, setPhaseBanner] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<HotspotType>('moradia');
  const [stabilizedHotspot, setStabilizedHotspot] = useState<HotspotType | null>(null);
  const [commandFeed, setCommandFeed] = useState<CommandFeedItem[]>([
    { id: 1, tone: 'phase', text: 'Central da brigada pronta. Escolha o primeiro setor e segure o bairro.' },
  ]);
  
  const audioRef = useRef<ReturnType<typeof createArcadeAudioController> | null>(null);
  const previousCriticalIdsRef = useRef<HotspotType[]>([]);
  const integrityAlertRef = useRef<'none' | 'warning' | 'critical'>('none');


  const stateRef = useRef({ integrity, hotspots, score, actionStats });
  stateRef.current = { integrity, hotspots, score, actionStats };

  const { trackStart, trackEnd, trackReplay } = useArcadeTelemetry(game);

  const pushCommandFeed = useCallback((tone: CommandFeedTone, text: string) => {
    setCommandFeed((prev) => [{ id: Date.now() + Math.random(), tone, text }, ...prev].slice(0, 4));
  }, []);

  const getPhase = (timeMs: number) => {
    if (timeMs < 30000) return 1;
    if (timeMs < 60000) return 2;
    return 3;
  };

  // Lazy init audio
  const getAudio = () => {
    if (!audioRef.current) {
        audioRef.current = createArcadeAudioController();
    }
    return audioRef.current;
  };

  // Auto-dismiss phase banner + phase sound
  useEffect(() => {
    if (phaseBanner === null) return;
    
    if (phaseBanner > 1) {
        getAudio().play('phase-transition');
        pushCommandFeed('phase', `${PHASE_CONFIG[phaseBanner]?.label}: ${PHASE_CONFIG[phaseBanner]?.title}. A brigada precisa acelerar.`);
    }

    const t = setTimeout(() => setPhaseBanner(null), 2200);
    return () => clearTimeout(t);
  }, [PHASE_CONFIG, phaseBanner, pushCommandFeed]);

  useEffect(() => {
    if (gameState !== 'playing') {
      previousCriticalIdsRef.current = [];
      integrityAlertRef.current = 'none';
      return;
    }

    const currentCriticalIds = hotspots.filter((hotspot) => hotspot.pressure >= 80).map((hotspot) => hotspot.id);
    const previousCriticalIds = previousCriticalIdsRef.current;

    currentCriticalIds
      .filter((id) => !previousCriticalIds.includes(id))
      .forEach((id) => {
        pushCommandFeed('alert', `${SECTOR_LABELS[id]} entrou em colapso iminente.`);
      });

    previousCriticalIds
      .filter((id) => !currentCriticalIds.includes(id))
      .forEach((id) => {
        pushCommandFeed('stabilized', `${SECTOR_LABELS[id]} voltou ao controle da comunidade.`);
      });

    previousCriticalIdsRef.current = currentCriticalIds;
  }, [gameState, hotspots, pushCommandFeed]);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    if (integrity <= 20 && integrityAlertRef.current !== 'critical') {
      integrityAlertRef.current = 'critical';
      pushCommandFeed('alert', 'Controle territorial em risco extremo. O bairro está a segundos do colapso.');
      return;
    }

    if (integrity <= 45 && integrityAlertRef.current === 'none') {
      integrityAlertRef.current = 'warning';
      pushCommandFeed('alert', 'A linha de defesa cedeu. Reorganize a brigada antes da fase final.');
    }
  }, [gameState, integrity, pushCommandFeed]);


  const { ms: timeMs, start: startTimer, pause: stopTimer, reset: resetTimer } = useArcadeTimer(
    0,
    'countup',
    (currentTimeMs) => {
      const currentPhase = getPhase(currentTimeMs);
      if (currentPhase !== phaseReached) {
        setPhaseReached(currentPhase);
        setPhaseBanner(currentPhase);
      }

      setHotspots(prev => {
        let activeCriticalCount = 0;
        
        const nextHotspots = prev.map(h => {
          const newCooldown = Math.max(0, h.cooldownMs - TICK_RATE_MS);
          
          let pressureIncrease = 0;
          if (currentPhase === 1) pressureIncrease = Math.random() * 4;
          if (currentPhase === 2) pressureIncrease = 1.5 + Math.random() * 6;
          if (currentPhase === 3) pressureIncrease = 3 + Math.random() * 5;
          
          if (currentPhase >= 2 && Math.random() < 0.08) {
             pressureIncrease += 18;
          }
          
          const newPressure = Math.min(100, h.pressure + pressureIncrease);
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
          
          // Screen shake on heavy damage or critical buildup
          if (activeCriticalCount >= 2 || (activeCriticalCount >= 1 && Math.random() < 0.3)) {
              setIsShaking(true);
              setTimeout(() => setIsShaking(false), 400);
              getAudio().play('collision-light');
          }

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
    
    const audio = getAudio();
    audio.arm();
    audio.play('resume');

    setGameState('playing');
    setIntegrity(100);
    setScore(0);
    setPhaseReached(1);
    setHotspots(INITIAL_HOTSPOTS);
    setActionStats({ agua: 0, moradia: 0, mobilidade: 0, saude: 0 });
    setFlashingHotspot(null);
    setDispatchPos(null);
    setPhaseBanner(null);
    setIsShaking(false);
    setSelectedHotspotId('moradia');
    setStabilizedHotspot(null);
    setCommandFeed([{ id: Date.now(), tone: 'phase', text: 'Brigada posicionada. Moradia abre a crise e o resto do bairro vem junto.' }]);
    previousCriticalIdsRef.current = [];
    integrityAlertRef.current = 'none';
    resetTimer(0);
    startTimer();
  }, [trackStart, startTimer, resetTimer]);


  const handleGameOver = useCallback((finalHotspots: Hotspot[], finalIntegrity: number, finalTime: number) => {
    stopTimer();
    setGameState('outcome');
    
    const audio = getAudio();
    if (finalIntegrity <= 0) {
        audio.play('collision-heavy');
        audio.play('special-event');
    } else {
        audio.play('run-end');
    }

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
    setSelectedHotspotId(h.id);

    if (gameState !== 'playing') return;
    if (h.cooldownMs > 0) {
        pushCommandFeed('alert', `${SECTOR_LABELS[h.id]} ainda está em reorganização. Aguarde a brigada completar o ciclo.`);
        getAudio().play('pause');
        return;
    }
    
    setActionStats(prev => ({ ...prev, [h.id]: prev[h.id] + 1 }));
    setFlashingHotspot(h.id);
    setStabilizedHotspot(h.id);
    setDispatchPos({ x: h.x, y: h.y });
    pushCommandFeed('dispatch', `Brigada despachada para ${SECTOR_LABELS[h.id]}. ${HOTSPOT_BRIEFS[h.id].response}`);
    
    getAudio().play('move');
    if (h.pressure >= 80) {
        getAudio().play('powerup');
    }

    setTimeout(() => {
      setFlashingHotspot(null);
      setDispatchPos(null);
      setStabilizedHotspot(null);
    }, 650);
    setTimeout(() => {
      pushCommandFeed('stabilized', `${SECTOR_LABELS[h.id]} recebeu reforço comunitário e abriu nova janela de respiro.`);
    }, 320);
    
    setHotspots(prev => prev.map(item => {
      if (item.id === h.id) {
        return { 
          ...item, 
          pressure: Math.max(0, item.pressure - 40), 
          cooldownMs: 1200
        };
      }
      return item;
    }));
    
    setScore(s => s + (h.pressure >= 80 ? 75 : 25));
  };


  const getHotspotState = (pressure: number): HotspotState => {
    if (pressure >= 80) return 'critical';
    if (pressure >= 50) return 'warning';
    return 'normal';
  };

  // Countdown from 90s
  const formattedTime = useMemo(() => {
    const remaining = Math.max(0, Math.floor((GAME_DURATION_MS - timeMs) / 1000));
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [timeMs]);

  const phaseLabel = ['', 'SONDAGEM', 'ACELERAÇÃO', 'CAOS'][phaseReached];
  const averagePressure = useMemo(
    () => hotspots.reduce((sum, hotspot) => sum + hotspot.pressure, 0) / hotspots.length,
    [hotspots]
  );
  const criticalCount = hotspots.filter((hotspot) => hotspot.pressure >= 80).length;
  const activeHotspot = hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? hotspots[0];
  const relatedHotspots = HOTSPOT_CONNECTIONS
    .filter((connection) => connection.from === activeHotspot.id || connection.to === activeHotspot.id)
    .map((connection) => connection.from === activeHotspot.id ? connection.to : connection.from);

  const territoryHeadline =
    integrity > 70 && averagePressure < 45
      ? 'Linhas comunitárias de pé'
      : integrity > 35
        ? 'Território sob pressão aberta'
        : 'Colapso avançando pelo bairro';

  const territorySummary =
    criticalCount === 0
      ? 'Sem setores em colapso crítico. A brigada pode escolher melhor onde antecipar a próxima quebra.'
      : `${criticalCount} setor${criticalCount > 1 ? 'es' : ''} em risco máximo. Cada clique precisa cortar a cascata antes que ela chegue ao próximo sistema.`;

  // ─── RENDERING ─────────────────────────────────────────────────

  if (gameState === 'intro') {
    return (
      <div className={styles.container}>
        <div className={styles.introCard}>
          <div className={styles.introHeader}>
            <span className={styles.introEyebrow}>Comando Territorial</span>
            <h2 className={styles.introTitle}>Bairro Resiste</h2>
            <p className={styles.introDesc}>
              O bairro está sob pressão. Como brigadista, sua missão é defender os sistemas vitais da comunidade — Água, Moradia, Saúde e Mobilidade — contra o colapso em cadeia.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <strong>🏙️ Território Vivo</strong>
              <p>Monitore 4 sistemas críticos simultaneamente. Cada segundo conta.</p>
            </div>
            <div className={styles.feature}>
              <strong>🚨 Alerta Vermelho</strong>
              <p>Setores críticos drenam o controle territorial rapidamente.</p>
            </div>
            <div className={styles.feature}>
              <strong>⚡ 3 Fases de Crise</strong>
              <p>A pressão escala: Sondagem → Aceleração → Caos Total.</p>
            </div>
            <div className={styles.feature}>
              <strong>🏘️ Defesa Coletiva</strong>
              <p>Sobreviva 90 segundos. O bairro depende da sua brigada.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <button onClick={startGame} className={styles.playButton}>
              Iniciar Defesa
            </button>
            <Link href="/explorar" className={styles.linkGhost}>
              ← Voltar ao catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <ArcadeHUDContainer
        topLeft={
          <div className="flex bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 w-56 shadow-2xl backdrop-blur-md">
            <ArcadeProgressBar
              value={integrity}
              max={100}
              colorState={integrity > 60 ? 'safe' : integrity > 25 ? 'warning' : 'critical'}
              label="CONTROLE TERRITORIAL"
            />
          </div>
        }
        topRight={
          <div className="flex flex-col items-end bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 shadow-2xl backdrop-blur-md px-5">
            <div className="text-white font-mono font-black text-3xl tracking-tighter tabular-nums">
              {formattedTime}
            </div>
            <div className="flex gap-2 mt-1 items-center">
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest ${
                phaseReached === 3 ? 'bg-red-600 animate-pulse text-white' :
                phaseReached === 2 ? 'bg-amber-600 text-white' :
                'bg-slate-700 text-slate-300'
              }`}>
                {phaseLabel}
              </span>
              <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">
                DF {score.toString().padStart(4, '0')}
              </span>
            </div>
          </div>
        }
      >
        <div className={`${styles.mapBackground} ${isShaking ? styles.screenShake : ''} ${integrity <= 35 ? styles.tensionBorder : ''} ${averagePressure >= 65 ? styles.mapUnderSiege : averagePressure >= 40 ? styles.mapEscalating : styles.mapHolding}`}>
          {/* Ambient World Layers */}
          <div className={styles.ambientCityLights} />
          <div className={styles.atmosphereFog} />
          <div className={styles.communitySignals}>
            <span className={styles.communitySignal} style={{ left: '17%', top: '18%' }} />
            <span className={styles.communitySignal} style={{ left: '34%', top: '62%' }} />
            <span className={styles.communitySignal} style={{ left: '53%', top: '24%' }} />
            <span className={styles.communitySignal} style={{ left: '74%', top: '28%' }} />
            <span className={styles.communitySignal} style={{ left: '82%', top: '66%' }} />
            <span className={styles.communitySignal} style={{ left: '45%', top: '82%' }} />
          </div>
          
          {/* CRT Glitch on critical integrity */}
          {integrity <= 20 && <div className={styles.interferenceGlitch} />}

          {/* Low integrity red danger overlay */}
          {integrity <= 35 && <div className={styles.dangerOverlay} />}

          {/* Phase transition banner */}
          {phaseBanner !== null && phaseBanner > 1 && (
            <div className={styles.phaseBanner}>
              <div className={styles.phaseBannerPhase}>
                {PHASE_CONFIG[phaseBanner]?.label}
              </div>
              <div className={`${styles.phaseBannerTitle} ${PHASE_CONFIG[phaseBanner]?.color ?? ''}`}>
                {PHASE_CONFIG[phaseBanner]?.title}
              </div>
            </div>
          )}

          <div className={styles.boardIntel}>
            <span className={styles.boardIntelLabel}>Território Vivo</span>
            <strong className={styles.boardIntelTitle}>{territoryHeadline}</strong>
            <p className={styles.boardIntelText}>{territorySummary}</p>
            <div className={styles.boardIntelMeta}>
              <span>{criticalCount} crítico{criticalCount === 1 ? '' : 's'}</span>
              <span>{Math.round(averagePressure)}% pressão média</span>
              <span>{integrity}% controle</span>
            </div>
          </div>

          <div className={styles.focusPanel}>
            <div className={styles.focusPanelHeader}>
              <span className={styles.focusPanelEyebrow}>Setor em foco</span>
              <span className={`${styles.focusStateBadge} ${activeHotspot.pressure >= 80 ? styles.focusStateCritical : activeHotspot.pressure >= 50 ? styles.focusStateWarning : styles.focusStateStable}`}>
                {activeHotspot.pressure >= 80 ? 'Crítico' : activeHotspot.pressure >= 50 ? 'Sob pressão' : 'Estável'}
              </span>
            </div>
            <div className={styles.focusPanelTitleRow}>
              <strong>{SECTOR_ICONS[activeHotspot.id]} {SECTOR_LABELS[activeHotspot.id]}</strong>
              <span>{Math.round(activeHotspot.pressure)}%</span>
            </div>
            <p className={styles.focusPanelText}>{HOTSPOT_BRIEFS[activeHotspot.id].watch}</p>
            <div className={styles.focusSupportRow}>
              {relatedHotspots.map((hotspotId) => (
                <span key={hotspotId} className={styles.focusSupportChip}>
                  {SECTOR_ICONS[hotspotId]} {SECTOR_LABELS[hotspotId]}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.commandFeed}>
            <span className={styles.commandFeedLabel}>Rádio da Brigada</span>
            {commandFeed.slice(0, 3).map((item) => (
              <div key={item.id} className={`${styles.commandFeedItem} ${styles[`commandFeed${item.tone.charAt(0).toUpperCase() + item.tone.slice(1)}`]}`}>
                {item.text}
              </div>
            ))}
          </div>

          {/* Contagion / Pressure Spread Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
            {HOTSPOT_CONNECTIONS.map((connection) => {
              const fromHotspot = hotspots.find((hotspot) => hotspot.id === connection.from);
              const toHotspot = hotspots.find((hotspot) => hotspot.id === connection.to);

              if (!fromHotspot || !toHotspot) {
                return null;
              }

              const stressed = fromHotspot.pressure >= 70 || toHotspot.pressure >= 70;
              const focused = activeHotspot.id === connection.from || activeHotspot.id === connection.to;

              return (
                <line
                  key={`${connection.from}-${connection.to}`}
                  x1={`${fromHotspot.x}%`}
                  y1={`${fromHotspot.y}%`}
                  x2={`${toHotspot.x}%`}
                  y2={`${toHotspot.y}%`}
                  stroke={stressed ? '#ef4444' : SECTOR_COLORS[connection.from]}
                  strokeWidth={focused ? '2.2' : '1.4'}
                  strokeDasharray={focused ? '6 5' : '4 4'}
                  className={`${styles.contagionLine} ${stressed ? styles.contagionLineCritical : ''} ${focused ? styles.contagionLineFocused : ''}`}
                />
              );
            })}
          </svg>

          {/* Dispatch Line Animation */}
          {dispatchPos && (
            <>
              <div
                className={styles.dispatchLine}
                style={{
                  left: '50%',
                  bottom: '52px',
                  width: `${Math.hypot(dispatchPos.x - 50, (100 - dispatchPos.y) - 10) * 1.1}%`,
                  transform: `rotate(${Math.atan2((100 - dispatchPos.y) - 10, dispatchPos.x - 50) * 180 / Math.PI}deg)`
                }}
              />
              <div 
                className={styles.impactShockwave} 
                style={{ left: `${dispatchPos.x}%`, top: `${dispatchPos.y}%` }} 
              />
              <div
                className={styles.brigadeEcho}
                style={{ left: `${dispatchPos.x}%`, top: `${dispatchPos.y}%` }}
              />
            </>
          )}

          {hotspots.map((h) => {
            const state = getHotspotState(h.pressure);
            const isFlashing = flashingHotspot === h.id;
            const isOnCooldown = h.cooldownMs > 0;
            const isSelected = selectedHotspotId === h.id;
            const isStabilized = stabilizedHotspot === h.id;
            const blockInfo = BLOCK_IDENTITIES[h.id];
            
            // Calculate infrastructure health based on pressure
            const getInfrastructureState = (pressure: number) => {
              if (pressure >= 80) return 'broken';
              if (pressure >= 50) return 'stressed';
              return 'healthy';
            };
            
            // Check if this hotspot has cascade risk (connected to critical neighbor)
            const hasCascadeRisk = HOTSPOT_CONNECTIONS.some(conn => {
              const neighborId = conn.from === h.id ? conn.to : conn.to === h.id ? conn.from : null;
              if (!neighborId) return false;
              const neighbor = hotspots.find(hs => hs.id === neighborId);
              return neighbor && neighbor.pressure >= 80 && h.pressure >= 50 && h.pressure < 80;
            });

            return (
              <div
                key={h.id}
                className={`${styles.hotspot} ${
                  state === 'critical' ? styles.hotspotCritical :
                  state === 'warning'  ? styles.hotspotWarning :
                  styles.hotspotNormal
                } ${isFlashing ? styles.hitFlash : ''} ${isSelected ? styles.hotspotSelected : ''} ${isStabilized ? styles.hotspotStabilized : ''}`}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  backgroundImage: `url('${h.assetBase}')`,
                  opacity: isOnCooldown ? 0.55 : 1,
                }}
                onClick={() => handleHotspotClick(h)}
                title={`${SECTOR_LABELS[h.id]} — Pressão: ${Math.round(h.pressure)}%`}
                data-hotspot-id={h.id}
              >
                {isSelected && <div className={styles.focusRing} />}
                
                {/* Recovery glow effect when stabilized */}
                {isStabilized && <div className={styles.recoveryGlow} />}

                {/* Neighborhood label */}
                <span className={styles.neighborhoodLabel}>
                  {SECTOR_NEIGHBORHOODS[h.id]}
                </span>

                {/* Sector Specific Stress FX */}
                {state === 'critical' && (
                  <>
                    {h.id === 'agua' && <div className={styles.aguaStress} />}
                    {h.id === 'saude' && <div className={styles.saudeStress} />}
                    {h.id === 'moradia' && <div className={styles.moradiaStress} />}
                    {h.id === 'mobilidade' && (
                      <div className="absolute inset-0 animate-ping opacity-20 bg-amber-500 rounded-full" />
                    )}
                  </>
                )}

                {/* Pressure ripple animation when pressure increases */}
                {state === 'warning' && (
                  <div 
                    className={styles.pressureRipple} 
                    style={{ color: SECTOR_COLORS[h.id] }}
                  />
                )}

                {/* Cascade warning */}
                {hasCascadeRisk && state !== 'critical' && (
                  <div className={styles.cascadeWarning}>Cascata!</div>
                )}

                {/* Sector type icon badge */}
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '-8px',
                  fontSize: '1rem',
                  filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
                  userSelect: 'none',
                }}>
                  {SECTOR_ICONS[h.id]}
                </div>

                {/* Density indicator dots */}
                <div className={styles.densityDots}>
                  {Array.from({ length: Math.min(4, Math.ceil(blockInfo.density / 2)) }).map((_, i) => (
                    <div key={i} className={styles.densityDot} />
                  ))}
                </div>

                {/* Pressure bar */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-16">
                  <div className="h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`${styles.smoothBar} h-full`}
                      style={{
                        width: `${h.pressure}%`,
                        background: state === 'critical' ? '#ef4444' :
                                    state === 'warning'  ? '#f59e0b' :
                                    SECTOR_COLORS[h.id],
                      }}
                    />
                  </div>
                </div>

                <div className={`${styles.hotspotStatusChip} ${state === 'critical' ? styles.hotspotStatusChipCritical : state === 'warning' ? styles.hotspotStatusChipWarning : styles.hotspotStatusChipNormal}`}>
                  {state === 'critical' ? 'Colapso' : state === 'warning' ? 'Sob pressão' : 'Coberto'}
                </div>

                <span
                  className={styles.sectorLabel}
                  style={{ borderColor: `${SECTOR_COLORS[h.id]}40` }}
                >
                  {SECTOR_LABELS[h.id]}
                </span>

                {/* Infrastructure indicators */}
                <div className={styles.infrastructureRow}>
                  {blockInfo.infrastructure.map((infra, i) => {
                    const infraState = getInfrastructureState(h.pressure);
                    const icons: Record<string, string> = {
                      power: '⚡',
                      water: '💧',
                      comms: '📡'
                    };
                    return (
                      <div 
                        key={i} 
                        className={`${styles.infrastructureIcon} ${styles[infraState]}`}
                        title={`${infra}: ${infraState}`}
                      >
                        {icons[infra]}
                      </div>
                    );
                  })}
                </div>

                {/* Save text popup */}
                {isStabilized && (
                  <div className={styles.saveTextPopup}>SALVO!</div>
                )}

                {/* Cooldown ring */}
                {isOnCooldown && <div className={styles.cooldownRing} />}
              </div>
            );
          })}

          {/* Brigade command base */}
          <div className={styles.playerIndicator} />
        </div>
      </ArcadeHUDContainer>
    );
  }

  // ─── OUTCOME ──────────────────────────────────────────────────
  const survived = integrity > 0;
  const worstHotspot = hotspots.reduce((a, b) => a.totalCriticalTime > b.totalCriticalTime ? a : b);
  const totalActions = Object.values(actionStats).reduce((s, v) => s + v, 0);

  return (
    <div className={styles.container}>
      <div className={styles.resultCard}>
        <p className={`${styles.resultOutcome} ${survived ? styles.survived : styles.collapsed}`}>
          {survived ? '🏘️ O BAIRRO RESISTIU!' : '💥 TERRITÓRIO COLAPSADO'}
        </p>

        <p className={styles.resultSummary}>
          {survived
            ? `Brigada manteve ${integrity}% do controle territorial sob pressão extrema. Missão cumprida, Fase ${phaseReached}.`
            : `O bairro sucumbiu na ${phaseLabel}. Setor crítico: ${SECTOR_LABELS[worstHotspot.id]}. Reforce a brigada.`}
        </p>

        <div className={styles.resultStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{score}</span>
            <span className={styles.statLabel}>Defesa</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: survived ? '#22c55e' : '#ef4444' }}>
              {integrity}%
            </span>
            <span className={styles.statLabel}>Controle</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalActions}</span>
            <span className={styles.statLabel}>Ações</span>
          </div>
        </div>

        <div className={styles.resultTerritoryGrid}>
          {hotspots.map((hotspot) => {
            const state = getHotspotState(hotspot.pressure);
            return (
              <div key={hotspot.id} className={styles.resultTerritoryCard}>
                <div className={styles.resultTerritoryHeader}>
                  <strong>{SECTOR_ICONS[hotspot.id]} {SECTOR_LABELS[hotspot.id]}</strong>
                  <span className={`${styles.resultTerritoryState} ${state === 'critical' ? styles.resultTerritoryStateCritical : state === 'warning' ? styles.resultTerritoryStateWarning : styles.resultTerritoryStateStable}`}>
                    {state === 'critical' ? 'Crítico' : state === 'warning' ? 'Pressão' : 'Estável'}
                  </span>
                </div>
                <div className={styles.resultTerritoryBarTrack}>
                  <div
                    className={styles.resultTerritoryBarFill}
                    style={{
                      width: `${Math.max(8, hotspot.pressure)}%`,
                      background: state === 'critical' ? '#ef4444' : state === 'warning' ? '#f59e0b' : SECTOR_COLORS[hotspot.id],
                    }}
                  />
                </div>
                <p className={styles.resultTerritoryText}>
                  {Math.round(hotspot.pressure)}% de pressão residual. {HOTSPOT_BRIEFS[hotspot.id].response}
                </p>
              </div>
            );
          })}
        </div>

        <ResultCard
          gameSlug={game.slug}
          resultTitle={survived ? 'Bairro Resistiu!' : 'Colapso Territorial'}
          resultId={Date.now().toString()}
          summary={survived
            ? `CONTROLE: ${integrity}% | DEFESA: ${score} | FASE ${phaseReached}`
            : `COLAPSO NA ${phaseLabel} | CRÍTICO: ${SECTOR_LABELS[worstHotspot.id]}`}
        />

        <div className={styles.actions} style={{ marginTop: '1.75rem' }}>
          <button onClick={handleReplay} className={styles.playButton}>
            {survived ? 'Reforçar Defesa' : 'Tentar de Novo'}
          </button>
          <Link href="/explorar" className={styles.linkGhost}>
            ← Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
