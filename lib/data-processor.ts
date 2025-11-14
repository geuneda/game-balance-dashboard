import { GameEvent, StageStats, DifficultySpike, FunnelData } from '@/types/game-data';

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
      customEventProperties: customProps
    };
  });
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
    const attempts = stageEvents.filter(e => e.eventAction === 'try').length;
    const clears = stageEvents.filter(e => e.eventAction === 'clear').length;
    const fails = stageEvents.filter(e => e.eventAction === 'fail').length;
    const voluntaryExits = stageEvents.filter(
      e => e.eventAction === 'fail' && e.customEventProperties.exit_type === 'voluntary_exit'
    ).length;

    const failEvents = stageEvents.filter(e => e.eventAction === 'fail');
    const failsByLevel: Record<number, number> = {};
    let totalFailLevel = 0;

    failEvents.forEach(event => {
      const level = event.customEventProperties.last_level;
      failsByLevel[level] = (failsByLevel[level] || 0) + 1;
      totalFailLevel += level;
    });

    const averageFailLevel = fails > 0 ? totalFailLevel / fails : 0;
    const clearRate = attempts > 0 ? (clears / attempts) * 100 : 0;

    stats.push({
      stageId,
      totalAttempts: attempts,
      clears,
      fails,
      voluntaryExits,
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
  const tryEvents = events.filter(e => e.eventAction === 'try');
  const totalPlayers = tryEvents.length;

  const failsByLevel: Record<number, number> = {};

  events.forEach(event => {
    if (event.eventAction === 'fail') {
      const level = event.customEventProperties.last_level;
      failsByLevel[level] = (failsByLevel[level] || 0) + 1;
    }
  });

  const funnelData: FunnelData[] = [];
  let remaining = totalPlayers;

  for (let level = 1; level <= 20; level++) {
    const dropped = failsByLevel[level] || 0;
    const dropRate = remaining > 0 ? (dropped / remaining) * 100 : 0;

    funnelData.push({
      level,
      remaining: remaining - dropped,
      dropped,
      dropRate
    });

    remaining -= dropped;
  }

  return funnelData;
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

  return attempts > 0 ? (clears / attempts) * 100 : 0;
}
