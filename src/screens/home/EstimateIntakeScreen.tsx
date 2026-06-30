import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Dropdown } from '../../components/Dropdown';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { Tappable } from '../../components/Tappable';
import { Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { vehiclesService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'EstimateIntake'>;

const CAR_BRANDS = [
  'Honda', 'Toyota', 'Subaru', 'Ford', 'Chevrolet', 'Nissan', 'Mazda', 'Hyundai',
  'Kia', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Tesla', 'Jeep', 'Lexus',
  'Acura', 'GMC', 'Ram', 'Dodge', 'Volvo', 'Porsche', 'Other',
];
const YEARS = Array.from({ length: 28 }, (_, i) => String(2027 - i));
const COLORS = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Beige', 'Gold', 'Orange', 'Yellow', 'Other'];

/** A numbered, progressively-revealed section card. */
function Section({
  n,
  title,
  subtitle,
  children,
}: {
  n: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.onPrimary }}>{n}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{title}</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </Card>
  );
}

/** Yes/No segmented control. */
function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {([['Yes', true], ['No', false]] as const).map(([label, v]) => {
        const on = value === v;
        return (
          <Tappable
            key={label}
            onPress={() => onChange(v)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 11,
              borderRadius: radii.sm,
              backgroundColor: on ? colors.primary : colors.surface,
              borderWidth: on ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: on ? colors.onPrimary : colors.textSecondary }}>
              {label}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}

/** A labeled toggle (switch-like) row. */
function ToggleRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
        {sub ? <Text style={{ fontSize: 12, color: colors.textTertiary }}>{sub}</Text> : null}
      </View>
      <View
        style={{
          width: 46,
          height: 28,
          borderRadius: 14,
          backgroundColor: value ? colors.primary : colors.border,
          padding: 3,
          justifyContent: 'center',
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' }} />
      </View>
    </Tappable>
  );
}

/**
 * Shown when a user starts an estimate with no car on file. Captures the car
 * (brand/model/year/color) and then progressively reveals location, then
 * insurance + optional rental/pick-up — everything the shops need to quote.
 */
export function EstimateIntakeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  const setEstimateContext = useAppStore((s) => s.setEstimateContext);
  const setPendingVehicle = useAppStore((s) => s.setPendingVehicle);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [location, setLocation] = useState('');
  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null);
  const [isRental, setIsRental] = useState(false);
  const [needsPickup, setNeedsPickup] = useState(false);
  const [saving, setSaving] = useState(false);

  const carDone = !!(brand && model.trim() && year && color);
  const locationDone = location.trim().length > 0;
  const insuranceDone = hasInsurance !== null;
  const canContinue = carDone && locationDone && insuranceDone && !saving;

  const onContinue = async () => {
    if (!canContinue) return;
    const name = `${year} ${brand} ${model.trim()}`;
    setEstimateContext({
      location: location.trim(),
      hasInsurance,
      isRental,
      needsPickup: isRental && needsPickup,
    });
    // Hold the car. New users (guests) sign up at submit, where this is saved;
    // signed-in users without a car on file get it saved right now.
    setPendingVehicle({ name, colorName: color });
    if (isAuthenticated) {
      setSaving(true);
      try {
        const { vehicle } = await vehiclesService.addVehicle({ name, colorName: color });
        await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        setActiveVehicle(vehicle.id);
        setPendingVehicle(null);
      } finally {
        setSaving(false);
      }
    }
    navigation.navigate('ConfirmSubmit');
  };

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 }}>
        Tell us about your car
      </Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.md }}>
        We need a few details to get accurate quotes from shops near you.
      </Text>

      {/* 1 — Car info (always shown) */}
      <Section n={1} title="Your car" subtitle="Brand, model, year & color">
        <Dropdown label="Brand" value={brand} options={CAR_BRANDS} onChange={setBrand} placeholder="Select brand" containerStyle={{ marginBottom: spacing.sm }} />
        <TextField label="Model" value={model} onChangeText={setModel} placeholder="e.g. Accord EX-L" containerStyle={{ marginBottom: spacing.sm }} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Dropdown label="Year" value={year} options={YEARS} onChange={setYear} placeholder="Year" containerStyle={{ flex: 1 }} />
          <Dropdown label="Color" value={color} options={COLORS} onChange={setColor} placeholder="Color" containerStyle={{ flex: 1 }} />
        </View>
      </Section>

      {/* 2 — Location (expands once the car is filled in) */}
      {carDone ? (
        <Section n={2} title="Where are you?" subtitle="So we can find shops near you">
          <TextField
            label="Service location"
            value={location}
            onChangeText={setLocation}
            placeholder="City or ZIP — e.g. Fairfax, VA"
          />
        </Section>
      ) : null}

      {/* 3 — Insurance + rental/pick-up (expands once location is filled in) */}
      {carDone && locationDone ? (
        <Section n={3} title="Insurance & pick-up" subtitle="Helps shops quote the right way">
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs }}>
            Do you have insurance?
          </Text>
          <YesNo value={hasInsurance} onChange={setHasInsurance} />

          <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm }} />

          <ToggleRow
            label="This is a rental car"
            sub="Optional"
            value={isRental}
            onChange={(v) => {
              setIsRental(v);
              if (!v) setNeedsPickup(false);
            }}
          />
          {isRental ? (
            <ToggleRow
              label="Requires pick-up"
              sub="A shop collects the car instead of you dropping it off"
              value={needsPickup}
              onChange={setNeedsPickup}
            />
          ) : null}
        </Section>
      ) : null}

      <PrimaryButton
        label={
          !carDone
            ? 'Fill in your car details'
            : !locationDone
              ? 'Add your location'
              : !insuranceDone
                ? 'Insurance — Yes or No'
                : 'Continue →'
        }
        disabled={!canContinue}
        loading={saving}
        onPress={onContinue}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
