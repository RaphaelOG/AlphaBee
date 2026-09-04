import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, typography } from '../theme';
import { HoneycombButton } from './HoneycombButton';

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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.hexBorderTop} />
          <Text style={typography.title}>Practice Hive</Text>
          <Text style={[typography.subtitle, styles.sub]}>
            Parents & teachers: add weekly vocabulary words
          </Text>

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
            <Pressable onPress={addWord} style={styles.addBtn}>
              <Text style={styles.addText}>Add</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {words.map((word) => (
              <View key={word} style={styles.chip}>
                <Text style={styles.chipText}>{word}</Text>
                <Pressable onPress={() => removeWord(word)} hitSlop={8}>
                  <Text style={styles.chipRemove}>×</Text>
                </Pressable>
              </View>
            ))}
            {words.length === 0 ? (
              <Text style={styles.empty}>Your custom hive is empty — add a few words to begin.</Text>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <HoneycombButton
              label="Start"
              size={110}
              onPress={handleSave}
              style={words.length === 0 ? styles.dim : undefined}
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
    backgroundColor: 'rgba(74, 52, 38, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.creamSoft,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 36,
    maxHeight: '82%',
    borderWidth: 3,
    borderColor: colors.honey,
    borderBottomWidth: 0,
  },
  hexBorderTop: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.honey,
    marginBottom: 14,
  },
  sub: {
    marginTop: 4,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.honeyDark,
  },
  addText: {
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.white,
    fontSize: 15,
  },
  list: {
    maxHeight: 220,
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
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: colors.honeyLight,
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  chipRemove: {
    fontSize: 18,
    color: colors.softRed,
    fontFamily: 'Nunito_800ExtraBold',
  },
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancel: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.textMuted,
  },
  dim: {
    opacity: 0.45,
  },
});
