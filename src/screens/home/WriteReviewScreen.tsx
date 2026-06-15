import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { AvatarCircle, Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'WriteReview'>;
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/** Wireframe s-write-review: star rating + body for a verified booking. */
export function WriteReviewScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [stars, setStars] = useState(5);

  return (
    <Screen>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AvatarCircle initial="H" color={colors.primary} size={26} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Honda Fairfax Service</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>Rear bumper · Apr 12</Text>
        </View>
        <Badge label="✓ Verified booking" variant="success" />
      </Card>

      <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
        <SectionLabel>Your rating</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Tappable key={n} onPress={() => setStars(n)}>
              <Text style={{ fontSize: 30, color: n <= stars ? '#F5B84E' : colors.border }}>★</Text>
            </Tappable>
          ))}
        </View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 4 }}>{LABELS[stars]}</Text>
      </View>

      <SectionLabel>Your review</SectionLabel>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.sm,
          padding: spacing.md,
          minHeight: 64,
          marginBottom: spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.textPlaceholder }}>
          Was the price what you were quoted? How was the work and the wait?
        </Text>
      </View>

      <PrimaryButton label="Post review →" onPress={() => navigation.navigate('Reviews')} />
    </Screen>
  );
}
