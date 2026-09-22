import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HiveStructure } from '../components/HiveDecor';
import { HoneycombButton } from '../components/HoneycombButton';
import { BeeCircle } from '../components/BeeCircle';
import { useAuth } from '../auth';
import { gradeLabel, type GradeLevel } from '../data/curriculum';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { ready, isAuthenticated, activeChild, parent, logout } = useAuth();

  const startLearning = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    if (!activeChild) {
      navigation.navigate('ChildSelect');
      return;
    }
    navigation.navigate('ModeSelect');
  };

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.skyBottom]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          {isAuthenticated ? (
            <Pressable onPress={() => navigation.navigate('ChildSelect')} hitSlop={10}>
              <Text style={styles.accountChip} numberOfLines={1}>
                {activeChild
                  ? `${activeChild.nickname} · ${gradeLabel(activeChild.gradeLevel as GradeLevel)}`
                  : parent?.displayName || parent?.email || 'Account'}
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => navigation.navigate('Auth')} hitSlop={10}>
              <Text style={styles.settingsLink}>Sign in</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Open hive settings"
          >
            <Text style={styles.settingsLink}>Settings</Text>
          </Pressable>
        </View>

        <View style={styles.hiveCorner} pointerEvents="none">
          <HiveStructure size={130} />
        </View>

        <View style={styles.center}>
          <Text style={styles.brand}>AlphaBee</Text>
          <Text style={styles.tagline}>Spell, buzz, and build your hive</Text>
          {!ready ? (
            <ActivityIndicator color={colors.honey} style={{ marginVertical: 24 }} />
          ) : (
            <HoneycombButton
              label={'Start\nLearning'}
              size={168}
              onPress={startLearning}
              style={styles.cta}
            />
          )}
          {isAuthenticated ? (
            <Pressable
              onPress={() => {
                void logout();
              }}
              hitSlop={10}
              style={styles.signOut}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          ) : null}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    zIndex: 3,
    gap: 12,
  },
  accountChip: {
    maxWidth: 200,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.honeyDark,
    backgroundColor: colors.white,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  settingsLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.honeyDark,
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
    paddingTop: 120,
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
  signOut: {
    marginTop: 16,
  },
  signOutText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
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
