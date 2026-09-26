import {
  AudioModule,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';
import { Asset } from 'expo-asset';

/**
 * Expo Go and expo-audio JS have drifted on AudioPlayer constructor arity.
 * Try the signatures in the order we have seen in the wild.
 */
export function createCompatAudioPlayer(
  source: AudioSource | null = null,
  options: { updateInterval?: number; keepAudioSessionActive?: boolean } = {},
): AudioPlayer {
  const updateInterval = options.updateInterval ?? 500;
  const keepAudioSessionActive = options.keepAudioSessionActive ?? true;
  const Player = AudioModule.AudioPlayer;
  const attempts: unknown[][] = [
    [source, updateInterval, keepAudioSessionActive, 0],
    [source, updateInterval, keepAudioSessionActive],
    [source, updateInterval, keepAudioSessionActive, 0, true],
  ];

  let lastError: unknown;
  for (const args of attempts) {
    try {
      return new (Player as unknown as new (...args: unknown[]) => AudioPlayer)(...args);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function resolveBundledSource(source: AudioSource): Promise<AudioSource> {
  const moduleId =
    typeof source === 'number'
      ? source
      : source && typeof source === 'object'
        ? source.assetId
        : undefined;
  if (typeof moduleId !== 'number') return source;

  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  if (asset.localUri) return { uri: asset.localUri };
  if (asset.uri) return { uri: asset.uri };
  return moduleId;
}
