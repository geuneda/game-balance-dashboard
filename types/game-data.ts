export interface GameEvent {
  eventCategory: string;
  eventAction: 'try' | 'clear' | 'fail' | 'clearIsFirst' | 'failIsFirst';
  eventLabel: string;
  eventValue: string;
  customEventProperties: {
    last_level: number;
    exit_type?: 'voluntary_exit';
    is_repeat_play?: boolean;
  };
  userId?: string;
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

export interface StageAttritionData {
  stageId: string;
  attempts: number;
  attritionRate: number;
  attritionCount: number;
}

export interface UserAttritionData {
  stageId: string;
  uniqueUsers: number;
  userAttritionCount: number;
  userAttritionRate: number;
  cumulativeUsers: number;
  cumulativeAttritionRate: number;
}

export interface UserStageStats {
  stageId: string;
  uniqueUsers: number;
  totalAttempts: number;
  totalClears: number;
  usersCleared: number;
  usersFailed: number;
  userClearRate: number;
  clearProbability: number;
  averageAttemptsPerUser: number;
  usersWithVoluntaryExit: number;
  usersWithRepeatPlay: number;
}

export type StageType = 'all' | 'normal' | 'elite' | 'luck' | 'mass';

export interface FilterOptions {
  excludeVoluntaryExits: boolean;
  excludeRepeatPlays: boolean;
  stageType: StageType;
  selectedCountries: string[];
}

export interface FirstClearByTryCount {
  tryCount: number;
  userCount: number;
}

export interface FirstClearStageData {
  stageId: string;
  totalFirstClearUsers: number;
  byTryCount: FirstClearByTryCount[];
}
