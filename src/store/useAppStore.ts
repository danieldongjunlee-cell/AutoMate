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

interface AppState {
  // Auth
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;

  // Dark mode (Settings → App preferences)
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Damage flow: selected car parts (car-diagram multi-select)
  selectedParts: string[];
  togglePart: (part: string) => void;
  clearParts: () => void;

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

  selectedParts: [],
  togglePart: (part) =>
    set((s) => ({
      selectedParts: s.selectedParts.includes(part)
        ? s.selectedParts.filter((p) => p !== part)
        : [...s.selectedParts, part],
    })),
  clearParts: () => set({ selectedParts: [] }),

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
