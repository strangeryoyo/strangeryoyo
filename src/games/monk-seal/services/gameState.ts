import React, { createContext, useContext, useReducer } from 'react';
import { GameState, GameAction, PlayerState, Region, BattleState, HighScore } from '../types';
import { initialRegions } from '../data/regions';
import { getEquipment } from '../data/equipment';
import { questions } from '../data/questions';
import { loadHighScore, saveHighScore, mergeHighScore } from './highScore';
import {
  STARTING_HP, STARTING_ATK, STARTING_DEF, STARTING_SHELLS,
  XP_PER_LEVEL, HP_PER_LEVEL, ATK_PER_LEVEL,
} from '../constants';

function createInitialPlayer(): PlayerState {
  return {
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    baseMaxHp: STARTING_HP,
    atk: STARTING_ATK,
    baseAtk: STARTING_ATK,
    def: STARTING_DEF,
    baseDef: STARTING_DEF,
    level: 1,
    xp: 0,
    xpToNext: XP_PER_LEVEL,
    shells: STARTING_SHELLS,
    equippedTool: 'beach-net',
    purchases: ['beach-net'],
  };
}

export function createInitialState(): GameState {
  return {
    screen: 'START',
    player: createInitialPlayer(),
    regions: initialRegions.map(r => ({ ...r })),
    battle: null,
    usedQuestionIds: [],
    highScore: loadHighScore(),
    enemiesDefeated: 0,
  };
}

function recalcStats(player: PlayerState): PlayerState {
  let hpBonus = 0, atkBonus = 0, defBonus = 0;
  for (const id of player.purchases) {
    const item = getEquipment(id);
    if (item && item.type === 'stat-boost') {
      hpBonus += item.hpBonus || 0;
      atkBonus += item.atkBonus || 0;
      defBonus += item.defBonus || 0;
    }
  }
  const levelHp = (player.level - 1) * HP_PER_LEVEL;
  const levelAtk = (player.level - 1) * ATK_PER_LEVEL;
  const newMaxHp = player.baseMaxHp + hpBonus + levelHp;
  return {
    ...player,
    maxHp: newMaxHp,
    hp: Math.min(player.hp, newMaxHp),
    atk: player.baseAtk + atkBonus + levelAtk,
    def: player.baseDef + defBonus,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...createInitialState(), screen: 'MAP', highScore: state.highScore };

    case 'OPEN_MAP':
      return { ...state, screen: 'MAP', battle: null };

    case 'OPEN_SHOP':
      return { ...state, screen: 'SHOP' };

    case 'ENTER_REGION': {
      // Check if region has a required tool
      const region = state.regions.find(r => r.id === action.regionId);
      if (!region) return state;
      if (region.requiredTool && !state.player.purchases.includes(region.requiredTool)) {
        return state; // can't enter without tool
      }
      // Unlock the region if locked
      const regions = state.regions.map(r =>
        r.id === action.regionId ? { ...r, unlocked: true } : r
      );
      return { ...state, regions };
    }

    case 'START_BATTLE':
      return {
        ...state,
        screen: 'BATTLE',
        battle: {
          enemy: action.enemy,
          regionId: action.regionId,
          turnPhase: 'ACTION_SELECT',
          currentQuestion: null,
          selectedAnswer: null,
          wasCorrect: null,
          battleLog: `A wild ${action.enemy.name} appeared!`,
          comboCount: 0,
        },
      };

    case 'SHOW_QUESTION':
      if (!state.battle) return state;
      return {
        ...state,
        battle: {
          ...state.battle,
          turnPhase: 'QUESTION',
          currentQuestion: action.question,
          selectedAnswer: null,
          wasCorrect: null,
        },
        // Reset used list when 75% of questions have been seen to allow recycling
        usedQuestionIds: state.usedQuestionIds.length >= Math.floor(questions.length * 0.75)
          ? [action.question.id]
          : [...state.usedQuestionIds, action.question.id],
      };

    case 'ANSWER_QUESTION': {
      if (!state.battle || !state.battle.currentQuestion) return state;
      const correct = action.answerIndex === state.battle.currentQuestion.correctIndex;
      return {
        ...state,
        battle: {
          ...state.battle,
          turnPhase: 'RESULT',
          selectedAnswer: action.answerIndex,
          wasCorrect: correct,
        },
      };
    }

    case 'APPLY_CORRECT_ANSWER': {
      if (!state.battle) return state;
      const newEnemyHp = Math.max(0, state.battle.enemy.hp - action.damage);
      const newCombo = state.battle.comboCount + 1;
      return {
        ...state,
        battle: {
          ...state.battle,
          enemy: { ...state.battle.enemy, hp: newEnemyHp },
          comboCount: newCombo,
          battleLog: `Correct! Salty deals ${action.damage} damage! (${newCombo}x combo)`,
          turnPhase: newEnemyHp <= 0 ? 'ACTION_SELECT' : 'ENEMY_TURN',
          currentQuestion: null,
          selectedAnswer: null,
          wasCorrect: null,
        },
      };
    }

    case 'APPLY_WRONG_ANSWER': {
      if (!state.battle) return state;
      return {
        ...state,
        battle: {
          ...state.battle,
          comboCount: 0,
          battleLog: 'Wrong answer! The enemy takes advantage!',
          turnPhase: 'ENEMY_TURN',
          currentQuestion: null,
          selectedAnswer: null,
          wasCorrect: null,
        },
      };
    }

    case 'ENEMY_ATTACK': {
      if (!state.battle) return state;
      const actualDmg = Math.max(1, action.damage - state.player.def);
      const newHp = Math.max(0, state.player.hp - actualDmg);
      return {
        ...state,
        player: { ...state.player, hp: newHp },
        battle: {
          ...state.battle,
          battleLog: `${state.battle.enemy.name} hits for ${actualDmg} damage!`,
          turnPhase: newHp <= 0 ? 'ACTION_SELECT' : 'ACTION_SELECT',
        },
      };
    }

    case 'ENEMY_DEFEATED': {
      if (!state.battle) return state;
      let player = {
        ...state.player,
        xp: state.player.xp + action.xpGain,
        shells: state.player.shells + action.shellGain,
        hp: state.player.maxHp, // heal on victory
      };
      // Check level up
      while (player.xp >= player.xpToNext) {
        player = {
          ...player,
          level: player.level + 1,
          xp: player.xp - player.xpToNext,
          xpToNext: (player.level + 1) * XP_PER_LEVEL,
        };
      }
      player = recalcStats(player);
      player.hp = player.maxHp; // full heal after level calc

      // Reduce pollution
      const regions = state.regions.map(r => {
        if (r.id === state.battle!.regionId) {
          const newPollution = Math.max(0, r.pollution - action.pollutionReduced);
          return { ...r, pollution: newPollution, cleaned: newPollution <= 0 };
        }
        return r;
      });

      const newEnemiesDefeated = state.enemiesDefeated + 1;
      const cleanedCount = regions.filter(r => r.cleaned).length;
      const bestCombo = Math.max(state.highScore.bestCombo, state.battle!.comboCount);
      const newHighScore = mergeHighScore(state.highScore, player.level, cleanedCount, 1, bestCombo);
      saveHighScore(newHighScore);

      return {
        ...state,
        screen: 'VICTORY',
        player,
        regions,
        battle: state.battle,
        enemiesDefeated: newEnemiesDefeated,
        highScore: newHighScore,
      };
    }

    case 'PLAYER_DEFEATED':
      return { ...state, screen: 'GAME_OVER' };

    case 'VICTORY_CONTINUE':
      return { ...state, screen: 'MAP', battle: null };

    case 'GAME_OVER_RETRY': {
      // Keep level/purchases but reset HP and go to map
      let player = { ...state.player, hp: state.player.maxHp };
      player = recalcStats(player);
      player.hp = player.maxHp;
      return { ...state, screen: 'MAP', player, battle: null };
    }

    case 'BUY_EQUIPMENT': {
      const item = action.item;
      if (state.player.shells < item.cost) return state;
      if (state.player.purchases.includes(item.id)) return state;
      let player = {
        ...state.player,
        shells: state.player.shells - item.cost,
        purchases: [...state.player.purchases, item.id],
      };
      player = recalcStats(player);
      if (item.type === 'stat-boost' && item.hpBonus) {
        player.hp = Math.min(player.hp + item.hpBonus, player.maxHp);
      }
      // Unlock deep ocean regions if robo-sub purchased
      let regions = state.regions;
      if (item.unlocksDeepOcean) {
        regions = state.regions.map(r =>
          r.requiredTool === item.id ? { ...r, unlocked: true } : r
        );
      }
      return { ...state, player, regions };
    }

    case 'EQUIP_TOOL': {
      if (!state.player.purchases.includes(action.toolId)) return state;
      return {
        ...state,
        player: { ...state.player, equippedTool: action.toolId },
      };
    }

    case 'DISMISS_RESULT': {
      if (!state.battle) return state;
      return {
        ...state,
        battle: {
          ...state.battle,
          turnPhase: 'ACTION_SELECT',
          currentQuestion: null,
          selectedAnswer: null,
          wasCorrect: null,
        },
      };
    }

    default:
      return state;
  }
}

type Dispatch = React.Dispatch<GameAction>;

export const GameContext = createContext<{ state: GameState; dispatch: Dispatch }>({
  state: createInitialState(),
  dispatch: () => {},
});

export function useGame() {
  return useContext(GameContext);
}
