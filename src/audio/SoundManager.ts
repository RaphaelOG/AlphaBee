import type { AudioPlayer } from 'expo-audio';
import { SFX_SOURCES, type SfxId } from './catalog';
import { createCompatAudioPlayer, resolveBundledSource } from './createPlayer';
import { configurePlaybackSession } from './session';
import { DEFAULT_AUDIO_SETTINGS, type AudioSettings } from './settings';

const SFX_VOLUME = 1;

/**
 * App-wide sound-effect controller.
 * Music lives in MusicBed so the hook-managed player can finish downloading first.
 */
class SoundManager {
  private ready = false;
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  private sfxPlayers = new Map<SfxId, AudioPlayer>();

  async init(settings: AudioSettings): Promise<void> {
    this.settings = settings;
    await configurePlaybackSession();
    this.ready = true;
  }

  getSettings(): AudioSettings {
    return this.settings;
  }

  applySettings(settings: AudioSettings): void {
    this.settings = settings;
  }

  playSfx(id: SfxId): void {
    if (!this.settings.soundEffectsEnabled) return;
    void this.playSfxAsync(id);
  }

  previewSfx(id: SfxId): void {
    void this.playSfxAsync(id);
  }

  private async playSfxAsync(id: SfxId): Promise<void> {
    await configurePlaybackSession();
    const player = await this.ensureSfxPlayer(id);
    if (!player) return;

    player.muted = false;
    player.volume = SFX_VOLUME;
    player.loop = false;
    try {
      await Promise.race([
        player.seekTo(0),
        new Promise<void>((resolve) => {
          setTimeout(resolve, 120);
        }),
      ]);
    } catch {
      /* first play may not need a seek */
    }
    player.play();
  }

  private async ensureSfxPlayer(id: SfxId): Promise<AudioPlayer | null> {
    const existing = this.sfxPlayers.get(id);
    if (existing) return existing;

    try {
      const source = await resolveBundledSource(SFX_SOURCES[id]);
      const player = createCompatAudioPlayer(source, { keepAudioSessionActive: true });
      player.volume = SFX_VOLUME;
      player.loop = false;
      this.sfxPlayers.set(id, player);
      return player;
    } catch {
      return null;
    }
  }
}

export const soundManager = new SoundManager();
