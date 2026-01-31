import React, { useEffect, useRef } from 'react';
import type { Country } from '../types';

interface WinnerModalProps {
  winner: Country;
  onPlayAgain: () => void;
  isSoundEnabled: boolean;
  winningVolume: number;
}

declare global {
    interface Window {
        confetti: any;
    }
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onPlayAgain, isSoundEnabled, winningVolume }) => {
  const isMounted = useRef(false);

  const playVictoryFanfare = () => {
    if (!isSoundEnabled || winningVolume <= 0) return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNote = (freq: number, startTime: number, duration: number, baseVolume: number = 0.2) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(baseVolume * winningVolume, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playNote(261.63, now, 0.4, 0.3);
    playNote(329.63, now + 0.15, 0.4, 0.3);
    playNote(392.00, now + 0.3, 0.4, 0.3);
    playNote(523.25, now + 0.45, 1.2, 0.4);
    
    playNote(329.63, now + 0.45, 1.2, 0.1);
    playNote(392.00, now + 0.45, 1.2, 0.1);
  };

  useEffect(() => {
    if (!isMounted.current) {
        if (typeof window.confetti === 'function') {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: ReturnType<typeof setInterval> = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);

                const particleCount = 50 * (timeLeft / duration);
                window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }

        playVictoryFanfare();
        isMounted.current = true;
    }
  }, [isSoundEnabled, winningVolume]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center transform scale-95 hover:scale-100 transition-transform duration-300 ease-out">
        <h2 className="text-2xl font-light text-gray-600">And the winner is...</h2>
        <div className="my-6 flex flex-col items-center">
          <img
            src={`https://flagcdn.com/w80/${winner.code}.png`}
            alt={winner.name}
            className="w-24 h-auto rounded-lg shadow-lg mb-4 animate-bounce"
          />
          <h1 className="text-5xl font-extrabold text-gray-800">{winner.name}</h1>
        </div>
        <button
          onClick={onPlayAgain}
          className="mt-6 px-10 py-4 bg-green-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 ease-in-out transform hover:scale-110"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;