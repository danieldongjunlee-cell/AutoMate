import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { DotCarousel } from '../../components/DotCarousel';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeLauncher'>;

/** Wireframe s-home-launcher: the Home tab hub. */
export function HomeLauncherScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const tile = (emoji: string, bg: string, title: string, sub: string, onPress: () => void) => (
    <Tappable
      onPress={onPress}
      style={{ flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md }}
    >
      <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 7 }}>
        <Text style={{ fontSize: 17 }}>{emoji}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
      <Text style={{ fontSize: 11, color: colors.textTertiary }}>{sub}</Text>
    </Tappable>
  );

  const dealCard = (emoji: string, badge: string, title: string, sub: string) => (
    <Tappable
      onPress={() => navigation.navigate('BundleDeals')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm }}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 3 }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: colors.primaryDeep }}>{badge}</Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 11, color: colors.textTertiary }}>{sub}</Text>
      </View>
      <Text style={{ color: colors.primary, fontWeight: '800' }}>→</Text>
    </Tappable>
  );

  const why = (emoji: string, title: string, sub: string) => (
    <Card style={{ flex: 1, padding: spacing.sm }}>
      <Text style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
      <Text style={{ fontSize: 11, color: colors.textTertiary, lineHeight: 15 }}>{sub}</Text>
    </Card>
  );

  return (
    <Screen>
      {/* Greeting + daily check-in */}
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Hi Daniel 👋</Text>
      <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: spacing.md }}>
        What would you like to do today?
      </Text>
      <Tappable
        onPress={() => navigateCrossTab(navigation, 'MoreTab', 'ProfEarn')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.successSurface, borderColor: colors.successLight, borderWidth: 1, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.md }}
      >
        <Text style={{ fontSize: 16 }}>✅</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.successDeep }}>Daily check-in · +10 pts</Text>
          <Text style={{ fontSize: 11, color: colors.successDark }}>🔥 Day 5 streak · 1,240 pts ≈ $12.40 toward a free oil change</Text>
        </View>
        <View style={{ backgroundColor: colors.success, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>Claim</Text>
        </View>
      </Tappable>

      {/* Hero — Get AI estimate */}
      <Tappable onPress={() => navigation.navigate('CarDiagram')}>
        <LinearGradient
          colors={[palette.primary, palette.primaryDark]}
          style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
        >
          <Text style={{ fontSize: 30, marginBottom: 6 }}>📷</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Get an AI Repair Estimate</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginBottom: spacing.sm }}>
            Snap a few photos → local dealers send real quotes → book or call in minutes
          </Text>
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.success, borderRadius: radii.pill, paddingHorizontal: 15, paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Start now →</Text>
          </View>
        </LinearGradient>
      </Tappable>

      {/* Maintenance / Compare */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {tile('🔧', colors.successSurface, 'Maintenance', 'Track & book service', () => navigation.navigate('MaintDashboard'))}
        {tile('⚖️', colors.warningSurface, 'Compare Costs', 'Cash vs insurance', () => navigation.navigate('CompSelect'))}
      </View>

      {/* Deals & offers */}
      <SectionLabel>Deals &amp; offers · Sponsored</SectionLabel>
      <Tappable onPress={() => navigation.navigate('BundleDeals')}>
        <LinearGradient colors={[palette.navyMid, palette.navyDeep]} style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ fontSize: 24 }}>🛢️</Text>
          <View style={{ flex: 1 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: colors.warningSurface, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 3 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: colors.warningDeep }}>LIMITED · BUNDLE</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Honda Fairfax Summer Bundle</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>Oil + rotation + 27-pt check · Save $40</Text>
          </View>
          <Text style={{ color: palette.warning, fontWeight: '800' }}>→</Text>
        </LinearGradient>
      </Tappable>
      {dealCard('🔧', '20% OFF', 'AutoFix Pro — new customer', 'Free inspection w/ any oil change')}
      {dealCard('🛡️', 'SPONSORED', 'Bundle auto + home insurance', 'Drivers near Fairfax save up to $612/yr')}
      <View style={{ marginBottom: spacing.md }} />

      {/* How it works */}
      <SectionLabel>New here?</SectionLabel>
      <Tappable
        onPress={() => navigation.navigate('HowItWorks')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
      >
        <Text style={{ fontSize: 18 }}>💡</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>How AutoMate works</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>3 simple steps · tap to see details</Text>
        </View>
        <Text style={{ color: colors.primary, fontSize: 16 }}>›</Text>
      </Tappable>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {([
          ['📷', '1 · Snap photos'],
          ['⚖️', '2 · Compare quotes'],
          ['📅', '3 · Book & save'],
        ] as const).map(([emoji, label]) => (
          <View key={label} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, paddingVertical: spacing.sm }}>
            <Text style={{ fontSize: 18, marginBottom: 2 }}>{emoji}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Why choose */}
      <SectionLabel>Why choose AutoMate?</SectionLabel>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        {why('💸', 'Shops compete', 'Local shops bid for your repair — you pick the best')}
        {why('🤝', 'No upfront pay', 'Book now, pay the shop after the work')}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {why('✅', 'Verified shops', 'Ratings from real, completed AutoMate bookings')}
        {why('⏱️', 'Save hours', 'Quotes in 1–3 hrs — no calling around')}
      </View>
      <Tappable
        onPress={() => navigation.navigate('Reviews')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.successSurface, borderColor: colors.successLight, borderWidth: 1, borderRadius: radii.md, padding: spacing.md }}
      >
        <Text style={{ fontSize: 20 }}>🎁</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.successDeep }}>Earn points on every booking</Text>
          <Text style={{ fontSize: 11, color: colors.successDark }}>Rewards add up to a free oil change & more</Text>
        </View>
        <Text style={{ color: colors.successDark }}>›</Text>
      </Tappable>

      {/* Real customer reviews — dot-controlled carousel (wireframe rev-track) */}
      <SectionLabel style={{ marginTop: spacing.md }}>Real customer reviews</SectionLabel>
      <DotCarousel
        items={REVIEWS.map((r) => (
          <Card key={r.car} style={{ padding: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                {r.car}
              </Text>
              <Text style={{ color: palette.gold, fontSize: 12 }}>★★★★★</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textTertiary, marginBottom: spacing.xs }}>
              🔧 {r.repair} · ⏱ {r.time} · {r.paid}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>{r.body}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>{r.shop}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>✓ Verified</Text>
            </View>
          </Card>
        ))}
      />
    </Screen>
  );
}

const REVIEWS = [
  {
    car: '2019 Honda Accord',
    repair: 'Rear bumper',
    time: '2 days',
    paid: 'Insurance',
    shop: 'Honda Fairfax',
    body: "Quoted $330 on AutoMate and that's exactly what I paid — no surprises. Looks brand new and they finished a day early.",
  },
  {
    car: '2021 Toyota RAV4',
    repair: 'Door scratch',
    time: '1 day',
    paid: 'Cash',
    shop: 'AutoFix Pro',
    body: 'Compared 2 shops in minutes and saved ~$90 vs the first place I called. Smooth booking, no deposit drama.',
  },
  {
    car: '2018 Subaru Outback',
    repair: 'Front fender',
    time: '2 days',
    paid: 'Insurance',
    shop: 'Vienna Auto Care',
    body: 'Insurance claim was painless — AutoMate had three quotes before my agent even called back. Fender looks factory-fresh.',
  },
];
