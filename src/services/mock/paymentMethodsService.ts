import { PAYMENT_CARD } from './data';
import { delay } from './delay';

/** Saved card (prof-payment). last4 is immutable after add (PCI-style). */
export interface PaymentCard {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expires: string;
  isDefault: boolean;
}

export interface PaymentCardInput {
  brand?: string;
  last4: string;
  holder: string;
  expires: string;
  isDefault?: boolean;
}

/** Module-state card list seeded with the demo Visa (user-feedback pass 1). */
let cards: PaymentCard[] = [
  {
    id: 'card-visa',
    brand: PAYMENT_CARD.brand,
    last4: PAYMENT_CARD.last4,
    holder: PAYMENT_CARD.holder,
    expires: PAYMENT_CARD.expires,
    isDefault: true,
  },
];
let nextId = 1;

export const paymentMethodsService = {
  async listCards(): Promise<PaymentCard[]> {
    await delay(250);
    return cards.map((c) => ({ ...c }));
  },

  async addCard(input: PaymentCardInput): Promise<{ ok: boolean; card: PaymentCard }> {
    await delay(450);
    const makeDefault = input.isDefault === true || cards.length === 0;
    const card: PaymentCard = {
      id: `card-new-${nextId++}`,
      brand: input.brand?.trim() || 'VISA',
      last4: input.last4,
      holder: input.holder,
      expires: input.expires,
      isDefault: makeDefault,
    };
    // A new default card unsets the default flag on every existing card.
    if (makeDefault) cards = cards.map((c) => ({ ...c, isDefault: false }));
    cards = [...cards, card];
    return { ok: true, card };
  },

  /** Edit holder/expiry (last4 + brand stay read-only in the edit form). */
  async updateCard(
    id: string,
    patch: Partial<Pick<PaymentCardInput, 'holder' | 'expires'>>,
  ): Promise<{ ok: boolean; card: PaymentCard }> {
    await delay(450);
    const idx = cards.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Card not found');
    const card = { ...cards[idx], ...patch };
    cards = [...cards.slice(0, idx), card, ...cards.slice(idx + 1)];
    return { ok: true, card };
  },

  /** Designate one card as the default, unsetting every other card. */
  async setDefault(id: string): Promise<{ ok: boolean }> {
    await delay(300);
    cards = cards.map((c) => ({ ...c, isDefault: c.id === id }));
    return { ok: true };
  },

  async removeCard(id: string): Promise<{ ok: boolean }> {
    await delay(350);
    cards = cards.filter((c) => c.id !== id);
    return { ok: true };
  },
};
