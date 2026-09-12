import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@alphabee/daily_streak_v1';

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  /** Local calendar date YYYY-MM-DD of last completed session */
  lastCompletedDate: string | null;
  /** Whether a quest was already completed today */
  completedToday: boolean;
};

const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  completedToday: false,
};

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function yesterdayKey(date = new Date()): string {
  const y = new Date(date);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const start = Date.UTC(ay, am - 1, ad);
  const end = Date.UTC(by, bm - 1, bd);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export async function loadStreak(): Promise<StreakState> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return { ...DEFAULT_STREAK };

    const parsed = JSON.parse(raw) as Omit<StreakState, 'completedToday'> & {
      completedToday?: boolean;
    };
    const today = todayKey();
    const last = parsed.lastCompletedDate;
    const completedToday = last === today;

    // If they missed a day (gap > 1), streak is broken until they complete again
    let currentStreak = parsed.currentStreak ?? 0;
    if (last && !completedToday) {
      const gap = daysBetween(last, today);
      if (gap > 1) currentStreak = 0;
    }

    return {
      currentStreak,
      longestStreak: parsed.longestStreak ?? 0,
      lastCompletedDate: last ?? null,
      completedToday,
    };
  } catch {
    return { ...DEFAULT_STREAK };
  }
}

/**
 * Record that the player finished a session quest today.
 * Returns the updated streak (only increments once per calendar day).
 */
export async function recordQuestCompletion(): Promise<StreakState> {
  const existing = await loadStreak();
  const today = todayKey();

  if (existing.lastCompletedDate === today) {
    return { ...existing, completedToday: true };
  }

  const yesterday = yesterdayKey();
  const continued = existing.lastCompletedDate === yesterday;
  const nextStreak = continued ? existing.currentStreak + 1 : 1;
  const longestStreak = Math.max(existing.longestStreak, nextStreak);

  const next: StreakState = {
    currentStreak: nextStreak,
    longestStreak,
    lastCompletedDate: today,
    completedToday: true,
  };

  await AsyncStorage.setItem(
    STREAK_KEY,
    JSON.stringify({
      currentStreak: next.currentStreak,
      longestStreak: next.longestStreak,
      lastCompletedDate: next.lastCompletedDate,
    }),
  );

  return next;
}
