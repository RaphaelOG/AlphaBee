import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { setMusicDucked } from '../audio/ducking';
import { soundManager } from '../audio/SoundManager';

let preferredVoice: string | undefined;
let voiceIsEnhanced = false;
let voicesLoaded = false;

const NOVELTY =
  /fred|zarvox|trinoids|whisper|bad news|good news|boing|bubbles|cellos|deranged|hysterical|junior|kathy|princess|ralph|albert|bahh|bells|jester|organ|superstar|bells|pipe organ/i;

const NATURAL =
  /ava|samantha|zoe|allison|susan|nicky|aaron|karen|moira|daniel|serena|kate|martha|tessa|siri|premium|neural|natural|wavenet|studio/i;

/** Kid-friendly example sentences so homophones are not identical when spoken. */
const EXAMPLE_SENTENCES: Record<string, string> = {
  their: 'Their hive is full of honey.',
  there: 'Put the book over there.',
  here: 'Please come here.',
  hear: 'I can hear the bees buzzing.',
  which: 'Which flower do you like?',
  witch: 'The witch flies on a broom.',
  peace: 'We want peace and quiet.',
  piece: 'May I have a piece of cake?',
  flour: 'We bake bread with flour.',
  flower: 'A bee landed on the flower.',
  to: 'We go to the hive.',
  two: 'I see two bees.',
  too: 'I want to play too.',
  see: 'I see a yellow bee.',
  sea: 'Ships sail on the sea.',
  through: 'Walk through the garden gate.',
  though: 'It was hard, though we smiled.',
  were: 'They were in the garden.',
  where: 'Where is the hive?',
  wear: 'I wear a warm coat.',
  write: 'Please write your name.',
  right: 'Turn right at the flower.',
  know: 'I know that word.',
  no: 'The answer is no.',
  sun: 'The sun is bright today.',
  son: 'Their son likes bees.',
  mail: 'The mail is in the box.',
  male: 'A male lion has a mane.',
  one: 'I have one honey drop.',
  won: 'Our team won the game.',
  be: 'Be kind to others.',
  bee: 'The bee drinks nectar.',
  by: 'Sit by the garden.',
  buy: 'We buy honey at the shop.',
  bye: 'Wave bye to the bee.',
  for: 'This gift is for you.',
  four: 'I counted four flowers.',
  your: 'Your hive looks cozy.',
  youre: 'You are a great speller.',
};

function scoreVoice(voice: Speech.Voice): number {
  const blob = `${voice.name} ${voice.identifier}`;
  const lang = voice.language.toLowerCase();

  if (!lang.startsWith('en')) return -1000;
  if (NOVELTY.test(blob)) return -1000;

  let score = 0;
  if (voice.quality === Speech.VoiceQuality.Enhanced) score += 90;
  if (/en-us/i.test(lang)) score += 28;
  else if (/en-gb|en-au|en-ie|en-za/i.test(lang)) score += 18;
  else score += 8;

  if (NATURAL.test(blob)) score += 40;
  if (/compact/i.test(blob)) score -= 35;
  if (/eloquence/i.test(blob) && voice.quality !== Speech.VoiceQuality.Enhanced) score -= 15;
  if (/network|enhanced|premium/i.test(blob)) score += 18;

  return score;
}

async function resolveVoice(): Promise<{ voice?: string; enhanced: boolean }> {
  if (voicesLoaded) return { voice: preferredVoice, enhanced: voiceIsEnhanced };
  voicesLoaded = true;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const ranked = voices
      .map((v) => ({ v, score: scoreVoice(v) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score);

    const chosen = ranked[0]?.v;
    preferredVoice = chosen?.identifier;
    voiceIsEnhanced = chosen?.quality === Speech.VoiceQuality.Enhanced || NATURAL.test(chosen?.name ?? '');
  } catch {
    preferredVoice = undefined;
    voiceIsEnhanced = false;
  }

  return { voice: preferredVoice, enhanced: voiceIsEnhanced };
}

function tidyMeaning(meaning: string): string {
  return meaning
    .replace(/[—–]/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
}

function isGenericMeaning(meaning: string): boolean {
  return /think about what this word means/i.test(meaning);
}

function spokenWord(word: string): string {
  const trimmed = word.trim();
  if (!trimmed) return '';
  return trimmed.length <= 2 ? trimmed.toUpperCase() : trimmed;
}

/** Build one utterance: word, hint, example, word again. */
export function buildWordUtterance(word: string, meaning?: string): string {
  const key = word.trim().toLowerCase();
  const label = spokenWord(word);
  const example = EXAMPLE_SENTENCES[key];
  const gloss = meaning && !isGenericMeaning(meaning) ? tidyMeaning(meaning) : '';

  const parts: string[] = [label];
  if (gloss) parts.push(gloss);
  if (example) parts.push(example);
  if (!gloss && !example) parts.unshift('The word is');
  parts.push(label);

  return parts.join('... ');
}

function speakOnce(
  text: string,
  options: Speech.SpeechOptions,
): Promise<void> {
  const waitMs = Math.min(16000, 3500 + text.length * 55);

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const safety = setTimeout(finish, waitMs);

    Speech.speak(text, {
      ...options,
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
  });
}

/**
 * Speak a spelling word clearly, with meaning/example so homophones differ.
 * Resolves when the utterance finishes so callers can lock the UI.
 */
export async function speakWord(word: string, opts?: { meaning?: string }): Promise<void> {
  const text = word.trim();
  if (!text) return;
  if (!soundManager.getSettings().voiceEnabled) return;

  try {
    await Speech.stop();
  } catch {
    /* ignore */
  }

  await new Promise((r) => setTimeout(r, 60));

  const { voice, enhanced } = await resolveVoice();
  const utterance = buildWordUtterance(text, opts?.meaning);
  const options: Speech.SpeechOptions = {
    language: 'en-US',
    voice,
    rate: enhanced ? 0.78 : 0.7,
    pitch: 0.97,
    volume: 1,
    ...(Platform.OS === 'ios' ? { useApplicationAudioSession: false } : null),
  };

  setMusicDucked(true);
  try {
    await speakOnce(utterance, options);
  } finally {
    setMusicDucked(false);
  }
}

export function stopSpeaking(): void {
  setMusicDucked(false);
  void Speech.stop();
}
