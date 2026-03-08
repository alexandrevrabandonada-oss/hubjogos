'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createArcadeAudioController } from '@/lib/games/arcade/audio/arcade-audio';
import { playTarifaZeroRuntimeSfx } from '@/lib/games/arcade/audio/tarifa-zero-sfx';
import type {
  ArcadeGameLogic,
  ArcadeInputKind,
  ArcadeInputSnapshot,
  ArcadeRuntimeEvent,
  ArcadeRunResult,
} from '@/lib/games/arcade/types';
import styles from './ArcadeCanvasRuntime.module.css';

interface ArcadeCanvasRuntimeProps<State> {
  logic: ArcadeGameLogic<State>;
  runId: number;
  onRunEnd: (result: ArcadeRunResult) => void;
  onFirstInput: (elapsedMs: number, kind: ArcadeInputKind) => void;
  onPowerupCollect?: (powerupId: string) => void;
  onRuntimeEvent?: (event: ArcadeRuntimeEvent) => void;
  hudBadge?: string;
  hudDetail?: string;
  scoreLabel?: string;
  canvasAriaLabel?: string;
  hintText?: string;
  controlScheme?: 'lane' | 'hotspot';
  actionLabels?: {
    one: string;
    two: string;
    three: string;
    special: string;
  };
}

interface InputBuffer {
  leftHeld: boolean;
  rightHeld: boolean;
  leftPressed: boolean;
  rightPressed: boolean;
  actionOnePressed: boolean;
  actionTwoPressed: boolean;
  actionThreePressed: boolean;
  specialPressed: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
  pointerLane: number | null;
  lastInputKind: ArcadeInputKind | null;
}

function defaultInputBuffer(): InputBuffer {
  return {
    leftHeld: false,
    rightHeld: false,
    leftPressed: false,
    rightPressed: false,
    actionOnePressed: false,
    actionTwoPressed: false,
    actionThreePressed: false,
    specialPressed: false,
    pausePressed: false,
    restartPressed: false,
    pointerLane: null,
    lastInputKind: null,
  };
}

function consumeSnapshot(buffer: InputBuffer): ArcadeInputSnapshot {
  const snapshot: ArcadeInputSnapshot = {
    moveLeft: buffer.leftHeld,
    moveRight: buffer.rightHeld,
    moveLeftPressed: buffer.leftPressed,
    moveRightPressed: buffer.rightPressed,
    actionOnePressed: buffer.actionOnePressed,
    actionTwoPressed: buffer.actionTwoPressed,
    actionThreePressed: buffer.actionThreePressed,
    specialPressed: buffer.specialPressed,
    pausePressed: buffer.pausePressed,
    restartPressed: buffer.restartPressed,
    pointerLane: buffer.pointerLane,
    lastInputKind: buffer.lastInputKind,
  };

  buffer.leftPressed = false;
  buffer.rightPressed = false;
  buffer.actionOnePressed = false;
  buffer.actionTwoPressed = false;
  buffer.actionThreePressed = false;
  buffer.specialPressed = false;
  buffer.pausePressed = false;
  buffer.restartPressed = false;
  buffer.pointerLane = null;

  return snapshot;
}

function getSnapshotInputKind(snapshot: ArcadeInputSnapshot): ArcadeInputKind | null {
  const hasInput =
    snapshot.moveLeft ||
    snapshot.moveRight ||
    snapshot.moveLeftPressed ||
    snapshot.moveRightPressed ||
    snapshot.actionOnePressed ||
    snapshot.actionTwoPressed ||
    snapshot.actionThreePressed ||
    snapshot.specialPressed ||
    snapshot.pointerLane !== null;

  if (!hasInput) {
    return null;
  }

  return snapshot.lastInputKind;
}

function getCanvasSize() {
  if (typeof window === 'undefined') {
    return { width: 420, height: 680 };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // Target ratio ~9:16 (portrait mobile feel) but adaptable
  const targetRatio = 9 / 16;
  
  // Desktop: max 640px width for good feel
  // Mobile: use most of viewport width with padding
  const maxWidth = vw > 768 ? 640 : Math.min(480, vw - 24);
  const width = Math.max(360, maxWidth);
  
  // Height: prefer ratio, but cap at viewport minus controls/HUD space
  const idealHeight = Math.round(width / targetRatio);
  const maxHeight = vh - 280; // Leave space for HUD outside + controls
  const height = Math.min(idealHeight, Math.max(540, maxHeight));
  
  return { width, height };
}

export function ArcadeCanvasRuntime<State>({
  logic,
  runId,
  onRunEnd,
  onFirstInput,
  onPowerupCollect,
  onRuntimeEvent,
  hudBadge,
  hudDetail,
  scoreLabel = 'Score',
  canvasAriaLabel = 'Jogo arcade Tarifa Zero',
  hintText = 'Toque nos cards ou use teclado (A/D, setas) • P pausa • R reinicia • M som',
  controlScheme = 'lane',
  actionLabels,
}: ArcadeCanvasRuntimeProps<State>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<State | null>(null);
  const elapsedRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const firstInputTrackedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [muted, setMuted] = useState(false);

  const inputBuffer = useMemo(() => defaultInputBuffer(), []);
  const audio = useMemo(() => createArcadeAudioController(), []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem('arcade-sfx-muted');
    const initialMuted = stored === '1';
    audio.setMuted(initialMuted);
    setMuted(initialMuted);
  }, [audio]);

  useEffect(() => {
    setPaused(false);
    setScore(0);
    elapsedRef.current = 0;
    pausedRef.current = false;
    finishedRef.current = false;
    firstInputTrackedRef.current = false;
    previousTimeRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resize = () => {
      const size = getCanvasSize();
      canvas.width = size.width;
      canvas.height = size.height;
      stateRef.current = logic.createInitialState({ width: size.width, height: size.height });
      const ctx = canvas.getContext('2d');
      if (ctx && stateRef.current) {
        logic.render(ctx, stateRef.current, { width: size.width, height: size.height });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const toLane = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const laneWidth = rect.width / 3;
      return Math.max(0, Math.min(2, Math.floor(relativeX / laneWidth)));
    };

    const keyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        if (!inputBuffer.leftHeld) {
          inputBuffer.leftPressed = true;
        }
        inputBuffer.leftHeld = true;
        inputBuffer.lastInputKind = 'keyboard';
      }
      if (key === 'arrowright' || key === 'd') {
        if (!inputBuffer.rightHeld) {
          inputBuffer.rightPressed = true;
        }
        inputBuffer.rightHeld = true;
        inputBuffer.lastInputKind = 'keyboard';
      }
      if (key === 'p' || key === 'escape') {
        inputBuffer.pausePressed = true;
        inputBuffer.lastInputKind = 'keyboard';
      }
      if (key === '1') {
        inputBuffer.actionOnePressed = true;
        inputBuffer.lastInputKind = 'keyboard';
      }
      if (key === '2') {
        inputBuffer.actionTwoPressed = true;
        inputBuffer.lastInputKind = 'keyboard';
      }
      if (key === '3') {
        inputBuffer.actionThreePressed = true;
        inputBuffer.lastInputKind = 'keyboard';
      }
      if (key === ' ') {
        inputBuffer.specialPressed = true;
        inputBuffer.lastInputKind = 'keyboard';
        event.preventDefault();
      }
      if (key === 'r') {
        inputBuffer.restartPressed = true;
        inputBuffer.lastInputKind = 'keyboard';
      }
      if (key === 'm') {
        const nextMuted = audio.toggleMute();
        setMuted(nextMuted);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('arcade-sfx-muted', nextMuted ? '1' : '0');
        }
      }
    };

    const keyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        inputBuffer.leftHeld = false;
      }
      if (key === 'arrowright' || key === 'd') {
        inputBuffer.rightHeld = false;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      inputBuffer.pointerLane = toLane(event.clientX);
      inputBuffer.lastInputKind = event.pointerType === 'touch' ? 'touch' : 'mouse';
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    const frame = (timestamp: number) => {
      if (!canvasRef.current || !stateRef.current || finishedRef.current) {
        return;
      }

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) {
        return;
      }

      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestamp;
      }

      const dtMs = Math.min(50, Math.max(12, timestamp - previousTimeRef.current));
      previousTimeRef.current = timestamp;

      const snapshot = consumeSnapshot(inputBuffer);

      const inputKind = getSnapshotInputKind(snapshot);
      if (!firstInputTrackedRef.current && inputKind) {
        firstInputTrackedRef.current = true;
        audio.arm();
        onFirstInput(elapsedRef.current, inputKind);
      }

      if (!pausedRef.current && (
        snapshot.moveLeftPressed ||
        snapshot.moveRightPressed ||
        snapshot.actionOnePressed ||
        snapshot.actionTwoPressed ||
        snapshot.actionThreePressed ||
        snapshot.specialPressed ||
        snapshot.pointerLane !== null
      )) {
        audio.play('move');
      }

      if (snapshot.pausePressed) {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        audio.play(pausedRef.current ? 'pause' : 'resume');
      }

      if (snapshot.restartPressed) {
        stateRef.current = logic.createInitialState({ width: canvas.width, height: canvas.height });
        elapsedRef.current = 0;
        pausedRef.current = false;
        setPaused(false);
      }

      if (!pausedRef.current) {
        elapsedRef.current += dtMs;
        const tick = logic.update(stateRef.current, snapshot, {
          dtMs,
          elapsedMs: elapsedRef.current,
          width: canvas.width,
          height: canvas.height,
        });

        stateRef.current = tick.state;

        if (tick.events) {
          for (const item of tick.events) {
            onRuntimeEvent?.(item);
            if (item.type === 'powerup_collect') {
              onPowerupCollect?.(item.powerupId);
            }
            playTarifaZeroRuntimeSfx(audio, item);
          }
        }

        setScore(logic.getScore(stateRef.current));
      }

      logic.render(ctx, stateRef.current, { width: canvas.width, height: canvas.height });

      if (pausedRef.current) {
        ctx.fillStyle = 'rgba(8, 18, 29, 0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pausado', canvas.width / 2, canvas.height / 2 - 4);
        ctx.font = '14px sans-serif';
        ctx.fillText('Toque em P para continuar', canvas.width / 2, canvas.height / 2 + 24);
      }

      if (logic.isFinished(stateRef.current, { elapsedMs: elapsedRef.current })) {
        finishedRef.current = true;
        audio.play('run-end');
        onRunEnd(logic.buildResult(stateRef.current));
        return;
      }

      frameRef.current = window.requestAnimationFrame(frame);
    };

    frameRef.current = window.requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [audio, logic, onFirstInput, onPowerupCollect, onRunEnd, onRuntimeEvent, runId, inputBuffer]);

  function triggerMoveLeft() {
    audio.arm();
    inputBuffer.leftPressed = true;
    inputBuffer.lastInputKind = 'virtual';
  }

  function triggerMoveRight() {
    audio.arm();
    inputBuffer.rightPressed = true;
    inputBuffer.lastInputKind = 'virtual';
  }

  function triggerPause() {
    audio.arm();
    inputBuffer.pausePressed = true;
    inputBuffer.lastInputKind = 'virtual';
  }

  function triggerAction(kind: 'one' | 'two' | 'three' | 'special') {
    audio.arm();
    if (kind === 'one') {
      inputBuffer.actionOnePressed = true;
    }
    if (kind === 'two') {
      inputBuffer.actionTwoPressed = true;
    }
    if (kind === 'three') {
      inputBuffer.actionThreePressed = true;
    }
    if (kind === 'special') {
      inputBuffer.specialPressed = true;
    }
    inputBuffer.lastInputKind = 'virtual';
  }

  function toggleMute() {
    audio.arm();
    const nextMuted = audio.toggleMute();
    setMuted(nextMuted);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('arcade-sfx-muted', nextMuted ? '1' : '0');
    }
  }

  return (
    <div className={styles.runtime} ref={wrapperRef}>
      <div className={styles.hudTop}>
        <div className={styles.hudScore}>
          <span className={styles.hudLabel}>{scoreLabel}</span>
          <span className={styles.hudValue}>{score}</span>
        </div>
        {hudBadge || hudDetail ? (
          <div className={styles.hudMeta}>
            {hudBadge ? <span className={styles.hudBadge}>{hudBadge}</span> : null}
            {hudDetail ? <span className={styles.hudDetail}>{hudDetail}</span> : null}
          </div>
        ) : null}
        <div className={styles.hudStatus}>
          {paused ? '⏸ Pausado' : '▶ Em jogo'}
        </div>
        <button type="button" className={styles.soundToggle} onClick={toggleMute} aria-label="Alternar som">
          {muted ? 'Som: off' : 'Som: on'}
        </button>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-label={canvasAriaLabel} />
      {controlScheme === 'hotspot' ? (
        <div className={styles.actionControls}>
          <button type="button" onClick={() => triggerAction('one')} className={styles.actionButton} aria-label={actionLabels?.one || 'Acao 1'}>
            {actionLabels?.one || 'Acao 1'}
          </button>
          <button type="button" onClick={() => triggerAction('two')} className={styles.actionButton} aria-label={actionLabels?.two || 'Acao 2'}>
            {actionLabels?.two || 'Acao 2'}
          </button>
          <button type="button" onClick={() => triggerAction('three')} className={styles.actionButton} aria-label={actionLabels?.three || 'Acao 3'}>
            {actionLabels?.three || 'Acao 3'}
          </button>
          <button type="button" onClick={() => triggerAction('special')} className={`${styles.actionButton} ${styles.actionSpecial}`} aria-label={actionLabels?.special || 'Acao especial'}>
            {actionLabels?.special || 'Especial'}
          </button>
          <button type="button" onClick={triggerPause} className={`${styles.actionButton} ${styles.actionPause}`} aria-label="Pausar jogo">
            {paused ? 'Retomar' : 'Pausar'}
          </button>
        </div>
      ) : (
        <div className={styles.touchControls}>
          <button type="button" onClick={triggerMoveLeft} className={styles.controlButton} aria-label="Mover para esquerda">
            <span className={styles.controlIcon}>←</span>
            <span className={styles.controlLabel}>Esquerda</span>
          </button>
          <button type="button" onClick={triggerPause} className={`${styles.controlButton} ${styles.controlPause}`} aria-label="Pausar jogo">
            {paused ? '▶' : '⏸'}
          </button>
          <button type="button" onClick={triggerMoveRight} className={styles.controlButton} aria-label="Mover para direita">
            <span className={styles.controlIcon}>→</span>
            <span className={styles.controlLabel}>Direita</span>
          </button>
        </div>
      )}
      <p className={styles.hint}>{hintText}</p>
    </div>
  );
}
