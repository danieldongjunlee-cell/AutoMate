import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { ActionSheet } from '../components/ActionSheet';
import { EstimateGateSheet } from '../components/EstimateGateSheet';
import { Icon } from '../components/Icon';
import { Tappable } from '../components/Tappable';
import { useAppStore } from '../store/useAppStore';
import { palette, useTheme } from '../theme';
import { TabIcon } from './TabIcons';
import { MainTabParamList } from './types';

/** Dock slots left→right; `null` is the centre `+`. Bookings has no slot — it
 *  is reached from the action sheet, Home and More. */
const SLOTS: (keyof MainTabParamList | null)[] = ['HomeTab', 'QuotesTab', null, 'CommunityTab', 'MoreTab'];

export const DOCK_HEIGHT = 66;
export const DOCK_INSET = 16;

/**
 * Floating pill dock (canvas "Tabs & system"): 66px tall, 16px inset from the
 * screen edges, `rgba(18,26,43,.96)` on a `#1f2940` border. Active tab = white
 * glyph + blue dot. The centre `+` is the only white element in the app: 62px,
 * raised 16px above the pill, with a blue glow. It opens the action sheet.
 */
export function Dock({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setPendingAuth = useAppStore((s) => s.setPendingAuth);
  const setServiceTypePick = useAppStore((s) => s.setServiceTypePick);
  const activeName = state.routes[state.index]?.name;
  const { colors } = useTheme();

  const go = (name: keyof MainTabParamList) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (activeName !== name && !event.defaultPrevented) {
      navigation.dispatch({ ...CommonActions.navigate(name), target: state.key });
    }
  };
  const openInHome = (screen: string, params?: object) =>
    navigation.dispatch(CommonActions.navigate('HomeTab', { screen, params, initial: false }));

  const bottom = Math.max(insets.bottom, 0) + DOCK_INSET;

  return (
    <>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: DOCK_INSET,
          right: DOCK_INSET,
          bottom,
          height: DOCK_HEIGHT + 16,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            height: DOCK_HEIGHT,
            borderRadius: DOCK_HEIGHT / 2,
            backgroundColor: colors.dock,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 6,
            shadowColor: '#000',
            shadowOpacity: 0.45,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
            ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as object) : null),
          }}
        >
          {SLOTS.map((name, i) => {
            if (!name) {
              return (
                <View
                  key="plus"
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: DOCK_HEIGHT,
                    // 62px button sits 16px above the pill's top edge.
                    paddingBottom: (DOCK_HEIGHT - 62) / 2 + 16,
                  }}
                >
                  <Tappable
                    onPress={() => setSheetOpen(true)}
                    accessibilityLabel="Open actions"
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: 31,
                      backgroundColor: '#ffffff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: palette.primary,
                      shadowOpacity: 0.55,
                      shadowRadius: 18,
                      shadowOffset: { width: 0, height: 6 },
                      elevation: 14,
                    }}
                  >
                    <Icon name="plus" size={34} color={palette.primary} strokeWidth={2.4} />
                  </Tappable>
                </View>
              );
            }
            const route = state.routes.find((r) => r.name === name);
            const options = route ? descriptors[route.key]?.options : undefined;
            const active = activeName === name;
            const badge = options?.tabBarBadge;
            const label = typeof options?.tabBarLabel === 'string' ? options.tabBarLabel : options?.title ?? name;
            return (
              <Tappable
                key={name}
                onPress={() => go(name)}
                accessibilityRole="button"
                accessibilityState={active ? { selected: true } : {}}
                accessibilityLabel={label}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: DOCK_HEIGHT }}
              >
                <View>
                  <TabIcon tab={name} color={active ? colors.textPrimary : colors.textTertiary} size={31} />
                  {badge ? (
                    <View
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -9,
                        minWidth: 17,
                        height: 17,
                        borderRadius: 9,
                        paddingHorizontal: 4,
                        backgroundColor: palette.danger,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{badge}</Text>
                    </View>
                  ) : null}
                </View>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    marginTop: 5,
                    backgroundColor: active ? palette.primary : 'transparent',
                  }}
                />
              </Tappable>
            );
          })}
        </View>
      </View>

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        rows={[
          {
            key: 'estimate',
            title: 'New AI estimate',
            sub: 'Photos of the damage → quotes from local shops',
            icon: 'camera',
            color: palette.teal,
            // Guests get the guest / join gate first; Home resumes the
            // picker after Join via the 'newEstimate' intent.
            onPress: () => (isAuthenticated ? openInHome('CarDiagram') : setGateOpen(true)),
          },
          {
            key: 'maintenance',
            title: 'Book maintenance',
            sub: 'Oil, tires, brakes, inspection at a partner shop',
            icon: 'calcheck',
            color: palette.primary,
            glyphColor: '#ffffff',
            onPress: () => {
              setServiceTypePick([]);
              openInHome('MaintServiceType');
            },
          },
          {
            key: 'bookings',
            title: 'My bookings',
            sub: 'Upcoming appointments & pending quotes',
            icon: 'calendar',
            color: palette.amber,
            onPress: () => go('BookingsTab'),
          },
        ]}
      />
      <EstimateGateSheet
        visible={gateOpen}
        onClose={() => setGateOpen(false)}
        onGuest={() => openInHome('CarDiagram')}
        onSignUp={() => {
          setPendingAuth('newEstimate');
          navigation.dispatch(CommonActions.navigate('Auth', { intent: 'newEstimate', tab: 'join' }));
        }}
      />
    </>
  );
}
