import { NavigatorScreenParams } from '@react-navigation/native';

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
  MapFilter: undefined;
  AcceptBooking: undefined;
  BookingConfirm: undefined;
  BundleDeals: undefined;
  Notifications: undefined;
};

export type MaintStackParamList = {
  MaintDashboard: undefined;
  MaintHistory: undefined;
  MaintScanCam: undefined;
  MaintScanRev: undefined;
  MaintManual: undefined;
  MaintDiy: undefined;
  MaintSchedule: undefined;
  MaintScheduleBook: undefined;
  MaintPayment: undefined;
  MaintScheduleConfirm: undefined;
};

export type CompareStackParamList = {
  CompSelect: undefined;
  CompCashIns: undefined;
  CompDeepDive: undefined;
  CompCashBook: undefined;
  CompInsurance: undefined;
};

export type CommunityStackParamList = {
  CommChannels: undefined;
  CommHonda: undefined;
  CommPost: undefined;
  CommCreate: undefined;
};

export type ProfileStackParamList = {
  ProfHub: undefined;
  ProfMiles: undefined;
  ProfMileDet: undefined;
  ProfEarn: undefined;
  ProfCars: undefined;
  ProfInsurance: undefined;
  ProfPayment: undefined;
  ProfSettings: undefined;
  ProfEditProfile: undefined;
  ProfChangeEmail: undefined;
  ProfChangePassword: undefined;
  ProfChangePhone: undefined;
  ProfLinkedAccounts: undefined;
  ProfHelpCenter: undefined;
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
