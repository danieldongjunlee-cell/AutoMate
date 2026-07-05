import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HowItWorks'>;

const STEPS = [
  { emoji: '📷', title: 'Take damage photos', sub: 'Tap the part, snap a few angles', tint: '#2e6bff' },
  { emoji: '💬', title: 'Get quotes from many shops', sub: 'Real prices in 1–3 hours', tint: '#16a34a' },
  { emoji: '⚖️', title: 'Compare cash vs insurance', sub: 'See the cheaper way, side by side', tint: '#E2A33B' },
  { emoji: '📅', title: 'Book & pay the shop later', sub: 'No upfront payment', tint: '#7F77DD' },
];

/** Wireframe s-how-it-works: 4-step visual explainer. */
export function HowItWorksScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  return (
    <Screen>
      <LinearGradient
        colors={[palette.navyMid, palette.navyDeep]}
        style={{ borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff' }}>4 steps to a fixed car</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Real quotes · no upfront payment</Text>
      </LinearGradient>

      {STEPS.map((s, i) => (
        <View key={s.title} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i === STEPS.length - 1 ? 0 : 4 }}>
          {/* Icon + number, with a connector line down to the next step */}
          <View style={{ alignItems: 'center', width: 64 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: s.tint + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 26 }}>{s.emoji}</Text>
              <View
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: s.tint,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.background,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>{i + 1}</Text>
              </View>
            </View>
            {i < STEPS.length - 1 ? (
              <View style={{ width: 2, height: 26, backgroundColor: colors.border }} />
            ) : null}
          </View>
          <View style={{ flex: 1, paddingBottom: i < STEPS.length - 1 ? 26 : 0, marginLeft: spacing.sm }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{s.title}</Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 1 }}>{s.sub}</Text>
          </View>
        </View>
      ))}

      <View style={{ marginTop: spacing.lg }}>
        <PrimaryButton variant="success" label="Get my AI estimate →" onPress={() => navigation.navigate('CarDiagram')} />
      </View>
    </Screen>
  );
}
