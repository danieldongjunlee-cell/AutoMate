import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { AvatarCircle, Badge, Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Reviews'>;

const REVIEWS = [
  { initial: 'MK', color: '#1F49B8', name: 'Maria K.', meta: 'Rear bumper · Apr 2027', stars: 5, helpful: 24, body: "Quoted $330 on AutoMate and that's exactly what I paid — no surprises. Bumper looks brand new and they finished a day early." },
  { initial: 'DT', color: '#16a34a', name: 'Derek T.', meta: 'Oil change · Mar 2027', stars: 4, helpful: 11, body: 'Fast and honest. Waiting room was busy but the work was solid and the deposit was refunded same day.' },
];
const BARS: [number, number][] = [
  [5, 88],
  [4, 9],
  [3, 3],
];

/** Wireframe s-reviews: in-app verified reviews for a shop. */
export function ReviewsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const userReviews = useAppStore((s) => s.reviews);
  return (
    <Screen>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <AvatarCircle initial="H" color={colors.primary} size={34} />
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Honda Fairfax Service</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>In-app reviews from verified AutoMate bookings</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>4.9</Text>
            <Text style={{ color: '#F5B84E', fontSize: 12 }}>★★★★★</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>312 reviews</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            {BARS.map(([n, w]) => (
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
        <PrimaryButton label="★ Write a review" onPress={() => navigation.navigate('WriteReview')} />
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

      {REVIEWS.map((r) => (
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
