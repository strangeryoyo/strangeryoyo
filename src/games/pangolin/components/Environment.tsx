import React from 'react';

interface EnvironmentProps {
  offset: number;
}

export const Background: React.FC<EnvironmentProps> = ({ offset }) => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-green-800 to-emerald-950 opacity-90"></div>
      
      {/* Parallax Layers - slower and continuous */}
      <div
        className="absolute bottom-12 left-0 w-[400%] flex opacity-20 filter blur-sm"
        style={{ transform: `translateX(${- (offset * 0.02) % (window.innerWidth * 2)}px)` }}
      >
        {[...Array(30)].map((_, i) => (
          <div key={i} className="w-32 h-96 bg-emerald-950 rounded-t-full mx-10 transform scale-x-150"></div>
        ))}
      </div>

      <div
        className="absolute bottom-16 left-0 w-[400%] flex opacity-40"
        style={{ transform: `translateX(${- (offset * 0.05) % (window.innerWidth * 2)}px)` }}
      >
        {[...Array(40)].map((_, i) => (
          <div key={i} className={`w-24 h-64 bg-green-950 rounded-t-full mx-4 ${i % 2 === 0 ? 'translate-y-4' : '-translate-y-2'}`}></div>
        ))}
      </div>

      <div className="absolute bottom-20 left-0 w-full h-32 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>
    </div>
  );
};

export const Floor: React.FC<{ height: number; offset: number }> = ({ height, offset }) => {
  return (
    <div 
      className="absolute bottom-0 w-full bg-stone-900 border-t-8 border-emerald-900 z-10 overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div 
        className="absolute top-0 flex w-[200%]"
        style={{ transform: `translateX(${- (offset % 100)}px)` }}
      >
        {[...Array(200)].map((_, i) => (
          <div 
            key={i} 
            className="w-4 bg-green-800 opacity-40 rounded-t-full" 
            style={{ height: `${Math.sin(i) * 5 + 10}px`, marginTop: `-${Math.sin(i) * 5 + 10}px` }}
          ></div>
        ))}
      </div>
      <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
    </div>
  );
};