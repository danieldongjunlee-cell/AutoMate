import { NavigatorScreenParams } from '@react-navigation/native';

import type { ScannedReceipt } from '../services/mock/data';

export type AuthStackParamList = {
  Splash: undefined;
  SignUp: undefined;
  LogIn: undefined;
  VerifyOtp: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CarDiagram: undefined;
  PhotoExample: undefined;
  Camera: undefined;
  ConfirmSubmit: undefined;
  Submitted: undefined;
  AfterHours: undefined;
  DealerQuotes: undefined;
  AllQuotesMap: undefined;
  AcceptBooking: { dealerId?: string } | undefined;
  BookingConfirm:
    | { dealerId?: string; dateLabel?: string; time?: string; paid?: 'cash'; priceLabel?: string }
    | undefined;
  DealerMap: { dealerId?: string } | undefined;
  BundleDeals: undefined;
  Notifications: undefined;
};

export type MaintStackParamList = {
  MaintDashboard: undefined;
  MaintHistory: undefined;
  MaintScanCam: undefined;
  MaintScanRev: { receipt?: ScannedReceipt } | undefined;
  MaintManual: undefined;
  MaintDiy: undefined;
  DiyUnlock: undefined;
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

export type CommunityStackParamList = {
  CommChannels: undefined;
  CommHonda: undefined;
  CommPost: { postId?: string } | undefined;
  CommCreate: undefined;
};

export type ProfileStackParamList = {
  ProfHub: undefined;
  ProfMiles: undefined;
  ProfMileDet: undefined;
  ProfEarn: undefined;
  ProfCars: undefined;
  ProfInsurance: undefined;
  ProfInsEdit: { policyId?: string } | undefined;
  ProfInsAdd: undefined;
  ProfPayment: undefined;
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
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MaintTab: NavigatorScreenParams<MaintStackParamList>;
  CompareTab: NavigatorScreenParams<CompareStackParamList>;
  CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
