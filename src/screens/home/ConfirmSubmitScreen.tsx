import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Badge, SectionLabel, Screen } from '../../components/ui';
import { SubmitProgress } from '../../components/SubmitProgress';
import { useRequireAuth, useResumeAfterAuth } from '../../hooks/useRequireAuth';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPE_SEVERITY, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService, vehiclesService } from '../../services';
import { saveDamageEstimate } from '../../lib/damageEstimates';
import { damageEstimator, DamageEstimateResult } from '../../lib/damageEstimator';
import { navigateCrossTab } from '../../navigation/crossTab';
import { brandOf, modelOf, useActiveVehicle } from '../../hooks/useActiveVehicle';
import { DamagePart, submissionKey, useAppStore } from '../../store/useAppStore';
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
  const setActiveVehicle = useAppStore((s) => s.setActiveVehicle);
  const setPendingVehicle = useAppStore((s) => s.setPendingVehicle);
  const { active, brand } = useActiveVehicle();
  const queryClient = useQueryClient();
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [submitting, setSubmitting] = useState(false);
  // YOLO safety guard: a non-null message means the photos were rejected.
  const [rejected, setRejected] = useState<string | null>(null);
  // The AI result held after analysis, until a guest signs in / up to unlock it.
  const [pendingEstimate, setPendingEstimate] = useState<DamageEstimateResult | null>(null);
  // A prior quote request exists: 'replace' warns the old quotes get removed;
  // 'duplicate' additionally flags that this submission is identical to it.
  const [existingPrompt, setExistingPrompt] = useState<'replace' | 'duplicate' | null>(null);
  // Guest preview after analysis: AI range visible, shop quotes blurred behind
  // a "sign up / log in" gate.
  const [showPreview, setShowPreview] = useState(false);

  /** Run the AI analysis only (no quote request yet). ~2s so the stages read. */
  const analyze = async (): Promise<DamageEstimateResult> => {
    const pending = useAppStore.getState().pendingVehicle;
    const vehicleName = active?.name ?? pending?.name;
    const vBrand = vehicleName ? brandOf(vehicleName) : brand;
    const vehicle = vehicleName
      ? { make: vBrand, model: modelOf(vehicleName, vBrand), year: (vehicleName.match(/\b(19|20)\d{2}\b/) ?? [])[0] }
      : undefined;
    const [estimate] = await Promise.all([
      damageEstimator.estimate({ parts: damageParts, vehicle }),
      new Promise((r) => setTimeout(r, 2000)),
    ]);
    return estimate;
  };

  /** Signature of what's about to be submitted (parts + photos + car). */
  const newSubmissionKey = () => {
    const pending = useAppStore.getState().pendingVehicle;
    return submissionKey(damageParts, active?.name ?? pending?.name);
  };

  /** Which prior-request prompt to show: identical submission → 'duplicate'. */
  const promptFor = (): 'replace' | 'duplicate' => {
    const prev = useAppStore.getState().lastSubmissionKey;
    return prev && prev === newSubmissionKey() ? 'duplicate' : 'replace';
  };

  /** Persist the car + submit the quote request, then open the result screen
   *  (AI estimate range + "View available quotes"). */
  const finalize = async (estimate: DamageEstimateResult) => {
    setExistingPrompt(null);
    setSubmitting(true);
    try {
      // A new user just signed up — persist the car they entered during intake.
      const pending = useAppStore.getState().pendingVehicle;
      // Snapshot before pendingVehicle is consumed — this key identifies the
      // request so an identical resubmission can be flagged as a duplicate.
      const subKey = submissionKey(damageParts, active?.name ?? pending?.name);
      if (pending) {
        vehiclesService
          .addVehicle({ name: pending.name, colorName: pending.colorName })
          .then((r) => {
            setActiveVehicle(r.vehicle.id);
            void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          })
          .catch(() => {});
        setPendingVehicle(null);
      }
      const { afterHours, pointsEarned } = await quoteService.submitDamageRequest(damageParts);
      addPoints(pointsEarned, 'Submitted damage photos');
      setAiEstimate(estimate.aiEstimate);
      setQuotesViewed(false); // new quotes → unread badge on the Quotes tab
      setIsNewUser(false);
      useAppStore.getState().setLastSubmissionKey(subKey);
      saveDamageEstimate(damageParts, estimate)
        .then((id) => id && setDamageRequestId(id))
        .catch(() => {});
      setPendingEstimate(null);
      navigation.navigate(afterHours ? 'AfterHours' : 'Submitted');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit → analyze FIRST (so the range exists), then gate. Signed-in users go
  // straight to results; guests are asked to log in / sign up to unlock the AI
  // range + real quotes, and resumed after auth.
  const onSubmit = async () => {
    setSubmitting(true);
    setRejected(null);
    let estimate: DamageEstimateResult;
    try {
      estimate = await analyze();
    } catch {
      setSubmitting(false);
      return;
    }
    if (estimate.rejected) {
      setRejected(estimate.rejectReason ?? "We couldn't confidently detect car damage in these photos.");
      setSubmitting(false);
      return;
    }
    if (isAuthenticated) {
      // An open request already exists (submitted earlier this session) —
      // warn before replacing it instead of silently overwriting.
      if (useAppStore.getState().lastSubmissionKey) {
        setSubmitting(false);
        setPendingEstimate(estimate);
        setExistingPrompt(promptFor());
        return;
      }
      await finalize(estimate);
      return;
    }
    // Guest: persist the AI estimate now so the Quotes tab shows the range +
    // submitted parts even if they decide NOT to sign up (the shop quotes stay
    // gated). Then show the estimate + blurred-quotes preview.
    setAiEstimate(estimate.aiEstimate);
    setQuotesViewed(false);
    setSubmitting(false);
    setPendingEstimate(estimate);
    setShowPreview(true);
  };

  // After the guest authenticates from the preview: a fresh sign-up submits
  // straight away (everything they entered as a guest carries into the new
  // account — car, parts, estimate, quotes). A returning user who already has
  // an open quote request gets the replace warning first — or the duplicate
  // prompt when this submission is identical (same parts, photos and car).
  useResumeAfterAuth('unlockEstimate', () => {
    const est = pendingEstimate;
    if (!est) return;
    setShowPreview(false);
    const returning = !useAppStore.getState().isNewUser;
    const hasPriorRequest = Boolean(useAppStore.getState().lastSubmissionKey) || Boolean(active);
    if (returning && hasPriorRequest) {
      setExistingPrompt(promptFor());
    } else {
      void finalize(est);
    }
  });

  // In-screen analyzing state while the AI service call runs.
  if (submitting) {
    return (
      <Screen>
        <AnalyzingState partCount={damageParts.length} />
      </Screen>
    );
  }

  // A prior open quote request exists — ask before replacing it. The
  // 'duplicate' variant additionally flags that this submission is identical
  // (same parts, photos and car) to the one already out with the shops.
  if (existingPrompt) {
    const dup = existingPrompt === 'duplicate';
    return (
      <Screen>
        <View style={{ alignItems: 'center', paddingTop: spacing.xl, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 44, marginBottom: spacing.sm }}>{dup ? '🔁' : '📋'}</Text>
          <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginBottom: 6, textAlign: 'center' }}>
            {dup ? 'Same as your previous request' : 'You already have an open quote request'}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 }}>
            {dup ? (
              <>
                This submission has the{' '}
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                  same damaged part, photos and car
                </Text>{' '}
                as the request you already submitted. Do you still want to replace it?
              </>
            ) : (
              <>
                There&apos;s an unresolved quote request
                {active?.name ? (
                  <>
                    {' '}for your{' '}
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{active.name}</Text>
                  </>
                ) : null}{' '}
                with quotes already received from auto shops. Do you want to replace it with this
                new submission?
              </>
            )}
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
          <Text style={{ fontSize: 13, color: colors.warningDeep, lineHeight: 20 }}>
            ⚠️ Submitting the new request removes your previous quotes, and you&apos;ll wait to
            receive new quotes until the auto shops respond.
          </Text>
        </View>
        <PrimaryButton
          label="Keep my existing quotes"
          onPress={() => {
            setExistingPrompt(null);
            setPendingEstimate(null);
            navigateCrossTab(navigation, 'QuotesTab', 'Quotes');
          }}
          style={{ marginBottom: spacing.sm }}
        />
        <PrimaryButton
          variant="outline"
          label={dup ? 'Replace anyway →' : 'Replace & submit new request →'}
          onPress={() => pendingEstimate && finalize(pendingEstimate)}
          style={{ marginBottom: spacing.sm }}
        />
        <Tappable
          onPress={() => {
            setExistingPrompt(null);
            setPendingEstimate(null);
          }}
          style={{ alignItems: 'center', paddingVertical: spacing.sm }}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Back to my parts</Text>
        </Tappable>
      </Screen>
    );
  }

  // Guest, post-analysis: AI estimate visible, shop quotes blurred behind a
  // sign-up / log-in gate. The CTA opens the returning/new chooser.
  if (showPreview && pendingEstimate) {
    const est = pendingEstimate.aiEstimate;
    return (
      <Screen>
        <SubmitProgress step={3} left="Your estimate" right="Sign in to see quotes" />
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderWidth: 1,
            borderColor: colors.success,
            borderRadius: radii.md,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.successDeep, marginBottom: 4 }}>
            🤖 AI estimated repair cost
          </Text>
          <Text style={{ fontSize: 30, fontWeight: '800', color: colors.successDeep }}>
            ${est.priceLow}–${est.priceHigh}
          </Text>
          <Text style={{ fontSize: 13, color: colors.successDark, marginTop: 2 }}>
            {est.confidencePct}% confidence · before shop inspection
          </Text>
        </View>

        <SectionLabel>Quotes from nearby shops</SectionLabel>
        <View style={{ position: 'relative', marginBottom: spacing.lg }}>
          {/* Obscured (faded) shop rows — the real quotes are hidden until auth. */}
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
                opacity: 0.45,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border }} />
              <View style={{ flex: 1, gap: 7 }}>
                <View style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: colors.border }} />
                <View style={{ width: '40%', height: 10, borderRadius: 5, backgroundColor: colors.divider }} />
              </View>
              <View style={{ width: 58, height: 24, borderRadius: 6, backgroundColor: colors.border }} />
            </View>
          ))}
          {/* Lock card centered over the blurred list. */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 5,
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🔒</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
                Quotes from nearby shops
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 2 }}>
                Sign up or log in to view these quotes
              </Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          label="Sign up or log in to view quotes →"
          onPress={() => requireAuth('unlockEstimate')}
        />
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
