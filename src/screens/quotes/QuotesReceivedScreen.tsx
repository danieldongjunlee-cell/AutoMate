import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { CarSwitchChip } from '../../components/CarSwitchChip';
import { DealerMap, MapMarker } from '../../components/DealerMap';
import { FilterButton, FilterSheet } from '../../components/FilterSheet';
import { Icon } from '../../components/Icon';
import { IconChip } from '../../components/IconChip';
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

/** Quotes tab — one pending quote per car, shop photo cards, one Filter pill. */
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
  const [radius, setRadius] = useState(30);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const cardY = useRef<Record<string, number>>({});

  const hasRequest = damageParts.length > 0;
  const filtered = useMemo(
    () => (isAuthenticated ? applyQuoteFilters(quotes, sort, parts, radius) : []),
    [quotes, sort, parts, radius, isAuthenticated],
  );
  const summary = quoteFilterSummary(sort, parts, radius);

  const onPinSelect = (dealerId: string) => {
    setSelectedId(dealerId);
    const y = cardY.current[dealerId];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
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

  return (
    <Screen safeTop scrollRef={scrollRef}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 }}>
            {isAuthenticated ? 'Quotes received' : 'Your estimate'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            {isAuthenticated ? `${filtered.length} shops responded · sorted by price` : 'Sign up to get real quotes'}
          </Text>
        </View>
        <CarSwitchChip />
      </View>

      {/* AI estimate range + submitted parts */}
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
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
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

      {isAuthenticated ? (
        <>
          {markers.length > 0 ? (
            <DealerMap
              markers={markers}
              center={USER_LOCATION}
              userLocation={USER_LOCATION}
              onSelect={onPinSelect}
              style={{ height: 200, borderRadius: radii.lg, overflow: 'hidden', marginBottom: spacing.md }}
            />
          ) : null}

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
            filtered.map((q, i) => (
              <View key={q.id} onLayout={(e) => (cardY.current[q.dealerId] = e.nativeEvent.layout.y)}>
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
        </>
      ) : (
        // Guest who submitted but hasn't signed up — quotes stay locked.
        <Card style={{ padding: spacing.xl, alignItems: 'center', borderRadius: radii.tile }}>
          <IconChip name="lock" size={64} glyph={34} color={palette.amber} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md, marginBottom: 4, textAlign: 'center' }}>Sign up to see your quotes</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 }}>
            Nearby shops are ready to send real quotes for your submitted parts. Sign up or log in to view them.
          </Text>
          <PrimaryButton label="Sign up or log in →" onPress={() => requireAuth('unlockQuotes')} />
        </Card>
      )}
    </Screen>
  );
}
