import type { KidTone } from '../components/KidUI';

export type AvatarKey =
  | 'bee'
  | 'bear'
  | 'fox'
  | 'bunny'
  | 'frog'
  | 'unicorn'
  | 'ladybug'
  | 'butterfly';

export type Avatar = {
  key: AvatarKey;
  emoji: string;
  name: string;
  tone: KidTone;
};

export const AVATARS: Avatar[] = [
  { key: 'bee', emoji: '🐝', name: 'Buzzy', tone: 'honey' },
  { key: 'bear', emoji: '🐻', name: 'Honey Bear', tone: 'coral' },
  { key: 'fox', emoji: '🦊', name: 'Foxy', tone: 'coral' },
  { key: 'bunny', emoji: '🐰', name: 'Hoppy', tone: 'berry' },
  { key: 'frog', emoji: '🐸', name: 'Ribbit', tone: 'leaf' },
  { key: 'unicorn', emoji: '🦄', name: 'Sparkle', tone: 'berry' },
  { key: 'ladybug', emoji: '🐞', name: 'Dotty', tone: 'coral' },
  { key: 'butterfly', emoji: '🦋', name: 'Flutter', tone: 'sky' },
];

export function getAvatar(key?: string | null): Avatar {
  return AVATARS.find((a) => a.key === key) ?? AVATARS[0];
}
