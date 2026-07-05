import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Tappable } from './Tappable';
import { radii, useTheme } from '../theme';

/**
 * The one canonical "Remove" button used everywhere a row/card can be deleted
 * (cars, payment cards, insurance policies). Red-outlined on the surface, so the
 * destructive action reads the same across the whole app.
 */
export function RemoveButton({
  onPress,
  label = 'Remove',
  style,
}: {
  onPress: () => void;
  label?: string;
  /** Extra layout (e.g. `{ flex: 1 }` when sitting beside an Edit button). */
  style?: object;
}) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      style={[
        {
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.danger,
          paddingVertical: 9,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.danger }}>{label}</Text>
    </Tappable>
  );
}
