'use client';

/**
 * T116/T117A Desobstrução Physics Slice
 * T116: interactive mobile gesture primer + steel grate second blockage variant
 * T117A: validation wave instrumentation (primer timing, phase transition, session complete, feedback overlay)
 * Unchanged: core gravity, rammer identity, audio stack, haptic patterns
 *
 * RENDER BRIDGE: physics bodies (cannon-es) ↔ Three.js meshes
 *   barrierMeshesRef tracks one Mesh per ConcreteBarrier/SteelGrateBarrier piece.
 *   rammerMeshRef tracks the single rammer projectile mesh.
 *   Each animate() frame: mesh.position/quaternion is copied from body.position/quaternion.
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
  trackDesobstrucaoFailure,
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
  flightTimeMs: number;
  physicsActive: boolean;
}

// ─── Mesh helpers ───────────────────────────────────────────────────────────

function buildBarrierMeshes(
  barrier: BarrierInstance,
  scene: THREE.Scene,
  variant: BlockageVariant
): THREE.Mesh[] {
  const isConcrete = variant === 'concrete';
  const mat = isConcrete
    ? new THREE.MeshStandardMaterial({ color: 0xa8b0bc, roughness: 0.92, metalness: 0.08, emissive: 0x3a4050, emissiveIntensity: 0.18 })
    : new THREE.MeshStandardMaterial({ color: 0x7a8fa0, roughness: 0.22, metalness: 0.92, emissive: 0x1e3a6a, emissiveIntensity: 0.3 });

  return barrier.pieces.map((piece) => {
    const { w, h, d } = piece.size;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // Sync initial position from physics body
    mesh.position.set(
      piece.body.position.x,
      piece.body.position.y,
      piece.body.position.z
    );
    mesh.quaternion.set(
      piece.body.quaternion.x,
      piece.body.quaternion.y,
      piece.body.quaternion.z,
      piece.body.quaternion.w
    );
    scene.add(mesh);
    return mesh;
  });
}

function buildRammerMesh(scene: THREE.Scene): THREE.Mesh {
  // Bold, readable shape: elongated octahedron-like box tipped forward
  const geo = new THREE.BoxGeometry(0.38, 0.20, 0.20);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.3,
    metalness: 0.85,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  // Glow ring
  const ringGeo = new THREE.TorusGeometry(0.18, 0.025, 8, 24);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    emissive: 0x3b82f6,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.y = Math.PI / 2;
  mesh.add(ring);
  scene.add(mesh);
  return mesh;
}

function purgeMeshes(meshes: THREE.Mesh[], scene: THREE.Scene): void {
  meshes.forEach((m) => {
    scene.remove(m);
    m.geometry.dispose();
    if (Array.isArray(m.material)) {
      m.material.forEach((mat) => mat.dispose());
    } else {
      (m.material as THREE.Material).dispose();
    }
    m.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  });
}

function purgeRammerMesh(meshRef: React.MutableRefObject<THREE.Mesh | null>, scene: THREE.Scene): void {
  if (!meshRef.current) return;
  scene.remove(meshRef.current);
  meshRef.current.geometry.dispose();
  (meshRef.current.material as THREE.Material).dispose();
  meshRef.current.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
    }
  });
  meshRef.current = null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const DesobstrucaoPhysicsSlice: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const physicsRef = useRef<CannonBoard | null>(null);
  const audioRef = useRef<DesobstrucaoAudio | null>(null);
  const trajectoryLinesRef = useRef<THREE.LineSegments[]>([]);
  const primerStartRef = useRef<{ x: number; y: number } | null>(null);
  const primerSuccessTimerRef = useRef<number | null>(null);
  const stageSwapTimerRef = useRef<number | null>(null);

  // Render bridge refs
  const barrierMeshesRef = useRef<THREE.Mesh[]>([]);
  const rammerMeshRef = useRef<THREE.Mesh | null>(null);

  // T117A instrumentation refs
  const mountTimeRef = useRef<number>(0);
  const primerStartTimeRef = useRef<number>(0);
  const primerDragCountRef = useRef<number>(0);
  const phase1StartRef = useRef<number>(0);
  const phase1AttemptsRef = useRef<number>(0);
  const feedbackTimerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<'aiming' | 'flying' | 'impact' | 'resolved'>('aiming');

  const gameStateRef = useRef<GameState>({
    phase: 'aiming',
    barrier: null,
    rammer: null,
    attempt: 0,
    maxAttempts: 8,
    startTime: Date.now(),
    endTime: null,
    flightTimeMs: 0,
    physicsActive: true,
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
  const [captureStage, setCaptureStage] = useState<CaptureStage>('none');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stage = new URLSearchParams(window.location.search).get('captureStage');
      if (stage === 'steel' || stage === 'cleared') {
        setCaptureStage(stage as CaptureStage);
      }
    }
  }, []);

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

    // ── Three.js setup ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1628);
    scene.fog = new THREE.Fog(0x0a1628, 12, 30);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(-1.5, 2.8, 7.5);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // ── Lighting ────────────────────────────────────────────────────
    const ambLight = new THREE.AmbientLight(0xb0c8e8, 0.75);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.1);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4488bb, 0.4);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x0ea5e9, 2.5, 8);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // ── Physics ─────────────────────────────────────────────────────
    const board = new CannonBoard();
    physicsRef.current = board;

    // ── Audio ───────────────────────────────────────────────────────
    const audio = new DesobstrucaoAudio({ masterVolume: 0.5, sfxVolume: 0.7 });
    audioRef.current = audio;

    // ── Environment meshes ──────────────────────────────────────────
    createEnvironmentMeshes(scene);

    // ── First barrier (physics + meshes) ────────────────────────────
    const barrierStartPos = new CANNON.Vec3(0, 0.5, 0);
    const startVariant: BlockageVariant =
      captureStage === 'steel' || captureStage === 'cleared' ? 'steel' : 'concrete';
    const barrier = createBarrierForVariant(startVariant, barrierStartPos);
    barrier.registerWithWorld(board.world);
    gameStateRef.current.barrier = barrier;
    setCurrentBlockage(startVariant);

    // RENDER BRIDGE: create Three.js meshes for barrier pieces
    barrierMeshesRef.current = buildBarrierMeshes(barrier, scene, startVariant);

    if (captureStage === 'cleared') {
      gameStateRef.current.phase = 'resolved';
      setPhase('resolved');
      gameStateRef.current.endTime = Date.now();
      setRestorationActive(true);
    }

    // ── Render loop ─────────────────────────────────────────────────
    let animationId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      if (document.hidden) {
        lastTime = time;
        return;
      }

      const rawDelta = (time - lastTime) / 1000;
      lastTime = time;
      const cappedDelta = Math.min(rawDelta, 0.1);

      try {
        const physics = physicsRef.current;
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;

        if (!physics || !renderer || !scene || !camera) return;

        physics.world.step(1 / 60, cappedDelta, 3);

        const gameState = gameStateRef.current;

        // ── Sync barrier meshes from physics ──
        const bMeshes = barrierMeshesRef.current;
        const currentBarrier = gameState.barrier;
        if (currentBarrier && bMeshes.length === currentBarrier.pieces.length) {
          currentBarrier.pieces.forEach((piece, i) => {
            const mesh = bMeshes[i];
            if (!mesh) return;
            mesh.position.set(
              piece.body.position.x,
              piece.body.position.y,
              piece.body.position.z
            );
            mesh.quaternion.set(
              piece.body.quaternion.x,
              piece.body.quaternion.y,
              piece.body.quaternion.z,
              piece.body.quaternion.w
            );
          });
        }

        // ── Sync rammer mesh from physics ──
        if (gameState.rammer && rammerMeshRef.current) {
          const rp = gameState.rammer.state;
          rammerMeshRef.current.position.set(rp.position.x, rp.position.y, rp.position.z);
          rammerMeshRef.current.quaternion.set(rp.rotation.x, rp.rotation.y, rp.rotation.z, rp.rotation.w);
        }

        // ── Flight state checks ──
        if (gameState.rammer && gameState.phase === 'flying') {
          gameState.rammer.updateFromPhysics();
          gameState.flightTimeMs += cappedDelta * 1000;

          const rammerPos = gameState.rammer.state.position;
          const barrierPos = gameState.barrier?.state.targetPosition;
          const velocitySq = gameState.rammer.state.cannonBody.velocity.lengthSquared();

          if (barrierPos && rammerPos.distanceTo(barrierPos) < 2.5) {
            triggerImpact(rammerPos);
          } else if (gameState.rammer.isOutOfBounds({ minY: -5, maxDistance: 25 })) {
            purgeRammerMesh(rammerMeshRef, scene);
            gameState.phase = gameState.attempt >= gameState.maxAttempts ? 'resolved' : 'aiming';
            setPhase(gameState.phase);
            gameState.rammer.dispose(physics.world);
            gameState.rammer = null;
          } else if (gameState.flightTimeMs > 1500 && velocitySq < 0.1) {
            console.warn('Rammer watchdog reset — stuck in flight');
            trackDesobstrucaoFailure({ type: 'runtime_stuck', flightTimeMs: gameState.flightTimeMs, rammerVelocity: Math.sqrt(velocitySq), phase: gameState.phase }).catch(() => {});
            purgeRammerMesh(rammerMeshRef, scene);
            gameState.phase = gameState.attempt >= gameState.maxAttempts ? 'resolved' : 'aiming';
            setPhase(gameState.phase);
            gameState.rammer.dispose(physics.world);
            gameState.rammer = null;
          } else if (gameState.flightTimeMs > 8000) {
            console.warn('Rammer flight timeout (8s) — auto-resetting');
            trackDesobstrucaoFailure({ type: 'flight_timeout', flightTimeMs: gameState.flightTimeMs, phase: gameState.phase }).catch(() => {});
            purgeRammerMesh(rammerMeshRef, scene);
            gameState.phase = gameState.attempt >= gameState.maxAttempts ? 'resolved' : 'aiming';
            setPhase(gameState.phase);
            gameState.rammer.dispose(physics.world);
            gameState.rammer = null;
          }
        } else {
          gameState.flightTimeMs = 0;
        }

        if (gameState.barrier) {
          gameState.barrier.getPiecePositions();
        }

        renderer.render(scene, camera);
      } catch (err) {
        console.error('Animation loop error:', err);
      }
    };
    animationId = requestAnimationFrame(animate);

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
      trajectoryLinesRef.current.forEach((line) => scene.remove(line));
      purgeMeshes(barrierMeshesRef.current, scene);
      barrierMeshesRef.current = [];
      purgeRammerMesh(rammerMeshRef, scene);
      gameStateRef.current.barrier?.dispose(board.world);
      gameStateRef.current.rammer?.dispose(board.world);
      if (primerSuccessTimerRef.current) window.clearTimeout(primerSuccessTimerRef.current);
      if (stageSwapTimerRef.current) window.clearTimeout(stageSwapTimerRef.current);
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      board.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureStage]);

  const completePrimer = () => {
    if (!isTouchDevice || primerState === 'done') return;
    setPrimerState('success');
    setPrimerProgress(100);
    trackDesobstrucaoPrimerComplete({
      timeToCompletePrimerMs: Date.now() - primerStartTimeRef.current,
      dragsRequired: primerDragCountRef.current,
      completedOnFirstAttempt: primerDragCountRef.current <= 1,
      isTouchDevice: true,
    }).catch(() => {});
    if (primerSuccessTimerRef.current) window.clearTimeout(primerSuccessTimerRef.current);
    primerSuccessTimerRef.current = window.setTimeout(() => setPrimerState('done'), 700);
  };

  const activateNextBlockage = () => {
    const physics = physicsRef.current;
    const scene = sceneRef.current;
    const currentBarrier = gameStateRef.current.barrier;
    if (!physics || !currentBarrier || !scene) return;

    const phase1Attempts = gameStateRef.current.attempt;
    const phase1DurationMs = Date.now() - phase1StartRef.current;
    phase1AttemptsRef.current = phase1Attempts;
    trackDesobstrucaoPhaseTransition({ phase1Attempts, phase1DurationMs }).catch(() => {});

    // Remove old barrier physics + meshes
    currentBarrier.dispose(physics.world);
    purgeMeshes(barrierMeshesRef.current, scene);
    barrierMeshesRef.current = [];

    // Create new steel barrier physics + meshes
    const nextBarrier = createBarrierForVariant('steel', new CANNON.Vec3(0, 0.5, 0));
    nextBarrier.registerWithWorld(physics.world);
    gameStateRef.current.barrier = nextBarrier;
    barrierMeshesRef.current = buildBarrierMeshes(nextBarrier, scene, 'steel');

    gameStateRef.current.phase = 'aiming';
    setPhase('aiming');
    gameStateRef.current.rammer = null;
    gameStateRef.current.attempt = 0;
    setAttempt(0);
    setCurrentBlockage('steel');
    setImpactData(null);
    setBlockageSwapFlash(true);
    stageSwapTimerRef.current = window.setTimeout(() => setBlockageSwapFlash(false), 1200);
  };

  const triggerImpact = (impactPos: CANNON.Vec3) => {
    const gameState = gameStateRef.current;
    const barrier = gameState.barrier;
    const rammer = gameState.rammer;
    const scene = sceneRef.current;
    if (!barrier || !rammer || gameState.phase !== 'flying') return;

    const force = rammer.getImpactForce(barrier.pieces[0].body);
    barrier.applyImpact(impactPos, force);
    rammer.recordImpact(barrier.state.id, force, impactPos);

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
      gForce: force / rammer.state.cannonBody.mass,
    });

    gameState.phase = 'impact';
    setPhase('impact');

    // Remove rammer mesh immediately on impact
    if (scene) purgeRammerMesh(rammerMeshRef, scene);

    setTimeout(() => {
      const currentGameState = gameStateRef.current;
      if (currentGameState.barrier?.isFullyCleared()) {
        if (currentBlockage === 'concrete') {
          activateNextBlockage();
        } else {
          currentGameState.phase = 'resolved';
          setPhase('resolved');
          audioRef.current?.playRestorationChime();
          triggerHaptic([50, 100, 50]);
          setRestorationActive(true);
          const endTime = Date.now();
          currentGameState.endTime = endTime;

          if (captureStage === 'none') {
            trackDesobstrucaoSessionComplete({
              phase1Attempts: phase1AttemptsRef.current,
              phase2Attempts: currentGameState.attempt,
              totalDurationMs: endTime - mountTimeRef.current,
              primerCompleted: isTouchDevice,
              isTouchDevice,
            }).catch(() => {});
            feedbackTimerRef.current = window.setTimeout(() => setShowFeedback(true), 1600);
          }
        }
      } else {
        currentGameState.phase =
          currentGameState.attempt >= currentGameState.maxAttempts ? 'resolved' : 'aiming';
        setPhase(currentGameState.phase);
      }
      currentGameState.rammer = null;
    }, 800);
  };

  const handleFire = async () => {
    if (gameStateRef.current.phase !== 'aiming') return;
    if (!gameStateRef.current.barrier || gameStateRef.current.attempt >= gameStateRef.current.maxAttempts)
      return;
    if (isTouchDevice && primerState !== 'done') return;

    const physics = physicsRef.current;
    const scene = sceneRef.current;
    if (!physics || !scene) return;

    if (audioRef.current && !audioRef.current['audioContext']) {
      await audioRef.current.initialize();
    }

    audioRef.current?.playLaunchSound();
    triggerHaptic(20);

    const launchPos = new CANNON.Vec3(-4, 0.5, 0);
    const rammer = new RammerTool(launchPos, aim);
    rammer.registerWithWorld(physics.world);
    gameStateRef.current.rammer = rammer;

    // RENDER BRIDGE: create visual mesh for rammer
    purgeRammerMesh(rammerMeshRef, scene);
    rammerMeshRef.current = buildRammerMesh(scene);
    rammerMeshRef.current.position.set(launchPos.x, launchPos.y, launchPos.z);

    gameStateRef.current.phase = 'flying';
    setPhase('flying');
    gameStateRef.current.startTime = Date.now();
    gameStateRef.current.attempt += 1;
    setAttempt(gameStateRef.current.attempt);
  };

  const triggerHaptic = (pattern: number | number[] = 30): void => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleTouchStartAiming = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameStateRef.current.phase !== 'aiming') return;
    const touch = e.touches[0];
    primerStartRef.current = { x: touch.clientX, y: touch.clientY };
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

    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    const angle = Math.min(normalizedY * 90, 90);
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
        <h3>Desobstrução • Rammer</h3>
        <span className={styles.stats}>
          Attempt {attempt}/{gameStateRef.current.maxAttempts} • Blockage{' '}
          {currentBlockage === 'concrete' ? '1/2' : '2/2'}
          {impactData && ` • ${impactData.gForce.toFixed(1)}G`}
        </span>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} width={1440} height={810} />

      {isTouchDevice && primerState !== 'done' && phase === 'aiming' && (
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

      {phase === 'aiming' && (
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

      {phase === 'impact' && (
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
          {phase === 'aiming' && isTouchDevice && primerState !== 'done'
            ? 'Follow the primer swipe once to unlock control'
            : phase === 'aiming'
            ? currentBlockage === 'concrete'
              ? 'Break the concrete barrier to expose the steel grate'
              : 'Punch through the steel grate to finish restoration'
            : phase === 'flying'
            ? 'Rammer en route...'
            : phase === 'impact'
            ? 'IMPACT!'
            : 'Barrier cleared!'}
        </p>
      </div>

      {showFeedback && (
        <DesobstrucaoValidationFeedback
          isTouchDevice={isTouchDevice}
          onDismiss={() => setShowFeedback(false)}
        />
      )}

      {(phase === 'flying' || (typeof window !== 'undefined' && window.location.search.includes('debug'))) && (
        <div style={{
          position: 'absolute',
          top: 80,
          right: 20,
          padding: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          fontSize: '10px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 100,
          borderRadius: '4px',
          border: '1px solid #4bb0ff'
        }}>
          <div>Phase: {gameStateRef.current.phase}</div>
          <div>Attempts: {attempt}/{gameStateRef.current.maxAttempts}</div>
          {gameStateRef.current.rammer && (
            <>
              <div>Rammer X: {gameStateRef.current.rammer.state.position.x.toFixed(2)}</div>
              <div>Rammer Y: {gameStateRef.current.rammer.state.position.y.toFixed(2)}</div>
              <div>Dist: {gameStateRef.current.barrier ? gameStateRef.current.rammer.state.position.distanceTo(gameStateRef.current.barrier.state.targetPosition).toFixed(2) : 'N/A'}</div>
            </>
          )}
          <div>Bodies: {physicsRef.current?.world.bodies.length || 0}</div>
        </div>
      )}
    </div>
  );
};

// ─── Scene environment ──────────────────────────────────────────────────────

function createEnvironmentMeshes(scene: THREE.Scene): void {
  // Ground: worn concrete slab
  const groundGeo = new THREE.PlaneGeometry(16, 8);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1e2d3d,
    roughness: 0.98,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  ground.receiveShadow = true;
  scene.add(ground);

  // Back wall: dark tunnel wall
  const wallGeo = new THREE.PlaneGeometry(16, 6);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f1e2d, roughness: 0.95 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 2.5, -3);
  wall.receiveShadow = true;
  scene.add(wall);

  // Pipe (infrastructure — visible this time)
  const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 8, 12);
  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.4,
    metalness: 0.7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.3,
  });
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0, 0.5, -1.5);
  pipe.castShadow = true;
  scene.add(pipe);

  // Pipe cap left
  const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.9, roughness: 0.2 });
  const capL = new THREE.Mesh(capGeo, capMat);
  capL.rotation.z = Math.PI / 2;
  capL.position.set(-4.1, 0.5, -1.5);
  scene.add(capL);

  const capR = capL.clone();
  capR.position.set(4.1, 0.5, -1.5);
  scene.add(capR);

  // Struts holding pipe
  for (const xPos of [-2.5, 0, 2.5]) {
    const strutGeo = new THREE.BoxGeometry(0.06, 0.6, 0.06);
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.6, roughness: 0.5 });
    const strut = new THREE.Mesh(strutGeo, strutMat);
    strut.position.set(xPos, 0.05, -1.5);
    scene.add(strut);
  }

  // Side walls (tunnel feel)
  for (const side of [-1, 1]) {
    const sideWallGeo = new THREE.PlaneGeometry(8, 6);
    const sideWallMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.97 });
    const sideWall = new THREE.Mesh(sideWallGeo, sideWallMat);
    sideWall.rotation.y = -side * Math.PI / 2;
    sideWall.position.set(side * 5.5, 2.5, 0);
    sideWall.receiveShadow = true;
    scene.add(sideWall);
  }

  // Ambient hazard lights
  const hazardLight = new THREE.PointLight(0xff6600, 1.2, 5);
  hazardLight.position.set(-4.5, 2.5, 0);
  scene.add(hazardLight);

  const hazardLight2 = new THREE.PointLight(0x0088ff, 0.8, 6);
  hazardLight2.position.set(4, 2, 1);
  scene.add(hazardLight2);
}

export default DesobstrucaoPhysicsSlice;
