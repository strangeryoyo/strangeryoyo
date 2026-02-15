export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PlayerEntity {
  pos: Position;
  velocity: Position;
  size: Size;
  isGrounded: boolean;
  jumpCount: number;
  hasJetpack: boolean;
  jetpackFuel: number;
  facingRight: boolean;
}

export interface PlatformEntity {
  id: number;
  pos: Position;
  size: Size;
  type: 'branch' | 'stump';
  hasBanana: boolean;
  isCollected: boolean;
  hasSpider: boolean;
  spiderX: number; // Position on platform (0-1)
  spiderDir: number; // Direction: 1 or -1
}

export interface Particle {
  id: number;
  pos: Position;
  velocity: Position;
  life: number;
  color: string;
  size: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  bananas: number;
  highScore: number;
}

export interface JungleWisdom {
  title: string;
  content: string;
}