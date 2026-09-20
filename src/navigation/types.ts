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
  /** Sign In / Join screen, the single entry to the auth modal. */
  AuthMain: { intent?: string; tab?: 'signin' | 'join' } | undefined;
  /** Pick how to receive the code, shows the actual sign-up email/phone. */
  VerifyMethod: { email: string; phone: string };
  VerifyOtp: { method: 'email' | 'sms'; destination: string } | undefined;
};

/** Root stack (guest-first): the tabs are always mounted; auth is a modal
 *  presented over them at value-action gates. */
export type RootStackParamList = {
  Main: undefined;
  Auth: { intent?: string; tab?: 'signin' | 'join' } | undefined;
};

/** Repair-estimate flow + the new v17 booking/Pro/reviews flows. */
type HomeFlowParamList = {
  HomeLauncher: undefined;
  CarDiagram: undefined;
  Camera: undefined;
  EstimateIntake: undefined;
  ConfirmSubmit: { autoSubmit?: boolean } | undefined;
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
  ProSubscribe: { returnTo?: 'DealerQuotes' | 'MaintDashboard' | 'ProfHub' } | undefined;
  ProSuccess: { returnTo?: 'BookDeposit' | 'DealerQuotes' | 'MaintDashboard' | 'ProfHub' } | undefined;
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
  MaintServiceType: undefined;
  MaintSchedule: undefined;
  MaintScheduleBook: undefined;
  MaintPayment: undefined;
  MaintScheduleConfirm: undefined;
};

/**
 * Home tab: a launcher hub whose stack hosts the repair flow, the
 * booking/Pro/reviews flows and the full Maintenance flow. Composed by
 * intersection so the Maint screens keep their param-list type.
 */
export type HomeStackParamList = HomeFlowParamList & MaintStackParamList;

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
