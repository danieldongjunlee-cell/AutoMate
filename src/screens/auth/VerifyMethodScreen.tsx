import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { IconChip } from '../../components/IconChip';
import { Tappable } from '../../components/Tappable';
import { AuthStackParamList } from '../../navigation/types';
import { authService, VerifyChannel } from '../../services';
import { radii, spacing, useTheme } from '../../theme';
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
  const { colors } = useTheme();
  const { params } = useRoute<Route>();
  const [sending, setSending] = useState<VerifyChannel | null>(null);

  const options: { method: VerifyChannel; icon: 'mail' | 'phone'; title: string; destination: string }[] = [
    { method: 'email', icon: 'mail', title: 'Email', destination: params.email },
    { method: 'sms', icon: 'phone', title: 'Text message', destination: params.phone },
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
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs }}>
          Almost there
        </Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center' }}>
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
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <IconChip name={icon} size={50} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>
              {destination}
            </Text>
          </View>
          {sending === method ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={{ fontSize: 18, color: colors.textTertiary }}>›</Text>
          )}
        </Tappable>
      ))}

      <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }}>
        Codes expire after 10 minutes
      </Text>
    </AuthScreenShell>
  );
}
