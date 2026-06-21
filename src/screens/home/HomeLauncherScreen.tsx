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

  /** Large full-width action: title + hook phrase, with a big icon in the
   *  bottom-right corner. Gradient for the primary, tinted surface otherwise. */
  const actionCard = (opts: {
    title: string;
    phrase: string;
    icon: string;
    onPress: () => void;
    gradient?: [string, string];
    tint?: string;
    border?: string;
    fg: string;
    sub: string;
    iconColor?: string;
  }) => {
    const inner = (
      <>
        <Text style={{ fontSize: 24, fontWeight: '800', color: opts.fg }}>{opts.title}</Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: opts.sub, marginTop: 4 }}>{opts.phrase}</Text>
        {/* Big decorative icon, clipped into the bottom-right corner. */}
        <Text style={{ position: 'absolute', right: -8, bottom: -20, fontSize: 92, opacity: 0.16, color: opts.iconColor ?? '#000' }}>
          {opts.icon}
        </Text>
      </>
    );
    const base = {
      borderRadius: radii.lg,
      padding: spacing.lg,
      minHeight: 116,
      justifyContent: 'center' as const,
      overflow: 'hidden' as const,
      marginBottom: spacing.md,
    };
    return (
      <Tappable onPress={opts.onPress}>
        {opts.gradient ? (
          <LinearGradient colors={opts.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={base}>
            {inner}
          </LinearGradient>
        ) : (
          <View style={[base, { backgroundColor: opts.tint, borderWidth: 1, borderColor: opts.border }]}>{inner}</View>
        )}
      </Tappable>
    );
  };

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
      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 20 }}>→</Text>
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

      {/* Three big actions */}
      {actionCard({
        title: t('Get an AI Repair Estimate'),
        phrase: 'Free quote in under 5 minutes',
        icon: '🚗',
        onPress: () => navigation.navigate('CarDiagram'),
        gradient: [palette.primary, palette.primaryDark],
        fg: '#fff',
        sub: 'rgba(255,255,255,.88)',
        iconColor: '#fff',
      })}
      {actionCard({
        title: t('Maintenance'),
        phrase: 'Track & book service in seconds',
        icon: '🔧',
        onPress: () => navigation.navigate('MaintDashboard'),
        tint: colors.successSurface,
        border: colors.successLight,
        fg: colors.successDeep,
        sub: colors.successDark,
        iconColor: colors.successDark,
      })}
      {actionCard({
        title: t('Compare Costs'),
        phrase: 'Cash vs insurance — pick the cheaper',
        icon: '⚖️',
        onPress: () => navigation.navigate('CompSelect'),
        tint: colors.warningSurface,
        border: colors.warning,
        fg: colors.warningDeep,
        sub: colors.warningDeep,
        iconColor: colors.warningDeep,
      })}

      {/* Deals & offers — larger header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, marginBottom: spacing.sm }}>
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
