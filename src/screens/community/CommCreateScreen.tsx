import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Image, Modal, StyleSheet, View } from 'react-native';

import { Text, TextInput } from '../../components/Text';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { CarBrandLogo } from '../../components/CarBrandLogo';
import { Screen } from '../../components/ui';
import { useMyBrands } from '../../hooks/useActiveVehicle';
import { brandCommunity, FEED_BRANDS } from '../../services/mock/communityChannels';
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

  // Communities you can post to: one per brand in your garage (every brand's for a guest).
  const { brands: myBrands, hasCar } = useMyBrands();
  const brands = hasCar ? myBrands : FEED_BRANDS;
  const communities = useMemo(() => brands.map(brandCommunity), [brands.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  const [communityId, setCommunityId] = useState<string>(communities[0]?.id ?? '');
  const community = communities.find((c) => c.id === communityId) ?? communities[0];
  // The dropdown only appears with two or more brands to choose between.
  const [pickerOpen, setPickerOpen] = useState(false);
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
      {/* Post to · a dropdown when the garage has more than one brand, otherwise the one community. */}
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm }}>Post to</Text>
      <Tappable
        onPress={() => communities.length > 1 && setPickerOpen(true)}
        disabled={communities.length < 2}
        accessibilityRole={communities.length > 1 ? 'button' : undefined}
        accessibilityLabel={communities.length > 1 ? 'Choose a community' : undefined}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <CarBrandLogo brand={community?.brand ?? ''} size={30} bg="transparent" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{community?.name}</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>{community?.members.toLocaleString()} members</Text>
        </View>
        {communities.length > 1 ? (
          <View style={{ transform: [{ rotate: '90deg' }] }}>
            <Icon name="chevron" size={20} color={colors.textTertiary} />
          </View>
        ) : null}
      </Tappable>

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <Tappable noFeedback onPress={() => setPickerOpen(false)} style={{ flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' }}>
          <Tappable noFeedback onPress={() => undefined} style={{ backgroundColor: colors.sheet, borderTopLeftRadius: radii.actionSheet, borderTopRightRadius: radii.actionSheet, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.disabled, alignSelf: 'center', marginBottom: spacing.md }} />
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm }}>Post to</Text>
            {communities.map((c, i) => {
              const on = c.id === communityId;
              return (
                <Tappable
                  key={c.id}
                  onPress={() => {
                    setCommunityId(c.id);
                    setPickerOpen(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`Post to ${c.name}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider }}
                >
                  <CarBrandLogo brand={c.brand} size={36} bg="transparent" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: on ? colors.primaryDeep : colors.textPrimary }}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textTertiary }}>{c.members.toLocaleString()} members</Text>
                  </View>
                  {on ? <Icon name="check" size={18} color={colors.primary} strokeWidth={2.4} /> : null}
                </Tappable>
              );
            })}
          </Tappable>
        </Tappable>
      </Modal>

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
