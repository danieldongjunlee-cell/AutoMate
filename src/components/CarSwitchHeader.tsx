import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { CarSwitcherSheet } from './CarSwitcherSheet';
import { Tappable } from './Tappable';
import { useActiveVehicle } from '../hooks/useActiveVehicle';
import { radii, spacing, useTheme } from '../theme';

/**
 * Right-aligned active-car chip shown at the top of every tab. Tapping it (with
 * >1 car) opens the switcher; the choice is global, so all screens that read
 * useActiveVehicle re-render to the selected car.
 */
export function CarSwitchHeader({ align = 'flex-end' }: { align?: 'flex-end' | 'flex-start' }) {
  const { colors } = useTheme();
  const { vehicles, active, brand } = useActiveVehicle();
  const [open, setOpen] = useState(false);
  if (!active) return null;
  const multi = vehicles.length > 1;

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: align, marginBottom: spacing.sm }}>
        <Tappable
          onPress={() => multi && setOpen(true)}
          disabled={!multi}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radii.pill,
            paddingLeft: spacing.sm,
            paddingRight: multi ? 8 : spacing.sm,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 14 }}>🚗</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
            {brand}
          </Text>
          {multi ? <Text style={{ fontSize: 13, color: colors.primary }}>⇅</Text> : null}
        </Tappable>
      </View>
      <CarSwitcherSheet visible={open} vehicles={vehicles} activeId={active.id} onClose={() => setOpen(false)} />
    </>
  );
}
