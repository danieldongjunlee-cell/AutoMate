import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

import { Dealer } from '../services/mock/data';
import { useTheme } from '../theme';
import { openDealerReviews } from '../utils/links';
import { Tappable } from './Tappable';

/**
 * Tappable "★ 4.9 (312 reviews)" rating (user-feedback pass 2): confirm →
 * Google reviews for the dealer. Dotted underline signals the link without
 * shouting inside meta rows.
 */
export function RatingLink({
  dealer,
  label,
  style,
}: {
  dealer: Dealer;
  /** Override the rendered text (default "★ {rating} ({reviews} reviews)"). */
  label?: string;
  style?: StyleProp<TextStyle>;
}) {
  const { colors } = useTheme();
  return (
    <Tappable onPress={() => openDealerReviews(dealer)} hitSlop={6}>
      <Text
        style={[
          {
            fontSize: 12,
            color: colors.textTertiary,
            textDecorationLine: 'underline',
            textDecorationStyle: 'dotted',
          },
          style,
        ]}
      >
        {label ?? `★ ${dealer.rating} (${dealer.reviews} reviews)`}
      </Text>
    </Tappable>
  );
}
