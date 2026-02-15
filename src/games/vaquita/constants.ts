
import { AutoKiller, FishQuality } from './types';

export const AUTO_KILLERS: AutoKiller[] = [
  {
    id: 'starter_bubble',
    name: 'Trained Bubble Stream',
    description: 'Slow but steady. 1 fish every 5 seconds.',
    baseCost: 15,
    fishPerCycle: 1,
    cycleTimeMs: 5000,
  },
  {
    id: 'sonar_zap',
    name: 'Sonar Disruptor',
    description: 'A focused pulse. 1 fish every 1 second.',
    baseCost: 100,
    fishPerCycle: 1,
    cycleTimeMs: 1000,
  },
  {
    id: 'school_harvester',
    name: 'School Harvester',
    description: 'Efficient nets. 10 fish every 2 seconds.',
    baseCost: 1200,
    fishPerCycle: 10,
    cycleTimeMs: 2000,
  },
  {
    id: 'vaquita_pack',
    name: 'Vaquita Apex Pack',
    description: 'Call the whole squad. 50 fish every 1 second.',
    baseCost: 25000,
    fishPerCycle: 50,
    cycleTimeMs: 1000,
  },
  {
    id: 'abyssal_vacuum',
    name: 'Abyssal Vacuum',
    description: 'Clears the seafloor. 500 fish every 0.5 seconds.',
    baseCost: 500000,
    fishPerCycle: 500,
    cycleTimeMs: 500,
  },
  {
    id: 'quantum_lure',
    name: 'Quantum Lure',
    description: 'Bends space-time to hunt. 5,000 fish every 0.2 seconds.',
    baseCost: 15000000,
    fishPerCycle: 5000,
    cycleTimeMs: 200,
  }
];

export const FISH_QUALITIES: FishQuality[] = [
  { level: 0, name: 'Sardine', value: 1, costToUpgrade: 50, color: 'text-gray-400' },
  { level: 1, name: 'Mackerel', value: 10, costToUpgrade: 500, color: 'text-blue-400' },
  { level: 2, name: 'Tuna', value: 100, costToUpgrade: 5000, color: 'text-cyan-400' },
  { level: 3, name: 'Golden Marlin', value: 1000, costToUpgrade: 75000, color: 'text-yellow-400' },
  { level: 4, name: 'Crystal Ray', value: 10000, costToUpgrade: 1000000, color: 'text-indigo-300' },
  { level: 5, name: 'Ancient Kraken-Bit', value: 100000, costToUpgrade: 50000000, color: 'text-purple-500' },
  { level: 6, name: 'Abyssal Titan', value: 1000000, costToUpgrade: 1000000000, color: 'text-red-500' },
  { level: 7, name: 'Nebula Fin', value: 100000000, costToUpgrade: 500000000000, color: 'text-pink-400' },
  { level: 8, name: 'Cosmic Whale', value: 10000000000, costToUpgrade: 100000000000000, color: 'text-white font-bold animate-pulse' },
];

export const COST_EXPONENT = 1.15;
