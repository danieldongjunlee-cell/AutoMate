import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../../components/Text';

import { Icon } from '../../components/Icon';
import { AiEstimateCard } from '../../components/AiEstimateCard';
import { QuoteTimeline } from '../../components/QuoteTimeline';
import { Tappable } from '../../components/Tappable';

import { AiRecommendationCard } from '../../components/AiRecommendationCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { SubmitProgress } from '../../components/SubmitProgress';
import { HomeStackParamList } from '../../navigation/types';
import { QUOTE_REQUEST } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { DiyGuideSheet } from '../maint/DiyProScreens';
import { DiyGuide, matchGuide } from '../../services/mock/diyGuides';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Submitted'>;

export function SubmittedScreen() {
  const navigation = useNavigation<Nav>();
  // Submitted: the request is in, there is nothing to go back to, the header's back button goes.
  useLayoutEffect(() => {
    navigation.setOptions({ headerBackVisible: false, headerLeft: () => null, gestureEnabled: false });
  }, [navigation]);
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  // Quote-alert opt-in (mock push permission, flips the banner state).
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  // The DIY guide opened from an "AI Repair Recommendation" row.
  const [guide, setGuide] = useState<DiyGuide | null>(null);
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
      {/* AI Repair Recommendation: the shared card, collapsed; Pro members read the matched guides here. */}
      <AiRecommendationCard primaryPart={primaryPart} onReadGuide={(title) => setGuide(matchGuide(title))} style={{ marginBottom: spacing.lg }} />

      {/* Notify banner · slimmed to a single tappable row. */}
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
          {notifyEnabled ? "Alerts on · we'll ping you per quote" : 'Notify me when quotes arrive'}
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
      <PrimaryButton label="Back to home" variant="muted" onPress={() => navigation.navigate('HomeLauncher')} />
    </Screen>
  );
}
