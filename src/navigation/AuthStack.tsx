import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';

import { AuthScreen } from '../screens/auth/AuthScreen';
import { VerifyMethodScreen } from '../screens/auth/VerifyMethodScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import { SCREEN_TITLES } from './registry';
import { AuthStackParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** The auth flow itself: Sign In / Join → (verify method → OTP on sign-up). */
export function AuthStack({ intent, tab }: { intent?: string; tab?: 'signin' | 'join' }) {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="AuthMain"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AuthMain" component={AuthScreen} initialParams={{ intent, tab }} options={{ headerShown: false }} />
      <Stack.Screen name="VerifyMethod" component={VerifyMethodScreen} options={{ title: SCREEN_TITLES.VerifyMethod }} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: SCREEN_TITLES.VerifyOtp }} />
    </Stack.Navigator>
  );
}

/**
 * The auth flow as a root-stack modal (guest-first). Once the user signs in/up
 * anywhere inside it, `isAuthenticated` flips and this dismisses itself — the
 * gate that opened it resumes the pending action.
 */
export function AuthModal() {
  const rootNavigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated && rootNavigation.canGoBack()) rootNavigation.goBack();
  }, [isAuthenticated, rootNavigation]);
  return <AuthStack intent={params?.intent} tab={params?.tab} />;
}
