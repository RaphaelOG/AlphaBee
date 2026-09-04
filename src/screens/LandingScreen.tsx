import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HiveStructure } from '../components/HiveDecor';
import { HoneycombButton } from '../components/HoneycombButton';
import { BeeCircle } from '../components/BeeCircle';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.skyBottom]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hiveCorner} pointerEvents="none">
          <HiveStructure size={130} />
        </View>

        <View style={styles.center}>
          <Text style={styles.brand}>AlphaBee</Text>
          <Text style={styles.tagline}>Spell, buzz, and build your hive</Text>
          <HoneycombButton
            label={'Start\nLearning'}
            size={168}
            onPress={() => navigation.navigate('ModeSelect')}
            style={styles.cta}
          />
        </View>

        <View style={styles.beeFooter} pointerEvents="none">
          <BeeCircle radius={78} beeSize={58} />
        </View>

        <View style={styles.hexBorder} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  hiveCorner: {
    position: 'absolute',
    top: 105,
    right: 15,
    opacity: 0.95,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
    paddingBottom: 0,
    paddingTop: 150,
  },
  brand: {
    ...typography.brandHero,
    textAlign: 'center',
  },
  tagline: {
    ...typography.subtitle,
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
  },
  cta: {
    marginTop: 8,
  },
  beeFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    zIndex: 1,
  },
  hexBorder: {
    height: 18,
    marginHorizontal: 24,
    marginBottom: 12,
    borderTopWidth: 3,
    borderTopColor: colors.honey,
    borderStyle: 'dashed',
    opacity: 0.55,
  },
});
