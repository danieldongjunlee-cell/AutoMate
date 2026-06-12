import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { LogoRow } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { AuthStackParamList } from '../../navigation/types';
import { authService, DEMO_EMAIL, DEMO_PASSWORD } from '../../services';
import { spacing } from '../../theme';
import { showAlert } from '../../utils/alerts';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LogIn'>;

export function LogInScreen() {
  const navigation = useNavigation<Nav>();
  // Demo flow (spec §6): "I already have an account" lands here pre-filled
  // with the seeded demo credentials.
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() && password.length > 0;

  const onSubmit = async () => {
    setLoading(true);
    try {
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
      <Text style={{ fontSize: 22, fontWeight: '600', color: '#fff', marginBottom: spacing.xs }}>
        Welcome back
      </Text>
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', marginBottom: spacing.xl }}>
        Sign in to your account
      </Text>

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
        label="Password"
        onDark
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
        <Text style={{ fontSize: 13, color: '#7FB1E8' }}>Forgot password?</Text>
      </Tappable>

      <PrimaryButton
        label="Sign in"
        variant="auth"
        disabled={!canSubmit}
        loading={loading}
        onPress={onSubmit}
      />
    </AuthScreenShell>
  );
}
