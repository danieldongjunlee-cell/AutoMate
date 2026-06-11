/** Mock domain data shared by the mock services. Copy mirrors the wireframe. */

export interface Dealer {
  id: string;
  name: string;
  initial: string;
  color: string; // avatar/brand color
  rating: number;
  reviews: number;
  distanceMi: number;
  hours: string;
  openStatus: 'Open' | 'Closes soon' | 'Closed';
  closesAt: string;
}

export const DEALERS: Dealer[] = [
  {
    id: 'honda-fairfax',
    name: 'Honda Fairfax',
    initial: 'H',
    color: '#7F77DD',
    rating: 4.9,
    reviews: 312,
    distanceMi: 1.2,
    hours: 'Mon–Sat 8AM–7PM',
    openStatus: 'Open',
    closesAt: '6PM',
  },
  {
    id: 'autofix-pro',
    name: 'AutoFix Pro',
    initial: 'A',
    color: '#1D9E75',
    rating: 4.8,
    reviews: 204,
    distanceMi: 0.8,
    hours: 'Mon–Fri 8AM–6PM',
    openStatus: 'Open',
    closesAt: '7PM',
  },
  {
    id: 'vienna-auto',
    name: 'Vienna Auto Care',
    initial: 'V',
    color: '#378ADD',
    rating: 4.8,
    reviews: 156,
    distanceMi: 3.4,
    hours: 'Mon–Sat 9AM–6PM',
    openStatus: 'Closes soon',
    closesAt: '6PM',
  },
  {
    id: 'city-body',
    name: 'City Body Shop',
    initial: 'C',
    color: '#378ADD',
    rating: 4.6,
    reviews: 98,
    distanceMi: 2.7,
    hours: 'Mon–Fri 8AM–5PM',
    openStatus: 'Open',
    closesAt: '5PM',
  },
];

export interface Quote {
  id: string;
  dealerId: string;
  price: number;
  priceHigh?: number;
  note: string;
  parts: 'OEM' | 'Aftermarket';
  /** Pin position on the stylized map (percentages). */
  pin: { top: number; left: number };
  tier: 'lowest' | 'good' | 'fair' | 'higher';
}

export const QUOTES: Quote[] = [
  {
    id: 'q-autofix',
    dealerId: 'autofix-pro',
    price: 285,
    note: 'Same day available.',
    parts: 'Aftermarket',
    pin: { top: 30, left: 42 },
    tier: 'lowest',
  },
  {
    id: 'q-honda',
    dealerId: 'honda-fairfax',
    price: 330,
    priceHigh: 345,
    note: 'PDR possible. 2-day turnaround, OEM paint match.',
    parts: 'OEM',
    pin: { top: 25, left: 68 },
    tier: 'higher',
  },
  {
    id: 'q-vienna',
    dealerId: 'vienna-auto',
    price: 310,
    note: 'Free pickup within 5 miles.',
    parts: 'Aftermarket',
    pin: { top: 60, left: 58 },
    tier: 'fair',
  },
  {
    id: 'q-city',
    dealerId: 'city-body',
    price: 295,
    note: 'OEM parts, 3-day turnaround.',
    parts: 'OEM',
    pin: { top: 45, left: 28 },
    tier: 'good',
  },
];

export const QUOTE_REQUEST = {
  id: 'req-1',
  title: 'Rear bumper dent',
  shopsNotified: 12,
  quotesReceived: 8,
  newQuotes: 3,
  priceRange: { low: 285, high: 480 },
  city: 'Fairfax, VA',
};

/** Car-diagram parts, row by row (top-down view, front at top). */
export type PartCellKind = 'bumper' | 'fender' | 'door' | 'panel';
export interface PartCell {
  name: string;
  kind: PartCellKind;
}
export const CAR_PART_ROWS: PartCell[][] = [
  [{ name: 'Front bumper', kind: 'bumper' }],
  [
    { name: 'L. Fender', kind: 'fender' },
    { name: 'Hood', kind: 'panel' },
    { name: 'R. Fender', kind: 'fender' },
  ],
  [
    { name: 'L. Door', kind: 'door' },
    { name: 'Windshield', kind: 'panel' },
    { name: 'R. Door', kind: 'door' },
  ],
  [
    { name: 'L. Rear door', kind: 'door' },
    { name: 'Roof', kind: 'panel' },
    { name: 'R. Rear door', kind: 'door' },
  ],
  [{ name: 'Rear window', kind: 'panel' }],
  [
    { name: 'L. Rear fender', kind: 'fender' },
    { name: 'Trunk', kind: 'panel' },
    { name: 'R. Rear fender', kind: 'fender' },
  ],
  [{ name: 'Rear bumper', kind: 'bumper' }],
];

export const DAMAGE_TYPES = ['Dent', 'Scratch', 'Paint chip', 'Crack', 'Missing piece'];

export const PHOTO_TIPS = [
  {
    icon: '☀️',
    bold: 'Good lighting',
    rest: ' — daylight or bright shade, avoid flash or direct sun',
  },
  { icon: '📏', bold: '3–5 ft away', rest: ' — close enough for detail, far enough for context' },
  {
    icon: '📷',
    bold: '3+ angles',
    rest: ' — straight-on, left-side, right-side for accurate AI estimate',
  },
];

/** Booking time slots (accept-booking screen). */
export const TIME_SLOTS = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

/** April 2027 calendar config from the wireframe (12 pre-selected, some days unavailable). */
export const BOOKING_MONTH = {
  label: 'April 2027',
  year: 2027,
  month: 4,
  daysInMonth: 30,
  /** Weekday of the 1st (0=Sun). Apr 1 2027 is a Thursday. */
  firstWeekday: 4,
  unavailable: [1, 2, 4, 5, 6, 11, 13, 18, 20, 24, 25, 26, 27, 28, 29, 30],
};

export const dealerById = (id: string | null | undefined): Dealer =>
  DEALERS.find((d) => d.id === id) ?? DEALERS[0];

// ── Maintenance domain ─────────────────────────────────────────────────

/** Primary vehicle (maint-dashboard / prof-cars). */
export const VEHICLE = {
  name: '2019 Honda Accord EX-L',
  colorName: 'Lunar Silver Metallic',
  vin: '1HGCV1F34KA01234',
  odometerMi: 47230,
  oilSpec: '5W-30 Full Synthetic',
  lastService: 'Mar 12, 2025',
  healthPct: 78,
  healthLabel: 'Good',
  oilDueInMi: 800,
  marketValue: {
    value: 17400,
    aboveAvg: 420,
    low: 14200,
    high: 21500,
    /** Position of value within low–high band. */
    barPct: 67,
  },
};

export interface UpcomingService {
  id: string;
  name: string;
  due: string;
  icon: string;
  status: 'Soon' | 'Upcoming' | 'Scheduled';
}

export const UPCOMING_SERVICES: UpcomingService[] = [
  { id: 'up-oil', name: 'Oil change', due: 'Due ~800 mi', icon: '🛢️', status: 'Soon' },
  { id: 'up-tires', name: 'Tire rotation', due: 'Due ~2,500 mi', icon: '↺', status: 'Upcoming' },
  {
    id: 'up-insp',
    name: 'Multi-point inspection',
    due: 'Due Nov 2025',
    icon: '🔍',
    status: 'Scheduled',
  },
];

export interface ServiceRecord {
  id: string;
  type: string;
  shop: string;
  dateLabel: string;
  mileage: string;
  cost: number;
  icon: string;
}

/** Seed history records from the wireframe (maint-history "Past services"). */
export const SERVICE_HISTORY_SEED: ServiceRecord[] = [
  {
    id: 'rec-oil',
    type: 'Oil change',
    shop: 'AutoFix Pro',
    dateLabel: 'Mar 12',
    mileage: '44,500 mi',
    cost: 49,
    icon: '🛢️',
  },
  {
    id: 'rec-tires',
    type: 'Tire rotation',
    shop: 'Honda Fairfax',
    dateLabel: 'Dec 5',
    mileage: '42,100 mi',
    cost: 39,
    icon: '↺',
  },
];

export const HISTORY_TIME_FILTERS = ['All time', 'Last 6 months', '2024', '2023'];
export const HISTORY_TYPE_FILTERS = ['All types', 'Oil change', 'Tires', 'Brakes', 'Body repair'];
export const MANUAL_SERVICE_TYPES = ['Oil change', 'Tire rotation', 'Brake service', 'Air filter'];

/** Receipt fields parsed by the mock OCR (maint-scan-rev). */
export const SCANNED_RECEIPT = {
  serviceType: 'Oil change — synthetic',
  shop: 'AutoFix Pro',
  date: 'Mar 12, 2025',
  mileage: '44,500 mi',
  amount: '$49.00',
};

export interface DiyGuide {
  id: string;
  level: 'EASY' | 'MED' | 'HARD';
  title: string;
  meta: string;
  free: boolean;
}

export const DIY_GUIDES: DiyGuide[] = [
  {
    id: 'diy-boil',
    level: 'EASY',
    title: 'Boiling water dent removal',
    meta: '3 steps · ~8 min · No tools needed',
    free: true,
  },
  {
    id: 'diy-plunger',
    level: 'EASY',
    title: 'Plunger pull on bumper dents',
    meta: '2 steps · ~5 min · No tools needed',
    free: true,
  },
  {
    id: 'diy-paint',
    level: 'MED',
    title: 'Paint touch-up for scratches',
    meta: '4 steps · ~12 min · No tools needed',
    free: false,
  },
  {
    id: 'diy-chip',
    level: 'EASY',
    title: 'Nail polish paint chip fix',
    meta: '2 steps · ~5 min · No tools needed',
    free: false,
  },
  {
    id: 'diy-pdr',
    level: 'HARD',
    title: 'PDR paintless dent repair',
    meta: '5 steps · ~22 min · PDR kit required',
    free: false,
  },
];

export const DIY_CATEGORIES = ['All', 'Bumper', 'Scratches', 'Paint chips', 'Interior'];

export const SCHEDULE_SERVICE_FILTERS = ['All', 'Oil change', 'Tires', 'Brakes', 'Inspection'];

/** Per-dealer price chips on maint-schedule cards. */
export const DEALER_SERVICE_CHIPS: Record<string, string[]> = {
  'honda-fairfax': ['Oil $49', 'Tires $89+', 'Brakes $149', 'Inspection $39'],
  'autofix-pro': ['Oil $39', 'Inspection $69', 'Brakes $129'],
  'vienna-auto': ['Tires $79+', 'Brakes $129'],
};

export interface BookableService {
  id: string;
  name: string;
  detail: string;
  price: number;
  durationMin: number;
  icon: string;
}

/** Multi-select service menu (maint-schedule-book, Honda Fairfax). */
export const BOOKABLE_SERVICES: BookableService[] = [
  {
    id: 'svc-oil',
    name: 'Oil change',
    detail: 'Full synthetic 5W-30 · ~45 min',
    price: 49,
    durationMin: 45,
    icon: '🛢️',
  },
  {
    id: 'svc-tires',
    name: 'Tire rotation',
    detail: '4-wheel balance · ~30 min',
    price: 29,
    durationMin: 30,
    icon: '🛞',
  },
  {
    id: 'svc-insp',
    name: 'Multi-point inspection',
    detail: '27-point check · ~60 min',
    price: 39,
    durationMin: 60,
    icon: '🔧',
  },
  {
    id: 'svc-brakes',
    name: 'Brake inspection',
    detail: 'Pads & rotors check · ~45 min',
    price: 149,
    durationMin: 45,
    icon: '🛑',
  },
];

export const MAINT_TIME_SLOTS = ['8:00 AM', '10:00 AM', '1:00 PM', '3:30 PM'];
