import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  // Idle bands are transparent so the car silhouette behind shows through.
  const bg = selected ? palette.primaryDark : done ? colors.successSurface : 'transparent';
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

// Car-body silhouette paths (front at top). Drawn behind the part bands so the
// three panels read as a left side / top-down / right side view of the car.
const TOP_PATH =
  'M30,4 C16,6 8,16 7,40 C6,70 6,90 6,150 C6,210 6,230 7,260 C8,284 16,294 30,296 ' +
  'C42,298 58,298 70,296 C84,294 92,284 93,260 C94,230 94,210 94,150 ' +
  'C94,90 94,70 93,40 C92,16 84,6 70,4 C58,2 42,2 30,4 Z';
const SIDE_PATH =
  'M16,5 C8,8 4,18 4,42 C3,90 3,210 4,258 C4,282 8,292 16,295 ' +
  'C24,298 36,298 44,295 C52,292 56,282 56,258 C57,210 57,90 56,42 ' +
  'C56,18 52,8 44,5 C36,2 24,2 16,5 Z';

/** Light car-body silhouette drawn behind a panel's part bands. */
function CarSilhouette({ variant }: { variant: 'top' | 'side' }) {
  const { colors } = useTheme();
  const isTop = variant === 'top';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox={isTop ? '0 0 100 300' : '0 0 60 300'}
        preserveAspectRatio="none"
      >
        <Path
          d={isTop ? TOP_PATH : SIDE_PATH}
          fill={colors.surface}
          stroke={colors.textTertiary}
          strokeOpacity={0.4}
          strokeWidth={1.2}
        />
      </Svg>
    </View>
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
    return (
      <View style={{ flex: 1, height: PANEL_H, position: 'relative' }}>
        <CarSilhouette variant="side" />
        <View
          style={{
            flex: 1,
            gap: 4,
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
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.sm }}>
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
            <CarSilhouette variant="top" />
            <View style={{ flex: 1, gap: 4 }}>
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
                flex: i === 1 ? 1.35 : 1,
                textAlign: 'center',
                fontSize: 10,
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
        <Text style={{ fontSize: 13, fontWeight: '600', color: draftPart === SIDE_MISC_PART ? '#fff' : colors.textSecondary }}>
          Side mirror / Glass / Wheel / Light
        </Text>
      </Tappable>

      {/* Inline expansion: upload photos for the selected part */}
      {draftPart ? (
        <Card style={{ padding: spacing.md }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
            Damage photos · {draftPart}{' '}
            <Text style={{ color: colors.danger, fontSize: 12 }}>(required)</Text>
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm }}>
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
                  {on ? <Text style={{ color: colors.onPrimary, fontSize: 12 }}>✓</Text> : null}
                  <Text style={{ fontSize: 13, fontWeight: on ? '600' : '400', color: on ? colors.onPrimary : colors.textSecondary }}>
                    {tp}
                  </Text>
                </Tappable>
              );
            })}
          </View>

          {/* Photos */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary, marginBottom: spacing.xs }}>
            Photos {photoUris.length}/{MAX_PHOTOS}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            {photoUris.map((uri, i) => (
              <View key={`${uri}-${i}`} style={{ width: 72, height: 64, borderRadius: radii.sm, overflow: 'hidden', backgroundColor: colors.surfaceAlt }}>
                <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
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
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary, marginBottom: spacing.xs }}>
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
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
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
        fontSize: 13,
        color: colors.textPrimary,
        textAlignVertical: 'top',
      }}
    />
  );
}
