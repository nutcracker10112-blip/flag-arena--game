export interface Country {
  name: string;
  code: string;
}

export interface FlagState {
  id: string;
  country: Country;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface EliminatedFlagState extends FlagState {
  fallSpeedY: number;
  scale: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export type GameState = 'IDLE' | 'RUNNING' | 'FINISHED';
