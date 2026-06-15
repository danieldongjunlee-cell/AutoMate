import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';

import { useDistance } from '../i18n';
import { Dealer } from '../services/mock/data';
import { radii, spacing, useTheme } from '../theme';
import { RatingLink } from './RatingLink';

/**
 * Partner-dealer card from s-maint-schedule: square brand avatar, open
 * status, service price chips, and a brand-colored CTA.
 */
export function DealerCard({
  dealer,
  serviceChips,
  cta = 'Select services →',
  onPress,
}: {
  dealer: Dealer;
  serviceChips: string[];
  cta?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const dist = useDistance();
  const open = dealer.openStatus === 'Open';
  return (
    <Tappable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.sm,
            backgroundColor: dealer.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{dealer.initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            {dealer.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {dist.format(dealer.distanceMi)} ·{' '}
            </Text>
            {/* Tappable rating → Google reviews (feedback pass 2) */}
            <RatingLink dealer={dealer} label={`★ ${dealer.rating}`} />
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {' '}· {open ? `Open until ${dealer.closesAt}` : `Closes ${dealer.closesAt}`}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>🕐 {dealer.hours}</Text>
        </View>
        <View
          style={{
            backgroundColor: open ? colors.successSurface : colors.warningSurface,
            borderRadius: radii.pill,
            paddingHorizontal: 9,
            paddingVertical: 3,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: open ? colors.successDeep : colors.warningDeep,
            }}
          >
            {dealer.openStatus}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm }}>
        {serviceChips.map((chip) => (
          <View
            key={chip}
            style={{
              backgroundColor: colors.primarySurface,
              borderRadius: radii.pill,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, color: colors.primaryDark }}>{chip}</Text>
          </View>
        ))}
      </View>

      {/* Inner CTA is its own Tappable so the button itself gives hover/press
          feedback (user-feedback pass 1) — same action as the card. */}
      <Tappable
        onPress={onPress}
        style={{
          backgroundColor: dealer.color,
          borderRadius: radii.sm,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{cta}</Text>
      </Tappable>
    </Tappable>
  );
}
