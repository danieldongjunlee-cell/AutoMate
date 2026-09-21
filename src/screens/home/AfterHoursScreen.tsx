import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { View } from 'react-native';

import { Text } from '../../components/Text';

import { Icon, IconName } from '../../components/Icon';
import { AiEstimateCard } from '../../components/AiEstimateCard';
import { QuoteTimeline } from '../../components/QuoteTimeline';

import { AiRecommendationCard } from '../../components/AiRecommendationCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { QUOTE_REQUEST } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, spacing } from '../../theme';

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
  // Submitted: the request is in, there is nothing to go back to, the header's back button goes.
  useLayoutEffect(() => {
    navigation.setOptions({ headerBackVisible: false, headerLeft: () => null, gestureEnabled: false });
  }, [navigation]);
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const primaryPart = damageParts[0]?.part ?? 'Rear bumper';
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
            note="Submitted after hours · your photos are queued and shops review them when they open."
          />
        }
      />
      {/* AI Repair Recommendation: the shared card, collapsed. */}
      <AiRecommendationCard primaryPart={primaryPart} style={{ marginBottom: spacing.md }} />

      <PrimaryButton
        label="View available quotes →"
        onPress={() => navigation.navigate('DealerQuotes')}
        style={{ marginBottom: spacing.sm }}
      />
      <PrimaryButton label="Back to home" variant="muted" onPress={() => navigation.navigate('HomeLauncher')} />
    </Screen>
  );
}
