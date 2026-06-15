import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { LiveCamera } from '../../components/LiveCamera';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPES } from '../../services/mock/data';
import { capturePhoto, pickFromGallery } from '../../services/photos';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Camera'>;

const REQUIRED = 3;

/** Corner bracket for the viewfinder. */
function Bracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s: any = { position: 'absolute', width: 26, height: 26 };
  const b = { borderColor: palette.primary };
  if (pos === 'tl') Object.assign(s, { top: 10, left: 10, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4, ...b });
  if (pos === 'tr') Object.assign(s, { top: 10, right: 10, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4, ...b });
  if (pos === 'bl') Object.assign(s, { bottom: 10, left: 10, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4, ...b });
  if (pos === 'br') Object.assign(s, { bottom: 10, right: 10, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4, ...b });
  return <View style={s} />;
}

/**
 * Real camera (user-feedback pass 2, expo-image-picker): the viewfinder and
 * Capture button open the device camera (web: file picker w/ capture hint),
 * Upload opens the gallery. Captured uris live in the store draft and render
 * as real thumbnails here and on ConfirmSubmit.
 * Wireframe v15.10: damage type is tagged here at capture time (pickDmg chips).
 */
export function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const draftPart = useAppStore((s) => s.draftPart);
  const draftType = useAppStore((s) => s.draftType);
  const setDraftType = useAppStore((s) => s.setDraftType);
  const photoUris = useAppStore((s) => s.draftPhotos);
  const addPhoto = useAppStore((s) => s.addDraftPhoto);
  const commitDraftPart = useAppStore((s) => s.commitDraftPart);
  const note = useAppStore((s) => s.draftNote);
  const setNote = useAppStore((s) => s.setDraftNote);
  const [picking, setPicking] = useState(false);

  const photoCount = photoUris.length;
  const firstPart = (draftPart ?? 'rear bumper').toLowerCase();
  const canSubmit = photoCount >= 1;

  /** Device camera (Capture) or gallery (Upload) → push the real uri. */
  const addVia = async (source: 'camera' | 'gallery') => {
    if (picking) return;
    setPicking(true);
    try {
      const photo = source === 'camera' ? await capturePhoto() : await pickFromGallery();
      if (photo) addPhoto(photo.uri);
    } finally {
      setPicking(false);
    }
  };

  const onSubmit = () => {
    commitDraftPart(); // merge this part (type + photo uris) into the request
    navigation.navigate('ConfirmSubmit');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>
          Take 3+ photos of your{' '}
          <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{firstPart}</Text> from
          different angles
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>Step 1 of 2</Text>
      </View>

      {/* Damage type chips (tagged at capture time) */}
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textTertiary, marginBottom: spacing.sm }}>
        Damage type
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {DAMAGE_TYPES.map((t) => {
          const on = t === draftType;
          return (
            <Tappable
              key={t}
              onPress={() => setDraftType(t)}
              style={({ pressed }) => ({
                backgroundColor: on ? colors.primary : colors.surface,
                borderRadius: radii.pill,
                borderWidth: on ? 0 : StyleSheet.hairlineWidth,
                borderColor: colors.border,
                paddingHorizontal: 18,
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
              </Text>
            </Tappable>
          );
        })}
      </View>

      {/* Live in-app camera viewfinder — real device/web camera + shutter */}
      <LiveCamera
        height={210}
        shutterLabel="Capture photo"
        onCapture={addPhoto}
        overlay={
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {/* Rule-of-thirds grid */}
            {[1, 2].map((i) => (
              <View
                key={`v${i}`}
                style={{
                  position: 'absolute',
                  left: `${(i * 100) / 3}%`,
                  top: 0,
                  bottom: 0,
                  width: StyleSheet.hairlineWidth,
                  backgroundColor: 'rgba(255,255,255,.25)',
                }}
              />
            ))}
            {[1, 2].map((i) => (
              <View
                key={`h${i}`}
                style={{
                  position: 'absolute',
                  top: `${(i * 100) / 3}%`,
                  left: 0,
                  right: 0,
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: 'rgba(255,255,255,.25)',
                }}
              />
            ))}
            <Bracket pos="tl" />
            <Bracket pos="tr" />
            <Bracket pos="bl" />
            <Bracket pos="br" />
          </View>
        }
      />

      {/* Photo slots */}
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textTertiary, marginBottom: spacing.sm }}>
        Photos taken ({Math.min(photoCount, REQUIRED)} of {REQUIRED} required)
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        {Array.from({ length: REQUIRED }).map((_, i) => {
          if (i < photoCount) {
            return (
              <View
                key={`photo-${i}`}
                style={{
                  width: 86,
                  height: 74,
                  borderRadius: radii.sm,
                  backgroundColor: '#1A1A1A',
                  overflow: 'hidden',
                }}
              >
                {/* Real captured/picked photo */}
                <Image
                  source={{ uri: photoUris[i] }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 5,
                    backgroundColor: colors.success,
                    borderRadius: radii.pill,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>✔</Text>
                </View>
              </View>
            );
          }
          const isNext = i === photoCount;
          return (
            <Tappable
              key={`slot-${i}`}
              onPress={isNext ? () => addVia('camera') : undefined}
              disabled={picking && isNext}
              style={{
                width: 86,
                height: 74,
                borderRadius: radii.sm,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: isNext ? colors.primaryLight : colors.disabled,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20, color: isNext ? colors.primary : colors.disabled }}>+</Text>
              <Text style={{ fontSize: 10, color: isNext ? colors.textTertiary : colors.disabled }}>
                Angle {i + 1}
              </Text>
            </Tappable>
          );
        })}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.sm,
            padding: spacing.sm,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primaryDark, marginBottom: 2 }}>
            AI tip
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary, lineHeight: 15 }}>
            Shoot straight-on, left 45°, right 45°
          </Text>
        </View>
      </View>

      {/* Optional damage description */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textTertiary }}>Describe the damage</Text>
        <Text style={{ fontSize: 11, color: colors.textTertiary }}>Optional</Text>
      </View>
      <TextInput
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="e.g. Scraped a pole backing out — paint is chipped and there's a small dent on the lower-left corner."
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
          marginBottom: spacing.md,
        }}
      />

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Tappable
          onPress={() => addVia('gallery')}
          disabled={picking}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            borderRadius: radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed || picking ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>📁 Upload</Text>
        </Tappable>
        <PrimaryButton
          label="Submit photos →"
          disabled={!canSubmit}
          onPress={onSubmit}
          style={{ flex: 2 }}
        />
      </View>

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
        }}
      >
        <Text style={{ fontSize: 18 }}>🤖</Text>
        <Text style={{ flex: 1, fontSize: 12, color: colors.primaryDark, lineHeight: 17 }}>
          AI analyzes your photos instantly — more angles = more accurate estimates
        </Text>
      </View>
    </Screen>
  );
}
