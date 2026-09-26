import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, toyShadow } from '../theme';

/* -------------------------------------------------------------------------- */
/*  Honey drip — a wavy dripping edge to hang off the top of cards            */
/* -------------------------------------------------------------------------- */

type HoneyDripProps = {
  width?: number | `${number}%`;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function HoneyDrip({ width = '100%', height = 22, color = colors.gold, style }: HoneyDripProps) {
  return (
    <View style={[{ width, height }, style]} pointerEvents="none">
      <Svg width="100%" height={height} viewBox="0 0 320 32" preserveAspectRatio="none">
        <Path
          d="M0 0 H320 V6
             C300 6 296 22 284 22 C272 22 270 6 258 6
             C246 6 244 18 232 18 C220 18 218 6 206 6
             C194 6 192 26 178 26 C164 26 162 6 150 6
             C138 6 136 16 124 16 C112 16 110 6 98 6
             C86 6 84 24 70 24 C56 24 54 6 42 6
             C30 6 28 14 16 14 C8 14 4 6 0 6 Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  KidCard — chunky white card with a solid "toy block" bottom edge          */
/* -------------------------------------------------------------------------- */

export type KidTone = 'honey' | 'leaf' | 'sky' | 'coral' | 'berry' | 'cream';

const TONES: Record<KidTone, { border: string; edge: string; tint: string; text: string }> = {
  honey: { border: colors.honey, edge: colors.honeyDark, tint: colors.sunny, text: colors.honeyDark },
  leaf: { border: colors.leaf, edge: colors.leafDark, tint: colors.leafLight, text: colors.leafDark },
  sky: { border: colors.skyDeep, edge: colors.skyNight, tint: colors.sky, text: colors.skyNight },
  coral: { border: colors.coral, edge: colors.coralDark, tint: colors.coralLight, text: colors.coralDark },
  berry: { border: colors.berry, edge: colors.berryDark, tint: colors.berryLight, text: colors.berryDark },
  cream: { border: colors.honeyLight, edge: colors.honey, tint: colors.creamSoft, text: colors.honeyDark },
};

export function toneColors(tone: KidTone) {
  return TONES[tone];
}

type KidCardProps = {
  children: React.ReactNode;
  tone?: KidTone;
  /** Show a honey drip hanging from the top edge */
  drip?: boolean;
  /** Fill the card with the tone tint instead of white */
  tinted?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function KidCard({
  children,
  tone = 'honey',
  drip = false,
  tinted = false,
  style,
  contentStyle,
  onPress,
  selected = false,
  disabled = false,
}: KidCardProps) {
  const t = TONES[tone];
  const body = (
    <View
      style={[
        styles.card,
        {
          borderColor: selected ? t.edge : t.border,
          backgroundColor: tinted ? t.tint : colors.white,
          borderBottomColor: t.edge,
        },
        selected && styles.cardSelected,
        contentStyle,
      ]}
    >
      {drip ? <HoneyDrip color={t.border} style={styles.drip} /> : null}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.cardWrap, style, pressed && styles.pressedDown, disabled && styles.disabled]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.cardWrap, style]}>{body}</View>;
}

/* -------------------------------------------------------------------------- */
/*  ChunkyButton — big 3D pill button that presses down                       */
/* -------------------------------------------------------------------------- */

type ChunkyButtonProps = {
  label: string;
  onPress: () => void;
  tone?: KidTone;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const BUTTON_FILL: Record<KidTone, string> = {
  honey: colors.gold,
  leaf: colors.leaf,
  sky: colors.skyDeep,
  coral: colors.coral,
  berry: colors.berry,
  cream: colors.creamSoft,
};

export function ChunkyButton({
  label,
  onPress,
  tone = 'honey',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ChunkyButtonProps) {
  const t = TONES[tone];
  const fill = BUTTON_FILL[tone];
  const textColor = tone === 'cream' ? colors.honeyDark : colors.white;
  const dims = size === 'lg' ? styles.btnLg : size === 'sm' ? styles.btnSm : styles.btnMd;
  const font = size === 'lg' ? 24 : size === 'sm' ? 15 : 19;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btnOuter,
        fullWidth && styles.fullWidth,
        style,
        pressed && styles.pressedDown,
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.btn,
          dims,
          { backgroundColor: fill, borderColor: t.edge, borderBottomColor: t.edge },
          fullWidth && styles.fullWidth,
        ]}
      >
        <View style={styles.btnShine} />
        {icon ? <View style={styles.btnIcon}>{icon}</View> : null}
        <Text
          style={[styles.btnText, { color: textColor, fontSize: font }, textStyle]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {iconRight ? <View style={styles.btnIcon}>{iconRight}</View> : null}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sticker — a tilted round badge for emoji / short labels                   */
/* -------------------------------------------------------------------------- */

type StickerProps = {
  emoji?: string;
  label?: string;
  tone?: KidTone;
  size?: number;
  rotate?: number;
  style?: StyleProp<ViewStyle>;
};

export function Sticker({ emoji, label, tone = 'honey', size = 52, rotate = -8, style }: StickerProps) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.sticker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.tint,
          borderColor: t.border,
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      {emoji ? <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text> : null}
      {label ? (
        <Text style={[styles.stickerLabel, { color: t.text, fontSize: size * 0.34 }]}>{label}</Text>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  SpeechBubble — what AlphaBee says                                          */
/* -------------------------------------------------------------------------- */

type SpeechBubbleProps = {
  text: string;
  tail?: 'left' | 'right' | 'bottom';
  tone?: KidTone;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function SpeechBubble({ text, tail = 'left', tone = 'honey', style, textStyle }: SpeechBubbleProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.bubbleWrap, style]}>
      <View style={[styles.bubble, { borderColor: t.border }]}>
        <Text style={[styles.bubbleText, textStyle]}>{text}</Text>
      </View>
      <View
        style={[
          styles.tail,
          tail === 'left' && styles.tailLeft,
          tail === 'right' && styles.tailRight,
          tail === 'bottom' && styles.tailBottom,
          { borderColor: t.border },
        ]}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pill — small tinted label chip                                            */
/* -------------------------------------------------------------------------- */

type PillProps = {
  label: string;
  tone?: KidTone;
  emoji?: string;
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pill({ label, tone = 'honey', emoji, solid = false, style }: PillProps) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: solid ? BUTTON_FILL[tone] : t.tint,
          borderColor: solid ? t.edge : t.border,
        },
        style,
      ]}
    >
      {emoji ? <Text style={styles.pillEmoji}>{emoji}</Text> : null}
      <Text style={[styles.pillText, { color: solid ? colors.white : t.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: '100%',
    ...toyShadow,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 26,
    borderWidth: 3,
    borderBottomWidth: 7,
    padding: 16,
  },
  cardSelected: {
    borderWidth: 3.5,
  },
  drip: {
    position: 'absolute',
    top: -3,
    left: 18,
    right: 18,
    width: undefined,
    zIndex: 1,
  },
  pressedDown: {
    transform: [{ translateY: 3 }, { scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  btnOuter: {
    alignSelf: 'center',
    ...toyShadow,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 3,
    borderBottomWidth: 7,
    overflow: 'hidden',
    gap: 8,
  },
  btnSm: { paddingHorizontal: 18, paddingVertical: 9 },
  btnMd: { paddingHorizontal: 26, paddingVertical: 13 },
  btnLg: { paddingHorizontal: 34, paddingVertical: 17 },
  btnShine: {
    position: 'absolute',
    top: 4,
    left: 12,
    right: 12,
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  btnIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: fonts.display,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  sticker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...toyShadow,
    shadowOpacity: 0.12,
  },
  stickerLabel: {
    fontFamily: fonts.display,
  },
  bubbleWrap: {
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...toyShadow,
    shadowOpacity: 0.1,
  },
  bubbleText: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
    color: colors.chocolate,
    textAlign: 'center',
  },
  tail: {
    width: 14,
    height: 14,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    transform: [{ rotate: '45deg' }],
    marginTop: -9,
  },
  tailLeft: {
    alignSelf: 'flex-start',
    marginLeft: 22,
  },
  tailRight: {
    alignSelf: 'flex-end',
    marginRight: 22,
  },
  tailBottom: {
    alignSelf: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  pillEmoji: {
    fontSize: 13,
  },
  pillText: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
  },
});
