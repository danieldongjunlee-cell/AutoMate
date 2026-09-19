import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { DealerMap, MapMarker } from '../../components/DealerMap';
import { FilterButton, FilterSheet } from '../../components/FilterSheet';
import { Icon } from '../../components/Icon';
import { ShopCard } from '../../components/ShopCard';
import { Tappable } from '../../components/Tappable';
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
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintSchedule'>;

/** Width of the shop list panel: fixed on wide screens, leaves a strip of map on phones. */
const PANEL_MAX_W = 400;
const PANEL_PHONE_GAP = 56;
/** The collapse tab that stays visible when the panel is tucked away. */
const HANDLE_W = 26;
const HANDLE_H = 56;

/**
 * Partner shops (canvas "Book a service", now laid out like a maps app): the
 * map fills the screen; the shop list sits in a panel on the left that
 * collapses with the ‹ tab so the map can be explored. Tapping a pin selects
 * the card (and vice versa); tapping a card goes on to date & time.
 */
export function MaintScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const startBooking = useAppStore((s) => s.startBooking);
  const setCartServices = useAppStore((s) => s.setCartServices);
  const pick = useAppStore((s) => s.serviceTypePick);
  const subPick = useAppStore((s) => s.serviceSubPick);
  const requireAuth = useRequireAuth();
  const [pendingDealer, setPendingDealer] = useState<string | null>(null);
  const { brand } = useActiveVehicle();
  const pickedCategories = useMemo(() => MAINT_CATEGORIES.filter((c) => pick.includes(c.id)), [pick]);

  const goBook = (id: string) => {
    startBooking(id);
    if (pickedCategories.length) {
      // Seed the cart with every chosen option, priced the way this shop prices it.
      const services: CartService[] = pickedCategories.flatMap((cat) =>
        cat.services
          .filter((s) => (subPick[cat.id] ?? []).includes(s.id))
          .map((sub) => ({ id: sub.id, name: `${cat.name} — ${sub.name}`, price: shopServicePrice(id, cat, sub), durationMin: sub.durationMin })),
      );
      setCartServices(services);
    }
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
        // Shops must offer every category chosen on the previous step.
        if (pickedCategories.some((cat) => !dealerOffersCategory(d.id, cat.id))) return false;
        if (service === 'All') return true;
        const key = SERVICE_FILTER_KEY[service] ?? service;
        return chips.some((c) => c.startsWith(key));
      }).sort((a, b) => a.distanceMi - b.distanceMi),
    [brand, radius, service, pickedCategories],
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

  // ── Collapsible list panel ────────────────────────────────────────────────
  const panelW = Math.min(PANEL_MAX_W, screenW - PANEL_PHONE_GAP);
  const [collapsed, setCollapsed] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, { toValue: collapsed ? -panelW : 0, duration: 260, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [collapsed, panelW, slide]);

  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    setCollapsed(false);
    const y = cardY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };

  const subtitle = pickedCategories.length
    ? `Shops offering ${pickedCategories.map((c) => c.name).join(' + ')} for your ${brand} · nearest first`
    : `Partner shops that service your ${brand} · nearest first`;

  /** A shop's "from" price: the cheapest chosen service here, else its cheapest chip. */
  const fromPrice = (dealerId: string) => {
    if (pickedCategories.length) {
      const prices = pickedCategories.flatMap((cat) => cat.services.filter((s) => (subPick[cat.id] ?? []).includes(s.id)).map((s) => shopServicePrice(dealerId, cat, s)));
      if (prices.length) return `$${prices.reduce((a, b) => a + b, 0)} total`;
    }
    const from = Math.min(...(DEALER_SERVICE_CHIPS[dealerId] ?? []).map(chipPrice));
    return Number.isFinite(from) ? `from $${from}` : 'Quote';
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* The map is the background. */}
      <DealerMap markers={markers} center={USER_LOCATION} userLocation={USER_LOCATION} onSelect={onPinSelect} style={StyleSheet.absoluteFill} />

      {/* Shop count chip over the map, shown while the list is tucked away. */}
      {collapsed ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: spacing.md, right: spacing.md }}>
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>
              {dealers.length} shop{dealers.length !== 1 ? 's' : ''} on the map
            </Text>
          </View>
        </View>
      ) : null}

      {/* Left panel: subtitle, filter, and the scrollable shop list. */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: panelW,
          transform: [{ translateX: slide }],
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: dark ? 0.6 : 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 6, height: 0 },
            elevation: 10,
          }}
        >
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: spacing.screenH, paddingBottom: spacing.screenBottom }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md }}>{subtitle}</Text>

            <FilterButton label={filterBits.length ? `Filter · ${filterBits[0]}` : 'Filter'} count={filterBits.length} onPress={() => setFilterOpen(true)} />

            {dealers.length === 0 ? (
              <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>
                No partner shops within this radius — widen the distance.
              </Text>
            ) : null}

            {dealers.map((dealer, i) => {
              const chips = DEALER_SERVICE_CHIPS[dealer.id] ?? [];
              const services = chips.map((c) => c.split(' ')[0]).slice(0, 3).join(' · ');
              return (
                <View key={dealer.id} onLayout={(e) => (cardY.current[dealer.id] = e.nativeEvent.layout.y)}>
                  <ShopCard
                    dealer={dealer}
                    index={i}
                    price={fromPrice(dealer.id)}
                    meta={`${dealer.distanceMi} mi · ★ ${dealer.rating.toFixed(1)} (${dealer.reviews}) · ${services}`}
                    selected={dealer.id === selectedId}
                    onPress={() => selectShop(dealer.id)}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Collapse / expand tab on the panel's right edge (maps-app style). */}
        <Tappable
          onPress={() => setCollapsed((c) => !c)}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Show shop list' : 'Hide shop list'}
          style={{
            position: 'absolute',
            right: -HANDLE_W,
            top: '50%',
            marginTop: -HANDLE_H / 2,
            width: HANDLE_W,
            height: HANDLE_H,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderLeftWidth: 0,
            borderColor: colors.border,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 2, height: 2 },
            elevation: 6,
          }}
        >
          <Icon name={collapsed ? 'chevron' : 'back'} size={18} color={colors.textPrimary} strokeWidth={2} />
        </Tappable>
      </Animated.View>

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
    </View>
  );
}
