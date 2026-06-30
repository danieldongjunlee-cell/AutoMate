import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { LogoRow } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SocialAuthButtons } from '../../components/SocialAuthButtons';
import { TextField } from '../../components/TextField';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signInWithSupabase } from '../../lib/supabaseAuth';
import { AuthStackParamList } from '../../navigation/types';
import { authService, DEMO_EMAIL, DEMO_PASSWORD } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { spacing, useTheme } from '../../theme';
import { showAlert } from '../../utils/alerts';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LogIn'>;

export function LogInScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const setAuth = useAppStore((s) => s.setAuth);
  const signIn = useAppStore((s) => s.signIn);
  // Demo flow (spec §6): pre-fill the seeded demo credentials on the mock path.
  // On the Supabase path those don't exist, so start blank for the real account.
  const [email, setEmail] = useState(isSupabaseConfigured ? '' : DEMO_EMAIL);
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() && password.length > 0;

  const onSubmit = async () => {
    setLoading(true);
    try {
      // Supabase configured → authenticate against it and go straight in.
      if (isSupabaseConfigured) {
        const u = await signInWithSupabase(email, password);
        setAuth(u.token, { name: u.name, email: u.email, username: u.username, phone: u.phone });
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
    <AuthScreenShell>
      <View style={{ marginBottom: spacing.lg }}>
        <LogoRow markSize={28} textSize={16} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs }}>
        Welcome back
      </Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.xl }}>
        Sign in to your account
      </Text>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="johndoe@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextField
        label="Password"
        secure
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        autoCapitalize="none"
        containerStyle={{ marginBottom: spacing.sm }}
      />

      <Tappable
        onPress={() =>
          showAlert('Forgot password', 'Password reset will be wired to the backend later.')
        }
        style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}
        hitSlop={8}
      >
        <Text style={{ fontSize: 14, color: colors.primary }}>Forgot password?</Text>
      </Tappable>

      <PrimaryButton
        label="Sign in"
        variant="auth"
        disabled={!canSubmit}
        loading={loading}
        onPress={onSubmit}
      />

      <SocialAuthButtons />
    </AuthScreenShell>
  );
}
