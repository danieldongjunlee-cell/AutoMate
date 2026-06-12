import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryBadge } from '../../components/PostCard';
import { SkeletonCard, SkeletonList } from '../../components/Skeleton';
import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { CommunityStackParamList } from '../../navigation/types';
import { communityService } from '../../services';
import { PostComment, USER } from '../../services/mock/data';
import { palette, radii, spacing, useTheme } from '../../theme';

/** Wireframe s-comm-post: post detail + comments + composer. */
export function CommPostScreen() {
  const route = useRoute<RouteProp<CommunityStackParamList, 'CommPost'>>();
  const { colors } = useTheme();
  const postId = route.params?.postId ?? 'post-james';
  const { data, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => communityService.getPost(postId),
  });

  // Local interaction state (mock-backed): like toggles, my new comments.
  const [postLiked, setPostLiked] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [myComments, setMyComments] = useState<PostComment[]>([]);
  const [draft, setDraft] = useState('');
  const composerRef = useRef<TextInput>(null);

  if (isLoading || !data) {
    return (
      <Screen>
        <SkeletonCard tall />
        <SectionLabel style={{ marginTop: spacing.sm }}>Comments</SectionLabel>
        <SkeletonList variant="row" count={3} />
      </Screen>
    );
  }
  const { post, comments } = data;
  const allComments = [...comments, ...myComments];
  const replyCount = post.replies + myComments.length;

  const toggleCommentLike = (id: string) =>
    setLikedComments((m) => ({ ...m, [id]: !m[id] }));

  const startReply = (author: string) => {
    setDraft((d) => (d.startsWith(`@${author}`) ? d : `@${author} ${d}`));
    composerRef.current?.focus();
  };

  const sendComment = () => {
    const body = draft.trim();
    if (!body) {
      composerRef.current?.focus();
      return;
    }
    setMyComments((list) => [
      ...list,
      {
        id: `c-me-${Date.now()}`,
        author: USER.name,
        initial: USER.initial,
        color: palette.primary,
        car: '2019 Accord',
        likes: 0,
        body,
      },
    ]);
    setDraft('');
  };

  const sharePost = () =>
    Share.share({ message: `${post.author} on AutoMate: "${post.body}"` }).catch(() => {});

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
          <Pressable onPress={() => setPostLiked((l) => !l)} hitSlop={6}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: postLiked ? '700' : '400',
                color: postLiked ? colors.danger : colors.textTertiary,
              }}
            >
              {postLiked ? '❤️' : '🤍'} {post.likes + (postLiked ? 1 : 0)}
            </Text>
          </Pressable>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primary }}>
            💬 {replyCount} replies
          </Text>
          <View style={{ flex: 1 }} />
          <Pressable onPress={sharePost} hitSlop={6}>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>Share</Text>
          </Pressable>
        </View>
      </View>

      <SectionLabel>{replyCount} Comments</SectionLabel>
      {allComments.map((c) => {
        const liked = !!likedComments[c.id];
        return (
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
              <Pressable onPress={() => toggleCommentLike(c.id)} hitSlop={6}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: liked ? '700' : '400',
                    color: liked ? colors.danger : colors.textTertiary,
                  }}
                >
                  {liked ? '❤️' : '🤍'} {c.likes + (liked ? 1 : 0)}
                </Text>
              </Pressable>
            </View>
            <Text
              style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 19, marginLeft: 36 }}
            >
              {c.body}
            </Text>
            <Pressable
              onPress={() => startReply(c.author)}
              style={{ marginLeft: 36, marginTop: 4 }}
              hitSlop={6}
            >
              <Text style={{ fontSize: 12, color: colors.primary }}>Reply</Text>
            </Pressable>
          </View>
        );
      })}

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
        <AvatarCircle initial={USER.initial} color={colors.primary} size={28} />
        <TextInput
          ref={composerRef}
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textPlaceholder}
          onSubmitEditing={sendComment}
          returnKeyType="send"
          style={{ flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 0 }}
        />
        <Pressable onPress={sendComment} hitSlop={8}>
          <Text style={{ fontSize: 18, color: draft.trim() ? colors.primary : colors.disabled }}>
            ➤
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
