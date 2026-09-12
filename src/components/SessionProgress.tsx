import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type SessionProgressProps = {
  completed: number;
  goal: number;
  questTitle: string;
};

export function SessionProgress({ completed, goal, questTitle }: SessionProgressProps) {
  const ratio = goal > 0 ? Math.min(1, completed / goal) : 0;
  const remaining = Math.max(0, goal - completed);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.questTitle}>{questTitle}</Text>
        <Text style={styles.count}>
          {completed}/{goal}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.hint}>
        {remaining === 0 ? 'Quest complete!' : `${remaining} word${remaining === 1 ? '' : 's'} to go`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.honeyDark,
  },
  count: {
    fontFamily: 'Nunito_900Black',
    fontSize: 15,
    color: colors.text,
  },
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.creamSoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.honeyLight,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 6,
  },
  hint: {
    marginTop: 6,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
  },
});
