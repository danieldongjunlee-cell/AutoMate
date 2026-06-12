import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { ApplePaySheet } from '../../components/ApplePaySheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { Screen, SectionLabel } from '../../components/ui';
import { PaymentCard, paymentMethodsService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

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
  onSave: (fields: { holder: string; expires: string; last4: string }) => void;
  saving: boolean;
}) {
  const { colors } = useTheme();
  const [holder, setHolder] = useState('');
  const [expires, setExpires] = useState('');
  const [last4, setLast4] = useState('');

  React.useEffect(() => {
    if (visible) {
      setHolder(card?.holder ?? '');
      setExpires(card?.expires ?? '');
      setLast4(card?.last4 ?? '');
    }
  }, [visible, card]);

  const canSave =
    holder.trim().length > 0 && /^\d{2}\/\d{2}$/.test(expires) && /^\d{4}$/.test(last4);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Tappable
        noFeedback
        onPress={saving ? undefined : onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,.45)',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <View
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: colors.background,
            borderRadius: radii.lg,
            padding: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            {card ? 'Edit card' : 'Add payment method'}
          </Text>
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
              label="Card number — last 4 digits"
              value={last4}
              onChangeText={(t) => setLast4(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="4242"
              keyboardType="number-pad"
              containerStyle={{ marginBottom: spacing.lg }}
            />
          )}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <PrimaryButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <PrimaryButton
              label={card ? 'Save' : 'Add card'}
              disabled={!canSave}
              loading={saving}
              onPress={() => onSave({ holder: holder.trim(), expires, last4 })}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Tappable>
    </Modal>
  );
}

/** Wireframe s-prof-payment, now live CRUD + simulated Apple Pay sheet. */
export function ProfPaymentScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<PaymentCard | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [applePayOpen, setApplePayOpen] = useState(false);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['payment-cards'],
    queryFn: paymentMethodsService.listCards,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['payment-cards'] });

  const saveMutation = useMutation({
    mutationFn: async (fields: { holder: string; expires: string; last4: string }) => {
      if (editing) {
        return paymentMethodsService.updateCard(editing.id, {
          holder: fields.holder,
          expires: fields.expires,
        });
      }
      return paymentMethodsService.addCard(fields);
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
                {card.isPrimary ? (
                  <View
                    style={{
                      backgroundColor: 'rgba(127,119,221,.3)',
                      borderRadius: radii.pill,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: 'rgba(127,119,221,.5)',
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: palette.primaryLight }}>Primary</Text>
                  </View>
                ) : null}
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
                  borderColor: colors.border,
                  paddingVertical: 9,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>
                  Remove
                </Text>
              </Tappable>
            </View>
          </View>
        ))
      )}

      {/* Apple Pay → simulated sheet */}
      <Tappable
        onPress={() => setApplePayOpen(true)}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.sm,
            backgroundColor: palette.dark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🍎</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
            Apple Pay
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>Configured · ready to use</Text>
        </View>
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.successDeep }}>Ready</Text>
        </View>
      </Tappable>

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
          Credit / debit · Apple Pay · Google Pay
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
      <ApplePaySheet visible={applePayOpen} onClose={() => setApplePayOpen(false)} />
    </Screen>
  );
}
