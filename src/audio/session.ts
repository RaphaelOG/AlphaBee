import { setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';

/** Activate a speaker playback session right before we play anything. */
export async function configurePlaybackSession(): Promise<void> {
  try {
    await setIsAudioActiveAsync(true);
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      shouldPlayInBackground: false,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    });
  } catch {
    /* web / unsupported */
  }
}
