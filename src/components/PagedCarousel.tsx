import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';

import { Tappable } from './Tappable';
import { spacing, useTheme } from '../theme';

/**
 * Horizontal paged carousel: each item fills the width and snaps one-per-view as
 * you scroll left/right. Small circular ‹ › arrow buttons step between pages and
 * dot indicators below track the current page (wireframe ad/review pattern).
 */
export function PagedCarousel({ items }: { items: React.ReactNode[] }) {
  const { colors } = useTheme();
  const ref = useRef<ScrollView>(null);
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(0);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setIdx(clamped);
    ref.current?.scrollTo({ x: clamped * w, animated: true });
  };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (w > 0) setIdx(Math.round(e.nativeEvent.contentOffset.x / w));
  };

  const arrow = (side: 'left' | 'right', onPress: () => void, disabled: boolean) => (
    <Tappable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={{
        position: 'absolute',
        top: '50%',
        marginTop: -16,
        left: side === 'left' ? 8 : undefined,
        right: side === 'right' ? 8 : undefined,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.3 : 0.96,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: -2 }}>
        {side === 'left' ? '‹' : '›'}
      </Text>
    </Tappable>
  );

  return (
    <View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <ScrollView
          ref={ref}
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
        {items.length > 1 && w > 0 ? (
          <>
            {arrow('left', () => go(idx - 1), idx === 0)}
            {arrow('right', () => go(idx + 1), idx === items.length - 1)}
          </>
        ) : null}
      </View>
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
