import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { spacing, useTheme } from '../theme';

/**
 * Horizontal paged carousel: each item fills the width and snaps one-per-view.
 * Touch swipes on native; on web the cards follow the mouse while the button
 * is down and snap to the nearest card on release. ‹ › buttons flank the
 * tappable dot indicators.
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

  const go = (next: number, animated = true) => {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setIdx(clamped);
    ref.current?.scrollTo({ x: clamped * wRef.current, animated });
  };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (w > 0) setIdx(Math.round(e.nativeEvent.contentOffset.x / w));
  };

  // Web: the ScrollView doesn't follow mouse drags, so window mouse listeners
  // move the content with the cursor and snap on release. While a drag is in
  // progress an overlay covers the cards so the release isn't a tap on one.
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startOffset: number; moved: boolean } | null>(null);
  const onMouseDown = (e: { pageX: number }) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    drag.current = { startX: e.pageX, startOffset: idxRef.current * wRef.current, moved: false };
    const onMove = (ev: MouseEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = ev.pageX - d.startX;
      if (!d.moved && Math.abs(dx) > 6) {
        d.moved = true;
        setDragging(true);
      }
      if (d.moved) {
        const max = (items.length - 1) * wRef.current;
        // Follow the cursor, with a little resistance past the ends.
        const raw = d.startOffset - dx;
        const x = raw < 0 ? raw * 0.35 : raw > max ? max + (raw - max) * 0.35 : raw;
        ref.current?.scrollTo({ x, animated: false });
      }
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const d = drag.current;
      drag.current = null;
      if (!d?.moved) return;
      const dx = ev.pageX - d.startX;
      // Snap: a drag past a third of the width (or a quick flick) turns the page.
      const from = idxRef.current;
      const next = dx <= -wRef.current / 3 || dx <= -60 ? from + 1 : dx >= wRef.current / 3 || dx >= 60 ? from - 1 : from;
      go(next);
      setTimeout(() => setDragging(false), 50);
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
      <View
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        {...webMouse}
        style={Platform.OS === 'web' ? ({ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' } as object) : undefined}
      >
        <ScrollView
          ref={ref}
          horizontal
          // Web snaps by hand on release; CSS scroll-snap (pagingEnabled) would fight the drag.
          pagingEnabled={Platform.OS !== 'web'}
          scrollEnabled={Platform.OS !== 'web'}
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
