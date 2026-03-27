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

interface GameState {
  player: PlayerState;
  camera: { x: number; y: number };
  segment: number; // 0-3 for the 4 segments
  completed: boolean;
  completionTime: number;
  attempts: number;
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
  WALL_KICK_WINDOW: 10,  // frames to input kick
  WALL_SLIDE_GRAVITY: 0.3, // slower fall on wall
} as const;

// 4-Segment Level Data (1-minute spike)
const LEVEL_SEGMENTS = [
  // Segment 0: Opening Run (15s) - Flat run with 2 small gaps
  {
    id: 'opening',
    length: 1600,
    platforms: [
      { x: 0, y: 400, w: 400, h: 40 },    // Start platform
      { x: 480, y: 400, w: 300, h: 40 },  // After gap 1
      { x: 880, y: 400, w: 300, h: 40 },  // After gap 2
      { x: 1280, y: 400, w: 320, h: 40 }, // End
    ],
    walls: [],
    hazards: [],
    endX: 1550,
  },
  // Segment 1: Vertical Kick (20s) - Wall-kick section
  {
    id: 'vertical',
    length: 600,
    platforms: [
      { x: 0, y: 400, w: 150, h: 40 },    // Start
      { x: 450, y: 250, w: 150, h: 40 },  // Mid platform
      { x: 200, y: 100, w: 200, h: 40 },  // Top platform (goal)
    ],
    walls: [
      { x: 300, y: 100, w: 40, h: 300, kickable: true }, // Main wall
    ],
    hazards: [
      { x: 0, y: 500, w: 600, h: 100, type: 'pit' }, // Bottom pit
    ],
    endX: 550,
  },
  // Segment 2: Hazard Pass (15s) - One obstacle
  {
    id: 'hazard',
    length: 800,
    platforms: [
      { x: 0, y: 300, w: 250, h: 40 },    // Start
      { x: 350, y: 300, w: 200, h: 40 },  // After hazard
      { x: 650, y: 300, w: 150, h: 40 },  // End
    ],
    walls: [],
    hazards: [
      { x: 250, y: 240, w: 100, h: 60, type: 'barrier', active: true }, // Low barrier
    ],
    endX: 750,
  },
  // Segment 3: Delivery (10s) - Final run to goal
  {
    id: 'delivery',
    length: 400,
    platforms: [
      { x: 0, y: 300, w: 400, h: 40 },    // Final platform
    ],
    walls: [],
    hazards: [],
    goal: { x: 350, y: 240, w: 50, h: 60 },
    endX: 400,
  },
];

export function CorredorLivreGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  
  const [gameState, setGameState] = useState<GameState>({
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

    let lastTime = 0;
    let segmentStartTime = Date.now();

    const checkCollision = (x: number, y: number, w: number, h: number, 
                            px: number, py: number, pw: number, ph: number) => {
      return x < px + pw && x + w > px && y < py + ph && y + h > py;
    };

    const gameLoop = (currentTime: number) => {
      const _deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setGameState(prev => {
        const state = { ...prev };
        const player = { ...state.player };
        const keys = keysRef.current;
        const segment = LEVEL_SEGMENTS[state.segment];

        // --- INPUT HANDLING ---
        const left = keys.has('ArrowLeft') || keys.has('a');
        const right = keys.has('ArrowRight') || keys.has('d');
        const jumpPressed = keys.has(' ') || keys.has('ArrowUp') || keys.has('w');

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
        }

        // Variable jump height (release early = lower)
        if (!jumpPressed && player.vy < 0 && player.isJumping) {
          player.vy *= 0.6; // Cut jump short
        }

        // --- WALL-KICK HANDLING ---
        let onWall = false;
        let wallX = 0;
        
        for (const wall of segment.walls) {
          if (checkCollision(wall.x, wall.y, wall.w, wall.h, 
                           player.x, player.y, 48, 64)) {
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
          const towardWall = (wallX > player.x && right) || (wallX < player.x && left);
          
          if (jumpPressed && !player.isWallKicking && !towardWall) {
            player.vx = MOVEMENT.WALL_KICK_FORCE_X * kickDirection;
            player.vy = MOVEMENT.WALL_KICK_FORCE_Y;
            player.isWallKicking = true;
            player.wallKickTimer = MOVEMENT.WALL_KICK_WINDOW;
            player.facingRight = kickDirection > 0;
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

        // --- PLATFORM COLLISION ---
        player.onGround = false;
        
        for (const platform of segment.platforms) {
          // Check landing on top
          const wasAbove = (player.y + 64 - player.vy) <= platform.y;
          const nowInside = checkCollision(platform.x, platform.y, platform.w, platform.h,
                                         player.x, player.y, 48, 64);
          
          if (wasAbove && nowInside && player.vy >= 0) {
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
            }
          }
        }

        // --- SEGMENT PROGRESSION ---
        if (player.x > segment.endX && state.segment < LEVEL_SEGMENTS.length - 1) {
          state.segment++;
          player.x = 50;
          player.y = state.segment === 1 ? 360 : 260;
          player.vx = 0;
          player.vy = 0;
          segmentStartTime = Date.now();
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
        const gradient = ctx.createLinearGradient(0, 0, 0, 450);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#FFE4B5');
        gradient.addColorStop(1, '#FF8C69');
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
        ctx.fillStyle = '#A0A0A0';
        for (const plat of segData.platforms) {
          const screenX = plat.x - camera.x;
          if (screenX > -plat.w && screenX < 800) {
            ctx.fillRect(screenX, plat.y - camera.y, plat.w, plat.h);
            // Top highlight
            ctx.fillStyle = '#B8B8B8';
            ctx.fillRect(screenX, plat.y - camera.y, plat.w, 4);
            ctx.fillStyle = '#A0A0A0';
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
        ctx.fillText(`Segment: ${segment + 1}/4`, 10, 30);
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
    });
    setRunTimes([]);
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <h1>CORREDOR LIVRE</h1>
        <p>T99 Movement Spike — 1-Minute Prototype</p>
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
        <button 
          className={styles.controlBtn}
          onTouchStart={() => handleTouch('left')}
          onMouseDown={() => handleTouch('left')}
        >
          ←
        </button>
        <button 
          className={styles.controlBtn}
          onTouchStart={() => handleTouch('jump')}
          onMouseDown={() => handleTouch('jump')}
        >
          JUMP
        </button>
        <button 
          className={styles.controlBtn}
          onTouchStart={() => handleTouch('right')}
          onMouseDown={() => handleTouch('right')}
        >
          →
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
