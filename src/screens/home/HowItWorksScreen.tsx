import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HowItWorks'>;

const STEPS: [string, string, string][] = [
  ['📷', 'Snap a few damage photos', 'Pick the damaged part on the car diagram, then shoot 3 angles in good light. Add an optional note. Our AI gives an instant estimate range.'],
  ['⚖️', 'Compare real shop quotes', 'Nearby shops send real quotes in 1–3 hours. Compare price, distance, parts and verified ratings on a map — cash vs insurance side by side.'],
  ['📅', 'Book & pay the shop later', 'Reserve with a small refundable deposit (waived for Pro) and pay the shop after the work. Reschedule or cancel up to 12h ahead.'],
];

/** Wireframe s-how-it-works: the 3-step explainer. */
export function HowItWorksScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  return (
    <Screen>
      <LinearGradient
        colors={[palette.navyMid, palette.navyDeep]}
        style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
      >
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff', textAlign: 'center' }}>
          Real quotes. No upfront payment.
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.62)', textAlign: 'center' }}>
          From photo to booked repair in three steps.
        </Text>
      </LinearGradient>
      {STEPS.map(([emoji, title, body], i) => (
        <Card key={title} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
              {emoji} {title}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 19 }}>{body}</Text>
        </Card>
      ))}
      <View style={{ marginTop: spacing.xs }}>
        <PrimaryButton variant="success" label="Get my AI estimate →" onPress={() => navigation.navigate('CarDiagram')} />
      </View>
    </Screen>
  );
}
