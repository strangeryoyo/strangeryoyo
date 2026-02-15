
export interface AutoKiller {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  fishPerCycle: number;
  cycleTimeMs: number; // e.g., 5000 for 5s, 1000 for 1s
}

export interface FishQuality {
  level: number;
  name: string;
  value: number;
  costToUpgrade: number;
  color: string;
}

export interface GameState {
  money: number;
  totalFishCaught: number;
  fishInInventory: number;
  fishQualityLevel: number;
  autoKillersOwned: Record<string, number>;
  lastUpdate: number;
}
