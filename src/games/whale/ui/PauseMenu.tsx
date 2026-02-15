import React from 'react';

interface Props {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseMenu({ onResume, onQuit }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1628dd] z-50">
      <h2
        className="text-[#a0d8e8] text-xl mb-10"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        PAUSED
      </h2>
      <div className="flex flex-col gap-4">
        <button
          onClick={onResume}
          className="px-8 py-3 text-[#e8e0d0] text-xs border-2 border-[#4080a0] bg-[#1a3a5c] hover:bg-[#2a5a8c] transition-colors"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          RESUME
        </button>
        <button
          onClick={onQuit}
          className="px-8 py-3 text-[#e8e0d0] text-xs border-2 border-[#4080a0] bg-[#1a3a5c] hover:bg-[#2a5a8c] transition-colors"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          QUIT
        </button>
      </div>
    </div>
  );
}
