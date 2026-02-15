import React, { useState, useRef, useEffect } from 'react';

interface NamePromptModalProps {
  onSubmit: (name: string) => void;
  onSkip: () => void;
}

export const NamePromptModal: React.FC<NamePromptModalProps> = ({ onSubmit, onSkip }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0 && name.trim().length <= 20) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-yellow-500/10">
        <div className="text-center mb-4">
          <span className="text-4xl">🏆</span>
          <h2 className="text-xl font-black text-white mt-2">New High Score!</h2>
          <p className="text-slate-400 text-sm mt-1">Enter your name for the leaderboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            maxLength={20}
            className="w-full bg-slate-800 border-2 border-slate-700 focus:border-yellow-500 text-white rounded-xl px-4 py-3 text-center text-lg font-bold outline-none transition-colors placeholder:text-slate-600"
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={name.trim().length === 0}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
