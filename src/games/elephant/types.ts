import { Vector3 } from 'three';

export interface Bird {
  id: string;
  position: Vector3;
  velocity: Vector3;
  color: string;
  isHit: boolean;
}

export interface Projectile {
  id: string;
  position: Vector3;
  velocity: Vector3;
  createdAt: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  threshold: number;
  unlocked: boolean;
}

export interface GameState {
  score: number;
  waterLevel: number; // 0 to 100
  isPlaying: boolean;
  gameOver: boolean;
  upgrades: Upgrade[];
  pointMultiplier: number;
  maxWater: number;
  shootCooldown: number;
  projectileSize: number;
  tripleShot: boolean;
}

export interface Predator {
  id: string;
  position: Vector3;
  velocity: Vector3;
  type: 'lion' | 'crocodile';
  isHit: boolean;
}

export interface ElephantState {
  position: Vector3;
  rotation: number;
  isMoving: boolean;
  isShooting: boolean;
}

export const DEFAULT_UPGRADES: Upgrade[] = [
  { id: 'fast-shot', name: 'Rapid Fire', description: 'Shoot 50% faster', threshold: 5, unlocked: false },
  { id: 'double-points', name: 'Double Points', description: '2x score per bird', threshold: 10, unlocked: false },
  { id: 'big-tank', name: 'Big Tank', description: '50% more water capacity', threshold: 20, unlocked: false },
  { id: 'big-splash', name: 'Big Splash', description: 'Larger projectiles', threshold: 35, unlocked: false },
  { id: 'triple-shot', name: 'Triple Shot', description: 'Fire 3 projectiles at once', threshold: 50, unlocked: false },
];
