import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';

import { SettingsRow, TogglePill } from '../../components/SettingsRow';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { accountService } from '../../services';
import { USER } from '../../services/mock/data';
import { ThemeMode, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { confirmAction, showAlert } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfSettings'>;

type NotifKey = 'quotes' | 'service' | 'community' | 'streak';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'Auto' },
];

/** Wireframe s-prof-settings: account, notifications, preferences, legal, sign out. */
export function ProfSettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const language = useAppStore((s) => s.language);
  const distanceUnit = useAppStore((s) => s.distanceUnit);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const signOut = useAppStore((s) => s.signOut);
  const authedUser = useAppStore((s) => s.user);
  const email = authedUser?.email ?? USER.email;
  const phone = authedUser ? authedUser.phone ?? '' : USER.phone;

  // Wireframe defaults: community replies off, the rest on.
  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
    quotes: true,
    service: true,
    community: false,
    streak: true,
  });
  const flip = (key: NotifKey) => setNotif((n) => ({ ...n, [key]: !n[key] }));

  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <Screen>
      <SectionLabel>Account</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <SettingsRow icon="user" label="Edit profile" onPress={() => navigation.navigate('ProfEditProfile')} />
        <SettingsRow
          icon="mail"
          label="Change email"
          value={email}
          onPress={() => navigation.navigate('ProfChangeEmail')}
        />
        <SettingsRow
          icon="phone"
          label="Change phone number"
          value={phone}
          onPress={() => navigation.navigate('ProfChangePhone')}
        />
        <SettingsRow
          icon="key"
          label="Change password"
          onPress={() => navigation.navigate('ProfChangePassword')}
        />
        <SettingsRow
          icon="globe"
          label="Linked accounts"
          value="Google"
          onPress={() => navigation.navigate('ProfLinkedAccounts')}
          last
        />
      </Card>

      <SectionLabel>Notifications</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <SettingsRow
          icon="bell"
          label="Quote alerts"
          right={<TogglePill value={notif.quotes} onToggle={() => flip('quotes')} />}
        />
        <SettingsRow
          icon="wrench"
          label="Service reminders"
          right={<TogglePill value={notif.service} onToggle={() => flip('service')} />}
        />
        <SettingsRow
          icon="pencil"
          label="Community replies"
          right={<TogglePill value={notif.community} onToggle={() => flip('community')} />}
        />
        <SettingsRow
          icon="flame"
          label="Streak reminders"
          right={<TogglePill value={notif.streak} onToggle={() => flip('streak')} />}
          last
        />
      </Card>

      <SectionLabel>App preferences</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {/* Appearance: dark (default) / light / follow the device. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }}>
          <View style={{ width: 28, marginRight: spacing.sm, alignItems: 'center' }}>
            <Icon name={dark ? 'moon' : 'sun'} size={20} color={colors.textSecondary} />
          </View>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>Appearance</Text>
          <View
            accessibilityRole="radiogroup"
            style={{ flexDirection: 'row', backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, padding: 3 }}
          >
            {THEME_OPTIONS.map((opt) => {
              const on = themeMode === opt.value;
              return (
                <Tappable
                  key={opt.value}
                  onPress={() => setThemeMode(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${opt.label} appearance`}
                  noFeedback
                  style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: on ? colors.primary : 'transparent' }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: on ? colors.onPrimary : colors.textSecondary }}>{opt.label}</Text>
                </Tappable>
              );
            })}
          </View>
        </View>
        <SettingsRow
          icon="globe"
          label="Language"
          value={language}
          onPress={() => navigation.navigate('ProfLanguage')}
        />
        <SettingsRow
          icon="gauge"
          label="Distance units"
          value={distanceUnit === 'mi' ? 'Miles' : 'Kilometers'}
          onPress={() => navigation.navigate('ProfDistance')}
          last
        />
      </Card>

      <SectionLabel>Developer</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <SettingsRow
          icon="sparkle"
          label="Supabase demo"
          value="Direct supabase-js"
          onPress={() => navigation.navigate('SupabaseDemo')}
          last
        />
      </Card>

      <SectionLabel>Support & legal</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <SettingsRow icon="alert" label="Help center" onPress={() => navigation.navigate('ProfHelpCenter')} />
        <SettingsRow icon="file" label="Terms of service" onPress={() => navigation.navigate('ProfTerms')} />
        <SettingsRow icon="lock" label="Privacy policy" onPress={() => navigation.navigate('ProfPrivacy')} last />
      </Card>

      {/* Sign out */}
      <Tappable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => ({
          backgroundColor: colors.dangerSurface,
          borderRadius: radii.sm,
          borderWidth: 0.5,
          borderColor: colors.dangerBorder,
          paddingVertical: 13,
          alignItems: 'center',
          marginBottom: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.danger }}>Sign out</Text>
      </Tappable>
      <Tappable
        onPress={() =>
          confirmAction(
            'Delete account',
            'This permanently deletes your AutoMate account and all its data — cars, quotes, bookings, points and membership. This cannot be undone.',
            () => {
              // Server-side removal first (App Store 5.1.1(v)); then clear the
              // local session regardless so the device never keeps a ghost login.
              void accountService
                .deleteAccount()
                .catch(() => showAlert('Account deletion', 'We could not reach the server — your account will be removed and you have been signed out.'))
                .finally(() => signOut());
            },
            'Delete account',
          )
        }
        style={{ alignItems: 'center', marginBottom: spacing.sm }}
      >
        <Text style={{ fontSize: 14, color: colors.disabled }}>Delete account</Text>
      </Tappable>
      <Text style={{ fontSize: 13, color: colors.disabled, textAlign: 'center' }}>
        AutoMate v1.0.0 · Build 2027.1
      </Text>

      {/* Sign-out bottom sheet (wireframe #so-popup) */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Tappable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'flex-end' }}
          onPress={() => setSheetVisible(false)}
        >
          <Tappable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: radii.sheet,
              borderTopRightRadius: radii.sheet,
              padding: spacing.xl,
              paddingBottom: spacing.xxxl,
            }}
          >
            <View
              style={{
                width: 44,
                height: 5,
                borderRadius: 3,
                backgroundColor: colors.border,
                alignSelf: 'center',
                marginBottom: spacing.lg,
              }}
            />
            <Text
              style={{
                fontSize: 19,
                fontWeight: '700',
                color: colors.textPrimary,
                textAlign: 'center',
                marginBottom: 6,
              }}
            >
              Sign out?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textTertiary,
                textAlign: 'center',
                marginBottom: spacing.xl,
              }}
            >
              You'll need to log back in.
            </Text>
            <Tappable
              onPress={() => {
                setSheetVisible(false);
                signOut();
              }}
              style={({ pressed }) => ({
                backgroundColor: colors.danger,
                borderRadius: radii.md,
                paddingVertical: 15,
                alignItems: 'center',
                marginBottom: spacing.sm,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Sign out</Text>
            </Tappable>
            <Tappable
              onPress={() => setSheetVisible(false)}
              style={({ pressed }) => ({
                backgroundColor: colors.surface,
                borderRadius: radii.md,
                borderWidth: 0.5,
                borderColor: colors.border,
                paddingVertical: 15,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: colors.textSecondary }}>Cancel</Text>
            </Tappable>
          </Tappable>
        </Tappable>
      </Modal>
    </Screen>
  );
}
