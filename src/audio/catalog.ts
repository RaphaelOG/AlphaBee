import type { AudioSource } from 'expo-audio';

export type SfxId = 'ding' | 'buzz' | 'hive' | 'tap' | 'whoosh' | 'complete';

export type MusicTrackId =
  | 'sunny_hive'
  | 'honey_hum'
  | 'garden_buzz'
  | 'golden_morning'
  | 'bee_dance';

export type MusicTrack = {
  id: MusicTrackId;
  title: string;
  blurb: string;
  source: AudioSource;
};

export const SFX_SOURCES: Record<SfxId, AudioSource> = {
  ding: require('../../assets/audio/sfx/ding.m4a'),
  buzz: require('../../assets/audio/sfx/buzz.m4a'),
  hive: require('../../assets/audio/sfx/hive.m4a'),
  tap: require('../../assets/audio/sfx/tap.m4a'),
  whoosh: require('../../assets/audio/sfx/whoosh.m4a'),
  complete: require('../../assets/audio/sfx/complete.m4a'),
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'sunny_hive',
    title: 'Sunny Hive',
    blurb: 'Bright and gentle — perfect for spelling practice',
    source: require('../../assets/audio/music/sunny_hive.m4a'),
  },
  {
    id: 'honey_hum',
    title: 'Honey Hum',
    blurb: 'Soft pads with a warm honey glow',
    source: require('../../assets/audio/music/honey_hum.m4a'),
  },
  {
    id: 'garden_buzz',
    title: 'Garden Buzz',
    blurb: 'Light and playful for younger learners',
    source: require('../../assets/audio/music/garden_buzz.m4a'),
  },
  {
    id: 'golden_morning',
    title: 'Golden Morning',
    blurb: 'Calm morning melody for focused quests',
    source: require('../../assets/audio/music/golden_morning.m4a'),
  },
  {
    id: 'bee_dance',
    title: 'Bee Dance',
    blurb: 'A buzzy little dance around the hive',
    source: require('../../assets/audio/music/bee_dance.m4a'),
  },
];

export const DEFAULT_MUSIC_TRACK: MusicTrackId = 'sunny_hive';

export function getMusicTrack(id: MusicTrackId): MusicTrack {
  return MUSIC_TRACKS.find((t) => t.id === id) ?? MUSIC_TRACKS[0];
}
