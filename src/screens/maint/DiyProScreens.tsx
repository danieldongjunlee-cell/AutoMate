import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormSheet } from '../../components/FormSheet';
import { Tappable } from '../../components/Tappable';

import { Card, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { MaintStackParamList } from '../../navigation/types';
import { PRO_GUIDES, ProGuide } from '../../services/mock/data';
import { DIY_GUIDES, DiyGuide, matchGuide } from '../../services/mock/diyGuides';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList>;

/** Gold "PRO" pill shown on the unlocked benefit screens (wireframe header right). */
export function ProBadge() {
  return (
    <LinearGradient
      colors={[palette.warning, '#F5B947']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: radii.pill,
        paddingHorizontal: 12,
        paddingVertical: 3,
        alignSelf: 'flex-end',
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '800', color: palette.dark }}>PRO</Text>
    </LinearGradient>
  );
}

/** One unlocked guide row (s-diy-guides; also the unlocked maint-diy list). */
export function ProGuideRow({ guide }: { guide: ProGuide }) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={() =>
        Alert.alert(
          `${guide.icon} ${guide.title}`,
          `${guide.sub}\n${guide.time} · ${guide.difficulty}\n\nFull step-by-step guide content ships with the backend.`,
        )
      }
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radii.sm,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 21 }}>{guide.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
          {guide.title}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{guide.sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primaryDark }}>
          {guide.time}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: guide.difficulty === 'Easy' ? colors.successDark : palette.warningMid,
          }}
        >
          {guide.difficulty}
        </Text>
      </View>
    </Tappable>
  );
}

/** One readable guide row — tapping opens the full step-by-step reader. */
export function DiyGuideRow({ guide, onPress }: { guide: DiyGuide; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radii.sm,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 21 }}>{guide.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
          {guide.title}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          {guide.steps.length} steps · {guide.tools.length} tool
          {guide.tools.length === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primaryDark }}>
          {guide.minutes} min
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: guide.difficulty === 'Easy' ? colors.successDark : palette.warningMid,
          }}
        >
          {guide.difficulty}
        </Text>
      </View>
    </Tappable>
  );
}

/** Full readable guide content (tools + numbered steps + tip) inside a FormSheet. */
export function DiyGuideSheet({ guide, onClose }: { guide: DiyGuide; onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <FormSheet visible onClose={onClose} title={`${guide.emoji}  ${guide.title}`}>
      <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: spacing.md }}>
          {guide.minutes} min · {guide.difficulty} · {guide.steps.length} steps
        </Text>

        <SectionLabel>What you’ll need</SectionLabel>
        <View style={{ marginBottom: spacing.md }}>
          {guide.tools.map((t) => (
            <View
              key={t}
              style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: 4, alignItems: 'flex-start' }}
            >
              <Text style={{ fontSize: 13, color: colors.primaryDark }}>•</Text>
              <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        <SectionLabel>Steps</SectionLabel>
        <View style={{ marginBottom: spacing.sm }}>
          {guide.steps.map((s, i) => (
            <View
              key={i}
              style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: colors.primarySurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primaryDark }}>
                  {i + 1}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 21 }}>
                {s}
              </Text>
            </View>
          ))}
        </View>

        {guide.tip ? (
          <View
            style={{
              backgroundColor: colors.primarySurface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.primaryLight,
              padding: spacing.md,
              marginTop: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.primaryDeep, lineHeight: 19 }}>
              💡 {guide.tip}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Tappable
        onPress={onClose}
        style={({ pressed }) => ({
          marginTop: spacing.md,
          backgroundColor: colors.primary,
          borderRadius: radii.sm,
          paddingVertical: 12,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onPrimary }}>Done</Text>
      </Tappable>
    </FormSheet>
  );
}

/** Wireframe s-diy-guides: the full unlocked library with readable, follow-along guides. */
export function DiyGuidesScreen() {
  const [selected, setSelected] = useState<DiyGuide | null>(null);
  return (
    <Screen>
      <View style={{ marginBottom: spacing.sm }}>
        <ProBadge />
      </View>
      {DIY_GUIDES.map((g) => (
        <DiyGuideRow key={g.id} guide={g} onPress={() => setSelected(g)} />
      ))}
      {selected ? <DiyGuideSheet guide={selected} onClose={() => setSelected(null)} /> : null}
    </Screen>
  );
}

/** Wireframe s-diy-match: AI damage→guide matching. */
export function DiyMatchScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<DiyGuide | null>(null);
  return (
    <Screen>
      <View style={{ marginBottom: spacing.sm }}>
        <ProBadge />
      </View>
      <View
        style={{
          backgroundColor: palette.aiPanel,
          borderRadius: radii.md,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 34, marginBottom: 6 }}>🤖</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 }}>
          Your damage photos, auto-matched
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', textAlign: 'center' }}>
          We scan every repair request and suggest a DIY option when one exists
        </Text>
      </View>

      <SectionLabel>Matched from your requests</SectionLabel>
      <View
        style={{
          backgroundColor: '#E8F5EF',
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.success,
          padding: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 21 }}>🚗</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.successDeep }}>
              Rear bumper dent → Guide #1
            </Text>
            <Text style={{ fontSize: 12, color: colors.successDark }}>
              94% match · DIY could save you ~$260
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Tappable
            onPress={() => setSelected(matchGuide('Rear bumper dent'))}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.success,
              borderRadius: radii.sm,
              paddingVertical: 10,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Open guide</Text>
          </Tappable>
          <Tappable
            onPress={() => navigateCrossTab(navigation, 'HomeTab', 'DealerQuotes')}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              borderRadius: radii.sm,
              paddingVertical: 10,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Compare to quotes</Text>
          </Tappable>
        </View>
      </View>

      <Tappable onPress={() => setSelected(matchGuide('L. Fender scratch'))}>
        <Card style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ fontSize: 21 }}>🖌️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textTertiary }}>
              L. Fender scratch → Guide #3
            </Text>
            <Text style={{ fontSize: 12, color: colors.textPlaceholder }}>
              81% match · surface-level, good DIY candidate
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.disabled }}>›</Text>
        </Card>
      </Tappable>

      {selected ? <DiyGuideSheet guide={selected} onClose={() => setSelected(null)} /> : null}
    </Screen>
  );
}

const TOOLS = [
  { icon: '🪠', title: 'Dent puller kit (suction)', sub: 'AutoZone $14.99 · Amazon $12.49 ⭐ best' },
  { icon: '🔥', title: 'Heat gun (or hair dryer works)', sub: 'Harbor Freight $19.99 · you may already own one' },
  { icon: '🧤', title: 'Microfiber cloths (6-pack)', sub: 'Walmart $5.97 · Amazon $6.49' },
  { icon: '🧼', title: 'Isopropyl alcohol 91%', sub: 'CVS $3.29 · prep the surface first' },
];

/** Wireframe s-diy-tools: tool/parts shopping list with price comparisons. */
export function DiyToolsScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={{ marginBottom: spacing.sm }}>
        <ProBadge />
      </View>
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md }}>
        For: <Text style={{ fontWeight: '700', color: colors.primaryDark }}>Bumper dent removal</Text>{' '}
        (your matched guide)
      </Text>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {TOOLS.map((t, i) => (
          <View
            key={t.title}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.md,
              borderBottomWidth: i < TOOLS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 18 }}>{t.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                {t.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>{t.sub}</Text>
            </View>
            <Text style={{ fontSize: 15, color: colors.success }}>✔</Text>
          </View>
        ))}
      </Card>
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 20 }}>💰</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDeep }}>
            Total tools: ~$42
          </Text>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>
            vs. $285–480 shop quotes → save up to $438
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const ROADMAP = [
  { id: 'fg-brakes', icon: '🔊', title: 'Squeaky brake diagnosis', sub: 'In progress · ships May 2027', votes: 78 },
  { id: 'fg-ac', icon: '❄️', title: 'AC recharge basics', sub: 'Planned · summer 2027', votes: 64 },
  { id: 'fg-oil', icon: '🛢️', title: 'Home oil change setup', sub: 'Voting open', votes: 51 },
  { id: 'fg-filter', icon: '🔌', title: 'Replace cabin air filter', sub: 'Voting open', votes: 37 },
];

/** Wireframe s-diy-future: roadmap + vote-on-guides. */
export function DiyFutureScreen() {
  const { colors } = useTheme();
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  return (
    <Screen>
      <View style={{ marginBottom: spacing.sm }}>
        <ProBadge />
      </View>
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.primaryDark, lineHeight: 19 }}>
          ♾️ New guides ship monthly — all included in your AutoMate Pro membership. Vote below for
          what we build next!
        </Text>
      </View>
      {ROADMAP.map((g) => {
        const on = !!voted[g.id];
        return (
          <Card
            key={g.id}
            style={{
              padding: spacing.md,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 20 }}>{g.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                {g.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>{g.sub}</Text>
            </View>
            <Tappable
              onPress={() => setVoted((v) => ({ ...v, [g.id]: !v[g.id] }))}
              style={({ pressed }) => ({
                backgroundColor: on ? colors.primary : colors.primarySurface,
                borderRadius: radii.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.primaryLight,
                paddingHorizontal: 12,
                paddingVertical: 6,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: on ? colors.onPrimary : colors.primaryDark,
                }}
              >
                ▲ {g.votes + (on ? 1 : 0)}
              </Text>
              <Text style={{ fontSize: 10, color: on ? colors.onPrimary : colors.textTertiary }}>
                votes
              </Text>
            </Tappable>
          </Card>
        );
      })}
    </Screen>
  );
}
