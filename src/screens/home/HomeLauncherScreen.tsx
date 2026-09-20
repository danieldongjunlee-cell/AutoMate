import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { DealBanner, DEALS } from '../../components/DealBanner';
import { Icon } from '../../components/Icon';
import { EstimateGateSheet } from '../../components/EstimateGateSheet';
import { useRequireAuth, useResumeAfterAuth } from '../../hooks/useRequireAuth';
import { LocationPermissionSheet } from '../../components/LocationPermissionSheet';
import { AppLogoRow } from '../../components/Logo';
import { PagedCarousel } from '../../components/PagedCarousel';
import { RotatingTagline } from '../../components/RotatingTagline';
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

/** Home tab hub (canvas "Home"): tagline + logo, two photo tiles, deals, reviews, footer. */
export function HomeLauncherScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useT();
  // "New here?" is onboarding for brand-new users only — it disappears once
  // they submit their first AI estimate, and never shows for returning users.
  const isNewUser = useAppStore((s) => s.isNewUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const requireAuth = useRequireAuth();
  // Guest gate for the AI estimate: sheet → picker as guest, or Join first
  // (the picker opens once they're signed in).
  const [gateOpen, setGateOpen] = useState(false);
  useResumeAfterAuth('newEstimate', () => navigation.navigate('CarDiagram'));
  useResumeAfterAuth('maintenance', () => navigation.navigate('MaintDashboard'));
  const startEstimate = () => (isAuthenticated ? navigation.navigate('CarDiagram') : setGateOpen(true));

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
      {/* Header: rotating tagline on the left, the app mark + AutoMate on the right. */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <RotatingTagline size={20} />
        </View>
        <AppLogoRow markSize={34} textSize={17} color={colors.textPrimary} />
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

      {/* AI Repair Estimate + Maintenance photo tiles, side by side (hover / hold plays the scan). */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.section }}>
        <PhotoTile
          title={t('AI Repair Estimate')}
          source={TILE_AI}
          fit="cover"
          height={168}
          style={{ flex: 1 }}
          onPress={startEstimate}
        />
        <PhotoTile
          title="Maintenance"
          source={TILE_MAINT}
          fit="cover"
          effect="service"
          height={168}
          style={{ flex: 1 }}
          // Guests are sent to Sign up first; the dashboard opens once they join.
          onPress={() => requireAuth('maintenance', () => navigation.navigate('MaintDashboard'), 'join')}
        />
      </View>

      {/* Deals carousel — only a right-aligned "View all deals →" link above it. */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}>
        <Tappable onPress={() => requireAuth('deals', () => navigation.navigate('BundleDeals'))} hitSlop={8}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>View all deals →</Text>
        </Tappable>
      </View>
      <PagedCarousel
        autoPlay={4500}
        items={DEALS.map((deal) => (
          <DealBanner key={deal.dealerId} deal={deal} onPress={() => requireAuth('deals', () => navigation.navigate('BundleDeals', { focus: deal.dealerId }))} />
        ))}
      />

      {/* Real customer reviews — title only, then the sliding cards. */}
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.section, marginBottom: spacing.md }}>
        {t('Real customer reviews')}
      </Text>
      <PagedCarousel autoPlay={6000} items={HOME_REVIEWS.map((r) => reviewCard(r))} />

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
