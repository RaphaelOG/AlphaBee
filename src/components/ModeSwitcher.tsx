import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hexagon } from './Hexagon';
import { AlphaBee } from './AlphaBee';
import { Beehive } from './HiveDecor';
import { KidCard, Pill, SpeechBubble, Sticker, toneColors, type KidTone } from './KidUI';
import { colors, fonts, typography } from '../theme';
import type { GradeLevel } from '../data/words';
import {
  GRADE_LEVELS,
  GRADE_CURRICULUM_BLURBS,
  getDefaultUnitId,
  getUnitById,
  getUnitsForGrade,
  gradeLabel,
} from '../data/curriculum';
import type { GameMode } from '../navigation/types';

type ModeSwitcherProps = {
  mode: GameMode;
  grade: GradeLevel;
  unitId: string;
  onModeChange: (mode: GameMode) => void;
  onGradeChange: (grade: GradeLevel) => void;
  onUnitChange: (unitId: string) => void;
  onOpenPractice: () => void;
  learnerName?: string;
};

const GRADE_TONES: KidTone[] = ['coral', 'honey', 'leaf', 'sky', 'berry', 'honey'];
const UNIT_TONES: KidTone[] = ['honey', 'leaf', 'sky', 'coral', 'berry'];

export function ModeSwitcher({
  mode,
  grade,
  unitId,
  onModeChange,
  onGradeChange,
  onUnitChange,
  onOpenPractice,
  learnerName,
}: ModeSwitcherProps) {
  const units = useMemo(() => getUnitsForGrade(grade), [grade]);
  const activeUnit = getUnitById(unitId) ?? units[0];
  const sampleWords = (activeUnit?.words ?? []).slice(0, 4);

  useEffect(() => {
    if (!units.some((u) => u.id === unitId)) {
      onUnitChange(getDefaultUnitId(grade));
    }
  }, [grade, unitId, units, onUnitChange]);

  return (
    <View style={styles.wrap}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBee}>
          <AlphaBee size={104} mood="happy" />
        </View>
        <View style={styles.heroText}>
          <SpeechBubble
            text={learnerName ? `Hi ${learnerName}! Where should we buzz today?` : 'Where should we buzz today?'}
            tail="left"
            style={styles.heroBubble}
          />
          <Text style={styles.heroTitle}>Choose Your Hive</Text>
        </View>
        <View style={styles.heroHive} pointerEvents="none">
          <Beehive size={64} branch={false} />
        </View>
      </View>

      {/* How it works */}
      <KidCard tone="sky" contentStyle={styles.howCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="sparkles" size={16} color={colors.skyNight} />
          <Text style={[typography.eyebrow, { color: colors.skyNight }]}>How spelling works</Text>
        </View>
        <View style={styles.stepsRow}>
          <View style={styles.step}>
            <View style={[styles.stepBadge, { backgroundColor: colors.gold }]}>
              <Ionicons name="eye" size={22} color={colors.white} />
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
            </View>
            <Text style={styles.stepTitle}>Look</Text>
            <Text style={styles.stepDesc}>See the word, then spell it</Text>
          </View>
          <View style={styles.stepArrow}>
            <Ionicons name="arrow-forward" size={20} color={colors.skyDeep} />
          </View>
          <View style={styles.step}>
            <View style={[styles.stepBadge, { backgroundColor: colors.coral }]}>
              <Ionicons name="ear" size={22} color={colors.white} />
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
            </View>
            <Text style={styles.stepTitle}>Listen</Text>
            <Text style={styles.stepDesc}>Hear it and spell from memory</Text>
          </View>
          <View style={styles.stepArrow}>
            <Ionicons name="arrow-forward" size={20} color={colors.skyDeep} />
          </View>
          <View style={styles.step}>
            <View style={[styles.stepBadge, { backgroundColor: colors.leaf }]}>
              <Text style={styles.stepEmoji}>🍯</Text>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
            </View>
            <Text style={styles.stepTitle}>Earn</Text>
            <Text style={styles.stepDesc}>Fill your hive with honey</Text>
          </View>
        </View>
      </KidCard>

      {/* Game modes */}
      <View style={styles.sectionHeader}>
        <Ionicons name="game-controller" size={16} color={colors.honeyDark} />
        <Text style={typography.eyebrow}>Game modes</Text>
      </View>
      <View style={styles.modeRow}>
        <KidCard
          tone="honey"
          tinted={mode === 'quest'}
          selected={mode === 'quest'}
          onPress={() => onModeChange('quest')}
          style={styles.modeCardWrap}
          contentStyle={styles.modeCard}
        >
          {mode === 'quest' ? <Sticker label="✓" tone="leaf" size={30} rotate={10} style={styles.modeCheck} /> : null}
          <View style={styles.modeIconWrap}>
            <Hexagon size={68} fill={colors.goldBright} fillEnd={colors.honey} stroke={colors.honeyDark} strokeWidth={2.5} rounded>
              <Text style={styles.modeEmoji}>🗺️</Text>
            </Hexagon>
          </View>
          <Text style={styles.modeTitle}>Grade Quest</Text>
          <Text style={styles.modeDesc}>Follow the phonics path from K to 5th grade</Text>
          <View style={styles.modeTags}>
            <Pill label="Sight words" tone="honey" />
            <Pill label="Patterns" tone="leaf" />
          </View>
        </KidCard>

        <KidCard
          tone="berry"
          tinted={mode === 'practice'}
          selected={mode === 'practice'}
          onPress={() => {
            onModeChange('practice');
            onOpenPractice();
          }}
          style={styles.modeCardWrap}
          contentStyle={styles.modeCard}
        >
          {mode === 'practice' ? <Sticker label="✓" tone="leaf" size={30} rotate={10} style={styles.modeCheck} /> : null}
          <View style={styles.modeIconWrap}>
            <Hexagon size={68} fill={colors.berryLight} fillEnd={colors.berry} stroke={colors.berryDark} strokeWidth={2.5} rounded>
              <Text style={styles.modeEmoji}>✏️</Text>
            </Hexagon>
          </View>
          <Text style={styles.modeTitle}>Practice Hive</Text>
          <Text style={styles.modeDesc}>Grown-ups add this week’s spelling list</Text>
          <View style={styles.modeTags}>
            <Pill label="Custom words" tone="berry" />
            <Pill label="Tap to open" tone="cream" />
          </View>
        </KidCard>
      </View>

      {mode === 'quest' ? (
        <KidCard tone="leaf" contentStyle={styles.gradesCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeader}>
              <Ionicons name="school" size={16} color={colors.leafDark} />
              <Text style={[typography.eyebrow, { color: colors.leafDark }]}>Pick your grade badge</Text>
            </View>
            <Pill label={gradeLabel(grade)} tone="leaf" solid />
          </View>

          <View style={styles.badgeRow}>
            {GRADE_LEVELS.map((g, i) => {
              const active = g === grade;
              const tone = GRADE_TONES[i % GRADE_TONES.length];
              const t = toneColors(tone);
              return (
                <Pressable
                  key={g}
                  onPress={() => onGradeChange(g)}
                  style={({ pressed }) => [styles.badgePress, pressed && styles.pressed, active && styles.badgeActive]}
                  accessibilityLabel={gradeLabel(g)}
                  accessibilityState={{ selected: active }}
                >
                  <Hexagon
                    size={active ? 60 : 52}
                    fill={active ? t.border : colors.white}
                    fillEnd={active ? t.edge : t.tint}
                    stroke={t.edge}
                    strokeWidth={active ? 3 : 2}
                    rounded
                  >
                    <Text style={[styles.badgeText, { color: active ? colors.white : t.text }]}>{g}</Text>
                  </Hexagon>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.gradeBlurb}>{GRADE_CURRICULUM_BLURBS[grade]}</Text>

          <View style={styles.pathHeader}>
            <Ionicons name="footsteps" size={16} color={colors.leafDark} />
            <Text style={[typography.eyebrow, { color: colors.leafDark }]}>Phonics path</Text>
          </View>
          <Text style={styles.pathHint}>Start on a pattern — playing moves you along the trail</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitRow}>
            {units.map((unit, index) => {
              const active = unit.id === activeUnit?.id;
              const t = toneColors(UNIT_TONES[index % UNIT_TONES.length]);
              return (
                <Pressable
                  key={unit.id}
                  onPress={() => onUnitChange(unit.id)}
                  style={({ pressed }) => [
                    styles.unitChip,
                    { borderColor: t.border, borderBottomColor: t.edge, backgroundColor: active ? t.tint : colors.white },
                    active && styles.unitChipActive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={unit.title}
                >
                  <View style={[styles.unitOrder, { backgroundColor: t.edge }]}>
                    <Text style={styles.unitOrderText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.unitChipTitle} numberOfLines={2}>
                    {unit.title}
                  </Text>
                  <Text style={[styles.unitChipFocus, { color: t.text }]} numberOfLines={1}>
                    {unit.focusLabel}
                  </Text>
                  {active ? (
                    <View style={[styles.unitActiveTag, { backgroundColor: t.edge }]}>
                      <Ionicons name="play" size={10} color={colors.white} />
                      <Text style={styles.unitActiveTagText}>Up next</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {activeUnit ? (
            <View style={styles.unitDetail}>
              <View style={styles.unitDetailHead}>
                <Text style={styles.unitDetailTitle}>{activeUnit.title}</Text>
                <Text style={styles.unitDetailEmoji}>🔍</Text>
              </View>
              <Text style={styles.unitDetailDesc}>{activeUnit.description}</Text>
              <Text style={styles.sampleLabel}>Words you’ll meet</Text>
              <View style={styles.sampleChips}>
                {sampleWords.map((word, i) => {
                  const t = toneColors(UNIT_TONES[(i + 1) % UNIT_TONES.length]);
                  return (
                    <View key={word} style={[styles.sampleChip, { borderColor: t.border, backgroundColor: t.tint }]}>
                      <Text style={[styles.sampleChipText, { color: t.text }]}>{word}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </KidCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  hero: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  heroBee: {
    marginLeft: -8,
  },
  heroText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  heroBubble: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    ...typography.title,
    fontSize: 26,
    marginTop: 4,
  },
  heroHive: {
    marginTop: -10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: -6,
    paddingLeft: 4,
  },
  howCard: {
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
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  stepEmoji: {
    fontSize: 22,
  },
  stepNum: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.white,
  },
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.chocolate,
  },
  stepDesc: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  stepArrow: {
    marginTop: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modeCardWrap: {
    flex: 1,
    width: undefined,
  },
  modeCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 6,
    minHeight: 220,
  },
  modeCheck: {
    position: 'absolute',
    top: -10,
    right: -8,
    zIndex: 2,
  },
  modeIconWrap: {
    marginBottom: 2,
  },
  modeEmoji: {
    fontSize: 28,
  },
  modeTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.chocolate,
    textAlign: 'center',
  },
  modeDesc: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  modeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  gradesCard: {
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    minHeight: 64,
  },
  badgePress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    transform: [{ translateY: -3 }],
  },
  pressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.95,
  },
  badgeText: {
    fontFamily: fonts.display,
    fontSize: 20,
  },
  gradeBlurb: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pathHint: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -6,
  },
  unitRow: {
    gap: 10,
    paddingVertical: 6,
    paddingRight: 8,
    paddingLeft: 2,
  },
  unitChip: {
    width: 136,
    borderRadius: 18,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    padding: 10,
    gap: 4,
  },
  unitChipActive: {
    transform: [{ translateY: -2 }],
  },
  unitOrder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitOrderText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.white,
  },
  unitChipTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    color: colors.chocolate,
    minHeight: 32,
  },
  unitChipFocus: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  unitActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  unitActiveTagText: {
    fontFamily: fonts.extraBold,
    fontSize: 9,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unitDetail: {
    width: '100%',
    backgroundColor: colors.leafLight,
    borderRadius: 18,
    padding: 12,
    gap: 6,
    borderWidth: 2,
    borderColor: colors.leaf,
  },
  unitDetailHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitDetailTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.leafDark,
  },
  unitDetailEmoji: {
    fontSize: 16,
  },
  unitDetailDesc: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
    marginBottom: 4,
  },
  sampleLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 11,
    color: colors.leafDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleChip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
  },
  sampleChipText: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
});
