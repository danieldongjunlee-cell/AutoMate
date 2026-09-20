import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { AiEstimateCard } from '../../components/AiEstimateCard';
import { CarSwitchChip } from '../../components/CarSwitchChip';
import { Icon } from '../../components/Icon';
import { IconChip } from '../../components/IconChip';
import { PrimaryButton } from '../../components/PrimaryButton';
import { QuotesSheet } from '../../components/QuotesSheet';
import { Tappable } from '../../components/Tappable';
import { navigateCrossTab } from '../../navigation/crossTab';
import { QuotesStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<QuotesStackParamList, 'Quotes'>;

/**
 * Quotes tab in a maps-app layout: the map of quoting shops fills the screen
 * and a draggable sheet lists them — AI estimate strip, filter chips (Sort by
 * · Open now · Parts · Distance) and one result row per shop with its quote.
 */
export function QuotesReceivedScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const resetDamageFlow = useAppStore((s) => s.resetDamageFlow);
  const setQuotesViewed = useAppStore((s) => s.setQuotesViewed);
  // Guests see the AI estimate + their submitted parts, but the real shop quotes
  // stay empty until they sign up / log in.
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const requireAuth = useRequireAuth();

  // Opening this tab clears the unread-quotes badge.
  useEffect(() => {
    setQuotesViewed(true);
  }, [setQuotesViewed]);

  const hasRequest = damageParts.length > 0;

  const onCancel = () =>
    confirmAction(
      'Cancel this quote?',
      'Your current quote will be cleared so you can add more damaged parts and submit a fresh request.',
      () => {
        resetDamageFlow();
        navigateCrossTab(navigation, 'HomeTab', 'CarDiagram');
      },
      'Cancel & edit parts',
    );

  // No active request → prompt to start one.
  if (!hasRequest) {
    return (
      <Screen safeTop>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3, marginBottom: spacing.lg }}>Quotes</Text>
        <Card style={{ padding: spacing.xl, alignItems: 'center', borderRadius: radii.tile }}>
          <IconChip name="tag" size={64} glyph={34} color={colors.primaryDark} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md }}>No active quote</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg, lineHeight: 20 }}>
            Submit a damaged part for an AI estimate and nearby shops will send quotes here.
          </Text>
          <PrimaryButton label="Get an AI estimate →" onPress={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')} />
        </Card>
      </Screen>
    );
  }

  /** AI estimate strip + add / cancel — shared by the guest and signed-in views. */
  const estimateBlock = (
    <>
      {aiEstimate ? (
        <AiEstimateCard
          priceLow={aiEstimate.priceLow}
          priceHigh={aiEstimate.priceHigh}
          points={damageParts.reduce((n, p) => n + (p.photos || 1), 0)}
          style={{ marginBottom: spacing.md }}
        />
      ) : null}

      {/* Add parts / revise + cancel */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')}
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: 10 }}
        >
          <Icon name="plus" size={16} color={colors.primaryDark} strokeWidth={2.2} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDark }}>Add or revise parts</Text>
        </Tappable>
        <Tappable onPress={onCancel} style={{ backgroundColor: colors.dangerSurface, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: radii.md, paddingVertical: 10, paddingHorizontal: spacing.md, justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.danger }}>Cancel</Text>
        </Tappable>
      </View>
    </>
  );

  // Guest who submitted but hasn't signed up — quotes stay locked.
  if (!isAuthenticated) {
    return (
      <Screen safeTop>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 }}>Your estimate</Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>Sign up to get real quotes</Text>
          </View>
          <CarSwitchChip />
        </View>
        <View style={{ marginBottom: spacing.lg }}>{estimateBlock}</View>
        <Card style={{ padding: spacing.xl, alignItems: 'center', borderRadius: radii.tile }}>
          <IconChip name="lock" size={64} glyph={34} color={palette.amber} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md, marginBottom: 4, textAlign: 'center' }}>Sign up to see your quotes</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 }}>
            Nearby shops are ready to send real quotes for your submitted parts. Sign up or log in to view them.
          </Text>
          <PrimaryButton label="Sign up or log in →" onPress={() => requireAuth('unlockQuotes')} />
        </Card>
      </Screen>
    );
  }

  return (
    <QuotesSheet
      headerRight={<CarSwitchChip />}
      onAccept={(dealerId) => navigateCrossTab(navigation, 'HomeTab', 'AcceptBooking', { dealerId })}
      onRevise={() => navigateCrossTab(navigation, 'HomeTab', 'CarDiagram')}
      onCancel={onCancel}
    />
  );
}
