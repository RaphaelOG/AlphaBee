import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlphaBee } from '../components/AlphaBee';
import { useAuth } from '../auth';
import { ApiError, API_BASE_URL } from '../api';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;
type AuthTab = 'login' | 'register';

export function AuthScreen({ navigation }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const afterAuth = () => {
    navigation.replace('ChildSelect');
  };

  const onSubmit = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (tab === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      if (tab === 'login') {
        await login(trimmedEmail, password);
      } else {
        await register(trimmedEmail, password, displayName);
      }
      afterAuth();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`Can't reach the hive API at ${API_BASE_URL}. Is the backend running?`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={[colors.skyTop, colors.cream, colors.skyBottom]} style={styles.fill}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backWrap}>
              <Text style={styles.back}>Back</Text>
            </Pressable>

            <AlphaBee size={56} />
            <Text style={styles.title}>Parent Hive</Text>
            <Text style={styles.subtitle}>
              Adults sign in so kids can spell — children never need an account.
            </Text>

            <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, tab === 'login' && styles.tabActive]}
                onPress={() => {
                  setTab('login');
                  setError(null);
                }}
              >
                <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Sign in</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, tab === 'register' && styles.tabActive]}
                onPress={() => {
                  setTab('register');
                  setError(null);
                }}
              >
                <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
                  Create account
                </Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              {tab === 'register' ? (
                <Field
                  label="Your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Alex"
                  autoCapitalize="words"
                />
              ) : null}
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="parent@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder={tab === 'register' ? 'At least 8 characters' : 'Your password'}
                secureTextEntry
                autoComplete={tab === 'login' ? 'password' : 'new-password'}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.submit, busy && styles.submitDisabled]}
                onPress={() => {
                  void onSubmit();
                }}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitText}>
                    {tab === 'login' ? 'Sign in' : 'Create parent account'}
                  </Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.hint}>API: {API_BASE_URL}</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Field({
  label,
  ...inputProps
}: {
  label: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  backWrap: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  back: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.honeyDark,
  },
  title: {
    ...typography.title,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.honeyLight,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.white,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.honey,
    padding: 16,
    gap: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.honeyDark,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.honeyLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.creamSoft,
  },
  error: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.softRed,
    textAlign: 'center',
  },
  submit: {
    marginTop: 4,
    backgroundColor: colors.honey,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.honeyDark,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.white,
  },
  hint: {
    marginTop: 16,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
