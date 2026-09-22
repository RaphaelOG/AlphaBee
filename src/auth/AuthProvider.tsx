import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiError, authApi, childrenApi, type Child, type Parent } from '../api';
import type { GradeLevel } from '../data/curriculum';
import {
  clearPersistedAuth,
  loadPersistedAuth,
  saveActiveChildId,
  saveSession,
} from './sessionStorage';

type AuthContextValue = {
  ready: boolean;
  token: string | null;
  parent: Parent | null;
  children: Child[];
  activeChild: Child | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshChildren: () => Promise<Child[]>;
  selectChild: (childId: string) => Promise<void>;
  createChild: (data: {
    nickname: string;
    gradeLevel?: GradeLevel;
    avatarKey?: string;
  }) => Promise<Child>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const activeChild = useMemo(
    () => childList.find((c) => c.id === activeChildId) ?? null,
    [childList, activeChildId],
  );

  const applySession = useCallback(async (nextToken: string, nextParent: Parent) => {
    setToken(nextToken);
    setParent(nextParent);
    await saveSession(nextToken, nextParent);
    const { children: list } = await childrenApi.list(nextToken);
    setChildList(list);
    return list;
  }, []);

  const refreshChildren = useCallback(async () => {
    if (!token) {
      setChildList([]);
      return [];
    }
    const { children: list } = await childrenApi.list(token);
    setChildList(list);
    if (activeChildId && !list.some((c) => c.id === activeChildId)) {
      setActiveChildId(null);
      await saveActiveChildId(null);
    }
    return list;
  }, [token, activeChildId]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const stored = await loadPersistedAuth();
      if (!alive) return;

      if (!stored.token || !stored.parent) {
        setReady(true);
        return;
      }

      setToken(stored.token);
      setParent(stored.parent);
      setActiveChildId(stored.activeChildId);

      try {
        const me = await authApi.me(stored.token);
        if (!alive) return;
        setParent(me.parent);
        await saveSession(stored.token, me.parent);
        const { children: list } = await childrenApi.list(stored.token);
        if (!alive) return;
        setChildList(list);
        if (stored.activeChildId && !list.some((c) => c.id === stored.activeChildId)) {
          setActiveChildId(null);
          await saveActiveChildId(null);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await clearPersistedAuth();
          if (!alive) return;
          setToken(null);
          setParent(null);
          setChildList([]);
          setActiveChildId(null);
        }
        // Network / server down: keep cached parent so UI can still show account state
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email.trim(), password);
      const list = await applySession(res.token, res.parent);
      const stored = await loadPersistedAuth();
      if (stored.activeChildId && list.some((c) => c.id === stored.activeChildId)) {
        setActiveChildId(stored.activeChildId);
      } else if (list.length === 1) {
        setActiveChildId(list[0].id);
        await saveActiveChildId(list[0].id);
      }
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const res = await authApi.register(email.trim(), password, displayName?.trim() || undefined);
      await applySession(res.token, res.parent);
      setActiveChildId(null);
      await saveActiveChildId(null);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await clearPersistedAuth();
    setToken(null);
    setParent(null);
    setChildList([]);
    setActiveChildId(null);
  }, []);

  const selectChild = useCallback(async (childId: string) => {
    setActiveChildId(childId);
    await saveActiveChildId(childId);
  }, []);

  const createChild = useCallback(
    async (data: { nickname: string; gradeLevel?: GradeLevel; avatarKey?: string }) => {
      if (!token) throw new Error('Not signed in');
      const { child } = await childrenApi.create(token, {
        nickname: data.nickname.trim(),
        gradeLevel: data.gradeLevel ?? '1',
        avatarKey: data.avatarKey ?? 'bee',
      });
      setChildList((prev) => [...prev, child]);
      setActiveChildId(child.id);
      await saveActiveChildId(child.id);
      return child;
    },
    [token],
  );

  const value = useMemo(
    () => ({
      ready,
      token,
      parent,
      children: childList,
      activeChild,
      isAuthenticated: Boolean(token && parent),
      login,
      register,
      logout,
      refreshChildren,
      selectChild,
      createChild,
    }),
    [
      ready,
      token,
      parent,
      childList,
      activeChild,
      login,
      register,
      logout,
      refreshChildren,
      selectChild,
      createChild,
    ],
  );

  return <AuthContext.Provider value={value}>{reactChildren}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
