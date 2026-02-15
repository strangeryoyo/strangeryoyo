export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LOADING_FACT = 'LOADING_FACT'
}

export enum EntityType {
  PLAYER = 'PLAYER',
  OBSTACLE_GROUND = 'OBSTACLE_GROUND',
  OBSTACLE_AIR = 'OBSTACLE_AIR',
  FOOD = 'FOOD',
  PLATFORM = 'PLATFORM',
  ALIEN_SHIP = 'ALIEN_SHIP',
  LASER = 'LASER'
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Entity {
  id: number;
  type: EntityType;
  subType?: 'BRANCH' | 'BUSH' | 'LOG';
  position: Position;
  size: Size;
  speed: number;
  collided?: boolean;
}

export interface GameConfig {
  gravity: number;
  jumpStrength: number;
  groundHeight: number;
  speedIncrement: number;
  initialSpeed: number;
}

export interface FactResponse {
  fact: string;
  topic: string;
}
