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
