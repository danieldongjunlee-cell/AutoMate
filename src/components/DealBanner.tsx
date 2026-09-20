import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';
import { palette, radii, spacing } from '../theme';

/** One service-category discount in a deal (e.g. Oil change · 15% off). */
export interface DealDiscount {
  /** MAINT_CATEGORIES id the discount applies to. */
  categoryId: string;
  label: string;
  pct: number;
}

export interface Deal {
  dealerId: string;
  name: string;
  /** Small pill on the banner ("LIMITED · BUNDLE"). */
  badge: string;
  title: string;
  sub: string;
  /** Banner fill, top-left → bottom-right. */
  gradient: readonly [string, string];
  body?: string;
  /** Per-category percentage discounts the bundle applies. */
  discounts: DealDiscount[];
  cta: string;
  /** Short label shown on the booking once the deal is claimed. */
  claimLabel: string;
  /** Product cut-out shown on the right of the banner (oil bottles, tires …). */
  image: ImageSourcePropType;
}

const IMG_OIL = require('../../assets/deals/oil.png');
const IMG_TIRES = require('../../assets/deals/tires.png');
const IMG_HANDSHAKE = require('../../assets/deals/handshake.png');

/** The partner deals — one source for the Home carousel and "View all deals". */
export const DEALS: Deal[] = [
  {
    dealerId: 'honda-fairfax',
    name: 'Honda Fairfax',
    badge: 'LIMITED · BUNDLE',
    title: 'Honda Fairfax Summer Bundle',
    sub: 'Oil + rotation + 27-pt check · Save $40',
    gradient: ['#E0A93E', '#C2871F'],
    body: 'Summer Bundle · ends Jul 31. Discounts apply automatically when you book at Honda Fairfax.',
    discounts: [
      { categoryId: 'oil', label: 'Oil change', pct: 15 },
      { categoryId: 'tires', label: 'Tire service', pct: 20 },
      { categoryId: 'fluids', label: 'Fluids', pct: 10 },
    ],
    cta: 'Claim this bundle →',
    claimLabel: 'Summer Bundle',
    image: IMG_OIL,
  },
  {
    dealerId: 'autofix-pro',
    name: 'AutoFix Pro',
    badge: '20% OFF',
    title: 'AutoFix Pro — new customer',
    sub: 'Free inspection w/ any oil change',
    gradient: [palette.primary, '#1e4fcc'],
    body: 'New AutoMate customers save on an oil change and a full brake job. Discounts applied automatically at booking.',
    discounts: [
      { categoryId: 'oil', label: 'Oil change', pct: 20 },
      { categoryId: 'brakes', label: 'Brakes', pct: 15 },
    ],
    cta: 'Claim this deal →',
    claimLabel: 'New customer deal',
    image: IMG_HANDSHAKE,
  },
  {
    dealerId: 'vienna-auto',
    name: 'Vienna Auto Care',
    badge: 'SPONSORED',
    title: 'Vienna Auto Care — $30 off',
    sub: 'Brakes, batteries & A/C service',
    gradient: ['#1f9e75', '#13795a'],
    body: 'AutoMate members save on filters and fluid services. Discounts applied automatically at booking.',
    discounts: [
      { categoryId: 'filters', label: 'Filters', pct: 20 },
      { categoryId: 'fluids', label: 'Fluids', pct: 15 },
    ],
    cta: 'Book & save →',
    claimLabel: 'Member deal',
    image: IMG_TIRES,
  },
];

/**
 * Solid, borderless promo banner (filled gradient + white text), like a store
 * coupon card. Compact on Home; `expanded` adds the per-service discount rows,
 * the fine print and the claim button on "View all deals".
 */
export function DealBanner({
  deal,
  expanded,
  highlighted,
  onPress,
  onClaim,
}: {
  deal: Deal;
  expanded?: boolean;
  /** Outline the card (the deal that was tapped on Home). */
  highlighted?: boolean;
  onPress?: () => void;
  onClaim?: () => void;
}) {
  return (
    <Tappable onPress={onPress} disabled={!onPress} noFeedback={!onPress} accessibilityLabel={deal.title}>
      <LinearGradient
        colors={[deal.gradient[0], deal.gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radii.lg,
          paddingHorizontal: spacing.lg,
          paddingVertical: expanded ? spacing.lg : spacing.md,
          minHeight: 104,
          justifyContent: 'center',
          overflow: 'hidden',
          borderWidth: highlighted ? 2 : 0,
          borderColor: '#fff',
        }}
      >
        {/* Product cut-out on the right (oil bottles / tires). */}
        <Image
          source={deal.image}
          resizeMode="contain"
          accessibilityLabel=""
          style={{ position: 'absolute', right: 10, top: 8, width: expanded ? 150 : 128, height: expanded ? 96 : 84 }}
        />
        <View style={{ paddingRight: expanded ? 150 : 130 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 5 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{deal.badge}</Text>
          </View>
          <Text style={{ fontSize: expanded ? 19 : 16, fontWeight: '800', color: '#fff' }}>{deal.title}</Text>
          <Text style={{ fontSize: expanded ? 13 : 12, color: 'rgba(255,255,255,0.82)', marginTop: 1 }}>{deal.sub}</Text>
        </View>

        {expanded ? (
          <>
            <View style={{ marginTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.35)' }}>
              {deal.discounts.map((d) => (
                <View key={d.categoryId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.35)' }}>
                  <Text style={{ fontSize: 15, color: '#fff' }}>{d.label}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{d.pct}% off</Text>
                </View>
              ))}
            </View>
            {deal.body ? <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 17, marginTop: spacing.sm }}>{deal.body}</Text> : null}
            <Tappable
              onPress={onClaim}
              accessibilityRole="button"
              accessibilityLabel={`${deal.cta} ${deal.name}`}
              style={{ marginTop: spacing.md, backgroundColor: '#fff', borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: deal.gradient[1] }}>{deal.cta}</Text>
            </Tappable>
          </>
        ) : null}
      </LinearGradient>
    </Tappable>
  );
}
