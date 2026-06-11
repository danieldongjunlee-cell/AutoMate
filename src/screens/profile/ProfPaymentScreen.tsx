import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen, SectionLabel } from '../../components/ui';
import { PAYMENT_CARD } from '../../services/mock/data';
import { palette, radii, spacing, useTheme } from '../../theme';

/** Wireframe s-prof-payment: card art, Apple Pay row, add method, PCI note. */
export function ProfPaymentScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <SectionLabel>Saved methods</SectionLabel>

      {/* Visa card */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: colors.primary,
          overflow: 'hidden',
          marginBottom: spacing.sm,
        }}
      >
        <LinearGradient
          colors={[palette.dark, palette.darkAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: spacing.lg }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: 'rgba(255,255,255,.5)',
                letterSpacing: 2,
              }}
            >
              {PAYMENT_CARD.brand}
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(127,119,221,.3)',
                borderRadius: radii.pill,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: 'rgba(127,119,221,.5)',
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 12, color: palette.primaryLight }}>Primary</Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '600',
              color: '#fff',
              letterSpacing: 2,
              marginBottom: spacing.md,
            }}
          >
            •••• •••• •••• {PAYMENT_CARD.last4}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>CARDHOLDER</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>
                {PAYMENT_CARD.holder}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>EXPIRES</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>
                {PAYMENT_CARD.expires}
              </Text>
            </View>
          </View>
        </LinearGradient>
        <View style={{ padding: spacing.sm, flexDirection: 'row', gap: spacing.xs }}>
          <Pressable
            onPress={() => Alert.alert('Edit card', 'Card editing comes with the backend.')}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.primarySurface,
              borderRadius: radii.sm,
              paddingVertical: 9,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
              Edit card
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Remove card', 'Card removal comes with the backend.')}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              paddingVertical: 9,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>Remove</Text>
          </Pressable>
        </View>
      </View>

      {/* Apple Pay */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.sm,
            backgroundColor: palette.dark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🍎</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
            Apple Pay
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>Configured · ready to use</Text>
        </View>
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.successDeep }}>Ready</Text>
        </View>
      </View>

      {/* Add method */}
      <Pressable
        onPress={() => Alert.alert('Add method', 'Payment-method linking comes with the backend.')}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.primaryLight,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 28, marginBottom: 6 }}>➕</Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primaryDark, marginBottom: 2 }}>
          Add payment method
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
          Credit / debit · Apple Pay · Google Pay
        </Text>
      </Pressable>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 15 }}>🔒</Text>
        <Text style={{ flex: 1, fontSize: 12, color: colors.textTertiary, lineHeight: 18 }}>
          256-bit encrypted · PCI DSS compliant · AutoMate never stores full card numbers.
        </Text>
      </View>
    </Screen>
  );
}
