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
import { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeLauncher'>;

/** Wireframe s-home-launcher: the Home tab hub. */
export function HomeLauncherScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useT();
  // "New here?" is onboarding for brand-new users only — it disappears once
  // they submit their first AI estimate, and never shows for returning users.
  const isNewUser = useAppStore((s) => s.isNewUser);

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

  const why = (emoji: string, title: string, sub: string, tint: string) => (
    <Card style={{ flex: 1, padding: spacing.md }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: tint + '22',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 }}>{title}</Text>
      <Text style={{ fontSize: 12, color: colors.textTertiary, lineHeight: 17 }}>{sub}</Text>
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

      {/* New here? — how-it-works entry (new users only) */}
      {isNewUser ? (
        <Tappable
          onPress={() => navigation.navigate('HowItWorks')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>New here?</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>See how AutoMate works · 4 quick steps</Text>
          </View>
          <Text style={{ color: colors.primary, fontSize: 16 }}>›</Text>
        </Tappable>
      ) : null}

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
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
        {tile('🔧', colors.successSurface, t('Maintenance'), 'Track & book service', () => navigation.navigate('MaintDashboard'))}
        {tile('⚖️', colors.warningSurface, t('Compare Costs'), 'Cash vs insurance', () => navigation.navigate('CompSelect'))}
      </View>

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

      {/* Why choose */}
      <SectionLabel>{t('Why choose AutoMate?')}</SectionLabel>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        {why('💸', 'Shops compete', 'Local shops bid for your repair — you pick the best', '#16a34a')}
        {why('🤝', 'No upfront pay', 'Book now, pay the shop after the work', '#2e6bff')}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        {why('✅', 'Verified shops', 'Ratings from real, completed AutoMate bookings', '#0F6E56')}
        {why('⏱️', 'Save hours', 'Quotes in 1–3 hrs — no calling around', '#E2A33B')}
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

/** Pexels CDN image (stable hotlink, no auth) cropped to the review thumb size. */
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=440&h=280&fit=crop`;

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
    before: px(12365608), // damaged front bumper close-up
    after: px(12808907), // shiny black car, repaired
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
    before: px(7779044), // scratched / rusty panel close-up
    after: px(6872572), // detailing a clean car
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
    before: px(11985980), // crashed front end
    after: px(1637859), // clean red sedan, repaired
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
    before: px(2265634), // broken windshield
    after: px(2498076), // clean reflective car
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
    before: px(11542692), // damaged car
    after: px(9516301), // clean red car, repaired
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
    before: px(11360863), // broken side mirror
    after: px(6698127), // clean car on the street, repaired
  },
];
