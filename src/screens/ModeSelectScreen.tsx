import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
    minHeight: '100%',
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
