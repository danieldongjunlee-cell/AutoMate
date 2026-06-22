import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { DAMAGE_TYPES } from '../../services/mock/data';
import { pickFromGallery } from '../../services/photos';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Camera'>;

const MAX_PHOTOS = 5;

/**
 * Wireframe s-camera, reworked (v17 feedback): upload-only (no in-app camera),
 * multi-select damage type, up to 5 photos + an optional description.
 */
export function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const draftPart = useAppStore((s) => s.draftPart);
  const draftTypes = useAppStore((s) => s.draftTypes);
  const toggleDraftType = useAppStore((s) => s.toggleDraftType);
  const photoUris = useAppStore((s) => s.draftPhotos);
  const addPhoto = useAppStore((s) => s.addDraftPhoto);
  const commitDraftPart = useAppStore((s) => s.commitDraftPart);
  const note = useAppStore((s) => s.draftNote);
  const setNote = useAppStore((s) => s.setDraftNote);
  const [picking, setPicking] = useState(false);

  const photoCount = photoUris.length;
  const part = (draftPart ?? 'damaged part').toLowerCase();
  const canSubmit = photoCount >= 1;

  const upload = async () => {
    if (picking || photoCount >= MAX_PHOTOS) return;
    setPicking(true);
    try {
      const photo = await pickFromGallery();
      if (photo) addPhoto(photo.uri);
    } finally {
      setPicking(false);
    }
  };

  const onSubmit = () => {
    commitDraftPart();
    navigation.navigate('ConfirmSubmit');
  };

  return (
    <Screen>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.xs }}>
        Add up to {MAX_PHOTOS} clear photos of your{' '}
        <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{part}</Text> from different
        angles.
      </Text>

      {/* Damage type — multi-select */}
      <SectionLabel>
        Damage type <Text style={{ textTransform: 'none' }}>(select all that apply)</Text>
      </SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm }}>
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
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              {on ? <Text style={{ color: colors.onPrimary, fontSize: 13 }}>✓</Text> : null}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: on ? '600' : '400',
                  color: on ? colors.onPrimary : colors.textSecondary,
                }}
              >
                {tp}
              </Text>
            </Tappable>
          );
        })}
      </View>

      {/* Photos — uploaded thumbnails + add tile */}
      <SectionLabel>
        Photos ({photoCount}/{MAX_PHOTOS})
      </SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {photoUris.map((uri, i) => (
          <View
            key={`${uri}-${i}`}
            style={{ width: 96, height: 80, borderRadius: radii.sm, overflow: 'hidden', backgroundColor: colors.surfaceAlt }}
          >
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
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
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>✔</Text>
            </View>
          </View>
        ))}
        {photoCount < MAX_PHOTOS ? (
          <Tappable
            onPress={upload}
            disabled={picking}
            style={{
              width: 96,
              height: 80,
              borderRadius: radii.sm,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {picking ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={{ fontSize: 20, color: colors.primary }}>＋</Text>
                <Text style={{ fontSize: 11, color: colors.textTertiary }}>Upload photo</Text>
              </>
            )}
          </Tappable>
        ) : null}
      </View>

      {/* Optional description */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <SectionLabel style={{ marginTop: 0 }}>Describe the damage</SectionLabel>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>Optional</Text>
      </View>
      <TextInput
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="e.g. Scraped a pole backing out — paint is chipped and there's a small dent on the lower-left corner."
        placeholderTextColor={colors.textTertiary}
        style={{
          minHeight: 72,
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          fontSize: 14,
          color: colors.textPrimary,
          textAlignVertical: 'top',
          marginBottom: spacing.lg,
        }}
      />

      <PrimaryButton
        label={canSubmit ? 'Submit photos →' : 'Upload at least one photo'}
        disabled={!canSubmit}
        onPress={onSubmit}
      />
    </Screen>
  );
}
