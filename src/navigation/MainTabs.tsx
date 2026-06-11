import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';

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
const homeScreens = buildScreens([
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
] as const);

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
const maintScreens = buildScreens([
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
] as const);

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
const compareScreens = buildScreens([
  'CompSelect',
  'CompCashIns',
  'CompDeepDive',
  'CompCashBook',
  'CompInsurance',
] as const);

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
const communityScreens = buildScreens([
  'CommChannels',
  'CommHonda',
  'CommPost',
  'CommCreate',
] as const);

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
const profileScreens = buildScreens([
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
] as const);

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
