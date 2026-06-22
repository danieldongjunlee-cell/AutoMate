import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Dropdown } from '../../components/Dropdown';
import { FormSheet } from '../../components/FormSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SkeletonList } from '../../components/Skeleton';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { Screen, SectionLabel } from '../../components/ui';
import { brandOf, useActiveVehicle } from '../../hooks/useActiveVehicle';
import { ProfileStackParamList } from '../../navigation/types';
import { insuranceService, Policy, vehiclesService } from '../../services';
import { palette, radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

/** Loose match: does a policy's "covers" text refer to this vehicle? */
function policyCoversVehicle(covers: string, vehicleName: string): boolean {
  const c = covers.toLowerCase();
  const brand = brandOf(vehicleName).toLowerCase();
  const model = vehicleName.toLowerCase().split(/\s+/).filter((w) => !/^\d{4}$/.test(w))[1];
  return c.includes(brand) || (!!model && c.includes(model));
}

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfInsurance'>;

/** Inline edit form (modal) — the editable policy fields, mirroring the My-cars modal. */
function PolicyFormModal({
  policy,
  visible,
  onClose,
  onSave,
  saving,
  carOptions,
}: {
  policy: Policy | null;
  visible: boolean;
  onClose: () => void;
  onSave: (fields: {
    carrier: string;
    policyNumber: string;
    deductible: number;
    premiumPerYear: number;
    covers: string;
  }) => void;
  saving: boolean;
  carOptions: string[];
}) {
  const [carrier, setCarrier] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [deductible, setDeductible] = useState('');
  const [premium, setPremium] = useState('');
  const [covers, setCovers] = useState('');

  // Re-seed the fields whenever the modal opens for a different policy.
  React.useEffect(() => {
    if (visible) {
      setCarrier(policy?.carrier ?? '');
      setPolicyNumber(policy?.policyNumber ?? '');
      setDeductible(policy ? String(policy.deductible) : '');
      setPremium(policy ? String(policy.premiumPerYear) : '');
      // Pre-select the current "covers" only if it matches a registered car.
      const current = policy?.covers ?? '';
      setCovers(carOptions.includes(current) ? current : '');
    }
  }, [visible, policy, carOptions]);

  const canSave = carrier.trim().length > 0;

  return (
    <FormSheet visible={visible} onClose={onClose} title="Edit policy" dismissable={!saving}>
      <TextField
        label="Carrier"
        value={carrier}
        onChangeText={setCarrier}
        placeholder="State Farm"
      />
      <TextField
        label="Policy number"
        value={policyNumber}
        onChangeText={setPolicyNumber}
        placeholder="SF-8847234"
      />
      <TextField
        label="Deductible ($)"
        value={deductible}
        onChangeText={(t) => setDeductible(t.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
        placeholder="500"
      />
      <TextField
        label="Annual premium ($)"
        value={premium}
        onChangeText={(t) => setPremium(t.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
        placeholder="1200"
      />
      <Dropdown
        label="Covers"
        value={covers}
        options={carOptions}
        onChange={setCovers}
        placeholder="Select your car"
        containerStyle={{ marginBottom: spacing.lg }}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <PrimaryButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <PrimaryButton
          label="Save"
          disabled={!canSave}
          loading={saving}
          onPress={() =>
            onSave({
              carrier: carrier.trim(),
              policyNumber: policyNumber.trim(),
              deductible: Number(deductible || 0),
              premiumPerYear: Number(premium || 0),
              covers: covers.trim(),
            })
          }
          style={{ flex: 1 }}
        />
      </View>
    </FormSheet>
  );
}

function PolicyCard({
  policy,
  coversLabel,
  onEdit,
  onRemove,
}: {
  policy: Policy;
  /** The covered car, resolved against the user's registered car info. */
  coversLabel: string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const details = [
    ['Policy number', policy.policyNumber],
    ['Deductible', `$${policy.deductible} (collision)`],
    ['Annual premium', `$${policy.premiumPerYear.toLocaleString()}/yr`],
    ['Covers', coversLabel],
    ['Renewal date', policy.renewal],
  ] as const;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: colors.warning,
        overflow: 'hidden',
        marginBottom: spacing.sm,
      }}
    >
      <LinearGradient
        colors={['#633806', '#854F0B']}
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
          <Text style={{ fontSize: 22 }}>🛡️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{policy.carrier}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{policy.coverage}</Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(29,158,117,.3)',
            borderRadius: radii.pill,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(29,158,117,.5)',
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, color: palette.successLight }}>{policy.status}</Text>
        </View>
      </LinearGradient>
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
        {details.map(([label, value]) => (
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
          padding: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.divider,
          flexDirection: 'row',
          gap: spacing.xs,
        }}
      >
        <Tappable
          onPress={onEdit}
          style={{
            flex: 1,
            backgroundColor: colors.primarySurface,
            borderRadius: radii.sm,
            paddingVertical: 9,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
            Edit policy
          </Text>
        </Tappable>
        <Tappable
          onPress={onRemove}
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
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.danger }}>Remove</Text>
        </Tappable>
      </View>
    </View>
  );
}

/** Wireframe s-prof-insurance: live policy cards + compare cash-vs-insurance link. */
export function ProfInsuranceScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Policy | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { active } = useActiveVehicle();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => insuranceService.listPolicies(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesService.listVehicles,
  });
  const carOptions = (vehicles ?? []).map((v) => v.name);

  // "Covers" should reflect the car the user actually registered in their car
  // info — so we resolve the policy's stored covers text to a registered car
  // name when one matches (e.g. "2019 Honda Accord" → "2019 Honda Accord EX-L").
  const coversLabelFor = (policy: Policy): string =>
    (vehicles ?? []).find((v) => policyCoversVehicle(policy.covers, v.name))?.name ?? policy.covers;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['policies'] });

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<Policy>) => insuranceService.updatePolicy(editing!.id, patch),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => insuranceService.removePolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policies'] }),
  });

  const openEdit = (policy: Policy) => {
    setEditing(policy);
    setFormOpen(true);
  };

  const linkedPolicy = active
    ? (policies ?? []).find((p) => policyCoversVehicle(p.covers, active.name))
    : undefined;
  // The active car's policy floats to the top as the primary.
  const sortedPolicies = [...(policies ?? [])].sort((a, b) => {
    if (a.id === linkedPolicy?.id) return -1;
    if (b.id === linkedPolicy?.id) return 1;
    return 0;
  });

  return (
    <Screen>
      {/* Active-car context — updates when you switch cars on Home */}
      {active ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: linkedPolicy ? colors.successSurface : colors.warningSurface,
            borderWidth: 1,
            borderColor: linkedPolicy ? colors.successLight : colors.warning,
            borderRadius: radii.md,
            padding: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 16 }}>🚗</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{active.name}</Text>
            <Text style={{ fontSize: 11, color: linkedPolicy ? colors.successDark : colors.warningDeep }}>
              {linkedPolicy
                ? `Covered by ${linkedPolicy.carrier} · $${linkedPolicy.deductible} deductible`
                : 'No policy linked to this car yet'}
            </Text>
          </View>
        </View>
      ) : null}

      <SectionLabel>Your policies</SectionLabel>
      {isLoading ? (
        <SkeletonList variant="card" count={1} tall />
      ) : (policies ?? []).length === 0 ? (
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: 'center',
            padding: spacing.lg,
          }}
        >
          No policies on file — add one below.
        </Text>
      ) : (
        sortedPolicies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            coversLabel={coversLabelFor(policy)}
            onEdit={() => openEdit(policy)}
            onRemove={() =>
              confirmAction(
                'Remove policy',
                `Remove the ${policy.carrier} policy ${policy.policyNumber}?`,
                () => removeMutation.mutate(policy.id),
              )
            }
          />
        ))
      )}

      {/* Add policy */}
      <Tappable
        onPress={() => navigation.navigate('ProfInsAdd')}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.warning,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 28, marginBottom: 6 }}>➕</Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.warningDeep, marginBottom: 2 }}>
          Add another policy
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>Geico, Progressive, USAA...</Text>
      </Tappable>

      <PolicyFormModal
        policy={editing}
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(fields) => saveMutation.mutate(fields)}
        saving={saveMutation.isPending}
        carOptions={carOptions}
      />
    </Screen>
  );
}
