
import { ItemType } from './types';

export const GRID_SIZE = 8;
export const INITIAL_MOVES = 20;
export const SCORE_MULTIPLIER = 10;
export const LEVEL_THRESHOLD = 1000;
export const CASCADE_MULTIPLIERS = [1, 1.5, 2, 2.5];
export const BOMB_SPAWN_CHANCE = 0.05;

export const ITEM_DATA: Record<ItemType, { emoji: string; color: string; bgColor: string }> = {
  [ItemType.RAT]: { emoji: '🐀', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  [ItemType.PIKA]: { emoji: '🐹', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  [ItemType.BERRY]: { emoji: '🫐', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  [ItemType.SNOWFLAKE]: { emoji: '❄️', color: 'text-blue-400', bgColor: 'bg-blue-50' },
  [ItemType.ICE]: { emoji: '🧊', color: 'text-cyan-300', bgColor: 'bg-cyan-50' },
  [ItemType.PAW]: { emoji: '🐾', color: 'text-slate-700', bgColor: 'bg-slate-100' },
};

export const MOUNTAIN_BACKGROUND = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070";
export const SNOW_LEOPARD_AVATAR = "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=200";
