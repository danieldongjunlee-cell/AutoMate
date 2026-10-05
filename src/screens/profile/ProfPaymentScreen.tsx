import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Text } from '../../components/Text';

import { CardFormSheet } from '../../components/CardFormSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RemoveButton } from '../../components/RemoveButton';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { DECK_TEXT, DECK_TEXT_SOFT, DeckButton, StatTile, SwipeCard, SwipeDeck } from '../../components/SwipeCard';
import { PagedCarousel } from '../../components/PagedCarousel';
import { Screen } from '../../components/ui';
import { PaymentCard, paymentMethodsService } from '../../services';
import { palette, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

/**
 * A saved card as a swipe card: the card face (brand, number, holder, expiry)
 * over the blue deck, four stat tiles, then the primary action and Edit /
 * Remove, the same deck pattern as My cars and My insurance.
 */
function SavedCard({
  card,
  onSetDefault,
  onEdit,
  onRemove,
}: {
  card: PaymentCard;
  onSetDefault: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <SwipeCard title={card.brand} subtitle={`•••• •••• •••• ${card.last4}`} badge={card.isDefault ? 'Primary' : undefined}>
      {/* Card face */}
      <View style={{ marginVertical: spacing.sm }}>
        <LinearGradient
          colors={[palette.navyBright, palette.navy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 18, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Chip */}
            <View style={{ width: 36, height: 26, borderRadius: 6, backgroundColor: 'rgba(240,180,78,0.9)' }} />
            <Text style={{ fontSize: 13, fontWeight: '800', letterSpacing: 1.4, color: 'rgba(255,255,255,0.75)' }}>{card.brand.toUpperCase()}</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: 2.4, color: '#ffffff', marginTop: spacing.lg }}>•••• •••• •••• {card.last4}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
            <View>
              <Text style={{ fontSize: 10, letterSpacing: 0.6, color: 'rgba(255,255,255,0.5)' }}>CARD HOLDER</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }} numberOfLines={1}>
                {card.holder}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, letterSpacing: 0.6, color: 'rgba(255,255,255,0.5)' }}>EXPIRES</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>{card.expires}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <StatTile icon="wallet" color={palette.primaryLight} value={card.brand} label="brand" />
        <StatTile icon="lock" color={palette.teal} value={`••${card.last4.slice(-2)}`} label="last 4" />
        <StatTile icon="calendar" color={palette.lavender} value={card.expires} label="expires" />
        <StatTile icon="check" color={palette.mint} value={card.isDefault ? 'Yes' : 'No'} label="primary" />
      </View>

      <DeckButton
        label={card.isDefault ? 'Primary card ✓' : 'Set as primary'}
        secondary={card.isDefault}
        disabled={card.isDefault}
        onPress={onSetDefault}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.md }}>
        <Tappable onPress={onEdit} hitSlop={8} accessibilityLabel={`Edit ${card.brand} card`}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: DECK_TEXT }}>Edit card</Text>
        </Tappable>
        <Tappable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${card.brand} card`}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffb4b1' }}>Remove</Text>
        </Tappable>
      </View>
    </SwipeCard>
  );
}

/** Payment methods: swipe through the saved cards, then "Add a card". */
export function ProfPaymentScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<PaymentCard | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: cards, isLoading } = useQuery({ queryKey: ['payment-cards'], queryFn: paymentMethodsService.listCards });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['payment-cards'] });

  const saveMutation = useMutation({
    mutationFn: async (fields: { holder: string; expires: string; last4: string; isDefault: boolean }) => {
      if (editing) {
        await paymentMethodsService.updateCard(editing.id, { holder: fields.holder, expires: fields.expires });
        if (fields.isDefault && !editing.isDefault) await paymentMethodsService.setDefault(editing.id);
        return;
      }
      await paymentMethodsService.addCard(fields);
    },
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
  });
  const removeMutation = useMutation({ mutationFn: (id: string) => paymentMethodsService.removeCard(id), onSuccess: invalidate });
  const setDefaultMutation = useMutation({ mutationFn: (id: string) => paymentMethodsService.setDefault(id), onSuccess: invalidate });

  const onRemove = (card: PaymentCard) =>
    confirmAction('Remove card', `Remove the ${card.brand} ending ${card.last4}?`, () => removeMutation.mutate(card.id));
  const addCard = () => {
    setEditing(null);
    setFormOpen(true);
  };

  // The primary card leads the deck.
  const sorted = [...(cards ?? [])].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  const addCardFace = (
    <SwipeCard key="add" title="Add a card" dashed>
      <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
        <Tappable onPress={addCard} accessibilityRole="button" accessibilityLabel="Add payment method" style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <Icon name="plus" size={40} color={DECK_TEXT} strokeWidth={2.4} />
        </Tappable>
        <PrimaryButton label="Add payment method" onPress={addCard} style={{ alignSelf: 'stretch' }} />
      </View>
    </SwipeCard>
  );

  return (
    <Screen>
      <SwipeDeck
        caption={
          sorted.length
            ? `${sorted.length} card${sorted.length !== 1 ? 's' : ''} saved · swipe to switch`
            : 'No cards saved yet'
        }
      >
        {isLoading ? (
          <SkeletonList variant="card" count={1} tall />
        ) : (
          <PagedCarousel
            items={[
              ...sorted.map((card) => (
                <SavedCard
                  key={card.id}
                  card={card}
                  onSetDefault={() => setDefaultMutation.mutate(card.id)}
                  onEdit={() => {
                    setEditing(card);
                    setFormOpen(true);
                  }}
                  onRemove={() => onRemove(card)}
                />
              )),
              addCardFace,
            ]}
          />
        )}
      </SwipeDeck>

      <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg }}>
        Cards are stored with our payment processor · AutoMate never sees the full number.
      </Text>

      <CardFormSheet
        card={editing}
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(fields) => saveMutation.mutate(fields)}
        saving={saveMutation.isPending}
      />
    </Screen>
  );
}
