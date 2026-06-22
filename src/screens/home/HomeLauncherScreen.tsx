import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { PagedCarousel } from '../../components/PagedCarousel';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
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
  // Compare only works once there's an estimate to compare; the AI estimate
  // populates it.
  const aiEstimate = useAppStore((s) => s.aiEstimate);

  /** The hero action (largest): full-width gradient, big corner icon. */
  const heroCard = (opts: { title: string; phrase: string; icon: string; onPress: () => void }) => (
    <Tappable onPress={opts.onPress}>
      <LinearGradient
        colors={[palette.accent, '#5b51c4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radii.lg, padding: spacing.lg, minHeight: 156, justifyContent: 'center', overflow: 'hidden', marginBottom: spacing.md }}
      >
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff' }}>{opts.title}</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,.9)', marginTop: 5 }}>{opts.phrase}</Text>
        <Text style={{ position: 'absolute', right: -10, bottom: -26, fontSize: 110, opacity: 0.16, color: '#fff' }}>{opts.icon}</Text>
      </LinearGradient>
    </Tappable>
  );

  /** Smaller side-by-side action tile (Maintenance / Compare). */
  const miniCard = (opts: {
    title: string;
    phrase: string;
    icon: string;
    onPress: () => void;
    tint: string;
    border: string;
    fg: string;
    sub: string;
    iconColor: string;
  }) => (
    <Tappable onPress={opts.onPress} style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: opts.tint,
          borderWidth: 1,
          borderColor: opts.border,
          borderRadius: radii.lg,
          padding: spacing.md,
          minHeight: 104,
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '800', color: opts.fg }}>{opts.title}</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: opts.sub, marginTop: 3 }}>{opts.phrase}</Text>
        <Text style={{ position: 'absolute', right: -6, bottom: -14, fontSize: 60, opacity: 0.15, color: opts.iconColor }}>{opts.icon}</Text>
      </View>
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
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: bg, borderColor: border, borderWidth: 1.5, borderRadius: radii.md, padding: spacing.md, minHeight: 96 }}
    >
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: badgeBg, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: badgeFg }}>{badge}</Text>
        </View>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>{sub}</Text>
      </View>
    </Tappable>
  );

  return (
    <Screen safeTop>
      {/* Greeting + active-car switcher */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Text style={{ flex: 1, fontSize: 27, fontWeight: '800', color: colors.textPrimary }}>Hi Daniel 👋</Text>
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

      {/* Primary action — largest */}
      {heroCard({
        title: t('Get an AI Repair Estimate'),
        phrase: 'Free quote in under 5 minutes',
        icon: '🚗',
        onPress: () => navigation.navigate('CarDiagram'),
      })}

      {/* Two smaller actions. Compare unlocks once an AI estimate exists. */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {miniCard({
          title: t('Maintenance'),
          phrase: 'Book service fast',
          icon: '🔧',
          onPress: () => navigation.navigate('MaintDashboard'),
          tint: colors.successSurface,
          border: colors.successLight,
          fg: colors.successDeep,
          sub: colors.successDark,
          iconColor: colors.successDark,
        })}
        {aiEstimate ? (
          miniCard({
            title: t('Compare Costs'),
            phrase: `$${aiEstimate.priceLow}–$${aiEstimate.priceHigh} · cash vs insurance`,
            icon: '⚖️',
            onPress: () => navigation.navigate('CompSelect'),
            tint: colors.warningSurface,
            border: colors.warning,
            fg: colors.warningDeep,
            sub: colors.warningDeep,
            iconColor: colors.warningDeep,
          })
        ) : (
          // Locked until an AI estimate exists — a centered lock makes the gate
          // obvious, while the subtitle still names what the tool does.
          <Tappable onPress={() => navigation.navigate('CarDiagram')} style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: colors.surfaceAlt,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.lg,
                padding: spacing.md,
                minHeight: 104,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 26, marginBottom: 4 }}>🔒</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textTertiary }}>{t('Compare Costs')}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary, marginTop: 2 }}>
                Cash vs insurance
              </Text>
            </View>
          </Tappable>
        )}
      </View>

      {/* Deals & offers — larger header (extra top gap separates it from the actions) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxxl, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{t('Deals & offers')}</Text>
        <Tappable onPress={() => navigation.navigate('BundleDeals')} hitSlop={8}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>View all →</Text>
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
