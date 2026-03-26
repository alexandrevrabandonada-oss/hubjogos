'use client';

// Play Shell Component
// T72 — Game Runtime Contract

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Game, GAME_GENRE_LABELS } from '@/lib/games/catalog';
import {
  GameRuntimeConfig,
  RuntimeState,
  createRuntimeConfig,
  createInitialRuntimeState,
} from '@/lib/runtime/types';
import {
  useGameLifecycle,
  useSaveSystem,
  useInputManager,
  useVisibilityMonitor,
  useOrientationMonitor,
} from '@/lib/runtime/hooks';
import { ResultScreen } from '@/components/result/ResultScreen';
import styles from './PlayShell.module.css';

// --- Types ---

export interface PlayShellProps {
  game: Game;
  config?: Partial<GameRuntimeConfig>;
  children: (props: {
    runtimeState: RuntimeState;
    lifecycle: ReturnType<typeof useGameLifecycle>;
    save: ReturnType<typeof useSaveSystem>;
    input: ReturnType<typeof useInputManager>;
  }) => React.ReactNode;
  onComplete?: (result: any) => void;
  onFail?: (reason: string) => void;
  onExit?: () => void;
}

// --- Main PlayShell Component ---

export function PlayShell({
  game,
  config: configOverrides,
  children,
  onComplete,
  onFail,
  onExit,
}: PlayShellProps) {
  // Create runtime config
  const config = createRuntimeConfig(game, configOverrides);
  
  // Initialize runtime state
  const [runtimeState, setRuntimeState] = useState<RuntimeState>(() =>
    createInitialRuntimeState(config)
  );

  // Lifecycle management
  const lifecycle = useGameLifecycle({
    game,
    config,
    onComplete: (result) => {
      setRuntimeState(prev => ({
        ...prev,
        sessionStatus: 'completed',
      }));
      onComplete?.(result);
    },
    onFail: (reason) => {
      setRuntimeState(prev => ({
        ...prev,
        sessionStatus: 'failed',
      }));
      onFail?.(reason);
    },
    onExit,
  });

  // Save system
  const save = useSaveSystem({
    gameSlug: game.slug,
    config,
    runtimeState: lifecycle.runtimeState,
  });

  // Input management
  const input = useInputManager({
    config,
    onInputChange: (mode) => {
      lifecycle.setInputMode(mode);
    },
  });

  // Update local runtime state when lifecycle changes
  useEffect(() => {
    setRuntimeState(lifecycle.runtimeState);
  }, [lifecycle]);

  // Visibility monitoring (auto-pause)
  useVisibilityMonitor((isVisible) => {
    if (!isVisible && lifecycle.sessionStatus === 'playing') {
      lifecycle.pauseGame();
    }
  });

  // Orientation monitoring
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  useOrientationMonitor((newOrientation) => {
    setOrientation(newOrientation);
  });

  // Derived states
  const isPlaying = lifecycle.sessionStatus === 'playing';
  const isPaused = lifecycle.sessionStatus === 'paused';
  const isCompleted = lifecycle.sessionStatus === 'completed';
  const isFailed = lifecycle.sessionStatus === 'failed';
  const showResult = isCompleted || isFailed;

  // Start game automatically on first render
  useEffect(() => {
    if (lifecycle.sessionStatus === 'initializing') {
      lifecycle.startGame();
    }
  }, [lifecycle]);

  return (
    <div
      className={`${styles.playShell} ${styles[config.runtimeType]}`}
      data-genre={game.genre}
      data-runtime-type={config.runtimeType}
      data-session-status={lifecycle.sessionStatus}
      data-orientation={orientation}
    >
      {/* Header Bar */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.exitButton} onClick={() => lifecycle.exitGame()}>
            ←
          </Link>
          <div className={styles.gameInfo}>
            <h1 className={styles.gameTitle}>{game.title}</h1>
            <span className={styles.gameGenre}>{GAME_GENRE_LABELS[game.genre]}</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          {/* Session timer could go here */}
        </div>

        <div className={styles.headerRight}>
          {config.hasPause && (
            <button
              className={styles.controlButton}
              onClick={isPaused ? lifecycle.resumeGame : lifecycle.pauseGame}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          )}
          
          {config.hasRestart && (
            <button
              className={styles.controlButton}
              onClick={lifecycle.restartGame}
              aria-label="Restart"
            >
              ↻
            </button>
          )}

          {config.hasAudio && (
            <button
              className={styles.controlButton}
              onClick={() => setRuntimeState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
              aria-label={runtimeState.isMuted ? 'Unmute' : 'Mute'}
            >
              {runtimeState.isMuted ? '🔇' : '🔊'}
            </button>
          )}
        </div>
      </header>

      {/* Main Game Area */}
      <main className={styles.gameArea}>
        {/* Game Content */}
        <div className={styles.gameContent}>
          {children({
            runtimeState: lifecycle.runtimeState,
            lifecycle,
            save,
            input,
          })}
        </div>

        {/* Pause Overlay */}
        {isPaused && (
          <div className={styles.pauseOverlay}>
            <div className={styles.pauseContent}>
              <h2>Jogo Pausado</h2>
              <button className={styles.resumeButton} onClick={lifecycle.resumeGame}>
                ▶ Continuar
              </button>
              {config.hasRestart && (
                <button className={styles.restartButton} onClick={lifecycle.restartGame}>
                  ↻ Recomeçar
                </button>
              )}
              <Link href="/" className={styles.exitLink} onClick={() => lifecycle.exitGame()}>
                ← Sair do jogo
              </Link>
            </div>
          </div>
        )}

        {/* Result Screen */}
        {showResult && (
          <div className={styles.resultOverlay}>
            <ResultScreen
              game={game}
              result={{
                outcomeType: isCompleted ? 'win_loss' : 'win_loss',
                outcomeSeverity: isCompleted ? 'success' : 'collapse',
                title: isCompleted ? 'Concluído!' : 'Não foi dessa vez',
                summary: isCompleted
                  ? 'Você completou a experiência com sucesso.'
                  : 'Tente novamente para um resultado diferente.',
                interpretation: '',
                shareData: {
                  title: `Joguei ${game.title}`,
                  description: game.shortDescription,
                },
              }}
              onReplay={lifecycle.restartGame}
              onClose={() => lifecycle.exitGame()}
            />
          </div>
        )}
      </main>

      {/* HUD Zones (optional) */}
      {config.hudZones.topBar && (
        <div className={styles.hudTopBar}>
          {/* Status info */}
        </div>
      )}

      {config.hudZones.leftRail && (
        <div className={styles.hudLeftRail}>
          {/* Left actions */}
        </div>
      )}

      {config.hudZones.rightRail && (
        <div className={styles.hudRightRail}>
          {/* Right actions */}
        </div>
      )}

      {config.hudZones.bottomControls && (
        <div className={styles.hudBottomControls}>
          {/* Bottom controls */}
        </div>
      )}

      {/* Input Hints Overlay */}
      {input.inputHints.length > 0 && isPlaying && (
        <div className={styles.inputHints}>
          {input.inputHints.map((hint, index) => (
            <span key={index} className={styles.inputHint}>{hint}</span>
          ))}
        </div>
      )}

      {/* Accessibility: Reduced Motion Warning */}
      {typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
        <div className={styles.accessibilityNotice}>
          Animações reduzidas ativas
        </div>
      )}
    </div>
  );
}

// --- HUD Zones Component ---

export interface HudZonesProps {
  config: GameRuntimeConfig;
  children?: React.ReactNode;
}

export function HudZones({ config, children }: HudZonesProps) {
  return (
    <>
      {config.hudZones.topBar && (
        <div className={styles.zoneTopBar}>{children}</div>
      )}
      {config.hudZones.leftRail && (
        <div className={styles.zoneLeftRail}>{children}</div>
      )}
      {config.hudZones.rightRail && (
        <div className={styles.zoneRightRail}>{children}</div>
      )}
      {config.hudZones.bottomControls && (
        <div className={styles.zoneBottom}>{children}</div>
      )}
      {config.hudZones.missionText && (
        <div className={styles.zoneMission}>{children}</div>
      )}
      {config.hudZones.criticalAlerts && (
        <div className={styles.zoneAlerts}>{children}</div>
      )}
    </>
  );
}

// --- Simple Play Wrapper (for basic games) ---

export interface SimplePlayProps {
  game: Game;
  children: React.ReactNode;
}

export function SimplePlay({ game, children }: SimplePlayProps) {
  return (
    <PlayShell game={game}>
      {() => children}
    </PlayShell>
  );
}

export default PlayShell;
