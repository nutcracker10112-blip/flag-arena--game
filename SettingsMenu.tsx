import React from 'react';
import type { GameState } from '../types';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  eliminatorSpeed: number;
  onEliminatorSpeedChange: (speed: number) => void;
  initialSpeed: number;
  onInitialSpeedChange: (speed: number) => void;
  isSoundEnabled: boolean;
  onSoundToggle: () => void;
  collisionVolume: number;
  onCollisionVolumeChange: (vol: number) => void;
  winningVolume: number;
  onWinningVolumeChange: (vol: number) => void;
  gameState: GameState;
  onTogglePlay: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  eliminatorSpeed,
  onEliminatorSpeedChange,
  initialSpeed,
  onInitialSpeedChange,
  isSoundEnabled,
  onSoundToggle,
  collisionVolume,
  onCollisionVolumeChange,
  winningVolume,
  onWinningVolumeChange,
  gameState,
  onTogglePlay,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 w-80 p-6 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-sky-800">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="rotationSpeed" className="block text-sm font-medium text-gray-700">
              Rotation Speed: <span className="font-bold text-sky-700">{eliminatorSpeed.toFixed(1)}</span>
            </label>
            <input
              type="range"
              id="rotationSpeed"
              min="0.1"
              max="2.0"
              step="0.1"
              value={eliminatorSpeed}
              onChange={(e) => onEliminatorSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <div>
            <label htmlFor="bounceLevel" className="block text-sm font-medium text-gray-700">
              Bounce Level: <span className="font-bold text-sky-700">{initialSpeed.toFixed(1)}</span>
            </label>
            <input
              type="range"
              id="bounceLevel"
              min="0.5"
              max="5.0"
              step="0.1"
              value={initialSpeed}
              onChange={(e) => onInitialSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="soundToggle" className="text-sm font-medium text-gray-700">
                Master Audio
              </label>
              <button
                  onClick={onSoundToggle}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                  isSoundEnabled ? 'bg-sky-600' : 'bg-gray-300'
                  }`}
              >
                  <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                      isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Collision Sound: <span className="text-sky-700">{(collisionVolume * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={collisionVolume}
                  onChange={(e) => onCollisionVolumeChange(parseFloat(e.target.value))}
                  disabled={!isSoundEnabled}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Victory Music: <span className="text-sky-700">{(winningVolume * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={winningVolume}
                  onChange={(e) => onWinningVolumeChange(parseFloat(e.target.value))}
                  disabled={!isSoundEnabled}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-30"
                />
              </div>
            </div>
          </div>

           <button
                onClick={onTogglePlay}
                className="w-full mt-8 px-4 py-3 bg-sky-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all duration-300 disabled:bg-gray-400"
            >
                {gameState === 'RUNNING' ? 'Stop Battle' : 'Resume Battle'}
            </button>
        </div>
      </div>
    </>
  );
};

export default SettingsMenu;