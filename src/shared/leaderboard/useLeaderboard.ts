import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLeaderboard, submitScore, getPlayerName, setPlayerName, LeaderboardEntry } from './api';

interface UseLeaderboardOptions {
  gameName: string;
  lowerIsBetter?: boolean;
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  topEntry: LeaderboardEntry | null;
  showNamePrompt: boolean;
  handleSubmitScore: (score: number) => void;
  handleNameSubmit: (name: string) => void;
  handleNameSkip: () => void;
}

export function useLeaderboard({ gameName, lowerIsBetter = false }: UseLeaderboardOptions): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const pendingScore = useRef<number | null>(null);

  useEffect(() => {
    fetchLeaderboard(gameName).then(setLeaderboard);
  }, [gameName]);

  const topEntry = leaderboard.length > 0 ? leaderboard[0] : null;

  const doSubmit = useCallback(async (score: number, playerName: string) => {
    const result = await submitScore(gameName, playerName, score);
    if (result.qualified) {
      const updated = await fetchLeaderboard(gameName);
      setLeaderboard(updated);
    }
  }, [gameName]);

  const handleSubmitScore = useCallback((score: number) => {
    // Check if score would qualify (quick client-side check)
    if (leaderboard.length >= 10) {
      const worstScore = leaderboard[leaderboard.length - 1].score;
      const qualifies = lowerIsBetter ? score < worstScore : score > worstScore;
      if (!qualifies) return;
    }

    const name = getPlayerName();
    if (name) {
      doSubmit(score, name);
    } else {
      pendingScore.current = score;
      setShowNamePrompt(true);
    }
  }, [leaderboard, lowerIsBetter, doSubmit]);

  const handleNameSubmit = useCallback((name: string) => {
    setPlayerName(name);
    setShowNamePrompt(false);
    if (pendingScore.current !== null) {
      doSubmit(pendingScore.current, name);
      pendingScore.current = null;
    }
  }, [doSubmit]);

  const handleNameSkip = useCallback(() => {
    setShowNamePrompt(false);
    pendingScore.current = null;
  }, []);

  return {
    leaderboard,
    topEntry,
    showNamePrompt,
    handleSubmitScore,
    handleNameSubmit,
    handleNameSkip,
  };
}
