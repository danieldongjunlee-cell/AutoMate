import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { PagedCarousel } from '../../components/PagedCarousel';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { useT } from '../../i18n';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeLauncher'>;

/** Wireframe s-home-launcher: the Home tab hub. */
export function HomeLauncherScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useT();
  const checkedIn = useAppStore((s) => s.dailyCheckedIn);
  const claimCheckIn = useAppStore((s) => s.claimDailyCheckIn);

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

  const dealItem = (
    emoji: string,
    badge: string,
    badgeBg: string,
    badgeFg: string,
    title: string,
    sub: string,
    bg: string,
    border: string,
    dealerId: string,
  ) => (
    <Tappable
      onPress={() => navigation.navigate('BundleDeals', { focus: dealerId })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: bg, borderColor: border, borderWidth: 1.5, borderRadius: radii.md, padding: spacing.md, minHeight: 86 }}
    >
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: badgeBg, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 3 }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: badgeFg }}>{badge}</Text>
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
    <Screen safeTop>
      {/* Greeting + active-car switcher */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Hi Daniel 👋</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: spacing.md }}>
            What would you like to do today?
          </Text>
        </View>
        <CarSwitchChip />
      </View>

      {/* Daily check-in — interactive claim (stays on screen) */}
      <Tappable
        onPress={checkedIn ? undefined : claimCheckIn}
        disabled={checkedIn}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
      >
        <Text style={{ fontSize: 16 }}>{checkedIn ? '🎉' : '✅'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
            {checkedIn ? 'Checked in today · +10 pts' : 'Daily check-in · +10 pts'}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            🔥 Day {checkedIn ? 6 : 5} streak · earning toward a free oil change
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: checkedIn ? 'transparent' : colors.success,
            borderWidth: checkedIn ? 1.5 : 0,
            borderColor: colors.success,
            borderRadius: radii.pill,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: checkedIn ? colors.successDark : '#fff' }}>
            {checkedIn ? '✓ Claimed' : 'Claim'}
          </Text>
        </View>
      </Tappable>

      {/* Hero — Get AI estimate */}
      <Tappable onPress={() => navigation.navigate('CarDiagram')}>
        <LinearGradient
          colors={[palette.primary, palette.primaryDark]}
          style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
        >
          <Text style={{ fontSize: 30, marginBottom: 6 }}>📷</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>{t('Get an AI Repair Estimate')}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginBottom: spacing.sm }}>
            Snap a few photos → local dealers send real quotes → book or call in minutes
          </Text>
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.success, borderRadius: radii.pill, paddingHorizontal: 15, paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>{t('Start now →')}</Text>
          </View>
        </LinearGradient>
      </Tappable>

      {/* Maintenance / Compare */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {tile('🔧', colors.successSurface, t('Maintenance'), 'Track & book service', () => navigation.navigate('MaintDashboard'))}
        {tile('⚖️', colors.warningSurface, t('Compare Costs'), 'Cash vs insurance', () => navigation.navigate('CompSelect'))}
      </View>

      {/* Earn points — right above Deals & offers */}
      <Tappable
        onPress={() => navigateCrossTab(navigation, 'MoreTab', 'ProfEarn')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.successSurface, borderColor: colors.successLight, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.xl }}
      >
        <Text style={{ fontSize: 20 }}>🎁</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.successDeep }}>Earn points on every booking</Text>
          <Text style={{ fontSize: 11, color: colors.successDark }}>Rewards add up to a free oil change & more</Text>
        </View>
        <Text style={{ color: colors.successDark }}>›</Text>
      </Tappable>

      {/* Deals & offers — paged carousel (one at a time, dots) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel>{t('Deals & offers · Sponsored')}</SectionLabel>
        <Tappable onPress={() => navigation.navigate('BundleDeals')} hitSlop={8}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>View all →</Text>
        </Tappable>
      </View>
      <PagedCarousel
        items={[
          dealItem('🛢️', 'LIMITED · BUNDLE', colors.warning, palette.dark, 'Honda Fairfax Summer Bundle', 'Oil + rotation + 27-pt check · Save $40', colors.warningSurface, colors.warning, 'honda-fairfax'),
          dealItem('🔧', '20% OFF', colors.primary, '#fff', 'AutoFix Pro — new customer', 'Free inspection w/ any oil change', colors.primarySurface, colors.primary, 'autofix-pro'),
          dealItem('🛡️', 'SPONSORED', colors.success, '#fff', 'Vienna Auto Care — $30 off', 'Brakes, batteries & A/C service', colors.successSurface, colors.success, 'vienna-auto'),
        ]}
      />
      <View style={{ marginBottom: spacing.xl }} />

      {/* How it works */}
      <SectionLabel>{t('New here?')}</SectionLabel>
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
      <View style={{ marginBottom: spacing.lg }} />

      {/* Why choose */}
      <SectionLabel>{t('Why choose AutoMate?')}</SectionLabel>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        {why('💸', 'Shops compete', 'Local shops bid for your repair — you pick the best')}
        {why('🤝', 'No upfront pay', 'Book now, pay the shop after the work')}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {why('✅', 'Verified shops', 'Ratings from real, completed AutoMate bookings')}
        {why('⏱️', 'Save hours', 'Quotes in 1–3 hrs — no calling around')}
      </View>

      {/* Real customer reviews — paged carousel (one at a time, dots) */}
      <SectionLabel style={{ marginTop: spacing.xl }}>{t('Real customer reviews')}</SectionLabel>
      <PagedCarousel
        items={REVIEWS.map((r) => (
          <View key={r.car}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {/* Before / after repair photos */}
              <View style={{ flexDirection: 'row', height: 120 }}>
                {([['Before', r.before], ['After', r.after]] as const).map(([label, uri]) => (
                  <View key={label} style={{ flex: 1, backgroundColor: colors.surfaceAlt }}>
                    <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: 'rgba(0,0,0,.6)',
                        borderRadius: radii.pill,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{label}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
                    {r.car}
                  </Text>
                  <Text style={{ color: palette.gold, fontSize: 12 }}>★★★★★</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textTertiary, marginBottom: spacing.xs }}>
                  🔧 {r.repair} · ⏱ {r.time} · {r.paid}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }} numberOfLines={3}>
                  {r.body}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
                  <Text style={{ fontSize: 11, color: colors.textTertiary }}>{r.shop}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>✓ Verified</Text>
                </View>
              </View>
            </Card>
          </View>
        ))}
      />
      <View style={{ marginBottom: spacing.lg }} />
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
    icon: '🚙',
    tint: '#1e4fcc',
    body: "Quoted $330 on AutoMate and that's exactly what I paid — no surprises. Looks brand new and they finished a day early.",
    before: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=60',
    after: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=60',
  },
  {
    car: '2021 Toyota RAV4',
    repair: 'Door scratch',
    time: '1 day',
    paid: 'Cash',
    shop: 'AutoFix Pro',
    icon: '🚗',
    tint: '#16a34a',
    body: 'Compared 2 shops in minutes and saved ~$90 vs the first place I called. Smooth booking, no deposit drama.',
    before: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&q=60',
    after: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=60',
  },
  {
    car: '2018 Subaru Outback',
    repair: 'Front fender',
    time: '2 days',
    paid: 'Insurance',
    shop: 'Vienna Auto Care',
    icon: '🚐',
    tint: '#7F77DD',
    body: 'Insurance claim was painless — AutoMate had three quotes before my agent even called back. Fender looks factory-fresh.',
    before: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=60',
    after: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&q=60',
  },
  {
    car: '2022 Kia Telluride',
    repair: 'Windshield chip',
    time: 'Same day',
    paid: 'Insurance',
    shop: 'Chantilly Auto Body',
    icon: '🚙',
    tint: '#0F6E56',
    body: 'Booked at 9am, fixed by lunch. The shop messaged me photos before and after — super transparent.',
    before: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=60',
    after: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=60',
  },
  {
    car: '2020 Mazda CX-5',
    repair: 'Brake pads + rotors',
    time: '3 hours',
    paid: 'Cash',
    shop: 'AutoFix Pro',
    icon: '🚗',
    tint: '#E24B4A',
    body: 'Dealer quoted me $620, AutoMate found the same job for $410. No upsell, no waiting room runaround.',
    before: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&q=60',
    after: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=60',
  },
  {
    car: '2017 Ford F-150',
    repair: 'Side mirror',
    time: '1 day',
    paid: 'Cash',
    shop: 'NoVa Dent Works',
    icon: '🛻',
    tint: '#534AB7',
    body: 'OEM mirror, color-matched perfectly. Loved seeing real reviews from other owners before I picked the shop.',
    before: 'https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=400&q=60',
    after: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&q=60',
  },
];
