import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { Dock } from './Dock';

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
import { EstimateIntakeScreen } from '../screens/home/EstimateIntakeScreen';
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
import { MaintScheduleBookScreen } from '../screens/maint/MaintScheduleBookScreen';
import { MaintScheduleConfirmScreen } from '../screens/maint/MaintScheduleConfirmScreen';
import { MaintScheduleScreen } from '../screens/maint/MaintScheduleScreen';
import { MaintServiceTypeScreen } from '../screens/maint/MaintServiceTypeScreen';
import { BookingsScreen } from '../screens/bookings/BookingsScreen';
import { CommChannelsScreen } from '../screens/community/CommChannelsScreen';
import { CommCreateScreen } from '../screens/community/CommCreateScreen';
import { CommBrandScreen } from '../screens/community/CommBrandScreen';
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
import { PointsHistoryScreen } from '../screens/profile/PointsHistoryScreen';
import { EstimateHistoryScreen } from '../screens/profile/EstimateHistoryScreen';
import { SupabaseDemoScreen } from '../screens/dev/SupabaseDemoScreen';
import { useT } from '../i18n';
import { useActiveVehicle, useMyBrands } from '../hooks/useActiveVehicle';
import { communityFeed } from '../services/mock/communityChannels';
import { QUOTES, quotesInEstimateRange } from '../services/mock/data';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import { buildScreens, stackScreenOptions } from './stackFactory';
import {
  BookingsStackParamList,
  CommunityStackParamList,
  HomeStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  QuotesStackParamList,
} from './types';
import { QuotesReceivedScreen } from '../screens/quotes/QuotesReceivedScreen';

// ── Home tab: launcher hub + repair flow + new flows + Maintenance ──
const HomeNative = createNativeStackNavigator<HomeStackParamList>();
const homeScreens = buildScreens(
  [
    'HomeLauncher',
    'CarDiagram',
    'Camera',
    'EstimateIntake',
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
    'MaintManual',
    'MaintDiy',
    'DiyUnlock',
    'DiyPayment',
    'DiyConfirm',
    'DiyGuides',
    'DiyMatch',
    'DiyTools',
    'DiyFuture',
    'MaintServiceType',
    'MaintSchedule',
    'MaintScheduleBook',
    'MaintPayment',
    'MaintScheduleConfirm',
  ] as const,
  {
    HomeLauncher: HomeLauncherScreen,
    CarDiagram: CarDiagramScreen,
    Camera: CameraScreen,
    EstimateIntake: EstimateIntakeScreen,
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
    MaintManual: MaintManualScreen,
    MaintDiy: MaintDiyScreen,
    DiyUnlock: DiyUnlockScreen,
    DiyPayment: DiyPaymentScreen,
    DiyConfirm: DiyConfirmScreen,
    DiyGuides: DiyGuidesScreen,
    DiyMatch: DiyMatchScreen,
    DiyTools: DiyToolsScreen,
    DiyFuture: DiyFutureScreen,
    MaintServiceType: MaintServiceTypeScreen,
    MaintSchedule: MaintScheduleScreen,
    MaintScheduleBook: MaintScheduleBookScreen,
    MaintPayment: MaintPaymentScreen,
    MaintScheduleConfirm: MaintScheduleConfirmScreen,
  },
);

function HomeStack() {
  const theme = useTheme();
  const t = useT();
  return (
    <HomeNative.Navigator initialRouteName="HomeLauncher" screenOptions={stackScreenOptions(theme)}>
      {homeScreens.map(({ name, component, title }) => (
        <HomeNative.Screen key={name} name={name} component={component} options={{ title: t(title), headerShown: name !== 'HomeLauncher' }} />
      ))}
    </HomeNative.Navigator>
  );
}

// ── Quotes tab ─────────────────────────────────────────────────────────
const QuotesNative = createNativeStackNavigator<QuotesStackParamList>();
const quotesScreens = buildScreens(['Quotes'] as const, { Quotes: QuotesReceivedScreen });
function QuotesStack() {
  const theme = useTheme();
  const t = useT();
  return (
    <QuotesNative.Navigator initialRouteName="Quotes" screenOptions={stackScreenOptions(theme)}>
      {quotesScreens.map(({ name, component, title }) => (
        <QuotesNative.Screen key={name} name={name} component={component} options={{ title: t(title), headerShown: false }} />
      ))}
    </QuotesNative.Navigator>
  );
}

// ── Bookings tab ───────────────────────────────────────────────────────
const BookingsNative = createNativeStackNavigator<BookingsStackParamList>();
const bookingsScreens = buildScreens(['Bookings'] as const, { Bookings: BookingsScreen });
function BookingsStack() {
  const theme = useTheme();
  const t = useT();
  return (
    <BookingsNative.Navigator initialRouteName="Bookings" screenOptions={stackScreenOptions(theme)}>
      {bookingsScreens.map(({ name, component, title }) => (
        <BookingsNative.Screen key={name} name={name} component={component} options={{ title: t(title), headerShown: false }} />
      ))}
    </BookingsNative.Navigator>
  );
}

// ── Community tab ──────────────────────────────────────────────────────
const CommunityNative = createNativeStackNavigator<CommunityStackParamList>();
const communityScreens = buildScreens(
  ['CommChannels', 'CommBrand', 'CommPost', 'CommCreate'] as const,
  {
    CommChannels: CommChannelsScreen,
    CommBrand: CommBrandScreen,
    CommPost: CommPostScreen,
    CommCreate: CommCreateScreen,
  },
);
function CommunityStack() {
  const theme = useTheme();
  const t = useT();
  return (
    <CommunityNative.Navigator initialRouteName="CommChannels" screenOptions={stackScreenOptions(theme)}>
      {communityScreens.map(({ name, component, title }) => (
        <CommunityNative.Screen key={name} name={name} component={component} options={{ title: t(title), headerShown: name !== 'CommChannels' }} />
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
    'ProfPointsHistory',
    'ProfEstimates',
    'SupabaseDemo',
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
    ProfPointsHistory: PointsHistoryScreen,
    ProfEstimates: EstimateHistoryScreen,
    SupabaseDemo: SupabaseDemoScreen,
  },
);
function MoreStack() {
  const theme = useTheme();
  const t = useT();
  return (
    <ProfileNative.Navigator initialRouteName="ProfHub" screenOptions={stackScreenOptions(theme)}>
      {profileScreens.map(({ name, component, title }) => (
        <ProfileNative.Screen key={name} name={name} component={component} options={{ title: t(title), headerShown: name !== 'ProfHub' }} />
      ))}
    </ProfileNative.Navigator>
  );
}

// ── Floating dock (Home · Quotes · + · Community · More; Bookings has no slot) ──
const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: { name: keyof MainTabParamList; label: string }[] = [
  { name: 'HomeTab', label: 'Home' },
  { name: 'QuotesTab', label: 'Quotes' },
  { name: 'BookingsTab', label: 'Bookings' },
  { name: 'CommunityTab', label: 'Community' },
  { name: 'MoreTab', label: 'More' },
];

const TAB_COMPONENTS: Record<keyof MainTabParamList, React.ComponentType> = {
  HomeTab: HomeStack,
  QuotesTab: QuotesStack,
  BookingsTab: BookingsStack,
  CommunityTab: CommunityStack,
  MoreTab: MoreStack,
};

export function MainTabs() {
  const theme = useTheme();
  const t = useT();
  const { brand } = useActiveVehicle();
  const { brands, hasCar } = useMyBrands();
  const damageParts = useAppStore((s) => s.damageParts);
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  const readPostIds = useAppStore((s) => s.readPostIds);
  const bookings = useAppStore((s) => s.bookings);

  // Per-tab notification counts.
  // Bookings badge = how many upcoming services the ACTIVE car has (confirmed or
  // prepaid). Scoping to the active car matches the Bookings list (which filters
  // by car), so an empty list never shows a stray count.
  // Seeded demo bookings (bk-seed-*) never count: the badge only appears once
  // the user actually books an appointment in this session.
  const upcoming = bookings.filter(
    (b) =>
      b.brand === brand &&
      !b.id.startsWith('bk-seed-') &&
      (b.status === 'confirmed' || b.status === 'paid'),
  ).length;
  // Community = unread posts across the communities of every brand in the
  // garage (membership is automatic once a car is registered). Cleared as the
  // posts are read.
  const unreadPosts = (hasCar ? communityFeed(brands) : []).filter((p) => !readPostIds[p.id]).length;
  // Quotes = how many shops have quoted the open request, the same list the
  // tab shows, so the count stays on the icon while the request is open.
  const quotesReceived = damageParts.length > 0 ? quotesInEstimateRange(QUOTES, aiEstimate).length : 0;
  const badges: Partial<Record<keyof MainTabParamList, number>> = {
    QuotesTab: quotesReceived || undefined,
    BookingsTab: upcoming || undefined,
    CommunityTab: unreadPosts || undefined,
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <Dock {...props} />}
      screenOptions={{
        headerShown: false,
        popToTopOnBlur: true,
        // The dock floats over the content (screens pad 104px at the bottom),
        // so the navigator must not reserve space for a bar.
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
      }}
    >
      {TABS.map(({ name, label }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={TAB_COMPONENTS[name]}
          options={{
            tabBarLabel: t(label),
            tabBarBadge: badges[name],
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
