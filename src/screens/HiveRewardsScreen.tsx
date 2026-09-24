import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { CollectibleHive } from '../components/HiveDecor';
import { AlphaBee } from '../components/AlphaBee';
import { useAuth } from '../auth';
import { loadHiveStats, type HiveStats } from '../utils/hiveSync';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HiveRewards'>;

export function HiveRewardsScreen({ navigation, route }: Props) {
  const { token, activeChild } = useAuth();
  const sessionHoney = route.params?.honey ?? 0;
  const sessionStars = route.params?.stars ?? 0;

  const [stats, setStats] = useState<HiveStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.honeyLight]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <Text style={[typography.title, styles.title]}>Your Hive</Text>
        <Text style={[typography.subtitle, styles.sub]}>
          {activeChild
            ? `${activeChild.nickname}'s honey, stars, and streak`
            : 'Collect honey droplets, stars, and friendly bees as you spell'}
        </Text>

        {loading && !stats ? (
          <ActivityIndicator color={colors.honey} style={{ marginVertical: 40 }} />
        ) : (
          <>
            <View style={styles.stage}>
              <CollectibleHive honeyDrops={honey} stars={stars} bees={decorativeBees} />
              <View style={styles.mascot}>
                <AlphaBee size={70} happy />
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{honey}</Text>
                <Text style={styles.statLabel}>Honey drops</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{stars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{streak?.currentStreak ?? 0}</Text>
                <Text style={styles.statLabel}>Day streak</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaLine}>
                Words mastered: {stats?.wordsMastered ?? 0}
                {' · '}
                Quests: {stats?.questsCompleted ?? 0}
              </Text>
              <Text style={styles.metaLine}>
                {streak?.completedToday
                  ? `Best streak: ${streak.longestStreak} day${streak.longestStreak === 1 ? '' : 's'}`
                  : 'Finish a quest today to grow your streak'}
              </Text>
              {showSessionHint ? (
                <Text style={styles.sessionHint}>
                  This session: +{sessionHoney} honey · +{sessionStars} stars
                </Text>
              ) : null}
              <Text style={styles.sourceHint}>
                {stats?.source === 'api' ? 'Synced from your hive' : 'Showing saved device totals'}
              </Text>
            </View>
          </>
        )}

        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Keep Spelling</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  sub: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  stage: {
    backgroundColor: colors.white,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.honey,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  mascot: {
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.honeyLight,
  },
  statValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 26,
    color: colors.honeyDark,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaCard: {
    width: '100%',
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  metaLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  sessionHint: {
    marginTop: 4,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.honeyDark,
    textAlign: 'center',
  },
  sourceHint: {
    marginTop: 4,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  back: {
    marginTop: 28,
    backgroundColor: colors.gold,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  backText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: colors.white,
  },
});
