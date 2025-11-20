export interface GameEvent {
  eventCategory: string;
  eventAction: 'try' | 'clear' | 'fail';
  eventLabel: string;
  eventValue: string;
  customEventProperties: {
    last_level: number;
    exit_type?: 'voluntary_exit';
    is_repeat_play?: boolean;
  };
  clientIpCountry?: string;
  clientIpCountryCode?: string;
}

export interface StageStats {
  stageId: string;
  totalAttempts: number;
  clears: number;
  fails: number;
  voluntaryExits: number;
  repeatPlays: number;
  clearRate: number;
  averageFailLevel: number;
  failsByLevel: Record<number, number>;
}

export interface DifficultySpike {
  level: number;
  failCount: number;
  failRate: number;
}

export interface FunnelData {
  level: number;
  remaining: number;
  dropped: number;
  dropRate: number;
}

export type StageType = 'all' | 'normal' | 'elite' | 'luck' | 'mass';

export interface FilterOptions {
  excludeVoluntaryExits: boolean;
  excludeRepeatPlays: boolean;
  stageType: StageType;
  selectedCountries: string[];
}
