export type QuestId = 'quick' | 'classic' | 'hero';

export type QuestOption = {
  id: QuestId;
  wordGoal: number;
  title: string;
  subtitle: string;
  badge: string;
};

/** Short session quests — play ends when the word goal is met. */
export const QUEST_OPTIONS: QuestOption[] = [
  {
    id: 'quick',
    wordGoal: 5,
    title: 'Quick Buzz',
    subtitle: 'Spell 5 words',
    badge: '5',
  },
  {
    id: 'classic',
    wordGoal: 10,
    title: 'Honey Hunt',
    subtitle: 'Spell 10 words',
    badge: '10',
  },
  {
    id: 'hero',
    wordGoal: 15,
    title: 'Hive Hero',
    subtitle: 'Spell 15 words',
    badge: '15',
  },
];

export function getQuestById(id: QuestId): QuestOption {
  return QUEST_OPTIONS.find((q) => q.id === id) ?? QUEST_OPTIONS[1];
}

export function getQuestByGoal(wordGoal: number): QuestOption {
  return QUEST_OPTIONS.find((q) => q.wordGoal === wordGoal) ?? QUEST_OPTIONS[1];
}
