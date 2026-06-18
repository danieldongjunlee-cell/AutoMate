import { create } from 'zustand';

import {
  deleteBookingRow,
  insertBooking,
  updateBookingRow,
} from '../lib/bookings';
import { recordPoints } from '../lib/points';
import { signOutSupabase } from '../lib/supabaseAuth';
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

/** v17 Pro plans (annual $48/yr ≈ $4/mo; monthly $9.99). 1 pt = $0.01 economy. */
export const PRO_PLANS = {
  annual: { id: 'annual' as const, priceCents: 4800, label: 'Annual', per: '$4/mo' },
  monthly: { id: 'monthly' as const, priceCents: 999, label: 'Monthly', per: '$9.99/mo' },
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
  status: 'confirmed' | 'paid' | 'reschedule_proposed' | 'cancelled';
  /** When the shop proposes a different time (status reschedule_proposed). */
  proposedTime?: string;
  /** The shop's reason for proposing a new time or cancelling (shown on tap). */
  reason?: string;
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
    status: 'reschedule_proposed',
    proposedTime: 'Fri, Apr 13 · 2:00 PM',
    reason: 'The replacement bumper cover is on backorder until Apr 13 — the shop proposed the next available slot.',
    createdAt: 2,
  },
  {
    id: 'bk-seed-cancelled',
    kind: 'repair',
    dealerId: 'autofix-pro',
    brand: 'Honda',
    icon: '🚗',
    title: 'Front fender dent',
    dealerName: 'AutoFix Pro',
    dateLabel: 'Tue, Apr 18',
    mon: 'Apr',
    day: '18',
    time: '1:00 PM',
    priceLabel: '$240–290',
    status: 'cancelled',
    reason: 'The shop had to cancel — their paint booth is down for repairs this week. They suggested rebooking next week.',
    createdAt: 4,
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
  username?: string;
  phone?: string;
  /** Profile photo (local uri or remote url). */
  avatarUri?: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  /** Bearer token for the API client (real JWT in api mode, sentinel in mock mode). */
  authToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string | null, user: AuthUser | null) => void;
  /** Merge profile edits (name/username) into the current user for live display. */
  patchUser: (patch: Partial<AuthUser>) => void;
  signIn: () => void;
  signOut: () => void;
  /** True only for a brand-new sign-up, until they submit their first AI
   *  estimate. Drives the Home "New here?" onboarding hint — returning users
   *  (sign-in / restored session) never see it. */
  isNewUser: boolean;
  setIsNewUser: (v: boolean) => void;

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
  /** Apply a delta and (Supabase) append a ledger row tagged with `reason`. */
  addPoints: (n: number, reason?: string) => void;
  /** Set the absolute balance (api/Supabase reconcile from server/ledger). */
  setPoints: (n: number) => void;

  // AutoMate Pro (v17): subscription (annual/monthly) that includes DIY +
  // waives booking deposits, OR a separate $10 one-time DIY-only unlock.
  isPro: boolean;
  proPlan: 'annual' | 'monthly' | null;
  diyUnlocked: boolean; // true via Pro OR the $10 DIY-only purchase
  unlockPro: () => void; // legacy entry — defaults to annual
  subscribePro: (plan: 'annual' | 'monthly') => void;
  cancelPro: () => void; // cancel membership (keeps last plan for easy renew)
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
  draftTypes: string[];
  /** Captured photo uris for the in-progress part (real camera/gallery uris). */
  draftPhotos: string[];
  /** Optional free-text damage description for the in-progress part. */
  draftNote: string;
  /** Single-select a part (wireframe pickPart). Re-picking a committed part seeds its types/photos/note for editing. */
  pickPart: (part: string) => void;
  toggleDraftType: (t: string) => void;
  setDraftNote: (note: string) => void;
  addDraftPhoto: (uri: string) => void;
  removeDraftPhoto: (index: number) => void;
  /** Merge the draft into damageParts (idempotent — replaces an entry with the same part name). */
  commitDraftPart: () => void;
  /** Clear only the draft ("+ Add another damaged part" starts a fresh pass). */
  resetDraft: () => void;
  removePart: (index: number) => void;
  resetDamageFlow: () => void;
  /** AI estimate from the latest submit (Submitted + DealerQuotes headers). */
  aiEstimate: AiEstimateSummary | null;
  setAiEstimate: (estimate: AiEstimateSummary | null) => void;
  /** Whether the user has opened the Quotes tab since the latest submit (badge). */
  quotesViewed: boolean;
  setQuotesViewed: (v: boolean) => void;
  /** Tab-badge "seen" flags — cleared when the tab is opened. */
  bookingsViewed: boolean;
  setBookingsViewed: (v: boolean) => void;
  /** Community post ids the user has opened/seen → drives the unread-posts badge. */
  readPostIds: Record<string, boolean>;
  markPostsRead: (ids: string[]) => void;
  /** Communities the user has explicitly joined. Empty for new users — a
   *  registered car makes its brand's communities *appear*, but none are joined
   *  (and no notifications) until the user joins one. */
  joinedCommunityIds: string[];
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;

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
  /** Replace the booking list (used to hydrate from Supabase on login). */
  setBookings: (bookings: AppBooking[]) => void;
  /** Record a new booking; the latest one shows first in the Bookings tab. */
  addBooking: (booking: Omit<AppBooking, 'id' | 'createdAt'>) => void;
  /** Remove a booking (cancel). With no id, drops the most recent. */
  removeBooking: (id?: string) => void;
  /** Accept the shop's proposed new time → confirmed at that time. */
  acceptProposedTime: (id: string) => void;

  // Reviews the user has written (v17 write-review → reviews).
  reviews: UserReview[];
  addReview: (review: Omit<UserReview, 'id' | 'createdAt'>) => void;
}

const emptyDraft = {
  draftPart: null as string | null,
  draftTypes: [] as string[],
  draftPhotos: [] as string[],
  draftNote: '',
};

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  authToken: null,
  user: null,
  setAuth: (authToken, user) => set({ authToken, user }),
  patchUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
  signIn: () => set({ isAuthenticated: true }),
  isNewUser: false,
  setIsNewUser: (isNewUser) => set({ isNewUser }),
  // Sign-out clears the whole client session so the next account starts clean
  // (wireframe: sign-out sheet → splash).
  signOut: () => {
    // Also end the Supabase session (no-op when Supabase isn't configured).
    void signOutSupabase();
    set({
      isAuthenticated: false,
      authToken: null,
      user: null,
      isNewUser: false,
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
      joinedCommunityIds: [],
      bookings: SEED_BOOKINGS,
      reviews: [],
    });
  },

  // Dark mode — v17 defaults to its dark-navy theme (toggle to light in Settings).
  darkMode: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  language: 'English',
  setLanguage: (language) => set({ language }),
  distanceUnit: 'mi',
  setDistanceUnit: (distanceUnit) => set({ distanceUnit }),

  points: SEED_POINTS,
  addPoints: (n, reason) => {
    set((s) => ({ points: s.points + n }));
    // Write-through to the Supabase ledger with the running balance (no-op on mock).
    void recordPoints(n, reason ?? 'Points adjustment', useAppStore.getState().points);
  },
  setPoints: (points) => set({ points }),

  isPro: false,
  proPlan: null,
  diyUnlocked: false,
  // Pro includes DIY guides, so unlocking Pro also flips diyUnlocked.
  unlockPro: () => set({ isPro: true, proPlan: 'annual', diyUnlocked: true }),
  subscribePro: (plan) => set({ isPro: true, proPlan: plan, diyUnlocked: true }),
  cancelPro: () => set({ isPro: false }),
  unlockDiyOnly: () => set({ diyUnlocked: true }),

  dailyCheckedIn: false,
  claimDailyCheckIn: () => {
    if (useAppStore.getState().dailyCheckedIn) return;
    set({ dailyCheckedIn: true });
    // Route through addPoints so the check-in is recorded in the points ledger.
    useAppStore.getState().addPoints(10, 'Daily check-in');
  },

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
        ? { draftPart: part, draftTypes: existing.type ? existing.type.split(', ').filter(Boolean) : [], draftPhotos: existing.photoUris ?? [], draftNote: existing.note ?? '' }
        : { draftPart: part, draftTypes: [], draftPhotos: [], draftNote: '' };
    }),
  // Multi-select damage types (v17 feedback): toggle a type in/out of the draft.
  toggleDraftType: (t) =>
    set((s) => ({
      draftTypes: s.draftTypes.includes(t)
        ? s.draftTypes.filter((x) => x !== t)
        : [...s.draftTypes, t],
    })),
  setDraftNote: (draftNote) => set({ draftNote }),
  addDraftPhoto: (uri) => set((s) => (s.draftPhotos.length >= 10 ? {} : { draftPhotos: [...s.draftPhotos, uri] })),
  removeDraftPhoto: (index) => set((s) => ({ draftPhotos: s.draftPhotos.filter((_, i) => i !== index) })),
  commitDraftPart: () =>
    set((s) => {
      if (!s.draftPart || s.draftPhotos.length < 1) return {};
      const next: DamagePart = {
        part: s.draftPart,
        type: s.draftTypes.join(', ') || 'Damage',
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
  quotesViewed: true,
  setQuotesViewed: (quotesViewed) => set({ quotesViewed }),
  bookingsViewed: false,
  setBookingsViewed: (bookingsViewed) => set({ bookingsViewed }),
  readPostIds: {},
  markPostsRead: (ids) =>
    set((s) => {
      const missing = ids.filter((id) => !s.readPostIds[id]);
      if (missing.length === 0) return {}; // nothing new → no state change / re-render
      const next = { ...s.readPostIds };
      for (const id of missing) next[id] = true;
      return { readPostIds: next };
    }),
  joinedCommunityIds: [],
  joinCommunity: (id) =>
    set((s) => (s.joinedCommunityIds.includes(id) ? {} : { joinedCommunityIds: [...s.joinedCommunityIds, id] })),
  leaveCommunity: (id) =>
    set((s) => ({ joinedCommunityIds: s.joinedCommunityIds.filter((x) => x !== id) })),

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
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => {
    const full: AppBooking = { ...booking, id: `bk-${Date.now()}`, createdAt: Date.now() };
    void insertBooking(full); // write-through to Supabase (no-op if unconfigured)
    set((s) => ({ bookings: [full, ...s.bookings], bookingsViewed: false }));
  },
  removeBooking: (id) => {
    const targetId = id ?? useAppStore.getState().bookings[0]?.id;
    if (targetId) void deleteBookingRow(targetId);
    set((s) => ({
      bookings: id ? s.bookings.filter((b) => b.id !== id) : s.bookings.slice(1),
    }));
  },
  acceptProposedTime: (id) => {
    const b = useAppStore.getState().bookings.find((x) => x.id === id);
    if (b?.proposedTime) {
      const dateLabel = b.proposedTime.split(' · ')[0] ?? b.dateLabel;
      const time = b.proposedTime.split(' · ')[1] ?? b.time;
      void updateBookingRow(id, { status: 'confirmed', date_label: dateLabel, time, proposed_time: null });
    }
    set((s) => ({
      bookings: s.bookings.map((bk) =>
        bk.id === id && bk.proposedTime
          ? {
              ...bk,
              status: 'confirmed',
              dateLabel: bk.proposedTime.split(' · ')[0] ?? bk.dateLabel,
              time: bk.proposedTime.split(' · ')[1] ?? bk.time,
              proposedTime: undefined,
            }
          : bk,
      ),
    }));
  },

  reviews: [],
  addReview: (review) =>
    set((s) => ({
      reviews: [{ ...review, id: `rv-${Date.now()}`, createdAt: Date.now() }, ...s.reviews],
    })),
}));
