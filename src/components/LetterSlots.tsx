import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { HexLetter } from './Hexagon';

type LetterSlotsProps = {
  length: number;
  letters: string[];
  feedback?: 'idle' | 'correct' | 'incorrect';
};

export function LetterSlots({ length, letters, feedback = 'idle' }: LetterSlotsProps) {
  const shake = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (feedback === 'incorrect') {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
    if (feedback === 'correct') {
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [feedback, shake, flash]);

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  const slots = Array.from({ length }, (_, i) => {
    const letter = letters[i];
    let state: 'empty' | 'filled' | 'correct' | 'incorrect' = letter ? 'filled' : 'empty';
    if (feedback === 'correct' && letter) state = 'correct';
    if (feedback === 'incorrect' && letter) state = 'incorrect';
    return <HexLetter key={i} letter={letter} state={state} size={48} />;
  });

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
      <Animated.View style={{ opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] }) }}>
        <View style={styles.inner}>{slots}</View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    maxWidth: 340,
  },
});
