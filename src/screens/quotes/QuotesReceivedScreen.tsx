import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';

import { AvatarCircle, Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { CarSwitchChip } from '../../components/CarSwitchChip';
import { DealerMap, MapMarker } from '../../components/DealerMap';
import { Dropdown } from '../../components/Dropdown';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { navigateCrossTab } from '../../navigation/crossTab';
import { QuotesStackParamList } from '../../navigation/types';
import { quoteService } from '../../services';
import { dealerById, Quote, QUOTE_REQUEST, quoteBreakdown, USER_LOCATION } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<QuotesStackParamList, 'Quotes'>;

const DISTANCE_OPTS = ['Any distance', 'Within 5 mi', 'Within 10 mi', 'Within 15 mi'];
const SORT_OPTS = ['Price: low to high', 'Price: high to low', 'Rating: high to low', 'Nearest first'];
const distanceCap: Record<string, number> = { 'Within 5 mi': 5, 'Within 10 mi': 10, 'Within 15 mi': 15 };

/** One expandable dealer quote with its cost breakdown. */
function QuoteRow({
  quote,
  onAccept,
  selected,
}: {
  quote: Quote;
  onAccept: () => void;
  selected?: boolean;
}) {
  const { colors } = useTheme();
  const dealer = dealerById(quote.dealerId);
  const [open, setOpen] = useState(false);
  // Selecting the matching map pin expands this card.
  useEffect(() => {
    if (selected) setOpen(true);
  }, [selected]);
  const discount = quote.tier === 'best' ? 20 : 0;
  const b = quoteBreakdown(quote.price, discount);

  const line = (label: string, value: string, strong = false) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={{ fontSize: 13, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '400' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '500' }}>
        {value}
      </Text>
    </View>
  );

  return (
    <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AvatarCircle initial={dealer.initial} color={dealer.color} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{dealer.name}</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            ★ {dealer.rating} · {dealer.distanceMi} mi · {quote.parts} parts
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>${quote.price}</Text>
          {quote.tier !== 'other' ? (
            <Badge label={quote.tier === 'best' ? 'Best price' : 'Recommended'} variant={quote.tier === 'best' ? 'success' : 'primarySoft'} />
          ) : null}
        </View>
      </View>

      <Tappable onPress={() => setOpen((o) => !o)} hitSlop={6} style={{ paddingVertical: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
          {open ? 'Hide price breakdown ⌃' : 'See price breakdown ⌄'}
        </Text>
      </Tappable>

      {open ? (
        <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radii.sm, padding: spacing.md, marginBottom: spacing.sm }}>
          {line('Labor total', `$${b.labor}`)}
          {line('Parts total', `$${b.parts}`)}
          {line('Paints & materials', `$${b.paints}`)}
          {line('Shop supplies (5%)', `$${b.shopSupplies}`)}
          {line('Tax (6%)', `$${b.tax}`)}
          {b.discount > 0 ? line('Discount', `−$${b.discount}`) : null}
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
          {line('Total', `$${b.total}`, true)}
        </View>
      ) : null}

      {quote.note ? (
        <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm }}>{quote.note}</Text>
      ) : null}
      <PrimaryButton label="Accept & book →" onPress={onAccept} />
    </Card>
  );
}

/** Quotes tab main screen — one pending quote per car, with filters. */
export function QuotesReceivedScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const resetDamageFlow = useAppStore((s) => s.resetDamageFlow);
  const setQuotesViewed = useAppStore((s) => s.setQuotesViewed);
  const { data: quotes, isLoading } = useQuery({ queryKey: ['quotes'], queryFn: quoteService.getQuotes });

  // Opening this tab clears the unread-quotes badge.
  useEffect(() => setQuotesViewed(true), [setQuotesViewed]);

  const [distance, setDistance] = useState(DISTANCE_OPTS[0]);
  const [sort, setSort] = useState(SORT_OPTS[0]);
  // Pin ↔ card selection sync.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const cardRefs = useRef<Record<string, View | null>>({});

  const hasRequest = damageParts.length > 0;

  /** Tapping a price pin selects the matching quote and scrolls it into view. */
  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    requestAnimationFrame(() => {
      const node = cardRefs.current[dealerId];
      if (!node) return;
      if (Platform.OS === 'web') {
        (node as unknown as { scrollIntoView?: (o: object) => void }).scrollIntoView?.({
          behavior: 'smooth',
          block: 'center',
        });
        return;
      }
      const scroller = scrollRef.current;
      const inner = (scroller as unknown as { getInnerViewNode?: () => object })?.getInnerViewNode?.();
      if (!scroller || !inner) return;
      (node as unknown as {
        measureLayout: (i: object, cb: (x: number, y: number) => void, err: () => void) => void;
      }).measureLayout(
        inner,
        (_x: number, y: number) => scroller.scrollTo({ y: Math.max(0, y - 90), animated: true }),
        () => {},
      );
    });
  };

  const filtered = useMemo(() => {
    let list = [...(quotes ?? [])];
    const cap = distanceCap[distance];
    if (cap) list = list.filter((q) => dealerById(q.dealerId).distanceMi <= cap);
    list.sort((a, b) => {
      if (sort === 'Price: low to high') return a.price - b.price;
      if (sort === 'Price: high to low') return b.price - a.price;
      if (sort === 'Rating: high to low') return dealerById(b.dealerId).rating - dealerById(a.dealerId).rating;
      return dealerById(a.dealerId).distanceMi - dealerById(b.dealerId).distanceMi;
    });
    return list;
  }, [quotes, distance, sort]);

  const onCancel = () =>
    confirmAction(
      'Cancel this quote?',
      'Your current quote will be cleared so you can add more damaged parts and submit a fresh request.',
      () => {
        resetDamageFlow();
        navigateCrossTab(navigation, 'HomeTab', 'CarDiagram');
      },
      'Cancel & edit parts',
    );

  // No active request → prompt to start one.
  if (!hasRequest) {
    return (
      <Screen safeTop>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md }}>Quotes</Text>
        <Card style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text style={{ fontSize: 30, marginBottom: 6 }}>🧾</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>No active quote</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: 4, marginBottom: spacing.md }}>
            Submit a damaged part for an AI estimate and nearby shops will send quotes here.
          </Text>
          <PrimaryButton
            label="Get an AI estimate →"
            onPress={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')}
          />
        </Card>
      </Screen>
    );
  }

  const partsLabel = damageParts.map((p) => p.part).join(', ');

  const markers: MapMarker[] = filtered.map((q) => {
    const d = dealerById(q.dealerId);
    return {
      id: q.dealerId,
      lat: d.lat,
      lng: d.lng,
      label: `$${q.price}`,
      color: q.tier === 'best' ? '#085041' : q.tier === 'recommended' ? '#2e6bff' : '#fff',
      selected: q.dealerId === selectedId,
    };
  });

  return (
    <Screen safeTop scrollRef={scrollRef}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Quotes received</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }} numberOfLines={1}>
            {partsLabel}
          </Text>
        </View>
        <CarSwitchChip />
      </View>

      {/* AI estimate range */}
      {aiEstimate ? (
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.success,
            padding: spacing.md,
            marginBottom: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.successDark }}>
            ${aiEstimate.priceLow} – ${aiEstimate.priceHigh}
          </Text>
          <Badge label={`AI ${aiEstimate.confidencePct}%`} variant="success" />
        </View>
      ) : null}

      {/* Shops near you — map */}
      {markers.length > 0 ? (
        <View style={{ marginBottom: spacing.md }}>
          <SectionLabel>Shops near you</SectionLabel>
          <DealerMap
            markers={markers}
            center={USER_LOCATION}
            userLocation={USER_LOCATION}
            onSelect={onPinSelect}
            style={{ height: 180, borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.xs }}
          />
        </View>
      ) : null}

      {/* Filters */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Dropdown label="Distance" value={distance} options={DISTANCE_OPTS} onChange={setDistance} />
        </View>
        <View style={{ flex: 1 }}>
          <Dropdown label="Sort by" value={sort} options={SORT_OPTS} onChange={setSort} />
        </View>
      </View>

      <SectionLabel>{filtered.length} quotes</SectionLabel>
      {isLoading ? (
        <SkeletonList variant="card" count={4} />
      ) : filtered.length === 0 ? (
        <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>No quotes match this filter.</Text>
        </Card>
      ) : (
        filtered.map((q) => (
          <View
            key={q.id}
            ref={(node) => {
              cardRefs.current[q.dealerId] = node;
            }}
            style={
              q.dealerId === selectedId
                ? { borderWidth: 2, borderColor: colors.primary, borderRadius: radii.md }
                : undefined
            }
          >
            <QuoteRow
              quote={q}
              selected={q.dealerId === selectedId}
              onAccept={() => navigateCrossTab(navigation, 'HomeTab', 'AcceptBooking', { dealerId: q.dealerId })}
            />
          </View>
        ))
      )}

      {/* Add parts / revise + cancel */}
      <Tappable
        onPress={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')}
        style={{ backgroundColor: colors.surface, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primaryLight, borderRadius: radii.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDark }}>➕ Add or revise damaged parts</Text>
        <Text style={{ fontSize: 11, color: colors.textTertiary }}>Keeps your current parts, then resubmit for fresh quotes</Text>
      </Tappable>
      <Tappable onPress={onCancel} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
        <Text style={{ fontSize: 13, color: colors.danger, fontWeight: '700' }}>Cancel this quote</Text>
      </Tappable>
      <View style={{ marginBottom: spacing.lg }} />
    </Screen>
  );
}
