import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { AlphaBee } from '../components/AlphaBee';
import { ChunkyButton, KidCard, Pill, SpeechBubble, Sticker, toneColors } from '../components/KidUI';
import { FlowerMeadow, HoneycombPattern, Pollen, SkyScene } from '../components/SceneDecor';
import { NavButton, TopNav } from '../components/TopNav';
import { useAuth } from '../auth';
import { ApiError } from '../api';
import { AVATARS, getAvatar, type AvatarKey } from '../data/avatars';
import { GRADE_LEVELS, gradeLabel, type GradeLevel } from '../data/curriculum';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChildSelect'>;

export function ChildSelectScreen({ navigation }: Props) {
  const { parent, children, activeChild, refreshChildren, selectChild, createChild, logout } = useAuth();

  const [nickname, setNickname] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('1');
  const [avatarKey, setAvatarKey] = useState<AvatarKey>('bee');
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
      await createChild({ nickname: name, gradeLevel, avatarKey });
      setNickname('');
      setShowForm(false);
      navigation.replace('ModeSelect');
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

  const previewAvatar = getAvatar(avatarKey);

  return (
    <LinearGradient colors={[colors.sky, colors.skyTop, colors.creamSoft]} style={styles.fill}>
      <StatusBar style="dark" />
      <HoneycombPattern opacity={0.07} rows={40} />
      <SkyScene sunSize={72} />
      <Pollen count={8} />
      <FlowerMeadow height={100} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TopNav
            left={<NavButton icon="home" label="Home" onPress={() => navigation.navigate('Landing')} />}
            right={<NavButton icon="log-out-outline" label="Sign out" onPress={() => void onSignOut()} />}
          />

          <View style={styles.hero}>
            <AlphaBee size={96} mood="happy" />
            <View style={styles.heroText}>
              <SpeechBubble
                text={parent?.displayName ? `Hi ${parent.displayName}! Who is spelling today?` : 'Who is spelling today?'}
                tail="left"
                style={styles.bubble}
              />
            </View>
          </View>
          <Text style={styles.title}>Pick a Learner</Text>

          {loadingList ? (
            <ActivityIndicator color={colors.honey} style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.list}>
              {children.map((child) => {
                const selected = activeChild?.id === child.id;
                const av = getAvatar(child.avatarKey);
                const t = toneColors(av.tone);
                return (
                  <KidCard
                    key={child.id}
                    tone={av.tone}
                    tinted={selected}
                    selected={selected}
                    onPress={() => {
                      void continueWithChild(child.id);
                    }}
                    disabled={busy}
                    contentStyle={styles.childCard}
                  >
                    <View style={[styles.avatar, { backgroundColor: t.tint, borderColor: t.border }]}>
                      <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    </View>
                    <View style={styles.childCopy}>
                      <Text style={styles.childName}>{child.nickname}</Text>
                      <View style={styles.childMeta}>
                        <Pill label={gradeLabel(child.gradeLevel as GradeLevel)} tone="leaf" emoji="🎒" />
                        {child.progress ? <Pill label={`${child.progress.honeyTotal}`} tone="honey" emoji="🍯" /> : null}
                        {child.streak?.currentStreak ? (
                          <Pill label={`${child.streak.currentStreak}`} tone="coral" emoji="🔥" />
                        ) : null}
                      </View>
                    </View>
                    <View style={[styles.go, { backgroundColor: t.edge }]}>
                      <Ionicons name="play" size={16} color={colors.white} />
                    </View>
                  </KidCard>
                );
              })}
            </View>
          )}

          {showForm ? (
            <KidCard tone="berry" drip contentStyle={styles.formCard}>
              <View style={styles.formHeader}>
                <Sticker emoji={previewAvatar.emoji} tone={previewAvatar.tone} size={54} rotate={-6} />
                <View style={styles.formHeaderText}>
                  <Text style={styles.formTitle}>
                    {children.length === 0 ? 'Add your first learner' : 'Add another learner'}
                  </Text>
                  <Text style={styles.formSub}>Pick a buddy, a name, and a grade</Text>
                </View>
              </View>

              <Text style={styles.label}>Choose a buddy</Text>
              <View style={styles.avatarRow}>
                {AVATARS.map((av) => {
                  const active = av.key === avatarKey;
                  const t = toneColors(av.tone);
                  return (
                    <Pressable
                      key={av.key}
                      onPress={() => setAvatarKey(av.key)}
                      accessibilityLabel={av.name}
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.avatarChoice,
                        { borderColor: active ? t.edge : t.border, backgroundColor: active ? t.tint : colors.white },
                        active && styles.avatarChoiceActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.avatarChoiceEmoji}>{av.emoji}</Text>
                      {active ? (
                        <View style={[styles.avatarCheck, { backgroundColor: t.edge }]}>
                          <Ionicons name="checkmark" size={10} color={colors.white} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

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

              <Text style={styles.label}>Grade</Text>
              <View style={styles.gradeRow}>
                {GRADE_LEVELS.map((g) => {
                  const active = gradeLevel === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGradeLevel(g)}
                      style={({ pressed }) => [styles.gradeChip, active && styles.gradeChipActive, pressed && styles.pressed]}
                    >
                      <Text style={[styles.gradeChipText, active && styles.gradeChipTextActive]}>{gradeLabel(g)}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <ChunkyButton
                label={busy ? 'Saving…' : 'Save & Play!'}
                tone="berry"
                fullWidth
                disabled={busy}
                icon={<Ionicons name="sparkles" size={20} color={colors.white} />}
                onPress={() => {
                  void onCreate();
                }}
                style={styles.saveBtn}
              />
              {children.length > 0 ? (
                <Pressable onPress={() => setShowForm(false)} hitSlop={8} style={styles.cancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              ) : null}
            </KidCard>
          ) : (
            <ChunkyButton
              label="Add a learner"
              tone="cream"
              icon={<Ionicons name="add-circle" size={22} color={colors.honeyDark} />}
              onPress={() => setShowForm(true)}
              style={styles.addBtn}
            />
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
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 120,
    alignItems: 'center',
    gap: 12,
  },
  hero: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  heroText: {
    flex: 1,
  },
  bubble: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.chocolate,
    alignSelf: 'flex-start',
    marginTop: -8,
  },
  list: {
    width: '100%',
    gap: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  childCopy: {
    flex: 1,
    gap: 6,
  },
  childName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.chocolate,
  },
  childMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  go: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  formCard: {
    gap: 8,
    paddingTop: 22,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  formHeaderText: {
    flex: 1,
  },
  formTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.berryDark,
  },
  formSub: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    color: colors.berryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarChoice: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChoiceActive: {
    transform: [{ scale: 1.08 }],
  },
  avatarChoiceEmoji: {
    fontSize: 28,
  },
  avatarCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.95,
  },
  input: {
    borderWidth: 2.5,
    borderColor: colors.berryLight,
    borderBottomWidth: 4,
    borderBottomColor: colors.berry,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.chocolate,
    backgroundColor: colors.white,
  },
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.leafLight,
    backgroundColor: colors.white,
  },
  gradeChipActive: {
    backgroundColor: colors.leaf,
    borderColor: colors.leafDark,
  },
  gradeChipText: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    color: colors.leafDark,
  },
  gradeChipTextActive: {
    color: colors.white,
  },
  saveBtn: {
    marginTop: 10,
  },
  cancel: {
    alignSelf: 'center',
    padding: 6,
  },
  cancelText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  addBtn: {
    marginTop: 6,
  },
  error: {
    marginTop: 6,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.coralDark,
    textAlign: 'center',
  },
});
