import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Beehive } from '../components/HiveDecor';
import { HoneycombButton } from '../components/HoneycombButton';
import { AlphaBee } from '../components/AlphaBee';
import { FlyingBee } from '../components/FlyingBee';
import { Pill, SpeechBubble, Sticker } from '../components/KidUI';
import { FlowerMeadow, HoneycombPattern, Pollen, SkyScene, Sparkles } from '../components/SceneDecor';
import { useAuth } from '../auth';
import { getAvatar } from '../data/avatars';
import { gradeLabel, type GradeLevel } from '../data/curriculum';
import { colors, fonts, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { ready, isAuthenticated, activeChild, parent, logout } = useAuth();
  const hover = useRef(new Animated.Value(0)).current;
  const swing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(hover, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(hover, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(swing, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [hover, swing]);

  const beeY = hover.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const hiveRotate = swing.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });

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

  const greeting = activeChild
    ? `Hi ${activeChild.nickname}! Ready to buzz?`
    : isAuthenticated
      ? 'Pick a learner and let’s buzz!'
      : 'Let’s spell some words together!';

  const avatar = getAvatar(activeChild?.avatarKey);

  return (
    <LinearGradient colors={[colors.sky, colors.skyTop, colors.creamSoft]} style={styles.fill}>
      <StatusBar style="dark" />
      <HoneycombPattern opacity={0.07} rows={22} />
      <SkyScene />
      <Pollen count={12} />
      <FlowerMeadow height={150} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          {isAuthenticated ? (
            <Pressable
              onPress={() => navigation.navigate('ChildSelect')}
              hitSlop={10}
              style={({ pressed }) => [styles.accountChip, pressed && styles.pressed]}
            >
              <Text style={styles.accountEmoji}>{activeChild ? avatar.emoji : '👋'}</Text>
              <Text style={styles.accountText} numberOfLines={1}>
                {activeChild
                  ? `${activeChild.nickname} · ${gradeLabel(activeChild.gradeLevel as GradeLevel)}`
                  : parent?.displayName || parent?.email || 'Account'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.honeyDark} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => navigation.navigate('Auth')}
              hitSlop={10}
              style={({ pressed }) => [styles.accountChip, pressed && styles.pressed]}
            >
              <Ionicons name="person-circle" size={18} color={colors.honeyDark} />
              <Text style={styles.accountText}>Sign in</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Open hive settings"
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="settings-sharp" size={20} color={colors.honeyDark} />
          </Pressable>
        </View>

        <Animated.View style={[styles.hiveCorner, { transform: [{ rotate: hiveRotate }] }]} pointerEvents="none">
          <Beehive size={118} />
        </Animated.View>

        <FlyingBee hiveCorner="topRight" beeSize={44} />

        <View style={styles.center}>
          <View style={styles.brandBlock}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>Alpha</Text>
              <Text style={[styles.brand, styles.brandBee]}>Bee</Text>
            </View>
            <View style={styles.brandUnderline} />
            <Text style={styles.tagline}>Spell it. Buzz it. Fill your hive with honey!</Text>
            <View style={styles.pillRow}>
              <Pill emoji="🍯" label="Earn honey" tone="honey" />
              <Pill emoji="⭐" label="Collect stars" tone="sky" />
              <Pill emoji="🔥" label="Keep streaks" tone="coral" />
            </View>
          </View>

          <View style={styles.heroRow}>
            <Animated.View style={[styles.heroBee, { transform: [{ translateY: beeY }] }]}>
              <AlphaBee size={132} mood="excited" still />
            </Animated.View>
            <SpeechBubble text={greeting} tail="left" style={styles.bubble} />
          </View>

          <View style={styles.ctaWrap}>
            <Sparkles count={9} seed={11} />
            {!ready ? (
              <ActivityIndicator color={colors.honey} style={{ marginVertical: 40 }} />
            ) : (
              <HoneycombButton
                label={'Start\nLearning'}
                size={176}
                onPress={startLearning}
                icon={<Ionicons name="play-circle" size={34} color={colors.white} />}
              />
            )}
          </View>

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

        <View style={styles.stickers} pointerEvents="none">
          <Sticker emoji="🌻" tone="leaf" size={46} rotate={-12} style={styles.stickerLeft} />
          <Sticker label="ABC" tone="berry" size={50} rotate={9} style={styles.stickerRight} />
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 6,
    zIndex: 3,
    gap: 12,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 230,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 4,
    borderBottomColor: colors.honey,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 6,
  },
  accountEmoji: {
    fontSize: 16,
  },
  accountText: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    color: colors.honeyDark,
    flexShrink: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 4,
    borderBottomColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.95,
  },
  hiveCorner: {
    position: 'absolute',
    top: 86,
    right: 14,
    zIndex: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    zIndex: 2,
    paddingTop: 80,
    paddingBottom: 110,
  },
  brandBlock: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  brand: {
    ...typography.brandHero,
    fontSize: 62,
    color: colors.chocolate,
    textShadowColor: colors.white,
    textShadowOffset: { width: 0, height: 3 },
  },
  brandBee: {
    color: colors.honeyDark,
  },
  brandUnderline: {
    width: 170,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginTop: -6,
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  tagline: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.brown,
    marginTop: 10,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  heroBee: {
    marginLeft: -6,
  },
  bubble: {
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: 26,
  },
  ctaWrap: {
    marginTop: 4,
    width: 240,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOut: {
    marginTop: 2,
  },
  signOutText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  stickers: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 128,
    height: 60,
    zIndex: 3,
  },
  stickerLeft: {
    position: 'absolute',
    left: 18,
    top: 0,
  },
  stickerRight: {
    position: 'absolute',
    right: 22,
    top: 6,
  },
});
