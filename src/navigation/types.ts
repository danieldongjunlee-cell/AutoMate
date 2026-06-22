import { NavigatorScreenParams } from '@react-navigation/native';

import type { ScannedReceipt } from '../services/mock/data';

/** Params for the post-booking confirmation, threaded through agreement/deposit. */
export type BookingConfirmParams = {
  dealerId?: string;
  dateLabel?: string;
  time?: string;
  paid?: 'cash';
  priceLabel?: string;
  /** The stored booking's id, so reschedule/cancel can target it. */
  bookingId?: string;
};

export type AuthStackParamList = {
  Splash: undefined;
  SignUp: undefined;
  LogIn: undefined;
  /** Pick how to receive the code — shows the actual sign-up email/phone. */
  VerifyMethod: { email: string; phone: string };
  VerifyOtp: { method: 'email' | 'sms'; destination: string } | undefined;
};

/** Repair-estimate flow + the new v17 booking/Pro/reviews flows. */
type HomeFlowParamList = {
  HomeLauncher: undefined;
  CarDiagram: undefined;
  Camera: undefined;
  ConfirmSubmit: undefined;
  Submitted: undefined;
  AfterHours: undefined;
  DealerQuotes: undefined;
  AllQuotesMap: undefined;
  AcceptBooking: { dealerId?: string } | undefined;
  // v17 booking flow: agreement → (deposit unless maintenance/Pro) → confirm.
  // nextParams threads the chosen date/time/price through to the confirmation.
  BookAgreement: {
    kind: 'repair' | 'maintenance';
    dealerId?: string;
    next: 'BookingConfirm' | 'MaintScheduleConfirm' | 'MaintPayment';
    nextParams?: BookingConfirmParams;
  };
  BookDeposit: {
    kind: 'repair' | 'maintenance';
    dealerId?: string;
    next: 'BookingConfirm' | 'MaintScheduleConfirm' | 'MaintPayment';
    nextParams?: BookingConfirmParams;
  };
  BookingConfirm: BookingConfirmParams | undefined;
  Reschedule: { kind?: 'repair' | 'maintenance'; bookingId?: string } | undefined;
  Reviews: { dealerId?: string } | undefined;
  WriteReview: { dealerId?: string } | undefined;
  TosBooking: undefined;
  PartnerAgreement: undefined;
  ProSubscribe: { returnTo?: 'DealerQuotes' | 'MaintDashboard' } | undefined;
  ProSuccess: { returnTo?: 'BookDeposit' | 'DealerQuotes' | 'MaintDashboard' } | undefined;
  HowItWorks: undefined;
  DealerMap: { dealerId?: string } | undefined;
  BundleDeals: { focus?: string } | undefined;
  Notifications: undefined;
};

export type MaintStackParamList = {
  MaintDashboard: undefined;
  MaintHistory: undefined;
  MaintScanCam: undefined;
  MaintScanRev: { receipt?: ScannedReceipt; receiptUri?: string } | undefined;
  MaintManual: undefined;
  MaintDiy: undefined;
  DiyUnlock: { returnTo?: 'DealerQuotes' | 'MaintDashboard' } | undefined;
  DiyPayment: undefined;
  DiyConfirm: undefined;
  DiyGuides: undefined;
  DiyMatch: undefined;
  DiyTools: undefined;
  DiyFuture: undefined;
  MaintSchedule: undefined;
  MaintScheduleBook: undefined;
  MaintPayment: undefined;
  MaintScheduleConfirm: undefined;
};

export type CompareStackParamList = {
  CompSelect: undefined;
  CompCashIns: { quoteId?: string } | undefined;
  CompDeepDive: { quoteId?: string } | undefined;
  CompCashBook: { quoteId?: string } | undefined;
  CompInsurance: { quoteId?: string } | undefined;
};

/**
 * v17 Home tab: a launcher hub whose stack hosts the repair flow, the new
 * booking/Pro/reviews flows, and (now that they're no longer tabs) the full
 * Maintenance and Compare flows. Composed by intersection so the existing
 * Maint/Compare screens keep their param-list types.
 */
export type HomeStackParamList = HomeFlowParamList &
  MaintStackParamList &
  CompareStackParamList;

/** v17 Bookings tab (calendar + scheduled services + pending quotes). */
export type QuotesStackParamList = {
  Quotes: undefined;
};

export type BookingsStackParamList = {
  Bookings: undefined;
};

export type CommunityStackParamList = {
  CommChannels: undefined;
  CommHonda: { title?: string; kind?: 'service' | 'maintenance' | 'lounge' | 'deals' } | undefined;
  CommPost: { postId?: string; post?: import('../services/mock/data').CommunityPost } | undefined;
  CommCreate: undefined;
};

export type ProfileStackParamList = {
  ProfHub: undefined;
  ProfMiles: undefined;
  ProfMileDet: { id?: string } | undefined;
  ProfEarn: undefined;
  ProfCars: undefined;
  ProfCarAdd: undefined;
  ProfInsurance: undefined;
  ProfInsEdit: { policyId?: string } | undefined;
  ProfInsAdd: undefined;
  ProfPayment: undefined;
  ProManage: undefined;
  ProfSettings: undefined;
  ProfEditProfile: undefined;
  ProfChangeEmail: undefined;
  ProfChangePassword: undefined;
  ProfChangePhone: undefined;
  ProfLinkedAccounts: undefined;
  ProfHelpCenter: undefined;
  HelpPhotos: undefined;
  HelpQuotes: undefined;
  HelpBookings: undefined;
  HelpContact: undefined;
  ProfTerms: undefined;
  ProfPrivacy: undefined;
  ProfLanguage: undefined;
  ProfDistance: undefined;
  ProfPointsHistory: undefined;
  ProfEstimates: undefined;
  SupabaseDemo: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  QuotesTab: NavigatorScreenParams<QuotesStackParamList>;
  BookingsTab: NavigatorScreenParams<BookingsStackParamList>;
  CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
  MoreTab: NavigatorScreenParams<ProfileStackParamList>;
};
