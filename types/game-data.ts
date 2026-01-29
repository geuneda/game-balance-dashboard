export interface GameEvent {
    eventCategory: string;
    eventAction: "try" | "clear" | "fail" | "clearIsFirst" | "failIsFirst";
    eventLabel: string;
    eventValue: string;
    customEventProperties: {
        last_level: number;
        exit_type?: "voluntary_exit";
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

export type StageType = "all" | "normal" | "elite" | "luck" | "mass";

export interface FilterOptions {
    excludeVoluntaryExitsLowLevel: boolean;
    excludeVoluntaryExitsHighLevel: boolean;
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

// Revive (부활) related types
export interface ReviveEvent {
    stageId: string;
    reviveType: string;
    reviveCount: number;
    userId?: string;
}

export interface ReviveCountDistribution {
    reviveCount: number; // 총 부활 횟수 (1회, 2회, 3회...)
    gameCount: number; // 해당 횟수로 부활한 게임 수
}

export interface StageReviveStats {
    stageId: string;
    totalReviveEvents: number; // 총 부활 이벤트 수
    totalGamesWithRevive: number; // 부활이 있는 게임 수
    reviveCountDistribution: ReviveCountDistribution[]; // 부활 횟수별 분포
    reviveTypeDistribution: Record<string, number>; // 부활 타입별 분포
    averageRevivePerGame: number; // 게임당 평균 부활 횟수
}

// 부활 그룹 타입 (게임 세션 내 최대 부활 횟수 기준)
export type ReviveGroup = "all" | "0" | "1" | "2plus";

// 유저별 부활 그룹 정보
export interface UserReviveGroup {
    userId: string;
    maxReviveCount: number; // 해당 유저의 최대 부활 횟수
    reviveGroup: ReviveGroup;
}
