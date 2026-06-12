import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { authService, MOCK_PHONE } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing } from '../../theme';
import { AuthScreenShell } from './AuthScreenShell';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 42; // wireframe shows "Resend (0:42)"

export function VerifyOtpScreen() {
  const signIn = useAppStore((s) => s.signIn);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const onVerify = async () => {
    setLoading(true);
    try {
      const { ok } = await authService.verifyOtp(code);
      if (ok) {
        signIn();
        return;
      }
      Alert.alert('Invalid code', 'Use the demo verification code 123456.');
      setCode('');
      inputRef.current?.focus();
    } catch (err) {
      Alert.alert('Verification failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (secondsLeft > 0) return;
    await authService.resendOtp();
    setSecondsLeft(RESEND_SECONDS);
    setCode('');
    inputRef.current?.focus();
  };

  const mmss = `0:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <AuthScreenShell>
      <View style={{ alignItems: 'center', marginVertical: spacing.xxl }}>
        <Text style={{ fontSize: 52, marginBottom: spacing.md }}>📱</Text>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#fff', marginBottom: spacing.xs }}>
          Code sent to {MOCK_PHONE}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.55)' }}>
          Enter the 6-digit code below
        </Text>
      </View>

      {/* OTP boxes over a hidden input */}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          justifyContent: 'center',
          marginBottom: spacing.xxl,
        }}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, i) => {
          const active = i === code.length;
          return (
            <View
              key={i}
              style={{
                width: 48,
                height: 58,
                borderRadius: radii.md,
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? palette.authAction : 'rgba(255,255,255,.25)',
                backgroundColor: active ? '#E8F0FB' : '#FAFAF8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: '600', color: palette.textPrimary }}>
                {code[i] ?? ''}
              </Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        keyboardType="number-pad"
        autoFocus
        maxLength={OTP_LENGTH}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />

      <PrimaryButton
        label="Verify →"
        variant="auth"
        disabled={code.length !== OTP_LENGTH}
        loading={loading}
        onPress={onVerify}
        style={{ marginBottom: spacing.lg }}
      />

      <Pressable onPress={onResend} hitSlop={8} style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.55)' }}>
          Didn't receive it?{' '}
          <Text style={{ color: '#7FB1E8' }}>
            {secondsLeft > 0 ? `Resend (${mmss})` : 'Resend'}
          </Text>
        </Text>
      </Pressable>
    </AuthScreenShell>
  );
}
