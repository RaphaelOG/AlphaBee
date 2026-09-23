import { sessionsApi, streakApi, type GameSessionPayload } from '../api';
import { todayKey, type StreakState } from './streak';

export type SessionSyncResult = {
  /** Whether the session was saved to the API */
  synced: boolean;
  streak: StreakState | null;
  error?: string;
};

function toStreakState(streak: {
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
 * POST a finished quest/practice session to the backend (progress + streak).
 * Returns the cloud streak when sync succeeds.
 */
export async function postCompletedSession(opts: {
  token: string;
  childId: string;
  payload: GameSessionPayload;
}): Promise<SessionSyncResult> {
  try {
    await sessionsApi.create(opts.token, opts.childId, {
      ...opts.payload,
      applyRewards: opts.payload.applyRewards ?? true,
      localDate: opts.payload.localDate ?? todayKey(),
    });

    const { streak } = await streakApi.get(opts.token, opts.childId);
    return {
      synced: true,
      streak: toStreakState(streak),
    };
  } catch (err) {
    return {
      synced: false,
      streak: null,
      error: err instanceof Error ? err.message : 'Could not sync session',
    };
  }
}
