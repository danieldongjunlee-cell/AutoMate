import { create } from 'zustand';

import { AiEstimateSummary, BOOKABLE_SERVICES } from '../services/mock/data';

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

/** Refundable booking deposit (v17 book-deposit). Repair bookings hold $25;
 *  maintenance bookings need none, and Pro members are always waived. */
export const DEPOSIT_CENTS = 2500;
export const depositForBooking = (kind: 'repair' | 'maintenance', isPro: boolean): number =>
  kind === 'maintenance' || isPro ? 0 : DEPOSIT_CENTS;

/** v17 Pro plans (annual ≈ $3.25/mo; monthly $4.99). 1 pt = $0.01 economy. */
export const PRO_PLANS = {
  annual: { id: 'annual' as const, priceCents: 3900, label: 'Annual', per: '$3.25/mo' },
  monthly: { id: 'monthly' as const, priceCents: 499, label: 'Monthly', per: '$4.99/mo' },
};
export const DIY_ONLY_PRICE_CENTS = 1000; // $10 one-time DIY-only unlock

/**
 * A booking the user has made (v17 Bookings tab). Persisted client-side so a
 * completed repair/maintenance booking actually shows up in the Bookings tab
 * and can be reopened. Seeded with two demo entries so the tab isn't empty.
 */
export interface AppBooking {
  id: string;
  kind: 'repair' | 'maintenance';
  dealerId?: string;
  /** Owning car's brand — the Bookings tab filters to the active car. */
  brand: string;
  icon: string;
  title: string;
  dealerName: string;
  dateLabel: string; // "Thu, Apr 12"
  mon: string; // "Apr"
  day: string; // "12"
  time: string; // "10:30 AM"
  priceLabel: string; // "$320–345" / "$49"
  status: 'confirmed' | 'paid';
  createdAt: number;
}

const SEED_BOOKINGS: AppBooking[] = [
  {
    id: 'bk-seed-oil',
    kind: 'maintenance',
    dealerId: 'honda-fairfax',
    brand: 'Honda',
    icon: '🛢️',
    title: 'Oil change',
    dealerName: 'Honda Fairfax',
    dateLabel: 'Mon, Apr 7',
    mon: 'Apr',
    day: '7',
    time: '8:00 AM',
    priceLabel: '$49',
    status: 'confirmed',
    createdAt: 1,
  },
  {
    id: 'bk-seed-bumper',
    kind: 'repair',
    dealerId: 'honda-fairfax',
    brand: 'Honda',
    icon: '🚗',
    title: 'Rear bumper repair',
    dealerName: 'Honda Fairfax',
    dateLabel: 'Thu, Apr 12',
    mon: 'Apr',
    day: '12',
    time: '10:30 AM',
    priceLabel: '$320–345',
    status: 'confirmed',
    createdAt: 2,
  },
  {
    id: 'bk-seed-rav4',
    kind: 'maintenance',
    dealerId: 'vienna-auto',
    brand: 'Toyota',
    icon: '🔧',
    title: 'Tire rotation + brake check',
    dealerName: 'Vienna Auto Care',
    dateLabel: 'Wed, Apr 9',
    mon: 'Apr',
    day: '9',
    time: '9:30 AM',
    priceLabel: '$89',
    status: 'confirmed',
    createdAt: 3,
  },
];

/** Split a "Thu, Apr 12" / "Apr 12" label into { mon, day } for the date badge. */
export const dateBadgeParts = (dateLabel: string): { mon: string; day: string } => {
  const parts = dateLabel.replace(/,/g, '').split(/\s+/).filter(Boolean);
  if (parts.length >= 3) return { mon: parts[1], day: parts[2] };
  if (parts.length === 2) return { mon: parts[0], day: parts[1] };
  return { mon: 'Apr', day: '1' };
};

/** A review the signed-in user has written (v17 write-review → reviews). */
export interface UserReview {
  id: string;
  stars: number;
  body: string;
  dealerName: string;
  meta: string; // "Rear bumper · Apr 2027"
  createdAt: number;
}

/**
 * One damaged part in the multi-part request (wireframe v15.10 single-select
 * loop: pick one part → photo guide → camera tags type + photos → confirm
 * accumulates the list).
 */
export interface DamagePart {
  part: string;
  type: string; // Dent / Scratch / Crack / Paint
  photos: number;
  /** Real captured/picked image uris (feedback pass 2 — count mirrors `photos`). */
  photoUris?: string[];
  /** Optional free-text description the user typed at capture time. */
  note?: string;
}

const DEFAULT_DAMAGE_TYPE = 'Dent';

/** Reminder timing options (booking-confirm "Reminder set … Edit" modal). */
export const REMINDER_OPTIONS = [
  '1 day before',
  '2 days before',
  '2 hours before',
  'Morning of',
] as const;
export type ReminderPref = (typeof REMINDER_OPTIONS)[number];

/** Authenticated user context (set by the auth service after the OTP step). */
export interface AuthUser {
  name: string;
  email: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  /** Bearer token for the API client (real JWT in api mode, sentinel in mock mode). */
  authToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string | null, user: AuthUser | null) => void;
  signIn: () => void;
  signOut: () => void;

  // Dark mode (Settings → App preferences)
  darkMode: boolean;
  toggleDarkMode: () => void;

  // App preferences (Settings → Language / Distance units). Stored here so the
  // selection persists across navigation (device-level prefs — survive sign-out).
  language: string;
  setLanguage: (language: string) => void;
  distanceUnit: 'mi' | 'km';
  setDistanceUnit: (distanceUnit: 'mi' | 'km') => void;

  // Reward points (420 pts seed; earned by scans/logs/posts).
  // Single client cache — the points services (mock + api) keep it current.
  points: number;
  addPoints: (n: number) => void;
  /** Set the absolute balance (api mode reconciles from server responses). */
  setPoints: (n: number) => void;

  // AutoMate Pro (v17): subscription (annual/monthly) that includes DIY +
  // waives booking deposits, OR a separate $10 one-time DIY-only unlock.
  isPro: boolean;
  proPlan: 'annual' | 'monthly' | null;
  diyUnlocked: boolean; // true via Pro OR the $10 DIY-only purchase
  unlockPro: () => void; // legacy entry — defaults to annual
  subscribePro: (plan: 'annual' | 'monthly') => void;
  unlockDiyOnly: () => void;

  // Daily check-in (Home): claim once → award points + show the checked state.
  dailyCheckedIn: boolean;
  claimDailyCheckIn: () => void;

  // No-show strikes (booking agreement: 3 strikes removes the account)
  noShowCount: number;
  addNoShow: () => void;

  // Active vehicle (v17 car switcher — shown when >2 cars registered)
  activeVehicleId: string | null;
  setActiveVehicle: (id: string) => void;

  // Damage flow: committed parts + the in-progress draft (one part per pass)
  damageParts: DamagePart[];
  draftPart: string | null;
  draftType: string;
  /** Captured photo uris for the in-progress part (real camera/gallery uris). */
  draftPhotos: string[];
  /** Optional free-text damage description for the in-progress part. */
  draftNote: string;
  /** Single-select a part (wireframe pickPart). Re-picking a committed part seeds its type/photos/note for editing. */
  pickPart: (part: string) => void;
  setDraftType: (t: string) => void;
  setDraftNote: (note: string) => void;
  addDraftPhoto: (uri: string) => void;
  /** Merge the draft into damageParts (idempotent — replaces an entry with the same part name). */
  commitDraftPart: () => void;
  /** Clear only the draft ("+ Add another damaged part" starts a fresh pass). */
  resetDraft: () => void;
  removePart: (index: number) => void;
  resetDamageFlow: () => void;
  /** AI estimate from the latest submit (Submitted + DealerQuotes headers). */
  aiEstimate: AiEstimateSummary | null;
  setAiEstimate: (estimate: AiEstimateSummary | null) => void;

  // Booking reminder timing (booking-confirm / maint-schedule-confirm rows)
  reminderPref: ReminderPref;
  setReminderPref: (pref: ReminderPref) => void;

  // Maintenance booking cart (multi-service selection)
  cart: BookingCart;
  /** Open a booking at a dealer: drops any stale cart and seeds the defaults. */
  startBooking: (dealerId: string) => void;
  toggleCartService: (service: CartService) => void;
  setCartSlot: (date: string, time: string) => void;
  clearCart: () => void;

  // Bookings (v17 Bookings tab) — confirmed/paid bookings the user has made.
  bookings: AppBooking[];
  /** Record a new booking; the latest one shows first in the Bookings tab. */
  addBooking: (booking: Omit<AppBooking, 'id' | 'createdAt'>) => void;
  /** Remove a booking (cancel). With no id, drops the most recent. */
  removeBooking: (id?: string) => void;

  // Reviews the user has written (v17 write-review → reviews).
  reviews: UserReview[];
  addReview: (review: Omit<UserReview, 'id' | 'createdAt'>) => void;
}

const emptyDraft = {
  draftPart: null as string | null,
  draftType: DEFAULT_DAMAGE_TYPE,
  draftPhotos: [] as string[],
  draftNote: '',
};

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  authToken: null,
  user: null,
  setAuth: (authToken, user) => set({ authToken, user }),
  signIn: () => set({ isAuthenticated: true }),
  // Sign-out clears the whole client session so the next account starts clean
  // (wireframe: sign-out sheet → splash).
  signOut: () =>
    set({
      isAuthenticated: false,
      authToken: null,
      user: null,
      damageParts: [],
      ...emptyDraft,
      aiEstimate: null,
      cart: emptyCart,
      points: SEED_POINTS,
      isPro: false,
      proPlan: null,
      diyUnlocked: false,
      dailyCheckedIn: false,
      noShowCount: 0,
      activeVehicleId: null,
      bookings: SEED_BOOKINGS,
      reviews: [],
    }),

  // Dark mode — v17 defaults to its dark-navy theme (toggle to light in Settings).
  darkMode: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  language: 'English',
  setLanguage: (language) => set({ language }),
  distanceUnit: 'mi',
  setDistanceUnit: (distanceUnit) => set({ distanceUnit }),

  points: SEED_POINTS,
  addPoints: (n) => set((s) => ({ points: s.points + n })),
  setPoints: (points) => set({ points }),

  isPro: false,
  proPlan: null,
  diyUnlocked: false,
  // Pro includes DIY guides, so unlocking Pro also flips diyUnlocked.
  unlockPro: () => set({ isPro: true, proPlan: 'annual', diyUnlocked: true }),
  subscribePro: (plan) => set({ isPro: true, proPlan: plan, diyUnlocked: true }),
  unlockDiyOnly: () => set({ diyUnlocked: true }),

  dailyCheckedIn: false,
  claimDailyCheckIn: () =>
    set((s) => (s.dailyCheckedIn ? {} : { dailyCheckedIn: true, points: s.points + 10 })),

  noShowCount: 0,
  addNoShow: () => set((s) => ({ noShowCount: s.noShowCount + 1 })),

  activeVehicleId: null,
  setActiveVehicle: (activeVehicleId) => set({ activeVehicleId }),

  damageParts: [],
  ...emptyDraft,
  pickPart: (part) =>
    set((s) => {
      const existing = s.damageParts.find((p) => p.part === part);
      return existing
        ? { draftPart: part, draftType: existing.type, draftPhotos: existing.photoUris ?? [], draftNote: existing.note ?? '' }
        : { draftPart: part, draftType: DEFAULT_DAMAGE_TYPE, draftPhotos: [], draftNote: '' };
    }),
  setDraftType: (draftType) => set({ draftType }),
  setDraftNote: (draftNote) => set({ draftNote }),
  addDraftPhoto: (uri) => set((s) => ({ draftPhotos: [...s.draftPhotos, uri] })),
  commitDraftPart: () =>
    set((s) => {
      if (!s.draftPart || s.draftPhotos.length < 1) return {};
      const next: DamagePart = {
        part: s.draftPart,
        type: s.draftType,
        photos: s.draftPhotos.length,
        photoUris: [...s.draftPhotos],
        note: s.draftNote.trim() || undefined,
      };
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
  resetDamageFlow: () => set({ damageParts: [], ...emptyDraft, aiEstimate: null }),
  aiEstimate: null,
  setAiEstimate: (aiEstimate) => set({ aiEstimate }),

  reminderPref: '1 day before',
  setReminderPref: (reminderPref) => set({ reminderPref }),

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

  bookings: SEED_BOOKINGS,
  addBooking: (booking) =>
    set((s) => ({
      bookings: [
        { ...booking, id: `bk-${Date.now()}`, createdAt: Date.now() },
        ...s.bookings,
      ],
    })),
  removeBooking: (id) =>
    set((s) => ({
      bookings: id ? s.bookings.filter((b) => b.id !== id) : s.bookings.slice(1),
    })),

  reviews: [],
  addReview: (review) =>
    set((s) => ({
      reviews: [{ ...review, id: `rv-${Date.now()}`, createdAt: Date.now() }, ...s.reviews],
    })),
}));
