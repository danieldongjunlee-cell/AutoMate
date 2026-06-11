import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PointsBadge } from '../../components/FilterChips';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { SCANNED_RECEIPT } from '../../services/mock/data';
import { maintService } from '../../services/mock/maintService';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintScanRev'>;

const FIELDS: { key: keyof typeof SCANNED_RECEIPT; label: string }[] = [
  { key: 'serviceType', label: 'Service type' },
  { key: 'shop', label: 'Shop' },
  { key: 'date', label: 'Date' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'amount', label: 'Amount' },
];

/** Wireframe s-maint-scan-rev: verify parsed receipt fields, save → history. */
export function MaintScanRevScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const addPoints = useAppStore((s) => s.addPoints);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    const { pointsEarned } = await maintService.saveServiceRecord(
      {
        type: 'Oil change',
        shop: SCANNED_RECEIPT.shop,
        dateLabel: 'Mar 12',
        year: 2025,
        mileage: SCANNED_RECEIPT.mileage,
        cost: 49,
      },
      'scan',
    );
    addPoints(pointsEarned);
    // Fire-and-forget: the history screen refetches while we navigate.
    queryClient.invalidateQueries({ queryKey: ['service-history'] });
    setSaving(false);
    navigation.navigate('MaintHistory');
  };

  return (
    <Screen>
      {/* Scan success banner */}
      <View
        style={{
          backgroundColor: colors.successSurface,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.success,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 18 }}>✅</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.successDeep }}>
          Scanned — verify below
        </Text>
        <PointsBadge points={20} />
      </View>

      {/* Parsed fields */}
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {FIELDS.map(({ key, label }, i) => (
          <View
            key={key}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderBottomWidth: i < FIELDS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              {label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
                {SCANNED_RECEIPT[key]}
              </Text>
              <Pressable
                onPress={() => Alert.alert('Edit field', 'Field editing arrives with real OCR.')}
                hitSlop={8}
              >
                <Text style={{ fontSize: 13, color: colors.primary }}>Edit</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </Card>

      <PrimaryButton label="Save to history → earn +20 pts" loading={saving} onPress={onSave} />
    </Screen>
  );
}
