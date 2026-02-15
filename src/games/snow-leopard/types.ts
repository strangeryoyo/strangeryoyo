
export enum ItemType {
  RAT = 'rat',
  PIKA = 'pika',
  BERRY = 'berry',
  SNOWFLAKE = 'snowflake',
  ICE = 'ice',
  PAW = 'paw'
}

export type BonusType = 'bomb' | 'line' | null;

export interface Tile {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  bonus: BonusType;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  moves: number;
  grid: (Tile | null)[][];
  isProcessing: boolean;
  selectedTile: Position | null;
  level: number;
  isGameOver: boolean;
}

export interface LeopardQuote {
  text: string;
  mood: 'happy' | 'neutral' | 'encouraging';
}
