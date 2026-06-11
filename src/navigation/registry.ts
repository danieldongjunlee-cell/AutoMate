import { MainTabParamList } from './types';

/**
 * Wireframe navigation graph (docs/wireframe-analysis.md §2).
 * Drives the placeholder screens in build step 1 so every route and edge is
 * tappable before real screens land; each feature step replaces entries'
 * screens but this stays the reference for SCREENS.md.
 */
export interface NavEdge {
  label: string;
  to: string;
  /** Set for cross-tab jumps (⤴ in the analysis doc). */
  tab?: keyof MainTabParamList;
  /** 'back' pops, 'signIn'/'signOut' flip the auth gate. */
  action?: 'back' | 'signIn' | 'signOut';
}

export interface ScreenMeta {
  /** Wireframe element id, e.g. "s-home". */
  wireframeId: string;
  title: string;
  edges: NavEdge[];
}

export const SCREEN_REGISTRY: Record<string, ScreenMeta> = {
  // ── Auth ──
  Splash: {
    wireframeId: 's-splash',
    title: 'Splash',
    edges: [
      { label: 'Get started →', to: 'SignUp' },
      { label: 'I already have an account', to: 'LogIn' },
    ],
  },
  SignUp: {
    wireframeId: 's-signup',
    title: 'Create account',
    edges: [{ label: 'Create account', to: 'VerifyOtp' }],
  },
  LogIn: {
    wireframeId: 's-login',
    title: 'Welcome back',
    edges: [{ label: 'Sign in', to: 'VerifyOtp' }],
  },
  VerifyOtp: {
    wireframeId: 's-verify-otp',
    title: 'Verify phone',
    edges: [{ label: 'Verify →', to: '', action: 'signIn' }],
  },

  // ── Home tab ──
  Home: {
    wireframeId: 's-home',
    title: 'Home',
    edges: [
      { label: '🔔 Notifications', to: 'Notifications' },
      { label: '🔥 Day 5 streak → Earn', to: 'ProfEarn', tab: 'ProfileTab' },
      { label: '📷 Get a Repair Estimate', to: 'CarDiagram' },
      { label: 'Claim deal → Bundle deals', to: 'BundleDeals' },
      { label: 'Pending quotes → Rear bumper dent', to: 'DealerQuotes' },
    ],
  },
  CarDiagram: {
    wireframeId: 's-car-diagram',
    title: 'Select damaged part',
    edges: [{ label: 'N parts → AI Estimate', to: 'PhotoExample' }],
  },
  PhotoExample: {
    wireframeId: 's-photo-example',
    title: 'Photo guide',
    edges: [
      { label: '← Change part', to: '', action: 'back' },
      { label: 'Take photos →', to: 'Camera' },
    ],
  },
  Camera: {
    wireframeId: 's-camera',
    title: 'Take photos',
    edges: [{ label: 'Submit photos →', to: 'ConfirmSubmit' }],
  },
  ConfirmSubmit: {
    wireframeId: 's-confirm-submit',
    title: 'Confirm damage',
    edges: [
      { label: 'Edit ✎ parts', to: 'CarDiagram' },
      { label: '+ Photos', to: 'Camera' },
      { label: 'Submit for quotes →', to: 'Submitted' },
      { label: '(after hours) Submit for quotes →', to: 'AfterHours' },
    ],
  },
  Submitted: {
    wireframeId: 's-submitted',
    title: 'Request submitted',
    edges: [{ label: 'Notify me → quotes', to: 'DealerQuotes' }],
  },
  AfterHours: {
    wireframeId: 's-after-hours',
    title: 'Request submitted (after hours)',
    edges: [
      { label: 'View available quotes →', to: 'DealerQuotes' },
      { label: '🏠 Back to home', to: 'Home' },
    ],
  },
  DealerQuotes: {
    wireframeId: 's-dealer-quotes',
    title: 'Quotes received',
    edges: [
      { label: 'Accept quote (Honda Fairfax)', to: 'AcceptBooking' },
      { label: 'See all 8 quotes on map', to: 'AllQuotesMap' },
    ],
  },
  AllQuotesMap: {
    wireframeId: 's-all-quotes-map',
    title: 'All quotes near you',
    edges: [
      { label: 'Quote row → Accept & book', to: 'AcceptBooking' },
      { label: 'Map filters view', to: 'MapFilter' },
      { label: '← Back to quotes list', to: '', action: 'back' },
    ],
  },
  MapFilter: {
    wireframeId: 's-map',
    title: 'All quotes near you (filters)',
    edges: [{ label: 'Accept quote', to: 'AcceptBooking' }],
  },
  AcceptBooking: {
    wireframeId: 's-accept-booking',
    title: 'Book appointment',
    edges: [{ label: 'Confirm booking — Apr 12 at 10:30 AM', to: 'BookingConfirm' }],
  },
  BookingConfirm: {
    wireframeId: 's-booking-confirm',
    title: 'Booking confirmed',
    edges: [{ label: 'View on map (→ home)', to: 'Home' }],
  },
  BundleDeals: {
    wireframeId: 's-home-bundle-deals',
    title: 'Bundle deals',
    edges: [{ label: 'Claim this bundle →', to: 'MaintScheduleBook', tab: 'MaintTab' }],
  },
  Notifications: {
    wireframeId: 's-notifications',
    title: 'Notifications',
    edges: [
      { label: '💰 Quote accepted → book', to: 'AcceptBooking' },
      { label: '🔧 Oil change due → schedule', to: 'MaintSchedule', tab: 'MaintTab' },
      { label: '🏆 Gold tier → earn', to: 'ProfEarn', tab: 'ProfileTab' },
      { label: '📊 8 shops responded → quotes', to: 'DealerQuotes' },
      { label: '📅 Upcoming → booking', to: 'MaintScheduleConfirm', tab: 'MaintTab' },
    ],
  },

  // ── Maintenance tab ──
  MaintDashboard: {
    wireframeId: 's-maint-dashboard',
    title: 'Maintenance',
    edges: [
      { label: 'Car card › Service history', to: 'MaintHistory' },
      { label: '🔧 DIY Repair Tips', to: 'MaintDiy' },
      { label: '📅 Book a service', to: 'MaintSchedule' },
    ],
  },
  MaintHistory: {
    wireframeId: 's-maint-history',
    title: 'Service history',
    edges: [
      { label: '📷 Scan receipt (+20 pts)', to: 'MaintScanCam' },
      { label: '✏️ Manual input (+10 pts)', to: 'MaintManual' },
    ],
  },
  MaintScanCam: {
    wireframeId: 's-maint-scan-cam',
    title: 'Scan receipt',
    edges: [
      { label: '← Retake', to: '', action: 'back' },
      { label: 'Review scan →', to: 'MaintScanRev' },
    ],
  },
  MaintScanRev: {
    wireframeId: 's-maint-scan-rev',
    title: 'Review receipt',
    edges: [{ label: 'Save to history →', to: 'MaintHistory' }],
  },
  MaintManual: {
    wireframeId: 's-maint-manual',
    title: 'Log service manually',
    edges: [{ label: 'Save service record →', to: 'MaintHistory' }],
  },
  MaintDiy: {
    wireframeId: 's-maint-diy',
    title: 'DIY Repair Tips',
    edges: [],
  },
  MaintSchedule: {
    wireframeId: 's-maint-schedule',
    title: 'Select service type',
    edges: [{ label: 'Honda Fairfax → Select services', to: 'MaintScheduleBook' }],
  },
  MaintScheduleBook: {
    wireframeId: 's-maint-schedule-book',
    title: 'Honda Fairfax — select services',
    edges: [{ label: 'Continue to payment →', to: 'MaintPayment' }],
  },
  MaintPayment: {
    wireframeId: 's-maint-payment',
    title: 'Payment',
    edges: [{ label: 'Confirm & pay $49 →', to: 'MaintScheduleConfirm' }],
  },
  MaintScheduleConfirm: {
    wireframeId: 's-maint-schedule-confirm',
    title: 'Booking confirmed',
    edges: [{ label: 'Done', to: 'MaintDashboard' }],
  },

  // ── Compare tab ──
  CompSelect: {
    wireframeId: 's-comp-select',
    title: 'Compare options',
    edges: [{ label: 'Honda Fairfax $320–$345', to: 'CompCashIns' }],
  },
  CompCashIns: {
    wireframeId: 's-comp-cash-ins',
    title: 'Cash vs insurance',
    edges: [
      { label: '💰 Pay cash $320 ✔', to: 'CompCashBook' },
      { label: '🛡️ File insurance $0 ⚠', to: 'CompInsurance' },
      { label: '📊 See full cost breakdown', to: 'CompDeepDive' },
    ],
  },
  CompDeepDive: {
    wireframeId: 's-comp-deep-dive',
    title: 'Cost deep dive',
    edges: [{ label: 'Book Honda Fairfax · Pay cash →', to: 'CompCashBook' }],
  },
  CompCashBook: {
    wireframeId: 's-comp-cash-book',
    title: 'Book · Cash payment',
    edges: [{ label: 'Confirm booking — Apr 7 at 10:30 AM', to: 'BookingConfirm', tab: 'HomeTab' }],
  },
  CompInsurance: {
    wireframeId: 's-comp-insurance',
    title: 'File a claim',
    edges: [{ label: 'Dismiss', to: '', action: 'back' }],
  },

  // ── Community tab ──
  CommChannels: {
    wireframeId: 's-comm-channels',
    title: 'Community',
    edges: [{ label: 'Honda Owners (1,240 members)', to: 'CommHonda' }],
  },
  CommHonda: {
    wireframeId: 's-comm-honda',
    title: 'Honda Owners',
    edges: [
      { label: '+ Post (+50 pts)', to: 'CommCreate' },
      { label: 'Post → detail', to: 'CommPost' },
    ],
  },
  CommPost: {
    wireframeId: 's-comm-post',
    title: 'Post detail',
    edges: [],
  },
  CommCreate: {
    wireframeId: 's-comm-create',
    title: 'New post',
    edges: [],
  },

  // ── Profile tab ──
  ProfHub: {
    wireframeId: 's-prof-hub',
    title: 'Profile',
    edges: [
      { label: '🏆 Explore reward milestones →', to: 'ProfMiles' },
      { label: '🚗 My cars', to: 'ProfCars' },
      { label: '🛡️ Insurance policy', to: 'ProfInsurance' },
      { label: '💳 Payment method', to: 'ProfPayment' },
      { label: '⚙️ Settings', to: 'ProfSettings' },
    ],
  },
  ProfMiles: {
    wireframeId: 's-prof-miles',
    title: 'Reward milestones',
    edges: [{ label: '🛢️ Free oil change · 6,000 pts', to: 'ProfMileDet' }],
  },
  ProfMileDet: {
    wireframeId: 's-prof-mile-det',
    title: 'Free Oil Change',
    edges: [],
  },
  ProfEarn: {
    wireframeId: 's-prof-earn',
    title: 'How you earn',
    edges: [],
  },
  ProfCars: {
    wireframeId: 's-prof-cars',
    title: 'My cars',
    edges: [],
  },
  ProfInsurance: {
    wireframeId: 's-prof-insurance',
    title: 'Insurance policy',
    edges: [{ label: '⚖ Compare cash vs. insurance →', to: 'CompSelect', tab: 'CompareTab' }],
  },
  ProfPayment: {
    wireframeId: 's-prof-payment',
    title: 'Payment method',
    edges: [],
  },
  ProfSettings: {
    wireframeId: 's-prof-settings',
    title: 'Settings',
    edges: [
      { label: '👤 Edit profile', to: 'ProfEditProfile' },
      { label: '✉️ Change email', to: 'ProfChangeEmail' },
      { label: '📱 Change phone number', to: 'ProfChangePhone' },
      { label: '🔑 Change password', to: 'ProfChangePassword' },
      { label: '🔗 Linked accounts', to: 'ProfLinkedAccounts' },
      { label: '🌐 Language', to: 'ProfLanguage' },
      { label: '📏 Distance units', to: 'ProfDistance' },
      { label: '❓ Help center', to: 'ProfHelpCenter' },
      { label: '📄 Terms of service', to: 'ProfTerms' },
      { label: '🔒 Privacy policy', to: 'ProfPrivacy' },
      { label: 'Sign out', to: '', action: 'signOut' },
    ],
  },
  ProfEditProfile: { wireframeId: 's-prof-edit-profile', title: 'Edit profile', edges: [] },
  ProfChangeEmail: { wireframeId: 's-prof-change-email', title: 'Change email', edges: [] },
  ProfChangePassword: { wireframeId: 's-prof-change-password', title: 'Change password', edges: [] },
  ProfChangePhone: { wireframeId: 's-prof-change-phone', title: 'Change phone number', edges: [] },
  ProfLinkedAccounts: { wireframeId: 's-prof-linked-accounts', title: 'Linked accounts', edges: [] },
  ProfHelpCenter: { wireframeId: 's-prof-help-center', title: 'Help center', edges: [] },
  ProfTerms: { wireframeId: 's-prof-terms', title: 'Terms of service', edges: [] },
  ProfPrivacy: { wireframeId: 's-prof-privacy', title: 'Privacy policy', edges: [] },
  ProfLanguage: { wireframeId: 's-prof-language', title: 'Language', edges: [] },
  ProfDistance: { wireframeId: 's-prof-distance', title: 'Distance units', edges: [] },
};
