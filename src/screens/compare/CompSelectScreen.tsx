import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { CompareStackParamList } from '../../navigation/types';
import { dealerById } from '../../services/mock/data';
import { useAcceptedQuotes } from '../../hooks/useAcceptedQuote';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompSelect'>;

/** Wireframe s-comp-select: pick an accepted quote to compare cash vs. insurance. */
export function CompSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  // Quotes reflect the current AI estimate range.
  const acceptedQuotes = useAcceptedQuotes();

  return (
    <Screen>
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
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDark }}>
          ⓘ Select an accepted quote to compare cash vs. insurance options.
        </Text>
      </View>

      <SectionLabel>Accepted quotes</SectionLabel>
      {acceptedQuotes.map((aq, i) => {
        const dealer = dealerById(aq.dealerId);
        return (
          <Tappable
            key={aq.id}
            onPress={() => navigation.navigate('CompCashIns', { quoteId: aq.id })}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: i === 0 ? 1.5 : StyleSheet.hairlineWidth,
              borderColor: i === 0 ? colors.primary : colors.border,
              padding: spacing.md,
              marginBottom: spacing.sm,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.sm,
              }}
            >
              <AvatarCircle initial={dealer.initial} color={dealer.color} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                  {dealer.name}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                  Rear bumper · {aq.parts} parts
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 19, fontWeight: '700', color: colors.successDark }}>
                  ${aq.priceLow}–${aq.priceHigh}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textTertiary }}>est. ±</Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.successSurface,
                borderRadius: radii.pill,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.success,
                paddingHorizontal: 11,
                paddingVertical: 3,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 12, color: colors.successDeep }}>
                ✔ Accepted · {aq.acceptedOn}
              </Text>
            </View>
          </Tappable>
        );
      })}

      <Text
        style={{
          fontSize: 13,
          color: colors.textTertiary,
          textAlign: 'center',
          paddingVertical: spacing.sm,
        }}
      >
        Tap a quote to see cash vs. insurance breakdown
      </Text>
    </Screen>
  );
}
