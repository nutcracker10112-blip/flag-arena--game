import React, { useState, useCallback } from 'react';
import GameArena from './components/GameArena';
import WinnerModal from './components/WinnerModal';
import SettingsMenu from './components/SettingsMenu';
import Leaderboard from './components/Leaderboard';
import { COUNTRIES, GAME_SETTINGS } from './constants';
import type { Country, GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [winner, setWinner] = useState<Country | null>(null);
  const [gameKey, setGameKey] = useState<number>(1);
  const [matchHistory, setMatchHistory] = useState<Country[]>([]);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [eliminatorSpeed, setEliminatorSpeed] = useState(GAME_SETTINGS.ELIMINATOR_SPEED);
  const [initialSpeed, setInitialSpeed] = useState(GAME_SETTINGS.INITIAL_SPEED);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // Volume states (0 to 1)
  const [collisionVolume, setCollisionVolume] = useState(0.4);
  const [winningVolume, setWinningVolume] = useState(0.6);

  const handleTogglePlay = useCallback(() => {
    if (gameState === 'RUNNING') {
        setGameState('IDLE');
    } else {
        if (gameState === 'FINISHED') {
             setGameKey(prevKey => prevKey + 1);
             setWinner(null);
        }
        setGameState('RUNNING');
    }
  }, [gameState]);
  
  const handlePlayAgain = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
    setWinner(null);
    setGameState('IDLE');
    setTimeout(() => {
        setGameState('RUNNING');
    }, 100);
  }, []);

  const handleGameOver = useCallback((winningCountry: Country) => {
    setWinner(winningCountry);
    setGameState('FINISHED');
    setMatchHistory(prev => [winningCountry, ...prev].slice(0, 4));

    setTimeout(() => {
        handlePlayAgain();
    }, 4500); 

  }, [handlePlayAgain]);

  return (
    <>
    <button onClick={() => setIsMenuOpen(true)} className="fixed top-4 left-4 z-50 p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-lg text-sky-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    </button>

    <div className="fixed top-4 right-4 z-40 max-w-[200px] md:max-w-sm">
      <Leaderboard matchHistory={matchHistory} />
    </div>
    
    <SettingsMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        eliminatorSpeed={eliminatorSpeed}
        onEliminatorSpeedChange={setEliminatorSpeed}
        initialSpeed={initialSpeed}
        onInitialSpeedChange={setInitialSpeed}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={() => setIsSoundEnabled(prev => !prev)}
        collisionVolume={collisionVolume}
        onCollisionVolumeChange={setCollisionVolume}
        winningVolume={winningVolume}
        onWinningVolumeChange={setWinningVolume}
        gameState={gameState}
        onTogglePlay={handleTogglePlay}
    />

    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-200 font-sans p-4 overflow-hidden relative">
      <div className="w-full max-w-7xl mx-auto flex justify-center px-4 z-10">
        <main className="flex flex-col items-center justify-center">
            <GameArena
                key={gameKey}
                countries={COUNTRIES}
                onGameOver={handleGameOver}
                isPlaying={gameState === 'RUNNING'}
                initialSpeed={initialSpeed}
                eliminatorSpeed={eliminatorSpeed}
                isSoundEnabled={isSoundEnabled}
                collisionVolume={collisionVolume}
            />
            
            <div className="flex items-center justify-center mt-8">
                 {gameState !== 'RUNNING' && (
                <button
                    onClick={handleTogglePlay}
                    className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    {gameState === 'FINISHED' ? 'New Battle' : 'Start Battle'}
                </button>
                )}
            </div>
        </main>
      </div>

      {winner && gameState === 'FINISHED' && (
        <WinnerModal 
          winner={winner} 
          onPlayAgain={handlePlayAgain} 
          isSoundEnabled={isSoundEnabled} 
          winningVolume={winningVolume}
        />
      )}
      
    </div>
    </>
  );
};

export default App;