/**
 * Compatibility barrel — curriculum is the source of truth.
 * Prefer importing from './curriculum' for new code.
 */
export {
  type GradeLevel,
  type PhonicsFocus,
  type CurriculumUnit,
  type QuestWordPicker,
  GRADE_LEVELS,
  GRADE_CURRICULUM_BLURBS,
  CURRICULUM_UNITS,
  WORDS_BY_GRADE,
  gradeLabel,
  getUnitsForGrade,
  getUnitById,
  getDefaultUnitId,
  getWordsForGrade,
  getRandomWord,
  createQuestSession,
} from './curriculum';
