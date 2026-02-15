export const CANVAS_W = 640;
export const CANVAS_H = 480;
export const TILE_SIZE = 32;
export const ROOM_COLS = 20;
export const ROOM_ROWS = 15;
export const MOVE_SPEED = 3;
export const PLAYER_START_HEALTH = 3;
export const MAX_POSSIBLE_HEALTH = 5;
export const ECHOLOCATION_COOLDOWN = 600;
export const ECHOLOCATION_MAX_RADIUS = 160;
export const TAIL_SLAP_COOLDOWN = 20;
export const INVINCIBILITY_FRAMES = 90;
export const ENEMY_STUN_DURATION = 120;
export const SPEEDBOAT_SPEED = 1.5;
export const GHOSTNET_SPEED = 0.5;
export const GHOSTNET_CHASE_SPEED = 1.0;
export const GHOSTNET_CHASE_RANGE = 128;
export const NOISE_PULSE_INTERVAL = 120;
export const NOISE_PULSE_MAX_RADIUS = 96;
export const BOSS_HEALTH = 8;
export const BOSS_SHOOT_INTERVAL = 60;
export const BOSS_PHASE2_THRESHOLD = 4;
export const CAMERA_LERP = 0.1;
export const TRANSITION_DURATION = 30;
export const FINAL_ROOM = 11;

// Kraken
export const KRAKEN_HEALTH = 10;
export const KRAKEN_SPEED = 0.7;
export const KRAKEN_SWEEP_INTERVAL = 75;
export const KRAKEN_TENTACLE_COUNT = 5;
export const KRAKEN_SWEEP_RADIUS = 110;

// Ghost
export const GHOST_SPEED = 0.3;
export const GHOST_CHASE_RANGE = 120;
export const GHOST_PHASE_DURATION = 180;
export const GHOST_HP = 2;

// Treasure points
export const PEARL_POINTS = 100;
export const GEM_POINTS = 300;
export const RARE_SHELL_POINTS = 500;

// Scoring
export const TIME_BASE = 50000;
export const TIME_PENALTY_PER_SEC = 10;
export const SIDE_ROOM_BONUS = 1000;
export const BOSS_BONUS = 2000;
export const FRAGMENT_BONUS = 500;
export const HEALTH_BONUS = 500;

export const COLORS = {
  deepWater: '#0a1628',
  water: '#1a3a5c',
  waterLight: '#2a5a8c',
  seagrass: '#2d6b4e',
  sand: '#c2a85d',
  rock: '#5a5a6e',
  coral: '#e06080',
  ice: '#c8e8f8',
  toxic: '#4a2040',
  toxicGlow: '#8a3070',
  player: '#6eb8d0',
  playerLight: '#a0d8e8',
  speedboat: '#d04040',
  speedboatHull: '#802020',
  ghostNet: '#708870',
  ghostNetRope: '#506050',
  noisePulse: '#e0a020',
  boss: '#601080',
  bossPhase2: '#901040',
  projectile: '#c040c0',
  echoRing: '#80d0ff',
  heartFull: '#e04060',
  heartEmpty: '#402030',
  item: '#f0d020',
  fragment: '#60c0f0',
  chest: '#b08030',
  chestOpen: '#806020',
  sign: '#a09070',
  hud: '#e8e0d0',
  dialogBg: '#101820',
  dialogBorder: '#4080a0',
  shipwreck: '#5a4030',
  shipwreckDark: '#3a2820',
  templeWall: '#606878',
  templeFloor: '#484858',
  octopus: '#c04080',
  octopusLight: '#e060a0',
  octopusInk: '#302040',
  kraken: '#20804c',
  krakenDark: '#106030',
  krakenTentacle: '#30a060',
  ghost: '#c0d0e0',
  ghostTrail: '#8090a0',
  village: '#607088',
  pearl: '#e0e8f0',
  gem: '#60c0e0',
  rareShell: '#e0a040',
};

export const ROOM_NAMES = [
  'Calving Lagoon',       // 0
  'Coastal Shallows',     // 1
  'Coral Reef',           // 2
  'Shipping Lane',        // 3
  'Kelp Forest',          // 4
  'Fishing Grounds',      // 5
  'Open Ocean',           // 6
  'Polluted Estuary',     // 7
  'Tidal Flats',          // 8
  'Deep Channel',         // 9
  'Storm Waters',         // 10
  'Gulf of Maine',        // 11
  'Shipwreck Cove',       // 12
  'Sunken Temple',        // 13
  'Kraken\'s Lair',       // 14
  'Octopus Garden',       // 15
];
