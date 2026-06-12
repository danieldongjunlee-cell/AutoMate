import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { QUOTE_REQUEST } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { DiyGuideRow, ProLockOverlay } from '../../components/ProLockOverlay';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Submitted'>;

export function SubmittedScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const isPro = useAppStore((s) => s.isPro);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const primaryPart = damageParts[0]?.part ?? 'Rear bumper';
  // Live AI analysis from the submit response; wireframe demo values otherwise.
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;
  const confidencePct = aiEstimate?.confidencePct ?? QUOTE_REQUEST.aiConfidencePct;

  return (
    <Screen>
      {/* Success header */}
      <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.successSurface,
            borderWidth: 2.5,
            borderColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 32 }}>✅</Text>
        </View>
        <Text style={{ fontSize: 19, fontWeight: '600', color: colors.successDeep, marginBottom: 3 }}>
          Photos sent to {QUOTE_REQUEST.shopsNotified} shops
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
          Dealers reviewing now · 1–3 hr est. response
        </Text>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}>
        {[
          { big: '1–3 hrs', small: 'Est. response', color: colors.primary },
          { big: `${QUOTE_REQUEST.shopsNotified} shops`, small: 'Notified', color: colors.primary },
          { big: 'Free', small: 'No obligation', color: colors.success },
        ].map(({ big, small, color }) => (
          <View
            key={small}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              paddingVertical: spacing.sm,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color }}>{big}</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{small}</Text>
          </View>
        ))}
      </View>

      {/* Notify banner */}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: palette.warningBorder,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.lg,
        }}
      >
        <Text style={{ fontSize: 22 }}>🔔</Text>
        <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('DealerQuotes')}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.warningDeep }}>
            Notify me when quotes arrive
          </Text>
        </Pressable>
        <Pressable
          onPress={() => Alert.alert('Notifications enabled', "We'll alert you as quotes arrive.")}
          style={({ pressed }) => ({
            backgroundColor: colors.warning,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: 6,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: palette.dark }}>Enable</Text>
        </Pressable>
      </View>

      {/* AI Repair Recommendation (Pro) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: radii.sm,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15 }}>🤖</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
          AI Repair Recommendation
        </Text>
        <Badge label="Pro" variant="primarySoft" />
      </View>

      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: colors.primaryDark,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.7,
            marginBottom: 4,
          }}
        >
          AI analysis result
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primaryDeep, marginBottom: 4 }}>
          {primaryPart} dent — DIY feasible ✔
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            Paint intact · Est. ${priceLow}–${priceHigh} ·{' '}
          </Text>
          <Badge label={`${confidencePct}% confidence`} variant="success" />
        </View>
      </View>

      {isPro ? (
        // Pro members see the matched DIY methods unlocked.
        <View>
          <DiyGuideRow level="EASY" title="Boiling water dent method" meta="3 steps · ~8 min · No tools needed" showLink />
          <DiyGuideRow level="MED" title="Plunger pull method" meta="4 steps · ~12 min · Plunger required" showLink />
        </View>
      ) : (
        <ProLockOverlay
          subtitle="Unlock AI-matched DIY guides based on your damage photos"
          onUnlock={() => navigateCrossTab(navigation, 'MaintTab', 'DiyUnlock')}
        >
          <DiyGuideRow level="EASY" title="Boiling water dent method" meta="3 steps · ~8 min · No tools needed" showLink />
          <DiyGuideRow level="MED" title="Plunger pull method" meta="4 steps · ~12 min · Plunger required" showLink />
        </ProLockOverlay>
      )}
    </Screen>
  );
}
