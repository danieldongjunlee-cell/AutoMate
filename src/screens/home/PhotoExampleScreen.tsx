import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { PHOTO_TIPS } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'PhotoExample'>;

export function PhotoExampleScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const firstPart = useAppStore((s) => s.draftPart) ?? 'Rear bumper';

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDark }}>
          {firstPart} — example photo
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>Step 2 of 3</Text>
      </View>

      {/* Example photo card */}
      <LinearGradient
        colors={['#2D2020', '#1A1010']}
        style={{
          borderRadius: radii.lg,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <LinearGradient
          colors={['#6B4A4A', '#5A3A3A']}
          style={{
            borderRadius: radii.sm,
            height: 150,
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: 80,
              height: 22,
              borderRadius: 40,
              borderWidth: 2.5,
              borderColor: 'rgba(255,255,255,.25)',
              top: '30%',
            }}
          />
          <Text style={{ fontSize: 62 }}>🚗</Text>
        </LinearGradient>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 3 }}>
          Good example: rear bumper dent
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
          Clear · Well-lit · Paint intact visible
        </Text>
      </LinearGradient>

      <SectionLabel>Tips for a great photo</SectionLabel>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: 'hidden',
          marginBottom: spacing.lg,
        }}
      >
        {PHOTO_TIPS.map((tip, i) => (
          <View
            key={tip.bold}
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              padding: spacing.md,
              borderBottomWidth: i < PHOTO_TIPS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 20 }}>{tip.icon}</Text>
            <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{tip.bold}</Text>
              {tip.rest}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Tappable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            borderRadius: radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>← Change part</Text>
        </Tappable>
        <PrimaryButton
          label="Take photos →"
          onPress={() => navigation.navigate('Camera')}
          style={{ flex: 2 }}
        />
      </View>
    </Screen>
  );
}
