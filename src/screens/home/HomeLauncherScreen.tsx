import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Modal, Text, View } from 'react-native';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { GuestBanner } from '../../components/GuestBanner';
import { useRequireAuth, useResumeAfterAuth } from '../../hooks/useRequireAuth';
import { LocationPermissionSheet } from '../../components/LocationPermissionSheet';
import { PagedCarousel } from '../../components/PagedCarousel';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useT } from '../../i18n';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { HOME_REVIEWS, HomeReview } from '../../services/mock/data';
import { insuranceService } from '../../services';
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
  // Guests see the returning/new chooser first; signed-in users go straight in.
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  // Greeting shows the signed-in user's first name; just "Hi" for guests.
  const user = useAppStore((s) => s.user);
  const firstName = isAuthenticated ? (user?.name ?? '').trim().split(/\s+/)[0] : '';
  const requireAuth = useRequireAuth();
  // Compare Costs is gated on BOTH an AI estimate and an insurance policy on
  // file — the cash-vs-insurance math needs a real deductible/premium to be
  // honest. Shares the ['policies'] cache with the More-tab insurance screens.
  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => insuranceService.listPolicies(),
    enabled: isAuthenticated,
  });
  const hasInsurance = (policies ?? []).length > 0;
  const [compareLockOpen, setCompareLockOpen] = React.useState(false);
  // Guest tapped Compare → signed in → pick up where they left off: show the
  // remaining unlock steps (or go straight in if nothing is missing).
  useResumeAfterAuth('compare', () => setCompareLockOpen(true));

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

  /** A white action card with the title top-left and a big icon bottom-right.
      Used side-by-side for AI Repair Estimate + Maintenance. Outer view carries
      the drop shadow; inner view clips the corner icon. */
  const actionCard = (opts: {
    title: string;
    phrase: string;
    icon?: string;
    iconNode?: React.ReactNode;
    onPress: () => void;
  }) => (
    <Tappable onPress={opts.onPress} style={{ flex: 1 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, ...cardShadow }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.md,
            minHeight: 128,
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{opts.title}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: subColor, marginTop: 3 }}>{opts.phrase}</Text>
          {opts.iconNode ? (
            <View style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.95 }}>{opts.iconNode}</View>
          ) : opts.icon ? (
            <Text style={{ position: 'absolute', right: 6, bottom: 2, fontSize: 46 }}>{opts.icon}</Text>
          ) : null}
        </View>
      </View>
    </Tappable>
  );

  /** Full-width Compare Costs button — locked until the user is signed in,
      has run an AI estimate AND has an insurance policy on file (the
      cash-vs-insurance math needs a real deductible). Tapping while locked
      explains exactly what's missing and where to fix it. */
  const compareUnlocked = isAuthenticated && !!aiEstimate && hasInsurance;
  const compareLockHint = !isAuthenticated
    ? 'Sign in, run an AI estimate & add insurance to unlock'
    : !aiEstimate && !hasInsurance
      ? 'Run AI repair estimate & add your insurance policy to unlock'
      : !aiEstimate
        ? 'Run AI repair estimate first to unlock'
        : 'Add your insurance policy to unlock';
  const onComparePress = () => {
    if (compareUnlocked) {
      navigation.navigate('CompSelect');
      return;
    }
    if (!requireAuth('compare')) return; // guest → auth sheet first
    setCompareLockOpen(true);
  };
  const compareCard = () => {
    const unlocked = compareUnlocked;
    return (
      <Tappable onPress={onComparePress}>
        <View style={{ backgroundColor: unlocked ? colors.surface : colors.surfaceAlt, borderRadius: radii.lg, marginBottom: spacing.md, ...(unlocked ? cardShadow : {}) }}>
          <View
            style={{
              borderWidth: unlocked ? 1 : 2,
              borderColor: unlocked ? colors.border : colors.textTertiary,
              borderStyle: unlocked ? 'solid' : 'dashed',
              borderRadius: radii.lg,
              padding: spacing.md,
              minHeight: 78,
              justifyContent: 'center',
              overflow: 'hidden',
              opacity: unlocked ? 1 : 0.85,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: unlocked ? colors.textPrimary : colors.textTertiary }}>
              {t('Compare Costs')}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textTertiary, marginTop: 3 }}>
              {unlocked
                ? `$${aiEstimate?.priceLow}–$${aiEstimate?.priceHigh} · cash vs insurance`
                : compareLockHint}
            </Text>
            <Text style={{ position: 'absolute', right: 10, bottom: 4, fontSize: 40, opacity: unlocked ? 1 : 0.5 }}>
              {unlocked ? '⚖️' : '🔒'}
            </Text>
          </View>
        </View>
      </Tappable>
    );
  };

  /** Explains what's still needed for Compare Costs and jumps the user there. */
  const compareLockSheet = () => {
    const needsEstimate = !aiEstimate;
    const needsInsurance = !hasInsurance;
    const stepRow = (done: boolean, title: string, hint: string) => (
      <View key={title} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 17 }}>{done ? '✅' : '⬜'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
          {done ? null : (
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 1, lineHeight: 18 }}>{hint}</Text>
          )}
        </View>
      </View>
    );
    return (
      <Modal
        visible={compareLockOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCompareLockOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'center', padding: spacing.xl }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg }}>
            <Text style={{ fontSize: 34, textAlign: 'center', marginBottom: spacing.sm }}>⚖️</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 6 }}>
              {needsEstimate && needsInsurance ? 'Two quick steps to unlock' : 'One more step to unlock'}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg }}>
              Cash vs insurance compares a real repair estimate against your actual policy, so we need both first.
            </Text>
            {stepRow(!needsEstimate, 'AI repair estimate', 'Snap photos of the damage — free, takes about 5 minutes.')}
            {stepRow(!needsInsurance, 'Insurance policy on file', 'Add it under More tab → Insurance policy (scan your card or type it in).')}
            {needsInsurance ? (
              <Tappable
                onPress={() => {
                  setCompareLockOpen(false);
                  navigateCrossTab(navigation, 'MoreTab', 'ProfInsurance');
                }}
                style={{ backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 13, alignItems: 'center', marginTop: spacing.sm }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.onPrimary }}>Add insurance policy →</Text>
              </Tappable>
            ) : null}
            {needsEstimate ? (
              <Tappable
                onPress={() => {
                  setCompareLockOpen(false);
                  navigation.navigate('CarDiagram');
                }}
                style={{
                  backgroundColor: needsInsurance ? colors.surface : colors.primary,
                  borderWidth: needsInsurance ? 1 : 0,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                  paddingVertical: 13,
                  alignItems: 'center',
                  marginTop: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: needsInsurance ? colors.textPrimary : colors.onPrimary }}>
                  Run AI repair estimate →
                </Text>
              </Tappable>
            ) : null}
            <Tappable onPress={() => setCompareLockOpen(false)} style={{ paddingVertical: 11, alignItems: 'center', marginTop: spacing.xs }}>
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>Not now</Text>
            </Tappable>
          </View>
        </View>
      </Modal>
    );
  };

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
        style={{ borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 84, justifyContent: 'center', overflow: 'hidden' }}
      >
        <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 5 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{badge}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 1 }}>{sub}</Text>
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
      <GuestBanner />
      {/* Greeting + active-car switcher (chip pinned top-right, consistent across tabs) */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Text style={{ flex: 1, fontSize: 27, fontWeight: '800', color: colors.textPrimary }}>
          {firstName ? `Hi ${firstName} 👋` : 'Hi 👋'}
        </Text>
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

      {/* AI Repair Estimate + Maintenance, side by side. */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {actionCard({
          title: t('AI Repair Estimate'),
          phrase: 'Free quote in 5 min',
          onPress: () => navigation.navigate('CarDiagram'),
        })}
        {actionCard({
          title: t('Maintenance'),
          phrase: 'Book service fast',
          icon: '🔧',
          onPress: () => navigation.navigate('MaintLanding'),
        })}
      </View>

      {/* Compare Costs — full width; locked until estimate + insurance exist. */}
      {compareCard()}
      {compareLockSheet()}

      {/* Deals & offers — compact section below the actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{t('Deals & offers')}</Text>
        <Tappable onPress={() => requireAuth('deals', () => navigation.navigate('BundleDeals'))} hitSlop={8}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>View all →</Text>
        </Tappable>
      </View>
      <PagedCarousel
        items={[
          dealItem('LIMITED · BUNDLE', 'Honda Fairfax Summer Bundle', 'Oil + rotation + 27-pt check · Save $40', ['#E0A93E', '#C2871F'], 'honda-fairfax'),
          dealItem('20% OFF', 'AutoFix Pro — new customer', 'Free inspection w/ any oil change', [palette.primary, palette.primaryDark], 'autofix-pro'),
          dealItem('SPONSORED', 'Vienna Auto Care — $30 off', 'Brakes, batteries & A/C service', ['#1f9e75', '#13795a'], 'vienna-auto'),
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
