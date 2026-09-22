import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { AlphaBee } from '../components/AlphaBee';
import { useAuth } from '../auth';
import { ApiError } from '../api';
import { GRADE_LEVELS, gradeLabel, type GradeLevel } from '../data/curriculum';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChildSelect'>;

export function ChildSelectScreen({ navigation }: Props) {
  const {
    parent,
    children,
    activeChild,
    refreshChildren,
    selectChild,
    createChild,
    logout,
  } = useAuth();

  const [nickname, setNickname] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('1');
  const [busy, setBusy] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoadingList(true);
      void refreshChildren()
        .then((list) => {
          setShowForm(list.length === 0);
        })
        .catch(() => {
          setError('Could not load learner profiles. Check the API connection.');
        })
        .finally(() => setLoadingList(false));
    }, [refreshChildren]),
  );

  const continueWithChild = async (childId: string) => {
    setBusy(true);
    setError(null);
    try {
      await selectChild(childId);
      navigation.replace('ModeSelect');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not select learner.');
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async () => {
    const name = nickname.trim();
    if (!name) {
      setError('Enter a nickname for the learner.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const child = await createChild({ nickname: name, gradeLevel });
      setNickname('');
      setShowForm(false);
      navigation.replace('ModeSelect');
      void child;
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Could not create learner profile.');
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    await logout();
    navigation.replace('Landing');
  };

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.skyBottom]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable onPress={() => navigation.navigate('Landing')} hitSlop={12}>
              <Text style={styles.link}>Home</Text>
            </Pressable>
            <Pressable onPress={() => void onSignOut()} hitSlop={12}>
              <Text style={styles.link}>Sign out</Text>
            </Pressable>
          </View>

          <AlphaBee size={52} />
          <Text style={styles.title}>Who is spelling?</Text>
          <Text style={styles.subtitle}>
            {parent?.displayName
              ? `Hi ${parent.displayName} — pick a learner hive`
              : 'Pick a learner hive to start'}
          </Text>

          {loadingList ? (
            <ActivityIndicator color={colors.honey} style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.list}>
              {children.map((child) => {
                const selected = activeChild?.id === child.id;
                return (
                  <Pressable
                    key={child.id}
                    style={[styles.childCard, selected && styles.childCardSelected]}
                    onPress={() => {
                      void continueWithChild(child.id);
                    }}
                    disabled={busy}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarEmoji}>🐝</Text>
                    </View>
                    <View style={styles.childCopy}>
                      <Text style={styles.childName}>{child.nickname}</Text>
                      <Text style={styles.childMeta}>
                        {gradeLabel(child.gradeLevel as GradeLevel)}
                        {child.progress
                          ? ` · ${child.progress.honeyTotal} honey · ${child.streak?.currentStreak ?? 0}-day streak`
                          : ''}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {showForm ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {children.length === 0 ? 'Add your first learner' : 'Add another learner'}
              </Text>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Sam"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
                maxLength={40}
              />
              <Text style={[styles.label, { marginTop: 12 }]}>Grade</Text>
              <View style={styles.gradeRow}>
                {GRADE_LEVELS.map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGradeLevel(g)}
                    style={[styles.gradeChip, gradeLevel === g && styles.gradeChipActive]}
                  >
                    <Text
                      style={[styles.gradeChipText, gradeLevel === g && styles.gradeChipTextActive]}
                    >
                      {gradeLabel(g)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryBtn, busy && styles.btnDisabled]}
                onPress={() => {
                  void onCreate();
                }}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryText}>Save & continue</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.secondaryBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.secondaryText}>+ Add learner</Text>
            </Pressable>
          )}

          {error && !showForm ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  link: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.honeyDark,
  },
  title: {
    ...typography.title,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
  },
  list: {
    width: '100%',
    gap: 10,
  },
  childCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  childCardSelected: {
    borderColor: colors.honeyDark,
    backgroundColor: colors.creamSoft,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.goldBright,
    borderWidth: 2,
    borderColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  childCopy: {
    flex: 1,
  },
  childName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text,
  },
  childMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    color: colors.honeyDark,
  },
  formCard: {
    width: '100%',
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.honey,
    padding: 16,
  },
  formTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.honeyDark,
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.honeyDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.creamSoft,
  },
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    backgroundColor: colors.creamSoft,
  },
  gradeChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.honeyDark,
  },
  gradeChipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.textMuted,
  },
  gradeChipTextActive: {
    color: colors.white,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: colors.honey,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.honeyDark,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.white,
  },
  secondaryBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  secondaryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.honeyDark,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  error: {
    marginTop: 12,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.softRed,
    textAlign: 'center',
  },
});
