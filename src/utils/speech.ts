import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

let preferredVoice: string | undefined;
let voiceIsEnhanced = false;
let voicesLoaded = false;

/** Prefer a high-quality (Enhanced/Neural/Premium) English voice when available. */
async function resolveVoice(): Promise<{ voice?: string; enhanced: boolean }> {
  if (voicesLoaded) return { voice: preferredVoice, enhanced: voiceIsEnhanced };
  voicesLoaded = true;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const english = voices.filter((v) => v.language?.toLowerCase().startsWith('en'));

    const byQuality = english.find((v) => v.quality === Speech.VoiceQuality.Enhanced);
    const byName = english.find((v) =>
      /samantha|karen|daniel|moira|ava|zoe|siri|enhanced|premium|neural|wavenet/i.test(v.name),
    );
    const byLocale = english.find((v) => v.language.toLowerCase() === 'en-us');

    const chosen = byQuality ?? byName ?? byLocale ?? english[0];

    preferredVoice = chosen?.identifier;
    voiceIsEnhanced = Boolean(byQuality ?? byName);
  } catch {
    preferredVoice = undefined;
    voiceIsEnhanced = false;
  }

  return { voice: preferredVoice, enhanced: voiceIsEnhanced };
}

/**
 * Speak a spelling word clearly.
 * Resolves when the utterance finishes (or errors/stops), so callers can lock the UI.
 */
export async function speakWord(word: string): Promise<void> {
  const text = word.trim();
  if (!text) return;

  try {
    await Speech.stop();
  } catch {
    /* ignore */
  }

  await new Promise((r) => setTimeout(r, 80));

  const { voice, enhanced } = await resolveVoice();
  const spoken = /[.!?]$/.test(text) ? text : `${text}.`;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    // Safety net if a platform never fires onDone
    const safety = setTimeout(finish, 4000);

    Speech.speak(spoken, {
      language: 'en-US',
      voice,
      rate: enhanced ? 0.95 : 0.85,
      pitch: 1.0,
      volume: 1.0,
      ...(Platform.OS === 'ios' ? { useApplicationAudioSession: false } : null),
      onDone: () => {
        clearTimeout(safety);
        finish();
      },
      onStopped: () => {
        clearTimeout(safety);
        finish();
      },
      onError: () => {
        clearTimeout(safety);
        Speech.speak(text, {
          language: 'en-US',
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0,
          onDone: () => {
            clearTimeout(safety);
            finish();
          },
          onStopped: () => {
            clearTimeout(safety);
            finish();
          },
          onError: () => {
            clearTimeout(safety);
            finish();
          },
        });
      },
    });
  });
}

export function stopSpeaking(): void {
  void Speech.stop();
}
