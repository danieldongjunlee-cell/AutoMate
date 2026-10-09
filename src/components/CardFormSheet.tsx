import React, { useState } from 'react';
import { View } from 'react-native';

import { Text } from './Text';

import { CvcField, isValidCvc } from './CvcField';
import { FormSheet } from './FormSheet';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { Tappable } from './Tappable';
import { TextField } from './TextField';
import { PaymentCard } from '../services';
import { radii, spacing, useTheme } from '../theme';

/** Group a 16-digit string into blocks of 4 ("4242 4242 ..."). */
function formatCardNumber(digits: string): string {
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export interface CardFormFields {
  holder: string;
  expires: string;
  last4: string;
  isDefault: boolean;
}

/**
 * Edit (holder/expiry, last4 read-only) or add (all fields) card form, shared
 * by More → Payment method and the in-flow "Add a new card" option on the
 * deposit / subscription payment pickers.
 */
export function CardFormSheet({
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
  onSave: (fields: CardFormFields) => void;
  saving: boolean;
}) {
  const { colors } = useTheme();
  const [holder, setHolder] = useState('');
  const [expires, setExpires] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [setPrimary, setSetPrimary] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setHolder(card?.holder ?? '');
      setExpires(card?.expires ?? '');
      setCardNumber('');
      setCvc('');
      setSetPrimary(card?.isDefault ?? false);
    }
  }, [visible, card]);

  const isEdit = !!card;
  // Add mode requires a full 16-digit number and its CVC; edit mode keeps
  // last4 read-only and re-checks the CVC before saving the change.
  const canSave =
    holder.trim().length > 0 &&
    /^\d{2}\/\d{2}$/.test(expires) &&
    isValidCvc(cvc) &&
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

      <CvcField
        value={cvc}
        onChange={setCvc}
        hint={
          isEdit
            ? 'Confirm the code on the card to save changes · never stored'
            : '3 digits on the back of the card, 4 on American Express · never stored'
        }
      />

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
            <Icon name="check" size={14} color={colors.onPrimary} strokeWidth={2.4} />
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
