import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { fetchBookings } from '../lib/bookings';
import { fetchPointsBalance } from '../lib/points';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseSessionUser } from '../lib/supabaseAuth';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import { AuthModal } from './AuthStack';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setAuth = useAppStore((s) => s.setAuth);
  const signIn = useAppStore((s) => s.signIn);
  const setBookings = useAppStore((s) => s.setBookings);
  const setPoints = useAppStore((s) => s.setPoints);
  const theme = useTheme();

  // Returning users: if Supabase still has a valid session, restore it.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabaseSessionUser().then((u) => {
      if (u) {
        setAuth(u.token, { name: u.name, email: u.email, username: u.username, phone: u.phone });
        signIn();
      }
    });
  }, [setAuth, signIn]);

  // Hydrate Supabase-backed store caches (bookings, points) once authenticated.
  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthenticated) return;
    fetchBookings().then(setBookings).catch(() => {});
    fetchPointsBalance().then(setPoints).catch(() => {});
  }, [isAuthenticated, setBookings, setPoints]);

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
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      {/* Guest-first: the tabs are always mounted; auth is a modal presented
          over them at value-action gates (useRequireAuth → navigate('Auth')). */}
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen name="Auth" component={AuthModal} options={{ presentation: 'modal' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
