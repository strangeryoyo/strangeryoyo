import { ItemType, ChestData } from '../types';

export const CHESTS: ChestData[] = [
  // Room 0: Calving Lagoon - Heart Container
  { col: 17, row: 6, item: ItemType.HeartContainer, opened: false, room: 0 },
  // Room 1: Coastal Shallows - Net Cutter
  { col: 15, row: 7, item: ItemType.NetCutter, opened: false, room: 1 },
  // Room 2: Coral Reef - Heart Container
  { col: 9, row: 13, item: ItemType.HeartContainer, opened: false, room: 2 },
  // Room 3: Shipping Lane - Song Fragment #1
  { col: 9, row: 7, item: ItemType.SongFragment, opened: false, room: 3 },
  // Room 5: Fishing Grounds - Song Fragment #2
  { col: 9, row: 7, item: ItemType.SongFragment, opened: false, room: 5 },
  // Room 8: Tidal Flats - Heart Container (reach = reward, not needed for 5 max since we already have 2)
  // Actually skip this since we'd exceed max. Put something else or just keep 2 heart containers.
  // Room 9: Deep Channel - Song Fragment #3
  { col: 9, row: 7, item: ItemType.SongFragment, opened: false, room: 9 },
  // Room 12: Shipwreck Cove - Sonar Shield (alternative to boss drop)
  { col: 6, row: 7, item: ItemType.SonarShield, opened: false, room: 12 },
];

export const ITEM_NAMES: Record<ItemType, string> = {
  [ItemType.NetCutter]: 'Net Cutter',
  [ItemType.SonarShield]: 'Sonar Shield',
  [ItemType.SongFragment]: 'Whale Song Fragment',
  [ItemType.HeartContainer]: 'Heart Container',
};

export const ITEM_DESCRIPTIONS: Record<ItemType, string> = {
  [ItemType.NetCutter]: 'A sharp barnacle blade! Use Tail Slap to cut through ghost nets.',
  [ItemType.SonarShield]: 'Absorbs harmful noise! Noise pulses deal reduced damage.',
  [ItemType.SongFragment]: 'A piece of the ancient whale song. Collect all 3 to open the way north.',
  [ItemType.HeartContainer]: 'Your life force grows stronger! Maximum health increased.',
};
