import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { Card, Screen } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { vehiclesService } from '../../services';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfCarAdd'>;

/** Wireframe s-prof-car-add: add a vehicle (same fields as the registered car). */
export function ProfCarAddScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [odometer, setOdometer] = useState('');
  const [oilSpec, setOilSpec] = useState('');

  const name = [year, make, model, trim].map((s) => s.trim()).filter(Boolean).join(' ');
  const canSave = make.trim().length > 0 && model.trim().length > 0;

  const addMutation = useMutation({
    mutationFn: () =>
      vehiclesService.addVehicle({
        name,
        colorName: color.trim() || undefined,
        vin: vin.trim() || undefined,
        odometerMi: Number(odometer || 0),
        oilSpec: oilSpec.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      navigation.goBack();
    },
  });

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
          <View style={{ flex: 1 }}>
            <TextField label="Year" value={year} onChangeText={(t) => setYear(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="2019" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Make" value={make} onChangeText={setMake} placeholder="Honda" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <TextField label="Model" value={model} onChangeText={setModel} placeholder="Accord" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Trim" value={trim} onChangeText={setTrim} placeholder="EX-L" />
          </View>
        </View>
        <TextField label="Color" value={color} onChangeText={setColor} placeholder="Lunar Silver Metallic" />
        <TextField label="VIN" value={vin} onChangeText={setVin} placeholder="Enter or scan VIN" autoCapitalize="characters" />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <TextField label="Odometer (mi)" value={odometer} onChangeText={(t) => setOdometer(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Oil spec" value={oilSpec} onChangeText={setOilSpec} placeholder="5W-30 Full Synthetic" />
          </View>
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
      <PrimaryButton variant="success" label="Add car" disabled={!canSave} loading={addMutation.isPending} onPress={() => addMutation.mutate()} />
    </Screen>
  );
}
