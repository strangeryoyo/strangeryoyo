
export const GAME_CONFIG = {
  MAX_SPEED: 50,
  ACCELERATION: 1.5,
  STEER_SPEED: 0.05,
  FRICTION: 0.97,
  TOTAL_LAPS: 3,
  GRAVITY: -0.5,
  ROAD_LIMIT: 7.5, // How far from the center line the rhino can go
};

export const TRACK_PATH = [
  [0, 0, 0],
  [60, 0, 30],
  [120, 0, 0],
  [150, 0, -60],
  [100, 0, -120],
  [0, 0, -150],
  [-100, 0, -120],
  [-150, 0, -60],
  [-120, 0, 0],
  [-60, 0, 40],
  [0, 0, 0],
] as [number, number, number][];

export const COLORS = {
  RHINO_PRIMARY: '#1a1a1a',
  RHINO_SECONDARY: '#333333',
  KART_BODY: '#e11d48',
  TRACK_ROAD: '#1e293b',
  TRACK_GRASS: '#064e3b',
  CURB_LIGHT: '#ffffff',
  CURB_DARK: '#e11d48',
  FENCE: '#f59e0b', // Amber/Yellow for high visibility
};
