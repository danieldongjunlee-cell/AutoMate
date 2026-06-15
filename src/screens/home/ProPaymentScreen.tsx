import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ProcessingOverlay } from '../../components/Skeleton';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { PRO_PLANS } from '../../store/useAppStore';
import { proService } from '../../services';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ProPayment'>;
type Rt = RouteProp<HomeStackParamList, 'ProPayment'>;

/** Pro subscription checkout (pro-subscribe → pro-payment → pro-success). */
export function ProPaymentScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);

  const plan = params?.plan ?? 'annual';
  const p = PRO_PLANS[plan];
  const price = `$${(p.priceCents / 100).toFixed(2)}`;

  const pay = async () => {
    setBusy(true);
    await proService.subscribe(plan);
    setBusy(false);
    navigation.navigate('ProSuccess');
  };

  const row = (label: string, value: string, bold?: boolean) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.divider,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? '800' : '600', color: colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );

  return (
    <Screen>
      <SectionLabel>Order summary</SectionLabel>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        {row('⭐ AutoMate Pro', p.label)}
        {row('Billing', plan === 'annual' ? 'Yearly · cancel anytime' : 'Monthly · cancel anytime')}
        {row('Total', `${price}${plan === 'annual' ? '/yr' : '/mo'}`, true)}
      </Card>
      <SectionLabel>Pay with</SectionLabel>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text>💳</Text>
        <Text style={{ flex: 1, fontSize: 13, color: colors.primary, fontWeight: '600' }}>
          Visa ending 4242
        </Text>
        <Text style={{ color: colors.primary }}>✔</Text>
      </Card>
      <PrimaryButton label={`Pay ${price}${plan === 'annual' ? '/yr' : '/mo'} →`} loading={busy} onPress={pay} />
      <ProcessingOverlay visible={busy} label="Activating Pro…" />
    </Screen>
  );
}
