import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FormSheet } from '../../components/FormSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { Badge, Screen, SectionLabel } from '../../components/ui';
import { PaymentCard, paymentMethodsService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

/** Group a 16-digit string into blocks of 4 ("4242 4242 ..."). */
function formatCardNumber(digits: string): string {
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/** Edit (holder/expiry, last4 read-only) or add (all fields) card form. */
function CardFormModal({
  card,
  visible,
  onClose,
  onSave,
  saving,
}: {
  /** null → "add" mode. */
  card: PaymentCard | null;
  visible: boolean;
  onClose: () => void;
  onSave: (fields: { holder: string; expires: string; last4: string; isDefault: boolean }) => void;
  saving: boolean;
}) {
  const { colors } = useTheme();
  const [holder, setHolder] = useState('');
  const [expires, setExpires] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [setPrimary, setSetPrimary] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setHolder(card?.holder ?? '');
      setExpires(card?.expires ?? '');
      setCardNumber('');
      setSetPrimary(card?.isDefault ?? false);
    }
  }, [visible, card]);

  const isEdit = !!card;
  // Add mode requires a full 16-digit number; edit mode keeps last4 read-only.
  const canSave =
    holder.trim().length > 0 &&
    /^\d{2}\/\d{2}$/.test(expires) &&
    (isEdit || cardNumber.length === 16);

  return (
    <FormSheet
      visible={visible}
      onClose={onClose}
      title={card ? 'Edit card' : 'Add payment method'}
      dismissable={!saving}
    >
      <TextField
        label="Cardholder name"
        value={holder}
        onChangeText={setHolder}
        placeholder="John Doe"
        autoCapitalize="words"
      />
      <TextField
        label="Expiry (MM/YY)"
        value={expires}
        onChangeText={(t) => setExpires(t.replace(/[^\d/]/g, '').slice(0, 5))}
        placeholder="08/27"
        keyboardType="numbers-and-punctuation"
      />
      {card ? (
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 6 }}
          >
            Card number
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              backgroundColor: colors.surfaceAlt,
              paddingHorizontal: spacing.md,
              paddingVertical: 13,
            }}
          >
            <Text style={{ fontSize: 15, color: colors.textSecondary, letterSpacing: 1 }}>
              •••• •••• •••• {card.last4} (read-only)
            </Text>
          </View>
        </View>
      ) : (
        <TextField
          label="Card number"
          value={formatCardNumber(cardNumber)}
          onChangeText={(t) => setCardNumber(t.replace(/\D/g, '').slice(0, 16))}
          placeholder="4242 4242 4242 4242"
          keyboardType="number-pad"
          containerStyle={{ marginBottom: spacing.md }}
        />
      )}

      <Tappable
        onPress={() => setSetPrimary((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: radii.sm,
            borderWidth: 1.5,
            borderColor: setPrimary ? colors.primary : colors.border,
            backgroundColor: setPrimary ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {setPrimary ? (
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimary }}>✓</Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>
          Set as primary card
        </Text>
      </Tappable>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <PrimaryButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <PrimaryButton
          label={card ? 'Save' : 'Add card'}
          disabled={!canSave}
          loading={saving}
          onPress={() =>
            onSave({
              holder: holder.trim(),
              expires,
              last4: isEdit ? card!.last4 : cardNumber.slice(-4),
              isDefault: setPrimary,
            })
          }
          style={{ flex: 1 }}
        />
      </View>
    </FormSheet>
  );
}

/** Wireframe s-prof-payment, now live card CRUD. */
export function ProfPaymentScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<PaymentCard | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['payment-cards'],
    queryFn: paymentMethodsService.listCards,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['payment-cards'] });

  const saveMutation = useMutation({
    mutationFn: async (fields: {
      holder: string;
      expires: string;
      last4: string;
      isDefault: boolean;
    }) => {
      if (editing) {
        await paymentMethodsService.updateCard(editing.id, {
          holder: fields.holder,
          expires: fields.expires,
        });
        // Edit form can also (re)designate the primary card.
        if (fields.isDefault && !editing.isDefault) {
          await paymentMethodsService.setDefault(editing.id);
        }
        return;
      }
      await paymentMethodsService.addCard(fields);
    },
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => paymentMethodsService.removeCard(id),
    onSuccess: invalidate,
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => paymentMethodsService.setDefault(id),
    onSuccess: invalidate,
  });

  const onRemove = (card: PaymentCard) =>
    confirmAction('Remove card', `Remove the ${card.brand} ending ${card.last4}?`, () =>
      removeMutation.mutate(card.id),
    );

  return (
    <Screen>
      <SectionLabel>Saved methods</SectionLabel>

      {isLoading ? (
        <SkeletonList variant="card" count={1} tall />
      ) : (cards ?? []).length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: spacing.xl,
            alignItems: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>💳</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            No payment methods yet
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            Add a card below to pay for bookings faster.
          </Text>
        </View>
      ) : (
        (cards ?? []).map((card) => (
          <View
            key={card.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: 1.5,
              borderColor: colors.primary,
              overflow: 'hidden',
              marginBottom: spacing.sm,
            }}
          >
            <LinearGradient
              colors={[palette.dark, palette.darkAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: spacing.lg }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing.md,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: 'rgba(255,255,255,.5)',
                    letterSpacing: 2,
                  }}
                >
                  {card.brand}
                </Text>
                {card.isDefault ? <Badge label="Primary" variant="primarySoft" /> : null}
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '600',
                  color: '#fff',
                  letterSpacing: 2,
                  marginBottom: spacing.md,
                }}
              >
                •••• •••• •••• {card.last4}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>CARDHOLDER</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>
                    {card.holder}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>EXPIRES</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>
                    {card.expires}
                  </Text>
                </View>
              </View>
            </LinearGradient>
            <View style={{ padding: spacing.sm, flexDirection: 'row', gap: spacing.xs }}>
              {!card.isDefault ? (
                <Tappable
                  onPress={() => setDefaultMutation.mutate(card.id)}
                  disabled={setDefaultMutation.isPending}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primarySurface,
                    borderRadius: radii.sm,
                    paddingVertical: 9,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
                    Make primary
                  </Text>
                </Tappable>
              ) : null}
              <Tappable
                onPress={() => {
                  setEditing(card);
                  setFormOpen(true);
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.primarySurface,
                  borderRadius: radii.sm,
                  paddingVertical: 9,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
                  Edit card
                </Text>
              </Tappable>
              <Tappable
                onPress={() => onRemove(card)}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: radii.sm,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.danger,
                  paddingVertical: 9,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.danger }}>
                  Remove
                </Text>
              </Tappable>
            </View>
          </View>
        ))
      )}

      {/* Add method */}
      <Tappable
        onPress={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.primaryLight,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 28, marginBottom: 6 }}>➕</Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primaryDark, marginBottom: 2 }}>
          Add payment method
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
          Credit / debit card
        </Text>
      </Tappable>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 15 }}>🔒</Text>
        <Text style={{ flex: 1, fontSize: 12, color: colors.textTertiary, lineHeight: 18 }}>
          256-bit encrypted · PCI DSS compliant · AutoMate never stores full card numbers.
        </Text>
      </View>

      <CardFormModal
        card={editing}
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(fields) => saveMutation.mutate(fields)}
        saving={saveMutation.isPending}
      />
    </Screen>
  );
}
