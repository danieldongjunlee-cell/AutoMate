import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { INSURANCE_POLICY, VEHICLE } from '../../services/mock/data';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

/** Underline-style form field (wireframe prof-ins-edit/add row). */
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  picker,
  trailing,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  /** Render as a select row (▾) instead of a text input. */
  picker?: boolean;
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
        <Pressable
          onPress={() => Alert.alert(label, 'More options come with the insurance module.')}
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
        </Pressable>
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

/** Wireframe s-prof-ins-edit: edit policy form (Save → back to prof-insurance). */
export function ProfInsEditScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [policyNumber, setPolicyNumber] = useState(INSURANCE_POLICY.accountNumber);
  const [deductible, setDeductible] = useState('$500');
  const [premium, setPremium] = useState('$1,200');
  const [renewal, setRenewal] = useState('Aug 15, 2027');

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
            {INSURANCE_POLICY.carrier} · {INSURANCE_POLICY.accountNumber}
          </Text>
          <Text style={{ fontSize: 12, color: '#854F0B' }}>
            {INSURANCE_POLICY.coverage} · Active
          </Text>
        </View>
      </View>

      {/* Form */}
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        <View style={fieldRowStyle(colors.divider)}>
          <FormField label="Provider" value={INSURANCE_POLICY.carrier} picker />
        </View>
        <View style={fieldRowStyle(colors.divider)}>
          <FormField label="Policy number" value={policyNumber} onChangeText={setPolicyNumber} />
        </View>
        <View style={{ ...fieldRowStyle(colors.divider), flexDirection: 'row', gap: spacing.lg }}>
          <FormField label="Deductible" value={deductible} onChangeText={setDeductible} keyboardType="numeric" />
          <FormField label="Premium /yr" value={premium} onChangeText={setPremium} keyboardType="numeric" />
        </View>
        <View style={fieldRowStyle(colors.divider)}>
          <FormField label="Covered vehicle" value={VEHICLE.name} picker />
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

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable
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
        </Pressable>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            flex: 2,
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onPrimary }}>
            Save changes
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

/** Wireframe s-prof-ins-add: scan-card stub or manual form (Add → back). */
export function ProfInsAddScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [policyNumber, setPolicyNumber] = useState('');
  const [deductible, setDeductible] = useState('');
  const [premium, setPremium] = useState('');

  return (
    <Screen>
      {/* Method picker */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Pressable
          onPress={() =>
            Alert.alert('Scan insurance card', 'Card scanning lands with the AI services phase.')
          }
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.primarySurface,
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderRadius: radii.sm,
            padding: spacing.md,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 22, marginBottom: 3 }}>📷</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDeep }}>
            Scan insurance card
          </Text>
          <Text style={{ fontSize: 11, color: colors.primaryDark }}>Auto-fill in seconds</Text>
        </Pressable>
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
          <FormField label="Provider" value="" placeholder="Select provider..." picker />
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
          <FormField label="Covered vehicle" value="" placeholder="Select vehicle..." picker />
        </View>
      </Card>

      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          borderRadius: radii.sm,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.onPrimary }}>Add policy</Text>
      </Pressable>
    </Screen>
  );
}
