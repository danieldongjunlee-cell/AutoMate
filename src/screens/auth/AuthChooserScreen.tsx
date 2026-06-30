import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { AuthStackParamList } from '../../navigation/types';
import { palette, radii, spacing } from '../../theme';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'AuthChooser'>;
type Route = RouteProp<AuthStackParamList, 'AuthChooser'>;

/** Short line explaining why we're asking, by gate intent. */
const INTENT_COPY: Record<string, string> = {
  submitEstimate: 'Sign in to receive your repair quotes.',
  selectShop: 'Sign in to book this shop.',
  bookService: 'Sign in to book your service.',
  acceptQuote: 'Sign in to accept this quote.',
  writeReview: 'Sign in to post your review.',
  saveCar: 'Sign in to save your car.',
  savePayment: 'Sign in to save a payment method.',
  savePolicy: 'Sign in to save your policy.',
  redeemPoints: 'Sign in to redeem your points.',
};

/**
 * Guest-first auth gate entry: two big buttons — returning user (→ log in) or
 * new user (→ sign up). Shown as a modal over the tabs at value-action gates.
 */
export function AuthChooserScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const intent = route.params?.intent;
  const reason = intent ? INTENT_COPY[intent] : undefined;

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
        backgroundColor: opts.primary ? palette.primary : 'rgba(255,255,255,0.08)',
        borderWidth: opts.primary ? 0 : 1,
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ fontSize: 30, marginBottom: 6 }}>{opts.emoji}</Text>
      <Text style={{ fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 3 }}>{opts.title}</Text>
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{opts.sub}</Text>
    </Tappable>
  );

  return (
    <AuthScreenShell centered>
      <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
        Welcome to AutoMate
      </Text>
      <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xl }}>
        {reason ?? 'Log in or create an account to continue.'}
      </Text>

      {bigButton({
        emoji: '👋',
        title: "I'm a returning user",
        sub: 'Log in to your account',
        primary: true,
        onPress: () => navigation.navigate('LogIn'),
      })}
      {bigButton({
        emoji: '✨',
        title: "I'm new here",
        sub: 'Create an account in under a minute',
        onPress: () => navigation.navigate('SignUp'),
      })}

      <Tappable
        onPress={() => navigation.getParent()?.goBack()}
        style={{ alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm }}
      >
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Not now</Text>
      </Tappable>
    </AuthScreenShell>
  );
}
