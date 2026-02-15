
export interface PandaState {
  x: number;
  y: number;
  size: number;
  targetSize: number;
  angle: number;
  vx: number;
  vy: number;
}

export interface Bamboo {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface Tiger {
  id: string;
  x: number;
  y: number;
  size: number;
  angle: number;
  vx: number;
  vy: number;
}

export interface GameState {
  totalEaten: number;
  currentSize: number;
  level: number;
  isGameOver: boolean;
  message: string;
}
