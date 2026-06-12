import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Screen, SectionLabel } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import {
  HELP_TOPICS,
  LANGUAGES,
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  USER,
} from '../../services/mock/data';
import { radii, spacing, useTheme } from '../../theme';

/** Wireframe s-prof-linked-accounts. */
export function ProfLinkedAccountsScreen() {
  const { colors } = useTheme();
  const rows = [
    { icon: 'G', name: 'Google', sub: USER.googleEmail, connected: true },
    { icon: '', name: 'Apple', sub: 'Not connected', connected: false },
    { icon: 'f', name: 'Facebook', sub: 'Not connected', connected: false },
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
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                width: 34,
                color: colors.textPrimary,
              }}
            >
              {row.icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                {row.name}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>{row.sub}</Text>
            </View>
            {row.connected ? (
              <View
                style={{
                  backgroundColor: colors.successSurface,
                  borderRadius: radii.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.successDeep }}>
                  Connected
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => Alert.alert('Connect', `${row.name} sign-in comes with the backend.`)}
                style={({ pressed }) => ({
                  backgroundColor: colors.primarySurface,
                  borderRadius: radii.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primaryDark }}>
                  Connect
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </Card>
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
          <Pressable
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
          </Pressable>
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

/** Wireframe s-prof-language. */
export function ProfLanguageScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(LANGUAGES.findIndex((l) => l.selected));
  return (
    <Screen>
      <Card style={{ overflow: 'hidden' }}>
        {LANGUAGES.map((lang, i) => (
          <Pressable
            key={lang.name}
            onPress={() => setSelected(i)}
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
                color: i === selected ? colors.textPrimary : colors.textTertiary,
              }}
            >
              {lang.name}
            </Text>
            {i === selected ? (
              <Text style={{ fontSize: 18, color: colors.primary }}>✔</Text>
            ) : null}
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}

/** Wireframe s-prof-distance. */
export function ProfDistanceScreen() {
  const { colors } = useTheme();
  const [unit, setUnit] = useState<'mi' | 'km'>('mi');
  const rows = [
    { id: 'mi' as const, name: 'Miles', sub: 'Used in the United States' },
    { id: 'km' as const, name: 'Kilometers', sub: 'Used internationally' },
  ];
  return (
    <Screen>
      <Card style={{ overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <Pressable
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
              <Text style={{ fontSize: 13, color: colors.textPlaceholder, marginTop: 2 }}>
                {row.sub}
              </Text>
            </View>
            {unit === row.id ? <Text style={{ fontSize: 18, color: colors.primary }}>✔</Text> : null}
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}
