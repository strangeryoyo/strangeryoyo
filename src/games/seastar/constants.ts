
import { ItemDef } from './types';

export const GRID_SIZE = 5;

export const ITEMS: ItemDef[] = [
  { type: 'seaweed', level: 1, label: 'Seaweed', icon: '🌿', color: 'bg-emerald-500', points: 10 },
  { type: 'plankton', level: 2, label: 'Plankton', icon: '🦠', color: 'bg-cyan-400', points: 25 },
  { type: 'shrimp', level: 3, label: 'Shrimp', icon: '🦐', color: 'bg-rose-400', points: 60 },
  { type: 'crab', level: 4, label: 'Crab', icon: '🦀', color: 'bg-orange-500', points: 150 },
  { type: 'fish', level: 5, label: 'Fish', icon: '🐟', color: 'bg-blue-400', points: 400 },
  { type: 'jellyfish', level: 6, label: 'Jellyfish', icon: '🪼', color: 'bg-purple-400', points: 1000 },
  { type: 'octopus', level: 7, label: 'Octopus', icon: '🐙', color: 'bg-indigo-500', points: 2500 },
  { type: 'shark', level: 8, label: 'Shark', icon: '🦈', color: 'bg-slate-500', points: 6000 },
  { type: 'whale', level: 9, label: 'Whale', icon: '🐋', color: 'bg-blue-700', points: 15000 },
  { type: 'sunflower-seastar', level: 10, label: 'Sunflower Seastar', icon: '🌟', color: 'bg-yellow-400', points: 50000 },
];

export const GET_RANDOM_BASIC_ITEM = () => {
  // Usually spawn levels 1 to 3
  const roll = Math.random();
  if (roll > 0.9) return ITEMS[2]; // Shrimp
  if (roll > 0.6) return ITEMS[1]; // Plankton
  return ITEMS[0]; // Seaweed
};
