import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Icon } from './Icon';
import { IconChip } from './IconChip';
import { DiyGuideRow, ProLockOverlay } from './ProLockOverlay';
import { Tappable } from './Tappable';
import { Text } from './Text';
import { Badge } from './ui';
import { navigateCrossTab } from '../navigation/crossTab';
import { useAppStore } from '../store/useAppStore';
import { radii, spacing, useTheme } from '../theme';

/** The two DIY methods the AI matches to a dent. */
const METHODS = [
  { level: 'EASY' as const, title: 'Boiling water dent method', meta: '7 steps · ~15 min · Boiling water + plunger' },
  { level: 'MED' as const, title: 'Plunger pull method', meta: '6 steps · ~12 min · Plunger required' },
];

/**
 * "AI Repair Recommendation": a collapsed card with the Pro badge; opened, it
 * names the part and lists the matched DIY methods, unlocked for Pro members
 * and behind the Pro lock for everyone else. Shared by the submitted, after
 * hours and quotes screens so a Pro member finds it wherever the estimate is.
 */
export function AiRecommendationCard({
  primaryPart,
  onReadGuide,
  returnTo = 'DealerQuotes',
  style,
}: {
  primaryPart: string;
  /** Pro members: open a guide by title. Defaults to the DIY guides screen. */
  onReadGuide?: (title: string) => void;
  /** Where the Pro unlock flow returns to. */
  returnTo?: 'DealerQuotes' | 'MaintDashboard';
  style?: object;
}) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const isPro = useAppStore((s) => s.isPro);
  // Starts collapsed; the estimate is what leads.
  const [open, setOpen] = useState(false);
  const readGuide = (title: string) => (onReadGuide ? onReadGuide(title) : navigateCrossTab(navigation, 'HomeTab', 'MaintDiy'));

  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md }, style]}>
      <Tappable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="AI Repair Recommendation"
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
      >
        <IconChip name="sparkle" size={36} glyph={22} color={colors.primaryDark} />
        <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>AI Repair Recommendation</Text>
        <Badge label="Pro" variant="primarySoft" />
        <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}>
          <Icon name="chevron" size={18} color={colors.textTertiary} strokeWidth={2} />
        </View>
      </Tappable>

      {open ? (
        <>
          <View style={{ backgroundColor: colors.primarySurface, borderRadius: radii.sm, padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>{primaryPart} · DIY feasible</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Matched DIY methods for this repair</Text>
          </View>
          {isPro ? (
            <View>
              {METHODS.map((m) => (
                <DiyGuideRow key={m.title} level={m.level} title={m.title} meta={m.meta} showLink onReadGuide={() => readGuide(m.title)} />
              ))}
            </View>
          ) : (
            <ProLockOverlay
              subtitle="Unlock AI-matched DIY guides based on your damage photos"
              onUnlock={() => navigateCrossTab(navigation, 'HomeTab', 'DiyUnlock', { returnTo })}
            >
              {METHODS.map((m) => (
                <DiyGuideRow key={m.title} level={m.level} title={m.title} meta={m.meta} showLink />
              ))}
            </ProLockOverlay>
          )}
        </>
      ) : null}
    </View>
  );
}
