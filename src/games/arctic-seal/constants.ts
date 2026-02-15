import { GameConfig } from './types';

export const CONFIG: GameConfig = {
  surfaceLevel: 100, // Y coordinate considered "surface"
  gravity: 0.1, // Slight buoyancy needed maybe?
  friction: 0.96, // Water resistance
  oxygenDepletionRate: 0.12, // Slightly slower depletion
  oxygenRefillRate: 1.8, // Faster refill
};

export const COLORS = {
  waterTop: '#a5d8ff',
  waterBottom: '#003e6b',
  uiText: '#ffffff',
  uiDanger: '#ef4444',
  uiSuccess: '#22c55e',
};

export const FISH_TYPES = [
  { species: 'Krill', radius: 5, color: '#ffb7b2', speed: 1, value: 10, minLevel: 0 },
  { species: 'Sardine', radius: 10, color: '#a2d2ff', speed: 2, value: 25, minLevel: 0 },
  { species: 'Cod', radius: 20, color: '#98f5e1', speed: 2.5, value: 50, minLevel: 1 },
  { species: 'Tuna', radius: 35, color: '#ffcbc1', speed: 3, value: 100, minLevel: 3 },
  { species: 'Shark', radius: 60, color: '#94a3b8', speed: 3.8, value: 500, minLevel: 5 },
  { species: 'Submarine', radius: 90, color: '#334155', speed: 1.8, value: 0, minLevel: 7 }, // Predator
  { species: 'Orca', radius: 120, color: '#1e293b', speed: 4.2, value: 1000, minLevel: 15 },
];

export const INITIAL_PLAYER_RADIUS = 15;
export const MAX_PLAYER_RADIUS = 200;
export const OXYGEN_MAX = 100;
