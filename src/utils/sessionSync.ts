import { sessionsApi, streakApi, type GameSessionPayload } from '../api';
import { todayKey, type StreakState } from './streak';
import { toStreakState } from './hiveSync';

export type SessionSyncResult = {
  /** Whether the session was saved to the API */
  synced: boolean;
  streak: StreakState | null;
  error?: string;
};

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
