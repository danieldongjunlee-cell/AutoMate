import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';

import { createPlaceholderScreen } from '../screens/PlaceholderScreen';
import { Theme } from '../theme';
import { SCREEN_REGISTRY } from './registry';

/**
 * Pre-built screen list (must be stable, not created in render). Routes
 * without an override render the placeholder until their feature step lands.
 */
export function buildScreens<T extends string>(
  routes: readonly T[],
  overrides: Partial<Record<T, React.ComponentType<object>>> = {},
) {
  return routes.map((name) => ({
    name,
    component: overrides[name] ?? createPlaceholderScreen(name),
    title: SCREEN_REGISTRY[name].title,
  }));
}

/** Shared native-stack header styling derived from the theme. */
export function stackScreenOptions(theme: Theme): NativeStackNavigationOptions {
  return {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTitleStyle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '600',
    },
    headerTintColor: theme.colors.textTertiary,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: theme.colors.background },
  };
}
