import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PointsBadge } from '../../components/FilterChips';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { MaintStackParamList } from '../../navigation/types';
import { MANUAL_SERVICE_TYPES } from '../../services/mock/data';
import { maintService } from '../../services/mock/maintService';
import { useAppStore } from '../../store/useAppStore';
import { Screen } from '../../components/ui';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintManual'>;

/** Wireframe s-maint-manual: type chips + shop/date/mileage/cost form. */
export function MaintManualScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const addPoints = useAppStore((s) => s.addPoints);

  const [serviceType, setServiceType] = useState(MANUAL_SERVICE_TYPES[0]);
  const [shop, setShop] = useState('AutoFix Pro');
  const [date, setDate] = useState('Mar 12, 2025');
  const [mileage, setMileage] = useState('44,500 mi');
  const [cost, setCost] = useState('49.00');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    const { pointsEarned } = await maintService.saveServiceRecord(
      {
        type: serviceType,
        shop,
        dateLabel: date.replace(/, \d{4}$/, ''),
        year: Number(date.match(/\d{4}$/)?.[0] ?? 2025),
        mileage,
        cost: parseFloat(cost) || 0,
      },
      'manual',
    );
    addPoints(pointsEarned);
    // Fire-and-forget: the history screen refetches while we navigate.
    queryClient.invalidateQueries({ queryKey: ['service-history'] });
    setSaving(false);
    navigation.navigate('MaintHistory');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>✏️ Manual entry</Text>
        </View>
        <PointsBadge points={10} />
      </View>

      {/* Service type chips */}
      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 6 }}>
        Service type
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
        {MANUAL_SERVICE_TYPES.map((type) => {
          const on = type === serviceType;
          return (
            <Pressable
              key={type}
              onPress={() => setServiceType(type)}
              style={({ pressed }) => ({
                backgroundColor: on ? colors.primary : colors.surface,
                borderRadius: radii.pill,
                borderWidth: on ? 0 : StyleSheet.hairlineWidth,
                borderColor: colors.border,
                paddingHorizontal: 14,
                paddingVertical: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 13, color: on ? colors.onPrimary : colors.textTertiary }}>
                {type}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextField label="Shop name" value={shop} onChangeText={setShop} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <TextField label="Date" value={date} onChangeText={setDate} containerStyle={{ flex: 1 }} />
        <TextField
          label="Mileage"
          value={mileage}
          onChangeText={setMileage}
          containerStyle={{ flex: 1 }}
        />
      </View>
      <TextField label="Cost ($)" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />

      <PrimaryButton
        label="Save service record → earn +10 pts"
        loading={saving}
        onPress={onSave}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
