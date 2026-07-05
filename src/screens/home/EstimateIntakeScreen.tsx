import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Dropdown } from '../../components/Dropdown';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SubmitProgress } from '../../components/SubmitProgress';
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

/** Common models per brand → the Model field becomes a dropdown filtered by the
 *  selected brand (consistent values instead of free text). */
const MODELS_BY_BRAND: Record<string, string[]> = {
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V', 'Odyssey', 'Ridgeline', 'Passport'],
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', '4Runner', 'Prius', 'Sienna'],
  Subaru: ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Legacy', 'Ascent', 'WRX'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang', 'Edge', 'Bronco', 'Ranger', 'Expedition'],
  Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Traverse', 'Camaro', 'Colorado', 'Blazer'],
  Nissan: ['Altima', 'Rogue', 'Sentra', 'Pathfinder', 'Murano', 'Frontier', 'Kicks', 'Maxima'],
  Mazda: ['CX-5', 'Mazda3', 'CX-30', 'CX-9', 'Mazda6', 'MX-5 Miata', 'CX-50'],
  Hyundai: ['Elantra', 'Tucson', 'Santa Fe', 'Sonata', 'Kona', 'Palisade', 'Venue'],
  Kia: ['Sportage', 'Sorento', 'Forte', 'Telluride', 'Soul', 'Seltos', 'Carnival', 'K5'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', 'X1', '4 Series', 'X7', '2 Series'],
  Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class', 'GLA', 'S-Class', 'GLB'],
  Audi: ['A4', 'Q5', 'A3', 'Q7', 'A6', 'Q3', 'A5', 'Q8'],
  Volkswagen: ['Jetta', 'Tiguan', 'Atlas', 'Passat', 'Golf', 'Taos', 'ID.4'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  Jeep: ['Grand Cherokee', 'Wrangler', 'Cherokee', 'Compass', 'Gladiator', 'Renegade', 'Wagoneer'],
  Lexus: ['RX', 'NX', 'ES', 'GX', 'IS', 'UX', 'TX'],
  Acura: ['MDX', 'RDX', 'TLX', 'Integra', 'ILX'],
  GMC: ['Sierra', 'Acadia', 'Terrain', 'Yukon', 'Canyon'],
  Ram: ['1500', '2500', '3500', 'ProMaster'],
  Dodge: ['Charger', 'Challenger', 'Durango', 'Hornet'],
  Volvo: ['XC90', 'XC60', 'XC40', 'S60', 'V60'],
  Porsche: ['Macan', 'Cayenne', '911', 'Panamera', 'Taycan'],
};
const modelsForBrand = (brand: string): string[] => MODELS_BY_BRAND[brand] ?? [];

/** Canonical service locations (NoVA) — typing a city / county / ZIP filters
 *  this list so every user stores the exact same location string. */
const LOCATIONS = [
  'Fairfax, VA', 'Arlington, VA', 'Alexandria, VA', 'Vienna, VA', 'Falls Church, VA',
  'Reston, VA', 'Herndon, VA', 'McLean, VA', 'Annandale, VA', 'Springfield, VA',
  'Burke, VA', 'Centreville, VA', 'Chantilly, VA', 'Tysons, VA', 'Oakton, VA',
  'Fairfax County, VA', 'Arlington County, VA', 'Loudoun County, VA', 'Prince William County, VA',
  '22030', '22031', '22033', '22042', '22101', '22180', '22201', '22314', '20170', '20191',
];

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

/** Location autocomplete: typing a city / county / ZIP filters the canonical
 *  list so the stored value is consistent across users. */
function LocationField({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const q = query.trim().toLowerCase();
  const matches = q.length >= 1 ? LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 6) : [];
  return (
    <View>
      <TextField
        label="Service location"
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          setOpen(true);
          if (value) onSelect(''); // re-typing clears the confirmed pick
        }}
        placeholder="City, county or ZIP — e.g. Fairfax, VA"
      />
      {open && matches.length > 0 ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            overflow: 'hidden',
            marginTop: -spacing.xs,
            marginBottom: spacing.sm,
          }}
        >
          {matches.map((m, i) => (
            <Tappable
              key={m}
              onPress={() => {
                onSelect(m);
                setQuery(m);
                setOpen(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: 11,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.divider,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>📍</Text>
              <Text style={{ fontSize: 14, color: colors.textPrimary }}>{m}</Text>
            </Tappable>
          ))}
        </View>
      ) : null}
      {value && (!open || matches.length === 0) ? (
        <Text style={{ fontSize: 12, color: colors.successDark, marginTop: 2 }}>✓ {value}</Text>
      ) : null}
    </View>
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
      needsPickup,
    });
    // Hold the car. New users (guests) sign up at submit, where this is saved;
    // signed-in users without a car on file get it saved right now.
    setPendingVehicle({ name, colorName: color });
    if (isAuthenticated) {
      setSaving(true);
      try {
        const { vehicle } = await vehiclesService.addVehicle({ name, colorName: color });
        await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        // The parts being drafted belong to this just-added car.
        setActiveVehicle(vehicle.id, { carrySubmission: true });
        setPendingVehicle(null);
      } finally {
        setSaving(false);
      }
    }
    navigation.navigate('ConfirmSubmit');
  };

  return (
    <Screen>
      <SubmitProgress step={1} left="Your car details" right="Step 1 of 3" />
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 }}>
        Tell us about your car
      </Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.md }}>
        We need a few details to get accurate quotes from shops near you.
      </Text>

      {/* 1 — Car info (always shown). Model is a dropdown filtered by brand. */}
      <Section n={1} title="Your car" subtitle="Brand, model, year & color">
        <Dropdown
          label="Brand"
          value={brand}
          options={CAR_BRANDS}
          onChange={(b) => {
            setBrand(b);
            setModel(''); // reset the model when the brand changes
          }}
          placeholder="Select brand"
          containerStyle={{ marginBottom: spacing.sm }}
        />
        {modelsForBrand(brand).length > 0 ? (
          <Dropdown
            label="Model"
            value={model}
            options={modelsForBrand(brand)}
            onChange={setModel}
            placeholder={brand ? `Select a ${brand} model` : 'Select a model'}
            containerStyle={{ marginBottom: spacing.sm }}
          />
        ) : (
          <TextField
            label="Model"
            value={model}
            onChangeText={setModel}
            placeholder={brand ? 'Enter your model' : 'Select a brand first'}
            editable={!!brand}
            containerStyle={{ marginBottom: spacing.sm }}
          />
        )}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Dropdown label="Year" value={year} options={YEARS} onChange={setYear} placeholder="Year" containerStyle={{ flex: 1 }} />
          <Dropdown label="Color" value={color} options={COLORS} onChange={setColor} placeholder="Color" containerStyle={{ flex: 1 }} />
        </View>
      </Section>

      {/* 2 — Location (expands once the car is filled in) */}
      {carDone ? (
        <Section n={2} title="Where are you?" subtitle="So we can find shops near you">
          <LocationField value={location} onSelect={setLocation} />
        </Section>
      ) : null}

      {/* 3 — Insurance + optional rental & pick-up (separate, both optional) */}
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
            onChange={setIsRental}
          />
          <ToggleRow
            label="Requires pick-up"
            sub="Optional — a shop collects the car instead of you dropping it off"
            value={needsPickup}
            onChange={setNeedsPickup}
          />
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
