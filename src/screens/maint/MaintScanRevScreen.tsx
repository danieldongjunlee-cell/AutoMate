import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PointsBadge } from '../../components/FilterChips';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { EARN_RULES, pointsToUsd } from '../../config/points';
import { MaintStackParamList } from '../../navigation/types';
import { SCANNED_RECEIPT, ScannedReceipt } from '../../services/mock/data';
import { maintService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintScanRev'>;
type Route = RouteProp<MaintStackParamList, 'MaintScanRev'>;

const FIELDS: { key: keyof ScannedReceipt; label: string }[] = [
  { key: 'serviceType', label: 'Service type' },
  { key: 'shop', label: 'Shop' },
  { key: 'date', label: 'Date' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'amount', label: 'Amount' },
];

/** Wireframe s-maint-scan-rev: verify parsed receipt fields, save → history. */
export function MaintScanRevScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const addPoints = useAppStore((s) => s.addPoints);
  const [saving, setSaving] = useState(false);
  // Fields extracted by the scan service (mock OCR or damage-ai /receipt);
  // the constant covers deep links that skip the scan step.
  const receipt = route.params?.receipt ?? SCANNED_RECEIPT;
  const receiptUri = route.params?.receiptUri;

  const onSave = async () => {
    setSaving(true);
    const { pointsEarned } = await maintService.saveServiceRecord(
      {
        // "Oil change — synthetic" → history row type "Oil change"
        type: receipt.serviceType.split('—')[0].trim() || 'Service',
        shop: receipt.shop,
        // "Mar 12, 2025" → dateLabel "Mar 12" + year 2025
        dateLabel: receipt.date.split(',')[0].trim(),
        year: Number(receipt.date.match(/\d{4}/)?.[0] ?? new Date().getFullYear()),
        mileage: receipt.mileage,
        cost: Number(receipt.amount.replace(/[^0-9.]/g, '')) || 0,
        // Keep the scanned receipt image so it shows in the history list.
        receiptUri,
      },
      'scan',
    );
    addPoints(pointsEarned, 'Scanned receipt');
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
        <PointsBadge points={EARN_RULES.scanReceipt} usd />
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
                fontSize: 12,
                color: colors.textTertiary,
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              {label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
                {receipt[key]}
              </Text>
              <Tappable
                onPress={() => Alert.alert('Edit field', 'Field editing arrives with real OCR.')}
                hitSlop={8}
              >
                <Text style={{ fontSize: 14, color: colors.primary }}>Edit</Text>
              </Tappable>
            </View>
          </View>
        ))}
      </Card>

      <PrimaryButton
        label={`Save to history → earn +${EARN_RULES.scanReceipt} pts (${pointsToUsd(EARN_RULES.scanReceipt)})`}
        loading={saving}
        onPress={onSave}
      />
    </Screen>
  );
}
