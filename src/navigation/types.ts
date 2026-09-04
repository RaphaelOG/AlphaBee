import type { GradeLevel } from '../data/words';

export type GameMode = 'quest' | 'practice';

export type RootStackParamList = {
  Landing: undefined;
  ModeSelect: undefined;
  Game: {
    mode: GameMode;
    grade?: GradeLevel;
    customWords?: string[];
  };
  HiveRewards: {
    honey: number;
    stars: number;
  };
};
