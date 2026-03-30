// T116 Steel Grate Barrier — second blockage variant for depth validation
// Distinct silhouette and break rhythm from concrete while keeping same core loop

import * as CANNON from 'cannon-es';

export interface SteelGrateBarrierState {
  id: string;
  health: number;
  maxHealth: number;
  isCleared: boolean;
  pieces: SteelGratePiece[];
  targetPosition: CANNON.Vec3;
}

export interface SteelGratePiece {
  id: string;
  body: CANNON.Body;
  initialPosition: CANNON.Vec3;
  size: { w: number; h: number; d: number };
  broken: boolean;
  segmentType: 'slat' | 'brace';
}

export class SteelGrateBarrier {
  state: SteelGrateBarrierState;
  pieces: SteelGratePiece[];
  private damageThreshold: number;
  private breakThreshold: number;

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
      health: options?.maxHealth ?? 120,
      maxHealth: options?.maxHealth ?? 120,
      isCleared: false,
      pieces: [],
      targetPosition: position,
    };

    this.damageThreshold = options?.damageThreshold ?? 12;
    this.breakThreshold = options?.breakThreshold ?? 28;

    this.pieces = this.createPieces(position);
  }

  private createPieces(basePosition: CANNON.Vec3): SteelGratePiece[] {
    const pieces: SteelGratePiece[] = [];

    const slatOffsets = [-0.8, -0.48, -0.16, 0.16, 0.48, 0.8];
    slatOffsets.forEach((xOffset, idx) => {
      const pieceSize = { w: 0.12, h: 1.2, d: 0.18 };
      const shape = new CANNON.Box(
        new CANNON.Vec3(pieceSize.w / 2, pieceSize.h / 2, pieceSize.d / 2)
      );
      const body = new CANNON.Body({
        mass: 32,
        shape,
        linearDamping: 0.34,
        angularDamping: 0.36,
      });

      const piecePos = new CANNON.Vec3(basePosition.x + xOffset, basePosition.y, basePosition.z);
      body.position.copy(piecePos);

      pieces.push({
        id: `${this.state.id}-slat-${idx}`,
        body,
        initialPosition: piecePos,
        size: pieceSize,
        broken: false,
        segmentType: 'slat',
      });
    });

    const braceOffsets = [0.48, -0.48];
    braceOffsets.forEach((yOffset, idx) => {
      const pieceSize = { w: 2.0, h: 0.14, d: 0.18 };
      const shape = new CANNON.Box(
        new CANNON.Vec3(pieceSize.w / 2, pieceSize.h / 2, pieceSize.d / 2)
      );
      const body = new CANNON.Body({
        mass: 26,
        shape,
        linearDamping: 0.28,
        angularDamping: 0.3,
      });

      const piecePos = new CANNON.Vec3(basePosition.x, basePosition.y + yOffset, basePosition.z);
      body.position.copy(piecePos);

      pieces.push({
        id: `${this.state.id}-brace-${idx}`,
        body,
        initialPosition: piecePos,
        size: pieceSize,
        broken: false,
        segmentType: 'brace',
      });
    });

    return pieces;
  }

  registerWithWorld(world: CANNON.World): void {
    this.pieces.forEach(piece => world.addBody(piece.body));
  }

  applyImpact(position: CANNON.Vec3, force: number): void {
    if (this.state.isCleared) return;

    if (force < this.damageThreshold) {
      this.state.health = Math.max(0, this.state.health - 2);
      return;
    }

    const normalizedForce = Math.min(force / this.breakThreshold, 1.2);
    const damageAmount = 10 + normalizedForce * 28;
    this.state.health = Math.max(0, this.state.health - damageAmount);

    this.snapSegments(position, force);

    if (this.state.health <= 0) {
      this.state.isCleared = true;
      this.releaseRemainingSegments();
    }
  }

  private snapSegments(impactPos: CANNON.Vec3, force: number): void {
    const intactSegments = this.pieces.filter(piece => !piece.broken);
    if (intactSegments.length === 0) return;

    const nearest = intactSegments.sort(
      (a, b) => a.body.position.distanceTo(impactPos) - b.body.position.distanceTo(impactPos)
    )[0];
    this.breakSegment(nearest, impactPos, force, 1);

    if (force > this.breakThreshold * 1.12) {
      const sideSegments = intactSegments
        .filter(piece => piece.id !== nearest.id)
        .sort(
          (a, b) =>
            Math.abs(a.body.position.x - nearest.body.position.x) -
            Math.abs(b.body.position.x - nearest.body.position.x)
        )
        .slice(0, 2);

      sideSegments.forEach(piece => this.breakSegment(piece, impactPos, force, 0.65));
    }
  }

  private breakSegment(
    piece: SteelGratePiece,
    impactPos: CANNON.Vec3,
    force: number,
    impulseScale: number
  ): void {
    if (piece.broken) return;

    piece.broken = true;
    const direction = piece.body.position.clone();
    direction.vsub(impactPos, direction);
    if (direction.length() < 0.01) {
      direction.set(Math.random() - 0.5, 0.4, Math.random() - 0.5);
    }
    direction.normalize();

    const lateralBias = piece.segmentType === 'slat' ? 1.2 : 0.8;
    direction.x *= lateralBias;
    direction.y = Math.max(direction.y, 0.22);
    direction.normalize();

    const impulseStrength = (120 + force * 32) * impulseScale;
    const impulse = direction.scale(impulseStrength);

    piece.body.velocity.copy(impulse.scale(0.01));
    piece.body.angularVelocity.set(
      (Math.random() - 0.5) * (piece.segmentType === 'slat' ? 9 : 6),
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 8
    );
  }

  private releaseRemainingSegments(): void {
    this.pieces.forEach(piece => {
      if (piece.broken) return;
      const direction = new CANNON.Vec3(
        (Math.random() - 0.5) * 1.4,
        Math.random() * 0.6 + 0.3,
        Math.random() - 0.5
      );
      direction.normalize();

      const impulse = direction.scale(220 + Math.random() * 90);
      piece.body.velocity.copy(impulse.scale(0.01));
      piece.body.angularVelocity.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 10
      );
      piece.broken = true;
    });
  }

  getPiecePositions(): Array<{ position: CANNON.Vec3; rotation: CANNON.Quaternion }> {
    return this.pieces.map(piece => ({
      position: piece.body.position,
      rotation: piece.body.quaternion,
    }));
  }

  getHealthPercent(): number {
    return Math.max(0, (this.state.health / this.state.maxHealth) * 100);
  }

  isFullyCleared(): boolean {
    return this.state.isCleared;
  }

  dispose(world: CANNON.World): void {
    this.pieces.forEach(piece => world.removeBody(piece.body));
    this.pieces = [];
  }
}