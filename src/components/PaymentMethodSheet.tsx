import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Text, View } from 'react-native';

import { FormSheet } from './FormSheet';
import { Tappable } from './Tappable';
import { PaymentCard, paymentMethodsService } from '../services';
import { radii, spacing, useTheme } from '../theme';

/**
 * Pick the card used for a deposit/subscription. Lists saved cards (from the
 * payment-methods service) with a radio select; choosing one calls onSelect and
 * closes. Manage/add cards lives in More → Payment method.
 */
export function PaymentMethodSheet({
  visible,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedId?: string;
  onSelect: (card: PaymentCard) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { data: cards } = useQuery({ queryKey: ['cards'], queryFn: paymentMethodsService.listCards });

  return (
    <FormSheet visible={visible} onClose={onClose} title="Payment method">
      {(cards ?? []).map((c) => {
        const on = c.id === selectedId;
        return (
          <Tappable
            key={c.id}
            onPress={() => {
              onSelect(c);
              onClose();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              borderWidth: 1.5,
              borderColor: on ? colors.primary : colors.border,
              backgroundColor: on ? colors.primarySurface : colors.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 18 }}>💳</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              {c.brand} ••••{c.last4}
            </Text>
            {on ? <Text style={{ color: colors.primary, fontWeight: '800' }}>✓</Text> : null}
          </Tappable>
        );
      })}
      <Text style={{ fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs }}>
        Add or edit cards in More → Payment method.
      </Text>
    </FormSheet>
  );
}
