import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { Dropdown } from '../../components/Dropdown';
import { Card, Screen } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { insuranceService, pointsService } from '../../services';
import { VEHICLE } from '../../services/mock/data';
import { capturePhoto } from '../../services/photos';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const CARRIERS = ['State Farm', 'Geico', 'Progressive', 'USAA', 'Allstate'];

/** "$1,200" → 1200 (undefined when no digits at all). */
const parseMoney = (s: string): number | undefined => {
  const digits = s.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : undefined;
};

const money = (n: number) => `$${n.toLocaleString()}`;

/** Underline-style form field (wireframe prof-ins-edit/add row). */
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  picker,
  onPress,
  trailing,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  /** Render as a select row (▾) instead of a text input. */
  picker?: boolean;
  /** Tap handler for picker rows. */
  onPress?: () => void;
  trailing?: string;
  keyboardType?: 'default' | 'numeric';
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      {picker ? (
        <Tappable
          onPress={onPress}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 6,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: value ? '600' : '400',
              color: value ? colors.textPrimary : colors.textPlaceholder,
            }}
          >
            {value || placeholder}
          </Text>
          <Text style={{ fontSize: 13, color: colors.primary }}>▾</Text>
        </Tappable>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textPlaceholder}
            keyboardType={keyboardType}
            style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 0, paddingBottom: 6 }}
          />
          {trailing ? <Text style={{ fontSize: 13 }}>{trailing}</Text> : null}
        </View>
      )}
    </View>
  );
}


const fieldRowStyle = (dividerColor: string) =>
  ({
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: dividerColor,
  }) as const;

/** Wireframe s-prof-ins-edit: edit policy form (Save persists → back). */
export function ProfInsEditScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'ProfInsEdit'>>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();

  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => insuranceService.listPolicies(),
  });
  const policy = policies?.find((p) => p.id === route.params?.policyId) ?? policies?.[0];

  const [carrier, setCarrier] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [deductible, setDeductible] = useState('');
  const [premium, setPremium] = useState('');
  const [renewal, setRenewal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Hydrate the form once the policy arrives (and re-hydrate on policy switch).
  useEffect(() => {
    if (!policy) return;
    setCarrier(policy.carrier);
    setPolicyNumber(policy.policyNumber);
    setDeductible(money(policy.deductible));
    setPremium(money(policy.premiumPerYear));
    setRenewal(policy.renewal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policy?.id]);

  const save = async () => {
    if (!policy || saving) return;
    setSaving(true);
    setError('');
    try {
      await insuranceService.updatePolicy(policy.id, {
        carrier,
        policyNumber,
        deductible: parseMoney(deductible) ?? policy.deductible,
        premiumPerYear: parseMoney(premium) ?? policy.premiumPerYear,
        renewal,
      });
      // Policy list + every cached cash-vs-insurance comparison are stale now
      // — the Compare tab must reflect the edited deductible/premium.
      await queryClient.invalidateQueries({ queryKey: ['policies'] });
      await queryClient.invalidateQueries({ queryKey: ['comparison'] });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes');
      setSaving(false);
    }
  };

  if (!policy) {
    return (
      <Screen>
        <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Policy banner */}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: '#FAC775',
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 20 }}>🛡️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warningDeep }}>
            {policy.carrier} · {policy.policyNumber}
          </Text>
          <Text style={{ fontSize: 12, color: '#854F0B' }}>
            {policy.coverage} · {policy.status}
          </Text>
        </View>
      </View>

      {/* Form */}
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <View style={fieldRowStyle(colors.divider)}>
          <Dropdown label="Provider" value={carrier} options={CARRIERS} onChange={setCarrier} placeholder="Select your insurer" />
        </View>
        <View style={fieldRowStyle(colors.divider)}>
          <FormField label="Policy number" value={policyNumber} onChangeText={setPolicyNumber} />
        </View>
        <View style={{ ...fieldRowStyle(colors.divider), flexDirection: 'row', gap: spacing.lg }}>
          <FormField label="Deductible" value={deductible} onChangeText={setDeductible} keyboardType="numeric" />
          <FormField label="Premium /yr" value={premium} onChangeText={setPremium} keyboardType="numeric" />
        </View>
        <View style={fieldRowStyle(colors.divider)}>
          <FormField label="Covered vehicle" value={policy.covers || VEHICLE.name} picker />
        </View>
        <View style={{ padding: spacing.md }}>
          <FormField label="Renewal date" value={renewal} onChangeText={setRenewal} trailing="📅" />
        </View>
      </Card>

      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 12, color: colors.primaryDark, lineHeight: 18 }}>
          ⓘ Updating your deductible helps AutoMate compare cash vs. insurance more accurately.
        </Text>
      </View>

      {error ? (
        <Text style={{ fontSize: 12, color: colors.danger, marginBottom: spacing.sm }}>
          {error}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Tappable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Cancel</Text>
        </Tappable>
        <Tappable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => ({
            flex: 2,
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed || saving ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onPrimary }}>
            {saving ? 'Saving…' : 'Save changes'}
          </Text>
        </Tappable>
      </View>
    </Screen>
  );
}

/** Wireframe s-prof-ins-add: card scan autofill, connect-my-insurer, manual form. */
export function ProfInsAddScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();

  const [carrier, setCarrier] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [deductible, setDeductible] = useState('');
  const [premium, setPremium] = useState('');
  const [covers, setCovers] = useState('');
  // Carried from the card scan; manual entries keep the wireframe defaults.
  const [coverage, setCoverage] = useState('Comprehensive + Collision');
  const [renewal, setRenewal] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: providers } = useQuery({
    queryKey: ['insurance-providers'],
    queryFn: () => insuranceService.getProviders(),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['policies'] });
    await queryClient.invalidateQueries({ queryKey: ['comparison'] });
  };

  /** "Scan insurance card" → REAL camera capture → OCR autofill (pass 2). */
  const scanCard = async () => {
    if (scanning) return;
    // Take the card photo first (web: file picker); cancel aborts the scan.
    const photo = await capturePhoto();
    if (!photo) return;
    setScanning(true);
    setError('');
    try {
      const card = await insuranceService.scanCard();
      setCarrier(card.provider);
      setPolicyNumber(card.policyNumber);
      setDeductible(money(card.deductible));
      setPremium(money(card.premiumPerYear));
      setCoverage(card.coverageType);
      setRenewal(card.renewalDate);
      setCovers(VEHICLE.name);
      setScanned(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Card scan failed');
    } finally {
      setScanning(false);
    }
  };

  /** "Connect my insurer" → aggregator link → policies imported. */
  const connect = async (providerId: string) => {
    if (connectingId) return;
    setConnectingId(providerId);
    setError('');
    try {
      const result = await insuranceService.connect(providerId);
      if (result.linkUrl) {
        // Real vendors hand back a hosted consent widget; finishing that flow
        // is outside the demo, so surface where the user would continue.
        setError(`Finish connecting in your insurer portal: ${result.linkUrl}`);
        return;
      }
      await invalidate();
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not connect to your insurer');
    } finally {
      setConnectingId(null);
    }
  };

  /** "Add policy" persists via the service, then back (list auto-refreshes). */
  const addPolicy = async () => {
    if (saving) return;
    if (!carrier || !policyNumber) {
      setError('Pick a provider and enter a policy number first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await insuranceService.addPolicy({
        carrier,
        coverage,
        policyNumber,
        deductible: parseMoney(deductible) ?? 500,
        premiumPerYear: parseMoney(premium) ?? 0,
        covers: covers || VEHICLE.name,
        renewal,
      });
      // "Add insurance policy" earn rule (+100 pts — s-prof-earn).
      await pointsService.earn('addInsurance');
      await invalidate();
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add the policy');
      setSaving(false);
    }
  };

  return (
    <Screen>
      {/* Method picker */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Tappable
          onPress={scanCard}
          disabled={scanning}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.primarySurface,
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderRadius: radii.sm,
            padding: spacing.md,
            alignItems: 'center',
            opacity: pressed || scanning ? 0.7 : 1,
          })}
        >
          {scanning ? (
            <ActivityIndicator color={colors.primary} style={{ marginBottom: 3, height: 29 }} />
          ) : (
            <Text style={{ fontSize: 22, marginBottom: 3 }}>{scanned ? '✅' : '📷'}</Text>
          )}
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDeep }}>
            {scanning ? 'Scanning card…' : scanned ? 'Card scanned' : 'Scan insurance card'}
          </Text>
          <Text style={{ fontSize: 11, color: colors.primaryDark }}>
            {scanned ? 'Fields filled below' : 'Auto-fill in seconds'}
          </Text>
        </Tappable>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            borderRadius: radii.sm,
            padding: spacing.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, marginBottom: 3 }}>✍️</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>
            Enter manually
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>Type details below</Text>
        </View>
      </View>

      {/* Manual form */}
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <View style={fieldRowStyle(colors.divider)}>
          <Dropdown label="Provider" value={carrier} options={CARRIERS} onChange={setCarrier} placeholder="Select your insurer" />
        </View>
        <View style={fieldRowStyle(colors.divider)}>
          <FormField
            label="Policy number"
            value={policyNumber}
            onChangeText={setPolicyNumber}
            placeholder="Enter policy number"
          />
        </View>
        <View style={{ ...fieldRowStyle(colors.divider), flexDirection: 'row', gap: spacing.lg }}>
          <FormField label="Deductible" value={deductible} onChangeText={setDeductible} placeholder="$" keyboardType="numeric" />
          <FormField label="Premium /yr" value={premium} onChangeText={setPremium} placeholder="$" keyboardType="numeric" />
        </View>
        <View style={{ padding: spacing.md }}>
          <FormField
            label="Covered vehicle"
            value={covers}
            placeholder="Select vehicle..."
            picker
            onPress={() => setCovers(VEHICLE.name)}
          />
        </View>
      </Card>

      {/* Connect my insurer (aggregator link — Phase 4) */}
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <View style={fieldRowStyle(colors.divider)}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
            🔗 Connect my insurer
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
            Log in once — your policies import automatically
          </Text>
        </View>
        {(providers ?? []).map((p, i, arr) => (
          <Tappable
            key={p.id}
            onPress={() => connect(p.id)}
            disabled={connectingId !== null}
            style={({ pressed }) => ({
              paddingHorizontal: spacing.md,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
              opacity: pressed || (connectingId !== null && connectingId !== p.id) ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 16 }}>🛡️</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>
              {p.name}
            </Text>
            {p.active ? (
              <View
                style={{
                  backgroundColor: colors.successSurface,
                  borderRadius: radii.pill,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.successDeep }}>
                  DEFAULT
                </Text>
              </View>
            ) : null}
            {connectingId === p.id ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={{ fontSize: 13, color: colors.primary }}>Connect →</Text>
            )}
          </Tappable>
        ))}
      </Card>

      {error ? (
        <Text style={{ fontSize: 12, color: colors.danger, marginBottom: spacing.sm }}>
          {error}
        </Text>
      ) : null}

      <Tappable
        onPress={addPolicy}
        disabled={saving}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          borderRadius: radii.sm,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: pressed || saving ? 0.8 : 1,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.onPrimary }}>
          {saving ? 'Adding…' : 'Add policy'}
        </Text>
      </Tappable>
    </Screen>
  );
}
