import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { MainTabParamList } from './types';

/**
 * Tab-bar icons ported 1:1 from the v17 wireframe's inline SVGs
 * (house / calendar / chat bubble / three-dots), 24×24 viewBox, 1.9 stroke.
 */
export function TabIcon({ tab, color }: { tab: keyof MainTabParamList; color: string }) {
  const stroke = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (tab) {
    case 'HomeTab':
      return (
        <Svg {...stroke}>
          <Path d="M4 11.5 12 4l8 7.5" />
          <Path d="M6 10.5V20h12v-9.5" />
          <Path d="M10 20v-5h4v5" />
        </Svg>
      );
    case 'QuotesTab':
      return (
        <Svg {...stroke}>
          <Path d="M6 3.5h9l4 4V20.5H6Z" />
          <Path d="M14.5 3.5v4h4M9 12h6M9 15.5h6" />
        </Svg>
      );
    case 'BookingsTab':
      return (
        <Svg {...stroke}>
          <Rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <Path d="M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5" />
        </Svg>
      );
    case 'CommunityTab':
      return (
        <Svg {...stroke}>
          <Path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 16H10l-4 3.5V16H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 5Z" />
        </Svg>
      );
    case 'MoreTab':
    default:
      return (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill={color}>
          <Circle cx="5.5" cy="12" r="1.7" />
          <Circle cx="12" cy="12" r="1.7" />
          <Circle cx="18.5" cy="12" r="1.7" />
        </Svg>
      );
  }
}
