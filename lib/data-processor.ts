import { GameEvent, StageStats, DifficultySpike, FunnelData, FilterOptions, StageType } from '@/types/game-data';

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
      clientIpCountry: row['Client IP Country'] || undefined,
      clientIpCountryCode: row['Client IP Country Code'] || undefined
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
 * Filter events based on filter options
 */
export function filterEvents(events: GameEvent[], options: FilterOptions): GameEvent[] {
  let filtered = [...events];

  // Filter out voluntary exits
  if (options.excludeVoluntaryExits) {
    filtered = filtered.filter(event => {
      if (event.eventAction === 'fail' && event.customEventProperties.exit_type === 'voluntary_exit') {
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
    const tryEvents = stageEvents.filter(e => e.eventAction === 'try').length;
    const clears = stageEvents.filter(e => e.eventAction === 'clear').length;
    const fails = stageEvents.filter(e => e.eventAction === 'fail').length;
    const voluntaryExits = stageEvents.filter(
      e => e.eventAction === 'fail' && e.customEventProperties.exit_type === 'voluntary_exit'
    ).length;
    const repeatPlays = stageEvents.filter(
      e => e.customEventProperties.is_repeat_play === true
    ).length;

    // Fallback: if 'try' events are missing or inconsistent, use clears + fails
    // This handles cases where event logging is incomplete
    const totalAttempts = Math.max(tryEvents, clears + fails);

    const failEvents = stageEvents.filter(e => e.eventAction === 'fail');
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
    if (event.eventAction === 'fail') {
      const level = event.customEventProperties.last_level;
      failsByLevel[level] = (failsByLevel[level] || 0) + 1;
    }

    if (event.eventAction === 'try') {
      for (let i = 1; i <= 20; i++) {
        attemptsByLevel[i] = (attemptsByLevel[i] || 0) + 1;
      }
    }

    if (event.eventAction === 'fail') {
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
  const totalTries = events.filter(e => e.eventAction === 'try').length;
  const clearCount = events.filter(e => e.eventAction === 'clear').length;
  
  // 각 레벨에서 실패한 횟수 (last_level === N인 경우)
  const failsByLevel: Record<number, number> = {};
  events.forEach(event => {
    if (event.eventAction === 'fail') {
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
  const fails = events.filter(e => e.eventAction === 'fail').length;
  const voluntaryExits = events.filter(
    e => e.eventAction === 'fail' && e.customEventProperties.exit_type === 'voluntary_exit'
  ).length;

  return fails > 0 ? (voluntaryExits / fails) * 100 : 0;
}

export function getOverallClearRate(events: GameEvent[]): number {
  const attempts = events.filter(e => e.eventAction === 'try').length;
  const clears = events.filter(e => e.eventAction === 'clear').length;
  const fails = events.filter(e => e.eventAction === 'fail').length;

  // Fallback: if 'try' events are missing or inconsistent, use clears + fails
  const totalAttempts = Math.max(attempts, clears + fails);

  return totalAttempts > 0 ? (clears / totalAttempts) * 100 : 0;
}
