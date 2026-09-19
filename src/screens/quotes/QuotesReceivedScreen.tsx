import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { CarSwitchChip } from '../../components/CarSwitchChip';
import { MapMarker } from '../../components/DealerMap';
import { FilterSheet } from '../../components/FilterSheet';
import { Icon } from '../../components/Icon';
import { IconChip } from '../../components/IconChip';
import { FilterChip, MapSheet } from '../../components/MapSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { QuoteShopCard } from '../../components/QuoteShopCard';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { navigateCrossTab } from '../../navigation/crossTab';
import { QuotesStackParamList } from '../../navigation/types';
import { quoteService } from '../../services';
import { dealerById, quotesInEstimateRange, USER_LOCATION } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';
import { applyQuoteFilters, QUOTE_PARTS, QUOTE_SORTS, quoteFilterSummary } from '../home/DealerQuotesScreen';

type Nav = NativeStackNavigationProp<QuotesStackParamList, 'Quotes'>;

/** Short chip labels for the quote sorts. */
const SORT_CHIP: Record<string, string> = {
  'Price: low to high': 'Price ↑',
  'Price: high to low': 'Price ↓',
  'Rating: high to low': 'Top rated',
  'Nearest first': 'Nearest',
};

/**
 * Quotes tab in a maps-app layout: the map of quoting shops fills the screen
 * and a draggable sheet lists them — AI estimate strip, filter chips (Sort by
 * · Open now · Parts · Distance) and one result row per shop with its quote.
 */
export function QuotesReceivedScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const resetDamageFlow = useAppStore((s) => s.resetDamageFlow);
  const setQuotesViewed = useAppStore((s) => s.setQuotesViewed);
  // Guests see the AI estimate + their submitted parts, but the real shop quotes
  // stay empty until they sign up / log in.
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const requireAuth = useRequireAuth();
  const { data: rawQuotes, isLoading } = useQuery({ queryKey: ['quotes'], queryFn: quoteService.getQuotes });
  const quotes = useMemo(() => quotesInEstimateRange(rawQuotes ?? [], aiEstimate), [rawQuotes, aiEstimate]);

  // Opening this tab clears the unread-quotes badge.
  useEffect(() => {
    setQuotesViewed(true);
  }, [setQuotesViewed]);

  const [sort, setSort] = useState(QUOTE_SORTS[0]);
  const [parts, setParts] = useState(QUOTE_PARTS[0]);
  const [openNow, setOpenNow] = useState(false);
  const [radius, setRadius] = useState(30);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef<Record<string, number>>({});

  const hasRequest = damageParts.length > 0;
  const filtered = useMemo(
    () => (isAuthenticated ? applyQuoteFilters(quotes, sort, parts, radius).filter((q) => !openNow || dealerById(q.dealerId).openStatus !== 'Closed') : []),
    [quotes, sort, parts, radius, isAuthenticated, openNow],
  );
  const summary = quoteFilterSummary(sort, parts, radius);

  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = rowY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  };

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
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3, marginBottom: spacing.lg }}>Quotes</Text>
        <Card style={{ padding: spacing.xl, alignItems: 'center', borderRadius: radii.tile }}>
          <IconChip name="tag" size={64} glyph={34} color={colors.primaryDark} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md }}>No active quote</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg, lineHeight: 20 }}>
            Submit a damaged part for an AI estimate and nearby shops will send quotes here.
          </Text>
          <PrimaryButton label="Get an AI estimate →" onPress={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')} />
        </Card>
      </Screen>
    );
  }

  /** AI estimate strip + add / cancel — shared by the guest and signed-in views. */
  const estimateBlock = (
    <>
      {aiEstimate ? (
        <View style={{ backgroundColor: colors.successSurface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.successLight, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.successDeep, marginBottom: 2 }}>AI estimated repair cost</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: palette.mint }}>
            ${aiEstimate.priceLow} – ${aiEstimate.priceHigh}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
            {damageParts.map((p) => (
              <View key={p.part} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>{p.part}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>{p.type} · {p.photos} photo{p.photos !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Add parts / revise + cancel */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')}
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: 10 }}
        >
          <Icon name="plus" size={16} color={colors.primaryDark} strokeWidth={2.2} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDark }}>Add or revise parts</Text>
        </Tappable>
        <Tappable onPress={onCancel} style={{ backgroundColor: colors.dangerSurface, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: radii.md, paddingVertical: 10, paddingHorizontal: spacing.md, justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.danger }}>Cancel</Text>
        </Tappable>
      </View>
    </>
  );

  // Guest who submitted but hasn't signed up — quotes stay locked.
  if (!isAuthenticated) {
    return (
      <Screen safeTop>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 }}>Your estimate</Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>Sign up to get real quotes</Text>
          </View>
          <CarSwitchChip />
        </View>
        <View style={{ marginBottom: spacing.lg }}>{estimateBlock}</View>
        <Card style={{ padding: spacing.xl, alignItems: 'center', borderRadius: radii.tile }}>
          <IconChip name="lock" size={64} glyph={34} color={palette.amber} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md, marginBottom: 4, textAlign: 'center' }}>Sign up to see your quotes</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 }}>
            Nearby shops are ready to send real quotes for your submitted parts. Sign up or log in to view them.
          </Text>
          <PrimaryButton label="Sign up or log in →" onPress={() => requireAuth('unlockQuotes')} />
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
      color: q.tier === 'best' ? '#085041' : q.tier === 'recommended' ? palette.primary : colors.surfaceAlt,
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
        title="Quotes received"
        subtitle={`${filtered.length} shops responded · ${summary.label.toLowerCase()}`}
        headerRight={<CarSwitchChip />}
        scrollRef={scrollRef}
        chips={
          <>
            <FilterChip icon="funnel" onPress={() => setFilterOpen(true)} active={summary.count > 0} />
            <FilterChip label={sort === QUOTE_SORTS[0] ? 'Sort by' : SORT_CHIP[sort] ?? sort} caret active={sort !== QUOTE_SORTS[0]} onPress={() => setSort(cycle(QUOTE_SORTS, sort))} />
            <FilterChip label="Open now" active={openNow} onPress={() => setOpenNow((v) => !v)} />
            <FilterChip label={parts === QUOTE_PARTS[0] ? 'Parts' : parts} caret active={parts !== QUOTE_PARTS[0]} onPress={() => setParts(cycle(QUOTE_PARTS, parts))} />
            <FilterChip label={radius < 30 ? `Within ${radius} mi` : 'Distance'} caret active={radius < 30} onPress={() => setFilterOpen(true)} />
          </>
        }
      >
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>{estimateBlock}</View>

        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <SkeletonList variant="card" count={4} />
          </View>
        ) : filtered.length === 0 ? (
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', padding: spacing.xl }}>No quotes match these filters.</Text>
        ) : (
          filtered.map((q, i) => (
            <View key={q.id} onLayout={(e) => (rowY.current[q.dealerId] = e.nativeEvent.layout.y)}>
              <QuoteShopCard
                quote={q}
                index={i}
                selected={q.dealerId === selectedId}
                onSelect={() => onPinSelect(q.dealerId)}
                onAccept={() => navigateCrossTab(navigation, 'HomeTab', 'AcceptBooking', { dealerId: q.dealerId })}
              />
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
