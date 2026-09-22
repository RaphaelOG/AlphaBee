import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Child, Parent } from '../api';

const TOKEN_KEY = '@alphabee/auth_token_v1';
const PARENT_KEY = '@alphabee/auth_parent_v1';
const CHILD_ID_KEY = '@alphabee/active_child_id_v1';

export type PersistedAuth = {
  token: string | null;
  parent: Parent | null;
  activeChildId: string | null;
};

export async function loadPersistedAuth(): Promise<PersistedAuth> {
  try {
    const [token, parentRaw, activeChildId] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(PARENT_KEY),
      AsyncStorage.getItem(CHILD_ID_KEY),
    ]);
    const parent = parentRaw ? (JSON.parse(parentRaw) as Parent) : null;
    return { token, parent, activeChildId };
  } catch {
    return { token: null, parent: null, activeChildId: null };
  }
}

export async function saveSession(token: string, parent: Parent): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [PARENT_KEY, JSON.stringify(parent)],
  ]);
}

export async function saveActiveChildId(childId: string | null): Promise<void> {
  if (childId) {
    await AsyncStorage.setItem(CHILD_ID_KEY, childId);
  } else {
    await AsyncStorage.removeItem(CHILD_ID_KEY);
  }
}

export async function clearPersistedAuth(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, PARENT_KEY, CHILD_ID_KEY]);
}
