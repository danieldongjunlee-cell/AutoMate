import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppleLogo, GoogleLogo } from '../../components/BrandLogos';
import { SocialSignInSheet, SocialProvider } from '../../components/SocialSignInSheet';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import {
  HELP_TOPICS,
  LANGUAGES,
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  USER,
} from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

/** Wireframe s-prof-linked-accounts. Connect opens the branded sign-in sheet
 * (user-feedback pass 1) — Google/Apple run authService.socialSignIn. */
export function ProfLinkedAccountsScreen() {
  const { colors } = useTheme();
  const [sheetProvider, setSheetProvider] = useState<SocialProvider | null>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({
    Google: true,
    Apple: false,
  });
  const rows = [
    {
      logo: <GoogleLogo size={24} />,
      name: 'Google',
      sub: USER.googleEmail,
      provider: 'google' as const,
    },
    {
      logo: <AppleLogo size={24} color={colors.textPrimary} />,
      name: 'Apple',
      sub: connected.Apple ? 'demo@automate.app' : 'Not connected',
      provider: 'apple' as const,
    },
  ];
  return (
    <Screen>
      <Card style={{ overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <View
            key={row.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.md,
              borderBottomWidth: i < rows.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <View style={{ width: 34, alignItems: 'flex-start' }}>{row.logo}</View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                {row.name}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>{row.sub}</Text>
            </View>
            {connected[row.name] ? (
              <View
                style={{
                  backgroundColor: colors.successSurface,
                  borderRadius: radii.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.successDeep }}>
                  Connected
                </Text>
              </View>
            ) : (
              <Tappable
                onPress={() => setSheetProvider(row.provider)}
                style={{
                  backgroundColor: colors.primarySurface,
                  borderRadius: radii.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primaryDark }}>
                  Connect
                </Text>
              </Tappable>
            )}
          </View>
        ))}
      </Card>

      <SocialSignInSheet
        provider={sheetProvider}
        onClose={() => setSheetProvider(null)}
        onSignedIn={(provider) => {
          setSheetProvider(null);
          setConnected((c) => ({ ...c, [provider === 'google' ? 'Google' : 'Apple']: true }));
        }}
      />
    </Screen>
  );
}

/** Wireframe s-prof-help-center: 4 topics → the help articles (s-help-*). */
export function ProfHelpCenterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'ProfHelpCenter'>>();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  return (
    <Screen>
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 22 }}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search help articles..."
          placeholderTextColor={colors.textPlaceholder}
          style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}
        />
      </View>
      <SectionLabel>Popular topics</SectionLabel>
      <Card style={{ overflow: 'hidden' }}>
        {HELP_TOPICS.map((topic, i) => (
          <Tappable
            key={topic.title}
            onPress={() => navigation.navigate(topic.route)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.md,
              borderBottomWidth: i < HELP_TOPICS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 17, marginRight: spacing.md }}>{topic.icon}</Text>
            <Text style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}>{topic.title}</Text>
            <Text style={{ fontSize: 17, color: colors.disabled }}>›</Text>
          </Tappable>
        ))}
      </Card>
    </Screen>
  );
}

function LegalDoc({ sections }: { sections: { heading: string; body: string }[] }) {
  const { colors } = useTheme();
  return (
    <Screen>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.sm }}>
        Last updated: January 15, 2027
      </Text>
      <Card style={{ padding: spacing.lg }}>
        {sections.map((s, i) => (
          <View key={s.heading} style={{ marginBottom: i < sections.length - 1 ? spacing.lg : 0 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 }}>
              {s.heading}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{s.body}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

/** Wireframe s-prof-terms. */
export function ProfTermsScreen() {
  return <LegalDoc sections={TERMS_SECTIONS} />;
}

/** Wireframe s-prof-privacy. */
export function ProfPrivacyScreen() {
  return <LegalDoc sections={PRIVACY_SECTIONS} />;
}

/** Wireframe s-prof-language (selection persisted in the app store). */
export function ProfLanguageScreen() {
  const { colors } = useTheme();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  return (
    <Screen>
      <Card style={{ overflow: 'hidden' }}>
        {LANGUAGES.map((lang, i) => (
          <Tappable
            key={lang.name}
            onPress={() => setLanguage(lang.name)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.md,
              borderBottomWidth: i < LANGUAGES.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 18, marginRight: spacing.md }}>{lang.flag}</Text>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: lang.name === language ? colors.textPrimary : colors.textTertiary,
              }}
            >
              {lang.name}
            </Text>
            {lang.name === language ? (
              <Text style={{ fontSize: 18, color: colors.primary }}>✔</Text>
            ) : null}
          </Tappable>
        ))}
      </Card>
    </Screen>
  );
}

/** Wireframe s-prof-distance (selection persisted in the app store). */
export function ProfDistanceScreen() {
  const { colors } = useTheme();
  const unit = useAppStore((s) => s.distanceUnit);
  const setUnit = useAppStore((s) => s.setDistanceUnit);
  const rows = [
    { id: 'mi' as const, name: 'Miles', sub: 'Used in the United States' },
    { id: 'km' as const, name: 'Kilometers', sub: 'Used internationally' },
  ];
  return (
    <Screen>
      <Card style={{ overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <Tappable
            key={row.id}
            onPress={() => setUnit(row.id)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.lg,
              borderBottomWidth: i < rows.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: unit === row.id ? '600' : '400',
                  color: unit === row.id ? colors.textPrimary : colors.textTertiary,
                }}
              >
                {row.name}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textPlaceholder, marginTop: 2 }}>
                {row.sub}
              </Text>
            </View>
            {unit === row.id ? <Text style={{ fontSize: 18, color: colors.primary }}>✔</Text> : null}
          </Tappable>
        ))}
      </Card>
    </Screen>
  );
}
