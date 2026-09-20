import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, Text, useWindowDimensions, View } from 'react-native';

import { EstimateGateSheet } from '../components/EstimateGateSheet';
import { Icon, IconName } from '../components/Icon';
import { IconChip } from '../components/IconChip';
import { Tappable } from '../components/Tappable';
import { useAppStore } from '../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../theme';
import { TabIcon } from './TabIcons';
import { MainTabParamList } from './types';

/** Dock slots left→right; `null` is the centre `+`. Bookings has no slot, it
 *  is reached from the + menu, Home and More. */
const SLOTS: (keyof MainTabParamList | null)[] = ['HomeTab', 'QuotesTab', null, 'CommunityTab', 'MoreTab'];

export const DOCK_HEIGHT = 66;
export const DOCK_INSET = 16;
const PLUS_SIZE = 62;
/** The + button sits 16px above the pill's top edge. */
const PLUS_LIFT = (DOCK_HEIGHT - PLUS_SIZE) / 2 + 16;

interface DockAction {
  key: string;
  title: string;
  icon: IconName;
  color: string;
  glyphColor?: string;
  onPress: () => void;
}

/**
 * Floating pill dock (canvas "Tabs & system"): 66px tall, 16px inset from the
 * screen edges. Active tab = highlighted glyph + blue dot. The centre `+` fans
 * its three actions out above itself (no bottom sheet): the + turns into an ×
 * while they're open, and × (or a tap anywhere else) folds them back.
 */
export function Dock({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors, dark } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setPendingAuth = useAppStore((s) => s.setPendingAuth);
  const setServiceTypePick = useAppStore((s) => s.setServiceTypePick);
  const activeName = state.routes[state.index]?.name;

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

  // Fan-out animation: 0 = folded (plus), 1 = open (× + three rows).
  const fan = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (open) {
      fan.setValue(0);
      Animated.spring(fan, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 22, bounciness: 7 }).start();
    }
  }, [open, fan]);
  const close = () => setOpen(false);

  const actions: DockAction[] = [
    {
      key: 'estimate',
      title: 'New AI estimate',
      icon: 'camera',
      color: palette.teal,
      // Guests get the guest / join gate first; Home resumes the picker after Join.
      onPress: () => (isAuthenticated ? openInHome('CarDiagram') : setGateOpen(true)),
    },
    {
      key: 'maintenance',
      title: 'Book maintenance',
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
      icon: 'calendar',
      color: palette.amber,
      onPress: () => go('BookingsTab'),
    },
  ];

  const plusButton = (onPress: () => void, label: string, rotate: Animated.AnimatedInterpolation<string> | '0deg') => (
    <Tappable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={{
        width: PLUS_SIZE,
        height: PLUS_SIZE,
        borderRadius: PLUS_SIZE / 2,
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
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon name="plus" size={34} color={palette.primary} strokeWidth={2.4} />
      </Animated.View>
    </Tappable>
  );

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
          {SLOTS.map((name) => {
            if (!name) {
              return (
                <View key="plus" style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: DOCK_HEIGHT, paddingBottom: PLUS_LIFT }}>
                  {plusButton(() => setOpen(true), 'Open actions', '0deg')}
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
                <View style={{ width: 5, height: 5, borderRadius: 3, marginTop: 5, backgroundColor: active ? palette.primary : 'transparent' }} />
              </Tappable>
            );
          })}
        </View>
      </View>

      {/* Fan-out menu: dims the screen, shows the × in the +'s place and the three actions above it. */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Tappable noFeedback onPress={close} accessibilityLabel="Close actions" style={{ flex: 1, backgroundColor: colors.backdrop }}>
          <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: bottom + PLUS_LIFT, alignItems: 'center' }}>
            <View style={{ width: Math.min(340, screenW - 2 * DOCK_INSET - 8), gap: 10, marginBottom: 18 }}>
              {actions.map((a, i) => {
                // Rows nearest the button appear first.
                const order = actions.length - 1 - i;
                return (
                  <Animated.View
                    key={a.key}
                    style={{
                      opacity: fan,
                      transform: [
                        { translateY: fan.interpolate({ inputRange: [0, 1], outputRange: [28 + order * 22, 0] }) },
                        { scale: fan.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                      ],
                    }}
                  >
                    <Tappable
                      onPress={() => {
                        close();
                        a.onPress();
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={a.title}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        backgroundColor: colors.sheet,
                        borderWidth: 1,
                        borderColor: `${a.color}66`,
                        borderRadius: radii.xl,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        shadowColor: '#000',
                        shadowOpacity: dark ? 0.5 : 0.18,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 8,
                      }}
                    >
                      <IconChip name={a.icon} size={48} glyph={26} bg={a.color} color={a.glyphColor ?? colors.sheet} radius={14} />
                      <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{a.title}</Text>
                    </Tappable>
                  </Animated.View>
                );
              })}
            </View>
            {plusButton(close, 'Close actions', fan.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }))}
          </View>
        </Tappable>
      </Modal>

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
