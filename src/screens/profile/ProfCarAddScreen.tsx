import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Dropdown } from '../../components/Dropdown';
import { LiveCamera } from '../../components/LiveCamera';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { Card, Screen } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { vehiclesService } from '../../services';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfCarAdd'>;

const YEARS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => String(2026 - i));

const BRANDS = [
  'Honda', 'Toyota', 'Subaru', 'Ford', 'Chevrolet', 'Nissan', 'Mazda', 'Hyundai',
  'Kia', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Tesla', 'Jeep', 'Lexus',
  'Acura', 'GMC', 'Ram', 'Dodge', 'Volvo', 'Porsche',
];

const MODELS_BY_BRAND: Record<string, string[]> = {
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'HR-V'],
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
  Subaru: ['Outback', 'Forester', 'Crosstrek', 'Impreza'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang'],
  Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Traverse'],
  Nissan: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Frontier'],
  Mazda: ['Mazda3', 'CX-5', 'CX-30', 'CX-9', 'MX-5 Miata'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona'],
  Kia: ['Forte', 'Sorento', 'Sportage', 'Telluride', 'Soul'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', 'X1'],
  Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
  Audi: ['A4', 'A6', 'Q5', 'Q7', 'Q3'],
  Volkswagen: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  Jeep: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Gladiator'],
  Lexus: ['ES', 'RX', 'NX', 'IS', 'GX'],
  Acura: ['MDX', 'RDX', 'TLX', 'Integra'],
  GMC: ['Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon'],
  Ram: ['1500', '2500', '3500', 'ProMaster'],
  Dodge: ['Charger', 'Challenger', 'Durango', 'Hornet'],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90'],
  Porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
};

const GENERIC_MODELS = ['Base', 'Sport', 'Touring', 'Limited', 'Premium'];

const TRIMS = ['Base', 'S', 'SE', 'SEL', 'LE', 'XLE', 'LX', 'EX', 'EX-L', 'Sport', 'Touring', 'Limited', 'Premium', 'Platinum', 'Titanium'];

const COLORS = [
  'White', 'Black', 'Silver', 'Gray', 'Lunar Silver Metallic', 'Blue', 'Red', 'Green', 'Beige',
];

const OIL_SPECS = [
  '0W-20', '5W-20 Full Synthetic', '5W-30 Full Synthetic', '5W-30 Conventional', '10W-30',
];

/** Wireframe s-prof-car-add: add a vehicle (same fields as the registered car). */
export function ProfCarAddScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<'scan' | 'manual'>('manual');
  const [vinScanned, setVinScanned] = useState(false);

  const [year, setYear] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [odometer, setOdometer] = useState('');
  const [oilSpec, setOilSpec] = useState('');

  const modelOptions = brand ? MODELS_BY_BRAND[brand] ?? GENERIC_MODELS : [];

  const name = [year, brand, model, trim].map((s) => s.trim()).filter(Boolean).join(' ');
  const canSave = brand.trim().length > 0 && model.trim().length > 0;

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

  const method = (
    emoji: string,
    title: string,
    sub: string,
    value: 'scan' | 'manual',
  ) => {
    const active = mode === value;
    return (
      <Tappable
        onPress={() => setMode(value)}
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
      </Tappable>
    );
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {method('📷', 'Scan VIN barcode', 'Auto-fill in seconds', 'scan')}
        {method('✍️', 'Enter manually', 'Type details below', 'manual')}
      </View>

      {mode === 'scan' ? (
        <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
          <LiveCamera
            height={180}
            shutterLabel="Scan VIN"
            onCapture={() => {
              setVinScanned(true);
            }}
          />
          {vinScanned ? (
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success, textAlign: 'center' }}>
              VIN captured ✓ — fill in details below
            </Text>
          ) : (
            <Text style={{ fontSize: 11, color: colors.textTertiary, textAlign: 'center' }}>
              Point the camera at the VIN barcode, then tap Scan VIN.
            </Text>
          )}
        </Card>
      ) : null}

      {mode === 'manual' || vinScanned ? (
        <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Dropdown label="Year" value={year} options={YEARS} onChange={setYear} placeholder="2019" />
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown
                label="Brand"
                value={brand}
                options={BRANDS}
                placeholder="Honda"
                onChange={(b) => {
                  setBrand(b);
                  setModel('');
                }}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Dropdown
                label="Model"
                value={model}
                options={modelOptions}
                onChange={setModel}
                disabled={!brand}
                placeholder={brand ? 'Accord' : 'Select brand first'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown label="Trim" value={trim} options={TRIMS} onChange={setTrim} placeholder="EX-L" />
            </View>
          </View>
          <Dropdown label="Color" value={color} options={COLORS} onChange={setColor} placeholder="Lunar Silver Metallic" />
          <TextField label="VIN" value={vin} onChangeText={setVin} placeholder="Enter or scan VIN" autoCapitalize="characters" />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <TextField label="Odometer (mi)" value={odometer} onChangeText={(t) => setOdometer(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" />
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown label="Oil spec" value={oilSpec} options={OIL_SPECS} onChange={setOilSpec} placeholder="5W-30 Full Synthetic" />
            </View>
          </View>
        </Card>
      ) : null}

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
