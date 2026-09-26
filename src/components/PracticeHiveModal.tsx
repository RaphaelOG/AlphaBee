import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import { AlphaBee } from './AlphaBee';
import { ChunkyButton, KidCard, Pill, SpeechBubble, Sticker } from './KidUI';

type PracticeHiveModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (words: string[]) => void;
};

export function PracticeHiveModal({ visible, onClose, onSave }: PracticeHiveModalProps) {
  const [draft, setDraft] = useState('');
  const [words, setWords] = useState<string[]>([]);

  const addWord = () => {
    const cleaned = draft.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!cleaned || words.includes(cleaned)) {
      setDraft('');
      return;
    }
    setWords((prev) => [...prev, cleaned]);
    setDraft('');
  };

  const removeWord = (word: string) => {
    setWords((prev) => prev.filter((w) => w !== word));
  };

  const handleSave = () => {
    if (words.length === 0) return;
    onSave(words);
    setDraft('');
    setWords([]);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Sticker emoji="📝" tone="leaf" size={48} rotate={-10} style={styles.sticker} />

          <View style={styles.hero}>
            <AlphaBee size={72} mood="thinking" />
            <SpeechBubble text="Parents: drop in this week’s spelling words!" tail="left" style={styles.bubble} />
          </View>

          <Text style={styles.title}>Practice Hive</Text>
          <Text style={styles.sub}>Add custom words, then tap Start to play</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a word"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              onSubmitEditing={addWord}
              returnKeyType="done"
            />
            <ChunkyButton
              label="Add"
              tone="leaf"
              size="sm"
              onPress={addWord}
              icon={<Ionicons name="add" size={16} color={colors.white} />}
            />
          </View>

          <KidCard tone="honey" tinted contentStyle={styles.listCard}>
            <View style={styles.listHead}>
              <Pill emoji="🐝" label={`${words.length} word${words.length === 1 ? '' : 's'}`} tone="honey" />
            </View>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {words.map((word, i) => (
                <View key={word} style={[styles.chip, i % 2 === 1 && styles.chipAlt]}>
                  <Text style={styles.chipText}>{word}</Text>
                  <Pressable onPress={() => removeWord(word)} hitSlop={8} accessibilityLabel={`Remove ${word}`}>
                    <Ionicons name="close-circle" size={18} color={colors.coralDark} />
                  </Pressable>
                </View>
              ))}
              {words.length === 0 ? (
                <Text style={styles.empty}>Your custom hive is empty — add a few words to begin.</Text>
              ) : null}
            </ScrollView>
          </KidCard>

          <View style={styles.actions}>
            <Pressable onPress={handleClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <ChunkyButton
              label="Start!"
              tone="honey"
              onPress={handleSave}
              disabled={words.length === 0}
              icon={<Ionicons name="play" size={18} color={colors.white} />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(62, 42, 26, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.creamSoft,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
    maxHeight: '86%',
    borderWidth: 3,
    borderColor: colors.honey,
    borderBottomWidth: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 52,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.honey,
    marginBottom: 10,
  },
  sticker: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bubble: {
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.chocolate,
  },
  sub: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 5,
    borderBottomColor: colors.honey,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.chocolate,
  },
  listCard: {
    minHeight: 120,
    maxHeight: 240,
  },
  listHead: {
    marginBottom: 8,
  },
  list: {
    maxHeight: 180,
  },
  listContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2.5,
    borderBottomWidth: 4,
    borderColor: colors.honeyLight,
    borderBottomColor: colors.honey,
  },
  chipAlt: {
    borderColor: colors.leafLight,
    borderBottomColor: colors.leaf,
  },
  chipText: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.chocolate,
  },
  empty: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancel: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.textMuted,
  },
});
