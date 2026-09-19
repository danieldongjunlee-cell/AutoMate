import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { spacing, useTheme } from '../theme';

/**
 * Horizontal paged carousel: each item fills the width and snaps one-per-view.
 * Swipe on touch, or on web drag with the mouse (a horizontal drag of 40px+
 * turns the page) or use the ‹ › arrows at the edges. Dot indicators below
 * track the current page and are tappable.
 */
export function PagedCarousel({ items, arrows = true }: { items: React.ReactNode[]; /** Show the ‹ › step buttons. */ arrows?: boolean }) {
  const { colors } = useTheme();
  const ref = useRef<ScrollView>(null);
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  idxRef.current = idx;
  const wRef = useRef(0);
  wRef.current = w;

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setIdx(clamped);
    ref.current?.scrollTo({ x: clamped * wRef.current, animated: true });
  };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (w > 0) setIdx(Math.round(e.nativeEvent.contentOffset.x / w));
  };

  // Web: the ScrollView doesn't follow mouse drags, so a horizontal mouse drag
  // on the wrapper turns the page. While a drag is in progress an overlay sits
  // over the cards so the release doesn't count as a tap on the card. Native
  // keeps the ScrollView's own touch scrolling (this is a no-op there).
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; moved: boolean } | null>(null);
  const onMouseDown = (e: { pageX: number }) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    drag.current = { startX: e.pageX, moved: false };
    const onMove = (ev: MouseEvent) => {
      if (!drag.current) return;
      if (!drag.current.moved && Math.abs(ev.pageX - drag.current.startX) > 8) {
        drag.current.moved = true;
        setDragging(true);
      }
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const d = drag.current;
      drag.current = null;
      if (d?.moved) {
        const dx = ev.pageX - d.startX;
        if (dx <= -40) go(idxRef.current + 1);
        else if (dx >= 40) go(idxRef.current - 1);
        // Keep the overlay for the click that follows mouseup, then drop it.
        setTimeout(() => setDragging(false), 50);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  const webMouse = Platform.OS === 'web' ? ({ onMouseDown } as object) : {};

  /** Small ‹ › step buttons that flank the dots (never over the card content). */
  const arrow = (side: 'left' | 'right', onPress: () => void, disabled: boolean) => (
    <Tappable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityLabel={side === 'left' ? 'Previous' : 'Next'}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <Icon name={side === 'left' ? 'back' : 'chevron'} size={18} color={colors.textPrimary} strokeWidth={2} />
    </Tappable>
  );

  return (
    <View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} {...webMouse} style={Platform.OS === 'web' ? ({ cursor: 'grab', userSelect: 'none' } as object) : undefined}>
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
        {dragging ? <View style={StyleSheet.absoluteFill} /> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md }}>
        {arrows && items.length > 1 ? <View style={{ marginRight: 10 }}>{arrow('left', () => go(idx - 1), idx === 0)}</View> : null}
        {items.map((_, i) => (
          <Tappable
            key={i}
            onPress={() => go(i)}
            hitSlop={6}
            noFeedback
            style={{
              width: i === idx ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === idx ? colors.primary : colors.border,
            }}
          />
        ))}
        {arrows && items.length > 1 ? <View style={{ marginLeft: 10 }}>{arrow('right', () => go(idx + 1), idx === items.length - 1)}</View> : null}
      </View>
    </View>
  );
}
