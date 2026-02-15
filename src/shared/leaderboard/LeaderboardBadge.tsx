import React from 'react';
import { LeaderboardEntry } from './api';

interface LeaderboardBadgeProps {
  topEntry: LeaderboardEntry | null;
  formatScore?: (score: number) => string;
}

export const LeaderboardBadge: React.FC<LeaderboardBadgeProps> = ({ topEntry, formatScore }) => {
  if (!topEntry) return null;

  const displayScore = formatScore ? formatScore(topEntry.score) : topEntry.score.toLocaleString();

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
      <span className="text-yellow-400">👑</span>
      <span className="text-yellow-200 font-bold truncate max-w-[80px]">{topEntry.playerName}</span>
      <span className="text-yellow-400/70">{displayScore}</span>
    </div>
  );
};
