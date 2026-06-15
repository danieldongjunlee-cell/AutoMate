import React, { useState } from 'react';
import { View } from 'react-native';

import { Tappable } from './Tappable';
import { spacing, useTheme } from '../theme';

/**
 * Dot-controlled carousel (wireframe ad-banner / reviews pattern): shows one
 * item at a time, switched by tapping the dots below — no swipe, matching the
 * wireframe's carGo()/adGo()/revGo() behavior.
 */
export function DotCarousel({ items }: { items: React.ReactNode[] }) {
  const { colors } = useTheme();
  const [active, setActive] = useState(0);
  if (items.length === 0) return null;

  return (
    <View>
      <View style={{ marginBottom: spacing.sm }}>{items[Math.min(active, items.length - 1)]}</View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {items.map((_, i) => {
          const on = i === active;
          return (
            <Tappable key={i} onPress={() => setActive(i)} hitSlop={8}>
              <View
                style={{
                  width: on ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: on ? colors.primary : colors.border,
                }}
              />
            </Tappable>
          );
        })}
      </View>
    </View>
  );
}
