import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useRequireAuth, useResumeAfterAuth } from '../../hooks/useRequireAuth';
import { HomeStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'EstimateStart'>;

/**
 * Shown when a guest taps "AI Repair Estimate": returning vs new in two big
 * buttons. Returning → log in, then continue. New → continue as guest (they're
 * asked to sign up at submit, where their car details are saved). Signed-in
 * users skip this entirely (Home goes straight to the car diagram).
 */
export function EstimateStartScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const requireAuth = useRequireAuth();

  // Returning users: after they log in, continue into the estimate.
  useResumeAfterAuth('estimateReturning', () => navigation.replace('CarDiagram'));

  const bigButton = (opts: {
    emoji: string;
    title: string;
    sub: string;
    primary?: boolean;
    onPress: () => void;
  }) => (
    <Tappable
      onPress={opts.onPress}
      style={{
        backgroundColor: opts.primary ? colors.primary : colors.surface,
        borderWidth: opts.primary ? 0 : 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ fontSize: 30, marginBottom: 6 }}>{opts.emoji}</Text>
      <Text style={{ fontSize: 19, fontWeight: '800', color: opts.primary ? colors.onPrimary : colors.textPrimary, marginBottom: 3 }}>
        {opts.title}
      </Text>
      <Text style={{ fontSize: 14, color: opts.primary ? 'rgba(255,255,255,0.8)' : colors.textTertiary }}>
        {opts.sub}
      </Text>
    </Tappable>
  );

  return (
    <Screen>
      <View style={{ marginBottom: spacing.lg, marginTop: spacing.sm }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 }}>
          Get your AI repair estimate
        </Text>
        <Text style={{ fontSize: 15, color: colors.textTertiary }}>
          First, tell us if you&apos;ve used AutoMate before.
        </Text>
      </View>

      {bigButton({
        emoji: '👋',
        title: "I'm a returning user",
        sub: 'Log in to your account',
        primary: true,
        onPress: () => requireAuth('estimateReturning'),
      })}
      {bigButton({
        emoji: '✨',
        title: "I'm new here",
        sub: 'Start your estimate — sign up when results are ready',
        onPress: () => navigation.replace('CarDiagram'),
      })}
    </Screen>
  );
}
