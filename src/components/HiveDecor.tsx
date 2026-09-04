import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { colors } from '../theme';

type HiveStructureProps = {
  size?: number;
};

/** Decorative honeycomb cluster for landing / rewards. */
export function HiveStructure({ size = 140 }: HiveStructureProps) {
  const cell = size / 4.2;
  const h = cell * 0.866;
  const cells = [
    { x: cell * 1.5, y: 0 },
    { x: cell * 0.4, y: h * 0.75 },
    { x: cell * 2.6, y: h * 0.75 },
    { x: cell * 1.5, y: h * 1.5 },
    { x: cell * 0.4, y: h * 2.25 },
    { x: cell * 2.6, y: h * 2.25 },
    { x: cell * 1.5, y: h * 3 },
  ];

  const pointsFor = (ox: number, oy: number) => {
    const w = cell;
    const hh = h;
    return [
      `${ox + w * 0.25},${oy}`,
      `${ox + w * 0.75},${oy}`,
      `${ox + w},${oy + hh * 0.5}`,
      `${ox + w * 0.75},${oy + hh}`,
      `${ox + w * 0.25},${oy + hh}`,
      `${ox},${oy + hh * 0.5}`,
    ].join(' ');
  };

  return (
    <View style={{ width: size, height: size * 0.95 }}>
      <Svg width={size} height={size * 0.95}>
        {cells.map((c, i) => (
          <Polygon
            key={i}
            points={pointsFor(c.x, c.y)}
            fill={i % 2 === 0 ? colors.gold : colors.honey}
            stroke={colors.honeyDark}
            strokeWidth={2}
          />
        ))}
      </Svg>
    </View>
  );
}

type CollectibleHiveProps = {
  honeyDrops: number;
  stars: number;
  bees: number;
};

export function CollectibleHive({ honeyDrops, stars, bees }: CollectibleHiveProps) {
  return (
    <View style={styles.scene}>
      <HiveStructure size={200} />
      <View style={styles.overlays}>
        {Array.from({ length: Math.min(honeyDrops, 8) }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.drop,
              {
                left: 20 + (i % 4) * 42,
                top: 30 + Math.floor(i / 4) * 50,
              },
            ]}
          />
        ))}
        {Array.from({ length: Math.min(stars, 6) }).map((_, i) => (
          <View
            key={`s-${i}`}
            style={[
              styles.star,
              {
                right: 16 + (i % 3) * 36,
                top: 18 + Math.floor(i / 3) * 40,
              },
            ]}
          />
        ))}
        {Array.from({ length: Math.min(bees, 4) }).map((_, i) => (
          <View
            key={`b-${i}`}
            style={[
              styles.miniBee,
              {
                left: 40 + i * 38,
                bottom: 12 + (i % 2) * 18,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: 220,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlays: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  drop: {
    position: 'absolute',
    width: 14,
    height: 18,
    borderRadius: 8,
    backgroundColor: colors.goldBright,
    borderWidth: 1.5,
    borderColor: colors.honeyDark,
    transform: [{ rotate: '180deg' }],
  },
  star: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: colors.gold,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: colors.honeyDark,
  },
  miniBee: {
    position: 'absolute',
    width: 18,
    height: 12,
    borderRadius: 8,
    backgroundColor: colors.goldBright,
    borderWidth: 1.5,
    borderColor: colors.beeBody,
  },
});
