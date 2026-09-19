import React, { useRef, useState } from 'react';
import { Modal, PanResponder, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { palette, radii, spacing, useTheme } from '../theme';

export interface FilterGroup {
  key: string;
  title: string;
  options: string[];
  value: string;
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
 * Bottom sheet with grouped single-choice pills and an optional distance
 * slider (1–30 mi), plus Reset and "Show results". Edits are local until
 * "Show results" applies them.
 */
export function FilterSheet({
  visible,
  title = 'Filters',
  groups,
  distance,
  onApply,
  onClose,
}: {
  visible: boolean;
  title?: string;
  groups: FilterGroup[];
  distance?: DistanceFilter;
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Tappable noFeedback onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(3,6,12,0.66)', justifyContent: 'flex-end' }}>
        <Tappable
          noFeedback
          onPress={() => undefined}
          style={{
            backgroundColor: palette.sheet,
            borderTopLeftRadius: radii.actionSheet,
            borderTopRightRadius: radii.actionSheet,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm,
            gap: spacing.xxl,
          }}
        >
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#39435a', alignSelf: 'center', marginBottom: 2 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>{title}</Text>
            <Tappable onPress={reset} hitSlop={8}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>Reset</Text>
            </Tappable>
          </View>

          {distance && dist != null ? (
            <DistanceSlider value={dist} min={distance.min ?? 1} max={distance.max ?? 30} onChange={setDist} />
          ) : null}

          {groups.map((g) => (
            <View key={g.key} style={{ gap: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>{g.title}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {g.options.map((o) => {
                  const on = (draft[g.key] ?? g.value) === o;
                  return (
                    <Tappable
                      key={o}
                      onPress={() => setDraft((d) => ({ ...d, [g.key]: o }))}
                      style={{
                        backgroundColor: on ? colors.primary : colors.inputBg,
                        borderWidth: 1,
                        borderColor: on ? colors.primary : colors.border,
                        borderRadius: radii.pill,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: on ? '700' : '500', color: on ? '#fff' : colors.textSecondary }}>{o}</Text>
                    </Tappable>
                  );
                })}
              </View>
            </View>
          ))}

          <Tappable
            onPress={() => {
              onApply(draft, dist ?? undefined);
              onClose();
            }}
            style={{ backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 14, alignItems: 'center', marginTop: 6 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Show results</Text>
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
  // Web: the responder system doesn't deliver mouse-drag moves, so track the
  // pointer with window listeners against the track's bounding box.
  const onMouseDown = (e: { pageX: number; preventDefault?: () => void }) => {
    if (typeof window === 'undefined') return;
    e.preventDefault?.();
    const node = trackRef.current as unknown as { getBoundingClientRect?: () => { left: number } } | null;
    const left = node?.getBoundingClientRect?.().left;
    if (left != null) trackX.current = left + window.scrollX;
    fromPageX(e.pageX);
    const onMove = (ev: MouseEvent) => fromPageX(ev.pageX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  const handlers = Platform.OS === 'web' ? ({ onMouseDown } as object) : pan.panHandlers;

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>Distance</Text>
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
          style={[{ height: 30, justifyContent: 'center' }, Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null]}
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
              backgroundColor: '#e8edf5',
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
    </View>
  );
}
