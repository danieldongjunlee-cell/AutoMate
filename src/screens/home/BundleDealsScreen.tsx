import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';

import { Deal, DealBanner, DEALS } from '../../components/DealBanner';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { useAppStore } from '../../store/useAppStore';
import { spacing, useTheme } from '../../theme';

/**
 * "View all deals": the same gradient banner cards as the Home carousel, each
 * opened up with its per-service discounts and a claim button. Tapping a Home
 * banner lands here focused on that one deal.
 */
export function BundleDealsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const claimDeal = useAppStore((s) => s.claimDeal);
  // The home banner that was tapped opens that one deal's detail.
  const focus = (useRoute().params as { focus?: string } | undefined)?.focus;

  const claim = (deal: Deal) => {
    // Carry the deal's per-category % discounts into the cart so the prices the
    // user picks are discounted with a visible breakdown.
    const discounts = Object.fromEntries(deal.discounts.map((d) => [d.categoryId, d.pct]));
    claimDeal(deal.dealerId, { label: deal.claimLabel, discounts });
    navigateCrossTab(navigation, 'HomeTab', 'MaintScheduleBook');
  };

  // Clear the focus to fall back to the full list (← See all deals).
  const clearFocus = () => (navigation.setParams as unknown as (params: { focus?: string }) => void)({ focus: undefined });

  const focusedDeal = focus ? DEALS.find((d) => d.dealerId === focus) : undefined;
  const visibleDeals = focusedDeal ? [focusedDeal] : DEALS;

  return (
    <Screen>
      {focusedDeal ? (
        <Tappable onPress={clearFocus} style={({ pressed }) => ({ alignSelf: 'flex-start', marginBottom: spacing.md, opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>← See all deals</Text>
        </Tappable>
      ) : (
        <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.md }}>
          Exclusive deals from AutoMate partner shops · This week only
        </Text>
      )}

      <View style={{ gap: spacing.md }}>
        {visibleDeals.map((deal) => (
          <DealBanner key={deal.dealerId} deal={deal} expanded highlighted={deal.dealerId === focus} onClaim={() => claim(deal)} />
        ))}
      </View>
    </Screen>
  );
}
