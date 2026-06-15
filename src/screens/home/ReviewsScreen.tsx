import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { AvatarCircle, Badge, Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById } from '../../services/mock/data';
import { shopReviews } from '../../services/mock/reviewsData';
import { useAppStore } from '../../store/useAppStore';
import { spacing, useTheme } from '../../theme';
import { useT } from '../../i18n';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Reviews'>;
type Route = RouteProp<HomeStackParamList, 'Reviews'>;

/** Wireframe s-reviews: in-app verified reviews for the selected shop. */
export function ReviewsScreen() {
  const navigation = useNavigation<Nav>();
  const { dealerId } = useRoute<Route>().params ?? {};
  const { colors } = useTheme();
  const t = useT();
  const userReviews = useAppStore((s) => s.reviews);
  // You can only review a shop you've completed a service/booking with.
  const hasCompletedService = useAppStore((s) => s.bookings.length > 0);

  const shop = shopReviews(dealerId);
  const dealer = dealerById(dealerId);
  const bars: [number, number][] = [
    [5, shop.distribution.five],
    [4, shop.distribution.four],
    [3, shop.distribution.three],
  ];

  return (
    <Screen>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <AvatarCircle initial={dealer.initial} color={dealer.color} size={34} />
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{shop.name}</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>In-app reviews from verified AutoMate bookings</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>{shop.ratingAvg}</Text>
            <Text style={{ color: '#F5B84E', fontSize: 12 }}>★★★★★</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>{shop.ratingCount} reviews</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            {bars.map(([n, w]) => (
              <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontSize: 11, color: colors.textTertiary, width: 10 }}>{n}</Text>
                <View style={{ flex: 1, height: 4, backgroundColor: colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ width: `${w}%`, height: '100%', backgroundColor: '#F5B84E' }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </Card>

      <View style={{ marginBottom: spacing.md }}>
        {hasCompletedService ? (
          <PrimaryButton label={`★ ${t('Write a review')}`} onPress={() => navigation.navigate('WriteReview', { dealerId })} />
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 10,
              padding: spacing.md,
            }}
          >
            <Text style={{ fontSize: 16 }}>🔒</Text>
            <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary }}>
              You can write a review once you've completed a service with this shop.
            </Text>
          </View>
        )}
      </View>

      {userReviews.map((r) => (
        <Card key={r.id} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <AvatarCircle initial="JD" color={colors.primary} size={24} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>You</Text>
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>{r.meta}</Text>
            </View>
            <Badge label="✓ Verified" variant="success" />
          </View>
          <Text style={{ color: '#F5B84E', fontSize: 13, marginBottom: 3 }}>
            {'★'.repeat(r.stars)}
            {'☆'.repeat(5 - r.stars)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>{r.body}</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: spacing.xs }}>👍 Helpful (0)</Text>
        </Card>
      ))}

      {shop.reviews.map((r) => (
        <Card key={r.name} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <AvatarCircle initial={r.initial} color={r.color} size={24} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{r.name}</Text>
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>{r.meta}</Text>
            </View>
            <Badge label="✓ Verified" variant="success" />
          </View>
          <Text style={{ color: '#F5B84E', fontSize: 13, marginBottom: 3 }}>
            {'★'.repeat(r.stars)}
            {'☆'.repeat(5 - r.stars)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>{r.body}</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: spacing.xs }}>👍 Helpful ({r.helpful})</Text>
        </Card>
      ))}
    </Screen>
  );
}
