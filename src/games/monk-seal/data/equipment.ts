import { EquipmentItem } from '../types';

export const equipment: EquipmentItem[] = [
  // Stat Boosts (permanent, buy once)
  { id: 'shell-shield', name: 'Shell Shield', emoji: '\ud83d\udee1\ufe0f', description: '+10 Defense', cost: 30, type: 'stat-boost', defBonus: 10 },
  { id: 'pearl-heart', name: 'Pearl Heart', emoji: '\ud83e\udd0d', description: '+30 Max HP', cost: 40, type: 'stat-boost', hpBonus: 30 },
  { id: 'trident-shard', name: 'Trident Shard', emoji: '\ud83d\udd31', description: '+10 Attack', cost: 35, type: 'stat-boost', atkBonus: 10 },
  { id: 'coral-charm', name: 'Coral Charm', emoji: '\ud83e\udea8', description: '+5 Atk, +5 Def', cost: 45, type: 'stat-boost', atkBonus: 5, defBonus: 5 },
  { id: 'whale-song', name: 'Whale Song Amulet', emoji: '\ud83d\udc33', description: '+50 Max HP', cost: 60, type: 'stat-boost', hpBonus: 50 },
  { id: 'starfish-ring', name: 'Starfish Ring', emoji: '\u2b50', description: '+15 Attack', cost: 55, type: 'stat-boost', atkBonus: 15 },

  // Cleaning Tools (equippable, one at a time)
  { id: 'beach-net', name: 'Beach Net', emoji: '\ud83e\uddf9', description: 'Basic cleanup tool (+15 clean)', cost: 0, type: 'cleaning-tool', cleanPower: 15 },
  { id: 'dive-suit', name: 'Dive Suit', emoji: '\ud83e\udd3f', description: 'Underwater cleanup (+25 clean)', cost: 25, type: 'cleaning-tool', cleanPower: 25 },
  { id: 'cleanup-boat', name: 'Cleanup Boat', emoji: '\u26f5', description: 'Surface sweeper (+40 clean)', cost: 50, type: 'cleaning-tool', cleanPower: 40 },
  { id: 'robo-sub', name: 'Robo-Sub', emoji: '\ud83e\udd16', description: 'Deep ocean access (+60 clean)', cost: 80, type: 'cleaning-tool', cleanPower: 60, unlocksDeepOcean: true },
];

export function getEquipment(id: string): EquipmentItem | undefined {
  return equipment.find(e => e.id === id);
}
