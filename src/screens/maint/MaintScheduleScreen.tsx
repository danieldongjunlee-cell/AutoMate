import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MapMarker } from '../../components/DealerMap';
import { FilterSheet } from '../../components/FilterSheet';
import { FilterChip, MapSheet } from '../../components/MapSheet';
import { ShopListRow } from '../../components/ShopListRow';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useRequireAuth, useResumeAfterAuth } from '../../hooks/useRequireAuth';
import { MaintStackParamList } from '../../navigation/types';
import {
  chipPrice,
  DEALER_SERVICE_CHIPS,
  DEALERS,
  dealerOffersCategory,
  dealerServicesBrand,
  MAINT_CATEGORIES,
  SCHEDULE_SERVICE_FILTERS,
  SERVICE_FILTER_KEY,
  shopServicePrice,
  USER_LOCATION,
} from '../../services/mock/data';
import { CartService, useAppStore } from '../../store/useAppStore';
import { palette, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintSchedule'>;

const SORTS = ['Nearest first', 'Top rated', 'Lowest price'] as const;
type Sort = (typeof SORTS)[number];

/**
 * Partner shops (canvas "Book a service") in a maps-app layout: the map fills
 * the screen and a draggable sheet lists the shops with filter chips (Sort by
 * · Open now · Service · Distance). Each row shows the rating (yellow star),
 * open / closed state, photos, the price of the chosen services at that shop,
 * and Directions · Call · Website chips. Tapping a row or Book goes to date &
 * time.
 */
export function MaintScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const startBooking = useAppStore((s) => s.startBooking);
  const setCartServices = useAppStore((s) => s.setCartServices);
  const pick = useAppStore((s) => s.serviceTypePick);
  const subPick = useAppStore((s) => s.serviceSubPick);
  const requireAuth = useRequireAuth();
  const [pendingDealer, setPendingDealer] = useState<string | null>(null);
  const { brand } = useActiveVehicle();
  const pickedCategories = useMemo(() => MAINT_CATEGORIES.filter((c) => pick.includes(c.id)), [pick]);

  /** The chosen services priced the way this shop prices them. */
  const servicesAt = (dealerId: string): CartService[] =>
    pickedCategories.flatMap((cat) =>
      cat.services
        .filter((s) => (subPick[cat.id] ?? []).includes(s.id))
        .map((sub) => ({ id: sub.id, name: `${cat.name} — ${sub.name}`, price: shopServicePrice(dealerId, cat, sub), durationMin: sub.durationMin })),
    );

  const goBook = (id: string) => {
    startBooking(id);
    if (pickedCategories.length) setCartServices(servicesAt(id));
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

  const [sort, setSort] = useState<Sort>(SORTS[0]);
  const [openNow, setOpenNow] = useState(false);
  const [service, setService] = useState(SCHEDULE_SERVICE_FILTERS[0]);
  const [radius, setRadius] = useState(30);
  const [filterOpen, setFilterOpen] = useState(false);
  // Pin ↔ row selection sync.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef<Record<string, number>>({});

  /** Cheapest chip price, for the price sort and the "from $" label. */
  const fromPrice = (dealerId: string) => Math.min(...(DEALER_SERVICE_CHIPS[dealerId] ?? []).map(chipPrice));
  const totalAt = (dealerId: string) => servicesAt(dealerId).reduce((sum, s) => sum + s.price, 0);

  // Only shops that service the user's brand, within the radius, offering every
  // chosen category (and the service filter), optionally open now; then sorted.
  const dealers = useMemo(
    () =>
      DEALERS.filter((d) => {
        const chips = DEALER_SERVICE_CHIPS[d.id];
        if (!chips || d.distanceMi > radius) return false;
        if (!dealerServicesBrand(d.id, brand)) return false;
        if (openNow && d.openStatus === 'Closed') return false;
        if (pickedCategories.some((cat) => !dealerOffersCategory(d.id, cat.id))) return false;
        if (service === 'All') return true;
        const key = SERVICE_FILTER_KEY[service] ?? service;
        return chips.some((c) => c.startsWith(key));
      }).sort((a, b) =>
        sort === 'Top rated'
          ? b.rating - a.rating || a.distanceMi - b.distanceMi
          : sort === 'Lowest price'
            ? (pickedCategories.length ? totalAt(a.id) - totalAt(b.id) : fromPrice(a.id) - fromPrice(b.id)) || a.distanceMi - b.distanceMi
            : a.distanceMi - b.distanceMi,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, radius, service, pickedCategories, openNow, sort, subPick],
  );

  const markers: MapMarker[] = dealers.map((d) => ({
    id: d.id,
    lat: d.lat,
    lng: d.lng,
    label: pickedCategories.length ? `$${totalAt(d.id)}` : d.name,
    color: d.id === selectedId ? palette.primaryDark : palette.primary,
    selected: d.id === selectedId,
  }));
  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = rowY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  };

  const pickedLabel = pickedCategories.map((c) => c.name).join(' + ');
  const cycleSort = () => setSort((s) => SORTS[(SORTS.indexOf(s) + 1) % SORTS.length]);

  return (
    <>
      <MapSheet
        markers={markers}
        center={USER_LOCATION}
        onSelectPin={onPinSelect}
        title={pickedCategories.length ? pickedLabel : 'Partner shops'}
        subtitle={`${dealers.length} shop${dealers.length !== 1 ? 's' : ''} for your ${brand} · ${sort.toLowerCase()}`}
        onClose={() => navigation.goBack()}
        scrollRef={scrollRef}
        chips={
          <>
            <FilterChip icon="funnel" onPress={() => setFilterOpen(true)} active={radius < 30} />
            <FilterChip label={sort === SORTS[0] ? 'Sort by' : sort} caret onPress={cycleSort} active={sort !== SORTS[0]} />
            <FilterChip label="Open now" active={openNow} onPress={() => setOpenNow((v) => !v)} />
            {pickedCategories.length === 0 ? (
              <FilterChip label={service === 'All' ? 'Service' : service} caret active={service !== 'All'} onPress={() => setFilterOpen(true)} />
            ) : null}
            <FilterChip label={radius < 30 ? `Within ${radius} mi` : 'Distance'} caret active={radius < 30} onPress={() => setFilterOpen(true)} />
          </>
        }
      >
        {dealers.length === 0 ? (
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', padding: spacing.xl }}>
            No partner shops match — widen the distance or turn off “Open now”.
          </Text>
        ) : null}

        {dealers.map((dealer, i) => {
          const chips = DEALER_SERVICE_CHIPS[dealer.id] ?? [];
          const tags = chips.map((c) => c.split(' ')[0]).slice(0, 3).join(' · ');
          const from = fromPrice(dealer.id);
          const total = pickedCategories.length ? totalAt(dealer.id) : null;
          return (
            <View key={dealer.id} onLayout={(e) => (rowY.current[dealer.id] = e.nativeEvent.layout.y)}>
              <ShopListRow
                dealer={dealer}
                index={i}
                tags={tags}
                selected={dealer.id === selectedId}
                onPress={() => selectShop(dealer.id)}
                callout={
                  total == null
                    ? { title: Number.isFinite(from) ? `Services from $${from}` : 'Quote on request', body: `${chips.join(' · ')}`, button: 'Book', onPress: () => selectShop(dealer.id) }
                    : undefined
                }
                actions={[{ label: 'Book', icon: 'calcheck', primary: true, onPress: () => selectShop(dealer.id) }]}
              >
                {total != null ? (
                  // Your services at this shop: each line priced, total on the right.
                  <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginBottom: 6 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>Your services here</Text>
                        <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{dealer.name}&apos;s prices · pay at the shop</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, lineHeight: 26 }}>${total}</Text>
                        <Text style={{ fontSize: 11, color: colors.textTertiary }}>total</Text>
                      </View>
                    </View>
                    {servicesAt(dealer.id).map((svc) => (
                      <View key={svc.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
                        <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary }} numberOfLines={1}>{svc.name}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>${svc.price}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </ShopListRow>
            </View>
          );
        })}
      </MapSheet>

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        distance={{ value: radius }}
        groups={pickedCategories.length ? [] : [{ key: 'service', title: 'Service', options: SCHEDULE_SERVICE_FILTERS, value: service }]}
        onApply={(v, d) => {
          setService(v.service ?? 'All');
          if (d != null) setRadius(d);
        }}
      />
    </>
  );
}
