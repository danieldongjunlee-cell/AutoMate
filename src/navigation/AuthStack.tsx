import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { palette, useTheme } from '../theme';
import { buildScreens, stackScreenOptions } from './stackFactory';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const screens = buildScreens(['Splash', 'SignUp', 'LogIn', 'VerifyOtp'] as const);

export function AuthStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        ...stackScreenOptions(theme),
        // Auth screens sit on the navy gradient in the wireframe.
        headerStyle: { backgroundColor: palette.navy },
        headerTitleStyle: { color: palette.white, fontSize: 17, fontWeight: '600' },
        headerTintColor: palette.white,
        contentStyle: { backgroundColor: palette.navy },
      }}
    >
      {screens.map(({ name, component, title }) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={{ title, headerShown: name !== 'Splash' }}
        />
      ))}
    </Stack.Navigator>
  );
}
