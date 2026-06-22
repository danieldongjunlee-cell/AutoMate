import React from 'react';
import { Modal, Text, View } from 'react-native';

import { Tappable } from './Tappable';
import { useAppStore } from '../store/useAppStore';
import { radii, spacing, useTheme } from '../theme';

/**
 * One-time "Allow location?" prompt (shown on first Home load). Granting lets the
 * maps show the user's position; the choice is remembered in the store.
 */
export function LocationPermissionSheet() {
  const { colors } = useTheme();
  const permission = useAppStore((s) => s.locationPermission);
  const setPermission = useAppStore((s) => s.setLocationPermission);

  return (
    <Modal
      visible={permission === 'unasked'}
      transparent
      animationType="fade"
      onRequestClose={() => setPermission('denied')}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'center', padding: spacing.xl }}>
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg }}>
          <Text style={{ fontSize: 34, textAlign: 'center', marginBottom: spacing.sm }}>📍</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 6 }}>
            Allow “AutoMate” to use your location?
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg }}>
            Your location is used to show nearby shops and your position on the map. You can change
            this anytime in Settings.
          </Text>
          <Tappable
            onPress={() => setPermission('granted')}
            style={{ backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 13, alignItems: 'center', marginBottom: spacing.sm }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.onPrimary }}>Allow while using the app</Text>
          </Tappable>
          <Tappable onPress={() => setPermission('denied')} style={{ paddingVertical: 11, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.textTertiary }}>Don’t allow</Text>
          </Tappable>
        </View>
      </View>
    </Modal>
  );
}
