import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { CollectibleHive } from '../components/HiveDecor';
import { AlphaBee } from '../components/AlphaBee';
import { ChunkyButton, KidCard, Pill, Sticker } from '../components/KidUI';
import { FlowerMeadow, HoneycombPattern, Pollen, SkyScene, Sparkles } from '../components/SceneDecor';
import { NavButton, TopNav } from '../components/TopNav';
import { useAuth } from '../auth';
import { getAvatar } from '../data/avatars';
import { loadHiveStats, type HiveStats } from '../utils/hiveSync';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HiveRewards'>;

// Honey needed to fill the current tier ring — purely visual pacing, tweak freely.
const TIER_SIZE = 20;
const TIER_NAMES = ['Busy Bee', 'Honey Helper', 'Comb Builder', 'Nectar Knight', 'Hive Hero', 'Queen’s Guard'];

function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    const id = anim.addListener(({ value }) => setDisplay(Math.round(value * target)));
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [target]);

  return display;
}

function StreakFlame({ days }: { days: number }) {
  const lit = days > 0;
  return (
    <View style={[styles.flameBadge, lit && styles.flameBadgeLit]}>
      <Text style={styles.flameEmoji}>{lit ? '🔥' : '💤'}</Text>
      <Text style={[styles.flameText, lit && styles.flameTextLit]}>
        {days} day{days === 1 ? '' : 's'}
      </Text>
    </View>
  );
}

export function HiveRewardsScreen({ navigation, route }: Props) {
  const { token, activeChild } = useAuth();
  const sessionHoney = route.params?.honey ?? 0;
  const sessionStars = route.params?.stars ?? 0;

  const [stats, setStats] = useState<HiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const cardIn = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setLoading(true);
      void loadHiveStats({
        token,
        childId: activeChild?.id,
        fallbackHoney: activeChild?.progress?.honeyTotal ?? sessionHoney,
        fallbackStars: activeChild?.progress?.starsTotal ?? sessionStars,
        fallbackWords: activeChild?.progress?.wordsMastered ?? 0,
        fallbackQuests: activeChild?.progress?.questsCompleted ?? 0,
      }).then((next) => {
        if (!alive) return;
        setStats(next);
        setLoading(false);
        cardIn.setValue(0);
        Animated.spring(cardIn, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }).start();
      });
      return () => {
        alive = false;
      };
    }, [
      token,
      activeChild?.id,
      activeChild?.progress?.honeyTotal,
      activeChild?.progress?.starsTotal,
      activeChild?.progress?.wordsMastered,
      activeChild?.progress?.questsCompleted,
      sessionHoney,
      sessionStars,
    ]),
  );

  const honey = stats?.honeyTotal ?? sessionHoney;
  const stars = stats?.starsTotal ?? sessionStars;
  const streak = stats?.streak;
  const decorativeBees = Math.min(4, Math.floor(honey / 2) + (stars > 0 ? 1 : 0));
  const showSessionHint = sessionHoney > 0 || sessionStars > 0;

  const honeyDisplay = useCountUp(honey);
  const starsDisplay = useCountUp(stars);
  const tierProgress = ((honey % TIER_SIZE) / TIER_SIZE) * 100;
  const tierNumber = Math.floor(honey / TIER_SIZE) + 1;
  const tierName = TIER_NAMES[Math.min(tierNumber - 1, TIER_NAMES.length - 1)];
  const toNext = TIER_SIZE - (honey % TIER_SIZE);
  const avatar = getAvatar(activeChild?.avatarKey);

  const cardStyle = {
    opacity: cardIn,
    transform: [
      { translateY: cardIn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
      { scale: cardIn.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
    ],
  };

  return (
    <LinearGradient colors={[colors.sky, colors.skyTop, colors.sunny]} style={styles.fill}>
      <StatusBar style="dark" />
      <HoneycombPattern opacity={0.07} rows={40} />
      <SkyScene sunSize={72} />
      <Pollen count={8} />
      <FlowerMeadow height={110} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TopNav
            left={<NavButton icon="arrow-back" onPress={() => navigation.goBack()} accessibilityLabel="Back" />}
            right={streak ? <StreakFlame days={streak.currentStreak ?? 0} /> : null}
          />

          <View style={styles.header}>
            <Sticker emoji={activeChild ? avatar.emoji : '🐝'} tone={activeChild ? avatar.tone : 'honey'} size={56} rotate={-8} />
            <View style={styles.headerText}>
              <Text style={styles.title}>{activeChild ? `${activeChild.nickname}’s Hive` : 'Your Hive'}</Text>
              <Text style={styles.sub}>Every word you spell makes the hive grow!</Text>
            </View>
          </View>

          {loading && !stats ? (
            <View style={styles.loadingWrap}>
              <AlphaBee size={72} mood="thinking" />
              <ActivityIndicator color={colors.honey} size="large" />
              <Text style={styles.loadingText}>Buzzing over to your hive…</Text>
            </View>
          ) : (
            <>
              <Animated.View style={[styles.heroWrap, cardStyle]}>
                <KidCard tone="honey" drip contentStyle={styles.hero}>
                  <Sparkles count={8} seed={17} />
                  <View style={styles.tierRow}>
                    <Pill emoji="🏅" label={`Tier ${tierNumber} · ${tierName}`} tone="honey" solid />
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${tierProgress}%` }]} />
                    <Text style={styles.progressText}>
                      {toNext} honey to Tier {tierNumber + 1}
                    </Text>
                  </View>

                  <View style={styles.stage}>
                    <CollectibleHive honeyDrops={honey} stars={stars} bees={decorativeBees} />
                    <View style={styles.mascot}>
                      <AlphaBee size={84} mood="happy" />
                    </View>
                  </View>

                  <View style={styles.stats}>
                    <View style={[styles.stat, { backgroundColor: colors.sunny, borderColor: colors.honey }]}>
                      <Text style={styles.statEmoji}>🍯</Text>
                      <Text style={[styles.statValue, { color: colors.honeyDark }]}>{honeyDisplay}</Text>
                      <Text style={styles.statLabel}>Honey</Text>
                    </View>
                    <View style={[styles.stat, { backgroundColor: colors.sky, borderColor: colors.skyDeep }]}>
                      <Text style={styles.statEmoji}>⭐</Text>
                      <Text style={[styles.statValue, { color: colors.skyNight }]}>{starsDisplay}</Text>
                      <Text style={styles.statLabel}>Stars</Text>
                    </View>
                    <View style={[styles.stat, { backgroundColor: colors.coralLight, borderColor: colors.coral }]}>
                      <Text style={styles.statEmoji}>🚩</Text>
                      <Text style={[styles.statValue, { color: colors.coralDark }]}>{stats?.questsCompleted ?? 0}</Text>
                      <Text style={styles.statLabel}>Quests</Text>
                    </View>
                  </View>
                </KidCard>
              </Animated.View>

              <KidCard tone="leaf" contentStyle={styles.metaCard}>
                <View style={styles.metaRow}>
                  <View style={[styles.metaIcon, { backgroundColor: colors.leafLight }]}>
                    <Ionicons name="book" size={16} color={colors.leafDark} />
                  </View>
                  <Text style={styles.metaLine}>
                    <Text style={styles.metaStrong}>{stats?.wordsMastered ?? 0}</Text> words mastered
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <View style={[styles.metaIcon, { backgroundColor: colors.coralLight }]}>
                    <Ionicons
                      name={streak?.completedToday ? 'checkmark-circle' : 'time'}
                      size={16}
                      color={colors.coralDark}
                    />
                  </View>
                  <Text style={styles.metaLine}>
                    {streak?.completedToday
                      ? `Best streak: ${streak.longestStreak} day${streak.longestStreak === 1 ? '' : 's'}`
                      : 'Finish a quest today to grow your streak'}
                  </Text>
                </View>
                {showSessionHint ? (
                  <Pill
                    emoji="✨"
                    tone="honey"
                    label={`This quest: +${sessionHoney} honey · +${sessionStars} stars`}
                    style={styles.sessionPill}
                  />
                ) : null}
                <View style={styles.sourceRow}>
                  <Ionicons
                    name={stats?.source === 'api' ? 'cloud-done' : 'phone-portrait'}
                    size={12}
                    color={colors.textMuted}
                  />
                  <Text style={styles.sourceHint}>
                    {stats?.source === 'api' ? 'Synced from your hive' : 'Showing saved device totals'}
                  </Text>
                </View>
              </KidCard>
            </>
          )}

          <ChunkyButton
            label="Keep Spelling!"
            tone="honey"
            size="lg"
            onPress={() => navigation.goBack()}
            iconRight={<Ionicons name="arrow-forward-circle" size={24} color={colors.white} />}
            style={styles.back}
          />
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
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 130,
    alignItems: 'center',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.chocolate,
  },
  sub: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brown,
    marginTop: -2,
  },
  flameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 4,
    borderBottomColor: colors.honey,
  },
  flameBadgeLit: {
    backgroundColor: colors.coral,
    borderColor: colors.coralDark,
    borderBottomColor: colors.coralDark,
  },
  flameEmoji: {
    fontSize: 14,
  },
  flameText: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  flameTextLit: {
    color: colors.white,
  },
  loadingWrap: {
    marginVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  heroWrap: {
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 10,
  },
  tierRow: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 22,
    borderRadius: 12,
    backgroundColor: colors.creamSoft,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.gold,
  },
  progressText: {
    fontFamily: fonts.extraBold,
    fontSize: 11,
    color: colors.honeyDeep,
  },
  stage: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mascot: {
    marginLeft: -40,
    marginTop: 90,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2.5,
    paddingVertical: 8,
    gap: 1,
  },
  statEmoji: {
    fontSize: 18,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  statLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaCard: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLine: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    flexShrink: 1,
  },
  metaStrong: {
    fontFamily: fonts.display,
    color: colors.leafDark,
    fontSize: 16,
  },
  sessionPill: {
    alignSelf: 'center',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sourceHint: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  back: {
    marginTop: 6,
  },
});
