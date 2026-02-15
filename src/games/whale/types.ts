export enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

export enum TileType {
  DeepWater = 0,
  Water = 1,
  Seagrass = 2,
  Sand = 3,
  Rock = 4,
  Coral = 5,
  Ice = 6,
  Toxic = 7,
  Current = 8,
  Sign = 9,
  Chest = 10,
  ExitNorth = 11,
  ExitSouth = 12,
  ExitEast = 13,
  ExitWest = 14,
  BossGate = 15,
  Shipwreck = 16,
  TempleWall = 17,
  TempleFloor = 18,
  Village = 19,
  Treasure = 20,
}

export enum EnemyType {
  Speedboat = 'speedboat',
  GhostNet = 'ghostnet',
  NoisePulse = 'noisepulse',
  PollutionBoss = 'pollutionboss',
  Octopus = 'octopus',
  Kraken = 'kraken',
  Ghost = 'ghost',
}

export enum ItemType {
  NetCutter = 'netcutter',
  SonarShield = 'sonarshield',
  SongFragment = 'songfragment',
  HeartContainer = 'heartcontainer',
}

export enum TreasureType {
  Pearl = 0,
  Gem = 1,
  RareShell = 2,
}

export enum Screen {
  MainMenu = 'mainmenu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameover',
  Victory = 'victory',
}

export interface Position {
  x: number;
  y: number;
}

export interface TilePos {
  col: number;
  row: number;
}

export interface EntityState {
  pos: Position;
  tilePos: TilePos;
  direction: Direction;
  moving: boolean;
}

export interface PlayerState extends EntityState {
  health: number;
  maxHealth: number;
  invincibleTimer: number;
  echolocationCooldown: number;
  tailSlapCooldown: number;
  animTimer: number;
}

export interface EnemyState extends EntityState {
  type: EnemyType;
  health: number;
  maxHealth: number;
  active: boolean;
  stunTimer: number;
  animTimer: number;
  patrolDir: number;
  chaseTimer: number;
  phaseTimer: number;
  phase: number;
}

export interface Projectile {
  pos: Position;
  vel: Position;
  lifetime: number;
  damage: number;
}

export interface Particle {
  pos: Position;
  vel: Position;
  lifetime: number;
  maxLifetime: number;
  color: string;
  size: number;
}

export interface EchoRing {
  pos: Position;
  radius: number;
  maxRadius: number;
  lifetime: number;
}

export interface ChestData {
  col: number;
  row: number;
  item: ItemType;
  opened: boolean;
  room: number;
}

export interface SignData {
  col: number;
  row: number;
  text: string;
  room: number;
}

export interface TreasureData {
  col: number;
  row: number;
  room: number;
  type: TreasureType;
  collected: boolean;
}

export interface ScoreBreakdown {
  timeScore: number;
  treasureScore: number;
  sideRoomScore: number;
  bossScore: number;
  fragmentScore: number;
  healthScore: number;
  total: number;
}

export interface EnemySpawn {
  type: EnemyType;
  col: number;
  row: number;
  room: number;
}

export interface RoomConnection {
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

export type GameAction =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_HEALTH'; health: number; maxHealth: number }
  | { type: 'ADD_ITEM'; item: ItemType }
  | { type: 'SET_ROOM'; room: number; name: string }
  | { type: 'SHOW_DIALOGUE'; text: string }
  | { type: 'HIDE_DIALOGUE' }
  | { type: 'SET_FRAGMENTS'; count: number }
  | { type: 'SET_SCORE'; score: number }
  | { type: 'SET_TIMER'; timer: number }
  | { type: 'COLLECT_TREASURE' }
  | { type: 'ENTER_SIDE_ROOM'; room: number }
  | { type: 'VICTORY_SCORE'; breakdown: ScoreBreakdown }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' };

export interface UIState {
  screen: Screen;
  health: number;
  maxHealth: number;
  inventory: ItemType[];
  currentRoom: number;
  roomName: string;
  dialogue: string | null;
  songFragments: number;
  score: number;
  timer: number;
  treasuresCollected: number;
  sideRoomsVisited: Set<number>;
  scoreBreakdown: ScoreBreakdown | null;
}
