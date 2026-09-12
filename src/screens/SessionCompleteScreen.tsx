import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlphaBee } from '../components/AlphaBee';
import { Hexagon } from '../components/Hexagon';
import { colors, typography } from '../theme';
import { getQuestByGoal } from '../data/quests';
import { recordQuestCompletion, type StreakState } from '../utils/streak';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

export function SessionCompleteScreen({ navigation, route }: Props) {
  const { honey, stars, wordsCompleted, wordGoal, questTitle } = route.params;
  const quest = getQuestByGoal(wordGoal);
  const [streak, setStreak] = useState<StreakState | null>(null);

  useEffect(() => {
    let alive = true;
    void recordQuestCompletion().then((next) => {
      if (alive) setStreak(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.honeyLight]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hexRow} pointerEvents="none">
          <Hexagon size={28} fill={colors.goldBright} fillEnd={colors.gold} stroke={colors.honey} />
          <Hexagon size={22} fill={colors.honeyLight} fillEnd={colors.honey} stroke={colors.honey} />
        </View>

        <AlphaBee size={88} happy flipping />
        <Text style={[typography.title, styles.title]}>Quest Complete!</Text>
        <Text style={styles.sub}>
          You finished {questTitle || quest.title} — {wordsCompleted} words mastered
        </Text>

        <View style={styles.card}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{wordsCompleted}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{honey}</Text>
              <Text style={styles.statLabel}>Honey</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stars}</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
          </View>

          <View style={styles.streakBox}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                {streak?.currentStreak ?? '!'}
              </Text>
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
        </View>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('HiveRewards', { honey, stars })}
        >
          <Text style={styles.primaryText}>See My Hive</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('ModeSelect')}>
          <Text style={styles.secondaryText}>New Quest</Text>
        </Pressable>

        <Pressable style={styles.linkBtn} onPress={() => navigation.popToTop()}>
          <Text style={styles.linkText}>Home</Text>
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
    justifyContent: 'center',
  },
  hexRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.text,
  },
  sub: {
    ...typography.subtitle,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.honey,
    padding: 18,
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.creamSoft,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 24,
    color: colors.honeyDark,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.creamSoft,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 12,
  },
  streakBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.honeyDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: colors.white,
  },
  streakTextBlock: {
    flex: 1,
  },
  streakTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text,
  },
  streakSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  primaryBtn: {
    marginTop: 22,
    backgroundColor: colors.gold,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.honeyDark,
    width: '100%',
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: colors.white,
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.honey,
    width: '100%',
    alignItems: 'center',
  },
  secondaryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.honeyDark,
  },
  linkBtn: {
    marginTop: 14,
    padding: 8,
  },
  linkText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.textMuted,
  },
});
