import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { LegalKind, LegalSheet } from '../../components/LegalSheet';
import { LogoRow } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signUpWithSupabase } from '../../lib/supabaseAuth';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, spacing } from '../../theme';
import { showAlert } from '../../utils/alerts';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

/** Password rules surfaced as a live ✓/✗ checklist (user-feedback pass 1). */
const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One number', test: (pw) => /\d/.test(pw) },
];

export function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [legal, setLegal] = useState<LegalKind>(null);
  const setAuth = useAppStore((s) => s.setAuth);
  const signIn = useAppStore((s) => s.signIn);

  const rules = PASSWORD_RULES.map((r) => ({ label: r.label, ok: r.test(password) }));
  const rulesPass = rules.every((r) => r.ok);
  const matches = password.length > 0 && password === confirm;
  const showMismatch = confirm.length > 0 && !matches;

  const canSubmit = !!(fullName.trim() && email.trim() && phone.trim() && rulesPass && matches);

  const onSubmit = async () => {
    setLoading(true);
    try {
      // Supabase configured → create the real user and go straight in (the
      // mock OTP step is skipped). Otherwise keep the demo verify flow.
      if (isSupabaseConfigured) {
        const u = await signUpWithSupabase({ fullName, email, phone, password });
        setAuth(u.token, { name: u.name, email: u.email });
        signIn();
        return;
      }
      await authService.signUp({ fullName, email, phone, password });
      // Verification-method choice shows the actual entered email/phone.
      navigation.navigate('VerifyMethod', { email: email.trim(), phone: phone.trim() });
    } catch (err) {
      showAlert('Sign up failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <View style={{ marginBottom: spacing.lg }}>
        <LogoRow markSize={28} textSize={16} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: '600', color: '#fff', marginBottom: spacing.xs }}>
        Create account
      </Text>
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', marginBottom: spacing.xl }}>
        Get real dealer quotes in minutes
      </Text>

      <TextField
        label="Full name"
        onDark
        value={fullName}
        onChangeText={setFullName}
        placeholder="John Doe"
        autoCapitalize="words"
        autoComplete="name"
      />
      <TextField
        label="Email"
        onDark
        value={email}
        onChangeText={setEmail}
        placeholder="johndoe@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextField
        label="Phone"
        onDark
        value={phone}
        onChangeText={setPhone}
        placeholder="+1 (703) 555-0198"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <TextField
        label="Password"
        onDark
        secure
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        autoCapitalize="none"
        containerStyle={{ marginBottom: spacing.sm }}
      />

      {/* Live password-rules checklist */}
      <View style={{ marginBottom: spacing.md, gap: 4 }}>
        {rules.map(({ label, ok }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: ok ? '#5DCFAA' : '#F09595' }}>
              {ok ? '✓' : '✗'}
            </Text>
            <Text style={{ fontSize: 13, color: ok ? '#5DCFAA' : 'rgba(255,255,255,.6)' }}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <TextField
        label="Confirm password"
        onDark
        secure
        value={confirm}
        onChangeText={setConfirm}
        placeholder="••••••••"
        autoCapitalize="none"
        containerStyle={{ marginBottom: showMismatch ? spacing.xs : spacing.xl }}
      />
      {showMismatch ? (
        <Text style={{ fontSize: 13, color: '#F09595', marginBottom: spacing.lg }}>
          Passwords don't match
        </Text>
      ) : null}

      {/* ToS / Privacy disclaimer — links open the full document in a sheet. */}
      <Text
        style={{
          fontSize: 12,
          lineHeight: 18,
          color: 'rgba(255,255,255,.55)',
          marginBottom: spacing.md,
        }}
      >
        By creating an account, you agree to our{' '}
        <Text
          style={{ color: palette.primaryLight, fontWeight: '700' }}
          onPress={() => setLegal('terms')}
        >
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text
          style={{ color: palette.primaryLight, fontWeight: '700' }}
          onPress={() => setLegal('privacy')}
        >
          Privacy Policy
        </Text>
        .
      </Text>

      <LegalSheet kind={legal} onClose={() => setLegal(null)} />

      <PrimaryButton
        label="Create account"
        variant="auth"
        disabled={!canSubmit}
        loading={loading}
        onPress={onSubmit}
      />
    </AuthScreenShell>
  );
}
