import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfCarAdd'>;

/** Wireframe s-prof-car-add: add a vehicle (same fields as the registered car). */
export function ProfCarAddScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const field = (label: string, value: string) => (
    <View style={{ paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: colors.divider }}>
      <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textPlaceholder }}>{value}</Text>
    </View>
  );

  const method = (emoji: string, title: string, sub: string, active?: boolean) => (
    <View
      style={{
        flex: 1,
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? colors.success : colors.border,
        backgroundColor: active ? colors.primarySurface : colors.surface,
        borderRadius: radii.md,
        padding: spacing.sm,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text style={{ fontSize: 12, fontWeight: '700', color: active ? colors.primary : colors.textSecondary }}>{title}</Text>
      <Text style={{ fontSize: 10, color: colors.textTertiary }}>{sub}</Text>
    </View>
  );

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {method('📷', 'Scan VIN barcode', 'Auto-fill in seconds', true)}
        {method('✍️', 'Enter manually', 'Type details below')}
      </View>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>{field('Year', '2019')}</View>
          <View style={{ flex: 1 }}>{field('Make', 'Honda')}</View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>{field('Model', 'Accord')}</View>
          <View style={{ flex: 1 }}>{field('Trim', 'EX-L')}</View>
        </View>
        {field('Color', 'Lunar Silver Metallic')}
        {field('VIN', 'Enter or scan VIN')}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>{field('Odometer', '0 mi')}</View>
          <View style={{ flex: 1 }}>{field('Oil spec', '5W-30 Full Synthetic')}</View>
        </View>
      </Card>
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderColor: colors.primaryLight,
          borderWidth: 1,
          borderRadius: radii.sm,
          padding: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 11, color: colors.primary }}>
          ⓘ Same details we keep for your registered cars — used to match quotes and track service.
        </Text>
      </View>
      <PrimaryButton variant="success" label="Add car" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
