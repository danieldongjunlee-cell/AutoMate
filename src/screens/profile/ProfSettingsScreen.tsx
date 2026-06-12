import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Modal, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { SettingsRow, TogglePill } from '../../components/SettingsRow';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { USER } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfSettings'>;

type NotifKey = 'quotes' | 'service' | 'community' | 'streak';

/** Wireframe s-prof-settings: account, notifications, preferences, legal, sign out. */
export function ProfSettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const language = useAppStore((s) => s.language);
  const distanceUnit = useAppStore((s) => s.distanceUnit);
  const signOut = useAppStore((s) => s.signOut);

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
        <SettingsRow icon="👤" label="Edit profile" onPress={() => navigation.navigate('ProfEditProfile')} />
        <SettingsRow
          icon="✉️"
          label="Change email"
          value={USER.email}
          onPress={() => navigation.navigate('ProfChangeEmail')}
        />
        <SettingsRow
          icon="📱"
          label="Change phone number"
          value={USER.phone}
          onPress={() => navigation.navigate('ProfChangePhone')}
        />
        <SettingsRow
          icon="🔑"
          label="Change password"
          onPress={() => navigation.navigate('ProfChangePassword')}
        />
        <SettingsRow
          icon="🔗"
          label="Linked accounts"
          value="Google"
          onPress={() => navigation.navigate('ProfLinkedAccounts')}
          last
        />
      </Card>

      <SectionLabel>Notifications</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <SettingsRow
          icon="🔔"
          label="Quote alerts"
          right={<TogglePill value={notif.quotes} onToggle={() => flip('quotes')} />}
        />
        <SettingsRow
          icon="🔧"
          label="Service reminders"
          right={<TogglePill value={notif.service} onToggle={() => flip('service')} />}
        />
        <SettingsRow
          icon="📝"
          label="Community replies"
          right={<TogglePill value={notif.community} onToggle={() => flip('community')} />}
        />
        <SettingsRow
          icon="🔥"
          label="Streak reminders"
          right={<TogglePill value={notif.streak} onToggle={() => flip('streak')} />}
          last
        />
      </Card>

      <SectionLabel>App preferences</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <SettingsRow
          icon="🌙"
          label="Dark mode"
          right={<TogglePill value={darkMode} onToggle={toggleDarkMode} />}
        />
        <SettingsRow
          icon="🌐"
          label="Language"
          value={language}
          onPress={() => navigation.navigate('ProfLanguage')}
        />
        <SettingsRow
          icon="📏"
          label="Distance units"
          value={distanceUnit === 'mi' ? 'Miles' : 'Kilometers'}
          onPress={() => navigation.navigate('ProfDistance')}
          last
        />
      </Card>

      <SectionLabel>Support & legal</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <SettingsRow icon="❓" label="Help center" onPress={() => navigation.navigate('ProfHelpCenter')} />
        <SettingsRow icon="📄" label="Terms of service" onPress={() => navigation.navigate('ProfTerms')} />
        <SettingsRow icon="🔒" label="Privacy policy" onPress={() => navigation.navigate('ProfPrivacy')} last />
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
        onPress={() => Alert.alert('Delete account', 'Account deletion comes with the backend.')}
        style={{ alignItems: 'center', marginBottom: spacing.sm }}
      >
        <Text style={{ fontSize: 13, color: colors.disabled }}>Delete account</Text>
      </Tappable>
      <Text style={{ fontSize: 12, color: colors.disabled, textAlign: 'center' }}>
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
