import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { GameHeader } from '../components/GameHeader';
import { LetterSlots } from '../components/LetterSlots';
import { HexKeyboard } from '../components/HexKeyboard';
import { AlphaBee } from '../components/AlphaBee';
import { SessionProgress } from '../components/SessionProgress';
import { WordMeaningCue } from '../components/WordMeaningCue';
import { useAudio } from '../audio';
import { colors, typography } from '../theme';
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

  return (
    <LinearGradient colors={[colors.creamSoft, colors.skyTop, colors.cream]} style={styles.fill}>
      <StatusBar style="dark" />
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
            grade={mode === 'quest' ? grade : undefined}
            modeLabel={mode === 'quest' ? 'Grade Level Quest' : 'Practice Hive'}
            patternLabel={activeUnit?.focusLabel}
          />

          <SessionProgress completed={wordsCompleted} goal={wordGoal} questTitle={questTitle} />

          <View style={styles.card}>
            <View style={styles.cardHexEdge} />
            <AlphaBee size={48} happy={feedback === 'correct'} flipping={flipping} />

            {activeUnit ? (
              <View style={styles.unitBanner}>
                <Text style={styles.unitBannerTitle}>{activeUnit.title}</Text>
                <Text style={styles.unitBannerDesc} numberOfLines={2}>
                  {activeUnit.description}
                </Text>
              </View>
            ) : null}

            <View style={styles.phasePill}>
              <Text style={styles.phasePillText}>
                {isListen ? 'Round 2 · Listen & Spell' : 'Round 1 · Look & Spell'}
              </Text>
            </View>

            <Text style={styles.prompt}>
              {isListen ? 'Hear the word, then spell it' : 'Look, learn the meaning, then spell it'}
            </Text>

            <View style={[styles.imagePlate, isListen && styles.imagePlateListen]}>
              {isListen ? (
                <>
                  <Pressable
                    onPress={() => {
                      void playWord();
                    }}
                    hitSlop={16}
                    disabled={locked || isSpeaking}
                    style={[styles.hearBtn, isSpeaking && styles.hearBtnDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Hear the word again"
                    accessibilityState={{ disabled: locked || isSpeaking, busy: isSpeaking }}
                  >
                    <Text style={styles.hearIcon}>♪</Text>
                    <Text style={styles.hearLabel}>{isSpeaking ? 'Playing…' : 'Tap to hear'}</Text>
                  </Pressable>
                  <Text style={styles.hiddenHint}>{target.length} letters · meaning hidden</Text>
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
              <Text style={styles.feedbackGood}>
                {isListen ? 'Buzz-tastic! Word mastered' : 'Nice! Now spell it from memory'}
              </Text>
            ) : feedback === 'incorrect' ? (
              <Text style={styles.feedbackBad}>Almost — try again</Text>
            ) : (
              <Text style={styles.feedbackIdle}>
                {isListen
                  ? 'Listen carefully, then fill the slots'
                  : 'Use the picture and meaning — then fill the honeycomb'}
              </Text>
            )}
          </View>

          <View style={styles.keyboardArea}>
            <HexKeyboard onKey={onKey} onBackspace={onBackspace} disabled={locked} />
            <Pressable
              onPress={checkSpelling}
              style={[styles.checkBtn, input.length !== target.length && styles.checkDisabled]}
              disabled={input.length !== target.length || locked}
            >
              <Text style={styles.checkText}>Check</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Modes</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.footerLink}>Settings</Text>
            </Pressable>
            <Pressable onPress={openHive}>
              <Text style={styles.footerLink}>My Hive</Text>
            </Pressable>
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
    paddingBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 3,
    borderColor: colors.honey,
    shadowColor: colors.brown,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHexEdge: {
    position: 'absolute',
    top: -3,
    left: 28,
    right: 28,
    height: 6,
    backgroundColor: colors.gold,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  phasePill: {
    backgroundColor: colors.creamSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    alignSelf: 'center',
  },
  unitBanner: {
    width: '100%',
    backgroundColor: colors.creamSoft,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.honey,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  unitBannerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.honeyDark,
    textAlign: 'center',
  },
  unitBannerDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 15,
  },
  phasePillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.honeyDark,
    textAlign: 'center',
  },
  prompt: {
    ...typography.subtitle,
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  imagePlate: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: colors.creamSoft,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    gap: 8,
  },
  imagePlateListen: {
    backgroundColor: colors.goldBright,
    borderColor: colors.honeyDark,
    paddingVertical: 16,
  },
  spellBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: colors.honeyLight,
  },
  spellLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.honeyDark,
    textAlign: 'center',
    marginTop: 6,
  },
  targetWord: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: colors.honeyDark,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  hearBtn: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  hearBtnDisabled: {
    opacity: 0.45,
  },
  hearIcon: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: colors.honeyDark,
    textAlign: 'center',
  },
  hearLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  hiddenHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  feedbackGood: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.honeyDark,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  feedbackBad: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.softRed,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  feedbackIdle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 4,
  },
  keyboardArea: {
    marginTop: 12,
    paddingHorizontal: 8,
    gap: 8,
    alignItems: 'center',
  },
  checkBtn: {
    alignSelf: 'center',
    backgroundColor: colors.gold,
    borderRadius: 18,
    paddingHorizontal: 36,
    paddingVertical: 11,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  checkDisabled: {
    opacity: 0.4,
  },
  checkText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 10,
  },
  footerLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.honeyDark,
  },
});
