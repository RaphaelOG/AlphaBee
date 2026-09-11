import type { GradeLevel } from '../data/words';

export type GameMode = 'quest' | 'practice';

export type RootStackParamList = {
  Landing: undefined;
  ModeSelect: undefined;
  Game: {
    mode: GameMode;
    grade?: GradeLevel;
    /** Curriculum unit to start from in Grade Quest */
    unitId?: string;
    customWords?: string[];
  };
  HiveRewards: {
    honey: number;
    stars: number;
  };
};
