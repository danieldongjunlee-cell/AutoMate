import React, { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';

import { spacing, useTheme } from '../theme';

/**
 * Horizontal paged carousel: each item fills the width and snaps one-per-view as
 * you scroll left/right, with dot indicators below (wireframe ad/review pattern).
 */
export function PagedCarousel({ items }: { items: React.ReactNode[] }) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(0);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (w > 0) setIdx(Math.round(e.nativeEvent.contentOffset.x / w));
  };

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        scrollEventThrottle={16}
      >
        {items.map((it, i) => (
          <View key={i} style={{ width: w }}>
            {it}
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm }}>
        {items.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === idx ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === idx ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
