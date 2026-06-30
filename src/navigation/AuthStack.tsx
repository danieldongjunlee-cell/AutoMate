import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';

import { AuthChooserScreen } from '../screens/auth/AuthChooserScreen';
import { LogInScreen } from '../screens/auth/LogInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { VerifyMethodScreen } from '../screens/auth/VerifyMethodScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import { SCREEN_TITLES } from './registry';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** The auth flow itself (returning/new chooser → log in / sign up → verify).
 *  On the app background so it matches the chooser (not a navy gradient). */
export function AuthStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="AuthChooser"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AuthChooser" component={AuthChooserScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '' }} />
      <Stack.Screen name="LogIn" component={LogInScreen} options={{ title: '' }} />
      <Stack.Screen
        name="VerifyMethod"
        component={VerifyMethodScreen}
        options={{ title: SCREEN_TITLES.VerifyMethod }}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtpScreen}
        options={{ title: SCREEN_TITLES.VerifyOtp }}
      />
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
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated && rootNavigation.canGoBack()) rootNavigation.goBack();
  }, [isAuthenticated, rootNavigation]);
  return <AuthStack />;
}
