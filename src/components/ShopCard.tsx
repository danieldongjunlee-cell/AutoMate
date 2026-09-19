import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { Icon } from './Icon';
import { Storefront } from './Storefront';
import { Tappable } from './Tappable';
import { Dealer } from '../services/mock/data';
import { useAppStore } from '../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../theme';

const PHOTO_H = 150;

/** Accent per shop for the placeholder storefront (teal / blue / lavender / amber cycle). */
const ACCENTS = [palette.teal, palette.primaryLight, palette.lavender, palette.amber];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Shop card (canvas "Quotes received" / "Book a service"): 150px photo (the
 * shop's profile image, or a navy storefront placeholder with its initials),
 * price badge bottom-left, optional BEST PRICE tag, heart bottom-right, then
 * the shop name (18/800) and a meta line. `children` render below the meta
 * (price breakdown, accept button …).
 */
export function ShopCard({
  dealer,
  price,
  meta,
  best,
  index = 0,
  selected,
  onPress,
  children,
}: {
  dealer: Dealer;
  /** "$285" or "from $49". */
  price: string;
  /** "2.1 mi · ★ 4.7 (204) · 1-day repair". */
  meta: string;
  best?: boolean;
  /** Position in the list — picks the placeholder variant/accent. */
  index?: number;
  selected?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const saved = useAppStore((s) => s.savedDealerIds.includes(dealer.id));
  const toggleSaved = useAppStore((s) => s.toggleSavedDealer);
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? colors.primary : colors.border,
        overflow: 'hidden',
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      <Tappable onPress={onPress} disabled={!onPress} noFeedback>
        <View onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))} style={{ height: PHOTO_H, backgroundColor: palette.tileNavy }}>
          {w > 0 ? (
            dealer.photoUrl ? (
              <Image source={{ uri: dealer.photoUrl }} style={{ width: w, height: PHOTO_H }} resizeMode="cover" />
            ) : (
              <Storefront initials={dealer.initial.length > 1 ? dealer.initial : initialsOf(dealer.name)} accent={accent} variant={(index % 2) as 0 | 1} width={w} height={PHOTO_H} />
            )
          ) : null}
          {best ? (
            <View style={{ position: 'absolute', left: 12, top: 12, backgroundColor: '#11271c', borderWidth: 1, borderColor: '#1d5a3c', borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: palette.mint }}>BEST PRICE</Text>
            </View>
          ) : null}
          <View style={{ position: 'absolute', left: 12, bottom: 12, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{price}</Text>
          </View>
          <Tappable
            onPress={() => toggleSaved(dealer.id)}
            hitSlop={8}
            accessibilityLabel={saved ? 'Unsave shop' : 'Save shop'}
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: 'rgba(10,15,25,.75)',
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="heart" size={18} color={saved ? palette.danger : colors.textPrimary} strokeWidth={1.8} filled={saved} />
          </Tappable>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 2 }} numberOfLines={1}>
          {dealer.name}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary, paddingHorizontal: 14, paddingBottom: children ? 6 : 14 }} numberOfLines={2}>
          {meta}
        </Text>
      </Tappable>
      {children ? <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>{children}</View> : null}
    </View>
  );
}
