import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CollectibleHive } from '../components/HiveDecor';
import { AlphaBee } from '../components/AlphaBee';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HiveRewards'>;

export function HiveRewardsScreen({ navigation, route }: Props) {
  const { honey, stars } = route.params;
  const decorativeBees = Math.min(4, Math.floor(honey / 2) + (stars > 0 ? 1 : 0));

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.honeyLight]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <Text style={[typography.title, styles.title]}>Your Hive</Text>
        <Text style={[typography.subtitle, styles.sub]}>
          Collect honey droplets, stars, and friendly bees as you spell
        </Text>

        <View style={styles.stage}>
          <CollectibleHive honeyDrops={honey} stars={stars} bees={decorativeBees} />
          <View style={styles.mascot}>
            <AlphaBee size={70} happy />
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{honey}</Text>
            <Text style={styles.statLabel}>Honey drops</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stars}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{decorativeBees}</Text>
            <Text style={styles.statLabel}>Hive bees</Text>
          </View>
        </View>

        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Keep Spelling</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  sub: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  stage: {
    backgroundColor: colors.white,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.honey,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  mascot: {
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.honeyLight,
  },
  statValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 26,
    color: colors.honeyDark,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  back: {
    marginTop: 28,
    backgroundColor: colors.gold,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  backText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: colors.white,
  },
});
