import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Badge, SectionLabel, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPE_SEVERITY, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services';
import { DamagePart, useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ConfirmSubmit'>;

/** Per-card action chip (✎ Edit / 📷 + Photos / ✕ Remove). */
function ActionChip({
  label,
  danger,
  onPress,
}: {
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: danger ? colors.dangerSurface : colors.primarySurface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: danger ? colors.dangerBorder : colors.primaryLight,
        borderRadius: radii.sm,
        paddingVertical: 9,
        alignItems: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: danger ? colors.dangerDeep : colors.primaryDark,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** One committed part card (part name + type badge + photos line + actions). */
function PartCard({
  item,
  onEdit,
  onAddPhotos,
  onRemove,
}: {
  item: DamagePart;
  onEdit: () => void;
  onAddPhotos: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const severity = DAMAGE_TYPE_SEVERITY[item.type] ?? 'Paint intact';
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primaryDeep }}>
              {item.part}
            </Text>
            <Badge label={item.type} variant="primary" />
          </View>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            {item.photos} photo{item.photos !== 1 ? 's' : ''} · {severity}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <ActionChip label="✎ Edit" onPress={onEdit} />
        <ActionChip label="📷 + Photos" onPress={onAddPhotos} />
        <ActionChip label="✕ Remove" danger onPress={onRemove} />
      </View>
    </View>
  );
}

/** Wireframe s-confirm-submit: multi-part list built by looping the single-select flow. */
export function ConfirmSubmitScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const damageParts = useAppStore((s) => s.damageParts);
  const pickPart = useAppStore((s) => s.pickPart);
  const removePart = useAppStore((s) => s.removePart);
  const resetDraft = useAppStore((s) => s.resetDraft);
  const addPoints = useAppStore((s) => s.addPoints);
  const setAiEstimate = useAppStore((s) => s.setAiEstimate);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    // The service decides after-hours routing (backend-owned rule).
    const { afterHours, pointsEarned, aiEstimate } =
      await quoteService.submitDamageRequest(damageParts);
    addPoints(pointsEarned);
    // Carry the AI analysis (range + confidence) to Submitted/DealerQuotes.
    setAiEstimate(aiEstimate ?? null);
    setSubmitting(false);
    navigation.navigate(afterHours ? 'AfterHours' : 'Submitted');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Parts selected ({damageParts.length})</SectionLabel>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>Step 3 of 3</Text>
      </View>

      {damageParts.length === 0 ? (
        <Text
          style={{
            fontSize: 13,
            color: colors.textTertiary,
            textAlign: 'center',
            paddingVertical: spacing.lg,
          }}
        >
          No parts yet — add your first damaged part below.
        </Text>
      ) : (
        damageParts.map((item, i) => (
          <PartCard
            key={item.part}
            item={item}
            onEdit={() => {
              pickPart(item.part); // seed the draft with this part for editing
              navigation.navigate('CarDiagram');
            }}
            onAddPhotos={() => {
              pickPart(item.part);
              navigation.navigate('Camera');
            }}
            onRemove={() => removePart(i)}
          />
        ))
      )}

      {/* AI banner */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginVertical: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 18 }}>🤖</Text>
        <Text style={{ flex: 1, fontSize: 12, color: colors.primaryDark, lineHeight: 18 }}>
          AI will analyze your parts and send your request to nearby shops
        </Text>
      </View>

      {/* Add another part (loops back through the single-select flow) */}
      <Pressable
        onPress={() => {
          resetDraft(); // fresh pass: nothing pre-selected on the diagram
          navigation.navigate('CarDiagram');
        }}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.primaryLight,
          padding: spacing.md,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text style={{ fontSize: 22, color: colors.primary, marginBottom: 3 }}>➕</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDark, marginBottom: 2 }}>
          Add another damaged part
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          Each part gets its own photos & quotes
        </Text>
      </Pressable>

      {/* Submit */}
      <PrimaryButton
        label={damageParts.length ? 'Submit for quotes →' : 'Add a damaged part first'}
        disabled={!damageParts.length}
        loading={submitting}
        onPress={onSubmit}
        style={{ marginBottom: spacing.sm, backgroundColor: palette.primaryDark }}
      />
      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.textTertiary }}>
        Sending to {QUOTE_REQUEST.shopsNotified} verified shops in {QUOTE_REQUEST.city}
      </Text>
    </Screen>
  );
}
