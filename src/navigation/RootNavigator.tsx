import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

export function RootNavigator() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const theme = useTheme();

  const base = theme.dark ? NavDarkTheme : NavLightTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.tabBarBackground,
      text: theme.colors.textPrimary,
      border: theme.colors.tabBarBorder,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {/* Auth screens sit on navy → always light status content there. */}
      <StatusBar style={!isAuthenticated || theme.dark ? 'light' : 'dark'} />
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
