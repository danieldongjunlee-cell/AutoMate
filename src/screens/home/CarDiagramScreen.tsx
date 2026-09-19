import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SubmitProgress } from '../../components/SubmitProgress';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPES } from '../../services/mock/data';
import { pickFromGallery } from '../../services/photos';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { BlueprintPicker } from './BlueprintPicker';
import { PART_NAMES, PartKey } from './carBlueprint';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CarDiagram'>;

const PHOTO_SLOTS = 4;

const KEY_BY_NAME = Object.fromEntries(Object.entries(PART_NAMES).map(([k, v]) => [v, k])) as Record<string, PartKey>;

/**
 * Damage picker (canvas "Damage picker"): blueprint of the car with every
 * part tappable in exactly one view. The selected part's name sits in a
 * centred blue pill above the diagram; tapping a part opens the capture
 * section inline below it (damage type, four photo slots, description),
 * then "Add another part" or "Continue".
 */
export function CarDiagramScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const draftPart = useAppStore((s) => s.draftPart);
  const damageParts = useAppStore((s) => s.damageParts);
  const pickPart = useAppStore((s) => s.pickPart);
  const draftTypes = useAppStore((s) => s.draftTypes);
  const toggleDraftType = useAppStore((s) => s.toggleDraftType);
  const photoUris = useAppStore((s) => s.draftPhotos);
  const addPhoto = useAppStore((s) => s.addDraftPhoto);
  const removePhoto = useAppStore((s) => s.removeDraftPhoto);
  const commitDraftPart = useAppStore((s) => s.commitDraftPart);
  const resetDraft = useAppStore((s) => s.resetDraft);
  const note = useAppStore((s) => s.draftNote);
  const setNote = useAppStore((s) => s.setDraftNote);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const pendingVehicle = useAppStore((s) => s.pendingVehicle);
  const { active } = useActiveVehicle();
  const [picking, setPicking] = useState(false);

  // The capture section slides open right under the diagram when a part is
  // picked, and the page scrolls so it's in view.
  const reveal = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef(0);
  useEffect(() => {
    if (!draftPart) {
      reveal.setValue(0);
      return;
    }
    reveal.setValue(0);
    Animated.spring(reveal, { toValue: 1, useNativeDriver: false, speed: 16, bounciness: 4 }).start();
    const t = setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, sectionY.current - 80), animated: true }), 60);
    return () => clearTimeout(t);
  }, [draftPart, reveal]);

  const selectedKey: PartKey | null = draftPart ? (KEY_BY_NAME[draftPart] ?? null) : null;
  const doneKeys = useMemo(
    () => new Set(damageParts.map((p) => KEY_BY_NAME[p.part]).filter((k): k is PartKey => !!k)),
    [damageParts],
  );
  // "Part n" — this part's slot in the list (existing entry, or the next one).
  const partIndex = draftPart ? (damageParts.findIndex((p) => p.part === draftPart) + 1 || damageParts.length + 1) : 0;

  const upload = async () => {
    if (picking || photoUris.length >= PHOTO_SLOTS) return;
    setPicking(true);
    try {
      const photo = await pickFromGallery();
      if (photo) addPhoto(photo.uri);
    } finally {
      setPicking(false);
    }
  };

  // Both are required: at least one damage label AND at least one photo.
  const canSave = draftTypes.length >= 1 && photoUris.length >= 1;
  const saveHint = !canSave ? (draftTypes.length < 1 ? 'Pick a damage type' : 'Add at least one photo') : null;

  const goOn = () => {
    // Car details come right after the damaged part — but only once. Guests
    // (and signed-in users with no car on file) fill them here; otherwise
    // straight to review.
    const needsCarDetails = (!isAuthenticated || !active) && !pendingVehicle;
    navigation.navigate(needsCarDetails ? 'EstimateIntake' : 'ConfirmSubmit');
  };
  const onContinue = () => {
    if (!canSave) return;
    commitDraftPart();
    goOn();
  };
  const onAddAnother = () => {
    if (!canSave) return;
    commitDraftPart();
    resetDraft();
  };

  const chip = (label: string) => {
    const on = draftTypes.includes(label);
    return (
      <Tappable
        key={label}
        onPress={() => toggleDraftType(label)}
        style={{
          backgroundColor: on ? colors.primary : colors.inputBg,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: on ? colors.primary : colors.border,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: on ? '#fff' : colors.textSecondary }}>{label}</Text>
      </Tappable>
    );
  };

  const slot = (i: number) => {
    const uri = photoUris[i];
    const isNext = i === photoUris.length;
    if (uri) {
      return (
        <View key={i} style={{ flex: 1, height: 66 }}>
          <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surfaceAlt }}>
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          </View>
          <Tappable
            onPress={() => removePhoto(i)}
            hitSlop={8}
            accessibilityLabel="Remove photo"
            style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,.75)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="close" size={13} color="#fff" strokeWidth={2.4} />
          </Tappable>
        </View>
      );
    }
    return (
      <Tappable
        key={i}
        onPress={upload}
        disabled={picking || !isNext}
        accessibilityLabel={isNext ? 'Add photo' : undefined}
        style={{
          flex: 1,
          height: 66,
          borderRadius: 12,
          borderWidth: 1.2,
          borderStyle: isNext ? 'solid' : 'dashed',
          borderColor: isNext ? colors.primaryLight : colors.border,
          backgroundColor: isNext ? colors.inputBg : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isNext ? 1 : 0.5,
        }}
      >
        {picking && isNext ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Icon name={isNext ? 'camera' : 'plus'} size={isNext ? 26 : 20} color={isNext ? colors.primaryDark : colors.textTertiary} />
        )}
      </Tappable>
    );
  };

  return (
    <Screen scrollRef={scrollRef}>
      <SubmitProgress step={1} left="Avg 2 min" right="Let's go" />

      {/* Selected part — centred blue pill with a teal dot */}
      <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.primarySurface,
            borderWidth: 1,
            borderColor: draftPart ? colors.primary : colors.border,
            borderRadius: radii.pill,
            paddingHorizontal: 18,
            paddingVertical: 8,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: draftPart ? palette.teal : colors.textTertiary }} />
          <Text style={{ fontSize: 17, fontWeight: '800', color: draftPart ? colors.textPrimary : colors.textSecondary }}>
            {draftPart ?? 'Tap the damaged part'}
          </Text>
        </View>
      </View>

      {/* A part that already has photos can't be picked again — remove it on the review step instead. */}
      <BlueprintPicker selected={selectedKey} done={doneKeys} onPick={(k) => (doneKeys.has(k) ? undefined : pickPart(PART_NAMES[k]))} />

      {draftPart ? (
        <Animated.View
          onLayout={(e) => (sectionY.current = e.nativeEvent.layout.y)}
          style={{
            marginTop: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.tile,
            padding: spacing.lg,
            gap: 12,
            opacity: reveal,
            transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }, { scaleY: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>Damage type</Text>
            <View style={{ backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primaryDark }}>Part {partIndex}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{DAMAGE_TYPES.map(chip)}</View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>{Array.from({ length: PHOTO_SLOTS }, (_, i) => slot(i))}</View>

          <TextInput
            value={note}
            onChangeText={setNote}
            maxLength={100}
            placeholder="Describe the damage (optional)"
            placeholderTextColor={colors.textTertiary}
            style={{
              height: 44,
              backgroundColor: colors.inputBg,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              fontSize: 14,
              color: colors.textPrimary,
            }}
          />

          {saveHint ? <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>{saveHint}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PrimaryButton label="Add another part" variant="outline" disabled={!canSave} onPress={onAddAnother} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 6 }} textStyle={{ fontSize: 14 }} />
            <PrimaryButton label="Continue" disabled={!canSave} onPress={onContinue} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 6 }} textStyle={{ fontSize: 15 }} />
          </View>
        </Animated.View>
      ) : damageParts.length > 0 ? (
        <PrimaryButton
          label={`Continue with ${damageParts.length} ${damageParts.length === 1 ? 'part' : 'parts'}`}
          onPress={goOn}
          style={{ marginTop: spacing.md }}
        />
      ) : (
        <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md }}>
          Tap a panel, window, wheel or light to add photos.
        </Text>
      )}
    </Screen>
  );
}
