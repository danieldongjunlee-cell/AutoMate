import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import { SHOP_PHOTOS } from '../assets/shopPhotos';
import { Icon, IconName } from './Icon';
import { STAR_YELLOW } from './RatingLink';
import { Tappable } from './Tappable';
import { Dealer, dealerOpensAt } from '../services/mock/data';
import { palette, radii, spacing, useTheme } from '../theme';
import { callDealer, openDealerReviews, openDealerWebsite, openDirections } from '../utils/links';

const OPEN_GREEN = '#34C759';
const PHOTO_W = 156;
const PHOTO_H = 132;

export interface RowAction {
  label: string;
  icon: IconName;
  onPress: () => void;
  /** Filled (primary) chip. */
  primary?: boolean;
}

/** Open / Closes soon / Closed, coloured like a maps app. */
export function OpenStatus({ dealer, size = 15 }: { dealer: Dealer; size?: number }) {
  const { colors } = useTheme();
  const status =
    dealer.openStatus === 'Closed'
      ? { text: 'Closed', color: palette.danger, rest: `Opens ${dealerOpensAt(dealer)}` }
      : dealer.openStatus === 'Closes soon'
        ? { text: 'Closes soon', color: palette.amber, rest: `Closes ${dealer.closesAt}` }
        : { text: 'Open', color: OPEN_GREEN, rest: `Closes ${dealer.closesAt}` };
  return (
    <Text style={{ fontSize: size, color: colors.textSecondary }}>
      <Text style={{ fontWeight: '700', color: status.color }}>{status.text}</Text> · {status.rest} · {dealer.distanceMi} mi
    </Text>
  );
}

/** "4.9 ★ (312)" with a yellow star. */
export function RatingLine({ dealer, tags, size = 15 }: { dealer: Dealer; tags?: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: size, color: colors.textSecondary }}>
      <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{dealer.rating.toFixed(1)}</Text>
      <Text style={{ color: STAR_YELLOW }}> ★ </Text>({dealer.reviews}){tags ? ` · ${tags}` : ''}
    </Text>
  );
}

/**
 * A shop as a maps-app result row: name, rating line (yellow star), open /
 * closed line, a strip of photos, an optional callout box and a row of action
 * chips (Directions · Call · Website · …). Rows sit on the sheet, separated by
 * a thick divider.
 */
export function ShopListRow({
  dealer,
  index = 0,
  tags,
  selected,
  onPress,
  callout,
  actions = [],
  children,
}: {
  dealer: Dealer;
  /** Position in the list — picks which bundled photos show when the shop has none. */
  index?: number;
  /** "Oil · Tires · Filters" or "Body · Paint". */
  tags?: string;
  selected?: boolean;
  onPress?: () => void;
  /** Highlighted box under the photos (price for your services, the shop's quote …). */
  callout?: { title: string; body?: string; button?: string; onPress?: () => void };
  /** Extra action chips after Directions · Call · Website. */
  actions?: RowAction[];
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const photos = [0, 1, 2].map((i) => SHOP_PHOTOS[(index + i) % SHOP_PHOTOS.length]);

  const chip = (a: RowAction, key: string) => (
    <Tappable
      key={key}
      onPress={a.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${a.label} ${dealer.name}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: radii.pill,
        backgroundColor: a.primary ? colors.primary : colors.inputBg,
        borderWidth: 1,
        borderColor: a.primary ? colors.primary : colors.border,
      }}
    >
      <Icon name={a.icon} size={18} color={a.primary ? colors.onPrimary : colors.primaryDark} strokeWidth={1.9} />
      <Text style={{ fontSize: 15, fontWeight: '700', color: a.primary ? colors.onPrimary : colors.primaryDark }}>{a.label}</Text>
    </Tappable>
  );

  const baseActions: RowAction[] = [
    { label: 'Directions', icon: 'pin', onPress: () => openDirections(dealer) },
    { label: 'Call', icon: 'phone', onPress: () => callDealer(dealer) },
    { label: 'Website', icon: 'globe', onPress: () => openDealerWebsite(dealer) },
    { label: 'Reviews', icon: 'star', onPress: () => openDealerReviews(dealer) },
  ];

  return (
    <View
      style={{
        backgroundColor: selected ? colors.primarySurface : 'transparent',
        borderTopWidth: 8,
        borderTopColor: colors.background,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
      }}
    >
      <Tappable onPress={onPress} disabled={!onPress} noFeedback accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={onPress ? dealer.name : undefined}>
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={{ fontSize: 22, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }} numberOfLines={1}>
            {dealer.name}
          </Text>
          <RatingLine dealer={dealer} tags={tags} />
          <View style={{ marginTop: 3 }}>
            <OpenStatus dealer={dealer} />
          </View>
        </View>

        {/* Photo strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8, paddingVertical: spacing.md }}>
          {(dealer.photoUrl ? [{ uri: dealer.photoUrl }, ...photos.slice(0, 2)] : photos).map((src, i) => (
            <Image key={i} source={src} resizeMode="cover" style={{ width: PHOTO_W, height: PHOTO_H, borderRadius: 12, backgroundColor: colors.tileNavy }} />
          ))}
        </ScrollView>
      </Tappable>

      {callout ? (
        <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{callout.title}</Text>
            {callout.body ? <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 3, lineHeight: 18 }}>{callout.body}</Text> : null}
          </View>
          {callout.button ? (
            <Tappable
              onPress={callout.onPress}
              accessibilityRole="button"
              accessibilityLabel={`${callout.button} ${dealer.name}`}
              style={{ backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 10 }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primaryDark }}>{callout.button}</Text>
            </Tappable>
          ) : null}
        </View>
      ) : null}

      {children ? <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>{children}</View> : null}

      {/* Action chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
        {actions.map((a, i) => chip(a, `x${i}`))}
        {baseActions.map((a, i) => chip(a, `b${i}`))}
      </ScrollView>
    </View>
  );
}
