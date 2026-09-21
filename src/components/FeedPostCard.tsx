import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { SHOP_PHOTOS } from '../assets/shopPhotos';
import { CarBrandLogo } from './CarBrandLogo';
import { Icon } from './Icon';
import { CategoryBadge } from './PostCard';
import { Tappable } from './Tappable';
import { FeedPost } from '../services/mock/communityChannels';
import { radii, spacing, useTheme } from '../theme';

/**
 * Reddit-style feed card: the community's brand badge + "c/Community · author · time",
 * a category badge, the post body, an optional photo, then an upvote pill,
 * comment count and share.
 */
export function FeedPostCard({
  post,
  index = 0,
  onPress,
  onCommunity,
  onUpvote,
  upvoted,
}: {
  post: FeedPost;
  /** Position in the feed, picks the placeholder photo. */
  index?: number;
  onPress: () => void;
  onCommunity: () => void;
  onUpvote: () => void;
  upvoted?: boolean;
}) {
  const { colors } = useTheme();
  const votes = post.likes + (upvoted ? 1 : 0);
  return (
    <Tappable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${post.author} in ${post.community.name}`}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      })}
    >
      {/* Community + author line */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <Tappable onPress={onCommunity} hitSlop={6} accessibilityLabel={`Open ${post.community.name}`}>
          <CarBrandLogo brand={post.community.brand} size={34} bg="transparent" />
        </Tappable>
        <View style={{ flex: 1 }}>
          <Tappable onPress={onCommunity} hitSlop={4} noFeedback>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
              c/{post.community.name.replace(/\s+/g, '')}
            </Text>
          </Tappable>
          <Text style={{ fontSize: 12, color: colors.textTertiary }} numberOfLines={1}>
            {post.author} · {post.ago}
          </Text>
        </View>
        <CategoryBadge category={post.category} />
      </View>

      <Text style={{ fontSize: 15, color: colors.textPrimary, lineHeight: 21, marginBottom: spacing.sm }} numberOfLines={5}>
        {post.body}
      </Text>

      {post.hasPhoto ? (
        <Image source={SHOP_PHOTOS[index % SHOP_PHOTOS.length]} resizeMode="cover" style={{ width: '100%', height: 170, borderRadius: radii.md, backgroundColor: colors.tileNavy, marginBottom: spacing.sm }} />
      ) : null}

      {/* Footer: upvote pill · comments · share */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Tappable
          onPress={onUpvote}
          accessibilityRole="button"
          accessibilityState={{ selected: !!upvoted }}
          accessibilityLabel={`Upvote, ${votes}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            height: 32,
            paddingHorizontal: 12,
            borderRadius: radii.pill,
            backgroundColor: upvoted ? colors.primarySurface : colors.inputBg,
            borderWidth: 1,
            borderColor: upvoted ? colors.primary : colors.border,
          }}
        >
          <Icon name="arrowup" size={17} color={upvoted ? colors.primaryDark : colors.textSecondary} strokeWidth={2} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: upvoted ? colors.primaryDark : colors.textSecondary }}>{votes}</Text>
        </Tappable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border }}>
          <Icon name="chat" size={17} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>{post.replies}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border }}>
          <Icon name="share" size={17} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>Share</Text>
        </View>
      </View>
    </Tappable>
  );
}
