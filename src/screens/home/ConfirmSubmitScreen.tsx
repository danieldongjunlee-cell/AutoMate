import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

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
    <Tappable
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
    </Tappable>
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
        {/* Real captured photo as the leading thumbnail (feedback pass 2) */}
        {item.photoUris?.[0] ? (
          <Image
            source={{ uri: item.photoUris[0] }}
            style={{ width: 44, height: 44, borderRadius: radii.sm }}
            resizeMode="cover"
          />
        ) : (
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
        )}
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
      {/* Remaining photo thumbnails */}
      {item.photoUris && item.photoUris.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.sm }}>
          {item.photoUris.slice(1, 5).map((uri, i) => (
            <Image
              key={`${uri}-${i}`}
              source={{ uri }}
              style={{ width: 52, height: 44, borderRadius: radii.sm }}
              resizeMode="cover"
            />
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <ActionChip label="✎ Edit" onPress={onEdit} />
        <ActionChip label="📷 + Photos" onPress={onAddPhotos} />
        <ActionChip label="✕ Remove" danger onPress={onRemove} />
      </View>
    </View>
  );
}

/** Staged copy shown while the AI service call is in flight. */
const ANALYZE_STAGES = [
  '🔍 Analyzing your photos…',
  `📡 Contacting ${QUOTE_REQUEST.shopsNotified} shops…`,
];

/** In-screen AI analyzing state: pulsing 🤖 + staged status text (wireframe-consistent). */
function AnalyzingState({ partCount }: { partCount: number }) {
  const { colors } = useTheme();
  const [stage, setStage] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    // Stage copy flips halfway through the (~2s) service call.
    const t = setTimeout(() => setStage(1), 1100);
    return () => {
      loop.stop();
      clearTimeout(t);
    };
  }, [pulse]);

  return (
    <View style={{ alignItems: 'center', paddingVertical: 72 }}>
      <Animated.Text style={{ fontSize: 58, transform: [{ scale: pulse }] }}>🤖</Animated.Text>
      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: colors.primaryDeep,
          marginTop: spacing.lg,
          marginBottom: 6,
        }}
      >
        {ANALYZE_STAGES[stage]}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center' }}>
        AI is estimating repair costs for {partCount} part{partCount !== 1 ? 's' : ''}
      </Text>
      {/* Stage dots */}
      <View style={{ flexDirection: 'row', gap: 7, marginTop: spacing.lg }}>
        {ANALYZE_STAGES.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i <= stage ? colors.primary : colors.border,
            }}
          />
        ))}
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
    try {
      // The service decides after-hours routing (backend-owned rule). Pad to a
      // ~2s minimum so the analyzing stages read (mock resolves instantly).
      const [{ afterHours, pointsEarned, aiEstimate }] = await Promise.all([
        quoteService.submitDamageRequest(damageParts),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
      addPoints(pointsEarned);
      // Carry the AI analysis (range + confidence) to Submitted/DealerQuotes.
      setAiEstimate(aiEstimate ?? null);
      navigation.navigate(afterHours ? 'AfterHours' : 'Submitted');
    } finally {
      setSubmitting(false);
    }
  };

  // In-screen analyzing state while the AI service call runs.
  if (submitting) {
    return (
      <Screen>
        <AnalyzingState partCount={damageParts.length} />
      </Screen>
    );
  }

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
      <Tappable
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
      </Tappable>

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
