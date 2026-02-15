import { HighScore } from '../types';

const STORAGE_KEY = 'monk-seal-quest-highscore';

const defaultHighScore: HighScore = {
  bestLevel: 0,
  mostRegionsCleaned: 0,
  totalEnemiesDefeated: 0,
  bestCombo: 0,
};

export function loadHighScore(): HighScore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultHighScore };
    return { ...defaultHighScore, ...JSON.parse(raw) };
  } catch {
    return { ...defaultHighScore };
  }
}

export function saveHighScore(hs: HighScore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hs));
  } catch {
    // ignore storage errors
  }
}

export function mergeHighScore(current: HighScore, level: number, regionsCleaned: number, enemiesDefeated: number, bestCombo: number): HighScore {
  return {
    bestLevel: Math.max(current.bestLevel, level),
    mostRegionsCleaned: Math.max(current.mostRegionsCleaned, regionsCleaned),
    totalEnemiesDefeated: current.totalEnemiesDefeated + enemiesDefeated,
    bestCombo: Math.max(current.bestCombo, bestCombo),
  };
}
