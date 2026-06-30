import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';

import { AuthChooserScreen } from '../screens/auth/AuthChooserScreen';
import { LogInScreen } from '../screens/auth/LogInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { VerifyMethodScreen } from '../screens/auth/VerifyMethodScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { useAppStore } from '../store/useAppStore';
import { palette } from '../theme';
import { SCREEN_TITLES } from './registry';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** The auth flow itself (returning/new chooser → log in / sign up → verify). */
export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="AuthChooser"
      screenOptions={{
        // Auth screens sit on the navy gradient in the wireframe.
        headerStyle: { backgroundColor: palette.navy },
        headerTitleStyle: { color: '#fff', fontSize: 17, fontWeight: '600' },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: palette.navy },
      }}
    >
      <Stack.Screen name="AuthChooser" component={AuthChooserScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
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
