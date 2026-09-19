import React from 'react';
import { Text } from 'react-native';

import { pointsToUsd } from '../config/points';
import { radii, useTheme } from '../theme';

/** ★ +N pts chip (scan/manual/post rewards). `usd` appends the dollar value. */
export function PointsBadge({ points, usd = false }: { points: number; usd?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        backgroundColor: colors.warningSurface,
        color: colors.warningDeep,
        fontSize: 13,
        fontWeight: '500',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: radii.pill,
        overflow: 'hidden',
      }}
    >
      ★ +{points} pts{usd ? ` · ${pointsToUsd(points)}` : ''}
    </Text>
  );
}
