import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { SubmitProgress } from '../../components/SubmitProgress';
import { Tappable } from '../../components/Tappable';
import { Card, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPES, SIDE_MISC_PART } from '../../services/mock/data';
import { pickFromGallery } from '../../services/photos';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CarDiagram'>;

const MAX_PHOTOS = 10;
const PANEL_H = 300;

/** Side-profile parts (front→rear). `suffix` builds the stored name ("L. Fender"). */
const SIDE_PARTS = [
  { suffix: 'Fender', label: 'Front\nfender', flex: 1.05 },
  { suffix: 'Front door', label: 'Front\ndoor', flex: 1 },
  { suffix: 'Rear door', label: 'Rear\ndoor', flex: 1 },
  { suffix: 'Rear fender', label: 'Rear\nfender', flex: 1.15 },
] as const;

/** Top-down parts (front→rear). `h` set → fixed thin band; otherwise flex. */
const TOP_PARTS = [
  { name: 'Front bumper', label: 'Front bumper', flex: 0, h: 30, narrow: true },
  { name: 'Hood', label: 'Hood', flex: 1.1, h: 0, narrow: false },
  { name: 'Windshield', label: 'Windshield', flex: 0, h: 22, narrow: false },
  { name: 'Roof', label: 'Roof', flex: 1.5, h: 0, narrow: false },
  { name: 'Rear glass', label: 'Rear glass', flex: 0, h: 22, narrow: false },
  { name: 'Trunk', label: 'Trunk', flex: 1.1, h: 0, narrow: false },
  { name: 'Rear bumper', label: 'Rear bumper', flex: 0, h: 30, narrow: true },
] as const;

/** One tappable car-part region (single-select; ✓ once photos have been added). */
function PartBand({
  label,
  selected,
  done,
  onPress,
  flex,
  height,
  narrow,
  fontSize = 10,
}: {
  label: string;
  selected: boolean;
  done: boolean;
  onPress: () => void;
  flex?: number;
  height?: number;
  narrow?: boolean;
  fontSize?: number;
}) {
  const { colors } = useTheme();
  const bg = selected ? palette.primaryDark : done ? colors.successSurface : colors.surface;
  const fg = selected ? '#fff' : done ? colors.successDark : colors.textSecondary;
  const bc = selected ? palette.primary : done ? colors.success : colors.border;
  return (
    <Tappable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: flex || undefined,
        height,
        marginHorizontal: narrow ? 16 : 0,
        backgroundColor: bg,
        borderWidth: selected || done ? 2 : 1,
        borderColor: bc,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize, fontWeight: '700', color: fg, textAlign: 'center', lineHeight: fontSize + 2 }}>
        {(selected || done ? '✓ ' : '') + label}
      </Text>
    </Tappable>
  );
}

/** Decorative wheel circle (tyre with rim) layered over the body edges. */
function Wheel({ style }: { style: object }) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          width: 15,
          height: 24,
          borderRadius: 5,
          backgroundColor: '#1c2230',
          borderWidth: 2,
          borderColor: '#0d111a',
        },
        style,
      ]}
    />
  );
}

/**
 * Wireframe s-car-diagram (v17 redesign): three car views — left side profile,
 * top-down, right side profile — each part tappable. Picking a part expands the
 * upload section inline below (the separate upload screen is gone).
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
  const note = useAppStore((s) => s.draftNote);
  const setNote = useAppStore((s) => s.setDraftNote);
  const [picking, setPicking] = useState(false);

  const isDone = (name: string) => damageParts.some((p) => p.part === name);

  const upload = async () => {
    if (picking || photoUris.length >= MAX_PHOTOS) return;
    setPicking(true);
    try {
      const photo = await pickFromGallery();
      if (photo) addPhoto(photo.uri);
    } finally {
      setPicking(false);
    }
  };

  const onSave = () => {
    commitDraftPart();
    navigation.navigate('ConfirmSubmit');
  };

  /** Render one side profile (front at top) with two wheels on the ground edge. */
  const sidePanel = (side: 'L' | 'R') => {
    const onLeft = side === 'L';
    // Driver/passenger side columns are narrower so the top-down view leads.
    return (
      <View style={{ flex: 0.78, height: PANEL_H, position: 'relative' }}>
        <View
          style={{
            flex: 1,
            gap: 5,
            paddingLeft: onLeft ? 16 : 0,
            paddingRight: onLeft ? 0 : 16,
          }}
        >
          {SIDE_PARTS.map((p) => {
            const name = `${side}. ${p.suffix}`;
            return (
              <PartBand
                key={name}
                label={p.label}
                flex={p.flex}
                fontSize={9}
                selected={draftPart === name}
                done={isDone(name)}
                onPress={() => pickPart(name)}
              />
            );
          })}
          <PartBand
            label="Step"
            height={20}
            fontSize={9}
            selected={draftPart === `${side}. Step`}
            done={isDone(`${side}. Step`)}
            onPress={() => pickPart(`${side}. Step`)}
          />
        </View>
        {/* Wheels sit in the outer gutter (the side that touches the ground) */}
        <Wheel style={onLeft ? { left: 0, top: 52 } : { right: 0, top: 52 }} />
        <Wheel style={onLeft ? { left: 0, top: PANEL_H - 116 } : { right: 0, top: PANEL_H - 116 }} />
      </View>
    );
  };

  return (
    <Screen>
      <SubmitProgress step={1} left="Avg 2 min" right="Let's go 🚗" />

      <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs }}>
        Where is it damaged?
      </Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.sm }}>
        Tap the panel on the car — left side, top, or right side.
      </Text>

      {/* Three car views: left side · top-down · right side */}
      <View
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'stretch' }}>
          {/* Left side profile (driver) */}
          {sidePanel('L')}

          {/* Top-down view */}
          <View style={{ flex: 1.35, height: PANEL_H, position: 'relative' }}>
            <View style={{ flex: 1, gap: 5 }}>
              {TOP_PARTS.map((p) => (
                <PartBand
                  key={p.name}
                  label={p.label}
                  flex={p.flex || undefined}
                  height={p.h || undefined}
                  narrow={p.narrow}
                  fontSize={p.h && p.h <= 22 ? 9 : 10}
                  selected={draftPart === p.name}
                  done={isDone(p.name)}
                  onPress={() => pickPart(p.name)}
                />
              ))}
            </View>
            {/* Four wheels at the corners of the roof line */}
            <Wheel style={{ left: -4, top: 56 }} />
            <Wheel style={{ right: -4, top: 56 }} />
            <Wheel style={{ left: -4, bottom: 56 }} />
            <Wheel style={{ right: -4, bottom: 56 }} />
          </View>

          {/* Right side profile (passenger) */}
          {sidePanel('R')}
        </View>

        {/* Panel captions */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          {['Driver side', 'Top view', 'Passenger side'].map((cap, i) => (
            <Text
              key={cap}
              style={{
                flex: i === 1 ? 1.35 : 0.78,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: '700',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
              }}
            >
              {cap}
            </Text>
          ))}
        </View>
      </View>

      {/* Side mirror / glass / wheel / light */}
      <Tappable
        onPress={() => pickPart(SIDE_MISC_PART)}
        style={{
          alignSelf: 'center',
          backgroundColor: draftPart === SIDE_MISC_PART ? palette.primaryDark : colors.surface,
          borderColor: draftPart === SIDE_MISC_PART ? palette.primary : colors.border,
          borderWidth: 1.5,
          borderRadius: radii.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: 10,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: draftPart === SIDE_MISC_PART ? '#fff' : colors.textSecondary }}>
          Side mirror / Glass / Wheel / Light
        </Text>
      </Tappable>

      {/* Inline expansion: upload photos for the selected part */}
      {draftPart ? (
        <Card style={{ padding: spacing.md }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
            Damage photos · {draftPart}{' '}
            <Text style={{ color: colors.danger, fontSize: 13 }}>(required)</Text>
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.sm }}>
            More photos = a more accurate estimate.
          </Text>

          {/* Damage type — multi-select */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            {DAMAGE_TYPES.map((tp) => {
              const on = draftTypes.includes(tp);
              return (
                <Tappable
                  key={tp}
                  onPress={() => toggleDraftType(tp)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: on ? colors.primary : colors.surface,
                    borderRadius: radii.pill,
                    borderWidth: on ? 0 : StyleSheet.hairlineWidth,
                    borderColor: colors.border,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                  }}
                >
                  {on ? <Text style={{ color: colors.onPrimary, fontSize: 13 }}>✓</Text> : null}
                  <Text style={{ fontSize: 14, fontWeight: on ? '600' : '400', color: on ? colors.onPrimary : colors.textSecondary }}>
                    {tp}
                  </Text>
                </Tappable>
              );
            })}
          </View>

          {/* Photos */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textTertiary, marginBottom: spacing.xs }}>
            Photos {photoUris.length}/{MAX_PHOTOS}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            {photoUris.map((uri, i) => (
              <View key={`${uri}-${i}`} style={{ width: 72, height: 64 }}>
                <View style={{ width: 72, height: 64, borderRadius: radii.sm, overflow: 'hidden', backgroundColor: colors.surfaceAlt }}>
                  <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                </View>
                <Tappable
                  onPress={() => removePhoto(i)}
                  hitSlop={8}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: 'rgba(0,0,0,.7)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 15 }}>✕</Text>
                </Tappable>
              </View>
            ))}
            {photoUris.length < MAX_PHOTOS ? (
              <Tappable
                onPress={upload}
                disabled={picking}
                style={{
                  width: 72,
                  height: 64,
                  borderRadius: radii.sm,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {picking ? <ActivityIndicator color={colors.primary} /> : <Text style={{ fontSize: 18, color: colors.primary }}>📷＋</Text>}
              </Tappable>
            ) : null}
          </View>

          {/* Description */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textTertiary, marginBottom: spacing.xs }}>
            Add a description <Text style={{ fontWeight: '400' }}>(optional)</Text>
          </Text>
          <TextInputArea note={note} setNote={setNote} />

          <PrimaryButton
            label={photoUris.length >= 1 ? 'Save →' : 'Add at least one photo'}
            disabled={photoUris.length < 1}
            onPress={onSave}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      ) : (
        <View
          style={{
            backgroundColor: palette.aiPanel,
            borderRadius: radii.md,
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <View style={{ width: 46, height: 46, borderRadius: radii.md, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22 }}>📍</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 }}>Select a damaged part</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
              Tap a part above to add photos {damageParts.length > 0 ? `· ${damageParts.length} added` : ''}
            </Text>
          </View>
        </View>
      )}

      {damageParts.length > 0 && !draftPart ? (
        <PrimaryButton label="Review & submit →" onPress={() => navigation.navigate('ConfirmSubmit')} style={{ marginTop: spacing.md }} />
      ) : null}
    </Screen>
  );
}

/** Small wrapper so the multiline input keeps its own import footprint local. */
function TextInputArea({ note, setNote }: { note: string; setNote: (s: string) => void }) {
  const { colors } = useTheme();
  return (
    <TextInput
      value={note}
      onChangeText={setNote}
      multiline
      maxLength={100}
      placeholder="Damage not visible in the photos, or any extra request."
      placeholderTextColor={colors.textTertiary}
      style={{
        minHeight: 64,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: radii.md,
        padding: spacing.md,
        fontSize: 14,
        color: colors.textPrimary,
        textAlignVertical: 'top',
      }}
    />
  );
}
