
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  LOADING = 'LOADING'
}

export enum PlatformType {
  NORMAL = 'NORMAL',
  BOUNCY = 'BOUNCY',
  FRAGILE = 'FRAGILE',
  MOVING = 'MOVING'
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  touched: boolean;
  velocityX?: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  velocityX: number;
  isFacingRight: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  fact: string;
}
