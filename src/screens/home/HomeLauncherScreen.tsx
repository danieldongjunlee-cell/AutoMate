import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, View } from 'react-native';

import { AiInspectLogo } from '../../components/AiInspectLogo';
import { CarSwitchChip } from '../../components/CarSwitchChip';
import { LocationPermissionSheet } from '../../components/LocationPermissionSheet';
import { PagedCarousel } from '../../components/PagedCarousel';
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

  // All home actions share one white card surface; a soft outer drop shadow
  // lifts each button off the background.
  const cardShadow = {
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  } as const;

  // Subtitles use a lighter tone so the title leads.
  const subColor = colors.textPlaceholder;

  /** The hero action (largest): white card, AI-inspection icon in the corner.
      Outer view carries the drop shadow; inner view clips the icon (a single
      view can't both clip with overflow:'hidden' and cast an iOS shadow). */
  const heroCard = (opts: { title: string; phrase: string; icon: string; accent: string; onPress: () => void }) => (
    <Tappable onPress={opts.onPress}>
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, marginBottom: spacing.md, ...cardShadow }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.lg,
            minHeight: 188,
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>{opts.title}</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: subColor, marginTop: 6 }}>{opts.phrase}</Text>
          {/* AI inspecting the car — sits opaque in the bottom-right corner. */}
          <View style={{ position: 'absolute', right: 2, bottom: 4, opacity: 0.95 }}>
            <AiInspectLogo size={188} />
          </View>
        </View>
      </View>
    </Tappable>
  );

  /** Smaller side-by-side action tile (Maintenance / Compare) — same size. The
      icon now sits opaque in the corner like a product illustration. */
  const miniCard = (opts: { title: string; phrase: string; icon: string; accent: string; onPress: () => void }) => (
    <Tappable onPress={opts.onPress} style={{ flex: 1 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, ...cardShadow }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.md,
            minHeight: 104,
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{opts.title}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: subColor, marginTop: 3 }}>{opts.phrase}</Text>
          <Text style={{ position: 'absolute', right: 6, bottom: 2, fontSize: 42 }}>{opts.icon}</Text>
        </View>
      </View>
    </Tappable>
  );

  // Solid, borderless promo banner (filled gradient + white text), like a
  // store coupon card. The big emoji sits opaque on the right.
  const dealItem = (
    emoji: string,
    badge: string,
    title: string,
    sub: string,
    gradient: readonly [string, string],
    dealerId: string,
  ) => (
    <Tappable onPress={() => navigation.navigate('BundleDeals', { focus: dealerId })}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 84, overflow: 'hidden' }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 5 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{badge}</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{title}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 1 }}>{sub}</Text>
        </View>
        <Text style={{ fontSize: 40 }}>{emoji}</Text>
      </LinearGradient>
    </Tappable>
  );

  /** Real-customer review card with actual before/after repair photos. */
  const reviewCard = (r: HomeReview) => (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.sm, minHeight: 78 }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        {[{ label: 'Before', color: r.beforeColor, uri: r.beforeUri }, { label: 'After', color: r.afterColor, uri: r.afterUri }].map((p) => (
          <View key={p.label} style={{ flex: 1, height: 62, borderRadius: radii.sm, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
      {/* Greeting + active-car switcher (chip pinned top-right, consistent across tabs) */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
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
        title: t('AI Repair Estimate'),
        phrase: 'Free quote in under 5 minutes',
        icon: '🚗',
        accent: palette.accent,
        onPress: () => navigation.navigate('CarDiagram'),
      })}

      {/* Two smaller actions. Compare unlocks once an AI estimate exists. */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {miniCard({
          title: t('Maintenance'),
          phrase: 'Book service fast',
          icon: '🔧',
          accent: colors.success,
          onPress: () => navigation.navigate('MaintDashboard'),
        })}
        {aiEstimate
          ? miniCard({
              title: t('Compare Costs'),
              phrase: `$${aiEstimate.priceLow}–$${aiEstimate.priceHigh} · cash vs insurance`,
              icon: '⚖️',
              accent: colors.warning,
              onPress: () => navigation.navigate('CompSelect'),
            })
          : // Locked until an AI estimate exists — the lock icon badge signals the
            // gate; the subtitle still names what the tool does.
            miniCard({
              title: t('Compare Costs'),
              phrase: 'Cash vs insurance · run an estimate',
              icon: '🔒',
              accent: colors.disabled,
              onPress: () => navigation.navigate('CarDiagram'),
            })}
      </View>

      {/* Deals & offers — compact section below the actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{t('Deals & offers')}</Text>
        <Tappable onPress={() => navigation.navigate('BundleDeals')} hitSlop={8}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>View all →</Text>
        </Tappable>
      </View>
      <PagedCarousel
        items={[
          dealItem('🛢️', 'LIMITED · BUNDLE', 'Honda Fairfax Summer Bundle', 'Oil + rotation + 27-pt check · Save $40', ['#E0A93E', '#C2871F'], 'honda-fairfax'),
          dealItem('🔧', '20% OFF', 'AutoFix Pro — new customer', 'Free inspection w/ any oil change', [palette.primary, palette.primaryDark], 'autofix-pro'),
          dealItem('🛡️', 'SPONSORED', 'Vienna Auto Care — $30 off', 'Brakes, batteries & A/C service', ['#1f9e75', '#13795a'], 'vienna-auto'),
        ]}
      />

      {/* Real customer reviews — before & after (same spacing as Deals). */}
      <View style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{t('Real customer reviews')}</Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
          Before &amp; after — from photo to fixed car
        </Text>
      </View>
      <PagedCarousel items={HOME_REVIEWS.map((r) => reviewCard(r))} />

      {/* Footer: help, legal & support documents (like other apps). */}
      <View
        style={{
          marginTop: spacing.xxxl,
          paddingTop: spacing.md,
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

      <View style={{ marginBottom: spacing.lg }} />
      <LocationPermissionSheet />
    </Screen>
  );
}
