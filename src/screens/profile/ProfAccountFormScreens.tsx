import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { USER } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

/** Shared layout for the change-email / change-phone / change-password forms. */
function AccountForm({
  rows,
  note,
  cta,
}: {
  rows: { label: string; value?: string; placeholder?: string; secure?: boolean }[];
  note?: string;
  cta: string;
}) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [values, setValues] = useState(rows.map((r) => r.value ?? ''));

  return (
    <Screen>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderBottomWidth: i < rows.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              {row.label}
            </Text>
            {row.value !== undefined && !row.placeholder ? (
              <Text style={{ fontSize: 16, color: colors.textTertiary, paddingVertical: 2 }}>
                {row.secure ? '••••••••' : row.value}
              </Text>
            ) : (
              <TextInput
                value={values[i]}
                onChangeText={(t) => setValues((v) => v.map((x, j) => (j === i ? t : x)))}
                placeholder={row.placeholder}
                placeholderTextColor={colors.textPlaceholder}
                secureTextEntry={row.secure}
                style={{ fontSize: 16, color: colors.textPrimary, paddingVertical: 2 }}
              />
            )}
          </View>
        ))}
      </Card>

      {note ? (
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.primaryLight,
            padding: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>ⓘ {note}</Text>
        </View>
      ) : null}

      <PrimaryButton label={cta} onPress={() => navigation.goBack()} />
    </Screen>
  );
}

/** Wireframe s-prof-change-email. */
export function ProfChangeEmailScreen() {
  const email = useAppStore((s) => s.user?.email) ?? USER.email;
  return (
    <AccountForm
      rows={[
        { label: 'Current email', value: email },
        { label: 'New email', placeholder: 'Enter new email address' },
      ]}
      note="A verification link will be sent to your new email."
      cta="Send verification link"
    />
  );
}

/** Wireframe s-prof-change-phone. */
export function ProfChangePhoneScreen() {
  const user = useAppStore((s) => s.user);
  const phone = user ? user.phone ?? '' : USER.phone;
  return (
    <AccountForm
      rows={[
        { label: 'Current number', value: phone },
        { label: 'New phone number', placeholder: '+1 (___) ___-____' },
      ]}
      note="A 6-digit code will be sent via SMS to your new number."
      cta="Send verification code"
    />
  );
}

/** Wireframe s-prof-change-password. */
export function ProfChangePasswordScreen() {
  return (
    <AccountForm
      rows={[
        { label: 'Current password', placeholder: '••••••••', secure: true },
        { label: 'New password', placeholder: '••••••••', secure: true },
        { label: 'Confirm new password', placeholder: '••••••••', secure: true },
      ]}
      cta="Update password"
    />
  );
}
