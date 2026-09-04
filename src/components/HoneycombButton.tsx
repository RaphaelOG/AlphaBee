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
import { colors, typography } from '../theme';

type HoneycombButtonProps = {
  label: string;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  secondary?: boolean;
};

export function HoneycombButton({
  label,
  onPress,
  size = 148,
  style,
  secondary = false,
}: HoneycombButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
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
          <Text
            style={[
              typography.button,
              styles.label,
              { color: secondary ? colors.honeyDark : colors.white, fontSize: size * 0.13 },
            ]}
            numberOfLines={2}
          >
            {label}
          </Text>
        </View>
      </Hexagon>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  inner: {
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    textShadowColor: 'rgba(166, 124, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
});
