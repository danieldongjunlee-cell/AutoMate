import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

import { navigateCrossTab } from '../navigation/crossTab';
import { Dealer } from '../services/mock/data';
import { useTheme } from '../theme';
import { Tappable } from './Tappable';

/**
 * Tappable "★ 4.9 (312 reviews)" rating → the in-app Reviews screen for the
 * shop (internal AutoMate reviews, NOT Google). Dotted underline signals the
 * link without shouting inside meta rows.
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
  const navigation = useNavigation();
  return (
    <Tappable
      onPress={() => navigateCrossTab(navigation, 'HomeTab', 'Reviews', { dealerId: dealer.id })}
      hitSlop={6}
    >
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
