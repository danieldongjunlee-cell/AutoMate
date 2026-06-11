import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPES, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services/mock/quoteService';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ConfirmSubmit'>;

/** Business hours used to route submitted vs. after-hours (wireframe: 11:48 PM variant). */
export const isAfterHours = (d = new Date()) => d.getHours() >= 21 || d.getHours() < 7;

export function ConfirmSubmitScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const selectedParts = useAppStore((s) => s.selectedParts);
  const photos = useAppStore((s) => s.damagePhotos);
  const damageType = useAppStore((s) => s.damageType);
  const setDamageType = useAppStore((s) => s.setDamageType);
  const [submitting, setSubmitting] = useState(false);

  const parts = selectedParts.length ? selectedParts : ['Rear bumper'];
  const primaryPart = parts[0];

  const onSubmit = async () => {
    setSubmitting(true);
    await quoteService.submitDamageRequest(parts, photos.length, damageType);
    setSubmitting(false);
    navigation.navigate(isAfterHours() ? 'AfterHours' : 'Submitted');
  };

  return (
    <Screen>
      <SectionLabel>Parts selected ({parts.length})</SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {parts.map((part, i) => (
          <View
            key={part}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.md,
              backgroundColor: i === 0 ? colors.primarySurface : undefined,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.divider,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: radii.sm,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>🚗</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primaryDeep }}>
                  {part}
                </Text>
                <Badge label={damageType} variant="primary" />
              </View>
              <Text style={{ fontSize: 12, color: colors.primaryDark }}>
                {photos.length} photo{photos.length !== 1 ? 's' : ''} · Paint intact
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Pressable onPress={() => navigation.navigate('CarDiagram')} hitSlop={6}>
                <Text style={{ fontSize: 12, color: colors.primaryDark }}>Edit ✎</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Camera')} hitSlop={6}>
                <Text style={{ fontSize: 12, color: colors.primaryDark }}>+ Photos</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <Pressable
          onPress={() => navigation.navigate('CarDiagram')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.md,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 16, color: colors.primary }}>➕</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDark }}>
            Add another damaged part
          </Text>
        </Pressable>
      </Card>

      {/* Damage location */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.sm,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🚗</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Damage location
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primaryDeep }}>
            {primaryPart}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('CarDiagram')}
          style={({ pressed }) => ({
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.primaryLight,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primaryDark }}>Edit ✎</Text>
        </Pressable>
      </View>

      {/* Damage type chips */}
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
        Damage type
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {DAMAGE_TYPES.map((t) => {
          const on = t === damageType;
          return (
            <Pressable
              key={t}
              onPress={() => setDamageType(t)}
              style={({ pressed }) => ({
                backgroundColor: on ? colors.primary : colors.surface,
                borderRadius: radii.pill,
                borderWidth: on ? 0 : StyleSheet.hairlineWidth,
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 8,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: on ? '600' : '400',
                  color: on ? colors.onPrimary : colors.textSecondary,
                }}
              >
                {t}
                {on ? ' ✔' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Photos */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
          Photos <Text style={{ color: colors.textTertiary, fontWeight: '400' }}>({photos.length} submitted)</Text>
        </Text>
        <Pressable onPress={() => navigation.navigate('Camera')} hitSlop={6}>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>Add more</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {photos.map((p) => (
          <View
            key={p.id}
            style={{
              width: 92,
              height: 80,
              borderRadius: radii.sm,
              backgroundColor: p.tint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 26 }}>📷</Text>
            <View
              style={{
                position: 'absolute',
                bottom: 5,
                right: 5,
                backgroundColor: colors.success,
                borderRadius: radii.pill,
                paddingHorizontal: 6,
                paddingVertical: 1,
              }}
            >
              <Text style={{ fontSize: 9, color: '#fff' }}>✔</Text>
            </View>
          </View>
        ))}
        <Pressable
          onPress={() => navigation.navigate('Camera')}
          style={({ pressed }) => ({
            width: 80,
            height: 80,
            borderRadius: radii.sm,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 22, color: colors.primary }}>+</Text>
          <Text style={{ fontSize: 10, color: colors.textTertiary }}>Add</Text>
        </Pressable>
      </View>

      {/* Submit */}
      <PrimaryButton
        label="Submit for quotes →"
        loading={submitting}
        onPress={onSubmit}
        style={{ marginBottom: spacing.sm }}
      />
      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.textTertiary }}>
        Sending to {QUOTE_REQUEST.shopsNotified} verified shops in {QUOTE_REQUEST.city}
      </Text>
    </Screen>
  );
}
