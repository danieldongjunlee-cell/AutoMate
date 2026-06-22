import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Badge, SectionLabel, Screen } from '../../components/ui';
import { SubmitProgress } from '../../components/SubmitProgress';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPE_SEVERITY, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services';
import { saveDamageEstimate } from '../../lib/damageEstimates';
import { damageEstimator } from '../../lib/damageEstimator';
import { modelOf, useActiveVehicle } from '../../hooks/useActiveVehicle';
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
          fontSize: 14,
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
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            {item.photos} photo{item.photos !== 1 ? 's' : ''} · {severity}
          </Text>
          {item.note ? (
            <Text
              style={{ fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', marginTop: 3 }}
              numberOfLines={2}
            >
              “{item.note}”
            </Text>
          ) : null}
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

/** In-screen AI analyzing state: circular spinner + staged status text. */
function AnalyzingState({ partCount }: { partCount: number }) {
  const { colors } = useTheme();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage copy flips halfway through the (~2s) service call.
    const t = setTimeout(() => setStage(1), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ alignItems: 'center', paddingVertical: 72 }}>
      <ActivityIndicator size="large" color={colors.primary} />
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
      <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center' }}>
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
  const setQuotesViewed = useAppStore((s) => s.setQuotesViewed);
  const setIsNewUser = useAppStore((s) => s.setIsNewUser);
  const setDamageRequestId = useAppStore((s) => s.setDamageRequestId);
  const { active, brand } = useActiveVehicle();
  const [submitting, setSubmitting] = useState(false);
  // YOLO safety guard: a non-null message means the photos were rejected.
  const [rejected, setRejected] = useState<string | null>(null);

  const onSubmit = async () => {
    setSubmitting(true);
    setRejected(null);
    try {
      // The AI estimate comes from the swappable DamageEstimator adapter
      // (services/damage-ai when EXPO_PUBLIC_DAMAGE_AI_URL is set, deterministic
      // mock otherwise). Pad to ~2s so the analyzing stages read.
      const vehicle = active
        ? { make: brand, model: modelOf(active.name, brand), year: (active.name.match(/\b(19|20)\d{2}\b/) ?? [])[0] }
        : undefined;
      const [estimate] = await Promise.all([
        damageEstimator.estimate({ parts: damageParts, vehicle }),
        new Promise((r) => setTimeout(r, 2000)),
      ]);

      // Safety guard: if YOLO isn't confident the photos show car damage, stop
      // here — no range, no quote request, no points.
      if (estimate.rejected) {
        setRejected(
          estimate.rejectReason ??
            "We couldn't confidently detect car damage in these photos.",
        );
        return;
      }

      const { afterHours, pointsEarned } = await quoteService.submitDamageRequest(damageParts);
      addPoints(pointsEarned, 'Submitted damage photos');
      // Carry the AI analysis (range + confidence) to Submitted/DealerQuotes.
      setAiEstimate(estimate.aiEstimate);
      setQuotesViewed(false); // new quotes → show the unread badge on the Quotes tab
      setIsNewUser(false); // first estimate submitted → drop the "New here?" hint
      // Persist the estimate (full model JSON + versions) + photos (no-op if
      // unconfigured), then remember the request id so the accepted repair
      // booking links back to it for calibration.
      saveDamageEstimate(damageParts, estimate)
        .then((id) => id && setDamageRequestId(id))
        .catch(() => {});
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

  // YOLO safety guard fired — show why and how to retake instead of a range.
  if (rejected) {
    return (
      <Screen>
        <View style={{ alignItems: 'center', paddingTop: spacing.xl, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 44, marginBottom: spacing.sm }}>🚫</Text>
          <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginBottom: 6, textAlign: 'center' }}>
            Couldn’t detect car damage
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 }}>
            {rejected}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.warningSurface,
            borderWidth: 1,
            borderColor: colors.warning,
            borderRadius: radii.md,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.warningDeep, marginBottom: 4 }}>
            Tips for a good photo
          </Text>
          <Text style={{ fontSize: 13, color: colors.warningDeep, lineHeight: 20 }}>
            • Fill the frame with the damaged part{'\n'}• Good, even lighting — avoid glare{'\n'}• Hold steady, about 1–2 ft away{'\n'}• Make sure the actual dent / scratch / crack is in view
          </Text>
        </View>
        <PrimaryButton
          label="Retake photos →"
          onPress={() => {
            setRejected(null);
            navigation.navigate('CarDiagram');
          }}
        />
        <Tappable
          onPress={() => setRejected(null)}
          style={({ pressed }) => ({
            marginTop: spacing.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Back to my parts</Text>
        </Tappable>
      </Screen>
    );
  }

  return (
    <Screen>
      <SubmitProgress step={2} left="Confirm parts" right="Almost there" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Parts selected ({damageParts.length})</SectionLabel>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>Step 2 of 2</Text>
      </View>

      {damageParts.length === 0 ? (
        <Text
          style={{
            fontSize: 14,
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
              navigation.navigate('CarDiagram');
            }}
            onRemove={() => removePart(i)}
          />
        ))
      )}

      <View style={{ marginVertical: spacing.sm }} />

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
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
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
      <Text style={{ textAlign: 'center', fontSize: 14, color: colors.textTertiary }}>
        Sending to {QUOTE_REQUEST.shopsNotified} verified shops in {QUOTE_REQUEST.city}
      </Text>
    </Screen>
  );
}
