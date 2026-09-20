import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { palette, radii, spacing, useTheme } from '../theme';

export interface ReceiptRow {
  label: string;
  value: string;
}

/**
 * Success receipt (the confirmation design): a green tick in a soft disc,
 * "Thank you!", the transaction rows, then the total and the method it was
 * booked or paid with, closed by a PAID / CONFIRMED stub.
 */
export function SuccessReceipt({
  title = 'Thank you!',
  subtitle = 'Your booking was confirmed',
  rows,
  total,
  totalLabel = 'Total',
  method,
  stamp = 'CONFIRMED',
  reference,
}: {
  title?: string;
  subtitle?: string;
  /** Date / Time / To … */
  rows: ReceiptRow[];
  /** "$88" or "Pay at the shop". */
  total: string;
  totalLabel?: string;
  /** The card or payment method line, e.g. { name: 'Visa', detail: '•••• 4242' }. */
  method?: { name: string; detail?: string };
  /** Badge on the stub. */
  stamp?: string;
  /** Confirmation code on the stub. */
  reference?: string;
}) {
  const { colors } = useTheme();
  const row = (r: ReceiptRow, i: number) => (
    <View
      key={r.label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        paddingVertical: 11,
        borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
        borderTopColor: colors.divider,
      }}
    >
      <Text style={{ fontSize: 15, color: colors.textTertiary }}>{r.label}</Text>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary, textAlign: 'right' }} numberOfLines={1}>
        {r.value}
      </Text>
    </View>
  );

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 26, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      <View style={{ alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.lg }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.successSurface, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: palette.mint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={30} color="#0B1E3D" strokeWidth={3} />
          </View>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md }}>{title}</Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2, textAlign: 'center' }}>{subtitle}</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>{rows.map(row)}</View>

      {/* Total */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: spacing.lg,
          marginTop: spacing.sm,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{totalLabel}</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>{total}</Text>
      </View>

      {method ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            margin: spacing.lg,
            marginBottom: spacing.md,
            backgroundColor: colors.surfaceAlt,
            borderRadius: 16,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
          }}
        >
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wallet" size={19} color={colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{method.name}</Text>
            {method.detail ? <Text style={{ fontSize: 12, color: colors.textTertiary }}>{method.detail}</Text> : null}
          </View>
        </View>
      ) : null}

      {/* Perforated stub */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.background, marginLeft: -22 }} />
        <View style={{ flex: 1, height: 1, borderRadius: 1, backgroundColor: colors.border }} />
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.background, marginRight: -22 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>Confirmation</Text>
          <Text style={{ fontSize: 17, fontWeight: '800', letterSpacing: 1.2, color: colors.textPrimary, marginTop: 2 }}>{reference ?? '-'}</Text>
        </View>
        <View style={{ backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 9 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', letterSpacing: 0.6, color: colors.onPrimary }}>{stamp}</Text>
        </View>
      </View>
    </View>
  );
}
