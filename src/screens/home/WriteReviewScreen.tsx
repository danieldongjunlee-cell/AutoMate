import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { TextInput, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { AvatarCircle, Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'WriteReview'>;
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/** Wireframe s-write-review: star rating + body for a verified booking. */
export function WriteReviewScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const addReview = useAppStore((s) => s.addReview);
  const requireAuth = useRequireAuth();
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState('');

  const onPost = () => {
    // Posting a review is a value action — guests sign in first.
    if (!requireAuth('writeReview')) return;
    addReview({
      stars,
      body: body.trim() || 'Great experience — the price matched my quote and the work was solid.',
      dealerName: 'Honda Fairfax Service',
      meta: 'Rear bumper · Apr 2027',
    });
    navigation.navigate('Reviews');
  };

  return (
    <Screen>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AvatarCircle initial="H" color={colors.primary} size={26} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Honda Fairfax Service</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>Rear bumper · Apr 12</Text>
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
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 }}>{LABELS[stars]}</Text>
      </View>

      <SectionLabel>Your review</SectionLabel>
      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        placeholder="Was the price what you were quoted? How was the work and the wait?"
        placeholderTextColor={palette.textPlaceholder}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.sm,
          padding: spacing.md,
          minHeight: 96,
          marginBottom: spacing.md,
          backgroundColor: colors.surface,
          fontSize: 14,
          color: colors.textPrimary,
          textAlignVertical: 'top',
        }}
      />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: radii.sm,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: colors.primary }}>+</Text>
          <Text style={{ fontSize: 9, color: colors.textTertiary }}>Photo</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.primarySurface,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Text style={{ fontSize: 14 }}>🎁</Text>
          <Text style={{ fontSize: 12, color: colors.primary, lineHeight: 16 }}>
            Earn <Text style={{ fontWeight: '700' }}>+30 pts</Text> for a review with a photo
          </Text>
        </View>
      </View>

      <PrimaryButton label="Post review →" onPress={onPost} />
    </Screen>
  );
}
