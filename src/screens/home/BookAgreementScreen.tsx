import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { depositForBooking } from '../../store/useAppStore';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'BookAgreement'>;
type Rt = RouteProp<HomeStackParamList, 'BookAgreement'>;

/** Wireframe s-book-agreement: single ToS consent before booking. */
export function BookAgreementScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { colors } = useTheme();
  const isPro = useAppStore((s) => s.isPro);
  const [agreed, setAgreed] = useState(false);

  const kind = params?.kind ?? 'repair';
  const next = params?.next ?? 'BookingConfirm';
  const nextParams = params?.nextParams;
  const deposit = depositForBooking(kind, isPro);

  const onContinue = () => {
    if (!agreed) return;
    if (deposit > 0) {
      navigation.navigate('BookDeposit', { kind, dealerId: params?.dealerId, next, nextParams });
    } else {
      (navigation.navigate as (n: string, p?: object) => void)(next, nextParams);
    }
  };

  return (
    <Screen>
      <Card tinted style={{ padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', gap: spacing.sm }}>
        <Text style={{ fontSize: 20 }}>✅</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.successDeep }}>
            No payment for the repair today
          </Text>
          <Text style={{ fontSize: 12, color: colors.successDark, lineHeight: 18 }}>
            You pay the shop after the work — your estimate isn't charged now.
          </Text>
        </View>
      </Card>

      <SectionLabel>Agree to book</SectionLabel>
      <Tappable
        onPress={() => setAgreed((v) => !v)}
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: agreed ? colors.success : colors.border,
            backgroundColor: agreed ? colors.success : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {agreed && <Text style={{ color: '#fff', fontSize: 13 }}>✓</Text>}
        </View>
        <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
          I have read and agree to AutoMate's{' '}
          <Text
            style={{ color: colors.primary, fontWeight: '700' }}
            onPress={() => navigation.navigate('TosBooking')}
          >
            Terms of Service
          </Text>{' '}
          — show up or reschedule/cancel 12h+ ahead, the 3-no-show limit, and booking only
          through AutoMate.
        </Text>
      </Tappable>

      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderColor: colors.warning,
          borderWidth: 1,
          borderRadius: radii.sm,
          padding: spacing.sm,
          marginBottom: spacing.md,
          flexDirection: 'row',
          gap: spacing.sm,
        }}
      >
        <Text>{deposit > 0 ? '🔒' : '📅'}</Text>
        <Text style={{ flex: 1, fontSize: 12, color: colors.warningDeep, lineHeight: 18 }}>
          {deposit > 0
            ? "A small refundable security deposit holds your spot — released after you show up. Pro members skip it."
            : 'No deposit for scheduled services — just show up, or reschedule 12h ahead.'}
        </Text>
      </View>

      <PrimaryButton label="Agree & continue →" disabled={!agreed} onPress={onContinue} />
      <Text style={{ fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }}>
        Shops sign a matching{' '}
        <Text style={{ color: colors.primary }} onPress={() => navigation.navigate('PartnerAgreement')}>
          Partner Agreement
        </Text>{' '}
        (no poaching, honor quotes).
      </Text>
    </Screen>
  );
}
