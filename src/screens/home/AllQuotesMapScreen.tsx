import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkeletonList } from '../../components/Skeleton';
import { AvatarCircle, SectionLabel, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, Quote, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AllQuotesMap'>;

const BEST_GREEN = '#085041';

const TIER_TAG: Record<Quote['tier'], string | null> = {
  best: 'BEST PRICE',
  recommended: 'RECOMMENDED',
  other: null,
};

/** Price pin on the stylized map (tagged BEST PRICE / RECOMMENDED). */
function PricePin({ quote, onPress }: { quote: Quote; onPress: () => void }) {
  const tag = TIER_TAG[quote.tier];
  const pillBg =
    quote.tier === 'best' ? BEST_GREEN : quote.tier === 'recommended' ? palette.primary : '#fff';
  const pillFg = quote.tier === 'other' ? palette.textPrimary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        top: `${quote.pin.top}%`,
        left: `${quote.pin.left}%`,
        alignItems: 'center',
        transform: [{ translateX: -24 }],
      }}
    >
      <View
        style={{
          backgroundColor: pillBg,
          borderRadius: radii.pill,
          borderWidth: quote.tier === 'other' ? 0 : 1.5,
          borderColor: '#fff',
          paddingHorizontal: 10,
          paddingVertical: 5,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: pillFg }}>${quote.price}</Text>
      </View>
      {tag ? (
        <Text
          style={{
            fontSize: 8,
            fontWeight: '700',
            marginTop: 2,
            color: quote.tier === 'best' ? BEST_GREEN : palette.primaryDark,
          }}
        >
          {tag}
        </Text>
      ) : null}
    </Pressable>
  );
}

/**
 * Wireframe s-all-quotes-map (v15.10): stylized light map with 8 priced pins,
 * BEST PRICE / RECOMMENDED tags, legend, and the "Top picks" list.
 * Swappable for react-native-maps once real dealer geodata exists.
 */
export function AllQuotesMapScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: quoteService.getQuotes,
  });

  const goAccept = (dealerId: string) => navigation.navigate('AcceptBooking', { dealerId });
  const topPicks = quotes?.slice(0, 3) ?? [];

  return (
    <Screen>
      {/* Map */}
      <LinearGradient
        colors={['#E9EFE6', '#DDE8E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.35, y: 1 }}
        style={{
          borderRadius: radii.lg,
          height: 300,
          marginBottom: spacing.sm,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: '#C8D5CC',
        }}
      >
        {/* Roads */}
        <View
          style={{
            position: 'absolute',
            top: -20,
            bottom: -20,
            left: '30%',
            width: 13,
            backgroundColor: '#fff',
            opacity: 0.85,
            transform: [{ rotate: '12deg' }],
            borderWidth: 1,
            borderColor: '#E5E0D5',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: -10,
            right: -10,
            top: '48%',
            height: 10,
            backgroundColor: '#fff',
            opacity: 0.85,
            transform: [{ rotate: '-4deg' }],
          }}
        />
        {/* Parks */}
        <View style={{ position: 'absolute', top: '10%', right: '8%', width: 76, height: 54, backgroundColor: '#D5E3D0', borderRadius: 10, opacity: 0.7 }} />
        <View style={{ position: 'absolute', bottom: '12%', left: '6%', width: 64, height: 44, backgroundColor: '#D5E3D0', borderRadius: 10, opacity: 0.7 }} />

        {/* You-are-here */}
        <View style={{ position: 'absolute', top: '46%', left: '36%' }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: palette.info,
              borderWidth: 3,
              borderColor: '#fff',
              shadowColor: palette.info,
              shadowOpacity: 0.35,
              shadowRadius: 6,
              elevation: 3,
            }}
          />
        </View>

        {/* Quote pins */}
        {quotes?.map((q) => <PricePin key={q.id} quote={q} onPress={() => goAccept(q.dealerId)} />)}

        {/* Location chip */}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
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
      </LinearGradient>

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.md,
          marginBottom: spacing.md,
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

      <SectionLabel>Top picks</SectionLabel>
      {isLoading ? <SkeletonList variant="row" count={3} /> : null}
      {topPicks.map((q) => {
        const dealer = dealerById(q.dealerId);
        const tag = TIER_TAG[q.tier];
        const tinted = q.tier !== 'other';
        return (
          <Pressable
            key={q.id}
            onPress={() => goAccept(q.dealerId)}
            style={({ pressed }) => ({
              backgroundColor:
                q.tier === 'best'
                  ? '#E8F5EF'
                  : q.tier === 'recommended'
                    ? colors.primarySurface
                    : colors.surface,
              borderWidth: q.tier === 'recommended' ? 1.5 : tinted ? 1 : StyleSheet.hairlineWidth,
              borderColor:
                q.tier === 'best'
                  ? colors.success
                  : q.tier === 'recommended'
                    ? colors.primary
                    : colors.border,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <AvatarCircle initial={dealer.initial} color={dealer.color} size={36} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                {dealer.distanceMi} mi · ★ {dealer.rating}
                {q.tier === 'recommended' ? ' · OEM parts' : ''}
              </Text>
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
          </Pressable>
        );
      })}
    </Screen>
  );
}
