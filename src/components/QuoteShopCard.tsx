import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';
import { ShopListRow } from './ShopListRow';
import { dealerById, Quote, quoteBreakdown } from '../services/mock/data';
import { palette, radii, spacing, useTheme } from '../theme';

/**
 * A shop's quote as a maps-app result row (Quotes tab + post-submit quotes):
 * rating with a yellow star, open / closed, photos, the quote as a callout
 * with "Accept", and Directions · Call · Website chips. Tapping the row
 * selects the shop: the price breakdown expands and "Accept & book" appears.
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
  const tier = quote.tier === 'best' ? ' · Best price' : quote.tier === 'recommended' ? ' · Recommended' : '';

  const line = (label: string, value: string, strong = false) => (
    <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={{ fontSize: 14, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '400' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: strong ? colors.textPrimary : colors.textSecondary, fontWeight: strong ? '800' : '500' }}>{value}</Text>
    </View>
  );

  return (
    <ShopListRow
      dealer={dealer}
      index={index}
      tags={`${quote.parts} parts`}
      selected={selected}
      onPress={onSelect}
      callout={{ title: `Quote ${price}${tier}`, body: quote.note, button: 'Accept', onPress: onAccept }}
      actions={[{ label: 'Accept & book', icon: 'calcheck', primary: true, onPress: onAccept }]}
    >
      {selected ? (
        <View>
          {quote.tier === 'best' ? (
            <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: palette.mint, marginBottom: 6 }}>BEST PRICE · 20% partner discount applied</Text>
          ) : null}
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
    </ShopListRow>
  );
}
