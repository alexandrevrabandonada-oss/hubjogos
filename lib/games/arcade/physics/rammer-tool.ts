// T113 Rammer Tool — Pneumatic breaker projectile
// Heavy, direct, satisfying on impact. Clear silhouette, readable arc, weight feeling

import * as CANNON from 'cannon-es';

export interface RammerState {
  id: string;
  position: CANNON.Vec3;
  velocity: CANNON.Vec3;
  rotation: CANNON.Quaternion;
  isActive: boolean; // Still in flight
  cannonBody: CANNON.Body;
  impact: {
    hasHit: boolean;
    hitForce: number;
    hitPosition?: CANNON.Vec3;
    hitTargetId?: string;
  };
}

export interface RammerAim {
  angle: number; // Degrees from horizontal (0–90)
  power: number; // 0–1 scale
}

export class RammerTool {
  state: RammerState;
  baseVelocity: number = 25; // ~2.3G equivalent
  mass: number = 80; // Heavy tool

  constructor(launchPosition: CANNON.Vec3, aim: RammerAim) {
    // Convert aim (angle, power) to velocity vector
    const angleRad = (aim.angle * Math.PI) / 180;
    const velocityMagnitude = aim.power * this.baseVelocity;

    const velocity = new CANNON.Vec3(
      Math.cos(angleRad) * velocityMagnitude,
      Math.sin(angleRad) * velocityMagnitude,
      0
    );

    // Create Rammer physics body
    const shape = new CANNON.Box(new CANNON.Vec3(0.15, 0.08, 0.08)); // Wedge-like
    const body = new CANNON.Body({
      mass: this.mass,
      shape: shape,
      linearDamping: 0.1,
      angularDamping: 0.1,
    });

    body.position.copy(launchPosition);
    body.velocity.copy(velocity);

    // Spin on launch for visual interest
    body.angularVelocity.set(0, 0, Math.random() * 2 - 1);

    this.state = {
      id: `rammer-${Date.now()}-${Math.random()}`,
      position: launchPosition.clone(),
      velocity: velocity,
      rotation: new CANNON.Quaternion(),
      isActive: true,
      cannonBody: body,
      impact: {
        hasHit: false,
        hitForce: 0,
      },
    };
  }

  // Register with physics world
  registerWithWorld(world: CANNON.World): void {
    world.addBody(this.state.cannonBody);
  }

  // Update state from physics (called each frame)
  updateFromPhysics(): void {
    this.state.position.copy(this.state.cannonBody.position);
    this.state.rotation.copy(this.state.cannonBody.quaternion);
    this.state.velocity.copy(this.state.cannonBody.velocity);
  }

  // Check if Rammer has left the play area (falloff)
  isOutOfBounds(bounds: { minY: number; maxDistance: number }): boolean {
    if (this.state.position.y < bounds.minY) return true;
    if (this.state.position.length() > bounds.maxDistance) return true;
    return false;
  }

  // Calculate impact force on collision
  getImpactForce(targetBody: CANNON.Body): number {
    // Force = mass × velocity
    const relativeVelocity = this.state.velocity.clone();
    relativeVelocity.vsub(targetBody.velocity, relativeVelocity);
    const speedMagnitude = relativeVelocity.length();

    // Equivalent G-force: speed / 9.82 m/s²
    const gForce = speedMagnitude / 9.82;
    const force = this.mass * gForce;

    return force; // Units: ~newtons equivalent
  }

  // Register collision (call when physics detects hit)
  recordImpact(targetId: string, force: number, position: CANNON.Vec3): void {
    this.state.impact.hasHit = true;
    this.state.impact.hitForce = force;
    this.state.impact.hitTargetId = targetId;
    this.state.impact.hitPosition = position.clone();
    this.state.isActive = false; // Rammer stops flying
  }

  // Get impact data for FX
  getImpactData(): { force: number; position: CANNON.Vec3; gForce: number } {
    return {
      force: this.state.impact.hitForce,
      position: this.state.impact.hitPosition || this.state.position.clone(),
      gForce: this.state.impact.hitForce / this.mass,
    };
  }

  // Get trajectory data for aiming preview
  static getTrajectoryPreview(
    launchPos: CANNON.Vec3,
    aim: RammerAim,
    stepCount: number = 20
  ): CANNON.Vec3[] {
    const angleRad = (aim.angle * Math.PI) / 180;
    const baseVelocity = 25;
    const velocityMagnitude = aim.power * baseVelocity;
    const gravity = 9.82;

    const trajectory: CANNON.Vec3[] = [];
    const timeStep = 0.05; // Preview every 50ms

    for (let i = 0; i < stepCount; i++) {
      const t = i * timeStep;
      const x = launchPos.x + Math.cos(angleRad) * velocityMagnitude * t;
      const y = launchPos.y + (Math.sin(angleRad) * velocityMagnitude * t - 0.5 * gravity * t * t);
      trajectory.push(new CANNON.Vec3(x, y, launchPos.z));
    }

    return trajectory;
  }

  // Cleanup
  dispose(world: CANNON.World): void {
    if (world.bodies.includes(this.state.cannonBody)) {
      world.removeBody(this.state.cannonBody);
    }
  }
}
