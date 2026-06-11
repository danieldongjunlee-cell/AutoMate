import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { LogoRow } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/mock/authService';
import { spacing } from '../../theme';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = fullName.trim() && email.trim() && phone.trim() && password.length >= 6;

  const onSubmit = async () => {
    setLoading(true);
    await authService.signUp({ fullName, email, phone, password });
    setLoading(false);
    navigation.navigate('VerifyOtp');
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
        containerStyle={{ marginBottom: spacing.xl }}
      />

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
