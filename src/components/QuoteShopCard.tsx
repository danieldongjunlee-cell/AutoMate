import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';
import { ShopCard } from './ShopCard';
import { dealerById, Quote, quoteBreakdown } from '../services/mock/data';
import { radii, spacing, useTheme } from '../theme';

/**
 * A shop quote as a photo card (Quotes tab + post-submit quotes). Tapping the
 * card selects the shop: the price breakdown expands and "Accept & book"
 * appears. `index` picks the placeholder storefront variant.
 */
export function QuoteShopCard({
  quote,
  index,
  selected,
  onSelect,
  onAccept,
}: {
  quote: Quote;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onAccept: () => void;
}) {
  const { colors } = useTheme();
  const dealer = dealerById(quote.dealerId);
  const discount = quote.tier === 'best' ? 20 : 0;
  const b = quoteBreakdown(quote.price, discount);
  const price = quote.priceHigh ? `$${quote.price}–${quote.priceHigh}` : `$${quote.price}`;
  const meta = `${dealer.distanceMi} mi · ★ ${dealer.rating.toFixed(1)} (${dealer.reviews}) · ${quote.note}`;

  const line = (label: string, value: string, strong = false) => (
    <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={{ fontSize: 14, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '400' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '500' }}>{value}</Text>
    </View>
  );

  return (
    <ShopCard dealer={dealer} price={price} meta={meta} best={quote.tier === 'best'} index={index} selected={selected} onPress={onSelect}>
      {selected ? (
        <View>
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm }}>
            {line('Labor total', `$${b.labor}`)}
            {line('Parts total', `$${b.parts}`)}
            {line('Paints & materials', `$${b.paints}`)}
            {line('Shop supplies (5%)', `$${b.shopSupplies}`)}
            {line('Tax (6%)', `$${b.tax}`)}
            {b.discount > 0 ? line('Discount', `−$${b.discount}`) : null}
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
            {line('Total', `$${b.total}`, true)}
          </View>
          <PrimaryButton label={`Accept & book ${dealer.name} →`} onPress={onAccept} textStyle={{ fontSize: 16 }} />
        </View>
      ) : null}
    </ShopCard>
  );
}
