import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, IconName } from '../../components/Icon';
import { AiEstimateCard } from '../../components/AiEstimateCard';
import { QuoteTimeline } from '../../components/QuoteTimeline';
import { IconChip } from '../../components/IconChip';
import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { QUOTE_REQUEST } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { DiyGuideRow, ProLockOverlay } from '../../components/ProLockOverlay';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AfterHours'>;

/** Timeline node on the dark after-hours card. */
function TimelineNode({
  icon,
  label,
  state,
}: {
  icon: IconName;
  label: string;
  state: 'done' | 'next' | 'later';
}) {
  const ring =
    state === 'done'
      ? { backgroundColor: palette.primary, borderWidth: 0 }
      : state === 'next'
        ? { backgroundColor: 'rgba(239,159,39,.2)', borderWidth: 2, borderColor: palette.warning }
        : {
            backgroundColor: 'rgba(255,255,255,.06)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,.3)',
            borderStyle: 'dashed' as const,
          };
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
          ...ring,
        }}
      >
        <Icon name={icon} size={16} color="#fff" strokeWidth={2} />
      </View>
      <Text
        style={{
          fontSize: 11,
          color: state === 'next' ? palette.warning : 'rgba(255,255,255,.45)',
          fontWeight: state === 'next' ? '600' : '400',
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function AfterHoursScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const isPro = useAppStore((s) => s.isPro);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const primaryPart = damageParts[0]?.part ?? 'Rear bumper';
  // The recommendation starts collapsed; the estimate is what leads.
  const [recOpen, setRecOpen] = useState<boolean>(false);
  const priceLow = aiEstimate?.priceLow ?? QUOTE_REQUEST.priceRange.low;
  const priceHigh = aiEstimate?.priceHigh ?? QUOTE_REQUEST.priceRange.high;

  return (
    <Screen>
      {/* Estimate, after-hours timeline and the response window read as one box. */}
      <AiEstimateCard
        priceLow={priceLow}
        priceHigh={priceHigh}
        points={damageParts.reduce((n, p) => n + (p.photos || 1), 0)}
        style={{ marginBottom: spacing.lg }}
        footer={
          <QuoteTimeline
            steps={[
              { icon: 'check', time: '11:48 PM', label: 'Sent', state: 'done' },
              { icon: 'bell', time: '8:00 AM', label: 'Shops open', state: 'next' },
              { icon: 'chat', time: '~10 AM', label: 'Quotes', state: 'later' },
            ]}
            note="Submitted after hours — your photos are queued and shops review them when they open."
          />
        }
      />
      {/* AI Repair Recommendation — its own card, shown first. */}
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <Tappable
          onPress={() => setRecOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: recOpen }}
          accessibilityLabel="AI Repair Recommendation"
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <IconChip name="sparkle" size={36} glyph={22} color={colors.primaryDark} />
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>AI Repair Recommendation</Text>
          <View style={{ backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primaryDark }}>Pro</Text>
          </View>
          <View style={{ transform: [{ rotate: recOpen ? '-90deg' : '90deg' }] }}>
            <Icon name="chevron" size={18} color={colors.textTertiary} strokeWidth={2} />
          </View>
        </Tappable>
        {recOpen ? (
        <>
        <View style={{ backgroundColor: colors.primarySurface, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>{primaryPart} — DIY feasible</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Matched DIY methods for this repair</Text>
        </View>
        {isPro ? (
          <View>
            <DiyGuideRow level="EASY" title="Boiling water dent method" meta="3 steps · ~8 min · No tools needed" />
            <DiyGuideRow level="MED" title="Plunger pull method" meta="4 steps · ~12 min · Plunger required" />
          </View>
        ) : (
          <ProLockOverlay
            subtitle="Unlock AI-matched DIY guides based on your damage photos"
            onUnlock={() => navigateCrossTab(navigation, 'HomeTab', 'DiyUnlock', { returnTo: 'DealerQuotes' })}
          >
            <DiyGuideRow level="EASY" title="Boiling water dent method" meta="3 steps · ~8 min · No tools needed" />
            <DiyGuideRow level="MED" title="Plunger pull method" meta="4 steps · ~12 min · Plunger required" />
          </ProLockOverlay>
        )}
        </>
        ) : null}
      </View>

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
