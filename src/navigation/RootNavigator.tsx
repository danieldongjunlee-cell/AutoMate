import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { fetchBookings } from '../lib/bookings';
import { fetchPointsBalance } from '../lib/points';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseSessionUser } from '../lib/supabaseAuth';
import { vehiclesService } from '../services';
import { seedDemoPolicies } from '../services/mock/insuranceService';
import { queryClient } from '../services/queryClient';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import { AuthModal } from './AuthStack';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  // Signing in or out swaps what the account-bound lists return, so refetch them all.
  useEffect(() => {
    void queryClient.invalidateQueries();
  }, [isAuthenticated]);
  const setAuth = useAppStore((s) => s.setAuth);
  const signIn = useAppStore((s) => s.signIn);
  const setBookings = useAppStore((s) => s.setBookings);
  const setPoints = useAppStore((s) => s.setPoints);
  const theme = useTheme();

  // E2E hook: only when the web export is built with EXPO_PUBLIC_E2E=1 (the
  // screenshot runs in docs/redesign). Never set on Vercel, so production
  // bundles carry neither the ref nor the store handle.
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_E2E === '1') {
      (globalThis as { __nav?: unknown; __store?: unknown; __seedDemo?: unknown }).__nav = navRef;
      (globalThis as { __nav?: unknown; __store?: unknown; __seedDemo?: unknown }).__store = useAppStore;
      (globalThis as { __nav?: unknown; __store?: unknown; __seedDemo?: unknown }).__seedDemo = seedDemoPolicies;
    }
  }, []);

  // Returning users: if Supabase still has a valid session, restore it.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabaseSessionUser().then((u) => {
      if (u) {
        setAuth(u.token, { name: u.name, email: u.email, phone: u.phone });
        signIn();
      }
    });
  }, [setAuth, signIn]);

  // A guest who entered their car during the AI estimate and then signed up:
  // save that car to their new account and make it the active car.
  const pendingVehicle = useAppStore((s) => s.pendingVehicle);
  const setPendingVehicle = useAppStore((s) => s.setPendingVehicle);
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  useEffect(() => {
    if (!isAuthenticated || !pendingVehicle) return;
    const car = pendingVehicle;
    setPendingVehicle(null);
    vehiclesService
      .addVehicle({ name: car.name, colorName: car.colorName })
      .then((r) => {
        setActiveVehicle(r.vehicle.id, { carrySubmission: true });
        void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      })
      .catch(() => setPendingVehicle(car));
  }, [isAuthenticated, pendingVehicle, setPendingVehicle, setActiveVehicle]);

  // Hydrate Supabase-backed store caches (bookings, points) once authenticated.
  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthenticated) return;
    fetchBookings().then(setBookings).catch(() => {});
    fetchPointsBalance().then(setPoints).catch(() => {});
  }, [isAuthenticated, setBookings, setPoints]);

  // Web: the page body shows through during navigation transitions and past
  // the app root, keep it on the theme ground.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = theme.colors.background;
      document.documentElement.style.colorScheme = theme.dark ? 'dark' : 'light';
    }
  }, [theme]);

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
    <NavigationContainer ref={navRef} theme={navTheme}>
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
