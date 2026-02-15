
export enum LaneType {
  SAND = 'SAND',
  SHALLOW = 'SHALLOW',
  CURRENT = 'CURRENT',
  REEF = 'REEF',
  DEEP = 'DEEP'
}

export interface Position {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  speed: number;
  type: 'CRAB' | 'SHARK' | 'TRASH' | 'BOAT' | 'JELLYFISH';
  direction: 1 | -1;
}

export interface GameState {
  score: number;
  highScore: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
  laneIndex: number;
  turtlePos: Position;
  checkpointPos: Position; // New: Tracks the last reached safe beach
  obstacles: Obstacle[];
}

export interface MarineFact {
  fact: string;
  category: string;
}
