export type Screen = 'START' | 'MAP' | 'BATTLE' | 'SHOP' | 'VICTORY' | 'GAME_OVER';

export type QuestionCategory = 'oceans' | 'marine-life' | 'pollution' | 'recycling' | 'monk-seals';
export type Difficulty = 1 | 2 | 3;

export interface Question {
  id: number;
  category: QuestionCategory;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  pollution: number;      // 0-100, starts high
  maxPollution: number;
  unlocked: boolean;
  cleaned: boolean;       // pollution <= 0
  cx: number;             // SVG center x
  cy: number;             // SVG center y
  enemyPool: string[];    // enemy template IDs
  difficulty: Difficulty;
  requiredTool?: string;  // tool ID needed to access (e.g. robo-sub for deep ocean)
}

export interface EnemyTemplate {
  id: string;
  name: string;
  emoji: string;
  baseHp: number;
  baseAtk: number;
  category: QuestionCategory;
  dialogue: string;
}

export interface Enemy {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  atk: number;
  category: QuestionCategory;
  dialogue: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  type: 'stat-boost' | 'cleaning-tool';
  // stat boosts
  hpBonus?: number;
  atkBonus?: number;
  defBonus?: number;
  // cleaning tool
  cleanPower?: number;
  unlocksDeepOcean?: boolean;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  baseMaxHp: number;
  atk: number;
  baseAtk: number;
  def: number;
  baseDef: number;
  level: number;
  xp: number;
  xpToNext: number;
  shells: number;
  equippedTool: string | null;  // equipment ID
  purchases: string[];          // purchased equipment IDs
}

export interface BattleState {
  enemy: Enemy;
  regionId: string;
  turnPhase: 'ACTION_SELECT' | 'QUESTION' | 'RESULT' | 'ENEMY_TURN';
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  wasCorrect: boolean | null;
  battleLog: string;
  comboCount: number;
}

export interface HighScore {
  bestLevel: number;
  mostRegionsCleaned: number;
  totalEnemiesDefeated: number;
  bestCombo: number;
}

export interface GameState {
  screen: Screen;
  player: PlayerState;
  regions: Region[];
  battle: BattleState | null;
  usedQuestionIds: number[];
  highScore: HighScore;
  enemiesDefeated: number;
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'OPEN_MAP' }
  | { type: 'OPEN_SHOP' }
  | { type: 'ENTER_REGION'; regionId: string }
  | { type: 'START_BATTLE'; enemy: Enemy; regionId: string }
  | { type: 'SELECT_ACTION' }
  | { type: 'SHOW_QUESTION'; question: Question }
  | { type: 'ANSWER_QUESTION'; answerIndex: number }
  | { type: 'APPLY_CORRECT_ANSWER'; damage: number }
  | { type: 'APPLY_WRONG_ANSWER' }
  | { type: 'ENEMY_ATTACK'; damage: number }
  | { type: 'ENEMY_DEFEATED'; xpGain: number; shellGain: number; pollutionReduced: number }
  | { type: 'PLAYER_DEFEATED' }
  | { type: 'VICTORY_CONTINUE' }
  | { type: 'GAME_OVER_RETRY' }
  | { type: 'BUY_EQUIPMENT'; item: EquipmentItem }
  | { type: 'EQUIP_TOOL'; toolId: string }
  | { type: 'LEVEL_UP' }
  | { type: 'DISMISS_RESULT' };
