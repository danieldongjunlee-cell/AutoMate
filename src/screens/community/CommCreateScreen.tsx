import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { EARN_RULES, pointsToUsd } from '../../config/points';
import { CommunityStackParamList } from '../../navigation/types';
import { PostCategory, POST_CATEGORIES } from '../../services/mock/data';
import { communityService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommCreate'>;

/** Wireframe s-comm-create: category chips, body, photo slots, publish (+pts). */
export function CommCreateScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const addPoints = useAppStore((s) => s.addPoints);

  const [category, setCategory] = useState<PostCategory>('Question');
  const [body, setBody] = useState('');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const onPublish = async () => {
    setPublishing(true);
    const { pointsEarned } = await communityService.createPost(
      body.trim() || 'Shared from the AutoMate app 🚗',
      category,
      hasPhoto ? 1 : 0,
    );
    addPoints(pointsEarned);
    // Fire-and-forget: the feed refetches while we navigate back to it.
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    setPublishing(false);
    navigation.goBack();
  };

  return (
    <Screen>
      {/* Points banner */}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          borderWidth: 1.5,
          borderColor: colors.warning,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 18 }}>★</Text>
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.warningDeep }}>
          Earn +{EARN_RULES.communityPost} pts for posting · +{EARN_RULES.communityPhotoBonus}{' '}
          pts with photos
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
            <Pressable
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
            </Pressable>
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
      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 6 }}>
        Add photos
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center', marginBottom: spacing.md }}>
        <View
          style={{
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
          }}
        >
          <Text style={{ fontSize: 20 }}>📷</Text>
          <Text style={{ fontSize: 9, fontWeight: '500', color: colors.primaryDark }}>Camera</Text>
        </View>
        <View
          style={{
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
          }}
        >
          <Text style={{ fontSize: 20 }}>🖼️</Text>
          <Text style={{ fontSize: 9, fontWeight: '500', color: colors.textTertiary }}>Gallery</Text>
        </View>
        {hasPhoto ? (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.sm,
              backgroundColor: palette.navy,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>🚗</Text>
            <Pressable
              onPress={() => setHasPhoto(false)}
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
            </Pressable>
          </View>
        ) : null}
        <Text style={{ flex: 1, fontSize: 12, color: colors.textPlaceholder, textAlign: 'center' }}>
          Up to 4
        </Text>
      </View>

      <PrimaryButton
        label={(() => {
          const pts =
            EARN_RULES.communityPost + (hasPhoto ? EARN_RULES.communityPhotoBonus : 0);
          return `Publish → earn +${pts} pts · ${pointsToUsd(pts)}${hasPhoto ? ' (photo bonus!)' : ''}`;
        })()}
        loading={publishing}
        onPress={onPublish}
      />
    </Screen>
  );
}
