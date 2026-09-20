import React from 'react';

import { PriceBreakdown } from './PriceBreakdown';
import { ShopListRow } from './ShopListRow';
import { dealerById, Quote, quoteBreakdown } from '../services/mock/data';

/**
 * A shop's quote as a maps-app result row (Quotes tab + post-submit quotes):
 * rating with a yellow star, open / closed, photos, a BEST PRICE /
 * RECOMMENDED ribbon on the top right, the quote as a collapsible price
 * breakdown, and Accept & book · Directions · Call · Website chips.
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
  const dealer = dealerById(quote.dealerId);
  const discount = quote.tier === 'best' ? 20 : 0;
  const b = quoteBreakdown(quote.price, discount);
  const price = quote.priceHigh ? `$${quote.price}–${quote.priceHigh}` : `$${quote.price}`;
  const tag =
    quote.tier === 'best'
      ? ({ label: 'Best price', tone: 'best' } as const)
      : quote.tier === 'recommended'
        ? ({ label: 'Recommended', tone: 'reco' } as const)
        : undefined;

  return (
    <ShopListRow
      dealer={dealer}
      index={index}
      tags={`${quote.parts} parts`}
      tag={tag}
      selected={selected}
      onPress={onSelect}
      actions={[{ label: 'Accept & book', icon: 'calcheck', primary: true, onPress: onAccept }]}
    >
      <PriceBreakdown
        title="Quote"
        total={price}
        caption={quote.note}
        lines={[
          { label: 'Labor total', value: `$${b.labor}` },
          { label: 'Parts total', value: `$${b.parts}` },
          { label: 'Paints & materials', value: `$${b.paints}` },
          { label: 'Shop supplies (5%)', value: `$${b.shopSupplies}` },
          { label: 'Tax (6%)', value: `$${b.tax}` },
          ...(b.discount > 0 ? [{ label: 'Partner discount', value: `− $${b.discount}`, accent: true }] : []),
          { label: 'Total', value: `$${b.total}`, strong: true },
        ]}
      />
    </ShopListRow>
  );
}
