import type { GradeLevel } from '../data/words';
import type { QuestId } from '../data/quests';

export type GameMode = 'quest' | 'practice';

export type RootStackParamList = {
  Landing: undefined;
  Auth: undefined;
  ChildSelect: undefined;
  ModeSelect: undefined;
  Settings: undefined;
  Game: {
    mode: GameMode;
    grade?: GradeLevel;
    /** Curriculum unit to start from in Grade Quest */
    unitId?: string;
    customWords?: string[];
    /** How many words to master before the session ends */
    wordGoal: number;
    questId: QuestId;
    questTitle: string;
  };
  SessionComplete: {
    honey: number;
    stars: number;
    wordsCompleted: number;
    wordGoal: number;
    questTitle: string;
    mode: GameMode;
    questId: QuestId;
    grade?: GradeLevel;
    unitId?: string;
  };
  HiveRewards: {
    honey: number;
    stars: number;
  };
};
