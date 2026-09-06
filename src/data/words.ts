export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';

export const GRADE_LEVELS: GradeLevel[] = ['K', '1', '2', '3', '4', '5'];

export const WORDS_BY_GRADE: Record<GradeLevel, string[]> = {
  K: [
    'cat', 'dog', 'sun', 'bee', 'hat', 'red', 'cup', 'map', 'pig', 'bus',
    'bug', 'bed', 'box', 'bat', 'cow', 'day', 'fox', 'fly', 'hop', 'hug',
    'jam', 'jet', 'key', 'log', 'man', 'mud', 'net', 'nut', 'pan', 'pen',
    'pet', 'run', 'sad', 'sit', 'top', 'toy', 'tub', 'van', 'wet', 'zip'
  ],
  '1': [
    'ship', 'frog', 'cake', 'jump', 'rain', 'bird', 'leaf', 'moon', 'star', 'fish',
    'barn', 'boat', 'book', 'camp', 'card', 'claw', 'cold', 'cook', 'crab', 'desk',
    'door', 'duck', 'farm', 'fire', 'flag', 'goat', 'gold', 'hand', 'hill', 'home',
    'king', 'lamp', 'milk', 'nest', 'park', 'ring', 'sing', 'snow', 'tree', 'wind'
  ],
  '2': [
    'happy', 'plant', 'tiger', 'cloud', 'brave', 'honey', 'spell', 'queen', 'zebra', 'flute',
    'apple', 'beach', 'bread', 'chalk', 'dance', 'dream', 'earth', 'giant', 'globe', 'grape',
    'green', 'horse', 'house', 'lemon', 'magic', 'mouse', 'music', 'ocean', 'party', 'river',
    'robin', 'robot', 'smile', 'space', 'storm', 'train', 'water', 'whale', 'white', 'world'
  ],
  '3': [
    'garden', 'island', 'planet', 'wonder', 'silver', 'castle', 'forest', 'bright', 'friend', 'puzzle',
    'anchor', 'autumn', 'bridge', 'candle', 'canyon', 'clever', 'dragon', 'energy', 'family', 'feather',
    'fossil', 'gentle', 'harbor', 'jungle', 'knight', 'legend', 'market', 'meadow', 'nature', 'palace',
    'pirate', 'planet', 'rescue', 'shadow', 'silent', 'spider', 'spring', 'stream', 'summer', 'winter'
  ], '4': [
    'journey', 'diamond', 'whisper', 'balance', 'curious', 'harmony', 'meadow', 'capture', 'freedom', 'lantern',
    'ancient', 'blizzard', 'boulder', 'builder', 'category', 'champion', 'climb', 'courage', 'compass', 'crystal',
    'dinosaur', 'discover', 'dungeon', 'explorer', 'fortress', 'glacier', 'horizon', 'imagine', 'kingdom', 'library',
    'mystery', 'monster', 'navigate', 'pioneer', 'pyramid', 'shimmer', 'starlight', 'stumble', 'triumph', 'voyage'
  ],
  '5': [
    'adventure', 'beautiful', 'champion', 'discovery', 'excellent', 'fantastic', 'knowledge', 'lightning', 'mysterious', 'treasure',
    'accomplish', 'astronomy', 'brilliant', 'challenge', 'constellation', 'courageous', 'fascinating', 'flourish', 'generation', 'illuminated',
    'incredible', 'ingredient', 'inspiration', 'invention', 'invincible', 'leadership', 'legendary', 'magnificent', 'navigator', 'phenomenon',
    'prosperous', 'remarkable', 'spectacular', 'technology', 'telescope', 'temptation', 'underwater', 'universe', 'wilderness', 'wonderland'
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
