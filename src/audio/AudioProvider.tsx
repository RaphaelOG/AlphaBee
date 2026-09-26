import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { MUSIC_TRACKS, getMusicTrack, type MusicTrackId, type SfxId } from './catalog';
import { MusicBed } from './MusicBed';
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
  previewSfx: (id: SfxId) => void;
  setSoundEffectsEnabled: (enabled: boolean) => Promise<void>;
  setMusicEnabled: (enabled: boolean) => Promise<void>;
  setVoiceEnabled: (enabled: boolean) => Promise<void>;
  setMusicTrackId: (id: MusicTrackId) => Promise<void>;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [musicNonce, setMusicNonce] = useState(0);

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

  const persist = useCallback(async (next: AudioSettings) => {
    setSettings(next);
    await saveAudioSettings(next);
    soundManager.applySettings(next);
  }, []);

  const playSfx = useCallback((id: SfxId) => {
    soundManager.playSfx(id);
  }, []);

  const previewSfx = useCallback((id: SfxId) => {
    soundManager.previewSfx(id);
  }, []);

  const setSoundEffectsEnabled = useCallback(
    async (enabled: boolean) => {
      await persist({ ...settings, soundEffectsEnabled: enabled });
      if (enabled) soundManager.previewSfx('ding');
    },
    [persist, settings],
  );

  const setMusicEnabled = useCallback(
    async (enabled: boolean) => {
      await persist({ ...settings, musicEnabled: enabled });
      if (enabled) setMusicNonce((n) => n + 1);
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
      setMusicNonce((n) => n + 1);
    },
    [persist, settings],
  );

  const value = useMemo(
    () => ({
      ready,
      settings,
      tracks: MUSIC_TRACKS,
      playSfx,
      previewSfx,
      setSoundEffectsEnabled,
      setMusicEnabled,
      setVoiceEnabled,
      setMusicTrackId,
    }),
    [
      ready,
      settings,
      playSfx,
      previewSfx,
      setSoundEffectsEnabled,
      setMusicEnabled,
      setVoiceEnabled,
      setMusicTrackId,
    ],
  );

  const musicSource = getMusicTrack(settings.musicTrackId).source;

  return (
    <AudioContext.Provider value={value}>
      {ready ? (
        <MusicBed
          source={musicSource}
          enabled={settings.musicEnabled}
          restartKey={musicNonce}
        />
      ) : null}
      {children}
    </AudioContext.Provider>
  );
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
