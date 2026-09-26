import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type NavButtonProps = {
  icon: IconName;
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  emoji?: string;
  style?: StyleProp<ViewStyle>;
};

/** Round white "toy" nav button with an icon (and optional label). */
export function NavButton({ icon, label, onPress, accessibilityLabel, emoji, style }: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? icon}
      style={({ pressed }) => [styles.btn, label ? styles.btnWide : null, pressed && styles.pressed, style]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : <Ionicons name={icon} size={18} color={colors.honeyDark} />}
      {label ? (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

type TopNavProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

export function TopNav({ left, right, title, style }: TopNavProps) {
  return (
    <View style={[styles.bar, style]}>
      <View style={styles.side}>{left}</View>
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.chocolate,
  },
  btn: {
    height: 38,
    minWidth: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 4,
    borderBottomColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
  },
  btnWide: {
    paddingHorizontal: 12,
  },
  pressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.95,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    color: colors.honeyDark,
    maxWidth: 110,
  },
});
