import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { fetchBookings } from '../lib/bookings';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseSessionUser } from '../lib/supabaseAuth';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

export function RootNavigator() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setAuth = useAppStore((s) => s.setAuth);
  const signIn = useAppStore((s) => s.signIn);
  const setBookings = useAppStore((s) => s.setBookings);
  const theme = useTheme();

  // Returning users: if Supabase still has a valid session, skip the auth stack.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabaseSessionUser().then((u) => {
      if (u) {
        setAuth(u.token, { name: u.name, email: u.email, username: u.username });
        signIn();
      }
    });
  }, [setAuth, signIn]);

  // Hydrate Supabase-backed store caches (bookings) once authenticated.
  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthenticated) return;
    fetchBookings().then(setBookings).catch(() => {});
  }, [isAuthenticated, setBookings]);

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
