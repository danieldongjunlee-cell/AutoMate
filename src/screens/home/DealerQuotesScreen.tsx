import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { QuoteCard } from '../../components/QuoteCard';
import { Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services/mock/quoteService';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DealerQuotes'>;

export function DealerQuotesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: quoteService.getQuotes,
  });

  return (
    <Screen>
      {/* Range summary */}
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
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.successDeep, marginBottom: 4 }}>
          {QUOTE_REQUEST.quotesReceived} shops quoted your rear bumper dent
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.successDark }}>
            ${QUOTE_REQUEST.priceRange.low} – ${QUOTE_REQUEST.priceRange.high}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            {QUOTE_REQUEST.quotesReceived} quotes · price range
          </Text>
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
          Prices are photo-based estimates.{' '}
          <Text style={{ fontWeight: '700' }}>Final price may vary slightly</Text> after in-person
          inspection.
        </Text>
      </View>

      <SectionLabel>Quotes — sorted by price</SectionLabel>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
      ) : (
        quotes?.map((quote, i) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            dealer={dealerById(quote.dealerId)}
            highlighted={i === 0}
            onAccept={() => navigation.navigate('AcceptBooking', { dealerId: quote.dealerId })}
            onMessage={() =>
              Alert.alert('Messages', 'Dealer messaging will be wired to the backend later.')
            }
          />
        ))
      )}

      {/* Map link */}
      <Pressable
        onPress={() => navigation.navigate('AllQuotesMap')}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.sm,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 20 }}>📍</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>
          See all {QUOTE_REQUEST.quotesReceived} quotes on map
        </Text>
        <Text style={{ fontSize: 18, color: colors.textTertiary }}>›</Text>
      </Pressable>
    </Screen>
  );
}
