// Runtime Lifecycle Hooks
// T72 — Game Runtime Contract

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Game } from '@/lib/games/catalog';
import {
  GameRuntimeConfig,
  RuntimeState,
  SessionStatus,
  LifecycleEvent,
  LifecycleEventType,
  InputMode,
  createInitialRuntimeState,
} from './types';
import { trackPlayShellView, trackGameStart, trackFirstInteraction, trackPauseClick, trackResumeClick, trackRestartClick, trackExitClick, trackCheckpointReached, trackSaveWritten, trackFailStateSeen, trackCompletionEmitted } from '@/lib/hub/analytics';

// --- Hook: useGameLifecycle ---

export interface UseGameLifecycleOptions {
  game: Game;
  config: GameRuntimeConfig;
  onComplete?: (result: any) => void;
  onFail?: (reason: string) => void;
  onExit?: () => void;
}

export interface UseGameLifecycleReturn {
  runtimeState: RuntimeState;
  sessionStatus: SessionStatus;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  exitGame: () => void;
  recordInteraction: () => void;
  recordCheckpoint: (checkpointId: string, label: string, state: any) => void;
  emitComplete: (result: any) => void;
  emitFail: (reason: string) => void;
  setInputMode: (mode: InputMode) => void;
  events: LifecycleEvent[];
}

export function useGameLifecycle(options: UseGameLifecycleOptions): UseGameLifecycleReturn {
  const { game, config, onComplete, onFail, onExit } = options;
  
  const [runtimeState, setRuntimeState] = useState<RuntimeState>(() =>
    createInitialRuntimeState(config, typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'desktop')
  );
  
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const hasInteracted = useRef(false);
  const pauseStartTime = useRef<number | null>(null);

  // Track play shell view on mount
  useEffect(() => {
    trackPlayShellView(game, config.runtimeType);
  }, [game, config.runtimeType]);

  // Helper to add events
  const addEvent = useCallback((type: LifecycleEventType, payload?: Record<string, any>) => {
    const event: LifecycleEvent = {
      type,
      timestamp: Date.now(),
      payload,
    };
    setEvents(prev => [...prev, event]);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setRuntimeState(prev => ({
      ...prev,
      sessionStatus: 'playing',
    }));
    
    trackGameStart(game, config.runtimeType);
    addEvent('game_start', { runtimeType: config.runtimeType });
  }, [game, config.runtimeType, addEvent]);

  // Record first interaction
  const recordInteraction = useCallback(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      trackFirstInteraction(game, config.supportedInputs[0] || 'unknown');
      addEvent('first_interaction', { inputMode: config.supportedInputs[0] });
    }
    
    setRuntimeState(prev => ({
      ...prev,
      sessionStats: {
        ...prev.sessionStats,
        interactionCount: prev.sessionStats.interactionCount + 1,
      },
    }));
  }, [game, config.supportedInputs, addEvent]);

  // Pause game
  const pauseGame = useCallback(() => {
    if (runtimeState.sessionStatus !== 'playing') return;
    
    pauseStartTime.current = Date.now();
    
    setRuntimeState(prev => ({
      ...prev,
      sessionStatus: 'paused',
      isPaused: true,
      sessionStats: {
        ...prev.sessionStats,
        pauseCount: prev.sessionStats.pauseCount + 1,
      },
    }));
    
    trackPauseClick(game);
    addEvent('pause');
  }, [game, runtimeState.sessionStatus, addEvent]);

  // Resume game
  const resumeGame = useCallback(() => {
    if (runtimeState.sessionStatus !== 'paused') return;
    
    const pauseDuration = pauseStartTime.current ? Date.now() - pauseStartTime.current : 0;
    pauseStartTime.current = null;
    
    setRuntimeState(prev => ({
      ...prev,
      sessionStatus: 'playing',
      isPaused: false,
      sessionStats: {
        ...prev.sessionStats,
        totalPauseDuration: prev.sessionStats.totalPauseDuration + pauseDuration,
      },
    }));
    
    trackResumeClick(game);
    addEvent('resume', { pauseDuration });
  }, [game, runtimeState.sessionStatus, addEvent]);

  // Restart game
  const restartGame = useCallback(() => {
    setRuntimeState(prev => ({
      ...createInitialRuntimeState(config, typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'desktop'),
      sessionStats: {
        ...createInitialRuntimeState(config, typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'desktop').sessionStats,
        restartCount: prev.sessionStats.restartCount + 1,
      },
    }));
    
    hasInteracted.current = false;
    trackRestartClick(game);
    addEvent('restart');
    
    // Auto-start after restart
    setTimeout(() => {
      setRuntimeState(prev => ({
        ...prev,
        sessionStatus: 'playing',
      }));
      trackGameStart(game, config.runtimeType);
      addEvent('game_start', { isRestart: true });
    }, 0);
  }, [game, config, addEvent]);

  // Exit game
  const exitGame = useCallback(() => {
    setRuntimeState(prev => ({
      ...prev,
      sessionStatus: 'exited',
      sessionStats: {
        ...prev.sessionStats,
        endTime: Date.now(),
        durationSeconds: Math.floor((Date.now() - prev.sessionStats.startTime) / 1000),
      },
    }));
    
    trackExitClick(game);
    addEvent('exit');
    onExit?.();
  }, [game, onExit, addEvent]);

  // Record checkpoint
  const recordCheckpoint = useCallback((checkpointId: string, label: string, state: any) => {
    if (!config.supportsCheckpoint) return;
    
    const checkpoint = {
      checkpointId,
      label,
      timestamp: Date.now(),
      gameState: state,
    };
    
    setRuntimeState(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints.slice(-(config.maxCheckpoints || 5) + 1), checkpoint],
      lastCheckpointId: checkpointId,
      sessionStats: {
        ...prev.sessionStats,
        checkpointCount: prev.sessionStats.checkpointCount + 1,
      },
    }));
    
    trackCheckpointReached(game, checkpointId);
    addEvent('checkpoint', { checkpointId, label });
  }, [game, config.supportsCheckpoint, config.maxCheckpoints, addEvent]);

  // Emit complete
  const emitComplete = useCallback((result: any) => {
    setRuntimeState(prev => ({
      ...prev,
      sessionStatus: 'completed',
      sessionStats: {
        ...prev.sessionStats,
        endTime: Date.now(),
        durationSeconds: Math.floor((Date.now() - prev.sessionStats.startTime) / 1000),
      },
    }));
    
    trackCompletionEmitted(game, result?.outcomeType || 'unknown');
    addEvent('complete', { result });
    onComplete?.(result);
  }, [game, onComplete, addEvent]);

  // Emit fail
  const emitFail = useCallback((reason: string) => {
    setRuntimeState(prev => ({
      ...prev,
      sessionStatus: 'failed',
      sessionStats: {
        ...prev.sessionStats,
        endTime: Date.now(),
        durationSeconds: Math.floor((Date.now() - prev.sessionStats.startTime) / 1000),
      },
    }));
    
    trackFailStateSeen(game, reason);
    addEvent('fail', { reason });
    onFail?.(reason);
  }, [game, onFail, addEvent]);

  // Set input mode
  const setInputMode = useCallback((mode: InputMode) => {
    setRuntimeState(prev => ({
      ...prev,
      inputMode: mode,
      sessionStats: {
        ...prev.sessionStats,
        inputMode: mode,
      },
    }));
    addEvent('input_change', { inputMode: mode });
  }, [addEvent]);

  return {
    runtimeState,
    sessionStatus: runtimeState.sessionStatus,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    exitGame,
    recordInteraction,
    recordCheckpoint,
    emitComplete,
    emitFail,
    setInputMode,
    events,
  };
}

// --- Hook: useSaveSystem ---

export interface UseSaveSystemOptions {
  gameSlug: string;
  config: GameRuntimeConfig;
  runtimeState: RuntimeState;
}

export interface UseSaveSystemReturn {
  saveGame: (gameState: any, label?: string) => void;
  loadSave: () => SavePayload | null;
  hasSave: boolean;
  clearSave: () => void;
}

import { SavePayload } from './types';
import { saveToLocal, loadFromLocal, clearFromLocal } from './save';

export function useSaveSystem(options: UseSaveSystemOptions): UseSaveSystemReturn {
  const { gameSlug, config, runtimeState } = options;
  
  const [hasSave, setHasSave] = useState(() => {
    if (typeof window === 'undefined') return false;
    return loadFromLocal(gameSlug) !== null;
  });

  const saveGame = useCallback((gameState: any, label?: string) => {
    if (!config.supportsSave) return;
    
    const savePayload: SavePayload = {
      gameSlug,
      timestamp: Date.now(),
      sessionDuration: runtimeState.sessionStats.durationSeconds,
      checkpointId: runtimeState.lastCheckpointId,
      gameState,
      metadata: {
        genre: config.genre,
        runtimeType: config.runtimeType,
        deviceType: typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'desktop',
      },
    };
    
    saveToLocal(gameSlug, savePayload);
    setHasSave(true);
    
    // Analytics
    const { trackSaveWritten } = require('@/lib/hub/analytics');
    trackSaveWritten(gameSlug, config.genre);
  }, [gameSlug, config.supportsSave, config.genre, config.runtimeType, runtimeState]);

  const loadSave = useCallback((): SavePayload | null => {
    if (typeof window === 'undefined') return null;
    return loadFromLocal(gameSlug);
  }, [gameSlug]);

  const clearSave = useCallback(() => {
    clearFromLocal(gameSlug);
    setHasSave(false);
  }, [gameSlug]);

  return {
    saveGame,
    loadSave,
    hasSave,
    clearSave,
  };
}

// --- Hook: useInputManager ---

export interface UseInputManagerOptions {
  config: GameRuntimeConfig;
  onInputChange?: (mode: InputMode) => void;
}

export interface UseInputManagerReturn {
  currentInput: InputMode;
  inputHints: string[];
  setInput: (mode: InputMode) => void;
  isTouch: boolean;
  isKeyboard: boolean;
  isMouse: boolean;
}

export function useInputManager(options: UseInputManagerOptions): UseInputManagerReturn {
  const { config, onInputChange } = options;
  
  const [currentInput, setCurrentInput] = useState<InputMode>(
    config.supportedInputs[0] || 'touch_simple'
  );

  const setInput = useCallback((mode: InputMode) => {
    setCurrentInput(mode);
    onInputChange?.(mode);
  }, [onInputChange]);

  // Auto-detect input method
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = () => {
      if (config.supportedInputs.some(i => i.includes('keyboard'))) {
        setInput('keyboard');
      }
    };

    const handleMouseMove = () => {
      if (config.supportedInputs.some(i => i.includes('mouse'))) {
        setInput('mouse');
      }
    };

    const handleTouchStart = () => {
      if (config.supportedInputs.some(i => i.includes('touch'))) {
        setInput(config.supportedInputs.find(i => i.includes('touch')) || 'touch_simple');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [config.supportedInputs, setInput]);

  const inputHints = config.inputHints ? [
    config.inputHints.primaryAction,
    config.inputHints.secondaryAction,
    config.inputHints.movement,
    config.inputHints.pause,
    ...(config.inputHints.special || []),
  ].filter(Boolean) as string[] : [];

  return {
    currentInput,
    inputHints,
    setInput,
    isTouch: currentInput.includes('touch'),
    isKeyboard: currentInput.includes('keyboard'),
    isMouse: currentInput === 'mouse',
  };
}

// --- Hook: useVisibilityMonitor ---

export function useVisibilityMonitor(onVisibilityChange: (isVisible: boolean) => void) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      onVisibilityChange(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onVisibilityChange]);
}

// --- Hook: useOrientationMonitor ---

export function useOrientationMonitor(onOrientationChange: (orientation: 'portrait' | 'landscape') => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      onOrientationChange(isLandscape ? 'landscape' : 'portrait');
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [onOrientationChange]);
}
