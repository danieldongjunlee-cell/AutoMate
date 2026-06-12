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
  VerifyMethod: 'Verify your account', // ➕ app-only (user-feedback pass 1)
  VerifyOtp: 'Verify your account', // s-verify-otp (was "Verify phone"; code can go to email too)
  Home: 'Home', // s-home
  CarDiagram: 'Select damaged part', // s-car-diagram
  PhotoExample: 'Photo guide', // s-photo-example
  Camera: 'Take photos', // s-camera
  ConfirmSubmit: 'Confirm damage', // s-confirm-submit
  Submitted: 'Request submitted', // s-submitted
  AfterHours: 'Request submitted (after hours)', // s-after-hours
  DealerQuotes: 'Quotes received', // s-dealer-quotes
  AllQuotesMap: 'All quotes near you', // s-all-quotes-map
  AcceptBooking: 'Book appointment', // s-accept-booking
  BookingConfirm: 'Booking confirmed', // s-booking-confirm
  DealerMap: 'Honda Fairfax', // s-dealer-map
  BundleDeals: 'Bundle deals', // s-home-bundle-deals
  Notifications: 'Notifications', // s-notifications
  MaintDashboard: 'Maintenance', // s-maint-dashboard
  MaintHistory: 'Service history', // s-maint-history
  MaintScanCam: 'Scan receipt', // s-maint-scan-cam
  MaintScanRev: 'Review receipt', // s-maint-scan-rev
  MaintManual: 'Log service manually', // s-maint-manual
  MaintDiy: 'DIY Repair Tips', // s-maint-diy
  DiyUnlock: 'Unlock Pro', // s-diy-unlock
  DiyPayment: 'Payment', // s-diy-payment
  DiyConfirm: 'Welcome to Pro', // s-diy-confirm
  DiyGuides: 'All 12 guides', // s-diy-guides
  DiyMatch: 'AI guide matching', // s-diy-match
  DiyTools: 'Shopping lists', // s-diy-tools
  DiyFuture: 'Coming soon', // s-diy-future
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
  ProfInsEdit: 'Edit policy details', // s-prof-ins-edit
  ProfInsAdd: 'Add new policy', // s-prof-ins-add
  ProfPayment: 'Payment method', // s-prof-payment
  ProfSettings: 'Settings', // s-prof-settings
  ProfEditProfile: 'Edit profile', // s-prof-edit-profile
  ProfChangeEmail: 'Change email', // s-prof-change-email
  ProfChangePassword: 'Change password', // s-prof-change-password
  ProfChangePhone: 'Change phone number', // s-prof-change-phone
  ProfLinkedAccounts: 'Linked accounts', // s-prof-linked-accounts
  ProfHelpCenter: 'Help center', // s-prof-help-center
  HelpPhotos: 'How to submit damage photos', // s-help-photos
  HelpQuotes: 'Understanding quotes & pricing', // s-help-quotes
  HelpBookings: 'Managing bookings', // s-help-bookings
  HelpContact: 'Contact support', // s-help-contact
  ProfTerms: 'Terms of service', // s-prof-terms
  ProfPrivacy: 'Privacy policy', // s-prof-privacy
  ProfLanguage: 'Language', // s-prof-language
  ProfDistance: 'Distance units', // s-prof-distance
};
