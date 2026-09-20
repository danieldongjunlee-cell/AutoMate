import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AiEstimateCard } from './AiEstimateCard';
import { MapMarker } from './DealerMap';
import { FilterSheet } from './FilterSheet';
import { Icon } from './Icon';
import { FilterChip, MapSheet } from './MapSheet';
import { QuoteShopCard } from './QuoteShopCard';
import { SkeletonList } from './Skeleton';
import { Tappable } from './Tappable';
import { quoteService } from '../services';
import { dealerById, Quote, QUOTE_REQUEST, quotesInEstimateRange, USER_LOCATION } from '../services/mock/data';
import { useAppStore } from '../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../theme';

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

/** Short chip labels for the quote sorts. */
const SORT_CHIP: Record<string, string> = {
  'Price: low to high': 'Price ↑',
  'Price: high to low': 'Price ↓',
  'Rating: high to low': 'Top rated',
  'Nearest first': 'Nearest',
};

/**
 * The quotes list in the maps-app layout, shared by the Quotes tab and the
 * post-submit "View available quotes" screen: the map of quoting shops fills
 * the screen and a draggable sheet lists them — AI estimate strip, filter
 * chips (Sort by · Open now · Parts · Distance) and one result row per shop
 * with its quote.
 */
export function QuotesSheet({
  title = 'Quotes received',
  headerRight,
  onClose,
  onAccept,
  onRevise,
  onCancel,
}: {
  title?: string;
  headerRight?: React.ReactNode;
  onClose?: () => void;
  onAccept: (dealerId: string) => void;
  /** "Add or revise parts" → the damage picker. */
  onRevise: () => void;
  /** "Cancel" → clear the request. */
  onCancel: () => void;
}) {
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const { data: rawQuotes, isLoading } = useQuery({ queryKey: ['quotes'], queryFn: quoteService.getQuotes });
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;
  // Shop quotes always reflect the AI estimate range shown above.
  const quotes = useMemo(() => quotesInEstimateRange(rawQuotes ?? [], { priceLow, priceHigh }), [rawQuotes, priceLow, priceHigh]);

  const [sort, setSort] = useState(QUOTE_SORTS[0]);
  const [parts, setParts] = useState(QUOTE_PARTS[0]);
  const [openNow, setOpenNow] = useState(false);
  const [radius, setRadius] = useState(30);
  const [filterOpen, setFilterOpen] = useState(false);
  // Sort / Parts / Distance stay hidden until the funnel is tapped.
  const [chipsOpen, setChipsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef<Record<string, number>>({});

  const filtered = useMemo(
    () => applyQuoteFilters(quotes, sort, parts, radius).filter((q) => !openNow || dealerById(q.dealerId).openStatus !== 'Closed'),
    [quotes, sort, parts, radius, openNow],
  );
  const summary = quoteFilterSummary(sort, parts, radius);
  /** Photos the AI analysed — shown as "detected damage points". */
  const damagePoints = damageParts.reduce((n, p) => n + (p.photos || 1), 0);

  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = rowY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  };

  const markers: MapMarker[] = filtered.map((q) => {
    const d = dealerById(q.dealerId);
    return {
      id: q.dealerId,
      lat: d.lat,
      lng: d.lng,
      label: `$${q.price}`,
      color: q.tier === 'best' ? '#085041' : q.tier === 'recommended' ? palette.primary : palette.navy,
      selected: q.dealerId === selectedId,
    };
  });
  const cycle = (list: string[], cur: string) => list[(list.indexOf(cur) + 1) % list.length];

  return (
    <>
      <MapSheet
        markers={markers}
        center={USER_LOCATION}
        onSelectPin={onPinSelect}
        title={title}
        subtitle={`${filtered.length} shops responded · ${summary.label.toLowerCase()}`}
        headerRight={headerRight}
        onClose={onClose}
        scrollRef={scrollRef}
        chips={
          <>
            <FilterChip icon="funnel" onPress={() => setChipsOpen((v) => !v)} active={chipsOpen || summary.count > 0} />
            <FilterChip label="Open now" active={openNow} onPress={() => setOpenNow((v) => !v)} />
            {chipsOpen ? (
              <>
                <FilterChip label={sort === QUOTE_SORTS[0] ? 'Sort by' : SORT_CHIP[sort] ?? sort} caret active={sort !== QUOTE_SORTS[0]} onPress={() => setSort(cycle(QUOTE_SORTS, sort))} />
                <FilterChip label={parts === QUOTE_PARTS[0] ? 'Parts' : parts} caret active={parts !== QUOTE_PARTS[0]} onPress={() => setParts(cycle(QUOTE_PARTS, parts))} />
                <FilterChip label={radius < 30 ? `Within ${radius} mi` : 'Distance'} caret active={radius < 30} onPress={() => setFilterOpen(true)} />
              </>
            ) : null}
          </>
        }
      >
        {/* AI estimate strip + add / cancel */}
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <AiEstimateCard priceLow={priceLow} priceHigh={priceHigh} points={damagePoints} style={{ marginBottom: spacing.md }} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Tappable
              onPress={onRevise}
              style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: 10 }}
            >
              <Icon name="plus" size={16} color={colors.primaryDark} strokeWidth={2.2} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDark }}>Add or revise parts</Text>
            </Tappable>
            <Tappable onPress={onCancel} style={{ backgroundColor: colors.dangerSurface, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: radii.md, paddingVertical: 10, paddingHorizontal: spacing.md, justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.danger }}>Cancel</Text>
            </Tappable>
          </View>
        </View>

        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <SkeletonList variant="card" count={4} />
          </View>
        ) : filtered.length === 0 ? (
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', padding: spacing.xl }}>No quotes match these filters.</Text>
        ) : (
          filtered.map((q, i) => (
            <View key={q.id} onLayout={(e) => (rowY.current[q.dealerId] = e.nativeEvent.layout.y)}>
              <QuoteShopCard quote={q} index={i} selected={q.dealerId === selectedId} onSelect={() => onPinSelect(q.dealerId)} onAccept={() => onAccept(q.dealerId)} />
            </View>
          ))
        )}
      </MapSheet>

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
    </>
  );
}
