'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ArcadeGameLogic,
  ArcadeInputKind,
  ArcadeInputSnapshot,
  ArcadeRunResult,
} from '@/lib/games/arcade/types';
import styles from './ArcadeCanvasRuntime.module.css';

interface ArcadeCanvasRuntimeProps<State> {
  logic: ArcadeGameLogic<State>;
  runId: number;
  onRunEnd: (result: ArcadeRunResult) => void;
  onFirstInput: (elapsedMs: number, kind: ArcadeInputKind) => void;
  onPowerupCollect?: (powerupId: string) => void;
}

interface InputBuffer {
  leftHeld: boolean;
  rightHeld: boolean;
  leftPressed: boolean;
  rightPressed: boolean;
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
    pausePressed: buffer.pausePressed,
    restartPressed: buffer.restartPressed,
    pointerLane: buffer.pointerLane,
    lastInputKind: buffer.lastInputKind,
  };

  buffer.leftPressed = false;
  buffer.rightPressed = false;
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

  const inputBuffer = useMemo(() => defaultInputBuffer(), []);

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
      if (key === 'r') {
        inputBuffer.restartPressed = true;
        inputBuffer.lastInputKind = 'keyboard';
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
        onFirstInput(elapsedRef.current, inputKind);
      }

      if (snapshot.pausePressed) {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
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
            if (item.type === 'powerup_collect') {
              onPowerupCollect?.(item.powerupId);
            }
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
  }, [logic, onFirstInput, onPowerupCollect, onRunEnd, runId, inputBuffer]);

  function triggerMoveLeft() {
    inputBuffer.leftPressed = true;
    inputBuffer.lastInputKind = 'virtual';
  }

  function triggerMoveRight() {
    inputBuffer.rightPressed = true;
    inputBuffer.lastInputKind = 'virtual';
  }

  function triggerPause() {
    inputBuffer.pausePressed = true;
    inputBuffer.lastInputKind = 'virtual';
  }

  return (
    <div className={styles.runtime} ref={wrapperRef}>
      <div className={styles.hudTop}>
        <div className={styles.hudScore}>
          <span className={styles.hudLabel}>Score</span>
          <span className={styles.hudValue}>{score}</span>
        </div>
        <div className={styles.hudStatus}>
          {paused ? '⏸ Pausado' : '▶ Em jogo'}
        </div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-label="Jogo arcade Tarifa Zero" />
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
      <p className={styles.hint}>
        Toque nos cards ou use teclado (A/D, setas) • P pausa • R reinicia
      </p>
    </div>
  );
}
