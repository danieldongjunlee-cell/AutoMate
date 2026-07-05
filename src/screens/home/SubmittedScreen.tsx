import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Badge, Screen } from '../../components/ui';
import { SubmitProgress } from '../../components/SubmitProgress';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { QUOTE_REQUEST } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { DiyGuideRow, ProLockOverlay } from '../../components/ProLockOverlay';
import { DiyGuideSheet } from '../maint/DiyProScreens';
import { DiyGuide, matchGuide } from '../../services/mock/diyGuides';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Submitted'>;

export function SubmittedScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const isPro = useAppStore((s) => s.isPro);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  // Quote-alert opt-in (mock push permission — flips the banner state).
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  // The DIY guide opened from an "AI Repair Recommendation" row.
  const [guide, setGuide] = useState<DiyGuide | null>(null);
  const primaryPart = damageParts[0]?.part ?? 'Rear bumper';
  // Live AI analysis from the submit response; wireframe demo values otherwise.
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;
  const confidencePct = aiEstimate?.confidencePct ?? QUOTE_REQUEST.aiConfidencePct;

  return (
    <Screen>
      <SubmitProgress step={3} left="Submitted" right="Done 🎉" />
      {/* Success header — the key facts (free · response time) live here as a
          single subtitle, so the old three-box stat row is no longer needed. */}
      <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
        <Text style={{ fontSize: 40, marginBottom: 4 }}>🎉</Text>
        <Text style={{ fontSize: 19, fontWeight: '700', color: colors.successDeep, marginBottom: 3 }}>
          Photos sent to {QUOTE_REQUEST.shopsNotified} shops
        </Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center' }}>
          Free · no obligation · 1–3 hr est. response
        </Text>
      </View>

      {/* Notify banner — slimmed to a single tappable row. */}
      <Tappable
        onPress={() => setNotifyEnabled(true)}
        disabled={notifyEnabled}
        style={({ pressed }) => ({
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: palette.warningBorder,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontSize: 18 }}>🔔</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.warningDeep }}>
          {notifyEnabled ? "Alerts on — we'll ping you per quote" : 'Notify me when quotes arrive'}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: notifyEnabled ? colors.success : colors.warningDeep }}>
          {notifyEnabled ? 'Enabled ✓' : 'Enable'}
        </Text>
      </Tappable>

      {/* AI Repair Recommendation — header, analysis and DIY guides consolidated
          into a single card so the screen reads as one block instead of many. */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
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
            padding: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primaryDeep, marginBottom: 6 }}>
            {primaryPart} dent — DIY feasible ✔
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>
              Paint intact · Est. ${priceLow}–${priceHigh} ·{' '}
            </Text>
            <Badge label={`${confidencePct}% confidence`} variant="success" />
          </View>
        </View>

        {isPro ? (
          // Pro members see the matched DIY methods unlocked.
          <View>
            <DiyGuideRow
              level="EASY"
              title="Boiling water dent method"
              meta="7 steps · ~15 min · Boiling water + plunger"
              showLink
              onReadGuide={() => setGuide(matchGuide('Boiling water dent method'))}
            />
            <DiyGuideRow
              level="MED"
              title="Plunger pull method"
              meta="6 steps · ~12 min · Plunger required"
              showLink
              onReadGuide={() => setGuide(matchGuide('Plunger pull method'))}
            />
          </View>
        ) : (
          <ProLockOverlay
            subtitle="Unlock AI-matched DIY guides based on your damage photos"
            onUnlock={() => navigateCrossTab(navigation, 'HomeTab', 'DiyUnlock', { returnTo: 'DealerQuotes' })}
          >
            <DiyGuideRow level="EASY" title="Boiling water dent method" meta="7 steps · ~15 min · Boiling water + plunger" showLink />
            <DiyGuideRow level="MED" title="Plunger pull method" meta="6 steps · ~12 min · Plunger required" showLink />
          </ProLockOverlay>
        )}
      </View>

      {guide ? <DiyGuideSheet guide={guide} onClose={() => setGuide(null)} /> : null}

      {/* Bottom actions grouped together. */}
      <PrimaryButton
        label="View available quotes →"
        onPress={() => navigation.navigate('DealerQuotes')}
        style={{ marginBottom: spacing.sm }}
      />
      <Tappable
        onPress={() => navigation.navigate('HomeLauncher')}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingVertical: 13,
          alignItems: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>Back to home</Text>
      </Tappable>
    </Screen>
  );
}
