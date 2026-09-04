import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AlphaBee } from './AlphaBee';

const BEE_COUNT = 4;
const DEFAULT_RADIUS = 72;
const DEFAULT_SIZE = 56;

type BeeCircleProps = {
  radius?: number;
  beeSize?: number;
};

type BeeMotion = {
  bobMs: number;
  driftMs: number;
  wiggleMs: number;
  bobAmp: number;
  driftAmp: number;
  wiggleDeg: number;
  sizeScale: number;
  delay: number;
  happy: boolean;
};

const MOTIONS: BeeMotion[] = [
  { bobMs: 900, driftMs: 2200, wiggleMs: 1600, bobAmp: 10, driftAmp: 14, wiggleDeg: 12, sizeScale: 1, delay: 0, happy: true },
  { bobMs: 1200, driftMs: 1800, wiggleMs: 2100, bobAmp: 14, driftAmp: 10, wiggleDeg: 18, sizeScale: 0.88, delay: 180, happy: false },
  { bobMs: 750, driftMs: 2600, wiggleMs: 1400, bobAmp: 8, driftAmp: 16, wiggleDeg: 10, sizeScale: 1.08, delay: 320, happy: true },
  { bobMs: 1100, driftMs: 2000, wiggleMs: 1900, bobAmp: 12, driftAmp: 12, wiggleDeg: 15, sizeScale: 0.94, delay: 90, happy: false },
];

function useLoopOscillator(duration: number, delay: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(80 + (delay % 200)),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [value, duration, delay]);

  return value;
}

function OrbitBee({
  index,
  radius,
  beeSize,
  diameter,
  baseAngle,
}: {
  index: number;
  radius: number;
  beeSize: number;
  diameter: number;
  baseAngle: number;
}) {
  const motion = MOTIONS[index];
  const size = beeSize * motion.sizeScale;

  const bob = useLoopOscillator(motion.bobMs, motion.delay);
  const drift = useLoopOscillator(motion.driftMs, motion.delay + 40);
  const wiggle = useLoopOscillator(motion.wiggleMs, motion.delay + 110);
  const orbitPulse = useLoopOscillator(2800 + index * 350, motion.delay + 60);

  const baseX = radius * Math.cos(baseAngle) + diameter / 2 - size / 2;
  const baseY = radius * Math.sin(baseAngle) + diameter / 2 - (size * 0.85) / 2;

  const translateY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [-motion.bobAmp, motion.bobAmp],
  });
  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-motion.driftAmp, motion.driftAmp],
  });
  const rotate = wiggle.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${motion.wiggleDeg}deg`, `${motion.wiggleDeg}deg`],
  });

  // Push slightly in/out along the bee's radial direction for organic orbit feel
  const radialX = Math.cos(baseAngle);
  const radialY = Math.sin(baseAngle);
  const nudgeMin = -6 - index * 2;
  const nudgeMax = 8 + index;
  const radialNudgeX = orbitPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [nudgeMin * radialX, nudgeMax * radialX],
  });
  const radialNudgeY = orbitPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [nudgeMin * radialY, nudgeMax * radialY],
  });

  return (
    <Animated.View
      style={[
        styles.beeSlot,
        {
          left: baseX,
          top: baseY,
          width: size,
          height: size * 0.85,
          transform: [
            { translateX: Animated.add(translateX, radialNudgeX) },
            { translateY: Animated.add(translateY, radialNudgeY) },
            { rotate },
          ],
        },
      ]}
    >
      <AlphaBee size={size} happy={motion.happy} />
    </Animated.View>
  );
}

/** Four AlphaBees buzzing around a loose circle with independent motion. */
export function BeeCircle({ radius = DEFAULT_RADIUS, beeSize = DEFAULT_SIZE }: BeeCircleProps) {
  const swirl = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Irregular back-and-forth swirl instead of a steady spin
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(swirl, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(swirl, {
          toValue: -0.35,
          duration: 3100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swirl, {
          toValue: 0.7,
          duration: 3600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(swirl, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [swirl]);

  const ringRotate = swirl.interpolate({
    inputRange: [-0.35, 0, 0.7, 1],
    outputRange: ['-18deg', '0deg', '28deg', '42deg'],
  });

  const diameter = useMemo(() => radius * 2 + beeSize + 36, [radius, beeSize]);

  return (
    <View style={[styles.wrap, { width: diameter, height: diameter }]}>
      <Animated.View
        style={[styles.ring, { width: diameter, height: diameter, transform: [{ rotate: ringRotate }] }]}
      >
        {Array.from({ length: BEE_COUNT }).map((_, i) => {
          // Slightly uneven spacing so it doesn't look mechanical
          const spacingJitter = [-0.12, 0.08, -0.05, 0.1][i];
          const angle = (i / BEE_COUNT) * Math.PI * 2 - Math.PI / 2 + spacingJitter;
          return (
            <OrbitBee
              key={i}
              index={i}
              radius={radius + [-4, 8, -2, 6][i]}
              beeSize={beeSize}
              diameter={diameter}
              baseAngle={angle}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'relative',
  },
  beeSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
