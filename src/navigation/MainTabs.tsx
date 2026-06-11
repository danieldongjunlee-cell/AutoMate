import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';

import { AcceptBookingScreen } from '../screens/home/AcceptBookingScreen';
import { AfterHoursScreen } from '../screens/home/AfterHoursScreen';
import { AllQuotesMapScreen } from '../screens/home/AllQuotesMapScreen';
import { BookingConfirmScreen } from '../screens/home/BookingConfirmScreen';
import { BundleDealsScreen } from '../screens/home/BundleDealsScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { CameraScreen } from '../screens/home/CameraScreen';
import { CarDiagramScreen } from '../screens/home/CarDiagramScreen';
import { ConfirmSubmitScreen } from '../screens/home/ConfirmSubmitScreen';
import { DealerQuotesScreen } from '../screens/home/DealerQuotesScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { MapFilterScreen } from '../screens/home/MapFilterScreen';
import { PhotoExampleScreen } from '../screens/home/PhotoExampleScreen';
import { SubmittedScreen } from '../screens/home/SubmittedScreen';
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
import { CommChannelsScreen } from '../screens/community/CommChannelsScreen';
import { CommCreateScreen } from '../screens/community/CommCreateScreen';
import { CommHondaScreen } from '../screens/community/CommHondaScreen';
import { CommPostScreen } from '../screens/community/CommPostScreen';
import { CompCashBookScreen } from '../screens/compare/CompCashBookScreen';
import { CompCashInsScreen } from '../screens/compare/CompCashInsScreen';
import { CompDeepDiveScreen } from '../screens/compare/CompDeepDiveScreen';
import { CompInsuranceScreen } from '../screens/compare/CompInsuranceScreen';
import { CompSelectScreen } from '../screens/compare/CompSelectScreen';
import {
  ProfChangeEmailScreen,
  ProfChangePasswordScreen,
  ProfChangePhoneScreen,
} from '../screens/profile/ProfAccountFormScreens';
import { ProfCarsScreen } from '../screens/profile/ProfCarsScreen';
import { ProfEarnScreen } from '../screens/profile/ProfEarnScreen';
import { ProfEditProfileScreen } from '../screens/profile/ProfEditProfileScreen';
import { ProfHubScreen } from '../screens/profile/ProfHubScreen';
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
import { ProfSettingsScreen } from '../screens/profile/ProfSettingsScreen';
import { useTheme } from '../theme';
import { buildScreens, stackScreenOptions } from './stackFactory';
import {
  CommunityStackParamList,
  CompareStackParamList,
  HomeStackParamList,
  MainTabParamList,
  MaintStackParamList,
  ProfileStackParamList,
} from './types';

// ── Per-tab native stacks ──────────────────────────────────────────────

const HomeNative = createNativeStackNavigator<HomeStackParamList>();
const homeScreens = buildScreens(
  [
    'Home',
    'CarDiagram',
    'PhotoExample',
    'Camera',
    'ConfirmSubmit',
    'Submitted',
    'AfterHours',
    'DealerQuotes',
    'AllQuotesMap',
    'MapFilter',
    'AcceptBooking',
    'BookingConfirm',
    'BundleDeals',
    'Notifications',
  ] as const,
  {
    Home: HomeScreen,
    CarDiagram: CarDiagramScreen,
    PhotoExample: PhotoExampleScreen,
    Camera: CameraScreen,
    ConfirmSubmit: ConfirmSubmitScreen,
    Submitted: SubmittedScreen,
    AfterHours: AfterHoursScreen,
    DealerQuotes: DealerQuotesScreen,
    AllQuotesMap: AllQuotesMapScreen,
    MapFilter: MapFilterScreen,
    AcceptBooking: AcceptBookingScreen,
    BookingConfirm: BookingConfirmScreen,
    BundleDeals: BundleDealsScreen,
    Notifications: NotificationsScreen,
  },
);

function HomeStack() {
  const theme = useTheme();
  return (
    <HomeNative.Navigator initialRouteName="Home" screenOptions={stackScreenOptions(theme)}>
      {homeScreens.map(({ name, component, title }) => (
        <HomeNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </HomeNative.Navigator>
  );
}

const MaintNative = createNativeStackNavigator<MaintStackParamList>();
const maintScreens = buildScreens(
  [
    'MaintDashboard',
    'MaintHistory',
    'MaintScanCam',
    'MaintScanRev',
    'MaintManual',
    'MaintDiy',
    'MaintSchedule',
    'MaintScheduleBook',
    'MaintPayment',
    'MaintScheduleConfirm',
  ] as const,
  {
    MaintDashboard: MaintDashboardScreen,
    MaintHistory: MaintHistoryScreen,
    MaintScanCam: MaintScanCamScreen,
    MaintScanRev: MaintScanRevScreen,
    MaintManual: MaintManualScreen,
    MaintDiy: MaintDiyScreen,
    MaintSchedule: MaintScheduleScreen,
    MaintScheduleBook: MaintScheduleBookScreen,
    MaintPayment: MaintPaymentScreen,
    MaintScheduleConfirm: MaintScheduleConfirmScreen,
  },
);

function MaintStack() {
  const theme = useTheme();
  return (
    <MaintNative.Navigator
      initialRouteName="MaintDashboard"
      screenOptions={stackScreenOptions(theme)}
    >
      {maintScreens.map(({ name, component, title }) => (
        <MaintNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </MaintNative.Navigator>
  );
}

const CompareNative = createNativeStackNavigator<CompareStackParamList>();
const compareScreens = buildScreens(
  ['CompSelect', 'CompCashIns', 'CompDeepDive', 'CompCashBook', 'CompInsurance'] as const,
  {
    CompSelect: CompSelectScreen,
    CompCashIns: CompCashInsScreen,
    CompDeepDive: CompDeepDiveScreen,
    CompCashBook: CompCashBookScreen,
    CompInsurance: CompInsuranceScreen,
  },
);

function CompareStack() {
  const theme = useTheme();
  return (
    <CompareNative.Navigator
      initialRouteName="CompSelect"
      screenOptions={stackScreenOptions(theme)}
    >
      {compareScreens.map(({ name, component, title }) => (
        <CompareNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </CompareNative.Navigator>
  );
}

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
    <CommunityNative.Navigator
      initialRouteName="CommChannels"
      screenOptions={stackScreenOptions(theme)}
    >
      {communityScreens.map(({ name, component, title }) => (
        <CommunityNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </CommunityNative.Navigator>
  );
}

const ProfileNative = createNativeStackNavigator<ProfileStackParamList>();
const profileScreens = buildScreens(
  [
    'ProfHub',
    'ProfMiles',
    'ProfMileDet',
    'ProfEarn',
    'ProfCars',
    'ProfInsurance',
    'ProfPayment',
    'ProfSettings',
    'ProfEditProfile',
    'ProfChangeEmail',
    'ProfChangePassword',
    'ProfChangePhone',
    'ProfLinkedAccounts',
    'ProfHelpCenter',
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
    ProfInsurance: ProfInsuranceScreen,
    ProfPayment: ProfPaymentScreen,
    ProfSettings: ProfSettingsScreen,
    ProfEditProfile: ProfEditProfileScreen,
    ProfChangeEmail: ProfChangeEmailScreen,
    ProfChangePassword: ProfChangePasswordScreen,
    ProfChangePhone: ProfChangePhoneScreen,
    ProfLinkedAccounts: ProfLinkedAccountsScreen,
    ProfHelpCenter: ProfHelpCenterScreen,
    ProfTerms: ProfTermsScreen,
    ProfPrivacy: ProfPrivacyScreen,
    ProfLanguage: ProfLanguageScreen,
    ProfDistance: ProfDistanceScreen,
  },
);

function ProfileStack() {
  const theme = useTheme();
  return (
    <ProfileNative.Navigator initialRouteName="ProfHub" screenOptions={stackScreenOptions(theme)}>
      {profileScreens.map(({ name, component, title }) => (
        <ProfileNative.Screen key={name} name={name} component={component} options={{ title }} />
      ))}
    </ProfileNative.Navigator>
  );
}

// ── Tab bar ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: { name: keyof MainTabParamList; label: string; icon: string }[] = [
  { name: 'HomeTab', label: 'Home', icon: '🏠' },
  { name: 'MaintTab', label: 'Maint.', icon: '🔧' },
  { name: 'CompareTab', label: 'Compare', icon: '⚖' },
  { name: 'CommunityTab', label: 'Community', icon: '💬' },
  { name: 'ProfileTab', label: 'Profile', icon: '👤' },
];

const TAB_COMPONENTS: Record<keyof MainTabParamList, React.ComponentType> = {
  HomeTab: HomeStack,
  MaintTab: MaintStack,
  CompareTab: CompareStack,
  CommunityTab: CommunityStack,
  ProfileTab: ProfileStack,
};

export function MainTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Wireframe rule (prototype tab(): jumps to tab root, clears history):
        // leaving a tab pops its stack to the root, so every tab press lands
        // on the tab's root screen.
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
      {TABS.map(({ name, label, icon }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={TAB_COMPONENTS[name]}
          options={{
            tabBarLabel: label,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{icon}</Text>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
