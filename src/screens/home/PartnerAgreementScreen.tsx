import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Badge, Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'PartnerAgreement'>;

/** Wireframe s-partner-agreement: anti-poaching terms shops accept at sign-up. */
export function PartnerAgreementScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [agreed, setAgreed] = useState(false);

  const clause = (n: string, tone: string, title: string, body: string) => (
    <Card key={title} style={{ padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: tone }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 }}>
        {n} · {title}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>{body}</Text>
    </Card>
  );

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.xs }}>
        <Badge label="For shops" variant="primarySoft" />
      </View>
      <Text style={{ fontSize: 12, color: colors.textTertiary, lineHeight: 18, marginBottom: spacing.md }}>
        Every auto shop accepts this when they sign up. It keeps the marketplace fair for customers
        and shops alike.
      </Text>
      {clause('1', colors.danger, 'No customer poaching', "Shops may not divert AutoMate-quoted customers off-platform, tell them to stop using AutoMate, or offer '10% below the quote' side deals to bypass the app.")}
      {clause('2', colors.success, 'Honor your quotes', 'Estimates sent through AutoMate are binding ± genuine in-person inspection findings, which must be messaged before any extra charge.')}
      {clause('3', colors.primary, 'Deposits & no-shows', 'Customer deposits are released to the shop only on a genuine no-show. Honor reschedules/cancellations made 12h+ ahead.')}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderColor: colors.warning,
          borderWidth: 1,
          borderRadius: radii.sm,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warningDeep, marginBottom: 3 }}>
          ⚠ Penalties for abuse
        </Text>
        <Text style={{ fontSize: 12, color: colors.warningDeep, lineHeight: 18 }}>
          Poaching or quote-dodging → warning → suspension → permanent removal plus a recovery fee.
        </Text>
      </View>
      <Tappable
        onPress={() => setAgreed((v) => !v)}
        style={{ flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.sm, padding: spacing.md, marginBottom: spacing.sm }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            borderWidth: 1.5,
            borderColor: agreed ? colors.primary : colors.border,
            backgroundColor: agreed ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {agreed && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
        </View>
        <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary }}>
          As the shop owner, I agree to these terms.
        </Text>
      </Tappable>
      <PrimaryButton label="Accept & continue →" disabled={!agreed} onPress={() => navigation.goBack()} />
    </Screen>
  );
}
