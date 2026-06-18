import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { Card, SectionLabel, Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { MaintStackParamList } from '../../navigation/types';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'DiyUnlock'>;

const BENEFITS = [
  { icon: '📚', title: 'All 12 DIY repair guides', sub: 'Step-by-step with photos · save $100s in labor' },
  { icon: '🤖', title: 'AI damage-to-guide matching', sub: 'Your photos auto-match to the right DIY guide' },
  { icon: '🛠️', title: 'Tool & parts shopping lists', sub: 'Exact products with price comparisons' },
  { icon: '♾️', title: 'All future guides included', sub: 'New guides added monthly · never pay again' },
];

/** Wireframe s-diy-unlock: DIY guide paywall — included with AutoMate Pro ($48/yr). */
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
            backgroundColor: palette.primary,
            opacity: 0.14,
          }}
        />
        <Text style={{ fontSize: 34, marginBottom: 6 }}>📚</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
          DIY Repair Guides
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,.6)',
            textAlign: 'center',
          }}
        >
          12 step-by-step guides · fix it yourself & save $100s in labor
        </Text>
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

      <SectionLabel>Unlock with AutoMate Pro</SectionLabel>

      {/* Option 2: AutoMate Pro — best value */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.primary,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -9,
            left: spacing.md,
            backgroundColor: colors.primary,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.onPrimary }}>BEST VALUE</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: 4,
            marginBottom: spacing.md,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.sm,
              backgroundColor: colors.primarySurface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>⭐</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
              AutoMate Pro
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              DIY guides + no deposits + priority quotes + 2× points
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
              $48<Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary }}>/yr</Text>
            </Text>
            <Text style={{ fontSize: 11, color: colors.successDark }}>DIY included</Text>
          </View>
        </View>
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'HomeTab', 'ProSubscribe')}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.onPrimary }}>
            Get Pro — includes DIY →
          </Text>
        </Tappable>
      </View>

      <Text style={{ textAlign: 'center', fontSize: 11, color: colors.textTertiary }}>
        30-day money-back guarantee on either option
      </Text>
    </Screen>
  );
}
