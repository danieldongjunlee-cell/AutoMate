import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { LogInScreen } from '../screens/auth/LogInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { VerifyMethodScreen } from '../screens/auth/VerifyMethodScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { palette } from '../theme';
import { SCREEN_TITLES } from './registry';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
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
