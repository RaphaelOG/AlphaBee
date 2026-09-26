import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
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
      <View style={styles.frame}>
        <View style={styles.petal} />
        <View style={[styles.petal, styles.petal2]} />
        <View style={[styles.picturePlate, emphasizePicture && styles.picturePlateLarge]}>
          <Text style={[styles.picture, emphasizePicture && styles.pictureLarge]}>{cue.picture}</Text>
        </View>
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
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.goldBright,
    borderWidth: 2,
    borderColor: colors.honey,
    top: -6,
    left: -8,
    opacity: 0.85,
  },
  petal2: {
    top: -4,
    left: undefined,
    right: -8,
    backgroundColor: colors.sunny,
  },
  picturePlate: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.honey,
    borderBottomWidth: 6,
    borderBottomColor: colors.honeyDark,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  picturePlateLarge: {
    width: 96,
    height: 96,
    borderRadius: 26,
  },
  picture: {
    fontSize: 38,
    textAlign: 'center',
  },
  pictureLarge: {
    fontSize: 52,
  },
  meaningBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  meaningLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    color: colors.honeyDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  meaning: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});
