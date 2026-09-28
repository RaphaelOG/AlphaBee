import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { validateCustomWord } from '../utils/wordValidation';
import { AlphaBee } from './AlphaBee';
import { ChunkyButton, KidCard, Pill, SpeechBubble, Sticker } from './KidUI';

type PracticeHiveModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (words: string[]) => void;
};

export function PracticeHiveModal({ visible, onClose, onSave }: PracticeHiveModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 120, animated: true });
      });
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [visible]);

  const addWord = () => {
    const result = validateCustomWord(draft, words);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setWords((prev) => [...prev, result.word]);
    setDraft('');
    setError(null);
    inputRef.current?.focus();
  };

  const removeWord = (word: string) => {
    setWords((prev) => prev.filter((w) => w !== word));
  };

  const handleSave = () => {
    if (words.length === 0) {
      setError('Add at least one valid word to start.');
      return;
    }
    Keyboard.dismiss();
    onSave(words);
    setDraft('');
    setWords([]);
    setError(null);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View
          style={[
            styles.backdrop,
            { paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} accessibilityLabel="Dismiss keyboard" />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12, zIndex: 1 }]}>
            <View style={styles.handle} />
            <Sticker emoji="📝" tone="leaf" size={48} rotate={-10} style={styles.sticker} />

            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <View style={styles.hero}>
                <AlphaBee size={72} mood="thinking" />
                <SpeechBubble text="Parents: drop in this week’s spelling words!" tail="left" style={styles.bubble} />
              </View>

              <Text style={styles.title}>Practice Hive</Text>
              <Text style={styles.sub}>Add a real spelling word, then tap Start to play</Text>

              <View style={styles.inputRow}>
                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={(value) => {
                    setDraft(value);
                    if (error) setError(null);
                  }}
                  placeholder="Type a word"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck
                  style={[styles.input, error ? styles.inputError : null]}
                  onSubmitEditing={addWord}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({ y: 140, animated: true });
                    }, 80);
                  }}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  accessibilityLabel="Type a spelling word"
                />
                <ChunkyButton
                  label="Add"
                  tone="leaf"
                  size="sm"
                  onPress={addWord}
                  icon={<Ionicons name="add" size={16} color={colors.white} />}
                />
              </View>
              {error ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={colors.coralDark} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <Text style={styles.hint}>Letters only, 2–16 letters, with a vowel — like hive or because.</Text>
              )}

              <KidCard tone="honey" tinted contentStyle={styles.listCard}>
                <View style={styles.listHead}>
                  <Pill emoji="🐝" label={`${words.length} word${words.length === 1 ? '' : 's'}`} tone="honey" />
                </View>
                <View style={styles.listContent}>
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
                </View>
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
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    maxHeight: '88%',
    borderWidth: 3,
    borderColor: colors.honey,
    borderBottomWidth: 0,
  },
  sheetContent: {
    paddingBottom: 12,
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
    zIndex: 2,
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
    marginBottom: 6,
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
  inputError: {
    borderColor: colors.coral,
    borderBottomColor: colors.coralDark,
  },
  hint: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.coralDark,
  },
  listCard: {
    minHeight: 120,
  },
  listHead: {
    marginBottom: 8,
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
