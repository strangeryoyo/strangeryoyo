import { EnemyType, EnemySpawn, SignData } from '../types';

export const ENEMY_SPAWNS: EnemySpawn[] = [
  // Room 1: Coastal Shallows - 3 speedboats
  { type: EnemyType.Speedboat, col: 5, row: 4, room: 1 },
  { type: EnemyType.Speedboat, col: 10, row: 8, room: 1 },
  { type: EnemyType.Speedboat, col: 15, row: 6, room: 1 },

  // Room 2: Coral Reef - 2 speedboats weaving through corals
  { type: EnemyType.Speedboat, col: 6, row: 5, room: 2 },
  { type: EnemyType.Speedboat, col: 14, row: 9, room: 2 },

  // Room 3: Shipping Lane - speedboats in the lanes
  { type: EnemyType.Speedboat, col: 4, row: 2, room: 3 },
  { type: EnemyType.Speedboat, col: 12, row: 2, room: 3 },
  { type: EnemyType.Speedboat, col: 8, row: 12, room: 3 },
  { type: EnemyType.Speedboat, col: 16, row: 12, room: 3 },

  // Room 4: Kelp Forest - ghost nets hiding in kelp
  { type: EnemyType.GhostNet, col: 4, row: 4, room: 4 },
  { type: EnemyType.GhostNet, col: 15, row: 4, room: 4 },
  { type: EnemyType.GhostNet, col: 10, row: 10, room: 4 },

  // Room 5: Fishing Grounds - lots of ghost nets
  { type: EnemyType.GhostNet, col: 5, row: 3, room: 5 },
  { type: EnemyType.GhostNet, col: 14, row: 3, room: 5 },
  { type: EnemyType.GhostNet, col: 5, row: 11, room: 5 },
  { type: EnemyType.GhostNet, col: 14, row: 11, room: 5 },
  { type: EnemyType.GhostNet, col: 10, row: 7, room: 5 },

  // Room 6: Open Ocean - speedboats + ghost nets
  { type: EnemyType.Speedboat, col: 4, row: 3, room: 6 },
  { type: EnemyType.Speedboat, col: 10, row: 6, room: 6 },
  { type: EnemyType.Speedboat, col: 16, row: 10, room: 6 },
  { type: EnemyType.Speedboat, col: 7, row: 11, room: 6 },
  { type: EnemyType.GhostNet, col: 5, row: 7, room: 6 },
  { type: EnemyType.GhostNet, col: 14, row: 7, room: 6 },

  // Room 7: Polluted Estuary - Pollution Boss
  { type: EnemyType.PollutionBoss, col: 9, row: 4, room: 7 },

  // Room 8: Tidal Flats - mixed speedboats + ghost nets
  { type: EnemyType.Speedboat, col: 6, row: 5, room: 8 },
  { type: EnemyType.Speedboat, col: 14, row: 9, room: 8 },
  { type: EnemyType.GhostNet, col: 10, row: 7, room: 8 },

  // Room 9: Deep Channel - noise pulses
  { type: EnemyType.NoisePulse, col: 5, row: 4, room: 9 },
  { type: EnemyType.NoisePulse, col: 14, row: 4, room: 9 },
  { type: EnemyType.NoisePulse, col: 5, row: 10, room: 9 },
  { type: EnemyType.NoisePulse, col: 14, row: 10, room: 9 },
  { type: EnemyType.NoisePulse, col: 9, row: 7, room: 9 },

  // Room 10: Storm Waters - everything
  { type: EnemyType.Speedboat, col: 5, row: 2, room: 10 },
  { type: EnemyType.Speedboat, col: 14, row: 12, room: 10 },
  { type: EnemyType.GhostNet, col: 5, row: 8, room: 10 },
  { type: EnemyType.GhostNet, col: 14, row: 6, room: 10 },
  { type: EnemyType.NoisePulse, col: 9, row: 3, room: 10 },
  { type: EnemyType.NoisePulse, col: 9, row: 11, room: 10 },

  // Room 9: Deep Channel - ghosts
  { type: EnemyType.Ghost, col: 4, row: 6, room: 9 },
  { type: EnemyType.Ghost, col: 15, row: 8, room: 9 },

  // Room 10: Storm Waters - ghosts
  { type: EnemyType.Ghost, col: 4, row: 10, room: 10 },
  { type: EnemyType.Ghost, col: 15, row: 4, room: 10 },

  // Room 12: Shipwreck Cove - ghost nets tangled in wreckage
  { type: EnemyType.GhostNet, col: 6, row: 4, room: 12 },
  { type: EnemyType.GhostNet, col: 14, row: 10, room: 12 },
  { type: EnemyType.GhostNet, col: 10, row: 7, room: 12 },

  // Room 13: Sunken Temple - octopus guardians + ghost
  { type: EnemyType.Octopus, col: 6, row: 5, room: 13 },
  { type: EnemyType.Octopus, col: 14, row: 9, room: 13 },
  { type: EnemyType.Ghost, col: 10, row: 7, room: 13 },

  // Room 14: Kraken's Lair - the Kraken
  { type: EnemyType.Kraken, col: 9, row: 7, room: 14 },

  // Room 15: Octopus Garden - multiple octopuses
  { type: EnemyType.Octopus, col: 5, row: 4, room: 15 },
  { type: EnemyType.Octopus, col: 14, row: 4, room: 15 },
  { type: EnemyType.Octopus, col: 5, row: 10, room: 15 },
  { type: EnemyType.Octopus, col: 14, row: 10, room: 15 },
];

export const SIGNS: SignData[] = [
  { col: 3, row: 5, text: 'Welcome, little Kira! Use arrow keys to swim. Press SPACE for Echolocation, SHIFT for Tail Slap.', room: 0 },
  { col: 15, row: 10, text: 'Swim north to begin your migration to the Gulf of Maine. Your mother is waiting!', room: 0 },
  { col: 9, row: 7, text: 'The kelp here grows thick. Ghost nets hide among the fronds - be careful! Use your Net Cutter with Tail Slap.', room: 4 },
  { col: 9, row: 5, text: 'These old shipwrecks are home to many creatures now. The nets that sank with them still trap the unwary.', room: 12 },
  { col: 9, row: 6, text: 'This ancient temple was built by those who honored the great whales. Their wisdom still echoes in these halls.', room: 13 },
];
