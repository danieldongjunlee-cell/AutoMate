import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { SectionLabel, Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'DiyConfirm'>;

const BENEFIT_LINKS: {
  icon: string;
  title: string;
  sub: string;
  route: 'DiyGuides' | 'DiyMatch' | 'DiyTools' | 'DiyFuture';
}[] = [
  { icon: '📚', title: 'All 12 DIY repair guides', sub: 'Browse the full unlocked library', route: 'DiyGuides' },
  { icon: '🤖', title: 'AI damage-to-guide matching', sub: 'Your photos → the right guide instantly', route: 'DiyMatch' },
  { icon: '🛠️', title: 'Tool & parts shopping lists', sub: 'Exact products with price comparisons', route: 'DiyTools' },
  { icon: '♾️', title: 'All future guides included', sub: "What's coming next · vote on topics", route: 'DiyFuture' },
];

/** Wireframe s-diy-confirm: "You're a Pro member!" + 4 benefit links. */
export function DiyConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
        <LinearGradient
          colors={[palette.warning, '#F5B947']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.sm,
            shadowColor: palette.warning,
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 38 }}>🔓</Text>
        </LinearGradient>
        <Text style={{ fontSize: 23, fontWeight: '800', color: colors.textPrimary, marginBottom: 3 }}>
          You're a Pro member!
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
          $10.00 paid · Lifetime access unlocked
        </Text>
      </View>

      <SectionLabel>Explore your benefits</SectionLabel>
      {BENEFIT_LINKS.map((b) => (
        <Tappable
          key={b.route}
          onPress={() => navigation.navigate(b.route)}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: spacing.md,
            marginBottom: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 24 }}>{b.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
              {b.title}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>{b.sub}</Text>
          </View>
          <Text style={{ fontSize: 17, color: colors.primary }}>→</Text>
        </Tappable>
      ))}

      <PrimaryButton
        label="Start exploring →"
        onPress={() => navigation.navigate('DiyGuides')}
        style={{ marginTop: spacing.xs }}
      />
    </Screen>
  );
}
