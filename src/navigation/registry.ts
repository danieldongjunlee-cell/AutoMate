/**
 * Native-stack header titles per route, keyed by wireframe screen id in the
 * trailing comment. The full navigation graph (edges, back-stack parents,
 * cross-tab jumps) is documented in docs/wireframe-analysis.md §2 and
 * implemented directly by the screens — no runtime copy to drift.
 */
export const SCREEN_TITLES: Record<string, string> = {
  Splash: 'Splash', // s-splash
  SignUp: 'Create account', // s-signup
  LogIn: 'Welcome back', // s-login
  VerifyOtp: 'Verify phone', // s-verify-otp
  Home: 'Home', // s-home
  CarDiagram: 'Select damaged part', // s-car-diagram
  PhotoExample: 'Photo guide', // s-photo-example
  Camera: 'Take photos', // s-camera
  ConfirmSubmit: 'Confirm damage', // s-confirm-submit
  Submitted: 'Request submitted', // s-submitted
  AfterHours: 'Request submitted (after hours)', // s-after-hours
  DealerQuotes: 'Quotes received', // s-dealer-quotes
  AllQuotesMap: 'All quotes near you', // s-all-quotes-map
  MapFilter: 'All quotes near you (filters)', // s-map
  AcceptBooking: 'Book appointment', // s-accept-booking
  BookingConfirm: 'Booking confirmed', // s-booking-confirm
  BundleDeals: 'Bundle deals', // s-home-bundle-deals
  Notifications: 'Notifications', // s-notifications
  MaintDashboard: 'Maintenance', // s-maint-dashboard
  MaintHistory: 'Service history', // s-maint-history
  MaintScanCam: 'Scan receipt', // s-maint-scan-cam
  MaintScanRev: 'Review receipt', // s-maint-scan-rev
  MaintManual: 'Log service manually', // s-maint-manual
  MaintDiy: 'DIY Repair Tips', // s-maint-diy
  MaintSchedule: 'Select service type', // s-maint-schedule
  MaintScheduleBook: 'Honda Fairfax — select services', // s-maint-schedule-book
  MaintPayment: 'Payment', // s-maint-payment
  MaintScheduleConfirm: 'Booking confirmed', // s-maint-schedule-confirm
  CompSelect: 'Compare options', // s-comp-select
  CompCashIns: 'Cash vs insurance', // s-comp-cash-ins
  CompDeepDive: 'Cost deep dive', // s-comp-deep-dive
  CompCashBook: 'Book · Cash payment', // s-comp-cash-book
  CompInsurance: 'File a claim', // s-comp-insurance
  CommChannels: 'Community', // s-comm-channels
  CommHonda: 'Honda Owners', // s-comm-honda
  CommPost: 'Post detail', // s-comm-post
  CommCreate: 'New post', // s-comm-create
  ProfHub: 'Profile', // s-prof-hub
  ProfMiles: 'Reward milestones', // s-prof-miles
  ProfMileDet: 'Free Oil Change', // s-prof-mile-det
  ProfEarn: 'How you earn', // s-prof-earn
  ProfCars: 'My cars', // s-prof-cars
  ProfInsurance: 'Insurance policy', // s-prof-insurance
  ProfPayment: 'Payment method', // s-prof-payment
  ProfSettings: 'Settings', // s-prof-settings
  ProfEditProfile: 'Edit profile', // s-prof-edit-profile
  ProfChangeEmail: 'Change email', // s-prof-change-email
  ProfChangePassword: 'Change password', // s-prof-change-password
  ProfChangePhone: 'Change phone number', // s-prof-change-phone
  ProfLinkedAccounts: 'Linked accounts', // s-prof-linked-accounts
  ProfHelpCenter: 'Help center', // s-prof-help-center
  ProfTerms: 'Terms of service', // s-prof-terms
  ProfPrivacy: 'Privacy policy', // s-prof-privacy
  ProfLanguage: 'Language', // s-prof-language
  ProfDistance: 'Distance units', // s-prof-distance
};
