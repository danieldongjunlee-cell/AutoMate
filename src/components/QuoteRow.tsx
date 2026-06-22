import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { AvatarCircle, Badge, Card } from './ui';
import { PrimaryButton } from './PrimaryButton';
import { STAR_YELLOW } from './RatingLink';
import { Tappable } from './Tappable';
import { dealerById, Quote, quoteBreakdown } from '../services/mock/data';
import { radii, spacing, useTheme } from '../theme';

/**
 * Expandable dealer-quote row shared by the Quotes tab and the post-submit
 * "available quotes" screen. Tapping the row selects the shop; the
 * "Accept & book" CTA only appears once selected (no default button otherwise).
 */
export function QuoteRow({
  quote,
  onAccept,
  onSelect,
  selected,
}: {
  quote: Quote;
  onAccept: () => void;
  onSelect: () => void;
  selected?: boolean;
}) {
  const { colors } = useTheme();
  const dealer = dealerById(quote.dealerId);
  const [open, setOpen] = useState(false);
  // Breakdown follows selection: expands the selected shop and collapses the
  // others when a different shop is selected.
  useEffect(() => {
    setOpen(!!selected);
  }, [selected]);
  const discount = quote.tier === 'best' ? 20 : 0;
  const b = quoteBreakdown(quote.price, discount);

  const line = (label: string, value: string, strong = false) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={{ fontSize: 13, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '400' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '500' }}>
        {value}
      </Text>
    </View>
  );

  return (
    <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
      {/* Tapping the dealer row selects this shop (reveals Accept & book). */}
      <Tappable onPress={onSelect} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AvatarCircle initial={dealer.initial} color={dealer.color} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{dealer.name}</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            <Text style={{ color: STAR_YELLOW }}>★</Text> {dealer.rating} ({dealer.reviews}) · {dealer.distanceMi} mi
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>${quote.price}</Text>
          {quote.tier !== 'other' ? (
            <Badge label={quote.tier === 'best' ? 'Best price' : 'Recommended'} variant={quote.tier === 'best' ? 'success' : 'primarySoft'} />
          ) : null}
        </View>
      </Tappable>

      <Tappable onPress={() => setOpen((o) => !o)} hitSlop={6} style={{ paddingVertical: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
          {open ? 'Hide price breakdown ⌃' : 'See price breakdown ⌄'}
        </Text>
      </Tappable>

      {open ? (
        <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radii.sm, padding: spacing.md, marginBottom: spacing.sm }}>
          {line('Labor total', `$${b.labor}`)}
          {line('Parts total', `$${b.parts}`)}
          {line('Paints & materials', `$${b.paints}`)}
          {line('Shop supplies (5%)', `$${b.shopSupplies}`)}
          {line('Tax (6%)', `$${b.tax}`)}
          {b.discount > 0 ? line('Discount', `−$${b.discount}`) : null}
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
          {line('Total', `$${b.total}`, true)}
        </View>
      ) : null}

      {quote.note ? (
        <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: selected ? spacing.sm : 0 }}>
          {quote.note}
        </Text>
      ) : null}
      {/* Accept & book only appears once this shop is selected. */}
      {selected ? (
        <PrimaryButton label={`Accept & book ${dealer.name} →`} onPress={onAccept} />
      ) : null}
    </Card>
  );
}
