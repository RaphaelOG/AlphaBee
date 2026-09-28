export type WordValidation =
  | { ok: true; word: string }
  | { ok: false; message: string };

const KEY_SMASH = /^(qwer|qwerty|asdf|asdfg|zxcv|zxcvb|hjkl|yuio|bnm)[a-z]*$/;
const JUNK = /^(xxx+|aaa+|abc|abcd|test|asdf|qwer|qwerty|password|xxx)$/;

/**
 * Clean and validate a parent-entered Practice Hive word.
 * Keeps weekly spelling lists flexible while rejecting empty / junk input.
 */
export function validateCustomWord(raw: string, existing: string[]): WordValidation {
  const typed = raw.trim();
  if (!typed) {
    return { ok: false, message: 'Type a word first.' };
  }

  if (/[0-9]/.test(typed)) {
    return { ok: false, message: 'Letters only — no numbers.' };
  }
  if (/[^a-zA-Z'’\s-]/.test(typed)) {
    return { ok: false, message: 'Letters only — no symbols.' };
  }

  const word = typed.toLowerCase().replace(/['’\s-]/g, '');
  if (!word) {
    return { ok: false, message: 'Type a real spelling word.' };
  }

  if (word.length === 1 && word !== 'a' && word !== 'i') {
    return { ok: false, message: 'Use a word with at least 2 letters.' };
  }
  if (word.length > 16) {
    return { ok: false, message: 'Keep it to 16 letters or fewer.' };
  }
  if (existing.includes(word)) {
    return { ok: false, message: 'That word is already in the hive.' };
  }
  if (!/[aeiouy]/.test(word)) {
    return { ok: false, message: 'That doesn’t look like a real word — it needs a vowel.' };
  }
  if (/(.)\1{2,}/.test(word)) {
    return { ok: false, message: 'That doesn’t look like a real word.' };
  }
  if (KEY_SMASH.test(word) || JUNK.test(word)) {
    return { ok: false, message: 'Please enter a real spelling word.' };
  }

  return { ok: true, word };
}
