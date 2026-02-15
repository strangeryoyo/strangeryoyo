
export interface MazeCell {
  x: number;
  y: number;
  visited: boolean;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

export interface MazeConfig {
  width: number;
  height: number;
  cellSize: number;
  wallHeight: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  WON = 'WON'
}
