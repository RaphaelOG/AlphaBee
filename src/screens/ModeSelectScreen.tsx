import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ModeSwitcher } from '../components/ModeSwitcher';
import { PracticeHiveModal } from '../components/PracticeHiveModal';
import { HoneycombButton } from '../components/HoneycombButton';
import { QuestPicker } from '../components/QuestPicker';
import { KidCard, Pill } from '../components/KidUI';
import { FlowerMeadow, HoneycombPattern, Pollen, SkyScene, Sparkles } from '../components/SceneDecor';
import { NavButton, TopNav } from '../components/TopNav';
import { getAvatar } from '../data/avatars';
import { colors, fonts } from '../theme';
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
          colors={[colors.sky, colors.skyTop, colors.creamSoft]}
          style={styles.gradient}
        >
          <HoneycombPattern opacity={0.07} rows={40} />
          <SkyScene sunSize={72} />
          <Pollen count={8} />
          <FlowerMeadow height={88} />
          <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.content}>
              <TopNav
                left={<NavButton icon="home" label="Home" onPress={() => navigation.goBack()} />}
                right={
                  <>
                    {activeChild ? (
                      <NavButton
                        icon="person"
                        emoji={getAvatar(activeChild.avatarKey).emoji}
                        label={activeChild.nickname}
                        onPress={() => navigation.navigate('ChildSelect')}
                        accessibilityLabel="Switch learner"
                      />
                    ) : null}
                    <NavButton
                      icon="trophy"
                      onPress={() => navigation.navigate('HiveRewards')}
                      accessibilityLabel="My Hive"
                    />
                    <NavButton
                      icon="settings-sharp"
                      onPress={() => navigation.navigate('Settings')}
                      accessibilityLabel="Settings"
                    />
                  </>
                }
              />

              <ModeSwitcher
                mode={mode}
                grade={grade}
                unitId={unitId}
                onModeChange={setMode}
                onGradeChange={handleGradeChange}
                onUnitChange={setUnitId}
                onOpenPractice={() => setPracticeOpen(true)}
                learnerName={activeChild?.nickname}
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
                <KidCard tone="honey" tinted style={styles.playBlockWrap} contentStyle={styles.playBlock}>
                  <Sparkles count={7} seed={3} />
                  <View style={styles.readyRow}>
                    <Ionicons name="rocket" size={18} color={colors.honeyDark} />
                    <Text style={styles.readyText}>
                      {quest.title} · {quest.subtitle}
                    </Text>
                  </View>
                  <View style={styles.readyPills}>
                    <Pill label={gradeLabel(grade)} tone="leaf" emoji="🎒" />
                    {activeUnit ? <Pill label={activeUnit.title} tone="sky" emoji="🔤" /> : null}
                    <Pill label="Look, then listen" tone="coral" emoji="👀" />
                  </View>
                  <HoneycombButton
                    label="Play!"
                    size={140}
                    onPress={startQuest}
                    icon={<Ionicons name="play" size={26} color={colors.white} />}
                    style={styles.playButton}
                  />
                </KidCard>
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
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 110,
    alignItems: 'center',
    gap: 14,
  },
  questBlock: {
    width: '100%',
    marginTop: 2,
  },
  playBlockWrap: {
    marginTop: 4,
  },
  playBlock: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 10,
    overflow: 'hidden',
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readyText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.chocolate,
    textAlign: 'center',
  },
  readyPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  playButton: {
    marginTop: 6,
  },
});
