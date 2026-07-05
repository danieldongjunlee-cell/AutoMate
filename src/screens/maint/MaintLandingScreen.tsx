import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintLanding'>;

/**
 * Maintenance entry from the Home tab: "Book a service" and "View maintenance
 * dashboard" side by side — white cards with the icon in the bottom-right, like
 * the Home tab. Both screens open for guests; the gate is inside (shop pick /
 * dashboard buttons).
 */
export function MaintLandingScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const cardShadow = {
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  } as const;

  const card = (opts: { title: string; sub: string; icon: string; onPress: () => void }) => (
    <Tappable onPress={opts.onPress} style={{ flex: 1 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, ...cardShadow }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.md,
            minHeight: 132,
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{opts.title}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPlaceholder, marginTop: 3 }}>
            {opts.sub}
          </Text>
          <Text style={{ position: 'absolute', right: 6, bottom: 2, fontSize: 46 }}>{opts.icon}</Text>
        </View>
      </View>
    </Tappable>
  );

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4, marginTop: spacing.sm }}>
        Maintenance
      </Text>
      <Text style={{ fontSize: 15, color: colors.textTertiary, marginBottom: spacing.lg }}>
        Book a service or check on your car&apos;s health.
      </Text>

      {/* Book a service (left) · View maintenance dashboard (right) */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {card({
          title: 'Book a service',
          sub: 'Oil, tires, brakes, inspection & more',
          icon: '📅',
          onPress: () => navigation.navigate('MaintServiceType'),
        })}
        {card({
          title: 'View maintenance dashboard',
          sub: 'Health, value, history & DIY',
          icon: '📊',
          onPress: () => navigation.navigate('MaintDashboard'),
        })}
      </View>
    </Screen>
  );
}
