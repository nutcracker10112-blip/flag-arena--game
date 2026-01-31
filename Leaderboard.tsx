import React from 'react';
import type { Country } from '../types';

interface LeaderboardProps {
  matchHistory: Country[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ matchHistory }) => {
  return (
    <div className="w-full bg-white/60 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/40 ring-1 ring-sky-900/5">
      <h3 className="text-[10px] md:text-xs font-black text-sky-800 text-center uppercase tracking-widest mb-2 border-b border-sky-100 pb-1">
        Last 4 Winners
      </h3>
      {matchHistory.length > 0 ? (
        <ul className="space-y-1.5">
          {matchHistory.map((winner, index) => (
            <li 
              key={`${winner.code}-${index}`} 
              className={`flex items-center space-x-2 bg-white/80 p-1.5 rounded-lg shadow-sm transition-all duration-300 ${index === 0 ? 'ring-1 ring-yellow-400/50 bg-yellow-50/50' : ''}`}
            >
              <div className="flex-shrink-0 relative">
                <img src={`https://flagcdn.com/w40/${winner.code}.png`} alt={winner.name} className="h-4 md:h-5 rounded-sm shadow-sm" />
                {index === 0 && <span className="absolute -top-1 -left-1 text-[8px]">👑</span>}
              </div>
              <span className="text-[10px] md:text-sm text-sky-900 font-bold truncate max-w-[80px] md:max-w-[120px]">{winner.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-2 text-center">
          <p className="text-[10px] md:text-xs text-sky-600 italic">Battles pending...</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;