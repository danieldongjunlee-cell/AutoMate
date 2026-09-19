import React from 'react';

import { Icon, IconName } from '../components/Icon';
import { MainTabParamList } from './types';

const TAB_ICON: Record<keyof MainTabParamList, IconName> = {
  HomeTab: 'home',
  QuotesTab: 'tag',
  BookingsTab: 'calendar',
  CommunityTab: 'chat',
  MoreTab: 'dots',
};

/** Dock glyphs (31px): house / price tag / calendar / chat bubble / three dots. */
export function TabIcon({ tab, color, size = 31 }: { tab: keyof MainTabParamList; color: string; size?: number }) {
  const name = TAB_ICON[tab];
  return <Icon name={name} size={size} color={color} strokeWidth={name === 'dots' ? 2.2 : 1.7} filled={name === 'dots'} />;
}
