import React from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';

import { Text } from './Text';

import { Tappable } from './Tappable';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';

/**
 * One-time location prompt on first Home load, styled like the iOS system
 * alert: centred card, title + explanation, then "Allow While Using App",
 * "Allow Once" and "Don't Allow" stacked with hairline separators. Granting
 * lets the maps show the user's position; the choice is remembered.
 */
export function LocationPermissionSheet() {
  const { dark } = useTheme();
  const permission = useAppStore((s) => s.locationPermission);
  const setPermission = useAppStore((s) => s.setLocationPermission);

  // iOS alert colours (system look in both appearances).
  const card = dark ? '#2c2c2e' : '#f2f2f7';
  const text = dark ? '#ffffff' : '#000000';
  const separator = dark ? 'rgba(255,255,255,0.18)' : 'rgba(60,60,67,0.29)';
  const blue = dark ? '#0a84ff' : '#007aff';

  const button = (label: string, onPress: () => void, bold = false) => (
    <Tappable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: separator,
        backgroundColor: pressed ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
      })}
    >
      <Text style={{ fontSize: 17, fontWeight: bold ? '600' : '400', color: blue }}>{label}</Text>
    </Tappable>
  );

  return (
    <Modal visible={permission === 'unasked'} transparent animationType="fade" onRequestClose={() => setPermission('denied')}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View
          accessibilityRole="alert"
          style={{
            width: 270,
            borderRadius: 14,
            backgroundColor: card,
            overflow: 'hidden',
            ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(20px)' } as object) : null),
          }}
        >
          <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 18 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: text, textAlign: 'center', lineHeight: 22, marginBottom: 6 }}>
              Allow “AutoMate” to access your location while you are using the app?
            </Text>
            <Text style={{ fontSize: 13, color: text, textAlign: 'center', lineHeight: 18 }}>
              Your current location will be displayed on the map and used for nearby shops, quotes, and estimated travel times.
            </Text>
          </View>
          {button('Allow While Using App', () => setPermission('granted'), true)}
          {button('Allow Once', () => setPermission('granted'))}
          {button('Don’t Allow', () => setPermission('denied'))}
        </View>
      </View>
    </Modal>
  );
}
