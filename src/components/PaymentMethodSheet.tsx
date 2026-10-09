import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from './Icon';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Text } from './Text';

import { CardFormFields, CardFormSheet } from './CardFormSheet';
import { FormSheet } from './FormSheet';
import { Tappable } from './Tappable';
import { PaymentCard, paymentMethodsService } from '../services';
import { radii, spacing, useTheme } from '../theme';

/**
 * Pick the card used for a deposit/subscription. Lists saved cards (from the
 * payment-methods service) with a radio select; choosing one calls onSelect and
 * closes. "Add a new card" opens the same card form as More → Payment method:
 * the card is saved to the account (so it is there for future payments) and
 * selected for this payment on the spot.
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
  const queryClient = useQueryClient();
  const { data: cards } = useQuery({ queryKey: ['cards'], queryFn: paymentMethodsService.listCards });
  const [adding, setAdding] = useState(false);

  const addMutation = useMutation({
    mutationFn: (fields: CardFormFields) => paymentMethodsService.addCard(fields),
    onSuccess: ({ card }) => {
      // Both card lists (picker + More → Payment method) show the new card.
      void queryClient.invalidateQueries({ queryKey: ['cards'] });
      void queryClient.invalidateQueries({ queryKey: ['payment-cards'] });
      setAdding(false);
      onSelect(card);
      onClose();
    },
  });

  return (
    <>
      <FormSheet visible={visible && !adding} onClose={onClose} title="Payment method">
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
              <Icon name="wallet" size={18} color={colors.textSecondary} />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                {c.brand} ••••{c.last4}
              </Text>
              {on ? <Icon name="check" size={18} color={colors.primary} strokeWidth={2.4} /> : null}
            </Tappable>
          );
        })}
        <Tappable
          onPress={() => setAdding(true)}
          accessibilityRole="button"
          accessibilityLabel="Add a new card"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.primary,
            borderRadius: radii.md,
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <View style={{ width: 18, alignItems: 'center' }}>
            <Icon name="plus" size={18} color={colors.primary} strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>Add a new card</Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>Used for this payment and saved for next time</Text>
          </View>
        </Tappable>
      </FormSheet>
      <CardFormSheet
        card={null}
        visible={visible && adding}
        onClose={() => setAdding(false)}
        onSave={(fields) => addMutation.mutate(fields)}
        saving={addMutation.isPending}
      />
    </>
  );
}
