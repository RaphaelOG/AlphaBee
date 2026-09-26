import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlphaBee } from '../components/AlphaBee';
import { Beehive } from '../components/HiveDecor';
import { ChunkyButton, KidCard, Sticker } from '../components/KidUI';
import { Confetti, FlowerMeadow, HoneycombPattern, SkyScene, Sparkles } from '../components/SceneDecor';
import { useAudio } from '../audio';
import { useAuth } from '../auth';
import { colors, fonts } from '../theme';
import { getQuestByGoal } from '../data/quests';
import { recordQuestCompletion, type StreakState } from '../utils/streak';
import { postCompletedSession } from '../utils/sessionSync';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

export function SessionCompleteScreen({ navigation, route }: Props) {
  const { playSfx } = useAudio();
  const { token, activeChild, refreshChildren } = useAuth();
  const {
    honey,
    stars,
    wordsCompleted,
    wordGoal,
    questTitle,
    mode,
    questId,
    grade,
    unitId,
  } = route.params;
  const quest = getQuestByGoal(wordGoal);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [syncStatus, setSyncStatus] = useState<'saving' | 'saved' | 'local' | 'error'>('saving');
  const postedRef = useRef(false);

  useEffect(() => {
    playSfx('complete');
    if (postedRef.current) return;
    postedRef.current = true;

    let alive = true;
    void (async () => {
      // Always keep a device-local streak so Mode Select stays useful offline
      const localStreak = await recordQuestCompletion();

      if (token && activeChild) {
        const result = await postCompletedSession({
          token,
          childId: activeChild.id,
          payload: {
            mode,
            questId,
            questTitle,
            wordGoal,
            wordsCompleted,
            honeyEarned: honey,
            starsEarned: stars,
            gradeLevel: grade,
            unitId,
            applyRewards: true,
          },
        });

        if (!alive) return;

        if (result.synced && result.streak) {
          setStreak(result.streak);
          setSyncStatus('saved');
          void refreshChildren().catch(() => undefined);
          return;
        }

        setStreak(localStreak);
        setSyncStatus(result.error ? 'error' : 'local');
        return;
      }

      if (!alive) return;
      setStreak(localStreak);
      setSyncStatus('local');
    })();

    return () => {
      alive = false;
    };
  }, [
    playSfx,
    token,
    activeChild,
    mode,
    questId,
    questTitle,
    wordGoal,
    wordsCompleted,
    honey,
    stars,
    grade,
    unitId,
    refreshChildren,
  ]);

  const syncHint =
    syncStatus === 'saving'
      ? 'Saving your hive…'
      : syncStatus === 'saved'
        ? 'Saved to your hive'
        : syncStatus === 'error'
          ? 'Saved on this device (cloud sync failed)'
          : 'Saved on this device';
  const syncIcon: React.ComponentProps<typeof Ionicons>['name'] =
    syncStatus === 'saving' ? 'cloud-upload' : syncStatus === 'saved' ? 'cloud-done' : 'phone-portrait';

  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
  }, [pop]);
  const popScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const wobble = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [wobble]);
  const titleRotate = wobble.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] });

  const perfect = stars >= wordsCompleted && wordsCompleted > 0;

  return (
    <LinearGradient colors={[colors.sky, colors.sunny, colors.honeyLight]} style={styles.fill}>
      <StatusBar style="dark" />
      <HoneycombPattern opacity={0.08} rows={40} />
      <SkyScene sunSize={68} />
      <Confetti count={26} />
      <FlowerMeadow height={90} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.hero, { transform: [{ scale: popScale }] }]}>
            <Sparkles count={10} seed={21} />
            <View style={styles.heroHive} pointerEvents="none">
              <Beehive size={96} branch={false} />
            </View>
            <View style={styles.heroBee}>
              <AlphaBee size={120} mood="excited" flipping />
            </View>
            <Sticker emoji="🏆" tone="coral" size={54} rotate={12} style={styles.trophy} />
          </Animated.View>

          <Animated.Text style={[styles.title, { transform: [{ rotate: titleRotate }] }]}>Quest Complete!</Animated.Text>
          <Text style={styles.sub}>
            You finished <Text style={styles.subStrong}>{questTitle || quest.title}</Text>
            {'\n'}
            {wordsCompleted} words mastered{perfect ? ' — a perfect run!' : ''}
          </Text>

          <KidCard tone="honey" drip contentStyle={styles.card}>
            <View style={styles.statRow}>
              <View style={[styles.stat, { backgroundColor: colors.leafLight, borderColor: colors.leaf }]}>
                <Text style={styles.statEmoji}>🔤</Text>
                <Text style={[styles.statValue, { color: colors.leafDark }]}>{wordsCompleted}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={[styles.stat, { backgroundColor: colors.sunny, borderColor: colors.honey }]}>
                <Text style={styles.statEmoji}>🍯</Text>
                <Text style={[styles.statValue, { color: colors.honeyDark }]}>{honey}</Text>
                <Text style={styles.statLabel}>Honey</Text>
              </View>
              <View style={[styles.stat, { backgroundColor: colors.sky, borderColor: colors.skyDeep }]}>
                <Text style={styles.statEmoji}>⭐</Text>
                <Text style={[styles.statValue, { color: colors.skyNight }]}>{stars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
            </View>

            <View style={styles.streakBox}>
              <View style={styles.streakBadge}>
                <Text style={styles.streakFlame}>🔥</Text>
                <Text style={styles.streakBadgeText}>{streak?.currentStreak ?? '…'}</Text>
              </View>
              <View style={styles.streakTextBlock}>
                <Text style={styles.streakTitle}>
                  {streak ? `${streak.currentStreak}-day streak` : 'Saving streak…'}
                </Text>
                <Text style={styles.streakSub}>
                  {streak?.completedToday
                    ? streak.currentStreak <= 1
                      ? 'Nice start — come back tomorrow to grow your streak!'
                      : `Best streak: ${streak.longestStreak} day${streak.longestStreak === 1 ? '' : 's'}`
                    : 'Finish a quest each day to keep buzzing.'}
                </Text>
              </View>
            </View>

            <View style={styles.syncRow}>
              <Ionicons name={syncIcon} size={14} color={colors.textMuted} />
              <Text style={styles.syncHint}>{syncHint}</Text>
            </View>
          </KidCard>

          <View style={styles.actions}>
            <ChunkyButton
              label="See My Hive"
              tone="honey"
              size="lg"
              fullWidth
              icon={<Ionicons name="trophy" size={22} color={colors.white} />}
              onPress={() => navigation.navigate('HiveRewards', { honey, stars })}
            />
            <ChunkyButton
              label="New Quest"
              tone="leaf"
              fullWidth
              icon={<Ionicons name="refresh" size={20} color={colors.white} />}
              onPress={() => navigation.navigate('ModeSelect')}
            />
            <Pressable style={styles.linkBtn} onPress={() => navigation.popToTop()} hitSlop={8}>
              <Ionicons name="home" size={16} color={colors.textMuted} />
              <Text style={styles.linkText}>Home</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: 240,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHive: {
    position: 'absolute',
    right: 4,
    top: 0,
    opacity: 0.95,
  },
  heroBee: {
    marginTop: 20,
    marginRight: 40,
  },
  trophy: {
    position: 'absolute',
    left: 14,
    top: 18,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.chocolate,
    textAlign: 'center',
    marginTop: 4,
    textShadowColor: colors.white,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  sub: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.brown,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 21,
  },
  subStrong: {
    fontFamily: fonts.display,
    color: colors.honeyDark,
  },
  card: {
    gap: 14,
    paddingTop: 24,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2.5,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  statLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.coralLight,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.coral,
    padding: 12,
  },
  streakBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.coral,
    borderWidth: 2.5,
    borderColor: colors.coralDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakFlame: {
    fontSize: 16,
    marginBottom: -4,
  },
  streakBadgeText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
  },
  streakTextBlock: {
    flex: 1,
  },
  streakTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.chocolate,
  },
  streakSub: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
    lineHeight: 16,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  syncHint: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 20,
    gap: 12,
    alignItems: 'center',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 8,
  },
  linkText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textMuted,
  },
});
