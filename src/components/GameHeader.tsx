import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { AlphaBee } from './AlphaBee';
import { colors, fonts } from '../theme';
import type { GradeLevel } from '../data/words';
import { gradeLabel } from '../data/words';

type GameHeaderProps = {
  honey: number;
  stars?: number;
  grade?: GradeLevel;
  modeLabel: string;
  /** Active phonics / sight-word pattern label */
  patternLabel?: string;
  mood?: 'neutral' | 'happy' | 'excited' | 'thinking';
};

function HoneyPot({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Ellipse cx={14} cy={20} rx={10} ry={7} fill={colors.honey} stroke={colors.honeyDeep} strokeWidth={1.8} />
      <Path d="M6 18 Q14 9 22 18" fill={colors.goldBright} stroke={colors.honeyDeep} strokeWidth={1.4} />
      <Ellipse cx={14} cy={11.5} rx={7} ry={3} fill={colors.gold} stroke={colors.honeyDeep} strokeWidth={1.2} />
      <Path d="M10 14 Q10 20 12 21 Q14 20 14 14 Z" fill={colors.goldBright} stroke={colors.honeyDark} strokeWidth={0.8} />
      <Ellipse cx={10} cy={20} rx={2} ry={1} fill="rgba(255,255,255,0.45)" />
    </Svg>
  );
}

function useBump(value: number) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [value, scale]);
  return scale;
}

export function GameHeader({ honey, stars = 0, grade, modeLabel, patternLabel, mood = 'neutral' }: GameHeaderProps) {
  const honeyScale = useBump(honey);
  const starScale = useBump(stars);

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        <Animated.View style={[styles.counter, styles.counterHoney, { transform: [{ scale: honeyScale }] }]}>
          <HoneyPot />
          <Text style={styles.counterText}>{honey}</Text>
        </Animated.View>
        <Animated.View style={[styles.counter, styles.counterStar, { transform: [{ scale: starScale }] }]}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={[styles.counterText, { color: colors.skyNight }]}>{stars}</Text>
        </Animated.View>
      </View>

      <View style={styles.center}>
        <AlphaBee size={44} mood={mood} />
        <Text style={styles.brand}>AlphaBee</Text>
        <Text style={styles.mode} numberOfLines={1}>
          {patternLabel ?? modeLabel}
        </Text>
      </View>

      <View style={[styles.side, styles.sideRight]}>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeEmoji}>🎒</Text>
          <Text style={styles.gradeText}>{grade ? gradeLabel(grade) : 'Custom'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  side: {
    width: 96,
    alignItems: 'flex-start',
    gap: 6,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.honeyDark,
    marginTop: -2,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 3,
    borderWidth: 2.5,
    borderBottomWidth: 4,
  },
  counterHoney: {
    borderColor: colors.honeyLight,
    borderBottomColor: colors.honey,
  },
  counterStar: {
    borderColor: colors.sky,
    borderBottomColor: colors.skyDeep,
    paddingLeft: 8,
  },
  counterText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.honeyDark,
  },
  starIcon: {
    fontSize: 15,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.leaf,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2.5,
    borderColor: colors.leafDark,
    borderBottomWidth: 4,
  },
  gradeEmoji: {
    fontSize: 13,
  },
  gradeText: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    color: colors.white,
  },
  mode: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
