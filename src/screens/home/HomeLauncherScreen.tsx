import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { Icon } from '../../components/Icon';
import { EstimateGateSheet } from '../../components/EstimateGateSheet';
import { useRequireAuth, useResumeAfterAuth } from '../../hooks/useRequireAuth';
import { LocationPermissionSheet } from '../../components/LocationPermissionSheet';
import { PagedCarousel } from '../../components/PagedCarousel';
import { PhotoTile } from '../../components/Tile';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useT } from '../../i18n';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { HOME_REVIEWS, HomeReview } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { STAR_YELLOW } from '../../components/RatingLink';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeLauncher'>;

// Duotone launcher photos (holographic car / mechanic) behind a navy gradient.
const TILE_AI = require('../../../assets/tiles/ai-estimate.jpg');
const TILE_MAINT = require('../../../assets/tiles/maintenance.jpg');

/** Home tab hub (canvas "Home"): greeting, two photo tiles, deals, reviews, footer. */
export function HomeLauncherScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useT();
  // "New here?" is onboarding for brand-new users only — it disappears once
  // they submit their first AI estimate, and never shows for returning users.
  const isNewUser = useAppStore((s) => s.isNewUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  // Greeting shows the signed-in user's first name; "Guest" when signed out.
  const user = useAppStore((s) => s.user);
  const firstName = isAuthenticated ? (user?.name ?? '').trim().split(/\s+/)[0] : '';
  const requireAuth = useRequireAuth();
  // Guest gate for the AI estimate: sheet → picker as guest, or Join first
  // (the picker opens once they're signed in).
  const [gateOpen, setGateOpen] = useState(false);
  useResumeAfterAuth('newEstimate', () => navigation.navigate('CarDiagram'));
  const startEstimate = () => (isAuthenticated ? navigation.navigate('CarDiagram') : setGateOpen(true));

  // Solid, borderless promo banner (filled gradient + white text), like a
  // store coupon card. No icon — text only.
  const dealItem = (
    badge: string,
    title: string,
    sub: string,
    gradient: readonly [string, string],
    dealerId: string,
  ) => (
    <Tappable onPress={() => requireAuth('deals', () => navigation.navigate('BundleDeals', { focus: dealerId }))}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 92, justifyContent: 'center', overflow: 'hidden' }}
      >
        <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 5 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{badge}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 1 }}>{sub}</Text>
      </LinearGradient>
    </Tappable>
  );

  /** Real-customer review card with actual before/after repair photos. */
  const reviewCard = (r: HomeReview) => (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, minHeight: 78 }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        {[{ label: 'Before', color: r.beforeColor, uri: r.beforeUri }, { label: 'After', color: r.afterColor, uri: r.afterUri }].map((p) => (
          <View key={p.label} style={{ flex: 1, height: 66, borderRadius: radii.sm, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {/* Real web photo over a colored fallback (shows if the image is slow/offline). */}
            <Image source={{ uri: p.uri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} resizeMode="cover" />
            <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,.55)', borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{p.label}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>{r.name}</Text>
        <Text style={{ fontSize: 13 }}>
          <Text style={{ color: STAR_YELLOW }}>{'★'.repeat(r.stars)}</Text>
          <Text style={{ color: colors.border }}>{'★'.repeat(5 - r.stars)}</Text>
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>· {r.car}</Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primaryDark, marginBottom: 5 }}>{r.repair}</Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 19, fontStyle: 'italic' }}>“{r.quote}”</Text>
    </View>
  );

  return (
    <Screen safeTop>
      {/* Greeting + active-car switcher, or the guest greeting + Log in / Sign up pill. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Text style={{ flex: 1, fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 }} numberOfLines={1}>
          {isAuthenticated ? `Hi, ${firstName || 'there'}` : 'Hi, Guest'}
        </Text>
        {isAuthenticated ? (
          <CarSwitchChip />
        ) : (
          <Tappable
            onPress={() => requireAuth('signIn')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.primary,
              borderRadius: radii.pill,
              paddingHorizontal: 14,
              paddingVertical: 9,
            }}
          >
            <Icon name="user" size={18} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Log in / Sign up</Text>
          </Tappable>
        )}
      </View>

      {/* New here? — how-it-works entry (new users only) */}
      {isNewUser ? (
        <Tappable
          onPress={() => navigation.navigate('HowItWorks')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>New here?</Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary }}>See how AutoMate works · 4 quick steps</Text>
          </View>
          <Icon name="chevron" size={20} color={colors.primary} />
        </Tappable>
      ) : null}

      {/* AI Repair Estimate + Maintenance dashboard photo tiles, side by side. */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.section }}>
        <PhotoTile
          title={t('AI Repair Estimate')}
          source={TILE_AI}
          height={168}
          style={{ flex: 1 }}
          onPress={startEstimate}
        />
        <PhotoTile
          title="Maintenance dashboard"
          source={TILE_MAINT}
          height={168}
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('MaintDashboard')}
        />
      </View>

      {/* Deals carousel — only a right-aligned "View all deals →" link above it. */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}>
        <Tappable onPress={() => requireAuth('deals', () => navigation.navigate('BundleDeals'))} hitSlop={8}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>View all deals →</Text>
        </Tappable>
      </View>
      <PagedCarousel
        items={[
          dealItem('LIMITED · BUNDLE', 'Honda Fairfax Summer Bundle', 'Oil + rotation + 27-pt check · Save $40', ['#E0A93E', '#C2871F'], 'honda-fairfax'),
          dealItem('20% OFF', 'AutoFix Pro — new customer', 'Free inspection w/ any oil change', [palette.primary, '#1e4fcc'], 'autofix-pro'),
          dealItem('SPONSORED', 'Vienna Auto Care — $30 off', 'Brakes, batteries & A/C service', ['#1f9e75', '#13795a'], 'vienna-auto'),
        ]}
      />

      {/* Real customer reviews — title only, then the sliding cards. */}
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.section, marginBottom: spacing.md }}>
        {t('Real customer reviews')}
      </Text>
      <PagedCarousel items={HOME_REVIEWS.map((r) => reviewCard(r))} />

      {/* Footer: help, legal & support documents. */}
      <View
        style={{
          marginTop: spacing.section,
          paddingTop: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}>
          {(
            [
              ['Help & FAQ', 'ProfHelpCenter'],
              ['Terms of Service', 'ProfTerms'],
              ['Privacy Policy', 'ProfPrivacy'],
              ['Contact us', 'HelpContact'],
            ] as const
          ).map(([label, route], i) => (
            <View key={route} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {i > 0 ? <Text style={{ fontSize: 13, color: colors.border, marginRight: spacing.sm }}>·</Text> : null}
              <Tappable onPress={() => navigateCrossTab(navigation, 'MoreTab', route)} hitSlop={6}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textTertiary }}>{label}</Text>
              </Tappable>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 12, color: colors.textPlaceholder, marginTop: spacing.sm }}>
          AutoMate · Fairfax, VA · v1.0
        </Text>
      </View>

      <EstimateGateSheet
        visible={gateOpen}
        onClose={() => setGateOpen(false)}
        onGuest={() => navigation.navigate('CarDiagram')}
        onSignUp={() => requireAuth('newEstimate', () => navigation.navigate('CarDiagram'), 'join')}
      />
      <LocationPermissionSheet />
    </Screen>
  );
}
