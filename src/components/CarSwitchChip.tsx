import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { CarSwitcherSheet } from './CarSwitcherSheet';
import { Tappable } from './Tappable';
import { brandLogoUrl, modelOf, useActiveVehicle } from '../hooks/useActiveVehicle';
import { radii, spacing, useTheme } from '../theme';

/**
 * Inline active-car chip: brand logo + brand + model, tappable (when >1 car) to
 * open the switcher. Placed on the same row as each tab's title.
 */
export function CarSwitchChip() {
  const { colors } = useTheme();
  const { vehicles, active, brand } = useActiveVehicle();
  const [open, setOpen] = useState(false);
  if (!active) return null;
  const multi = vehicles.length > 1;
  const logo = brandLogoUrl(brand);

  return (
    <>
      <Tappable
        onPress={() => multi && setOpen(true)}
        disabled={!multi}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.pill,
          paddingLeft: 6,
          paddingRight: multi ? 8 : spacing.sm,
          paddingVertical: 5,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {logo ? (
            <Image source={{ uri: logo }} style={{ width: 18, height: 18 }} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 13 }}>🚗</Text>
          )}
        </View>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
            {brand}
          </Text>
          <Text style={{ fontSize: 9, color: colors.textTertiary }} numberOfLines={1}>
            {modelOf(active.name, brand)}
          </Text>
        </View>
        {multi ? <Text style={{ fontSize: 13, color: colors.primary }}>⇅</Text> : null}
      </Tappable>
      <CarSwitcherSheet visible={open} vehicles={vehicles} activeId={active.id} onClose={() => setOpen(false)} />
    </>
  );
}
