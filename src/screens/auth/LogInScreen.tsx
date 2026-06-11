import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { LogoRow } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/mock/authService';
import { spacing } from '../../theme';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LogIn'>;

export function LogInScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() && password.length > 0;

  const onSubmit = async () => {
    setLoading(true);
    await authService.logIn(email, password);
    setLoading(false);
    navigation.navigate('VerifyOtp');
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

      <Pressable
        onPress={() =>
          Alert.alert('Forgot password', 'Password reset will be wired to the backend later.')
        }
        style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}
        hitSlop={8}
      >
        <Text style={{ fontSize: 13, color: '#7FB1E8' }}>Forgot password?</Text>
      </Pressable>

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
