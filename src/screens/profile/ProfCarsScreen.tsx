import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FormSheet } from '../../components/FormSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { Badge, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { ProfileStackParamList } from '../../navigation/types';
import { Vehicle, vehiclesService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfCars'>;

/** Inline edit/add form (modal) — name + odometer, the editable demo fields. */
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
  onSave: (fields: { name: string; odometerMi: number }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [odometer, setOdometer] = useState('');

  // Re-seed the fields whenever the modal opens for a different vehicle.
  React.useEffect(() => {
    if (visible) {
      setName(vehicle?.name ?? '');
      setOdometer(vehicle ? String(vehicle.odometerMi) : '');
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
      <TextField
        label="Odometer (mi)"
        value={odometer}
        onChangeText={(t) => setOdometer(t.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
        placeholder="47230"
        containerStyle={{ marginBottom: spacing.lg }}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <PrimaryButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <PrimaryButton
          label={vehicle ? 'Save' : 'Add car'}
          disabled={!canSave}
          loading={saving}
          onPress={() => onSave({ name: name.trim(), odometerMi: Number(odometer || 0) })}
          style={{ flex: 1 }}
        />
      </View>
    </FormSheet>
  );
}

/** Wireframe s-prof-cars, now live CRUD against vehiclesService (pass 1). */
export function ProfCarsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesService.listVehicles,
  });

  // The globally active car drives highlight + ordering; tapping a card switches it.
  const { active } = useActiveVehicle();
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);

  // Active car floats to the top of the garage list.
  const sortedVehicles = [...(vehicles ?? [])].sort((a, b) => {
    if (a.id === active?.id) return -1;
    if (b.id === active?.id) return 1;
    return 0;
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vehicles'] });

  const saveMutation = useMutation({
    mutationFn: async (fields: { name: string; odometerMi: number }) => {
      if (editing) return vehiclesService.updateVehicle(editing.id, fields);
      return vehiclesService.addVehicle(fields);
    },
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => vehiclesService.removeVehicle(id),
    onSuccess: invalidate,
  });

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    setFormOpen(true);
  };
  const onRemove = (vehicle: Vehicle) =>
    confirmAction(
      'Remove car',
      `Remove ${vehicle.name} from your garage? Its service history stays archived.`,
      () => removeMutation.mutate(vehicle.id),
    );

  return (
    <Screen>
      <SectionLabel>Your vehicles</SectionLabel>
      {isLoading ? (
        <SkeletonList variant="card" count={1} tall />
      ) : (vehicles ?? []).length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: spacing.xl,
            alignItems: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>🚗</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            No vehicles yet
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            Add a car to start tracking quotes and service.
          </Text>
        </View>
      ) : (
        sortedVehicles.map((vehicle) => {
          const isActive = vehicle.id === active?.id;
          const specs = [
            ['VIN', vehicle.vin || '—'],
            ['Odometer', `${vehicle.odometerMi.toLocaleString()} mi`],
            ['Oil spec', vehicle.oilSpec || '—'],
            ['Last service', vehicle.lastService],
          ] as const;
          return (
            <Tappable
              key={vehicle.id}
              noFeedback
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Set ${vehicle.name} as your active car`}
              onPress={() => setActiveVehicle(vehicle.id)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.md,
                borderWidth: 1.5,
                borderColor: isActive ? colors.primary : colors.border,
                overflow: 'hidden',
                marginBottom: spacing.sm,
              }}
            >
              <LinearGradient
                colors={[palette.primary, palette.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radii.sm,
                    backgroundColor: 'rgba(255,255,255,.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>🚗</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                    {vehicle.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
                    {vehicle.colorName || 'Color not set'}
                  </Text>
                </View>
                {isActive ? (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,.25)',
                      borderRadius: radii.pill,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Active</Text>
                  </View>
                ) : vehicle.isPrimary ? (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,.2)',
                      borderRadius: radii.pill,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#fff' }}>Primary</Text>
                  </View>
                ) : null}
              </LinearGradient>
              <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                {specs.map(([label, value]) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 7,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: colors.textTertiary }}>{label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
              <View
                style={{
                  paddingHorizontal: spacing.md,
                  paddingBottom: spacing.sm,
                }}
              >
                {isActive ? (
                  <Badge label="Active car" variant="primary" />
                ) : (
                  <Badge label="Tap to set active" variant="primarySoft" />
                )}
              </View>
              <View
                style={{
                  padding: spacing.sm,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.divider,
                  flexDirection: 'row',
                  gap: spacing.xs,
                }}
              >
                <Tappable
                  onPress={() => openEdit(vehicle)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primarySurface,
                    borderRadius: radii.sm,
                    paddingVertical: 9,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
                    Edit car
                  </Text>
                </Tappable>
                <Tappable
                  onPress={() => onRemove(vehicle)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderRadius: radii.sm,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.danger,
                    paddingVertical: 9,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.danger }}>
                    Remove
                  </Text>
                </Tappable>
              </View>
            </Tappable>
          );
        })
      )}

      {/* Add car → dedicated v17 prof-car-add screen */}
      <Tappable
        onPress={() => navigation.navigate('ProfCarAdd')}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.primaryLight,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 28, marginBottom: 6 }}>➕</Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primaryDark, marginBottom: 2 }}>
          Add another car
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
          Scan VIN barcode or enter manually
        </Text>
      </Tappable>

      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 16 }}>💡</Text>
        <Text style={{ flex: 1, fontSize: 13, color: colors.warningDeep, lineHeight: 19 }}>
          Add all your vehicles to compare quotes and track service for each one.
        </Text>
      </View>

      <VehicleFormModal
        vehicle={editing}
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(fields) => saveMutation.mutate(fields)}
        saving={saveMutation.isPending}
      />
    </Screen>
  );
}
