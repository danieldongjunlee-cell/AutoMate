import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DealerCard } from '../../components/DealerCard';
import { DealerMap, MapMarker } from '../../components/DealerMap';
import { FilterChips } from '../../components/FilterChips';
import { Tappable } from '../../components/Tappable';
import { Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import {
  DEALER_SERVICE_CHIPS,
  DEALERS,
  DISTANCE_CAP,
  SCHEDULE_SERVICE_FILTERS,
  SERVICE_FILTER_KEY,
  USER_LOCATION,
} from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintSchedule'>;

/** Distance options for the partner-dealership radius (caps at 30 mi). */
const RADIUS_OPTIONS = ['Within 5 mi', 'Within 10 mi', 'Within 30 mi'];

/** Wireframe s-maint-schedule: service-type filter + partner dealer cards. */
export function MaintScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const startBooking = useAppStore((s) => s.startBooking);
  const [filter, setFilter] = useState(SCHEDULE_SERVICE_FILTERS[0]);
  const [radius, setRadius] = useState('Within 30 mi');
  const [pickerOpen, setPickerOpen] = useState(false);
  // Pin ↔ shop-card selection sync (same pattern as the AI-estimate quotes map).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const cardY = useRef<Record<string, number>>({});

  const cap = DISTANCE_CAP[radius] ?? 30;

  // Every partner offers all 5 service types; narrow by service type and by the
  // chosen distance radius (up to 30 mi), nearest first.
  const dealers = DEALERS.filter((d) => {
    const chips = DEALER_SERVICE_CHIPS[d.id];
    if (!chips) return false;
    if (d.distanceMi > cap) return false;
    if (filter === 'All') return true;
    const key = SERVICE_FILTER_KEY[filter] ?? filter;
    return chips.some((c) => c.startsWith(key));
  }).sort((a, b) => a.distanceMi - b.distanceMi);

  const markers: MapMarker[] = dealers.map((d) => ({
    id: d.id,
    lat: d.lat,
    lng: d.lng,
    label: `${d.distanceMi} mi`,
    color: d.id === selectedId ? palette.primaryDark : palette.primary,
    selected: d.id === selectedId,
  }));

  /** Pin tap: select + scroll the matching shop card into view. */
  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = cardY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
  };

  return (
    <Screen scrollRef={scrollRef}>
      <FilterChips options={SCHEDULE_SERVICE_FILTERS} selected={filter} onSelect={setFilter} />
      <View
        style={{
          marginTop: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <SectionLabel style={{ marginBottom: 0 }}>Partner dealerships </SectionLabel>
        <Tappable
          onPress={() => setPickerOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primaryDark }}>📍 {radius}</Text>
          <Text style={{ fontSize: 11, color: colors.primaryDark }}>▾</Text>
        </Tappable>
      </View>

      {/* Shops near you — same map + pin selection as the AI-estimate quotes. */}
      {dealers.length > 0 ? (
        <View style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
          <SectionLabel>Shops near you · tap a pin to select</SectionLabel>
          <DealerMap
            markers={markers}
            center={USER_LOCATION}
            userLocation={USER_LOCATION}
            onSelect={onPinSelect}
            style={{ height: 200, borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.xs }}
          />
        </View>
      ) : (
        <View style={{ marginTop: spacing.md }} />
      )}

      {dealers.length === 0 ? (
        <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>
          No partner shops within this radius — widen the distance.
        </Text>
      ) : null}
      {dealers.map((dealer) => (
        <View
          key={dealer.id}
          onLayout={(e) => {
            cardY.current[dealer.id] = e.nativeEvent.layout.y;
          }}
          style={
            dealer.id === selectedId
              ? { borderWidth: 2, borderColor: colors.primary, borderRadius: radii.md }
              : undefined
          }
        >
          <DealerCard
            dealer={dealer}
            serviceChips={DEALER_SERVICE_CHIPS[dealer.id]}
            onPress={() => {
              startBooking(dealer.id);
              navigation.navigate('MaintScheduleBook');
            }}
          />
        </View>
      ))}

      {/* Distance radius picker */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Tappable
          noFeedback
          onPress={() => setPickerOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', padding: spacing.xl }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              overflow: 'hidden',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: colors.textTertiary,
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.xs,
              }}
            >
              Search radius
            </Text>
            {RADIUS_OPTIONS.map((opt, i) => {
              const on = opt === radius;
              return (
                <Tappable
                  key={opt}
                  onPress={() => {
                    setRadius(opt);
                    setPickerOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: 13,
                    backgroundColor: on ? colors.primarySurface : 'transparent',
                    borderBottomWidth: i < RADIUS_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: on ? '600' : '400',
                      color: on ? colors.primaryDeep : colors.textPrimary,
                    }}
                  >
                    📍 {opt}
                  </Text>
                  {on ? <Text style={{ fontSize: 16, color: colors.primary }}>✔</Text> : null}
                </Tappable>
              );
            })}
          </View>
        </Tappable>
      </Modal>
    </Screen>
  );
}
