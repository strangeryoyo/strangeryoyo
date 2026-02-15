export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const DOUBLE_JUMP_FORCE = -10;
export const MOVE_SPEED = 2; // Starts slow, speeds up with score
export const PLAYER_HORIZONTAL_SPEED = 6;
export const SPAWN_RATE = 120; // Frames between spawns roughly

// Jetpack settings
export const JETPACK_BANANAS_REQUIRED = 10;
export const JETPACK_FUEL_MAX = 200;
export const JETPACK_THRUST = -0.8;

// Dimensions relative to a base concept, but usually handled dynamically
export const PLAYER_SIZE = { width: 50, height: 55 };
export const MIN_PLATFORM_WIDTH_START = 180; // Big platforms at start
export const MAX_PLATFORM_WIDTH_START = 300;
export const MIN_PLATFORM_WIDTH_END = 60; // Smaller as difficulty increases
export const MAX_PLATFORM_WIDTH_END = 120;
export const PLATFORM_HEIGHT = 20;
export const SPIDER_SPEED = 1.5;

export const COLORS = {
  SKY_TOP: '#87CEEB',
  SKY_BOTTOM: '#E0F7FA',
  MOUNTAIN_FAR: '#9FA8DA',
  MOUNTAIN_NEAR: '#7986CB',
  TREE_TRUNK: '#5D4037',
  TREE_LEAVES: '#388E3C',
  BANANA: '#FFEB3B',
  GORILLA: '#3E2723',
  GORILLA_ACCENT: '#5D4037',
  GORILLA_FACE: '#8D6E63',
  JETPACK: '#FF5722',
  JETPACK_FLAME: '#FFC107',
  SPIDER_BODY: '#1A1A1A',
  SPIDER_LEGS: '#333333',
  SPIDER_EYES: '#FF0000'
};