import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { QUEST_OPTIONS, type QuestId } from '../data/quests';

type QuestPickerProps = {
  selectedId: QuestId;
  onSelect: (id: QuestId) => void;
  streakDays: number;
  completedToday: boolean;
};

export function QuestPicker({ selectedId, onSelect, streakDays, completedToday }: QuestPickerProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>{"Today's quest"}</Text>
        <View style={styles.streakPill}>
          <Text style={styles.streakPillText}>
            {streakDays > 0 ? `${streakDays}-day streak` : 'Start a streak'}
            {completedToday ? ' · done today' : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.hint}>Pick a short goal — the session ends when you finish</Text>

      <View style={styles.row}>
        {QUEST_OPTIONS.map((quest) => {
          const active = quest.id === selectedId;
          return (
            <Pressable
              key={quest.id}
              onPress={() => onSelect(quest.id)}
              style={[styles.card, active && styles.cardActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${quest.title}, ${quest.subtitle}`}
            >
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{quest.badge}</Text>
              </View>
              <Text style={[styles.title, active && styles.titleActive]}>{quest.title}</Text>
              <Text style={styles.subtitle}>{quest.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.honey,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.honeyDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakPill: {
    backgroundColor: colors.creamSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
  },
  streakPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.honeyDark,
  },
  hint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.creamSoft,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 4,
  },
  cardActive: {
    backgroundColor: colors.goldBright,
    borderColor: colors.honeyDark,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  badgeActive: {
    backgroundColor: colors.honeyDark,
    borderColor: colors.honeyDark,
  },
  badgeText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 14,
    color: colors.honeyDark,
  },
  badgeTextActive: {
    color: colors.white,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  titleActive: {
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
