import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { CommunityStackParamList } from '../../navigation/types';
import { PostCategory, POST_CATEGORIES } from '../../services/mock/data';
import { communityService } from '../../services';
import { capturePhoto, pickFromGallery } from '../../services/photos';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommCreate'>;

/** Wireframe s-comm-create: category chips, body, photo slots, publish (+pts). */
export function CommCreateScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const addPoints = useAppStore((s) => s.addPoints);

  const [category, setCategory] = useState<PostCategory>('Question');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const MAX_PHOTOS = 4;

  const addPhoto = async (pick: () => Promise<{ uri: string } | null>) => {
    if (photos.length >= MAX_PHOTOS) return;
    const result = await pick();
    if (result) setPhotos((prev) => [...prev, result.uri].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (uri: string) => setPhotos((prev) => prev.filter((p) => p !== uri));

  const onPublish = async () => {
    setPublishing(true);
    const { pointsEarned } = await communityService.createPost(
      body.trim() || 'Shared from the AutoMate app 🚗',
      category,
      photos.length,
    );
    addPoints(pointsEarned, 'Community post');
    // Fire-and-forget: the feed refetches while we navigate back to it.
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    setPublishing(false);
    navigation.goBack();
  };

  return (
    <Screen>
      {/* Community guidelines banner */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.primaryLight,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 16 }}>💬</Text>
        <Text style={{ flex: 1, fontSize: 14, color: colors.primaryDark }}>
          Keep it helpful and on-topic — no spam or self-promotion.
        </Text>
      </View>

      {/* Channel picker (single channel for now) */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>H</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.primaryDeep }}>
          Honda Owners
        </Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>▼</Text>
      </View>

      {/* Category chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
        {POST_CATEGORIES.map((cat) => {
          const on = cat === category;
          return (
            <Tappable
              key={cat}
              onPress={() => setCategory(cat)}
              style={({ pressed }) => ({
                backgroundColor: on ? colors.primary : colors.surface,
                borderRadius: radii.pill,
                borderWidth: on ? 0 : StyleSheet.hairlineWidth,
                borderColor: colors.border,
                paddingHorizontal: 15,
                paddingVertical: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 13, color: on ? colors.onPrimary : colors.textTertiary }}>
                {cat}
              </Text>
            </Tappable>
          );
        })}
      </View>

      {/* Body */}
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Share with the Honda community..."
        placeholderTextColor={colors.textPlaceholder}
        multiline
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.sm,
          padding: spacing.md,
          minHeight: 96,
          fontSize: 14,
          color: colors.textPrimary,
          textAlignVertical: 'top',
          marginBottom: spacing.md,
          backgroundColor: colors.inputBg,
        }}
      />

      {/* Photos */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
          Add photo(s)
        </Text>
        <Text style={{ fontSize: 12, color: colors.textPlaceholder }}>· Up to 4</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.xs,
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        {photos.map((uri) => (
          <View
            key={uri}
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.sm,
              overflow: 'hidden',
              backgroundColor: colors.surface,
            }}
          >
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            <Tappable
              onPress={() => removePhoto(uri)}
              hitSlop={6}
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.danger,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 10, color: '#fff' }}>✕</Text>
            </Tappable>
          </View>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <>
            <Tappable
              onPress={() => addPhoto(capturePhoto)}
              style={({ pressed }) => ({
                width: 64,
                height: 64,
                borderRadius: radii.sm,
                backgroundColor: colors.primarySurface,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 20 }}>📷</Text>
              <Text style={{ fontSize: 9, fontWeight: '500', color: colors.primaryDark }}>Camera</Text>
            </Tappable>
            <Tappable
              onPress={() => addPhoto(pickFromGallery)}
              style={({ pressed }) => ({
                width: 64,
                height: 64,
                borderRadius: radii.sm,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 20 }}>🖼️</Text>
              <Text style={{ fontSize: 9, fontWeight: '500', color: colors.textTertiary }}>Gallery</Text>
            </Tappable>
          </>
        ) : null}
      </View>

      <PrimaryButton label="Publish post" loading={publishing} onPress={onPublish} />
    </Screen>
  );
}
