import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { AlphaBee } from './AlphaBee';
import { colors, typography } from '../theme';
import type { GradeLevel } from '../data/words';
import { gradeLabel } from '../data/words';

type GameHeaderProps = {
  honey: number;
  grade?: GradeLevel;
  modeLabel: string;
};

export function GameHeader({ honey, grade, modeLabel }: GameHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        <View style={styles.honeyPot}>
          <Svg width={28} height={28} viewBox="0 0 28 28">
            <Ellipse cx={14} cy={20} rx={9} ry={6} fill={colors.honey} stroke={colors.honeyDark} strokeWidth={1.5} />
            <Path d="M7 18 Q14 10 21 18" fill={colors.goldBright} stroke={colors.honeyDark} strokeWidth={1.2} />
            <Ellipse cx={14} cy={12} rx={6} ry={2.5} fill={colors.gold} stroke={colors.honeyDark} strokeWidth={1} />
          </Svg>
          <Text style={styles.honeyCount}>{honey}</Text>
        </View>
        <Text style={styles.sideLabel}>Honey</Text>
      </View>

      <View style={styles.center}>
        <AlphaBee size={36} />
        <Text style={typography.brandSmall}>AlphaBee</Text>
        <Text style={styles.mode}>{modeLabel}</Text>
      </View>

      <View style={[styles.side, styles.sideRight]}>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>{grade ? gradeLabel(grade) : 'Custom'}</Text>
        </View>
        <Text style={styles.sideLabel}>Level</Text>
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
    paddingVertical: 8,
  },
  side: {
    width: 88,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    alignItems: 'center',
    gap: 2,
  },
  honeyPot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.honeyLight,
  },
  honeyCount: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.honeyDark,
  },
  sideLabel: {
    ...typography.label,
    marginTop: 4,
  },
  gradeBadge: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  gradeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.white,
  },
  mode: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
  },
});
