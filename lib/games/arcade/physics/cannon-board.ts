// T113 Physics Core Setup — Cannon.js lightweight board + basic constraints
// Minimal, not full engine — just enough to validate impact feel

import * as CANNON from 'cannon-es';

export interface PhysicsBoard {
  world: CANNON.World;
  bodies: Map<string, CANNON.Body>;
  constraints: CANNON.Constraint[];
  ground: CANNON.Body;
}

export interface ImpactEvent {
  position: CANNON.Vec3;
  force: number;
  targetId: string;
  timestamp: number;
}

export class CannonBoard implements PhysicsBoard {
  world: CANNON.World;
  bodies: Map<string, CANNON.Body>;
  constraints: CANNON.Constraint[];
  ground: CANNON.Body;
  private impactListeners: Set<(event: ImpactEvent) => void>;

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // Standard gravity
    this.world.defaultContactMaterial.friction = 0.3;
    this.world.defaultContactMaterial.restitution = 0.4; // Bouncy but not too much

    this.bodies = new Map();
    this.constraints = [];
    this.impactListeners = new Set();

    // Create ground (invisible, provides collision reference)
    const groundShape = new CANNON.Plane();
    this.ground = new CANNON.Body({ mass: 0, shape: groundShape });
    this.ground.position.y = -5;
    this.world.addBody(this.ground);
    this.bodies.set('ground', this.ground);
  }

  addBody(id: string, body: CANNON.Body, dontAdd?: boolean): void {
    this.bodies.set(id, body);
    if (!dontAdd) {
      this.world.addBody(body);
    }
  }

  removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }

  addConstraint(constraint: CANNON.Constraint): void {
    this.constraints.push(constraint);
    this.world.addConstraint(constraint);
  }

  step(dt: number = 1 / 60): void {
    this.world.step(dt);
  }

  onImpact(listener: (event: ImpactEvent) => void): void {
    this.impactListeners.add(listener);
  }

  offImpact(listener: (event: ImpactEvent) => void): void {
    this.impactListeners.delete(listener);
  }

  notifyImpact(event: ImpactEvent): void {
    this.impactListeners.forEach(listener => listener(event));
  }

  dispose(): void {
    this.world.bodies.forEach(body => this.world.removeBody(body));
    this.bodies.clear();
    this.constraints.forEach(c => this.world.removeConstraint(c));
    this.constraints = [];
    this.impactListeners.clear();
  }
}
