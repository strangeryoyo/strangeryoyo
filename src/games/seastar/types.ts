
export type ItemType = 
  | 'seaweed' 
  | 'plankton' 
  | 'shrimp' 
  | 'crab' 
  | 'fish' 
  | 'jellyfish' 
  | 'octopus' 
  | 'shark' 
  | 'whale' 
  | 'sunflower-seastar';

export interface ItemDef {
  type: ItemType;
  level: number;
  label: string;
  icon: string;
  color: string;
  points: number;
}

export interface Cell {
  id: string;
  x: number;
  y: number;
  item: ItemDef | null;
}

export interface GameState {
  grid: Cell[][];
  score: number;
  nextItem: ItemDef;
  highScore: number;
  gameOver: boolean;
  fact: string | null;
}
