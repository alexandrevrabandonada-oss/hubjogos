// T113 Concrete Barrier — Single blockage type for proof of concept
// Visually breaks apart, shows health state, clear cleared/not-cleared

import * as CANNON from 'cannon-es';

export interface ConcreteBarrierState {
  id: string;
  health: number; // 0–100
  maxHealth: number;
  isCleared: boolean; // health <= 0
  pieces: ConcreteBarrierPiece[];
  targetPosition: CANNON.Vec3; // Where barrier sits
}

export interface ConcreteBarrierPiece {
  id: string;
  body: CANNON.Body;
  initialPosition: CANNON.Vec3;
  size: { w: number; h: number; d: number };
  broken: boolean;
}

export class ConcreteBarrier {
  state: ConcreteBarrierState;
  pieces: ConcreteBarrierPiece[];
  private damageThreshold: number; // Force required to deal damage
  private breakThreshold: number; // Force required to break a piece off

  constructor(
    id: string,
    position: CANNON.Vec3,
    options?: {
      maxHealth?: number;
      damageThreshold?: number;
      breakThreshold?: number;
    }
  ) {
    this.state = {
      id,
      health: options?.maxHealth ?? 100,
      maxHealth: options?.maxHealth ?? 100,
      isCleared: false,
      pieces: [],
      targetPosition: position,
    };

    this.damageThreshold = options?.damageThreshold ?? 15; // ~1.5G force
    this.breakThreshold = options?.breakThreshold ?? 35; // ~3.5G force

    this.pieces = this.createPieces(position);
  }

  private createPieces(basePosition: CANNON.Vec3): ConcreteBarrierPiece[] {
    const pieces: ConcreteBarrierPiece[] = [];

    const piecePositions = [
      { x: -0.5, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.5, y: -0.5 },
      { x: 0.5, y: -0.5 },
    ];

    piecePositions.forEach((offset, idx) => {
      const pieceSize = { w: 0.5, h: 0.5, d: 0.3 };
      const shape = new CANNON.Box(
        new CANNON.Vec3(pieceSize.w / 2, pieceSize.h / 2, pieceSize.d / 2)
      );

      // Pieces are initially connected; on high impact, they break off
      const body = new CANNON.Body({
        mass: 50, // Heavy enough to feel solid
        shape: shape,
        linearDamping: 0.3,
        angularDamping: 0.3,
      });

      const piecePos = new CANNON.Vec3(
        basePosition.x + offset.x,
        basePosition.y + offset.y,
        basePosition.z
      );
      body.position.copy(piecePos);

      const piece: ConcreteBarrierPiece = {
        id: `${this.state.id}-piece-${idx}`,
        body,
        initialPosition: piecePos,
        size: pieceSize,
        broken: false,
      };

      pieces.push(piece);
    });

    return pieces;
  }

  // Register pieces with physics world
  registerWithWorld(world: CANNON.World): void {
    this.pieces.forEach(piece => {
      world.addBody(piece.body);
    });
  }

  // Check impact and deal damage
  applyImpact(position: CANNON.Vec3, force: number): void {
    if (this.state.isCleared) return;

    // Damage threshold check
    if (force < this.damageThreshold) {
      // Whisper damage only
      this.state.health = Math.max(0, this.state.health - 1);
      return;
    }

    // Significant damage
    const normalizedForce = Math.min(force / this.breakThreshold, 1.0);
    const damageAmount = 15 + normalizedForce * 35; // 15–50 damage
    this.state.health = Math.max(0, this.state.health - damageAmount);

    // Check if should break pieces
    if (force > this.breakThreshold) {
      this.breakNearbyPieces(position, force);
    }

    // Check cleared
    if (this.state.health <= 0) {
      this.state.isCleared = true;
      this.explodeAllPieces();
    }
  }

  private breakNearbyPieces(impactPos: CANNON.Vec3, force: number): void {
    const breakRadius = 1.5;

    this.pieces.forEach(piece => {
      if (piece.broken) return;

      const dist = piece.body.position.distanceTo(impactPos);
      if (dist < breakRadius) {
        piece.broken = true;

        // Apply outward impulse to piece
        const direction = piece.body.position.clone();
        direction.vsub(impactPos, direction);
        direction.normalize();

        const impulseStrength = 200 + force * 50;
        const impulse = direction.scale(impulseStrength);

        piece.body.velocity.copy(impulse.scale(0.01)); // Convert to velocity
        piece.body.angularVelocity.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        );
      }
    });
  }

  private explodeAllPieces(): void {
    this.pieces.forEach(piece => {
      const direction = new CANNON.Vec3(
        Math.random() - 0.5,
        Math.random() * 0.5 + 0.3,
        Math.random() - 0.5
      );
      direction.normalize();

      const impulse = direction.scale(300);
      piece.body.velocity.copy(impulse.scale(0.01));
      piece.body.angularVelocity.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      piece.broken = true;
    });
  }

  // Get current positions of pieces (for rendering)
  getPiecePositions(): Array<{ position: CANNON.Vec3; rotation: CANNON.Quaternion }> {
    return this.pieces.map(piece => ({
      position: piece.body.position,
      rotation: piece.body.quaternion,
    }));
  }

  // Get health percentage
  getHealthPercent(): number {
    return Math.max(0, (this.state.health / this.state.maxHealth) * 100);
  }

  // Check if cleared
  isFullyCleared(): boolean {
    return this.state.isCleared;
  }

  // Cleanup
  dispose(world: CANNON.World): void {
    this.pieces.forEach(piece => {
      world.removeBody(piece.body);
    });
    this.pieces = [];
  }
}
