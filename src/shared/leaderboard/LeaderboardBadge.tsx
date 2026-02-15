import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, fetchLeaderboard } from './api';

interface LeaderboardBadgeProps {
  gameName: string;
  formatScore?: (score: number) => string;
  className?: string;
}

function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // Monday start
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

const MEDALS = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

export const LeaderboardBadge: React.FC<LeaderboardBadgeProps> = ({ gameName, formatScore, className }) => {
  const [mode, setMode] = useState<'week' | 'all'>('week');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const since = mode === 'week' ? getWeekStart() : undefined;
    fetchLeaderboard(gameName, since).then(data => {
      setEntries(data.slice(0, 3));
      setLoading(false);
    });
  }, [gameName, mode]);

  const display = (score: number) => formatScore ? formatScore(score) : score.toLocaleString();

  return (
    <div className={`bg-black/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-3 py-2 min-w-[160px] ${className || ''}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-yellow-400 text-[10px] font-bold tracking-wider">LEADERBOARD</span>
        <div className="flex gap-0.5">
          <button
            onClick={() => setMode('week')}
            className={`text-[8px] px-1.5 py-0.5 rounded transition-colors ${
              mode === 'week'
                ? 'bg-yellow-500/30 text-yellow-300'
                : 'text-yellow-500/50 hover:text-yellow-400'
            }`}
          >
            WEEK
          </button>
          <button
            onClick={() => setMode('all')}
            className={`text-[8px] px-1.5 py-0.5 rounded transition-colors ${
              mode === 'all'
                ? 'bg-yellow-500/30 text-yellow-300'
                : 'text-yellow-500/50 hover:text-yellow-400'
            }`}
          >
            ALL
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-yellow-500/40 text-[9px] text-center py-1">...</div>
      ) : entries.length === 0 ? (
        <div className="text-yellow-500/40 text-[9px] text-center py-1">No scores yet</div>
      ) : (
        <div className="space-y-0.5">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[9px]">
              <span className="w-4 text-center">{MEDALS[i]}</span>
              <span className="text-yellow-200 font-bold truncate flex-1 max-w-[80px]">{entry.playerName}</span>
              <span className="text-yellow-400/70 tabular-nums">{display(entry.score)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
