import React from 'react';
import type { Country } from '../types';
import { GAME_SETTINGS } from '../constants';

interface FlagProps {
  country: Country;
  x: number;
  y: number;
}

const Flag: React.FC<FlagProps> = ({ country, x, y }) => {
  const { FLAG_WIDTH, FLAG_HEIGHT } = GAME_SETTINGS;
  return (
    <div
      className="absolute"
      style={{
        width: `${FLAG_WIDTH}px`,
        height: `${FLAG_HEIGHT}px`,
        left: `-${FLAG_WIDTH/2}px`,
        top: `-${FLAG_HEIGHT/2}px`,
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
        zIndex: 1,
      }}
    >
      <img
        src={`https://flagcdn.com/w40/${country.code}.png`}
        alt={country.name}
        className="w-full h-full object-cover rounded-sm shadow-md"
        title={country.name}
        draggable="false"
      />
    </div>
  );
};

export default React.memo(Flag);
