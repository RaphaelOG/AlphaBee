export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';

export type PhonicsFocus =
  | 'sight'
  | 'cvc'
  | 'blend'
  | 'digraph'
  | 'silent-e'
  | 'r-controlled'
  | 'vowel-team'
  | 'diphthong'
  | 'ending'
  | 'multisyllable'
  | 'affix'
  | 'academic';

export type CurriculumUnit = {
  id: string;
  grade: GradeLevel;
  order: number;
  title: string;
  focus: PhonicsFocus;
  focusLabel: string;
  description: string;
  words: string[];
};

export const GRADE_LEVELS: GradeLevel[] = ['K', '1', '2', '3', '4', '5'];

export const GRADE_CURRICULUM_BLURBS: Record<GradeLevel, string> = {
  K: 'Sight words + short-vowel CVC patterns',
  '1': 'Digraphs, blends, and silent-e magic',
  '2': 'R-controlled vowels and vowel teams',
  '3': 'Diphthongs, endings, and bigger words',
  '4': 'Prefixes, suffixes, and multisyllable spelling',
  '5': 'Roots, academic words, and challenge patterns',
};

/**
 * Sequenced K–5 spelling path aligned to common phonics progressions
 * (short vowels → digraphs/blends → silent e → r-controlled → vowel teams →
 * diphthongs → affixes → academic/morphology).
 */
export const CURRICULUM_UNITS: CurriculumUnit[] = [
  // ——— Kindergarten ———
  {
    id: 'k-sight-1',
    grade: 'K',
    order: 1,
    title: 'Sight Words · Set 1',
    focus: 'sight',
    focusLabel: 'Sight words',
    description: 'High-frequency words to recognize and spell by heart.',
    words: ['a', 'I', 'the', 'to', 'and', 'is', 'it', 'in', 'you', 'me'],
  },
  {
    id: 'k-cvc-a',
    grade: 'K',
    order: 2,
    title: 'Short A · CVC',
    focus: 'cvc',
    focusLabel: 'CVC · short a',
    description: 'Consonant–vowel–consonant words with short /a/.',
    words: ['cat', 'bat', 'hat', 'map', 'man', 'pan', 'sad', 'bag', 'tap', 'dad'],
  },
  {
    id: 'k-cvc-e',
    grade: 'K',
    order: 3,
    title: 'Short E · CVC',
    focus: 'cvc',
    focusLabel: 'CVC · short e',
    description: 'Consonant–vowel–consonant words with short /e/.',
    words: ['bed', 'red', 'hen', 'pen', 'wet', 'pet', 'net', 'ten', 'leg', 'jet'],
  },
  {
    id: 'k-cvc-i',
    grade: 'K',
    order: 4,
    title: 'Short I · CVC',
    focus: 'cvc',
    focusLabel: 'CVC · short i',
    description: 'Consonant–vowel–consonant words with short /i/.',
    words: ['pig', 'big', 'sit', 'hit', 'lip', 'dig', 'win', 'six', 'kid', 'zip'],
  },
  {
    id: 'k-cvc-o',
    grade: 'K',
    order: 5,
    title: 'Short O · CVC',
    focus: 'cvc',
    focusLabel: 'CVC · short o',
    description: 'Consonant–vowel–consonant words with short /o/.',
    words: ['dog', 'hop', 'top', 'log', 'box', 'fox', 'pot', 'hot', 'mop', 'job'],
  },
  {
    id: 'k-cvc-u',
    grade: 'K',
    order: 6,
    title: 'Short U · CVC',
    focus: 'cvc',
    focusLabel: 'CVC · short u',
    description: 'Consonant–vowel–consonant words with short /u/.',
    words: ['bug', 'sun', 'cup', 'mud', 'run', 'hug', 'bus', 'tub', 'nut', 'fun'],
  },
  {
    id: 'k-sight-2',
    grade: 'K',
    order: 7,
    title: 'Sight Words · Set 2',
    focus: 'sight',
    focusLabel: 'Sight words',
    description: 'More everyday words that don’t always follow CVC rules.',
    words: ['we', 'he', 'she', 'my', 'on', 'up', 'go', 'no', 'see', 'like'],
  },

  // ——— Grade 1 ———
  {
    id: '1-sight',
    grade: '1',
    order: 1,
    title: 'Sight Words · Grade 1',
    focus: 'sight',
    focusLabel: 'Sight words',
    description: 'Common Grade 1 words for quick recognition.',
    words: ['said', 'were', 'what', 'when', 'there', 'their', 'have', 'from', 'they', 'come'],
  },
  {
    id: '1-digraph-sh-ch',
    grade: '1',
    order: 2,
    title: 'Digraphs · sh & ch',
    focus: 'digraph',
    focusLabel: 'Digraphs',
    description: 'Two letters that make one sound: sh and ch.',
    words: ['ship', 'shop', 'fish', 'wish', 'chop', 'chip', 'much', 'chat', 'shut', 'rich'],
  },
  {
    id: '1-digraph-th-wh',
    grade: '1',
    order: 3,
    title: 'Digraphs · th & wh',
    focus: 'digraph',
    focusLabel: 'Digraphs',
    description: 'Practice th and wh sound spellings.',
    words: ['this', 'that', 'with', 'path', 'thin', 'when', 'whip', 'whiz', 'bath', 'math'],
  },
  {
    id: '1-blend-begin',
    grade: '1',
    order: 4,
    title: 'Beginning Blends',
    focus: 'blend',
    focusLabel: 'Blends',
    description: 'Two consonants blended at the start (bl, br, st, tr…).',
    words: ['frog', 'flag', 'stop', 'trip', 'clap', 'crab', 'plan', 'sled', 'spin', 'drum'],
  },
  {
    id: '1-blend-end',
    grade: '1',
    order: 5,
    title: 'Ending Blends',
    focus: 'blend',
    focusLabel: 'Blends',
    description: 'Consonant blends at the end of the word (mp, nd, nk…).',
    words: ['jump', 'lamp', 'hand', 'wind', 'desk', 'milk', 'nest', 'mask', 'pink', 'cold'],
  },
  {
    id: '1-silent-e',
    grade: '1',
    order: 6,
    title: 'Silent E · Intro',
    focus: 'silent-e',
    focusLabel: 'Silent e',
    description: 'Magic e makes the vowel say its name (cake, bike).',
    words: ['cake', 'bake', 'lake', 'bike', 'like', 'ride', 'home', 'bone', 'cute', 'mule'],
  },

  // ——— Grade 2 ———
  {
    id: '2-silent-e',
    grade: '2',
    order: 1,
    title: 'Silent E · Mastery',
    focus: 'silent-e',
    focusLabel: 'Silent e',
    description: 'Longer silent-e words and mixed vowels.',
    words: ['brave', 'grape', 'flame', 'smile', 'stone', 'close', 'flute', 'prune', 'theme', 'these'],
  },
  {
    id: '2-r-ar-or',
    grade: '2',
    order: 2,
    title: 'R-Controlled · ar & or',
    focus: 'r-controlled',
    focusLabel: 'R-controlled',
    description: 'When r changes the vowel: car, for, corn.',
    words: ['star', 'farm', 'park', 'card', 'bark', 'corn', 'fork', 'born', 'storm', 'short'],
  },
  {
    id: '2-r-er-ir-ur',
    grade: '2',
    order: 3,
    title: 'R-Controlled · er, ir, ur',
    focus: 'r-controlled',
    focusLabel: 'R-controlled',
    description: 'The /er/ sound spelled er, ir, or ur.',
    words: ['bird', 'girl', 'turn', 'hurt', 'her', 'fern', 'curl', 'third', 'nurse', 'shirt'],
  },
  {
    id: '2-vowel-ai-ay',
    grade: '2',
    order: 4,
    title: 'Vowel Teams · ai & ay',
    focus: 'vowel-team',
    focusLabel: 'Vowel teams',
    description: 'Long /a/ spelled ai or ay.',
    words: ['rain', 'train', 'paint', 'sail', 'mail', 'day', 'play', 'stay', 'clay', 'tray'],
  },
  {
    id: '2-vowel-ee-ea',
    grade: '2',
    order: 5,
    title: 'Vowel Teams · ee & ea',
    focus: 'vowel-team',
    focusLabel: 'Vowel teams',
    description: 'Long /e/ spelled ee or ea.',
    words: ['tree', 'green', 'sleep', 'queen', 'sheep', 'beach', 'read', 'leaf', 'dream', 'clean'],
  },
  {
    id: '2-vowel-oa-ow',
    grade: '2',
    order: 6,
    title: 'Vowel Teams · oa & ow',
    focus: 'vowel-team',
    focusLabel: 'Vowel teams',
    description: 'Long /o/ spelled oa or ow.',
    words: ['boat', 'coat', 'road', 'soap', 'goat', 'snow', 'grow', 'show', 'blow', 'yellow'],
  },

  // ——— Grade 3 ———
  {
    id: '3-diphthong',
    grade: '3',
    order: 1,
    title: 'Diphthongs · oi, oy, ou, ow',
    focus: 'diphthong',
    focusLabel: 'Diphthongs',
    description: 'Gliding vowel sounds: boil, boy, cloud, cow.',
    words: ['boil', 'coin', 'join', 'boy', 'toy', 'cloud', 'house', 'found', 'brown', 'crowd'],
  },
  {
    id: '3-endings',
    grade: '3',
    order: 2,
    title: 'Endings · -ed & -ing',
    focus: 'ending',
    focusLabel: 'Word endings',
    description: 'Base words with common inflectional endings.',
    words: ['jumped', 'asked', 'played', 'hoped', 'running', 'sitting', 'making', 'smiling', 'closed', 'shared'],
  },
  {
    id: '3-compound',
    grade: '3',
    order: 3,
    title: 'Compound Words',
    focus: 'multisyllable',
    focusLabel: 'Multisyllable',
    description: 'Two smaller words joined into one.',
    words: ['sunset', 'rainbow', 'backpack', 'cupcake', 'football', 'sunshine', 'bedroom', 'notebook', 'popcorn', 'starfish'],
  },
  {
    id: '3-prefix',
    grade: '3',
    order: 4,
    title: 'Prefixes · un- & re-',
    focus: 'affix',
    focusLabel: 'Prefixes',
    description: 'un- (not) and re- (again) change a word’s meaning.',
    words: ['unhappy', 'unfair', 'unlock', 'untie', 'reuse', 'rebuild', 'rewrite', 'reread', 'unsafe', 'refill'],
  },
  {
    id: '3-multi',
    grade: '3',
    order: 5,
    title: 'Two-Syllable Challenge',
    focus: 'multisyllable',
    focusLabel: 'Multisyllable',
    description: 'Break bigger words into chunks to spell them.',
    words: ['garden', 'planet', 'castle', 'forest', 'silver', 'market', 'pirate', 'spider', 'winter', 'summer'],
  },
  {
    id: '3-tricky',
    grade: '3',
    order: 6,
    title: 'Tricky Patterns',
    focus: 'sight',
    focusLabel: 'Tricky words',
    description: 'Words with less predictable spellings.',
    words: ['friend', 'enough', 'though', 'people', 'because', 'through', 'answer', 'island', 'listen', 'often'],
  },

  // ——— Grade 4 ———
  {
    id: '4-prefix',
    grade: '4',
    order: 1,
    title: 'Prefixes · dis-, pre-, mis-',
    focus: 'affix',
    focusLabel: 'Prefixes',
    description: 'Build meaning with dis-, pre-, and mis-.',
    words: ['disagree', 'dislike', 'preheat', 'preview', 'misplace', 'mistake', 'disconnect', 'prehistoric', 'misread', 'prefix'],
  },
  {
    id: '4-suffix',
    grade: '4',
    order: 2,
    title: 'Suffixes · -ful, -less, -ness',
    focus: 'affix',
    focusLabel: 'Suffixes',
    description: 'Endings that turn words into new parts of speech.',
    words: ['hopeful', 'careful', 'fearless', 'homeless', 'kindness', 'darkness', 'joyful', 'useless', 'brightness', 'softness'],
  },
  {
    id: '4-multi',
    grade: '4',
    order: 3,
    title: 'Multisyllable Adventures',
    focus: 'multisyllable',
    focusLabel: 'Multisyllable',
    description: 'Longer words with clear syllable chunks.',
    words: ['journey', 'diamond', 'whisper', 'balance', 'curious', 'harmony', 'capture', 'freedom', 'lantern', 'horizon'],
  },
  {
    id: '4-content',
    grade: '4',
    order: 4,
    title: 'Content Words',
    focus: 'academic',
    focusLabel: 'Content words',
    description: 'Useful school and science vocabulary.',
    words: ['ancient', 'blizzard', 'boulder', 'compass', 'crystal', 'glacier', 'kingdom', 'library', 'pyramid', 'voyage'],
  },
  {
    id: '4-homophone',
    grade: '4',
    order: 5,
    title: 'Homophones & Lookalikes',
    focus: 'sight',
    focusLabel: 'Homophones',
    description: 'Words that sound alike but are spelled differently.',
    words: ['their', 'there', 'which', 'witch', 'hear', 'here', 'peace', 'piece', 'flour', 'flower'],
  },
  {
    id: '4-challenge',
    grade: '4',
    order: 6,
    title: 'Spelling Challenge',
    focus: 'academic',
    focusLabel: 'Challenge',
    description: 'Tricky mid-length words for confident spellers.',
    words: ['courage', 'imagine', 'mystery', 'navigate', 'pioneer', 'shimmer', 'triumph', 'builder', 'category', 'discover'],
  },

  // ——— Grade 5 ———
  {
    id: '5-roots',
    grade: '5',
    order: 1,
    title: 'Greek & Latin Roots',
    focus: 'academic',
    focusLabel: 'Roots',
    description: 'Roots like tele-, spect-, and graph- unlock big words.',
    words: ['telephone', 'telescope', 'spectator', 'inspect', 'autograph', 'photograph', 'biology', 'geography', 'transport', 'export'],
  },
  {
    id: '5-suffix-ion',
    grade: '5',
    order: 2,
    title: 'Suffixes · -tion & -sion',
    focus: 'affix',
    focusLabel: 'Suffixes',
    description: 'Noun-forming endings -tion and -sion.',
    words: ['action', 'nation', 'invention', 'education', 'decision', 'television', 'question', 'attention', 'expression', 'celebration'],
  },
  {
    id: '5-academic',
    grade: '5',
    order: 3,
    title: 'Academic Vocabulary',
    focus: 'academic',
    focusLabel: 'Academic words',
    description: 'Words often found in upper-elementary reading.',
    words: ['adventure', 'beautiful', 'discovery', 'excellent', 'knowledge', 'lightning', 'mysterious', 'treasure', 'brilliant', 'challenge'],
  },
  {
    id: '5-multi',
    grade: '5',
    order: 4,
    title: 'Long Word Builders',
    focus: 'multisyllable',
    focusLabel: 'Multisyllable',
    description: 'Break long words into meaningful parts.',
    words: ['accomplish', 'astronomy', 'constellation', 'fascinating', 'generation', 'incredible', 'magnificent', 'phenomenon', 'spectacular', 'technology'],
  },
  {
    id: '5-morph',
    grade: '5',
    order: 5,
    title: 'Morphology Mix',
    focus: 'affix',
    focusLabel: 'Word parts',
    description: 'Prefixes, roots, and suffixes working together.',
    words: ['uncomfortable', 'reappear', 'disappear', 'prediction', 'incomplete', 'underground', 'overboard', 'wonderful', 'carefulness', 'unbelievable'],
  },
  {
    id: '5-challenge',
    grade: '5',
    order: 6,
    title: 'Expert Hive Challenge',
    focus: 'academic',
    focusLabel: 'Challenge',
    description: 'Top-shelf spellings for Grade 5 experts.',
    words: ['courageous', 'illuminated', 'inspiration', 'invincible', 'leadership', 'legendary', 'navigator', 'prosperous', 'remarkable', 'wilderness'],
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function gradeLabel(grade: GradeLevel): string {
  return grade === 'K' ? 'Grade K' : `Grade ${grade}`;
}

export function getUnitsForGrade(grade: GradeLevel): CurriculumUnit[] {
  return CURRICULUM_UNITS.filter((u) => u.grade === grade).sort((a, b) => a.order - b.order);
}

export function getUnitById(unitId: string): CurriculumUnit | undefined {
  return CURRICULUM_UNITS.find((u) => u.id === unitId);
}

export function getDefaultUnitId(grade: GradeLevel): string {
  return getUnitsForGrade(grade)[0]?.id ?? 'k-cvc-a';
}

/** Flat word list for a grade (all units combined). */
export function getWordsForGrade(grade: GradeLevel): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const unit of getUnitsForGrade(grade)) {
    for (const w of unit.words) {
      const cleaned = w.trim().toLowerCase();
      // Skip apostrophe variants that aren't plain spellable yet (e.g. theyre → keep as letters-only practice)
      if (!cleaned || seen.has(cleaned)) continue;
      seen.add(cleaned);
      words.push(cleaned);
    }
  }
  return words;
}

/** @deprecated Prefer curriculum unit helpers; kept for sample chips / compatibility. */
export const WORDS_BY_GRADE: Record<GradeLevel, string[]> = {
  K: getWordsForGrade('K'),
  '1': getWordsForGrade('1'),
  '2': getWordsForGrade('2'),
  '3': getWordsForGrade('3'),
  '4': getWordsForGrade('4'),
  '5': getWordsForGrade('5'),
};

export function getRandomWord(grade: GradeLevel, exclude?: string): string {
  const pool = getWordsForGrade(grade);
  const filtered = exclude ? pool.filter((w) => w !== exclude) : pool;
  const list = filtered.length > 0 ? filtered : pool;
  return list[Math.floor(Math.random() * list.length)] ?? 'bee';
}

export type QuestWordPicker = {
  word: string;
  unit: CurriculumUnit;
  unitIndex: number;
  wordsLeftInUnit: number;
};

/**
 * Builds a session picker that walks units in order.
 * Within each unit, words are shuffled once; when the unit is finished, advance to the next.
 */
export function createQuestSession(grade: GradeLevel, startUnitId?: string) {
  const units = getUnitsForGrade(grade);
  let unitIndex = Math.max(
    0,
    startUnitId ? units.findIndex((u) => u.id === startUnitId) : 0,
  );
  if (unitIndex < 0) unitIndex = 0;

  let queue = shuffle(units[unitIndex]?.words.map((w) => w.trim().toLowerCase()) ?? ['bee']);

  const currentUnit = () => units[unitIndex] ?? units[0];

  const refillFromUnit = (index: number) => {
    unitIndex = index;
    queue = shuffle(units[unitIndex].words.map((w) => w.trim().toLowerCase()));
  };

  const next = (exclude?: string): QuestWordPicker => {
    if (queue.length === 0) {
      const nextIndex = (unitIndex + 1) % units.length;
      refillFromUnit(nextIndex);
    }

    let word = queue.shift()!;
    if (exclude && word === exclude && queue.length > 0) {
      queue.push(word);
      word = queue.shift()!;
    } else if (exclude && word === exclude && units.length > 1) {
      // Only one word left matched exclude — pull from next unit briefly
      const nextIndex = (unitIndex + 1) % units.length;
      refillFromUnit(nextIndex);
      word = queue.shift()!;
    }

    return {
      word,
      unit: currentUnit(),
      unitIndex,
      wordsLeftInUnit: queue.length,
    };
  };

  const peekUnit = () => currentUnit();

  return { next, peekUnit, units };
}
