import React, { useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { spacing, useTheme } from '../theme';
import { panYStyle, webDragProps } from '../utils/webDrag';

/**
 * Horizontal paged carousel: each item fills the width and snaps one-per-view.
 * Touch swipes on native; on web the cards follow the mouse while the button
 * is down and snap to the nearest card on release. ‹ › buttons flank the
 * tappable dot indicators.
 */
export function PagedCarousel({ items, arrows = true, autoPlay }: { items: React.ReactNode[]; /** Show the ‹ › step buttons. */ arrows?: boolean; /** Advance every N ms (wraps around); pauses while hovered or dragged. */ autoPlay?: number }) {
  const { colors } = useTheme();
  const ref = useRef<ScrollView>(null);
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  idxRef.current = idx;
  const wRef = useRef(0);
  wRef.current = w;

  // Web: a horizontal ScrollView with scrolling off gets `touch-action: none`
  // from RNW, which swallows vertical finger scrolling over the carousel and
  // freezes the page under it. The class cannot be overridden from `style`,
  // so the rule goes straight onto the node.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = (ref.current as unknown as { getScrollableNode?: () => { style?: CSSStyleDeclaration } } | null)?.getScrollableNode?.();
    if (node?.style) node.style.touchAction = 'pan-y';
  }, []);

  const go = (next: number, animated = true) => {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setIdx(clamped);
    ref.current?.scrollTo({ x: clamped * wRef.current, animated });
  };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (w > 0) setIdx(Math.round(e.nativeEvent.contentOffset.x / w));
  };

  // Auto-play: step to the next card (wrapping) on a timer; any manual step
  // restarts the timer, and hovering / dragging pauses it.
  const [hovered, setHovered] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!autoPlay || items.length < 2 || hovered) return;
    const id = setInterval(() => {
      const next = (idxRef.current + 1) % items.length;
      setIdx(next);
      ref.current?.scrollTo({ x: next * wRef.current, animated: true });
    }, autoPlay);
    return () => clearInterval(id);
  }, [autoPlay, items.length, hovered, tick]);
  const goManual = (next: number) => {
    go(next);
    setTick((t) => t + 1);
  };

  // Web: the ScrollView follows neither mouse nor touch drags here, so the
  // cards are moved by hand from window listeners and snapped on release.
  // While a drag is in progress an overlay covers the cards so the release
  // isn't a tap on one. Sideways drags only, a vertical swipe is left to the
  // page so the screen still scrolls under a finger.
  const [dragging, setDragging] = useState(false);
  const startOffset = useRef(0);
  const dragProps = webDragProps(() => {
    if (items.length < 2) return null;
    startOffset.current = idxRef.current * wRef.current;
    return {
      onMove: (dx) => {
        setDragging(true);
        const max = (items.length - 1) * wRef.current;
        // Follow the pointer, with a little resistance past the ends.
        const raw = startOffset.current - dx;
        const x = raw < 0 ? raw * 0.35 : raw > max ? max + (raw - max) * 0.35 : raw;
        ref.current?.scrollTo({ x, animated: false });
      },
      onEnd: (dx) => {
        // Snap: a drag past a third of the width (or a quick flick) turns the page.
        const from = idxRef.current;
        const next = dx <= -wRef.current / 3 || dx <= -60 ? from + 1 : dx >= wRef.current / 3 || dx >= 60 ? from - 1 : from;
        goManual(next);
        setTimeout(() => setDragging(false), 50);
      },
    };
  }, 'x');
  const webMouse =
    Platform.OS === 'web'
      ? ({ ...dragProps, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } as object)
      : {};

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
        style={Platform.OS === 'web' ? ({ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', ...panYStyle } as object) : undefined}
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
          style={Platform.OS === 'web' ? (panYStyle as object) : undefined}
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
        {arrows && items.length > 1 ? <View style={{ marginRight: 10 }}>{arrow('left', () => goManual(idx - 1), idx === 0)}</View> : null}
        {items.map((_, i) => (
          <Tappable
            key={i}
            onPress={() => goManual(i)}
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
        {arrows && items.length > 1 ? <View style={{ marginLeft: 10 }}>{arrow('right', () => goManual(idx + 1), idx === items.length - 1)}</View> : null}
      </View>
    </View>
  );
}
