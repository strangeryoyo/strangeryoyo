
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

// Slow motion factors (based on a ~0.4x time scale)
// Gravity is scaled by square of time scale (0.4^2 = 0.16)
// Velocities are scaled by time scale (0.4)
export const GRAVITY = 0.08; 
export const JUMP_FORCE = -6.5;
export const BOUNCY_JUMP_FORCE = -11.0;
export const PLAYER_SPEED = 2.0;
export const FRICTION = 0.92; // Less friction for smoother slow-mo sliding

export const PLATFORM_WIDTH = 70;
export const PLATFORM_HEIGHT = 15;
export const PLATFORM_COUNT = 8;

export const COLORS = {
  TAMARIN: '#FF9500', // Golden Orange
  LEAF: '#22C55E', // Green
  MUSHROOM: '#EF4444', // Red (Bouncy)
  DEAD_WOOD: '#78350F', // Brown (Fragile)
  VINE: '#10B981', // Moving green
  FOREST_SKY: '#ECFDF5'
};
