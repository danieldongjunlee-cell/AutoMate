import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { SubmitProgress } from '../../components/SubmitProgress';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { CAR_PART_ROWS, DAMAGE_TYPES, PartCell, SIDE_MISC_PART } from '../../services/mock/data';
import { pickFromGallery } from '../../services/photos';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CarDiagram'>;

const SIDE_W = 64;
const MAX_PHOTOS = 10;

/** One tappable car part (single-select; ✓ when photos have been captured). */
function PartTile({
  name,
  selected,
  done,
  vertical,
  onPress,
  minHeight,
}: {
  name: string;
  selected: boolean;
  done?: boolean;
  vertical?: boolean;
  onPress: () => void;
  minHeight?: number;
}) {
  const { colors } = useTheme();
  const bg = selected ? palette.primaryDark : done ? colors.successSurface : colors.surface;
  const fg = selected ? '#fff' : done ? colors.successDark : colors.textSecondary;
  const borderColor = selected ? palette.primary : done ? colors.success : colors.border;
  const showCheck = selected || done;
  return (
    <Tappable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: vertical ? 1 : undefined,
        width: vertical ? SIDE_W : undefined,
        alignSelf: vertical ? undefined : 'stretch',
        backgroundColor: bg,
        borderRadius: radii.sm,
        borderWidth: selected || done ? 2 : 1.5,
        borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vertical ? spacing.sm : 12,
        paddingHorizontal: 4,
        minHeight,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: vertical ? 11 : 14, fontWeight: showCheck ? '700' : '600', color: fg, textAlign: 'center' }}>
        {showCheck ? `✓ ${name}` : name}
      </Text>
    </Tappable>
  );
}

/**
 * Wireframe s-car-diagram (v17 redesign): pick a part, then the upload section
 * expands inline below (photos + description) — the separate upload screen is
 * gone. Save commits the part and continues to confirm.
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

  return (
    <Screen>
      <SubmitProgress step={1} left="Avg 2 min" right="Let's go 🚗" />

      <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs }}>
        Where is it damaged?
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary }}>[ DRIVER ]</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary }}>[ PASSENGER ]</Text>
      </View>

      {/* Top-down car grid */}
      <View
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.sm,
          marginTop: spacing.sm,
          marginBottom: spacing.sm,
          gap: 6,
        }}
      >
        {CAR_PART_ROWS.map((row, i) => {
          if (row.length === 1) {
            return (
              <PartTile
                key={i}
                name={row[0].name}
                selected={draftPart === row[0].name}
                done={isDone(row[0].name)}
                onPress={() => pickPart(row[0].name)}
              />
            );
          }
          const [left, mid, right] = row;
          const tall = mid.name === 'Roof';
          return (
            <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'stretch' }}>
              <PartTile name={left.name} vertical selected={draftPart === left.name} done={isDone(left.name)} onPress={() => pickPart(left.name)} />
              <View style={{ flex: 1 }}>
                <PartTile name={mid.name} selected={draftPart === mid.name} done={isDone(mid.name)} onPress={() => pickPart(mid.name)} minHeight={tall ? 76 : 52} />
              </View>
              <PartTile name={right.name} vertical selected={draftPart === right.name} done={isDone(right.name)} onPress={() => pickPart(right.name)} />
            </View>
          );
        })}
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
