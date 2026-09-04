import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModeSwitcher } from '../components/ModeSwitcher';
import { PracticeHiveModal } from '../components/PracticeHiveModal';
import { HoneycombButton } from '../components/HoneycombButton';
import { Hexagon } from '../components/Hexagon';
import { colors } from '../theme';
import type { GradeLevel } from '../data/words';
import { gradeLabel } from '../data/words';
import type { GameMode, RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ModeSelect'>;

export function ModeSelectScreen({ navigation }: Props) {
  const [mode, setMode] = useState<GameMode>('quest');
  const [grade, setGrade] = useState<GradeLevel>('1');
  const [practiceOpen, setPracticeOpen] = useState(false);

  const startQuest = () => {
    navigation.navigate('Game', { mode: 'quest', grade });
  };

  const startPractice = (words: string[]) => {
    setPracticeOpen(false);
    navigation.navigate('Game', { mode: 'practice', customWords: words });
  };

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.skyBottom]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
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

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <ModeSwitcher
            mode={mode}
            grade={grade}
            onModeChange={setMode}
            onGradeChange={setGrade}
            onOpenPractice={() => setPracticeOpen(true)}
          />

          {mode === 'quest' ? (
            <View style={styles.playBlock}>
              <Text style={styles.readyText}>Ready for {gradeLabel(grade)}?</Text>
              <Text style={styles.readySub}>Two rounds per word — look first, then listen</Text>
              <HoneycombButton label="Play" size={132} onPress={startQuest} />
            </View>
          ) : null}
        </ScrollView>

        <PracticeHiveModal
          visible={practiceOpen}
          onClose={() => {
            setPracticeOpen(false);
            setMode('quest');
          }}
          onSave={startPractice}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
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
  },
  readySub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
