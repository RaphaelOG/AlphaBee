import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MUSIC_TRACK, type MusicTrackId } from './catalog';

const SETTINGS_KEY = '@alphabee/audio_settings_v1';

export type AudioSettings = {
  /** Ding / buzz / hive / key taps */
  soundEffectsEnabled: boolean;
  /** Background hive music */
  musicEnabled: boolean;
  /** Round 2 text-to-speech for spelling words */
  voiceEnabled: boolean;
  musicTrackId: MusicTrackId;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  soundEffectsEnabled: true,
  musicEnabled: true,
  voiceEnabled: true,
  musicTrackId: DEFAULT_MUSIC_TRACK,
};

export async function loadAudioSettings(): Promise<AudioSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      soundEffectsEnabled: parsed.soundEffectsEnabled ?? true,
      musicEnabled: parsed.musicEnabled ?? true,
      voiceEnabled: parsed.voiceEnabled ?? true,
      musicTrackId: parsed.musicTrackId ?? DEFAULT_MUSIC_TRACK,
    };
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
