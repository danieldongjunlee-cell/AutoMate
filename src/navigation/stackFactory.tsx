import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';

import { Theme } from '../theme';
import { SCREEN_TITLES } from './registry';

/** Pair every route with its screen component and wireframe header title. */
export function buildScreens<T extends string>(
  routes: readonly T[],
  components: Record<T, React.ComponentType<object>>,
) {
  return routes.map((name) => ({
    name,
    component: components[name],
    title: SCREEN_TITLES[name],
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
