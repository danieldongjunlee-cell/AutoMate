import React from 'react';
import { Text, View } from 'react-native';

import { spacing, useTheme } from '../theme';

/**
 * Thin segmented progress bar for the submit-for-quotes flow (select photos →
 * confirm → submitted), shown at the top of each step so progress is trackable.
 */
export function SubmitProgress({
  step,
  total = 3,
  left,
  right,
}: {
  step: number;
  total?: number;
  left?: string;
  right?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i < step ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
      {left || right ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>{left}</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>{right}</Text>
        </View>
      ) : null}
    </View>
  );
}
