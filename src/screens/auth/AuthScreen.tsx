import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Text } from '../../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { LegalKind, LegalSheet } from '../../components/LegalSheet';
import { LogoRow } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SocialAuthButtons } from '../../components/SocialAuthButtons';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signInWithSupabase, signUpWithSupabase } from '../../lib/supabaseAuth';
import { AuthStackParamList } from '../../navigation/types';
import { authService, DEMO_EMAIL, DEMO_PASSWORD } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, spacing, useTheme } from '../../theme';
import { showAlert } from '../../utils/alerts';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'AuthMain'>;
type Route = RouteProp<AuthStackParamList, 'AuthMain'>;
export type AuthTab = 'signin' | 'join';

/** Short line explaining why we're asking, by gate intent. */
const INTENT_COPY: Record<string, string> = {
  unlockEstimate: 'Log in or join to see your AI estimate range and get real quotes.',
  unlockQuotes: 'Log in or join to view real quotes from nearby shops.',
  submitEstimate: 'Sign in to receive your repair quotes.',
  newEstimate: 'Join to earn points on every estimate.',
  selectShop: 'Sign in to book this shop.',
  bookService: 'Sign in to book your service.',
  acceptQuote: 'Sign in to accept this quote.',
  writeReview: 'Sign in to post your review.',
  saveCar: 'Sign in to save your car.',
  signIn: 'Log in or create an account to continue.',
  deals: 'Sign in to view deals & offers.',
  myCars: 'Sign in to manage your cars.',
  insurance: 'Sign in to manage your insurance.',
  payment: 'Sign in to manage payment methods.',
  estimateHistory: 'Sign in to view your estimate history.',
  getPro: 'Sign in to get AutoMate Pro.',
  maintDashboard: 'Sign in to open your maintenance dashboard.',
  maintAction: 'Sign in to use the maintenance dashboard.',
  checkIn: 'Sign in to claim your daily check-in.',
  milestones: 'Sign in to view your milestones.',
  pointsHistory: 'Sign in to view your points history.',
};

/** Password rules surfaced as a live checklist. */
const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One number', test: (pw) => /\d/.test(pw) },
];

/**
 * Sign In / Join (canvas "Auth"): one screen with two large tabs and a glowing
 * blue underline under the active one, a close ×, labelled fields, a blue
 * primary button and Google / Apple pills. Every auth gate lands here.
 */
export function AuthScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<AuthTab>(route.params?.tab ?? 'signin');
  const intent = route.params?.intent;
  const reason = (intent && INTENT_COPY[intent]) || 'Log in or create an account to continue.';

  const close = () => navigation.getParent()?.goBack();

  return (
    <AuthScreenShell>
      <View style={{ height: Math.max(insets.top, 8) }} />
      {/* Logo + close × */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
        <LogoRow markSize={28} textSize={16} />
        <Tappable onPress={close} hitSlop={10} accessibilityLabel="Close" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={22} color={colors.textPrimary} />
        </Tappable>
      </View>

      {/* Sign In | Join tabs */}
      <View style={{ flexDirection: 'row', gap: spacing.xl, marginBottom: 6 }}>
        {(
          [
            ['signin', 'Sign In'],
            ['join', 'Join'],
          ] as const
        ).map(([key, label]) => {
          const active = tab === key;
          return (
            <Tappable key={key} onPress={() => setTab(key)} noFeedback style={{ paddingBottom: 10 }}>
              <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: -0.4, color: active ? colors.textPrimary : colors.textTertiary }}>
                {label}
              </Text>
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: active ? colors.primary : 'transparent',
                  shadowColor: colors.primary,
                  shadowOpacity: active ? 0.9 : 0,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                }}
              />
            </Tappable>
          );
        })}
      </View>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.xl }}>{reason}</Text>

      {tab === 'signin' ? <SignInForm /> : <JoinForm />}

      <SocialAuthButtons />
    </AuthScreenShell>
  );
}

function SignInForm() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const setAuth = useAppStore((s) => s.setAuth);
  const signIn = useAppStore((s) => s.signIn);
  // Demo flow: pre-fill the seeded demo credentials on the mock path. On the
  // Supabase path those don't exist, so start blank for the real account.
  const [email, setEmail] = useState(isSupabaseConfigured ? '' : DEMO_EMAIL);
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const canSubmit = !!email.trim() && password.length > 0;

  const onSubmit = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const u = await signInWithSupabase(email, password);
        setAuth(u.token, { name: u.name, email: u.email, phone: u.phone });
        signIn();
        return;
      }
      await authService.logIn(email, password);
      navigation.navigate('VerifyOtp');
    } catch (err) {
      showAlert('Sign in failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <TextField label="Password" secure value={password} onChangeText={setPassword} placeholder="••••••••" autoCapitalize="none" containerStyle={{ marginBottom: spacing.sm }} />
      <Tappable
        onPress={() => showAlert('Forgot password', 'Password reset will be wired to the backend later.')}
        style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}
        hitSlop={8}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>Forgot password?</Text>
      </Tappable>
      <PrimaryButton label="Sign in" disabled={!canSubmit} loading={loading} onPress={onSubmit} />
    </>
  );
}

function JoinForm() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [legal, setLegal] = useState<LegalKind>(null);
  const setAuth = useAppStore((s) => s.setAuth);
  const signIn = useAppStore((s) => s.signIn);
  const setIsNewUser = useAppStore((s) => s.setIsNewUser);

  const rules = PASSWORD_RULES.map((r) => ({ label: r.label, ok: r.test(password) }));
  const rulesPass = rules.every((r) => r.ok);
  const canSubmit = !!(fullName.trim() && email.trim() && phone.trim() && rulesPass);

  const onSubmit = async () => {
    setLoading(true);
    // Brand-new account → show the Home "New here?" hint until they submit
    // their first AI estimate.
    setIsNewUser(true);
    try {
      if (isSupabaseConfigured) {
        const u = await signUpWithSupabase({ fullName, email, phone, password });
        setAuth(u.token, { name: u.name, email: u.email, phone: u.phone });
        signIn();
        return;
      }
      await authService.signUp({ fullName, email, phone, password });
      navigation.navigate('VerifyMethod', { email: email.trim(), phone: phone.trim() });
    } catch (err) {
      showAlert('Sign up failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="John Doe" autoCapitalize="words" autoComplete="name" />
      <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <TextField label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (703) 555-0198" keyboardType="phone-pad" autoComplete="tel" />
      <TextField label="Password" secure value={password} onChangeText={setPassword} placeholder="••••••••" autoCapitalize="none" containerStyle={{ marginBottom: spacing.sm }} />

      {/* Live password-rules checklist (only once the user starts typing). */}
      {password.length > 0 ? (
        <View style={{ marginBottom: spacing.md, gap: 4 }}>
          {rules.map(({ label, ok }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name={ok ? 'check' : 'close'} size={15} color={ok ? palette.mint : colors.danger} />
              <Text style={{ fontSize: 13, color: ok ? palette.mint : colors.textTertiary }}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={{ fontSize: 13, lineHeight: 18, color: colors.textTertiary, marginBottom: spacing.md }}>
        By joining, you agree to our{' '}
        <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => setLegal('terms')}>
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => setLegal('privacy')}>
          Privacy Policy
        </Text>
        .
      </Text>
      <LegalSheet kind={legal} onClose={() => setLegal(null)} />

      <PrimaryButton label="Create account" disabled={!canSubmit} loading={loading} onPress={onSubmit} />
    </>
  );
}
