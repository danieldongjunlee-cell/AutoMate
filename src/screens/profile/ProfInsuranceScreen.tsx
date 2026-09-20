import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Dropdown } from '../../components/Dropdown';
import { FormSheet } from '../../components/FormSheet';
import { Icon } from '../../components/Icon';
import { InsurerLogo } from '../../components/InsurerLogo';
import { PagedCarousel } from '../../components/PagedCarousel';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SkeletonList } from '../../components/Skeleton';
import { DECK_TEXT, DECK_TEXT_SOFT, DeckButton, StatTile, SwipeCard, SwipeDeck } from '../../components/SwipeCard';
import { Tappable } from '../../components/Tappable';
import { TextField } from '../../components/TextField';
import { Screen } from '../../components/ui';
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

/** Inline edit form (modal), the editable policy fields, mirroring the My-cars modal. */
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

/**
 * A policy as a swipe card: carrier name with the accent underline, the
 * carrier's real logo where the car photo would be, four stat tiles
 * (deductible, premium, renewal, covered car) and Edit / Remove.
 */
function PolicyCard({ policy, coversLabel, linked, onEdit, onRemove }: { policy: Policy; coversLabel: string; linked: boolean; onEdit: () => void; onRemove: () => void }) {
  const renewShort = policy.renewal.replace(/,\s*\d{4}$/, '');
  return (
    <SwipeCard title={policy.carrier} subtitle={`${policy.coverage} · ${policy.policyNumber}`} badge={linked ? 'Active car' : policy.status}>
      <View style={{ height: 150, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.sm }}>
        <InsurerLogo carrier={policy.carrier} size={120} bg="transparent" />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <StatTile icon="shield" color={palette.teal} value={`$${policy.deductible}`} label="deductible" />
        <StatTile icon="dollar" color={palette.amber} value={`$${policy.premiumPerYear.toLocaleString()}`} label="per year" />
        <StatTile icon="calendar" color={palette.lavender} value={renewShort} label="renews" />
        <StatTile icon="car" color={palette.primaryLight} value={coversLabel.split(' ').filter((w) => !/^(19|20)\d{2}$/.test(w))[1] ?? coversLabel} label="covers" />
      </View>
      <DeckButton label="Edit policy" onPress={onEdit} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.md }}>
        <Tappable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${policy.carrier} policy`}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffb4b1' }}>Remove policy</Text>
        </Tappable>
      </View>
    </SwipeCard>
  );
}

/** My insurance: swipe through the policies (the active car's first), then "Add a policy". */
export function ProfInsuranceScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Policy | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { active } = useActiveVehicle();
  const { data: policies, isLoading } = useQuery({ queryKey: ['policies'], queryFn: () => insuranceService.listPolicies() });
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: vehiclesService.listVehicles });
  const carOptions = (vehicles ?? []).map((v) => v.name);

  // "Covers" reflects the car the user registered: resolve the policy's stored
  // covers text to a registered car, else fall back to the primary car.
  const coversLabelFor = (policy: Policy): string => {
    const list = vehicles ?? [];
    const matched = list.find((v) => policyCoversVehicle(policy.covers, v.name));
    if (matched) return matched.name;
    const primary = list.find((v) => v.isPrimary) ?? list[0];
    return primary?.name ?? policy.covers;
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['policies'] });
  const saveMutation = useMutation({
    mutationFn: (patch: Partial<Policy>) => insuranceService.updatePolicy(editing!.id, patch),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
  });
  const removeMutation = useMutation({ mutationFn: (id: string) => insuranceService.removePolicy(id), onSuccess: invalidate });
  const openEdit = (policy: Policy) => {
    setEditing(policy);
    setFormOpen(true);
  };

  const linkedPolicy = active ? (policies ?? []).find((p) => policyCoversVehicle(p.covers, active.name)) : undefined;
  // The active car's policy comes first.
  const sortedPolicies = [...(policies ?? [])].sort((a, b) => (a.id === linkedPolicy?.id ? -1 : b.id === linkedPolicy?.id ? 1 : 0));

  const addCard = (
    <SwipeCard key="add" title="Add a policy" dashed>
      <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
        <Tappable onPress={() => navigation.navigate('ProfInsAdd')} accessibilityRole="button" accessibilityLabel="Add another policy" style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <Icon name="plus" size={40} color={DECK_TEXT} strokeWidth={2.4} />
        </Tappable>
        <PrimaryButton label="Add another policy" onPress={() => navigation.navigate('ProfInsAdd')} style={{ alignSelf: 'stretch' }} />
      </View>
    </SwipeCard>
  );

  return (
    <Screen>
      <SwipeDeck
        caption={
          sortedPolicies.length
            ? `${sortedPolicies.length} polic${sortedPolicies.length === 1 ? 'y' : 'ies'} · swipe to switch`
            : 'No policies yet'
        }
      >
        {isLoading ? (
          <SkeletonList variant="card" count={1} tall />
        ) : (
          <PagedCarousel
            items={[
              ...sortedPolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  coversLabel={coversLabelFor(policy)}
                  linked={policy.id === linkedPolicy?.id}
                  onEdit={() => openEdit(policy)}
                  onRemove={() => confirmAction('Remove policy', `Remove the ${policy.carrier} policy ${policy.policyNumber}?`, () => removeMutation.mutate(policy.id))}
                />
              )),
              addCard,
            ]}
          />
        )}
      </SwipeDeck>


      <PolicyFormModal policy={editing} visible={formOpen} onClose={() => setFormOpen(false)} onSave={(fields) => saveMutation.mutate(fields)} saving={saveMutation.isPending} carOptions={carOptions} />
    </Screen>
  );
}
