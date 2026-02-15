
export enum Tier {
  FISH = 0,
  HUMAN = 1,
  BOAT = 2,
  HARBOR = 3,
  CITY = 4,
  ISLAND = 5,
  PLANET = 6,
  GALAXY = 7,
  UNIVERSE = 8,
  META = 9
}

export interface GameEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: string;
  tier: Tier;
  color: string;
  label?: string;
}

export interface GameState {
  score: number;
  level: number;
  tier: Tier;
  sharkRadius: number;
  isGameOver: boolean;
  isMetaPhase: boolean;
  eatenCount: number;
}
