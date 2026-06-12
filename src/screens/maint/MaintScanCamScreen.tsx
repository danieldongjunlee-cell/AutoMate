import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PointsBadge } from '../../components/FilterChips';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { EARN_RULES } from '../../config/points';
import { MaintStackParamList } from '../../navigation/types';
import { maintService } from '../../services';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintScanCam'>;

const BRACKETS = [
  { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 },
  { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2 },
  { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2 },
  { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2 },
] as const;

/** Mock receipt scanner; swaps to expo-camera when capture is wired. */
export function MaintScanCamScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [scanning, setScanning] = useState(false);

  const onReview = async () => {
    setScanning(true);
    try {
      // Mock: canonical receipt after a delay. API: POST /maintenance/scan,
      // which forwards to the damage-ai /receipt OCR endpoint.
      const receipt = await maintService.scanReceipt();
      navigation.navigate('MaintScanRev', { receipt });
    } finally {
      setScanning(false);
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>📷 Receipt scanner</Text>
        </View>
        <PointsBadge points={EARN_RULES.scanReceipt} usd />
      </View>

      {/* Viewfinder */}
      <View
        style={{
          backgroundColor: '#111',
          borderRadius: radii.md,
          height: 190,
          marginBottom: spacing.sm,
          overflow: 'hidden',
        }}
      >
        {BRACKETS.map((pos, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: 30,
              height: 30,
              borderColor: colors.primary,
              borderRadius: 2,
              ...pos,
            }}
          />
        ))}
        <View
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            top: '40%',
            height: 2,
            backgroundColor: colors.primary,
            opacity: 0.8,
          }}
        />
        <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 11,
              color: colors.primaryLight,
              backgroundColor: 'rgba(0,0,0,.55)',
              paddingHorizontal: 12,
              paddingVertical: 3,
              borderRadius: radii.pill,
              overflow: 'hidden',
            }}
          >
            Scanning...
          </Text>
        </View>
      </View>

      {/* Tips */}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 16 }}>💡</Text>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.warningDeep, marginBottom: 2 }}>
            Tips
          </Text>
          <Text style={{ fontSize: 12, color: colors.warningDeep, opacity: 0.85 }}>
            Lay flat · Good lighting · Keep text visible
          </Text>
        </View>
      </View>

      <PrimaryButton label="📷 Capture receipt" style={{ marginBottom: spacing.sm }} />
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.sm,
          paddingVertical: 12,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>🗂 Gallery instead</Text>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>← Retake</Text>
        </Pressable>
        <PrimaryButton label="Review scan →" loading={scanning} onPress={onReview} style={{ flex: 2 }} />
      </View>
    </Screen>
  );
}
