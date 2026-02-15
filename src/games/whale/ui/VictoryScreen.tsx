import React from 'react';
import { ScoreBreakdown } from '../types';

type SubmitStatus = 'idle' | 'submitting' | 'qualified' | 'not_qualified' | 'error';

interface Props {
  onMenu: () => void;
  score: number;
  scoreBreakdown: ScoreBreakdown | null;
  onSubmitScore?: () => void;
  submitStatus?: SubmitStatus;
}

export function VictoryScreen({ onMenu, score, scoreBreakdown, onSubmitScore, submitStatus = 'idle' }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#1a3a5c] to-[#2d6b4e] z-50 overflow-auto">
      <h2
        className="text-[#60c0f0] text-lg md:text-xl mb-2 mt-8"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        REUNITED
      </h2>
      <p
        className="text-[#a0d8e8] text-xs mb-4"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        ~ The Song is Complete ~
      </p>

      {/* Two whales */}
      <div className="flex items-center gap-2 mb-4">
        <svg width="60" height="40" viewBox="0 0 60 40">
          <ellipse cx="30" cy="22" rx="18" ry="10" fill="#6eb8d0" />
          <ellipse cx="30" cy="26" rx="12" ry="5" fill="#a0d8e8" />
          <circle cx="22" cy="18" r="1.5" fill="#202020" />
          <polygon points="48,22 56,16 56,28" fill="#6eb8d0" />
        </svg>
        <svg width="80" height="50" viewBox="0 0 80 50">
          <ellipse cx="40" cy="28" rx="24" ry="14" fill="#4a8aa0" />
          <ellipse cx="40" cy="32" rx="16" ry="7" fill="#6eb8d0" />
          <circle cx="28" cy="24" r="2" fill="#202020" />
          <polygon points="64,28 76,20 76,36" fill="#4a8aa0" />
        </svg>
      </div>

      {/* Score breakdown */}
      {scoreBreakdown && (
        <div
          className="bg-[#0a1628cc] border border-[#4080a0] rounded px-4 py-3 mb-4 w-64"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <div className="text-[#f0d860] text-sm text-center mb-3">SCORE</div>
          <div className="space-y-1 text-[7px]">
            <div className="flex justify-between text-[#a0d8e8]">
              <span>Time</span><span>{scoreBreakdown.timeScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#a0d8e8]">
              <span>Treasures</span><span>{scoreBreakdown.treasureScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#a0d8e8]">
              <span>Side Rooms</span><span>{scoreBreakdown.sideRoomScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#a0d8e8]">
              <span>Bosses</span><span>{scoreBreakdown.bossScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#a0d8e8]">
              <span>Fragments</span><span>{scoreBreakdown.fragmentScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#a0d8e8]">
              <span>Health</span><span>{scoreBreakdown.healthScore.toLocaleString()}</span>
            </div>
            <div className="border-t border-[#4080a0] mt-2 pt-2 flex justify-between text-[#f0d860] text-[9px]">
              <span>Total</span><span>{scoreBreakdown.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div
        className="max-w-sm text-center px-4 mb-4"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        <p className="text-[#e8e0d0] text-[8px] leading-relaxed mb-3">
          Kira has completed her migration from the warm calving waters of Florida to the rich feeding grounds of the Gulf of Maine.
        </p>
        <p className="text-[#60c0f0] text-[8px] leading-relaxed mb-3">
          Fewer than 350 North Atlantic right whales remain. You can help by supporting marine speed limits, ropeless fishing gear, and ocean noise reduction.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {onSubmitScore && submitStatus === 'idle' && (
          <button
            onClick={onSubmitScore}
            className="px-8 py-3 text-[#f0d860] text-xs border-2 border-[#f0d860] bg-[#1a3a5c] hover:bg-[#2a5a8c] transition-colors"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            SUBMIT SCORE
          </button>
        )}
        {submitStatus === 'submitting' && (
          <div
            className="px-8 py-3 text-[#a0d8e8] text-xs border-2 border-[#4080a0] bg-[#0a1628]"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            SUBMITTING...
          </div>
        )}
        {submitStatus === 'qualified' && (
          <div
            className="px-8 py-3 text-[#60e080] text-xs border-2 border-[#60e080] bg-[#0a1628]"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            SCORE SAVED!
          </div>
        )}
        {submitStatus === 'not_qualified' && (
          <div
            className="px-8 py-3 text-[#e0a040] text-xs border-2 border-[#e0a040] bg-[#0a1628]"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            NOT A TOP 10 SCORE
          </div>
        )}
        {submitStatus === 'error' && (
          <button
            onClick={onSubmitScore}
            className="px-8 py-3 text-[#e04060] text-xs border-2 border-[#e04060] bg-[#0a1628] hover:bg-[#1a3a5c] transition-colors"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            ERROR - RETRY?
          </button>
        )}
        <button
          onClick={onMenu}
          className="px-8 py-3 text-[#e8e0d0] text-xs border-2 border-[#4080a0] bg-[#1a3a5c] hover:bg-[#2a5a8c] transition-colors"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
