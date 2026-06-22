import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { AuthStackParamList } from '../../navigation/types';
import { authService, VerifyChannel } from '../../services';
import { radii, spacing } from '../../theme';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'VerifyMethod'>;
type Route = RouteProp<AuthStackParamList, 'VerifyMethod'>;

/**
 * Verification-method choice after sign-up (user-feedback pass 1): the two
 * cards show the ACTUAL email/phone the user just entered; picking one sends
 * the code there and moves on to the OTP screen.
 */
export function VerifyMethodScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [sending, setSending] = useState<VerifyChannel | null>(null);

  const options: { method: VerifyChannel; icon: string; title: string; destination: string }[] = [
    { method: 'email', icon: '📧', title: 'Email', destination: params.email },
    { method: 'sms', icon: '📱', title: 'Text message', destination: params.phone },
  ];

  const onPick = async (method: VerifyChannel, destination: string) => {
    if (sending) return;
    setSending(method);
    try {
      await authService.sendCode(method, destination);
      navigation.navigate('VerifyOtp', { method, destination });
    } finally {
      setSending(null);
    }
  };

  return (
    <AuthScreenShell>
      <View style={{ alignItems: 'center', marginVertical: spacing.xxl }}>
        <Text style={{ fontSize: 52, marginBottom: spacing.md }}>🔐</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: spacing.xs }}>
          Almost there
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', textAlign: 'center' }}>
          Where should we send your verification code?
        </Text>
      </View>

      {options.map(({ method, icon, title, destination }) => (
        <Tappable
          key={method}
          onPress={() => onPick(method, destination)}
          disabled={sending !== null}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            backgroundColor: 'rgba(255,255,255,.08)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,.25)',
            borderRadius: radii.md,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 28 }}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>{title}</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
              {destination}
            </Text>
          </View>
          {sending === method ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,.5)' }}>›</Text>
          )}
        </Tappable>
      ))}

      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', textAlign: 'center', marginTop: spacing.sm }}>
        Codes expire after 10 minutes
      </Text>
    </AuthScreenShell>
  );
}
