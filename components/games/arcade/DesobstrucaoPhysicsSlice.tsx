'use client';

/**
 * T116/T117A Desobstrução Physics Slice
 * T116: interactive mobile gesture primer + steel grate second blockage variant
 * T117A: validation wave instrumentation (primer timing, phase transition, session complete, feedback overlay)
 * Unchanged: core gravity, rammer identity, audio stack, haptic patterns
 */

import React, { useEffect, useRef, useState } from 'react';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import styles from './DesobstrucaoPhysicsSlice.module.css';
import { CannonBoard } from '@/lib/games/arcade/physics/cannon-board';
import { ConcreteBarrier } from '@/lib/games/arcade/physics/concrete-barrier';
import { SteelGrateBarrier } from '@/lib/games/arcade/physics/steel-grate-barrier';
import { RammerTool, RammerAim } from '@/lib/games/arcade/physics/rammer-tool';
import { DesobstrucaoAudio } from '@/lib/games/arcade/audio/desobstrucao-audio';
import { DesobstrucaoValidationFeedback } from './DesobstrucaoValidationFeedback';
import {
  trackDesobstrucaoPrimerComplete,
  trackDesobstrucaoPhaseTransition,
  trackDesobstrucaoSessionComplete,
} from '@/lib/analytics/track';

type BlockageVariant = 'concrete' | 'steel';
type PrimerState = 'guiding' | 'success' | 'done';
type BarrierInstance = ConcreteBarrier | SteelGrateBarrier;
type CaptureStage = 'none' | 'steel' | 'cleared';

interface GameState {
  phase: 'aiming' | 'flying' | 'impact' | 'resolved';
  barrier: BarrierInstance | null;
  rammer: RammerTool | null;
  attempt: number;
  maxAttempts: number;
  startTime: number;
  endTime: number | null;
}

export const DesobstrucaoPhysicsSlice: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const physicsRef = useRef<CannonBoard | null>(null);
  const audioRef = useRef<DesobstrucaoAudio | null>(null);
  const trajectoryLinesRef = useRef<THREE.LineSegments[]>([]);
  const primerStartRef = useRef<{ x: number; y: number } | null>(null);
  const primerSuccessTimerRef = useRef<number | null>(null);
  const stageSwapTimerRef = useRef<number | null>(null);

  // T117A instrumentation refs
  const mountTimeRef = useRef<number>(0);
  const primerStartTimeRef = useRef<number>(0);
  const primerDragCountRef = useRef<number>(0);
  const phase1StartRef = useRef<number>(0);
  const phase1AttemptsRef = useRef<number>(0);
  const feedbackTimerRef = useRef<number | null>(null);

  const gameStateRef = useRef<GameState>({
    phase: 'aiming',
    barrier: null,
    rammer: null,
    attempt: 0,
    maxAttempts: 8,
    startTime: Date.now(),
    endTime: null,
  });

  // UI State
  const [aim, setAim] = useState<RammerAim>({ angle: 35, power: 0.7 });
  const [attempt, setAttempt] = useState(0);
  const [currentBlockage, setCurrentBlockage] = useState<BlockageVariant>('concrete');
  const [restorationActive, setRestorationActive] = useState(false);
  const [blockageSwapFlash, setBlockageSwapFlash] = useState(false);
  const [impactData, setImpactData] = useState<{ force: number; gForce: number } | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [primerState, setPrimerState] = useState<PrimerState>('done');
  const [primerProgress, setPrimerProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [captureStage] = useState<CaptureStage>(() => {
    if (typeof window === 'undefined') return 'none';
    const stage = new URLSearchParams(window.location.search).get('captureStage');
    if (stage === 'steel' || stage === 'cleared') return stage;
    return 'none';
  });

  const createBarrierForVariant = (
    variant: BlockageVariant,
    position: CANNON.Vec3
  ): BarrierInstance => {
    if (variant === 'steel') {
      return new SteelGrateBarrier('steel-grate-01', position, {
        maxHealth: 120,
        damageThreshold: 12,
        breakThreshold: 28,
      });
    }
    return new ConcreteBarrier('barrier-01', position, {
      maxHealth: 100,
      damageThreshold: 15,
      breakThreshold: 35,
    });
  };

  // Detect touch devices and start gesture primer only where needed.
  useEffect(() => {
    mountTimeRef.current = Date.now();
    phase1StartRef.current = Date.now();
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
    if (isTouch) {
      primerStartTimeRef.current = Date.now();
      setPrimerState('guiding');
    } else {
      setPrimerState('done');
    }
    setPrimerProgress(0);
  }, []);

  // Initialize Canvas + Physics + Three.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1628);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 4, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    scene.add(dirLight);

    // Physics Setup
    const board = new CannonBoard();
    physicsRef.current = board;

    // Audio Setup
    const audio = new DesobstrucaoAudio({ masterVolume: 0.5, sfxVolume: 0.7 });
    audioRef.current = audio;

    // Create first blockage variant (capture routes can override start stage).
    const barrierStartPos = new CANNON.Vec3(0, 0.5, 0);
    const startVariant: BlockageVariant =
      captureStage === 'steel' || captureStage === 'cleared' ? 'steel' : 'concrete';
    const barrier = createBarrierForVariant(startVariant, barrierStartPos);
    barrier.registerWithWorld(board.world);
    gameStateRef.current.barrier = barrier;
    setCurrentBlockage(startVariant);

    if (captureStage === 'cleared') {
      gameStateRef.current.phase = 'resolved';
      gameStateRef.current.endTime = Date.now();
      setRestorationActive(true);
    }

    // Add environment meshes
    createEnvironmentMeshes(scene);

    // Render loop
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      physicsRef.current?.step(1 / 60);

      if (gameStateRef.current.rammer && gameStateRef.current.phase === 'flying') {
        gameStateRef.current.rammer.updateFromPhysics();
        if (gameStateRef.current.rammer.isOutOfBounds({ minY: -5, maxDistance: 20 })) {
          gameStateRef.current.phase =
            gameStateRef.current.attempt >= gameStateRef.current.maxAttempts
              ? 'resolved'
              : 'aiming';
          gameStateRef.current.rammer.dispose(board.world);
          gameStateRef.current.rammer = null;
        }
      }

      if (gameStateRef.current.barrier) {
        gameStateRef.current.barrier.getPiecePositions();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      audioRef.current?.dispose();
      trajectoryLinesRef.current.forEach(line => scene.remove(line));
      gameStateRef.current.barrier?.dispose(board.world);
      gameStateRef.current.rammer?.dispose(board.world);
      if (primerSuccessTimerRef.current) window.clearTimeout(primerSuccessTimerRef.current);
      if (stageSwapTimerRef.current) window.clearTimeout(stageSwapTimerRef.current);
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      board.dispose();
    };
  }, [captureStage]);

  const completePrimer = () => {
    if (!isTouchDevice || primerState === 'done') return;
    setPrimerState('success');
    setPrimerProgress(100);
    // T117B: primer attempt telemetry uses discrete attempts and first-attempt boolean.
    trackDesobstrucaoPrimerComplete({
      timeToCompletePrimerMs: Date.now() - primerStartTimeRef.current,
      dragsRequired: primerDragCountRef.current,
      completedOnFirstAttempt: primerDragCountRef.current <= 1,
      isTouchDevice: true,
    }).catch(() => {});
    if (primerSuccessTimerRef.current) window.clearTimeout(primerSuccessTimerRef.current);
    if (primerSuccessTimerRef.current) window.clearTimeout(primerSuccessTimerRef.current);
    primerSuccessTimerRef.current = window.setTimeout(() => setPrimerState('done'), 700);
  };

  const activateNextBlockage = () => {
    const physics = physicsRef.current;
    const currentBarrier = gameStateRef.current.barrier;
    if (!physics || !currentBarrier) return;

    // T117A: record phase 1 stats before resetting
    const phase1Attempts = gameStateRef.current.attempt;
    const phase1DurationMs = Date.now() - phase1StartRef.current;
    phase1AttemptsRef.current = phase1Attempts;
    trackDesobstrucaoPhaseTransition({ phase1Attempts, phase1DurationMs }).catch(() => {});

    currentBarrier.dispose(physics.world);
    const nextBarrier = createBarrierForVariant('steel', new CANNON.Vec3(0, 0.5, 0));
    nextBarrier.registerWithWorld(physics.world);
    gameStateRef.current.barrier = nextBarrier;
    gameStateRef.current.phase = 'aiming';
    gameStateRef.current.rammer = null;
    // Reset attempt counter so steel phase gets a full independent attempt budget.
    gameStateRef.current.attempt = 0;
    setAttempt(0);
    setCurrentBlockage('steel');
    setImpactData(null);
    setBlockageSwapFlash(true);
    stageSwapTimerRef.current = window.setTimeout(() => setBlockageSwapFlash(false), 1200);
  };

  const handleFire = async () => {
    if (gameStateRef.current.phase !== 'aiming') return;
    if (
      !gameStateRef.current.barrier ||
      gameStateRef.current.attempt >= gameStateRef.current.maxAttempts
    )
      return;
    if (isTouchDevice && primerState !== 'done') return;

    const physics = physicsRef.current;
    if (!physics) return;

    if (audioRef.current && !audioRef.current['audioContext']) {
      await audioRef.current.initialize();
    }

    audioRef.current?.playLaunchSound();
    triggerHaptic(20);

    const launchPos = new CANNON.Vec3(-3, 0.5, 0);
    const rammer = new RammerTool(launchPos, aim);
    rammer.registerWithWorld(physics.world);
    gameStateRef.current.rammer = rammer;

    gameStateRef.current.phase = 'flying';
    gameStateRef.current.attempt += 1;
    setAttempt(gameStateRef.current.attempt);

    setTimeout(() => {
      if (gameStateRef.current.rammer && gameStateRef.current.phase === 'flying') {
        const rammerPos = gameStateRef.current.rammer.state.position;
        const barrierPos = gameStateRef.current.barrier?.state.targetPosition;

        if (barrierPos && rammerPos.distanceTo(barrierPos) < 1.5) {
          const barrier = gameStateRef.current.barrier;
          if (!barrier) return;

          const force = gameStateRef.current.rammer.getImpactForce(barrier.pieces[0].body);
          barrier.applyImpact(rammerPos, force);
          gameStateRef.current.rammer.recordImpact(barrier.state.id, force, rammerPos);

          audioRef.current?.playImpactCrunch(force / 100);
          const piecesBroken = Math.floor(force / 30);
          if (piecesBroken > 0) {
            audioRef.current?.playCascadeRattle(piecesBroken);
            triggerHaptic([30, 50, 20]);
          } else {
            triggerHaptic(40);
          }

          setImpactData({
            force,
            gForce: force / gameStateRef.current.rammer.state.cannonBody.mass,
          });

          gameStateRef.current.phase = 'impact';

          setTimeout(() => {
            if (gameStateRef.current.barrier?.isFullyCleared()) {
              if (currentBlockage === 'concrete') {
                activateNextBlockage();
              } else {
                // Steel phase cleared — full two-phase session complete
                gameStateRef.current.phase = 'resolved';
                audioRef.current?.playRestorationChime();
                triggerHaptic([50, 100, 50]);
                setRestorationActive(true);
                const endTime = Date.now();
                gameStateRef.current.endTime = endTime;
                // T117A: session complete tracking (skip for deterministic capture routes)
                if (captureStage === 'none') {
                  trackDesobstrucaoSessionComplete({
                    phase1Attempts: phase1AttemptsRef.current,
                    phase2Attempts: gameStateRef.current.attempt,
                    totalDurationMs: endTime - mountTimeRef.current,
                    primerCompleted: isTouchDevice,
                    isTouchDevice,
                  }).catch(() => {});
                  feedbackTimerRef.current = window.setTimeout(() => setShowFeedback(true), 1600);
                }
              }
            } else {
              gameStateRef.current.phase =
                gameStateRef.current.attempt >= gameStateRef.current.maxAttempts
                  ? 'resolved'
                  : 'aiming';
            }
            gameStateRef.current.rammer = null;
          }, 800);
        } else {
          gameStateRef.current.phase =
            gameStateRef.current.attempt >= gameStateRef.current.maxAttempts
              ? 'resolved'
              : 'aiming';
          gameStateRef.current.rammer = null;
        }
      }
    }, 800);
  };

  const triggerHaptic = (pattern: number | number[] = 30): void => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleTouchStartAiming = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameStateRef.current.phase !== 'aiming') return;
    const touch = e.touches[0];
    primerStartRef.current = { x: touch.clientX, y: touch.clientY };
    // T117B: count discrete attempts on touchstart while primer is guiding.
    if (isTouchDevice && primerState === 'guiding') {
      primerDragCountRef.current += 1;
    }
  };

  const handleTouchAiming = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameStateRef.current.phase !== 'aiming') return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (isTouchDevice && primerState === 'guiding') {
      if (!primerStartRef.current) {
        primerStartRef.current = { x: touch.clientX, y: touch.clientY };
      }

      const dx = (touch.clientX - primerStartRef.current.x) / rect.width;
      const dy = (touch.clientY - primerStartRef.current.y) / rect.height;
      const dragProgress = Math.max(0, Math.min((dx + Math.max(-dy, 0)) * 200, 100));
      setPrimerProgress(dragProgress);

      if (dx > 0.22 && dy < -0.12) {
        completePrimer();
      }
      return;
    }

    if (isTouchDevice && primerState !== 'done') return;

    // Normalize to 0-1
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    // Angle: bottom-left = 0°, top-right = 90°
    const angle = Math.min(normalizedY * 90, 90);

    // Power with easing curve (ease-out for responsive feel)
    const linearPower = Math.min(normalizedX, 1);
    const easedPower = linearPower * linearPower;

    setAim({ angle: Math.max(angle, 15), power: Math.max(easedPower, 0.3) });
  };

  const handleTouchEndAiming = () => {
    primerStartRef.current = null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Desobstrução • Rammer Proof</h3>
        <span className={styles.stats}>
          Attempt {attempt}/{gameStateRef.current.maxAttempts} • Blockage{' '}
          {currentBlockage === 'concrete' ? '1/2' : '2/2'}
          {impactData && ` • ${impactData.gForce.toFixed(1)}G`}
        </span>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} width={1440} height={810} />

      {isTouchDevice && primerState !== 'done' && gameStateRef.current.phase === 'aiming' && (
        <div className={styles.primerOverlay}>
          <div className={styles.primerCard}>
            {primerState === 'guiding' ? (
              <>
                <p className={styles.primerTitle}>Follow the swipe once</p>
                <p className={styles.primerSubtitle}>
                  Up/down controls angle. Left/right controls power.
                </p>
                <div className={styles.primerTrack}>
                  <div className={styles.primerPath} />
                  <div className={styles.primerGhost} />
                </div>
                <div className={styles.primerProgressBar}>
                  <div
                    className={styles.primerProgressFill}
                    style={{ width: `${primerProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <div className={styles.primerSuccess}>Gesture locked. You are ready to fire.</div>
            )}
          </div>
        </div>
      )}

      {blockageSwapFlash && (
        <div className={styles.blockageSwapOverlay}>
          <div className={styles.blockageSwapBadge}>Blockage 2 unlocked • Steel Grate</div>
        </div>
      )}

      {gameStateRef.current.phase === 'aiming' && (
        <div
          className={styles.aimingUI}
          onTouchStart={handleTouchStartAiming}
          onTouchMove={handleTouchAiming}
          onTouchEnd={handleTouchEndAiming}
        >
          <div className={styles.aimReticle}>
            <div className={styles.trajectoryPreview}>
              {Array.from({ length: 8 }).map((_, i) => {
                const opacity = (i + 1) / 8;
                return (
                  <div
                    key={i}
                    className={`${styles.trajectoryDot} ${styles.trajectoryDotActive}`}
                    style={{
                      opacity,
                      left: `${(i / 7) * 85}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                );
              })}
            </div>
            <div className={styles.aimLine} style={{ transform: `rotate(${aim.angle}deg)` }} />
          </div>

          <div className={styles.powerMeter}>
            <div className={styles.powerBar} style={{ width: `${aim.power * 100}%` }} />
          </div>

          <div className={styles.aimHint}>
            Angle: {aim.angle.toFixed(0)}° | Power: {(aim.power * 100).toFixed(0)}%
          </div>

          <div className={styles.blockageBadge}>
            Target: {currentBlockage === 'concrete' ? 'Concrete Barrier' : 'Steel Grate'}
          </div>

          <button className={styles.fireButton} onClick={handleFire}>
            FIRE RAMMER
          </button>
        </div>
      )}

      {restorationActive && (
        <div className={styles.restorationOverlay}>
          <div className={styles.restorationGlow} />
          <div className={styles.restorationText}>
            <h2>CLEARED</h2>
            <p>Water restored • Power flowing • Community safe</p>
            <p className={styles.timer}>
              Time:{' '}
              {gameStateRef.current.endTime
                ? Math.round(
                    (gameStateRef.current.endTime - gameStateRef.current.startTime) / 1000
                  )
                : '?'}
              s
            </p>
          </div>
        </div>
      )}

      {gameStateRef.current.phase === 'impact' && (
        <div className={styles.impactOverlay}>
          <div className={styles.impactFlash} />
        </div>
      )}

      <div className={styles.barrierHealthBar}>
        <div
          className={`${styles.healthFill} ${currentBlockage === 'steel' ? styles.healthFillSteel : ''}`}
          style={{ width: `${gameStateRef.current.barrier?.getHealthPercent() ?? 0}%` }}
        />
      </div>

      <div className={styles.footer}>
        <p className={styles.instruction}>
          {gameStateRef.current.phase === 'aiming' && isTouchDevice && primerState !== 'done'
            ? 'Follow the primer swipe once to unlock control'
            : gameStateRef.current.phase === 'aiming'
            ? currentBlockage === 'concrete'
              ? 'Break the concrete barrier to expose the steel grate'
              : 'Punch through the steel grate to finish restoration'
            : gameStateRef.current.phase === 'flying'
            ? 'Rammer en route...'
            : gameStateRef.current.phase === 'impact'
            ? 'IMPACT!'
            : 'Barrier cleared!'}
        </p>
      </div>

      {/* T117A post-session micro-feedback overlay */}
      {showFeedback && (
        <DesobstrucaoValidationFeedback
          isTouchDevice={isTouchDevice}
          onDismiss={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
};

function createEnvironmentMeshes(scene: THREE.Scene): void {
  const pipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
  const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
  const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  pipe.position.set(0, -0.5, -2);
  pipe.rotation.z = Math.PI / 2;
  pipe.visible = false;
  scene.add(pipe);

  const groundGeo = new THREE.PlaneGeometry(10, 5);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2332 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.8;
  ground.receiveShadow = true;
  scene.add(ground);
}

export default DesobstrucaoPhysicsSlice;
