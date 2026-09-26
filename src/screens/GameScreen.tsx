import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { GameHeader } from '../components/GameHeader';
import { LetterSlots } from '../components/LetterSlots';
import { HexKeyboard } from '../components/HexKeyboard';
import { SessionProgress } from '../components/SessionProgress';
import { WordMeaningCue } from '../components/WordMeaningCue';
import { ChunkyButton, HoneyDrip, Pill } from '../components/KidUI';
import { FlowerMeadow, HoneycombPattern, Pollen, SkyScene, Sparkles } from '../components/SceneDecor';
import { NavButton } from '../components/TopNav';
import { useAudio } from '../audio';
import { colors, fonts } from '../theme';
import { createQuestSession, type CurriculumUnit } from '../data/curriculum';
import { getWordCue } from '../data/wordCues';
import { speakWord, stopSpeaking } from '../utils/speech';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;
type SpellPhase = 'look' | 'listen';

export function GameScreen({ navigation, route }: Props) {
  const { playSfx } = useAudio();
  const {
    mode,
    grade = '1',
    unitId,
    customWords = [],
    wordGoal,
    questId,
    questTitle,
  } = route.params;

  const wordPool = useMemo(() => {
    if (mode === 'practice' && customWords.length > 0) return customWords;
    return null;
  }, [mode, customWords]);

  const questSession = useMemo(() => {
    if (wordPool) return null;
    return createQuestSession(grade, unitId);
  }, [wordPool, grade, unitId]);

  const pickPracticeWord = useCallback(
    (exclude?: string) => {
      if (!wordPool) return 'bee';
      const filtered = exclude ? wordPool.filter((w) => w !== exclude) : wordPool;
      const list = filtered.length > 0 ? filtered : wordPool;
      return list[Math.floor(Math.random() * list.length)];
    },
    [wordPool],
  );

  const initialQuest = useMemo(() => (questSession ? questSession.next() : null), [questSession]);

  const [target, setTarget] = useState(() => initialQuest?.word ?? pickPracticeWord());
  const [activeUnit, setActiveUnit] = useState<CurriculumUnit | null>(() => initialQuest?.unit ?? null);
  const [phase, setPhase] = useState<SpellPhase>('look');
  const [input, setInput] = useState<string[]>([]);
  const [honey, setHoney] = useState(0);
  const [stars, setStars] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [flipping, setFlipping] = useState(false);
  const [locked, setLocked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const finishingRef = useRef(false);

  const finishSession = useCallback(
    (nextHoney: number, nextStars: number, completed: number) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      navigation.replace('SessionComplete', {
        honey: nextHoney,
        stars: nextStars,
        wordsCompleted: completed,
        wordGoal,
        questTitle,
        mode,
        questId,
        grade,
        unitId: activeUnit?.id ?? unitId,
      });
    },
    [navigation, wordGoal, questTitle, mode, questId, grade, unitId, activeUnit?.id],
  );

  const advanceToNextWord = useCallback(() => {
    if (questSession) {
      const picked = questSession.next(target);
      setTarget(picked.word);
      setActiveUnit(picked.unit);
    } else {
      setTarget(pickPracticeWord(target));
      setActiveUnit(null);
    }
    setPhase('look');
  }, [questSession, pickPracticeWord, target]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const playWord = useCallback(async () => {
    if (!target || isSpeakingRef.current) return;
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    try {
      await speakWord(target);
    } finally {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
  }, [target]);

  useEffect(() => {
    if (phase !== 'listen') return;
    const timer = setTimeout(() => {
      void playWord();
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, target, playWord]);

  const onKey = (letter: string) => {
    if (locked || input.length >= target.length) return;
    playSfx('tap');
    setFeedback('idle');
    setInput((prev) => [...prev, letter.toLowerCase()]);
  };

  const onBackspace = () => {
    if (locked) return;
    playSfx('tap');
    setFeedback('idle');
    setInput((prev) => prev.slice(0, -1));
  };

  const checkSpelling = async () => {
    if (locked || input.length !== target.length || finishingRef.current) return;
    setLocked(true);
    const guess = input.join('');
    if (guess === target) {
      setFeedback('correct');
      setFlipping(true);
      const honeyGain = phase === 'listen' ? 2 : 1;
      const nextHoney = honey + honeyGain;
      const nextStars = phase === 'listen' ? stars + 1 : stars;
      setHoney(nextHoney);
      if (phase === 'listen') {
        setStars(nextStars);
        playSfx('hive');
      } else {
        playSfx('ding');
      }
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* web / unsupported */
      }

      setTimeout(() => {
        setFlipping(false);
        setInput([]);
        setFeedback('idle');
        setLocked(false);

        if (phase === 'look') {
          playSfx('whoosh');
          setPhase('listen');
        } else {
          const completed = wordsCompleted + 1;
          setWordsCompleted(completed);
          if (completed >= wordGoal) {
            finishSession(nextHoney, nextStars, completed);
          } else {
            playSfx('whoosh');
            advanceToNextWord();
          }
        }
      }, 900);
    } else {
      setFeedback('incorrect');
      playSfx('buzz');
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        /* web / unsupported */
      }
      setTimeout(() => {
        setInput([]);
        setFeedback('idle');
        setLocked(false);
        if (phase === 'listen') void playWord();
      }, 700);
    }
  };

  const openHive = () => {
    navigation.navigate('HiveRewards', { honey, stars });
  };

  const isListen = phase === 'listen';
  const wordCue = useMemo(() => getWordCue(target), [target]);
  const emphasizePicture = mode === 'practice' || grade === 'K' || grade === '1' || grade === '2';

  const beeMood =
    feedback === 'correct' ? 'excited' : feedback === 'incorrect' ? 'thinking' : isListen ? 'happy' : 'neutral';
  const canCheck = input.length === target.length && !locked;

  return (
    <LinearGradient
      colors={isListen ? [colors.sky, colors.skyTop, colors.creamSoft] : [colors.sunny, colors.skyTop, colors.creamSoft]}
      style={styles.fill}
    >
      <StatusBar style="dark" />
      <HoneycombPattern opacity={0.06} rows={40} />
      <SkyScene sunSize={68} />
      <Pollen count={8} />
      <FlowerMeadow height={86} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
        >
          <GameHeader
            honey={honey}
            stars={stars}
            grade={mode === 'quest' ? grade : undefined}
            modeLabel={mode === 'quest' ? 'Grade Level Quest' : 'Practice Hive'}
            patternLabel={activeUnit?.focusLabel}
            mood={beeMood}
          />

          <SessionProgress completed={wordsCompleted} goal={wordGoal} questTitle={questTitle} />

          <View style={[styles.cardWrap, feedback === 'correct' && styles.cardWrapCorrect]}>
            <View style={[styles.card, isListen && styles.cardListen, feedback === 'correct' && styles.cardCorrect]}>
              <HoneyDrip color={isListen ? colors.skyDeep : colors.gold} style={styles.drip} />
              {feedback === 'correct' ? <Sparkles count={10} seed={5} color={colors.goldBright} /> : null}

              <View style={styles.roundRow}>
                <View style={[styles.roundBadge, isListen && styles.roundBadgeListen]}>
                  <Ionicons name={isListen ? 'ear' : 'eye'} size={16} color={colors.white} />
                  <Text style={styles.roundBadgeText}>{isListen ? 'Round 2' : 'Round 1'}</Text>
                </View>
                <Text style={styles.roundTitle}>{isListen ? 'Listen & Spell' : 'Look & Spell'}</Text>
              </View>

              {activeUnit ? (
                <Pill emoji="🔤" label={activeUnit.title} tone={isListen ? 'sky' : 'honey'} style={styles.unitPill} />
              ) : null}

              <View style={[styles.imagePlate, isListen && styles.imagePlateListen]}>
                {isListen ? (
                  <>
                    <Pressable
                      onPress={() => {
                        void playWord();
                      }}
                      hitSlop={16}
                      disabled={locked || isSpeaking}
                      style={({ pressed }) => [
                        styles.hearBtn,
                        pressed && styles.hearBtnPressed,
                        isSpeaking && styles.hearBtnSpeaking,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Hear the word again"
                      accessibilityState={{ disabled: locked || isSpeaking, busy: isSpeaking }}
                    >
                      <View style={styles.hearRing}>
                        <Ionicons name={isSpeaking ? 'volume-high' : 'volume-medium'} size={40} color={colors.white} />
                      </View>
                    </Pressable>
                    <Text style={styles.hearLabel}>{isSpeaking ? 'Listen…' : 'Tap to hear the word'}</Text>
                    <View style={styles.hiddenRow}>
                      {Array.from({ length: target.length }).map((_, i) => (
                        <View key={i} style={styles.hiddenDot} />
                      ))}
                      <Text style={styles.hiddenHint}>{target.length} letters</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <WordMeaningCue cue={wordCue} emphasizePicture={emphasizePicture} />
                    <View style={styles.spellBlock}>
                      <Text style={styles.spellLabel}>Spell this word</Text>
                      <Text style={styles.targetWord}>{target}</Text>
                    </View>
                  </>
                )}
              </View>

              <LetterSlots length={target.length} letters={input} feedback={feedback} />

              {feedback === 'correct' ? (
                <View style={[styles.feedbackBanner, styles.feedbackBannerGood]}>
                  <Text style={styles.feedbackEmoji}>🎉</Text>
                  <Text style={styles.feedbackGood}>
                    {isListen ? 'Buzz-tastic! Word mastered!' : 'Nice! Now spell it from memory'}
                  </Text>
                </View>
              ) : feedback === 'incorrect' ? (
                <View style={[styles.feedbackBanner, styles.feedbackBannerBad]}>
                  <Text style={styles.feedbackEmoji}>🐝</Text>
                  <Text style={styles.feedbackBad}>Almost! Give it another buzz</Text>
                </View>
              ) : (
                <Text style={styles.feedbackIdle}>
                  {isListen ? 'Listen carefully, then fill the honeycomb' : 'Use the picture and meaning to help you'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.keyboardArea}>
            <HexKeyboard onKey={onKey} onBackspace={onBackspace} disabled={locked} />
            <ChunkyButton
              label="Check it!"
              tone="leaf"
              size="lg"
              onPress={checkSpelling}
              disabled={!canCheck}
              icon={<Ionicons name="checkmark-circle" size={24} color={colors.white} />}
              style={styles.checkBtn}
            />
          </View>

          <View style={styles.footer}>
            <NavButton icon="grid" label="Modes" onPress={() => navigation.goBack()} />
            <NavButton icon="settings-sharp" onPress={() => navigation.navigate('Settings')} accessibilityLabel="Settings" />
            <NavButton icon="trophy" label="My Hive" onPress={openHive} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 72,
  },
  cardWrap: {
    marginHorizontal: 16,
    shadowColor: colors.honeyDeep,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardWrapCorrect: {
    shadowColor: colors.leafDark,
    shadowOpacity: 0.3,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: colors.honey,
    borderBottomWidth: 7,
    borderBottomColor: colors.honeyDark,
    overflow: 'hidden',
  },
  cardListen: {
    borderColor: colors.skyDeep,
    borderBottomColor: colors.skyNight,
  },
  cardCorrect: {
    borderColor: colors.leaf,
    borderBottomColor: colors.leafDark,
  },
  drip: {
    position: 'absolute',
    top: -1,
    left: 14,
    right: 14,
    width: undefined,
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.honey,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  roundBadgeListen: {
    backgroundColor: colors.skyDeep,
    borderColor: colors.skyNight,
  },
  roundBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    color: colors.white,
  },
  roundTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.chocolate,
  },
  unitPill: {
    alignSelf: 'center',
  },
  imagePlate: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: colors.creamSoft,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    gap: 8,
  },
  imagePlateListen: {
    backgroundColor: colors.sky,
    borderColor: colors.skyDeep,
    paddingVertical: 16,
  },
  spellBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
    borderTopWidth: 2,
    borderTopColor: colors.honeyLight,
  },
  spellLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 11,
    color: colors.honeyDark,
    textAlign: 'center',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  targetWord: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.chocolate,
    letterSpacing: 2,
    textAlign: 'center',
  },
  hearBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hearBtnPressed: {
    transform: [{ scale: 0.95 }],
  },
  hearBtnSpeaking: {
    opacity: 0.85,
  },
  hearRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.skyDeep,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.skyNight,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  hearLabel: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.skyNight,
    textAlign: 'center',
  },
  hiddenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hiddenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.skyDeep,
  },
  hiddenHint: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.skyNight,
    marginLeft: 4,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
  },
  feedbackBannerGood: {
    backgroundColor: colors.leafLight,
    borderColor: colors.leaf,
  },
  feedbackBannerBad: {
    backgroundColor: colors.coralLight,
    borderColor: colors.coral,
  },
  feedbackEmoji: {
    fontSize: 18,
  },
  feedbackGood: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.leafDark,
  },
  feedbackBad: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.coralDark,
  },
  feedbackIdle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 4,
  },
  keyboardArea: {
    marginTop: 14,
    paddingHorizontal: 8,
    gap: 12,
    alignItems: 'center',
  },
  checkBtn: {
    minWidth: 200,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
  },
});
