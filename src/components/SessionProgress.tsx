import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type SessionProgressProps = {
  completed: number;
  goal: number;
  questTitle: string;
};

/** Honey-trail progress: a golden bar with one hex "cell" per word in the quest. */
export function SessionProgress({ completed, goal, questTitle }: SessionProgressProps) {
  const ratio = goal > 0 ? Math.min(1, completed / goal) : 0;
  const remaining = Math.max(0, goal - completed);
  const width = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: ratio,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, width]);

  const cells = Math.min(goal, 15);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Text style={styles.flag}>🚩</Text>
          <Text style={styles.questTitle} numberOfLines={1}>
            {questTitle}
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.count}>
            {completed}
            <Text style={styles.countGoal}>/{goal}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        >
          <View style={styles.fillShine} />
        </Animated.View>
        <View style={styles.cells} pointerEvents="none">
          {Array.from({ length: cells }).map((_, i) => (
            <View key={i} style={[styles.cellDivider, i === cells - 1 && styles.cellDividerLast]} />
          ))}
        </View>
        <Animated.View
          style={[
            styles.beeMarker,
            {
              left: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        >
          <Text style={styles.beeMarkerText}>🐝</Text>
        </Animated.View>
        <View style={styles.hiveGoal}>
          <Text style={styles.hiveGoalText}>🍯</Text>
        </View>
      </View>

      <Text style={styles.hint}>
        {remaining === 0
          ? 'Quest complete!'
          : remaining === 1
            ? 'One more word to reach the hive!'
            : `${remaining} words to the hive`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 5,
    borderBottomColor: colors.honey,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  flag: {
    fontSize: 13,
  },
  questTitle: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.chocolate,
  },
  countPill: {
    backgroundColor: colors.sunny,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.honey,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  count: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.honeyDark,
  },
  countGoal: {
    fontSize: 13,
    color: colors.textMuted,
  },
  track: {
    height: 18,
    borderRadius: 10,
    backgroundColor: colors.creamSoft,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    marginRight: 14,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.gold,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fillShine: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  cells: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  cellDivider: {
    flex: 1,
    borderRightWidth: 2,
    borderRightColor: 'rgba(198,134,10,0.25)',
  },
  cellDividerLast: {
    borderRightWidth: 0,
  },
  beeMarker: {
    position: 'absolute',
    top: -12,
    marginLeft: -12,
  },
  beeMarkerText: {
    fontSize: 20,
  },
  hiveGoal: {
    position: 'absolute',
    right: -16,
    top: -8,
  },
  hiveGoalText: {
    fontSize: 22,
  },
  hint: {
    marginTop: 8,
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
