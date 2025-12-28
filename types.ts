
export enum GameState {
  LORE = 'LORE',
  BOOT = 'BOOT',
  ACTIVE = 'ACTIVE',
  PHOTO_VIEW = 'PHOTO_VIEW',
  MINIGAME = 'MINIGAME',
  ENDING = 'ENDING',
  DEATH = 'DEATH'
}

export type MiniGameType = 'TIMING' | 'SIMON';

export interface Coordinates {
  x: number;
  y: number;
}

export interface Anomaly {
  id: string;
  pos: Coordinates;
  name: string;
  found: boolean;
  description: string;
  visualData: string;
}

export interface LogEntry {
  timestamp: string;
  source: 'SYSTEM' | 'CORP' | 'USER' | 'UNKNOWN';
  message: string;
}
