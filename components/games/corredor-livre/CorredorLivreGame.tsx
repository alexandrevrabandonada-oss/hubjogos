'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './CorredorLivreGame.module.css';

// T99 Movement Spike - Core Types
interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facingRight: boolean;
  isJumping: boolean;
  isWallKicking: boolean;
  wallKickTimer: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
}

interface Platform {
  x: number; y: number; w: number; h: number;
  id?: string;
  isFragile?: boolean;
}

interface Prop {
  x: number; y: number; type: 'caixa' | 'antena' | 'varal'; width: number; height: number;
  w?: number; h?: number;
}

interface Wall {
  x: number; y: number; w: number; h: number; kickable: boolean;
}

interface Hazard {
  x: number; y: number; w: number; h: number; type: 'pit' | 'barrier'; active?: boolean;
}

interface GameState {
  player: PlayerState;
  camera: { x: number; y: number };
  segment: number;
  completed: boolean;
  completionTime: number;
  attempts: number;
  fragileStates: Record<string, { touchedAt: number, yOffset: number }>;
}

// Movement Constants (Tuned for Feel)
const MOVEMENT = {
  RUN_ACCEL: 1.2,        // units per frame squared
  RUN_MAX_SPEED: 10,     // units per frame
  RUN_FRICTION: 0.85,    // velocity multiplier
  JUMP_FORCE: -16,       // upward velocity
  GRAVITY: 0.8,          // downward acceleration
  MAX_FALL_SPEED: 18,    // terminal velocity
  COYOTE_TIME: 12,       // frames (200ms at 60fps)
  JUMP_BUFFER: 8,        // frames
  WALL_KICK_FORCE_X: 12, // horizontal push
  WALL_KICK_FORCE_Y: -14, // vertical push
  WALL_KICK_WINDOW: 20,  // frames to input kick (increased for 1.0 fairness)
  WALL_SLIDE_GRAVITY: 0.3, // slower fall on wall
} as const;

// Audio Baseline (Synthesis for Vertical Slice)
const playSound = (type: 'jump' | 'land' | 'wallkick' | 'complete' | 'crumble' | 'checkpoint', soundTimeRef: React.MutableRefObject<Record<string, number>>) => {
  const now = Date.now();
  if (now - (soundTimeRef.current[type] || 0) < 100) return;
  soundTimeRef.current[type] = now;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'wallkick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'land') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'complete') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'crumble') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'checkpoint') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // Ignore audio errors
  }
};

// 7-Segment Level Data (Full Vertical Slice - ~2 mins)
const LEVEL_SEGMENTS: {
  id: string; length: number; endX: number;
  platforms: Platform[]; walls: Wall[]; hazards: Hazard[]; props: Prop[];
  goal?: {x: number; y: number; w: number; h: number;};
}[] = [
  // Segment 0: Opening Run
  {
    id: 'opening', length: 1800, endX: 1750,
    platforms: [
      { x: 0, y: 400, w: 500, h: 40 },
      { x: 550, y: 400, w: 400, h: 40 },
      { x: 1050, y: 380, w: 300, h: 60 },
      { x: 1450, y: 380, w: 400, h: 60 },
    ],
    walls: [], hazards: [],
    props: [
      { x: 200, y: 340, w: 80, h: 60, type: 'caixa', width: 60, height: 60 },
      { x: 700, y: 200, w: 0, h: 0, type: 'varal', width: 100, height: 20 }
    ],
  },
  // Segment 1: The Gap (Max speed check)
  {
    id: 'gap', length: 1400, endX: 1350,
    platforms: [
      { x: 0, y: 380, w: 300, h: 60 },
      { x: 520, y: 400, w: 250, h: 40 },
      { x: 950, y: 350, w: 450, h: 90 },
    ],
    walls: [],
    hazards: [{ x: 0, y: 550, w: 1400, h: 100, type: 'pit' }],
    props: [{ x: 550, y: 300, w: 0, h: 0, type: 'antena', width: 20, height: 100 }],
  },
  // Segment 2: Tower Climb (Double Wall-kick)
  {
    id: 'tower', length: 800, endX: 750,
    platforms: [
      { x: 0, y: 350, w: 150, h: 100 },
      { x: 450, y: 250, w: 100, h: 40 },
      { x: 150, y: 150, w: 100, h: 40 },
      { x: 400, y: 50, w: 400, h: 40 }, // Top
    ],
    walls: [
      { x: 250, y: 180, w: 40, h: 220, kickable: true }, // Left pillar
      { x: 400, y: 50, w: 50, h: 200, kickable: true },  // Right pillar
    ],
    hazards: [{ x: 0, y: 600, w: 800, h: 100, type: 'pit' }],
    props: [{ x: 450, y: -10, w: 0, h: 0, type: 'caixa', width: 60, height: 60 }],
  },
  // Segment 3: Safehouse (Checkpoint)
  {
    id: 'checkpoint', length: 1200, endX: 1150,
    platforms: [
      { x: 0, y: 300, w: 600, h: 150 },
      { x: 650, y: 350, w: 600, h: 100 },
    ],
    walls: [], hazards: [],
    props: [
      { x: 300, y: 200, w: 0, h: 0, type: 'varal', width: 120, height: 20 },
      { x: 800, y: 180, w: 0, h: 0, type: 'antena', width: 20, height: 120 }
    ],
  },
  // Segment 4: The Run-Down (Pressure Beat, fragile blocks)
  {
    id: 'fragile', length: 1500, endX: 1450,
    platforms: [
      { x: 0, y: 350, w: 150, h: 100 },
      { id: 'f1', x: 250, y: 350, w: 100, h: 20, isFragile: true },
      { id: 'f2', x: 400, y: 300, w: 100, h: 20, isFragile: true },
      { id: 'f3', x: 550, y: 250, w: 100, h: 20, isFragile: true },
      { x: 700, y: 300, w: 200, h: 40 },
      { id: 'f4', x: 950, y: 300, w: 150, h: 20, isFragile: true },
      { x: 1150, y: 300, w: 400, h: 40 },
    ],
    walls: [],
    hazards: [
      { x: 0, y: 600, w: 1600, h: 100, type: 'pit' },
      { x: 750, y: 240, w: 80, h: 60, type: 'barrier', active: true } // Police barrier mid-run
    ],
    props: [],
  },
  // Segment 5: The Drop (Precision Descent)
  {
    id: 'descent', length: 600, endX: 550,
    platforms: [
      { x: 0, y: 300, w: 150, h: 800 }, // Left building edge
      { x: 450, y: 300, w: 150, h: 800 }, // Right building edge
      { x: 250, y: 500, w: 100, h: 20 }, // Mid buffer
      { x: 0, y: 800, w: 600, h: 200 },  // Bottom catching floor
    ],
    walls: [
      { x: 110, y: 300, w: 40, h: 500, kickable: true }, // Slide surface left
      { x: 450, y: 300, w: 40, h: 500, kickable: true }  // Slide surface right
    ],
    hazards: [],
    props: [{ x: 200, y: 400, w: 0, h: 0, type: 'varal', width: 200, height: 20 }],
  },
  // Segment 6: Delivery
  {
    id: 'delivery', length: 800, endX: 800,
    platforms: [
      { x: 0, y: 400, w: 800, h: 50 },
    ],
    walls: [], hazards: [],
    props: [{ x: 500, y: 300, w: 0, h: 0, type: 'antena', width: 20, height: 100 }],
    goal: { x: 600, y: 340, w: 120, h: 60 },
  },
];

export function CorredorLivreGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const soundTimeRef = useRef<Record<string, number>>({});
  
  const [, setGameState] = useState<GameState>({
    player: {
      x: 50,
      y: 360,
      vx: 0,
      vy: 0,
      onGround: false,
      facingRight: true,
      isJumping: false,
      isWallKicking: false,
      wallKickTimer: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
    },
    camera: { x: 0, y: 0 },
    segment: 0,
    completed: false,
    completionTime: 0,
    attempts: 0,
    fragileStates: {},
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const [runTimes, setRunTimes] = useState<number[]>([]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls for mobile
  const handleTouch = useCallback((action: 'left' | 'right' | 'jump') => {
    if (action === 'left') {
      keysRef.current.add('ArrowLeft');
      setTimeout(() => keysRef.current.delete('ArrowLeft'), 100);
    } else if (action === 'right') {
      keysRef.current.add('ArrowRight');
      setTimeout(() => keysRef.current.delete('ArrowRight'), 100);
    } else if (action === 'jump') {
      keysRef.current.add(' ');
      setTimeout(() => keysRef.current.delete(' '), 100);
    }
  }, []);

  // Physics and game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let segmentStartTime = Date.now();

    const checkCollision = (x: number, y: number, w: number, h: number, 
                            px: number, py: number, pw: number, ph: number) => {
      return x < px + pw && x + w > px && y < py + ph && y + h > py;
    };

    const gameLoop = () => {
      setGameState(prev => {
        const state = { ...prev };
        const player = { ...state.player };
        const keys = keysRef.current;
        const segment = LEVEL_SEGMENTS[state.segment];

        // --- INPUT HANDLING ---
        const left = keys.has('ArrowLeft') || keys.has('a');
        const right = keys.has('ArrowRight') || keys.has('d');
        const jumpPressed = keys.has(' ') || keys.has('ArrowUp') || keys.has('w');

        // Debug Warps
        if (keys.has('1')) { state.segment = 0; player.x = 50; player.y = 360; player.vx = 0; player.vy = 0; keys.delete('1'); }
        if (keys.has('2')) { state.segment = 1; player.x = 50; player.y = 360; player.vx = 0; player.vy = 0; keys.delete('2'); }
        if (keys.has('3')) { state.segment = 2; player.x = 50; player.y = 260; player.vx = 0; player.vy = 0; keys.delete('3'); }
        if (keys.has('4')) { state.segment = 3; player.x = 50; player.y = 260; player.vx = 0; player.vy = 0; keys.delete('4'); }

        // --- HORIZONTAL MOVEMENT ---
        if (left) {
          player.vx -= MOVEMENT.RUN_ACCEL;
          player.facingRight = false;
        }
        if (right) {
          player.vx += MOVEMENT.RUN_ACCEL;
          player.facingRight = true;
        }

        // Friction
        if (!left && !right) {
          player.vx *= MOVEMENT.RUN_FRICTION;
        }

        // Max speed cap
        player.vx = Math.max(-MOVEMENT.RUN_MAX_SPEED, Math.min(MOVEMENT.RUN_MAX_SPEED, player.vx));

        // --- JUMP HANDLING ---
        // Jump buffer
        if (jumpPressed && !player.isJumping) {
          player.jumpBufferTimer = MOVEMENT.JUMP_BUFFER;
        } else if (player.jumpBufferTimer > 0) {
          player.jumpBufferTimer--;
        }

        // Coyote time
        if (player.onGround) {
          player.coyoteTimer = MOVEMENT.COYOTE_TIME;
        } else if (player.coyoteTimer > 0) {
          player.coyoteTimer--;
        }

        // Execute jump
        if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0 && !player.isJumping) {
          player.vy = MOVEMENT.JUMP_FORCE;
          player.isJumping = true;
          player.onGround = false;
          player.jumpBufferTimer = 0;
          player.coyoteTimer = 0;
          playSound('jump', soundTimeRef);
        }

        // Variable jump height (release early = lower)
        if (!jumpPressed && player.vy < 0 && player.isJumping) {
          player.vy *= 0.6; // Cut jump short
        }

        // --- WALL-KICK HANDLING ---
        let onWall = false;
        let wallX = 0;
        
        for (const wall of segment.walls) {
          // Expanded hit box for wall detection (T102 fairness pass: 12px)
          if (checkCollision(wall.x, wall.y, wall.w, wall.h, 
                           player.x - 12, player.y, 72, 64)) {
            onWall = true;
            wallX = wall.x;
            break;
          }
        }

        if (onWall && wallX > 0 && !player.onGround) {
          // Wall slide (slower gravity)
          player.vy = Math.min(player.vy, 4); // Cap fall speed on wall
          
          // Wall kick input
          const kickDirection = wallX > player.x ? -1 : 1; // Kick away from wall
          
          // Forgiveness: removed towardWall constraint to trigger more easily
          if (jumpPressed && !player.isWallKicking) {
            player.vx = MOVEMENT.WALL_KICK_FORCE_X * kickDirection;
            player.vy = MOVEMENT.WALL_KICK_FORCE_Y;
            player.isWallKicking = true;
            player.wallKickTimer = MOVEMENT.WALL_KICK_WINDOW;
            player.facingRight = kickDirection > 0;
            playSound('wallkick', soundTimeRef);
          }
        } else {
          player.isWallKicking = false;
        }

        if (player.wallKickTimer > 0) {
          player.wallKickTimer--;
          if (player.wallKickTimer === 0) {
            player.isWallKicking = false;
          }
        }

        // --- GRAVITY ---
        if (!player.onGround) {
          player.vy += MOVEMENT.GRAVITY;
          player.vy = Math.min(player.vy, MOVEMENT.MAX_FALL_SPEED);
        }

        // --- POSITION UPDATE ---
        player.x += player.vx;
        player.y += player.vy;

        // --- FRAGILE PLATFORMS CALCULATION ---
        const now = Date.now();
        const activePlatforms = [...segment.platforms];
        for (let i = 0; i < activePlatforms.length; i++) {
          const plat = activePlatforms[i];
          if (plat.isFragile && plat.id && state.fragileStates[plat.id]) {
            const age = now - state.fragileStates[plat.id].touchedAt;
            if (age > 500) {
              activePlatforms[i] = { ...plat, y: plat.y + 1000 };
            } else if (age > 250) {
              const drop = Math.pow(age - 250, 2) * 0.005;
              activePlatforms[i] = { ...plat, y: plat.y + drop };
            }
          }
        }

        // --- PLATFORM COLLISION ---
        player.onGround = false;
        
        for (const platform of activePlatforms) {
          // Check landing on top
          const wasAbove = (player.y + 64 - player.vy) <= platform.y;
          const nowInside = checkCollision(platform.x, platform.y, platform.w, platform.h,
                                         player.x, player.y, 48, 64);
          
          if (wasAbove && nowInside && player.vy >= 0) {
            if (platform.isFragile && platform.id && !state.fragileStates[platform.id]) {
              state.fragileStates[platform.id] = { touchedAt: Date.now(), yOffset: 0 };
              playSound('crumble', soundTimeRef);
            }
            if (!player.onGround && player.vy > 5) {
              playSound('land', soundTimeRef);
              player.vx *= 0.5; // Landing impact friction
            }
            player.y = platform.y - 64;
            player.vy = 0;
            player.onGround = true;
            player.isJumping = false;
            player.isWallKicking = false;
          }
          
          // Check hitting ceiling
          const wasBelow = (player.y - player.vy) >= (platform.y + platform.h);
          if (wasBelow && nowInside && player.vy < 0) {
            player.y = platform.y + platform.h;
            player.vy = 0;
          }
          
          // Side collision (simplified)
          if (nowInside && !wasAbove && !wasBelow) {
            if (player.vx > 0) {
              player.x = platform.x - 48;
              player.vx = 0;
            } else if (player.vx < 0) {
              player.x = platform.x + platform.w;
              player.vx = 0;
            }
          }
        }

        // --- HAZARD COLLISION ---
        for (const hazard of segment.hazards) {
          if (hazard.type === 'pit') {
            // Fall into pit = reset
            if (player.y > hazard.y) {
              player.x = 50;
              player.y = 360;
              player.vx = 0;
              player.vy = 0;
              state.attempts++;
            }
          } else if (hazard.type === 'barrier') {
            // Low barrier - must jump over
            if (checkCollision(hazard.x, hazard.y, hazard.w, hazard.h,
                             player.x, player.y, 48, 64)) {
              // Push back
              if (player.vx > 0) {
                player.x = hazard.x - 48;
              } else {
                player.x = hazard.x + hazard.w;
              }
              player.vx = -player.vx * 0.5; // Bounce back
            }
          }
        }

        // --- GOAL CHECK ---
        if (segment.goal) {
          if (checkCollision(segment.goal.x, segment.goal.y, segment.goal.w, segment.goal.h,
                           player.x, player.y, 48, 64)) {
            if (!state.completed) {
              const time = (Date.now() - segmentStartTime) / 1000;
              state.completionTime = time;
              state.completed = true;
              setRunTimes(times => [...times, time]);
              playSound('complete', soundTimeRef);
            }
          }
        }

        // --- SEGMENT PROGRESSION ---
        if (player.x > segment.endX && state.segment < LEVEL_SEGMENTS.length - 1) {
          state.segment++;
          player.x = 50;
          player.y = 260; // default start y for most segments
          if (state.segment === 1) player.y = 360;
          if (state.segment === 2) player.y = 300;
          if (state.segment === 5) player.y = 200;
          
          player.vx = 0;
          player.vy = 0;
          segmentStartTime = Date.now();
          playSound('checkpoint', soundTimeRef);
        }

        // --- CAMERA FOLLOW ---
        const targetCamX = player.x - 300;
        state.camera.x += (targetCamX - state.camera.x) * 0.1;
        state.camera.y = -100; // Fixed vertical offset

        // Keep camera in segment bounds
        const maxCamX = segment.length - 800;
        state.camera.x = Math.max(0, Math.min(state.camera.x, Math.max(0, maxCamX)));

        state.player = player;
        return state;
      });

      // --- RENDER ---
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 800, 450);

      setGameState(currentState => {
        const { player, camera, segment, completed } = currentState;
        const segData = LEVEL_SEGMENTS[segment];

        // Draw parallax background
        // Far layer (sky gradient)
        const isSunset = segment >= 4;
        const gradient = ctx.createLinearGradient(0, 0, 0, 450);
        if (isSunset) {
          gradient.addColorStop(0, '#2b1b3d');
          gradient.addColorStop(0.5, '#bd4b4b');
          gradient.addColorStop(1, '#ff9a44');
        } else {
          gradient.addColorStop(0, '#87CEEB');
          gradient.addColorStop(0.5, '#FFE4B5');
          gradient.addColorStop(1, '#FF8C69');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 450);

        // Mid layer (city silhouette - parallax 0.3x)
        ctx.fillStyle = '#4A5568';
        const cityOffset = -camera.x * 0.3;
        for (let i = 0; i < 5; i++) {
          const x = (i * 300 + cityOffset) % 1200;
          ctx.fillRect(x, 200, 80, 250);
          ctx.fillRect(x + 100, 150, 60, 300);
        }

        // Near layer (houses - parallax 0.6x)
        ctx.fillStyle = '#F6AD55';
        const houseOffset = -camera.x * 0.6;
        for (let i = 0; i < 4; i++) {
          const x = (i * 400 + houseOffset) % 1600;
          ctx.fillRect(x, 250, 120, 100);
          ctx.fillStyle = i % 2 === 0 ? '#F687B3' : '#68D391';
        }
        ctx.fillStyle = '#F6AD55';

        // Draw platforms
        for (const plat of segData.platforms) {
          const screenX = plat.x - camera.x;
          let renderY = plat.y - camera.y;

          if (plat.isFragile && plat.id && currentState.fragileStates[plat.id]) {
            const age = Date.now() - currentState.fragileStates[plat.id].touchedAt;
            if (age > 500) continue; // Don't render if it fell
            if (age > 250) {
              renderY += Math.pow(age - 250, 2) * 0.005;
            } else {
              renderY += Math.sin(age * 0.5) * 3; // Aggressive shake
              // Flicker logic for T102 fairness
              if (Math.floor(age / 50) % 2 === 0) {
                ctx.fillStyle = '#FFFFFF'; // Flash white
                ctx.fillRect(screenX, renderY, plat.w, plat.h);
                continue;
              }
            }
          }

          if (screenX > -plat.w && screenX < 800) {
            ctx.fillStyle = plat.isFragile ? '#C53030' : '#A0A0A0';
            ctx.fillRect(screenX, renderY, plat.w, plat.h);
            // Top highlight
            ctx.fillStyle = plat.isFragile ? '#E53E3E' : '#B8B8B8';
            ctx.fillRect(screenX, renderY, plat.w, 4);
          }
        }

        // Draw Props
        for (const prop of segData.props) {
          const screenX = prop.x - camera.x;
          if (screenX > -prop.width && screenX < 800) {
            if (prop.type === 'caixa') {
              ctx.fillStyle = '#3182CE';
              ctx.fillRect(screenX, prop.y - camera.y, prop.width, prop.height);
              ctx.fillStyle = '#2B6CB0';
              ctx.fillRect(screenX, prop.y - camera.y, prop.width, 10);
            } else if (prop.type === 'antena') {
              ctx.strokeStyle = '#CBD5E0';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(screenX + prop.width/2, prop.y - camera.y + prop.height);
              ctx.lineTo(screenX + prop.width/2, prop.y - camera.y);
              ctx.moveTo(screenX, prop.y - camera.y + 20);
              ctx.lineTo(screenX + prop.width, prop.y - camera.y + 10);
              ctx.moveTo(screenX + 5, prop.y - camera.y + 40);
              ctx.lineTo(screenX + prop.width - 5, prop.y - camera.y + 35);
              ctx.stroke();
            } else if (prop.type === 'varal') {
              ctx.strokeStyle = '#CBD5E0';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(screenX, prop.y - camera.y);
              ctx.quadraticCurveTo(screenX + prop.width/2, prop.y - camera.y + 20, screenX + prop.width, prop.y - camera.y);
              ctx.stroke();
              ctx.fillStyle = '#FC8181';
              ctx.fillRect(screenX + 20, prop.y - camera.y + 5, 15, 20);
              ctx.fillStyle = '#63B3ED';
              ctx.fillRect(screenX + 50, prop.y - camera.y + 10, 20, 20);
            }
          }
        }

        // Draw walls (wall-kick surfaces)
        for (const wall of segData.walls) {
          const screenX = wall.x - camera.x;
          if (screenX > -wall.w && screenX < 800) {
            ctx.fillStyle = '#808080';
            ctx.fillRect(screenX, wall.y - camera.y, wall.w, wall.h);
            // Wall-kick zone highlight
            if (wall.kickable) {
              ctx.strokeStyle = '#FFD93D';
              ctx.lineWidth = 2;
              ctx.strokeRect(screenX, wall.y - camera.y, wall.w, wall.h);
            }
          }
        }

        // Draw hazards
        for (const hazard of segData.hazards) {
          const screenX = hazard.x - camera.x;
          if (hazard.type === 'barrier') {
            // Police barrier
            ctx.fillStyle = '#FF0000';
            ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.4;
            ctx.fillRect(screenX, hazard.y - camera.y, hazard.w, hazard.h);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.fillText('BARRIER', screenX + 20, hazard.y - camera.y - 5);
          }
        }

        // Draw goal
        if (segData.goal) {
          const screenX = segData.goal.x - camera.x;
          ctx.fillStyle = completed ? '#FFD93D' : '#FFA500';
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 300) * 0.4;
          ctx.fillRect(screenX, segData.goal.y - camera.y, segData.goal.w, segData.goal.h);
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px Arial';
          ctx.fillText(completed ? 'COMPLETE!' : 'GOAL', screenX + 5, segData.goal.y - camera.y - 10);
        }

        // Draw player (64px character)
        const playerScreenX = player.x - camera.x;
        const playerScreenY = player.y - camera.y;
        
        // Body (orange hoodie)
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(playerScreenX, playerScreenY, 48, 48);
        
        // Head/hood (darker orange)
        ctx.fillStyle = '#E55A2B';
        ctx.fillRect(playerScreenX + 8, playerScreenY - 16, 32, 20);
        
        // Legs (dark pants)
        ctx.fillStyle = '#2D2D2D';
        ctx.fillRect(playerScreenX + 4, playerScreenY + 48, 18, 16);
        ctx.fillRect(playerScreenX + 26, playerScreenY + 48, 18, 16);
        
        // Backpack (messenger bag)
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(player.facingRight ? playerScreenX - 8 : playerScreenX + 40, 
                     playerScreenY + 12, 12, 24);
        
        // Facing indicator
        ctx.fillStyle = '#FFFFFF';
        if (player.facingRight) {
          ctx.fillRect(playerScreenX + 36, playerScreenY + 8, 8, 8);
        } else {
          ctx.fillRect(playerScreenX + 4, playerScreenY + 8, 8, 8);
        }

        // Wall-kick effect
        if (player.isWallKicking) {
          ctx.strokeStyle = '#FFD93D';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(playerScreenX + 24, playerScreenY + 32, 40, 0, Math.PI * 2);
          ctx.stroke();
        }

        // HUD
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.fillText(`Segment: ${segment + 1}/7`, 10, 30);
        ctx.fillText(`Attempts: ${currentState.attempts}`, 10, 55);
        if (completed) {
          ctx.fillStyle = '#FFD93D';
          ctx.font = '20px Arial';
          ctx.fillText(`COMPLETED! Time: ${currentState.completionTime.toFixed(2)}s`, 250, 40);
        }

        // Best time
        if (runTimes.length > 0) {
          const best = Math.min(...runTimes);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px Arial';
          ctx.fillText(`Best: ${best.toFixed(2)}s`, 10, 80);
        }

        return currentState;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [runTimes]);

  const resetGame = () => {
    setGameState({
      player: {
        x: 50,
        y: 360,
        vx: 0,
        vy: 0,
        onGround: false,
        facingRight: true,
        isJumping: false,
        isWallKicking: false,
        wallKickTimer: 0,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
      },
      camera: { x: 0, y: 0 },
      segment: 0,
      completed: false,
      completionTime: 0,
      attempts: 0,
      fragileStates: {},
    });
    setRunTimes([]);
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <h1>CORREDOR LIVRE</h1>
        <p>T102 Surgical Polish — Flagship Candidate Final Retest</p>
      </div>
      
      {showInstructions && (
        <div className={styles.instructions}>
          <button className={styles.closeBtn} onClick={() => setShowInstructions(false)}>×</button>
          <h3>Controls</h3>
          <p><strong>Desktop:</strong> Arrow Keys / WASD = Move, Space = Jump</p>
          <p><strong>Mobile:</strong> Use buttons below</p>
          <p>Jump toward walls to wall-kick!</p>
          <p>Reach the goal in segment 4.</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className={styles.gameCanvas}
      />

      <div className={styles.mobileControls}>
        <div className={styles.dirControls}>
          <button 
            className={styles.controlBtn}
            onTouchStart={() => handleTouch('left')}
            onMouseDown={() => handleTouch('left')}
          >
            ←
          </button>
          <button 
            className={styles.controlBtn}
            onTouchStart={() => handleTouch('right')}
            onMouseDown={() => handleTouch('right')}
          >
            →
          </button>
        </div>
        <button 
          className={`${styles.controlBtn} ${styles.jumpBtn}`}
          onTouchStart={() => handleTouch('jump')}
          onMouseDown={() => handleTouch('jump')}
        >
          JUMP
        </button>
      </div>

      <div className={styles.controls}>
        <button className={styles.resetBtn} onClick={resetGame}>Reset Run</button>
        <button className={styles.helpBtn} onClick={() => setShowInstructions(true)}>Help</button>
      </div>

      <div className={styles.feedback}>
        <p>Movement tuning active: Coyote time + Jump buffer enabled</p>
        <p>Wall-kick: Jump while touching wall + pressing away</p>
      </div>
    </div>
  );
}
