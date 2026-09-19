import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { AvatarCircle, Screen } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { BrandChannel, brandChannels, channelKind, FEED_BRANDS } from '../../services/mock/communityChannels';
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

  // Communities you can post to: the registered car's brand communities (guests: every brand's lounge).
  const { active, brand } = useActiveVehicle();
  const communities = useMemo<BrandChannel[]>(
    () => (active ? brandChannels(brand) : FEED_BRANDS.map((b) => brandChannels(b).find((c) => channelKind(c.name) === 'lounge') ?? brandChannels(b)[0])),
    [active, brand],
  );
  const [communityId, setCommunityId] = useState<string>(communities[0]?.id ?? '');
  const community = communities.find((c) => c.id === communityId) ?? communities[0];
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
      body.trim() || 'Shared from the AutoMate app ',
      category,
      photos.length,
      community?.name,
    );
    addPoints(pointsEarned, 'Community post');
    // Fire-and-forget: the feed refetches while we navigate back to it.
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    setPublishing(false);
    navigation.goBack();
  };

  return (
    <Screen>
      {/* Community picker — the user's brand communities (auto-membership). */}
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm }}>Post to</Text>
      <View style={{ gap: 8, marginBottom: spacing.md }}>
        {communities.map((c) => {
          const on = c.id === communityId;
          return (
            <Tappable
              key={c.id}
              onPress={() => setCommunityId(c.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Post to ${c.name}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: on ? colors.primarySurface : colors.surface,
                borderWidth: on ? 1.5 : StyleSheet.hairlineWidth,
                borderColor: on ? colors.primary : colors.border,
                borderRadius: radii.md,
                padding: spacing.sm,
              }}
            >
              <AvatarCircle initial={c.initial} color={c.color} size={30} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: on ? colors.primaryDeep : colors.textPrimary }}>{c.name}</Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary }}>{c.members.toLocaleString()} members</Text>
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {on ? <Icon name="check" size={13} color={colors.onPrimary} strokeWidth={2.4} /> : null}
              </View>
            </Tappable>
          );
        })}
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
              })}
            >
              <Text style={{ fontSize: 14, color: on ? colors.onPrimary : colors.textTertiary }}>
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
        placeholder={`Share with ${community?.name ?? "the community"}...`}
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
        <Text style={{ fontSize: 13, color: colors.textPlaceholder }}>· Up to 4</Text>
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
              <Icon name="close" size={11} color={'#fff'} strokeWidth={2.4} />
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
              })}
            >
              <Icon name="camera" size={20} color={colors.textSecondary} />
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
              })}
            >
              <Icon name="camera" size={20} color={colors.textSecondary} />
              <Text style={{ fontSize: 9, fontWeight: '500', color: colors.textTertiary }}>Gallery</Text>
            </Tappable>
          </>
        ) : null}
      </View>

      <PrimaryButton label="Publish post" loading={publishing} onPress={onPublish} />
    </Screen>
  );
}
