import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

interface PriceCell {
  label: string;
  price: string;
  was: string;
  highlight?: boolean;
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
  cells: PriceCell[];
  cta: string;
  ctaBg: string;
  ctaFg: string;
}

/** Wireframe s-home-bundle-deals: three partner deals, each → service booking. */
const DEALS: Deal[] = [
  {
    dealerId: 'honda-fairfax',
    initial: 'H',
    avatarColor: palette.primary,
    name: 'Honda Fairfax',
    sub: 'Summer Bundle · Ends Jul 31',
    badge: 'SAVE $89',
    badgeBg: palette.warning,
    badgeFg: palette.dark,
    headerGradient: [palette.dark, palette.darkAlt],
    borderColor: palette.warning,
    cells: [
      { label: 'Oil change', price: '$39', was: '$59' },
      { label: 'Tire rotation', price: '$19', was: '$39' },
      { label: 'Inspection', price: '$29', was: '$59' },
    ],
    cta: 'Claim this bundle →',
    ctaBg: palette.warning,
    ctaFg: palette.dark,
  },
  {
    dealerId: 'autofix-pro',
    initial: 'A',
    avatarColor: palette.success,
    name: 'AutoFix Pro',
    sub: 'New customer offer',
    badge: '20% OFF',
    badgeBg: palette.success,
    badgeFg: '#fff',
    headerGradient: ['#085041', '#0F6E56'],
    borderColor: palette.success,
    body: 'First service free multi-point inspection with any oil change. Valid for AutoMate users only.',
    cells: [
      { label: 'Oil + Inspection', price: '$47', was: 'was $79', highlight: true },
      { label: 'Brakes + pads', price: '$119', was: '$149' },
    ],
    cta: 'Claim this deal →',
    ctaBg: palette.success,
    ctaFg: '#fff',
  },
  {
    dealerId: 'vienna-auto',
    initial: 'V',
    avatarColor: palette.info,
    name: 'Vienna Auto Care',
    sub: 'Member exclusive',
    badge: '$30 OFF',
    badgeBg: palette.info,
    badgeFg: '#fff',
    headerGradient: [palette.navyMid, '#253A5A'],
    borderColor: '#E0DDD5',
    body: '$30 off any service over $99 for AutoMate members. Use code AUTOMATE30 at checkout.',
    cells: [],
    cta: 'Book & save →',
    ctaBg: palette.info,
    ctaFg: '#fff',
  },
];

export function BundleDealsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const startBooking = useAppStore((s) => s.startBooking);

  const claim = (dealerId: string) => {
    startBooking(dealerId);
    // Bundle booking happens on the Maintenance tab (wireframe ⤴ edge).
    navigateCrossTab(navigation, 'MaintTab', 'MaintScheduleBook');
  };

  return (
    <Screen>
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md }}>
        Exclusive deals from AutoMate partner dealerships · This week only
      </Text>

      {DEALS.map((deal) => (
        <View
          key={deal.dealerId}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: deal.borderColor,
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
              <Text style={{ fontSize: 12, fontWeight: '700', color: deal.badgeFg }}>
                {deal.badge}
              </Text>
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
                  marginBottom: deal.cells.length ? spacing.sm : spacing.md,
                }}
              >
                {deal.body}
              </Text>
            ) : null}
            {deal.cells.length > 0 && (
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
                {deal.cells.map((cell) => (
                  <View
                    key={cell.label}
                    style={{
                      flex: 1,
                      backgroundColor: cell.highlight ? colors.successSurface : colors.surface,
                      borderRadius: radii.sm,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: cell.highlight ? colors.success : colors.border,
                      paddingVertical: spacing.sm,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: cell.highlight ? colors.successDeep : colors.textTertiary,
                        marginBottom: 2,
                      }}
                    >
                      {cell.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: cell.highlight ? colors.successDeep : colors.textPrimary,
                      }}
                    >
                      {cell.price}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: cell.highlight ? colors.successDark : colors.textPlaceholder,
                        textDecorationLine: cell.highlight ? 'none' : 'line-through',
                      }}
                    >
                      {cell.was}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Tappable
              onPress={() => claim(deal.dealerId)}
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
      ))}
    </Screen>
  );
}
