import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DealerMap, LatLng, MapMarker } from './DealerMap';
import { DEFAULT_ZOOM } from './DealerMap/types';
import { Icon, IconName } from './Icon';
import { Tappable } from './Tappable';
import { radii, spacing, useTheme } from '../theme';

/** Where the sheet's top edge sits, as a share of the screen height, when half open. */
const HALF_SHARE = 0.44;
const HANDLE_AREA_H = 26;

/**
 * Shift a map centre so `center` lands `dyPx` above the map's middle — used to
 * keep the pins in the strip of map that shows above the half-open sheet.
 */
function offsetCenter(center: LatLng, zoom: number, dyPx: number): LatLng {
  const degPerPx = 360 / (256 * Math.pow(2, zoom));
  const latPerPx = degPerPx * Math.cos((center.lat * Math.PI) / 180);
  return { lat: center.lat - dyPx * latPerPx, lng: center.lng };
}

/**
 * Maps-app results layout: the map fills the screen and a draggable bottom
 * sheet holds the title, a row of filter chips and the scrolling list. The
 * sheet snaps between half open (map visible above it) and fully open; drag
 * the handle or tap it to switch.
 */
export function MapSheet({
  markers,
  center,
  zoom = DEFAULT_ZOOM,
  onSelectPin,
  title,
  subtitle,
  onClose,
  headerRight,
  chips,
  children,
  scrollRef,
  onExpandedChange,
}: {
  markers: MapMarker[];
  center: LatLng;
  zoom?: number;
  onSelectPin?: (id: string) => void;
  title: string;
  subtitle?: string;
  /** × in the header. */
  onClose?: () => void;
  headerRight?: React.ReactNode;
  /** Filter chips (FilterChip) laid out in a horizontal row under the title. */
  chips?: React.ReactNode;
  children: React.ReactNode;
  scrollRef?: React.Ref<ScrollView>;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();

  const fullTop = Math.max(insets.top, 8) + 8;
  const halfTop = Math.round(screenH * HALF_SHARE);
  const [expanded, setExpanded] = useState(false);
  const top = useRef(new Animated.Value(halfTop)).current;
  const topValue = useRef(halfTop);
  useEffect(() => {
    const id = top.addListener(({ value }) => (topValue.current = value));
    return () => top.removeListener(id);
  }, [top]);

  const snapTo = (open: boolean) => {
    setExpanded(open);
    onExpandedChange?.(open);
    Animated.spring(top, { toValue: open ? fullTop : halfTop, useNativeDriver: false, bounciness: 2, speed: 18 }).start();
  };
  // Keep the sheet on its snap point if the window resizes.
  useEffect(() => {
    top.setValue(expanded ? fullTop : halfTop);
  }, [fullTop, halfTop, expanded, top]);

  // Drag: native PanResponder on the handle; DOM mouse listeners on web (the
  // responder system doesn't deliver mouse-drag moves there).
  const drag = useRef<{ startY: number; startTop: number; moved: boolean } | null>(null);
  const onDragMove = (dy: number) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(dy) > 4) d.moved = true;
    if (d.moved) top.setValue(Math.max(fullTop, Math.min(halfTop + 80, d.startTop + dy)));
  };
  const onDragEnd = (dy: number) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      snapTo(!expanded);
      return;
    }
    // Snap to whichever edge is nearer, with a flick threshold.
    const mid = (fullTop + halfTop) / 2;
    snapTo(dy < -40 ? true : dy > 40 ? false : d.startTop + dy < mid);
  };
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          drag.current = { startY: 0, startTop: topValue.current, moved: false };
        },
        onPanResponderMove: (_, g) => onDragMove(g.dy),
        onPanResponderRelease: (_, g) => onDragEnd(g.dy),
        onPanResponderTerminate: (_, g) => onDragEnd(g.dy),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullTop, halfTop, expanded],
  );
  const onMouseDown = (e: { pageY: number }) => {
    if (typeof window === 'undefined') return;
    drag.current = { startY: e.pageY, startTop: topValue.current, moved: false };
    const move = (ev: MouseEvent) => onDragMove(ev.pageY - (drag.current?.startY ?? ev.pageY));
    const up = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      onDragEnd(ev.pageY - (drag.current?.startY ?? ev.pageY));
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  const handleProps = Platform.OS === 'web' ? ({ onMouseDown } as object) : pan.panHandlers;

  // Centre the pins in the strip of map above the half-open sheet.
  const mapCenter = useMemo(() => offsetCenter(center, zoom, screenH / 2 - halfTop / 2), [center, zoom, screenH, halfTop]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DealerMap markers={markers} center={mapCenter} zoom={zoom} userLocation={center} onSelect={onSelectPin} style={StyleSheet.absoluteFill} />

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top,
          backgroundColor: colors.sheet,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: dark ? 0.6 : 0.2,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: -8 },
          elevation: 12,
          overflow: 'hidden',
        }}
      >
        {/* Grab handle */}
        <View
          {...handleProps}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show map' : 'Expand list'}
          style={{ height: HANDLE_AREA_H, alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? ({ cursor: 'grab', userSelect: 'none' } as object) : null) }}
        >
          <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.disabled }} />
        </View>

        {/* Title row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 }} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 1 }}>{subtitle}</Text> : null}
          </View>
          {headerRight}
          {onClose ? (
            <Tappable
              onPress={onClose}
              hitSlop={8}
              accessibilityLabel="Close"
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="close" size={20} color={colors.textPrimary} strokeWidth={2} />
            </Tappable>
          ) : null}
        </View>

        {/* Filter chips */}
        {chips ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.md }}>
            {chips}
          </ScrollView>
        ) : null}

        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.screenBottom }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/** A filter chip for the sheet's chip row: "Sort by ▾", "Open now", … */
export function FilterChip({
  label,
  active,
  caret,
  icon,
  onPress,
}: {
  label?: string;
  active?: boolean;
  /** Show a ▾ (the chip opens choices). */
  caret?: boolean;
  icon?: IconName;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={label ?? 'Filters'}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 38,
        paddingHorizontal: label ? 14 : 10,
        borderRadius: radii.pill,
        backgroundColor: active ? colors.primarySurface : colors.inputBg,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
      }}
    >
      {icon ? <Icon name={icon} size={18} color={active ? colors.primaryDark : colors.textPrimary} strokeWidth={1.8} /> : null}
      {label ? <Text style={{ fontSize: 14, fontWeight: '600', color: active ? colors.primaryDark : colors.textPrimary }}>{label}</Text> : null}
      {caret ? <Text style={{ fontSize: 11, color: active ? colors.primaryDark : colors.textSecondary }}>▼</Text> : null}
    </Tappable>
  );
}
