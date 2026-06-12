import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, SectionLabel, Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { PAYMENT_CARD } from '../../services/mock/data';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'DiyUnlock'>;

const BENEFITS = [
  { icon: '📚', title: 'All 12 DIY repair guides', sub: 'Step-by-step with photos · save $100s in labor' },
  { icon: '🤖', title: 'AI damage-to-guide matching', sub: 'Your photos auto-match to the right DIY guide' },
  { icon: '🛠️', title: 'Tool & parts shopping lists', sub: 'Exact products with price comparisons' },
  { icon: '♾️', title: 'All future guides included', sub: 'New guides added monthly · never pay again' },
];

/** Wireframe s-diy-unlock: Pro paywall detail ($10 lifetime). */
export function DiyUnlockScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  return (
    <Screen>
      {/* Hero */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radii.lg,
          padding: spacing.lg,
          marginBottom: spacing.md,
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: palette.warning,
            opacity: 0.12,
          }}
        />
        <Text style={{ fontSize: 40, marginBottom: 6 }}>🔓</Text>
        <Text style={{ fontSize: 21, fontWeight: '800', color: '#fff', marginBottom: 3 }}>
          AutoMate Pro
        </Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: spacing.md }}>
          Lifetime access · one-time payment
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 6,
            backgroundColor: 'rgba(239,159,39,.15)',
            borderWidth: 1,
            borderColor: palette.warning,
            borderRadius: radii.pill,
            paddingHorizontal: 22,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#F5B947' }}>$10</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            forever · no subscription
          </Text>
        </View>
      </LinearGradient>

      <SectionLabel>What you get</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {BENEFITS.map((b, i) => (
          <View
            key={b.title}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.md,
              borderBottomWidth: i < BENEFITS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 20 }}>{b.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                {b.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>{b.sub}</Text>
            </View>
            <Text style={{ fontSize: 16, color: colors.success }}>✔</Text>
          </View>
        ))}
      </Card>

      <SectionLabel>Pay with</SectionLabel>
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
          borderRadius: radii.sm,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 18 }}>💳</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.primaryDeep }}>
          Visa ending {PAYMENT_CARD.last4}
        </Text>
        <Text style={{ fontSize: 16, color: colors.primary }}>✔</Text>
      </View>

      <Pressable onPress={() => navigation.navigate('DiyPayment')}>
        {({ pressed }) => (
          <LinearGradient
            colors={[palette.warning, '#F5B947']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: radii.md,
              paddingVertical: 15,
              alignItems: 'center',
              marginBottom: spacing.sm,
              opacity: pressed ? 0.85 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: palette.dark }}>
              Unlock Pro for $10 →
            </Text>
          </LinearGradient>
        )}
      </Pressable>
      <Text style={{ textAlign: 'center', fontSize: 12, color: colors.textTertiary }}>
        One-time charge · 30-day money-back guarantee
      </Text>
    </Screen>
  );
}
