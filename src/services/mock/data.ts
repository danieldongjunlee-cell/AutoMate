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

/** 3-year cost table rows (s-comp-deep-dive). */
export const DEEP_DIVE_ROWS = [
  { item: 'Repair cost', sub: '', cash: '$320', insure: '$0', risk: false },
  { item: 'Deductible', sub: '', cash: '—', insure: '$500', risk: false },
  { item: 'Premium hike', sub: 'Yr 1–3 (~15%/yr)', cash: '—', insure: '+$540', risk: true },
  { item: 'Claim on record', sub: '', cash: '—', insure: '3 yrs', risk: false },
];

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
  { id: 'mile-oil', icon: '🛢️', title: 'Free oil change', sub: 'Standard synthetic', costPts: 6000 },
  { id: 'mile-tires', icon: '🚗', title: 'Free tire rotation', sub: 'All 4 tires', costPts: 10000 },
  { id: 'mile-insp', icon: '📷', title: 'Free inspection', sub: 'Full 21-point', costPts: 25000 },
];

export const EARN_ACTIONS = [
  { icon: '📅', title: 'Daily check-in', sub: 'Log in every day', pts: 10 },
  { icon: '📷', title: 'Scan service receipt', sub: 'Add to service history', pts: 20 },
  { icon: '✒️', title: 'Manual service log', sub: 'Enter service details', pts: 10 },
  { icon: '🛢️', title: 'Book service via app', sub: 'Schedule at a dealer', pts: 50 },
  { icon: '📸', title: 'Submit damage photos', sub: 'Get dealer quotes', pts: 20 },
  { icon: '💬', title: 'Post in community', sub: 'Share tips and reviews', pts: 50 },
  { icon: '🛡️', title: 'Add insurance policy', sub: 'Link your coverage', pts: 100 },
  { icon: '👥', title: 'Refer a friend', sub: 'They join AutoMate', pts: 100 },
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

export const HELP_TOPICS = [
  { icon: '📷', title: 'How to submit damage photos' },
  { icon: '💰', title: 'Understanding quotes & pricing' },
  { icon: '📅', title: 'Managing bookings' },
  { icon: '📞', title: 'Contact support' },
];

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
