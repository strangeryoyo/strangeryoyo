import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLeaderboard, submitScore, getPlayerName, setPlayerName, LeaderboardEntry } from './api';

interface UseLeaderboardOptions {
  gameName: string;
  lowerIsBetter?: boolean;
}

type SubmitStatus = 'idle' | 'submitting' | 'qualified' | 'not_qualified' | 'error';

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  topEntry: LeaderboardEntry | null;
  showNamePrompt: boolean;
  submitStatus: SubmitStatus;
  handleSubmitScore: (score: number) => void;
  handleNameSubmit: (name: string) => void;
  handleNameSkip: () => void;
}

export function useLeaderboard({ gameName, lowerIsBetter = false }: UseLeaderboardOptions): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const pendingScore = useRef<number | null>(null);

  useEffect(() => {
    fetchLeaderboard(gameName).then(setLeaderboard);
  }, [gameName]);

  const topEntry = leaderboard.length > 0 ? leaderboard[0] : null;

  const doSubmit = useCallback(async (score: number, playerName: string) => {
    setSubmitStatus('submitting');
    try {
      const result = await submitScore(gameName, playerName, score);
      if (result.qualified) {
        const updated = await fetchLeaderboard(gameName);
        setLeaderboard(updated);
        setSubmitStatus('qualified');
      } else {
        setSubmitStatus('not_qualified');
      }
    } catch {
      setSubmitStatus('error');
    }
  }, [gameName]);

  const handleSubmitScore = useCallback((score: number) => {
    if (submitStatus === 'submitting' || submitStatus === 'qualified') return;

    const name = getPlayerName();
    if (name) {
      doSubmit(score, name);
    } else {
      pendingScore.current = score;
      setShowNamePrompt(true);
    }
  }, [submitStatus, doSubmit]);

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
    submitStatus,
    handleSubmitScore,
    handleNameSubmit,
    handleNameSkip,
  };
}
