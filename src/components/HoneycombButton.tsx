import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Hexagon } from './Hexagon';
import { colors, fonts, toyShadow } from '../theme';

type HoneycombButtonProps = {
  label: string;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  secondary?: boolean;
  /** Emoji or small element shown above the label */
  icon?: React.ReactNode;
};

/** Big hexagon action button with a solid 3D "toy block" base. */
export function HoneycombButton({
  label,
  onPress,
  size = 148,
  style,
  secondary = false,
  icon,
}: HoneycombButtonProps) {
  const depth = Math.max(6, size * 0.05);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.stack, { width: size, height: size + depth }]}>
        {/* Base / depth */}
        <View style={[styles.base, { top: depth }]}>
          <Hexagon
            size={size}
            fill={secondary ? colors.honey : colors.honeyDark}
            fillEnd={secondary ? colors.honeyDark : colors.honeyDeep}
            stroke={secondary ? colors.honeyDark : colors.honeyDeep}
            strokeWidth={3}
            rounded
            cornerRadius={size * 0.14}
          />
        </View>
        {/* Face */}
        <View style={styles.face}>
          <Hexagon
            size={size}
            fill={secondary ? colors.creamSoft : colors.goldBright}
            fillEnd={secondary ? colors.honeyLight : colors.gold}
            stroke={colors.honeyDark}
            strokeWidth={3}
            rounded
            cornerRadius={size * 0.14}
          >
            <View style={styles.inner}>
              <View style={[styles.shine, { width: size * 0.34, height: size * 0.11, top: -size * 0.28 }]} />
              {icon ? <View style={styles.icon}>{icon}</View> : null}
              <Text
                style={[
                  styles.label,
                  { color: secondary ? colors.honeyDark : colors.white, fontSize: size * 0.135 },
                ]}
                numberOfLines={2}
              >
                {label}
              </Text>
            </View>
          </Hexagon>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    ...toyShadow,
  },
  pressed: {
    transform: [{ translateY: 3 }, { scale: 0.98 }],
  },
  stack: {
    position: 'relative',
  },
  base: {
    position: 'absolute',
    left: 0,
  },
  face: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  inner: {
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shine: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontFamily: fonts.display,
    textAlign: 'center',
    lineHeight: undefined,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(120, 80, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
});
