import React, { useRef, useState } from 'react';
import { Modal, PanResponder, Platform, View } from 'react-native';

import { Text } from './Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { radii, spacing, useTheme } from '../theme';
import { webDragProps } from '../utils/webDrag';

export interface FilterGroup {
  key: string;
  title: string;
  options: string[];
  value: string;
  /** A glyph beside an option's label (a brand badge in the community picker). */
  optionIcon?: (option: string) => React.ReactNode;
  /** Hidden when the group has nothing to choose between. */
  hidden?: boolean;
}

export interface DistanceFilter {
  /** Miles, 1–30. */
  value: number;
  min?: number;
  max?: number;
}

/**
 * The single "Filter" pill (funnel icon, current value, count badge) that
 * replaces every chip row. Opens a FilterSheet.
 */
export function FilterButton({ label, count, onPress }: { label: string; count: number; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
      <Tappable
        onPress={onPress}
        accessibilityLabel="Filter"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 38,
          paddingHorizontal: 14,
          borderRadius: radii.pill,
          backgroundColor: colors.inputBg,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Icon name="funnel" size={18} color={colors.textPrimary} strokeWidth={1.8} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
        {count > 0 ? (
          <View style={{ backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{count}</Text>
          </View>
        ) : null}
      </Tappable>
    </View>
  );
}

/**
 * The app's one filter design: a sheet from the bottom with a grab handle,
 * the title and Reset, then each filter category in its own section, the
 * sections parted by a light grey line, single-choice pills inside, an
 * optional distance slider, and "Show results". Edits are local until
 * "Show results" applies them.
 */
export function FilterSheet({
  visible,
  title = 'Filters',
  groups,
  distance,
  resultsLabel = 'Show results',
  onApply,
  onClose,
}: {
  visible: boolean;
  title?: string;
  groups: FilterGroup[];
  distance?: DistanceFilter;
  resultsLabel?: string;
  onApply: (values: Record<string, string>, distanceMi?: number) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [dist, setDist] = useState<number | null>(null);
  const [wasVisible, setWasVisible] = useState(false);
  // Seed the draft from the applied values each time the sheet opens.
  if (visible && !wasVisible) {
    setWasVisible(true);
    setDraft(Object.fromEntries(groups.map((g) => [g.key, g.value])));
    setDist(distance?.value ?? null);
  } else if (!visible && wasVisible) {
    setWasVisible(false);
  }

  const reset = () => {
    setDraft(Object.fromEntries(groups.map((g) => [g.key, g.options[0]])));
    setDist(distance ? distance.max ?? 30 : null);
  };

  const shown = groups.filter((g) => !g.hidden);
  /** One filter category: uppercase title, then its pills. */
  const section = (key: string, heading: string, body: React.ReactNode) => (
    <View key={key} style={{ gap: 12, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.divider }}>
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>{heading}</Text>
      {body}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Tappable noFeedback onPress={onClose} style={{ flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' }}>
        <Tappable
          noFeedback
          onPress={() => undefined}
          style={{
            backgroundColor: colors.sheet,
            borderTopLeftRadius: radii.actionSheet,
            borderTopRightRadius: radii.actionSheet,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm,
          }}
        >
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.disabled, alignSelf: 'center', marginBottom: spacing.md }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.md }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>{title}</Text>
            <Tappable onPress={reset} hitSlop={8} accessibilityLabel="Reset filters">
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>Reset</Text>
            </Tappable>
          </View>

          {shown.map((g) =>
            section(
              g.key,
              g.title,
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {g.options.map((o) => {
                  const on = (draft[g.key] ?? g.value) === o;
                  const glyph = g.optionIcon?.(o);
                  return (
                    <Tappable
                      key={o}
                      onPress={() => setDraft((d) => ({ ...d, [g.key]: o }))}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={o}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: on ? colors.primary : colors.inputBg,
                        borderWidth: 1,
                        borderColor: on ? colors.primary : colors.border,
                        borderRadius: radii.pill,
                        paddingLeft: glyph ? 8 : 14,
                        paddingRight: 14,
                        paddingVertical: glyph ? 5 : 7,
                      }}
                    >
                      {glyph}
                      <Text style={{ fontSize: 14, fontWeight: on ? '700' : '500', color: on ? '#fff' : colors.textSecondary }}>{o}</Text>
                    </Tappable>
                  );
                })}
              </View>,
            ),
          )}

          {distance && dist != null
            ? section('distance', 'Distance', <DistanceSlider value={dist} min={distance.min ?? 1} max={distance.max ?? 30} onChange={setDist} />)
            : null}

          <Tappable
            onPress={() => {
              onApply(draft, dist ?? undefined);
              onClose();
            }}
            accessibilityLabel={resultsLabel}
            style={{ backgroundColor: colors.primary, borderRadius: radii.pill, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.onPrimary }}>{resultsLabel}</Text>
          </Tappable>
        </Tappable>
      </Tappable>
    </Modal>
  );
}

/** 1–30 mi slider: blue fill, white thumb, min · value · max under the track. */
function DistanceSlider({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const wRef = useRef(0);
  wRef.current = w;
  const trackRef = useRef<View>(null);
  const trackX = useRef(0);
  const pct = ((value - min) / (max - min)) * 100;
  // Pointer x in window coordinates → value; the track's window x is measured on layout.
  const fromPageX = (pageX: number) => {
    const tw = wRef.current || 1;
    const x = pageX - trackX.current;
    const v = Math.round(min + (Math.max(0, Math.min(tw, x)) / tw) * (max - min));
    onChange(v);
  };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => fromPageX(e.nativeEvent.pageX),
      onPanResponderMove: (_e, g) => fromPageX(g.moveX),
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;
  // Web (a phone browser included): mouse or finger, tracked against the track's box.
  const startX = useRef(0);
  const webDrag = webDragProps(() => {
    const node = trackRef.current as unknown as { getBoundingClientRect?: () => { left: number } } | null;
    const left = node?.getBoundingClientRect?.().left;
    if (left != null && typeof window !== 'undefined') trackX.current = left + window.scrollX;
    return {
      onMove: (dx) => fromPageX(startX.current + dx),
      onEnd: (dx) => fromPageX(startX.current + dx),
    };
  });
  const handlers =
    Platform.OS === 'web'
      ? {
          ...webDrag,
          // The press itself sets the value, before any drag.
          onMouseDown: (e: { pageX: number }) => {
            startX.current = e.pageX;
            fromPageX(e.pageX);
            (webDrag as { onMouseDown: (ev: unknown) => void }).onMouseDown(e);
          },
          onTouchStart: (e: { nativeEvent?: { pageX?: number }; touches?: ArrayLike<{ pageX: number }> }) => {
            const x = e.touches?.[0]?.pageX ?? e.nativeEvent?.pageX ?? 0;
            startX.current = x;
            fromPageX(x);
            (webDrag as { onTouchStart: (ev: unknown) => void }).onTouchStart(e);
          },
        }
      : pan.panHandlers;

  return (
    <View style={{ paddingHorizontal: 4, paddingTop: 10 }}>
      <View
        ref={trackRef}
        {...handlers}
        onLayout={(e) => {
          setW(e.nativeEvent.layout.width);
          trackRef.current?.measureInWindow((x) => {
            trackX.current = x;
          });
        }}
        accessibilityRole="adjustable"
        accessibilityLabel="Distance"
        accessibilityValue={{ min, max, now: value }}
        onResponderTerminationRequest={() => false}
        style={[{ height: 30, justifyContent: 'center' }, Platform.OS === 'web' ? ({ cursor: 'pointer', touchAction: 'none' } as object) : null]}
      >
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border }}>
          <View style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${pct}%`, borderRadius: 3, backgroundColor: colors.primary }} />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: (pct / 100) * w - 12,
            top: 3,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.primary,
            shadowColor: '#000',
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{min} mi</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>Within {value} mi</Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{max} mi</Text>
      </View>
    </View>
  );
}
