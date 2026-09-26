import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { colors } from '../theme';

export type BeeMood = 'neutral' | 'happy' | 'excited' | 'thinking' | 'sleepy';

type AlphaBeeProps = {
  size?: number;
  /** Shorthand for mood="happy" (kept for existing call sites) */
  happy?: boolean;
  mood?: BeeMood;
  flipping?: boolean;
  /** Turn off idle bob (useful when parent already animates) */
  still?: boolean;
  style?: StyleProp<ViewStyle>;
};

let gradientCounter = 0;

export function AlphaBee({ size = 64, happy = false, mood, flipping = false, still = false, style }: AlphaBeeProps) {
  const wing = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const ids = useRef({
    body: `bee-body-${gradientCounter++}`,
    head: `bee-head-${gradientCounter++}`,
    wing: `bee-wing-${gradientCounter++}`,
  }).current;

  const resolvedMood: BeeMood = mood ?? (happy ? 'happy' : 'neutral');

  useEffect(() => {
    const wingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wing, { toValue: 1, duration: 120, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(wing, { toValue: 0, duration: 120, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
    );
    wingLoop.start();
    let bobLoop: Animated.CompositeAnimation | null = null;
    if (!still) {
      bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: 720, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(bob, { toValue: 0, duration: 720, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ]),
      );
      bobLoop.start();
    }
    return () => {
      wingLoop.stop();
      bobLoop?.stop();
    };
  }, [wing, bob, still]);

  useEffect(() => {
    if (!flipping) return;
    flip.setValue(0);
    Animated.timing(flip, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [flipping, flip]);

  const wingRotate = wing.interpolate({ inputRange: [0, 1], outputRange: ['-22deg', '20deg'] });
  const wingRotate2 = wing.interpolate({ inputRange: [0, 1], outputRange: ['22deg', '-20deg'] });
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const rotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const s = size;

  return (
    <Animated.View
      style={[{ width: s, height: s * 0.9 }, { transform: [{ translateY }, { rotate }] }, style]}
    >
      <View style={styles.stage}>
        {/* Wings (behind body) */}
        <Animated.View style={[styles.wingLeft, { transform: [{ rotate: wingRotate }] }]}>
          <Svg width={s * 0.46} height={s * 0.34} viewBox="0 0 46 34">
            <Defs>
              <LinearGradient id={`${ids.wing}-l`} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
                <Stop offset="1" stopColor={colors.wingEdge} stopOpacity={0.85} />
              </LinearGradient>
            </Defs>
            <Ellipse cx={23} cy={17} rx={21} ry={13} fill={`url(#${ids.wing}-l)`} stroke={colors.skyDeep} strokeWidth={1.6} />
            <Path d="M8 17 Q23 12 38 17" stroke={colors.skyDeep} strokeWidth={1} fill="none" opacity={0.6} />
            <Path d="M14 10 Q23 17 30 24" stroke={colors.skyDeep} strokeWidth={1} fill="none" opacity={0.5} />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.wingRight, { transform: [{ rotate: wingRotate2 }] }]}>
          <Svg width={s * 0.46} height={s * 0.34} viewBox="0 0 46 34">
            <Defs>
              <LinearGradient id={`${ids.wing}-r`} x1="1" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
                <Stop offset="1" stopColor={colors.wingEdge} stopOpacity={0.85} />
              </LinearGradient>
            </Defs>
            <Ellipse cx={23} cy={17} rx={21} ry={13} fill={`url(#${ids.wing}-r)`} stroke={colors.skyDeep} strokeWidth={1.6} />
            <Path d="M8 17 Q23 12 38 17" stroke={colors.skyDeep} strokeWidth={1} fill="none" opacity={0.6} />
            <Path d="M32 10 Q23 17 16 24" stroke={colors.skyDeep} strokeWidth={1} fill="none" opacity={0.5} />
          </Svg>
        </Animated.View>

        <Svg width={s} height={s * 0.9} viewBox="0 0 84 76">
          <Defs>
            <LinearGradient id={ids.body} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.goldBright} />
              <Stop offset="1" stopColor={colors.honey} />
            </LinearGradient>
            <RadialGradient id={ids.head} cx="40%" cy="35%" r="70%">
              <Stop offset="0" stopColor="#FFF0A6" />
              <Stop offset="1" stopColor={colors.gold} />
            </RadialGradient>
          </Defs>
          <G>
            {/* Stinger */}
            <Path d="M14 42 L4 40 L14 36 Z" fill={colors.beeBody} />

            {/* Body */}
            <Ellipse cx={40} cy={42} rx={24} ry={17} fill={`url(#${ids.body})`} stroke={colors.honeyDark} strokeWidth={2.4} />
            {/* Stripes */}
            <Path d="M26 27.5 Q24 42 26 56.5" stroke={colors.beeBody} strokeWidth={5} strokeLinecap="round" fill="none" />
            <Path d="M38 25.5 Q37 42 38 58.5" stroke={colors.beeBody} strokeWidth={5.5} strokeLinecap="round" fill="none" />
            <Path d="M50 27 Q50 42 50 57" stroke={colors.beeBody} strokeWidth={5} strokeLinecap="round" fill="none" />
            {/* Body shine */}
            <Ellipse cx={32} cy={31} rx={6} ry={3} fill="rgba(255,255,255,0.45)" />

            {/* Head */}
            <Circle cx={62} cy={30} r={15} fill={`url(#${ids.head})`} stroke={colors.honeyDark} strokeWidth={2.4} />
            <Ellipse cx={56} cy={22} rx={4.5} ry={2.5} fill="rgba(255,255,255,0.55)" />

            {/* Antennae */}
            <Path d="M68 17 Q71 8 76 10" stroke={colors.beeBody} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d="M60 16 Q58 7 53 9" stroke={colors.beeBody} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Circle cx={76} cy={10} r={3} fill={colors.goldBright} stroke={colors.beeBody} strokeWidth={1.4} />
            <Circle cx={53} cy={9} r={3} fill={colors.goldBright} stroke={colors.beeBody} strokeWidth={1.4} />

            {/* Cheeks */}
            <Ellipse cx={53.5} cy={35} rx={3.4} ry={2.2} fill={colors.cheek} opacity={0.85} />
            <Ellipse cx={71} cy={35} rx={3.4} ry={2.2} fill={colors.cheek} opacity={0.85} />

            {/* Eyes */}
            {resolvedMood === 'sleepy' ? (
              <>
                <Path d="M54 29 Q57 32 60 29" stroke={colors.beeBody} strokeWidth={2.2} fill="none" strokeLinecap="round" />
                <Path d="M64 29 Q67 32 70 29" stroke={colors.beeBody} strokeWidth={2.2} fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <Circle cx={57} cy={28.5} r={resolvedMood === 'excited' ? 4.4 : 3.8} fill={colors.beeBody} />
                <Circle cx={67} cy={28.5} r={resolvedMood === 'excited' ? 4.4 : 3.8} fill={colors.beeBody} />
                <Circle cx={58.3} cy={27} r={1.5} fill="#FFFFFF" />
                <Circle cx={68.3} cy={27} r={1.5} fill="#FFFFFF" />
                {resolvedMood === 'thinking' ? (
                  <Path d="M52.5 22.5 L60 24.5" stroke={colors.beeBody} strokeWidth={1.8} strokeLinecap="round" />
                ) : null}
              </>
            )}

            {/* Mouth */}
            {resolvedMood === 'excited' ? (
              <Path d="M56 36 Q62 44 68 36 Z" fill={colors.coralDark} stroke={colors.beeBody} strokeWidth={1.6} strokeLinejoin="round" />
            ) : resolvedMood === 'happy' ? (
              <Path d="M56.5 36 Q62 41.5 67.5 36" stroke={colors.beeBody} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            ) : resolvedMood === 'thinking' ? (
              <Path d="M58 38 Q62 37 65.5 39" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
            ) : resolvedMood === 'sleepy' ? (
              <Circle cx={62} cy={38} r={1.8} fill={colors.beeBody} />
            ) : (
              <Path d="M58 37 Q62 39.5 66 37" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
            )}

            {/* Legs */}
            <Path d="M30 57 Q28 63 24 65" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d="M40 59 Q40 65 37 67" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d="M50 57 Q52 63 56 65" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
          </G>
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wingLeft: {
    position: 'absolute',
    left: '10%',
    top: '2%',
    zIndex: 2,
  },
  wingRight: {
    position: 'absolute',
    right: '14%',
    top: '2%',
    zIndex: 2,
  },
});
