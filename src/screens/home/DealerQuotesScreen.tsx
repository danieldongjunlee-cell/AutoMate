import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { DealerMap, MapMarker } from '../../components/DealerMap';
import { FilterButton, FilterSheet } from '../../components/FilterSheet';
import { Icon } from '../../components/Icon';
import { QuoteShopCard } from '../../components/QuoteShopCard';
import { SkeletonList } from '../../components/Skeleton';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, Quote, QUOTE_REQUEST, quotesInEstimateRange, USER_LOCATION } from '../../services/mock/data';
import { quoteService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DealerQuotes'>;

const BEST_GREEN = '#085041';

/** Quote-list filters shared by the Quotes tab and the post-submit list. */
export const QUOTE_SORTS = ['Price: low to high', 'Price: high to low', 'Rating: high to low', 'Nearest first'];
export const QUOTE_PARTS = ['All parts', 'OEM', 'Aftermarket'];

export function applyQuoteFilters(quotes: Quote[], sort: string, parts: string, radiusMi: number): Quote[] {
  let list = quotes.filter((q) => dealerById(q.dealerId).distanceMi <= radiusMi);
  if (parts !== QUOTE_PARTS[0]) list = list.filter((q) => q.parts === parts);
  list = [...list].sort((a, b) => {
    if (sort === 'Price: high to low') return b.price - a.price;
    if (sort === 'Rating: high to low') return dealerById(b.dealerId).rating - dealerById(a.dealerId).rating;
    if (sort === 'Nearest first') return dealerById(a.dealerId).distanceMi - dealerById(b.dealerId).distanceMi;
    return a.price - b.price;
  });
  return list;
}

export function quoteFilterSummary(sort: string, parts: string, radiusMi: number) {
  const bits: string[] = [];
  if (radiusMi < 30) bits.push(`Within ${radiusMi} mi`);
  if (parts !== QUOTE_PARTS[0]) bits.push(parts);
  if (sort !== QUOTE_SORTS[0]) bits.push(sort);
  return { label: bits.length ? `Filter · ${bits[0]}` : 'Filter', count: bits.length };
}

/** Post-submit "Quotes received": AI range, map, one Filter pill, shop photo cards. */
export function DealerQuotesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const damageParts = useAppStore((s) => s.damageParts);
  const { data: rawQuotes, isLoading } = useQuery({ queryKey: ['quotes'], queryFn: quoteService.getQuotes });
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;
  // Shop quotes always reflect the AI estimate range shown above.
  const quotes = useMemo(() => quotesInEstimateRange(rawQuotes ?? [], { priceLow, priceHigh }), [rawQuotes, priceLow, priceHigh]);

  const [sort, setSort] = useState(QUOTE_SORTS[0]);
  const [parts, setParts] = useState(QUOTE_PARTS[0]);
  const [radius, setRadius] = useState(30);
  const [filterOpen, setFilterOpen] = useState(false);
  const filtered = useMemo(() => applyQuoteFilters(quotes, sort, parts, radius), [quotes, sort, parts, radius]);
  const summary = quoteFilterSummary(sort, parts, radius);

  // Pin ↔ card selection sync.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const cardY = useRef<Record<string, number>>({});
  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = cardY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
  };

  const markers: MapMarker[] = filtered.map((q) => {
    const dealer = dealerById(q.dealerId);
    return {
      id: q.dealerId,
      lat: dealer.lat,
      lng: dealer.lng,
      label: `$${q.price}`,
      color: q.tier === 'best' ? BEST_GREEN : q.tier === 'recommended' ? palette.primary : colors.surfaceAlt,
      tag: q.tier === 'best' ? 'BEST PRICE' : q.tier === 'recommended' ? 'RECOMMENDED' : undefined,
      tagColor: q.tier === 'best' ? BEST_GREEN : palette.primaryDark,
      selected: q.dealerId === selectedId,
    };
  });

  return (
    <Screen scrollRef={scrollRef}>
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md }}>
        {filtered.length} shops responded · {sort === QUOTE_SORTS[0] ? 'sorted by price' : sort.toLowerCase()}
      </Text>

      {/* AI estimate range + the parts it covers */}
      <View style={{ backgroundColor: colors.successSurface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.successLight, padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.successDeep, marginBottom: 2 }}>AI estimated repair cost</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: palette.mint }}>
          ${priceLow} – ${priceHigh}
        </Text>
        {damageParts.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
            {damageParts.map((p) => (
              <View key={p.part} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{p.part}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>{p.type}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {filtered.length > 0 ? (
        <DealerMap
          markers={markers}
          center={USER_LOCATION}
          userLocation={USER_LOCATION}
          onSelect={onPinSelect}
          style={{ height: 170, borderRadius: radii.lg, overflow: 'hidden', marginBottom: spacing.md }}
        />
      ) : null}

      {/* Disclaimer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningSurface, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.md }}>
        <Icon name="alert" size={18} color={colors.warning} />
        <Text style={{ flex: 1, fontSize: 13, color: colors.warningDeep, lineHeight: 18 }}>
          Photo-based estimates. <Text style={{ fontWeight: '700' }}>Final price may vary slightly</Text> after in-person inspection.
        </Text>
      </View>

      <FilterButton label={summary.label} count={summary.count} onPress={() => setFilterOpen(true)} />
      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        distance={{ value: radius }}
        groups={[
          { key: 'sort', title: 'Sort by', options: QUOTE_SORTS, value: sort },
          { key: 'parts', title: 'Parts', options: QUOTE_PARTS, value: parts },
        ]}
        onApply={(v, d) => {
          setSort(v.sort ?? QUOTE_SORTS[0]);
          setParts(v.parts ?? QUOTE_PARTS[0]);
          if (d != null) setRadius(d);
        }}
      />

      {isLoading ? (
        <SkeletonList variant="card" count={4} />
      ) : filtered.length === 0 ? (
        <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>No quotes match these filters.</Text>
      ) : (
        filtered.map((quote, i) => (
          <View key={quote.id} onLayout={(e) => (cardY.current[quote.dealerId] = e.nativeEvent.layout.y)}>
            <QuoteShopCard
              quote={quote}
              index={i}
              selected={quote.dealerId === selectedId}
              onSelect={() => onPinSelect(quote.dealerId)}
              onAccept={() => navigation.navigate('AcceptBooking', { dealerId: quote.dealerId })}
            />
          </View>
        ))
      )}
    </Screen>
  );
}
