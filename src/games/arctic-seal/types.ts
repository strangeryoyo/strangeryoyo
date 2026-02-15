export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  type: 'PLAYER' | 'PREY' | 'PREDATOR' | 'BUBBLE';
  species: string;
  color: string;
  rotation: number;
  value: number; // Score value
}

export interface Player extends Entity {
  oxygen: number;
  maxOxygen: number;
  score: number;
  level: number;
  growth: number; // Progress to next size increase
}

export interface GameConfig {
  surfaceLevel: number;
  gravity: number;
  friction: number;
  oxygenDepletionRate: number;
  oxygenRefillRate: number;
}