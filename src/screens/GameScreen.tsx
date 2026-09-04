import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { GameHeader } from '../components/GameHeader';
import { LetterSlots } from '../components/LetterSlots';
import { HexKeyboard } from '../components/HexKeyboard';
import { AlphaBee } from '../components/AlphaBee';
import { colors, typography } from '../theme';
import { getRandomWord } from '../data/words';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;
type SpellPhase = 'look' | 'listen';

function speakWord(word: string) {
  Speech.stop();
  Speech.speak(word, {
    language: 'en-US',
    rate: 0.85,
    pitch: 1.05,
  });
}

export function GameScreen({ navigation, route }: Props) {
  const { mode, grade = '1', customWords = [] } = route.params;

  const wordPool = useMemo(() => {
    if (mode === 'practice' && customWords.length > 0) return customWords;
    return null;
  }, [mode, customWords]);

  const pickWord = useCallback(
    (exclude?: string) => {
      if (wordPool) {
        const filtered = exclude ? wordPool.filter((w) => w !== exclude) : wordPool;
        const list = filtered.length > 0 ? filtered : wordPool;
        return list[Math.floor(Math.random() * list.length)];
      }
      return getRandomWord(grade, exclude);
    },
    [wordPool, grade],
  );

  const [target, setTarget] = useState(() => pickWord());
  const [phase, setPhase] = useState<SpellPhase>('look');
  const [input, setInput] = useState<string[]>([]);
  const [honey, setHoney] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [flipping, setFlipping] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'listen') return;
    const timer = setTimeout(() => speakWord(target), 350);
    return () => clearTimeout(timer);
  }, [phase, target]);

  const onKey = (letter: string) => {
    if (locked || input.length >= target.length) return;
    setFeedback('idle');
    setInput((prev) => [...prev, letter.toLowerCase()]);
  };

  const onBackspace = () => {
    if (locked) return;
    setFeedback('idle');
    setInput((prev) => prev.slice(0, -1));
  };

  const checkSpelling = async () => {
    if (locked || input.length !== target.length) return;
    setLocked(true);
    const guess = input.join('');
    if (guess === target) {
      setFeedback('correct');
      setFlipping(true);
      setHoney((h) => h + (phase === 'listen' ? 2 : 1));
      if (phase === 'listen') setStars((s) => s + 1);
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
          // Same word again — hide it and play audio
          setPhase('listen');
        } else {
          const next = pickWord(target);
          setTarget(next);
          setPhase('look');
        }
      }, 900);
    } else {
      setFeedback('incorrect');
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        /* web / unsupported */
      }
      setTimeout(() => {
        setInput([]);
        setFeedback('idle');
        setLocked(false);
        if (phase === 'listen') speakWord(target);
      }, 700);
    }
  };

  const openHive = () => {
    navigation.navigate('HiveRewards', { honey, stars });
  };

  const isListen = phase === 'listen';

  return (
    <LinearGradient colors={[colors.creamSoft, colors.skyTop, colors.cream]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <GameHeader
          honey={honey}
          grade={mode === 'quest' ? grade : undefined}
          modeLabel={mode === 'quest' ? 'Grade Level Quest' : 'Practice Hive'}
        />

        <View style={styles.card}>
          <View style={styles.cardHexEdge} />
          <AlphaBee size={56} happy={feedback === 'correct'} flipping={flipping} />

          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>
              {isListen ? 'Round 2 · Listen & Spell' : 'Round 1 · Look & Spell'}
            </Text>
          </View>

          <Text style={styles.prompt}>
            {isListen ? 'Hear the word, then spell it' : 'Look at the word, then spell it'}
          </Text>

          <View style={[styles.imagePlate, isListen && styles.imagePlateListen]}>
            {isListen ? (
              <>
                <Pressable
                  onPress={() => speakWord(target)}
                  style={styles.hearBtn}
                  accessibilityLabel="Hear the word again"
                >
                  <Text style={styles.hearIcon}>♪</Text>
                  <Text style={styles.hearLabel}>Tap to hear</Text>
                </Pressable>
                <Text style={styles.hiddenHint}>{target.length} letters</Text>
              </>
            ) : (
              <>
                <Text style={styles.imageLetter}>{target[0]?.toUpperCase()}</Text>
                <Text style={styles.targetWord}>{target}</Text>
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
              {isListen ? 'Listen carefully, then fill the slots' : 'Copy the letters into the honeycomb'}
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
          <Pressable onPress={openHive}>
            <Text style={styles.footerLink}>My Hive</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
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
  },
  phasePillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.honeyDark,
  },
  prompt: {
    ...typography.subtitle,
    marginTop: 4,
    textAlign: 'center',
  },
  imagePlate: {
    minWidth: 120,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: colors.creamSoft,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 4,
  },
  imagePlateListen: {
    backgroundColor: colors.goldBright,
    borderColor: colors.honeyDark,
    minWidth: 160,
  },
  imageLetter: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: colors.gold,
  },
  targetWord: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: colors.honeyDark,
    letterSpacing: 1,
  },
  hearBtn: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  hearIcon: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: colors.honeyDark,
  },
  hearLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text,
  },
  hiddenHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
  },
  feedbackGood: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.honeyDark,
    textAlign: 'center',
  },
  feedbackBad: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.softRed,
  },
  feedbackIdle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  keyboardArea: {
    marginTop: 12,
    paddingHorizontal: 8,
    gap: 10,
  },
  checkBtn: {
    alignSelf: 'center',
    backgroundColor: colors.gold,
    borderRadius: 18,
    paddingHorizontal: 36,
    paddingVertical: 12,
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
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  footerLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.honeyDark,
  },
});
