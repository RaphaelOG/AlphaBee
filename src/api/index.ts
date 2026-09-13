import { apiRequest } from './client';

export type Parent = {
  id: string;
  email: string;
  displayName: string | null;
};

export type ChildProgress = {
  id: string;
  childId: string;
  honeyTotal: number;
  starsTotal: number;
  wordsMastered: number;
  questsCompleted: number;
};

export type DailyStreak = {
  id: string;
  childId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  completedToday?: boolean;
};

export type Child = {
  id: string;
  parentId: string;
  nickname: string;
  gradeLevel: string;
  avatarKey: string;
  activeUnitId: string | null;
  progress?: ChildProgress | null;
  streak?: DailyStreak | null;
};

export type CustomList = {
  id: string;
  parentId: string;
  name: string;
  words: string[];
  assignments?: { childId: string }[];
};

export type GameSessionPayload = {
  mode: 'quest' | 'practice';
  questId?: string;
  questTitle?: string;
  wordGoal: number;
  wordsCompleted: number;
  honeyEarned: number;
  starsEarned: number;
  gradeLevel?: string;
  unitId?: string;
  customListId?: string;
  applyRewards?: boolean;
  localDate?: string;
};

export const authApi = {
  register(email: string, password: string, displayName?: string) {
    return apiRequest<{ token: string; parent: Parent }>('/auth/register', {
      body: { email, password, displayName },
    });
  },
  login(email: string, password: string) {
    return apiRequest<{ token: string; parent: Parent }>('/auth/login', {
      body: { email, password },
    });
  },
  me(token: string) {
    return apiRequest<{ parent: Parent }>('/auth/me', { token });
  },
};

export const childrenApi = {
  list(token: string) {
    return apiRequest<{ children: Child[] }>('/children', { token });
  },
  create(
    token: string,
    data: { nickname: string; gradeLevel?: string; avatarKey?: string; activeUnitId?: string },
  ) {
    return apiRequest<{ child: Child }>('/children', { token, body: data });
  },
  get(token: string, childId: string) {
    return apiRequest<{ child: Child }>(`/children/${childId}`, { token });
  },
  update(
    token: string,
    childId: string,
    data: Partial<{ nickname: string; gradeLevel: string; avatarKey: string; activeUnitId: string | null }>,
  ) {
    return apiRequest<{ child: Child }>(`/children/${childId}`, {
      token,
      method: 'PATCH',
      body: data,
    });
  },
};

export const progressApi = {
  get(token: string, childId: string) {
    return apiRequest<{ progress: ChildProgress }>(`/children/${childId}/progress`, { token });
  },
  apply(
    token: string,
    childId: string,
    deltas: Partial<{
      honeyDelta: number;
      starsDelta: number;
      wordsMasteredDelta: number;
      questsCompletedDelta: number;
    }>,
  ) {
    return apiRequest<{ progress: ChildProgress }>(`/children/${childId}/progress/apply`, {
      token,
      body: deltas,
    });
  },
  recordMastery(
    token: string,
    childId: string,
    data: {
      word: string;
      correct: boolean;
      gradeLevel?: string;
      unitId?: string;
      markMastered?: boolean;
    },
  ) {
    return apiRequest(`/children/${childId}/mastery`, { token, body: data });
  },
};

export const streakApi = {
  get(token: string, childId: string) {
    return apiRequest<{ streak: DailyStreak }>(`/children/${childId}/streak`, { token });
  },
  complete(token: string, childId: string, localDate?: string) {
    return apiRequest<{ streak: DailyStreak }>(`/children/${childId}/streak/complete`, {
      token,
      body: { localDate },
    });
  },
};

export const sessionsApi = {
  list(token: string, childId: string) {
    return apiRequest<{ sessions: unknown[] }>(`/children/${childId}/sessions`, { token });
  },
  create(token: string, childId: string, payload: GameSessionPayload) {
    return apiRequest<{ session: unknown }>(`/children/${childId}/sessions`, {
      token,
      body: payload,
    });
  },
};

export const listsApi = {
  list(token: string) {
    return apiRequest<{ lists: CustomList[] }>('/lists', { token });
  },
  create(token: string, data: { name: string; words: string[]; assignChildIds?: string[] }) {
    return apiRequest<{ list: CustomList }>('/lists', { token, body: data });
  },
  forChild(token: string, childId: string) {
    return apiRequest<{ lists: CustomList[] }>(`/children/${childId}/lists`, { token });
  },
  remove(token: string, listId: string) {
    return apiRequest<void>(`/lists/${listId}`, { token, method: 'DELETE' });
  },
};
