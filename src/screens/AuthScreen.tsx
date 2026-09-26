import React, { useState } from 'react';
import {
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
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlphaBee } from '../components/AlphaBee';
import { Beehive } from '../components/HiveDecor';
import { ChunkyButton, KidCard, SpeechBubble } from '../components/KidUI';
import { FlowerMeadow, HoneycombPattern, Pollen, SkyScene } from '../components/SceneDecor';
import { NavButton, TopNav } from '../components/TopNav';
import { useAuth } from '../auth';
import { ApiError, API_BASE_URL } from '../api';
import { colors, fonts } from '../theme';
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
    <LinearGradient colors={[colors.sky, colors.skyTop, colors.creamSoft]} style={styles.fill}>
      <StatusBar style="dark" />
      <HoneycombPattern opacity={0.07} rows={40} />
      <SkyScene sunSize={72} />
      <Pollen count={8} />
      <FlowerMeadow height={96} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TopNav left={<NavButton icon="arrow-back" label="Back" onPress={() => navigation.goBack()} />} />

            <View style={styles.hero}>
              <AlphaBee size={92} mood="happy" />
              <View style={styles.heroText}>
                <SpeechBubble
                  text="Grown-ups sign in here — kids never need an account!"
                  tail="left"
                  style={styles.bubble}
                />
              </View>
              <View style={styles.hive} pointerEvents="none">
                <Beehive size={58} branch={false} />
              </View>
            </View>

            <Text style={styles.title}>Parent Hive</Text>

            <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, tab === 'login' && styles.tabActive]}
                onPress={() => {
                  setTab('login');
                  setError(null);
                }}
              >
                <Ionicons name="log-in" size={16} color={tab === 'login' ? colors.white : colors.honeyDark} />
                <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Sign in</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, tab === 'register' && styles.tabActive]}
                onPress={() => {
                  setTab('register');
                  setError(null);
                }}
              >
                <Ionicons name="person-add" size={16} color={tab === 'register' ? colors.white : colors.honeyDark} />
                <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Create account</Text>
              </Pressable>
            </View>

            <KidCard tone="honey" drip contentStyle={styles.card}>
              {tab === 'register' ? (
                <Field
                  label="Your name"
                  icon="happy"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Alex"
                  autoCapitalize="words"
                />
              ) : null}
              <Field
                label="Email"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                placeholder="parent@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Field
                label="Password"
                icon="lock-closed"
                value={password}
                onChangeText={setPassword}
                placeholder={tab === 'register' ? 'At least 8 characters' : 'Your password'}
                secureTextEntry
                autoComplete={tab === 'login' ? 'password' : 'new-password'}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.coralDark} />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <ChunkyButton
                label={busy ? 'Buzzing in…' : tab === 'login' ? 'Sign in' : 'Create parent account'}
                tone="honey"
                fullWidth
                disabled={busy}
                iconRight={<Ionicons name="arrow-forward" size={20} color={colors.white} />}
                onPress={() => {
                  void onSubmit();
                }}
                style={styles.submit}
              />
            </KidCard>

            <View style={styles.hintRow}>
              <Ionicons name="server" size={12} color={colors.textMuted} />
              <Text style={styles.hint}>API: {API_BASE_URL}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Field({
  label,
  icon,
  ...inputProps
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={colors.honey} style={styles.inputIcon} />
        <TextInput {...inputProps} placeholderTextColor={colors.textMuted} style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 120,
    alignItems: 'center',
    gap: 12,
  },
  hero: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  heroText: {
    flex: 1,
  },
  bubble: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  hive: {
    marginLeft: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.chocolate,
    alignSelf: 'flex-start',
    marginTop: -8,
  },
  tabs: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 5,
    borderBottomColor: colors.honey,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
    color: colors.honeyDark,
  },
  tabTextActive: {
    color: colors.white,
  },
  card: {
    gap: 12,
    paddingTop: 22,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    color: colors.honeyDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: colors.honeyLight,
    borderBottomWidth: 4,
    borderBottomColor: colors.honey,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingLeft: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingRight: 14,
    paddingVertical: 12,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.chocolate,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.coralLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.coral,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  error: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.coralDark,
  },
  submit: {
    marginTop: 4,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  hint: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
