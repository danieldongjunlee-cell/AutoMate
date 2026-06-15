import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { TabIcon } from './TabIcons';

import { AcceptBookingScreen } from '../screens/home/AcceptBookingScreen';
import { AfterHoursScreen } from '../screens/home/AfterHoursScreen';
import { AllQuotesMapScreen } from '../screens/home/AllQuotesMapScreen';
import { BookAgreementScreen } from '../screens/home/BookAgreementScreen';
import { BookDepositScreen } from '../screens/home/BookDepositScreen';
import { BookingConfirmScreen } from '../screens/home/BookingConfirmScreen';
import { BundleDealsScreen } from '../screens/home/BundleDealsScreen';
import { CameraScreen } from '../screens/home/CameraScreen';
import { CarDiagramScreen } from '../screens/home/CarDiagramScreen';
import { ConfirmSubmitScreen } from '../screens/home/ConfirmSubmitScreen';
import { DealerMapScreen } from '../screens/home/DealerMapScreen';
import { DealerQuotesScreen } from '../screens/home/DealerQuotesScreen';
import { HomeLauncherScreen } from '../screens/home/HomeLauncherScreen';
import { HowItWorksScreen } from '../screens/home/HowItWorksScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { PartnerAgreementScreen } from '../screens/home/PartnerAgreementScreen';
import { ProSubscribeScreen } from '../screens/home/ProSubscribeScreen';
import { ProSuccessScreen } from '../screens/home/ProSuccessScreen';
import { RescheduleScreen } from '../screens/home/RescheduleScreen';
import { ReviewsScreen } from '../screens/home/ReviewsScreen';
import { SubmittedScreen } from '../screens/home/SubmittedScreen';
import { TosBookingScreen } from '../screens/home/TosBookingScreen';
import { WriteReviewScreen } from '../screens/home/WriteReviewScreen';
import { DiyConfirmScreen } from '../screens/maint/DiyConfirmScreen';
import { DiyPaymentScreen } from '../screens/maint/DiyPaymentScreen';
import { DiyFutureScreen, DiyGuidesScreen, DiyMatchScreen, DiyToolsScreen } from '../screens/maint/DiyProScreens';
import { DiyUnlockScreen } from '../screens/maint/DiyUnlockScreen';
import { MaintDashboardScreen } from '../screens/maint/MaintDashboardScreen';
import { MaintDiyScreen } from '../screens/maint/MaintDiyScreen';
import { MaintHistoryScreen } from '../screens/maint/MaintHistoryScreen';
import { MaintManualScreen } from '../screens/maint/MaintManualScreen';
import { MaintPaymentScreen } from '../screens/maint/MaintPaymentScreen';
import { MaintScanCamScreen } from '../screens/maint/MaintScanCamScreen';
import { MaintScanRevScreen } from '../screens/maint/MaintScanRevScreen';
import { MaintScheduleBookScreen } from '../screens/maint/MaintScheduleBookScreen';
import { MaintScheduleConfirmScreen } from '../screens/maint/MaintScheduleConfirmScreen';
import { MaintScheduleScreen } from '../screens/maint/MaintScheduleScreen';
import { CompCashBookScreen } from '../screens/compare/CompCashBookScreen';
import { CompCashInsScreen } from '../screens/compare/CompCashInsScreen';
import { CompDeepDiveScreen } from '../screens/compare/CompDeepDiveScreen';
import { CompInsuranceScreen } from '../screens/compare/CompInsuranceScreen';
import { CompSelectScreen } from '../screens/compare/CompSelectScreen';
import { BookingsScreen } from '../screens/bookings/BookingsScreen';
import { CommChannelsScreen } from '../screens/community/CommChannelsScreen';
import { CommCreateScreen } from '../screens/community/CommCreateScreen';
import { CommHondaScreen } from '../screens/community/CommHondaScreen';
import { CommPostScreen } from '../screens/community/CommPostScreen';
import {
  ProfChangeEmailScreen,
  ProfChangePasswordScreen,
  ProfChangePhoneScreen,
} from '../screens/profile/ProfAccountFormScreens';
import { ProfCarAddScreen } from '../screens/profile/ProfCarAddScreen';
import { ProfCarsScreen } from '../screens/profile/ProfCarsScreen';
import { ProfEarnScreen } from '../screens/profile/ProfEarnScreen';
import { ProfEditProfileScreen } from '../screens/profile/ProfEditProfileScreen';
import { ProfHubScreen } from '../screens/profile/ProfHubScreen';
import {
  HelpBookingsScreen,
  HelpContactScreen,
  HelpPhotosScreen,
  HelpQuotesScreen,
} from '../screens/profile/HelpArticleScreens';
import { ProfInsAddScreen, ProfInsEditScreen } from '../screens/profile/ProfInsFormScreens';
import { ProfInsuranceScreen } from '../screens/profile/ProfInsuranceScreen';
import { ProfMileDetScreen } from '../screens/profile/ProfMileDetScreen';
import { ProfMilesScreen } from '../screens/profile/ProfMilesScreen';
import {
  ProfDistanceScreen,
  ProfHelpCenterScreen,
  ProfLanguageScreen,
  ProfLinkedAccountsScreen,
  ProfPrivacyScreen,
  ProfTermsScreen,
} from '../screens/profile/ProfMiscScreens';
import { ProfPaymentScreen } from '../screens/profile/ProfPaymentScreen';
import { ProManageScreen } from '../screens/profile/ProManageScreen';
import { ProfSettingsScreen } from '../screens/profile/ProfSettingsScreen';
import { useT } from '../i18n';
import { useTheme } from '../theme';
import { buildScreens, stackScreenOptions } from './stackFactory';
import {
  BookingsStackParamList,
  CommunityStackParamList,
  HomeStackParamList,
  MainTabParamList,
  ProfileStackParamList,
} from './types';

// ── Home tab: launcher hub + repair flow + new flows + Maintenance + Compare ──
const HomeNative = createNativeStackNavigator<HomeStackParamList>();
const homeScreens = buildScreens(
  [
    'HomeLauncher',
    'CarDiagram',
    'Camera',
    'ConfirmSubmit',
    'Submitted',
    'AfterHours',
    'DealerQuotes',
    'AllQuotesMap',
    'AcceptBooking',
    'BookAgreement',
    'BookDeposit',
    'BookingConfirm',
    'Reschedule',
    'Reviews',
    'WriteReview',
    'TosBooking',
    'PartnerAgreement',
    'ProSubscribe',
    'ProSuccess',
    'HowItWorks',
    'DealerMap',
    'BundleDeals',
    'Notifications',
    'MaintDashboard',
    'MaintHistory',
    'MaintScanCam',
    'MaintScanRev',
    'MaintManual',
    'MaintDiy',
    'DiyUnlock',
    'DiyPayment',
    'DiyConfirm',
    'DiyGuides',
    'DiyMatch',
    'DiyTools',
    'DiyFuture',
    'MaintSchedule',
    'MaintScheduleBook',
    'MaintPayment',
    'MaintScheduleConfirm',
    'CompSelect',
    'CompCashIns',
    'CompDeepDive',
    'CompCashBook',
    'CompInsurance',
  ] as const,
  {
    HomeLauncher: HomeLauncherScreen,
    CarDiagram: CarDiagramScreen,
    Camera: CameraScreen,
    ConfirmSubmit: ConfirmSubmitScreen,
    Submitted: SubmittedScreen,
    AfterHours: AfterHoursScreen,
    DealerQuotes: DealerQuotesScreen,
    AllQuotesMap: AllQuotesMapScreen,
    AcceptBooking: AcceptBookingScreen,
    BookAgreement: BookAgreementScreen,
    BookDeposit: BookDepositScreen,
    BookingConfirm: BookingConfirmScreen,
    Reschedule: RescheduleScreen,
    Reviews: ReviewsScreen,
    WriteReview: WriteReviewScreen,
    TosBooking: TosBookingScreen,
    PartnerAgreement: PartnerAgreementScreen,
    ProSubscribe: ProSubscribeScreen,
    ProSuccess: ProSuccessScreen,
    HowItWorks: HowItWorksScreen,
    DealerMap: DealerMapScreen,
    BundleDeals: BundleDealsScreen,
    Notifications: NotificationsScreen,
    MaintDashboard: MaintDashboardScreen,
    MaintHistory: MaintHistoryScreen,
    MaintScanCam: MaintScanCamScreen,
    MaintScanRev: MaintScanRevScreen,
    MaintManual: MaintManualScreen,
    MaintDiy: MaintDiyScreen,
    DiyUnlock: DiyUnlockScreen,
    DiyPayment: DiyPaymentScreen,
    DiyConfirm: DiyConfirmScreen,
    DiyGuides: DiyGuidesScreen,
    DiyMatch: DiyMatchScreen,
    DiyTools: DiyToolsScreen,
    DiyFuture: DiyFutureScreen,
    MaintSchedule: MaintScheduleScreen,
    MaintScheduleBook: MaintScheduleBookScreen,
    MaintPayment: MaintPaymentScreen,
    MaintScheduleConfirm: MaintScheduleConfirmScreen,
    CompSelect: CompSelectScreen,
    CompCashIns: CompCashInsScreen,
    CompDeepDive: CompDeepDiveScreen,
    CompCashBook: CompCashBookScreen,
    CompInsurance: CompInsuranceScreen,
  },
);

function HomeStack() {
  const theme = useTheme();
  return (
    <HomeNative.Navigator initialRouteName="HomeLauncher" screenOptions={stackScreenOptions(theme)}>
      {homeScreens.map(({ name, component, title }) => (
        <HomeNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </HomeNative.Navigator>
  );
}

// ── Bookings tab ───────────────────────────────────────────────────────
const BookingsNative = createNativeStackNavigator<BookingsStackParamList>();
const bookingsScreens = buildScreens(['Bookings'] as const, { Bookings: BookingsScreen });
function BookingsStack() {
  const theme = useTheme();
  return (
    <BookingsNative.Navigator initialRouteName="Bookings" screenOptions={stackScreenOptions(theme)}>
      {bookingsScreens.map(({ name, component, title }) => (
        <BookingsNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </BookingsNative.Navigator>
  );
}

// ── Community tab ──────────────────────────────────────────────────────
const CommunityNative = createNativeStackNavigator<CommunityStackParamList>();
const communityScreens = buildScreens(
  ['CommChannels', 'CommHonda', 'CommPost', 'CommCreate'] as const,
  {
    CommChannels: CommChannelsScreen,
    CommHonda: CommHondaScreen,
    CommPost: CommPostScreen,
    CommCreate: CommCreateScreen,
  },
);
function CommunityStack() {
  const theme = useTheme();
  return (
    <CommunityNative.Navigator initialRouteName="CommChannels" screenOptions={stackScreenOptions(theme)}>
      {communityScreens.map(({ name, component, title }) => (
        <CommunityNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </CommunityNative.Navigator>
  );
}

// ── More tab (was Profile) ─────────────────────────────────────────────
const ProfileNative = createNativeStackNavigator<ProfileStackParamList>();
const profileScreens = buildScreens(
  [
    'ProfHub',
    'ProfMiles',
    'ProfMileDet',
    'ProfEarn',
    'ProfCars',
    'ProfCarAdd',
    'ProfInsurance',
    'ProfInsEdit',
    'ProfInsAdd',
    'ProfPayment',
    'ProManage',
    'ProfSettings',
    'ProfEditProfile',
    'ProfChangeEmail',
    'ProfChangePassword',
    'ProfChangePhone',
    'ProfLinkedAccounts',
    'ProfHelpCenter',
    'HelpPhotos',
    'HelpQuotes',
    'HelpBookings',
    'HelpContact',
    'ProfTerms',
    'ProfPrivacy',
    'ProfLanguage',
    'ProfDistance',
  ] as const,
  {
    ProfHub: ProfHubScreen,
    ProfMiles: ProfMilesScreen,
    ProfMileDet: ProfMileDetScreen,
    ProfEarn: ProfEarnScreen,
    ProfCars: ProfCarsScreen,
    ProfCarAdd: ProfCarAddScreen,
    ProfInsurance: ProfInsuranceScreen,
    ProfInsEdit: ProfInsEditScreen,
    ProfInsAdd: ProfInsAddScreen,
    ProfPayment: ProfPaymentScreen,
    ProManage: ProManageScreen,
    ProfSettings: ProfSettingsScreen,
    ProfEditProfile: ProfEditProfileScreen,
    ProfChangeEmail: ProfChangeEmailScreen,
    ProfChangePassword: ProfChangePasswordScreen,
    ProfChangePhone: ProfChangePhoneScreen,
    ProfLinkedAccounts: ProfLinkedAccountsScreen,
    ProfHelpCenter: ProfHelpCenterScreen,
    HelpPhotos: HelpPhotosScreen,
    HelpQuotes: HelpQuotesScreen,
    HelpBookings: HelpBookingsScreen,
    HelpContact: HelpContactScreen,
    ProfTerms: ProfTermsScreen,
    ProfPrivacy: ProfPrivacyScreen,
    ProfLanguage: ProfLanguageScreen,
    ProfDistance: ProfDistanceScreen,
  },
);
function MoreStack() {
  const theme = useTheme();
  return (
    <ProfileNative.Navigator initialRouteName="ProfHub" screenOptions={stackScreenOptions(theme)}>
      {profileScreens.map(({ name, component, title }) => (
        <ProfileNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </ProfileNative.Navigator>
  );
}

// ── Tab bar (v17: Home · Bookings · Community · More) ──────────────────
const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: { name: keyof MainTabParamList; label: string }[] = [
  { name: 'HomeTab', label: 'Home' },
  { name: 'BookingsTab', label: 'Bookings' },
  { name: 'CommunityTab', label: 'Community' },
  { name: 'MoreTab', label: 'More' },
];

const TAB_COMPONENTS: Record<keyof MainTabParamList, React.ComponentType> = {
  HomeTab: HomeStack,
  BookingsTab: BookingsStack,
  CommunityTab: CommunityStack,
  MoreTab: MoreStack,
};

export function MainTabs() {
  const theme = useTheme();
  const t = useT();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        popToTopOnBlur: true,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.tabBarBorder,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {TABS.map(({ name, label }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={TAB_COMPONENTS[name]}
          options={{
            tabBarLabel: t(label),
            tabBarIcon: ({ color }) => <TabIcon tab={name} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
