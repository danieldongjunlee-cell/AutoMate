import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';

import { createPlaceholderScreen } from '../screens/PlaceholderScreen';
import { Theme } from '../theme';
import { SCREEN_REGISTRY } from './registry';

/** Pre-built placeholder components (must be stable, not created in render). */
export function buildScreens<T extends string>(routes: readonly T[]) {
  return routes.map((name) => ({
    name,
    component: createPlaceholderScreen(name),
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
