export interface LeaderboardEntry {
  playerName: string;
  score: number;
  timestamp: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
}

export interface SubmitResponse {
  success: boolean;
  qualified: boolean;
  message?: string;
}

export interface ChampionsResponse {
  success: boolean;
  champions: Record<string, LeaderboardEntry>;
}

const API_BASE = '/api/leaderboard';

export async function fetchLeaderboard(gameName: string, since?: number): Promise<LeaderboardEntry[]> {
  try {
    const url = since
      ? `${API_BASE}/${gameName}?since=${since}`
      : `${API_BASE}/${gameName}`;
    const res = await fetch(url);
    const data: LeaderboardResponse = await res.json();
    return data.success ? data.leaderboard : [];
  } catch {
    return [];
  }
}

export async function submitScore(gameName: string, playerName: string, score: number): Promise<SubmitResponse> {
  try {
    const res = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: gameName, playerName, score }),
    });
    return await res.json();
  } catch {
    return { success: false, qualified: false, message: 'Network error' };
  }
}

export async function fetchAllChampions(): Promise<Record<string, LeaderboardEntry>> {
  try {
    const res = await fetch(`${API_BASE}/all`);
    const data: ChampionsResponse = await res.json();
    return data.success ? data.champions : {};
  } catch {
    return {};
  }
}

const PLAYER_NAME_KEY = 'leaderboardPlayerName';

export function getPlayerName(): string | null {
  return localStorage.getItem(PLAYER_NAME_KEY);
}

export function setPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name.trim());
}
