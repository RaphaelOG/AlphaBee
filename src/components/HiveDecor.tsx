import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon } from 'react-native-svg';
import { colors } from '../theme';

type BeehiveProps = {
  size?: number;
  /** Show a little branch it hangs from */
  branch?: boolean;
};

/** Classic striped skep beehive with a door and dripping honey. */
export function Beehive({ size = 120, branch = true }: BeehiveProps) {
  const w = size;
  const h = size * 1.15;
  return (
    <View style={{ width: w, height: h }} pointerEvents="none">
      <Svg width={w} height={h} viewBox="0 0 100 115">
        {branch ? (
          <>
            <Path d="M-4 8 Q30 2 60 6 T108 4" stroke="#8B5A2B" strokeWidth={6} strokeLinecap="round" fill="none" />
            <Path d="M50 8 L50 20" stroke="#8B5A2B" strokeWidth={4} strokeLinecap="round" />
            <Ellipse cx={22} cy={4} rx={9} ry={5} fill={colors.leaf} stroke={colors.leafDark} strokeWidth={1.5} />
            <Ellipse cx={80} cy={3} rx={8} ry={4.5} fill={colors.leaf} stroke={colors.leafDark} strokeWidth={1.5} />
          </>
        ) : null}
        {/* Hive tiers (bottom to top) */}
        <Ellipse cx={50} cy={96} rx={40} ry={13} fill={colors.honey} stroke={colors.honeyDeep} strokeWidth={2.5} />
        <Ellipse cx={50} cy={80} rx={42} ry={14} fill={colors.gold} stroke={colors.honeyDeep} strokeWidth={2.5} />
        <Ellipse cx={50} cy={64} rx={38} ry={13} fill={colors.honey} stroke={colors.honeyDeep} strokeWidth={2.5} />
        <Ellipse cx={50} cy={49} rx={32} ry={12} fill={colors.gold} stroke={colors.honeyDeep} strokeWidth={2.5} />
        <Ellipse cx={50} cy={36} rx={23} ry={10} fill={colors.honey} stroke={colors.honeyDeep} strokeWidth={2.5} />
        <Ellipse cx={50} cy={26} rx={12} ry={7} fill={colors.gold} stroke={colors.honeyDeep} strokeWidth={2.5} />
        {/* Shine */}
        <Ellipse cx={36} cy={46} rx={5} ry={2.4} fill="rgba(255,255,255,0.5)" />
        <Ellipse cx={34} cy={76} rx={6} ry={2.6} fill="rgba(255,255,255,0.45)" />
        {/* Door */}
        <Path d="M40 100 Q40 82 50 82 Q60 82 60 100 Z" fill={colors.chocolate} stroke={colors.honeyDeep} strokeWidth={2} />
        {/* Honey drips */}
        <Path d="M22 68 Q22 78 26 80 Q30 78 30 68 Z" fill={colors.goldBright} stroke={colors.honeyDark} strokeWidth={1.5} />
        <Path d="M70 84 Q70 96 74 97 Q78 95 78 84 Z" fill={colors.goldBright} stroke={colors.honeyDark} strokeWidth={1.5} />
        <Circle cx={26} cy={81} r={2.2} fill={colors.goldBright} stroke={colors.honeyDark} strokeWidth={1.2} />
      </Svg>
    </View>
  );
}

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

const STAR_SLOTS = [
  { left: 6, top: 30 },
  { right: 4, top: 46 },
  { left: 18, top: 120 },
  { right: 14, top: 128 },
  { left: 2, top: 78 },
  { right: 0, top: 88 },
];
const BEE_SLOTS = [
  { left: 30, bottom: 18, flip: false },
  { right: 26, bottom: 34, flip: true },
  { left: 8, bottom: 62, flip: false },
  { right: 6, bottom: 74, flip: true },
];

/** The learner's hive: skep beehive with stars and worker bees that appear as totals grow. */
export function CollectibleHive({ honeyDrops, stars, bees }: CollectibleHiveProps) {
  const dripLevel = Math.min(1, honeyDrops / 40);
  return (
    <View style={styles.scene}>
      <Beehive size={168} />
      <View style={styles.overlays} pointerEvents="none">
        {/* Honey puddle grows with honey */}
        <View
          style={[
            styles.puddle,
            { width: 90 + dripLevel * 90, opacity: honeyDrops > 0 ? 0.9 : 0.35 },
          ]}
        />
        {STAR_SLOTS.slice(0, Math.min(stars, STAR_SLOTS.length)).map((slot, i) => (
          <Text key={`s-${i}`} style={[styles.starEmoji, slot, i % 2 ? styles.starSmall : null]}>
            ⭐
          </Text>
        ))}
        {BEE_SLOTS.slice(0, Math.min(bees, BEE_SLOTS.length)).map((slot, i) => (
          <Text
            key={`b-${i}`}
            style={[
              styles.beeEmoji,
              { left: slot.left, right: slot.right, bottom: slot.bottom },
              slot.flip && styles.beeFlip,
            ]}
          >
            🐝
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: 240,
    height: 215,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  overlays: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  puddle: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.goldBright,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  starEmoji: {
    position: 'absolute',
    fontSize: 20,
  },
  starSmall: {
    fontSize: 15,
  },
  beeEmoji: {
    position: 'absolute',
    fontSize: 22,
  },
  beeFlip: {
    transform: [{ scaleX: -1 }],
  },
});
