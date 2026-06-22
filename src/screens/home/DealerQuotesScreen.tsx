import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { DealerMap, MapMarker } from '../../components/DealerMap';
import { QuoteRow } from '../../components/QuoteRow';
import { SkeletonList } from '../../components/Skeleton';
import { Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, Quote, QUOTE_REQUEST, quotesInEstimateRange, USER_LOCATION } from '../../services/mock/data';
import { quoteService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { useT } from '../../i18n';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DealerQuotes'>;

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

export function DealerQuotesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useT();
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const damageParts = useAppStore((s) => s.damageParts);
  const { data: rawQuotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: quoteService.getQuotes,
  });
  // Header numbers come from the latest submit's AI analysis when available;
  // the wireframe demo values (87% / $285–$480) otherwise.
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;
  const confidencePct = aiEstimate?.confidencePct ?? QUOTE_REQUEST.aiConfidencePct;
  // Shop quotes always reflect the AI estimate range shown above.
  const quotes = quotesInEstimateRange(rawQuotes ?? [], { priceLow, priceHigh });

  // Pin ↔ card selection sync.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  // Each card's y-offset within the scroll content (captured via onLayout).
  const cardY = useRef<Record<string, number>>({});

  const markers: MapMarker[] = quotes.map((q) => {
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

  return (
    <Screen scrollRef={scrollRef}>
      {/* AI estimate summary */}
      <View
        style={{
          backgroundColor: colors.successSurface,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.success,
          padding: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.successDeep }}>
            AI estimated repair cost
          </Text>
          <View
            style={{
              backgroundColor: colors.success,
              borderRadius: radii.pill,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
              {t('AI confidence')} {confidencePct}%
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.successDark }}>
            ${priceLow} – ${priceHigh}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            {QUOTE_REQUEST.quotesReceived} quotes · price range
          </Text>
        </View>
        {/* Confidence bar */}
        <View
          style={{
            height: 6,
            backgroundColor: 'rgba(29,158,117,.18)',
            borderRadius: 3,
            marginTop: spacing.sm,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${confidencePct}%`,
              height: '100%',
              backgroundColor: colors.success,
              borderRadius: 3,
            }}
          />
        </View>
        {/* Damaged parts + type as standout chips */}
        {damageParts.length > 0 ? (
          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(29,158,117,.25)', marginTop: spacing.sm, paddingTop: spacing.sm, gap: spacing.xs }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.successDeep, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Damaged parts assessed
            </Text>
            {damageParts.map((p) => (
              <View key={p.part} style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <View style={{ backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.onPrimary }}>{p.part}</Text>
                </View>
                <View style={{ backgroundColor: colors.warningSurface, borderWidth: 1, borderColor: colors.warning, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.warningDeep }}>{p.type}</Text>
                </View>
                <Text style={{ fontSize: 13, color: colors.textTertiary }}>📷 {p.photos} photo{p.photos !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* Shops with quotes near you — real map (Leaflet web / RN-maps native) */}
      {quotes && quotes.length > 0 ? (
        <View style={{ marginBottom: spacing.md }}>
          <SectionLabel>{t('Shops near you')}</SectionLabel>
          <DealerMap
            markers={markers}
            center={USER_LOCATION}
            userLocation={USER_LOCATION}
            onSelect={onPinSelect}
            style={{ height: 190, borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.xs }}
          />
        </View>
      ) : null}

      {/* Disclaimer */}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          borderWidth: 0.5,
          borderColor: colors.warning,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: 6,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 14 }}>ⓘ</Text>
        <Text style={{ flex: 1, fontSize: 13, color: colors.warningDeep, lineHeight: 18 }}>
          Photo-based estimates.{' '}
          <Text style={{ fontWeight: '700' }}>Final price may vary slightly</Text> after in-person
          inspection.
        </Text>
      </View>

      <SectionLabel>All {QUOTE_REQUEST.quotesReceived} quotes — sorted by price</SectionLabel>

      {isLoading ? (
        <SkeletonList variant="card" count={4} />
      ) : (
        quotes?.map((quote) => {
          const isSelected = quote.dealerId === selectedId;
          return (
            <View
              key={quote.id}
              onLayout={(e) => {
                cardY.current[quote.dealerId] = e.nativeEvent.layout.y;
              }}
              // Only the selected card is outlined (no permanent first-card border).
              style={
                isSelected
                  ? { borderWidth: 2, borderColor: colors.primary, borderRadius: radii.md }
                  : undefined
              }
            >
              <QuoteRow
                quote={quote}
                selected={isSelected}
                onSelect={() => onPinSelect(quote.dealerId)}
                onAccept={() => navigation.navigate('AcceptBooking', { dealerId: quote.dealerId })}
              />
            </View>
          );
        })
      )}
    </Screen>
  );
}