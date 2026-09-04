export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';

export const GRADE_LEVELS: GradeLevel[] = ['K', '1', '2', '3', '4', '5'];

export const WORDS_BY_GRADE: Record<GradeLevel, string[]> = {
  K: ['cat', 'dog', 'sun', 'bee', 'hat', 'red', 'cup', 'map', 'pig', 'bus'],
  '1': ['ship', 'frog', 'cake', 'jump', 'rain', 'bird', 'leaf', 'moon', 'star', 'fish'],
  '2': ['happy', 'plant', 'tiger', 'cloud', 'brave', 'honey', 'spell', 'queen', 'zebra', 'flute'],
  '3': ['garden', 'island', 'planet', 'wonder', 'silver', 'castle', 'forest', 'bright', 'friend', 'puzzle'],
  '4': ['journey', 'diamond', 'whisper', 'balance', 'curious', 'harmony', 'meadow', 'capture', 'freedom', 'lantern'],
  '5': [
    'adventure',
    'beautiful',
    'champion',
    'discovery',
    'excellent',
    'fantastic',
    'knowledge',
    'lightning',
    'mysterious',
    'treasure',
  ],
};

export function getRandomWord(grade: GradeLevel, exclude?: string): string {
  const pool = WORDS_BY_GRADE[grade];
  const filtered = exclude ? pool.filter((w) => w !== exclude) : pool;
  const list = filtered.length > 0 ? filtered : pool;
  return list[Math.floor(Math.random() * list.length)];
}

export function gradeLabel(grade: GradeLevel): string {
  return grade === 'K' ? 'Grade K' : `Grade ${grade}`;
}
