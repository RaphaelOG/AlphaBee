import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { WordCue } from '../data/wordCues';

type WordMeaningCueProps = {
  cue: WordCue;
  /** When true, show a larger picture for younger grades */
  emphasizePicture?: boolean;
};

/** Round 1 picture + meaning so kids know the word before spelling. */
export function WordMeaningCue({ cue, emphasizePicture = true }: WordMeaningCueProps) {
  return (
    <View style={styles.wrap} accessible accessibilityLabel={cue.meaning}>
      <View style={[styles.picturePlate, emphasizePicture && styles.picturePlateLarge]}>
        <Text style={[styles.picture, emphasizePicture && styles.pictureLarge]}>{cue.picture}</Text>
      </View>
      <View style={styles.meaningBlock}>
        <Text style={styles.meaningLabel}>What it means</Text>
        <Text style={styles.meaning}>{cue.meaning}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  picturePlate: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picturePlateLarge: {
    width: 88,
    height: 88,
    borderRadius: 24,
  },
  picture: {
    fontSize: 38,
    textAlign: 'center',
  },
  pictureLarge: {
    fontSize: 48,
  },
  meaningBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  meaningLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: colors.honeyDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  meaning: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});
