import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { DealerMap, MapMarker } from '../../components/DealerMap';
import { RatingLink } from '../../components/RatingLink';
import { Select } from '../../components/Select';
import { SkeletonList } from '../../components/Skeleton';
import { AvatarCircle, SectionLabel, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, DISTANCE_CAP, DISTANCE_FILTERS, Quote, QUOTE_REQUEST, quotesInEstimateRange, USER_LOCATION } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { quoteService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AllQuotesMap'>;

const BEST_GREEN = '#085041';

const TIER_TAG: Record<Quote['tier'], string | null> = {
  best: 'BEST PRICE',
  recommended: 'RECOMMENDED',
  other: null,
};

const TIER_PIN_COLOR: Record<Quote['tier'], string> = {
  best: BEST_GREEN,
  recommended: palette.primary,
  other: '#fff',
};

// ── Filters (feedback pass 2: distance + price dropdowns hide pins & cards) ──

const PRICE_OPTIONS = ['Any price', 'Under $300', '$300–$400', '$400+'] as const;
const priceMatches = (option: string, price: number) => {
  if (option === 'Under $300') return price < 300;
  if (option === '$300–$400') return price >= 300 && price <= 400;
  if (option === '$400+') return price > 400;
  return true;
};

/**
 * Wireframe s-all-quotes-map, feedback pass 2: REAL tile map (Leaflet/OSM on
 * web, react-native-maps in Expo Go) with priced pins, distance/price
 * filters, and two-way pin ↔ card selection sync.
 */
export function AllQuotesMapScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: rawQuotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: quoteService.getQuotes,
  });
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  // Shop quotes reflect the AI estimate range (no-op until an estimate exists).
  const quotes = quotesInEstimateRange(rawQuotes ?? [], aiEstimate);

  const [distFilter, setDistFilter] = useState<string>(DISTANCE_FILTERS[0]);
  const [priceFilter, setPriceFilter] = useState<string>(PRICE_OPTIONS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  // Each card's y-offset within the scroll content (captured via onLayout).
  const cardY = useRef<Record<string, number>>({});

  // Filters hide pins + cards together.
  const filtered = quotes.filter((q) => {
    const dealer = dealerById(q.dealerId);
    return dealer.distanceMi <= (DISTANCE_CAP[distFilter] ?? Infinity) && priceMatches(priceFilter, q.price);
  });
  const selected = filtered.find((q) => q.dealerId === selectedId) ?? null;

  const markers: MapMarker[] = filtered.map((q) => {
    const dealer = dealerById(q.dealerId);
    return {
      id: q.dealerId,
      lat: dealer.lat,
      lng: dealer.lng,
      label: `$${q.price}`,
      color: TIER_PIN_COLOR[q.tier],
      tag: TIER_TAG[q.tier] ?? undefined,
      tagColor: q.tier === 'best' ? BEST_GREEN : palette.primaryDark,
      selected: q.dealerId === selectedId,
    };
  });

  /** Pin tap: select + scroll the matching dealer card into view. */
  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = cardY.current[dealerId];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
    }
  };

  const goAccept = (dealerId: string) => navigation.navigate('AcceptBooking', { dealerId });

  // Selecting pans the map to that pin; otherwise stay on the user.
  const focusDealer = selected ? dealerById(selected.dealerId) : null;
  const center = focusDealer
    ? { lat: focusDealer.lat, lng: focusDealer.lng }
    : USER_LOCATION;

  return (
    <Screen scrollRef={scrollRef}>
      {/* Real tile map (Leaflet + OSM on web / Apple-Google Maps native) */}
      <View
        style={{
          borderRadius: radii.lg,
          height: 300,
          marginBottom: spacing.sm,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: '#C8D5CC',
        }}
      >
        <DealerMap
          style={{ flex: 1 }}
          markers={markers}
          center={center}
          zoom={11}
          userLocation={USER_LOCATION}
          onSelect={onPinSelect}
        />
        {/* Location chip */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,.92)',
            borderRadius: radii.sm,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 11, color: '#555', fontWeight: '600' }}>
            📍 {QUOTE_REQUEST.city}
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        {(
          [
            [BEST_GREEN, 'Best price', false],
            [palette.primary, 'AI recommended', false],
            ['#fff', 'Other quotes', true],
          ] as const
        ).map(([color, label, bordered]) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: color,
                borderWidth: bordered ? 1 : 0,
                borderColor: '#ccc',
              }}
            />
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Filters: hide pins + cards together */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Select
          label="Distance"
          value={distFilter}
          options={[...DISTANCE_FILTERS]}
          onChange={setDistFilter}
          style={{ flex: 1 }}
        />
        <Select
          label="Price range"
          value={priceFilter}
          options={[...PRICE_OPTIONS]}
          onChange={setPriceFilter}
          style={{ flex: 1 }}
        />
      </View>

      <SectionLabel>
        Top picks ({filtered.length}
        {quotes && filtered.length !== quotes.length ? ` of ${quotes.length}` : ''})
      </SectionLabel>
      {isLoading ? <SkeletonList variant="row" count={3} /> : null}
      {!isLoading && filtered.length === 0 ? (
        <Text
          style={{
            fontSize: 13,
            color: colors.textTertiary,
            textAlign: 'center',
            paddingVertical: spacing.lg,
          }}
        >
          No quotes match these filters — widen the distance or price range.
        </Text>
      ) : null}
      {filtered.map((q) => {
        const dealer = dealerById(q.dealerId);
        const tag = TIER_TAG[q.tier];
        const isSelected = q.dealerId === selectedId;
        const tinted = q.tier !== 'other';
        return (
          <View
            key={q.id}
            onLayout={(e) => {
              cardY.current[q.dealerId] = e.nativeEvent.layout.y;
            }}
          >
          <Tappable
            // First tap selects (syncs the pin); tapping the selected card books.
            onPress={() => (isSelected ? goAccept(q.dealerId) : onPinSelect(q.dealerId))}
            style={({ pressed }) => ({
              backgroundColor: isSelected
                ? colors.primarySurface
                : q.tier === 'best'
                  ? '#E8F5EF'
                  : q.tier === 'recommended'
                    ? colors.primarySurface
                    : colors.surface,
              borderWidth: isSelected ? 2 : q.tier === 'recommended' ? 1.5 : tinted ? 1 : StyleSheet.hairlineWidth,
              borderColor: isSelected
                ? colors.primary
                : q.tier === 'best'
                  ? colors.success
                  : q.tier === 'recommended'
                    ? colors.primary
                    : colors.border,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AvatarCircle initial={dealer.initial} color={dealer.color} size={36} />
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                    {dealer.name}
                  </Text>
                  {tag ? (
                    <View
                      style={{
                        backgroundColor: q.tier === 'best' ? BEST_GREEN : palette.primary,
                        borderRadius: radii.pill,
                        paddingHorizontal: 8,
                        paddingVertical: 1,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{tag}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                    {dealer.distanceMi} mi ·{' '}
                  </Text>
                  <RatingLink dealer={dealer} label={`★ ${dealer.rating}`} />
                  {q.tier === 'recommended' ? (
                    <Text style={{ fontSize: 12, color: colors.textTertiary }}> · OEM parts</Text>
                  ) : null}
                </View>
              </View>
              <Text
                style={{
                  fontSize: 19,
                  fontWeight: '800',
                  color:
                    q.tier === 'best'
                      ? BEST_GREEN
                      : q.tier === 'recommended'
                        ? colors.primaryDeep
                        : colors.textPrimary,
                }}
              >
                ${q.price}
              </Text>
            </View>

            {/* Selected card reveals the booking CTA (pin stays highlighted) */}
            {isSelected ? (
              <Tappable
                onPress={() => goAccept(q.dealerId)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: radii.sm,
                  paddingVertical: 10,
                  alignItems: 'center',
                  marginTop: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onPrimary }}>
                  Accept & book {dealer.name} →
                </Text>
              </Tappable>
            ) : null}
          </Tappable>
          </View>
        );
      })}
    </Screen>
  );
}
