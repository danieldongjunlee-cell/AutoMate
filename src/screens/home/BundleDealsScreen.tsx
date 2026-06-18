import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

/** One service-category discount in a deal (e.g. Oil change · 15% off). */
interface DealDiscount {
  /** MAINT_CATEGORIES id the discount applies to. */
  categoryId: string;
  label: string;
  pct: number;
}

interface Deal {
  dealerId: string;
  initial: string;
  avatarColor: string;
  name: string;
  sub: string;
  badge: string;
  badgeBg: string;
  badgeFg: string;
  headerGradient: [string, string];
  borderColor: string;
  body?: string;
  /** Per-category percentage discounts the bundle applies. */
  discounts: DealDiscount[];
  cta: string;
  ctaBg: string;
  ctaFg: string;
  /** Short label shown on the booking once the deal is claimed. */
  claimLabel: string;
}

/** Wireframe s-home-bundle-deals: three partner deals, each → service booking.
 *  Each deal applies per-category % discounts that flow into the booking cart. */
const DEALS: Deal[] = [
  {
    dealerId: 'honda-fairfax',
    initial: 'H',
    avatarColor: palette.primary,
    name: 'Honda Fairfax',
    sub: 'Summer Bundle · Ends Jul 31',
    badge: 'UP TO 20% OFF',
    badgeBg: palette.warning,
    badgeFg: palette.dark,
    headerGradient: [palette.dark, palette.darkAlt],
    borderColor: palette.warning,
    discounts: [
      { categoryId: 'oil', label: 'Oil change', pct: 15 },
      { categoryId: 'tires', label: 'Tire service', pct: 20 },
      { categoryId: 'fluids', label: 'Fluids', pct: 10 },
    ],
    cta: 'Claim this bundle →',
    ctaBg: palette.warning,
    ctaFg: palette.dark,
    claimLabel: 'Summer Bundle',
  },
  {
    dealerId: 'autofix-pro',
    initial: 'A',
    avatarColor: palette.success,
    name: 'AutoFix Pro',
    sub: 'New customer offer',
    badge: 'UP TO 20% OFF',
    badgeBg: palette.success,
    badgeFg: '#fff',
    headerGradient: ['#085041', '#0F6E56'],
    borderColor: palette.success,
    body: 'New AutoMate customers save on an oil change and a full brake job. Discounts applied automatically at booking.',
    discounts: [
      { categoryId: 'oil', label: 'Oil change', pct: 20 },
      { categoryId: 'brakes', label: 'Brakes', pct: 15 },
    ],
    cta: 'Claim this deal →',
    ctaBg: palette.success,
    ctaFg: '#fff',
    claimLabel: 'New customer deal',
  },
  {
    dealerId: 'vienna-auto',
    initial: 'V',
    avatarColor: palette.info,
    name: 'Vienna Auto Care',
    sub: 'Member exclusive',
    badge: 'UP TO 20% OFF',
    badgeBg: palette.info,
    badgeFg: '#fff',
    headerGradient: [palette.navyMid, '#253A5A'],
    borderColor: '#E0DDD5',
    body: 'AutoMate members save on filters and fluid services. Discounts applied automatically at booking.',
    discounts: [
      { categoryId: 'filters', label: 'Filters', pct: 20 },
      { categoryId: 'fluids', label: 'Fluids', pct: 15 },
    ],
    cta: 'Book & save →',
    ctaBg: palette.info,
    ctaFg: '#fff',
    claimLabel: 'Member deal',
  },
];

export function BundleDealsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const claimDeal = useAppStore((s) => s.claimDeal);
  // The home ad-banner that was tapped opens that one deal's detail.
  const focus = (useRoute().params as { focus?: string } | undefined)?.focus;

  const claim = (deal: Deal) => {
    // Carry the deal's per-category % discounts into the cart so the prices the
    // user picks are discounted with a visible breakdown.
    const discounts = Object.fromEntries(deal.discounts.map((d) => [d.categoryId, d.pct]));
    claimDeal(deal.dealerId, { label: deal.claimLabel, discounts });
    // Bundle booking happens on the Maintenance tab (wireframe ⤴ edge).
    navigateCrossTab(navigation, 'HomeTab', 'MaintScheduleBook');
  };

  // Clear the focus to fall back to the full list (← See all deals).
  const clearFocus = () =>
    (navigation.setParams as unknown as (params: { focus?: string }) => void)({
      focus: undefined,
    });

  // When focused on a single deal (e.g. tapped ad banner), show only that one.
  const focusedDeal = focus ? DEALS.find((d) => d.dealerId === focus) : undefined;
  const visibleDeals = focusedDeal ? [focusedDeal] : DEALS;
  const isDetail = !!focusedDeal;

  const renderDeal = (deal: Deal) => (
    <View
      key={deal.dealerId}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: isDetail ? 2 : StyleSheet.hairlineWidth,
        borderColor: isDetail ? colors.primary : deal.borderColor,
        overflow: 'hidden',
        marginBottom: spacing.md,
      }}
    >
      {/* Header */}
      <LinearGradient
        colors={deal.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.sm,
            backgroundColor: deal.avatarColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>{deal.initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>{deal.name}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{deal.sub}</Text>
        </View>
        <View
          style={{
            backgroundColor: deal.badgeBg,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: deal.badgeFg }}>{deal.badge}</Text>
        </View>
      </LinearGradient>

      {/* Body */}
      <View style={{ padding: spacing.md }}>
        {deal.body ? (
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              lineHeight: 21,
              marginBottom: spacing.sm,
            }}
          >
            {deal.body}
          </Text>
        ) : null}
        {/* Per-service percentage discounts */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
          {deal.discounts.map((d) => (
            <View
              key={d.categoryId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: colors.successSurface,
                borderRadius: radii.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.success,
                paddingVertical: 6,
                paddingHorizontal: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.successDeep }}>{d.label}</Text>
              <View style={{ backgroundColor: colors.success, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{d.pct}% OFF</Text>
              </View>
            </View>
          ))}
        </View>
        <Tappable
          onPress={() => claim(deal)}
          style={({ pressed }) => ({
            backgroundColor: deal.ctaBg,
            borderRadius: radii.sm,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: deal.ctaFg }}>{deal.cta}</Text>
        </Tappable>
      </View>
    </View>
  );

  return (
    <Screen>
      {isDetail ? (
        <Tappable
          onPress={clearFocus}
          style={({ pressed }) => ({
            alignSelf: 'flex-start',
            marginBottom: spacing.md,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
            ← See all deals
          </Text>
        </Tappable>
      ) : (
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md }}>
          Exclusive deals from AutoMate partner dealerships · This week only
        </Text>
      )}

      {visibleDeals.map((deal) => renderDeal(deal))}
    </Screen>
  );
}
