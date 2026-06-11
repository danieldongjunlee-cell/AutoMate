import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { LogInScreen } from '../screens/auth/LogInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { palette } from '../theme';
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
        headerTintColor: 'rgba(255,255,255,.7)',
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: palette.navy },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '' }} />
      <Stack.Screen name="LogIn" component={LogInScreen} options={{ title: '' }} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: 'Verify phone' }} />
    </Stack.Navigator>
  );
}
