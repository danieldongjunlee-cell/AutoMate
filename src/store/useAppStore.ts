import { create } from 'zustand';

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

/** A captured (mock) damage photo. */
export interface DamagePhoto {
  id: string;
  label: string; // e.g. "Angle 1"
  /** Placeholder art tint until real camera capture is wired. */
  tint: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;

  // Dark mode (Settings → App preferences)
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Reward points (420 pts = $4.20 in the wireframe; earned by scans/logs/posts)
  points: number;
  addPoints: (n: number) => void;

  // Damage flow: selected car parts (car-diagram multi-select)
  selectedParts: string[];
  togglePart: (part: string) => void;
  clearParts: () => void;

  // Damage flow: photos + damage type (camera / confirm-submit)
  damagePhotos: DamagePhoto[];
  addDamagePhoto: () => void;
  removeDamagePhoto: (id: string) => void;
  damageType: string;
  setDamageType: (t: string) => void;
  resetDamageFlow: () => void;

  // Maintenance booking cart (multi-service selection)
  cart: BookingCart;
  setCartDealer: (dealerId: string) => void;
  toggleCartService: (service: CartService) => void;
  setCartSlot: (date: string, time: string) => void;
  clearCart: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  signIn: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false, selectedParts: [], cart: emptyCart }),

  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  points: 420,
  addPoints: (n) => set((s) => ({ points: s.points + n })),

  selectedParts: [],
  togglePart: (part) =>
    set((s) => ({
      selectedParts: s.selectedParts.includes(part)
        ? s.selectedParts.filter((p) => p !== part)
        : [...s.selectedParts, part],
    })),
  clearParts: () => set({ selectedParts: [] }),

  damagePhotos: [],
  addDamagePhoto: () =>
    set((s) => {
      const tints = ['#2D1A1A', '#3A2A1A', '#1A2A3A', '#1A2D1F', '#2A1A2D'];
      const n = s.damagePhotos.length;
      return {
        damagePhotos: [
          ...s.damagePhotos,
          { id: `photo-${Date.now()}-${n}`, label: `Angle ${n + 1}`, tint: tints[n % tints.length] },
        ],
      };
    }),
  removeDamagePhoto: (id) =>
    set((s) => ({ damagePhotos: s.damagePhotos.filter((p) => p.id !== id) })),
  damageType: 'Dent',
  setDamageType: (damageType) => set({ damageType }),
  resetDamageFlow: () => set({ selectedParts: [], damagePhotos: [], damageType: 'Dent' }),

  cart: emptyCart,
  setCartDealer: (dealerId) => set((s) => ({ cart: { ...s.cart, dealerId } })),
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
