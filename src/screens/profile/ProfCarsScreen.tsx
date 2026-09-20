import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { CarBrandLogo } from '../../components/CarBrandLogo';
import { FormSheet } from '../../components/FormSheet';
import { Icon } from '../../components/Icon';
import { PagedCarousel } from '../../components/PagedCarousel';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SkeletonList } from '../../components/Skeleton';
import { DECK_TEXT, DECK_TEXT_SOFT, DeckButton, StatTile, SwipeCard, SwipeDeck } from '../../components/SwipeCard';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { Screen } from '../../components/ui';
import { brandOf, useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { ProfileStackParamList } from '../../navigation/types';
import { Vehicle, vehiclesService } from '../../services';
import { useCarImage } from '../../services/carImage';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

/** The Honda hero photo (bundled cut-out); other brands use the Car Images API. */
const HONDA_HERO = require('../../../assets/cars/accord-2019.png');

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfCars'>;

interface VehicleFormFields {
  name: string;
  colorName: string;
  vin: string;
  odometerMi: number;
  oilSpec: string;
  lastService: string;
}

/** Inline edit form (modal), the same fields captured when registering a car. */
function VehicleFormModal({
  vehicle,
  visible,
  onClose,
  onSave,
  saving,
}: {
  /** null → "add" mode. */
  vehicle: Vehicle | null;
  visible: boolean;
  onClose: () => void;
  onSave: (fields: VehicleFormFields) => void;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [odometer, setOdometer] = useState('');
  const [oilSpec, setOilSpec] = useState('');
  const [lastService, setLastService] = useState('');

  // Re-seed the fields whenever the modal opens for a different vehicle.
  React.useEffect(() => {
    if (visible) {
      setName(vehicle?.name ?? '');
      setColor(vehicle?.colorName ?? '');
      setVin(vehicle?.vin ?? '');
      setOdometer(vehicle ? String(vehicle.odometerMi) : '');
      setOilSpec(vehicle?.oilSpec ?? '');
      setLastService(vehicle?.lastService && vehicle.lastService !== '-' ? vehicle.lastService : '');
    }
  }, [visible, vehicle]);

  const canSave = name.trim().length > 0;

  return (
    <FormSheet
      visible={visible}
      onClose={onClose}
      title={vehicle ? 'Edit car' : 'Add a car'}
      dismissable={!saving}
    >
      <TextField
        label="Vehicle name"
        value={name}
        onChangeText={setName}
        placeholder="2019 Honda Accord EX-L"
      />
      <TextField label="Color" value={color} onChangeText={setColor} placeholder="Lunar Silver Metallic" />
      <TextField
        label="VIN"
        value={vin}
        onChangeText={setVin}
        placeholder="1HGCV1F34KA01234"
        autoCapitalize="characters"
      />
      <TextField
        label="Odometer (mi)"
        value={odometer}
        onChangeText={(t) => setOdometer(t.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
        placeholder="47230"
      />
      <TextField label="Oil spec" value={oilSpec} onChangeText={setOilSpec} placeholder="5W-30 Full Synthetic" />
      <TextField
        label="Last service"
        value={lastService}
        onChangeText={setLastService}
        placeholder="Mar 12, 2025"
        containerStyle={{ marginBottom: spacing.lg }}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <PrimaryButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <PrimaryButton
          label={vehicle ? 'Save' : 'Add car'}
          disabled={!canSave}
          loading={saving}
          onPress={() =>
            onSave({
              name: name.trim(),
              colorName: color.trim(),
              vin: vin.trim(),
              odometerMi: Number(odometer || 0),
              oilSpec: oilSpec.trim(),
              lastService: lastService.trim(),
            })
          }
          style={{ flex: 1 }}
        />
      </View>
    </FormSheet>
  );
}

/**
 * A registered car as a swipe card: name with an accent underline, the car
 * photo, four stat tiles (odometer, oil, last service, colour) and the
 * active-car action. Edit / Remove sit under the button.
 */
function VehicleCard({
  vehicle,
  isActive,
  onSetActive,
  onEdit,
  onRemove,
}: {
  vehicle: Vehicle;
  isActive: boolean;
  onSetActive: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { dark } = useTheme();
  const brand = brandOf(vehicle.name);
  const isHonda = brand.toLowerCase() === 'honda';
  const { data: apiPhoto } = useCarImage(isHonda ? '' : vehicle.name);
  const [failed, setFailed] = useState(false);
  const photo = isHonda ? HONDA_HERO : apiPhoto && !failed ? { uri: apiPhoto } : null;
  const year = vehicle.name.match(/\b(19|20)\d{2}\b/)?.[0];

  return (
    <SwipeCard title={vehicle.name} badge={isActive ? 'Active car' : vehicle.isPrimary ? 'Primary' : undefined}>
      <View style={{ height: 150, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.sm }}>
        {photo ? (
          <Image
            source={photo}
            onError={() => setFailed(true)}
            accessibilityLabel={`${vehicle.name} photo`}
            resizeMode="contain"
            style={{ width: '100%', height: 150, shadowColor: '#000', shadowOpacity: dark ? 0.5 : 0, shadowRadius: 18, shadowOffset: { width: 0, height: 14 } }}
          />
        ) : (
          <CarBrandLogo brand={brand} size={120} bg="transparent" />
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <StatTile icon="gauge" color={palette.primaryLight} value={`${vehicle.odometerMi.toLocaleString()}`} label="miles" />
        <StatTile icon="oil" color={palette.amber} value={(vehicle.oilSpec || '-').split(' ')[0]} label="oil" />
        <StatTile icon="calendar" color={palette.teal} value={vehicle.lastService && vehicle.lastService !== '-' ? vehicle.lastService.split(',')[0] : '-'} label="serviced" />
        <StatTile icon="palette" color={palette.lavender} value={year ?? (vehicle.colorName || '-').split(' ')[0]} label={year ? 'year' : 'colour'} />
      </View>
      <DeckButton label={isActive ? 'Active car ✓' : 'Set as active car'} secondary={isActive} disabled={isActive} onPress={onSetActive} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.md }}>
        <Tappable onPress={onEdit} hitSlop={8} accessibilityLabel={`Edit ${vehicle.name}`}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: DECK_TEXT }}>Edit car</Text>
        </Tappable>
        <Tappable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${vehicle.name}`}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffb4b1' }}>Remove</Text>
        </Tappable>
      </View>
    </SwipeCard>
  );
}

/** My cars: swipe through the garage (active car first), then "Add a car". */
export function ProfCarsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const requireAuth = useRequireAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: vehicles, isLoading } = useQuery({ queryKey: ['vehicles'], queryFn: vehiclesService.listVehicles });

  // The globally active car drives highlight + ordering; the button switches it.
  const { active } = useActiveVehicle();
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  const sortedVehicles = [...(vehicles ?? [])].sort((a, b) => (a.id === active?.id ? -1 : b.id === active?.id ? 1 : 0));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  const saveMutation = useMutation({
    mutationFn: async (fields: VehicleFormFields) => (editing ? vehiclesService.updateVehicle(editing.id, fields) : vehiclesService.addVehicle(fields)),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
  });
  const removeMutation = useMutation({ mutationFn: (id: string) => vehiclesService.removeVehicle(id), onSuccess: invalidate });

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    setFormOpen(true);
  };
  const onRemove = (vehicle: Vehicle) =>
    confirmAction('Remove car', `Remove ${vehicle.name} from your garage? Its service history stays archived.`, () => removeMutation.mutate(vehicle.id));
  const addCar = () => requireAuth('saveCar', () => navigation.navigate('ProfCarAdd'));

  const addCard = (
    <SwipeCard key="add" title="Add a car" dashed>
      <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
        <Tappable onPress={addCar} accessibilityRole="button" accessibilityLabel="Add another car" style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <Icon name="plus" size={40} color={DECK_TEXT} strokeWidth={2.4} />
        </Tappable>
        <PrimaryButton label="Add another car" onPress={addCar} style={{ alignSelf: 'stretch' }} />
      </View>
    </SwipeCard>
  );

  return (
    <Screen>
      <SwipeDeck
        caption={sortedVehicles.length ? `${sortedVehicles.length} car${sortedVehicles.length !== 1 ? 's' : ''} in your garage · swipe to switch` : 'No cars yet, add your first car'}
      >
        {isLoading ? (
          <SkeletonList variant="card" count={1} tall />
        ) : (
          <PagedCarousel
            items={[
              ...sortedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isActive={vehicle.id === active?.id}
                  onSetActive={() => setActiveVehicle(vehicle.id)}
                  onEdit={() => openEdit(vehicle)}
                  onRemove={() => onRemove(vehicle)}
                />
              )),
              addCard,
            ]}
          />
        )}
      </SwipeDeck>


      <VehicleFormModal vehicle={editing} visible={formOpen} onClose={() => setFormOpen(false)} onSave={(fields) => saveMutation.mutate(fields)} saving={saveMutation.isPending} />
    </Screen>
  );
}
