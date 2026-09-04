import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';
import { colors } from '../theme';

type AlphaBeeProps = {
  size?: number;
  happy?: boolean;
  flipping?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AlphaBee({ size = 64, happy = false, flipping = false, style }: AlphaBeeProps) {
  const wing = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const wingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wing, { toValue: 1, duration: 140, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(wing, { toValue: 0, duration: 140, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
    );
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bob, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
    );
    wingLoop.start();
    bobLoop.start();
    return () => {
      wingLoop.stop();
      bobLoop.stop();
    };
  }, [wing, bob]);

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

  const wingRotate = wing.interpolate({ inputRange: [0, 1], outputRange: ['-18deg', '22deg'] });
  const wingRotate2 = wing.interpolate({ inputRange: [0, 1], outputRange: ['18deg', '-22deg'] });
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const rotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const s = size;

  return (
    <Animated.View
      style={[
        { width: s, height: s * 0.85 },
        { transform: [{ translateY }, { rotate }] },
        style,
      ]}
    >
      <View style={styles.stage}>
        <Animated.View style={[styles.wingLeft, { transform: [{ rotate: wingRotate }] }]}>
          <Svg width={s * 0.42} height={s * 0.28}>
            <Ellipse cx={s * 0.21} cy={s * 0.14} rx={s * 0.2} ry={s * 0.12} fill={colors.wing} stroke="#E8E8E8" strokeWidth={1} />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.wingRight, { transform: [{ rotate: wingRotate2 }] }]}>
          <Svg width={s * 0.42} height={s * 0.28}>
            <Ellipse cx={s * 0.21} cy={s * 0.14} rx={s * 0.2} ry={s * 0.12} fill={colors.wing} stroke="#E8E8E8" strokeWidth={1} />
          </Svg>
        </Animated.View>

        <Svg width={s} height={s * 0.85} viewBox="0 0 80 68">
          <G>
            <Path d="M12 34 Q4 34 6 28" stroke={colors.beeBody} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Circle cx={5} cy={26} r={3} fill={colors.gold} stroke={colors.honeyDark} strokeWidth={1} />
            <Ellipse cx={40} cy={38} rx={22} ry={16} fill={colors.goldBright} stroke={colors.honeyDark} strokeWidth={2} />
            <Path d="M28 26 Q28 50 28 50" stroke={colors.beeBody} strokeWidth={3.5} strokeLinecap="round" />
            <Path d="M40 24 Q40 52 40 52" stroke={colors.beeBody} strokeWidth={3.5} strokeLinecap="round" />
            <Path d="M52 26 Q52 50 52 50" stroke={colors.beeBody} strokeWidth={3.5} strokeLinecap="round" />
            <Circle cx={58} cy={28} r={12} fill={colors.goldBright} stroke={colors.honeyDark} strokeWidth={2} />
            <Circle cx={54} cy={26} r={2.2} fill={colors.beeBody} />
            <Circle cx={62} cy={26} r={2.2} fill={colors.beeBody} />
            {happy ? (
              <Path d="M54 32 Q58 36 62 32" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
            ) : (
              <Path d="M55 33 Q58 35 61 33" stroke={colors.beeBody} strokeWidth={1.8} fill="none" strokeLinecap="round" />
            )}
            <Path d="M64 18 Q66 10 70 12" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d="M60 16 Q58 8 54 10" stroke={colors.beeBody} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Circle cx={70} cy={12} r={2} fill={colors.beeBody} />
            <Circle cx={54} cy={10} r={2} fill={colors.beeBody} />
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
    left: '8%',
    top: '8%',
    zIndex: 2,
  },
  wingRight: {
    position: 'absolute',
    right: '8%',
    top: '8%',
    zIndex: 2,
  },
});
