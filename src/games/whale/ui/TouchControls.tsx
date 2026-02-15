import React, { useCallback } from 'react';
import { Direction } from '../types';
import { InputManager } from '../engine/InputManager';

interface Props {
  input: InputManager;
}

export function TouchControls({ input }: Props) {
  const handleDirDown = useCallback((dir: Direction) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    input.setTouchDirection(dir);
  }, [input]);

  const handleDirUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    input.setTouchDirection(null);
  }, [input]);

  const handleADown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    input.setTouchA(true);
  }, [input]);

  const handleAUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    input.setTouchA(false);
  }, [input]);

  const handleBDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    input.setTouchB(true);
  }, [input]);

  const handleBUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    input.setTouchB(false);
  }, [input]);

  const btnClass = "w-12 h-12 rounded-lg flex items-center justify-center select-none active:opacity-70 border-2";
  const dpadColor = "bg-[#1a3a5c] border-[#4080a0] text-[#a0d8e8]";
  const actionColor = "border-[#4080a0] text-[#e8e0d0]";

  return (
    <div className="absolute bottom-2 left-0 right-0 flex justify-between items-end px-4 z-40 md:hidden pointer-events-none">
      {/* D-Pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 pointer-events-auto" style={{ width: '160px', height: '160px' }}>
        <div />
        <button
          className={`${btnClass} ${dpadColor}`}
          onTouchStart={handleDirDown(Direction.Up)}
          onTouchEnd={handleDirUp}
          onMouseDown={handleDirDown(Direction.Up)}
          onMouseUp={handleDirUp}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}
        >
          ^
        </button>
        <div />
        <button
          className={`${btnClass} ${dpadColor}`}
          onTouchStart={handleDirDown(Direction.Left)}
          onTouchEnd={handleDirUp}
          onMouseDown={handleDirDown(Direction.Left)}
          onMouseUp={handleDirUp}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}
        >
          &lt;
        </button>
        <div />
        <button
          className={`${btnClass} ${dpadColor}`}
          onTouchStart={handleDirDown(Direction.Right)}
          onTouchEnd={handleDirUp}
          onMouseDown={handleDirDown(Direction.Right)}
          onMouseUp={handleDirUp}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}
        >
          &gt;
        </button>
        <div />
        <button
          className={`${btnClass} ${dpadColor}`}
          onTouchStart={handleDirDown(Direction.Down)}
          onTouchEnd={handleDirUp}
          onMouseDown={handleDirDown(Direction.Down)}
          onMouseUp={handleDirUp}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}
        >
          v
        </button>
        <div />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 items-end pointer-events-auto mb-4">
        <button
          className={`${btnClass} ${actionColor} bg-[#2d6b4e] w-14 h-14`}
          onTouchStart={handleBDown}
          onTouchEnd={handleBUp}
          onMouseDown={handleBDown}
          onMouseUp={handleBUp}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
        >
          B
        </button>
        <button
          className={`${btnClass} ${actionColor} bg-[#1a5a8c] w-14 h-14`}
          onTouchStart={handleADown}
          onTouchEnd={handleAUp}
          onMouseDown={handleADown}
          onMouseUp={handleAUp}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
        >
          A
        </button>
      </div>
    </div>
  );
}
