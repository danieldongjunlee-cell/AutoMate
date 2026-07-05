import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Badge, Card, Screen } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { PRO_PLANS, useAppStore } from '../../store/useAppStore';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ProSuccess'>;
type Route = RouteProp<HomeStackParamList, 'ProSuccess'>;

/** Wireframe s-pro-success: Pro activated → back to booking (or available quotes). */
export function ProSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const returnTo = useRoute<Route>().params?.returnTo;
  const { colors } = useTheme();
  const plan = useAppStore((s) => s.proPlan) ?? 'annual';
  const p = PRO_PLANS[plan];
  // Where to send the user after activating Pro, based on where they came from:
  // the More tab → Profile, the maintenance DIY tips → Maintenance, the
  // post-submit DIY lock → quotes, otherwise back into the booking-deposit flow.
  const toProfile = returnTo === 'ProfHub';
  const toMaint = returnTo === 'MaintDashboard';
  const toQuotes = returnTo === 'DealerQuotes';

  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: colors.successSurface,
            borderWidth: 2.5,
            borderColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 28 }}>⭐</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.successDeep }}>You're a Pro!</Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center' }}>
          Security deposits are now waived on all your bookings.
        </Text>
      </View>
      <Card style={{ padding: spacing.md, marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ fontSize: 18 }}>⭐</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
            AutoMate Pro · {p.label}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>{p.per} · cancel anytime</Text>
        </View>
        <Badge label="Active" variant="success" />
      </Card>
      <PrimaryButton
        variant="success"
        label={
          toProfile
            ? 'Back to More →'
            : toMaint
              ? 'Back to maintenance →'
              : toQuotes
                ? 'View available quotes →'
                : 'Back to confirm booking →'
        }
        onPress={() => {
          if (toProfile) navigateCrossTab(navigation, 'MoreTab', 'ProfHub');
          else if (toMaint) navigation.navigate('MaintDashboard');
          else if (toQuotes) navigation.navigate('DealerQuotes');
          else navigation.navigate('BookDeposit', { kind: 'repair', next: 'BookingConfirm' });
        }}
      />
    </Screen>
  );
}
