import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { DealerMap, MapMarker } from '../../components/DealerMap';
import { FilterButton, FilterSheet } from '../../components/FilterSheet';
import { ShopCard } from '../../components/ShopCard';
import { Screen } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useRequireAuth, useResumeAfterAuth } from '../../hooks/useRequireAuth';
import { MaintStackParamList } from '../../navigation/types';
import {
  DEALER_SERVICE_CHIPS,
  DEALERS,
  dealerServicesBrand,
  SCHEDULE_SERVICE_FILTERS,
  SERVICE_FILTER_KEY,
  USER_LOCATION,
} from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintSchedule'>;

/** "Oil $49" → 49 */
const chipPrice = (chip: string) => Number(chip.replace(/[^0-9.]/g, '')) || 0;

/** Partner shops (canvas "Book a service"): one Filter pill, shop photo cards sorted by distance. */
export function MaintScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const startBooking = useAppStore((s) => s.startBooking);
  const requireAuth = useRequireAuth();
  const [pendingDealer, setPendingDealer] = useState<string | null>(null);
  const { brand } = useActiveVehicle();

  const goBook = (id: string) => {
    startBooking(id);
    navigation.navigate('MaintScheduleBook');
  };
  /** Picking a shop is a value action — guests sign in first, then resume. */
  const selectShop = (id: string) => {
    if (!requireAuth('selectShop')) {
      setPendingDealer(id);
      return;
    }
    goBook(id);
  };
  useResumeAfterAuth('selectShop', () => {
    if (pendingDealer) {
      const id = pendingDealer;
      setPendingDealer(null);
      goBook(id);
    }
  });

  const [service, setService] = useState(SCHEDULE_SERVICE_FILTERS[0]);
  const [radius, setRadius] = useState(30);
  const [filterOpen, setFilterOpen] = useState(false);
  // Pin ↔ shop-card selection sync.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const cardY = useRef<Record<string, number>>({});

  // Only shops that service the user's brand, within the radius, filtered by
  // service type, nearest first.
  const dealers = useMemo(
    () =>
      DEALERS.filter((d) => {
        const chips = DEALER_SERVICE_CHIPS[d.id];
        if (!chips || d.distanceMi > radius) return false;
        if (!dealerServicesBrand(d.id, brand)) return false;
        if (service === 'All') return true;
        const key = SERVICE_FILTER_KEY[service] ?? service;
        return chips.some((c) => c.startsWith(key));
      }).sort((a, b) => a.distanceMi - b.distanceMi),
    [brand, radius, service],
  );

  const filterBits = [service !== 'All' ? service : null, radius < 30 ? `Within ${radius} mi` : null].filter(Boolean) as string[];

  const markers: MapMarker[] = dealers.map((d) => ({
    id: d.id,
    lat: d.lat,
    lng: d.lng,
    label: d.name,
    color: d.id === selectedId ? palette.primaryDark : palette.primary,
    selected: d.id === selectedId,
  }));
  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = cardY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
  };

  return (
    <Screen scrollRef={scrollRef}>
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md }}>
        Partner shops that service your {brand} · sorted by distance
      </Text>

      <FilterButton label={filterBits.length ? `Filter · ${filterBits[0]}` : 'Filter'} count={filterBits.length} onPress={() => setFilterOpen(true)} />
      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        distance={{ value: radius }}
        groups={[{ key: 'service', title: 'Service', options: SCHEDULE_SERVICE_FILTERS, value: service }]}
        onApply={(v, d) => {
          setService(v.service ?? 'All');
          if (d != null) setRadius(d);
        }}
      />

      {dealers.length > 0 ? (
        <DealerMap
          markers={markers}
          center={USER_LOCATION}
          userLocation={USER_LOCATION}
          onSelect={onPinSelect}
          style={{ height: 170, borderRadius: radii.lg, overflow: 'hidden', marginBottom: spacing.md }}
        />
      ) : (
        <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>
          No partner shops within this radius — widen the distance.
        </Text>
      )}

      {dealers.map((dealer, i) => {
        const chips = DEALER_SERVICE_CHIPS[dealer.id] ?? [];
        const from = Math.min(...chips.map(chipPrice));
        const services = chips.map((c) => c.split(' ')[0]).slice(0, 3).join(' · ');
        return (
          <View key={dealer.id} onLayout={(e) => (cardY.current[dealer.id] = e.nativeEvent.layout.y)}>
            <ShopCard
              dealer={dealer}
              index={i}
              price={Number.isFinite(from) ? `from $${from}` : 'Quote'}
              meta={`${dealer.distanceMi} mi · ★ ${dealer.rating.toFixed(1)} (${dealer.reviews}) · ${services}`}
              selected={dealer.id === selectedId}
              onPress={() => selectShop(dealer.id)}
            />
          </View>
        );
      })}
    </Screen>
  );
}
