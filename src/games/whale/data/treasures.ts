import { TreasureType, TreasureData } from '../types';

export const TREASURES: TreasureData[] = [
  // Pearls (100pts) - common, easier areas
  { col: 5, row: 8, room: 0, type: TreasureType.Pearl, collected: false },
  { col: 14, row: 4, room: 0, type: TreasureType.Pearl, collected: false },
  { col: 8, row: 3, room: 1, type: TreasureType.Pearl, collected: false },
  { col: 12, row: 10, room: 1, type: TreasureType.Pearl, collected: false },
  { col: 4, row: 6, room: 2, type: TreasureType.Pearl, collected: false },
  { col: 15, row: 4, room: 4, type: TreasureType.Pearl, collected: false },
  { col: 12, row: 5, room: 8, type: TreasureType.Pearl, collected: false },

  // Gems (300pts) - mid-difficulty areas
  { col: 7, row: 5, room: 3, type: TreasureType.Gem, collected: false },
  { col: 15, row: 6, room: 5, type: TreasureType.Gem, collected: false },
  { col: 8, row: 4, room: 6, type: TreasureType.Gem, collected: false },
  { col: 15, row: 8, room: 6, type: TreasureType.Gem, collected: false },
  { col: 4, row: 5, room: 9, type: TreasureType.Gem, collected: false },
  { col: 15, row: 5, room: 10, type: TreasureType.Gem, collected: false },

  // Rare Shells (500pts) - side rooms, high reward
  { col: 14, row: 4, room: 12, type: TreasureType.RareShell, collected: false },
  { col: 5, row: 8, room: 13, type: TreasureType.RareShell, collected: false },
  { col: 14, row: 5, room: 14, type: TreasureType.RareShell, collected: false },
  { col: 8, row: 4, room: 15, type: TreasureType.RareShell, collected: false },
  { col: 14, row: 9, room: 15, type: TreasureType.RareShell, collected: false },
];
