import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryBadge } from '../../components/PostCard';
import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { communityService } from '../../services/mock/communityService';
import { palette, radii, spacing, useTheme } from '../../theme';

/** Wireframe s-comm-post: post detail + comments + composer. */
export function CommPostScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ['post', 'post-james'],
    queryFn: () => communityService.getPost('post-james'),
  });

  if (isLoading || !data) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
      </Screen>
    );
  }
  const { post, comments } = data;

  return (
    <Screen>
      {/* Post */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <AvatarCircle initial={post.initial} color={post.color} size={34} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              {post.author}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {post.car} · Honda Owners · {post.ago}
            </Text>
          </View>
          <CategoryBadge category={post.category} />
        </View>
        <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.sm }}>
          {post.body}
        </Text>
        {post.hasPhoto ? (
          <LinearGradient
            colors={[palette.navy, '#1B3A5C']}
            style={{
              borderRadius: radii.sm,
              height: 84,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>📸 Photo attached</Text>
          </LinearGradient>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingTop: spacing.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.divider,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>❤️ {post.likes}</Text>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primary }}>
            💬 {post.replies} replies
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>Share</Text>
        </View>
      </View>

      <SectionLabel>{post.replies} Comments</SectionLabel>
      {comments.map((c) => (
        <View
          key={c.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.divider,
            padding: spacing.sm,
            marginBottom: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 }}>
            <AvatarCircle initial={c.initial} color={c.color} size={28} />
            <Text style={{ flex: 1, fontSize: 13 }}>
              <Text style={{ fontWeight: '600', color: colors.textPrimary }}>{c.author}</Text>
              <Text style={{ color: colors.textTertiary }}> {c.car}</Text>
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>❤️ {c.likes}</Text>
          </View>
          <Text
            style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 19, marginLeft: 36 }}
          >
            {c.body}
          </Text>
          <Pressable style={{ marginLeft: 36, marginTop: 4 }} hitSlop={6}>
            <Text style={{ fontSize: 12, color: colors.primary }}>Reply</Text>
          </Pressable>
        </View>
      ))}

      {/* Composer */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.sm,
          paddingVertical: 8,
          marginTop: spacing.sm,
        }}
      >
        <AvatarCircle initial="J" color={colors.primary} size={28} />
        <Text style={{ flex: 1, fontSize: 14, color: colors.textPlaceholder }}>
          Write a comment...
        </Text>
        <Text style={{ fontSize: 18, color: colors.primary }}>➤</Text>
      </View>
    </Screen>
  );
}
