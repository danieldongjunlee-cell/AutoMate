import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';

import { QuotesSheet } from '../../components/QuotesSheet';
import { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { confirmAction } from '../../utils/alerts';

// The quote filters live with the shared sheet; re-exported for older imports.
export { applyQuoteFilters, QUOTE_PARTS, QUOTE_SORTS, quoteFilterSummary } from '../../components/QuotesSheet';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DealerQuotes'>;

/**
 * Post-submit "View available quotes": the same map + sheet layout as the
 * Quotes tab, reached from the Submitted screen. Accepting a quote books it.
 */
export function DealerQuotesScreen() {
  const navigation = useNavigation<Nav>();
  const resetDamageFlow = useAppStore((s) => s.resetDamageFlow);

  return (
    <QuotesSheet
      onAccept={(dealerId) => navigation.navigate('AcceptBooking', { dealerId })}
      onRevise={() => navigation.navigate('CarDiagram')}
      onCancel={() =>
        confirmAction(
          'Cancel this quote?',
          'Your current quote will be cleared so you can add more damaged parts and submit a fresh request.',
          () => {
            resetDamageFlow();
            navigation.navigate('CarDiagram');
          },
          'Cancel & edit parts',
        )
      }
    />
  );
}
