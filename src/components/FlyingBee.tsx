import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { AlphaBee } from './AlphaBee';
import { colors } from '../theme';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type TrailLetter = {
  id: number;
  char: string;
  x: number;
  y: number;
  opacity: Animated.Value;
};

type FlyingBeeProps = {
  hiveCorner?: 'topRight' | 'bottomRight';
};

/** Bee loops toward the hive, leaving ephemeral alphabet sparkles. */
export function FlyingBee({ hiveCorner = 'topRight' }: FlyingBeeProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const [trail, setTrail] = useState<TrailLetter[]>([]);
  const idRef = useRef(0);

  const path = useMemo(() => {
    const startX = -40;
    const startY = SCREEN_H * 0.45;
    const endX = hiveCorner === 'topRight' ? SCREEN_W - 90 : SCREEN_W - 100;
    const endY = hiveCorner === 'topRight' ? 70 : SCREEN_H * 0.18;
    return { startX, startY, endX, endY };
  }, [hiveCorner]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  useEffect(() => {
    const id = setInterval(() => {
      progress.stopAnimation((value) => {
        const x = path.startX + (path.endX - path.startX) * value;
        const y =
          path.startY +
          (path.endY - path.startY) * value +
          Math.sin(value * Math.PI * 2) * 28;
        const opacity = new Animated.Value(1);
        const item: TrailLetter = {
          id: idRef.current++,
          char: LETTERS[Math.floor(Math.random() * LETTERS.length)],
          x,
          y: y + 20,
          opacity,
        };
        setTrail((prev) => [...prev.slice(-14), item]);
        Animated.timing(opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setTrail((prev) => prev.filter((t) => t.id !== item.id));
          }
        });
      });
    }, 220);
    return () => clearInterval(id);
  }, [path, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [path.startX, path.endX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      path.startY,
      path.startY + (path.endY - path.startY) * 0.25 - 28,
      path.startY + (path.endY - path.startY) * 0.5 + 18,
      path.startY + (path.endY - path.startY) * 0.75 - 20,
      path.endY,
    ],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {trail.map((t) => (
        <Animated.Text
          key={t.id}
          style={[
            styles.trailLetter,
            {
              left: t.x,
              top: t.y,
              opacity: t.opacity,
            },
          ]}
        >
          {t.char}
        </Animated.Text>
      ))}
      <Animated.View style={{ transform: [{ translateX }, { translateY }] }}>
        <AlphaBee size={72} happy />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  trailLetter: {
    position: 'absolute',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.goldBright,
    textShadowColor: colors.honey,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
