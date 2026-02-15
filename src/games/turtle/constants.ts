
import { LaneType } from './types';

export const GRID_SIZE = 50;
export const LANES_COUNT = 15;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 700;

export const LANE_CONFIGS = [
  { type: LaneType.SAND, color: '#fde68a', density: 0 },
  { type: LaneType.SHALLOW, color: '#67e8f9', density: 0.3, speedRange: [1, 2.5] },
  { type: LaneType.CURRENT, color: '#38bdf8', density: 0.5, speedRange: [3, 5] },
  { type: LaneType.REEF, color: '#2dd4bf', density: 0.2, speedRange: [1.5, 3] },
  { type: LaneType.DEEP, color: '#1e40af', density: 0.4, speedRange: [4, 6] },
];

export const PLAYER_START_POS = {
  x: Math.floor(CANVAS_WIDTH / 2 / GRID_SIZE) * GRID_SIZE,
  y: CANVAS_HEIGHT - GRID_SIZE,
};

export const TURTLE_SIZE = 40;
