import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { useQuery } from '@tanstack/react-query';

import { CvcField, isValidCvc } from '../../components/CvcField';
import { PaymentMethodSheet } from '../../components/PaymentMethodSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { ProcessingOverlay } from '../../components/Skeleton';
import { SummaryPanel } from '../../components/SummaryPanel';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, defaultBookingISO } from '../../services/mock/data';
import { PaymentCard, paymentMethodsService } from '../../services';
import { formatDayLabel } from '../../utils/dates';
import { dateBadgeParts, DEPOSIT_CENTS, useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'BookDeposit'>;
type Rt = RouteProp<HomeStackParamList, 'BookDeposit'>;

const usd = (cents: number) => `$${(cents / 100).toFixed(0)}`;

/** Wireframe s-book-deposit: refundable deposit, waived for Pro (crossed $25 → $0). */
export function BookDepositScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { colors } = useTheme();
  const isPro = useAppStore((s) => s.isPro);
  const addBooking = useAppStore((s) => s.addBooking);
  const { brand } = useActiveVehicle();
  const [booking, setBooking] = useState(false);
  const [picked, setPicked] = useState<PaymentCard | null>(null);
  const [cardSheet, setCardSheet] = useState(false);
  const [cvc, setCvc] = useState('');
  const { data: cards } = useQuery({ queryKey: ['cards'], queryFn: paymentMethodsService.listCards });
  const card = picked ?? cards?.[0];
  const cardLabel = card ? `${card.brand} ••••${card.last4}` : 'Visa ••••4242';

  const next = params?.next ?? 'BookingConfirm';
  const nextParams = params?.nextParams;
  const waived = isPro;
  const dealer = dealerById(params?.dealerId);
  const slotLabel = `${nextParams?.dateLabel ?? formatDayLabel(defaultBookingISO())} · ${nextParams?.time ?? '10:30 AM'}`;
  const estimateLabel = nextParams?.priceLabel ?? '$320–$345';

  const confirm = async () => {
    setBooking(true);
    await new Promise((r) => setTimeout(r, 600));
    // Record the booking so it appears in the Bookings tab (deposit path = repair).
    const dateLabel = nextParams?.dateLabel ?? formatDayLabel(defaultBookingISO());
    addBooking({
      kind: 'repair',
      brand,
      dealerId: params?.dealerId,
      icon: 'car',
      title: 'Rear bumper repair',
      dealerName: dealer.name,
      dateLabel,
      ...dateBadgeParts(dateLabel),
      time: nextParams?.time ?? '10:30 AM',
      priceLabel: nextParams?.priceLabel ?? '$320–345',
      status: 'confirmed',
    });
    setBooking(false);
    (navigation.navigate as (n: string, p?: object) => void)(next, nextParams);
  };

  return (
    <Screen>
      {/* Same panel as "Your services": what is held, what the shop charges later. */}
      <SummaryPanel
        icon="wallet"
        label="Reserve your spot"
        title={dealer.name}
        actionLabel="Edit"
        actionAccessibilityLabel="Edit date and time"
        onAction={() => navigation.goBack()}
        rows={[
          {
            key: 'slot',
            icon: 'calendar',
            iconColor: colors.primary,
            title: slotLabel,
            caption: "We hold this slot while you confirm",
          },
          {
            key: 'deposit',
            icon: 'lock',
            iconColor: colors.primary,
            title: 'Refundable security deposit',
            caption: 'Held, not charged · auto-released after your visit',
            valueNode: waived ? (
              <Text style={{ fontSize: 15, fontWeight: '800' }}>
                <Text style={{ textDecorationLine: 'line-through', color: colors.textTertiary }}>
                  {usd(DEPOSIT_CENTS)}
                </Text>{' '}
                <Text style={{ color: colors.successDark }}>$0</Text>
              </Text>
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
                {usd(DEPOSIT_CENTS)}
              </Text>
            ),
          },
          {
            key: 'estimate',
            icon: 'wrench',
            iconColor: colors.primary,
            title: params?.kind === 'maintenance' ? 'Service estimate' : 'Repair estimate',
            caption: 'Book now, pay the shop after your visit',
            value: estimateLabel,
          },
        ]}
        footerLabel="Charged today"
        footerCaption="Deposit hold only · nothing leaves your account"
        footerValue="$0.00"
        footerValueColor={colors.successDark}
        style={{ marginBottom: spacing.md }}
      />

      {waived ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            backgroundColor: colors.successSurface,
            borderColor: colors.successLight,
            borderWidth: 1,
            borderRadius: radii.sm,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Icon name="sparkle" size={18} color={colors.textSecondary} />
          <Text style={{ fontWeight: '700', color: colors.successDeep, fontSize: 14 }}>
            Deposit waived · Pro member
          </Text>
        </View>
      ) : (
        <>
          <Tappable
            onPress={() => navigation.navigate('ProSubscribe')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: palette.dark,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <Icon name="star" size={18} color={palette.star} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                Skip the deposit with Pro
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
                No deposits, ever · from $4/mo
              </Text>
            </View>
            <View style={{ backgroundColor: colors.warning, borderRadius: radii.sm, paddingHorizontal: 11, paddingVertical: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: palette.dark }}>Get Pro →</Text>
            </View>
          </Tappable>
          <View>
            <SectionLabel>Payment method</SectionLabel>
          </View>
          <Card style={{ padding: spacing.sm, marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="wallet" size={18} color={colors.textSecondary} />
            <Text style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}>
              {cardLabel} <Text style={{ color: colors.textTertiary, fontSize: 12 }}>· hold only</Text>
            </Text>
            <Tappable onPress={() => setCardSheet(true)} hitSlop={8}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Change</Text>
            </Tappable>
          </Card>
          {/* The hold is a real authorisation, so the code is confirmed first. */}
          <CvcField value={cvc} onChange={setCvc} label={`CVC for ${cardLabel}`} />
        </>
      )}

      <PrimaryButton
        variant="warning"
        label={waived ? 'Confirm booking · no deposit →' : `Hold ${usd(DEPOSIT_CENTS)} deposit & confirm →`}
        loading={booking}
        disabled={!waived && !isValidCvc(cvc)}
        onPress={confirm}
      />
      <ProcessingOverlay visible={booking} label="Confirming booking…" />
      <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }}>
        Cancel 12h+ ahead for a full refund · no-show forfeits the deposit.
      </Text>
      <PaymentMethodSheet
        visible={cardSheet}
        selectedId={card?.id}
        onSelect={setPicked}
        onClose={() => setCardSheet(false)}
      />
    </Screen>
  );
}
