import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { LogoRow } from '../../components/Logo';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

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
  signIn: 'Log in or create an account to continue.',
  deals: 'Sign in to view deals & offers.',
  myCars: 'Sign in to manage your cars.',
  insurance: 'Sign in to manage your insurance.',
  payment: 'Sign in to manage payment methods.',
  estimateHistory: 'Sign in to view your estimate history.',
  getPro: 'Sign in to get AutoMate Pro.',
  maintDashboard: 'Sign in to open your maintenance dashboard.',
  checkIn: 'Sign in to claim your daily check-in.',
  milestones: 'Sign in to view your milestones.',
  pointsHistory: 'Sign in to view your points history.',
};

/**
 * Guest-first auth gate: returning vs new in two side-by-side buttons (centered
 * text, no icons). On the app background — not the navy auth gradient. Each
 * button leads to log in / sign up, both of which offer Google & Apple.
 */
export function AuthChooserScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const intent = route.params?.intent;
  const reason = (intent && INTENT_COPY[intent]) || 'Log in or create an account to continue.';

  const choice = (opts: { title: string; sub: string; primary?: boolean; onPress: () => void }) => (
    <Tappable
      onPress={opts.onPress}
      style={{
        flex: 1,
        minHeight: 132,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.lg,
        backgroundColor: opts.primary ? colors.primary : colors.surface,
        borderWidth: opts.primary ? 0 : 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '800',
          textAlign: 'center',
          color: opts.primary ? colors.onPrimary : colors.textPrimary,
        }}
      >
        {opts.title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          textAlign: 'center',
          marginTop: 5,
          color: opts.primary ? 'rgba(255,255,255,0.8)' : colors.textTertiary,
        }}
      >
        {opts.sub}
      </Text>
    </Tappable>
  );

  return (
    <Screen safeTop style={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <LogoRow markSize={30} textSize={20} />
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.lg, textAlign: 'center' }}>
          Welcome to AutoMate
        </Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 4, textAlign: 'center' }}>
          {reason}
        </Text>
      </View>

      {/* Returning (left) · New (right) */}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {choice({
          title: 'Returning user',
          sub: 'Log in',
          primary: true,
          onPress: () => navigation.navigate('LogIn'),
        })}
        {choice({
          title: 'New user',
          sub: 'Create an account',
          onPress: () => navigation.navigate('SignUp'),
        })}
      </View>

      <Tappable
        onPress={() => navigation.getParent()?.goBack()}
        style={{ alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.lg }}
      >
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>Not now</Text>
      </Tappable>
    </Screen>
  );
}
