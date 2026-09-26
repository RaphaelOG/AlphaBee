import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../audio';
import type { MusicTrackId } from '../audio';
import { AlphaBee } from '../components/AlphaBee';
import { ChunkyButton, KidCard, Pill, SpeechBubble, Sticker, type KidTone } from '../components/KidUI';
import { FlowerMeadow, HoneycombPattern, SkyScene } from '../components/SceneDecor';
import { NavButton, TopNav } from '../components/TopNav';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const TRACK_LOOK: Record<MusicTrackId, { emoji: string; tone: KidTone }> = {
  sunny_hive: { emoji: '☀️', tone: 'honey' },
  honey_hum: { emoji: '🍯', tone: 'honey' },
  garden_buzz: { emoji: '🌸', tone: 'leaf' },
  golden_morning: { emoji: '🌅', tone: 'coral' },
  bee_dance: { emoji: '💃', tone: 'berry' },
};

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
  };

  const onPickTrack = (id: MusicTrackId) => {
    void setMusicTrackId(id);
  };

  return (
    <LinearGradient colors={[colors.sky, colors.skyTop, colors.creamSoft]} style={styles.fill}>
      <StatusBar style="dark" />
      <HoneycombPattern opacity={0.07} rows={40} />
      <SkyScene sunSize={72} />
      <FlowerMeadow height={96} />
      <SafeAreaView style={styles.safe}>
        <TopNav
          left={<NavButton icon="arrow-back" label="Back" onPress={() => navigation.goBack()} />}
          title="Hive Settings"
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <AlphaBee size={88} mood="happy" />
            <SpeechBubble
              text="Quiet the hive for focus — or keep the buzz going!"
              tail="left"
              style={styles.bubble}
            />
            <Sticker emoji="🎵" tone="berry" size={46} rotate={12} style={styles.noteSticker} />
          </View>

          <Text style={styles.title}>Sound & Music</Text>

          <KidCard tone="honey" drip contentStyle={styles.toggleCard}>
            <ToggleRow
              emoji="🔔"
              label="Sound effects"
              hint="Ding, buzz, hive, and key taps"
              value={settings.soundEffectsEnabled}
              onValueChange={onToggleSfx}
            />
            <View style={styles.divider} />
            <ToggleRow
              emoji="🎶"
              label="Music"
              hint="Background honey-hive melodies"
              value={settings.musicEnabled}
              onValueChange={(v) => {
                void setMusicEnabled(v);
              }}
            />
            <View style={styles.divider} />
            <ToggleRow
              emoji="🗣️"
              label="Word voice"
              hint="Speak the spelling word in Round 2"
              value={settings.voiceEnabled}
              onValueChange={(v) => {
                void setVoiceEnabled(v);
              }}
            />
          </KidCard>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Music collection</Text>
            <Text style={styles.sectionHint}>Tap a track that fits your hive mood</Text>
          </View>

          <View style={styles.trackList}>
            {tracks.map((track) => {
              const selected = settings.musicTrackId === track.id;
              const look = TRACK_LOOK[track.id];
              return (
                <KidCard
                  key={track.id}
                  tone={look.tone}
                  tinted={selected}
                  selected={selected}
                  onPress={() => onPickTrack(track.id)}
                  contentStyle={styles.trackCard}
                >
                  <View style={styles.trackEmoji}>
                    <Text style={styles.trackEmojiText}>{look.emoji}</Text>
                  </View>
                  <View style={styles.trackCopy}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackBlurb}>{track.blurb}</Text>
                  </View>
                  {selected ? <Pill label="Playing" tone={look.tone} emoji="▶" solid /> : null}
                </KidCard>
              );
            })}
          </View>

          <ChunkyButton
            label="Preview celebration"
            tone="coral"
            icon={<Ionicons name="sparkles" size={20} color={colors.white} />}
            onPress={() => playSfx('complete')}
            disabled={!settings.soundEffectsEnabled}
            style={styles.previewBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ToggleRow({
  emoji,
  label,
  hint,
  value,
  onValueChange,
}: {
  emoji: string;
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleEmoji}>{emoji}</Text>
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
  safe: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  content: {
    paddingBottom: 120,
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  hero: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubble: {
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  noteSticker: {
    marginLeft: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.chocolate,
    alignSelf: 'flex-start',
    marginTop: -4,
  },
  toggleCard: {
    paddingTop: 22,
    gap: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  toggleEmoji: {
    fontSize: 22,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.chocolate,
  },
  toggleHint: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 2,
    backgroundColor: colors.honeyLight,
    borderRadius: 1,
  },
  sectionHead: {
    alignSelf: 'stretch',
    marginTop: 6,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.honeyDark,
  },
  sectionHint: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  trackList: {
    width: '100%',
    gap: 10,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  trackEmoji: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackEmojiText: {
    fontSize: 24,
  },
  trackCopy: {
    flex: 1,
  },
  trackTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.chocolate,
  },
  trackBlurb: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  previewBtn: {
    marginTop: 6,
  },
});
