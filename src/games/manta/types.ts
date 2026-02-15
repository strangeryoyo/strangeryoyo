
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER'
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface Point {
  x: number;
  y: number;
}

export interface StingraySegment extends Point {
  direction: Direction;
}

export interface GameConfig {
  gridSize: number;
  canvasSize: number;
  initialSpeed: number;
  speedIncrement: number;
}
