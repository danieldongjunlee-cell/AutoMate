import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommunityPost, PostCategory } from '../services/mock/data';
import { radii, spacing, useTheme } from '../theme';
import { AvatarCircle } from './ui';

/** Category badge colors per the wireframe feed (Tip/Review/Question/Warning…). */
export function CategoryBadge({ category }: { category: PostCategory }) {
  const { colors } = useTheme();
  const map: Record<PostCategory, { bg: string; fg: string }> = {
    Tip: { bg: colors.primarySurface, fg: colors.primaryDark },
    Review: { bg: colors.successSurface, fg: colors.successDeep },
    Question: { bg: colors.warningSurface, fg: colors.warningDeep },
    Warning: { bg: colors.dangerSurface, fg: colors.dangerDeep },
    Quotes: { bg: colors.infoSurface, fg: colors.infoDeep },
    DIY: { bg: colors.successSurface, fg: colors.successDeep },
  };
  const { bg, fg } = map[category];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 2 }}>
      <Text style={{ fontSize: 11, color: fg }}>{category}</Text>
    </View>
  );
}

/** Feed post card from s-comm-honda. */
export function PostCard({ post, onPress }: { post: CommunityPost; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <AvatarCircle initial={post.initial} color={post.color} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
            {post.author}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            {post.car} · {post.ago}
          </Text>
        </View>
        <CategoryBadge category={post.category} />
      </View>
      <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 21, marginBottom: spacing.sm }}>
        {post.body}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>💬 {post.replies} replies</Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>❤️ {post.likes}</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.primaryDark }}>Read more</Text>
      </View>
    </Pressable>
  );
}
