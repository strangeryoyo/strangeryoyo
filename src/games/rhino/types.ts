
export interface GameState {
  status: 'menu' | 'countdown' | 'playing' | 'finished';
  lap: number;
  totalLaps: number;
  speed: number;
  time: number;
  commentary: string;
}

export interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
}

export interface Checkpoint {
  position: [number, number, number];
  passed: boolean;
}
