import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { MUSIC_TRACKS, type MusicTrackId, type SfxId } from './catalog';
import {
  DEFAULT_AUDIO_SETTINGS,
  loadAudioSettings,
  saveAudioSettings,
  type AudioSettings,
} from './settings';
import { soundManager } from './SoundManager';

type AudioContextValue = {
  ready: boolean;
  settings: AudioSettings;
  tracks: typeof MUSIC_TRACKS;
  playSfx: (id: SfxId) => void;
  setSoundEffectsEnabled: (enabled: boolean) => Promise<void>;
  setMusicEnabled: (enabled: boolean) => Promise<void>;
  setVoiceEnabled: (enabled: boolean) => Promise<void>;
  setMusicTrackId: (id: MusicTrackId) => Promise<void>;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const loaded = await loadAudioSettings();
      if (!alive) return;
      setSettings(loaded);
      await soundManager.init(loaded);
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        if (settings.musicEnabled) void soundManager.playMusic(settings.musicTrackId);
      } else {
        soundManager.pauseMusic();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [settings.musicEnabled, settings.musicTrackId]);

  const persist = useCallback(async (next: AudioSettings) => {
    setSettings(next);
    await saveAudioSettings(next);
    await soundManager.applySettings(next);
  }, []);

  const playSfx = useCallback((id: SfxId) => {
    soundManager.playSfx(id);
  }, []);

  const setSoundEffectsEnabled = useCallback(
    async (enabled: boolean) => {
      await persist({ ...settings, soundEffectsEnabled: enabled });
    },
    [persist, settings],
  );

  const setMusicEnabled = useCallback(
    async (enabled: boolean) => {
      await persist({ ...settings, musicEnabled: enabled });
    },
    [persist, settings],
  );

  const setVoiceEnabled = useCallback(
    async (enabled: boolean) => {
      await persist({ ...settings, voiceEnabled: enabled });
    },
    [persist, settings],
  );

  const setMusicTrackId = useCallback(
    async (id: MusicTrackId) => {
      await persist({ ...settings, musicTrackId: id, musicEnabled: true });
    },
    [persist, settings],
  );

  const value = useMemo(
    () => ({
      ready,
      settings,
      tracks: MUSIC_TRACKS,
      playSfx,
      setSoundEffectsEnabled,
      setMusicEnabled,
      setVoiceEnabled,
      setMusicTrackId,
    }),
    [
      ready,
      settings,
      playSfx,
      setSoundEffectsEnabled,
      setMusicEnabled,
      setVoiceEnabled,
      setMusicTrackId,
    ],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return ctx;
}

/** Safe hook when a screen may render outside provider during tests. */
export function useAudioOptional(): AudioContextValue | null {
  return useContext(AudioContext);
}
