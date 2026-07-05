import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

import { navigateCrossTab } from '../navigation/crossTab';
import { Dealer } from '../services/mock/data';
import { palette, useTheme } from '../theme';
import { Tappable } from './Tappable';

/** Shared yellow used for every review star across the app. */
export const STAR_YELLOW = palette.warning;

/**
 * Tappable "★ 4.9 (312 reviews)" rating → the in-app Reviews screen for the
 * shop (internal AutoMate reviews, NOT Google). The leading star renders in the
 * shared review-star yellow; the text itself is not underlined.
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
  const text = label ?? `★ ${dealer.rating} (${dealer.reviews} reviews)`;
  const hasStar = text.startsWith('★');
  return (
    <Tappable
      onPress={() => navigateCrossTab(navigation, 'HomeTab', 'Reviews', { dealerId: dealer.id })}
      hitSlop={6}
    >
      <Text style={[{ fontSize: 13, color: colors.textTertiary }, style]}>
        {hasStar ? <Text style={{ color: STAR_YELLOW }}>★</Text> : null}
        {hasStar ? text.slice(1) : text}
      </Text>
    </Tappable>
  );
}
