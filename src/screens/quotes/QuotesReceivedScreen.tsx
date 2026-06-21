import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { CarSwitchChip } from '../../components/CarSwitchChip';
import { DealerMap, MapMarker } from '../../components/DealerMap';
import { Dropdown } from '../../components/Dropdown';
import { PrimaryButton } from '../../components/PrimaryButton';
import { QuoteRow } from '../../components/QuoteRow';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { navigateCrossTab } from '../../navigation/crossTab';
import { QuotesStackParamList } from '../../navigation/types';
import { quoteService } from '../../services';
import { dealerById, DISTANCE_CAP, DISTANCE_FILTERS, quotesInEstimateRange, USER_LOCATION } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<QuotesStackParamList, 'Quotes'>;

const SORT_OPTS = ['Price: low to high', 'Price: high to low', 'Rating: high to low', 'Nearest first'];

/** Quotes tab main screen — one pending quote per car, with filters. */
export function QuotesReceivedScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const resetDamageFlow = useAppStore((s) => s.resetDamageFlow);
  const setQuotesViewed = useAppStore((s) => s.setQuotesViewed);
  const { data: rawQuotes, isLoading } = useQuery({ queryKey: ['quotes'], queryFn: quoteService.getQuotes });
  // Shop quotes reflect the AI estimate range (no-op until an estimate exists).
  const quotes = useMemo(() => quotesInEstimateRange(rawQuotes ?? [], aiEstimate), [rawQuotes, aiEstimate]);

  // Opening this tab clears the unread-quotes badge.
  useEffect(() => setQuotesViewed(true), [setQuotesViewed]);

  const [distance, setDistance] = useState(DISTANCE_FILTERS[0]);
  const [sort, setSort] = useState(SORT_OPTS[0]);
  // Pin ↔ card selection sync.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  // Each card's y-offset within the scroll content (captured via onLayout).
  const cardY = useRef<Record<string, number>>({});

  const hasRequest = damageParts.length > 0;

  /** Tapping a price pin selects the matching quote and scrolls it into view. */
  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = cardY.current[dealerId];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
    }
  };

  const filtered = useMemo(() => {
    let list = [...(quotes ?? [])];
    const cap = DISTANCE_CAP[distance] ?? Infinity;
    if (Number.isFinite(cap)) list = list.filter((q) => dealerById(q.dealerId).distanceMi <= cap);
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
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Quote Received</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            {filtered.length} shops responded
          </Text>
        </View>
        <CarSwitchChip />
      </View>

      {/* AI estimate: price range + confidence + what was submitted */}
      {aiEstimate ? (
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.success,
            padding: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.successDeep }}>
              AI estimated repair cost
            </Text>
            <Badge label={`AI confidence ${aiEstimate.confidencePct}%`} variant="success" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.successDark, marginBottom: spacing.sm }}>
            ${aiEstimate.priceLow} – ${aiEstimate.priceHigh}
          </Text>
          {/* Confidence bar */}
          <View style={{ height: 6, backgroundColor: 'rgba(29,158,117,.18)', borderRadius: 3, overflow: 'hidden', marginBottom: spacing.sm }}>
            <View style={{ width: `${aiEstimate.confidencePct}%`, height: '100%', backgroundColor: colors.success, borderRadius: 3 }} />
          </View>
          {/* Submitted parts: part + damage type as standout chips + photo count */}
          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(29,158,117,.25)', paddingTop: spacing.sm, gap: spacing.xs }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.successDeep, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Damaged parts assessed
            </Text>
            {damageParts.map((p) => (
              <View key={p.part} style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                {/* Part name — prominent dark chip */}
                <View style={{ backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.onPrimary }}>{p.part}</Text>
                </View>
                {/* Damage type — colored badge so it's easy to spot */}
                <View style={{ backgroundColor: colors.warningSurface, borderWidth: 1, borderColor: colors.warning, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.warningDeep }}>{p.type}</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                  📷 {p.photos} photo{p.photos !== 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Add parts / revise + cancel — kept above the map for quick access. */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')}
          style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primaryLight, borderRadius: radii.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>➕ Add or revise parts</Text>
        </Tappable>
        <Tappable
          onPress={onCancel}
          style={{ backgroundColor: colors.dangerSurface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.dangerBorder, borderRadius: radii.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.danger }}>Cancel</Text>
        </Tappable>
      </View>

      {/* Shops near you — larger map. Tap a price to select that dealership. */}
      {markers.length > 0 ? (
        <View style={{ marginBottom: spacing.md }}>
          <SectionLabel>Shops near you · tap a price to select</SectionLabel>
          <DealerMap
            markers={markers}
            center={USER_LOCATION}
            userLocation={USER_LOCATION}
            onSelect={onPinSelect}
            style={{ height: 260, borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.xs }}
          />
        </View>
      ) : null}

      {/* Filters */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Dropdown label="Distance" value={distance} options={DISTANCE_FILTERS} onChange={setDistance} />
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
            onLayout={(e) => {
              cardY.current[q.dealerId] = e.nativeEvent.layout.y;
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
              onSelect={() => onPinSelect(q.dealerId)}
              onAccept={() => navigateCrossTab(navigation, 'HomeTab', 'AcceptBooking', { dealerId: q.dealerId })}
            />
          </View>
        ))
      )}
      <View style={{ marginBottom: spacing.lg }} />
    </Screen>
  );
}
