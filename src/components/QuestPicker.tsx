import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, typography } from '../theme';
import { QUEST_OPTIONS, type QuestId } from '../data/quests';
import { KidCard, Pill, toneColors, type KidTone } from './KidUI';

type QuestPickerProps = {
  selectedId: QuestId;
  onSelect: (id: QuestId) => void;
  streakDays: number;
  completedToday: boolean;
};

const QUEST_LOOK: Record<QuestId, { emoji: string; tone: KidTone }> = {
  quick: { emoji: '⚡', tone: 'sky' },
  classic: { emoji: '🍯', tone: 'honey' },
  hero: { emoji: '🏆', tone: 'coral' },
};

export function QuestPicker({ selectedId, onSelect, streakDays, completedToday }: QuestPickerProps) {
  return (
    <KidCard tone="honey" drip contentStyle={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={16} color={colors.honeyDark} />
          <Text style={typography.eyebrow}>{"Today's quest"}</Text>
        </View>
        <Pill
          emoji={streakDays > 0 ? '🔥' : '✨'}
          tone={streakDays > 0 ? 'coral' : 'cream'}
          label={
            streakDays > 0
              ? `${streakDays}-day streak${completedToday ? ' · done!' : ''}`
              : 'Start a streak'
          }
        />
      </View>
      <Text style={styles.hint}>Pick a goal — the quest ends when you spell them all!</Text>

      <View style={styles.row}>
        {QUEST_OPTIONS.map((quest) => {
          const active = quest.id === selectedId;
          const look = QUEST_LOOK[quest.id];
          const t = toneColors(look.tone);
          return (
            <Pressable
              key={quest.id}
              onPress={() => onSelect(quest.id)}
              style={({ pressed }) => [
                styles.option,
                { borderColor: t.border, borderBottomColor: t.edge, backgroundColor: active ? t.tint : colors.white },
                active && styles.optionActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${quest.title}, ${quest.subtitle}`}
            >
              {active ? (
                <View style={[styles.check, { backgroundColor: t.edge }]}>
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                </View>
              ) : null}
              <Text style={styles.emoji}>{look.emoji}</Text>
              <View style={[styles.badge, { backgroundColor: active ? t.edge : t.tint, borderColor: t.edge }]}>
                <Text style={[styles.badgeText, { color: active ? colors.white : t.text }]}>{quest.badge}</Text>
                <Text style={[styles.badgeSub, { color: active ? colors.white : t.text }]}>words</Text>
              </View>
              <Text style={[styles.title, active && { color: t.text }]} numberOfLines={1}>
                {quest.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </KidCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    paddingTop: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hint: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 6,
    overflow: 'visible',
  },
  optionActive: {
    transform: [{ scale: 1.03 }],
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  check: {
    position: 'absolute',
    top: -8,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  emoji: {
    fontSize: 26,
  },
  badge: {
    minWidth: 52,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
  },
  badgeSub: {
    fontFamily: fonts.bold,
    fontSize: 9,
    marginTop: -3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
});
