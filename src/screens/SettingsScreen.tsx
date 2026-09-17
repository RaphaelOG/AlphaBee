import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudio } from '../audio';
import type { MusicTrackId } from '../audio';
import { AlphaBee } from '../components/AlphaBee';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const {
    settings,
    tracks,
    playSfx,
    setSoundEffectsEnabled,
    setMusicEnabled,
    setVoiceEnabled,
    setMusicTrackId,
  } = useAudio();

  const onToggleSfx = (value: boolean) => {
    void setSoundEffectsEnabled(value);
    if (value) playSfx('ding');
  };

  const onToggleMusic = (value: boolean) => {
    void setMusicEnabled(value);
  };

  const onToggleVoice = (value: boolean) => {
    void setVoiceEnabled(value);
  };

  const onPickTrack = (id: MusicTrackId) => {
    void setMusicTrackId(id);
    playSfx('hive');
  };

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.skyBottom]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Hive Settings</Text>
          <View style={styles.backSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AlphaBee size={56} />
          <Text style={styles.title}>Sound & Music</Text>
          <Text style={styles.subtitle}>
            Quiet the hive when you need calm focus — or keep the buzz going.
          </Text>

          <View style={styles.card}>
            <ToggleRow
              label="Sound effects"
              hint="Ding, buzz, hive, and key taps"
              value={settings.soundEffectsEnabled}
              onValueChange={onToggleSfx}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Music"
              hint="Background honey-hive melodies"
              value={settings.musicEnabled}
              onValueChange={onToggleMusic}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Word voice"
              hint="Speak the spelling word in Round 2"
              value={settings.voiceEnabled}
              onValueChange={onToggleVoice}
            />
          </View>

          <Text style={styles.sectionLabel}>Music collection</Text>
          <Text style={styles.sectionHint}>Pick a track that fits your hive mood</Text>

          <View style={styles.trackList}>
            {tracks.map((track) => {
              const selected = settings.musicTrackId === track.id;
              return (
                <Pressable
                  key={track.id}
                  onPress={() => onPickTrack(track.id)}
                  style={[styles.trackCard, selected && styles.trackCardSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <View style={styles.trackTop}>
                    <Text style={[styles.trackTitle, selected && styles.trackTitleSelected]}>
                      {track.title}
                    </Text>
                    {selected ? <Text style={styles.playingTag}>Playing</Text> : null}
                  </View>
                  <Text style={styles.trackBlurb}>{track.blurb}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.previewBtn}
            onPress={() => playSfx('complete')}
            disabled={!settings.soundEffectsEnabled}
          >
            <Text style={styles.previewText}>Preview celebration sound</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.honeyLight, true: colors.gold }}
        thumbColor={value ? colors.honeyDark : colors.white}
        ios_backgroundColor={colors.honeyLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  back: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.honeyDark,
    width: 56,
  },
  backSpacer: { width: 56 },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.honey,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text,
  },
  toggleHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.honeyLight,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    marginTop: 22,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.honeyDark,
  },
  sectionHint: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 2,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
  },
  trackList: {
    width: '100%',
    gap: 10,
  },
  trackCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trackCardSelected: {
    borderColor: colors.honeyDark,
    backgroundColor: colors.creamSoft,
  },
  trackTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  trackTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  trackTitleSelected: {
    color: colors.honeyDark,
  },
  playingTag: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: colors.white,
    backgroundColor: colors.honey,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trackBlurb: {
    marginTop: 4,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  previewBtn: {
    marginTop: 20,
    backgroundColor: colors.gold,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.honeyDark,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  previewText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.white,
  },
});
