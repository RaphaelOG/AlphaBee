import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Hexagon } from './Hexagon';
import { AlphaBee } from './AlphaBee';
import { HiveStructure } from './HiveDecor';
import { colors, typography } from '../theme';
import type { GradeLevel } from '../data/words';
import { GRADE_LEVELS, WORDS_BY_GRADE, gradeLabel } from '../data/words';
import type { GameMode } from '../navigation/types';

type ModeSwitcherProps = {
  mode: GameMode;
  grade: GradeLevel;
  onModeChange: (mode: GameMode) => void;
  onGradeChange: (grade: GradeLevel) => void;
  onOpenPractice: () => void;
};

const GRADE_BLURBS: Record<GradeLevel, string> = {
  K: 'Short 3-letter words',
  '1': 'Friendly starter words',
  '2': 'Growing vocabulary',
  '3': 'Bigger spelling challenges',
  '4': 'Longer adventure words',
  '5': 'Expert hive words',
};

export function ModeSwitcher({
  mode,
  grade,
  onModeChange,
  onGradeChange,
  onOpenPractice,
}: ModeSwitcherProps) {
  const sampleWords = WORDS_BY_GRADE[grade].slice(0, 4);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.heroDecorLeft} pointerEvents="none">
          <HiveStructure size={72} />
        </View>
        <View style={styles.heroCenter}>
          <AlphaBee size={58} happy />
          <Text style={styles.brand}>AlphaBee</Text>
          <Text style={typography.title}>Choose Your Hive</Text>
          <Text style={[typography.subtitle, styles.sub]}>
            Pick how you want to buzz through spelling today
          </Text>
        </View>
        <View style={styles.heroDecorRight} pointerEvents="none">
          <Hexagon size={36} fill={colors.goldBright} fillEnd={colors.gold} stroke={colors.honeyDark} />
          <Hexagon
            size={28}
            fill={colors.honeyLight}
            fillEnd={colors.honey}
            stroke={colors.honeyDark}
            style={styles.hexOffset}
          />
        </View>
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.sectionLabel}>How spelling works</Text>
        <View style={styles.stepsRow}>
          <View style={styles.step}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Look</Text>
            <Text style={styles.stepDesc}>See the word and spell it once</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.step}>
            <View style={[styles.stepBadge, styles.stepBadgeAlt]}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Listen</Text>
            <Text style={styles.stepDesc}>Hear the same word and spell from memory</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Game modes</Text>
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => onModeChange('quest')}
          style={[styles.modeCard, mode === 'quest' && styles.modeCardActive]}
        >
          <Hexagon size={58} fill={colors.goldBright} fillEnd={colors.gold} stroke={colors.honeyDark}>
            <Text style={styles.modeIcon}>Q</Text>
          </Hexagon>
          <Text style={styles.modeTitle}>Grade Quest</Text>
          <Text style={styles.modeDesc}>Built-in words matched to each grade level</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• K through Grade 5 paths</Text>
            <Text style={styles.bullet}>• Look, then listen rounds</Text>
            <Text style={styles.bullet}>• Earn honey as you go</Text>
          </View>
          {mode === 'quest' ? <Text style={styles.selectedTag}>Selected</Text> : null}
        </Pressable>

        <Pressable
          onPress={() => {
            onModeChange('practice');
            onOpenPractice();
          }}
          style={[styles.modeCard, mode === 'practice' && styles.modeCardActive]}
        >
          <Hexagon size={58} fill={colors.honeyLight} fillEnd={colors.honey} stroke={colors.honeyDark}>
            <Text style={styles.modeIcon}>P</Text>
          </Hexagon>
          <Text style={styles.modeTitle}>Practice Hive</Text>
          <Text style={styles.modeDesc}>Parents & teachers add custom vocabulary</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Weekly spelling lists</Text>
            <Text style={styles.bullet}>• Type words in a quick modal</Text>
            <Text style={styles.bullet}>• Same fun game mechanics</Text>
          </View>
          <Text style={styles.openTag}>Tap to open</Text>
        </Pressable>
      </View>

      {mode === 'quest' ? (
        <View style={styles.gradesPanel}>
          <View style={styles.gradesHeader}>
            <Text style={styles.sectionLabel}>Pick a grade badge</Text>
            <Text style={styles.gradeActiveLabel}>{gradeLabel(grade)}</Text>
          </View>
          <Text style={styles.gradeBlurb}>{GRADE_BLURBS[grade]}</Text>

          <View style={styles.badgeRow}>
            {GRADE_LEVELS.map((g) => {
              const active = g === grade;
              return (
                <Pressable
                  key={g}
                  onPress={() => onGradeChange(g)}
                  style={[styles.badge, active && styles.badgeActive]}
                  accessibilityLabel={gradeLabel(g)}
                >
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                    {g === 'K' ? 'K' : g}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sampleBox}>
            <Text style={styles.sampleLabel}>Sample words in this hive</Text>
            <View style={styles.sampleChips}>
              {sampleWords.map((word) => (
                <View key={word} style={styles.sampleChip}>
                  <Text style={styles.sampleChipText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.footerNote}>
        <Hexagon size={22} fill={colors.gold} fillEnd={colors.honey} stroke={colors.honeyDark} strokeWidth={1.5} />
        <Text style={styles.footerNoteText}>
          Correct spells fill your hive with honey drops and stars
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  hero: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroDecorLeft: {
    opacity: 0.85,
    marginTop: 8,
  },
  heroDecorRight: {
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  hexOffset: {
    marginLeft: 12,
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  brand: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.honeyDark,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  sub: {
    textAlign: 'center',
    marginTop: 4,
  },
  sectionLabel: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    color: colors.honeyDark,
  },
  howItWorks: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    padding: 14,
    gap: 12,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.honeyDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeAlt: {
    backgroundColor: colors.honey,
  },
  stepNum: {
    fontFamily: 'Nunito_900Black',
    fontSize: 14,
    color: colors.white,
  },
  stepTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text,
  },
  stepDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  stepConnector: {
    width: 18,
    height: 3,
    backgroundColor: colors.honeyLight,
    borderRadius: 2,
    marginTop: 14,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    gap: 6,
  },
  modeCardActive: {
    borderColor: colors.honeyDark,
    backgroundColor: colors.creamSoft,
  },
  modeIcon: {
    fontFamily: 'Nunito_900Black',
    fontSize: 20,
    color: colors.honeyDark,
  },
  modeTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  modeDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 2,
  },
  bulletList: {
    width: '100%',
    gap: 4,
    marginTop: 4,
  },
  bullet: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.brown,
    textAlign: 'left',
    paddingLeft: 4,
  },
  selectedTag: {
    marginTop: 6,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: colors.honeyDark,
    backgroundColor: colors.goldBright,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  openTag: {
    marginTop: 6,
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.honeyDark,
  },
  gradesPanel: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.honey,
    padding: 14,
    gap: 10,
  },
  gradesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  gradeActiveLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.white,
    backgroundColor: colors.honeyDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradeBlurb: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    alignSelf: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.creamSoft,
    borderWidth: 2,
    borderColor: colors.honeyLight,
  },
  badgeActive: {
    backgroundColor: colors.gold,
    borderColor: colors.honeyDark,
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.honeyDark,
  },
  badgeTextActive: {
    color: colors.white,
  },
  sampleBox: {
    width: '100%',
    backgroundColor: colors.creamSoft,
    borderRadius: 16,
    padding: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
  },
  sampleLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.textMuted,
  },
  sampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleChip: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.honey,
  },
  sampleChipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.text,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  footerNoteText: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
