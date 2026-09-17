import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import {
  getMusicTrack,
  SFX_SOURCES,
  type MusicTrackId,
  type SfxId,
} from './catalog';
import {
  DEFAULT_AUDIO_SETTINGS,
  type AudioSettings,
} from './settings';

const SFX_VOLUME = 0.85;
const MUSIC_VOLUME = 0.28;

/**
 * App-wide sound + music controller.
 * Uses createAudioPlayer so SFX/music survive screen changes.
 */
class SoundManager {
  private ready = false;
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  private sfxPlayers = new Map<SfxId, AudioPlayer>();
  private musicPlayer: AudioPlayer | null = null;
  private currentTrackId: MusicTrackId | null = null;

  async init(settings: AudioSettings): Promise<void> {
    this.settings = settings;
    if (this.ready) {
      await this.applySettings(settings);
      return;
    }

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });
    } catch {
      /* web / unsupported */
    }

    (Object.keys(SFX_SOURCES) as SfxId[]).forEach((id) => {
      try {
        const player = createAudioPlayer(SFX_SOURCES[id]);
        player.volume = SFX_VOLUME;
        this.sfxPlayers.set(id, player);
      } catch {
        /* asset missing / web quirks */
      }
    });

    this.ensureMusicPlayer(settings.musicTrackId);
    this.ready = true;
    await this.applySettings(settings);
  }

  getSettings(): AudioSettings {
    return this.settings;
  }

  async applySettings(settings: AudioSettings): Promise<void> {
    this.settings = settings;
    if (!this.ready) return;

    if (settings.musicEnabled) {
      await this.playMusic(settings.musicTrackId);
    } else {
      this.pauseMusic();
    }
  }

  playSfx(id: SfxId): void {
    if (!this.settings.soundEffectsEnabled) return;
    const player = this.sfxPlayers.get(id);
    if (!player) return;
    try {
      player.volume = SFX_VOLUME;
      void player.seekTo(0).then(() => {
        player.play();
      });
    } catch {
      try {
        player.play();
      } catch {
        /* ignore */
      }
    }
  }

  async playMusic(trackId?: MusicTrackId): Promise<void> {
    if (!this.settings.musicEnabled) {
      this.pauseMusic();
      return;
    }

    const id = trackId ?? this.settings.musicTrackId;
    this.settings = { ...this.settings, musicTrackId: id };
    this.ensureMusicPlayer(id);

    const player = this.musicPlayer;
    if (!player) return;

    try {
      player.loop = true;
      player.volume = MUSIC_VOLUME;
      if (!player.playing) {
        player.play();
      }
    } catch {
      /* ignore */
    }
  }

  pauseMusic(): void {
    try {
      this.musicPlayer?.pause();
    } catch {
      /* ignore */
    }
  }

  private ensureMusicPlayer(trackId: MusicTrackId): void {
    const track = getMusicTrack(trackId);
    if (this.musicPlayer && this.currentTrackId === trackId) {
      return;
    }

    if (this.musicPlayer) {
      try {
        this.musicPlayer.pause();
        this.musicPlayer.remove();
      } catch {
        /* ignore */
      }
      this.musicPlayer = null;
    }

    try {
      const player = createAudioPlayer(track.source);
      player.loop = true;
      player.volume = MUSIC_VOLUME;
      this.musicPlayer = player;
      this.currentTrackId = trackId;
    } catch {
      this.musicPlayer = null;
      this.currentTrackId = null;
    }
  }
}

export const soundManager = new SoundManager();
