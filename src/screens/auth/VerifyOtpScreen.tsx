import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { AuthStackParamList } from '../../navigation/types';
import { authService, MOCK_PHONE } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing } from '../../theme';
import { showAlert } from '../../utils/alerts';
import { AuthScreenShell } from './AuthScreenShell';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 42; // wireframe shows "Resend (0:42)"

type Route = RouteProp<AuthStackParamList, 'VerifyOtp'>;

export function VerifyOtpScreen() {
  const { params } = useRoute<Route>();
  const signIn = useAppStore((s) => s.signIn);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  // Channel-aware copy: sign-up routes here via VerifyMethod with the chosen
  // method + actual destination; the login path keeps the legacy default.
  const destination = params?.destination ?? MOCK_PHONE;
  const channelLabel = params?.method === 'email' ? 'email' : 'SMS';

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
      showAlert('Invalid code', 'Use the demo verification code 123456.');
      setCode('');
      inputRef.current?.focus();
    } catch (err) {
      showAlert('Verification failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (secondsLeft > 0) return;
    if (params) {
      await authService.sendCode(params.method, params.destination);
    } else {
      await authService.resendOtp();
    }
    setSecondsLeft(RESEND_SECONDS);
    setCode('');
    inputRef.current?.focus();
  };

  const mmss = `0:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <AuthScreenShell>
      {params ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: 'rgba(29,158,117,.25)',
            borderWidth: 1,
            borderColor: 'rgba(93,207,170,.5)',
            borderRadius: radii.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: 9,
            marginTop: spacing.md,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#5DCFAA' }}>✓</Text>
          <Text style={{ flex: 1, fontSize: 13, color: '#9FE5CC' }}>
            Verification code sent via {channelLabel}
          </Text>
        </View>
      ) : null}

      <View style={{ alignItems: 'center', marginVertical: spacing.xxl }}>
        <Text style={{ fontSize: 52, marginBottom: spacing.md }}>
          {params?.method === 'email' ? '📧' : '📱'}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#fff', marginBottom: spacing.xs }}>
          Code sent to {destination}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
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

      <Tappable onPress={onResend} hitSlop={8} style={{ alignItems: 'center' }} noFeedback={secondsLeft > 0}>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
          Didn't receive it?{' '}
          <Text style={{ color: '#7FB1E8' }}>
            {secondsLeft > 0 ? `Resend (${mmss})` : 'Resend'}
          </Text>
        </Text>
      </Tappable>
    </AuthScreenShell>
  );
}
