import { GameEvent, StageStats, DifficultySpike, FunnelData, FilterOptions, StageType, StageAttritionData, UserAttritionData, UserStageStats, FirstClearStageData } from '@/types/game-data';

/**
 * Helper functions to check event action types
 * Handles both regular and "IsFirst" variants (e.g., 'clear' and 'clearIsFirst')
 */
export function isClearEvent(event: GameEvent): boolean {
  return event.eventAction === 'clear' || event.eventAction === 'clearIsFirst';
}

export function isFailEvent(event: GameEvent): boolean {
  return event.eventAction === 'fail' || event.eventAction === 'failIsFirst';
}

export function isTryEvent(event: GameEvent): boolean {
  return event.eventAction === 'try';
}

export function parseCSVData(csvData: any[]): GameEvent[] {
  return csvData.map(row => {
    const customProps = row['Custom Event Properties']
      ? JSON.parse(row['Custom Event Properties'])
      : {};

    return {
      eventCategory: row['Event Category'],
      eventAction: row['Event Action'],
      eventLabel: row['Event Label'],
      eventValue: row['Event Value'],
      customEventProperties: customProps,
      userId: row['User ID'] || undefined,
      clientIpCountry: row['Client IP Country'] || undefined,
      clientIpCountryCode: row['Country'] || undefined  // Fixed: use 'Country' column for country code
    };
  });
}

/**
 * Get the stage type based on stage ID
 */
export function getStageType(stageId: string): StageType {
  const id = parseInt(stageId);
  if (id >= 2001 && id <= 2999) return 'normal';
  if (id >= 3001 && id <= 3999) return 'elite';
  if (id >= 4001 && id <= 4999) return 'luck';
  if (id >= 5001 && id <= 5999) return 'mass';
  return 'normal'; // Default to normal if not in range
}

/**
 * Format stage ID to human-readable Korean format
 * 2015 → "일반 15"
 * 3012 → "정예 12"
 * 4008 → "물량 8"
 * 5020 → "운빨 20"
 */
export function formatStageId(stageId: string): string {
  const id = parseInt(stageId);

  if (id >= 2001 && id <= 2999) {
    return `일반 ${id - 2000}`;
  }
  if (id >= 3001 && id <= 3999) {
    return `정예 ${id - 3000}`;
  }
  if (id >= 4001 && id <= 4999) {
    return `물량 ${id - 4000}`;
  }
  if (id >= 5001 && id <= 5999) {
    return `운빨 ${id - 5000}`;
  }

  // Fallback: return original stageId if not in expected range
  return stageId;
}

/**
 * Filter events based on filter options
 */
export function filterEvents(events: GameEvent[], options: FilterOptions): GameEvent[] {
  let filtered = [...events];

  // Filter out voluntary exits
  if (options.excludeVoluntaryExits) {
    filtered = filtered.filter(event => {
      if (isFailEvent(event) && event.customEventProperties.exit_type === 'voluntary_exit') {
        return false;
      }
      return true;
    });
  }

  // Filter out repeat plays
  if (options.excludeRepeatPlays) {
    filtered = filtered.filter(event => {
      // Keep events that don't have is_repeat_play or have it as false
      return !event.customEventProperties.is_repeat_play;
    });
  }

  // Filter by stage type
  if (options.stageType !== 'all') {
    filtered = filtered.filter(event => {
      const stageType = getStageType(event.eventLabel);
      return stageType === options.stageType;
    });
  }

  // Filter by country
  if (options.selectedCountries.length > 0) {
    filtered = filtered.filter(event => {
      // Keep events that match any of the selected countries (by country code)
      return event.clientIpCountryCode && options.selectedCountries.includes(event.clientIpCountryCode);
    });
  }

  return filtered;
}

export function calculateStageStats(events: GameEvent[]): StageStats[] {
  const stageMap = new Map<string, GameEvent[]>();

  // Group events by stage
  events.forEach(event => {
    const stageId = event.eventLabel;
    if (!stageMap.has(stageId)) {
      stageMap.set(stageId, []);
    }
    stageMap.get(stageId)!.push(event);
  });

  // Calculate stats for each stage
  const stats: StageStats[] = [];

  stageMap.forEach((stageEvents, stageId) => {
    const tryEvents = stageEvents.filter(e => isTryEvent(e)).length;
    const clears = stageEvents.filter(e => isClearEvent(e)).length;
    const fails = stageEvents.filter(e => isFailEvent(e)).length;
    const voluntaryExits = stageEvents.filter(
      e => isFailEvent(e) && e.customEventProperties.exit_type === 'voluntary_exit'
    ).length;
    const repeatPlays = stageEvents.filter(
      e => e.customEventProperties.is_repeat_play === true
    ).length;

    // Fallback: if 'try' events are missing or inconsistent, use clears + fails
    // This handles cases where event logging is incomplete
    const totalAttempts = Math.max(tryEvents, clears + fails);

    const failEvents = stageEvents.filter(e => isFailEvent(e));
    const failsByLevel: Record<number, number> = {};
    let totalFailLevel = 0;

    failEvents.forEach(event => {
      const level = event.customEventProperties.last_level;
      failsByLevel[level] = (failsByLevel[level] || 0) + 1;
      totalFailLevel += level;
    });

    const averageFailLevel = fails > 0 ? totalFailLevel / fails : 0;
    const clearRate = totalAttempts > 0 ? (clears / totalAttempts) * 100 : 0;

    stats.push({
      stageId,
      totalAttempts,
      clears,
      fails,
      voluntaryExits,
      repeatPlays,
      clearRate,
      averageFailLevel,
      failsByLevel
    });
  });

  return stats.sort((a, b) => a.stageId.localeCompare(b.stageId));
}

export function findDifficultySpikes(events: GameEvent[]): DifficultySpike[] {
  const failsByLevel: Record<number, number> = {};
  const attemptsByLevel: Record<number, number> = {};

  events.forEach(event => {
    if (isFailEvent(event)) {
      const level = event.customEventProperties.last_level;
      failsByLevel[level] = (failsByLevel[level] || 0) + 1;
    }

    if (isTryEvent(event)) {
      for (let i = 1; i <= 20; i++) {
        attemptsByLevel[i] = (attemptsByLevel[i] || 0) + 1;
      }
    }

    if (isFailEvent(event)) {
      const level = event.customEventProperties.last_level;
      for (let i = level + 1; i <= 20; i++) {
        attemptsByLevel[i] = Math.max(0, (attemptsByLevel[i] || 0) - 1);
      }
    }
  });

  const spikes: DifficultySpike[] = [];

  for (let level = 1; level <= 20; level++) {
    const failCount = failsByLevel[level] || 0;
    const attempts = attemptsByLevel[level] || 0;
    const failRate = attempts > 0 ? (failCount / attempts) * 100 : 0;

    spikes.push({
      level,
      failCount,
      failRate
    });
  }

  return spikes;
}

export function calculateFunnelData(events: GameEvent[]): FunnelData[] {
  const totalTries = events.filter(e => isTryEvent(e)).length;
  const clearCount = events.filter(e => isClearEvent(e)).length;

  // 각 레벨에서 실패한 횟수 (last_level === N인 경우)
  const failsByLevel: Record<number, number> = {};
  events.forEach(event => {
    if (isFailEvent(event)) {
      const level = event.customEventProperties.last_level;
      failsByLevel[level] = (failsByLevel[level] || 0) + 1;
    }
  });
  
  const funnelData: FunnelData[] = [];
  
  for (let level = 1; level <= 20; level++) {
    // 이 레벨에 도달한 플레이어 수 = 이 레벨 이상에서 실패한 수 + clear한 수
    let reachedThisLevel = clearCount;
    for (let l = level; l <= 20; l++) {
      reachedThisLevel += (failsByLevel[l] || 0);
    }
    
    // 이 레벨에서 실패한 수
    const dropped = failsByLevel[level] || 0;
    
    // 이 레벨을 통과한 수 (다음 레벨로 넘어간 수)
    const remaining = reachedThisLevel - dropped;
    
    const dropRate = reachedThisLevel > 0 ? (dropped / reachedThisLevel) * 100 : 0;
    
    funnelData.push({
      level,
      remaining,
      dropped,
      dropRate
    });
  }
  
  return funnelData;
}

export function calculateStageAttrition(stats: StageStats[]): StageAttritionData[] {
  // 스테이지를 정렬하고 이탈률 계산
  const sortedStats = [...stats].sort((a, b) => a.stageId.localeCompare(b.stageId));

  return sortedStats.map((stage, index) => {
    let attritionCount = 0;
    let attritionRate = 0;

    // 이전 스테이지의 시도 수와 현재 스테이지의 시도 수를 비교
    // (이전 스테이지를 시도했지만 현재 스테이지를 시도하지 않은 사람 = 이탈)
    if (index > 0) {
      const prevStage = sortedStats[index - 1];
      const prevAttempts = prevStage.totalAttempts;
      const currentAttempts = stage.totalAttempts;

      attritionCount = Math.max(0, prevAttempts - currentAttempts);
      attritionRate = prevAttempts > 0
        ? (attritionCount / prevAttempts) * 100
        : 0;
    }

    return {
      stageId: stage.stageId,
      attempts: stage.totalAttempts,
      attritionRate,
      attritionCount
    };
  });
}

/**
 * Calculate funnel data for a specific stage
 */
export function calculateStageSpecificFunnelData(events: GameEvent[], stageId: string): FunnelData[] {
  const stageEvents = events.filter(e => e.eventLabel === stageId);
  return calculateFunnelData(stageEvents);
}

/**
 * Get unique stage IDs from events
 */
export function getStageIds(events: GameEvent[]): string[] {
  const stageIds = new Set<string>();
  events.forEach(event => {
    if (event.eventLabel) {
      stageIds.add(event.eventLabel);
    }
  });
  return Array.from(stageIds).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });
}

/**
 * Get unique countries from events, sorted by event count (most frequent first)
 */
export function getCountries(events: GameEvent[]): Array<{ code: string; name: string; count: number }> {
  const countryMap = new Map<string, { name: string; count: number }>();

  events.forEach(event => {
    if (event.clientIpCountryCode && event.clientIpCountry) {
      const existing = countryMap.get(event.clientIpCountryCode);
      if (existing) {
        existing.count++;
      } else {
        countryMap.set(event.clientIpCountryCode, {
          name: event.clientIpCountry,
          count: 1
        });
      }
    }
  });

  return Array.from(countryMap.entries())
    .map(([code, { name, count }]) => ({ code, name, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

export function getVoluntaryExitRate(events: GameEvent[]): number {
  const fails = events.filter(e => isFailEvent(e)).length;
  const voluntaryExits = events.filter(
    e => isFailEvent(e) && e.customEventProperties.exit_type === 'voluntary_exit'
  ).length;

  return fails > 0 ? (voluntaryExits / fails) * 100 : 0;
}

export function getOverallClearRate(events: GameEvent[]): number {
  const attempts = events.filter(e => isTryEvent(e)).length;
  const clears = events.filter(e => isClearEvent(e)).length;
  const fails = events.filter(e => isFailEvent(e)).length;

  // Fallback: if 'try' events are missing or inconsistent, use clears + fails
  const totalAttempts = Math.max(attempts, clears + fails);

  return totalAttempts > 0 ? (clears / totalAttempts) * 100 : 0;
}

/**
 * Calculate user-based attrition by tracking unique users at each stage
 * This shows real player drop-off rather than just attempt counts
 */
export function calculateUserAttrition(events: GameEvent[]): UserAttritionData[] {
  // Group events by stage
  const stageMap = new Map<string, Set<string>>();

  events.forEach(event => {
    if (!event.userId) return;

    const stageId = event.eventLabel;
    if (!stageMap.has(stageId)) {
      stageMap.set(stageId, new Set());
    }
    stageMap.get(stageId)!.add(event.userId);
  });

  // Sort stages
  const sortedStages = Array.from(stageMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]));

  const result: UserAttritionData[] = [];
  let cumulativeUsers = 0;
  const initialUsers = sortedStages.length > 0 ? sortedStages[0][1].size : 0;

  sortedStages.forEach(([stageId, users], index) => {
    const uniqueUsers = users.size;

    // Calculate attrition compared to previous stage
    let userAttritionCount = 0;
    let userAttritionRate = 0;

    if (index > 0) {
      const prevUsers = sortedStages[index - 1][1].size;
      userAttritionCount = Math.max(0, prevUsers - uniqueUsers);
      userAttritionRate = prevUsers > 0 ? (userAttritionCount / prevUsers) * 100 : 0;
    }

    // Calculate cumulative attrition from the first stage
    cumulativeUsers = uniqueUsers;
    const cumulativeAttritionRate = initialUsers > 0
      ? ((initialUsers - cumulativeUsers) / initialUsers) * 100
      : 0;

    result.push({
      stageId,
      uniqueUsers,
      userAttritionCount,
      userAttritionRate,
      cumulativeUsers,
      cumulativeAttritionRate
    });
  });

  return result;
}

/**
 * Get unique user count from events
 */
export function getUniqueUserCount(events: GameEvent[]): number {
  const uniqueUsers = new Set<string>();
  events.forEach(event => {
    if (event.userId) {
      uniqueUsers.add(event.userId);
    }
  });
  return uniqueUsers.size;
}

/**
 * Calculate user-based stage statistics
 * Shows how many unique users attempted/cleared/failed each stage
 */
export function calculateUserStageStats(events: GameEvent[]): UserStageStats[] {
  // Group events by stage and user
  const stageUserMap = new Map<string, {
    users: Set<string>;
    userTryAttempts: Map<string, number>;
    userClearFailCount: Map<string, number>;
    hasTryEvents: boolean;
    totalClears: number;
    totalFails: number;
    clearedUsers: Set<string>;
    failedUsers: Set<string>;
    voluntaryExitUsers: Set<string>;
    repeatPlayUsers: Set<string>;
  }>();

  // First pass: collect all events per stage
  events.forEach(event => {
    if (!event.userId) return;

    const stageId = event.eventLabel;
    if (!stageUserMap.has(stageId)) {
      stageUserMap.set(stageId, {
        users: new Set(),
        userTryAttempts: new Map(),
        userClearFailCount: new Map(),
        hasTryEvents: false,
        totalClears: 0,
        totalFails: 0,
        clearedUsers: new Set(),
        failedUsers: new Set(),
        voluntaryExitUsers: new Set(),
        repeatPlayUsers: new Set(),
      });
    }

    const stageData = stageUserMap.get(stageId)!;
    stageData.users.add(event.userId);

    // Track 'try' attempts separately
    if (isTryEvent(event)) {
      stageData.hasTryEvents = true;
      const currentCount = stageData.userTryAttempts.get(event.userId) || 0;
      stageData.userTryAttempts.set(event.userId, currentCount + 1);
    }

    // Track clear/fail counts as backup (in case 'try' events don't exist)
    if (isClearEvent(event) || isFailEvent(event)) {
      const currentCount = stageData.userClearFailCount.get(event.userId) || 0;
      stageData.userClearFailCount.set(event.userId, currentCount + 1);
    }

    // Track cleared users and total clears
    if (isClearEvent(event)) {
      stageData.clearedUsers.add(event.userId);
      stageData.totalClears++;
    }

    // Track failed users
    if (isFailEvent(event)) {
      stageData.failedUsers.add(event.userId);
      stageData.totalFails++;

      // Track voluntary exits
      if (event.customEventProperties.exit_type === 'voluntary_exit') {
        stageData.voluntaryExitUsers.add(event.userId);
      }
    }

    // Track repeat plays
    if (event.customEventProperties.is_repeat_play) {
      stageData.repeatPlayUsers.add(event.userId);
    }
  });

  // Second pass: calculate statistics
  const result: UserStageStats[] = [];

  Array.from(stageUserMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([stageId, data]) => {
      const uniqueUsers = data.users.size;

      // Calculate total attempts from actual game results (clear + fail)
      // This is more reliable than 'try' events which may not reflect actual outcomes
      const totalClears = data.totalClears;
      const totalFails = data.totalFails;
      const totalAttempts = totalClears + totalFails;
      const usersCleared = data.clearedUsers.size;
      const usersFailed = data.failedUsers.size;
      const userClearRate = uniqueUsers > 0 ? (usersCleared / uniqueUsers) * 100 : 0;
      const clearProbability = (totalClears + totalFails) > 0 ? (totalClears / (totalClears + totalFails)) * 100 : 0;
      const averageAttemptsPerUser = uniqueUsers > 0 ? totalAttempts / uniqueUsers : 0;

      result.push({
        stageId,
        uniqueUsers,
        totalAttempts,
        totalClears,
        usersCleared,
        usersFailed,
        userClearRate,
        clearProbability,
        averageAttemptsPerUser,
        usersWithVoluntaryExit: data.voluntaryExitUsers.size,
        usersWithRepeatPlay: data.repeatPlayUsers.size,
      });
    });

  return result;
}

/**
 * Check if event is a first clear event
 */
export function isFirstClearEvent(event: GameEvent): boolean {
  return event.eventAction === 'clearIsFirst';
}

/**
 * Calculate first clear statistics by try count for a specific stage
 * This shows how many unique users achieved their first clear on each try count
 */
export function calculateFirstClearByTryCount(events: GameEvent[], stageId: string): FirstClearStageData {
  // Filter events for the specific stage
  const stageEvents = events.filter(e => e.eventLabel === stageId);

  // Group events by user
  const userEvents = new Map<string, GameEvent[]>();
  stageEvents.forEach(event => {
    if (!event.userId) return;
    if (!userEvents.has(event.userId)) {
      userEvents.set(event.userId, []);
    }
    userEvents.get(event.userId)!.push(event);
  });

  // For each user with a first clear, count how many tries they made
  const tryCountMap = new Map<number, number>(); // tryCount -> userCount
  let totalFirstClearUsers = 0;

  userEvents.forEach((events, userId) => {
    // Check if user has a first clear event for this stage
    const hasFirstClear = events.some(e => isFirstClearEvent(e));
    if (!hasFirstClear) return;

    totalFirstClearUsers++;

    // Count try events for this user
    const tryCount = events.filter(e => isTryEvent(e)).length;

    // If no try events, assume at least 1 try (the clear itself implies a try)
    const actualTryCount = Math.max(tryCount, 1);

    tryCountMap.set(actualTryCount, (tryCountMap.get(actualTryCount) || 0) + 1);
  });

  // Convert to sorted array
  const byTryCount = Array.from(tryCountMap.entries())
    .map(([tryCount, userCount]) => ({ tryCount, userCount }))
    .sort((a, b) => a.tryCount - b.tryCount);

  return {
    stageId,
    totalFirstClearUsers,
    byTryCount
  };
}

/**
 * Calculate first clear statistics for all stages
 */
export function calculateAllFirstClearStats(events: GameEvent[]): FirstClearStageData[] {
  const stageIds = getStageIds(events);
  return stageIds.map(stageId => calculateFirstClearByTryCount(events, stageId));
}
