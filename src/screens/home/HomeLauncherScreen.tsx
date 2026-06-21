import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { PagedCarousel } from '../../components/PagedCarousel';
import { Tappable } from '../../components/Tappable';
import { Screen, SectionLabel } from '../../components/ui';
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

  // Big tappable action tile (Maintenance / Compare).
  const tile = (emoji: string, bg: string, title: string, sub: string, onPress: () => void) => (
    <Tappable
      onPress={onPress}
      style={{ flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.lg, minHeight: 120 }}
    >
      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>{title}</Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>{sub}</Text>
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
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: bg, borderColor: border, borderWidth: 1.5, borderRadius: radii.md, padding: spacing.md, minHeight: 92 }}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: badgeBg, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 3 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: badgeFg }}>{badge}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>{sub}</Text>
      </View>
      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>→</Text>
    </Tappable>
  );

  return (
    <Screen safeTop>
      {/* Greeting + active-car switcher */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary }}>Hi Daniel 👋</Text>
          <Text style={{ fontSize: 15, color: colors.textTertiary, marginBottom: spacing.md }}>
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
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>New here?</Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary }}>See how AutoMate works · 4 quick steps</Text>
          </View>
          <Text style={{ color: colors.primary, fontSize: 20 }}>›</Text>
        </Tappable>
      ) : null}

      {/* Hero — Get AI estimate (largest action) */}
      <Tappable onPress={() => navigation.navigate('CarDiagram')}>
        <LinearGradient
          colors={[palette.primary, palette.primaryDark]}
          style={{ borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md }}
        >
          <Text style={{ fontSize: 42, marginBottom: 8 }}>📷</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>{t('Get an AI Repair Estimate')}</Text>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginTop: 4, marginBottom: spacing.md }}>
            Snap a few photos → local dealers send real quotes → book in minutes
          </Text>
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.success, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 11 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{t('Start now →')}</Text>
          </View>
        </LinearGradient>
      </Tappable>

      {/* Maintenance / Compare (the other two big actions) */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
        {tile('🔧', colors.successSurface, t('Maintenance'), 'Track & book service', () => navigation.navigate('MaintDashboard'))}
        {tile('⚖️', colors.warningSurface, t('Compare Costs'), 'Cash vs insurance', () => navigation.navigate('CompSelect'))}
      </View>

      {/* Deals & offers — paged carousel (one at a time, dots) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel>{t('Deals & offers · Sponsored')}</SectionLabel>
        <Tappable onPress={() => navigation.navigate('BundleDeals')} hitSlop={8}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>View all →</Text>
        </Tappable>
      </View>
      <PagedCarousel
        items={[
          dealItem('🛢️', 'LIMITED · BUNDLE', colors.warning, palette.dark, 'Honda Fairfax Summer Bundle', 'Oil + rotation + 27-pt check · Save $40', colors.warningSurface, colors.warning, 'honda-fairfax'),
          dealItem('🔧', '20% OFF', colors.primary, '#fff', 'AutoFix Pro — new customer', 'Free inspection w/ any oil change', colors.primarySurface, colors.primary, 'autofix-pro'),
          dealItem('🛡️', 'SPONSORED', colors.success, '#fff', 'Vienna Auto Care — $30 off', 'Brakes, batteries & A/C service', colors.successSurface, colors.success, 'vienna-auto'),
        ]}
      />
      <View style={{ marginBottom: spacing.lg }} />
    </Screen>
  );
}
