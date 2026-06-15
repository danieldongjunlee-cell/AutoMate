import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';

import { Dealer, Quote } from '../services/mock/data';
import { radii, spacing, useTheme } from '../theme';
import { useDistance } from '../i18n';
import { RatingLink } from './RatingLink';
import { AvatarCircle } from './ui';

/** Detailed quote card from s-dealer-quotes (note + accept / hours row). */
export function QuoteCard({
  quote,
  dealer,
  highlighted,
  onAccept,
}: {
  quote: Quote;
  dealer: Dealer;
  highlighted?: boolean;
  onAccept: () => void;
}) {
  const { colors } = useTheme();
  const dist = useDistance();
  return (
    <View
      style={{
        borderWidth: highlighted ? 1.5 : StyleSheet.hairlineWidth,
        borderColor: highlighted ? colors.primary : colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.inputBg,
        padding: spacing.md,
        marginBottom: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AvatarCircle initial={dealer.initial} color={dealer.color} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
            {dealer.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Tappable rating → Google reviews (feedback pass 2) */}
            <RatingLink dealer={dealer} label={`★ ${dealer.rating}`} style={{ fontSize: 13 }} />
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>
              {' '}· {dist.format(dealer.distanceMi)}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 21, fontWeight: '700', color: colors.successDark }}>
            ${quote.price}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>± inspection</Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          marginVertical: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>"{quote.note}"</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <Tappable
          onPress={onAccept}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 9,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onPrimary }}>
            Accept quote
          </Text>
        </Tappable>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 13 }}>🕐</Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>{dealer.hours}</Text>
        </View>
      </View>
    </View>
  );
}
