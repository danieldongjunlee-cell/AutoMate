import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { QuoteCard } from '../../components/QuoteCard';
import { SkeletonList } from '../../components/Skeleton';
import { Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DealerQuotes'>;

export function DealerQuotesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: quoteService.getQuotes,
  });
  // Header numbers come from the latest submit's AI analysis when available;
  // the wireframe demo values (87% / $285–$480) otherwise.
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;
  const confidencePct = aiEstimate?.confidencePct ?? QUOTE_REQUEST.aiConfidencePct;

  const mapLink = (
    <Tappable
      onPress={() => navigation.navigate('AllQuotesMap')}
      style={({ pressed }) => ({
        backgroundColor: palette.aiPanel,
        borderRadius: radii.sm,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginVertical: spacing.sm,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontSize: 22 }}>📍</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
          See all {QUOTE_REQUEST.quotesReceived} quotes on map
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
          Compare prices by location
        </Text>
      </View>
      <Text style={{ fontSize: 18, color: 'rgba(255,255,255,.7)' }}>→</Text>
    </Tappable>
  );

  return (
    <Screen>
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
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.successDeep }}>
            AI estimate · rear bumper dent
          </Text>
          <View
            style={{
              backgroundColor: colors.success,
              borderRadius: radii.pill,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
              AI confidence {confidencePct}%
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.successDark }}>
            ${priceLow} – ${priceHigh}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
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
      </View>

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
        <Text style={{ flex: 1, fontSize: 12, color: colors.warningDeep, lineHeight: 18 }}>
          Photo-based estimates.{' '}
          <Text style={{ fontWeight: '700' }}>Final price may vary slightly</Text> after in-person
          inspection.
        </Text>
      </View>

      <SectionLabel>All {QUOTE_REQUEST.quotesReceived} quotes — sorted by price</SectionLabel>

      {isLoading ? (
        <SkeletonList variant="card" count={4} />
      ) : (
        quotes?.map((quote, i) => (
          <React.Fragment key={quote.id}>
            <QuoteCard
              quote={quote}
              dealer={dealerById(quote.dealerId)}
              highlighted={i === 0}
              onAccept={() => navigation.navigate('AcceptBooking', { dealerId: quote.dealerId })}
            />
            {/* Wireframe: the map card sits after the third quote */}
            {i === 2 ? mapLink : null}
          </React.Fragment>
        ))
      )}
    </Screen>
  );
}
