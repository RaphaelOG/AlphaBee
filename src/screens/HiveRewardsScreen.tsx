import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { CollectibleHive } from '../components/HiveDecor';
import { AlphaBee } from '../components/AlphaBee';
import { useAuth } from '../auth';
import { loadHiveStats, type HiveStats } from '../utils/hiveSync';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HiveRewards'>;

// Honey needed to fill the current tier ring — purely visual pacing, tweak freely.
const TIER_SIZE = 20;

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

function HoneycombBackdrop() {
  // A soft, oversized honeycomb pattern peeking from behind the hero card.
  const cells = Array.from({ length: 6 });
  return (
    <View style={styles.combWrap} pointerEvents="none">
      {cells.map((_, i) => (
        <View
          key={i}
          style={[
            styles.combCell,
            {
              left: (i % 3) * 70 - 30,
              top: Math.floor(i / 3) * 60 - 20,
              opacity: 0.15 + (i % 2) * 0.06,
            },
          ]}
        />
      ))}
    </View>
  );
}

function StreakFlame({ days }: { days: number }) {
  const lit = days > 0;
  return (
    <View style={[styles.flameBadge, lit && styles.flameBadgeLit]}>
      <Ionicons
        name={lit ? 'flame' : 'flame-outline'}
        size={16}
        color={lit ? colors.white : colors.textMuted}
      />
      <Text style={[styles.flameText, lit && styles.flameTextLit]}>{days}</Text>
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

  const cardStyle = {
    opacity: cardIn,
    transform: [
      {
        translateY: cardIn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
      },
      {
        scale: cardIn.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }),
      },
    ],
  };

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.honeyLight]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.title, styles.title]}>Your Hive</Text>
            <Text style={[typography.subtitle, styles.sub]}>
              {activeChild ? `${activeChild.nickname}'s hive` : 'Every word you spell grows the hive'}
            </Text>
          </View>
          {streak ? <StreakFlame days={streak.currentStreak ?? 0} /> : null}
        </View>

        {loading && !stats ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.honey} size="large" />
            <Text style={styles.loadingText}>Buzzing over to your hive…</Text>
          </View>
        ) : (
          <>
            <Animated.View style={[styles.hero, cardStyle]}>
              <HoneycombBackdrop />

              <View style={styles.tierRow}>
                <View style={styles.tierPill}>
                  <Ionicons name="trophy" size={13} color={colors.honeyDark} />
                  <Text style={styles.tierPillText}>Tier {tierNumber}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${tierProgress}%` }]} />
                </View>
              </View>

              <View style={styles.stage}>
                <CollectibleHive honeyDrops={honey} stars={stars} bees={decorativeBees} />
                <View style={styles.mascot}>
                  <AlphaBee size={78} happy />
                </View>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <View style={styles.statIconWrap}>
                    <Ionicons name="water" size={16} color={colors.honeyDark} />
                  </View>
                  <Text style={styles.statValue}>{honeyDisplay}</Text>
                  <Text style={styles.statLabel}>Honey drops</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <View style={styles.statIconWrap}>
                    <Ionicons name="star" size={16} color={colors.honeyDark} />
                  </View>
                  <Text style={styles.statValue}>{starsDisplay}</Text>
                  <Text style={styles.statLabel}>Stars</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <View style={styles.statIconWrap}>
                    <Ionicons name="ribbon" size={16} color={colors.honeyDark} />
                  </View>
                  <Text style={styles.statValue}>{stats?.questsCompleted ?? 0}</Text>
                  <Text style={styles.statLabel}>Quests</Text>
                </View>
              </View>
            </Animated.View>

            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Ionicons name="book" size={15} color={colors.textMuted} />
                <Text style={styles.metaLine}>{stats?.wordsMastered ?? 0} words mastered</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons
                  name={streak?.completedToday ? 'checkmark-circle' : 'time'}
                  size={15}
                  color={streak?.completedToday ? colors.honeyDark : colors.textMuted}
                />
                <Text style={styles.metaLine}>
                  {streak?.completedToday
                    ? `Best streak: ${streak.longestStreak} day${streak.longestStreak === 1 ? '' : 's'}`
                    : 'Finish a quest today to grow your streak'}
                </Text>
              </View>
              {showSessionHint ? (
                <View style={styles.sessionHintPill}>
                  <Ionicons name="sparkles" size={14} color={colors.honeyDark} />
                  <Text style={styles.sessionHint}>
                    This session: +{sessionHoney} honey · +{sessionStars} stars
                  </Text>
                </View>
              ) : null}
              <Text style={styles.sourceHint}>
                {stats?.source === 'api' ? 'Synced from your hive' : 'Showing saved device totals'}
              </Text>
            </View>
          </>
        )}

        <Pressable
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Keep Spelling</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={colors.white} />
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 12,
    gap: 10,
  },
  title: {
    textAlign: 'left',
  },
  sub: {
    textAlign: 'left',
    marginTop: 4,
    marginBottom: 16,
  },
  flameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
  },
  flameBadgeLit: {
    backgroundColor: colors.honeyDark,
    borderColor: colors.honeyDark,
  },
  flameText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.textMuted,
  },
  flameTextLit: {
    color: colors.white,
  },
  loadingWrap: {
    marginVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.honey,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    shadowColor: colors.honeyDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  combWrap: {
    ...StyleSheet.absoluteFill,
  },
  combCell: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.honeyLight,
    transform: [{ rotate: '30deg' }],
  },
  tierRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.honeyLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tierPillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: colors.honeyDark,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.honeyLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.honeyDark,
  },
  stage: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
  },
  mascot: {
    marginTop: 6,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.honeyLight,
  },
  statIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.honeyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 24,
    color: colors.honeyDark,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
  },
  metaCard: {
    width: '100%',
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    flexShrink: 1,
  },
  sessionHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: colors.honeyLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  sessionHint: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.honeyDark,
  },
  sourceHint: {
    marginTop: 2,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
    backgroundColor: colors.gold,
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  backPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  backText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: colors.white,
  },
});