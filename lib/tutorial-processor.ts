/**
 * Tutorial-specific data processing functions
 */

export interface TutorialEvent {
  stepNumber: string; // "02", "03", "23", etc.
  eventCategory: string;
  eventAction: string;
  userId?: string;
}

export interface TutorialStepStats {
  stepId: string;
  stepNumber: number;
  totalEvents: number;
  uniqueUsers: number;
  completionRate?: number;
}

export interface TutorialFunnelData {
  stepId: string;
  stepNumber: number;
  uniqueUsers: number;
  dropoffCount: number;
  dropoffRate: number;
  cumulativeDropoffRate: number;
}

/**
 * Parse CSV data into TutorialEvent array
 * Extracts tutorial step number from Event Category (e.g., "tutorial_02 (App)" -> "02")
 */
export function parseTutorialCSVData(csvData: any[]): TutorialEvent[] {
  return csvData.flatMap(row => {
    const eventCategory = row['Event Category'];
    if (!eventCategory || typeof eventCategory !== 'string') return [];

    // Extract tutorial step number from "tutorial_XX (App)" format
    const match = eventCategory.match(/tutorial_(\d+)/i);
    if (!match) return [];

    return [{
      stepNumber: match[1],
      eventCategory: row['Event Category'],
      eventAction: row['Event Action'],
      userId: row['User ID'] || undefined,
    }];
  });
}

/**
 * Filter tutorial events to keep only one event per user per step
 * This is useful for tutorial attrition analysis where each user should count only once per step
 * @param events - Raw tutorial events
 * @param keepFirst - If true, keep first occurrence; if false, keep last occurrence (default: true)
 */
export function filterUniqueUserEvents(events: TutorialEvent[], keepFirst: boolean = true): TutorialEvent[] {
  // Map to track: userId-stepNumber -> event
  const uniqueEventsMap = new Map<string, TutorialEvent>();

  events.forEach(event => {
    // If no userId, keep all events (can't deduplicate)
    if (!event.userId) {
      // Use a unique key for each event without userId
      const key = `no-user-${Math.random()}`;
      uniqueEventsMap.set(key, event);
      return;
    }

    const key = `${event.userId}-${event.stepNumber}`;

    if (keepFirst) {
      // Keep first occurrence only
      if (!uniqueEventsMap.has(key)) {
        uniqueEventsMap.set(key, event);
      }
    } else {
      // Keep last occurrence (overwrite)
      uniqueEventsMap.set(key, event);
    }
  });

  return Array.from(uniqueEventsMap.values());
}

/**
 * Calculate statistics for each tutorial step
 */
export function calculateTutorialStepStats(events: TutorialEvent[]): TutorialStepStats[] {
  const stepMap = new Map<string, { events: TutorialEvent[]; users: Set<string> }>();

  // Group events by step
  events.forEach(event => {
    const stepId = event.stepNumber;
    if (!stepMap.has(stepId)) {
      stepMap.set(stepId, { events: [], users: new Set() });
    }
    const stepData = stepMap.get(stepId)!;
    stepData.events.push(event);
    if (event.userId) {
      stepData.users.add(event.userId);
    }
  });

  // Calculate stats for each step
  const stats: TutorialStepStats[] = [];
  stepMap.forEach((data, stepId) => {
    // If no User IDs, use event count as a proxy for unique users
    const uniqueUsers = data.users.size > 0 ? data.users.size : data.events.length;

    stats.push({
      stepId,
      stepNumber: parseInt(stepId),
      totalEvents: data.events.length,
      uniqueUsers,
    });
  });

  return stats.sort((a, b) => a.stepNumber - b.stepNumber);
}

/**
 * Calculate tutorial funnel data showing user drop-off at each step
 */
export function calculateTutorialFunnel(events: TutorialEvent[]): TutorialFunnelData[] {
  const stepStats = calculateTutorialStepStats(events);

  // Calculate drop-off rates
  const funnelData: TutorialFunnelData[] = [];
  let initialUsers = stepStats.length > 0 ? stepStats[0].uniqueUsers : 0;

  stepStats.forEach((stat, index) => {
    let dropoffCount = 0;
    let dropoffRate = 0;

    // Calculate drop-off from previous step
    if (index > 0) {
      const prevUsers = stepStats[index - 1].uniqueUsers;
      dropoffCount = Math.max(0, prevUsers - stat.uniqueUsers);
      dropoffRate = prevUsers > 0 ? (dropoffCount / prevUsers) * 100 : 0;
    }

    // Calculate cumulative drop-off from the first step
    const cumulativeDropoffRate = initialUsers > 0
      ? ((initialUsers - stat.uniqueUsers) / initialUsers) * 100
      : 0;

    funnelData.push({
      stepId: stat.stepId,
      stepNumber: stat.stepNumber,
      uniqueUsers: stat.uniqueUsers,
      dropoffCount,
      dropoffRate,
      cumulativeDropoffRate,
    });
  });

  return funnelData;
}

/**
 * Get unique user count from tutorial events
 * If no User IDs, returns total event count as a proxy
 */
export function getTutorialUniqueUserCount(events: TutorialEvent[]): number {
  const uniqueUsers = new Set<string>();
  events.forEach(event => {
    if (event.userId) {
      uniqueUsers.add(event.userId);
    }
  });
  // If no User IDs, use total event count as proxy
  return uniqueUsers.size > 0 ? uniqueUsers.size : events.length;
}

/**
 * Get tutorial step IDs sorted by step number
 */
export function getTutorialStepIds(events: TutorialEvent[]): string[] {
  const stepIds = new Set<string>();
  events.forEach(event => {
    stepIds.add(event.stepNumber);
  });
  return Array.from(stepIds).sort((a, b) => parseInt(a) - parseInt(b));
}
