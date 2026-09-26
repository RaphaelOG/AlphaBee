import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, G } from 'react-native-svg';
import { colors } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*  HoneycombPattern — faint tiled hex wallpaper                              */
/* -------------------------------------------------------------------------- */

type HoneycombPatternProps = {
  cell?: number;
  opacity?: number;
  color?: string;
  rows?: number;
  style?: StyleProp<ViewStyle>;
};

export function HoneycombPattern({
  cell = 46,
  opacity = 0.12,
  color = colors.honey,
  rows = 14,
  style,
}: HoneycombPatternProps) {
  const w = cell;
  const h = cell * 0.866;
  const cols = Math.ceil(SCREEN_W / (w * 0.75)) + 2;
  const height = rows * h + h;

  const cells = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * w * 0.75 - w / 2;
        const y = r * h + (c % 2 === 1 ? h / 2 : 0);
        out.push({ x, y });
      }
    }
    return out;
  }, [rows, cols, w, h]);

  const points = (ox: number, oy: number) =>
    [
      `${ox + w * 0.25},${oy}`,
      `${ox + w * 0.75},${oy}`,
      `${ox + w},${oy + h * 0.5}`,
      `${ox + w * 0.75},${oy + h}`,
      `${ox + w * 0.25},${oy + h}`,
      `${ox},${oy + h * 0.5}`,
    ].join(' ');

  return (
    <View style={[StyleSheet.absoluteFill, { opacity }, style]} pointerEvents="none">
      <Svg width={SCREEN_W} height={height}>
        {cells.map((c, i) => (
          <Polygon key={i} points={points(c.x, c.y)} fill="none" stroke={color} strokeWidth={2} />
        ))}
      </Svg>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sun + clouds                                                              */
/* -------------------------------------------------------------------------- */

function Cloud({ size = 90, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const h = size * 0.55;
  return (
    <View style={[{ width: size, height: h }, style]} pointerEvents="none">
      <Svg width={size} height={h} viewBox="0 0 100 60">
        <Ellipse cx={30} cy={40} rx={26} ry={18} fill={colors.white} />
        <Ellipse cx={55} cy={30} rx={28} ry={22} fill={colors.white} />
        <Ellipse cx={78} cy={42} rx={20} ry={15} fill={colors.white} />
        <Ellipse cx={50} cy={46} rx={40} ry={12} fill={colors.white} />
      </Svg>
    </View>
  );
}

function Sun({ size = 96 }: { size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 26000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rays = Array.from({ length: 12 });
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G>
          {rays.map((_, i) => {
            const a = (i / rays.length) * Math.PI * 2;
            const x1 = 50 + Math.cos(a) * 34;
            const y1 = 50 + Math.sin(a) * 34;
            const x2 = 50 + Math.cos(a) * 48;
            const y2 = 50 + Math.sin(a) * 48;
            return (
              <Path
                key={i}
                d={`M${x1} ${y1} L${x2} ${y2}`}
                stroke={colors.goldBright}
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
          <Circle cx={50} cy={50} r={28} fill={colors.goldBright} stroke={colors.honey} strokeWidth={3} />
          <Circle cx={42} cy={44} r={5} fill="rgba(255,255,255,0.6)" />
        </G>
      </Svg>
    </Animated.View>
  );
}

function useDrift(duration: number, amplitude: number, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, delay]);
  return v.interpolate({ inputRange: [0, 1], outputRange: [-amplitude, amplitude] });
}

export function SkyScene({ sunSize = 96 }: { sunSize?: number }) {
  const c1 = useDrift(5200, 14);
  const c2 = useDrift(6800, 18, 600);
  const c3 = useDrift(4400, 10, 300);
  return (
    <View style={styles.sky} pointerEvents="none">
      <View style={styles.sun}>
        <Sun size={sunSize} />
      </View>
      <Animated.View style={[styles.cloud1, { transform: [{ translateX: c1 }] }]}>
        <Cloud size={110} />
      </Animated.View>
      <Animated.View style={[styles.cloud2, { transform: [{ translateX: c2 }] }]}>
        <Cloud size={80} />
      </Animated.View>
      <Animated.View style={[styles.cloud3, { transform: [{ translateX: c3 }] }]}>
        <Cloud size={64} />
      </Animated.View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Flower meadow — grass + friendly flowers along the bottom                 */
/* -------------------------------------------------------------------------- */

function Flower({
  size = 44,
  petal = colors.coral,
  center = colors.goldBright,
  style,
}: {
  size?: number;
  petal?: string;
  center?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const petals = Array.from({ length: 6 });
  return (
    <View style={[{ width: size, height: size * 1.5 }, style]} pointerEvents="none">
      <Svg width={size} height={size * 1.5} viewBox="0 0 60 90">
        <Path d="M30 88 Q31 60 30 44" stroke={colors.leafDark} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d="M30 70 Q16 66 14 56 Q28 58 30 70Z" fill={colors.leaf} stroke={colors.leafDark} strokeWidth={2} />
        <Path d="M30 78 Q44 74 46 64 Q32 66 30 78Z" fill={colors.leaf} stroke={colors.leafDark} strokeWidth={2} />
        {petals.map((_, i) => {
          const a = (i / petals.length) * Math.PI * 2;
          const cx = 30 + Math.cos(a) * 13;
          const cy = 28 + Math.sin(a) * 13;
          return <Circle key={i} cx={cx} cy={cy} r={10} fill={petal} stroke={colors.chocolate} strokeWidth={1.5} />;
        })}
        <Circle cx={30} cy={28} r={9} fill={center} stroke={colors.honeyDark} strokeWidth={2} />
        <Circle cx={27} cy={25} r={2.2} fill="rgba(255,255,255,0.7)" />
      </Svg>
    </View>
  );
}

export function FlowerMeadow({ height = 120 }: { height?: number }) {
  const sway1 = useDrift(2400, 3);
  const sway2 = useDrift(3000, 4, 400);
  const sway3 = useDrift(2700, 3, 800);
  return (
    <View style={[styles.meadow, { height }]} pointerEvents="none">
      <Svg width={SCREEN_W} height={height} viewBox={`0 0 ${SCREEN_W} ${height}`} preserveAspectRatio="none">
        <Path
          d={`M0 ${height * 0.55} Q${SCREEN_W * 0.25} ${height * 0.3} ${SCREEN_W * 0.5} ${height * 0.55} T${SCREEN_W} ${height * 0.5} V${height} H0 Z`}
          fill={colors.leaf}
        />
        <Path
          d={`M0 ${height * 0.72} Q${SCREEN_W * 0.3} ${height * 0.5} ${SCREEN_W * 0.6} ${height * 0.74} T${SCREEN_W} ${height * 0.66} V${height} H0 Z`}
          fill={colors.leafDark}
          opacity={0.85}
        />
      </Svg>
      <Animated.View style={[styles.flowerSlot, { left: '8%', bottom: height * 0.32, transform: [{ rotate: '-6deg' }, { translateX: sway1 }] }]}>
        <Flower size={40} petal={colors.coral} />
      </Animated.View>
      <Animated.View style={[styles.flowerSlot, { left: '26%', bottom: height * 0.26, transform: [{ rotate: '4deg' }, { translateX: sway2 }] }]}>
        <Flower size={30} petal={colors.berry} center={colors.sunny} />
      </Animated.View>
      <Animated.View style={[styles.flowerSlot, { right: '24%', bottom: height * 0.3, transform: [{ rotate: '-3deg' }, { translateX: sway3 }] }]}>
        <Flower size={34} petal={colors.skyDeep} />
      </Animated.View>
      <Animated.View style={[styles.flowerSlot, { right: '6%', bottom: height * 0.36, transform: [{ rotate: '7deg' }, { translateX: sway1 }] }]}>
        <Flower size={44} petal={colors.white} center={colors.gold} />
      </Animated.View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sparkles — twinkling stars scattered in a box                             */
/* -------------------------------------------------------------------------- */

type SparklesProps = {
  count?: number;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  seed?: number;
};

function Twinkle({ x, y, delay, color, size }: { x: number; y: number; delay: number; color: string; size: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(900),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.15] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        opacity: v,
        transform: [{ scale }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function Sparkles({ count = 8, color = colors.goldBright, size = 16, style, seed = 7 }: SparklesProps) {
  const points = useMemo(() => {
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => ({
      x: 4 + rand() * 88,
      y: 4 + rand() * 88,
      delay: Math.floor(rand() * 2200),
      scale: 0.7 + rand() * 0.7,
    }));
  }, [count, seed]);

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {points.map((p, i) => (
        <Twinkle key={i} x={p.x} y={p.y} delay={p.delay} color={color} size={size * p.scale} />
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Confetti burst — falling bits for celebration screens                     */
/* -------------------------------------------------------------------------- */

const CONFETTI_COLORS = [colors.gold, colors.coral, colors.skyDeep, colors.leaf, colors.berry, colors.goldBright];

function ConfettiPiece({ x, delay, color, shape }: { x: number; delay: number; color: string; shape: 'dot' | 'bar' }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 3200 + delay * 0.4, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-40, 620] });
  const translateX = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 18, -12] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });
  const opacity = v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: 0,
        width: shape === 'bar' ? 6 : 10,
        height: shape === 'bar' ? 16 : 10,
        borderRadius: shape === 'bar' ? 3 : 5,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

function PollenDot({ x, delay, size, color }: { x: number; delay: number; size: number; color: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, {
          toValue: 1,
          duration: 9000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [40, -520] });
  const translateX = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 16, -10] });
  const opacity = v.interpolate({ inputRange: [0, 0.12, 0.8, 1], outputRange: [0, 0.7, 0.55, 0] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: 80,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
}

/** Soft floating pollen motes so the garden feels alive. */
export function Pollen({ count = 10 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 29) % 94 + 3,
        delay: (i * 410) % 2400,
        size: 5 + (i % 3) * 2,
        color: [colors.goldBright, colors.sunny, colors.honeyLight, colors.white][i % 4],
      })),
    [count],
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((d, i) => (
        <PollenDot key={i} {...d} />
      ))}
    </View>
  );
}

export function Confetti({ count = 22 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 37) % 96 + 2,
        delay: (i * 173) % 1400,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: (i % 3 === 0 ? 'bar' : 'dot') as 'bar' | 'dot',
      })),
    [count],
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  sun: {
    position: 'absolute',
    top: 26,
    left: 18,
  },
  cloud1: {
    position: 'absolute',
    top: 54,
    right: -10,
  },
  cloud2: {
    position: 'absolute',
    top: 128,
    left: '30%',
    opacity: 0.9,
  },
  cloud3: {
    position: 'absolute',
    top: 12,
    left: '48%',
    opacity: 0.8,
  },
  meadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  flowerSlot: {
    position: 'absolute',
  },
});
