import { progressApi, streakApi } from '../api';
import { loadStreak, todayKey, type StreakState } from './streak';

export type HiveStats = {
  honeyTotal: number;
  starsTotal: number;
  wordsMastered: number;
  questsCompleted: number;
  streak: StreakState;
  /** Where the primary totals came from */
  source: 'api' | 'fallback';
};

export function toStreakState(streak: {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  completedToday?: boolean;
}): StreakState {
  const today = todayKey();
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastCompletedDate: streak.lastCompletedDate,
    completedToday: streak.completedToday ?? streak.lastCompletedDate === today,
  };
}

/**
 * Load lifetime hive totals + streak from the API.
 * Falls back to local streak and optional session/cache seed values.
 */
export async function loadHiveStats(opts: {
  token?: string | null;
  childId?: string | null;
  fallbackHoney?: number;
  fallbackStars?: number;
  fallbackWords?: number;
  fallbackQuests?: number;
}): Promise<HiveStats> {
  const localStreak = await loadStreak();
  const fallback: HiveStats = {
    honeyTotal: opts.fallbackHoney ?? 0,
    starsTotal: opts.fallbackStars ?? 0,
    wordsMastered: opts.fallbackWords ?? 0,
    questsCompleted: opts.fallbackQuests ?? 0,
    streak: localStreak,
    source: 'fallback',
  };

  if (!opts.token || !opts.childId) {
    return fallback;
  }

  try {
    const [progressRes, streakRes] = await Promise.all([
      progressApi.get(opts.token, opts.childId),
      streakApi.get(opts.token, opts.childId),
    ]);

    return {
      honeyTotal: progressRes.progress.honeyTotal,
      starsTotal: progressRes.progress.starsTotal,
      wordsMastered: progressRes.progress.wordsMastered,
      questsCompleted: progressRes.progress.questsCompleted,
      streak: toStreakState(streakRes.streak),
      source: 'api',
    };
  } catch {
    return fallback;
  }
}
