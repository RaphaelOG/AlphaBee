import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Polygon, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

type HexagonProps = {
  size?: number;
  fill?: string;
  fillEnd?: string;
  stroke?: string;
  strokeWidth?: number;
  /** Softens hex corners while keeping the honeycomb silhouette. */
  rounded?: boolean;
  /** Corner radius as a fraction of size (0–0.2). Used when rounded is true. */
  cornerRadius?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function flatTopVertices(width: number, height: number) {
  return [
    { x: width * 0.25, y: 0 },
    { x: width * 0.75, y: 0 },
    { x: width, y: height * 0.5 },
    { x: width * 0.75, y: height },
    { x: width * 0.25, y: height },
    { x: 0, y: height * 0.5 },
  ];
}

/** Build a flat-top hex path with quadratic rounded corners. */
function roundedHexPath(width: number, height: number, radius: number): string {
  const verts = flatTopVertices(width, height);
  const n = verts.length;
  const parts: string[] = [];

  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const curr = verts[i];
    const next = verts[(i + 1) % n];

    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    const toNext = { x: next.x - curr.x, y: next.y - curr.y };
    const lenPrev = Math.hypot(toPrev.x, toPrev.y) || 1;
    const lenNext = Math.hypot(toNext.x, toNext.y) || 1;
    const r = Math.min(radius, lenPrev * 0.45, lenNext * 0.45);

    const start = {
      x: curr.x + (toPrev.x / lenPrev) * r,
      y: curr.y + (toPrev.y / lenPrev) * r,
    };
    const end = {
      x: curr.x + (toNext.x / lenNext) * r,
      y: curr.y + (toNext.y / lenNext) * r,
    };

    if (i === 0) {
      parts.push(`M ${start.x} ${start.y}`);
    } else {
      parts.push(`L ${start.x} ${start.y}`);
    }
    parts.push(`Q ${curr.x} ${curr.y} ${end.x} ${end.y}`);
  }

  parts.push('Z');
  return parts.join(' ');
}

/** Flat-top hexagon with optional gradient and centered children. */
export function Hexagon({
  size = 56,
  fill = colors.gold,
  fillEnd,
  stroke = colors.honeyDark,
  strokeWidth = 2.5,
  rounded = false,
  cornerRadius,
  children,
  style,
}: HexagonProps) {
  const width = size;
  const height = size * 0.866;
  const verts = flatTopVertices(width, height);
  const points = verts.map((v) => `${v.x},${v.y}`).join(' ');
  const radius = cornerRadius ?? size * 0.12;
  const pathD = useMemo(
    () => (rounded ? roundedHexPath(width, height, radius) : ''),
    [rounded, width, height, radius],
  );

  const gradientId = `hex-${size}-${fill.replace('#', '')}-${rounded ? 'r' : 's'}`;

  return (
    <View style={[{ width, height }, styles.wrap, style]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {fillEnd ? (
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={fill} />
              <Stop offset="1" stopColor={fillEnd} />
            </LinearGradient>
          </Defs>
        ) : null}
        {rounded ? (
          <Path
            d={pathD}
            fill={fillEnd ? `url(#${gradientId})` : fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : (
          <Polygon
            points={points}
            fill={fillEnd ? `url(#${gradientId})` : fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        )}
      </Svg>
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

export function HexLetter({
  letter,
  size = 52,
  state = 'empty',
}: {
  letter?: string;
  size?: number;
  state?: 'empty' | 'filled' | 'correct' | 'incorrect';
}) {
  const palette = {
    empty: { fill: colors.creamSoft, fillEnd: colors.cream, stroke: colors.honey },
    filled: { fill: colors.goldBright, fillEnd: colors.gold, stroke: colors.honeyDark },
    correct: { fill: colors.successGlow, fillEnd: colors.goldBright, stroke: colors.honeyDark },
    incorrect: { fill: colors.offWhite, fillEnd: colors.cream, stroke: colors.softRedOutline },
  }[state];

  return (
    <Hexagon size={size} rounded cornerRadius={size * 0.1} {...palette}>
      <Text
        style={[
          styles.letter,
          { fontSize: size * 0.38, color: state === 'incorrect' ? colors.softRed : colors.text },
        ]}
      >
        {letter?.toUpperCase() ?? ''}
      </Text>
    </Hexagon>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: 'Nunito_800ExtraBold',
    textAlign: 'center',
  },
});
