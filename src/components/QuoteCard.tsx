import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Dealer, Quote } from '../services/mock/data';
import { radii, spacing, useTheme } from '../theme';
import { AvatarCircle } from './ui';

/** Detailed quote card from s-dealer-quotes (note + accept / hours / msg row). */
export function QuoteCard({
  quote,
  dealer,
  highlighted,
  onAccept,
  onMessage,
}: {
  quote: Quote;
  dealer: Dealer;
  highlighted?: boolean;
  onAccept: () => void;
  onMessage?: () => void;
}) {
  const { colors } = useTheme();
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
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            ★ {dealer.rating} · {dealer.distanceMi} mi
          </Text>
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
        <Pressable
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
        </Pressable>
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
        <Pressable
          onPress={onMessage}
          style={({ pressed }) => ({
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: 9,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Msg</Text>
        </Pressable>
      </View>
    </View>
  );
}
