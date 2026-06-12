import { create } from 'zustand';

import { BOOKABLE_SERVICES } from '../services/mock/data';

/** A service row in the multi-service booking cart (maint-schedule-book). */
export interface CartService {
  id: string;
  name: string;
  price: number;
  durationMin: number;
}

export interface BookingCart {
  dealerId: string | null;
  services: CartService[];
  date: string | null; // ISO date
  time: string | null; // e.g. "8:00 AM"
}

const emptyCart: BookingCart = { dealerId: null, services: [], date: null, time: null };

/** Derived cart price/duration totals (used by book, payment, and confirm screens). */
export const cartTotals = (cart: BookingCart) => ({
  total: cart.services.reduce((sum, s) => sum + s.price, 0),
  totalMin: cart.services.reduce((sum, s) => sum + s.durationMin, 0),
});

/** Wireframe defaults when a booking opens: oil change · Apr 7 · 8:00 AM. */
const defaultCart = (dealerId: string): BookingCart => {
  const oil = BOOKABLE_SERVICES[0];
  return {
    dealerId,
    services: [{ id: oil.id, name: oil.name, price: oil.price, durationMin: oil.durationMin }],
    date: '2027-04-07',
    time: '8:00 AM',
  };
};

const SEED_POINTS = 420;

/**
 * One damaged part in the multi-part request (wireframe v15.10 single-select
 * loop: pick one part → photo guide → camera tags type + photos → confirm
 * accumulates the list).
 */
export interface DamagePart {
  part: string;
  type: string; // Dent / Scratch / Crack / Paint
  photos: number;
}

const DEFAULT_DAMAGE_TYPE = 'Dent';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;

  // Dark mode (Settings → App preferences)
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Reward points (420 pts seed; earned by scans/logs/posts)
  points: number;
  addPoints: (n: number) => void;

  // AutoMate Pro membership ($10 lifetime — diy-unlock chain)
  isPro: boolean;
  unlockPro: () => void;

  // Damage flow: committed parts + the in-progress draft (one part per pass)
  damageParts: DamagePart[];
  draftPart: string | null;
  draftType: string;
  draftPhotos: number;
  /** Single-select a part (wireframe pickPart). Re-picking a committed part seeds its type/photos for editing. */
  pickPart: (part: string) => void;
  setDraftType: (t: string) => void;
  addDraftPhoto: () => void;
  /** Merge the draft into damageParts (idempotent — replaces an entry with the same part name). */
  commitDraftPart: () => void;
  /** Clear only the draft ("+ Add another damaged part" starts a fresh pass). */
  resetDraft: () => void;
  removePart: (index: number) => void;
  resetDamageFlow: () => void;

  // Maintenance booking cart (multi-service selection)
  cart: BookingCart;
  /** Open a booking at a dealer: drops any stale cart and seeds the defaults. */
  startBooking: (dealerId: string) => void;
  toggleCartService: (service: CartService) => void;
  setCartSlot: (date: string, time: string) => void;
  clearCart: () => void;
}

const emptyDraft = {
  draftPart: null as string | null,
  draftType: DEFAULT_DAMAGE_TYPE,
  draftPhotos: 0,
};

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  signIn: () => set({ isAuthenticated: true }),
  // Sign-out clears the whole client session so the next account starts clean
  // (wireframe: sign-out sheet → splash).
  signOut: () =>
    set({
      isAuthenticated: false,
      damageParts: [],
      ...emptyDraft,
      cart: emptyCart,
      points: SEED_POINTS,
      isPro: false,
    }),

  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  points: SEED_POINTS,
  addPoints: (n) => set((s) => ({ points: s.points + n })),

  isPro: false,
  unlockPro: () => set({ isPro: true }),

  damageParts: [],
  ...emptyDraft,
  pickPart: (part) =>
    set((s) => {
      const existing = s.damageParts.find((p) => p.part === part);
      return existing
        ? { draftPart: part, draftType: existing.type, draftPhotos: existing.photos }
        : { draftPart: part, draftType: DEFAULT_DAMAGE_TYPE, draftPhotos: 0 };
    }),
  setDraftType: (draftType) => set({ draftType }),
  addDraftPhoto: () => set((s) => ({ draftPhotos: s.draftPhotos + 1 })),
  commitDraftPart: () =>
    set((s) => {
      if (!s.draftPart || s.draftPhotos < 1) return {};
      const next: DamagePart = { part: s.draftPart, type: s.draftType, photos: s.draftPhotos };
      const i = s.damageParts.findIndex((p) => p.part === s.draftPart);
      const damageParts =
        i >= 0
          ? s.damageParts.map((p, j) => (j === i ? next : p))
          : [...s.damageParts, next];
      return { damageParts };
    }),
  resetDraft: () => set({ ...emptyDraft }),
  removePart: (index) =>
    set((s) => ({ damageParts: s.damageParts.filter((_, i) => i !== index) })),
  resetDamageFlow: () => set({ damageParts: [], ...emptyDraft }),

  cart: emptyCart,
  startBooking: (dealerId) => set({ cart: defaultCart(dealerId) }),
  toggleCartService: (service) =>
    set((s) => {
      const exists = s.cart.services.some((x) => x.id === service.id);
      return {
        cart: {
          ...s.cart,
          services: exists
            ? s.cart.services.filter((x) => x.id !== service.id)
            : [...s.cart.services, service],
        },
      };
    }),
  setCartSlot: (date, time) => set((s) => ({ cart: { ...s.cart, date, time } })),
  clearCart: () => set({ cart: emptyCart }),
}));
