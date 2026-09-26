import React, { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { AudioPlayer, AudioSource } from 'expo-audio';
import { createCompatAudioPlayer, resolveBundledSource } from './createPlayer';
import { configurePlaybackSession } from './session';

const MUSIC_VOLUME = 0.95;

type Props = {
  source: AudioSource;
  enabled: boolean;
  restartKey: number;
};

/**
 * Looping background music. Creates the native player with a constructor
 * signature that matches the Expo Go client on device.
 */
export function MusicBed({ source, enabled, restartKey }: Props) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const appActive = useRef(true);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      appActive.current = state === 'active';
      const player = playerRef.current;
      if (!player) return;
      if (state !== 'active') {
        try {
          player.pause();
        } catch {
          /* ignore */
        }
        return;
      }
      if (enabled) {
        player.muted = false;
        player.loop = true;
        player.volume = MUSIC_VOLUME;
        player.play();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [enabled]);

  useEffect(() => {
    let cancelled = false;
    let player: AudioPlayer | null = null;

    void (async () => {
      const resolved = await resolveBundledSource(source);
      if (cancelled) return;
      player = createCompatAudioPlayer(resolved, { keepAudioSessionActive: true });
      playerRef.current = player;
      player.muted = false;
      player.loop = true;
      player.volume = MUSIC_VOLUME;
      await configurePlaybackSession();
      if (cancelled) return;
      if (enabled && appActive.current) {
        try {
          await Promise.race([
            player.seekTo(0),
            new Promise<void>((resolve) => {
              setTimeout(resolve, 200);
            }),
          ]);
        } catch {
          /* play from the current position */
        }
        if (!cancelled) player.play();
      }
    })();

    return () => {
      cancelled = true;
      playerRef.current = null;
      try {
        player?.pause();
        player?.remove();
      } catch {
        /* ignore */
      }
    };
  }, [source, enabled, restartKey]);

  return null;
}
