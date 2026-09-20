import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { AiEstimateCard } from '../../components/AiEstimateCard';
import { QuoteTimeline } from '../../components/QuoteTimeline';
import { IconChip } from '../../components/IconChip';
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
  // The recommendation starts collapsed; the estimate is what leads.
  const [recOpen, setRecOpen] = useState(false);
  const primaryPart = damageParts[0]?.part ?? 'Rear bumper';
  // Live AI analysis from the submit response; wireframe demo values otherwise.
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;

  return (
    <Screen>
      <SubmitProgress step={3} left="Submitted" right="Done" />
      {/* Estimate, submission timeline and the response window read as one box. */}
      <AiEstimateCard
        priceLow={priceLow}
        priceHigh={priceHigh}
        points={damageParts.reduce((n, p) => n + (p.photos || 1), 0)}
        style={{ marginBottom: spacing.lg }}
        footer={
          <QuoteTimeline
            steps={[
              { icon: 'check', time: 'Now', label: 'Sent', state: 'done' },
              { icon: 'search', time: '~30 min', label: 'Reviewing', state: 'next' },
              { icon: 'chat', time: '1–3 hr', label: 'Quotes', state: 'later' },
            ]}
            note={`Photos sent to ${QUOTE_REQUEST.shopsNotified} shops · free, no obligation · 1–3 hr est. response`}
          />
        }
      />
      {/* AI Repair Recommendation first (the estimate leads), then the submission status.
          Header, analysis and DIY guides consolidated
          into a single card so the screen reads as one block instead of many. */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <Tappable
          onPress={() => setRecOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: recOpen }}
          accessibilityLabel="AI Repair Recommendation"
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <IconChip name="sparkle" size={36} glyph={22} color={colors.primaryDark} />
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
            AI Repair Recommendation
          </Text>
          <Badge label="Pro" variant="primarySoft" />
          <View style={{ transform: [{ rotate: recOpen ? '-90deg' : '90deg' }] }}>
            <Icon name="chevron" size={18} color={colors.textTertiary} strokeWidth={2} />
          </View>
        </Tappable>

        {recOpen ? (
        <>
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.sm,
            padding: spacing.md,
            marginTop: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
            {primaryPart} — DIY feasible
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Matched DIY methods for this repair
          </Text>
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
        </>
        ) : null}
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
        })}
      >
        <Icon name="bell" size={22} color={colors.warning} />
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.warningDeep }}>
          {notifyEnabled ? "Alerts on — we'll ping you per quote" : 'Notify me when quotes arrive'}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: notifyEnabled ? palette.mint : colors.warningDeep }}>
          {notifyEnabled ? 'Enabled' : 'Enable'}
        </Text>
      </Tappable>

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
        })}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>Back to home</Text>
      </Tappable>
    </Screen>
  );
}
