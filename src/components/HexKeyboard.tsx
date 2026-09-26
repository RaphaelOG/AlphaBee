import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hexagon } from './Hexagon';
import { colors, fonts } from '../theme';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const KEY = 40;
const DEPTH = 3;

type HexKeyboardProps = {
  onKey: (letter: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
};

type KeyProps = {
  size: number;
  face: string;
  faceEnd: string;
  edge: string;
  stroke: string;
  children: React.ReactNode;
};

/** Hex key with a solid colored base so it looks like a chunky toy block. */
function ToyKey({ size, face, faceEnd, edge, stroke, children }: KeyProps) {
  const h = size * 0.866;
  return (
    <View style={{ width: size, height: h + DEPTH }}>
      <Hexagon size={size} fill={edge} fillEnd={edge} stroke={stroke} strokeWidth={2} style={{ position: 'absolute', top: DEPTH }} />
      <Hexagon size={size} fill={face} fillEnd={faceEnd} stroke={stroke} strokeWidth={2}>
        {children}
      </Hexagon>
    </View>
  );
}

export function HexKeyboard({ onKey, onBackspace, disabled }: HexKeyboardProps) {
  return (
    <View style={styles.wrap}>
      {ROWS.map((row, rowIndex) => (
        <View key={row} style={[styles.row, rowIndex === 1 && styles.rowInset, rowIndex === 2 && styles.rowInsetMore]}>
          {rowIndex === 2 ? <View style={styles.spacer} /> : null}
          {row.split('').map((letter) => {
            const vowel = VOWELS.has(letter);
            return (
              <Pressable
                key={letter}
                disabled={disabled}
                onPress={() => onKey(letter)}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed, disabled && styles.disabled]}
                accessibilityLabel={`Letter ${letter}`}
              >
                <ToyKey
                  size={KEY}
                  face={vowel ? colors.sunny : colors.white}
                  faceEnd={vowel ? colors.honeyLight : colors.creamSoft}
                  edge={vowel ? colors.honey : colors.honeyLight}
                  stroke={vowel ? colors.honeyDark : colors.honey}
                >
                  <Text style={[styles.keyText, vowel && styles.vowelText]}>{letter}</Text>
                </ToyKey>
              </Pressable>
            );
          })}
          {rowIndex === 2 ? (
            <Pressable
              disabled={disabled}
              onPress={onBackspace}
              style={({ pressed }) => [styles.key, styles.backspace, pressed && styles.keyPressed]}
              accessibilityLabel="Backspace"
            >
              <ToyKey
                size={50}
                face={colors.coral}
                faceEnd={colors.coralDark}
                edge={colors.coralDark}
                stroke={colors.coralDark}
              >
                <Ionicons name="backspace" size={20} color={colors.white} />
              </ToyKey>
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
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  rowInset: {
    paddingHorizontal: 6,
  },
  rowInsetMore: {
    paddingHorizontal: 16,
  },
  key: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    transform: [{ translateY: DEPTH }, { scale: 0.96 }],
  },
  disabled: {
    opacity: 0.5,
  },
  keyText: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.chocolate,
    marginTop: -DEPTH,
  },
  vowelText: {
    color: colors.honeyDeep,
  },
  backspace: {
    marginLeft: 4,
  },
  spacer: {
    width: 6,
  },
});
