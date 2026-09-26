/**
 * Generate original AlphaBee SFX + looping music as WAV, then AAC M4A for iOS.
 * Run: node scripts/generate-audio.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = clamp(Math.round(samples[i] * 32767), -32768, 32767);
    buffer.writeInt16LE(s, 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function env(attack, hold, release, t, duration) {
  if (t < attack) return t / attack;
  if (t < attack + hold) return 1;
  const relStart = attack + hold;
  if (t < duration) return Math.max(0, 1 - (t - relStart) / release);
  return 0;
}

function tone(freq, duration, { type = 'sine', volume = 0.35, attack = 0.01, release = 0.08 } = {}) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const hold = Math.max(0, duration - attack - release);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const phase = 2 * Math.PI * freq * t;
    let wave;
    if (type === 'triangle') {
      const p = (t * freq) % 1;
      wave = 4 * Math.abs(p - 0.5) - 1;
    } else if (type === 'square') {
      wave = Math.sin(phase) > 0 ? 0.55 : -0.55;
    } else if (type === 'softnoise') {
      wave = (Math.random() * 2 - 1) * 0.35;
    } else {
      wave = Math.sin(phase);
    }
    out[i] = wave * volume * env(attack, hold, release, t, duration);
  }
  return out;
}

function normalize(samples, target = 0.88) {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  if (peak < 1e-6) return samples;
  const scale = target / peak;
  const out = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * scale;
  return out;
}

function mix(...parts) {
  const len = Math.max(...parts.map((p) => p.length));
  const out = new Float64Array(len);
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) out[i] += part[i];
  }
  return normalize(out);
}

function concat(parts, gapSec = 0) {
  const gap = Math.floor(SAMPLE_RATE * gapSec);
  let total = parts.reduce((s, p) => s + p.length, 0) + gap * Math.max(0, parts.length - 1);
  const out = new Float64Array(total);
  let offset = 0;
  for (let i = 0; i < parts.length; i++) {
    out.set(parts[i], offset);
    offset += parts[i].length + (i < parts.length - 1 ? gap : 0);
  }
  return out;
}

function place(base, clip, atSec) {
  const start = Math.floor(atSec * SAMPLE_RATE);
  const out = base.length >= start + clip.length ? base : (() => {
    const next = new Float64Array(start + clip.length);
    next.set(base);
    return next;
  })();
  for (let i = 0; i < clip.length; i++) out[start + i] += clip[i];
  return out;
}

// --- SFX ---
function makeDing() {
  return mix(
    tone(880, 0.18, { volume: 0.55, attack: 0.005, release: 0.12 }),
    tone(1320, 0.28, { volume: 0.4, attack: 0.01, release: 0.2, type: 'triangle' }),
  );
}

function makeBuzz() {
  const n = Math.floor(SAMPLE_RATE * 0.32);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const wobble = 180 + Math.sin(t * 40) * 35;
    const buzz = Math.sin(2 * Math.PI * wobble * t) * 0.42;
    const rasp = Math.sin(2 * Math.PI * (wobble * 2.1) * t) * 0.16;
    out[i] = (buzz + rasp) * env(0.01, 0.18, 0.12, t, 0.32);
  }
  return out;
}

function makeHive() {
  return concat(
    [
      tone(523.25, 0.12, { volume: 0.4, type: 'triangle' }),
      tone(659.25, 0.12, { volume: 0.44, type: 'triangle' }),
      tone(783.99, 0.22, { volume: 0.5, type: 'triangle', release: 0.14 }),
    ],
    0.02,
  );
}

function makeTap() {
  return mix(
    tone(640, 0.045, { volume: 0.38, attack: 0.002, release: 0.035, type: 'triangle' }),
    tone(980, 0.03, { volume: 0.2, attack: 0.001, release: 0.025 }),
  );
}

function makeWhoosh() {
  const n = Math.floor(SAMPLE_RATE * 0.35);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const f = 420 + t * 520;
    const noise = (Math.random() * 2 - 1) * 0.28;
    const air = Math.sin(2 * Math.PI * f * t) * 0.22;
    out[i] = (noise + air) * env(0.02, 0.12, 0.2, t, 0.35);
  }
  return out;
}

function makeComplete() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  let out = new Float64Array(0);
  notes.forEach((freq, i) => {
    const note = tone(freq, i === notes.length - 1 ? 0.45 : 0.16, {
      volume: 0.42,
      type: 'triangle',
      attack: 0.01,
      release: i === notes.length - 1 ? 0.28 : 0.08,
    });
    out = place(out, note, i * 0.14);
  });
  return out;
}

// --- Music loops (warm, kid-friendly, honey-theme) ---
const C_MAJOR = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

function softPad(freqs, duration, volume = 0.12) {
  return mix(
    ...freqs.map((f, i) =>
      tone(f, duration, {
        volume: volume * (1 - i * 0.12),
        type: 'triangle',
        attack: 0.35,
        release: 0.45,
      }),
    ),
  );
}

function melodyLine(notes, beat = 0.42, volume = 0.28) {
  let out = new Float64Array(0);
  let t = 0;
  for (const step of notes) {
    if (step.freq) {
      const clip = tone(step.freq, step.beats * beat * 0.92, {
        volume,
        type: 'triangle',
        attack: 0.02,
        release: Math.min(0.18, step.beats * beat * 0.45),
      });
      out = place(out, clip, t);
    }
    t += step.beats * beat;
  }
  const total = Math.floor(t * SAMPLE_RATE);
  if (out.length < total) {
    const padded = new Float64Array(total);
    padded.set(out);
    return padded;
  }
  return out.subarray(0, total);
}

function makeSunnyHive() {
  const pad = softPad([C_MAJOR.C4, C_MAJOR.E4, C_MAJOR.G4], 16.8, 0.12);
  const melody = melodyLine(
    [
      { freq: C_MAJOR.E4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.E4, beats: 1 },
      { freq: C_MAJOR.D4, beats: 1 },
      { freq: C_MAJOR.C4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.E4, beats: 2 },
      { freq: C_MAJOR.E4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.E4, beats: 1 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.E4, beats: 1 },
      { freq: C_MAJOR.D4, beats: 1 },
      { freq: C_MAJOR.C4, beats: 4 },
    ],
    0.42,
    0.28,
  );
  return mix(pad, melody);
}

function makeHoneyHum() {
  const pad = softPad([C_MAJOR.F4, C_MAJOR.A4, C_MAJOR.C5], 18.9, 0.11);
  const hum = tone(C_MAJOR.C4, 18.9, { volume: 0.08, type: 'sine', attack: 0.8, release: 0.8 });
  const melody = melodyLine(
    [
      { freq: C_MAJOR.A4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.F4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.A4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 4 },
      { freq: C_MAJOR.F4, beats: 2 },
      { freq: C_MAJOR.A4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.E4, beats: 2 },
      { freq: C_MAJOR.F4, beats: 4 },
      { freq: null, beats: 2 },
      { freq: C_MAJOR.A4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.F4, beats: 4 },
    ],
    0.45,
    0.26,
  );
  return mix(pad, hum, melody);
}

function makeGardenBuzz() {
  const pad = softPad([C_MAJOR.G4, C_MAJOR.B4, C_MAJOR.D5], 15.12, 0.1);
  const melody = melodyLine(
    [
      { freq: C_MAJOR.G4, beats: 0.5 },
      { freq: C_MAJOR.A4, beats: 0.5 },
      { freq: C_MAJOR.B4, beats: 1 },
      { freq: C_MAJOR.D5, beats: 1 },
      { freq: C_MAJOR.B4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.E5, beats: 1 },
      { freq: C_MAJOR.D5, beats: 1 },
      { freq: C_MAJOR.B4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: null, beats: 1 },
      { freq: C_MAJOR.G4, beats: 0.5 },
      { freq: C_MAJOR.B4, beats: 0.5 },
      { freq: C_MAJOR.D5, beats: 1 },
      { freq: C_MAJOR.E5, beats: 1 },
      { freq: C_MAJOR.D5, beats: 1 },
      { freq: C_MAJOR.B4, beats: 1 },
      { freq: C_MAJOR.G4, beats: 4 },
    ],
    0.36,
    0.28,
  );
  return mix(pad, melody);
}

function makeGoldenMorning() {
  const pad = softPad([C_MAJOR.D4, C_MAJOR.F4, C_MAJOR.A4], 20.16, 0.11);
  const sparkle = melodyLine(
    [
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.D5, beats: 2 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.F4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.C5, beats: 2 },
      { freq: C_MAJOR.A4, beats: 4 },
      { freq: C_MAJOR.F4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.D5, beats: 1 },
      { freq: C_MAJOR.C5, beats: 2 },
      { freq: C_MAJOR.A4, beats: 2 },
      { freq: C_MAJOR.F4, beats: 4 },
      { freq: null, beats: 2 },
      { freq: C_MAJOR.A4, beats: 2 },
      { freq: C_MAJOR.G4, beats: 2 },
      { freq: C_MAJOR.F4, beats: 4 },
    ],
    0.48,
    0.26,
  );
  return mix(pad, sparkle);
}

function makeBeeDance() {
  const pad = softPad([C_MAJOR.C4, C_MAJOR.G4], 14.4, 0.1);
  const melody = melodyLine(
    [
      { freq: C_MAJOR.C5, beats: 0.5 },
      { freq: C_MAJOR.E5, beats: 0.5 },
      { freq: C_MAJOR.G5, beats: 1 },
      { freq: C_MAJOR.E5, beats: 1 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 0.5 },
      { freq: C_MAJOR.C5, beats: 0.5 },
      { freq: C_MAJOR.E5, beats: 1 },
      { freq: C_MAJOR.D5, beats: 1 },
      { freq: C_MAJOR.C5, beats: 2 },
      { freq: C_MAJOR.G4, beats: 1 },
      { freq: C_MAJOR.A4, beats: 1 },
      { freq: C_MAJOR.C5, beats: 1 },
      { freq: C_MAJOR.E5, beats: 1 },
      { freq: C_MAJOR.G5, beats: 2 },
      { freq: C_MAJOR.E5, beats: 2 },
      { freq: C_MAJOR.C5, beats: 4 },
    ],
    0.4,
    0.3,
  );
  return mix(pad, melody);
}

const root = path.join(__dirname, '..');
const sfxDir = path.join(root, 'assets/audio/sfx');
const musicDir = path.join(root, 'assets/audio/music');

const sfx = {
  ding: makeDing(),
  buzz: makeBuzz(),
  hive: makeHive(),
  tap: makeTap(),
  whoosh: makeWhoosh(),
  complete: makeComplete(),
};

const music = {
  sunny_hive: makeSunnyHive(),
  honey_hum: makeHoneyHum(),
  garden_buzz: makeGardenBuzz(),
  golden_morning: makeGoldenMorning(),
  bee_dance: makeBeeDance(),
};

function writeM4a(wavPath) {
  const m4aPath = wavPath.replace(/\.wav$/, '.m4a');
  try {
    execFileSync(
      'afconvert',
      ['-f', 'm4af', '-d', 'aac', '-b', '160000', wavPath, m4aPath],
      { stdio: 'inherit' },
    );
  } catch {
    execFileSync(
      'ffmpeg',
      ['-y', '-i', wavPath, '-c:a', 'aac', '-b:a', '160k', m4aPath],
      { stdio: 'inherit' },
    );
  }
  return m4aPath;
}

for (const [name, samples] of Object.entries(sfx)) {
  const file = path.join(sfxDir, `${name}.wav`);
  writeWav(file, normalize(samples));
  writeM4a(file);
  console.log('sfx', name, (samples.length / SAMPLE_RATE).toFixed(2) + 's');
}

for (const [name, samples] of Object.entries(music)) {
  const file = path.join(musicDir, `${name}.wav`);
  writeWav(file, normalize(samples));
  writeM4a(file);
  console.log('music', name, (samples.length / SAMPLE_RATE).toFixed(2) + 's');
}

console.log('Done generating AlphaBee audio assets.');
