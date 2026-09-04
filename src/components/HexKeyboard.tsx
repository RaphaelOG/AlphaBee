import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Hexagon } from './Hexagon';
import { colors } from '../theme';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

type HexKeyboardProps = {
  onKey: (letter: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
};

export function HexKeyboard({ onKey, onBackspace, disabled }: HexKeyboardProps) {
  return (
    <View style={styles.wrap}>
      {ROWS.map((row, rowIndex) => (
        <View key={row} style={[styles.row, rowIndex === 1 && styles.rowInset, rowIndex === 2 && styles.rowInsetMore]}>
          {rowIndex === 2 ? (
            <View style={styles.spacer} />
          ) : null}
          {row.split('').map((letter) => (
            <Pressable
              key={letter}
              disabled={disabled}
              onPress={() => onKey(letter)}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed, disabled && styles.disabled]}
              accessibilityLabel={`Letter ${letter}`}
            >
              <Hexagon
                size={40}
                fill={colors.white}
                fillEnd={colors.creamSoft}
                stroke={colors.honey}
                strokeWidth={2}
              >
                <Text style={styles.keyText}>{letter}</Text>
              </Hexagon>
            </Pressable>
          ))}
          {rowIndex === 2 ? (
            <Pressable
              disabled={disabled}
              onPress={onBackspace}
              style={({ pressed }) => [styles.key, styles.backspace, pressed && styles.keyPressed]}
              accessibilityLabel="Backspace"
            >
              <Hexagon
                size={50}
                fill={colors.honeyLight}
                fillEnd={colors.gold}
                stroke={colors.honeyDark}
                strokeWidth={2}
              >
                <Text style={styles.backspaceText}>⌫</Text>
              </Hexagon>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 8,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  rowInset: {
    paddingHorizontal: 8,
  },
  rowInsetMore: {
    paddingHorizontal: 20,
  },
  key: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    transform: [{ scale: 0.92 }],
  },
  disabled: {
    opacity: 0.5,
  },
  keyText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text,
  },
  backspace: {
    marginLeft: 4,
  },
  backspaceText: {
    fontSize: 18,
    color: colors.honeyDark,
    fontFamily: 'Nunito_700Bold',
  },
  spacer: {
    width: 6,
  },
});
