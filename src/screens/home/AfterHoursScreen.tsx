import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
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
  icon: string;
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
        <Text style={{ fontSize: 13, color: '#fff' }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontSize: 10,
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
  const primaryPart = damageParts[0]?.part ?? 'Rear bumper';

  return (
    <Screen>
      {/* Dark after-hours card */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid]}
        style={{
          borderRadius: radii.md,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: 'rgba(239,159,39,.35)',
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 30 }}>🌙</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>
              Submitted at 11:48 PM
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
              Most auto shops are now closed
            </Text>
          </View>
          <View
            style={{
              borderRadius: radii.pill,
              paddingHorizontal: 10,
              paddingVertical: 3,
              backgroundColor: 'rgba(239,159,39,.2)',
              borderWidth: 1,
              borderColor: 'rgba(239,159,39,.35)',
            }}
          >
            <Text style={{ fontSize: 12, color: palette.warning }}>After hours</Text>
          </View>
        </View>

        {/* AI rec (Pro) on dark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: radii.sm,
              backgroundColor: palette.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </View>
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: '#fff' }}>
            AI Repair Recommendation
          </Text>
          <View
            style={{
              backgroundColor: 'rgba(127,119,221,.35)',
              borderWidth: 0.5,
              borderColor: 'rgba(127,119,221,.6)',
              borderRadius: radii.pill,
              paddingHorizontal: 10,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: palette.primaryLight }}>Pro</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: 'rgba(127,119,221,.18)',
            borderRadius: radii.sm,
            borderWidth: 0.5,
            borderColor: 'rgba(127,119,221,.4)',
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: 'rgba(175,169,236,.9)',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.7,
              marginBottom: 4,
            }}
          >
            AI analysis result
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
            {primaryPart} dent — DIY feasible ✔
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
              Shallow dent · Paint intact ·
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(29,158,117,.3)',
                borderWidth: 0.5,
                borderColor: 'rgba(29,158,117,.4)',
                borderRadius: radii.pill,
                paddingHorizontal: 8,
                paddingVertical: 1,
              }}
            >
              <Text style={{ fontSize: 11, color: palette.successLight }}>
                87% confidence
              </Text>
            </View>
          </View>
        </View>

        {isPro ? (
          // Pro members see the matched DIY methods unlocked.
          <View>
            <DiyGuideRow onDark level="EASY" title="Boiling water dent method" meta="3 steps · ~8 min · No tools needed" />
            <DiyGuideRow onDark level="MED" title="Plunger pull method" meta="4 steps · ~12 min · Plunger required" />
          </View>
        ) : (
          <ProLockOverlay
            onDark
            subtitle="Unlock AI-matched DIY guides based on your damage photos"
            onUnlock={() => navigateCrossTab(navigation, 'HomeTab', 'DiyUnlock', { returnTo: 'DealerQuotes' })}
          >
            <DiyGuideRow onDark level="EASY" title="Boiling water dent method" meta="3 steps · ~8 min · No tools needed" />
            <DiyGuideRow onDark level="MED" title="Plunger pull method" meta="4 steps · ~12 min · Plunger required" />
          </ProLockOverlay>
        )}

        {/* Quote timeline */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,.06)',
            borderRadius: radii.sm,
            padding: spacing.md,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,.45)',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: spacing.md,
            }}
          >
            Quote timeline
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <TimelineNode icon="✓" label={'11:48 PM\nSent'} state="done" />
            <View style={{ flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,.1)', marginTop: 16, marginHorizontal: 6 }} />
            <TimelineNode icon="🔔" label={'8:00 AM\nOpens'} state="next" />
            <View style={{ flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,.1)', marginTop: 16, marginHorizontal: 6 }} />
            <TimelineNode icon="💬" label={'~10 AM\nQuotes'} state="later" />
          </View>
        </View>

        <Text style={{ fontSize: 13, color: palette.warning, lineHeight: 19 }}>
          📋 Your photos are queued. Dealers review when they open.
        </Text>
      </LinearGradient>

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
