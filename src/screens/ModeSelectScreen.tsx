import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ModeSwitcher } from '../components/ModeSwitcher';
import { PracticeHiveModal } from '../components/PracticeHiveModal';
import { HoneycombButton } from '../components/HoneycombButton';
import { Hexagon } from '../components/Hexagon';
import { QuestPicker } from '../components/QuestPicker';
import { colors } from '../theme';
import type { GradeLevel } from '../data/words';
import { getDefaultUnitId, getUnitById, gradeLabel } from '../data/curriculum';
import { getQuestById, type QuestId } from '../data/quests';
import { loadHiveStats } from '../utils/hiveSync';
import { useAuth } from '../auth';
import type { GameMode, RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ModeSelect'>;

export function ModeSelectScreen({ navigation }: Props) {
  const { isAuthenticated, activeChild, token } = useAuth();
  const initialGrade = (activeChild?.gradeLevel as GradeLevel | undefined) ?? '1';
  const [mode, setMode] = useState<GameMode>('quest');
  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [unitId, setUnitId] = useState(() => getDefaultUnitId(initialGrade));
  const [questId, setQuestId] = useState<QuestId>('classic');
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);

  const activeUnit = getUnitById(unitId);
  const quest = getQuestById(questId);

  const refreshStreak = useCallback(() => {
    void loadHiveStats({
      token,
      childId: activeChild?.id,
      fallbackHoney: activeChild?.progress?.honeyTotal,
      fallbackStars: activeChild?.progress?.starsTotal,
      fallbackWords: activeChild?.progress?.wordsMastered,
      fallbackQuests: activeChild?.progress?.questsCompleted,
    }).then((stats) => {
      setStreakDays(stats.streak.currentStreak);
      setCompletedToday(stats.streak.completedToday);
    });
  }, [
    token,
    activeChild?.id,
    activeChild?.progress?.honeyTotal,
    activeChild?.progress?.starsTotal,
    activeChild?.progress?.wordsMastered,
    activeChild?.progress?.questsCompleted,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        navigation.replace('Auth');
        return;
      }
      if (!activeChild) {
        navigation.replace('ChildSelect');
        return;
      }
      refreshStreak();
    }, [isAuthenticated, activeChild, navigation, refreshStreak]),
  );

  useEffect(() => {
    if (!activeChild?.gradeLevel) return;
    const next = activeChild.gradeLevel as GradeLevel;
    setGrade(next);
    setUnitId(getDefaultUnitId(next));
  }, [activeChild?.id, activeChild?.gradeLevel]);

  const handleGradeChange = (next: GradeLevel) => {
    setGrade(next);
    setUnitId(getDefaultUnitId(next));
  };

  const startQuest = () => {
    navigation.navigate('Game', {
      mode: 'quest',
      grade,
      unitId,
      wordGoal: quest.wordGoal,
      questId: quest.id,
      questTitle: quest.title,
    });
  };

  const startPractice = (words: string[]) => {
    setPracticeOpen(false);
    const goal = Math.min(quest.wordGoal, Math.max(1, words.length));
    navigation.navigate('Game', {
      mode: 'practice',
      customWords: words,
      wordGoal: goal,
      questId: quest.id,
      questTitle: quest.title,
    });
  };

  return (
    <View style={styles.fill}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.skyTop, colors.cream, colors.skyBottom]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.bgHexRow} pointerEvents="none">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Hexagon
                  key={i}
                  size={28}
                  fill={i % 2 === 0 ? colors.honeyLight : colors.goldBright}
                  fillEnd={colors.gold}
                  stroke={colors.honey}
                  strokeWidth={1.5}
                  style={{ opacity: 0.35, marginLeft: i === 0 ? 0 : -6 }}
                />
              ))}
            </View>

            <View style={styles.content}>
              <View style={styles.topLinks}>
                <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
                  <Text style={styles.link}>Home</Text>
                </Pressable>
                <View style={styles.topRight}>
                  {activeChild ? (
                    <Pressable onPress={() => navigation.navigate('ChildSelect')} hitSlop={10}>
                      <Text style={styles.childChip} numberOfLines={1}>
                        {activeChild.nickname}
                      </Text>
                    </Pressable>
                  ) : null}
                  <Pressable onPress={() => navigation.navigate('HiveRewards')} hitSlop={10}>
                    <Text style={styles.link}>My Hive</Text>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10}>
                    <Text style={styles.link}>Settings</Text>
                  </Pressable>
                </View>
              </View>

              <ModeSwitcher
                mode={mode}
                grade={grade}
                unitId={unitId}
                onModeChange={setMode}
                onGradeChange={handleGradeChange}
                onUnitChange={setUnitId}
                onOpenPractice={() => setPracticeOpen(true)}
              />

              <View style={styles.questBlock}>
                <QuestPicker
                  selectedId={questId}
                  onSelect={setQuestId}
                  streakDays={streakDays}
                  completedToday={completedToday}
                />
              </View>

              {mode === 'quest' ? (
                <View style={styles.playBlock}>
                  <Text style={styles.readyText}>
                    {quest.title}: {quest.subtitle}
                  </Text>
                  <Text style={styles.readySub}>
                    {activeUnit
                      ? `${gradeLabel(grade)} · “${activeUnit.title}” · look then listen`
                      : 'Two rounds per word — look first, then listen'}
                  </Text>
                  <HoneycombButton label="Play" size={132} onPress={startQuest} />
                </View>
              ) : null}
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ScrollView>

      <PracticeHiveModal
        visible={practiceOpen}
        onClose={() => {
          setPracticeOpen(false);
          setMode('quest');
        }}
        onSave={startPractice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
  },
  safe: {
    flexGrow: 1,
    marginTop: 50,
  },
  bgHexRow: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 0,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
  },
  topLinks: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  link: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.honeyDark,
  },
  childChip: {
    maxWidth: 120,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.honeyDark,
    backgroundColor: colors.white,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questBlock: {
    width: '100%',
    marginTop: 16,
  },
  playBlock: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.honey,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 6,
  },
  readyText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  readySub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
