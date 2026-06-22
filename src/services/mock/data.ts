/** Mock domain data shared by the mock services. Copy mirrors the wireframe. */
import { EARN_RULES } from '../../config/points';

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
  /** Real Fairfax-area coordinates (feedback pass 2: real tile maps). */
  lat: number;
  lng: number;
  address: string;
}

/** The demo user's location — Fairfax, VA (s-all-quotes-map "📍 Fairfax, VA"). */
export const USER_LOCATION = { lat: 38.846, lng: -77.306 };

/** Distance filter options used app-wide (quotes, map, schedule). Caps at 30 mi. */
export const DISTANCE_FILTERS = ['Any distance', 'Within 5 mi', 'Within 10 mi', 'Within 30 mi'];
export const DISTANCE_CAP: Record<string, number> = {
  'Any distance': Infinity,
  'Within 5 mi': 5,
  'Within 10 mi': 10,
  'Within 30 mi': 30,
};

export const DEALERS: Dealer[] = [
  {
    id: 'honda-fairfax',
    name: 'Honda Fairfax',
    initial: 'H',
    color: '#7F77DD',
    rating: 4.9,
    reviews: 312,
    distanceMi: 1.2,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Open',
    closesAt: '6PM',
    lat: 38.858,
    lng: -77.29,
    address: '11020 Fairfax Blvd, Fairfax, VA 22030',
  },
  {
    id: 'autofix-pro',
    name: 'AutoFix Pro',
    initial: 'A',
    color: '#1D9E75',
    rating: 4.7,
    reviews: 204,
    distanceMi: 2.1,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Open',
    closesAt: '6PM',
    lat: 38.874,
    lng: -77.291,
    address: '3960 Chain Bridge Rd, Fairfax, VA 22030',
  },
  {
    id: 'vienna-auto',
    name: 'Vienna Auto Care',
    initial: 'V',
    color: '#378ADD',
    rating: 4.8,
    reviews: 156,
    distanceMi: 3.4,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Closes soon',
    closesAt: '6PM',
    lat: 38.881,
    lng: -77.261,
    address: '127 Maple Ave E, Vienna, VA 22180',
  },
  {
    id: 'fairfax-collision',
    name: 'Fairfax Collision',
    initial: 'F',
    color: '#E24B4A',
    rating: 4.6,
    reviews: 142,
    distanceMi: 2.8,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Open',
    closesAt: '6PM',
    lat: 38.81,
    lng: -77.33,
    address: '9520 Lee Hwy, Fairfax, VA 22031',
  },
  {
    id: 'chantilly-body',
    name: 'Chantilly Auto Body',
    initial: 'C',
    color: '#EF9F27',
    rating: 4.5,
    reviews: 98,
    distanceMi: 5.2,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Open',
    closesAt: '6PM',
    lat: 38.876,
    lng: -77.394,
    address: '14500 Lee Rd, Chantilly, VA 20151',
  },
  {
    id: 'nova-dent',
    name: 'NoVa Dent Works',
    initial: 'N',
    color: '#534AB7',
    rating: 4.7,
    reviews: 173,
    distanceMi: 4.0,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Open',
    closesAt: '6PM',
    lat: 38.806,
    lng: -77.36,
    address: '6420 Rolling Rd, Springfield, VA 22152',
  },
  {
    id: 'arlington-spa',
    name: 'Arlington Auto Spa',
    initial: 'A',
    color: '#0F6E56',
    rating: 4.4,
    reviews: 87,
    distanceMi: 6.1,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Open',
    closesAt: '6PM',
    lat: 38.886,
    lng: -77.205,
    address: '2611 Columbia Pike, Arlington, VA 22204',
  },
  {
    id: 'premier-body',
    name: 'Premier Body Shop',
    initial: 'P',
    color: '#888888',
    rating: 4.3,
    reviews: 64,
    distanceMi: 7.3,
    hours: 'Mon–Sat 8–6',
    openStatus: 'Open',
    closesAt: '6PM',
    lat: 38.786,
    lng: -77.195,
    address: '6231 Richmond Hwy, Alexandria, VA 22303',
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
    lat: 38.856,
    lng: -77.354,
    address: '10912 Main St, Fairfax, VA 22030',
  },
];

/**
 * Brand-exclusive dealerships only service their own marque; every other shop
 * is an independent that works on any brand. Used to filter the maintenance
 * shop list to the user's registered car.
 */
export const DEALER_BRANDS: Record<string, string[]> = {
  'honda-fairfax': ['Honda'],
};

/** True when a shop can service the given brand (independents service all). */
export const dealerServicesBrand = (dealerId: string, brand: string): boolean => {
  const brands = DEALER_BRANDS[dealerId];
  return !brands || brands.includes(brand);
};

export interface Quote {
  id: string;
  dealerId: string;
  price: number;
  priceHigh?: number;
  note: string;
  parts: 'OEM' | 'Aftermarket';
  /** Pin position on the stylized map (percentages). */
  pin: { top: number; left: number };
  /** Map/legend ranking (all-quotes-map: BEST PRICE / RECOMMENDED tags). */
  tier: 'best' | 'recommended' | 'other';
}

/** All 8 quotes from wireframe v15.10 (s-dealer-quotes / s-all-quotes-map pins). */
export const QUOTES: Quote[] = [
  {
    id: 'q-autofix',
    dealerId: 'autofix-pro',
    price: 285,
    note: 'Quick turnaround, 1-day repair for minor dents.',
    parts: 'Aftermarket',
    pin: { top: 26, left: 20 },
    tier: 'best',
  },
  {
    id: 'q-honda',
    dealerId: 'honda-fairfax',
    price: 330,
    priceHigh: 345,
    note: 'PDR possible. 2-day turnaround, OEM paint match.',
    parts: 'OEM',
    pin: { top: 44, left: 46 },
    tier: 'recommended',
  },
  {
    id: 'q-vienna',
    dealerId: 'vienna-auto',
    price: 345,
    note: 'Includes free paint protection after repair.',
    parts: 'Aftermarket',
    pin: { top: 18, left: 62 },
    tier: 'other',
  },
  {
    id: 'q-fairfax-collision',
    dealerId: 'fairfax-collision',
    price: 360,
    note: 'Certified body shop, lifetime warranty on repair.',
    parts: 'OEM',
    pin: { top: 64, left: 24 },
    tier: 'other',
  },
  {
    id: 'q-chantilly',
    dealerId: 'chantilly-body',
    price: 375,
    note: 'Same-week appointments available.',
    parts: 'Aftermarket',
    pin: { top: 70, left: 66 },
    tier: 'other',
  },
  {
    id: 'q-nova-dent',
    dealerId: 'nova-dent',
    price: 395,
    note: 'Specialists in paintless dent removal.',
    parts: 'OEM',
    pin: { top: 8, left: 38 },
    tier: 'other',
  },
  {
    id: 'q-arlington',
    dealerId: 'arlington-spa',
    price: 420,
    note: 'Premium service with loaner vehicle included.',
    parts: 'OEM',
    pin: { top: 52, left: 78 },
    tier: 'other',
  },
  {
    id: 'q-premier',
    dealerId: 'premier-body',
    price: 480,
    note: 'Full-service shop with detailing add-ons.',
    parts: 'OEM',
    pin: { top: 82, left: 46 },
    tier: 'other',
  },
];

export const QUOTE_REQUEST = {
  id: 'req-1',
  title: 'Rear bumper dent',
  shopsNotified: 12,
  quotesReceived: 8,
  newQuotes: 3,
  priceRange: { low: 285, high: 480 },
  aiConfidencePct: 87,
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
    { name: 'L. Front door', kind: 'door' },
    { name: 'Windshield', kind: 'panel' },
    { name: 'R. Front door', kind: 'door' },
  ],
  [
    { name: 'L. Step', kind: 'panel' },
    { name: 'Roof', kind: 'panel' },
    { name: 'R. Step', kind: 'panel' },
  ],
  [
    { name: 'L. Rear door', kind: 'door' },
    { name: 'Trunk', kind: 'panel' },
    { name: 'R. Rear door', kind: 'door' },
  ],
  [
    { name: 'L. Rear fender', kind: 'fender' },
    { name: 'Rear glass', kind: 'panel' },
    { name: 'R. Rear fender', kind: 'fender' },
  ],
  [{ name: 'Rear bumper', kind: 'bumper' }],
];

/** Extra parts reached via the s-car-diagram "Side mirror / Glass / Wheel / Light" button. */
export const SIDE_MISC_PART = 'Side mirror / Glass / Wheel / Light';

/** Damage-type chips on s-camera (tagged at capture time in v15.10). */
export const DAMAGE_TYPES = ['Dent', 'Scratch', 'Crack', 'Paint'];

/** AI severity blurb per damage type (confirm-submit rows: "3 photos · Paint intact"). */
export const DAMAGE_TYPE_SEVERITY: Record<string, string> = {
  Dent: 'Paint intact',
  Scratch: 'Surface level',
  Crack: 'Needs inspection',
  Paint: 'Surface level',
};

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

/**
 * Booking calendar config — the CURRENT month, so the date picker always opens
 * on a live month. Past days are marked unavailable and the picker defaults to
 * tomorrow (today when tomorrow rolls into next month).
 */
const _bookingNow = new Date();
const _bookingYear = _bookingNow.getFullYear();
const _bookingMonth = _bookingNow.getMonth() + 1; // 1-based
const _bookingToday = _bookingNow.getDate();
const _bookingDaysInMonth = new Date(_bookingYear, _bookingMonth, 0).getDate();
// Default the picker to tomorrow; fall back to today on the last day of a month.
const _bookingDefaultDay = _bookingToday + 1 <= _bookingDaysInMonth ? _bookingToday + 1 : _bookingToday;

export const BOOKING_MONTH = {
  label: _bookingNow.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  monthAbbr: _bookingNow.toLocaleDateString('en-US', { month: 'short' }),
  year: _bookingYear,
  month: _bookingMonth,
  today: _bookingToday,
  /** Default selected day in the picker (tomorrow). */
  defaultDay: _bookingDefaultDay,
  daysInMonth: _bookingDaysInMonth,
  /** Weekday of the 1st (0=Sun). */
  firstWeekday: new Date(_bookingYear, _bookingMonth - 1, 1).getDay(),
  /** Days before today can't be booked. */
  unavailable: Array.from({ length: Math.max(0, _bookingToday - 1) }, (_, i) => i + 1),
};

/** ISO date string ("YYYY-MM-DD") for a day in the booking month. */
export const bookingISO = (day: number): string =>
  `${BOOKING_MONTH.year}-${String(BOOKING_MONTH.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/** Default booking date (tomorrow) as an ISO string. */
export const defaultBookingISO = (): string => bookingISO(BOOKING_MONTH.defaultDay);

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
  year: number;
  mileage: string;
  cost: number;
  icon: string;
  /** Image URI of the scanned receipt, when this record came from a scan. */
  receiptUri?: string;
}

/** Seed history records from the wireframe (maint-history "Past services"). */
export const SERVICE_HISTORY_SEED: ServiceRecord[] = [
  {
    id: 'rec-oil',
    type: 'Oil change',
    shop: 'AutoFix Pro',
    dateLabel: 'Mar 12',
    year: 2025,
    mileage: '44,500 mi',
    cost: 49,
    icon: '🛢️',
  },
  {
    id: 'rec-tires',
    type: 'Tire rotation',
    shop: 'Honda Fairfax',
    dateLabel: 'Dec 5',
    year: 2024,
    mileage: '42,100 mi',
    cost: 39,
    icon: '↺',
  },
];

export const HISTORY_TIME_FILTERS = ['All time', 'Last 6 months', '2024', '2023'];
export const HISTORY_TYPE_FILTERS = ['All types', 'Oil change', 'Tires', 'Brakes', 'Body repair'];
export const MANUAL_SERVICE_TYPES = ['Oil change', 'Tire service', 'Filters', 'Fluids', 'Brakes'];

/** Receipt fields parsed by the mock OCR (maint-scan-rev). */
export const SCANNED_RECEIPT = {
  serviceType: 'Oil change — synthetic',
  shop: 'AutoFix Pro',
  date: 'Mar 12, 2025',
  mileage: '44,500 mi',
  amount: '$49.00',
};

/** Shape returned by maintService.scanReceipt (mock + /maintenance/scan). */
export type ScannedReceipt = typeof SCANNED_RECEIPT;

/** AI damage estimate carried on the submit response (mock + damage-ai). */
export interface AiEstimateSummary {
  priceLow: number;
  priceHigh: number;
  confidencePct: number;
}

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

export interface ProGuide {
  id: string;
  icon: string;
  title: string;
  sub: string;
  time: string;
  difficulty: 'Easy' | 'Medium';
}

/** The full unlocked Pro library (s-diy-guides — 12 guides). */
export const PRO_GUIDES: ProGuide[] = [
  { id: 'pg-1', icon: '🚗', title: 'Bumper dent removal', sub: 'PDR with hot water & plunger', time: '25 min', difficulty: 'Easy' },
  { id: 'pg-2', icon: '🖌️', title: 'Paint chip touch-up', sub: 'Color-match & layer like a pro', time: '20 min', difficulty: 'Easy' },
  { id: 'pg-3', icon: '✨', title: 'Scratch buffing', sub: 'Compound & polish deep scratches', time: '30 min', difficulty: 'Easy' },
  { id: 'pg-4', icon: '💡', title: 'Headlight restoration', sub: 'De-fog & UV-seal yellowed lenses', time: '40 min', difficulty: 'Easy' },
  { id: 'pg-5', icon: '🪟', title: 'Windshield chip fix', sub: 'Resin kit before it spreads', time: '35 min', difficulty: 'Medium' },
  { id: 'pg-6', icon: '🛞', title: 'Wheel scuff repair', sub: 'Curb rash sand & refinish', time: '45 min', difficulty: 'Medium' },
  { id: 'pg-7', icon: '🌫️', title: 'Foggy trim restore', sub: 'Plastic trim back to black', time: '15 min', difficulty: 'Easy' },
  { id: 'pg-8', icon: '🧲', title: 'Door ding pop-out', sub: 'Magnet & glue-tab technique', time: '30 min', difficulty: 'Medium' },
  { id: 'pg-9', icon: '🎨', title: 'Clear coat repair', sub: 'Stop peeling before it grows', time: '50 min', difficulty: 'Medium' },
  { id: 'pg-10', icon: '🔋', title: 'Battery terminal clean', sub: 'Stop corrosion & slow starts', time: '15 min', difficulty: 'Easy' },
  { id: 'pg-11', icon: '💧', title: 'Wiper streak fix', sub: 'Refill blades vs replace', time: '10 min', difficulty: 'Easy' },
  { id: 'pg-12', icon: '🔒', title: 'Interior scuff removal', sub: 'Leather & plastic restore', time: '25 min', difficulty: 'Easy' },
];

/** The 5 maintenance service types — single source of truth (mirrors
 *  MAINT_CATEGORIES) so filters, chips and labels stay consistent app-wide. */
export const SERVICE_TYPES = ['Oil change', 'Tire service', 'Filters', 'Fluids', 'Brakes'] as const;

export const SCHEDULE_SERVICE_FILTERS = ['All', ...SERVICE_TYPES];

/** Map a schedule filter to the prefix used on the per-dealer price chips. */
export const SERVICE_FILTER_KEY: Record<string, string> = {
  'Oil change': 'Oil',
  'Tire service': 'Tires',
  Filters: 'Filters',
  Fluids: 'Fluids',
  Brakes: 'Brakes',
};

/** Per-dealer price chips on maint-schedule cards — every partner lists all 5
 *  service types (prices vary by shop). */
export const DEALER_SERVICE_CHIPS: Record<string, string[]> = {
  'honda-fairfax': ['Oil $49', 'Tires $89', 'Filters $45', 'Fluids $99', 'Brakes $149'],
  'autofix-pro': ['Oil $39', 'Tires $79', 'Filters $40', 'Fluids $109', 'Brakes $129'],
  'vienna-auto': ['Oil $55', 'Tires $85', 'Filters $48', 'Fluids $119', 'Brakes $139'],
  'fairfax-collision': ['Oil $52', 'Tires $89', 'Filters $45', 'Fluids $99', 'Brakes $159'],
  'chantilly-body': ['Oil $45', 'Tires $79', 'Filters $42', 'Fluids $95', 'Brakes $145'],
  'nova-dent': ['Oil $49', 'Tires $82', 'Filters $44', 'Fluids $105', 'Brakes $149'],
  'arlington-spa': ['Oil $59', 'Tires $95', 'Filters $50', 'Fluids $125', 'Brakes $169'],
  'premier-body': ['Oil $42', 'Tires $75', 'Filters $39', 'Fluids $89', 'Brakes $135'],
  'city-body': ['Oil $47', 'Tires $85', 'Filters $43', 'Fluids $99', 'Brakes $149'],
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

/**
 * Remap a quote list's prices to span the current AI estimate range, so the
 * dealer quotes always reflect the estimate shown to the user. Preserves order
 * and relative spread (cheapest → low, priciest → high). No-op without an
 * estimate or with a single quote.
 */
export function quotesInEstimateRange(
  quotes: Quote[],
  estimate: { priceLow: number; priceHigh: number } | null | undefined,
): Quote[] {
  if (!estimate || quotes.length === 0) return quotes;
  const { priceLow: low, priceHigh: high } = estimate;
  const prices = quotes.map((q) => q.price);
  const omin = Math.min(...prices);
  const span = Math.max(...prices) - omin;
  const map = (p: number) =>
    span === 0 ? Math.round((low + high) / 2) : Math.round(low + ((p - omin) / span) * (high - low));
  return quotes.map((q) => ({
    ...q,
    price: map(q.price),
    priceHigh: q.priceHigh != null ? map(q.priceHigh) : undefined,
  }));
}

/** Itemized cost breakdown for a dealer quote (expandable detail). */
export interface QuoteBreakdown {
  labor: number;
  parts: number;
  paints: number;
  shopSupplies: number; // 5% of subtotal
  tax: number; // 6%
  discount: number;
  subtotal: number;
  total: number;
}

/** Derive a plausible itemized breakdown that sums to the quoted price. */
export function quoteBreakdown(price: number, discount = 0): QuoteBreakdown {
  const gross = price + discount; // pre-discount target
  const subtotal = Math.round(gross / 1.113); // back out 5% supplies + 6% tax
  const labor = Math.round(subtotal * 0.55);
  const parts = Math.round(subtotal * 0.3);
  const paints = subtotal - labor - parts; // remainder (~15%)
  const shopSupplies = Math.round(subtotal * 0.05);
  const tax = Math.round((subtotal + shopSupplies) * 0.06);
  return {
    labor,
    parts,
    paints,
    shopSupplies,
    tax,
    discount,
    subtotal,
    total: subtotal + shopSupplies + tax - discount,
  };
}

/** Vehicle-size buckets used to price brake jobs (auto-picked from the car). */
export type VehicleType = 'Small Car' | 'Sedan' | 'SUV' | 'Truck' | 'Performance';

export interface MaintSubService {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  /** Brakes only: which vehicle-size bucket this row prices. */
  vehicleType?: VehicleType;
}

export interface MaintCategory {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  /** When true the row matching the car's vehicle type is auto-selected. */
  byVehicleType?: boolean;
  services: MaintSubService[];
}

/** The 5 maintenance services, each with its detailed sub-options. */
export const MAINT_CATEGORIES: MaintCategory[] = [
  {
    id: 'oil',
    name: 'Oil change',
    icon: '🛢️',
    blurb: 'Pick your oil type',
    services: [
      { id: 'oil-conv', name: 'Conventional', price: 39, durationMin: 40 },
      { id: 'oil-blend', name: 'Synthetic blend', price: 49, durationMin: 45 },
      { id: 'oil-full', name: 'Full synthetic', price: 69, durationMin: 45 },
      { id: 'oil-hm', name: 'High-mileage', price: 59, durationMin: 45 },
    ],
  },
  {
    id: 'tires',
    name: 'Tire service',
    icon: '🛞',
    blurb: 'Rotation, alignment & repair',
    services: [
      { id: 'tire-rot', name: 'Tire Rotation', price: 29, durationMin: 30 },
      { id: 'tire-rotbal', name: 'Tire Rotation + Balance', price: 59, durationMin: 45 },
      { id: 'tire-al2', name: 'Wheel Alignment (2-wheel)', price: 89, durationMin: 45 },
      { id: 'tire-al4', name: 'Wheel Alignment (4-wheel)', price: 129, durationMin: 60 },
      { id: 'tire-mount', name: 'Tire Mounting (per tire)', price: 25, durationMin: 20 },
      { id: 'tire-tpms', name: 'TPMS Sensor Service', price: 65, durationMin: 30 },
      { id: 'tire-flat', name: 'Flat Repair', price: 35, durationMin: 30 },
    ],
  },
  {
    id: 'filters',
    name: 'Filters',
    icon: '🌬️',
    blurb: 'Air, cabin, fuel & PCV',
    services: [
      { id: 'flt-cabin', name: 'Cabin Air Filter', price: 45, durationMin: 20 },
      { id: 'flt-engine', name: 'Engine Air Filter', price: 40, durationMin: 20 },
      { id: 'flt-fuel', name: 'Fuel Filter', price: 80, durationMin: 40 },
      { id: 'flt-pcv', name: 'PCV Valve', price: 55, durationMin: 30 },
    ],
  },
  {
    id: 'fluids',
    name: 'Fluids',
    icon: '💧',
    blurb: 'Flushes & top-ups',
    services: [
      { id: 'fl-trans', name: 'Transmission Fluid Flush (Auto)', price: 159, durationMin: 60 },
      { id: 'fl-coolant', name: 'Coolant Flush', price: 119, durationMin: 60 },
      { id: 'fl-brake', name: 'Brake Fluid Flush', price: 99, durationMin: 45 },
      { id: 'fl-ps', name: 'Power Steering Flush', price: 109, durationMin: 45 },
      { id: 'fl-diff', name: 'Differential Fluid (AWD/4WD)', price: 129, durationMin: 50 },
    ],
  },
  {
    id: 'brakes',
    name: 'Brakes',
    icon: '🛑',
    blurb: 'Pads & rotors — priced by vehicle',
    byVehicleType: true,
    services: [
      { id: 'brk-small', name: 'Small Car', price: 199, durationMin: 90, vehicleType: 'Small Car' },
      { id: 'brk-sedan', name: 'Sedan', price: 229, durationMin: 90, vehicleType: 'Sedan' },
      { id: 'brk-suv', name: 'SUV', price: 279, durationMin: 105, vehicleType: 'SUV' },
      { id: 'brk-truck', name: 'Truck', price: 319, durationMin: 120, vehicleType: 'Truck' },
      { id: 'brk-perf', name: 'Performance', price: 389, durationMin: 120, vehicleType: 'Performance' },
    ],
  },
];

export const MAINT_TIME_SLOTS = ['8:00 AM', '10:00 AM', '1:00 PM', '3:30 PM'];

// ── Compare domain ─────────────────────────────────────────────────────

export interface AcceptedQuote {
  id: string;
  dealerId: string;
  priceLow: number;
  priceHigh: number;
  parts: 'OEM' | 'Aftermarket';
  acceptedOn: string;
}

/** Accepted quotes available for cash-vs-insurance comparison (s-comp-select). */
export const ACCEPTED_QUOTES: AcceptedQuote[] = [
  {
    id: 'aq-honda',
    dealerId: 'honda-fairfax',
    priceLow: 320,
    priceHigh: 345,
    parts: 'OEM',
    acceptedOn: 'Apr 10',
  },
  {
    id: 'aq-autofix',
    dealerId: 'autofix-pro',
    priceLow: 280,
    priceHigh: 310,
    parts: 'Aftermarket',
    acceptedOn: 'Apr 10',
  },
  {
    id: 'aq-city',
    dealerId: 'city-body',
    priceLow: 350,
    priceHigh: 375,
    parts: 'OEM',
    acceptedOn: 'Apr 10',
  },
];

/** Linked insurance policy (s-comp-cash-ins banner / s-prof-insurance). */
export const INSURANCE_POLICY = {
  carrier: 'State Farm',
  coverage: 'Comprehensive + Collision',
  // The wireframe shows SF-7821-VA on the compare screens and SF-8847234 on
  // s-prof-insurance's "Policy number" row — both kept verbatim.
  policyNumber: 'SF-7821-VA',
  accountNumber: 'SF-8847234',
  deductible: 500,
  premiumPerYear: 1200,
  covers: '2019 Honda Accord',
  renewal: 'Dec 15, 2025',
  claimsPhone: '1-800-STATE-FARM',
  claimsPhoneDigits: '(1-800-782-8332)',
  claimReference: 'REF-AM-9821-VA',
};

// The s-comp-deep-dive table is no longer static data: it is computed by the
// actuarial model (src/services/actuarial/predict.ts via compareService) and
// reproduces the wireframe rows exactly for the seeded inputs.

// ── Community domain ───────────────────────────────────────────────────

export interface Channel {
  id: string;
  name: string;
  initial: string;
  color: string;
  members: number;
  newPosts?: number;
  joined: boolean;
}

export const CHANNELS: Channel[] = [
  {
    id: 'honda',
    name: 'Honda Owners',
    initial: 'H',
    color: '#7F77DD',
    members: 1240,
    newPosts: 12,
    joined: true,
  },
  { id: 'toyota', name: 'Toyota Owners', initial: 'T', color: '#1A1A1A', members: 890, joined: false },
  { id: 'gm', name: 'GM Owners', initial: 'G', color: '#D0021B', members: 530, joined: false },
];

export type PostCategory = 'Tip' | 'Review' | 'Question' | 'Warning' | 'Quotes' | 'DIY';

export interface CommunityPost {
  id: string;
  author: string;
  initial: string;
  color: string;
  car: string;
  ago: string;
  category: PostCategory;
  body: string;
  replies: number;
  likes: number;
  hasPhoto?: boolean;
  /** Whether the current user has liked this post (Supabase-backed feeds). */
  likedByMe?: boolean;
}

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-james',
    author: 'James K.',
    initial: 'J',
    color: '#7F77DD',
    car: '2019 Accord EX-L',
    ago: '2h ago',
    category: 'Tip',
    body:
      'Used AutoMate for a rear bumper dent — submitted photos at midnight and woke up to 6 quotes from local shops. Honda Fairfax was $285, lowest by $60. Booked same day 👌',
    replies: 14,
    likes: 28,
    hasPhoto: true,
  },
  {
    id: 'post-sarah',
    author: 'Sarah M.',
    initial: 'S',
    color: '#1D9E75',
    car: '2021 Civic Sport',
    ago: '5h ago',
    category: 'Review',
    body:
      'The Pro DIY guide for nail polish paint chip fix actually worked on my hood scratch. Saved $400 in labor. Paint match was perfect ✨',
    replies: 7,
    likes: 41,
  },
  {
    id: 'post-mike',
    author: 'Mike R.',
    initial: 'M',
    color: '#378ADD',
    car: '2020 Pilot',
    ago: '8h ago',
    category: 'Question',
    body:
      "Insurance filed a claim for my door ding and my premium went up $180/yr. AutoMate's compare tool literally showed me it would cost more to insure than pay cash 🤦. Always check first!",
    replies: 22,
    likes: 67,
  },
  {
    id: 'post-alex',
    author: 'Alex T.',
    initial: 'A',
    color: '#E24B4A',
    car: '2022 CR-V',
    ago: '12h ago',
    category: 'Warning',
    body:
      'Heads up Fairfax Honda owners — some shops are quoting 2-3x market rate for bumper repairs right now. AutoMate showed me the range so I knew what was fair 👍',
    replies: 11,
    likes: 54,
  },
];

export interface PostComment {
  id: string;
  author: string;
  initial: string;
  color: string;
  car: string;
  likes: number;
  body: string;
  /** Whether the current user has liked this comment (Supabase-backed). */
  likedByMe?: boolean;
}

/** Comments on the James K. post (s-comm-post). */
export const POST_COMMENTS: PostComment[] = [
  {
    id: 'c-sarah',
    author: 'Sarah M.',
    initial: 'S',
    color: '#1D9E75',
    car: '2021 Civic',
    likes: 5,
    body:
      'That was amazing! I tried the same at 11 PM and got 5 quotes by 8:45 AM. After-hours timeline is so reassuring.',
  },
  {
    id: 'c-mike',
    author: 'Mike R.',
    initial: 'M',
    color: '#378ADD',
    car: '2020 Pilot',
    likes: 12,
    body: 'The DIY tip section on the submission screen helped me fix a dent while waiting. Saved $200!',
  },
  {
    id: 'c-anna',
    author: 'Anna T.',
    initial: 'A',
    color: '#EF9F27',
    car: '2018 CR-V',
    likes: 3,
    body: 'Which shop gave the best quote? I am in Fairfax too and had similar damage last month.',
  },
  {
    id: 'c-kevin',
    author: 'Kevin L.',
    initial: 'K',
    color: '#7F77DD',
    car: '2022 Accord',
    likes: 8,
    body: 'The plunger method actually worked on mine haha. Thanks for the tip AutoMate!',
  },
];

export const POST_CATEGORIES: PostCategory[] = ['Question', 'Tip', 'Quotes', 'DIY', 'Review'];

// ── Profile domain ─────────────────────────────────────────────────────

export const USER = {
  name: 'John Doe',
  username: '@johndoe',
  email: 'johndoe@email.com',
  phone: '+1 (703) 555-0198',
  initial: 'J',
  completionPct: 85,
  googleEmail: 'johndoe@gmail.com',
};

export interface Milestone {
  id: string;
  icon: string;
  title: string;
  sub: string;
  costPts: number;
}

export const MILESTONES: Milestone[] = [
  { id: 'mile-oil', icon: '🛢️', title: 'Free oil change', sub: 'Standard synthetic oil & filter', costPts: 6000 },
  { id: 'mile-tires', icon: '🚗', title: 'Free tire rotation', sub: 'All 4 tires rotated & balanced', costPts: 10000 },
];

// Point values come from the central earn schedule (src/config/points.ts).
export const EARN_ACTIONS = [
  { icon: '📅', title: 'Daily check-in', sub: 'Log in every day', pts: EARN_RULES.dailyCheckIn },
  { icon: '📷', title: 'Scan service receipt', sub: 'Add to service history', pts: EARN_RULES.scanReceipt },
  { icon: '✒️', title: 'Manual service log', sub: 'Enter service details', pts: EARN_RULES.manualLog },
  { icon: '🛢️', title: 'Book service via app', sub: 'Schedule at a dealer', pts: EARN_RULES.bookService },
  { icon: '📸', title: 'Submit damage photos', sub: 'Get dealer quotes', pts: EARN_RULES.submitPhotos },
  { icon: '🛡️', title: 'Add insurance policy', sub: 'Link your coverage', pts: EARN_RULES.addInsurance },
  { icon: '👥', title: 'Refer a friend', sub: 'They join AutoMate', pts: EARN_RULES.referFriend },
];

export const PAYMENT_CARD = {
  brand: 'VISA',
  last4: '4242',
  holder: 'John Doe',
  expires: '08/27',
};

export const LANGUAGES = [
  { flag: '🇺🇸', name: 'English', selected: true },
  { flag: '🇰🇷', name: '한국어', selected: false },
  { flag: '🇪🇸', name: 'Español', selected: false },
  { flag: '🇨🇳', name: '中文', selected: false },
];

/** Help-center topics → their article routes (s-prof-help-center → s-help-*). */
export const HELP_TOPICS = [
  { icon: '📷', title: 'How to submit damage photos', route: 'HelpPhotos' },
  { icon: '💰', title: 'Understanding quotes & pricing', route: 'HelpQuotes' },
  { icon: '📅', title: 'Managing bookings', route: 'HelpBookings' },
  { icon: '📞', title: 'Contact support', route: 'HelpContact' },
] as const;

export const TERMS_SECTIONS = [
  {
    heading: '1. Acceptance of terms',
    body: 'By using AutoMate, you agree to these Terms of Service. AutoMate connects vehicle owners with licensed repair shops in the Northern Virginia area.',
  },
  {
    heading: '2. Services',
    body: 'AutoMate provides a marketplace platform. We are not responsible for the quality of repairs performed by third-party shops.',
  },
  {
    heading: '3. Payments',
    body: 'Payments are processed securely. AutoMate charges a platform fee of 5% on completed transactions.',
  },
];

export const PRIVACY_SECTIONS = [
  {
    heading: 'Data we collect',
    body: 'We collect vehicle information, damage photos, location data, and service history to provide repair quotes and recommendations.',
  },
  {
    heading: 'How we use your data',
    body: 'Your data is shared with licensed repair shops only for the purpose of generating quotes. We never sell personal data to third parties.',
  },
  {
    heading: 'Your rights',
    body: 'You may request deletion of your data at any time through Settings → Account → Delete account.',
  },
];

/** Partner dealers offering milestone redemption (s-prof-mile-det). */
export const MILESTONE_PARTNERS = [
  { dealerId: 'honda-fairfax', tag: 'OEM' },
  { dealerId: 'autofix-pro', tag: 'Same-day' },
];

export const acceptedQuoteById = (id: string | null | undefined): AcceptedQuote =>
  ACCEPTED_QUOTES.find((q) => q.id === id) ?? ACCEPTED_QUOTES[0];

/**
 * Remap the accepted quotes' price ranges into the current AI estimate range, so
 * the Compare (cash vs insurance) flow reflects the estimated repair cost.
 * Preserves each quote's relative position. No-op without an estimate.
 */
export function acceptedQuotesInEstimateRange(
  estimate: { priceLow: number; priceHigh: number } | null | undefined,
): AcceptedQuote[] {
  if (!estimate) return ACCEPTED_QUOTES;
  const omin = Math.min(...ACCEPTED_QUOTES.map((q) => q.priceLow));
  const span = Math.max(...ACCEPTED_QUOTES.map((q) => q.priceHigh)) - omin || 1;
  const { priceLow: low, priceHigh: high } = estimate;
  const map = (p: number) => Math.round(low + ((p - omin) / span) * (high - low));
  return ACCEPTED_QUOTES.map((q) => {
    const pl = map(q.priceLow);
    return { ...q, priceLow: pl, priceHigh: Math.max(map(q.priceHigh), pl + 1) };
  });
}

/** Time slots offered on the compare-tab cash booking (s-comp-cash-book). */
export const COMP_TIME_SLOTS = ['9:00 AM', '10:30 AM', '2:00 PM'];

/**
 * The confirmed appointment behind the "Upcoming: Honda Fairfax — Mon Apr 7"
 * notification (s-notifications → s-maint-schedule-confirm deep link).
 */
export const BOOKED_APPOINTMENT = {
  dealerId: 'honda-fairfax',
  services: [{ id: 'svc-oil', name: 'Oil change', price: 49, durationMin: 45 }],
  date: '2027-04-07',
  time: '8:00 AM',
};
